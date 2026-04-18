// GET /api/streamdata/streams?weeklyPeriodId=xxx
// Returns stream entries for a given weekly period with products sold and calculations
// Auth required (returns only current user's streams)
//
// POST /api/streamdata/streams
// Create a new stream entry with products sold and inventory
// If status is 'submitted', also runs payout calculation

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  streamEntries,
  streamProductsSold,
  streamInventory,
  streamCalculations,
  globalFeeConfig,
  streamerFeeConfig,
  weeklyPeriods,
} from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth-helpers'
import { streamEntrySchema } from '@/lib/validations/stream'
import { calculateStreamPayout, type FeeConfig } from '@/lib/calculations'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

// Helper: fetch fee config for a user
async function getFeeConfig(userId: string): Promise<FeeConfig> {
  const globalFees = await db
    .select()
    .from(globalFeeConfig)
    .where(eq(globalFeeConfig.isActive, true))

  const platformFee = globalFees.find((f) => f.name === 'platform_fee')
  const productFee = globalFees.find((f) => f.name === 'product_fee')
  const perOrderFee = globalFees.find((f) => f.name === 'per_order_fee')

  const streamerFees = await db
    .select()
    .from(streamerFeeConfig)
    .where(
      and(
        eq(streamerFeeConfig.userId, userId),
        eq(streamerFeeConfig.isActive, true)
      )
    )

  const supportFee = streamerFees.find((f) => f.feeName === 'support_fee')

  return {
    platformFeeRate: platformFee?.rate ? parseFloat(platformFee.rate) : 0,
    productFeeRate: productFee?.rate ? parseFloat(productFee.rate) : 0,
    perOrderFee: perOrderFee?.flatAmount
      ? parseFloat(perOrderFee.flatAmount)
      : 0,
    supportFeeRate: supportFee?.rate ? parseFloat(supportFee.rate) : 0,
  }
}

export async function GET(request: NextRequest) {
  try {
    const { error, session } = await requireAuth()
    if (error) return error

    const ip = getClientIp(request)
    const limit = rateLimit(ip, { maxRequests: 30, windowMs: 60000 })
    if (!limit.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { searchParams } = new URL(request.url)
    const weeklyPeriodId = searchParams.get('weeklyPeriodId')

    if (!weeklyPeriodId) {
      return NextResponse.json(
        { error: 'weeklyPeriodId query parameter is required' },
        { status: 400 }
      )
    }

    const userId = session!.user.id

    // Verify the period belongs to this user
    const period = await db
      .select()
      .from(weeklyPeriods)
      .where(
        and(
          eq(weeklyPeriods.id, weeklyPeriodId),
          eq(weeklyPeriods.userId, userId)
        )
      )

    if (period.length === 0) {
      return NextResponse.json(
        { error: 'Weekly period not found' },
        { status: 404 }
      )
    }

    // Fetch stream entries with related data using relational queries
    const streams = await db.query.streamEntries.findMany({
      where: and(
        eq(streamEntries.weeklyPeriodId, weeklyPeriodId),
        eq(streamEntries.userId, userId)
      ),
      with: {
        productsSold: {
          with: {
            product: true,
          },
        },
        inventory: {
          with: {
            product: true,
          },
        },
        calculation: true,
      },
    })

    return NextResponse.json({ streams })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('GET /api/streamdata/streams error:', message)
    return NextResponse.json(
      { error: 'Failed to fetch stream entries' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error, session } = await requireAuth()
    if (error) return error

    const ip = getClientIp(request)
    const limit = rateLimit(ip, { maxRequests: 10, windowMs: 60000 })
    if (!limit.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    // Reject oversized payloads (100KB limit)
    const contentLength = request.headers.get('content-length')
    if (contentLength && parseInt(contentLength, 10) > 102400) {
      return NextResponse.json(
        { error: 'Request payload too large' },
        { status: 413 }
      )
    }

    const body = await request.json()
    const parsed = streamEntrySchema.safeParse(body)

    if (!parsed.success) {
      console.error('POST /api/streamdata/streams validation error:', parsed.error.message)
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }

    const {
      streamDate,
      platform,
      streamSales,
      orderCount,
      productsSold,
      inventory,
      weeklyPeriodId,
      status,
      adjustmentAmount,
      adjustmentNote,
    } = parsed.data

    const userId = session!.user.id

    // Verify the weekly period belongs to this user
    const period = await db
      .select()
      .from(weeklyPeriods)
      .where(
        and(
          eq(weeklyPeriods.id, weeklyPeriodId),
          eq(weeklyPeriods.userId, userId)
        )
      )

    if (period.length === 0) {
      return NextResponse.json(
        { error: 'Weekly period not found or does not belong to you' },
        { status: 404 }
      )
    }

    // 1. Insert stream entry — use parsed status (validated by Zod enum, defaults to 'draft')
    const [entry] = await db
      .insert(streamEntries)
      .values({
        weeklyPeriodId,
        userId,
        streamDate,
        platform,
        streamSales: streamSales.toFixed(2),
        orderCount,
        status,
      })
      .returning()

    // 2. Insert products sold rows
    const productSoldRows = productsSold.map((p) => ({
      streamEntryId: entry.id,
      productId: p.productId,
      costPerUnit: p.costPerUnit.toFixed(2),
      amountSold: p.amountSold,
    }))

    await db.insert(streamProductsSold).values(productSoldRows)

    // 3. Insert inventory rows (if provided)
    if (inventory && inventory.length > 0) {
      const inventoryRows = inventory.map((i) => ({
        streamEntryId: entry.id,
        productId: i.productId,
        cases: i.cases,
        boxes: i.boxes,
        packs: i.packs,
      }))

      await db.insert(streamInventory).values(inventoryRows)
    }

    // 4. If submitting, calculate payout
    let calculation = null
    if (status === 'submitted') {
      const fees = await getFeeConfig(userId)
      const calcResult = calculateStreamPayout(
        streamSales,
        orderCount,
        productsSold,
        fees
      )

      const adj = adjustmentAmount ?? 0
      const adjustedBreakerPayout = Math.round((calcResult.breakerPayout + adj) * 100) / 100

      const [calcRow] = await db
        .insert(streamCalculations)
        .values({
          streamEntryId: entry.id,
          totalCogs: calcResult.totalCogs.toFixed(2),
          platformFee: calcResult.platformFee.toFixed(2),
          productFee: calcResult.productFee.toFixed(2),
          orderAmountCost: calcResult.orderAmountCost.toFixed(2),
          grossProfit: calcResult.grossProfit.toFixed(2),
          supportFee: calcResult.supportFee.toFixed(2),
          adjustmentAmount: adj.toFixed(2),
          adjustmentNote: adjustmentNote ?? null,
          breakerPayout: adjustedBreakerPayout.toFixed(2),
          chickenPayout: calcResult.chickenPayout.toFixed(2),
        })
        .returning()

      calculation = calcRow
    }

    // Fetch the complete entry with relations
    const completeEntry = await db.query.streamEntries.findFirst({
      where: eq(streamEntries.id, entry.id),
      with: {
        productsSold: {
          with: { product: true },
        },
        inventory: {
          with: { product: true },
        },
        calculation: true,
      },
    })

    return NextResponse.json({ stream: completeEntry }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('POST /api/streamdata/streams error:', message)
    return NextResponse.json(
      { error: 'Failed to create stream entry' },
      { status: 500 }
    )
  }
}

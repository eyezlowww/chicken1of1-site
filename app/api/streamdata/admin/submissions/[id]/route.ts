// GET /api/streamdata/admin/submissions/[id]
// Admin-only fetch of a single stream entry with full relations.
//
// DELETE /api/streamdata/admin/submissions/[id]
// Admin-only hard delete of any stream entry regardless of status.
// Cascades to stream_products_sold, stream_inventory, stream_calculations.
//
// PUT /api/streamdata/admin/submissions/[id]
// Admin-only edit of a stream entry — updates core fields and recalculates payout.

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  streamEntries,
  streamCalculations,
  globalFeeConfig,
  streamerFeeConfig,
  weeklyPeriods,
} from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth-helpers'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { calculateStreamPayout } from '@/lib/calculations'
import { z } from 'zod'

const editSchema = z.object({
  streamDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  platform: z.enum(['Whatnot']),
  streamSales: z.number().min(0).max(999999.99),
  orderCount: z.number().int().min(0).max(10000),
  adjustmentAmount: z.number().min(-99999.99).max(99999.99).optional(),
  adjustmentNote: z.string().max(500).optional(),
})

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { error } = await requireAdmin()
    if (error) return error

    const ip = getClientIp(request)
    const limit = rateLimit(ip, { maxRequests: 30, windowMs: 60000 })
    if (!limit.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { id } = await context.params

    const entry = await db.query.streamEntries.findFirst({
      where: eq(streamEntries.id, id),
      with: {
        user: true,
        calculation: true,
        productsSold: {
          with: { product: true },
        },
        inventory: {
          with: { product: true },
        },
        weeklyPeriod: true,
      },
    })

    if (!entry) {
      return NextResponse.json({ error: 'Stream entry not found' }, { status: 404 })
    }

    return NextResponse.json({ stream: entry })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('GET /api/streamdata/admin/submissions/[id] error:', message)
    return NextResponse.json({ error: 'Failed to fetch stream entry' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { error } = await requireAdmin()
    if (error) return error

    const ip = getClientIp(request)
    const limit = rateLimit(ip, { maxRequests: 10, windowMs: 60000 })
    if (!limit.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { id } = await context.params

    const existing = await db.query.streamEntries.findFirst({
      where: eq(streamEntries.id, id),
    })

    if (!existing) {
      return NextResponse.json({ error: 'Stream entry not found' }, { status: 404 })
    }

    // Cascade delete handles stream_products_sold, stream_inventory, stream_calculations
    await db.delete(streamEntries).where(eq(streamEntries.id, id))

    return NextResponse.json({ message: 'Stream entry deleted' })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('DELETE /api/streamdata/admin/submissions/[id] error:', message)
    return NextResponse.json({ error: 'Failed to delete stream entry' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { error } = await requireAdmin()
    if (error) return error

    const ip = getClientIp(request)
    const limit = rateLimit(ip, { maxRequests: 10, windowMs: 60000 })
    if (!limit.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { id } = await context.params

    const existing = await db.query.streamEntries.findFirst({
      where: eq(streamEntries.id, id),
      with: { productsSold: true, calculation: true },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Stream entry not found' }, { status: 404 })
    }

    const body = await request.json()
    const parsed = editSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }

    const { streamDate, platform, streamSales, orderCount, adjustmentAmount, adjustmentNote } =
      parsed.data

    // Update the stream entry core fields
    await db
      .update(streamEntries)
      .set({ streamDate, platform, streamSales: streamSales.toFixed(2), orderCount, updatedAt: new Date() })
      .where(eq(streamEntries.id, id))

    // Recalculate payout if submitted
    if (existing.status === 'submitted') {
      // Fetch fee config for this user
      const globalFees = await db
        .select()
        .from(globalFeeConfig)
        .where(eq(globalFeeConfig.isActive, true))

      const streamerFees = await db
        .select()
        .from(streamerFeeConfig)
        .where(
          and(
            eq(streamerFeeConfig.userId, existing.userId),
            eq(streamerFeeConfig.isActive, true)
          )
        )

      const feeConfig = {
        platformFeeRate: parseFloat(globalFees.find((f) => f.name === 'platform_fee')?.rate ?? '0'),
        productFeeRate: parseFloat(globalFees.find((f) => f.name === 'product_fee')?.rate ?? '0'),
        perOrderFee: parseFloat(globalFees.find((f) => f.name === 'per_order_fee')?.flatAmount ?? '0'),
        supportFeeRate: parseFloat(streamerFees.find((f) => f.feeName === 'support_fee')?.rate ?? '0'),
      }

      const productsSoldForCalc = existing.productsSold.map((p) => ({
        costPerUnit: parseFloat(p.costPerUnit),
        amountSold: p.amountSold,
      }))

      const calcResult = calculateStreamPayout(streamSales, orderCount, productsSoldForCalc, feeConfig)

      const adj = adjustmentAmount ?? (existing.calculation ? parseFloat(existing.calculation.adjustmentAmount ?? '0') : 0)
      const adjNote = adjustmentNote ?? existing.calculation?.adjustmentNote ?? null
      const adjustedBreakerPayout = Math.round((calcResult.breakerPayout + adj) * 100) / 100

      if (existing.calculation) {
        // Update existing calculation
        await db
          .update(streamCalculations)
          .set({
            totalCogs: calcResult.totalCogs.toFixed(2),
            platformFee: calcResult.platformFee.toFixed(2),
            productFee: calcResult.productFee.toFixed(2),
            orderAmountCost: calcResult.orderAmountCost.toFixed(2),
            grossProfit: calcResult.grossProfit.toFixed(2),
            supportFee: calcResult.supportFee.toFixed(2),
            adjustmentAmount: adj.toFixed(2),
            adjustmentNote: adjNote,
            breakerPayout: adjustedBreakerPayout.toFixed(2),
            chickenPayout: calcResult.chickenPayout.toFixed(2),
          })
          .where(eq(streamCalculations.streamEntryId, id))
      } else {
        // Insert new calculation
        await db.insert(streamCalculations).values({
          streamEntryId: id,
          totalCogs: calcResult.totalCogs.toFixed(2),
          platformFee: calcResult.platformFee.toFixed(2),
          productFee: calcResult.productFee.toFixed(2),
          orderAmountCost: calcResult.orderAmountCost.toFixed(2),
          grossProfit: calcResult.grossProfit.toFixed(2),
          supportFee: calcResult.supportFee.toFixed(2),
          adjustmentAmount: adj.toFixed(2),
          adjustmentNote: adjNote,
          breakerPayout: adjustedBreakerPayout.toFixed(2),
          chickenPayout: calcResult.chickenPayout.toFixed(2),
        })
      }
    }

    return NextResponse.json({ message: 'Stream entry updated' })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('PUT /api/streamdata/admin/submissions/[id] error:', message)
    return NextResponse.json({ error: 'Failed to update stream entry' }, { status: 500 })
  }
}

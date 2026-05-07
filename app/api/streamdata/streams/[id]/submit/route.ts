// POST /api/streamdata/streams/[id]/submit
// Finalize a draft stream — calculates payout and sets status to 'submitted'
// Auth required (must be stream owner, status must be 'draft')

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  streamEntries,
  streamProductsSold,
  streamCalculations,
  globalFeeConfig,
  streamerFeeConfig,
} from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth-helpers'
import { calculateStreamPayout, type FeeConfig } from '@/lib/calculations'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { error, session } = await requireAuth()
    if (error) return error

    const { id } = await context.params
    const userId = session!.user.id

    // 1. Fetch stream entry with products sold
    const stream = await db.query.streamEntries.findFirst({
      where: and(eq(streamEntries.id, id), eq(streamEntries.userId, userId)),
      with: {
        productsSold: true,
      },
    })

    if (!stream) {
      return NextResponse.json(
        { error: 'Stream entry not found' },
        { status: 404 }
      )
    }

    if (stream.status !== 'draft') {
      return NextResponse.json(
        { error: 'Only draft entries can be submitted' },
        { status: 400 }
      )
    }

    // 2. Fetch fee config (global + streamer)
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

    const fees: FeeConfig = {
      platformFeeRate: platformFee?.rate ? parseFloat(platformFee.rate) : 0,
      productFeeRate: productFee?.rate ? parseFloat(productFee.rate) : 0,
      perOrderFee: perOrderFee?.flatAmount
        ? parseFloat(perOrderFee.flatAmount)
        : 0,
      supportFeeRate: supportFee?.rate ? parseFloat(supportFee.rate) : 0,
    }

    // 3. Run payout calculation
    const productsSoldData = stream.productsSold.map((p) => ({
      costPerUnit: parseFloat(p.costPerUnit),
      amountSold: p.amountSold,
    }))

    const calcResult = calculateStreamPayout(
      parseFloat(stream.streamSales),
      stream.orderCount,
      productsSoldData,
      fees
    )

    // 4. Insert or update streamCalculations (upsert via delete + insert)
    // Check if a calculation already exists
    const existingCalc = await db
      .select()
      .from(streamCalculations)
      .where(eq(streamCalculations.streamEntryId, id))

    if (existingCalc.length > 0) {
      await db
        .update(streamCalculations)
        .set({
          totalCogs: calcResult.totalCogs.toFixed(2),
          platformFee: calcResult.platformFee.toFixed(2),
          productFee: calcResult.productFee.toFixed(2),
          orderAmountCost: calcResult.orderAmountCost.toFixed(2),
          grossProfit: calcResult.grossProfit.toFixed(2),
          supportFee: calcResult.supportFee.toFixed(2),
          breakerPayout: calcResult.breakerPayout.toFixed(2),
          chickenPayout: calcResult.chickenPayout.toFixed(2),
        })
        .where(eq(streamCalculations.streamEntryId, id))
    } else {
      await db.insert(streamCalculations).values({
        streamEntryId: id,
        totalCogs: calcResult.totalCogs.toFixed(2),
        platformFee: calcResult.platformFee.toFixed(2),
        productFee: calcResult.productFee.toFixed(2),
        orderAmountCost: calcResult.orderAmountCost.toFixed(2),
        grossProfit: calcResult.grossProfit.toFixed(2),
        supportFee: calcResult.supportFee.toFixed(2),
        breakerPayout: calcResult.breakerPayout.toFixed(2),
        chickenPayout: calcResult.chickenPayout.toFixed(2),
      })
    }

    // 5. Update stream status to 'submitted'
    await db
      .update(streamEntries)
      .set({
        status: 'submitted',
        updatedAt: new Date(),
      })
      .where(eq(streamEntries.id, id))

    // 6. Return the calculation results
    return NextResponse.json({
      message: 'Stream submitted successfully',
      calculation: calcResult,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('POST /api/streamdata/streams/[id]/submit error:', message)
    return NextResponse.json(
      { error: 'Failed to submit stream entry' },
      { status: 500 }
    )
  }
}

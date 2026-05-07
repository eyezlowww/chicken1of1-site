// GET /api/streamdata/fees
// Returns global fee config + the current streamer's personal fee config
// Auth required

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { globalFeeConfig, streamerFeeConfig } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth-helpers'

export async function GET(request: NextRequest) {
  try {
    const { error, session } = await requireAuth()
    if (error) return error

    // Fetch active global fees
    const globalFees = await db
      .select({
        id: globalFeeConfig.id,
        name: globalFeeConfig.name,
        rate: globalFeeConfig.rate,
        flatAmount: globalFeeConfig.flatAmount,
        feeType: globalFeeConfig.feeType,
      })
      .from(globalFeeConfig)
      .where(eq(globalFeeConfig.isActive, true))

    // Build global fee response
    // Expected names: 'platform_fee', 'product_fee', 'per_order_fee'
    const platformFee = globalFees.find((f) => f.name === 'platform_fee')
    const productFee = globalFees.find((f) => f.name === 'product_fee')
    const perOrderFee = globalFees.find((f) => f.name === 'per_order_fee')

    // Fetch streamer's support fee
    const streamerFees = await db
      .select({
        id: streamerFeeConfig.id,
        feeName: streamerFeeConfig.feeName,
        rate: streamerFeeConfig.rate,
      })
      .from(streamerFeeConfig)
      .where(
        and(
          eq(streamerFeeConfig.userId, session!.user.id),
          eq(streamerFeeConfig.isActive, true)
        )
      )

    const supportFee = streamerFees.find((f) => f.feeName === 'support_fee')

    return NextResponse.json({
      global: {
        platformFeeRate: platformFee?.rate ? parseFloat(platformFee.rate) : 0,
        productFeeRate: productFee?.rate ? parseFloat(productFee.rate) : 0,
        perOrderFee: perOrderFee?.flatAmount
          ? parseFloat(perOrderFee.flatAmount)
          : 0,
      },
      streamer: {
        supportFeeRate: supportFee?.rate ? parseFloat(supportFee.rate) : 0,
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('GET /api/streamdata/fees error:', message)
    return NextResponse.json(
      { error: 'Failed to fetch fee configuration' },
      { status: 500 }
    )
  }
}

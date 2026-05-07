// GET /api/streamdata/admin/fees
// Returns all global fees and all streamer fee configs
// Admin only
//
// PUT /api/streamdata/admin/fees
// Update a global fee or streamer fee
// Body: { type: 'global' | 'streamer', id: string, rate?: number, flatAmount?: number }
// Admin only

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { globalFeeConfig, streamerFeeConfig, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth-helpers'
import { z } from 'zod'

const updateFeeSchema = z.object({
  type: z.enum(['global', 'streamer']),
  id: z.string().uuid(),
  rate: z.number().min(0).max(1).optional(),
  flatAmount: z.number().min(0).max(100).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAdmin()
    if (error) return error

    const globalFees = await db.select().from(globalFeeConfig)

    const streamerFees = await db
      .select({
        id: streamerFeeConfig.id,
        userId: streamerFeeConfig.userId,
        feeName: streamerFeeConfig.feeName,
        rate: streamerFeeConfig.rate,
        isActive: streamerFeeConfig.isActive,
        effectiveFrom: streamerFeeConfig.effectiveFrom,
        updatedAt: streamerFeeConfig.updatedAt,
        username: users.username,
        displayName: users.displayName,
      })
      .from(streamerFeeConfig)
      .innerJoin(users, eq(streamerFeeConfig.userId, users.id))

    return NextResponse.json({
      globalFees,
      streamerFees,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('GET /api/streamdata/admin/fees error:', message)
    return NextResponse.json(
      { error: 'Failed to fetch fee configurations' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { error, session } = await requireAdmin()
    if (error) return error

    const body = await request.json()
    const parsed = updateFeeSchema.safeParse(body)

    if (!parsed.success) {
      console.error('PUT /api/streamdata/admin/fees validation error:', parsed.error.message)
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }

    const { type, id, rate, flatAmount } = parsed.data

    if (type === 'global') {
      const existing = await db
        .select()
        .from(globalFeeConfig)
        .where(eq(globalFeeConfig.id, id))

      if (existing.length === 0) {
        return NextResponse.json(
          { error: 'Global fee config not found' },
          { status: 404 }
        )
      }

      const updateData: Record<string, any> = {
        updatedAt: new Date(),
        updatedBy: session!.user.id,
      }

      if (rate !== undefined) {
        updateData.rate = rate.toString()
      }
      if (flatAmount !== undefined) {
        updateData.flatAmount = flatAmount.toFixed(2)
      }

      const [updated] = await db
        .update(globalFeeConfig)
        .set(updateData)
        .where(eq(globalFeeConfig.id, id))
        .returning()

      return NextResponse.json({ fee: updated })
    } else {
      // Streamer fee
      const existing = await db
        .select()
        .from(streamerFeeConfig)
        .where(eq(streamerFeeConfig.id, id))

      if (existing.length === 0) {
        return NextResponse.json(
          { error: 'Streamer fee config not found' },
          { status: 404 }
        )
      }

      const updateData: Record<string, any> = {
        updatedAt: new Date(),
      }

      if (rate !== undefined) {
        updateData.rate = rate.toString()
      }

      const [updated] = await db
        .update(streamerFeeConfig)
        .set(updateData)
        .where(eq(streamerFeeConfig.id, id))
        .returning()

      return NextResponse.json({ fee: updated })
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('PUT /api/streamdata/admin/fees error:', message)
    return NextResponse.json(
      { error: 'Failed to update fee configuration' },
      { status: 500 }
    )
  }
}

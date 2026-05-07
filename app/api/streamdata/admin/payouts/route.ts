// GET /api/streamdata/admin/payouts
// Returns all payout records across all streamers
// Admin only
//
// POST /api/streamdata/admin/payouts
// Mark payouts as paid
// Body: { payoutIds: string[] } or { payoutId: string }
// Admin only

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { payoutRecords, weeklyPeriods, users } from '@/lib/db/schema'
import { eq, and, desc, sql } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth-helpers'
import { z } from 'zod'

const markPaidSchema = z.union([
  z.object({ payoutIds: z.array(z.string().uuid()).min(1) }),
  z.object({ payoutId: z.string().uuid() }),
])

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAdmin()
    if (error) return error

    const payouts = await db
      .select({
        id: payoutRecords.id,
        weeklyPeriodId: payoutRecords.weeklyPeriodId,
        userId: payoutRecords.userId,
        runningSalesTotal: payoutRecords.runningSalesTotal,
        runningBreakerTotal: payoutRecords.runningBreakerTotal,
        runningChickenTotal: payoutRecords.runningChickenTotal,
        weeklyAdjustments: payoutRecords.weeklyAdjustments,
        adjustmentNotes: payoutRecords.adjustmentNotes,
        breakersTotalWeeklyPayout: payoutRecords.breakersTotalWeeklyPayout,
        isPaid: payoutRecords.isPaid,
        paidAt: payoutRecords.paidAt,
        createdAt: payoutRecords.createdAt,
        year: weeklyPeriods.year,
        month: weeklyPeriods.month,
        weekNumber: weeklyPeriods.weekNumber,
        username: users.username,
        displayName: users.displayName,
      })
      .from(payoutRecords)
      .innerJoin(weeklyPeriods, eq(payoutRecords.weeklyPeriodId, weeklyPeriods.id))
      .innerJoin(users, eq(payoutRecords.userId, users.id))
      .orderBy(
        desc(weeklyPeriods.year),
        desc(weeklyPeriods.month),
        desc(weeklyPeriods.weekNumber)
      )

    return NextResponse.json({ payouts })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('GET /api/streamdata/admin/payouts error:', message)
    return NextResponse.json(
      { error: 'Failed to fetch payout records' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error } = await requireAdmin()
    if (error) return error

    const body = await request.json()
    const parsed = markPaidSchema.safeParse(body)

    if (!parsed.success) {
      console.error('POST /api/streamdata/admin/payouts validation error:', parsed.error.message)
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }

    // Normalize to array
    const ids =
      'payoutIds' in parsed.data
        ? parsed.data.payoutIds
        : [parsed.data.payoutId]

    const now = new Date()

    // Update each payout record — only where isPaid is false (idempotency guard)
    const updatedIds: string[] = []
    const skippedIds: string[] = []

    for (const payoutId of ids) {
      const [updated] = await db
        .update(payoutRecords)
        .set({
          isPaid: true,
          paidAt: now,
        })
        .where(and(eq(payoutRecords.id, payoutId), eq(payoutRecords.isPaid, false)))
        .returning({ id: payoutRecords.id })

      if (updated) {
        updatedIds.push(updated.id)
      } else {
        skippedIds.push(payoutId)
      }
    }

    return NextResponse.json({
      message: `${updatedIds.length} payout(s) marked as paid`,
      updatedIds,
      skippedIds,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('POST /api/streamdata/admin/payouts error:', message)
    return NextResponse.json(
      { error: 'Failed to update payout records' },
      { status: 500 }
    )
  }
}

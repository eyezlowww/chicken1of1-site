// GET /api/streamdata/payouts
// Returns all payout records for the current streamer
// Ordered by year desc, month desc, week_number desc

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { payoutRecords, weeklyPeriods } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth-helpers'

export async function GET(request: NextRequest) {
  try {
    const { error, session } = await requireAuth()
    if (error) return error

    const userId = session!.user.id

    const payouts = await db
      .select({
        id: payoutRecords.id,
        weeklyPeriodId: payoutRecords.weeklyPeriodId,
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
      })
      .from(payoutRecords)
      .innerJoin(weeklyPeriods, eq(payoutRecords.weeklyPeriodId, weeklyPeriods.id))
      .where(eq(payoutRecords.userId, userId))
      .orderBy(
        desc(weeklyPeriods.year),
        desc(weeklyPeriods.month),
        desc(weeklyPeriods.weekNumber)
      )

    return NextResponse.json({ payouts })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('GET /api/streamdata/payouts error:', message)
    return NextResponse.json(
      { error: 'Failed to fetch payout records' },
      { status: 500 }
    )
  }
}

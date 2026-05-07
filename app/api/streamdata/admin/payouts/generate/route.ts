// POST /api/streamdata/admin/payouts/generate
// Generates payout records for all weekly periods that have submitted streams but no payout yet.
// Aggregates stream_sales, breaker_payout, chicken_payout per period+user,
// applies weekly_adjustments, creates payout_records, and closes the period.
// Admin only.

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  payoutRecords,
  weeklyPeriods,
  streamEntries,
  streamCalculations,
} from '@/lib/db/schema'
import { eq, and, sql, notExists } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth-helpers'

export async function POST(request: NextRequest) {
  try {
    const { error } = await requireAdmin()
    if (error) return error

    // Find all weekly periods that:
    //  1. Have at least one submitted stream entry
    //  2. Do NOT already have a payout record for that period+user combo
    //
    // We group by (weekly_period_id, user_id) to get one payout per streamer per week.
    const eligiblePeriods = await db
      .select({
        weeklyPeriodId: weeklyPeriods.id,
        userId: weeklyPeriods.userId,
        year: weeklyPeriods.year,
        month: weeklyPeriods.month,
        weekNumber: weeklyPeriods.weekNumber,
        weeklyAdjustments: weeklyPeriods.weeklyAdjustments,
        adjustmentNotes: weeklyPeriods.adjustmentNotes,
        runningSalesTotal: sql<string>`COALESCE(SUM(${streamEntries.streamSales}), 0)`,
        runningBreakerTotal: sql<string>`COALESCE(SUM(${streamCalculations.breakerPayout}), 0)`,
        runningChickenTotal: sql<string>`COALESCE(SUM(${streamCalculations.chickenPayout}), 0)`,
      })
      .from(weeklyPeriods)
      .innerJoin(
        streamEntries,
        and(
          eq(streamEntries.weeklyPeriodId, weeklyPeriods.id),
          eq(streamEntries.status, 'submitted')
        )
      )
      .innerJoin(
        streamCalculations,
        eq(streamCalculations.streamEntryId, streamEntries.id)
      )
      .where(
        notExists(
          db
            .select({ one: sql`1` })
            .from(payoutRecords)
            .where(
              and(
                eq(payoutRecords.weeklyPeriodId, weeklyPeriods.id),
                eq(payoutRecords.userId, weeklyPeriods.userId)
              )
            )
        )
      )
      .groupBy(
        weeklyPeriods.id,
        weeklyPeriods.userId,
        weeklyPeriods.year,
        weeklyPeriods.month,
        weeklyPeriods.weekNumber,
        weeklyPeriods.weeklyAdjustments,
        weeklyPeriods.adjustmentNotes
      )

    if (eligiblePeriods.length === 0) {
      return NextResponse.json({
        message: 'No eligible periods found. All submitted streams already have payout records.',
        generated: 0,
        summaries: [],
      })
    }

    const summaries: Array<{
      weeklyPeriodId: string
      userId: string
      year: number
      month: number
      weekNumber: number
      runningSalesTotal: string
      runningBreakerTotal: string
      runningChickenTotal: string
      weeklyAdjustments: string
      breakersTotalWeeklyPayout: string
    }> = []

    for (const period of eligiblePeriods) {
      const adjustments = parseFloat(period.weeklyAdjustments ?? '0')
      const breakerTotal = parseFloat(period.runningBreakerTotal)
      const breakersTotalWeeklyPayout = (breakerTotal + adjustments).toFixed(2)

      // Create the payout record
      await db.insert(payoutRecords).values({
        weeklyPeriodId: period.weeklyPeriodId,
        userId: period.userId,
        runningSalesTotal: parseFloat(period.runningSalesTotal).toFixed(2),
        runningBreakerTotal: breakerTotal.toFixed(2),
        runningChickenTotal: parseFloat(period.runningChickenTotal).toFixed(2),
        weeklyAdjustments: adjustments.toFixed(2),
        adjustmentNotes: period.adjustmentNotes,
        breakersTotalWeeklyPayout,
        isPaid: false,
      })

      // Close the weekly period
      await db
        .update(weeklyPeriods)
        .set({ status: 'closed' })
        .where(eq(weeklyPeriods.id, period.weeklyPeriodId))

      summaries.push({
        weeklyPeriodId: period.weeklyPeriodId,
        userId: period.userId,
        year: period.year,
        month: period.month,
        weekNumber: period.weekNumber,
        runningSalesTotal: parseFloat(period.runningSalesTotal).toFixed(2),
        runningBreakerTotal: breakerTotal.toFixed(2),
        runningChickenTotal: parseFloat(period.runningChickenTotal).toFixed(2),
        weeklyAdjustments: adjustments.toFixed(2),
        breakersTotalWeeklyPayout,
      })
    }

    return NextResponse.json({
      message: `Generated ${summaries.length} payout record(s)`,
      generated: summaries.length,
      summaries,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('POST /api/streamdata/admin/payouts/generate error:', message)
    return NextResponse.json(
      { error: 'Failed to generate payout records' },
      { status: 500 }
    )
  }
}

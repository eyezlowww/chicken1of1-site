// GET /api/streamdata/dashboard
// Returns dashboard data for the current streamer:
// - Current week stats (sales total, payout total, stream count, draft count)
// - Recent streams (last 10)
// - Current weekly period totals

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  streamEntries,
  streamCalculations,
  weeklyPeriods,
} from '@/lib/db/schema'
import { eq, and, desc, sql } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth-helpers'

export async function GET(request: NextRequest) {
  try {
    const { error, session } = await requireAuth()
    if (error) return error

    const userId = session!.user.id
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1

    // Get current month's weekly periods
    const currentPeriods = await db
      .select()
      .from(weeklyPeriods)
      .where(
        and(
          eq(weeklyPeriods.userId, userId),
          eq(weeklyPeriods.year, currentYear),
          eq(weeklyPeriods.month, currentMonth)
        )
      )

    const periodIds = currentPeriods.map((p) => p.id)

    // Current month stats — aggregate from stream entries and calculations
    let currentMonthStats = {
      totalSales: 0,
      totalPayout: 0,
      streamCount: 0,
      draftCount: 0,
    }

    if (periodIds.length > 0) {
      // Get all stream entries for current month periods
      const entries = await db
        .select({
          id: streamEntries.id,
          streamSales: streamEntries.streamSales,
          status: streamEntries.status,
        })
        .from(streamEntries)
        .where(
          and(
            eq(streamEntries.userId, userId),
            sql`${streamEntries.weeklyPeriodId} IN (${sql.join(
              periodIds.map((id) => sql`${id}`),
              sql`, `
            )})`
          )
        )

      currentMonthStats.streamCount = entries.filter(
        (e) => e.status === 'submitted'
      ).length
      currentMonthStats.draftCount = entries.filter(
        (e) => e.status === 'draft'
      ).length
      currentMonthStats.totalSales = entries
        .filter((e) => e.status === 'submitted')
        .reduce((sum, e) => sum + parseFloat(e.streamSales), 0)

      // Get calculations for submitted entries
      const submittedIds = entries
        .filter((e) => e.status === 'submitted')
        .map((e) => e.id)

      if (submittedIds.length > 0) {
        const calcs = await db
          .select({ breakerPayout: streamCalculations.breakerPayout })
          .from(streamCalculations)
          .where(
            sql`${streamCalculations.streamEntryId} IN (${sql.join(
              submittedIds.map((id) => sql`${id}`),
              sql`, `
            )})`
          )

        currentMonthStats.totalPayout = calcs.reduce(
          (sum, c) => sum + parseFloat(c.breakerPayout),
          0
        )
      }
    }

    // Recent streams (last 10)
    const recentStreams = await db.query.streamEntries.findMany({
      where: eq(streamEntries.userId, userId),
      orderBy: [desc(streamEntries.streamDate), desc(streamEntries.createdAt)],
      limit: 10,
      with: {
        weeklyPeriod: true,
        calculation: true,
      },
    })

    // Weekly period totals for current month
    const weeklyTotals = []
    for (const period of currentPeriods) {
      const periodEntries = await db
        .select({
          totalSales: sql<string>`COALESCE(SUM(CASE WHEN ${streamEntries.status} = 'submitted' THEN ${streamEntries.streamSales}::numeric ELSE 0 END), 0)`,
          streamCount: sql<string>`COUNT(CASE WHEN ${streamEntries.status} = 'submitted' THEN 1 END)`,
        })
        .from(streamEntries)
        .where(eq(streamEntries.weeklyPeriodId, period.id))

      weeklyTotals.push({
        weeklyPeriodId: period.id,
        weekNumber: period.weekNumber,
        year: period.year,
        month: period.month,
        status: period.status,
        weeklyAdjustments: period.weeklyAdjustments,
        adjustmentNotes: period.adjustmentNotes,
        totalSales: parseFloat(periodEntries[0]?.totalSales ?? '0'),
        streamCount: parseInt(periodEntries[0]?.streamCount ?? '0', 10),
      })
    }

    return NextResponse.json({
      currentMonth: {
        year: currentYear,
        month: currentMonth,
        ...currentMonthStats,
      },
      recentStreams,
      weeklyTotals,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('GET /api/streamdata/dashboard error:', message)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}

// GET /api/streamdata/weeks?year=2026&month=3
// Returns the streamer's weekly periods for a given month
// Auto-creates weeks 1-5 if none exist for the month
//
// POST /api/streamdata/weeks
// Update weekly adjustments for a period
// Body: { weeklyPeriodId, weeklyAdjustments, adjustmentNotes }

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { weeklyPeriods } from '@/lib/db/schema'
import { eq, and, asc } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth-helpers'
import { z } from 'zod'
import { getWeeksForMonth } from '@/lib/week-utils'

const updateWeekSchema = z.object({
  weeklyPeriodId: z.string().uuid(),
  weeklyAdjustments: z.number(),
  adjustmentNotes: z.string().max(500).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { error, session } = await requireAuth()
    if (error) return error

    const { searchParams } = new URL(request.url)
    const yearParam = searchParams.get('year')
    const monthParam = searchParams.get('month')

    if (!yearParam || !monthParam) {
      return NextResponse.json(
        { error: 'year and month query parameters are required' },
        { status: 400 }
      )
    }

    const year = parseInt(yearParam, 10)
    const month = parseInt(monthParam, 10)
    const currentYear = new Date().getFullYear()

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return NextResponse.json(
        { error: 'Invalid year or month' },
        { status: 400 }
      )
    }

    if (year < 2020 || year > currentYear + 1) {
      return NextResponse.json(
        { error: 'Year must be between 2020 and ' + (currentYear + 1) },
        { status: 400 }
      )
    }

    const userId = session!.user.id

    // Calculate the actual Monday-Sunday weeks for this month
    const weekRanges = getWeeksForMonth(year, month)
    const weekCount = weekRanges.length // typically 4 or 5

    // Check if periods exist for this month
    let periods = await db
      .select()
      .from(weeklyPeriods)
      .where(
        and(
          eq(weeklyPeriods.userId, userId),
          eq(weeklyPeriods.year, year),
          eq(weeklyPeriods.month, month)
        )
      )
      .orderBy(asc(weeklyPeriods.weekNumber))

    // Auto-create weekly periods if none exist, using the real week count
    if (periods.length === 0) {
      const newPeriods = []
      for (let week = 1; week <= weekCount; week++) {
        newPeriods.push({
          userId,
          year,
          month,
          weekNumber: week,
        })
      }

      periods = await db.insert(weeklyPeriods).values(newPeriods).returning()

      // Sort by week number after insert
      periods.sort((a, b) => a.weekNumber - b.weekNumber)
    }

    // Build a lookup from weekNumber to label
    const labelMap = new Map<number, string>()
    for (const wr of weekRanges) {
      labelMap.set(wr.weekNumber, wr.label)
    }

    // Attach computed labels to the response (no DB column needed)
    const weeksWithLabels = periods.map((p) => ({
      ...p,
      label: labelMap.get(p.weekNumber) ?? `Week ${p.weekNumber}`,
    }))

    return NextResponse.json({ weeks: weeksWithLabels })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('GET /api/streamdata/weeks error:', message)
    return NextResponse.json(
      { error: 'Failed to fetch weekly periods' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error, session } = await requireAuth()
    if (error) return error

    const body = await request.json()
    const parsed = updateWeekSchema.safeParse(body)

    if (!parsed.success) {
      console.error('POST /api/streamdata/weeks validation error:', parsed.error.message)
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }

    const { weeklyPeriodId, weeklyAdjustments, adjustmentNotes } = parsed.data
    const userId = session!.user.id

    // Verify the period belongs to this user
    const existing = await db
      .select()
      .from(weeklyPeriods)
      .where(
        and(
          eq(weeklyPeriods.id, weeklyPeriodId),
          eq(weeklyPeriods.userId, userId)
        )
      )

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Weekly period not found' },
        { status: 404 }
      )
    }

    // Add userId to WHERE clause to prevent unauthorized updates
    const [updated] = await db
      .update(weeklyPeriods)
      .set({
        weeklyAdjustments: weeklyAdjustments.toFixed(2),
        adjustmentNotes: adjustmentNotes ?? null,
      })
      .where(and(eq(weeklyPeriods.id, weeklyPeriodId), eq(weeklyPeriods.userId, userId)))
      .returning()

    return NextResponse.json({ week: updated })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('POST /api/streamdata/weeks error:', message)
    return NextResponse.json(
      { error: 'Failed to update weekly period' },
      { status: 500 }
    )
  }
}

// GET /api/streamdata/admin/analytics
// Returns comprehensive financial analytics: lifetime P/L, monthly breakdown,
// per-breaker revenue, and weekly trend data for admin dashboard charts
// Admin only

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  streamEntries,
  streamCalculations,
  weeklyPeriods,
  users,
} from '@/lib/db/schema'
import { eq, sum, count, sql, desc, and } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth-helpers'

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAdmin()
    if (error) return error

    // Run all queries in parallel for performance
    const [lifetimeData, monthlyData, breakerData, weeklyData] =
      await Promise.all([
        getLifetimeData(),
        getMonthlyData(),
        getBreakerData(),
        getWeeklyTrend(),
      ])

    return NextResponse.json({
      lifetime: lifetimeData,
      monthly: monthlyData,
      byBreaker: breakerData,
      weeklyTrend: weeklyData,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('GET /api/streamdata/admin/analytics error:', message)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}

// ── Lifetime P/L Summary ──────────────────────────────────────────────────────

async function getLifetimeData() {
  // Aggregate all submitted stream entries joined with calculations
  const result = await db
    .select({
      totalRevenue: sum(streamEntries.streamSales),
      totalCogs: sum(streamCalculations.totalCogs),
      totalPlatformFees: sum(streamCalculations.platformFee),
      totalProductFees: sum(streamCalculations.productFee),
      totalOrderFees: sum(streamCalculations.orderAmountCost),
      totalBreakerPayouts: sum(streamCalculations.breakerPayout),
      totalChickenPayouts: sum(streamCalculations.chickenPayout),
      totalSupportFees: sum(streamCalculations.supportFee),
    })
    .from(streamEntries)
    .innerJoin(
      streamCalculations,
      eq(streamCalculations.streamEntryId, streamEntries.id)
    )
    .where(eq(streamEntries.status, 'submitted'))

  // Aggregate weekly adjustments separately (they live on weekly_periods)
  const adjustmentsResult = await db
    .select({
      totalAdjustments: sum(weeklyPeriods.weeklyAdjustments),
    })
    .from(weeklyPeriods)

  const row = result[0]
  const adjRow = adjustmentsResult[0]

  const totalRevenue = parseNum(row?.totalRevenue)
  const totalCogs = parseNum(row?.totalCogs)
  const totalPlatformFees = parseNum(row?.totalPlatformFees)
  const totalProductFees = parseNum(row?.totalProductFees)
  const totalOrderFees = parseNum(row?.totalOrderFees)
  const totalBreakerPayouts = parseNum(row?.totalBreakerPayouts)
  const totalChickenPayouts = parseNum(row?.totalChickenPayouts)
  const totalSupportFees = parseNum(row?.totalSupportFees)
  const totalAdjustments = parseNum(adjRow?.totalAdjustments)

  const netProfit =
    totalRevenue -
    totalCogs -
    totalPlatformFees -
    totalProductFees -
    totalOrderFees -
    totalBreakerPayouts

  return {
    totalRevenue,
    totalCogs,
    totalPlatformFees,
    totalProductFees,
    totalOrderFees,
    totalBreakerPayouts,
    totalChickenPayouts,
    totalSupportFees,
    totalAdjustments,
    netProfit,
  }
}

// ── Monthly Breakdown (last 12 months) ────────────────────────────────────────

async function getMonthlyData() {
  const rows = await db
    .select({
      year: sql<number>`EXTRACT(YEAR FROM ${streamEntries.streamDate})::int`,
      month: sql<number>`EXTRACT(MONTH FROM ${streamEntries.streamDate})::int`,
      revenue: sum(streamEntries.streamSales),
      cogs: sum(streamCalculations.totalCogs),
      platformFees: sum(streamCalculations.platformFee),
      productFees: sum(streamCalculations.productFee),
      orderFees: sum(streamCalculations.orderAmountCost),
      supportFees: sum(streamCalculations.supportFee),
      breakerPayouts: sum(streamCalculations.breakerPayout),
      chickenPayouts: sum(streamCalculations.chickenPayout),
      streamCount: count(streamEntries.id),
    })
    .from(streamEntries)
    .innerJoin(
      streamCalculations,
      eq(streamCalculations.streamEntryId, streamEntries.id)
    )
    .where(eq(streamEntries.status, 'submitted'))
    .groupBy(
      sql`EXTRACT(YEAR FROM ${streamEntries.streamDate})`,
      sql`EXTRACT(MONTH FROM ${streamEntries.streamDate})`
    )
    .orderBy(
      desc(sql`EXTRACT(YEAR FROM ${streamEntries.streamDate})`),
      desc(sql`EXTRACT(MONTH FROM ${streamEntries.streamDate})`)
    )
    .limit(12)

  // Reverse so oldest month comes first (chronological order for charts)
  return rows.reverse().map((row) => {
    const revenue = parseNum(row.revenue)
    const cogs = parseNum(row.cogs)
    const platformFees = parseNum(row.platformFees)
    const productFees = parseNum(row.productFees)
    const orderFees = parseNum(row.orderFees)
    const supportFees = parseNum(row.supportFees)
    const breakerPayouts = parseNum(row.breakerPayouts)
    const chickenPayouts = parseNum(row.chickenPayouts)

    const netProfit =
      revenue - cogs - platformFees - productFees - orderFees - breakerPayouts

    return {
      year: row.year,
      month: row.month,
      monthLabel: `${MONTH_LABELS[row.month - 1]} ${row.year}`,
      revenue,
      cogs,
      platformFees,
      productFees,
      orderFees,
      supportFees,
      breakerPayouts,
      chickenPayouts,
      netProfit,
      streamCount: row.streamCount,
    }
  })
}

// ── Per-Breaker Revenue ───────────────────────────────────────────────────────

async function getBreakerData() {
  const rows = await db
    .select({
      userId: streamEntries.userId,
      name: users.displayName,
      totalRevenue: sum(streamEntries.streamSales),
      totalBreaker: sum(streamCalculations.breakerPayout),
      totalChicken: sum(streamCalculations.chickenPayout),
      streamCount: count(streamEntries.id),
    })
    .from(streamEntries)
    .innerJoin(
      streamCalculations,
      eq(streamCalculations.streamEntryId, streamEntries.id)
    )
    .innerJoin(users, eq(users.id, streamEntries.userId))
    .where(eq(streamEntries.status, 'submitted'))
    .groupBy(streamEntries.userId, users.displayName)
    .orderBy(desc(sum(streamEntries.streamSales)))

  return rows.map((row) => ({
    name: row.name,
    totalRevenue: parseNum(row.totalRevenue),
    totalBreaker: parseNum(row.totalBreaker),
    totalChicken: parseNum(row.totalChicken),
    streamCount: row.streamCount,
  }))
}

// ── Weekly Trend (last 12 weeks) ──────────────────────────────────────────────

async function getWeeklyTrend() {
  const rows = await db
    .select({
      year: weeklyPeriods.year,
      month: weeklyPeriods.month,
      weekNumber: weeklyPeriods.weekNumber,
      revenue: sum(streamEntries.streamSales),
      cogs: sum(streamCalculations.totalCogs),
      platformFees: sum(streamCalculations.platformFee),
      productFees: sum(streamCalculations.productFee),
      orderFees: sum(streamCalculations.orderAmountCost),
      breakerPayouts: sum(streamCalculations.breakerPayout),
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
    .groupBy(
      weeklyPeriods.year,
      weeklyPeriods.month,
      weeklyPeriods.weekNumber
    )
    .orderBy(
      desc(weeklyPeriods.year),
      desc(weeklyPeriods.month),
      desc(weeklyPeriods.weekNumber)
    )
    .limit(12)

  // Reverse to chronological order for line chart
  return rows.reverse().map((row) => {
    const revenue = parseNum(row.revenue)
    const cogs = parseNum(row.cogs)
    const platformFees = parseNum(row.platformFees)
    const productFees = parseNum(row.productFees)
    const orderFees = parseNum(row.orderFees)
    const breakerPayouts = parseNum(row.breakerPayouts)

    const profit =
      revenue - cogs - platformFees - productFees - orderFees - breakerPayouts

    return {
      weekLabel: `W${row.weekNumber} ${MONTH_LABELS[row.month - 1]}`,
      revenue,
      profit,
    }
  })
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseNum(val: string | null | undefined): number {
  if (val == null) return 0
  const n = parseFloat(val)
  return isNaN(n) ? 0 : Math.round(n * 100) / 100
}

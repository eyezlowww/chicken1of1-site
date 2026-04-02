// GET /api/streamdata/payouts/export
// Export breaker's payout history as CSV for tax purposes
// Auth required (returns only current user's data)

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { streamEntries, streamCalculations, weeklyPeriods, payoutRecords } from '@/lib/db/schema'
import { eq, desc, and, sql } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth-helpers'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  try {
    const { error, session } = await requireAuth()
    if (error) return error
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const ip = getClientIp(request)
    const limit = rateLimit(ip, { maxRequests: 5, windowMs: 60000 })
    if (!limit.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const userId = session.user.id

    // Get all stream entries with calculations for this user
    const streams = await db
      .select({
        streamDate: streamEntries.streamDate,
        platform: streamEntries.platform,
        streamSales: streamEntries.streamSales,
        orderCount: streamEntries.orderCount,
        totalCogs: streamCalculations.totalCogs,
        platformFee: streamCalculations.platformFee,
        productFee: streamCalculations.productFee,
        orderAmountCost: streamCalculations.orderAmountCost,
        grossProfit: streamCalculations.grossProfit,
        supportFee: streamCalculations.supportFee,
        breakerPayout: streamCalculations.breakerPayout,
        weekNumber: weeklyPeriods.weekNumber,
        month: weeklyPeriods.month,
        year: weeklyPeriods.year,
      })
      .from(streamEntries)
      .innerJoin(streamCalculations, eq(streamCalculations.streamEntryId, streamEntries.id))
      .innerJoin(weeklyPeriods, eq(streamEntries.weeklyPeriodId, weeklyPeriods.id))
      .where(and(eq(streamEntries.userId, userId), eq(streamEntries.status, 'submitted')))
      .orderBy(desc(streamEntries.streamDate))

    // Build CSV
    const headers = [
      'Date',
      'Platform',
      'Week',
      'Month/Year',
      'Stream Sales',
      'Order Count',
      'COGS',
      'Platform Fee',
      'Product Fee',
      'Order Fees',
      'Gross Profit',
      'Support Fee',
      'Breaker Payout',
    ]

    const rows = streams.map((s) => [
      s.streamDate,
      s.platform || 'Whatnot',
      `Week ${s.weekNumber}`,
      `${s.month}/${s.year}`,
      s.streamSales,
      s.orderCount,
      s.totalCogs,
      s.platformFee,
      s.productFee,
      s.orderAmountCost,
      s.grossProfit,
      s.supportFee,
      s.breakerPayout,
    ])

    // Add totals row
    const totals = [
      'TOTALS',
      '',
      '',
      '',
      streams.reduce((s, r) => s + parseFloat(String(r.streamSales)), 0).toFixed(2),
      streams.reduce((s, r) => s + (r.orderCount || 0), 0),
      streams.reduce((s, r) => s + parseFloat(String(r.totalCogs)), 0).toFixed(2),
      streams.reduce((s, r) => s + parseFloat(String(r.platformFee)), 0).toFixed(2),
      streams.reduce((s, r) => s + parseFloat(String(r.productFee)), 0).toFixed(2),
      streams.reduce((s, r) => s + parseFloat(String(r.orderAmountCost)), 0).toFixed(2),
      streams.reduce((s, r) => s + parseFloat(String(r.grossProfit)), 0).toFixed(2),
      streams.reduce((s, r) => s + parseFloat(String(r.supportFee)), 0).toFixed(2),
      streams.reduce((s, r) => s + parseFloat(String(r.breakerPayout)), 0).toFixed(2),
    ]

    const csvContent = [
      headers.join(','),
      ...rows.map((r) => r.join(',')),
      totals.join(','),
    ].join('\n')

    const userName = session.user.name?.replace(/\s+/g, '_') || 'breaker'
    const filename = `${userName}_payout_history_${new Date().toISOString().slice(0, 10)}.csv`

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (err) {
    console.error('GET /api/streamdata/payouts/export error:', err instanceof Error ? err.message : 'Unknown error')
    return NextResponse.json({ error: 'Failed to export payouts' }, { status: 500 })
  }
}

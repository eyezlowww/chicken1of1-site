// Payout History — weekly payout summary cards
// Server component that queries the database directly

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import {
  weeklyPeriods,
  streamEntries,
  streamCalculations,
  payoutRecords,
} from '@/lib/db/schema'
import { eq, desc, sql, and } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { getWeeksForMonth } from '@/lib/week-utils'

// ─── Types ──────────────────────────────────────────────────────────────
type PayoutStatus = 'paid' | 'unpaid'

interface WeeklyPayout {
  id: string
  weekNumber: number
  weekLabel: string
  runningSales: number
  breakerPayout: number
  chickenPayout: number
  adjustments: number
  finalPayout: number
  status: PayoutStatus
  paidDate?: string
  streamCount: number
}

// ─── Helpers ────────────────────────────────────────────────────────────
function fmt(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

function formatDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

function getWeekDateRange(year: number, month: number, weekNumber: number): string {
  const weeks = getWeeksForMonth(year, month)
  const week = weeks.find((w) => w.weekNumber === weekNumber)
  if (!week) return `Week ${weekNumber}`
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  return `${week.startDate.toLocaleDateString('en-US', opts)} \u2013 ${week.endDate.toLocaleDateString('en-US', opts)}`
}

// ─── Icons ──────────────────────────────────────────────────────────────
function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function VideoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" />
    </svg>
  )
}

// ─── Page ───────────────────────────────────────────────────────────────
export default async function PayoutsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/streamdata/login')

  const userId = session.user.id

  // Fetch all weekly periods for this user, ordered by year/month/week desc
  const periods = await db
    .select()
    .from(weeklyPeriods)
    .where(eq(weeklyPeriods.userId, userId))
    .orderBy(
      desc(weeklyPeriods.year),
      desc(weeklyPeriods.month),
      desc(weeklyPeriods.weekNumber)
    )

  if (periods.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-white tracking-tight">
            Payout History
          </h1>
          <p className="mt-1 text-cage-400 text-sm">
            Weekly payout summaries and payment status.
          </p>
        </div>
        <div className="bg-black/60 backdrop-blur-md border border-blood-900/40 rounded-xl px-6 py-16 text-center">
          <p className="text-cage-400">No payout data yet. Submit streams to see your payouts here.</p>
        </div>
      </div>
    )
  }

  const periodIds = periods.map((p) => p.id)

  // Fetch stream counts and totals per period
  const streamStats = await db
    .select({
      weeklyPeriodId: streamEntries.weeklyPeriodId,
      streamCount: sql<number>`COUNT(*)::int`,
      totalSales: sql<string>`COALESCE(SUM(${streamEntries.streamSales}::numeric), 0)`,
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
    .groupBy(streamEntries.weeklyPeriodId)

  const statsMap = new Map(streamStats.map((s) => [s.weeklyPeriodId, s]))

  // Fetch submitted stream entry IDs per period for calculation lookup
  const submittedEntries = await db
    .select({
      id: streamEntries.id,
      weeklyPeriodId: streamEntries.weeklyPeriodId,
    })
    .from(streamEntries)
    .where(
      and(
        eq(streamEntries.userId, userId),
        eq(streamEntries.status, 'submitted'),
        sql`${streamEntries.weeklyPeriodId} IN (${sql.join(
          periodIds.map((id) => sql`${id}`),
          sql`, `
        )})`
      )
    )

  const entryIds = submittedEntries.map((e) => e.id)
  const entryToPeriod = new Map(submittedEntries.map((e) => [e.id, e.weeklyPeriodId]))

  // Fetch calculations for all submitted entries
  let calcsByPeriod: Record<string, { breakerPayout: number; chickenPayout: number }> = {}

  if (entryIds.length > 0) {
    const calcs = await db
      .select({
        streamEntryId: streamCalculations.streamEntryId,
        breakerPayout: streamCalculations.breakerPayout,
        chickenPayout: streamCalculations.chickenPayout,
      })
      .from(streamCalculations)
      .where(
        sql`${streamCalculations.streamEntryId} IN (${sql.join(
          entryIds.map((id) => sql`${id}`),
          sql`, `
        )})`
      )

    for (const calc of calcs) {
      const periodId = entryToPeriod.get(calc.streamEntryId)
      if (!periodId) continue
      if (!calcsByPeriod[periodId]) {
        calcsByPeriod[periodId] = { breakerPayout: 0, chickenPayout: 0 }
      }
      calcsByPeriod[periodId].breakerPayout += parseFloat(calc.breakerPayout)
      calcsByPeriod[periodId].chickenPayout += parseFloat(calc.chickenPayout)
    }
  }

  // Fetch payout records for paid status
  const payoutRecs = await db
    .select({
      weeklyPeriodId: payoutRecords.weeklyPeriodId,
      isPaid: payoutRecords.isPaid,
      paidAt: payoutRecords.paidAt,
    })
    .from(payoutRecords)
    .where(
      and(
        eq(payoutRecords.userId, userId),
        sql`${payoutRecords.weeklyPeriodId} IN (${sql.join(
          periodIds.map((id) => sql`${id}`),
          sql`, `
        )})`
      )
    )

  const payoutRecsMap = new Map(payoutRecs.map((p) => [p.weeklyPeriodId, p]))

  // Build payout data — only include periods that have at least one stream
  const payouts: WeeklyPayout[] = periods
    .filter((period) => {
      const stat = statsMap.get(period.id)
      return stat && stat.streamCount > 0
    })
    .map((period) => {
      const stat = statsMap.get(period.id)
      const calcs = calcsByPeriod[period.id] ?? { breakerPayout: 0, chickenPayout: 0 }
      const payoutRec = payoutRecsMap.get(period.id)
      const adjustments = parseFloat(period.weeklyAdjustments ?? '0')
      const finalPayout = calcs.breakerPayout + adjustments

      return {
        id: period.id,
        weekNumber: period.weekNumber,
        weekLabel: getWeekDateRange(period.year, period.month, period.weekNumber),
        runningSales: parseFloat(stat?.totalSales ?? '0'),
        breakerPayout: calcs.breakerPayout,
        chickenPayout: calcs.chickenPayout,
        adjustments,
        finalPayout,
        status: (payoutRec?.isPaid ? 'paid' : 'unpaid') as PayoutStatus,
        paidDate: payoutRec?.paidAt
          ? payoutRec.paidAt.toISOString().split('T')[0]
          : undefined,
        streamCount: stat?.streamCount ?? 0,
      }
    })

  const totalPaid = payouts
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.finalPayout, 0)
  const totalPending = payouts
    .filter((p) => p.status === 'unpaid')
    .reduce((sum, p) => sum + p.finalPayout, 0)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-white tracking-tight">
          Payout History
        </h1>
        <p className="mt-1 text-cage-400 text-sm">
          Weekly payout summaries and payment status.
        </p>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-black/60 backdrop-blur-md border border-blood-900/40 border-l-4 border-l-green-500 rounded-xl px-5 py-4">
          <p className="text-xs text-cage-500 uppercase tracking-wider">Total Paid</p>
          <p className="text-2xl font-bold text-green-400 mt-1 tabular-nums">{fmt(totalPaid)}</p>
        </div>
        <div className="bg-black/60 backdrop-blur-md border border-blood-900/40 border-l-4 border-l-gold-500 rounded-xl px-5 py-4">
          <p className="text-xs text-cage-500 uppercase tracking-wider">Pending Payout</p>
          <p className="text-2xl font-bold text-gold-400 mt-1 tabular-nums">{fmt(totalPending)}</p>
        </div>
        <div className="bg-black/60 backdrop-blur-md border border-blood-900/40 border-l-4 border-l-blue-500 rounded-xl px-5 py-4">
          <p className="text-xs text-cage-500 uppercase tracking-wider">Total Weeks</p>
          <p className="text-2xl font-bold text-white mt-1">{payouts.length}</p>
        </div>
      </div>

      {/* Payout Cards */}
      {payouts.length === 0 ? (
        <div className="bg-black/60 backdrop-blur-md border border-blood-900/40 rounded-xl px-6 py-16 text-center">
          <p className="text-cage-400">No payout data yet. Submit streams to see your payouts here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {payouts.map((payout) => (
            <div
              key={payout.id}
              className="bg-black/60 backdrop-blur-md border border-blood-900/40 rounded-xl overflow-hidden"
            >
              {/* Card header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-4 border-b border-blood-900/40">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 bg-dark-700 rounded-lg p-2">
                    <CalendarIcon className="w-5 h-5 text-cage-400" />
                  </div>
                  <div>
                    <h3 className="font-heading text-white font-semibold">
                      Week {payout.weekNumber}
                    </h3>
                    <p className="text-sm text-cage-400">{payout.weekLabel}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-3 sm:mt-0">
                  <span className="inline-flex items-center gap-1.5 text-sm text-cage-400">
                    <VideoIcon className="w-3.5 h-3.5" />
                    {payout.streamCount} streams
                  </span>
                  {payout.status === 'paid' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                      <CheckCircleIcon className="w-3.5 h-3.5" />
                      Paid{payout.paidDate ? ` ${formatDate(payout.paidDate)}` : ''}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gold-500/20 text-gold-400">
                      <ClockIcon className="w-3.5 h-3.5" />
                      Unpaid
                    </span>
                  )}
                </div>
              </div>

              {/* Card body */}
              <div className="px-6 py-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-cage-500 mb-1">Running Sales</p>
                    <p className="text-white font-medium tabular-nums">{fmt(payout.runningSales)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-cage-500 mb-1">Breaker Payout</p>
                    <p className="text-white font-medium tabular-nums">{fmt(payout.breakerPayout)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-cage-500 mb-1">Adjustments</p>
                    <p
                      className={`font-medium tabular-nums ${
                        payout.adjustments === 0
                          ? 'text-cage-500'
                          : payout.adjustments > 0
                            ? 'text-green-400'
                            : 'text-red-400'
                      }`}
                    >
                      {payout.adjustments === 0
                        ? '\u2014'
                        : payout.adjustments > 0
                          ? `+${fmt(payout.adjustments)}`
                          : fmt(payout.adjustments)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-cage-500 mb-1">Final Payout</p>
                    <p className="text-lg font-bold text-green-400 tabular-nums">
                      {fmt(payout.finalPayout)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

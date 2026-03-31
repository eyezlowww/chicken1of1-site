// Admin Analytics — comprehensive financial dashboard with charts and breakdowns
// Client component: fetches from /api/streamdata/admin/analytics, renders Recharts

'use client'

import { useEffect, useState } from 'react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

/* ---------- types ---------- */

interface LifetimeData {
  totalRevenue: number
  totalCogs: number
  totalPlatformFees: number
  totalProductFees: number
  totalOrderFees: number
  totalBreakerPayouts: number
  totalChickenPayouts: number
  totalSupportFees: number
  totalAdjustments: number
  netProfit: number
}

interface MonthlyRow {
  year: number
  month: number
  monthLabel: string
  revenue: number
  cogs: number
  platformFees: number
  productFees: number
  orderFees: number
  supportFees: number
  breakerPayouts: number
  chickenPayouts: number
  netProfit: number
  streamCount: number
}

interface BreakerRow {
  name: string
  totalRevenue: number
  totalBreaker: number
  totalChicken: number
  streamCount: number
}

interface WeeklyRow {
  weekLabel: string
  revenue: number
  profit: number
}

interface AnalyticsData {
  lifetime: LifetimeData
  monthly: MonthlyRow[]
  byBreaker: BreakerRow[]
  weeklyTrend: WeeklyRow[]
}

/* ---------- helpers ---------- */

function fmt(n: number): string {
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/* ---------- skeleton ---------- */

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-blood-900/40 bg-black/60 p-6">
      <div className="mb-2 h-5 w-24 rounded bg-dark-700" />
      <div className="mb-4 h-3 w-16 rounded bg-dark-700" />
      <div className="h-8 w-32 rounded bg-dark-700" />
    </div>
  )
}

function SkeletonChart() {
  return (
    <div className="animate-pulse rounded-xl border border-blood-900/40 bg-black/60 p-6">
      <div className="mb-4 h-6 w-48 rounded bg-dark-700" />
      <div className="h-[300px] rounded bg-dark-700/50" />
    </div>
  )
}

/* ---------- custom tooltip ---------- */

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-blood-900/40 bg-[#0a0a0a] px-4 py-3 shadow-xl">
      <p className="mb-2 text-xs font-medium text-cage-400">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.dataKey} className="text-sm tabular-nums" style={{ color: entry.color }}>
          {entry.name}: {fmt(entry.value)}
        </p>
      ))}
    </div>
  )
}

/* ---------- component ---------- */

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/streamdata/admin/analytics')
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.error || `HTTP ${res.status}`)
        }
        const json: AnalyticsData = await res.json()
        setData(json)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  /* ---- loading state ---- */
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="h-8 w-40 animate-pulse rounded bg-dark-700" />
          <div className="mt-2 h-4 w-64 animate-pulse rounded bg-dark-700" />
        </div>
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="mb-8">
          <SkeletonChart />
        </div>
        <div className="mb-8">
          <SkeletonChart />
        </div>
      </div>
    )
  }

  /* ---- error state ---- */
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dark-950 px-4">
        <div className="rounded-xl border border-blood-900/40 bg-black/60 p-8 text-center backdrop-blur-md">
          <svg className="mx-auto mb-4 h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <h2 className="mb-2 text-lg font-bold text-white">Failed to Load Analytics</h2>
          <p className="text-sm text-cage-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg border border-blood-900/40 bg-dark-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-dark-600"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  /* ---- empty state ---- */
  if (!data || (!data.lifetime.totalRevenue && data.monthly.length === 0)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dark-950 px-4">
        <div className="rounded-xl border border-blood-900/40 bg-black/60 p-8 text-center backdrop-blur-md">
          <svg className="mx-auto mb-4 h-12 w-12 text-cage-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
          <h2 className="mb-2 text-lg font-bold text-white">No Data Yet</h2>
          <p className="text-sm text-cage-400">
            Analytics will appear here once stream data has been submitted.
          </p>
        </div>
      </div>
    )
  }

  const { lifetime, monthly, byBreaker, weeklyTrend } = data

  const totalFees =
    lifetime.totalPlatformFees +
    lifetime.totalProductFees +
    lifetime.totalOrderFees

  /* ---- stat cards config ---- */
  const statCards = [
    {
      title: 'Total Revenue',
      value: fmt(lifetime.totalRevenue),
      color: 'text-green-400',
      highlight: false,
    },
    {
      title: 'Total COGS',
      value: `-${fmt(lifetime.totalCogs)}`,
      color: 'text-red-400',
      highlight: false,
    },
    {
      title: 'Total Fees',
      value: `-${fmt(totalFees)}`,
      color: 'text-red-400',
      highlight: false,
    },
    {
      title: 'Breaker Payouts',
      value: `-${fmt(lifetime.totalBreakerPayouts)}`,
      color: 'text-white',
      highlight: false,
    },
    {
      title: 'Chicken Payouts',
      value: fmt(lifetime.totalChickenPayouts),
      color: 'text-green-400',
      highlight: false,
    },
    {
      title: 'Net Profit',
      value: fmt(lifetime.netProfit),
      color: lifetime.netProfit >= 0 ? 'text-green-400' : 'text-red-400',
      highlight: true,
    },
  ]

  return (
    <div className="min-h-screen bg-dark-950 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="mt-1 text-sm text-cage-400">
          Comprehensive financial overview across all breakers and streams
        </p>
      </div>

      {/* Section 1: Lifetime P/L Summary */}
      <section className="mb-10" aria-label="Lifetime profit and loss summary">
        <h2 className="mb-4 text-lg font-semibold text-white">
          Lifetime P/L Summary
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {statCards.map((card) => (
            <div
              key={card.title}
              className={`rounded-xl border bg-black/60 p-6 backdrop-blur-md ${
                card.highlight
                  ? 'border-l-4 border-l-gold-500 border-t-blood-900/40 border-r-blood-900/40 border-b-blood-900/40'
                  : 'border-blood-900/40'
              }`}
            >
              <h3 className="text-lg font-bold text-white">{card.title}</h3>
              <p className="text-[11px] font-medium uppercase tracking-widest text-cage-500">
                LIFETIME
              </p>
              <p
                className={`mt-4 tabular-nums font-bold ${card.color} ${
                  card.highlight ? 'text-4xl' : 'text-3xl'
                }`}
              >
                {card.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 2: Revenue Over Time */}
      {weeklyTrend.length > 0 && (
        <section className="mb-10" aria-label="Revenue over time chart">
          <div className="rounded-xl border border-blood-900/40 bg-black/60 p-6 backdrop-blur-md">
            <h2 className="mb-6 text-lg font-semibold text-white">
              Revenue Over Time
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={weeklyTrend}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.3)" />
                <XAxis
                  dataKey="weekLabel"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  axisLine={{ stroke: 'rgba(51,65,85,0.3)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                  axisLine={{ stroke: 'rgba(51,65,85,0.3)' }}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#22c55e"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  name="Profit"
                  stroke="#f59e0b"
                  fillOpacity={1}
                  fill="url(#colorProfit)"
                  strokeWidth={2}
                />
                <Legend
                  wrapperStyle={{ paddingTop: 16 }}
                  formatter={(value: string) => (
                    <span className="text-sm text-cage-300">{value}</span>
                  )}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* Section 3: Breaker Revenue Comparison */}
      {byBreaker.length > 0 && (
        <section className="mb-10" aria-label="Breaker revenue comparison chart">
          <div className="rounded-xl border border-blood-900/40 bg-black/60 p-6 backdrop-blur-md">
            <h2 className="mb-6 text-lg font-semibold text-white">
              Breaker Revenue Comparison
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={byBreaker}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.3)" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  axisLine={{ stroke: 'rgba(51,65,85,0.3)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                  axisLine={{ stroke: 'rgba(51,65,85,0.3)' }}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar
                  dataKey="totalRevenue"
                  name="Revenue"
                  fill="#22c55e"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="totalBreaker"
                  name="Breaker Payout"
                  fill="#6366f1"
                  radius={[4, 4, 0, 0]}
                />
                <Legend
                  wrapperStyle={{ paddingTop: 16 }}
                  formatter={(value: string) => (
                    <span className="text-sm text-cage-300">{value}</span>
                  )}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* Section 4: Monthly Breakdown Table */}
      {monthly.length > 0 && (
        <section aria-label="Monthly financial breakdown">
          <div className="overflow-hidden rounded-xl border border-blood-900/40 bg-black/60 backdrop-blur-md">
            <div className="border-b border-blood-900/40 px-6 py-4">
              <h2 className="text-lg font-semibold text-white">
                Monthly Breakdown
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-blood-900/40">
                    {[
                      'Month',
                      'Revenue',
                      'COGS',
                      'Platform Fees',
                      'Product Fees',
                      'Order Fees',
                      'Breaker',
                      'Chicken',
                      'Net Profit',
                    ].map((header) => (
                      <th
                        key={header}
                        className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-cage-400"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-cage-700/50">
                  {[...monthly].reverse().map((row) => (
                    <tr
                      key={`${row.year}-${row.month}`}
                      className="transition-colors hover:bg-dark-700/50"
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-white">
                        {row.monthLabel}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm tabular-nums text-green-400">
                        {fmt(row.revenue)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm tabular-nums text-red-400">
                        {fmt(row.cogs)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm tabular-nums text-cage-300">
                        {fmt(row.platformFees)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm tabular-nums text-cage-300">
                        {fmt(row.productFees)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm tabular-nums text-cage-300">
                        {fmt(row.orderFees)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm tabular-nums text-cage-300">
                        {fmt(row.breakerPayouts)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm tabular-nums text-cage-300">
                        {fmt(row.chickenPayouts)}
                      </td>
                      <td
                        className={`whitespace-nowrap px-4 py-3 text-sm font-semibold tabular-nums ${
                          row.netProfit >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {fmt(row.netProfit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

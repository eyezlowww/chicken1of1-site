// All submissions — filterable table of stream submissions across all streamers
'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'

/* ---------- types ---------- */

interface StreamEntry {
  id: string
  streamDate: string
  platform: string | null
  streamSales: string
  orderCount: number
  status: 'draft' | 'submitted'
  user: {
    id: string
    username: string
    displayName: string
  }
  calculation: {
    totalCogs: string
    grossProfit: string
    breakerPayout: string
  } | null
  weeklyPeriod: {
    year: number
    month: number
    weekNumber: number
  } | null
}

/* ---------- helpers ---------- */

function fmt(n: number): string {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const statusBadge: Record<string, string> = {
  draft: 'bg-dark-700 text-cage-300',
  submitted: 'bg-gold-500/20 text-gold-400',
}

const statusLabel: Record<string, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
}

/* ---------- component ---------- */

export default function SubmissionsPage() {
  const [streams, setStreams] = useState<StreamEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [streamerFilter, setStreamerFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [dateRange, setDateRange] = useState('This Month')

  // Derive streamer options from the data
  const streamerOptions = useMemo(() => {
    const names = Array.from(new Set(streams.map((s) => s.user.displayName))).sort()
    return ['All', ...names]
  }, [streams])

  const statusOptions = ['All', 'draft', 'submitted']
  const dateRangeOptions = ['This Week', 'This Month', 'All Time']

  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Build query params for server-side filtering by streamer/status
      const params = new URLSearchParams()
      if (streamerFilter !== 'All') {
        // We need the user ID for the API; find it from current data or just pass display name
        // The API filters by userId, but we only have displayName on the client.
        // We'll do client-side filtering for streamer since the API expects a UUID.
      }
      if (statusFilter !== 'All') {
        params.set('status', statusFilter)
      }

      const url = `/api/streamdata/admin/submissions${params.toString() ? `?${params}` : ''}`
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to fetch submissions')
      const data = await res.json()
      setStreams(data.streams ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch submissions')
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchSubmissions()
  }, [fetchSubmissions])

  // Client-side filtering for streamer name and date range
  const filtered = useMemo(() => {
    return streams.filter((s) => {
      if (streamerFilter !== 'All' && s.user.displayName !== streamerFilter) return false

      if (dateRange === 'This Week') {
        const now = new Date()
        const startOfWeek = new Date(now)
        startOfWeek.setDate(now.getDate() - now.getDay())
        startOfWeek.setHours(0, 0, 0, 0)
        return new Date(s.streamDate) >= startOfWeek
      }
      if (dateRange === 'This Month') {
        const now = new Date()
        const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
        return s.streamDate.startsWith(monthPrefix)
      }
      return true
    })
  }, [streams, streamerFilter, dateRange])

  const totalSales = filtered.reduce((sum, s) => sum + parseFloat(s.streamSales), 0)
  const totalPayout = filtered.reduce((sum, s) => {
    const bp = s.calculation ? parseFloat(s.calculation.breakerPayout) : 0
    return sum + bp
  }, 0)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dark-950">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <p className="mt-4 text-sm text-cage-400">Loading submissions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-950 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">All Submissions</h1>
          <p className="mt-1 text-sm text-cage-400">
            Stream submissions across all breakers
          </p>
        </div>
        <Link
          href="/streamdata/admin"
          className="inline-flex items-center gap-2 rounded-lg border border-blood-900/40 bg-black/60 backdrop-blur-md px-4 py-2 text-sm font-medium text-cage-300 transition-colors hover:border-indigo-500/50 hover:text-white"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
          <button onClick={() => setError(null)} className="ml-3 font-medium underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Summary cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-blood-900/40 bg-black/60 backdrop-blur-md p-4">
          <p className="text-sm text-cage-400">Filtered Results</p>
          <p className="mt-1 text-xl font-bold text-white">{filtered.length} submissions</p>
        </div>
        <div className="rounded-xl border border-blood-900/40 bg-black/60 backdrop-blur-md p-4">
          <p className="text-sm text-cage-400">Total Sales</p>
          <p className="mt-1 text-xl font-bold text-white">{fmt(totalSales)}</p>
        </div>
        <div className="rounded-xl border border-blood-900/40 bg-black/60 backdrop-blur-md p-4">
          <p className="text-sm text-cage-400">Total Payouts</p>
          <p className="mt-1 text-xl font-bold text-white">{fmt(totalPayout)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        <div>
          <label htmlFor="streamer-filter" className="sr-only">
            Filter by streamer
          </label>
          <select
            id="streamer-filter"
            value={streamerFilter}
            onChange={(e) => setStreamerFilter(e.target.value)}
            className="rounded-lg border border-cage-600 bg-dark-700 px-3 py-2 text-sm text-cage-300 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {streamerOptions.map((o) => (
              <option key={o} value={o}>
                {o === 'All' ? 'All Breakers' : o}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="status-filter" className="sr-only">
            Filter by status
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-cage-600 bg-dark-700 px-3 py-2 text-sm text-cage-300 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {statusOptions.map((o) => (
              <option key={o} value={o}>
                {o === 'All' ? 'All Statuses' : statusLabel[o] ?? o}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="date-filter" className="sr-only">
            Filter by date range
          </label>
          <select
            id="date-filter"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="rounded-lg border border-cage-600 bg-dark-700 px-3 py-2 text-sm text-cage-300 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {dateRangeOptions.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-blood-900/40 bg-black/60 backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-blood-900/40">
                {['Breaker', 'Date', 'Platform', 'Sales', 'COGS', 'Gross Profit', 'Payout', 'Status', 'Actions'].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-cage-400"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-cage-700/50">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-3 py-12 text-center text-sm text-cage-500"
                  >
                    No submissions match the selected filters.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => {
                  const sales = parseFloat(s.streamSales)
                  const cogs = s.calculation ? parseFloat(s.calculation.totalCogs) : 0
                  const grossProfit = s.calculation ? parseFloat(s.calculation.grossProfit) : 0
                  const payout = s.calculation ? parseFloat(s.calculation.breakerPayout) : 0

                  return (
                    <tr
                      key={s.id}
                      className="transition-colors hover:bg-dark-700/50"
                    >
                      <td className="whitespace-nowrap px-3 py-3 text-xs sm:text-sm font-medium text-white">
                        {s.user.displayName}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-xs sm:text-sm text-cage-300">
                        {s.streamDate}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-xs sm:text-sm text-cage-300">
                        {s.platform ?? 'Whatnot'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-xs sm:text-sm text-cage-300">
                        {fmt(sales)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-xs sm:text-sm text-cage-300">
                        {fmt(cogs)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-xs sm:text-sm text-cage-300">
                        {fmt(grossProfit)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-xs sm:text-sm font-medium text-white">
                        {fmt(payout)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusBadge[s.status] ?? 'bg-dark-700 text-cage-300'}`}
                        >
                          {statusLabel[s.status] ?? s.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                        <div className="flex gap-3">
                          <Link
                            href={`/streamdata/admin/submissions/${s.id}`}
                            className="text-sm font-medium text-indigo-400 transition-colors hover:text-indigo-300"
                          >
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

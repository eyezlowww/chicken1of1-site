// Payout management — track and mark streamer payouts as paid
'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

/* ---------- types ---------- */

interface Payout {
  id: string
  weeklyPeriodId: string
  userId: string
  runningSalesTotal: string | null
  runningBreakerTotal: string | null
  runningChickenTotal: string | null
  weeklyAdjustments: string | null
  adjustmentNotes: string | null
  breakersTotalWeeklyPayout: string | null
  isPaid: boolean
  paidAt: string | null
  createdAt: string
  year: number
  month: number
  weekNumber: number
  username: string
  displayName: string
}

/* ---------- helpers ---------- */

function fmt(n: number): string {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function monthName(m: number): string {
  const names = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return names[m] ?? ''
}

/* ---------- component ---------- */

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [markingPaid, setMarkingPaid] = useState<Set<string>>(new Set())
  const [markingAll, setMarkingAll] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [generateMsg, setGenerateMsg] = useState<string | null>(null)

  const fetchPayouts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/streamdata/admin/payouts')
      if (!res.ok) throw new Error('Failed to fetch payouts')
      const data = await res.json()
      setPayouts(data.payouts ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payouts')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPayouts()
  }, [fetchPayouts])

  const unpaidPayouts = payouts.filter((p) => !p.isPaid)
  const totalUnpaid = unpaidPayouts.reduce(
    (sum, p) => sum + parseFloat(p.breakersTotalWeeklyPayout ?? '0'),
    0
  )

  async function markAsPaid(id: string) {
    setMarkingPaid((prev) => new Set(prev).add(id))
    setError(null)
    try {
      const res = await fetch('/api/streamdata/admin/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payoutId: id }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to mark as paid')
      }
      await fetchPayouts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark as paid')
    } finally {
      setMarkingPaid((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  async function generatePayouts() {
    setGenerating(true)
    setError(null)
    setGenerateMsg(null)
    try {
      const res = await fetch('/api/streamdata/admin/payouts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to generate payouts')
      }
      const data = await res.json()
      setGenerateMsg(
        data.generated > 0
          ? `Generated ${data.generated} payout record(s)`
          : data.message
      )
      await fetchPayouts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate payouts')
    } finally {
      setGenerating(false)
    }
  }

  async function markAllAsPaid() {
    if (unpaidPayouts.length === 0) return
    setMarkingAll(true)
    setError(null)
    try {
      const res = await fetch('/api/streamdata/admin/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payoutIds: unpaidPayouts.map((p) => p.id) }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to mark all as paid')
      }
      await fetchPayouts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark all as paid')
    } finally {
      setMarkingAll(false)
    }
  }

  // Lifetime totals calculated from all fetched payout records
  const lifetimeRevenue = payouts.reduce((sum, p) => sum + parseFloat(p.runningSalesTotal || '0'), 0)
  const lifetimeBreaker = payouts.reduce((sum, p) => sum + parseFloat(p.breakersTotalWeeklyPayout || '0'), 0)
  const lifetimeChicken = payouts.reduce((sum, p) => sum + parseFloat(p.runningChickenTotal || '0'), 0)
  const totalPaid = payouts.filter(p => p.isPaid).reduce((sum, p) => sum + parseFloat(p.breakersTotalWeeklyPayout || '0'), 0)
  const totalOutstanding = lifetimeBreaker - totalPaid

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dark-950">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <p className="mt-4 text-sm text-cage-400">Loading payouts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-950 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Payout Management</h1>
          <p className="mt-1 text-sm text-cage-400">
            Track and manage weekly breaker payouts
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

      {/* Lifetime Totals */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-blood-900/40 border-l-4 border-l-gold-500 bg-black/60 backdrop-blur-md p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-cage-400">Lifetime Revenue</p>
          <p className="mt-2 text-2xl font-bold text-gold-400">{fmt(lifetimeRevenue)}</p>
        </div>
        <div className="rounded-xl border border-blood-900/40 border-l-4 border-l-gold-500 bg-black/60 backdrop-blur-md p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-cage-400">Lifetime Breaker Payouts</p>
          <p className="mt-2 text-2xl font-bold text-green-400">{fmt(lifetimeBreaker)}</p>
        </div>
        <div className="rounded-xl border border-blood-900/40 border-l-4 border-l-gold-500 bg-black/60 backdrop-blur-md p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-cage-400">Lifetime Chicken Payouts</p>
          <p className="mt-2 text-2xl font-bold text-gold-400">{fmt(lifetimeChicken)}</p>
        </div>
        <div className="rounded-xl border border-blood-900/40 border-l-4 border-l-gold-500 bg-black/60 backdrop-blur-md p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-cage-400">Paid / Outstanding</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-green-400">{fmt(totalPaid)}</span>
            <span className="text-sm text-cage-500">/</span>
            <span className="text-lg font-semibold text-red-400">{fmt(totalOutstanding)}</span>
          </div>
        </div>
      </div>

      {/* Generate Payouts */}
      <div className="mb-6 rounded-xl border border-gold-500/30 bg-gold-500/5 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gold-400">
              Generate Weekly Payouts
            </h2>
            <p className="mt-1 text-sm text-cage-400">
              This will tally all submitted streams from completed weeks and
              create payout records.
            </p>
          </div>
          <button
            onClick={generatePayouts}
            disabled={generating}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gold-500 px-5 py-2.5 text-sm font-semibold text-dark-950 transition-colors hover:bg-gold-400 disabled:opacity-50"
          >
            {generating ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Generate Weekly Payouts
              </>
            )}
          </button>
        </div>
        {generateMsg && (
          <div className="mt-3 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-2.5 text-sm text-green-400">
            {generateMsg}
          </div>
        )}
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

      {/* Summary */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gold-500/30 bg-gold-500/5 p-6">
          <p className="text-sm font-medium text-gold-400">Total Unpaid</p>
          <p className="mt-2 text-3xl font-bold text-white">{fmt(totalUnpaid)}</p>
        </div>
        <div className="rounded-xl border border-blood-900/40 bg-black/60 backdrop-blur-md p-6">
          <p className="text-sm font-medium text-cage-400">Pending Payouts</p>
          <p className="mt-2 text-3xl font-bold text-white">
            {unpaidPayouts.length}
          </p>
        </div>
        <div className="flex items-center rounded-xl border border-blood-900/40 bg-black/60 backdrop-blur-md p-6">
          {unpaidPayouts.length > 0 ? (
            <button
              onClick={markAllAsPaid}
              disabled={markingAll}
              className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
            >
              {markingAll
                ? 'Processing...'
                : `Mark All as Paid (${unpaidPayouts.length})`}
            </button>
          ) : (
            <p className="w-full text-center text-sm text-cage-500">
              All payouts are settled
            </p>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-blood-900/40 bg-black/60 backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-blood-900/40">
                {[
                  'Breaker',
                  'Week',
                  'Month/Year',
                  'Sales Total',
                  'Breaker Payout',
                  'Adjustments',
                  'Final Payout',
                  'Status',
                  'Actions',
                ].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-cage-400"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-cage-700/50">
              {payouts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-sm text-cage-500">
                    No payout records found.
                  </td>
                </tr>
              ) : (
                payouts.map((p) => {
                  const salesTotal = parseFloat(p.runningSalesTotal ?? '0')
                  const breakerPayout = parseFloat(p.runningBreakerTotal ?? '0')
                  const adjustments = parseFloat(p.weeklyAdjustments ?? '0')
                  const finalPayout = parseFloat(p.breakersTotalWeeklyPayout ?? '0')
                  const isProcessing = markingPaid.has(p.id)

                  return (
                    <tr
                      key={p.id}
                      className="transition-colors hover:bg-dark-700/50"
                    >
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-white">
                        {p.displayName}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-cage-300">
                        W{p.weekNumber}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-cage-300">
                        {monthName(p.month)} {p.year}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-cage-300">
                        {fmt(salesTotal)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-cage-300">
                        {fmt(breakerPayout)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <span
                          className={
                            adjustments > 0
                              ? 'text-green-400'
                              : adjustments < 0
                                ? 'text-red-400'
                                : 'text-cage-500'
                          }
                        >
                          {adjustments > 0
                            ? `+${fmt(adjustments)}`
                            : adjustments < 0
                              ? `-${fmt(Math.abs(adjustments))}`
                              : '--'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-white">
                        {fmt(finalPayout)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                            p.isPaid
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-gold-500/20 text-gold-400'
                          }`}
                        >
                          {p.isPaid ? 'Paid' : 'Unpaid'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {!p.isPaid ? (
                          <button
                            onClick={() => markAsPaid(p.id)}
                            disabled={isProcessing || markingAll}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-green-600/20 px-3 py-1.5 text-xs font-medium text-green-400 transition-colors hover:bg-green-600/30 disabled:opacity-50"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            {isProcessing ? 'Processing...' : 'Mark as Paid'}
                          </button>
                        ) : (
                          <span className="text-xs text-cage-500">Settled</span>
                        )}
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

// Fee management — admin page for editing global and per-streamer fee rates
'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

/* ---------- types ---------- */

interface GlobalFee {
  id: string
  name: string
  rate: string | null
  flatAmount: string | null
  feeType: 'percentage' | 'flat_per_order'
  isActive: boolean
  updatedAt: string
}

interface StreamerFee {
  id: string
  userId: string
  feeName: string
  rate: string
  isActive: boolean
  effectiveFrom: string
  updatedAt: string
  username: string
  displayName: string
}

/* ---------- display helpers ---------- */

function globalFeeLabel(name: string): string {
  const labels: Record<string, string> = {
    platform_fee: 'Platform Fee',
    product_fee: 'Product Fee',
    per_order_fee: 'Per-Order Fee',
  }
  return labels[name] ?? name
}

function globalFeeDescription(name: string): string {
  const descs: Record<string, string> = {
    platform_fee: 'Whatnot / Fanatics Live platform processing fee',
    product_fee: 'Cost of goods / product sourcing fee',
    per_order_fee: 'Fixed fee applied to each individual order',
  }
  return descs[name] ?? ''
}

function formatFeeValue(fee: GlobalFee): string {
  if (fee.feeType === 'flat_per_order') {
    return `$${parseFloat(fee.flatAmount ?? '0').toFixed(2)}`
  }
  return `${parseFloat(fee.rate ?? '0')}%`
}

function getEditableValue(fee: GlobalFee): string {
  if (fee.feeType === 'flat_per_order') {
    return String(parseFloat(fee.flatAmount ?? '0'))
  }
  return String(parseFloat(fee.rate ?? '0'))
}

/* ---------- icons ---------- */

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

/* ---------- component ---------- */

export default function FeesPage() {
  const [globalFees, setGlobalFees] = useState<GlobalFee[]>([])
  const [streamerFees, setStreamerFees] = useState<StreamerFee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [editingGlobal, setEditingGlobal] = useState<string | null>(null)
  const [editingStreamer, setEditingStreamer] = useState<string | null>(null)

  const [editGlobalValue, setEditGlobalValue] = useState('')
  const [editStreamerValue, setEditStreamerValue] = useState('')

  const fetchFees = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/streamdata/admin/fees')
      if (!res.ok) throw new Error('Failed to fetch fees')
      const data = await res.json()
      setGlobalFees(data.globalFees ?? [])
      setStreamerFees(data.streamerFees ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch fees')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFees()
  }, [fetchFees])

  /* global fee handlers */
  function startEditGlobal(fee: GlobalFee) {
    setEditingGlobal(fee.id)
    setEditGlobalValue(getEditableValue(fee))
  }

  async function saveGlobalFee(fee: GlobalFee) {
    const parsed = parseFloat(editGlobalValue)
    if (isNaN(parsed) || parsed < 0) return

    setSaving(true)
    setSuccessMessage(null)
    try {
      const body: Record<string, any> = { type: 'global', id: fee.id }
      if (fee.feeType === 'flat_per_order') {
        body.flatAmount = parsed
      } else {
        body.rate = parsed
      }

      const res = await fetch('/api/streamdata/admin/fees', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to save')
      }

      setEditingGlobal(null)
      setSuccessMessage(`${globalFeeLabel(fee.name)} updated successfully`)
      await fetchFees()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save fee')
    } finally {
      setSaving(false)
    }
  }

  function cancelEditGlobal() {
    setEditingGlobal(null)
    setEditGlobalValue('')
  }

  /* streamer fee handlers */
  function startEditStreamer(fee: StreamerFee) {
    setEditingStreamer(fee.id)
    setEditStreamerValue(String(Math.round(parseFloat(fee.rate) * 100)))
  }

  async function saveStreamerFee(fee: StreamerFee) {
    const parsed = parseFloat(editStreamerValue)
    if (isNaN(parsed) || parsed < 0 || parsed > 100) return

    setSaving(true)
    setSuccessMessage(null)
    try {
      const res = await fetch('/api/streamdata/admin/fees', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'streamer',
          id: fee.id,
          rate: parsed / 100,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to save')
      }

      setEditingStreamer(null)
      setSuccessMessage(`${fee.displayName} support fee updated successfully`)
      await fetchFees()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save fee')
    } finally {
      setSaving(false)
    }
  }

  function cancelEditStreamer() {
    setEditingStreamer(null)
    setEditStreamerValue('')
  }

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dark-950">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <p className="mt-4 text-sm text-cage-400">Loading fee configurations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-950 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Fee Management</h1>
          <p className="mt-1 text-sm text-cage-400">
            Configure global and per-streamer fee rates
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

      {/* Feedback messages */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
          <button onClick={() => setError(null)} className="ml-3 font-medium underline">
            Dismiss
          </button>
        </div>
      )}
      {successMessage && (
        <div className="mb-6 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
          {successMessage}
        </div>
      )}

      {/* Global fees */}
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold text-white">Global Fees</h2>
        {globalFees.length === 0 ? (
          <p className="text-sm text-cage-500">No global fees configured.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            {globalFees.map((fee) => {
              const isEditing = editingGlobal === fee.id
              return (
                <div
                  key={fee.id}
                  className="rounded-xl border border-blood-900/40 bg-black/60 backdrop-blur-md p-6"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-cage-400">
                        {globalFeeLabel(fee.name)}
                      </h3>
                      <p className="mt-1 text-xs text-cage-500">
                        {globalFeeDescription(fee.name)}
                      </p>
                    </div>
                    {!isEditing && (
                      <button
                        onClick={() => startEditGlobal(fee)}
                        className="rounded-lg p-1.5 text-cage-500 transition-colors hover:bg-dark-700 hover:text-indigo-400"
                        aria-label={`Edit ${globalFeeLabel(fee.name)}`}
                        disabled={saving}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="mt-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step={fee.feeType === 'flat_per_order' ? '0.01' : '0.1'}
                          min="0"
                          value={editGlobalValue}
                          onChange={(e) => setEditGlobalValue(e.target.value)}
                          className="w-full rounded-lg border border-cage-600 bg-dark-700 px-3 py-2 text-lg font-bold text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveGlobalFee(fee)
                            if (e.key === 'Escape') cancelEditGlobal()
                          }}
                        />
                        <span className="text-sm text-cage-400">
                          {fee.feeType === 'flat_per_order' ? 'USD' : '%'}
                        </span>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => saveGlobalFee(fee)}
                          disabled={saving}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
                        >
                          <CheckIcon className="h-3.5 w-3.5" />
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={cancelEditGlobal}
                          disabled={saving}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-cage-600 px-3 py-1.5 text-xs font-medium text-cage-400 transition-colors hover:border-cage-600 hover:text-cage-300"
                        >
                          <XIcon className="h-3.5 w-3.5" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-4 text-2xl font-bold text-white">
                      {formatFeeValue(fee)}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Per-streamer fees */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">
          Per-Streamer Support Fees
        </h2>
        {streamerFees.length === 0 ? (
          <p className="text-sm text-cage-500">No streamer fee configurations found.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-blood-900/40 bg-black/60 backdrop-blur-md">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-blood-900/40">
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-cage-400">
                      Streamer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-cage-400">
                      Support Fee Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-cage-400">
                      Effective From
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-cage-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cage-700/50">
                  {streamerFees.map((sf) => {
                    const isEditing = editingStreamer === sf.id
                    const displayRate = Math.round(parseFloat(sf.rate) * 100)
                    return (
                      <tr
                        key={sf.id}
                        className="transition-colors hover:bg-dark-700/50"
                      >
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-white">
                          {sf.displayName}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                step="1"
                                min="0"
                                max="100"
                                value={editStreamerValue}
                                onChange={(e) =>
                                  setEditStreamerValue(e.target.value)
                                }
                                className="w-20 rounded-lg border border-cage-600 bg-dark-700 px-2 py-1 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter')
                                    saveStreamerFee(sf)
                                  if (e.key === 'Escape')
                                    cancelEditStreamer()
                                }}
                              />
                              <span className="text-sm text-cage-400">%</span>
                            </div>
                          ) : (
                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                displayRate >= 30
                                  ? 'bg-gold-500/20 text-gold-400'
                                  : 'bg-indigo-500/20 text-indigo-400'
                              }`}
                            >
                              {displayRate}%
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-cage-300">
                          {sf.effectiveFrom}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          {isEditing ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => saveStreamerFee(sf)}
                                disabled={saving}
                                className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
                              >
                                <CheckIcon className="h-3.5 w-3.5" />
                                {saving ? 'Saving...' : 'Save'}
                              </button>
                              <button
                                onClick={cancelEditStreamer}
                                disabled={saving}
                                className="inline-flex items-center gap-1 rounded-lg border border-cage-600 px-2.5 py-1 text-xs font-medium text-cage-400 transition-colors hover:border-cage-600 hover:text-cage-300"
                              >
                                <XIcon className="h-3.5 w-3.5" />
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => startEditStreamer(sf)}
                              disabled={saving}
                              className="inline-flex items-center gap-1 text-sm font-medium text-indigo-400 transition-colors hover:text-indigo-300"
                            >
                              <PencilIcon className="h-3.5 w-3.5" />
                              Edit
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

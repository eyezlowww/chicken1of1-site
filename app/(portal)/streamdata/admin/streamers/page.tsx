// Streamer management — view, edit, add, and deactivate streamer accounts
'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

/* ---------- types ---------- */

interface StreamerFeeConfig {
  id: string
  feeName: string
  rate: string
  isActive: boolean
  effectiveFrom: string
}

interface Streamer {
  id: string
  username: string
  displayName: string
  email: string
  role: 'streamer' | 'admin'
  isActive: boolean
  createdAt: string
  passwordHash?: string
  hasPassword?: boolean
  streamerFeeConfigs: StreamerFeeConfig[]
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

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  )
}

function KeyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
  )
}

function EnvelopeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  )
}

/* ---------- helpers ---------- */

function getSupportFeeRate(streamer: Streamer): number {
  const activeFee = streamer.streamerFeeConfigs.find(
    (f) => f.feeName === 'support_fee' && f.isActive
  )
  if (!activeFee) return 0
  return Math.round(parseFloat(activeFee.rate) * 100)
}

/* ---------- component ---------- */

export default function StreamersPage() {
  const [streamers, setStreamers] = useState<Streamer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')

  /* add streamer form state */
  const [showAddForm, setShowAddForm] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newSupportFee, setNewSupportFee] = useState('20')
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [resendingFor, setResendingFor] = useState<string | null>(null)

  const fetchStreamers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/streamdata/admin/streamers')
      if (!res.ok) throw new Error('Failed to fetch streamers')
      const data = await res.json()
      setStreamers(data.streamers ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch streamers')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStreamers()
  }, [fetchStreamers])

  /* edit handlers */
  function startEdit(streamer: Streamer) {
    setEditingId(streamer.id)
    setEditName(streamer.displayName)
    setEditEmail(streamer.email)
  }

  function saveEdit(id: string) {
    // Note: The current API doesn't have a PUT/PATCH for updating streamer details.
    // For now, just update local state. A PUT endpoint can be added later.
    if (!editName.trim() || !editEmail.trim()) return
    setStreamers((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, displayName: editName.trim(), email: editEmail.trim() } : s
      )
    )
    setEditingId(null)
  }

  function cancelEdit() {
    setEditingId(null)
  }

  /* toggle status — local only until API endpoint exists */
  function toggleStatus(id: string) {
    setStreamers((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, isActive: !s.isActive }
          : s
      )
    )
  }

  /* invite streamer (magic link) */
  async function addStreamer() {
    if (!newUsername.trim() || !newName.trim() || !newEmail.trim()) return
    const fee = parseInt(newSupportFee, 10)
    if (isNaN(fee) || fee < 0 || fee > 100) return

    setSubmitting(true)
    setError(null)
    setSuccessMsg(null)
    try {
      const res = await fetch('/api/streamdata/admin/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newUsername.trim(),
          displayName: newName.trim(),
          email: newEmail.trim(),
          supportFeeRate: fee / 100,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to invite streamer')
      }

      const savedEmail = newEmail.trim()
      // Reset form and refresh
      setNewUsername('')
      setNewName('')
      setNewEmail('')
      setNewSupportFee('20')
      setShowAddForm(false)
      setSuccessMsg(`Invite sent to ${savedEmail}!`)
      await fetchStreamers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to invite streamer')
    } finally {
      setSubmitting(false)
    }
  }

  /* resend invite */
  async function resendInvite(userId: string) {
    setResendingFor(userId)
    setError(null)
    setSuccessMsg(null)
    try {
      const res = await fetch('/api/streamdata/admin/invite/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to resend invite')
      }

      setSuccessMsg('Invite resent successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend invite')
    } finally {
      setResendingFor(null)
    }
  }

  const activeCount = streamers.filter((s) => s.isActive).length

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dark-950">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <p className="mt-4 text-sm text-cage-400">Loading streamers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-950 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Streamer Management</h1>
          <p className="mt-1 text-sm text-cage-400">
            {activeCount} active / {streamers.length} total streamers
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
          >
            <PlusIcon className="h-4 w-4" />
            Add Streamer
          </button>
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
      </div>

      {/* Success */}
      {successMsg && (
        <div className="mb-6 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
          {successMsg}
          <button onClick={() => setSuccessMsg(null)} className="ml-3 font-medium underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
          <button onClick={() => setError(null)} className="ml-3 font-medium underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Add streamer form */}
      {showAddForm && (
        <div className="mb-8 rounded-xl border border-indigo-500/30 bg-black/60 backdrop-blur-md p-6">
          <h2 className="mb-2 text-lg font-semibold text-white">
            Invite New Streamer
          </h2>
          <p className="mb-4 text-sm text-cage-400">
            An invite email with a setup link will be sent to the streamer.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label
                htmlFor="new-username"
                className="mb-1 block text-sm font-medium text-cage-400"
              >
                Username
              </label>
              <input
                id="new-username"
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="e.g. buh"
                className="w-full rounded-lg border border-cage-600 bg-dark-700 px-3 py-2 text-sm text-white placeholder-cage-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label
                htmlFor="new-name"
                className="mb-1 block text-sm font-medium text-cage-400"
              >
                Display Name
              </label>
              <input
                id="new-name"
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Buh"
                className="w-full rounded-lg border border-cage-600 bg-dark-700 px-3 py-2 text-sm text-white placeholder-cage-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label
                htmlFor="new-email"
                className="mb-1 block text-sm font-medium text-cage-400"
              >
                Email
              </label>
              <input
                id="new-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="e.g. user@chicken1of1.com"
                className="w-full rounded-lg border border-cage-600 bg-dark-700 px-3 py-2 text-sm text-white placeholder-cage-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label
                htmlFor="new-fee"
                className="mb-1 block text-sm font-medium text-cage-400"
              >
                Support Fee (%)
              </label>
              <input
                id="new-fee"
                type="number"
                min="0"
                max="100"
                value={newSupportFee}
                onChange={(e) => setNewSupportFee(e.target.value)}
                className="w-full rounded-lg border border-cage-600 bg-dark-700 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button
              onClick={addStreamer}
              disabled={submitting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
            >
              <CheckIcon className="h-4 w-4" />
              {submitting ? 'Sending Invite...' : 'Send Invite'}
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              disabled={submitting}
              className="inline-flex items-center gap-1.5 rounded-lg border border-cage-600 px-4 py-2 text-sm font-medium text-cage-400 transition-colors hover:border-cage-600 hover:text-cage-300"
            >
              <XIcon className="h-4 w-4" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Streamers table */}
      <div className="overflow-hidden rounded-xl border border-blood-900/40 bg-black/60 backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-blood-900/40">
                {['Name', 'Email', 'Role', 'Support Fee', 'Status', 'Actions'].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-cage-400"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-cage-700/50">
              {streamers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-cage-500">
                    No streamers found.
                  </td>
                </tr>
              ) : (
                streamers.map((s) => {
                  const isEditing = editingId === s.id
                  const supportFee = getSupportFeeRate(s)
                  return (
                    <tr
                      key={s.id}
                      className="transition-colors hover:bg-dark-700/50"
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full rounded-lg border border-cage-600 bg-dark-700 px-2 py-1 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEdit(s.id)
                              if (e.key === 'Escape') cancelEdit()
                            }}
                          />
                        ) : (
                          <span className="text-sm font-medium text-white">
                            {s.displayName}
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {isEditing ? (
                          <input
                            type="email"
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                            className="w-full rounded-lg border border-cage-600 bg-dark-700 px-2 py-1 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEdit(s.id)
                              if (e.key === 'Escape') cancelEdit()
                            }}
                          />
                        ) : (
                          <span className="text-sm text-cage-300">{s.email}</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="inline-flex rounded-full bg-indigo-500/20 px-2 py-1 text-xs font-medium capitalize text-indigo-400">
                          {s.role}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                            supportFee >= 30
                              ? 'bg-gold-500/20 text-gold-400'
                              : 'bg-indigo-500/20 text-indigo-400'
                          }`}
                        >
                          {supportFee}%
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                            s.isActive
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-dark-700 text-cage-400'
                          }`}
                        >
                          {s.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {isEditing ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => saveEdit(s.id)}
                              className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-indigo-500"
                            >
                              <CheckIcon className="h-3.5 w-3.5" />
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="inline-flex items-center gap-1 rounded-lg border border-cage-600 px-2.5 py-1 text-xs font-medium text-cage-400 transition-colors hover:border-cage-600 hover:text-cage-300"
                            >
                              <XIcon className="h-3.5 w-3.5" />
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-3">
                            <button
                              onClick={() => startEdit(s)}
                              className="inline-flex items-center gap-1 text-sm font-medium text-indigo-400 transition-colors hover:text-indigo-300"
                            >
                              <PencilIcon className="h-3.5 w-3.5" />
                              Edit
                            </button>
                            <button
                              onClick={() => toggleStatus(s.id)}
                              className={`text-sm font-medium transition-colors ${
                                s.isActive
                                  ? 'text-red-400 hover:text-red-300'
                                  : 'text-green-400 hover:text-green-300'
                              }`}
                            >
                              {s.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            {s.hasPassword === false ? (
                              <button
                                onClick={() => resendInvite(s.id)}
                                disabled={resendingFor === s.id}
                                className="inline-flex items-center gap-1 text-sm font-medium text-gold-400 transition-colors hover:text-gold-300 disabled:opacity-50"
                                title="Resend invite email"
                              >
                                <EnvelopeIcon className="h-3.5 w-3.5" />
                                {resendingFor === s.id ? 'Sending...' : 'Resend Invite'}
                              </button>
                            ) : (
                              <button
                                className="inline-flex items-center gap-1 text-sm font-medium text-cage-400 transition-colors hover:text-cage-300"
                                title="Reset password"
                              >
                                <KeyIcon className="h-3.5 w-3.5" />
                                Reset PW
                              </button>
                            )}
                          </div>
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

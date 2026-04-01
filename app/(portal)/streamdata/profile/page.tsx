// Profile & Settings page — edit display name, view role/email, change password
// Available to all authenticated portal users (streamers and admins)

'use client'

import { useState, useEffect } from 'react'

interface ProfileData {
  displayName: string
  email: string
  role: string
}

export default function ProfilePage() {
  // ── Profile state ────────────────────────────────────────────────────
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  )

  // ── Password state ───────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // ── Load profile on mount ────────────────────────────────────────────
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/streamdata/profile')
        if (!res.ok) throw new Error('Failed to load profile')
        const data: ProfileData = await res.json()
        setProfile(data)
        setDisplayName(data.displayName)
      } catch {
        setProfileMsg({ type: 'error', text: 'Failed to load profile data.' })
      } finally {
        setProfileLoading(false)
      }
    }
    loadProfile()
  }, [])

  // ── Initials for avatar ──────────────────────────────────────────────
  const initials = (profile?.displayName || displayName || '?')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  // ── Save display name ────────────────────────────────────────────────
  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setProfileMsg(null)

    const trimmed = displayName.trim()
    if (!trimmed) {
      setProfileMsg({ type: 'error', text: 'Display name cannot be empty.' })
      return
    }
    if (trimmed === profile?.displayName) {
      setProfileMsg({ type: 'error', text: 'No changes to save.' })
      return
    }

    setProfileSaving(true)
    try {
      const res = await fetch('/api/streamdata/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: trimmed }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update profile')
      setProfile((prev) => (prev ? { ...prev, displayName: trimmed } : prev))
      setProfileMsg({ type: 'success', text: 'Display name updated.' })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update profile.'
      setProfileMsg({ type: 'error', text: message })
    } finally {
      setProfileSaving(false)
    }
  }

  // ── Change password ──────────────────────────────────────────────────
  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setPasswordMsg(null)

    if (newPassword.length < 8) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 8 characters.' })
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' })
      return
    }
    if (currentPassword === newPassword) {
      setPasswordMsg({
        type: 'error',
        text: 'New password must be different from current password.',
      })
      return
    }

    setPasswordSaving(true)
    try {
      const res = await fetch('/api/streamdata/profile/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update password')
      setPasswordMsg({ type: 'success', text: 'Password updated successfully.' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update password.'
      setPasswordMsg({ type: 'error', text: message })
    } finally {
      setPasswordSaving(false)
    }
  }

  // ── Loading skeleton ─────────────────────────────────────────────────
  if (profileLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6">
        <div className="animate-pulse space-y-6">
          <div className="rounded-xl border border-blood-900/40 bg-black/60 p-6">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-dark-700" />
              <div className="space-y-2">
                <div className="h-4 w-32 rounded bg-dark-700" />
                <div className="h-3 w-48 rounded bg-dark-700" />
              </div>
            </div>
          </div>
          <div className="h-48 rounded-xl border border-blood-900/40 bg-black/60" />
          <div className="h-64 rounded-xl border border-blood-900/40 bg-black/60" />
        </div>
      </div>
    )
  }

  // ── Password strength indicator ──────────────────────────────────────
  function getPasswordStrength(pw: string): { label: string; color: string; width: string } {
    if (pw.length === 0) return { label: '', color: '', width: 'w-0' }
    let score = 0
    if (pw.length >= 8) score++
    if (pw.length >= 12) score++
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
    if (/[0-9]/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++

    if (score <= 1) return { label: 'Weak', color: 'bg-red-500', width: 'w-1/5' }
    if (score === 2) return { label: 'Fair', color: 'bg-orange-500', width: 'w-2/5' }
    if (score === 3) return { label: 'Good', color: 'bg-yellow-500', width: 'w-3/5' }
    if (score === 4) return { label: 'Strong', color: 'bg-green-500', width: 'w-4/5' }
    return { label: 'Very Strong', color: 'bg-emerald-400', width: 'w-full' }
  }

  const pwStrength = getPasswordStrength(newPassword)

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6">
      {/* ── Section 1: Avatar & Basic Info ─────────────────────────────── */}
      <div className="rounded-xl border border-blood-900/40 bg-black/60 p-6 backdrop-blur-md">
        <h2 className="mb-6 text-lg font-semibold text-white">Profile</h2>

        <div className="mb-6 flex items-center gap-5">
          {/* Initials avatar */}
          <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-dark-700 text-2xl font-bold text-white ring-2 ring-blood-900/40">
            {initials}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-medium text-white">
              {profile?.displayName || '---'}
            </p>
            <p className="truncate text-sm text-cage-400">{profile?.email || '---'}</p>
            <span
              className={`mt-1 inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                profile?.role === 'admin'
                  ? 'bg-gold-500/15 text-gold-400'
                  : 'bg-dark-700 text-cage-400'
              }`}
            >
              {profile?.role === 'streamer' ? 'Breaker' : profile?.role || '---'}
            </span>
          </div>
        </div>

        {/* Edit display name form */}
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label htmlFor="displayName" className="mb-1.5 block text-sm font-medium text-cage-300">
              Display Name
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={100}
              className="w-full rounded-lg border border-cage-600 bg-dark-700 px-3 py-2 text-sm text-white placeholder-cage-500 transition-colors focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
              placeholder="Your display name"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-cage-300">Email</label>
            <div className="flex items-center rounded-lg border border-cage-600/50 bg-dark-800 px-3 py-2 text-sm text-cage-400">
              <LockIcon className="mr-2 h-4 w-4 flex-shrink-0 text-cage-500" />
              {profile?.email || '---'}
            </div>
            <p className="mt-1 text-xs text-cage-500">
              Email cannot be changed. Contact an admin if needed.
            </p>
          </div>

          {profileMsg && (
            <div
              role="alert"
              className={`rounded-lg px-3 py-2 text-sm ${
                profileMsg.type === 'success'
                  ? 'bg-green-500/10 text-green-400'
                  : 'bg-red-500/10 text-red-400'
              }`}
            >
              {profileMsg.text}
            </div>
          )}

          <button
            type="submit"
            disabled={profileSaving}
            className="rounded-lg bg-gold-500 px-5 py-2 text-sm font-semibold text-dark-950 transition-colors hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {profileSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* ── Section 2: Change Password ─────────────────────────────────── */}
      <div className="rounded-xl border border-blood-900/40 bg-black/60 p-6 backdrop-blur-md">
        <h2 className="mb-6 text-lg font-semibold text-white">Change Password</h2>

        <form onSubmit={handleChangePassword} className="space-y-4">
          {/* Current password */}
          <div>
            <label
              htmlFor="currentPassword"
              className="mb-1.5 block text-sm font-medium text-cage-300"
            >
              Current Password
            </label>
            <div className="relative">
              <input
                id="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-lg border border-cage-600 bg-dark-700 px-3 py-2 pr-10 text-sm text-white placeholder-cage-500 transition-colors focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
                placeholder="Enter current password"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-cage-500 hover:text-cage-300"
                aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
              >
                {showCurrentPassword ? (
                  <EyeOffIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* New password */}
          <div>
            <label
              htmlFor="newPassword"
              className="mb-1.5 block text-sm font-medium text-cage-300"
            >
              New Password
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-lg border border-cage-600 bg-dark-700 px-3 py-2 pr-10 text-sm text-white placeholder-cage-500 transition-colors focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
                placeholder="Minimum 8 characters"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-cage-500 hover:text-cage-300"
                aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
              >
                {showNewPassword ? (
                  <EyeOffIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
              </button>
            </div>
            {/* Strength bar */}
            {newPassword.length > 0 && (
              <div className="mt-2">
                <div className="h-1 w-full overflow-hidden rounded-full bg-dark-700">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${pwStrength.color} ${pwStrength.width}`}
                  />
                </div>
                <p className="mt-1 text-xs text-cage-500">
                  Strength: <span className="text-cage-300">{pwStrength.label}</span>
                </p>
              </div>
            )}
          </div>

          {/* Confirm new password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1.5 block text-sm font-medium text-cage-300"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-cage-600 bg-dark-700 px-3 py-2 pr-10 text-sm text-white placeholder-cage-500 transition-colors focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
                placeholder="Re-enter new password"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-cage-500 hover:text-cage-300"
                aria-label={
                  showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'
                }
              >
                {showConfirmPassword ? (
                  <EyeOffIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
              </button>
            </div>
            {/* Match indicator */}
            {confirmPassword.length > 0 && (
              <p
                className={`mt-1 text-xs ${
                  confirmPassword === newPassword ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {confirmPassword === newPassword ? 'Passwords match' : 'Passwords do not match'}
              </p>
            )}
          </div>

          {passwordMsg && (
            <div
              role="alert"
              className={`rounded-lg px-3 py-2 text-sm ${
                passwordMsg.type === 'success'
                  ? 'bg-green-500/10 text-green-400'
                  : 'bg-red-500/10 text-red-400'
              }`}
            >
              {passwordMsg.text}
            </div>
          )}

          <button
            type="submit"
            disabled={passwordSaving || !currentPassword || !newPassword || !confirmPassword}
            className="rounded-lg bg-gold-500 px-5 py-2 text-sm font-semibold text-dark-950 transition-colors hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {passwordSaving ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* ── Section 3: Account Info ────────────────────────────────────── */}
      <div className="rounded-xl border border-blood-900/40 bg-black/60 p-6 backdrop-blur-md">
        <h2 className="mb-4 text-lg font-semibold text-white">Account</h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-cage-400">Role</span>
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                profile?.role === 'admin'
                  ? 'bg-gold-500/15 text-gold-400'
                  : 'bg-dark-700 text-cage-400'
              }`}
            >
              {profile?.role === 'streamer' ? 'Breaker' : profile?.role || '---'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-cage-400">Email</span>
            <span className="text-white">{profile?.email || '---'}</span>
          </div>
        </div>
        <p className="mt-4 text-xs text-cage-500">
          Need to change your email or role? Contact an administrator.
        </p>
      </div>
    </div>
  )
}

// ── Inline SVG icons ──────────────────────────────────────────────────────

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
      />
    </svg>
  )
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  )
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
      />
    </svg>
  )
}

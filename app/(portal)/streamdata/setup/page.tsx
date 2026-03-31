// Password setup page for invited streamers
// Accessible via magic link from invite email — no auth required

'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, type FormEvent, Suspense } from 'react'

function SetupForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // No token in URL — show error immediately
  if (!token) {
    return (
      <div className="fixed inset-0 z-[100] flex min-h-screen flex-col items-center justify-center bg-dark-950 px-4">
        <div className="relative w-full max-w-sm">
          <div className="rounded-xl border border-red-500/30 bg-black p-6 shadow-2xl">
            <h2 className="mb-4 text-lg font-semibold text-white">Invalid Link</h2>
            <p className="text-sm text-cage-400">
              This invite link is missing or invalid. Please check the link from your email or ask your admin for a new invite.
            </p>
            <a
              href="/streamdata/login"
              className="mt-6 block w-full rounded-lg bg-amber-500 px-4 py-2.5 text-center text-sm font-semibold text-black transition-colors hover:bg-amber-600"
            >
              Go to Login
            </a>
          </div>
        </div>
      </div>
    )
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    if (!password) {
      setError('Password is required.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/streamdata/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/streamdata/login')
      }, 2500)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="fixed inset-0 z-[100] flex min-h-screen flex-col items-center justify-center bg-dark-950 px-4">
        <div
          className="pointer-events-none fixed inset-0 opacity-30"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(185,28,28,0.08) 0%, transparent 70%)',
          }}
          aria-hidden="true"
        />
        <div className="relative w-full max-w-sm">
          <div className="rounded-xl border border-green-500/30 bg-black p-6 shadow-2xl text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
              <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mb-2 text-lg font-semibold text-white">Password Set!</h2>
            <p className="text-sm text-cage-400">
              Redirecting to login...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[100] flex min-h-screen flex-col items-center justify-center bg-dark-950 px-4">
      {/* Subtle radial gradient background accent */}
      <div
        className="pointer-events-none fixed inset-0 opacity-30"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(185,28,28,0.08) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-sm">
        {/* Branding */}
        <div className="mb-8 text-center">
          <img src="/logo-chicken1of1.svg" alt="Chicken1of1" className="mx-auto mb-4 h-16 w-16" />
          <h1
            className="bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-2xl font-bold tracking-wide text-transparent"
            style={{ fontFamily: 'var(--font-oswald)' }}
          >
            CHICKEN1OF1
          </h1>
          <p className="mt-1 text-sm text-cage-500">StreamData Portal</p>
        </div>

        {/* Setup card */}
        <div className="rounded-xl border border-cage-700/50 bg-black p-6 shadow-2xl">
          <h2 className="mb-2 text-lg font-semibold text-white">Set Your Password</h2>
          <p className="mb-6 text-sm text-cage-400">
            Welcome! Create a password to access your streamer portal.
          </p>

          {error && (
            <div
              className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
              role="alert"
            >
              <svg
                className="h-4 w-4 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-gray-300"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-lg border border-cage-600 bg-dark-700 px-3 py-2.5 text-sm text-white placeholder-cage-400 transition-colors focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
                placeholder="Min 8 characters"
                disabled={loading}
              />
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="mb-1.5 block text-sm font-medium text-gray-300"
              >
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full rounded-lg border border-cage-600 bg-dark-700 px-3 py-2.5 text-sm text-white placeholder-cage-400 transition-colors focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
                placeholder="Repeat your password"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-lg bg-gold-500 px-4 py-2.5 text-sm font-semibold text-dark-950 transition-colors hover:bg-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <svg
                    className="mr-2 h-4 w-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
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
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Setting password...
                </>
              ) : (
                'Set Password'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-cage-600">
          Already have a password?{' '}
          <a href="/streamdata/login" className="text-gold-500 hover:text-gold-400">
            Sign in
          </a>
        </p>
      </div>
    </div>
  )
}

export default function SetupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-dark-950">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gold-500 border-t-transparent" />
            <p className="mt-4 text-sm text-cage-400">Loading...</p>
          </div>
        </div>
      }
    >
      <SetupForm />
    </Suspense>
  )
}

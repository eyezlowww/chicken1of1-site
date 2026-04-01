// StreamData login page - credentials-based authentication

'use client'

import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    // Basic client-side validation
    if (!email.trim()) {
      setError('Email is required.')
      return
    }
    if (!password) {
      setError('Password is required.')
      return
    }

    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email: email.trim(),
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password.')
      } else {
        // Full page navigation (not client-side) so the server reads
        // the fresh session cookie and renders the layout with sidebar
        window.location.href = '/streamdata'
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-dark-950 px-4">
      {/* Background gradient matching main site */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(185,28,28,0.08) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />
      {/* Cage wire pattern from main site */}
      <div
        className="pointer-events-none fixed inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm1 1h38v38H1V1z' fill='%23ffffff' fill-opacity='0.03'/%3E%3C/svg%3E")`,
        }}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-sm">
        {/* Branding */}
        <div className="mb-8 text-center">
          <img
            src="/logo-chicken1of1.svg"
            alt="Chicken1of1 logo"
            className="mx-auto mb-4 h-16 w-16"
          />
          <h1
            className="bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-2xl font-bold tracking-wide text-transparent"
            style={{ fontFamily: 'var(--font-oswald)' }}
          >
            CHICKEN1OF1
          </h1>
          <p className="mt-1 text-sm text-cage-500">StreamData Portal</p>
        </div>

        {/* Login card */}
        <div className="rounded-xl border border-cage-700/50 bg-black p-6 shadow-2xl">
          <h2 className="mb-6 text-lg font-semibold text-white">Sign in to your account</h2>

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
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-gray-300"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-lg border border-cage-600 bg-dark-700 px-3 py-2.5 text-sm text-white placeholder-cage-400 transition-colors focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
                placeholder="you@example.com"
                disabled={loading}
              />
            </div>

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
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-lg border border-cage-600 bg-dark-700 px-3 py-2.5 text-sm text-white placeholder-cage-400 transition-colors focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
                placeholder="Enter your password"
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
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <a
            href="/streamdata/forgot-password"
            className="mt-4 block text-center text-sm text-cage-500 transition-colors hover:text-gold-400"
          >
            Forgot Password?
          </a>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-cage-600">
          Authorized personnel only. Contact admin for access.
        </p>
      </div>
    </div>
  )
}

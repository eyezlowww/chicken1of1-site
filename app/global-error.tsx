'use client'

import Link from 'next/link'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html>
      <body className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto">
          {/* Chicken Logo */}
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto bg-primary-500 rounded-full flex items-center justify-center text-4xl">
              🐔
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-4xl font-bold text-white mb-4">
            Oops! Something Went Wrong
          </h1>

          <p className="text-lg text-gray-400 mb-8">
            Don&apos;t worry, even the best breakers hit a snag sometimes.
            Let&apos;s get you back to the action!
          </p>

          {/* Error Details */}
          {error.digest && (
            <div className="bg-dark-800 border border-dark-700 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500">
                Error ID: <span className="font-mono text-gray-400">{error.digest}</span>
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={reset}
              className="btn-primary w-full"
            >
              Try Again
            </button>

            <Link
              href="/"
              className="btn-outline w-full block"
            >
              Back to Home
            </Link>
          </div>

          {/* Contact Info */}
          <div className="mt-8 pt-6 border-t border-dark-700">
            <p className="text-sm text-gray-500 mb-2">
              Still having issues? Contact us:
            </p>
            <a
              href="mailto:hello@chicken1of1.com"
              className="text-primary-400 hover:text-primary-300 transition-colors text-sm"
            >
              hello@chicken1of1.com
            </a>
          </div>

          {/* Branding */}
          <div className="mt-6">
            <p className="text-xs text-gray-600">
              Bauk Bauk Baby! 🐔
            </p>
          </div>
        </div>
      </body>
    </html>
  )
}
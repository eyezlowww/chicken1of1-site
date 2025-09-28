'use client'

import Link from 'next/link'
import { useEffect } from 'react'

export default function Error({
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
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto">
        {/* Chicken Logo */}
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto bg-primary-500 rounded-full flex items-center justify-center text-4xl">
            🐔
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-4xl font-bold text-white mb-4">
          Technical Knockout!
        </h1>

        <p className="text-lg text-gray-400 mb-6">
          Something went wrong on our end. Don&apos;t worry, we&apos;re working on fixing it
          faster than a Jon Jones takedown!
        </p>

        {/* UFC-themed Error Message */}
        <div className="bg-dark-800 border border-dark-700 rounded-lg p-4 mb-8">
          <p className="text-gray-300 text-sm">
            &ldquo;The referee has stopped the fight due to technical difficulties.&rdquo;
          </p>
          <p className="text-xs text-gray-500 mt-2">
            - Our Development Team
          </p>
        </div>

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

          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/live"
              className="btn-outline text-sm"
            >
              Watch Live
            </Link>
            <Link
              href="/gallery"
              className="btn-outline text-sm"
            >
              View Gallery
            </Link>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-8 pt-6 border-t border-dark-700">
          <p className="text-sm text-gray-500 mb-2">
            Error persisting? Let us know:
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
    </div>
  )
}
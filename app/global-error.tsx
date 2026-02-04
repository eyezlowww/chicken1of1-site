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
      <body
        className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
        style={{ backgroundColor: '#0a0a0a' }}
      >
        {/* Blood-red glow - inline style since global CSS may not load */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[120px]"
          style={{ backgroundColor: 'rgba(185, 28, 28, 0.15)' }}
        />

        <div className="text-center max-w-lg mx-auto relative z-10">
          {/* Chicken Fighter Image - use img tag since Next Image may not be available */}
          <div className="mb-8">
            <div className="w-44 h-44 mx-auto flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/chicken-fighter-404.png"
                alt="Chicken1of1 Fighter - Something Went Wrong"
                width={176}
                height={176}
                style={{ objectFit: 'contain', filter: 'drop-shadow(0 0 20px rgba(185, 28, 28, 0.3))' }}
              />
            </div>
          </div>

          {/* Error Message */}
          <h1
            className="text-4xl md:text-5xl font-bold mb-4 uppercase tracking-tight"
            style={{ color: '#ffffff', fontFamily: 'Oswald, sans-serif' }}
          >
            Technical Knockout!
          </h1>

          <p className="text-lg mb-6" style={{ color: '#9ca3af' }}>
            Something went seriously wrong. Don&apos;t worry, even the best fighters
            take a hit sometimes. Let&apos;s get you back in the octagon!
          </p>

          {/* Error Details */}
          {error.digest && (
            <div
              className="rounded-lg p-4 mb-6"
              style={{ backgroundColor: '#111', border: '1px solid #374151' }}
            >
              <p className="text-sm" style={{ color: '#6b7280' }}>
                Error ID: <span className="font-mono" style={{ color: '#9ca3af' }}>{error.digest}</span>
              </p>
            </div>
          )}

          {/* Action Buttons - inline styles as fallback */}
          <div className="space-y-4">
            <button
              onClick={reset}
              className="w-full py-3 px-6 rounded-lg font-bold uppercase tracking-wide"
              style={{ backgroundColor: '#b91c1c', color: '#ffffff', fontFamily: 'Oswald, sans-serif' }}
            >
              Try Again
            </button>

            <Link
              href="/"
              className="w-full block py-3 px-6 rounded-lg font-bold uppercase tracking-wide text-center"
              style={{ border: '1px solid #374151', color: '#ffffff', fontFamily: 'Oswald, sans-serif' }}
            >
              Back to Home
            </Link>
          </div>

          {/* Contact Info */}
          <div className="mt-8 pt-6" style={{ borderTop: '1px solid #374151' }}>
            <p className="text-sm mb-2" style={{ color: '#6b7280' }}>
              Error persisting? Let us know:
            </p>
            <a
              href="mailto:hello@chicken1of1.com"
              className="text-sm"
              style={{ color: '#facc15' }}
            >
              hello@chicken1of1.com
            </a>
          </div>

          {/* Branding */}
          <div className="mt-6">
            <p className="text-xs" style={{ color: '#4b5563' }}>
              Bauk Bauk Baby!
            </p>
          </div>
        </div>
      </body>
    </html>
  )
}

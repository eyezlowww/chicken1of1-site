'use client'

import Link from 'next/link'
import Image from 'next/image'
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
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Blood-red glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blood-700/15 rounded-full blur-[120px]" />

      <div className="text-center max-w-lg mx-auto relative z-10">
        {/* Chicken Fighter Image */}
        <div className="mb-8">
          <div className="w-44 h-44 mx-auto flex items-center justify-center">
            <Image
              src="/chicken-fighter-404.png"
              alt="Chicken1of1 Fighter - Something Went Wrong"
              width={176}
              height={176}
              className="object-contain drop-shadow-[0_0_20px_rgba(185,28,28,0.3)]"
            />
          </div>
        </div>

        {/* Error Message */}
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4 uppercase tracking-tight">
          Technical Knockout!
        </h1>

        <p className="text-lg text-cage-400 mb-6">
          Something went wrong on our end. Don&apos;t worry, we&apos;re working on fixing it
          faster than a Jon Jones takedown!
        </p>

        {/* UFC Quote */}
        <div className="bg-[#111] border border-cage-700 rounded-lg p-5 mb-8">
          <p className="text-cage-300 italic">
            &ldquo;The referee has stopped the fight due to technical difficulties.&rdquo;
          </p>
          <p className="text-sm text-cage-500 mt-2">
            - Chicken1of1 Dev Team
          </p>
        </div>

        {/* Error Details */}
        {error.digest && (
          <div className="bg-[#111] border border-cage-700 rounded-lg p-4 mb-6">
            <p className="text-sm text-cage-500">
              Error ID: <span className="font-mono text-cage-400">{error.digest}</span>
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

          <Link href="/" className="btn-outline w-full block">
            Back to Home
          </Link>

          <div className="grid grid-cols-2 gap-4">
            <Link href="/live" className="btn-outline text-sm">
              Watch Live
            </Link>
            <Link href="/gallery" className="btn-outline text-sm">
              View Gallery
            </Link>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-8 pt-6 border-t border-cage-700">
          <p className="text-sm text-cage-500 mb-2">
            Error persisting? Let us know:
          </p>
          <a
            href="mailto:hello@chicken1of1.com"
            className="text-gold-400 hover:text-gold-300 transition-colors text-sm"
          >
            hello@chicken1of1.com
          </a>
        </div>

        {/* Branding */}
        <div className="mt-6">
          <p className="text-xs text-cage-600">
            Bauk Bauk Baby!
          </p>
        </div>
      </div>
    </div>
  )
}

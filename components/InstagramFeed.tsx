'use client'

import { useState, useEffect } from 'react'
import Script from 'next/script'

interface InstagramFeedProps {
  className?: string
}

export default function InstagramFeed({ className = '' }: InstagramFeedProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className={`${className}`}>
        <div className="animate-pulse">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="aspect-square bg-dark-700 rounded-lg"
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      {/* Elfsight Instagram Feed Widget */}
      <div id="instagram-feed-widget" className="min-h-[400px]">
        <Script
          src="https://elfsightcdn.com/platform.js"
          strategy="afterInteractive"
        />
        <div
          className="elfsight-app-5ffb4cbb-f100-4edc-9899-9a3da15fba60"
          data-elfsight-app-lazy
        ></div>
      </div>
    </div>
  )
}
'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface EmbedCardProps {
  title: string
  platform: 'whatnot' | 'youtube' | 'custom'
  embedUrl?: string
  fallbackUrl: string
  previewImage?: string
  customEmbedCode?: string
}

export default function EmbedCard({
  title,
  platform,
  embedUrl,
  fallbackUrl,
  previewImage,
  customEmbedCode,
}: EmbedCardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleIframeLoad = () => {
    setIsLoading(false)
  }

  const handleIframeError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  const getPlatformLabel = () => {
    switch (platform) {
      case 'youtube':
        return 'YouTube'
      case 'whatnot':
        return 'Whatnot'
      default:
        return platform.charAt(0).toUpperCase() + platform.slice(1)
    }
  }

  const renderEmbed = () => {
    if (customEmbedCode) {
      return (
        <div
          dangerouslySetInnerHTML={{ __html: customEmbedCode }}
          className="w-full h-full"
        />
      )
    }

    if (!embedUrl) {
      return (
        <div className="relative w-full h-full group">
          {previewImage ? (
            <>
              <Image
                src={previewImage}
                alt={title}
                fill
                className="object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            </>
          ) : (
            <div className="absolute inset-0 bg-dark-800" />
          )}
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-10 text-center p-6">
            <Link
              href={fallbackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary bg-gold-500 text-dark-950 hover:bg-gold-400 font-bold font-heading uppercase tracking-wide text-lg px-8 py-3 transition-transform hover:scale-105"
            >
              Watch on {getPlatformLabel()}
            </Link>
          </div>
        </div>
      )
    }

    return (
      <>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-dark-800">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500"></div>
          </div>
        )}
        {hasError ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
            <p className="text-cage-400 mb-4">
              Stream couldn&apos;t load. Open in a new tab instead.
            </p>
            <Link
              href={fallbackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Open in {getPlatformLabel()}
            </Link>
          </div>
        ) : (
          <iframe
            src={embedUrl}
            title={title}
            className="w-full h-full border-0 rounded-lg"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          />
        )}
      </>
    )
  }

  return (
    <div className="relative w-full aspect-video bg-dark-800 rounded-lg overflow-hidden border border-dark-700">
      {renderEmbed()}
    </div>
  )
}

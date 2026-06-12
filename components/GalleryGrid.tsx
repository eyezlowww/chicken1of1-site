'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'

interface GalleryItem {
  image: string
  alt: string
  title?: string
  description?: string
}

interface GalleryGridProps {
  items: GalleryItem[]
  columns?: 2 | 3 | 4
}

export default function GalleryGrid({ items, columns = 3 }: GalleryGridProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const selectedImage = selectedIndex !== null ? items[selectedIndex] : null
  const triggerRefs = useRef<Array<HTMLButtonElement | null>>([])
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  const modalId = 'gallery-lightbox'
  const modalTitleId = 'gallery-lightbox-title'

  const openModal = useCallback((index: number) => {
    setSelectedIndex(index)
  }, [])

  const closeModal = useCallback(() => {
    const idx = selectedIndex
    setSelectedIndex(null)
    if (idx !== null) {
      setTimeout(() => triggerRefs.current[idx]?.focus(), 0)
    }
  }, [selectedIndex])

  useEffect(() => {
    if (selectedImage === null) return

    const previouslyFocused = document.activeElement as HTMLElement
    setTimeout(() => closeButtonRef.current?.focus(), 0)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal()
      if (e.key === 'ArrowRight' && selectedIndex !== null) {
        setSelectedIndex((selectedIndex + 1) % items.length)
      }
      if (e.key === 'ArrowLeft' && selectedIndex !== null) {
        setSelectedIndex((selectedIndex - 1 + items.length) % items.length)
      }

      // Focus trap
      if (e.key === 'Tab') {
        const modal = document.getElementById(modalId)
        if (!modal) return
        const focusable = modal.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [selectedImage, selectedIndex, items.length, closeModal])

  const gridClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }

  return (
    <>
      <div className={`grid ${gridClasses[columns]} gap-6`}>
        {items.map((item, index) => (
          <button
            key={index}
            ref={(el) => { triggerRefs.current[index] = el }}
            className="group text-left bg-black rounded-xl border border-cage-700/50 overflow-hidden hover:border-gold-500/40 transition-all duration-300 hover:shadow-[0_0_20px_rgba(185,28,28,0.1)] focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-dark-950"
            onClick={() => openModal(index)}
            aria-label={`View ${item.title || item.alt} in full size`}
          >
            {/* Card Image */}
            <div className="relative aspect-square overflow-hidden">
              <Image
                src={item.image}
                alt={item.alt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                aria-hidden="true"
              >
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                  />
                </svg>
              </div>
            </div>

            {/* Card Content */}
            {item.title && (
              <div className="p-5">
                <h3 className="font-heading text-base font-bold text-white uppercase tracking-wide mb-2">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-sm text-cage-400 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && selectedIndex !== null && (
        <div
          id={modalId}
          role="dialog"
          aria-modal="true"
          aria-labelledby={selectedImage.title ? modalTitleId : undefined}
          aria-label={!selectedImage.title ? selectedImage.alt : undefined}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={closeModal}
        >
          <div
            className="relative max-w-4xl max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
              {items.length > 1 && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedIndex((selectedIndex - 1 + items.length) % items.length)}
                    className="text-white hover:text-gray-300 bg-black/60 rounded-full px-3 py-1 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gold-500"
                    aria-label="Previous image"
                  >
                    ‹ Prev
                  </button>
                  <span className="text-gray-400 text-sm self-center">
                    {selectedIndex + 1} / {items.length}
                  </span>
                  <button
                    onClick={() => setSelectedIndex((selectedIndex + 1) % items.length)}
                    className="text-white hover:text-gray-300 bg-black/60 rounded-full px-3 py-1 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gold-500"
                    aria-label="Next image"
                  >
                    Next ›
                  </button>
                </div>
              )}
              <button
                ref={closeButtonRef}
                onClick={closeModal}
                className="ml-auto text-white hover:text-gray-300 bg-black/60 rounded-full w-9 h-9 flex items-center justify-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-gold-500"
                aria-label="Close image viewer"
              >
                ×
              </button>
            </div>
            <Image
              src={selectedImage.image}
              alt={selectedImage.alt}
              width={800}
              height={800}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            {selectedImage.title && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-4 rounded-b-lg">
                <h3
                  id={modalTitleId}
                  className="text-white font-heading font-bold uppercase tracking-wide"
                >
                  {selectedImage.title}
                </h3>
                {selectedImage.description && (
                  <p className="text-cage-300 text-sm mt-1">
                    {selectedImage.description}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

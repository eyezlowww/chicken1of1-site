'use client'

import { useState } from 'react'
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
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null)

  const gridClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }

  return (
    <>
      <div className={`grid ${gridClasses[columns]} gap-6`}>
        {items.map((item, index) => (
          <div
            key={index}
            className="group cursor-pointer"
            onClick={() => setSelectedImage(item)}
          >
            <div className="relative aspect-square overflow-hidden rounded-xl bg-dark-800 border border-dark-700 group-hover:border-primary-500 transition-colors duration-200">
              <Image
                src={item.image}
                alt={item.alt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-200"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
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
            {item.title && (
              <div className="mt-3">
                <h3 className="text-sm font-medium text-white">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-xs text-gray-400 mt-1">
                    {item.description}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 text-2xl font-bold z-10"
              aria-label="Close modal"
            >
              ×
            </button>
            <Image
              src={selectedImage.image}
              alt={selectedImage.alt}
              width={800}
              height={800}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            {selectedImage.title && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-4 rounded-b-lg">
                <h3 className="text-white font-semibold">
                  {selectedImage.title}
                </h3>
                {selectedImage.description && (
                  <p className="text-gray-300 text-sm mt-1">
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
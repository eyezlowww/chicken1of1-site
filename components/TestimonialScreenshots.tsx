'use client'

import Image from 'next/image'
import { useState } from 'react'

interface TestimonialScreenshot {
  id: string
  image: string
  alt: string
  title: string
}

const testimonialScreenshots: TestimonialScreenshot[] = [
  {
    id: '1',
    image: '/testimonials/whatnot-reviews-1.jpg',
    alt: 'Whatnot Customer Reviews Screenshot 1',
    title: 'Recent 5-Star Reviews'
  },
  {
    id: '2',
    image: '/testimonials/whatnot-reviews-2.jpg',
    alt: 'Whatnot Customer Reviews Screenshot 2',
    title: 'Customer Feedback'
  },
  {
    id: '3',
    image: '/testimonials/whatnot-reviews-3.jpg',
    alt: 'Whatnot Customer Reviews Screenshot 3',
    title: 'More 5-Star Reviews'
  }
]

export default function TestimonialScreenshots() {
  const [selectedImage, setSelectedImage] = useState<TestimonialScreenshot | null>(null)

  return (
    <>
      {/* Screenshots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonialScreenshots.map((screenshot) => (
          <div
            key={screenshot.id}
            className="group cursor-pointer hover-lift"
            onClick={() => setSelectedImage(screenshot)}
          >
            <div className="card border-2 border-dark-600 hover:border-primary-500 transition-colors">
              <div className="relative aspect-video overflow-hidden rounded-lg mb-3">
                <Image
                  src={screenshot.image}
                  alt={screenshot.alt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
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
              <h3 className="text-lg font-semibold text-white mb-2">
                {screenshot.title}
              </h3>
              <p className="text-sm text-gray-400">
                Click to view full-size reviews from our Whatnot customers
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Review Stats */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center space-x-4 bg-dark-800 rounded-lg px-6 py-4 border border-dark-700">
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className="w-5 h-5 text-yellow-400 fill-current"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <div className="text-white">
            <span className="text-xl font-bold">5.0</span>
            <span className="text-gray-400 ml-2">14,761+ Reviews on Whatnot</span>
          </div>
        </div>
      </div>

      {/* Modal for Full-Size View */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl max-h-full">
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
              width={1200}
              height={800}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-4 rounded-b-lg">
              <h3 className="text-white font-semibold text-center">
                Real Reviews from Our Whatnot Community
              </h3>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
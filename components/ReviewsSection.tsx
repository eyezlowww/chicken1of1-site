'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

const reviews = [
  { id: 1, text: '5 stars everytime! Chicken!!', name: 'J.M.' },
  { id: 2, text: 'Amazing seller! OG of the ufc community. Much love bro!', name: 'R.K.' },
  { id: 3, text: 'Went above and beyond. Go with full confidence. 1 Chicken.', name: 'T.L.' },
  { id: 4, text: 'Chicken is the goat!', name: 'D.S.' },
  { id: 5, text: 'AMAZING STREAM! EVEN BETTER PRODUCT! CLUCKS NOT DUCKS!!!', name: 'A.W.' },
  { id: 6, text: 'Super fast shipping with superior packaging. Thanks!', name: 'M.C.' },
  { id: 7, text: 'Bauk Bauk Baby! Thanks family and Chicken!', name: 'P.R.' },
  { id: 8, text: 'Best breaker who actually cares... well packaged', name: 'K.B.' },
  { id: 9, text: 'Always nothing but the best!!', name: 'S.H.' },
  { id: 10, text: 'Fast shipment, well packaged, thank you!', name: 'N.G.' },
  { id: 11, text: 'AMAZING STREAM RAINING HITS! SUPER FAST SHIPPING!', name: 'C.D.' },
  { id: 12, text: 'Chicken is the goat! 10/10 chicken slew it!', name: 'B.F.' },
  { id: 13, text: 'Excellent all around. Thank you.', name: 'L.T.' },
  { id: 14, text: 'Never a dull moment in the coop! 10/10', name: 'E.V.' },
  { id: 15, text: 'Bauk Bauk Baby!', name: 'W.J.' },
]

const row1 = reviews.slice(0, 8)
const row2 = reviews.slice(8)

// Count-up animation hook
function useCountUp(end: number, duration: number = 2000, suffix: string = '') {
  const [count, setCount] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true)
        }
      },
      { threshold: 0.3 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [hasStarted])

  useEffect(() => {
    if (!hasStarted) return

    let startTime: number
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * end))
      if (progress < 1) {
        requestAnimationFrame(step)
      } else {
        setCount(end)
      }
    }
    requestAnimationFrame(step)
  }, [hasStarted, end, duration])

  return { count, ref, suffix }
}

function formatCount(num: number, suffix: string): string {
  if (suffix === 'K') {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toLocaleString()
}

function StarIcon() {
  return (
    <svg
      className="w-4 h-4 text-gold-400 fill-current"
      viewBox="0 0 20 20"
      aria-hidden="true"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  )
}

function FiveStars() {
  return (
    <div className="flex gap-0.5" aria-label="5 out of 5 stars">
      <StarIcon />
      <StarIcon />
      <StarIcon />
      <StarIcon />
      <StarIcon />
    </div>
  )
}

interface ReviewCardProps {
  text: string
  name: string
}

function ReviewCard({ text, name }: ReviewCardProps) {
  return (
    <div className="flex-shrink-0 w-72 sm:w-80 bg-[#1a1a1a] border-l-2 border-blood-600 rounded-lg p-5 mx-2">
      <FiveStars />
      <p className="text-white text-sm mt-3 mb-3 leading-relaxed">&ldquo;{text}&rdquo;</p>
      <div className="flex items-center justify-between">
        <span className="text-cage-400 text-xs font-medium">{name}</span>
        <span className="text-[10px] text-gold-500 font-semibold uppercase tracking-wider bg-gold-500/10 px-2 py-0.5 rounded-full">
          Verified Buyer
        </span>
      </div>
    </div>
  )
}

interface ScrollRowProps {
  items: typeof reviews
  direction: 'left' | 'right'
}

function ScrollRow({ items, direction }: ScrollRowProps) {
  const animationClass =
    direction === 'left' ? 'animate-scroll-left' : 'animate-scroll-right'

  return (
    <div
      className="relative overflow-hidden py-2 group"
      role="region"
      aria-label={`Auto-scrolling reviews row, scrolling ${direction}`}
    >
      <div className={`flex w-max ${animationClass} group-hover:[animation-play-state:paused]`}>
        {items.map((review) => (
          <ReviewCard key={`a-${review.id}`} text={review.text} name={review.name} />
        ))}
        {items.map((review) => (
          <ReviewCard key={`b-${review.id}`} text={review.text} name={review.name} />
        ))}
      </div>
    </div>
  )
}

export default function ReviewsSection() {
  const reviewsCount = useCountUp(15600, 2000)
  const soldCount = useCountUp(110600, 2500)

  return (
    <section
      id="reviews"
      className="py-16 md:py-24 overflow-hidden"
      aria-labelledby="reviews-heading"
    >
      {/* Section heading */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-10">
        <h2
          id="reviews-heading"
          className="font-heading text-3xl md:text-4xl font-bold text-white uppercase tracking-tight mb-4"
        >
          What the Coop is Saying
        </h2>
        <p className="text-lg text-cage-400 max-w-2xl mx-auto">
          Real reviews from our Whatnot community. 15,500+ and counting.
        </p>
      </div>

      {/* Stats Banner */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="bg-[#111] border border-cage-700 rounded-xl p-4 sm:p-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-center">
            {/* Reviews count */}
            <div className="flex flex-col items-center gap-1">
              <span ref={reviewsCount.ref} className="text-gold-400 text-2xl sm:text-3xl font-bold font-heading">
                {reviewsCount.count > 0 ? `${reviewsCount.count.toLocaleString()}+` : '0'}
              </span>
              <span className="text-cage-400 text-xs sm:text-sm">Five-Star Reviews</span>
            </div>

            {/* Rating */}
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1.5">
                <span className="text-gold-400 text-2xl sm:text-3xl font-bold font-heading">5.0</span>
                <div className="flex gap-0.5 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold-400 fill-current"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <span className="text-cage-400 text-xs sm:text-sm">Rating on Whatnot</span>
            </div>

            {/* Premier Shop badge */}
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <Image
                  src="/whatnot-logo.png"
                  alt="Whatnot"
                  width={28}
                  height={28}
                  className="rounded"
                />
                <span className="text-gold-400 text-lg sm:text-xl font-bold font-heading">Premier Shop</span>
              </div>
              <span className="text-cage-400 text-xs sm:text-sm">Whatnot Verified</span>
            </div>

            {/* Sold count */}
            <div className="flex flex-col items-center gap-1">
              <span ref={soldCount.ref} className="text-gold-400 text-2xl sm:text-3xl font-bold font-heading">
                {soldCount.count > 0 ? `${(soldCount.count / 1000).toFixed(1)}K+` : '0'}
              </span>
              <span className="text-cage-400 text-xs sm:text-sm">Products Sold</span>
            </div>
          </div>
        </div>
      </div>

      {/* Auto-scrolling review cards */}
      <div className="space-y-4">
        <ScrollRow items={row1} direction="left" />
        <ScrollRow items={row2} direction="right" />
      </div>

      {/* Verified on Whatnot badge */}
      <div className="text-center mt-8">
        <a
          href="https://www.whatnot.com/user/chicken1of1"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-cage-400 hover:text-gold-400 transition-colors text-sm"
          aria-label="View Chicken1of1 reviews on Whatnot (opens in new tab)"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          All reviews verified on Whatnot
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </section>
  )
}

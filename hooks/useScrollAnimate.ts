'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Hook that observes elements with .scroll-animate class
 * and adds .is-visible when they enter the viewport.
 * Re-runs on route changes to catch new elements after client-side navigation.
 */
export function useScrollAnimate() {
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px',
      }
    )

    // Small delay to let the new page DOM render before scanning
    const timer = setTimeout(() => {
      const elements = document.querySelectorAll('.scroll-animate:not(.is-visible)')
      elements.forEach((el) => observer.observe(el))
    }, 50)

    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [pathname])
}

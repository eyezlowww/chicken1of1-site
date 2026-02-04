'use client'

import { useScrollAnimate } from '@/hooks/useScrollAnimate'

/**
 * Client component that initializes the scroll animation observer.
 * Place once in the root layout.
 */
export default function ScrollAnimateProvider() {
  useScrollAnimate()
  return null
}

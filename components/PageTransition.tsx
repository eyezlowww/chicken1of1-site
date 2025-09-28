'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

interface PageTransitionProps {
  children: React.ReactNode
}

export default function PageTransition({ children }: PageTransitionProps) {
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    // Trigger loading state on route change
    setIsLoading(true)
    const timer = setTimeout(() => setIsLoading(false), 150)
    return () => clearTimeout(timer)
  }, [pathname])

  return (
    <div
      className={`page-transition ${
        isLoading ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {children}
    </div>
  )
}

export function LoadingOverlay({ show }: { show: boolean }) {
  if (!show) return null

  return (
    <div
      className="fixed inset-0 bg-dark-950/50 backdrop-blur-sm z-50 flex items-center justify-center"
      role="status"
      aria-label="Loading"
    >
      <div className="bg-dark-800 rounded-lg p-6 flex items-center space-x-3 border border-dark-700">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-600 border-t-transparent"></div>
        <span className="text-white font-medium">Loading...</span>
      </div>
    </div>
  )
}
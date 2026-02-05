'use client'

interface ScrollToTopLinkProps {
  children: React.ReactNode
  className?: string
}

export default function ScrollToTopLink({ children, className = '' }: ScrollToTopLinkProps) {
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={className}
    >
      {children}
    </button>
  )
}

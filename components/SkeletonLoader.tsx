interface SkeletonLoaderProps {
  variant?: 'text' | 'card' | 'image' | 'button'
  lines?: number
  className?: string
}

export default function SkeletonLoader({
  variant = 'text',
  lines = 1,
  className = ''
}: SkeletonLoaderProps) {
  const baseClasses = 'animate-pulse bg-gradient-to-r from-dark-700 via-dark-600 to-dark-700 bg-[length:200%_100%] rounded'

  const variants = {
    text: `h-4 ${baseClasses}`,
    card: `h-48 ${baseClasses}`,
    image: `aspect-video ${baseClasses}`,
    button: `h-10 w-24 ${baseClasses}`
  }

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`} role="status" aria-label="Loading content">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${variants[variant]} ${
              index === lines - 1 ? 'w-3/4' : 'w-full'
            }`}
          />
        ))}
        <span className="sr-only">Loading content...</span>
      </div>
    )
  }

  return (
    <div className={`${variants[variant]} ${className}`} role="status" aria-label="Loading content">
      <span className="sr-only">Loading content...</span>
    </div>
  )
}

export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`card ${className}`} role="status" aria-label="Loading card">
      <div className="animate-pulse">
        <SkeletonLoader variant="image" className="mb-4" />
        <SkeletonLoader variant="text" lines={2} className="mb-3" />
        <SkeletonLoader variant="button" />
      </div>
      <span className="sr-only">Loading card content...</span>
    </div>
  )
}

export function FAQSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4" role="status" aria-label="Loading FAQ items">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="card">
          <div className="animate-pulse">
            <SkeletonLoader variant="text" className="mb-2 h-6" />
            <SkeletonLoader variant="text" lines={3} />
          </div>
        </div>
      ))}
      <span className="sr-only">Loading FAQ items...</span>
    </div>
  )
}
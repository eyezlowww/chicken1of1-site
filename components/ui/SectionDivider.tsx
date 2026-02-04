interface SectionDividerProps {
  variant?: 'cage-wire' | 'octagon-line' | 'gradient'
  className?: string
}

export default function SectionDivider({
  variant = 'cage-wire',
  className = '',
}: SectionDividerProps) {
  if (variant === 'cage-wire') {
    return (
      <div className={`relative py-4 ${className}`}>
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-cage-700" />
        </div>
        <div className="relative flex justify-center">
          <div className="w-2 h-2 bg-cage-600 rotate-45" />
        </div>
      </div>
    )
  }

  if (variant === 'octagon-line') {
    return (
      <div className={`flex items-center gap-4 ${className}`}>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gold-500/30" />
        <div className="octagon-border w-3 h-3 bg-gold-500/50" />
        <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gold-500/30" />
      </div>
    )
  }

  return (
    <div className={`h-1 knockout-gradient opacity-30 ${className}`} />
  )
}

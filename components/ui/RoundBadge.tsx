interface RoundBadgeProps {
  number: number | string
  label?: string
  active?: boolean
  className?: string
}

export default function RoundBadge({
  number,
  label,
  active = false,
  className = '',
}: RoundBadgeProps) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center font-heading text-lg font-bold border-2 transition-colors ${
          active
            ? 'bg-gold-500 text-dark-950 border-gold-400'
            : 'bg-dark-800 text-cage-300 border-cage-600'
        }`}
      >
        {number}
      </div>
      {label && (
        <span className="mt-2 text-xs font-heading uppercase tracking-wider text-cage-400">
          {label}
        </span>
      )}
    </div>
  )
}

interface OctagonFrameProps {
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  glowColor?: 'gold' | 'blood' | 'none'
}

export default function OctagonFrame({
  children,
  className = '',
  size = 'md',
  glowColor = 'none',
}: OctagonFrameProps) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40',
  }

  const glowClasses = {
    gold: 'shadow-lg shadow-gold-500/20',
    blood: 'shadow-lg shadow-blood-500/20',
    none: '',
  }

  return (
    <div
      className={`octagon-border bg-dark-800 flex items-center justify-center ${sizeClasses[size]} ${glowClasses[glowColor]} ${className}`}
    >
      {children}
    </div>
  )
}

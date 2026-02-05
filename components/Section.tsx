import { ReactNode } from 'react'
import Container from './Container'

interface SectionProps {
  children: ReactNode
  className?: string
  id?: string
  background?: 'default' | 'darker' | 'gradient'
  padding?: 'sm' | 'md' | 'lg' | 'xl'
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl'
}

export default function Section({
  children,
  className = '',
  id,
  background = 'default',
  padding = 'lg',
  maxWidth = '7xl',
}: SectionProps) {
  const paddingClasses = {
    sm: 'py-8 md:py-12',
    md: 'py-12 md:py-16',
    lg: 'py-16 md:py-24',
    xl: 'py-24 md:py-32',
  }

  return (
    <section
      id={id}
      className={`relative overflow-hidden ${paddingClasses[padding]} ${className}`}
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blood-700/20 rounded-full blur-[150px] pointer-events-none" />
      <Container maxWidth={maxWidth} className="relative z-10">{children}</Container>
    </section>
  )
}

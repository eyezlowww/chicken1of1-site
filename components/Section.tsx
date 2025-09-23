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
  const backgroundClasses = {
    default: 'bg-dark-950',
    darker: 'bg-dark-900',
    gradient: 'bg-gradient-to-b from-dark-950 to-dark-900',
  }

  const paddingClasses = {
    sm: 'py-8 md:py-12',
    md: 'py-12 md:py-16',
    lg: 'py-16 md:py-24',
    xl: 'py-24 md:py-32',
  }

  return (
    <section
      id={id}
      className={`${backgroundClasses[background]} ${paddingClasses[padding]} ${className}`}
    >
      <Container maxWidth={maxWidth}>{children}</Container>
    </section>
  )
}
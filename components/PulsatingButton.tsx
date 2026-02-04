'use client'

import React from 'react'
import Link from 'next/link'

interface PulsatingButtonProps {
  children: React.ReactNode
  href: string
  pulseColor?: string
  duration?: string
  className?: string
  external?: boolean
}

export default function PulsatingButton({
  children,
  href,
  pulseColor = '185, 28, 28',
  duration = '1.5s',
  className = '',
  external = false,
}: PulsatingButtonProps) {
  const baseClasses = `relative flex cursor-pointer items-center justify-center rounded-lg px-4 py-2 text-center ${className}`

  const style = {
    '--pulse-color': pulseColor,
    '--duration': duration,
  } as React.CSSProperties

  const inner = (
    <>
      <div className="relative z-10">{children}</div>
      <div className="absolute left-1/2 top-1/2 size-full -translate-x-1/2 -translate-y-1/2 animate-btn-pulse rounded-lg bg-inherit" />
    </>
  )

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={baseClasses} style={style}>
        {inner}
      </a>
    )
  }

  return (
    <Link href={href} className={baseClasses} style={style}>
      {inner}
    </Link>
  )
}

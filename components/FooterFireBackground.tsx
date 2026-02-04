'use client'

import dynamic from 'next/dynamic'

const SparksDrifting = dynamic(() => import('./SparksDrifting'), {
  ssr: false,
})

export default function FooterFireBackground() {
  return (
    <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
      <SparksDrifting
        speed={0.7}
        sparkSize={0.8}
        fireIntensity={0.8}
        smokeIntensity={0.6}
      />
    </div>
  )
}

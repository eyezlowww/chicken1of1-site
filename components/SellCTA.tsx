'use client'

import Link from 'next/link'
import Container from './Container'
import RotatingText from './RotatingText'

export default function SellCTA() {
  return (
    <section className="relative py-16 md:py-20 overflow-hidden bg-[#0a0a0a]">
      {/* Red glow behind CTA */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blood-700/15 rounded-full blur-[100px] animate-pulse-glow" />
      <div className="absolute inset-0 cage-pattern opacity-20" />
      <Container className="relative z-10">
        <div className="text-center max-w-3xl mx-auto scroll-animate">
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-white uppercase tracking-tight mb-4 flex items-center justify-center gap-3 flex-wrap">
            <span>Got</span>
            <RotatingText
              texts={['Wax', 'Boxes', 'Cases', 'Packs', 'Slabs']}
              mainClassName="px-3 sm:px-4 md:px-5 bg-blood-600 text-white overflow-hidden py-1 md:py-2 justify-center rounded-lg"
              staggerFrom="last"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-120%' }}
              staggerDuration={0.025}
              splitLevelClassName="overflow-hidden pb-1 md:pb-1"
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              rotationInterval={2000}
            />
            <span>?</span>
          </h2>
          <p className="text-lg text-cage-300 mb-8">
            We buy sealed UFC, wrestling, and combat sports product. Get a fair offer with no games.
          </p>
          <Link href="/sell-to-us" className="btn-primary text-lg px-10 py-4 animate-cta-pulse">
            Sell Your Boxes
          </Link>
        </div>
      </Container>
    </section>
  )
}

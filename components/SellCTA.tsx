import Link from 'next/link'
import Container from './Container'

export default function SellCTA() {
  return (
    <section className="relative py-16 md:py-20 overflow-hidden bg-[#0a0a0a]">
      {/* Red glow behind CTA */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blood-700/15 rounded-full blur-[100px] animate-pulse-glow" />
      <div className="absolute inset-0 cage-pattern opacity-20" />
      <Container className="relative z-10">
        <div className="text-center max-w-3xl mx-auto scroll-animate">
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-white uppercase tracking-tight mb-4">
            Got Boxes?
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

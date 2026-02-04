'use client'

import Link from 'next/link'
import Image from 'next/image'
import Container from './Container'
import GradientText from './GradientText'

export default function HeroFight() {
  return (
    <section className="relative pt-12 pb-24 md:pt-16 md:pb-32 lg:pt-20 lg:pb-40 overflow-hidden bg-[#0a0a0a]">
      {/* Blood-red arena spotlight glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blood-700/20 rounded-full blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] bg-blood-600/10 rounded-full blur-[100px] animate-pulse-glow animation-delay-500" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-blood-600/10 rounded-full blur-[100px] animate-pulse-glow animation-delay-300" />

      {/* Subtle cage mesh overlay */}
      <div className="absolute inset-0 cage-pattern opacity-30" />

      <Container className="relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Large logo - no octagon frame */}
          <div className="mb-8 flex justify-center animate-scale-in">
            <Image
              src="/logo-chicken1of1.svg"
              alt="Chicken1of1 Logo"
              width={200}
              height={200}
              className="w-[150px] h-[150px] md:w-[180px] md:h-[180px] lg:w-[200px] lg:h-[200px] drop-shadow-[0_0_30px_rgba(185,28,28,0.3)]"
              priority
            />
          </div>

          <div className="animate-fade-in-up animation-delay-200">
            <GradientText
              colors={['#b91c1c', '#eab308', '#ffffff', '#eab308', '#b91c1c']}
              animationSpeed={7}
              direction="horizontal"
              className="font-heading text-5xl md:text-7xl lg:text-8xl font-bold uppercase tracking-tight mb-4"
            >
              Bauk Bauk Baby!
            </GradientText>
          </div>

          <p className="text-xl md:text-2xl text-cage-300 mb-2 font-medium animate-fade-in-up animation-delay-300">
            Sports Cards & Live Breaks
          </p>
          <p className="text-lg text-cage-400 mb-10 max-w-2xl mx-auto animate-fade-in-up animation-delay-400">
            Thank you for stopping by. Take a look around and let us know if you have any questions. BAUK BAUK BABY!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up animation-delay-500">
            <Link
              href={process.env.NEXT_PUBLIC_WHATNOT_URL || 'https://www.whatnot.com/s/muoENH2W'}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-center min-w-[200px] animate-cta-pulse"
            >
              Watch Live
            </Link>
            <Link href="/sell-to-us" className="btn-outline text-center min-w-[200px]">
              Sell Your Boxes
            </Link>
          </div>
        </div>
      </Container>
    </section>
  )
}

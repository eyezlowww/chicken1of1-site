import Link from 'next/link'
import Image from 'next/image'
import CTAButtons from './CTAButtons'
import Container from './Container'

interface HeroProps {
  title?: string
  subtitle?: string
  description?: string
  showCTA?: boolean
  backgroundImage?: string
}

export default function Hero({
  title = 'Chicken1of1',
  subtitle = 'Sports Cards & Live Breaks',
  description = 'Thank you for stopping by. Take a look around and let us know if you have any questions. BAUK BAUK BABY!',
  showCTA = true,
  backgroundImage,
}: HeroProps) {
  return (
    <section className="relative py-24 md:py-32 lg:py-40 overflow-hidden">
      {backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-950/80 via-dark-950/60 to-dark-950" />

      <Container className="relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Large Brand Logo */}
          <div className="mb-8">
            <Image
              src="/logo-chicken1of1.svg"
              alt="Chicken1of1 Logo"
              width={120}
              height={120}
              className="mx-auto h-20 w-20 md:h-24 md:w-24 lg:h-28 lg:w-28 drop-shadow-lg"
              priority
            />
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 text-shadow">
            {title}
          </h1>
          <p className="text-xl md:text-2xl lg:text-3xl text-gray-300 mb-4 font-medium">
            {subtitle}
          </p>
          <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            {description}
          </p>

          {showCTA && <CTAButtons />}
        </div>
      </Container>
    </section>
  )
}
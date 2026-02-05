import HeroFight from '@/components/HeroFight'
import Section from '@/components/Section'
import GalleryGrid from '@/components/GalleryGrid'
import ReviewsSection from '@/components/ReviewsSection'
import SellCTA from '@/components/SellCTA'
import CommunityHub from '@/components/CommunityHub'
import Link from 'next/link'

const bigHits = [
  {
    image: '/gallery/hit-1.jpg',
    alt: 'Jake Paul 1 of 1 Superfractor Auto',
    title: 'Jake Paul 1/1 Superfractor Auto',
    description: "Jake Paul's first ever boxing card - a 1 of 1 Superfractor Autograph from 2024 Topps Chrome Boxing.",
  },
  {
    image: '/gallery/hit-2.jpg',
    alt: 'The Rock Finest Masters Inscription Auto',
    title: 'The Rock Finest Masters Inscription Auto 1/25',
    description: "The Rock's 2025 Topps Finest WWE Finest Masters Inscription Auto numbered to 25.",
  },
  {
    image: '/gallery/hit-3.jpg',
    alt: 'Payton Talbott 1/1 Padparadscha Auto',
    title: 'Payton Talbott 1/1 Padparadscha Auto',
    description: "Payton Talbott's 2025 Topps Chrome Sapphire 1/1 Padparadscha Auto from the debut UFC Sapphire set.",
  },
  {
    image: '/gallery/hit-4.jpg',
    alt: 'Max Holloway Sapphire Selections Orange',
    title: 'Max Holloway Sapphire Selections Orange /25',
    description: "Max Holloway's 2025 Topps Chrome Sapphire Selections Orange numbered to 25.",
  },
  {
    image: '/gallery/hit-5.jpg',
    alt: 'Jon Jones Rookie Auto Blue Ink',
    title: 'Jon Jones Rookie Auto Blue Ink',
    description: "Jon Jones' first ever rookie autograph from 2009 Topps Round 2.",
  },
  {
    image: '/gallery/hit-6.jpg',
    alt: 'Anderson Silva Blue Ink Auto',
    title: 'Anderson Silva Blue Ink Auto',
    description: "Anderson Silva's Blue Ink Auto from 2009 Topps Round 1 - the first ever licensed Topps UFC product.",
  },
]

export default function HomePage() {
  return (
    <>
      <HeroFight />

      <SellCTA />

      {/* Featured Hits */}
      <Section id="big-hits">
        <div className="text-center mb-12 scroll-animate">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white uppercase tracking-tight mb-4">
            Recent Hits to Bauk About
          </h2>
          <p className="text-lg text-cage-400 max-w-2xl mx-auto">
            Check out some of the Topps UFC and MMA sports cards we have pulled in our live breaks.
          </p>
        </div>
        <GalleryGrid items={bigHits} />
        <div className="text-center mt-8 scroll-animate">
          <Link href="/gallery" className="btn-outline">
            View Full Gallery
          </Link>
        </div>
      </Section>

      {/* Reviews */}
      <ReviewsSection />

      <CommunityHub />

      {/* Bottom CTA */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-blood-700/10 rounded-full blur-[100px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto scroll-animate">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white uppercase tracking-tight mb-4">
              Ready to Bauk With Us?
            </h2>
            <p className="text-lg text-cage-400 mb-8">
              Join us live on Whatnot for UFC card breaks featuring Topps UFC and Panini MMA sports cards.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/live" className="btn-primary animate-cta-pulse">
                Watch Live Now
              </Link>
              <Link href="/faq" className="btn-outline">
                Learn About Breaks
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

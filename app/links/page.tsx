import type { Metadata } from 'next'
import Container from '@/components/Container'
import Section from '@/components/Section'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Links & Resources - Chicken1of1 Partners',
  description:
    'Find all Chicken1of1 platforms and recommended collector resources. Watch live on Whatnot, follow on Instagram, and discover tools for card pricing, checklists, and UFC news.',
  openGraph: {
    type: 'website',
    title: 'Links & Resources - Chicken1of1 Partners',
    description:
      'Find all Chicken1of1 platforms and recommended collector resources for UFC card collecting.',
    url: 'https://www.chicken1of1.com/links/',
    siteName: 'Chicken1of1',
    images: [
      {
        url: 'https://www.chicken1of1.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Chicken1of1 Links & Resources',
      },
    ],
  },
}

const collectorResources = [
  {
    title: '130point',
    description: 'The go-to resource for sports card pricing and market data. Essential for comping cards before buying or selling.',
    url: 'https://www.130point.com',
    buttonText: 'Check Card Prices',
    tag: 'Price Research',
    image: '/partners/130point.png',
  },
  {
    title: 'Card Ladder',
    description: 'Track card prices over time and manage your collection portfolio. Great for monitoring market trends.',
    url: 'https://www.cardladder.com',
    buttonText: 'Track Prices',
    tag: 'Portfolio Tracking',
    image: '/partners/Cardladder.png',
  },
  {
    title: 'Checklist Insider',
    description: 'Comprehensive sports card checklists and set information. Know exactly what cards exist in every product.',
    url: 'https://www.checklistinsider.com',
    buttonText: 'View Checklists',
    tag: 'Product Checklists',
    image: '/partners/checklist-insider.png',
  },
  {
    title: 'MMA Rookies',
    description: 'The premier source for UFC card collecting news, fighter profiles, rookie checklists, and MMA card market analysis.',
    url: 'https://www.mmarookies.com',
    buttonText: 'UFC Card News',
    tag: 'UFC News',
    image: '/partners/mma-rookies.png',
  },
]

export default function LinksPage() {
  return (
    <>
      <section className="relative py-20 md:py-28 overflow-hidden bg-[#0a0a0a]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blood-700/15 rounded-full blur-[120px]" />
        <div className="absolute inset-0 cage-pattern opacity-20" />
        <Container className="relative z-10">
          <div className="text-center max-w-3xl mx-auto animate-fade-in-up">
            <h1 className="font-heading text-4xl md:text-6xl font-bold text-white uppercase tracking-tight mb-4">
              Links & Resources
            </h1>
            <p className="text-xl text-cage-300">Our Platforms & Collector Tools</p>
          </div>
        </Container>
      </section>

      {/* Collector Resources */}
      <Section>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 scroll-animate">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-white uppercase tracking-tight mb-4">
              Collector Resources
            </h2>
            <p className="text-cage-400 max-w-2xl mx-auto">
              Tools and resources we recommend for UFC card collectors. These sites help with pricing, checklists, and staying up to date on the hobby.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 stagger-children">
            {collectorResources.map((resource) => (
              <a
                key={resource.title}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-black rounded-xl border border-cage-700/50 overflow-hidden transition-all duration-300 hover:border-gold-500/30 hover:shadow-[0_0_20px_rgba(185,28,28,0.1)] scroll-animate group"
              >
                <div className="relative w-full h-40 overflow-hidden">
                  <Image
                    src={resource.image}
                    alt={`${resource.title} preview`}
                    fill
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-heading text-lg font-bold text-gold-400 uppercase">
                      {resource.title}
                    </h3>
                    <span className="text-[10px] text-cage-400 font-semibold uppercase tracking-wider bg-cage-800 px-2 py-1 rounded-full">
                      {resource.tag}
                    </span>
                  </div>
                  <p className="text-cage-300 mb-4 text-sm leading-relaxed">
                    {resource.description}
                  </p>
                  <span className="inline-flex items-center gap-2 text-gold-400 group-hover:text-gold-300 text-sm font-medium transition-colors">
                    {resource.buttonText}
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </Section>

      {/* Why These Resources */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blood-700/10 rounded-full blur-[150px]" />
        <Container className="relative z-10">
          <div className="text-center max-w-3xl mx-auto scroll-animate">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-white uppercase tracking-tight mb-4">
              Why We Recommend These
            </h2>
            <p className="text-cage-400 mb-8">
              These are the tools we actually use. Whether you&apos;re pricing cards before a sale, checking what parallels exist in a product, or keeping up with UFC fighter news that affects card values - these resources have you covered.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl font-heading font-bold text-gold-400 mb-1">Price</div>
                <div className="text-xs text-cage-500 uppercase tracking-wider">Research</div>
              </div>
              <div>
                <div className="text-2xl font-heading font-bold text-gold-400 mb-1">Track</div>
                <div className="text-xs text-cage-500 uppercase tracking-wider">Portfolio</div>
              </div>
              <div>
                <div className="text-2xl font-heading font-bold text-gold-400 mb-1">Learn</div>
                <div className="text-xs text-cage-500 uppercase tracking-wider">Products</div>
              </div>
              <div>
                <div className="text-2xl font-heading font-bold text-gold-400 mb-1">News</div>
                <div className="text-xs text-cage-500 uppercase tracking-wider">Updates</div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Bottom CTA */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-blood-700/10 rounded-full blur-[100px]" />
        <Container className="relative z-10">
          <div className="text-center max-w-3xl mx-auto scroll-animate">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-white uppercase tracking-tight mb-4">
              Join the Coop
            </h2>
            <p className="text-cage-400 mb-8">
              Follow us on Whatnot and Instagram to catch live breaks, hit showcases, and community vibes. Bauk Bauk Baby!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={process.env.NEXT_PUBLIC_WHATNOT_URL || 'https://www.whatnot.com/user/chicken1of1'}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                Watch on Whatnot
              </a>
              <Link href="/faq" className="btn-outline">
                Learn About Breaks
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}

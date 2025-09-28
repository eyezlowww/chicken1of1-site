import type { Metadata } from 'next'
import Hero from '@/components/Hero'
import Section from '@/components/Section'
import GalleryGrid from '@/components/GalleryGrid'

export const metadata: Metadata = {
  title: 'Gallery - Big Hits & Card Pulls | Chicken1of1',
  description:
    'Check out our gallery of epic UFC card pulls, autographs, patches, and rare hits from live breaks. See what Chicken1of1 has pulled recently.',
}

const galleryItems = [
  {
    image: '/gallery/hit-1.jpg',
    alt: 'Jake Paul 1 of 1 Superfractor Auto',
    title: 'Jake Paul 1/1 Superfractor Auto',
    description: 'Jake Paul\'s first ever boxing card - a 1 of 1 Superfractor Autograph from 2025 Topps Chrome Boxing. Historic pull from Topps\' first boxing product in 74 years, pulled live on Chicken1of1 Whatnot!',
  },
  {
    image: '/gallery/hit-2.jpg',
    alt: 'Autograph Card',
    title: 'Autograph Hit',
    description: 'Signed card from championship fighter',
  },
  {
    image: '/gallery/hit-3.jpg',
    alt: 'Patch Card',
    title: 'Patch Card',
    description: 'Game-worn patch from title fight',
  },
  {
    image: '/gallery/hit-4.jpg',
    alt: 'Championship Card',
    title: 'Championship Card',
    description: 'Title fight commemorative card',
  },
  {
    image: '/gallery/hit-5.jpg',
    alt: 'Parallel Card',
    title: 'Rare Parallel',
    description: 'Low-numbered gold parallel /25',
  },
  {
    image: '/gallery/hit-6.jpg',
    alt: 'Base Card',
    title: 'Clean Base Hit',
    description: 'Perfect centering base card',
  },
  {
    image: '/gallery/hit-7.jpg',
    alt: 'Insert Card',
    title: 'Special Insert',
    description: 'Rare insert from premium set',
  },
  {
    image: '/gallery/hit-8.jpg',
    alt: 'Numbered Card',
    title: 'Numbered Hit',
    description: 'Serial numbered card /99',
  },
  {
    image: '/gallery/hit-9.jpg',
    alt: 'Prizm Card',
    title: 'Prizm Refractor',
    description: 'Silver prizm refractor',
  },
  {
    image: '/gallery/hit-10.jpg',
    alt: 'Topps Chrome',
    title: 'Chrome Hit',
    description: 'Topps Chrome UFC card',
  },
  {
    image: '/gallery/hit-11.jpg',
    alt: 'Panini Card',
    title: 'Panini Special',
    description: 'Panini exclusive design',
  },
  {
    image: '/gallery/hit-12.jpg',
    alt: 'Dual Auto',
    title: 'Dual Autograph',
    description: 'Two-fighter autograph card',
  },
]

export default function GalleryPage() {
  return (
    <>
      <Hero
        title="Big Hits Gallery"
        subtitle="Epic Pulls from Recent Breaks"
        description="Check out the amazing cards we've pulled in our live UFC breaks"
        showCTA={false}
      />

      <Section>
        <div className="mb-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Recent Pulls
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Every card shown here was pulled live on stream with full
            transparency. No staged pulls, just authentic breaking action.
          </p>
        </div>

        <GalleryGrid items={galleryItems} columns={3} />

        <div className="mt-16 text-center">
          <div className="card max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-white mb-4">
              Want to See These Pulls Live?
            </h3>
            <p className="text-gray-300 mb-6">
              Join us on Whatnot and Fanatics Live for authentic UFC card breaks.
              Every break is streamed live with full transparency.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={
                  process.env.NEXT_PUBLIC_WHATNOT_URL ||
                  'https://www.whatnot.com/s/muoENH2W'
                }
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                Watch on Whatnot
              </a>
              <a
                href={
                  process.env.NEXT_PUBLIC_FANATICS_URL ||
                  'https://www.fanatics.live/shops/chicken1of1'
                }
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline"
              >
                Fanatics Live
              </a>
            </div>
          </div>
        </div>
      </Section>

      <Section background="darker">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Follow for Daily Hits
          </h2>
          <p className="text-lg text-gray-400 mb-8">
            Get daily updates on our biggest pulls and break announcements on
            Instagram. Don&apos;t miss the next epic hit!
          </p>
          <a
            href={
              process.env.NEXT_PUBLIC_INSTAGRAM_URL ||
              'https://www.instagram.com/chicken1of1'
            }
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                d="M12.017 0C8.396 0 7.929.01 6.71.048 5.493.087 4.73.222 4.058.42a5.916 5.916 0 0 0-2.134 1.388A5.916 5.916 0 0 0 .536 4.058C.338 4.73.203 5.493.164 6.71.126 7.929.116 8.396.116 12.017c0 3.622.01 4.09.048 5.309.039 1.217.174 1.98.372 2.652a5.916 5.916 0 0 0 1.388 2.134 5.916 5.916 0 0 0 2.134 1.388c.672.198 1.435.333 2.652.372 1.219.038 1.687.048 5.309.048 3.622 0 4.09-.01 5.309-.048 1.217-.039 1.98-.174 2.652-.372a5.916 5.916 0 0 0 2.134-1.388 5.916 5.916 0 0 0 1.388-2.134c.198-.672.333-1.435.372-2.652.038-1.219.048-1.687.048-5.309 0-3.622-.01-4.09-.048-5.309-.039-1.217-.174-1.98-.372-2.652a5.916 5.916 0 0 0-1.388-2.134A5.916 5.916 0 0 0 19.326.536C18.654.338 17.891.203 16.674.164 15.455.126 14.988.116 11.366.116L12.017 0zm-.132 2.183c3.549 0 3.97.014 5.378.052 1.297.059 2.001.276 2.469.458.621.241 1.065.53 1.531.995.464.466.754.91.995 1.531.182.468.399 1.172.458 2.469.038 1.408.052 1.829.052 5.378 0 3.549-.014 3.97-.052 5.378-.059 1.297-.276 2.001-.458 2.469a4.126 4.126 0 0 1-.995 1.531 4.126 4.126 0 0 1-1.531.995c-.468.182-1.172.399-2.469.458-1.408.038-1.829.052-5.378.052-3.549 0-3.97-.014-5.378-.052-1.297-.059-2.001-.276-2.469-.458a4.126 4.126 0 0 1-1.531-.995 4.126 4.126 0 0 1-.995-1.531c-.182-.468-.399-1.172-.458-2.469-.038-1.408-.052-1.829-.052-5.378 0-3.549.014-3.97.052-5.378.059-1.297.276-2.001.458-2.469.241-.621.53-1.065.995-1.531a4.126 4.126 0 0 1 1.531-.995c.468-.182 1.172-.399 2.469-.458 1.408-.038 1.829-.052 5.378-.052z"
                clipRule="evenodd"
              />
              <path
                fillRule="evenodd"
                d="M12.017 5.838a6.18 6.18 0 1 0 0 12.36 6.18 6.18 0 0 0 0-12.36zM12.017 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"
                clipRule="evenodd"
              />
              <circle cx="18.406" cy="5.594" r="1.44" />
            </svg>
            <span>Follow on Instagram</span>
          </a>
        </div>
      </Section>
    </>
  )
}
import type { Metadata } from 'next'
import Container from '@/components/Container'
import Section from '@/components/Section'
import GalleryGrid from '@/components/GalleryGrid'

export const metadata: Metadata = {
  title: 'Gallery - Topps UFC & MMA Sports Card Pulls | Chicken1of1',
  description:
    'Check out our gallery of epic UFC card pulls from Topps UFC and Panini MMA sports cards. See autographs, patches, and rare hits from our live UFC card breaks.',
}

const galleryItems = [
  {
    image: '/gallery/hit-1.jpg',
    alt: 'Jake Paul 1 of 1 Superfractor Auto',
    title: 'Jake Paul 1/1 Superfractor Auto',
    description: 'Jake Paul\'s first ever boxing card - a 1 of 1 Superfractor Autograph from 2024 Topps Chrome Boxing. Historic pull from Topps\' first boxing product in 74 years, pulled live on Chicken1of1 Whatnot!',
  },
  {
    image: '/gallery/hit-2.jpg',
    alt: 'The Rock Finest Masters Inscription Auto',
    title: 'The Rock Finest Masters Inscription Auto 1/25',
    description: 'The Rock\'s 2025 Topps Finest WWE Finest Masters Inscription Auto numbered to 25. Features his most memorable catchphrase inscribed on the card. One of the featured cards from this set, pulled live on Chicken1of1\'s Whatnot channel!',
  },
  {
    image: '/gallery/hit-3.jpg',
    alt: 'Payton Talbott 1/1 Padparadscha Auto',
    title: 'Payton Talbott 1/1 Padparadscha Auto',
    description: 'Payton Talbott\'s 2025 Topps Chrome Sapphire 1/1 Padparadscha Auto from the debut UFC Sapphire set. One of the biggest rookies in the current class with an on-card auto featuring a penguin he drew. Collectors love the Padparadscha 1/1s from this premium product, pulled live on Chicken1of1\'s Whatnot channel!',
  },
  {
    image: '/gallery/hit-4.jpg',
    alt: 'Max Holloway Sapphire Selections Orange',
    title: 'Max Holloway Sapphire Selections Orange /25',
    description: 'Max Holloway\'s 2025 Topps Chrome Sapphire Selections Orange numbered to 25. The first UFC Sapphire Selections insert - the most loved insert among all Sapphire products. A beautiful card featuring one of the legends of the UFC, pulled live on Chicken1of1\'s Whatnot channel!',
  },
  {
    image: '/gallery/hit-5.jpg',
    alt: 'Jon Jones Rookie Auto Blue Ink',
    title: 'Jon Jones Rookie Auto Blue Ink',
    description: 'Jon Jones\' first ever rookie autograph from 2009 Topps Round 2 - the 2nd ever Topps UFC product. The blue ink is the base auto, with red ink versions /25 and patch autos /25 being his only other rookie autos that exist. Historic piece from the UFC GOAT, pulled live on Chicken1of1\'s Whatnot channel!',
  },
  {
    image: '/gallery/hit-6.jpg',
    alt: 'Anderson Silva Blue Ink Auto',
    title: 'Anderson Silva Blue Ink Auto',
    description: 'Anderson Silva\'s Blue Ink Auto from 2009 Topps Round 1 - the first ever licensed Topps UFC product where everyone is an official Topps UFC rookie. Rumored to only have 500 cases made, making any blue ink or red ink /25 auto a huge deal, especially with so few unopened boxes remaining. Historic rookie from the debut set, pulled live on Chicken1of1\'s Whatnot channel!',
  },
]

export default function GalleryPage() {
  return (
    <>
      <section className="relative py-20 md:py-28 overflow-hidden bg-[#0a0a0a]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blood-700/15 rounded-full blur-[120px]" />
        <div className="absolute inset-0 cage-pattern opacity-20" />
        <Container className="relative z-10">
          <div className="text-center max-w-3xl mx-auto animate-fade-in-up">
            <h1 className="font-heading text-4xl md:text-6xl font-bold text-white uppercase tracking-tight mb-4">
              UFC Card Pulls Gallery
            </h1>
            <p className="text-xl text-cage-300">Epic Topps UFC & MMA Sports Card Hits</p>
          </div>
        </Container>
      </section>

      <Section>
        <div className="mb-12 text-center scroll-animate">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-white uppercase tracking-tight mb-4">
            Recent Pulls
          </h2>
          <p className="text-lg text-cage-400 max-w-2xl mx-auto">
            Every card shown here was pulled live on stream with full
            transparency. No staged pulls, just authentic breaking action.
          </p>
        </div>

        <GalleryGrid items={galleryItems} columns={3} />

        <div className="mt-16 text-center scroll-animate">
          <div className="card max-w-2xl mx-auto">
            <h3 className="text-xl font-heading font-semibold text-white uppercase tracking-wide mb-4">
              Want to See These Pulls Live?
            </h3>
            <p className="text-cage-300 mb-6">
              Join us on Whatnot for authentic UFC card breaks featuring Topps UFC and Panini MMA sports cards.
              Every break is streamed live with full transparency.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={process.env.NEXT_PUBLIC_WHATNOT_URL || 'https://www.whatnot.com/s/muoENH2W'}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                Watch on Whatnot
              </a>
              <a
                href={process.env.NEXT_PUBLIC_INSTAGRAM_URL || 'https://www.instagram.com/chicken1of1'}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline"
              >
                Follow on Instagram
              </a>
            </div>
          </div>
        </div>
      </Section>

      <Section>
        <div className="text-center max-w-3xl mx-auto scroll-animate">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white uppercase tracking-tight mb-4">
            Follow for Daily Hits
          </h2>
          <p className="text-lg text-cage-400 mb-8">
            Get daily updates on our biggest pulls and break announcements on
            Instagram. Don&apos;t miss the next epic hit!
          </p>
          <a
            href={process.env.NEXT_PUBLIC_INSTAGRAM_URL || 'https://www.instagram.com/chicken1of1'}
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

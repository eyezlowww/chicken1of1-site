import type { Metadata } from 'next'
import Hero from '@/components/Hero'
import Section from '@/components/Section'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Links - Chicken1of1 UFC Card Breaking Platforms',
  description:
    'Find all our platforms in one place. Watch live on Whatnot, follow on Instagram, shop Fanatics Live, and visit MMA Rookies for UFC news.',
}

const linkCards = [
  {
    title: 'MMA Rookies',
    description: 'Latest UFC news, fighter profiles, and fight analysis',
    url: process.env.NEXT_PUBLIC_MMAROOKIES_URL || 'https://www.mmarookies.com',
    buttonText: 'Visit MMA Rookies',
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
    color: 'bg-blue-600 hover:bg-blue-700',
  },
  {
    title: 'Whatnot Profile',
    description: 'Watch live UFC card breaks and join the community',
    url:
      process.env.NEXT_PUBLIC_WHATNOT_URL ||
      'https://www.whatnot.com/s/muoENH2W',
    buttonText: 'Watch on Whatnot',
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    color: 'bg-purple-600 hover:bg-purple-700',
  },
  {
    title: 'Instagram',
    description: 'Daily hit posts, break announcements, and behind the scenes',
    url:
      process.env.NEXT_PUBLIC_INSTAGRAM_URL ||
      'https://www.instagram.com/chicken1of1',
    buttonText: 'Follow @chicken1of1',
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
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
    ),
    color: 'bg-pink-600 hover:bg-pink-700',
  },
  {
    title: 'Fanatics Live Shop',
    description: 'Browse our Fanatics Live shop for exclusive breaks',
    url:
      process.env.NEXT_PUBLIC_FANATICS_URL ||
      'https://www.fanatics.live/shops/chicken1of1',
    buttonText: 'Shop Fanatics Live',
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z" />
        <path d="M9 8V17H11V8H9ZM13 8V17H15V8H13Z" />
      </svg>
    ),
    color: 'bg-green-600 hover:bg-green-700',
  },
]

export default function LinksPage() {
  return (
    <>
      <Hero
        title="All Our Links"
        subtitle="Find Us Everywhere"
        description="Connect with Chicken1of1 across all platforms and stay updated on breaks"
        showCTA={false}
      />

      <Section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {linkCards.map((card, index) => (
            <div key={index} className="card">
              <div className="flex items-center mb-4">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${card.color.split(' ')[0]} text-white`}
                >
                  {card.icon}
                </div>
                <h3 className="text-xl font-semibold text-white">
                  {card.title}
                </h3>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                {card.description}
              </p>
              <Link
                href={card.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`btn w-full justify-center text-white ${card.color}`}
              >
                {card.buttonText}
              </Link>
            </div>
          ))}
        </div>
      </Section>

      <Section background="darker">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Never Miss a Break
          </h2>
          <p className="text-lg text-gray-400 mb-8">
            Follow us on multiple platforms to stay updated on break schedules,
            big hits, and UFC card news. Bauk Bauk Baby!
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-400 mb-1">
                Live
              </div>
              <div className="text-sm text-gray-400">Whatnot & Fanatics</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-400 mb-1">
                Daily
              </div>
              <div className="text-sm text-gray-400">Instagram Posts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-400 mb-1">
                News
              </div>
              <div className="text-sm text-gray-400">MMA Rookies</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-400 mb-1">
                Direct
              </div>
              <div className="text-sm text-gray-400">DM for Questions</div>
            </div>
          </div>
        </div>
      </Section>
    </>
  )
}
import Link from 'next/link'
import Image from 'next/image'
import Container from './Container'
import IphoneMockup from './IphoneMockup'

const platforms = [
  {
    name: 'Whatnot',
    description: 'Watch live UFC card breaks and join the action',
    url: process.env.NEXT_PUBLIC_WHATNOT_URL || 'https://www.whatnot.com/s/muoENH2W',
    color: 'from-purple-600 to-purple-800',
    icon: (
      <Image src="/whatnot-logo.png" alt="Whatnot" width={28} height={28} className="rounded" />
    ),
  },
  {
    name: 'Instagram',
    description: 'Daily hit posts, break announcements, and behind the scenes',
    url: process.env.NEXT_PUBLIC_INSTAGRAM_URL || 'https://www.instagram.com/chicken1of1',
    color: 'from-pink-600 to-orange-600',
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
]

export default function CommunityHub() {
  return (
    <section className="py-16 md:py-24 bg-[#0a0a0a]">
      <Container>
        <div className="text-center mb-12 scroll-animate">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white uppercase tracking-tight mb-4">
            Join The Coop
          </h2>
          <p className="text-lg text-cage-400 max-w-2xl mx-auto">
            Find us across platforms for live breaks, hit showcases, and community vibes.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-12 max-w-5xl mx-auto">
          {/* iPhone Mockup with Instagram */}
          <div className="w-full lg:w-1/2 flex justify-center scroll-animate">
            <Link
              href={process.env.NEXT_PUBLIC_INSTAGRAM_URL || 'https://www.instagram.com/chicken1of1'}
              target="_blank"
              rel="noopener noreferrer"
              className="w-[260px] md:w-[300px] block hover:scale-[1.02] transition-transform duration-300"
            >
              <IphoneMockup src="/instagram-screenshot.jpg" />
              <p className="text-center text-sm text-cage-400 mt-4">
                Tap to visit <span className="text-gold-400 font-medium">@chicken1of1</span> on Instagram
              </p>
            </Link>
          </div>

          {/* Platform Cards */}
          <div className="w-full lg:w-1/2 space-y-6 stagger-children">
            {platforms.map((platform) => (
              <Link
                key={platform.name}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block bg-black rounded-xl border border-cage-700/50 p-6 hover:border-gold-500/30 hover:shadow-[0_0_20px_rgba(185,28,28,0.1)] transition-all duration-300 scroll-animate"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${platform.color} flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform`}>
                    {platform.icon}
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-bold text-white uppercase tracking-wide mb-1">
                      {platform.name}
                    </h3>
                    <p className="text-sm text-cage-400">{platform.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}

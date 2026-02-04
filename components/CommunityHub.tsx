import Link from 'next/link'
import Container from './Container'
import IphoneMockup from './IphoneMockup'

const phones = [
  {
    name: 'Instagram',
    handle: '@chicken1of1',
    src: '/instagram-screenshot.jpg',
    url: process.env.NEXT_PUBLIC_INSTAGRAM_URL || 'https://www.instagram.com/chicken1of1',
    objectPosition: 'top',
  },
  {
    name: 'Whatnot',
    handle: '@chicken1of1',
    src: '/whatnot-screenshot.jpg',
    url: process.env.NEXT_PUBLIC_WHATNOT_URL || 'https://www.whatnot.com/s/muoENH2W',
    objectPosition: 'left top',
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

        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 md:gap-16 max-w-4xl mx-auto">
          {phones.map((phone) => (
            <Link
              key={phone.name}
              href={phone.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-[240px] md:w-[280px] block hover:scale-[1.02] transition-transform duration-300 scroll-animate"
            >
              <IphoneMockup src={phone.src} objectPosition={phone.objectPosition} />
              <p className="text-center text-sm text-cage-400 mt-4">
                Tap to visit <span className="text-gold-400 font-medium">{phone.handle}</span> on {phone.name}
              </p>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  )
}

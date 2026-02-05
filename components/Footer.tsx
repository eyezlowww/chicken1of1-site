import Link from 'next/link'
import Image from 'next/image'
import Container from './Container'
import SocialBar from './SocialBar'
import FooterFireBackground from './FooterFireBackground'

const navigation = {
  main: [
    { name: 'About', href: '/about' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Live', href: '/live' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Contact', href: '/contact' },
    { name: 'Sell To Us', href: '/sell-to-us' },
  ],
  legal: [
    { name: 'Terms of Service', href: '/legal/terms' },
    { name: 'Privacy Policy', href: '/legal/privacy' },
  ],
}

const partnerResources = [
  {
    name: '130point',
    href: 'https://www.130point.com',
    description: 'The premiere destination to check current comps for your cards according to sales from eBay, Fanatics Collect, and more.',
    image: '/partners/130point.png',
  },
  {
    name: 'Card Ladder',
    href: 'https://www.cardladder.com',
    description: 'Track card prices over time and manage your collection portfolio with detailed market analytics.',
    image: '/partners/Cardladder.png',
  },
  {
    name: 'Checklist Insider',
    href: 'https://www.checklistinsider.com',
    description: 'The most comprehensive sports card checklists. Know exactly what cards exist before you break.',
    image: '/partners/checklist-insider.png',
  },
  {
    name: 'MMA Rookies',
    href: 'https://www.mmarookies.com',
    description: 'The premier source for UFC card collecting news, fighter profiles, and MMA rookie checklists.',
    image: '/partners/mma-rookies.png',
  },
]

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative bg-[#0a0a0a] border-t border-white/10 overflow-hidden" role="contentinfo">
      {/* Animated fire/sparks shader background */}
      <FooterFireBackground />

      <Container className="relative z-10">
        <div className="py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <Link
                href="/"
                className="flex items-center space-x-3 mb-4"
                aria-label="Chicken1of1 - Go to homepage"
              >
                <Image
                  src="/logo-chicken1of1.svg"
                  alt="Chicken1of1 logo"
                  width={32}
                  height={32}
                  className="h-8 w-8"
                />
                <span className="text-lg font-bold text-white">
                  Chicken<span className="text-gold-400">1of1</span>
                </span>
              </Link>
              <p className="text-gray-400 mb-6 max-w-md">
                Bauk Bauk Baby — UFC & Entertainment Card Breaks. Join the Coop community for authentic breaks, card collecting education, and the best UFC card break experience.
              </p>
              <p className="text-xs text-cage-500 mt-2 font-heading uppercase tracking-wider">UFC Card Authority Since 2021</p>
              <SocialBar />
            </div>

            <nav aria-labelledby="footer-navigation">
              <h3
                id="footer-navigation"
                className="text-sm font-semibold text-white uppercase tracking-wider mb-4"
              >
                Navigation
              </h3>
              <ul className="space-y-3" role="list">
                {navigation.main.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-gray-400 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-900 rounded"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/links"
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    Links & Resources
                  </Link>
                </li>
              </ul>
            </nav>

            <nav aria-labelledby="footer-legal">
              <h3
                id="footer-legal"
                className="text-sm font-semibold text-white uppercase tracking-wider mb-4"
              >
                Legal
              </h3>
              <ul className="space-y-3" role="list">
                {navigation.legal.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-gray-400 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-900 rounded"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Partner Resources Cards */}
          <div className="mt-12 pt-8 border-t border-cage-700/30">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-6 text-center">
              Collector Resources We Recommend
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {partnerResources.map((partner) => (
                <a
                  key={partner.name}
                  href={partner.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-black rounded-xl border border-cage-700/50 overflow-hidden transition-all duration-300 hover:border-gold-500/30 hover:shadow-[0_0_20px_rgba(185,28,28,0.1)] group"
                >
                  <div className="relative w-full h-24 overflow-hidden">
                    <Image
                      src={partner.image}
                      alt={`${partner.name} preview`}
                      fill
                      className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-heading text-sm font-bold text-gold-400 uppercase">
                        {partner.name}
                      </h4>
                      <svg
                        className="w-3.5 h-3.5 text-cage-500 group-hover:text-gold-400 transition-colors"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                    <p className="text-cage-400 text-xs leading-relaxed">
                      {partner.description}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gold-500/20 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm" role="contentinfo">
              © {currentYear} Chicken1of1. All rights reserved.
            </p>
            <p className="text-gray-500 text-xs mt-2 md:mt-0">
              Not affiliated with UFC, Zuffa, Topps, Panini, Fanatics, or
              Whatnot
            </p>
          </div>
        </div>
      </Container>
    </footer>
  )
}

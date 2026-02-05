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

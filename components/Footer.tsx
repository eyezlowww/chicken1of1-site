import Link from 'next/link'
import Image from 'next/image'
import Container from './Container'
import SocialBar from './SocialBar'

const navigation = {
  main: [
    { name: 'About', href: '/about' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Live', href: '/live' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Links', href: '/links' },
    { name: 'Contact', href: '/contact' },
  ],
  legal: [
    { name: 'Terms of Service', href: '/legal/terms' },
    { name: 'Privacy Policy', href: '/legal/privacy' },
    { name: 'Shipping & Returns', href: '/legal/shipping-returns' },
  ],
}

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-dark-900 border-t border-dark-700">
      <Container>
        <div className="py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center space-x-3 mb-4">
                <Image
                  src="/logo-chicken1of1.svg"
                  alt="Chicken1of1"
                  width={32}
                  height={32}
                  className="h-8 w-8"
                />
                <span className="text-lg font-bold text-white">
                  Chicken<span className="text-primary-400">1of1</span>
                </span>
              </Link>
              <p className="text-gray-400 mb-6 max-w-md">
                Bauk Bauk Baby — UFC & Entertainment Card Breaks. Join the Coop community for authentic breaks, card collecting education, and the best UFC card break experience.
              </p>
              <SocialBar />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Navigation
              </h3>
              <ul className="space-y-3">
                {navigation.main.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Legal
              </h3>
              <ul className="space-y-3">
                {navigation.legal.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-dark-700 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
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
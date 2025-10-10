'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Nav from './Nav'
import Container from './Container'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Gallery', href: '/gallery' },
  { name: 'Live', href: '/live' },
  { name: 'FAQ', href: '/faq' },
  { name: 'Links', href: '/links' },
  { name: 'Contact', href: '/contact' },
]

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 glass border-b border-dark-700/50" role="banner">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link
              href="/"
              className="flex-shrink-0"
              aria-label="Chicken1of1 - Go to homepage"
            >
              <div className="flex items-center space-x-3">
                <Image
                  src="/logo-chicken1of1.svg"
                  alt="Chicken1of1 logo"
                  width={40}
                  height={40}
                  className="h-10 w-10"
                  priority
                />
                <span className="text-xl font-bold text-white">
                  Chicken<span className="text-primary-400">1of1</span>
                </span>
              </div>
            </Link>
          </div>

          <Nav />

          <div className="flex items-center space-x-4">
            <Link
              href="/sell-to-us"
              className="hidden sm:inline-flex btn-primary text-sm bg-yellow-400 text-black hover:bg-yellow-300"
              aria-label="Sell your UFC sealed boxes"
            >
              💰 Sell To Us
            </Link>

            <button
              type="button"
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-dark-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-950"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={mobileMenuOpen ? 'Close main menu' : 'Open main menu'}
            >
              <span className="sr-only">{mobileMenuOpen ? 'Close' : 'Open'} main menu</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav
            className="md:hidden"
            id="mobile-menu"
            role="navigation"
            aria-label="Mobile navigation"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-dark-700">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-dark-700 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-950"
                  onClick={() => setMobileMenuOpen(false)}
                  role="menuitem"
                >
                  {item.name}
                </Link>
              ))}
              <Link
                href="/sell-to-us"
                className="block px-3 py-2 text-base font-medium bg-yellow-400 text-black hover:bg-yellow-300 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-950"
                onClick={() => setMobileMenuOpen(false)}
                role="menuitem"
                aria-label="Sell your UFC sealed boxes"
              >
                💰 Sell To Us
              </Link>
            </div>
          </nav>
        )}
      </Container>
    </header>
  )
}
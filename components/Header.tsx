'use client'

import Link from 'next/link'
import PillNav from './PillNav'
import Container from './Container'

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Live', href: '/live' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' },
]

const extraMobileLinks = [
  { label: 'Sell To Us', href: '/sell-to-us' },
]

export default function Header() {
  return (
    <header className="sticky top-0 z-50 glass" role="banner">
      <Container>
        <div className="flex h-16 items-center justify-between">
          {/* PillNav takes care of logo, nav links, and mobile menu */}
          <PillNav
            logo="/logo-chicken1of1.svg"
            logoAlt="Chicken1of1 logo"
            items={navItems}
            baseColor="rgba(10, 10, 10, 0.85)"
            pillColor="#b91c1c"
            hoverCircleColor="#eab308"
            hoveredPillTextColor="#0a0a0a"
            pillTextColor="#ffffff"
            activeIndicatorColor="#eab308"
            extraMobileLinks={extraMobileLinks}
            initialLoadAnimation={true}
          />

          {/* Sell To Us CTA - desktop only, separate from pill nav */}
          <Link
            href="/sell-to-us"
            className="hidden md:inline-flex btn-primary text-sm bg-gold-500 text-dark-950 hover:bg-gold-400 font-bold font-heading uppercase tracking-wide flex-shrink-0 ml-4"
            aria-label="Sell your UFC sealed boxes"
          >
            Sell To Us
          </Link>
        </div>
      </Container>
    </header>
  )
}

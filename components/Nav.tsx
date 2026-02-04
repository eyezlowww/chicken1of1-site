'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Gallery', href: '/gallery' },
  { name: 'Live', href: '/live' },
  { name: 'FAQ', href: '/faq' },
  { name: 'Contact', href: '/contact' },
]

export default function Nav() {
  const pathname = usePathname()

  return (
    <nav className="hidden md:flex space-x-8" role="navigation" aria-label="Main navigation">
      {navigation.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={`relative px-3 py-2 text-sm font-medium transition-all duration-200 rounded-md group focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-950 ${
            pathname === item.href
              ? 'text-primary-400'
              : 'text-gray-300 hover:text-white hover:bg-white/5'
          }`}
          aria-current={pathname === item.href ? 'page' : undefined}
        >
          {item.name}
          {/* Active indicator */}
          {pathname === item.href && (
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-400 rounded-full"></span>
          )}
          {/* Hover effect */}
          <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-center"></span>
        </Link>
      ))}
    </nav>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Gallery', href: '/gallery' },
  { name: 'Live', href: '/live' },
  { name: 'FAQ', href: '/faq' },
  { name: 'Links', href: '/links' },
  { name: 'Contact', href: '/contact' },
]

export default function Nav() {
  const pathname = usePathname()

  return (
    <nav className="hidden md:flex space-x-8">
      {navigation.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={`text-sm font-medium transition-colors duration-200 hover:text-primary-400 focus:outline-none focus:text-primary-400 ${
            pathname === item.href
              ? 'text-primary-400'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          {item.name}
        </Link>
      ))}
    </nav>
  )
}
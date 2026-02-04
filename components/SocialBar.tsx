import Link from 'next/link'
import Image from 'next/image'

const socials = [
  {
    name: 'Instagram',
    href:
      process.env.NEXT_PUBLIC_INSTAGRAM_URL ||
      'https://www.instagram.com/chicken1of1',
    icon: (
      <Image src="/instagram-logo.png" alt="Instagram" width={20} height={20} className="rounded" />
    ),
  },
  {
    name: 'Whatnot',
    href:
      process.env.NEXT_PUBLIC_WHATNOT_URL ||
      'https://www.whatnot.com/s/muoENH2W',
    icon: (
      <Image src="/whatnot-logo.png" alt="Whatnot" width={20} height={20} className="rounded" />
    ),
  },
]

export default function SocialBar() {
  return (
    <div className="flex space-x-4">
      {socials.map((social) => (
        <Link
          key={social.name}
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-gold-400 transition-colors duration-200"
          aria-label={social.name}
        >
          {social.icon}
        </Link>
      ))}
    </div>
  )
}
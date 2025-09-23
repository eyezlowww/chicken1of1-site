import Link from 'next/link'

const buttons = [
  {
    text: 'Watch Live on Whatnot',
    href:
      process.env.NEXT_PUBLIC_WHATNOT_URL ||
      'https://www.whatnot.com/s/muoENH2W',
    primary: true,
    external: true,
  },
  {
    text: 'Follow on Instagram',
    href:
      process.env.NEXT_PUBLIC_INSTAGRAM_URL ||
      'https://www.instagram.com/chicken1of1',
    primary: false,
    external: true,
  },
  {
    text: 'Fanatics Live Shop',
    href:
      process.env.NEXT_PUBLIC_FANATICS_URL ||
      'https://www.fanatics.live/shops/chicken1of1',
    primary: false,
    external: true,
  },
]

export default function CTAButtons() {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
      {buttons.map((button, index) => (
        <Link
          key={index}
          href={button.href}
          target={button.external ? '_blank' : undefined}
          rel={button.external ? 'noopener noreferrer' : undefined}
          className={
            button.primary
              ? 'btn-primary text-center min-w-[200px]'
              : 'btn-outline text-center min-w-[200px]'
          }
        >
          {button.text}
        </Link>
      ))}
    </div>
  )
}
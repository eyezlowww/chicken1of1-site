import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Live UFC Card Breaks - Topps & Panini UFC & MMA Sports Cards',
  description:
    'Watch live UFC card breaks on Whatnot featuring Topps & Panini UFC and MMA sports cards. Join Chicken1of1 for authentic breaking action.',
}

export default function LiveLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

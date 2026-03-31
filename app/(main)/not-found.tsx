import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '404 - Page Not Found | Chicken1of1',
  description: 'The page you are looking for could not be found. Return to Chicken1of1 for UFC card breaks.',
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Blood-red glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blood-700/15 rounded-full blur-[120px]" />

      <div className="text-center max-w-lg mx-auto relative z-10">
        {/* Chicken Fighter Image */}
        <div className="mb-8">
          <div className="w-44 h-44 mx-auto flex items-center justify-center">
            <Image
              src="/chicken-fighter-404.png"
              alt="Chicken1of1 Fighter - Page Not Found"
              width={176}
              height={176}
              className="object-contain drop-shadow-[0_0_20px_rgba(185,28,28,0.3)]"
            />
          </div>
        </div>

        {/* 404 Message */}
        <h1 className="font-heading text-7xl font-bold text-white mb-4 uppercase tracking-tight">
          404
        </h1>

        <h2 className="font-heading text-2xl font-semibold text-cage-300 mb-6 uppercase tracking-wide">
          This Page Flew the Coop!
        </h2>

        <p className="text-lg text-cage-400 mb-8">
          Looks like this page went missing faster than a 1/1 card in a break!
          Don&apos;t worry though, we&apos;ve got plenty more action waiting for you.
        </p>

        {/* UFC Quote */}
        <div className="bg-[#111] border border-cage-700 rounded-lg p-6 mb-8">
          <p className="text-cage-300 italic">
            &ldquo;This page got submitted faster than a first-round RNC!&rdquo;
          </p>
          <p className="text-sm text-cage-500 mt-2">
            - Chicken1of1 Commentary Team
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 mb-8">
          <Link
            href="/"
            className="btn-primary w-full block"
          >
            Back to Home
          </Link>

          <div className="grid grid-cols-2 gap-4">
            <Link href="/gallery" className="btn-outline">
              View Gallery
            </Link>
            <Link href="/live" className="btn-outline">
              Watch Live
            </Link>
          </div>

          <Link href="/faq" className="btn-outline w-full block">
            Learn About Breaks
          </Link>
        </div>

        {/* Popular Links */}
        <div className="border-t border-cage-700 pt-6">
          <h3 className="font-heading text-lg font-semibold text-white mb-4 uppercase tracking-wide">
            Popular Pages
          </h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Link href="/about" className="text-gold-400 hover:text-gold-300 transition-colors">
              About Us
            </Link>
            <Link href="/contact" className="text-gold-400 hover:text-gold-300 transition-colors">
              Contact
            </Link>
            <Link href="/legal/privacy" className="text-gold-400 hover:text-gold-300 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/legal/shipping" className="text-gold-400 hover:text-gold-300 transition-colors">
              Shipping Info
            </Link>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-8 pt-6 border-t border-cage-700">
          <p className="text-sm text-cage-500 mb-2">
            Still can&apos;t find what you&apos;re looking for?
          </p>
          <a
            href="mailto:hello@chicken1of1.com"
            className="text-gold-400 hover:text-gold-300 transition-colors text-sm"
          >
            hello@chicken1of1.com
          </a>
        </div>

        {/* Branding */}
        <div className="mt-6">
          <p className="text-xs text-cage-600">
            Bauk Bauk Baby!
          </p>
        </div>
      </div>
    </div>
  )
}

import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '404 - Page Not Found | Chicken1of1',
  description: 'The page you are looking for could not be found. Return to Chicken1of1 for UFC card breaks.',
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
      <div className="text-center max-w-lg mx-auto">
        {/* Chicken Fighter Image */}
        <div className="mb-8">
          <div className="w-40 h-40 mx-auto flex items-center justify-center">
            <Image
              src="/chicken-fighter-404.png"
              alt="Chicken1of1 Fighter - Page Not Found"
              width={160}
              height={160}
              className="object-contain"
            />
          </div>
        </div>

        {/* 404 Message */}
        <h1 className="text-6xl font-bold text-white mb-4">
          404
        </h1>

        <h2 className="text-2xl font-semibold text-gray-300 mb-6">
          This Page Flew the Coop!
        </h2>

        <p className="text-lg text-gray-400 mb-8">
          Looks like this page went missing faster than a 1/1 card in a break!
          Don't worry though, we've got plenty more action waiting for you.
        </p>

        {/* Humorous UFC Reference */}
        <div className="bg-dark-800 border border-dark-700 rounded-lg p-6 mb-8">
          <p className="text-gray-300 italic">
            "This page got submitted faster than a first-round RNC!"
          </p>
          <p className="text-sm text-gray-500 mt-2">
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
            <Link
              href="/gallery"
              className="btn-outline"
            >
              View Gallery
            </Link>
            <Link
              href="/live"
              className="btn-outline"
            >
              Watch Live
            </Link>
          </div>

          <Link
            href="/faq"
            className="btn-outline w-full block"
          >
            Learn About Breaks
          </Link>
        </div>

        {/* Popular Links */}
        <div className="border-t border-dark-700 pt-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Popular Pages
          </h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Link
              href="/about"
              className="text-primary-400 hover:text-primary-300 transition-colors"
            >
              About Us
            </Link>
            <Link
              href="/contact"
              className="text-primary-400 hover:text-primary-300 transition-colors"
            >
              Contact
            </Link>
            <Link
              href="/legal/privacy"
              className="text-primary-400 hover:text-primary-300 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/legal/shipping"
              className="text-primary-400 hover:text-primary-300 transition-colors"
            >
              Shipping Info
            </Link>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-8 pt-6 border-t border-dark-700">
          <p className="text-sm text-gray-500 mb-2">
            Still can't find what you're looking for?
          </p>
          <a
            href="mailto:hello@chicken1of1.com"
            className="text-primary-400 hover:text-primary-300 transition-colors text-sm"
          >
            hello@chicken1of1.com
          </a>
        </div>

        {/* Branding */}
        <div className="mt-6">
          <p className="text-xs text-gray-600">
            Bauk Bauk Baby! 🐔
          </p>
        </div>
      </div>
    </div>
  )
}
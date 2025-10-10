import { Metadata } from 'next';
import SellToUsHero from '@/components/SellToUsHero';
import QuoteCalculator from '@/components/QuoteCalculator';
import PricingGrid from '@/components/PricingGrid';
import HowItWorks from '@/components/HowItWorks';
import SellerTestimonials from '@/components/SellerTestimonials';
import SellFAQ from '@/components/SellFAQ';

export const metadata: Metadata = {
  title: 'Sell Your UFC Boxes | Instant Cash Offers | Chicken1of1',
  description: 'Get instant cash offers for your UFC sealed boxes. Top prices for Prizm, Chronicles, Select & more. 24-hour payouts. No fees. The #1 UFC box buyer.',
  keywords: 'sell UFC boxes, UFC Prizm, UFC Chronicles, sell sealed boxes, UFC Select, instant cash offer, sports cards',
  openGraph: {
    title: 'Sell Your UFC Sealed Boxes - Instant Cash Offers',
    description: 'Top dollar for your UFC sealed boxes. Instant quotes, 24-hour payouts, no fees.',
    url: 'https://chicken1of1.com/sell-to-us',
    images: [
      {
        url: 'https://chicken1of1.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Sell Your UFC Boxes to Chicken1of1'
      }
    ]
  }
};

export default function SellToUsPage() {
  return (
    <main className="min-h-screen bg-black">
      {/* Hero Section */}
      <SellToUsHero />

      {/* Live Pricing Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-4">
            Current Buy Prices
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Live pricing updated daily. Prices shown are for factory sealed boxes in mint condition.
          </p>
          <PricingGrid />
        </div>
      </section>

      {/* Instant Quote Calculator */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-black">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-4">
            Get Your Instant Quote
          </h2>
          <p className="text-gray-400 text-center mb-12">
            Select your products and receive an instant cash offer
          </p>
          <QuoteCalculator />
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <HowItWorks />
      </section>

      {/* Why Sell to Us */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-black">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-12">
            Why Sell to Chicken1of1?
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-xl font-bold text-yellow-400 mb-3">🥊 UFC Specialists</h3>
              <p className="text-gray-300">
                We focus exclusively on UFC/MMA products, which means we pay top dollar for what we know best.
              </p>
            </div>
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-xl font-bold text-yellow-400 mb-3">💰 Best Prices</h3>
              <p className="text-gray-300">
                We offer 70-85% of market value - significantly more than most buyers who offer 50-60%.
              </p>
            </div>
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-xl font-bold text-yellow-400 mb-3">⚡ Fast Payment</h3>
              <p className="text-gray-300">
                Get paid within 24 hours of us receiving your boxes. Choose PayPal, Zelle, or check.
              </p>
            </div>
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-xl font-bold text-yellow-400 mb-3">✅ No Fees</h3>
              <p className="text-gray-300">
                Unlike consignment services that charge 20-30%, we buy directly with no hidden fees.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <SellerTestimonials />
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-black">
        <SellFAQ />
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-yellow-600 to-yellow-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">
            Ready to Sell Your UFC Boxes?
          </h2>
          <p className="text-black text-lg mb-8">
            Get your instant quote now and receive payment within 24 hours!
          </p>
          <button
            onClick={() => document.getElementById('quote-calculator')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-black text-yellow-400 px-8 py-4 rounded-lg text-lg font-bold hover:bg-gray-900 transition-colors"
          >
            Get Instant Quote →
          </button>
        </div>
      </section>
    </main>
  );
}
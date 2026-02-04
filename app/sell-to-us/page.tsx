import { Metadata } from 'next'
import Section from '@/components/Section'
import ProductSubmissionForm from '@/components/ProductSubmissionForm'
import HowItWorks from '@/components/HowItWorks'
import SellFAQ from '@/components/SellFAQ'
import Container from '@/components/Container'
import SectionDivider from '@/components/ui/SectionDivider'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Sell Your UFC Boxes | Chicken1of1',
  description:
    'Sell your sealed UFC, MMA, and combat sports boxes to Chicken1of1. Fair offers, fast payment, no games. Submit your products and get an offer within 24 hours.',
  keywords:
    'sell UFC boxes, sell sealed boxes, UFC Prizm, Topps Chrome UFC, sell sports cards, Chicken1of1',
  openGraph: {
    title: 'Sell Your UFC Sealed Boxes - Chicken1of1',
    description:
      'Fair offers for your sealed UFC product. Submit what you have and we will make you an honest offer.',
    url: 'https://chicken1of1.com/sell-to-us',
    images: [
      {
        url: 'https://chicken1of1.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Sell Your UFC Boxes to Chicken1of1',
      },
    ],
  },
}

export default function SellToUsPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative py-20 md:py-28 overflow-hidden bg-[#0a0a0a]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-gold-500/10 rounded-full blur-[100px]" />
        <div className="absolute inset-0 cage-pattern opacity-20" />
        <Container className="relative z-10">
          <div className="text-center max-w-3xl mx-auto animate-fade-in-up">
            <h1 className="font-heading text-4xl md:text-6xl font-bold text-white uppercase tracking-tight mb-4">
              Sell Your UFC Boxes To Us
            </h1>
            <p className="text-lg text-cage-300 mb-4">
              We buy sealed UFC, MMA, boxing, and combat sports product. Fair offers based on real market data, with no runaround.
            </p>
            <p className="text-cage-400">
              Tell us what you have and we will make you an honest offer within 24 hours.
            </p>
          </div>
        </Container>
      </section>

      {/* General Guidelines */}
      <Section>
        <div className="max-w-3xl mx-auto scroll-animate">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-white uppercase tracking-tight mb-6 text-center">
            General Guidelines
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-black rounded-xl border border-cage-700/50 p-6 transition-all duration-300 hover:border-gold-500/30 hover:shadow-[0_0_20px_rgba(185,28,28,0.1)]">
              <h3 className="font-heading text-lg font-bold text-gold-400 uppercase mb-3">What We Buy</h3>
              <ul className="space-y-2 text-cage-300 text-sm">
                <li>Factory sealed hobby boxes & cases</li>
                <li>Retail, blaster, mega, and hanger boxes</li>
                <li>UFC, MMA, Boxing, Wrestling products</li>
                <li>Topps and Panini brands</li>
              </ul>
            </div>
            <div className="bg-black rounded-xl border border-cage-700/50 p-6 transition-all duration-300 hover:border-gold-500/30 hover:shadow-[0_0_20px_rgba(185,28,28,0.1)]">
              <h3 className="font-heading text-lg font-bold text-gold-400 uppercase mb-3">What To Expect</h3>
              <ul className="space-y-2 text-cage-300 text-sm">
                <li>We typically pay 70-85% of market value</li>
                <li>Offers based on current eBay sold comps</li>
                <li>Larger lots often get better pricing</li>
                <li>Payment via PayPal or Zelle</li>
              </ul>
            </div>
          </div>
        </div>
      </Section>

      {/* Submission Form */}
      <Section>
        <div className="max-w-3xl mx-auto scroll-animate">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-white uppercase tracking-tight mb-8 text-center">
            Submit Your Products
          </h2>
          <ProductSubmissionForm />
        </div>
      </Section>

      <SectionDivider variant="octagon-line" className="max-w-4xl mx-auto" />

      {/* How It Works */}
      <Section>
        <div className="scroll-animate">
          <HowItWorks />
        </div>
      </Section>

      {/* Why Sell to Us */}
      <Section>
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white text-center uppercase tracking-tight mb-12 scroll-animate">
            Why Sell to Chicken1of1?
          </h2>
          <div className="grid md:grid-cols-2 gap-6 stagger-children">
            <div className="bg-black rounded-xl border border-cage-700/50 p-6 transition-all duration-300 hover:border-gold-500/30 hover:shadow-[0_0_20px_rgba(185,28,28,0.1)] scroll-animate">
              <h3 className="font-heading text-lg font-bold text-gold-400 uppercase mb-3">UFC Specialists</h3>
              <p className="text-cage-300">
                We focus on UFC and combat sports products. We know the market, we know the products, and we pay accordingly.
              </p>
            </div>
            <div className="bg-black rounded-xl border border-cage-700/50 p-6 transition-all duration-300 hover:border-gold-500/30 hover:shadow-[0_0_20px_rgba(185,28,28,0.1)] scroll-animate">
              <h3 className="font-heading text-lg font-bold text-gold-400 uppercase mb-3">Fair & Honest</h3>
              <p className="text-cage-300">
                No bait-and-switch. Our offers are based on real market data and we stand behind them.
              </p>
            </div>
            <div className="bg-black rounded-xl border border-cage-700/50 p-6 transition-all duration-300 hover:border-gold-500/30 hover:shadow-[0_0_20px_rgba(185,28,28,0.1)] scroll-animate">
              <h3 className="font-heading text-lg font-bold text-gold-400 uppercase mb-3">Fast Payment</h3>
              <p className="text-cage-300">
                Get paid within 24-48 hours of us receiving your boxes. PayPal or Zelle.
              </p>
            </div>
            <div className="bg-black rounded-xl border border-cage-700/50 p-6 transition-all duration-300 hover:border-gold-500/30 hover:shadow-[0_0_20px_rgba(185,28,28,0.1)] scroll-animate">
              <h3 className="font-heading text-lg font-bold text-gold-400 uppercase mb-3">No Fees</h3>
              <p className="text-cage-300">
                Unlike consignment services that charge 20-30%, we buy directly. The offer you accept is what you get.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* FAQ */}
      <Section>
        <div className="scroll-animate">
          <SellFAQ />
        </div>
      </Section>

      {/* Bottom CTA */}
      <section className="relative py-16 bg-[#0a0a0a] overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-gold-500/10 rounded-full blur-[100px]" />
        <Container className="relative z-10">
          <div className="text-center max-w-3xl mx-auto scroll-animate">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white uppercase tracking-tight mb-4">
              Ready to Sell?
            </h2>
            <p className="text-cage-300 text-lg mb-8">
              Submit your products above or reach out directly. We respond within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="mailto:hello@chicken1of1.com" className="btn-primary">
                Email Us Directly
              </a>
              <Link href="/contact" className="btn-outline">
                Contact Form
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}

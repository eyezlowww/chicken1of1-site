import type { Metadata } from 'next'
import Container from '@/components/Container'
import Section from '@/components/Section'
import SearchableFAQ from '@/components/SearchableFAQ'
import Link from 'next/link'
import faqData from '@/content/faq.json'

export const metadata: Metadata = {
  title: 'FAQ - Chicken1of1 UFC Card Breaking Questions',
  description:
    'Get answers to common questions about UFC card breaks, shipping, Random Team vs PYT formats, and more. Learn about Chicken1of1 breaking procedures.',
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqData.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
}

export default function FAQPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />

      <section className="relative py-20 md:py-28 overflow-hidden bg-[#0a0a0a]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blood-700/15 rounded-full blur-[120px]" />
        <div className="absolute inset-0 cage-pattern opacity-20" />
        <Container className="relative z-10">
          <div className="text-center max-w-3xl mx-auto animate-fade-in-up">
            <h1 className="font-heading text-4xl md:text-6xl font-bold text-white uppercase tracking-tight mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-cage-300">Everything You Need to Know</p>
          </div>
        </Container>
      </section>

      <Section>
        <SearchableFAQ items={faqData} />
      </Section>

      <section className="relative py-16 md:py-24 bg-[#0a0a0a] overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-blood-700/10 rounded-full blur-[100px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto scroll-animate">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white uppercase tracking-tight mb-4">
              Still Have Questions?
            </h2>
            <p className="text-lg text-cage-400 mb-8">
              Can&apos;t find what you&apos;re looking for? Reach out to us
              directly and we&apos;ll help you out.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="btn-primary">
                Contact Us
              </Link>
              <a
                href={process.env.NEXT_PUBLIC_INSTAGRAM_URL || 'https://www.instagram.com/chicken1of1'}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline"
              >
                DM on Instagram
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

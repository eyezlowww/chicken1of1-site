import type { Metadata } from 'next'
import Hero from '@/components/Hero'
import Section from '@/components/Section'
import FAQAccordion from '@/components/FAQAccordion'
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

      <Hero
        title="Frequently Asked Questions"
        subtitle="Everything You Need to Know"
        description="Get answers about our break formats, shipping, and policies"
        showCTA={false}
      />

      <Section>
        <div className="max-w-4xl mx-auto">
          <FAQAccordion items={faqData} />
        </div>
      </Section>

      <Section background="darker">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Still Have Questions?
          </h2>
          <p className="text-lg text-gray-400 mb-8">
            Can&apos;t find what you&apos;re looking for? Reach out to us
            directly and we&apos;ll help you out.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="btn-primary">
              Contact Us
            </Link>
            <a
              href={
                process.env.NEXT_PUBLIC_INSTAGRAM_URL ||
                'https://www.instagram.com/chicken1of1'
              }
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline"
            >
              DM on Instagram
            </a>
          </div>
        </div>
      </Section>
    </>
  )
}
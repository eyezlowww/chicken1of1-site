import type { Metadata } from 'next'
import Hero from '@/components/Hero'
import Section from '@/components/Section'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'About Chicken1of1 - UFC Sports Card Breaking',
  description:
    'Learn about Chicken1of1, your trusted source for UFC sports card breaks. Authentic breaks, clean hits, and zero fluff. Meet the team behind Bauk Bauk Baby.',
}

export default function AboutPage() {
  return (
    <>
      <Hero
        title="About Chicken1of1"
        subtitle="The Story Behind Bauk Bauk Baby"
        description="Authentic UFC card breaks with integrity and transparency"
        showCTA={false}
      />

      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              About Us
            </h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                Chicken1of1 started in 2021 with streaming UFC breaks to an audience of 12 people. Since then the Chicken1of1 channel has grown to several sports card loving friends running UFC and entertainment card breaks with one simple goal: have fun while being generous and trustworthy.
              </p>
              <p>
                We stream live on Whatnot and Fanatics Live, with a focus on niche sports and segments like UFC, Wrestling, Disney, Marvel, and other non major sport categories. Our approach is straightforward - fair breaks, quick and secure shipping, and lots of Bauking.
              </p>
              <p>
                Loitering is welcomed and encouraged in our streams, you do not need to spend to be welcomed or have fun. Every break is recorded live for complete transparency, and we ship quickly with secure packaging.
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square relative overflow-hidden rounded-xl bg-dark-800 border border-dark-700">
              <Image
                src="/gallery/about-hero.jpg"
                alt="Chicken1of1 breaking cards live"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </Section>

      <Section background="darker">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Breaking Standards
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Our commitment to quality and transparency in every break
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="card">
            <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Live Streaming
            </h3>
            <p className="text-gray-300">
              Every break is streamed live with full transparency. No cuts, no
              editing - just authentic breaking action.
            </p>
          </div>

          <div className="card">
            <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Secure Shipping
            </h3>
            <p className="text-gray-300">
              Cards shipped securely within 3-5 business days with tracking.
              Base cards included unless specified otherwise.
            </p>
          </div>

          <div className="card">
            <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-2-2v-1M15 10V6a2 2 0 00-2-2H7a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Community Focus
            </h3>
            <p className="text-gray-300">
              Building a community of collectors through education, fair
              breaking, and authentic interactions.
            </p>
          </div>

          <div className="card">
            <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Fair Pricing
            </h3>
            <p className="text-gray-300">
              Competitive break prices with no hidden fees. What you see is
              what you pay.
            </p>
          </div>

          <div className="card">
            <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Education First
            </h3>
            <p className="text-gray-300">
              Helping new collectors understand break formats, card values, and
              hobby fundamentals.
            </p>
          </div>

          <div className="card">
            <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No Guarantees
            </h3>
            <p className="text-gray-300">
              Honest about card pulling odds. No guaranteed hits or false
              promises - just authentic pack breaking.
            </p>
          </div>
        </div>
      </Section>

      <Section>
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Join the Community
          </h2>
          <p className="text-lg text-gray-400 mb-8">
            Follow us across platforms for break schedules, hit showcases, and
            hobby education. Bauk Bauk Baby!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={
                process.env.NEXT_PUBLIC_WHATNOT_URL ||
                'https://www.whatnot.com/s/muoENH2W'
              }
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Watch on Whatnot
            </a>
            <a
              href={
                process.env.NEXT_PUBLIC_INSTAGRAM_URL ||
                'https://www.instagram.com/chicken1of1'
              }
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline"
            >
              Follow on Instagram
            </a>
          </div>
        </div>
      </Section>
    </>
  )
}
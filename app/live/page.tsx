'use client'

import { useState } from 'react'
import Section from '@/components/Section'
import EmbedCard from '@/components/EmbedCard'

const tabs = [
  {
    id: 'whatnot',
    name: 'Whatnot',
    platform: 'whatnot' as const,
    previewImage: '/whatnot-preview.jpg',
    fallbackUrl:
      process.env.NEXT_PUBLIC_WHATNOT_URL ||
      'https://www.whatnot.com/s/muoENH2W',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    platform: 'youtube' as const,
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    fallbackUrl: 'https://www.youtube.com/@chicken1of1',
  },
]

export default function LivePage() {
  const [activeTab, setActiveTab] = useState('whatnot')

  return (
    <>
      <section className="relative py-20 md:py-28 overflow-hidden bg-[#0a0a0a]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blood-700/15 rounded-full blur-[120px]" />
        <div className="absolute inset-0 cage-pattern opacity-20" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto animate-fade-in-up">
            <h1 className="font-heading text-4xl md:text-6xl font-bold text-white uppercase tracking-tight mb-4">
              Live UFC Card Breaks
            </h1>
            <p className="text-xl text-cage-300">Topps & Panini UFC & MMA Sports Cards Live on Whatnot</p>
          </div>
        </div>
      </section>

      <Section>
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 scroll-animate">
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-gold-500 text-dark-950'
                      : 'bg-black text-cage-300 border border-cage-700/50 hover:border-gold-500/30 hover:text-white'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>

            {tabs.map((tab) => (
              <div
                key={tab.id}
                className={activeTab === tab.id ? 'block' : 'hidden'}
              >
                <EmbedCard
                  title={`${tab.name} Live Stream`}
                  platform={tab.platform}
                  embedUrl={tab.embedUrl}
                  fallbackUrl={tab.fallbackUrl}
                  previewImage={tab.previewImage}
                />
              </div>
            ))}
          </div>

          <div className="bg-black rounded-xl border border-cage-700/50 p-6 transition-all duration-300 hover:border-gold-500/30 hover:shadow-[0_0_20px_rgba(185,28,28,0.1)] scroll-animate">
            <h3 className="text-xl font-heading font-semibold text-white uppercase tracking-wide mb-4">
              Stream Not Loading?
            </h3>
            <p className="text-cage-300 mb-4">
              If the embedded player isn&apos;t working, you can open the stream
              directly in the platform&apos;s app or website for the best
              experience.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tabs.map((tab) => (
                <a
                  key={tab.id}
                  href={tab.fallbackUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline text-center"
                >
                  Open {tab.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <section className="relative py-16 md:py-24 bg-[#0a0a0a] overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blood-700/20 rounded-full blur-[150px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto scroll-animate mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white uppercase tracking-tight mb-4">
              Join the Live Experience
            </h2>
            <p className="text-lg text-cage-400">
              Experience authentic UFC card breaks featuring Topps & Panini UFC and MMA sports cards with full transparency. Every
              break is live, every pull is real, and every stream is recorded for
              your security.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto stagger-children">
            <div className="bg-black rounded-xl border border-cage-700/50 p-6 transition-all duration-300 hover:border-gold-500/30 hover:shadow-[0_0_20px_rgba(185,28,28,0.1)] scroll-animate">
              <div className="w-12 h-12 bg-black border border-gold-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-heading font-semibold text-white uppercase tracking-wide mb-2">Live Streaming</h3>
              <p className="text-cage-300">Every break is streamed live with full transparency. No cuts, no editing - just authentic breaking action.</p>
            </div>

            <div className="bg-black rounded-xl border border-cage-700/50 p-6 transition-all duration-300 hover:border-gold-500/30 hover:shadow-[0_0_20px_rgba(185,28,28,0.1)] scroll-animate">
              <div className="w-12 h-12 bg-black border border-gold-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-heading font-semibold text-white uppercase tracking-wide mb-2">Secure Shipping</h3>
              <p className="text-cage-300">Cards shipped securely within 3-5 business days with tracking. Base cards included unless specified otherwise.</p>
            </div>

            <div className="bg-black rounded-xl border border-cage-700/50 p-6 transition-all duration-300 hover:border-gold-500/30 hover:shadow-[0_0_20px_rgba(185,28,28,0.1)] scroll-animate">
              <div className="w-12 h-12 bg-black border border-gold-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-2-2v-1M15 10V6a2 2 0 00-2-2H7a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-heading font-semibold text-white uppercase tracking-wide mb-2">Community Focus</h3>
              <p className="text-cage-300">Building a community of collectors through education, fair breaking, and authentic interactions.</p>
            </div>

            <div className="bg-black rounded-xl border border-cage-700/50 p-6 transition-all duration-300 hover:border-gold-500/30 hover:shadow-[0_0_20px_rgba(185,28,28,0.1)] scroll-animate">
              <div className="w-12 h-12 bg-black border border-gold-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-heading font-semibold text-white uppercase tracking-wide mb-2">Fair Pricing</h3>
              <p className="text-cage-300">Competitive break prices with no hidden fees. What you see is what you pay.</p>
            </div>

            <div className="bg-black rounded-xl border border-cage-700/50 p-6 transition-all duration-300 hover:border-gold-500/30 hover:shadow-[0_0_20px_rgba(185,28,28,0.1)] scroll-animate">
              <div className="w-12 h-12 bg-black border border-gold-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-heading font-semibold text-white uppercase tracking-wide mb-2">Education First</h3>
              <p className="text-cage-300">Helping new collectors understand break formats, card values, and hobby fundamentals.</p>
            </div>

            <div className="bg-black rounded-xl border border-cage-700/50 p-6 transition-all duration-300 hover:border-gold-500/30 hover:shadow-[0_0_20px_rgba(185,28,28,0.1)] scroll-animate">
              <div className="w-12 h-12 bg-black border border-gold-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-heading font-semibold text-white uppercase tracking-wide mb-2">No Guarantees</h3>
              <p className="text-cage-300">Honest about card pulling odds. No guaranteed hits or false promises - just authentic pack breaking.</p>
            </div>
          </div>

          <p className="text-sm text-cage-500 text-center mt-8">
            All breaks are for entertainment purposes. No guaranteed hits or
            refunds on sealed product breaks.
          </p>
        </div>
      </section>
    </>
  )
}

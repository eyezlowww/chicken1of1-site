'use client'

import { useState } from 'react'
import type { Metadata } from 'next'
import Hero from '@/components/Hero'
import Section from '@/components/Section'
import EmbedCard from '@/components/EmbedCard'

const tabs = [
  {
    id: 'whatnot',
    name: 'Whatnot',
    platform: 'whatnot' as const,
    fallbackUrl:
      process.env.NEXT_PUBLIC_WHATNOT_URL ||
      'https://www.whatnot.com/s/muoENH2W',
  },
  {
    id: 'fanatics',
    name: 'Fanatics Live',
    platform: 'fanatics' as const,
    fallbackUrl:
      process.env.NEXT_PUBLIC_FANATICS_URL ||
      'https://www.fanatics.live/shops/chicken1of1',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    platform: 'youtube' as const,
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    fallbackUrl: 'https://www.youtube.com/@chicken1of1',
  },
  {
    id: 'twitch',
    name: 'Twitch',
    platform: 'twitch' as const,
    embedUrl: 'https://player.twitch.tv/?channel=chicken1of1&parent=chicken1of1.com',
    fallbackUrl: 'https://www.twitch.tv/chicken1of1',
  },
]

export default function LivePage() {
  const [activeTab, setActiveTab] = useState('whatnot')

  return (
    <>
      <Hero
        title="Watch Live Breaks"
        subtitle="UFC Card Breaking Action"
        description="Join us live for authentic UFC card breaks across multiple platforms"
        showCTA={false}
      />

      <Section>
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-dark-700 text-gray-300 hover:bg-dark-600 hover:text-white'
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
                />
              </div>
            ))}
          </div>

          <div className="card">
            <h3 className="text-xl font-semibold text-white mb-4">
              Stream Not Loading?
            </h3>
            <p className="text-gray-300 mb-4">
              If the embedded player isn&apos;t working, you can open the stream
              directly in the platform&apos;s app or website for the best
              experience.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Custom Embed Example - Commented for Future Use */}
      {/*
      <Section background="darker">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">
            Custom Stream Provider
          </h2>
          <EmbedCard
            title="Custom Live Stream"
            platform="custom"
            fallbackUrl="https://example.com/live"
            customEmbedCode={`
              <!-- Custom provider embed code goes here -->
              <iframe
                src="https://custom-provider.com/embed/stream-id"
                width="100%"
                height="100%"
                frameborder="0"
                allowfullscreen>
              </iframe>
            `}
          />
        </div>
      </Section>
      */}

      <Section background="darker">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Join the Live Experience
          </h2>
          <p className="text-lg text-gray-400 mb-8">
            Experience authentic UFC card breaking with full transparency. Every
            break is live, every pull is real, and every stream is recorded for
            your security.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mx-auto mb-3">
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
              <h3 className="font-semibold text-white mb-1">Live Breaking</h3>
              <p className="text-sm text-gray-400">
                Real-time card breaking action
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mx-auto mb-3">
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
              <h3 className="font-semibold text-white mb-1">Full Transparency</h3>
              <p className="text-sm text-gray-400">
                Every break recorded for security
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mx-auto mb-3">
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
              <h3 className="font-semibold text-white mb-1">Interactive Chat</h3>
              <p className="text-sm text-gray-400">
                Chat with breakers and community
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-500">
            All breaks are for entertainment purposes. No guaranteed hits or
            refunds on sealed product breaks.
          </p>
        </div>
      </Section>
    </>
  )
}
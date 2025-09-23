'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface InstagramFeedProps {
  className?: string
}

export default function InstagramFeed({ className = '' }: InstagramFeedProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className={`${className}`}>
        <div className="animate-pulse">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="aspect-square bg-dark-700 rounded-lg"
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      {/* Option 1: Ready for Third-Party Widget */}
      <div id="instagram-feed-widget" className="min-h-[400px]">
        {/* This is where third-party widgets like EmbedSocial, Behold, or SnapWidget would go */}

        {/* Placeholder content showing how it should look */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            {
              image: '/gallery/instagram-placeholder-1.svg',
              caption: 'Epic UFC card pull from tonight\'s break! 🔥',
              link: '#'
            },
            {
              image: '/gallery/instagram-placeholder-2.svg',
              caption: 'Setting up for another amazing break',
              link: '#'
            },
            {
              image: '/gallery/instagram-placeholder-3.svg',
              caption: 'Rookie autograph hit! 🚀',
              link: '#'
            },
            {
              image: '/gallery/instagram-placeholder-4.svg',
              caption: 'Behind the scenes prep work',
              link: '#'
            },
            {
              image: '/gallery/instagram-placeholder-5.svg',
              caption: 'Championship patch card 👑',
              link: '#'
            },
            {
              image: '/gallery/instagram-placeholder-6.svg',
              caption: 'Tonight\'s break lineup 📺',
              link: '#'
            }
          ].map((post, index) => (
            <Link
              key={index}
              href={`https://www.instagram.com/chicken1of1`}
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              <div className="aspect-square relative overflow-hidden rounded-lg bg-dark-800 border border-dark-700 group-hover:border-primary-500 transition-all duration-200">
                <div className="w-full h-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center">
                  <div className="text-center text-white p-4">
                    <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12.017 0C8.396 0 7.929.01 6.71.048 5.493.087 4.73.222 4.058.42a5.916 5.916 0 0 0-2.134 1.388A5.916 5.916 0 0 0 .536 4.058C.338 4.73.203 5.493.164 6.71.126 7.929.116 8.396.116 12.017c0 3.622.01 4.09.048 5.309.039 1.217.174 1.98.372 2.652a5.916 5.916 0 0 0 1.388 2.134 5.916 5.916 0 0 0 2.134 1.388c.672.198 1.435.333 2.652.372 1.219.038 1.687.048 5.309.048 3.622 0 4.09-.01 5.309-.048 1.217-.039 1.98-.174 2.652-.372a5.916 5.916 0 0 0 2.134-1.388 5.916 5.916 0 0 0 1.388-2.134c.198-.672.333-1.435.372-2.652.038-1.219.048-1.687.048-5.309 0-3.622-.01-4.09-.048-5.309-.039-1.217-.174-1.98-.372-2.652a5.916 5.916 0 0 0-1.388-2.134A5.916 5.916 0 0 0 19.326.536C18.654.338 17.891.203 16.674.164 15.455.126 14.988.116 11.366.116L12.017 0zm-.132 2.183c3.549 0 3.97.014 5.378.052 1.297.059 2.001.276 2.469.458.621.241 1.065.53 1.531.995.464.466.754.91.995 1.531.182.468.399 1.172.458 2.469.038 1.408.052 1.829.052 5.378 0 3.549-.014 3.97-.052 5.378-.059 1.297-.276 2.001-.458 2.469a4.126 4.126 0 0 1-.995 1.531 4.126 4.126 0 0 1-1.531.995c-.468.182-1.172.399-2.469.458-1.408.038-1.829.052-5.378.052-3.549 0-3.97-.014-5.378-.052-1.297-.059-2.001-.276-2.469-.458a4.126 4.126 0 0 1-1.531-.995 4.126 4.126 0 0 1-.995-1.531c-.182-.468-.399-1.172-.458-2.469-.038-1.408-.052-1.829-.052-5.378 0-3.549.014-3.97.052-5.378.059-1.297.276-2.001.458-2.469.241-.621.53-1.065.995-1.531a4.126 4.126 0 0 1 1.531-.995c.468-.182 1.172-.399 2.469-.458 1.408-.038 1.829-.052 5.378-.052z" clipRule="evenodd"/>
                      <path fillRule="evenodd" d="M12.017 5.838a6.18 6.18 0 1 0 0 12.36 6.18 6.18 0 0 0 0-12.36zM12.017 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8z" clipRule="evenodd"/>
                      <circle cx="18.406" cy="5.594" r="1.44"/>
                    </svg>
                    <p className="text-xs font-medium">Post {index + 1}</p>
                  </div>
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <div className="text-center text-white p-2">
                    <svg className="w-6 h-6 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <p className="text-xs">View on Instagram</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400 mb-4">
            Follow @chicken1of1 for daily updates and live break announcements
          </p>
          <Link
            href="https://www.instagram.com/chicken1of1"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline inline-flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12.017 0C8.396 0 7.929.01 6.71.048 5.493.087 4.73.222 4.058.42a5.916 5.916 0 0 0-2.134 1.388A5.916 5.916 0 0 0 .536 4.058C.338 4.73.203 5.493.164 6.71.126 7.929.116 8.396.116 12.017c0 3.622.01 4.09.048 5.309.039 1.217.174 1.98.372 2.652a5.916 5.916 0 0 0 1.388 2.134 5.916 5.916 0 0 0 2.134 1.388c.672.198 1.435.333 2.652.372 1.219.038 1.687.048 5.309.048 3.622 0 4.09-.01 5.309-.048 1.217-.039 1.98-.174 2.652-.372a5.916 5.916 0 0 0 2.134-1.388 5.916 5.916 0 0 0 1.388-2.134c.198-.672.333-1.435.372-2.652.038-1.219.048-1.687.048-5.309 0-3.622-.01-4.09-.048-5.309-.039-1.217-.174-1.98-.372-2.652a5.916 5.916 0 0 0-1.388-2.134A5.916 5.916 0 0 0 19.326.536C18.654.338 17.891.203 16.674.164 15.455.126 14.988.116 11.366.116L12.017 0zm-.132 2.183c3.549 0 3.97.014 5.378.052 1.297.059 2.001.276 2.469.458.621.241 1.065.53 1.531.995.464.466.754.91.995 1.531.182.468.399 1.172.458 2.469.038 1.408.052 1.829.052 5.378 0 3.549-.014 3.97-.052 5.378-.059 1.297-.276 2.001-.458 2.469a4.126 4.126 0 0 1-.995 1.531 4.126 4.126 0 0 1-1.531.995c-.468.182-1.172.399-2.469.458-1.408.038-1.829.052-5.378.052-3.549 0-3.97-.014-5.378-.052-1.297-.059-2.001-.276-2.469-.458a4.126 4.126 0 0 1-1.531-.995 4.126 4.126 0 0 1-.995-1.531c-.182-.468-.399-1.172-.458-2.469-.038-1.408-.052-1.829-.052-5.378 0-3.549.014-3.97.052-5.378.059-1.297.276-2.001.458-2.469.241-.621.53-1.065.995-1.531a4.126 4.126 0 0 1 1.531-.995c.468-.182 1.172-.399 2.469-.458 1.408-.038 1.829-.052 5.378-.052z" clipRule="evenodd"/>
              <path fillRule="evenodd" d="M12.017 5.838a6.18 6.18 0 1 0 0 12.36 6.18 6.18 0 0 0 0-12.36zM12.017 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8z" clipRule="evenodd"/>
              <circle cx="18.406" cy="5.594" r="1.44"/>
            </svg>
            <span>Follow on Instagram</span>
          </Link>
        </div>
      </div>

      {/*
      To integrate a real Instagram feed widget, replace the above content with one of these:

      1. EmbedSocial:
      <script src="https://embedsocial.com/cdn/ht.js" id="EmbedSocialHashtagScript"></script>
      <div class="embedsocial-hashtag" data-ref="your-reference-id"></div>

      2. Behold (behold.so):
      <script src="https://w.behold.so/widget.js" type="text/javascript"></script>

      3. SnapWidget:
      <script src="https://snapwidget.com/js/snapwidget.js"></script>
      <iframe src="https://snapwidget.com/embed/your-id" class="snapwidget-widget"></iframe>

      4. Instagram Basic Display API (requires Meta app approval)
      */}
    </div>
  )
}

/*
SETUP INSTRUCTIONS FOR REAL INSTAGRAM FEED:

Option 1: EmbedSocial (Recommended - Easy Setup)
1. Sign up at embedsocial.com
2. Create an Instagram feed widget
3. Get your reference ID
4. Replace the placeholder content above with their embed code

Option 2: Behold (behold.so)
1. Sign up at behold.so
2. Connect your Instagram account
3. Customize your feed design
4. Get the embed code and replace placeholder

Option 3: Meta Instagram Basic Display API (Advanced)
1. Create a Meta Developer account
2. Create an app and get Instagram Basic Display product
3. Go through Instagram review process
4. Implement OAuth flow to get user access tokens
5. Fetch posts via API calls

For now, this shows a styled placeholder that looks like Instagram posts
and directs users to follow @chicken1of1 on Instagram.
*/
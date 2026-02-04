import type { Metadata } from 'next'
import { Inter, Oswald } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ScrollAnimateProvider from '@/components/ScrollAnimateProvider'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const oswald = Oswald({ subsets: ['latin'], variable: '--font-oswald' })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://chicken1of1.com'),
  title: {
    default: 'Chicken1of1 – UFC Sports Cards & Live Breaks',
    template: '%s | Chicken1of1',
  },
  description:
    'Bauk Bauk Baby — UFC & Entertainment Card Breaks by Chicken1of1. Join the Coop community for authentic breaks, card collecting education, and the best UFC card break experience. Watch live on Whatnot.',
  keywords: [
    'UFC cards',
    'sports cards',
    'card breaks',
    'live breaks',
    'Chicken1of1',
    'Bauk Bauk Baby',
    'UFC sports cards',
    'Whatnot',
  ],
  authors: [{ name: 'Chicken1of1' }],
  creator: 'Chicken1of1',
  publisher: 'Chicken1of1',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://chicken1of1.com',
    siteName: 'Chicken1of1',
    title: 'Chicken1of1 – UFC Sports Cards & Live Breaks',
    description:
      'Bauk Bauk Baby — UFC & Entertainment Card Breaks by Chicken1of1. Join the Coop community for authentic breaks, card collecting education, and the best UFC card break experience.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Chicken1of1 - UFC Sports Cards & Live Breaks',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chicken1of1 – UFC Sports Cards & Live Breaks',
    description:
      'Bauk Bauk Baby — UFC & Entertainment Card Breaks by Chicken1of1. Join the Coop community for authentic breaks, card collecting education, and the best UFC card break experience.',
    images: ['/og-image.png'],
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || 'PG9vYuoUphkaJP-p7voU6xdVkv2K3-cvwhR2UHy6k2k', // Google Search Console verification
    other: {
      'facebook-domain-verification': process.env.FACEBOOK_DOMAIN_VERIFICATION || '',
      'instagram-domain-verification': process.env.INSTAGRAM_DOMAIN_VERIFICATION || '',
      'youtube-channel-verification': process.env.YOUTUBE_CHANNEL_VERIFICATION || '',
      'tiktok-domain-verification': process.env.TIKTOK_DOMAIN_VERIFICATION || '',
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/icon.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Chicken1of1',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#f59e0b',
}

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': ['Organization', 'LocalBusiness'],
  name: 'Chicken1of1',
  alternateName: 'Chicken1of1 Card Breaks',
  additionalType: 'BuyingService',
  description:
    'UFC & Entertainment Card Breaks and Sealed Product Buying Service - Join the Coop community for authentic breaks, card collecting education, and the best UFC card break experience. We also buy sealed UFC product.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://chicken1of1.com',
  logo: `${
    process.env.NEXT_PUBLIC_SITE_URL || 'https://chicken1of1.com'
  }/logo-chicken1of1.svg`,
  image: `${
    process.env.NEXT_PUBLIC_SITE_URL || 'https://chicken1of1.com'
  }/og-image.png`,
  founder: {
    '@type': 'Person',
    name: 'Chicken1of1',
  },
  foundingDate: '2021',
  slogan: 'Bauk Bauk Baby',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    email: 'hello@chicken1of1.com',
    availableLanguage: 'English',
  },
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'US',
  },
  serviceArea: {
    '@type': 'Country',
    name: 'United States',
  },
  sameAs: [
    process.env.NEXT_PUBLIC_INSTAGRAM_URL ||
      'https://www.instagram.com/chicken1of1',
    process.env.NEXT_PUBLIC_WHATNOT_URL ||
      'https://www.whatnot.com/s/muoENH2W',
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'UFC Card Breaking Services',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Random Team UFC Card Breaks',
          description: 'Live UFC card breaks with random team assignments',
          category: 'Sports Card Breaking',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Pick Your Team (PYT) UFC Card Breaks',
          description: 'Live UFC card breaks where you choose your team',
          category: 'Sports Card Breaking',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Hit Draft UFC Card Breaks',
          description: 'UFC card breaks with draft-style hit selection',
          category: 'Sports Card Breaking',
        },
      },
    ],
  },
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Chicken1of1',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://chicken1of1.com',
  description:
    'UFC & Entertainment Card Breaks - Join the Coop community for authentic breaks, card collecting education, and the best UFC card break experience',
  publisher: {
    '@type': 'Organization',
    name: 'Chicken1of1',
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://chicken1of1.com'}/faq/?search={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
  mainEntity: {
    '@type': 'ItemList',
    name: 'Main Navigation',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Live Breaks',
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://chicken1of1.com'}/live`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Gallery',
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://chicken1of1.com'}/gallery`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'About',
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://chicken1of1.com'}/about`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: 'FAQ',
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://chicken1of1.com'}/faq`,
      },
      {
        '@type': 'ListItem',
        position: 5,
        name: 'Sell To Us',
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://chicken1of1.com'}/sell-to-us`,
      },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const ga4Id = process.env.NEXT_PUBLIC_GA4_ID
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID

  return (
    <html lang="en" className={`${inter.variable} ${oswald.variable} font-sans`}>
      <head>
        {/* Ahrefs Site Verification */}
        <meta name="ahrefs-site-verification" content="001a6b26b5cf995413693e209da203c733a30cf2c6b299bb83f1f0b95b432fc4" />

        {/* Preload critical resources */}
        <link
          rel="preload"
          href="/logo-chicken1of1.svg"
          as="image"
          type="image/svg+xml"
        />
        <link
          rel="preload"
          href="/og-image.png"
          as="image"
          type="image/png"
        />

        {/* DNS prefetch for external domains */}
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        <link rel="dns-prefetch" href="//www.instagram.com" />
        <link rel="dns-prefetch" href="//www.whatnot.com" />
        <link rel="dns-prefetch" href="//analytics.ahrefs.com" />

        {/* Preconnect for critical third party domains */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />

        {/* Google Analytics 4 */}
        {ga4Id && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${ga4Id}');
              `}
            </Script>
          </>
        )}

        {/* Google Tag Manager */}
        {gtmId && (
          <Script id="google-tag-manager" strategy="afterInteractive">
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${gtmId}');
            `}
          </Script>
        )}

        {/* Ahrefs Web Analytics */}
        <script
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="t6KLl6dX4C8OrSdwWkxegg"
          async
        />
      </head>
      <body>
        {/* Google Tag Manager (noscript) */}
        {gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            ></iframe>
          </noscript>
        )}

        <ScrollAnimateProvider />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
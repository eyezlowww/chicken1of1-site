import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Chicken1of1 – UFC Sports Cards & Live Breaks',
    template: '%s | Chicken1of1',
  },
  description:
    'Bauk Bauk Baby — UFC & Entertainment Card Breaks by Chicken1of1. Live rips, clean hits, zero fluff. Watch live on Whatnot and Fanatics Live.',
  keywords: [
    'UFC cards',
    'sports cards',
    'card breaks',
    'live breaks',
    'Chicken1of1',
    'Bauk Bauk Baby',
    'UFC sports cards',
    'Whatnot',
    'Fanatics Live',
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
      'Bauk Bauk Baby — UFC & Entertainment Card Breaks by Chicken1of1. Live rips, clean hits, zero fluff.',
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
      'Bauk Bauk Baby — UFC & Entertainment Card Breaks by Chicken1of1. Live rips, clean hits, zero fluff.',
    images: ['/og-image.png'],
  },
  verification: {
    google: '',
  },
}

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Chicken1of1',
  description:
    'UFC & Entertainment Card Breaks - Live rips, clean hits, zero fluff',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://chicken1of1.com',
  logo: `${
    process.env.NEXT_PUBLIC_SITE_URL || 'https://chicken1of1.com'
  }/logo-chicken1of1.svg`,
  sameAs: [
    process.env.NEXT_PUBLIC_INSTAGRAM_URL ||
      'https://www.instagram.com/chicken1of1',
    process.env.NEXT_PUBLIC_WHATNOT_URL ||
      'https://www.whatnot.com/s/muoENH2W',
    process.env.NEXT_PUBLIC_FANATICS_URL ||
      'https://www.fanatics.live/shops/chicken1of1',
  ],
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Chicken1of1',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://chicken1of1.com',
  description:
    'UFC & Entertainment Card Breaks - Live rips, clean hits, zero fluff',
  publisher: {
    '@type': 'Organization',
    name: 'Chicken1of1',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const chatProvider = process.env.NEXT_PUBLIC_CHAT_PROVIDER
  const crispWebsiteId = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID
  const tidioKey = process.env.NEXT_PUBLIC_TIDIO_PUBLISHABLE_KEY
  const ga4Id = process.env.NEXT_PUBLIC_GA4_ID
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID

  return (
    <html lang="en" className={inter.className}>
      <head>
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

        {/* Crisp Chat */}
        {chatProvider === 'crisp' && crispWebsiteId && (
          <Script id="crisp-chat" strategy="afterInteractive">
            {`
              window.$crisp=[];
              window.CRISP_WEBSITE_ID="${crispWebsiteId}";
              (function(){
                d=document;
                s=d.createElement("script");
                s.src="https://client.crisp.chat/l.js";
                s.async=1;
                d.getElementsByTagName("head")[0].appendChild(s);
              })();
            `}
          </Script>
        )}

        {/* Tidio Chat */}
        {chatProvider === 'tidio' && tidioKey && (
          <Script
            src={`//code.tidio.co/${tidioKey}.js`}
            strategy="afterInteractive"
          />
        )}
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

        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
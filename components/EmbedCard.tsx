'use client'

import { useState } from 'react'
import Link from 'next/link'

interface EmbedCardProps {
  title: string
  platform: 'whatnot' | 'fanatics' | 'youtube' | 'twitch' | 'custom'
  embedUrl?: string
  fallbackUrl: string
  customEmbedCode?: string
}

export default function EmbedCard({
  title,
  platform,
  embedUrl,
  fallbackUrl,
  customEmbedCode,
}: EmbedCardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleIframeLoad = () => {
    setIsLoading(false)
  }

  const handleIframeError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  const getPlatformIcon = () => {
    switch (platform) {
      case 'youtube':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
        )
      case 'twitch':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
          </svg>
        )
      default:
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7Z" />
          </svg>
        )
    }
  }

  const renderEmbed = () => {
    if (customEmbedCode) {
      return (
        <div
          dangerouslySetInnerHTML={{ __html: customEmbedCode }}
          className="w-full h-full"
        />
      )
    }

    if (!embedUrl) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-6">
          <div className="text-gray-400 mb-4">{getPlatformIcon()}</div>
          <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
          <p className="text-gray-400 mb-4">
            If the player doesn&apos;t load, open the show in a new tab
          </p>
          <Link
            href={fallbackUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            Open in {platform.charAt(0).toUpperCase() + platform.slice(1)}
          </Link>
        </div>
      )
    }

    return (
      <>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-dark-800">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        )}
        {hasError ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <div className="text-gray-400 mb-4">{getPlatformIcon()}</div>
            <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
            <p className="text-gray-400 mb-4">
              Stream couldn&apos;t load. Open in a new tab instead.
            </p>
            <Link
              href={fallbackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Open in {platform.charAt(0).toUpperCase() + platform.slice(1)}
            </Link>
          </div>
        ) : (
          <iframe
            src={embedUrl}
            title={title}
            className="w-full h-full border-0 rounded-lg"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          />
        )}
      </>
    )
  }

  return (
    <div className="relative w-full aspect-video bg-dark-800 rounded-lg overflow-hidden border border-dark-700">
      {renderEmbed()}
    </div>
  )
}

/*
Example usage for custom embed:

// Shopify Buy Button Example (commented for future use)
const shopifyEmbedExample = `
<div id='product-component-1234567890'></div>
<script type="text/javascript">
(function () {
  var scriptURL = 'https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js';
  if (window.ShopifyBuy) {
    if (window.ShopifyBuy.UI) {
      ShopifyBuyInit();
    } else {
      loadScript();
    }
  } else {
    loadScript();
  }
  function loadScript() {
    var script = document.createElement('script');
    script.async = true;
    script.src = scriptURL;
    (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(script);
    script.onload = ShopifyBuyInit;
  }
  function ShopifyBuyInit() {
    var client = ShopifyBuy.buildClient({
      domain: 'your-shop-name.myshopify.com',
      storefrontAccessToken: 'your-storefront-access-token',
    });
    ShopifyBuy.UI.onReady(client).then(function (ui) {
      ui.createComponent('product', {
        id: 'your-product-id',
        node: document.getElementById('product-component-1234567890'),
        moneyFormat: '${{amount}}',
        options: {
          product: {
            styles: {
              product: {
                "@media (min-width: 601px)": {
                  "max-width": "calc(25% - 20px)",
                  "margin-left": "20px",
                  "margin-bottom": "50px"
                }
              }
            }
          }
        }
      });
    });
  }
})();
</script>
`;

// Stripe Payment Link Example (commented for future use)
const stripePaymentLink = "https://buy.stripe.com/your-payment-link-id";
// Usage: <Link href={stripePaymentLink} className="btn-primary">Buy Now</Link>
*/
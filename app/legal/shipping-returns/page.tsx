import type { Metadata } from 'next'
import Hero from '@/components/Hero'
import Section from '@/components/Section'

export const metadata: Metadata = {
  title: 'Shipping & Returns - Chicken1of1 Legal',
  description:
    'Shipping and returns policy for Chicken1of1 UFC card breaks. Learn about shipping times, international shipping, and return procedures.',
}

export default function ShippingReturnsPage() {
  return (
    <>
      <Hero
        title="Shipping & Returns"
        subtitle="Delivery & Return Information"
        description="Everything you need to know about shipping and returns"
        showCTA={false}
      />

      <Section>
        <div className="max-w-4xl mx-auto prose prose-invert">
          <div className="text-gray-300 space-y-8">
            <div>
              <p className="text-sm text-gray-400 mb-8">
                Last updated: {new Date().toLocaleDateString()}
              </p>

              <h2 className="text-2xl font-bold text-white mb-4">
                1. Shipping Information
              </h2>
              <h3 className="text-lg font-semibold text-white mb-2">
                1.1 Processing Time
              </h3>
              <p>
                Cards are typically shipped within 3-5 business days after a
                break is completed. Processing may take longer during peak
                periods or holidays.
              </p>

              <h3 className="text-lg font-semibold text-white mb-2 mt-4">
                1.2 Shipping Methods
              </h3>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <strong>Standard Shipping:</strong> 3-7 business days
                </li>
                <li>
                  <strong>Expedited Shipping:</strong> 1-3 business days
                  (additional fees apply)
                </li>
                <li>
                  <strong>International Shipping:</strong> 7-21 business days
                  (varies by country)
                </li>
              </ul>

              <h3 className="text-lg font-semibold text-white mb-2 mt-4">
                1.3 Packaging Standards
              </h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Cards shipped in protective sleeves and top loaders</li>
                <li>Bubble mailers or boxes depending on order size</li>
                <li>Insurance included for high-value shipments</li>
                <li>Tracking provided for all shipments</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                2. What's Included
              </h2>
              <h3 className="text-lg font-semibold text-white mb-2">
                2.1 Base Cards
              </h3>
              <p>
                Base cards are included unless specifically labeled as "hits
                only" breaks. Base cards help complete sets and add value to
                your break.
              </p>

              <h3 className="text-lg font-semibold text-white mb-2 mt-4">
                2.2 Inserts and Parallels
              </h3>
              <p>
                All inserts, parallels, and special cards pulled for your team
                or slot are included in your shipment.
              </p>

              <h3 className="text-lg font-semibold text-white mb-2 mt-4">
                2.3 Documentation
              </h3>
              <p>
                Each shipment includes a break summary showing which cards were
                pulled from which packs/boxes.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                3. International Shipping
              </h2>
              <h3 className="text-lg font-semibold text-white mb-2">
                3.1 Available Countries
              </h3>
              <p>
                We ship internationally to most countries. Some restrictions may
                apply based on customs regulations and carrier limitations.
              </p>

              <h3 className="text-lg font-semibold text-white mb-2 mt-4">
                3.2 Customs and Duties
              </h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Buyers are responsible for all customs duties and taxes</li>
                <li>Packages may be subject to inspection by customs</li>
                <li>Delivery times may vary based on customs processing</li>
                <li>We are not responsible for packages held or seized by customs</li>
              </ul>

              <h3 className="text-lg font-semibold text-white mb-2 mt-4">
                3.3 International Shipping Costs
              </h3>
              <p>
                International shipping costs are calculated based on weight,
                dimensions, and destination. Costs will be clearly displayed
                before purchase confirmation.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                4. Damaged Items
              </h2>
              <h3 className="text-lg font-semibold text-white mb-2">
                4.1 Reporting Damage
              </h3>
              <p>
                If your cards arrive damaged, please contact us within 48 hours
                of delivery with photos of the damaged items and packaging.
              </p>

              <h3 className="text-lg font-semibold text-white mb-2 mt-4">
                4.2 Our Response
              </h3>
              <ul className="list-disc list-inside space-y-1">
                <li>We will investigate all damage claims promptly</li>
                <li>Replacement cards may be provided when available</li>
                <li>Insurance claims will be filed for high-value items</li>
                <li>We work with carriers to prevent future damage</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                5. Returns Policy
              </h2>
              <h3 className="text-lg font-semibold text-white mb-2">
                5.1 Break Participation
              </h3>
              <p>
                <strong>All sales are final once a break has started.</strong>{' '}
                Card breaking involves chance, and we cannot guarantee specific
                outcomes or card values.
              </p>

              <h3 className="text-lg font-semibold text-white mb-2 mt-4">
                5.2 Pre-Break Cancellations
              </h3>
              <p>
                Cancellations may be accepted before a break begins, subject to
                our discretion and any applicable processing fees.
              </p>

              <h3 className="text-lg font-semibold text-white mb-2 mt-4">
                5.3 Mistake Resolution
              </h3>
              <p>
                If we make an error in card allocation or shipping, we will work
                promptly to correct the mistake at no additional cost to you.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                6. Preorders
              </h2>
              <h3 className="text-lg font-semibold text-white mb-2">
                6.1 Preorder Terms
              </h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Preorders are accepted for upcoming product releases</li>
                <li>Payment is typically required in full at time of preorder</li>
                <li>Release dates are estimates and may change</li>
                <li>Preorders may be cancelled before product receipt</li>
              </ul>

              <h3 className="text-lg font-semibold text-white mb-2 mt-4">
                6.2 Preorder Delays
              </h3>
              <p>
                If a preordered product is significantly delayed or cancelled by
                the manufacturer, we will provide a full refund or product
                substitution option.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                7. Giveaways and Free Items
              </h2>
              <h3 className="text-lg font-semibold text-white mb-2">
                7.1 No Purchase Necessary
              </h3>
              <p>
                Giveaways are free to enter and no purchase is necessary unless
                specifically stated otherwise.
              </p>

              <h3 className="text-lg font-semibold text-White mb-2 mt-4">
                7.2 Giveaway Shipping
              </h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Free shipping is provided for giveaway items</li>
                <li>Winners are responsible for providing accurate addresses</li>
                <li>International giveaway shipping may be limited</li>
                <li>Giveaway items cannot be exchanged or returned</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                8. Break Participation Terms
              </h2>
              <h3 className="text-lg font-semibold text-white mb-2">
                8.1 Recording Consent
              </h3>
              <p>
                All breaks are recorded for transparency and security. By
                participating, you consent to being featured in recordings and
                live streams.
              </p>

              <h3 className="text-lg font-semibold text-white mb-2 mt-4">
                8.2 Break Formats
              </h3>
              <p>
                Break format rules will be clearly explained before each break.
                Participants are responsible for understanding the format and
                their potential card allocation.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                9. Contact Information
              </h2>
              <p>
                For shipping questions, damage reports, or other concerns:
              </p>
              <ul className="list-none space-y-1 mt-2">
                <li>
                  Email:{' '}
                  <a
                    href="mailto:shipping@chicken1of1.com"
                    className="text-primary-400 hover:text-primary-300"
                  >
                    shipping@chicken1of1.com
                  </a>
                </li>
                <li>
                  Instagram DM:{' '}
                  <a
                    href="https://www.instagram.com/chicken1of1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-400 hover:text-primary-300"
                  >
                    @chicken1of1
                  </a>
                </li>
              </ul>

              <p className="mt-4 text-sm text-gray-400">
                Please include your order number and detailed description when
                contacting us about shipping issues.
              </p>
            </div>
          </div>
        </div>
      </Section>
    </>
  )
}
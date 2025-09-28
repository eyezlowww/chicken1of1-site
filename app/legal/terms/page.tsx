import type { Metadata } from 'next'
import Hero from '@/components/Hero'
import Section from '@/components/Section'

export const metadata: Metadata = {
  title: 'Terms of Service - Chicken1of1 Legal',
  description:
    'Terms of service for Chicken1of1 UFC card breaking services. Age requirements, liability limitations, and break participation terms.',
}

export default function TermsPage() {
  return (
    <>
      <Hero
        title="Terms of Service"
        subtitle="Legal Terms & Conditions"
        description="Please read these terms carefully before using our services"
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
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing and using Chicken1of1 services, including
                participating in card breaks, watching live streams, or using
                this website, you accept and agree to be bound by the terms and
                provision of this agreement.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                2. Age Requirements
              </h2>
              <p>
                You must be at least 18 years old to purchase products or
                participate in paid card breaks. Individuals under 18 may watch
                streams and participate in free giveaways with parental consent.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                3. Card Break Services
              </h2>
              <h3 className="text-lg font-semibold text-white mb-2">
                3.1 Break Formats
              </h3>
              <p>
                We offer various break formats including Random Team, Pick Your
                Team (PYT), Divisional, and Hit Draft. Format rules will be
                clearly explained before each break.
              </p>

              <h3 className="text-lg font-semibold text-white mb-2">
                3.2 No Guaranteed Hits
              </h3>
              <p>
                Card breaking involves chance. We make no guarantees about the
                value, rarity, or condition of cards pulled during breaks. All
                sales are final once a break has started.
              </p>

              <h3 className="text-lg font-semibold text-white mb-2">
                3.3 Recording Consent
              </h3>
              <p>
                All breaks are recorded and may be streamed live. By
                participating, you consent to being featured in recordings and
                live streams.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                4. Order Acceptance
              </h2>
              <p>
                All orders are subject to acceptance. We reserve the right to
                refuse or cancel any order at our discretion, including but not
                limited to situations involving pricing errors, suspected fraud,
                or unavailable inventory.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-White mb-4">
                5. Giveaways and Promotions
              </h2>
              <p>
                Giveaways are free to enter and no purchase is necessary unless
                otherwise stated. Giveaway rules will be clearly stated before
                each promotion. Participants must comply with all applicable
                laws and regulations.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                6. Intellectual Property
              </h2>
              <p>
                All content on this website, including logos, designs, and text,
                is owned by Chicken1of1 or used with permission. You may not
                reproduce, distribute, or create derivative works without
                written permission.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                7. Prohibited Conduct
              </h2>
              <p>You agree not to:</p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Use our services for any unlawful purpose</li>
                <li>Harass, abuse, or harm other participants</li>
                <li>Attempt to manipulate break outcomes</li>
                <li>Upload malicious code or attempt to hack our systems</li>
                <li>Impersonate others or provide false information</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                8. Limitation of Liability
              </h2>
              <p>
                Chicken1of1 shall not be liable for any indirect, incidental,
                special, consequential, or punitive damages, including loss of
                profits, data, or other intangible losses resulting from your
                use of our services.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                9. Disclaimers
              </h2>
              <p>
                We are not affiliated with UFC, Zuffa, Topps, Panini, Fanatics,
                or Whatnot. Card images and trademarks belong to their
                respective owners. Sports card collecting involves inherent
                risks and market volatility.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                10. Governing Law
              </h2>
              <p>
                These terms shall be governed by and construed in accordance
                with the laws of [Your State/Country], without regard to its
                conflict of law provisions.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                11. Changes to Terms
              </h2>
              <p>
                We reserve the right to modify these terms at any time. Changes
                will be effective immediately upon posting. Continued use of our
                services constitutes acceptance of revised terms.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                12. Contact Information
              </h2>
              <p>
                If you have questions about these terms, please contact us at{' '}
                <a
                  href="mailto:hello@chicken1of1.com"
                  className="text-primary-400 hover:text-primary-300"
                >
                  hello@chicken1of1.com
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </Section>
    </>
  )
}
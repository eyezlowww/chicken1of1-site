import type { Metadata } from 'next'
import Hero from '@/components/Hero'
import Section from '@/components/Section'

export const metadata: Metadata = {
  title: 'Privacy Policy - Chicken1of1 Legal',
  description:
    'Privacy policy for Chicken1of1. Learn how we collect, use, and protect your personal information when using our UFC card breaking services.',
}

export default function PrivacyPage() {
  return (
    <>
      <Hero
        title="Privacy Policy"
        subtitle="Your Privacy Matters"
        description="How we collect, use, and protect your information"
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
                1. Information We Collect
              </h2>
              <h3 className="text-lg font-semibold text-white mb-2">
                1.1 Information You Provide
              </h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Contact information (name, email, phone)</li>
                <li>Shipping addresses for card delivery</li>
                <li>Payment information (processed securely by third parties)</li>
                <li>Communications with our support team</li>
                <li>Break preferences and participation history</li>
              </ul>

              <h3 className="text-lg font-semibold text-white mb-2 mt-4">
                1.2 Automatically Collected Information
              </h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Website usage data and analytics</li>
                <li>Device information and IP addresses</li>
                <li>Cookies and similar tracking technologies</li>
                <li>Live stream viewing data</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                2. How We Use Your Information
              </h2>
              <ul className="list-disc list-inside space-y-1">
                <li>Process and fulfill break orders</li>
                <li>Communicate about breaks and services</li>
                <li>Provide customer support</li>
                <li>Improve our website and services</li>
                <li>Send promotional materials (with consent)</li>
                <li>Comply with legal obligations</li>
                <li>Prevent fraud and ensure security</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                3. Cookies and Tracking
              </h2>
              <p>
                We use cookies and similar technologies to enhance your
                experience, analyze website traffic, and personalize content.
                You can control cookie preferences through your browser
                settings.
              </p>

              <h3 className="text-lg font-semibold text-white mb-2 mt-4">
                3.1 Types of Cookies
              </h3>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <strong>Essential:</strong> Required for website functionality
                </li>
                <li>
                  <strong>Analytics:</strong> Help us understand site usage (Google Analytics)
                </li>
                <li>
                  <strong>Marketing:</strong> Used for targeted advertising (with consent)
                </li>
                <li>
                  <strong>Functional:</strong> Remember your preferences and settings
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                4. Third-Party Services
              </h2>
              <p>We work with trusted third-party services:</p>

              <h3 className="text-lg font-semibold text-white mb-2 mt-4">
                4.1 Hosting and Infrastructure
              </h3>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <strong>Vercel:</strong> Website hosting and performance
                </li>
              </ul>

              <h3 className="text-lg font-semibold text-white mb-2 mt-4">
                4.2 Analytics and Chat
              </h3>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <strong>Google Analytics:</strong> Website traffic analysis
                </li>
                <li>
                  <strong>Chat Providers:</strong> Customer support (Crisp/Tidio)
                </li>
              </ul>

              <h3 className="text-lg font-semibold text-white mb-2 mt-4">
                4.3 Streaming Platforms
              </h3>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <strong>Whatnot:</strong> Live breaking platform
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                5. Data Retention
              </h2>
              <p>
                We retain your information only as long as necessary to provide
                services and comply with legal obligations:
              </p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>
                  <strong>Order Information:</strong> 7 years for tax/legal requirements
                </li>
                <li>
                  <strong>Account Data:</strong> Until account deletion requested
                </li>
                <li>
                  <strong>Marketing Data:</strong> Until consent withdrawn
                </li>
                <li>
                  <strong>Analytics Data:</strong> Up to 26 months (Google Analytics)
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                6. Your Rights
              </h2>
              <p>You have the right to:</p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Access your personal information</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Object to processing</li>
                <li>Data portability</li>
                <li>Withdraw consent for marketing</li>
              </ul>

              <p className="mt-4">
                To exercise these rights, contact us at{' '}
                <a
                  href="mailto:hello@chicken1of1.com"
                  className="text-primary-400 hover:text-primary-300"
                >
                  hello@chicken1of1.com
                </a>
                .
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                7. Data Security
              </h2>
              <p>
                We implement appropriate technical and organizational measures
                to protect your information, including:
              </p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Secure HTTPS encryption</li>
                <li>Limited access to personal data</li>
                <li>Regular security assessments</li>
                <li>Secure payment processing</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                8. International Transfers
              </h2>
              <p>
                Your information may be transferred to and processed in
                countries other than your own. We ensure appropriate safeguards
                are in place for such transfers.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                9. Children&apos;s Privacy
              </h2>
              <p>
                Our services are not directed to children under 18. We do not
                knowingly collect personal information from children without
                parental consent.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                10. Changes to This Policy
              </h2>
              <p>
                We may update this privacy policy periodically. We will notify
                you of material changes by posting the updated policy on our
                website.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                11. Contact Us
              </h2>
              <p>
                If you have questions about this privacy policy, please contact
                us:
              </p>
              <ul className="list-none space-y-1 mt-2">
                <li>
                  Email:{' '}
                  <a
                    href="mailto:hello@chicken1of1.com"
                    className="text-primary-400 hover:text-primary-300"
                  >
                    hello@chicken1of1.com
                  </a>
                </li>
                <li>
                  Instagram:{' '}
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
            </div>
          </div>
        </div>
      </Section>
    </>
  )
}
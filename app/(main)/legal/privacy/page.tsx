import type { Metadata } from 'next'
import Hero from '@/components/Hero'
import Section from '@/components/Section'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy - Chicken1of1 Legal',
  description:
    'Privacy policy for Chicken1of1. Learn how we collect, use, and protect your personal information when using our UFC card breaking services.',
}

export default function PrivacyPage() {
  const lastUpdated = 'June 12, 2026'

  return (
    <>
      <Hero
        title="Privacy Policy"
        subtitle="Your Privacy Matters"
        description="How we collect, use, and protect your information"
        showCTA={false}
      />

      <Section>
        <div className="max-w-4xl mx-auto">
          <div className="text-gray-300 space-y-10">
            <p className="text-sm text-gray-400">Last updated: {lastUpdated}</p>

            {/* Overview */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Overview</h2>
              <p className="leading-relaxed">
                SAP Thumbprint Holdings, LLC (&quot;Chicken1of1,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to
                protecting your privacy. This Privacy Policy explains how we collect, use, disclose,
                and safeguard your information when you visit chicken1of1.com and use our card breaking
                services. Please read this policy carefully. If you do not agree with its terms, please
                do not use our Services.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>

              <h3 className="text-lg font-semibold text-white mb-2">2.1 Information You Provide</h3>
              <p className="leading-relaxed mb-3">
                We collect information you voluntarily provide when using our Services, including:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Name and contact information (email address, phone number)</li>
                <li>Shipping address for card delivery</li>
                <li>Communications with our support team (email, Instagram DMs, contact form submissions)</li>
                <li>Break preferences and participation history</li>
                <li>Seller information if you use our Sell To Us service (product details, payment info)</li>
                <li>Any additional information you choose to provide</li>
              </ul>

              <h3 className="text-lg font-semibold text-white mb-2 mt-6">2.2 Automatically Collected Information</h3>
              <p className="leading-relaxed mb-3">
                When you visit our website, we may automatically collect:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Device information (browser type, operating system, device type)</li>
                <li>IP address and general geographic location</li>
                <li>Pages visited, time spent on pages, and referring website or search terms</li>
                <li>Analytics data through Google Analytics and Ahrefs Analytics</li>
                <li>Cookies and similar tracking technologies (see Section 4)</li>
              </ul>

              <h3 className="text-lg font-semibold text-white mb-2 mt-6">2.3 Third-Platform Information</h3>
              <p className="leading-relaxed">
                When you interact with us on Whatnot, Fanatics Live, or Instagram, those platforms
                collect information according to their own privacy policies, which we do not control.
                We may receive limited information from those platforms (such as your username or
                order details) in connection with your purchases or interactions.
              </p>
            </section>

            {/* How We Use Information */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Information</h2>
              <p className="leading-relaxed mb-3">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Process and fulfill break orders and shipping</li>
                <li>Communicate with you about your orders, breaks, and services</li>
                <li>Provide customer support and respond to inquiries</li>
                <li>Improve our website, content, and services</li>
                <li>Analyze website traffic and usage patterns</li>
                <li>Send promotional materials and break announcements (with your consent)</li>
                <li>Comply with legal obligations and prevent fraud</li>
                <li>Protect the rights and safety of our team and community</li>
              </ul>
            </section>

            {/* Cookies */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Cookies and Tracking Technologies</h2>
              <p className="leading-relaxed mb-4">
                We use cookies and similar technologies to enhance your experience. The types of
                cookies we use:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <strong className="text-white">Essential cookies:</strong> Required for basic website
                  functionality — always active
                </li>
                <li>
                  <strong className="text-white">Analytics cookies:</strong> Help us understand how
                  visitors use our site (Google Analytics, Ahrefs Analytics)
                </li>
                <li>
                  <strong className="text-white">Functional cookies:</strong> Remember your preferences
                  and settings
                </li>
                <li>
                  <strong className="text-white">Marketing cookies:</strong> Used for targeted
                  advertising only with your consent
                </li>
              </ul>
              <p className="leading-relaxed mt-4">
                You can control and disable cookies through your browser settings. Note that disabling
                certain cookies may affect some features of the website.
              </p>
              <p className="leading-relaxed mt-4">
                California residents: see Section 8 below for your CCPA rights, including the right
                to opt out of certain data sharing.
              </p>
            </section>

            {/* Third-Party Services */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Third-Party Services</h2>
              <p className="leading-relaxed mb-4">
                We work with the following third-party services that may receive information about
                your use of our Services. These services have their own privacy policies.
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <strong className="text-white">Hosting &amp; Infrastructure:</strong> Vercel, Cloudflare
                </li>
                <li>
                  <strong className="text-white">Analytics:</strong> Google Analytics, Ahrefs Analytics
                </li>
                <li>
                  <strong className="text-white">Email:</strong> Resend (transactional email from
                  contact form submissions)
                </li>
                <li>
                  <strong className="text-white">Streaming Platforms:</strong> Whatnot, Fanatics Live
                  (live break platform transactions)
                </li>
                <li>
                  <strong className="text-white">Social Media:</strong> Instagram (community and
                  customer communications)
                </li>
                <li>
                  <strong className="text-white">Chat Support:</strong> Crisp (if enabled — customer
                  support chat widget)
                </li>
                <li>
                  <strong className="text-white">Tag Manager:</strong> Google Tag Manager (manages
                  marketing and analytics scripts)
                </li>
              </ul>
              <p className="leading-relaxed mt-4">
                We encourage you to review the privacy policies of these third-party services.
              </p>
            </section>

            {/* Information Sharing */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Information Sharing</h2>
              <p className="leading-relaxed mb-4">
                <strong className="text-white">We do not sell your personal information to third parties.</strong>{' '}
                We may share your information only in the following circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <strong className="text-white">Service Providers:</strong> Third-party companies
                  listed in Section 5 that help us operate our Services, under confidentiality
                  obligations
                </li>
                <li>
                  <strong className="text-white">Legal Requirements:</strong> When required by law,
                  regulation, subpoena, or court order
                </li>
                <li>
                  <strong className="text-white">Protection:</strong> To protect the rights, privacy,
                  safety, or property of Chicken1of1, our team, or our community
                </li>
                <li>
                  <strong className="text-white">Business Transfers:</strong> In connection with a
                  merger, acquisition, bankruptcy, or sale of all or part of our assets
                </li>
              </ul>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Data Security</h2>
              <p className="leading-relaxed">
                We implement reasonable technical and organizational security measures to protect
                your information, including:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-4">
                <li>TLS/SSL encryption for data in transit</li>
                <li>Secure hosting infrastructure (Vercel, Cloudflare)</li>
                <li>Limited access to personal data on a need-to-know basis</li>
                <li>Secure payment processing via third-party platforms (we do not store payment card data)</li>
              </ul>
              <p className="leading-relaxed mt-4">
                However, no method of transmission over the internet is 100% secure. We cannot
                guarantee absolute security of your data. In the event of a data breach that affects
                your rights and freedoms, we will notify affected individuals as required by applicable law.
              </p>
            </section>

            {/* California Privacy Rights */}
            <section id="ccpa">
              <h2 className="text-2xl font-bold text-white mb-4">8. California Privacy Rights (CCPA/CPRA)</h2>
              <p className="leading-relaxed mb-4">
                If you are a California resident, the California Consumer Privacy Act (CCPA) and
                California Privacy Rights Act (CPRA) provide you with additional rights regarding
                your personal information:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <strong className="text-white">Right to Know:</strong> You may request disclosure
                  of the categories and specific pieces of personal information we have collected
                  about you, and how we use and share it
                </li>
                <li>
                  <strong className="text-white">Right to Delete:</strong> You may request deletion
                  of your personal information, subject to certain legal exceptions
                </li>
                <li>
                  <strong className="text-white">Right to Correct:</strong> You may request correction
                  of inaccurate personal information
                </li>
                <li>
                  <strong className="text-white">Right to Opt-Out of Sale/Sharing:</strong> We do not
                  sell your personal information. If this changes, we will provide a &quot;Do Not Sell or
                  Share My Personal Information&quot; link
                </li>
                <li>
                  <strong className="text-white">Right to Limit Sensitive Data Use:</strong> You may
                  request that we limit the use of your sensitive personal information to what is
                  necessary to provide the Services
                </li>
                <li>
                  <strong className="text-white">Right to Non-Discrimination:</strong> We will not
                  discriminate against you for exercising any of your CCPA/CPRA rights
                </li>
              </ul>
              <p className="leading-relaxed mt-4">
                To exercise your California privacy rights, contact us at{' '}
                <a
                  href="mailto:hello@chicken1of1.com"
                  className="text-primary-400 hover:text-primary-300"
                >
                  hello@chicken1of1.com
                </a>
                . We will respond to verifiable consumer requests within 45 days.
              </p>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Data Retention</h2>
              <p className="leading-relaxed">
                We retain your personal information only as long as necessary to provide our Services
                and comply with legal obligations. Specifically:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-4">
                <li>
                  <strong className="text-white">Order &amp; Shipping Information:</strong> Minimum 3
                  years to support potential disputes; 7 years for tax and legal compliance
                </li>
                <li>
                  <strong className="text-white">Contact Form Submissions:</strong> Up to 2 years
                </li>
                <li>
                  <strong className="text-white">Marketing Consent:</strong> Until you withdraw
                  consent or unsubscribe
                </li>
                <li>
                  <strong className="text-white">Analytics Data:</strong> Per each analytics
                  provider&apos;s retention policy (Google Analytics default: 26 months)
                </li>
              </ul>
              <p className="leading-relaxed mt-4">
                When data is no longer needed, we delete or anonymize it in accordance with
                applicable law.
              </p>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Your Rights</h2>
              <p className="leading-relaxed mb-4">
                Depending on your location and applicable law, you may have the right to:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Access the personal information we hold about you</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your personal information</li>
                <li>Object to or restrict certain processing of your data</li>
                <li>Data portability (receive your data in a structured, machine-readable format)</li>
                <li>Withdraw consent for marketing communications at any time</li>
              </ul>
              <p className="leading-relaxed mt-4">
                To exercise any of these rights, contact us at{' '}
                <a
                  href="mailto:hello@chicken1of1.com"
                  className="text-primary-400 hover:text-primary-300"
                >
                  hello@chicken1of1.com
                </a>
                . We will respond within 30 days.
              </p>
            </section>

            {/* Do Not Track */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">11. Do Not Track Signals</h2>
              <p className="leading-relaxed">
                Some browsers transmit &quot;Do Not Track&quot; signals. We currently do not respond to Do
                Not Track signals because there is no established industry standard for compliance.
                We will update this policy if a recognized standard is established.
              </p>
            </section>

            {/* International */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">12. International Users</h2>
              <p className="leading-relaxed">
                Our Services are intended for users in the United States. If you access our Services
                from outside the United States, your information may be transferred to, stored, and
                processed in the United States where our servers and third-party service providers
                are located. By using our Services, you consent to the transfer of your information
                to the United States.
              </p>
              <p className="leading-relaxed mt-4">
                If you are located in the European Economic Area (EEA) or United Kingdom and believe
                GDPR applies to you, please contact us at{' '}
                <a
                  href="mailto:hello@chicken1of1.com"
                  className="text-primary-400 hover:text-primary-300"
                >
                  hello@chicken1of1.com
                </a>{' '}
                to discuss your rights under GDPR, including your legal basis for processing, rights
                of access, rectification, erasure, portability, and the right to object.
              </p>
            </section>

            {/* Children */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">13. Children&apos;s Privacy</h2>
              <p className="leading-relaxed">
                Our Services are not directed to individuals under the age of 18. We do not knowingly
                collect personal information from anyone under 18. If you are a parent or guardian
                and believe your child has provided us with personal information, please contact us
                immediately at{' '}
                <a
                  href="mailto:hello@chicken1of1.com"
                  className="text-primary-400 hover:text-primary-300"
                >
                  hello@chicken1of1.com
                </a>{' '}
                and we will promptly delete such information.
              </p>
            </section>

            {/* Changes */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">14. Changes to This Policy</h2>
              <p className="leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of material
                changes by posting the updated policy on this page and updating the &quot;Last updated&quot;
                date. Your continued use of our Services after changes are posted constitutes your
                acceptance of the revised policy.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">15. Contact Us</h2>
              <p className="leading-relaxed">
                If you have questions about this Privacy Policy or our privacy practices, please
                contact us:
              </p>
              <div className="mt-4 p-5 bg-dark-800 rounded-lg border border-dark-600 space-y-1">
                <p className="font-semibold text-white">SAP Thumbprint Holdings, LLC</p>
                <p className="text-gray-400">d/b/a Chicken1of1</p>
                <p className="text-gray-400 mt-3">
                  Email:{' '}
                  <a
                    href="mailto:hello@chicken1of1.com"
                    className="text-primary-400 hover:text-primary-300"
                  >
                    hello@chicken1of1.com
                  </a>
                </p>
                <p className="text-gray-400">
                  Instagram:{' '}
                  <a
                    href="https://www.instagram.com/chicken1of1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-400 hover:text-primary-300"
                  >
                    @chicken1of1
                  </a>
                </p>
              </div>
            </section>

            {/* Related */}
            <div className="p-5 bg-dark-800 rounded-lg border border-dark-600">
              <h3 className="font-semibold text-white mb-3">Related Policies</h3>
              <Link
                href="/legal/terms"
                className="text-primary-400 hover:text-primary-300 block"
              >
                Terms of Service — Full terms and conditions for using our Services
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </>
  )
}

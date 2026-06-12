import type { Metadata } from 'next'
import Hero from '@/components/Hero'
import Section from '@/components/Section'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service - Chicken1of1 Legal',
  description:
    'Terms of service for Chicken1of1 UFC card breaking services. Age requirements, refund policy, liability limitations, and break participation terms.',
}

export default function TermsPage() {
  const lastUpdated = 'June 12, 2026'

  return (
    <>
      <Hero
        title="Terms of Service"
        subtitle="Legal Terms & Conditions"
        description="Please read these terms carefully before using our services"
        showCTA={false}
      />

      <Section>
        <div className="max-w-4xl mx-auto">
          <div className="text-gray-300 space-y-10">
            <p className="text-sm text-gray-400">Last updated: {lastUpdated}</p>

            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Introduction and Acceptance</h2>
              <p className="leading-relaxed">
                PLEASE READ THIS AGREEMENT CAREFULLY BEFORE USING CHICKEN1OF1&apos;S SERVICES. By accessing
                or using chicken1of1.com, participating in card breaks, watching live streams, or using
                any of our services, you agree to be bound by the terms and conditions of this Agreement.
                If you do not agree, do not use our Services.
              </p>
              <p className="leading-relaxed mt-4">
                Chicken1of1 is operated by SAP Thumbprint Holdings, LLC (&quot;Chicken1of1,&quot; &quot;we,&quot; &quot;us,&quot;
                or &quot;our&quot;).
              </p>
            </section>

            {/* Scope of Services */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Scope of Services</h2>
              <p className="leading-relaxed">
                Chicken1of1 provides sports card breaking services and related content, including:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-4">
                <li>Live card break events streamed on Whatnot, Fanatics Live, and this website</li>
                <li>Various break formats including Random Team, Pick Your Team (PYT), Divisional, and Hit Draft</li>
                <li>Card collecting education and community content</li>
                <li>Sealed product purchasing (Sell To Us service)</li>
                <li>This informational website and contact channels</li>
              </ul>
              <p className="leading-relaxed mt-4">
                Transactions for break spots purchased on third-party platforms (Whatnot, Fanatics Live)
                are governed by those platforms&apos; respective terms of service in addition to this Agreement.
                We are not responsible for disputes arising from those platforms&apos; processes or policies.
              </p>
            </section>

            {/* Eligibility */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Eligibility</h2>
              <p className="leading-relaxed">
                You must be at least 18 years of age to purchase break spots, buy products, or participate
                in paid services. By using our Services, you represent and warrant that you are at least
                18 years old and a resident of the United States. Individuals under 18 may watch live
                streams and participate in free giveaways with verifiable parental consent, but may not
                make any purchase.
              </p>
            </section>

            {/* Card Break Services */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Card Break Services</h2>

              <h3 className="text-lg font-semibold text-white mb-2">4.1 Break Formats</h3>
              <p className="leading-relaxed">
                We offer various break formats. Format rules are clearly explained before each break
                begins. By purchasing a spot in a break, you acknowledge that you understand and accept
                the format for that specific break.
              </p>

              <h3 className="text-lg font-semibold text-white mb-2 mt-6">4.2 No Guaranteed Value</h3>
              <p className="leading-relaxed">
                Card breaking involves chance. WE MAKE NO GUARANTEES, EXPRESS OR IMPLIED, REGARDING
                THE VALUE, RARITY, QUANTITY, OR CONDITION OF CARDS PULLED DURING ANY BREAK. The market
                value of sports cards is volatile and unpredictable. Purchasing a break spot does not
                guarantee any particular return on investment, and you acknowledge that you may receive
                cards worth less than the price you paid for your spot.
              </p>

              <h3 className="text-lg font-semibold text-white mb-2 mt-6">4.3 All Sales Final</h3>
              <p className="leading-relaxed">
                Once a break has started, all sales are final. No refunds or exchanges will be issued
                for break spots after a break commences. See Section 7 (Refund Policy) for complete
                details on when refunds may be available.
              </p>

              <h3 className="text-lg font-semibold text-white mb-2 mt-6">4.4 Recording Consent</h3>
              <p className="leading-relaxed">
                All breaks are recorded and streamed live. By participating in any break, you consent
                to your username, chat messages, and any submitted materials being featured in live
                streams, recordings, and promotional content.
              </p>

              <h3 className="text-lg font-semibold text-white mb-2 mt-6">4.5 Card Condition</h3>
              <p className="leading-relaxed">
                We handle all cards with care. We are not responsible for manufacturer defects,
                pack-fresh condition variations, or damage caused during shipping by third-party
                carriers. We provide photographic documentation of hits pulled during breaks.
              </p>
            </section>

            {/* Customer Representations */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Customer Representations and Warranties</h2>
              <p className="leading-relaxed">You represent and warrant that:</p>
              <ul className="list-disc list-inside space-y-2 mt-4">
                <li>All information you provide to us is accurate, complete, and truthful</li>
                <li>You meet the age eligibility requirements set forth in Section 3</li>
                <li>You will not use our Services for any unlawful purpose</li>
                <li>You will respond promptly to any requests for additional information regarding your order or shipment</li>
                <li>You will not attempt to manipulate, defraud, or disrupt any break or service</li>
              </ul>
            </section>

            {/* Order Acceptance */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Order Acceptance and Payment</h2>
              <p className="leading-relaxed">
                All orders are subject to acceptance. We reserve the right to refuse or cancel any
                order at our sole discretion, including but not limited to situations involving pricing
                errors, suspected fraud, suspected manipulation, or unavailable inventory. If we cancel
                an order after payment, you will receive a full refund.
              </p>
              <p className="leading-relaxed mt-4">
                Payment processing on third-party platforms is handled by those platforms and their
                payment processors. We do not directly process or store payment information submitted
                on Whatnot or Fanatics Live.
              </p>
            </section>

            {/* Refund Policy */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Refund Policy</h2>

              <h3 className="text-lg font-semibold text-white mb-2">7.1 Our Commitment</h3>
              <p className="leading-relaxed">
                We stand behind our service. You will receive a full refund if:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-4">
                <li>We cancel a break before it starts and are unable to reschedule within 14 days</li>
                <li>We fail to ship your cards within 10 business days of a break completing without notification</li>
                <li>Your cards arrive damaged due to our packaging (photographic evidence required)</li>
              </ul>

              <h3 className="text-lg font-semibold text-white mb-2 mt-6">7.2 Refund Exclusions</h3>
              <p className="leading-relaxed">Refunds are not available if:</p>
              <ul className="list-disc list-inside space-y-2 mt-4">
                <li>A break has started (all sales are final once breaking begins)</li>
                <li>You are dissatisfied with the cards pulled (no guaranteed value — see Section 4.2)</li>
                <li>Cards are damaged by the carrier after leaving our hands (file a claim with the carrier)</li>
                <li>You provided an incorrect shipping address</li>
                <li>The break was completed as described and shipped as agreed</li>
              </ul>

              <h3 className="text-lg font-semibold text-white mb-2 mt-6">7.3 How to Request a Refund</h3>
              <p className="leading-relaxed">
                Email us at{' '}
                <a
                  href="mailto:hello@chicken1of1.com"
                  className="text-primary-400 hover:text-primary-300"
                >
                  hello@chicken1of1.com
                </a>{' '}
                with your order details and a description of the issue. We will respond within 3
                business days. Eligible refunds are processed within 5 business days.
              </p>

              <h3 className="text-lg font-semibold text-white mb-2 mt-6">7.4 Good Faith</h3>
              <p className="leading-relaxed">
                We may grant refunds outside these guidelines in extraordinary circumstances at our
                sole discretion. Our goal is your complete satisfaction.
              </p>
            </section>

            {/* Shipping */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Shipping</h2>
              <p className="leading-relaxed">
                We ship cards within 2 business days of a break completing, unless otherwise communicated.
                Shipping times listed are estimates and are not guaranteed. We use reputable carriers and
                provide tracking information for all shipments. We are not responsible for delays caused
                by carriers, weather, customs, or other circumstances beyond our control.
              </p>
              <p className="leading-relaxed mt-4">
                If your shipment is lost or not delivered, contact us promptly. We will work with you
                and the carrier to resolve the issue.
              </p>
            </section>

            {/* Giveaways */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Giveaways and Promotions</h2>
              <p className="leading-relaxed">
                Giveaways are free to enter and no purchase is necessary unless explicitly stated.
                Giveaway eligibility, entry requirements, and rules will be clearly stated before each
                promotion. Participants must comply with all applicable laws and regulations. We reserve
                the right to disqualify entries that do not comply with stated rules or that involve
                manipulation, multiple accounts, or fraud.
              </p>
            </section>

            {/* Prohibited Conduct */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Prohibited Conduct</h2>
              <p className="leading-relaxed">You agree not to:</p>
              <ul className="list-disc list-inside space-y-2 mt-4">
                <li>Use our Services for any unlawful purpose or in violation of any applicable law</li>
                <li>Harass, abuse, threaten, or harm other participants, viewers, or our team</li>
                <li>Attempt to manipulate, rig, or interfere with any break outcome</li>
                <li>Use multiple accounts to gain unfair advantages in breaks or giveaways</li>
                <li>Upload, transmit, or distribute malware, viruses, or other harmful code</li>
                <li>Attempt to gain unauthorized access to our systems, accounts, or data</li>
                <li>Impersonate other persons or provide false information</li>
                <li>Scrape, copy, or republish our content without written permission</li>
                <li>Use our Services in any way that could damage our reputation or interfere with operations</li>
              </ul>
              <p className="leading-relaxed mt-4">
                Violation of these prohibitions may result in immediate termination of your access to
                our Services without refund.
              </p>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">11. Intellectual Property</h2>
              <p className="leading-relaxed">
                All content on this website, including logos, designs, text, graphics, and software,
                is owned by Chicken1of1 / SAP Thumbprint Holdings, LLC or used with permission and is
                protected by copyright and other intellectual property laws. You may view and print
                content for personal, non-commercial use only. You may not modify, reproduce, distribute,
                create derivative works of, or commercially exploit our content without prior written
                permission.
              </p>
              <p className="leading-relaxed mt-4">
                Nothing in these Terms grants you any right in our trademarks, service marks, or branding.
              </p>
            </section>

            {/* Disclaimers */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">12. Disclaimers</h2>
              <p className="leading-relaxed">
                Chicken1of1 is not affiliated with, endorsed by, or sponsored by UFC, Zuffa, WWE, Topps,
                Panini, Fanatics, Whatnot, or any other league, organization, or platform. Card images
                and trademarks belong to their respective owners.
              </p>
              <p className="mt-4 leading-relaxed uppercase text-sm">
                THE SERVICES ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY
                KIND, EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF
                MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT
                WARRANT THAT THE SERVICES WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF VIRUSES OR
                OTHER HARMFUL COMPONENTS.
              </p>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">13. Limitation of Liability</h2>
              <p className="mt-4 leading-relaxed uppercase text-sm">
                IN NO EVENT SHALL CHICKEN1OF1, SAP THUMBPRINT HOLDINGS, LLC, ITS OFFICERS, DIRECTORS,
                EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, PUNITIVE, INCIDENTAL, SPECIAL,
                CONSEQUENTIAL, OR EXEMPLARY DAMAGES, INCLUDING WITHOUT LIMITATION DAMAGES FOR LOSS OF
                PROFITS, GOODWILL, USE, DATA, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR USE OF
                OR INABILITY TO USE THE SERVICES.
              </p>
              <p className="mt-4 leading-relaxed uppercase text-sm">
                CHICKEN1OF1 EXPRESSLY DISCLAIMS LIABILITY FOR ANY INACCURATE INFORMATION PROVIDED BY
                THE CUSTOMER. CHICKEN1OF1&apos;S TOTAL LIABILITY FOR ANY CLAIM ARISING FROM THIS AGREEMENT
                OR THE SERVICES SHALL NOT EXCEED THE AMOUNT PAID BY YOU FOR THE SPECIFIC SERVICE GIVING
                RISE TO SUCH CLAIM IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
              </p>
            </section>

            {/* Indemnification */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">14. Indemnification</h2>
              <p className="leading-relaxed">
                You agree to indemnify, defend, and hold harmless Chicken1of1, SAP Thumbprint Holdings,
                LLC, and its affiliates, officers, directors, employees, consultants, agents, and
                representatives from any and all claims, liabilities, damages, and costs (including
                attorneys&apos; fees) arising from or related to: (a) your use of the Services; (b) your
                violation of this Agreement; (c) your violation of any third-party rights; (d) any
                inaccurate or false information provided by you; or (e) any claim that your actions
                caused damage to a third party.
              </p>
            </section>

            {/* Privacy */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">15. Privacy</h2>
              <p className="leading-relaxed">
                Your use of our Services is also governed by our{' '}
                <Link href="/legal/privacy" className="text-primary-400 hover:text-primary-300">
                  Privacy Policy
                </Link>
                , which is incorporated by reference into this Agreement. By using our Services, you
                consent to the collection, use, and processing of your personal information as described
                in our Privacy Policy.
              </p>
            </section>

            {/* Term and Termination */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">16. Term and Termination</h2>

              <h3 className="text-lg font-semibold text-white mb-2">16.1 Term</h3>
              <p className="leading-relaxed">
                This Agreement remains in effect while you use the Services.
              </p>

              <h3 className="text-lg font-semibold text-white mb-2 mt-4">16.2 Termination by You</h3>
              <p className="leading-relaxed">
                You may terminate this Agreement at any time by ceasing to use our Services. Provisions
                that by their nature should survive termination — including ownership, disclaimers,
                indemnity, and limitation of liability — shall survive.
              </p>

              <h3 className="text-lg font-semibold text-white mb-2 mt-4">16.3 Termination by Us</h3>
              <p className="leading-relaxed">
                We may terminate or suspend your access to the Services at any time, without prior
                notice or liability, for any reason including breach of this Agreement. Upon termination,
                your right to use the Services will immediately cease.
              </p>
            </section>

            {/* Dispute Resolution */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">17. Dispute Resolution and Governing Law</h2>

              <h3 className="text-lg font-semibold text-white mb-2">17.1 Governing Law</h3>
              <p className="leading-relaxed">
                This Agreement shall be governed by and construed in accordance with the laws of the
                State of North Carolina, United States, without giving effect to any principles of
                conflicts of law.
              </p>

              <h3 className="text-lg font-semibold text-white mb-2 mt-4">17.2 Jurisdiction and Venue</h3>
              <p className="leading-relaxed">
                Any legal action or proceeding arising out of or relating to this Agreement shall be
                brought exclusively in the federal or state courts located in Wake County, North Carolina.
                Each party irrevocably submits to the exclusive jurisdiction of such courts and waives
                any objection to venue or inconvenient forum.
              </p>

              <h3 className="text-lg font-semibold text-white mb-2 mt-4">17.3 Class Action Waiver</h3>
              <p className="leading-relaxed uppercase text-sm">
                THE PARTIES AGREE THAT EACH MAY BRING CLAIMS AGAINST THE OTHER ONLY IN AN INDIVIDUAL
                CAPACITY AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS OR REPRESENTATIVE
                PROCEEDING. YOU WAIVE ANY RIGHT TO PARTICIPATE IN A CLASS ACTION LAWSUIT OR CLASS-WIDE
                ARBITRATION.
              </p>
            </section>

            {/* General Provisions */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">18. General Provisions</h2>

              <p className="leading-relaxed mb-4">
                <strong className="text-white">Entire Agreement.</strong> This Agreement, together with
                our Privacy Policy, constitutes the entire agreement between you and Chicken1of1
                regarding your use of the Services and supersedes any prior agreements.
              </p>
              <p className="leading-relaxed mb-4">
                <strong className="text-white">Severability.</strong> If any provision of this Agreement
                is found to be unenforceable or invalid, that provision will be limited or eliminated
                to the minimum extent necessary so that the remaining provisions remain in full force
                and effect.
              </p>
              <p className="leading-relaxed mb-4">
                <strong className="text-white">Waiver.</strong> Our failure to exercise or enforce any
                right or provision of this Agreement shall not operate as a waiver of that right or
                provision.
              </p>
              <p className="leading-relaxed mb-4">
                <strong className="text-white">Non-Assignment.</strong> You may not assign or transfer
                this Agreement or your rights under it without our prior written consent. We may assign
                our rights under this Agreement without restriction.
              </p>
              <p className="leading-relaxed mb-4">
                <strong className="text-white">Force Majeure.</strong> We shall not be liable for any
                failure or delay in performing our obligations where such failure results from
                circumstances beyond our reasonable control, including natural disasters, acts of
                government, carrier failures, internet outages, or third-party service failures.
              </p>
              <p className="leading-relaxed mb-4">
                <strong className="text-white">No Agency.</strong> No agency, partnership, joint
                venture, or employment relationship is created as a result of this Agreement.
              </p>
              <p className="leading-relaxed">
                <strong className="text-white">Notices.</strong> Communications under this Agreement
                may be given by email or by posting to the website.
              </p>
            </section>

            {/* Changes */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">19. Changes to Terms</h2>
              <p className="leading-relaxed">
                We reserve the right to modify these Terms at any time. Changes will be posted on
                this page with an updated &quot;Last updated&quot; date. Your continued use of our Services
                after changes are posted constitutes acceptance of the revised Terms.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">20. Contact Information</h2>
              <p className="leading-relaxed">
                If you have questions about these Terms, please contact us:
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

            {/* Acknowledgment */}
            <section className="border-t border-dark-600 pt-8">
              <p className="leading-relaxed font-medium uppercase text-sm text-gray-400">
                BY USING OUR SERVICES, YOU ACKNOWLEDGE THAT YOU HAVE READ THIS AGREEMENT, UNDERSTAND
                IT, AND AGREE TO BE BOUND BY ITS TERMS AND CONDITIONS.
              </p>
            </section>

            {/* Related */}
            <div className="p-5 bg-dark-800 rounded-lg border border-dark-600">
              <h3 className="font-semibold text-white mb-3">Related Policies</h3>
              <Link
                href="/legal/privacy"
                className="text-primary-400 hover:text-primary-300 block"
              >
                Privacy Policy — How we handle your information
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </>
  )
}

import type { Metadata } from 'next'
import Hero from '@/components/Hero'
import Section from '@/components/Section'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Contact Chicken1of1 - UFC Card Breaking Questions',
  description:
    'Get in touch with Chicken1of1 for break questions, custom requests, or partnership inquiries. DM us on Instagram or email us directly.',
}

export default function ContactPage() {
  return (
    <>
      <Hero
        title="Get in Touch"
        subtitle="Questions? Requests? Let's Talk"
        description="Reach out for break inquiries, partnerships, or just to say hey"
        showCTA={false}
      />

      <Section>
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
                Let&apos;s Connect
              </h2>
              <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                Have questions about our breaks? Want to request a specific
                product? Looking to partner with us? We&apos;d love to hear from
                you.
              </p>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.017 0C8.396 0 7.929.01 6.71.048 5.493.087 4.73.222 4.058.42a5.916 5.916 0 0 0-2.134 1.388A5.916 5.916 0 0 0 .536 4.058C.338 4.73.203 5.493.164 6.71.126 7.929.116 8.396.116 12.017c0 3.622.01 4.09.048 5.309.039 1.217.174 1.98.372 2.652a5.916 5.916 0 0 0 1.388 2.134 5.916 5.916 0 0 0 2.134 1.388c.672.198 1.435.333 2.652.372 1.219.038 1.687.048 5.309.048 3.622 0 4.09-.01 5.309-.048 1.217-.039 1.98-.174 2.652-.372a5.916 5.916 0 0 0 2.134-1.388 5.916 5.916 0 0 0 1.388-2.134c.198-.672.333-1.435.372-2.652.038-1.219.048-1.687.048-5.309 0-3.622-.01-4.09-.048-5.309-.039-1.217-.174-1.98-.372-2.652a5.916 5.916 0 0 0-1.388-2.134A5.916 5.916 0 0 0 19.326.536C18.654.338 17.891.203 16.674.164 15.455.126 14.988.116 11.366.116L12.017 0zm-.132 2.183c3.549 0 3.97.014 5.378.052 1.297.059 2.001.276 2.469.458.621.241 1.065.53 1.531.995.464.466.754.91.995 1.531.182.468.399 1.172.458 2.469.038 1.408.052 1.829.052 5.378 0 3.549-.014 3.97-.052 5.378-.059 1.297-.276 2.001-.458 2.469a4.126 4.126 0 0 1-.995 1.531 4.126 4.126 0 0 1-1.531.995c-.468.182-1.172.399-2.469.458-1.408.038-1.829.052-5.378.052-3.549 0-3.97-.014-5.378-.052-1.297-.059-2.001-.276-2.469-.458a4.126 4.126 0 0 1-1.531-.995 4.126 4.126 0 0 1-.995-1.531c-.182-.468-.399-1.172-.458-2.469-.038-1.408-.052-1.829-.052-5.378 0-3.549.014-3.97.052-5.378.059-1.297.276-2.001.458-2.469.241-.621.53-1.065.995-1.531a4.126 4.126 0 0 1 1.531-.995c.468-.182 1.172-.399 2.469-.458 1.408-.038 1.829-.052 5.378-.052z"
                        clipRule="evenodd"
                      />
                      <path
                        fillRule="evenodd"
                        d="M12.017 5.838a6.18 6.18 0 1 0 0 12.36 6.18 6.18 0 0 0 0-12.36zM12.017 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"
                        clipRule="evenodd"
                      />
                      <circle cx="18.406" cy="5.594" r="1.44" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">
                      Instagram DMs (Fastest)
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Slide into our DMs for the quickest response time
                    </p>
                    <Link
                      href={
                        process.env.NEXT_PUBLIC_INSTAGRAM_URL ||
                        'https://www.instagram.com/chicken1of1'
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-400 text-sm hover:text-primary-300 transition-colors duration-200"
                    >
                      @chicken1of1
                    </Link>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Email</h3>
                    <p className="text-gray-400 text-sm">
                      For formal inquiries and partnerships
                    </p>
                    <a
                      href="mailto:hello@chicken1of1.com"
                      className="text-primary-400 text-sm hover:text-primary-300 transition-colors duration-200"
                    >
                      hello@chicken1of1.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-white"
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
                  <div>
                    <h3 className="font-semibold text-white mb-1">
                      Live Chat During Breaks
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Catch us live on Whatnot or Fanatics for real-time Q&A
                    </p>
                    <Link
                      href="/live"
                      className="text-primary-400 text-sm hover:text-primary-300 transition-colors duration-200"
                    >
                      Watch Live
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-xl font-semibold text-white mb-4">
                Quick Contact Form
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                Fill out this form and we&apos;ll get back to you within 24
                hours.
              </p>

              <form
                action="mailto:hello@chicken1of1.com"
                method="get"
                encType="text/plain"
                className="space-y-4"
              >
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Your name"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a topic</option>
                    <option value="Break Inquiry">Break Inquiry</option>
                    <option value="Product Request">Product Request</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Technical Issue">Technical Issue</option>
                    <option value="General Question">General Question</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="body"
                    rows={4}
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Tell us more about your inquiry..."
                    required
                  ></textarea>
                </div>

                <button type="submit" className="btn-primary w-full">
                  Send Message
                </button>
              </form>

              <p className="text-xs text-gray-500 mt-4">
                This form opens your default email client. For fastest response,
                DM us on Instagram.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section background="darker">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Response Times
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-lg font-semibold text-primary-400 mb-1">
                Instagram DMs
              </div>
              <div className="text-sm text-gray-400">Usually within hours</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-primary-400 mb-1">
                Email
              </div>
              <div className="text-sm text-gray-400">Within 24 hours</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-primary-400 mb-1">
                Live Chat
              </div>
              <div className="text-sm text-gray-400">During stream times</div>
            </div>
          </div>
        </div>
      </Section>
    </>
  )
}
'use client';

import { useState } from 'react';

export default function SellFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'How do you determine your buying prices?',
      answer: 'We base our prices on current market values from eBay sold listings, COMC, and other major marketplaces. We typically offer 70-85% of market value for cash and up to 90% for store credit. Our prices update daily to reflect market changes.',
    },
    {
      question: 'What condition do the boxes need to be in?',
      answer: 'We prefer factory-sealed boxes in mint condition, but we also buy boxes with minor wear. Mint condition gets full price, near-mint gets 90% of quoted price, and boxes with minor damage get 80%. We do not buy opened boxes or boxes with significant damage.',
    },
    {
      question: 'How quickly will I get paid?',
      answer: 'Once we receive and verify your boxes (typically same day), payment is sent within 24 hours. PayPal and Zelle are instant, checks take 3-5 business days to arrive. We pride ourselves on fast payment!',
    },
    {
      question: 'Do you buy single cards or only sealed boxes?',
      answer: 'Currently, we focus exclusively on factory-sealed boxes, cases, and retail products (blasters, megas, hangers). We do not buy single cards at this time, but we can recommend trusted partners who do.',
    },
    {
      question: 'Is shipping insured and who pays for it?',
      answer: "Shipping is 100% FREE for you! We provide a prepaid, fully insured shipping label. All packages are insured up to the full value of your quote. You're protected from the moment you ship until we confirm receipt.",
    },
    {
      question: 'What UFC/MMA products do you buy?',
      answer: 'We buy all major UFC releases including Panini Prizm, Select, Chronicles, Donruss, Immaculate, National Treasures, Obsidian, and Topps Chrome/Knockout. We also buy ONE Championship and PFL products.',
    },
    {
      question: 'Can I get a higher price if I wait?',
      answer: 'Our quotes are valid for 48 hours and reflect current market conditions. While prices can go up, they can also go down. We recommend accepting quotes promptly if you\'re happy with the offer. The UFC market can be volatile!',
    },
    {
      question: 'What if I have a large collection to sell?',
      answer: 'We love large collections! Collections over $1,000 get automatic bulk bonuses: 5% extra for $1-5K, 7% for $5-10K, and 10% for $10K+. For collections over $25K, we can arrange in-person pickup in select cities.',
    },
    {
      question: 'Do you buy from outside the United States?',
      answer: 'Currently, we only buy from sellers within the United States (including Alaska and Hawaii). International shipping and customs make it difficult to offer competitive prices for international sellers.',
    },
    {
      question: 'What happens if my boxes are damaged in shipping?',
      answer: "Don't worry - you're fully covered! Our insurance covers the full quoted value. If anything happens during shipping, we handle the insurance claim and you still get paid your full quote amount.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-4">
        Frequently Asked Questions
      </h2>
      <p className="text-gray-400 text-center mb-12">
        Everything you need to know about selling your UFC sealed boxes to us
      </p>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-yellow-400 transition-colors"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-800 transition-colors"
            >
              <span className="font-semibold text-white">{faq.question}</span>
              <svg
                className={`w-5 h-5 text-yellow-400 transition-transform ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {openIndex === index && (
              <div className="px-6 pb-4">
                <p className="text-gray-300">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Contact CTA */}
      <div className="mt-12 p-6 bg-gray-900 rounded-lg text-center">
        <h3 className="text-xl font-bold text-white mb-3">Still Have Questions?</h3>
        <p className="text-gray-400 mb-4">
          Our team is here to help! Reach out anytime for personalized assistance.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="mailto:hello@chicken1of1.com"
            className="inline-flex items-center justify-center px-6 py-3 bg-yellow-400 text-black rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
          >
            📧 Email Us
          </a>
          <a
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
          >
            💬 Contact Form
          </a>
        </div>
      </div>
    </div>
  );
}
'use client'

import { useState } from 'react'

export default function SellFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      question: 'What types of products do you buy?',
      answer: 'We buy sealed UFC, MMA, boxing, wrestling, and combat sports boxes and cases. This includes Topps Chrome, Topps Finest, Topps Sapphire, Panini Prizm, Select, Chronicles, and more. We also consider entertainment products (Disney, Marvel) on a case-by-case basis.',
    },
    {
      question: 'How do you determine your offer?',
      answer: 'We base offers on current market values from eBay sold listings and other major marketplaces. We typically pay 70-85% of market value depending on the product, quantity, and condition. We are upfront about our pricing - no hidden fees or bait-and-switch.',
    },
    {
      question: 'What condition do the boxes need to be in?',
      answer: 'We prefer factory-sealed boxes in good condition. Boxes with minor shelf wear are fine. We can still make offers on boxes with some damage, but the offer will reflect the condition. We do not buy opened or searched product.',
    },
    {
      question: 'How quickly will I get paid?',
      answer: 'Once we receive and verify your boxes, payment is typically sent within 24-48 hours via PayPal, Zelle, or Venmo. We will agree on payment method before you ship.',
    },
    {
      question: 'Who pays for shipping?',
      answer: 'For larger deals we can provide a shipping label. For smaller submissions, the seller typically covers shipping. We will work out the details when we make our offer.',
    },
    {
      question: 'Do you buy single cards?',
      answer: 'Currently we focus on sealed product only - boxes, cases, and retail formats. We do not buy single cards, but we can point you to trusted buyers if needed.',
    },
    {
      question: 'Do you buy from outside the United States?',
      answer: 'Currently we only buy from sellers within the United States. International shipping and customs complications make it difficult to offer fair prices for international sellers.',
    },
    {
      question: 'What if I have a large collection?',
      answer: 'We love large collections. Submit through the form with all your products listed and we will put together a comprehensive offer. Larger collections often get better per-unit pricing.',
    },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="font-heading text-3xl md:text-4xl font-bold text-white text-center uppercase tracking-tight mb-4">
        Frequently Asked Questions
      </h2>
      <p className="text-cage-400 text-center mb-12">
        Common questions about selling your sealed product to us
      </p>

      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-black rounded-xl overflow-hidden border border-cage-700/50 hover:border-gold-500/30 transition-all duration-300 hover:shadow-[0_0_20px_rgba(185,28,28,0.1)]"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-cage-900/30 transition-colors"
              aria-expanded={openIndex === index}
            >
              <span className="font-semibold text-white">{faq.question}</span>
              <svg
                className={`w-5 h-5 text-gold-400 transition-transform flex-shrink-0 ml-4 ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openIndex === index && (
              <div className="px-6 pb-4">
                <p className="text-cage-300">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

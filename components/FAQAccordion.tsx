'use client'

import { useState } from 'react'

interface FAQItem {
  question: string
  answer: string
}

interface FAQAccordionProps {
  items: FAQItem[]
}

export default function FAQAccordion({ items }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="card">
          <button
            onClick={() => toggleAccordion(index)}
            className="w-full text-left flex justify-between items-center p-0 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg"
            aria-expanded={openIndex === index}
          >
            <h3 className="text-lg font-semibold text-white pr-4">
              {item.question}
            </h3>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
                openIndex === index ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
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
            <div className="mt-4 pt-4 border-t border-dark-600">
              <p className="text-gray-300 leading-relaxed">{item.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
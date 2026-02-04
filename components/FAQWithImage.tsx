'use client'

import { useState } from 'react'
import Image from 'next/image'

interface FAQItem {
  question: string
  answer: string
}

interface FAQWithImageProps {
  items: FAQItem[]
}

export default function FAQWithImage({ items }: FAQWithImageProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start justify-center gap-8 md:gap-12">
      <Image
        src="/faq-photo.png"
        alt="The Coop Group"
        width={830}
        height={844}
        className="max-w-sm w-full rounded-xl h-auto sticky top-24 hidden md:block"
      />

      <div className="w-full">
        <p className="text-gold-400 text-sm font-medium uppercase tracking-wider">FAQ&apos;s</p>
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-white uppercase tracking-tight mt-1">
          Got Questions?
        </h2>
        <p className="text-sm text-cage-400 mt-2 pb-4">
          Everything you need to know about card breaks, shipping, formats, and more.
        </p>

        <div>
          {items.map((faq, index) => (
            <div key={index} className="border-b border-cage-700/50 py-4">
              <button
                onClick={() => toggle(index)}
                className="flex items-center justify-between w-full text-left cursor-pointer group"
              >
                <h3 className="text-base font-medium text-white group-hover:text-gold-400 transition-colors pr-4">
                  {faq.question}
                </h3>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`transition-transform duration-300 ease-in-out shrink-0 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                >
                  <path
                    d="m4.5 7.2 3.793 3.793a1 1 0 0 0 1.414 0L13.5 7.2"
                    stroke="#9ca3af"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  openIndex === index
                    ? 'max-h-[500px] opacity-100 pt-3'
                    : 'max-h-0 opacity-0'
                }`}
              >
                <p className="text-sm text-cage-400 max-w-md whitespace-pre-line">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

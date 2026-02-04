'use client'

import { useEffect, useRef, useState } from 'react'

const steps = [
  {
    number: 1,
    title: 'Submit Your Products',
    description: 'Tell us what sealed product you have using our submission form. Include quantity, condition, and what you are looking to get.',
  },
  {
    number: 2,
    title: 'We Review & Offer',
    description: 'We review your submission and send you a fair offer based on current market conditions. Usually within 24 hours.',
  },
  {
    number: 3,
    title: 'Ship Your Boxes',
    description: 'Accept the offer and ship your boxes. We can provide a shipping label for larger deals.',
  },
  {
    number: 4,
    title: 'Get Paid',
    description: 'Once we receive and verify your boxes, payment is sent via your preferred method. PayPal or Zelle.',
  },
]

export default function HowItWorks() {
  const [visibleSteps, setVisibleSteps] = useState<number[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          steps.forEach((_, i) => {
            setTimeout(() => {
              setVisibleSteps((prev) => [...prev, i])
            }, i * 400)
          })
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="max-w-4xl mx-auto" ref={containerRef}>
      <h2 className="font-heading text-3xl md:text-4xl font-bold text-white text-center uppercase tracking-tight mb-4">
        How It Works
      </h2>
      <p className="text-cage-400 text-center mb-16 max-w-2xl mx-auto">
        Simple, honest process. No games, no runaround.
      </p>

      {/* Desktop: Horizontal Timeline */}
      <div className="hidden lg:block">
        <div className="relative">
          {/* Timeline connector line */}
          <div className="absolute top-7 left-[calc(12.5%+28px)] right-[calc(12.5%+28px)] h-0.5 bg-cage-700">
            <div
              className="h-full bg-gradient-to-r from-gold-500 to-gold-400 transition-all duration-1000 ease-out"
              style={{
                width: visibleSteps.length >= 4 ? '100%' : visibleSteps.length >= 3 ? '66%' : visibleSteps.length >= 2 ? '33%' : '0%',
                transitionDelay: '200ms',
              }}
            />
          </div>

          <div className="grid grid-cols-4 gap-8 relative">
            {steps.map((step, i) => (
              <div
                key={step.number}
                className={`text-center transition-all duration-500 ${
                  visibleSteps.includes(i) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center font-heading text-xl font-bold mx-auto mb-4 transition-all duration-500 relative z-10 ${
                    visibleSteps.includes(i)
                      ? 'bg-gold-500 text-dark-950 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                      : 'bg-dark-700 text-cage-500 border-2 border-cage-600'
                  }`}
                >
                  {step.number}
                </div>
                <h3 className="font-heading text-lg font-bold text-white uppercase tracking-wide mb-2">
                  {step.title}
                </h3>
                <p className="text-cage-400 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile/Tablet: Vertical Timeline */}
      <div className="lg:hidden">
        <div className="relative pl-12">
          {/* Vertical line */}
          <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-cage-700">
            <div
              className="w-full bg-gradient-to-b from-gold-500 to-gold-400 transition-all duration-1000 ease-out"
              style={{
                height: visibleSteps.length >= 4 ? '100%' : visibleSteps.length >= 3 ? '75%' : visibleSteps.length >= 2 ? '50%' : visibleSteps.length >= 1 ? '25%' : '0%',
                transitionDelay: '200ms',
              }}
            />
          </div>

          <div className="space-y-10">
            {steps.map((step, i) => (
              <div
                key={step.number}
                className={`relative transition-all duration-500 ${
                  visibleSteps.includes(i) ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                }`}
              >
                <div
                  className={`absolute -left-12 w-10 h-10 rounded-full flex items-center justify-center font-heading text-sm font-bold transition-all duration-500 ${
                    visibleSteps.includes(i)
                      ? 'bg-gold-500 text-dark-950 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                      : 'bg-dark-700 text-cage-500 border-2 border-cage-600'
                  }`}
                >
                  {step.number}
                </div>
                <h3 className="font-heading text-lg font-bold text-white uppercase tracking-wide mb-1">
                  {step.title}
                </h3>
                <p className="text-cage-400 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

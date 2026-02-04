export default function HowItWorks() {
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
      description: 'Once we receive and verify your boxes, payment is sent via your preferred method. PayPal, Zelle, or Venmo.',
    },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="font-heading text-3xl md:text-4xl font-bold text-white text-center uppercase tracking-tight mb-4">
        How It Works
      </h2>
      <p className="text-cage-400 text-center mb-12 max-w-2xl mx-auto">
        Simple, honest process. No games, no runaround.
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map((step) => (
          <div key={step.number} className="text-center">
            <div className="w-14 h-14 rounded-full bg-gold-500 text-dark-950 flex items-center justify-center font-heading text-xl font-bold mx-auto mb-4">
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
  )
}

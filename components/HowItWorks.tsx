export default function HowItWorks() {
  const steps = [
    {
      number: '1',
      title: 'Submit Your Products',
      description: 'Use our instant quote calculator to select your UFC sealed boxes and get an immediate estimate.',
      icon: '📋',
    },
    {
      number: '2',
      title: 'Get Official Quote',
      description: 'We review your submission and send you an official offer within 1 hour. Quotes are valid for 48 hours.',
      icon: '💰',
    },
    {
      number: '3',
      title: 'Ship Your Boxes',
      description: 'Accept the quote and ship your boxes using our prepaid shipping label. Fully insured and tracked.',
      icon: '📦',
    },
    {
      number: '4',
      title: 'Get Paid Fast',
      description: 'Once we receive and verify your boxes, payment is sent within 24 hours via your chosen method.',
      icon: '✅',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-4">
        How It Works
      </h2>
      <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
        Selling your UFC sealed boxes has never been easier. Our simple 4-step process gets you paid fast.
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map((step, index) => (
          <div key={step.number} className="relative">
            {/* Connector Line (hidden on mobile and last item) */}
            {index < steps.length - 1 && (
              <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-yellow-400 to-transparent z-0" />
            )}

            <div className="relative z-10">
              {/* Step Number */}
              <div className="flex items-center justify-center mb-4">
                <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-4xl">
                  {step.icon}
                </div>
              </div>

              {/* Step Content */}
              <div className="text-center">
                <div className="inline-block bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold mb-3">
                  Step {step.number}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-gray-400">{step.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Benefits */}
      <div className="mt-16 grid md:grid-cols-3 gap-8">
        <div className="bg-gray-800 rounded-lg p-6 text-center">
          <div className="text-3xl mb-3">🛡️</div>
          <h4 className="text-lg font-bold text-yellow-400 mb-2">Fully Insured</h4>
          <p className="text-gray-300 text-sm">
            All shipments are fully insured up to declared value
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 text-center">
          <div className="text-3xl mb-3">🚚</div>
          <h4 className="text-lg font-bold text-yellow-400 mb-2">Free Shipping</h4>
          <p className="text-gray-300 text-sm">
            We provide prepaid shipping labels for all submissions
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 text-center">
          <div className="text-3xl mb-3">🔒</div>
          <h4 className="text-lg font-bold text-yellow-400 mb-2">Secure Process</h4>
          <p className="text-gray-300 text-sm">
            Tracked from submission to payment with full transparency
          </p>
        </div>
      </div>
    </div>
  );
}
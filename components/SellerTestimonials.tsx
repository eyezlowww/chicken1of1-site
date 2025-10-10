'use client';

import { useState } from 'react';

export default function SellerTestimonials() {
  const testimonials = [
    {
      id: 1,
      name: 'Mike T.',
      location: 'Las Vegas, NV',
      amount: '$3,500',
      rating: 5,
      text: 'Sold my entire 2022 Prizm collection. Got paid more than expected and payment hit my PayPal same day. These guys are legit!',
      products: '10x Prizm Hobby Boxes',
      date: '2 weeks ago',
    },
    {
      id: 2,
      name: 'Sarah K.',
      location: 'Miami, FL',
      amount: '$1,200',
      rating: 5,
      text: 'Best experience selling sealed boxes online. They offered 80% of market value while others were offering 60%. Fast payment too!',
      products: '3x Select, 2x Chronicles',
      date: '1 month ago',
    },
    {
      id: 3,
      name: 'John D.',
      location: 'New York, NY',
      amount: '$8,750',
      rating: 5,
      text: "Had a large collection I needed to liquidate quickly. They handled everything professionally and paid within 24 hours as promised.",
      products: 'Mixed UFC Collection',
      date: '3 weeks ago',
    },
    {
      id: 4,
      name: 'Carlos R.',
      location: 'Houston, TX',
      amount: '$450',
      rating: 5,
      text: 'Tried consignment before but hated waiting. This instant cash option is perfect. Will definitely sell to them again.',
      products: '2x Donruss Hobby',
      date: '1 week ago',
    },
    {
      id: 5,
      name: 'Amanda L.',
      location: 'Phoenix, AZ',
      amount: '$2,100',
      rating: 5,
      text: 'The bulk bonus pushed my payout over $2k! Super happy with the service and how easy the whole process was.',
      products: '5x Chronicles, 3x Prizm',
      date: '2 months ago',
    },
    {
      id: 6,
      name: 'David W.',
      location: 'Chicago, IL',
      amount: '$15,000',
      rating: 5,
      text: 'Sold my entire shop inventory to them. Professional, fast, and fair pricing. The 10% bulk bonus was huge!',
      products: 'Shop Liquidation',
      date: '1 month ago',
    },
  ];

  const [selectedTestimonial, setSelectedTestimonial] = useState(0);

  return (
    <div className="max-w-7xl mx-auto">
      <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-4">
        Trusted by Sellers Nationwide
      </h2>
      <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
        Join hundreds of satisfied sellers who have turned their UFC sealed boxes into instant cash
      </p>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">$250K+</div>
          <div className="text-sm text-gray-400">Total Paid Out</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">500+</div>
          <div className="text-sm text-gray-400">Happy Sellers</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">4.9/5</div>
          <div className="text-sm text-gray-400">Average Rating</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">24hr</div>
          <div className="text-sm text-gray-400">Avg. Payment Time</div>
        </div>
      </div>

      {/* Testimonials Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((testimonial) => (
          <div
            key={testimonial.id}
            className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors cursor-pointer"
            onClick={() => setSelectedTestimonial(testimonial.id)}
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-bold text-white">{testimonial.name}</h4>
                <p className="text-sm text-gray-400">{testimonial.location}</p>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-green-400">{testimonial.amount}</div>
                <div className="text-xs text-gray-400">{testimonial.date}</div>
              </div>
            </div>

            {/* Rating */}
            <div className="flex mb-3">
              {[...Array(testimonial.rating)].map((_, i) => (
                <span key={i} className="text-yellow-400">⭐</span>
              ))}
            </div>

            {/* Review Text */}
            <p className="text-gray-300 mb-3 line-clamp-3">{testimonial.text}</p>

            {/* Products Sold */}
            <div className="pt-3 border-t border-gray-700">
              <span className="text-xs text-gray-400">Sold: </span>
              <span className="text-xs text-yellow-400 font-semibold">{testimonial.products}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Trust Indicators */}
      <div className="mt-12 p-6 bg-gradient-to-r from-green-600/20 to-green-500/20 rounded-lg border border-green-500/50">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="text-4xl">✅</div>
            <div>
              <h3 className="text-lg font-bold text-white">100% Satisfaction Guarantee</h3>
              <p className="text-sm text-gray-400">
                Every transaction is protected by our seller guarantee
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-400">BBB Rating</div>
              <div className="text-xl font-bold text-white">A+</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400">Google Reviews</div>
              <div className="text-xl font-bold text-white">4.9★</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400">Years in Business</div>
              <div className="text-xl font-bold text-white">3+</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function SellToUsHero() {
  const [estimatedValue, setEstimatedValue] = useState<number | null>(null);

  const quickEstimate = () => {
    // Quick estimate based on average box value
    const estimate = Math.floor(Math.random() * (2000 - 500) + 500);
    setEstimatedValue(estimate);
  };

  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-5"></div>

      <div className="relative max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div>
            <div className="inline-flex items-center bg-yellow-500/10 rounded-full px-4 py-2 mb-6">
              <span className="text-yellow-400 font-semibold">🔥 NEW: Instant Cash for UFC Boxes</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Turn Your UFC Sealed Boxes Into
              <span className="text-yellow-400 block mt-2">Instant Cash</span>
            </h1>

            <p className="text-xl text-gray-300 mb-8">
              The #1 buyer of UFC sealed products. Get top dollar for your Prizm, Chronicles, Select, and more.
              No consignment fees. No waiting. Just cash in your pocket within 24 hours.
            </p>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">$250K+</div>
                <div className="text-sm text-gray-400">Paid Out</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">1,000+</div>
                <div className="text-sm text-gray-400">Boxes Bought</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">24hr</div>
                <div className="text-sm text-gray-400">Fast Payment</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => document.getElementById('quote-calculator')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-yellow-400 text-black px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-300 transition-all transform hover:scale-105"
              >
                Get Instant Quote
              </button>
              <button
                onClick={quickEstimate}
                className="bg-transparent border-2 border-yellow-400 text-yellow-400 px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-400 hover:text-black transition-all"
              >
                Quick Estimate
              </button>
            </div>

            {estimatedValue && (
              <div className="mt-6 p-4 bg-green-500/10 border border-green-500 rounded-lg">
                <p className="text-green-400">
                  Your collection could be worth: <span className="font-bold text-xl">${estimatedValue.toLocaleString()}</span>
                </p>
                <p className="text-sm text-gray-400 mt-1">Get an exact quote below ↓</p>
              </div>
            )}
          </div>

          {/* Right Column - Visual */}
          <div className="relative">
            <div className="relative w-full h-[500px] rounded-2xl overflow-hidden">
              {/* Placeholder for UFC boxes image */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-red-600/20 backdrop-blur-sm"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">📦</div>
                  <div className="text-2xl font-bold text-white">UFC Sealed Boxes</div>
                  <div className="text-yellow-400 mt-2">Prizm • Chronicles • Select</div>
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                TOP PRICES PAID
              </div>
              <div className="absolute bottom-4 left-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                INSTANT OFFERS
              </div>
            </div>

            {/* Popular Products */}
            <div className="mt-6 grid grid-cols-3 gap-2">
              <div className="bg-gray-800 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-400">2023 Prizm</div>
                <div className="text-sm font-bold text-yellow-400">$280/box</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-400">2023 Select</div>
                <div className="text-sm font-bold text-yellow-400">$320/box</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-400">Chronicles</div>
                <div className="text-sm font-bold text-yellow-400">$180/box</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
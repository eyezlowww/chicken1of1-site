'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import ufcProducts from '@/content/ufc-products.json';

type SortOption = 'name' | 'price' | 'year' | 'category';

export default function PricingGrid() {
  const [products, setProducts] = useState(ufcProducts.products);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('price');
  const [showOnlyInStock, setShowOnlyInStock] = useState(true);

  useEffect(() => {
    let filtered = [...ufcProducts.products];

    // Apply filter
    if (filter !== 'all') {
      filtered = filtered.filter(product =>
        filter === 'hobby' ? product.name.includes('Hobby') :
        filter === 'retail' ? (product.name.includes('Retail') || product.name.includes('Blaster')) :
        product.category.toLowerCase() === filter.toLowerCase()
      );
    }

    // Apply stock filter
    if (showOnlyInStock) {
      filtered = filtered.filter(product => product.inStock);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return b.buyPrice - a.buyPrice;
        case 'year':
          return b.year - a.year;
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

    setProducts(filtered);
  }, [filter, sortBy, showOnlyInStock]);

  const calculatePercentage = (buyPrice: number, marketPrice: number) => {
    return Math.round((buyPrice / marketPrice) * 100);
  };

  return (
    <div>
      {/* Filters and Sorting */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              filter === 'all'
                ? 'bg-yellow-400 text-black'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            All Products
          </button>
          <button
            onClick={() => setFilter('hobby')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              filter === 'hobby'
                ? 'bg-yellow-400 text-black'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Hobby Boxes
          </button>
          <button
            onClick={() => setFilter('retail')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              filter === 'retail'
                ? 'bg-yellow-400 text-black'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Retail/Blasters
          </button>
        </div>

        <div className="flex gap-4 items-center">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-yellow-400 focus:outline-none"
          >
            <option value="price">Sort by Price</option>
            <option value="name">Sort by Name</option>
            <option value="year">Sort by Year</option>
            <option value="category">Sort by Category</option>
          </select>
        </div>
      </div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-yellow-400 transition-all hover:transform hover:scale-105"
          >
            {/* Product Image Placeholder */}
            <div className="relative h-48 bg-gradient-to-br from-gray-700 to-gray-800">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">📦</div>
                  <div className="text-xs text-gray-400">{product.category}</div>
                </div>
              </div>
              {/* Year Badge */}
              <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs font-bold">
                {product.year}
              </div>
              {/* Percentage Badge */}
              <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">
                {calculatePercentage(product.buyPrice, product.marketPrice)}% of Market
              </div>
            </div>

            {/* Product Details */}
            <div className="p-4">
              <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2">
                {product.name}
              </h3>

              {/* Pricing */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-xs">Market Price:</span>
                  <span className="text-gray-300 line-through">${product.marketPrice}</span>
                </div>

                <div className="flex justify-between items-center border-t border-gray-700 pt-2">
                  <span className="text-yellow-400 font-semibold">Cash:</span>
                  <span className="text-2xl font-bold text-yellow-400">${product.buyPrice}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-green-400 text-sm">Credit:</span>
                  <span className="text-lg font-semibold text-green-400">${product.buyPriceCredit}</span>
                </div>
              </div>

              {/* Stock Status */}
              <div className="mt-3 pt-3 border-t border-gray-700">
                {product.inStock ? (
                  <span className="text-green-400 text-xs font-semibold">✓ Actively Buying</span>
                ) : (
                  <span className="text-red-400 text-xs font-semibold">Not Currently Buying</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bulk Bonus Notice */}
      <div className="mt-8 p-6 bg-gradient-to-r from-yellow-600/20 to-yellow-500/20 rounded-lg border border-yellow-500/50">
        <h3 className="text-xl font-bold text-yellow-400 mb-2">🎯 Bulk Collection Bonuses</h3>
        <div className="grid md:grid-cols-3 gap-4 text-white">
          <div>
            <span className="font-semibold">$1,000 - $4,999:</span>
            <span className="text-yellow-400 ml-2">+5% Bonus</span>
          </div>
          <div>
            <span className="font-semibold">$5,000 - $9,999:</span>
            <span className="text-yellow-400 ml-2">+7% Bonus</span>
          </div>
          <div>
            <span className="font-semibold">$10,000+:</span>
            <span className="text-yellow-400 ml-2">+10% Bonus</span>
          </div>
        </div>
      </div>
    </div>
  );
}
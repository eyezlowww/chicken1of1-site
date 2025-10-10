'use client';

import { useState } from 'react';
import Image from 'next/image';
import ufcProducts from '@/content/ufc-products.json';

interface SelectedProduct {
  productId: string;
  quantity: number;
  condition: 'mint' | 'nearMint' | 'excellent';
}

export default function QuoteCalculator() {
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit'>('cash');
  const [showQuote, setShowQuote] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const addProduct = () => {
    setSelectedProducts([
      ...selectedProducts,
      { productId: ufcProducts.products[0].id, quantity: 1, condition: 'mint' },
    ]);
  };

  const removeProduct = (index: number) => {
    setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
  };

  const updateProduct = (index: number, field: keyof SelectedProduct, value: any) => {
    const updated = [...selectedProducts];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedProducts(updated);
  };

  const calculateTotal = () => {
    let total = 0;
    selectedProducts.forEach((selected) => {
      const product = ufcProducts.products.find((p) => p.id === selected.productId);
      if (product) {
        const basePrice = paymentMethod === 'cash' ? product.buyPrice : product.buyPriceCredit;
        let adjustedPrice = basePrice;

        // Adjust for condition
        if (selected.condition === 'nearMint') {
          adjustedPrice *= 0.9;
        } else if (selected.condition === 'excellent') {
          adjustedPrice *= 0.8;
        }

        total += adjustedPrice * selected.quantity;
      }
    });

    // Apply bulk bonuses
    if (total >= 10000) {
      total *= 1.1;
    } else if (total >= 5000) {
      total *= 1.07;
    } else if (total >= 1000) {
      total *= 1.05;
    }

    return Math.round(total);
  };

  const handleSubmitQuote = async () => {
    if (!contactInfo.name || !contactInfo.email) {
      alert('Please provide your name and email');
      return;
    }

    setShowQuote(true);

    // TODO: Send email notification via API
    // const quoteData = {
    //   products: selectedProducts,
    //   total: calculateTotal(),
    //   paymentMethod,
    //   contactInfo,
    // };
    // await fetch('/api/quote', { method: 'POST', body: JSON.stringify(quoteData) });
  };

  return (
    <div id="quote-calculator" className="bg-gray-900 rounded-xl p-6">
      {!showQuote ? (
        <>
          {/* Product Selection */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-4">Select Your Products</h3>

            {selectedProducts.map((selected, index) => (
              <div key={index} className="mb-4 p-4 bg-gray-800 rounded-lg">
                <div className="grid md:grid-cols-4 gap-4">
                  <select
                    value={selected.productId}
                    onChange={(e) => updateProduct(index, 'productId', e.target.value)}
                    className="bg-gray-700 text-white px-4 py-2 rounded border border-gray-600 focus:border-yellow-400 focus:outline-none"
                  >
                    {ufcProducts.products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selected.condition}
                    onChange={(e) => updateProduct(index, 'condition', e.target.value)}
                    className="bg-gray-700 text-white px-4 py-2 rounded border border-gray-600 focus:border-yellow-400 focus:outline-none"
                  >
                    <option value="mint">Mint/Factory Sealed</option>
                    <option value="nearMint">Near Mint (slight wear)</option>
                    <option value="excellent">Excellent (minor damage)</option>
                  </select>

                  <input
                    type="number"
                    min="1"
                    value={selected.quantity}
                    onChange={(e) => updateProduct(index, 'quantity', parseInt(e.target.value))}
                    className="bg-gray-700 text-white px-4 py-2 rounded border border-gray-600 focus:border-yellow-400 focus:outline-none"
                    placeholder="Quantity"
                  />

                  <button
                    onClick={() => removeProduct(index)}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={addProduct}
              className="bg-yellow-400 text-black px-6 py-2 rounded font-semibold hover:bg-yellow-300 transition-colors"
            >
              + Add Product
            </button>
          </div>

          {/* Payment Method */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-4">Payment Method</h3>
            <div className="flex gap-4">
              <button
                onClick={() => setPaymentMethod('cash')}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  paymentMethod === 'cash'
                    ? 'bg-yellow-400 text-black'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                💵 Cash/PayPal/Zelle
              </button>
              <button
                onClick={() => setPaymentMethod('credit')}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  paymentMethod === 'credit'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                💳 Store Credit (+10%)
              </button>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-4">Your Information</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Your Name"
                value={contactInfo.name}
                onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
                className="bg-gray-700 text-white px-4 py-2 rounded border border-gray-600 focus:border-yellow-400 focus:outline-none"
                required
              />
              <input
                type="email"
                placeholder="Email Address"
                value={contactInfo.email}
                onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                className="bg-gray-700 text-white px-4 py-2 rounded border border-gray-600 focus:border-yellow-400 focus:outline-none"
                required
              />
              <input
                type="tel"
                placeholder="Phone (Optional)"
                value={contactInfo.phone}
                onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                className="bg-gray-700 text-white px-4 py-2 rounded border border-gray-600 focus:border-yellow-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Quote Summary */}
          {selectedProducts.length > 0 && (
            <div className="mb-6 p-6 bg-gradient-to-r from-yellow-600/20 to-yellow-500/20 rounded-lg border border-yellow-500/50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-white">Estimated Quote:</h3>
                <div className="text-right">
                  <div className="text-3xl font-bold text-yellow-400">
                    ${calculateTotal().toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">
                    {paymentMethod === 'cash' ? 'Cash Payment' : 'Store Credit'}
                  </div>
                </div>
              </div>
              <button
                onClick={handleSubmitQuote}
                className="w-full bg-yellow-400 text-black px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-300 transition-all transform hover:scale-105"
              >
                Get Official Quote →
              </button>
            </div>
          )}
        </>
      ) : (
        /* Quote Confirmation */
        <div className="text-center py-12">
          <div className="text-6xl mb-6">✅</div>
          <h2 className="text-3xl font-bold text-white mb-4">Quote Submitted!</h2>
          <p className="text-xl text-gray-300 mb-2">
            Your estimated quote is:{' '}
            <span className="text-3xl font-bold text-yellow-400">
              ${calculateTotal().toLocaleString()}
            </span>
          </p>
          <p className="text-gray-400 mb-8">
            We'll review your submission and send you an official offer within 1 hour.
          </p>

          <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-auto text-left">
            <h3 className="text-lg font-bold text-white mb-3">Next Steps:</h3>
            <ol className="space-y-2 text-gray-300">
              <li>1. Check your email for the official quote</li>
              <li>2. Accept the quote (valid for 48 hours)</li>
              <li>3. Ship your boxes with our prepaid label</li>
              <li>4. Get paid within 24 hours of receipt!</li>
            </ol>
          </div>

          <button
            onClick={() => {
              setShowQuote(false);
              setSelectedProducts([]);
              setContactInfo({ name: '', email: '', phone: '' });
            }}
            className="mt-8 bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Submit Another Quote
          </button>
        </div>
      )}
    </div>
  );
}
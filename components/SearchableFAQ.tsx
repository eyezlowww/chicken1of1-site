'use client'

import { useState, useMemo, useEffect } from 'react'
import FAQAccordion from './FAQAccordion'
import { FAQSkeleton } from './SkeletonLoader'

interface FAQItem {
  question: string
  answer: string
}

interface SearchableFAQProps {
  items: FAQItem[]
}

export default function SearchableFAQ({ items }: SearchableFAQProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  // Filter FAQ items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return items
    }

    const query = searchQuery.toLowerCase()
    return items.filter(
      (item) =>
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query)
    )
  }, [items, searchQuery])

  // Simulate search delay for better UX (show loading state briefly)
  useEffect(() => {
    if (searchQuery.trim()) {
      setIsSearching(true)
      const timer = setTimeout(() => setIsSearching(false), 300)
      return () => clearTimeout(timer)
    } else {
      setIsSearching(false)
    }
  }, [searchQuery])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const clearSearch = () => {
    setSearchQuery('')
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Search Input */}
      <div className="mb-8">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search FAQ... (e.g., 'shipping', 'break format', 'refund')"
            className="w-full pl-10 pr-10 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
              aria-label="Clear search"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Search Results Info */}
        {searchQuery && (
          <div className="mt-3 text-sm text-gray-400">
            {filteredItems.length === 0 ? (
              <span className="text-amber-400">
                No results found for &quot;{searchQuery}&quot;
              </span>
            ) : (
              <span>
                Showing {filteredItems.length} of {items.length} questions
                {filteredItems.length !== items.length && (
                  <button
                    onClick={clearSearch}
                    className="ml-2 text-primary-400 hover:text-primary-300 underline"
                  >
                    Show all
                  </button>
                )}
              </span>
            )}
          </div>
        )}
      </div>

      {/* FAQ Results */}
      {isSearching ? (
        <FAQSkeleton count={3} />
      ) : filteredItems.length === 0 && searchQuery ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0720 12a8 8 0 11-16 0 8 8 0 016.291 3.348z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            No matching questions found
          </h3>
          <p className="text-gray-400 mb-4">
            Try a different search term or browse all questions below.
          </p>
          <button
            onClick={clearSearch}
            className="text-primary-400 hover:text-primary-300 underline transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-950 rounded"
          >
            Show all questions
          </button>
        </div>
      ) : (
        <div className={`transition-opacity duration-300 ${isSearching ? 'opacity-50' : 'opacity-100'}`}>
          <FAQAccordion items={filteredItems} />
        </div>
      )}

      {/* Quick Search Suggestions */}
      {!searchQuery && (
        <div className="mt-8 p-4 bg-dark-800 rounded-lg border border-dark-700">
          <h4 className="text-sm font-semibold text-white mb-3">
            Popular searches:
          </h4>
          <div className="flex flex-wrap gap-2">
            {[
              'shipping',
              'refund',
              'break format',
              'payment',
              'Random Team',
              'PYT',
              'international',
            ].map((term) => (
              <button
                key={term}
                onClick={() => setSearchQuery(term)}
                className="px-3 py-1 text-sm bg-dark-600 text-gray-300 rounded-full hover:bg-dark-500 hover:text-white transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
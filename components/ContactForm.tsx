'use client'

import { useState } from 'react'

interface FormData {
  name: string
  email: string
  subject: string
  message: string
}

interface FormState {
  data: FormData
  loading: boolean
  success: boolean
  error: string
}

export default function ContactForm() {
  const [formState, setFormState] = useState<FormState>({
    data: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
    loading: false,
    success: false,
    error: '',
  })

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormState(prev => ({
      ...prev,
      data: { ...prev.data, [name]: value },
      error: '', // Clear error when user starts typing
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setFormState(prev => ({ ...prev, loading: true, error: '', success: false }))

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formState.data),
      })

      const result = await response.json()

      if (response.ok) {
        setFormState(prev => ({
          ...prev,
          loading: false,
          success: true,
          data: { name: '', email: '', subject: '', message: '' }, // Reset form
        }))
      } else {
        setFormState(prev => ({
          ...prev,
          loading: false,
          error: result.error || 'Something went wrong. Please try again.',
        }))
      }
    } catch (error) {
      setFormState(prev => ({
        ...prev,
        loading: false,
        error: 'Network error. Please check your connection and try again.',
      }))
    }
  }

  if (formState.success) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Message Sent Successfully!
          </h3>
          <p className="text-gray-400 mb-4">
            Thanks for reaching out! We&apos;ll get back to you within 24 hours.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            You should also receive a confirmation email shortly.
          </p>
          <button
            onClick={() => setFormState(prev => ({ ...prev, success: false }))}
            className="btn-outline"
          >
            Send Another Message
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <h3 className="text-xl font-semibold text-white mb-4">
        Quick Contact Form
      </h3>
      <p className="text-gray-400 text-sm mb-6">
        Fill out this form and we&apos;ll get back to you within 24 hours.
      </p>

      {formState.error && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm">{formState.error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formState.data.name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Your name"
            required
            disabled={formState.loading}
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formState.data.email}
            onChange={handleInputChange}
            className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="your@email.com"
            required
            disabled={formState.loading}
          />
        </div>

        <div>
          <label
            htmlFor="subject"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Subject *
          </label>
          <select
            id="subject"
            name="subject"
            value={formState.data.subject}
            onChange={handleInputChange}
            className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
            disabled={formState.loading}
          >
            <option value="">Select a topic</option>
            <option value="Break Inquiry">Break Inquiry</option>
            <option value="Product Request">Product Request</option>
            <option value="Partnership">Partnership</option>
            <option value="Technical Issue">Technical Issue</option>
            <option value="General Question">General Question</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Message *
          </label>
          <textarea
            id="message"
            name="message"
            value={formState.data.message}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Tell us more about your inquiry..."
            required
            disabled={formState.loading}
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={formState.loading}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {formState.loading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Sending...
            </span>
          ) : (
            'Send Message'
          )}
        </button>
      </form>

      <p className="text-xs text-gray-500 mt-4">
        For fastest response, DM us on Instagram @chicken1of1
      </p>
    </div>
  )
}
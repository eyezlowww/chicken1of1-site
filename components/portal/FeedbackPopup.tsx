// Feedback popup modal for the portal sidebar
// Allows any logged-in user to submit suggestions, bug reports, or feature requests

'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

type FeedbackType = 'suggestion' | 'bug' | 'feature'

interface FeedbackPopupProps {
  open: boolean
  onClose: () => void
}

export default function FeedbackPopup({ open, onClose }: FeedbackPopupProps) {
  const [type, setType] = useState<FeedbackType>('suggestion')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const backdropRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Focus textarea when popup opens
  useEffect(() => {
    if (open && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100)
    }
  }, [open])

  const handleClose = useCallback(() => {
    setType('suggestion')
    setMessage('')
    setStatus('idle')
    setErrorMsg('')
    onClose()
  }, [onClose])

  // Auto-close after success
  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => {
        handleClose()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [status, handleClose])

  // Close on Escape key
  useEffect(() => {
    if (!open) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, handleClose])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (message.trim().length < 10) {
      setErrorMsg('Message must be at least 10 characters.')
      return
    }

    setStatus('submitting')
    setErrorMsg('')

    try {
      const res = await fetch('/api/streamdata/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, message: message.trim() }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Something went wrong.' }))
        throw new Error(data.error || 'Failed to submit feedback.')
      }

      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Failed to submit feedback.')
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Send feedback"
        className="relative z-10 w-full max-w-md rounded-xl border border-blood-900/40 bg-dark-950 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-blood-900/40 px-5 py-4">
          <h2 className="text-sm font-semibold text-white">Send Feedback</h2>
          <button
            onClick={handleClose}
            className="rounded-lg p-1 text-cage-500 transition-colors hover:bg-dark-800 hover:text-white"
            aria-label="Close feedback popup"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          {status === 'success' ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-500/15">
                <svg className="h-6 w-6 text-gold-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <p className="text-sm font-medium text-white">Thanks for your feedback!</p>
              <p className="text-xs text-cage-400">This popup will close automatically.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type select */}
              <div>
                <label htmlFor="feedback-type" className="mb-1.5 block text-xs font-medium text-cage-400">
                  Type
                </label>
                <select
                  id="feedback-type"
                  value={type}
                  onChange={(e) => setType(e.target.value as FeedbackType)}
                  className="w-full rounded-lg border border-blood-900/40 bg-dark-900 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/30"
                >
                  <option value="suggestion">Suggestion</option>
                  <option value="bug">Bug Report</option>
                  <option value="feature">Feature Request</option>
                </select>
              </div>

              {/* Message textarea */}
              <div>
                <label htmlFor="feedback-message" className="mb-1.5 block text-xs font-medium text-cage-400">
                  Message
                </label>
                <textarea
                  ref={textareaRef}
                  id="feedback-message"
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value)
                    if (errorMsg) setErrorMsg('')
                  }}
                  placeholder="Tell us what's on your mind..."
                  rows={4}
                  required
                  minLength={10}
                  className="w-full resize-none rounded-lg border border-blood-900/40 bg-dark-900 px-3 py-2 text-sm text-white placeholder-cage-600 outline-none transition-colors focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/30"
                />
                <p className="mt-1 text-[11px] text-cage-600">
                  {message.trim().length}/10 minimum characters
                </p>
              </div>

              {/* Error message */}
              {errorMsg && (
                <p className="rounded-lg border border-blood-700/40 bg-blood-950/40 px-3 py-2 text-xs text-blood-400">
                  {errorMsg}
                </p>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold-500 px-4 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === 'submitting' ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Sending...
                  </>
                ) : (
                  'Submit Feedback'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

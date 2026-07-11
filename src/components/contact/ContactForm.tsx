'use client'

import { useState } from 'react'
import { ArrowRight, Loader2, CheckCircle2 } from 'lucide-react'

export default function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [concern, setConcern] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, concern }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
        setStatus('error')
        return
      }
      setStatus('sent')
    } catch {
      setError('Could not reach the server. Please check your connection and try again.')
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className="rounded-3xl border border-[#ECE5D9] bg-white p-10 text-center shadow-[0_1px_2px_rgba(31,28,24,0.04),0_16px_40px_-20px_rgba(31,28,24,0.12)]">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#FF9933]/10 text-[#FF9933]">
          <CheckCircle2 size={24} />
        </div>
        <h3
          className="mb-2 text-xl text-[#1F1C18]"
          style={{ fontFamily: "'Fraunces','Instrument Serif',serif" }}
        >
          Message sent
        </h3>
        <p className="text-[13.5px] leading-relaxed text-[#6E685F]">
          Thanks for reaching out, our team will get back to you shortly.
        </p>
      </div>
    )
  }

  const inputClass =
    'w-full rounded-xl border border-[#ECE5D9] bg-[#FFFCF8] px-4 py-3 text-[14px] text-[#1F1C18] outline-none transition-all duration-150 placeholder:text-[#A89F94] focus:border-[#FF9933] focus:bg-white focus:ring-4 focus:ring-[#FF9933]/12'

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-3xl border border-[#ECE5D9] bg-white p-8 shadow-[0_1px_2px_rgba(31,28,24,0.04),0_16px_40px_-20px_rgba(31,28,24,0.12)] sm:p-10"
    >
      <div className="mb-5">
        <label className="mb-1.5 block text-[12.5px] font-medium text-[#4A453D]">
          Full name <span className="text-[#FF9933]">*</span>
        </label>
        <input
          required
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Your full name"
          className={inputClass}
        />
      </div>

      <div className="mb-5">
        <label className="mb-1.5 block text-[12.5px] font-medium text-[#4A453D]">
          Email address <span className="text-[#FF9933]">*</span>
        </label>
        <input
          required
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          className={inputClass}
        />
      </div>

      <div className="mb-5">
        <label className="mb-1.5 block text-[12.5px] font-medium text-[#4A453D]">
          Mobile number <span className="text-[#FF9933]">*</span>
        </label>
        <input
          required
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="e.g. 98765 43210"
          className={inputClass}
        />
      </div>

      <div className="mb-6">
        <label className="mb-1.5 block text-[12.5px] font-medium text-[#4A453D]">
          What can we help with? <span className="text-[#A89F94] font-normal">(optional)</span>
        </label>
        <textarea
          value={concern}
          onChange={e => setConcern(e.target.value)}
          placeholder="Tell us a little about your question or concern..."
          rows={4}
          className={`${inputClass} resize-none`}
        />
      </div>

      {status === 'error' && (
        <div role="alert" aria-live="polite" className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-[13px] text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-[#FF9933] px-6 py-3.5 text-[14px] font-semibold text-white transition-all duration-150 hover:bg-[#E07A12] hover:shadow-[0_8px_20px_-8px_rgba(255,153,51,0.55)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:shadow-none"
      >
        {status === 'sending' ? (
          <>
            <Loader2 size={15} className="animate-spin" /> Sending...
          </>
        ) : (
          <>
            Send message <ArrowRight size={15} />
          </>
        )}
      </button>
    </form>
  )
}

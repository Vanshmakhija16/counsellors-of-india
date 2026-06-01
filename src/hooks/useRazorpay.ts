/**
 * useRazorpay — shared hook for triggering a per-therapist Razorpay payment.
 *
 * This hook uses the therapist's OWN Razorpay account — money goes directly
 * to the therapist's bank. The platform never intermediates payments.
 *
 * Usage:
 *   const { openPayment, loading } = useRazorpay()
 *   await openPayment({ therapistId, appointmentId, amount, ... })
 */

import { useCallback, useState } from 'react'

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any
  }
}

export interface RazorpayPaymentOptions {
  /** Therapist's UUID — used to look up their Razorpay credentials server-side */
  therapistId: string
  /** Appointment ID created by /api/book — used to mark as paid on success */
  appointmentId: string
  /** Amount in INR (e.g. 1500 for ₹1,500) */
  amount: number
  /** Short description shown in the modal */
  description?: string
  /** Name shown at the top of the modal */
  name?: string
  prefillEmail?: string
  prefillPhone?: string
  prefillName?: string
}

export interface RazorpayPaymentResult {
  razorpay_order_id:   string
  razorpay_payment_id: string
  razorpay_signature:  string
}

// Load the Razorpay checkout script once
let scriptPromise: Promise<void> | null = null

function loadRazorpayScript(): Promise<void> {
  if (typeof window !== 'undefined' && window.Razorpay) return Promise.resolve()
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise((resolve, reject) => {
    const script    = document.createElement('script')
    script.src      = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async    = true
    script.onload   = () => resolve()
    script.onerror  = () => reject(new Error('Failed to load Razorpay SDK'))
    document.head.appendChild(script)
  })

  return scriptPromise
}

export function useRazorpay() {
  const [loading, setLoading] = useState(false)

  /**
   * Opens the Razorpay modal using the therapist's own credentials.
   * Returns the payment result on success. Throws on failure / dismissal.
   */
  const openPayment = useCallback(
    async (options: RazorpayPaymentOptions): Promise<RazorpayPaymentResult> => {
      setLoading(true)
      try {
        // ── 1. Load SDK ──────────────────────────────────────────────
        await loadRazorpayScript()

        // ── 2. Create order via therapist's own Razorpay account ─────
        const orderRes = await fetch('/api/razorpay/therapist-order', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({
            therapist_id:   options.therapistId,
            amount:         options.amount,
            appointment_id: options.appointmentId,
            booking_id:     `booking_${options.appointmentId}`,
          }),
        })
        const order = await orderRes.json()
        if (!orderRes.ok) throw new Error(order?.error ?? 'Failed to create payment order')

        // ── 3. Open Razorpay modal — uses therapist's PUBLIC key ─────
        const result = await new Promise<RazorpayPaymentResult>((resolve, reject) => {
          const rzp = new window.Razorpay({
            key:         order.key_id,              // therapist's public key
            amount:      order.amount,              // in paise
            currency:    order.currency ?? 'INR',
            name:        options.name        ?? 'Counsellors of India',
            description: options.description ?? 'Therapy Session',
            order_id:    order.order_id,
            prefill: {
              name:    options.prefillName  ?? '',
              email:   options.prefillEmail ?? '',
              contact: options.prefillPhone ?? '',
            },
            theme: { color: '#5a7f7a' },
            modal: {
              ondismiss() {
                reject(new Error('Payment cancelled by user'))
              },
            },
            handler(response: RazorpayPaymentResult) {
              resolve(response)
            },
          })
          rzp.open()
        })

        // ── 4. Verify signature server-side ──────────────────────────
        const verifyRes = await fetch('/api/razorpay/therapist-verify', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({
            therapist_id:        options.therapistId,
            razorpay_order_id:   result.razorpay_order_id,
            razorpay_payment_id: result.razorpay_payment_id,
            razorpay_signature:  result.razorpay_signature,
            appointment_id:      options.appointmentId,
          }),
        })
        const verifyData = await verifyRes.json()
        if (!verifyRes.ok || !verifyData.verified) {
          throw new Error(verifyData?.error ?? 'Payment verification failed')
        }

        return result
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { openPayment, loading }
}

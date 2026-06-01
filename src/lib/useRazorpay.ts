'use client'

/**
 * useRazorpay — shared hook to open the Razorpay checkout modal.
 *
 * Usage:
 *   const { openRazorpay, loading, error } = useRazorpay()
 *   await openRazorpay({ amount, prefill, onSuccess, onFailure })
 */

import { useState, useCallback } from 'react'

interface OpenRazorpayOptions {
  /** Amount in ₹ (rupees, not paise) */
  amount: number
  /** Description shown in the Razorpay modal */
  description?: string
  /** Receipt string passed to order */
  receipt?: string
  /** Pre-fill customer details */
  prefill?: {
    name?: string
    email?: string
    contact?: string
  }
  /** Called with payment IDs after successful payment — verify server-side here */
  onSuccess: (payload: {
    razorpay_payment_id: string
    razorpay_order_id: string
    razorpay_signature: string
  }) => Promise<void> | void
  /** Called on failure / dismiss */
  onFailure?: (err: string) => void
}

declare global {
  interface Window {
    Razorpay: any
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise(resolve => {
    if (window.Razorpay) { resolve(true); return }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload  = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export function useRazorpay() {
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const openRazorpay = useCallback(async (opts: OpenRazorpayOptions) => {
    setLoading(true)
    setError(null)

    try {
      // 1. Load Razorpay checkout script
      const loaded = await loadRazorpayScript()
      if (!loaded) {
        throw new Error('Failed to load Razorpay checkout. Check your internet connection.')
      }

      // 2. Create order server-side
      const orderRes = await fetch('/api/razorpay?action=order', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          amount:  opts.amount,
          receipt: opts.receipt,
        }),
      })
      const orderData = await orderRes.json()
      if (!orderRes.ok) {
        throw new Error(orderData.error ?? 'Could not create payment order.')
      }

      const { order, key_id } = orderData

      // 3. Open Razorpay modal
      await new Promise<void>((resolve, reject) => {
        const rzp = new window.Razorpay({
          key:         key_id,
          amount:      order.amount,
          currency:    order.currency,
          name:        'Counsellors of India',
          description: opts.description ?? 'Session Booking',
          image:       '/logo-icon.jpg',
          order_id:    order.id,
          prefill:     opts.prefill ?? {},
          theme:       { color: '#5a7f7a' },

          handler: async (response: {
            razorpay_payment_id: string
            razorpay_order_id: string
            razorpay_signature: string
          }) => {
            try {
              await opts.onSuccess(response)
              resolve()
            } catch (e: any) {
              reject(new Error(e?.message ?? 'Payment success handler failed'))
            }
          },

          modal: {
            ondismiss: () => {
              opts.onFailure?.('Payment cancelled by user.')
              resolve() // resolve so setLoading(false) runs
            },
          },
        })

        rzp.on('payment.failed', (response: any) => {
          const msg = response?.error?.description ?? 'Payment failed.'
          opts.onFailure?.(msg)
          reject(new Error(msg))
        })

        rzp.open()
      })
    } catch (err: any) {
      const msg = err?.message ?? 'Payment error'
      setError(msg)
      opts.onFailure?.(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  return { openRazorpay, loading, error }
}

'use client'

/**
 * useRazorpayCheckout
 *
 * Custom hook that handles the full per-therapist Razorpay payment flow:
 *  1. Creates a Razorpay order via /api/razorpay/therapist-order
 *  2. Loads the Razorpay JS SDK (only once)
 *  3. Opens the Razorpay checkout with the therapist's PUBLIC key
 *  4. Verifies payment signature via /api/razorpay/therapist-verify
 *  5. Returns { initiatePayment, paying, error }
 *
 * Security:
 *  - The therapist's KEY SECRET never leaves the server
 *  - Only the public Key ID is sent to the browser
 *  - Signature verification is done server-side
 */

import { useCallback, useRef, useState } from 'react'

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any
  }
}

interface PaymentOptions {
  therapistId:   string
  appointmentId: string
  amount:        number              // INR
  clientName:    string
  clientEmail:   string
  clientPhone:   string
  description?:  string
  onSuccess:     (paymentId: string) => void
  onFailure?:    (reason: string)   => void
}

export function useRazorpayCheckout() {
  const [paying, setPaying]   = useState(false)
  const [error,  setError]    = useState('')
  const rzpRef = useRef<boolean>(false)       // tracks if SDK script is loading

  // ── Load Razorpay JS SDK ────────────────────────────────────────────
  async function loadRazorpaySDK(): Promise<void> {
    if (typeof window !== 'undefined' && window.Razorpay) return

    return new Promise((resolve, reject) => {
      if (rzpRef.current) {
        // Already loading — wait for script onload
        const check = setInterval(() => {
          if (window.Razorpay) { clearInterval(check); resolve() }
        }, 100)
        return
      }

      rzpRef.current = true
      const script    = document.createElement('script')
      script.src      = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async    = true
      script.onload   = () => resolve()
      script.onerror  = () => reject(new Error('Failed to load Razorpay SDK'))
      document.head.appendChild(script)
    })
  }

  const initiatePayment = useCallback(async (opts: PaymentOptions) => {
    setError('')
    setPaying(true)

    try {
      // ── Step 1: Create order on server using therapist's credentials ──
      const orderRes = await fetch('/api/razorpay/therapist-order', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          therapist_id:   opts.therapistId,
          amount:         opts.amount,
          appointment_id: opts.appointmentId,
          booking_id:     opts.appointmentId,   // UUID = 36 chars, within Razorpay's 40-char receipt limit
        }),
      })

      const orderData = await orderRes.json()
      if (!orderRes.ok) {
        throw new Error(orderData.error ?? 'Failed to create payment order.')
      }

      const { order_id, key_id, currency } = orderData

      // ── Step 2: Load Razorpay SDK ─────────────────────────────────
      await loadRazorpaySDK()

      // ── Step 3: Open checkout ──────────────────────────────────────
      await new Promise<void>((resolve, reject) => {
        const options = {
          key:           key_id,                // therapist's PUBLIC key
          amount:        Math.round(opts.amount * 100),
          currency:      currency ?? 'INR',
          order_id,
          name:          'Counsellors of India',
          description:   opts.description ?? 'Therapy Session',
          prefill: {
            name:    opts.clientName,
            email:   opts.clientEmail,
            contact: opts.clientPhone,
          },
          theme: {
            color: '#5a7f7a',
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          handler: async (response: any) => {
            try {
              // ── Step 4: Verify signature server-side ──────────────
              const verifyRes = await fetch('/api/razorpay/therapist-verify', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({
                  therapist_id:        opts.therapistId,
                  razorpay_order_id:   response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature:  response.razorpay_signature,
                  appointment_id:      opts.appointmentId,
                }),
              })

              const verifyData = await verifyRes.json()
              if (!verifyRes.ok || !verifyData.verified) {
                reject(new Error(verifyData.error ?? 'Payment verification failed.'))
                return
              }

              opts.onSuccess(response.razorpay_payment_id)
              resolve()
            } catch (verifyErr) {
              reject(verifyErr)
            }
          },
          modal: {
            ondismiss: () => {
              reject(new Error('Payment cancelled by user.'))
            },
          },
        }

        const rzp = new window.Razorpay(options)
        rzp.on('payment.failed', (response: { error: { description: string } }) => {
          reject(new Error(response?.error?.description ?? 'Payment failed.'))
        })
        rzp.open()
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Payment error'
      setError(message)
      opts.onFailure?.(message)
    } finally {
      setPaying(false)
    }
  }, [])

  return { initiatePayment, paying, error, clearError: () => setError('') }
}

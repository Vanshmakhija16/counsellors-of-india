/**
 * useBooking — universal booking hook for all ClassicTemplate variants.
 *
 * PayU uses a browser-redirect flow (not a popup), so we:
 *   1. POST /api/booking/hold  → get PayU form fields or { free: true }
 *   2. Build a hidden <form> and submit it to PayU
 *   3. Browser leaves the site; PayU posts result to /api/payu/booking-callback
 *   4. Callback redirects to /booking/success or /booking/failure
 *
 * For free slots (no price), hold returns { free: true } and we
 * call onSuccess immediately without touching PayU.
 *
 * On 409 (slot taken), we silently re-fetch fresh booked times and call
 * onSlotsRefresh so the booking UI can remove the taken slot immediately.
 */

'use client'

import { useState } from 'react'
import { useRazorpayCheckout } from '@/hooks/useRazorpayCheckout'

export interface BookingPayload {
  therapist_id:  string
  client_name:   string
  client_email:  string
  client_phone:  string
  scheduled_at:  string
  duration_mins: number
  service_name?: string | null
  service_price?: number | null
}

interface UseBookingOptions {
  onSuccess?:      (appointmentId: string) => void // called for free bookings only
  onError?:        (message: string) => void
  onSlotsRefresh?: (bookedTimes: string[]) => void // called on 409 with fresh slot list
}

export function useBooking({ onSuccess, onError, onSlotsRefresh }: UseBookingOptions = {}) {
  const [loading, setLoading] = useState(false)
  const { initiatePayment } = useRazorpayCheckout()

  async function book(payload: BookingPayload) {
    setLoading(true)
    try {
      const res  = await fetch('/api/booking/hold', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      })
      const data = await res.json()

      if (!res.ok) {
        setLoading(false)

        // On 409 (race condition — slot just taken by someone else),
        // silently re-fetch the current booked times so the UI removes
        // the taken slot without requiring a page reload.
        if (res.status === 409 && onSlotsRefresh) {
          try {
            const r = await fetch(`/api/booked-slots?therapist_id=${encodeURIComponent(payload.therapist_id)}`)
            if (r.ok) {
              const d = await r.json()
              onSlotsRefresh(d.bookedTimes ?? [])
            }
          } catch {
            // best-effort — ignore if refresh fails
          }
        }

        // On 429 (monthly booking limit reached), treat as no slots available
        if (res.status === 429 && data.code === 'BOOKING_LIMIT_REACHED') {
          onError?.('NO_SLOTS_AVAILABLE')
          return
        }

        onError?.(data.error ?? 'Something went wrong. Please try again.')
        return
      }

      // Free booking — confirmed immediately by the hold endpoint
      if (data.free) {
        setLoading(false)
        onSuccess?.(data.appointment_id)
        return
      }

      // Paid booking, Razorpay — stays on this page and opens the therapist's
      // own Razorpay checkout (order + signature verification happen inside
      // useRazorpayCheckout). Kept as its own branch so the original PayU
      // redirect flow right below is completely untouched.
      if (data.provider === 'razorpay') {
        await initiatePayment({
          therapistId:   data.therapist_id,
          appointmentId: data.appointment_id,
          amount:        data.amount,
          clientName:    data.client_name,
          clientEmail:   data.client_email,
          clientPhone:   data.client_phone,
          description:   data.description,
          onSuccess: () => {
            setLoading(false)
            onSuccess?.(data.appointment_id)
          },
          onFailure: (reason) => {
            setLoading(false)
            onError?.(reason)
          },
        })
        return
      }

      // Paid booking, PayU (unchanged) — submit form to PayU (browser leaves the page)
      // Do NOT setLoading(false) here — page navigates away
      const form = document.createElement('form')
      form.method  = 'POST'
      form.action  = data.action
      form.style.display = 'none'

      for (const [key, value] of Object.entries(data.fields as Record<string, string>)) {
        const input   = document.createElement('input')
        input.type    = 'hidden'
        input.name    = key
        input.value   = value
        form.appendChild(input)
      }

      document.body.appendChild(form)
      form.submit()
      // Page navigates away — no further code runs after this line
    } catch (err: unknown) {
      setLoading(false)
      onError?.(err instanceof Error ? err.message : 'Network error. Please try again.')
    }
  }

  return { book, loading }
}

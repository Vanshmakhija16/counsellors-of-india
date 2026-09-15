'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

// Client lands here after approving a session-booking payment on PayPal's
// hosted page (return_url set in /api/paypal/booking/create-order).
// PayPal appends `token` (the order id) automatically; we also pass
// appointment_id through ourselves. Mirrors /payment/paypal-return's shape
// exactly, but capturing a MULTIPARTY order and routing into the booking
// success/failure pages instead of the plan ones.

function PaypalBookingReturnInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [message, setMessage] = useState('Confirming your payment…')

  useEffect(() => {
    const token = searchParams.get('token') // PayPal's order id
    const appointmentId = searchParams.get('appointment_id')

    if (!token || !appointmentId) {
      router.replace('/booking/failure?reason=bad_request')
      return
    }

    fetch('/api/paypal/booking/capture-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paypal_order_id: token, appointment_id: appointmentId }),
    })
      .then(async res => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Capture failed')
        router.replace(`/booking/success?id=${appointmentId}`)
      })
      .catch(err => {
        console.error('[booking/paypal-return]', err)
        setMessage('We could not confirm this payment.')
        setTimeout(() => router.replace(`/booking/failure?reason=failed`), 1200)
      })
  }, [router, searchParams])

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#fafaf8] px-4 py-16">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-[#3C3B6E] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[#6b6056]">{message}</p>
      </div>
    </main>
  )
}

export default function PaypalBookingReturnPage() {
  return (
    <Suspense fallback={null}>
      <PaypalBookingReturnInner />
    </Suspense>
  )
}

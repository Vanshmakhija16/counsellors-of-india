'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

// Buyer lands here after approving payment on PayPal's hosted page
// (return_url set in /api/paypal/create-order). PayPal appends `token`
// (the order id) automatically. We capture the order server-side, then
// route into the SAME success/failure pages the Razorpay/PayU flows
// already use — no separate UI needed for this gateway.

function PaypalReturnInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [message, setMessage] = useState('Confirming your payment…')

  useEffect(() => {
    const token = searchParams.get('token') // PayPal's order id
    const plan = searchParams.get('plan')
    const redirect = searchParams.get('redirect') || sessionStorage.getItem('pending_plan_redirect') || '/dashboard'

    if (!token || !plan) {
      router.replace('/payment/failure?reason=bad_plan')
      return
    }

    fetch('/api/paypal/capture-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paypal_order_id: token, plan }),
    })
      .then(async res => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Capture failed')
        sessionStorage.removeItem('pending_plan')
        sessionStorage.removeItem('pending_plan_redirect')
        router.replace(`/payment/success?plan=${plan}&redirect=${encodeURIComponent(redirect)}`)
      })
      .catch(err => {
        console.error('[paypal-return]', err)
        setMessage('We could not confirm this payment.')
        setTimeout(() => router.replace('/payment/failure?reason=failed'), 1200)
      })
  }, [router, searchParams])

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F6F3EE] px-4 py-16">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-[#FF9933] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[#6b6056]">{message}</p>
      </div>
    </main>
  )
}

export default function PaypalReturnPage() {
  return (
    <Suspense fallback={null}>
      <PaypalReturnInner />
    </Suspense>
  )
}

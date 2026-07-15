'use client'

/**
 * Client helper for the PLATFORM-level Razorpay plan-upgrade flow
 * (Starter / Pro subscription — distinct from the per-therapist booking
 * payments in useRazorpayCheckout.ts).
 *
 * Order creation: POST /api/razorpay/create-order        (uses RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET)
 * Verification:   POST /api/razorpay/upgrade-plan          (uses RAZORPAY_KEY_SECRET, applies the plan)
 *
 * Mirrors payu-client.ts's shape (a plain async function you can call from
 * a button handler) so swapping the pricing page over is a one-line change.
 * Nothing about the PayU version is touched.
 */

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any
  }
}

let sdkLoading: Promise<void> | null = null

function loadRazorpaySDK(): Promise<void> {
  if (typeof window !== 'undefined' && window.Razorpay) return Promise.resolve()
  if (sdkLoading) return sdkLoading

  sdkLoading = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Razorpay SDK'))
    document.head.appendChild(script)
  })
  return sdkLoading
}

interface StartOptions {
  plan: string
  name?: string
  email?: string
}

/**
 * Creates a platform Razorpay order for the given plan, opens checkout, and
 * on success verifies + applies the upgrade server-side. Resolves once the
 * plan is confirmed applied; rejects (with a user-facing message) on any
 * failure or if the user closes the checkout modal.
 */
export async function startRazorpayPlanCheckout({ plan, name, email }: StartOptions): Promise<void> {
  const orderRes = await fetch('/api/razorpay/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan, receipt: `plan_${plan}_${Date.now()}` }),
  })
  const order = await orderRes.json()
  if (!orderRes.ok || !order?.id) {
    throw new Error(order?.error ?? 'Could not start payment. Please try again.')
  }

  await loadRazorpaySDK()

  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? ''
  if (!keyId) {
    throw new Error('Razorpay is not configured (missing NEXT_PUBLIC_RAZORPAY_KEY_ID).')
  }

  await new Promise<void>((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: keyId,
      amount: order.amount,
      currency: order.currency ?? 'INR',
      order_id: order.id,
      name: 'Counsellors of India',
      description: `${plan.charAt(0).toUpperCase()}${plan.slice(1)} plan`,
      prefill: { name: name ?? '', email: email ?? '' },
      theme: { color: '#FF9933' },
      handler: async (response: {
        razorpay_order_id: string
        razorpay_payment_id: string
        razorpay_signature: string
      }) => {
        try {
          const verifyRes = await fetch('/api/razorpay/upgrade-plan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan,
            }),
          })
          const verifyData = await verifyRes.json()
          if (!verifyRes.ok || !verifyData.success) {
            reject(new Error(verifyData.error ?? 'Payment verification failed.'))
            return
          }
          resolve()
        } catch (err) {
          reject(err instanceof Error ? err : new Error('Payment verification failed.'))
        }
      },
      modal: {
        ondismiss: () => reject(new Error('Payment cancelled.')),
      },
    })
    rzp.on('payment.failed', (response: { error: { description: string } }) => {
      reject(new Error(response?.error?.description ?? 'Payment failed.'))
    })
    rzp.open()
  })
}

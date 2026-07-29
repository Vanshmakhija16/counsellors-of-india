'use client'

// Browser-side PayPal checkout starter — mirrors razorpay-client.ts /
// payu-client.ts's shape and naming convention. Redirect-based flow (same
// UX as the existing PayU integration): the browser navigates away to
// PayPal's hosted approval page, then back to /payment/paypal-return,
// which captures the order and applies the plan upgrade.

export async function startPaypalPlanCheckout(params: { plan: string; redirectAfter?: string }) {
  const res = await fetch('/api/paypal/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan: params.plan, redirectAfter: params.redirectAfter ?? '/dashboard' }),
  })

  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error || 'Failed to start PayPal checkout.')
  }

  const approveUrl = (data.links as { href: string; rel: string }[] | undefined)
    ?.find(l => l.rel === 'approve')?.href

  if (!approveUrl) {
    throw new Error('PayPal did not return an approval link.')
  }

  // Stash what we need to finish the flow once the buyer returns —
  // matches the existing sessionStorage.setItem('pending_plan', ...)
  // pattern already used for Razorpay/PayU on the pricing page.
  sessionStorage.setItem('pending_plan', params.plan)
  if (params.redirectAfter) sessionStorage.setItem('pending_plan_redirect', params.redirectAfter)

  window.location.href = approveUrl
  // Browser navigates away here — nothing below runs on success.
}

'use client'

/**
 * Client helper for the PayU hosted-checkout flow.
 *
 * Unlike Razorpay's in-page modal, PayU requires a full-page form POST that
 * redirects the browser to PayU's gateway. We ask our server for the signed
 * fields, then auto-submit a hidden form to PayU.
 */

export interface PayuInitResponse {
  action: string
  fields: Record<string, string>
}

/** Build + submit a hidden form to PayU, redirecting the browser to the gateway. */
export function submitToPayu({ action, fields }: PayuInitResponse): void {
  const form = document.createElement('form')
  form.method = 'POST'
  form.action = action
  form.style.display = 'none'

  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = name
    input.value = value
    form.appendChild(input)
  }

  document.body.appendChild(form)
  form.submit()
}

/**
 * Ask the server to initialise a subscription payment, then redirect to PayU.
 * Throws on failure so the caller can surface an error and reset UI state.
 */
export async function startPayuPlanCheckout(plan: string): Promise<void> {
  const res = await fetch('/api/payu/initiate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan }),
  })
  const data = (await res.json()) as PayuInitResponse & { error?: string }
  if (!res.ok || !data.action || !data.fields) {
    throw new Error(data.error ?? 'Could not start payment. Please try again.')
  }
  submitToPayu(data)
  // Browser navigates away here; nothing after this runs.
}

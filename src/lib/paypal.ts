// PayPal REST API (Orders v2) client — SERVER-SIDE ONLY. Used for the
// therapist's platform SUBSCRIPTION PLAN payment (Starter/Pro), tenant by
// tenant. NOT used for session-booking payments — those go through Stripe
// Connect (see stripe-client.ts) so money reaches the therapist directly.
//
// Naming matches the existing razorpay.ts/razorpay-client.ts and
// payu.ts/payu-client.ts convention: this file (paypal.ts) is the
// server-side API wrapper; paypal-client.ts is the browser-side caller.
//
// Env vars expected, per tenant prefix (e.g. US):
//   PAYPAL_CLIENT_ID_US, PAYPAL_CLIENT_SECRET_US
//   PAYPAL_MODE_US = 'sandbox' | 'live'  (defaults to 'sandbox' if unset)

interface PayPalCreds {
  clientId: string
  clientSecret: string
  baseUrl: string
}

function getPayPalCreds(tenantPrefix: string): PayPalCreds {
  const clientId = process.env[`PAYPAL_CLIENT_ID_${tenantPrefix}`]
  const clientSecret = process.env[`PAYPAL_CLIENT_SECRET_${tenantPrefix}`]
  const mode = process.env[`PAYPAL_MODE_${tenantPrefix}`] || 'sandbox'

  if (!clientId || !clientSecret) {
    throw new Error(
      `Missing PayPal credentials for tenant "${tenantPrefix}". ` +
      `Set PAYPAL_CLIENT_ID_${tenantPrefix} and PAYPAL_CLIENT_SECRET_${tenantPrefix} in .env.local.`
    )
  }

  return {
    clientId,
    clientSecret,
    baseUrl: mode === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com',
  }
}

async function getAccessToken(tenantPrefix: string): Promise<{ token: string; baseUrl: string }> {
  const creds = getPayPalCreds(tenantPrefix)
  const auth = Buffer.from(`${creds.clientId}:${creds.clientSecret}`).toString('base64')

  const res = await fetch(`${creds.baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`PayPal auth failed (${res.status}): ${detail}`)
  }

  const data = await res.json()
  return { token: data.access_token as string, baseUrl: creds.baseUrl }
}

/**
 * Creates a PayPal order for a plan-subscription payment. Buyer is
 * redirected to PayPal's hosted approval page (the 'approve' link in the
 * response), then back to `returnUrl` (or `cancelUrl` if they back out) —
 * same redirect-based UX as the existing PayU flow, not a popup/JS-SDK
 * embed, for consistency with what's already in this codebase.
 *
 * `amount` must be a plain decimal string, e.g. "29.00" — PayPal does not
 * accept amounts in cents/paise like Razorpay/Stripe do.
 */
export async function createPayPalOrder(params: {
  tenantPrefix: string
  amount: string
  currency: string // e.g. 'USD'
  planLabel: string // e.g. "Pro Plan"
  therapistId: string
  returnUrl: string
  cancelUrl: string
}) {
  const { token, baseUrl } = await getAccessToken(params.tenantPrefix)

  const res = await fetch(`${baseUrl}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: params.therapistId,
          description: params.planLabel,
          custom_id: params.therapistId,
          amount: {
            currency_code: params.currency,
            value: params.amount,
          },
        },
      ],
      application_context: {
        brand_name: 'Counsellors of America',
        user_action: 'PAY_NOW',
        return_url: params.returnUrl,
        cancel_url: params.cancelUrl,
      },
    }),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`PayPal create-order failed (${res.status}): ${detail}`)
  }

  return res.json() as Promise<{ id: string; status: string; links: { href: string; rel: string }[] }>
}

/**
 * Captures (finalizes) a previously-created and buyer-approved PayPal
 * order. Call this from your capture-order route after the buyer returns
 * from PayPal's approval flow.
 */
export async function capturePayPalOrder(params: { tenantPrefix: string; orderId: string }) {
  const { token, baseUrl } = await getAccessToken(params.tenantPrefix)

  const res = await fetch(`${baseUrl}/v2/checkout/orders/${params.orderId}/capture`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`PayPal capture failed (${res.status}): ${detail}`)
  }

  return res.json() as Promise<{
    id: string
    status: string
    purchase_units: {
      reference_id: string
      payments: { captures: { id: string; status: string; amount: { value: string; currency_code: string } }[] }
    }[]
  }>
}

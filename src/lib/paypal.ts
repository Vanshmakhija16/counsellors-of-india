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

// ═══════════════════════════════════════════════════════════════════════
// MULTIPARTY ("PayPal for Platforms" / Partner Referrals) -- lets a US
// therapist connect their OWN PayPal account so session-booking payments
// land directly in their PayPal balance, with an optional platform cut.
// This is PayPal's equivalent of Stripe Connect (see stripe-client.ts /
// api/stripe/connect/*) and Razorpay's OAuth partner flow (see
// razorpay-oauth.ts / api/razorpay/oauth/*).
//
// Requires PARTNER (not just standard REST app) credentials -- the same
// PAYPAL_CLIENT_ID_<PREFIX> / PAYPAL_CLIENT_SECRET_<PREFIX> above must
// belong to a PayPal Partner account, plus:
//   PAYPAL_PARTNER_ID_<PREFIX>  -- your Partner merchant id (from PayPal)
//   PAYPAL_BN_CODE_<PREFIX>     -- Build Notation / partner attribution id
//   PAYPAL_WEBHOOK_ID_<PREFIX>  -- for verifying incoming webhook events
// ═══════════════════════════════════════════════════════════════════════

function getPartnerId(tenantPrefix: string): string {
  const id = process.env[`PAYPAL_PARTNER_ID_${tenantPrefix}`]
  if (!id) {
    throw new Error(
      `Missing PayPal Partner id for tenant "${tenantPrefix}". Set PAYPAL_PARTNER_ID_${tenantPrefix} in .env.local.`
    )
  }
  return id
}

function getBnCode(tenantPrefix: string): string | undefined {
  return process.env[`PAYPAL_BN_CODE_${tenantPrefix}`] || undefined
}

/**
 * Starts PayPal's Partner Referral ("Connect with PayPal") flow for a
 * therapist. Returns the hosted onboarding URL to redirect them to (the
 * 'action_url' link) -- same shape as Stripe's accountLinks.create /
 * Razorpay's buildAuthorizationUrl.
 *
 * `trackingId` should be a random id YOU generate and store on the
 * therapist row (therapists.paypal_tracking_id) -- PayPal echoes it back
 * on the onboarding-complete redirect and it's how you look up onboarding
 * status afterwards via getMerchantIntegrationStatus().
 */
export async function createPartnerReferral(params: {
  tenantPrefix: string
  trackingId: string
  returnUrl: string
  email?: string
}) {
  const { token, baseUrl } = await getAccessToken(params.tenantPrefix)
  const bnCode = getBnCode(params.tenantPrefix)

  const res = await fetch(`${baseUrl}/v2/customer/partner-referrals`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(bnCode ? { 'PayPal-Partner-Attribution-Id': bnCode } : {}),
    },
    body: JSON.stringify({
      tracking_id: params.trackingId,
      partner_config_override: { return_url: params.returnUrl },
      operations: [
        {
          operation: 'API_INTEGRATION',
          api_integration_preference: {
            rest_api_integration: {
              integration_method: 'PAYPAL',
              integration_type: 'THIRD_PARTY',
              third_party_details: {
                features: ['PAYMENT', 'REFUND'],
              },
            },
          },
        },
      ],
      products: ['PPCP'],
      legal_consents: [{ type: 'SHARE_DATA_CONSENT', granted: true }],
      ...(params.email ? { email: params.email } : {}),
    }),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`PayPal partner-referral failed (${res.status}): ${detail}`)
  }

  const data = await res.json() as { links: { href: string; rel: string }[] }
  const actionUrl = data.links.find(l => l.rel === 'action_url')?.href
  if (!actionUrl) throw new Error('PayPal partner-referral response had no action_url link.')
  return { actionUrl }
}

/**
 * Looks up onboarding status for a therapist by the tracking_id we sent
 * when starting createPartnerReferral(). Call this from a status-check
 * route (polled by the dashboard, or hit once on the onboarding-return
 * redirect) to find out whether the therapist actually finished PayPal's
 * side of onboarding and can receive payments yet.
 */
export async function getMerchantIntegrationStatus(params: { tenantPrefix: string; trackingId: string }) {
  const { token, baseUrl } = await getAccessToken(params.tenantPrefix)
  const partnerId = getPartnerId(params.tenantPrefix)

  const res = await fetch(
    `${baseUrl}/v1/customer/partners/${partnerId}/merchant-integrations?tracking_id=${encodeURIComponent(params.trackingId)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  )

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`PayPal merchant-integration lookup failed (${res.status}): ${detail}`)
  }

  return res.json() as Promise<{
    merchant_id: string
    tracking_id: string
    payments_receivable: boolean
    primary_email_confirmed: boolean
    oauth_integrations?: unknown
  }>
}

/**
 * Creates a MULTIPARTY order for a client paying a therapist for a
 * session -- the split-payment equivalent of createPayPalOrder() above.
 * `payee.merchant_id` routes the money to the therapist's own connected
 * PayPal account; `platform_fees` (optional) takes the platform's cut off
 * the top in the same transaction, same idea as Stripe's
 * application_fee_amount / Razorpay Route's transfers.
 */
export async function createMultipartyOrder(params: {
  tenantPrefix: string
  amount: string          // e.g. "120.00"
  currency: string        // e.g. 'USD'
  therapistMerchantId: string
  platformFeeAmount?: string // e.g. "12.00" -- omit or "0.00" for no platform cut
  description: string
  therapistId: string
  appointmentId: string
  returnUrl: string
  cancelUrl: string
}) {
  const { token, baseUrl } = await getAccessToken(params.tenantPrefix)
  const bnCode = getBnCode(params.tenantPrefix)

  const purchaseUnit: Record<string, unknown> = {
    reference_id: params.appointmentId,
    description: params.description,
    custom_id: params.appointmentId,
    amount: { currency_code: params.currency, value: params.amount },
    payee: { merchant_id: params.therapistMerchantId },
  }

  if (params.platformFeeAmount && Number(params.platformFeeAmount) > 0) {
    purchaseUnit.payment_instruction = {
      disbursement_mode: 'INSTANT',
      platform_fees: [
        { amount: { currency_code: params.currency, value: params.platformFeeAmount } },
      ],
    }
  }

  const res = await fetch(`${baseUrl}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(bnCode ? { 'PayPal-Partner-Attribution-Id': bnCode } : {}),
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [purchaseUnit],
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
    throw new Error(`PayPal multiparty create-order failed (${res.status}): ${detail}`)
  }

  return res.json() as Promise<{ id: string; status: string; links: { href: string; rel: string }[] }>
}

/**
 * Verifies an incoming PayPal webhook's signature server-side before
 * trusting its payload -- same purpose as Stripe's
 * stripe.webhooks.constructEvent / Razorpay's HMAC check. Pass the raw
 * request headers + body straight through from the webhook route.
 */
export async function verifyWebhookSignature(params: {
  tenantPrefix: string
  headers: Record<string, string>
  body: unknown
}) {
  const { token, baseUrl } = await getAccessToken(params.tenantPrefix)
  const webhookId = process.env[`PAYPAL_WEBHOOK_ID_${params.tenantPrefix}`]
  if (!webhookId) {
    throw new Error(
      `Missing PayPal webhook id for tenant "${params.tenantPrefix}". Set PAYPAL_WEBHOOK_ID_${params.tenantPrefix} in .env.local.`
    )
  }

  const res = await fetch(`${baseUrl}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      auth_algo: params.headers['paypal-auth-algo'],
      cert_url: params.headers['paypal-cert-url'],
      transmission_id: params.headers['paypal-transmission-id'],
      transmission_sig: params.headers['paypal-transmission-sig'],
      transmission_time: params.headers['paypal-transmission-time'],
      webhook_id: webhookId,
      webhook_event: params.body,
    }),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`PayPal webhook verification request failed (${res.status}): ${detail}`)
  }

  const data = await res.json() as { verification_status: 'SUCCESS' | 'FAILURE' }
  return data.verification_status === 'SUCCESS'
}

import Stripe from 'stripe'

// Stripe client — used for the SESSION-BOOKING payment flow (client pays
// therapist directly via Stripe Connect), NOT the plan-subscription flow
// (that's PayPal — see paypal-client.ts).
//
// Env var expected, per tenant prefix (e.g. US): STRIPE_SECRET_KEY_US

const clients: Record<string, Stripe> = {}

export function getStripeClient(tenantPrefix: string): Stripe {
  if (clients[tenantPrefix]) return clients[tenantPrefix]

  const secretKey = process.env[`STRIPE_SECRET_KEY_${tenantPrefix}`]
  if (!secretKey) {
    throw new Error(
      `Missing Stripe secret key for tenant "${tenantPrefix}". ` +
      `Set STRIPE_SECRET_KEY_${tenantPrefix} in .env.local.`
    )
  }

  clients[tenantPrefix] = new Stripe(secretKey)
  return clients[tenantPrefix]
}

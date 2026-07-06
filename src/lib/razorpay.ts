/**
 * Razorpay configuration
 *
 * Switching between test ↔ live:
 *   1. Set NEXT_PUBLIC_RAZORPAY_MODE=live  in .env.local
 *   2. Uncomment the LIVE key lines in .env.local
 *   3. Comment out the TEST key lines
 *   4. Restart the dev server
 */

import 'server-only'

import crypto from 'crypto'

const MODE = process.env.NEXT_PUBLIC_RAZORPAY_MODE ?? 'test'

// Both test and live share the same env var names — you just swap the values.
// The NEXT_PUBLIC_ prefix exposes key_id to the browser (needed for checkout).
// key_secret stays server-only (no NEXT_PUBLIC_ prefix).
export const RAZORPAY_KEY_ID     = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? ''
export const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET          ?? ''

export const RAZORPAY_MODE = MODE

/** Convert ₹ to paise (Razorpay's unit) */
export function toPaise(rupees: number): number {
  return Math.round(rupees * 100)
}

/**
 * Constant-time string comparison — prevents timing attacks on signature
 * checks. A plain `===`/`!==` comparison leaks how many leading characters
 * matched via response-time differences; crypto.timingSafeEqual does not.
 */
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ab.length !== bb.length) return false
  return crypto.timingSafeEqual(ab, bb)
}

/**
 * Verifies a Razorpay HMAC-SHA256 signature in constant time.
 * `payload` is the exact string that was signed (e.g. `${order_id}|${payment_id}`
 * for checkout verification, or the raw webhook body for webhooks).
 */
export function verifyRazorpaySignature(payload: string, signature: string, secret: string): boolean {
  if (!payload || !signature || !secret) return false
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex')
  return safeEqual(expected, signature)
}

export interface RazorpayOrderDetails {
  id: string
  amount: number
  currency: string
  status?: string
  notes?: Record<string, string>
}

export async function fetchPlatformRazorpayOrder(orderId: string): Promise<RazorpayOrderDetails> {
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    throw new Error('Platform Razorpay keys not configured.')
  }

  const credentials = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64')
  const response = await fetch(`https://api.razorpay.com/v1/orders/${encodeURIComponent(orderId)}`, {
    headers: { Authorization: `Basic ${credentials}` },
  })
  const order = await response.json()

  if (!response.ok) {
    throw new Error(order?.error?.description ?? 'Failed to fetch Razorpay order.')
  }

  return order as RazorpayOrderDetails
}

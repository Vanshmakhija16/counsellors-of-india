/**
 * Razorpay configuration
 *
 * Switching between test ↔ live:
 *   1. Set NEXT_PUBLIC_RAZORPAY_MODE=live  in .env.local
 *   2. Uncomment the LIVE key lines in .env.local
 *   3. Comment out the TEST key lines
 *   4. Restart the dev server
 */

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

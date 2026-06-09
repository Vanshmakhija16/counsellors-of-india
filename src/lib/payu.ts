/**
 * PayU India configuration + hashing helpers (SERVER-ONLY).
 *
 * Standard PayU hosted-checkout flow (`_payment`):
 *   1. Server generates a unique `txnid` and a SHA-512 request hash.
 *   2. Browser POSTs a form to PAYU_BASE_URL (`/_payment`) → user pays on PayU.
 *   3. PayU POSTs the result back to our `surl` / `furl` callback.
 *   4. Server recomputes the reverse hash and only trusts a match.
 *
 * The SALT is NEVER exposed to the client. This module must only be imported
 * from server code (API routes / server actions).
 *
 * Env:
 *   PAYU_KEY       — merchant key (safe to send to browser as a form field)
 *   PAYU_SALT      — merchant salt (SERVER ONLY — used for hashing)
 *   PAYU_BASE_URL  — https://test.payu.in/_payment  (test)
 *                    https://secure.payu.in/_payment (production)
 */

import crypto from 'crypto'

export const PAYU_KEY = process.env.PAYU_KEY ?? ''
export const PAYU_SALT = process.env.PAYU_SALT ?? ''
export const PAYU_BASE_URL =
  process.env.PAYU_BASE_URL ?? 'https://test.payu.in/_payment'

export function assertPayuConfigured() {
  if (!PAYU_KEY || !PAYU_SALT) {
    throw new Error(
      'PayU not configured. Set PAYU_KEY, PAYU_SALT (and PAYU_BASE_URL) in the environment.'
    )
  }
}

/** Fields PayU uses in BOTH the request and (reverse) response hash. */
export interface PayuHashInput {
  txnid: string
  amount: string // already formatted as a fixed-2-decimal string
  productinfo: string
  firstname: string
  email: string
  udf1?: string
  udf2?: string
  udf3?: string
  udf4?: string
  udf5?: string
}

const sha512 = (s: string) => crypto.createHash('sha512').update(s).digest('hex')

/**
 * Request hash (browser → PayU):
 *   sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT)
 * (six empty pipes are reserved udf6-udf10 placeholders required by PayU.)
 */
export function buildRequestHash(input: PayuHashInput): string {
  const {
    txnid, amount, productinfo, firstname, email,
    udf1 = '', udf2 = '', udf3 = '', udf4 = '', udf5 = '',
  } = input

  const seq = [
    PAYU_KEY, txnid, amount, productinfo, firstname, email,
    udf1, udf2, udf3, udf4, udf5,
    '', '', '', '', '', // udf6-udf10 (unused)
    PAYU_SALT,
  ].join('|')

  return sha512(seq)
}

/**
 * Reverse hash (PayU → us, on callback): the sequence is REVERSED and the
 * payment `status` is inserted right after the salt:
 *   sha512(SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
 */
export function buildResponseHash(input: PayuHashInput & { status: string }): string {
  const {
    status, txnid, amount, productinfo, firstname, email,
    udf1 = '', udf2 = '', udf3 = '', udf4 = '', udf5 = '',
  } = input

  const seq = [
    PAYU_SALT, status,
    '', '', '', '', '', // udf10-udf6 (unused)
    udf5, udf4, udf3, udf2, udf1,
    email, firstname, productinfo, amount, txnid,
    PAYU_KEY,
  ].join('|')

  return sha512(seq)
}

/**
 * Verify the hash PayU sends back. PayU may send `additionalCharges` — when
 * present it must be PREPENDED to the reverse sequence. We try both forms.
 */
export function verifyResponseHash(params: {
  status: string
  txnid: string
  amount: string
  productinfo: string
  firstname: string
  email: string
  udf1?: string
  udf2?: string
  udf3?: string
  udf4?: string
  udf5?: string
  hash: string
  additionalCharges?: string
}): boolean {
  const base = buildResponseHash(params)

  const expected = params.additionalCharges
    ? sha512(`${params.additionalCharges}|${[
        PAYU_SALT, params.status,
        '', '', '', '', '',
        params.udf5 ?? '', params.udf4 ?? '', params.udf3 ?? '', params.udf2 ?? '', params.udf1 ?? '',
        params.email, params.firstname, params.productinfo, params.amount, params.txnid,
        PAYU_KEY,
      ].join('|')}`)
    : base

  // Constant-time compare against the candidate(s).
  const candidates = [base, expected]
  return candidates.some(c => safeEqual(c, params.hash))
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ab.length !== bb.length) return false
  return crypto.timingSafeEqual(ab, bb)
}

/** A unique, PayU-safe transaction id (alphanumeric, ≤ ~25 chars recommended). */
export function generateTxnId(prefix = 'coi'): string {
  const rand = crypto.randomBytes(8).toString('hex')
  return `${prefix}${Date.now().toString(36)}${rand}`.slice(0, 30)
}

/** PayU wants amount as a fixed 2-decimal string, e.g. "2499.00". */
export function formatAmount(rupees: number): string {
  return Number(rupees).toFixed(2)
}

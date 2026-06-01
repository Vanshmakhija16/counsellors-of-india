import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/razorpay/verify
//
// Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
// Returns: { verified: true } or 400
// ─────────────────────────────────────────────────────────────────────────────

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET ?? ''

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json()

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment verification fields' }, { status: 400 })
    }

    if (!RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: 'Razorpay secret not configured' }, { status: 500 })
    }

    // Razorpay signature verification:  HMAC-SHA256(order_id + "|" + payment_id, key_secret)
    const generatedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Payment verification failed — invalid signature' }, { status: 400 })
    }

    return NextResponse.json({ verified: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[razorpay/verify]', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

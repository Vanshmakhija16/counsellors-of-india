import { NextRequest, NextResponse } from 'next/server'

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/razorpay/create-order
// Body : { amount: number (INR), currency?: string, receipt?: string }
// Returns: Razorpay order object { id, amount, currency, ... }
// ─────────────────────────────────────────────────────────────────────────────

const RAZORPAY_KEY_ID     = process.env.RAZORPAY_KEY_ID     ?? ''
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET ?? ''

export async function POST(req: NextRequest) {
  try {
    const { amount, currency = 'INR', receipt } = await req.json()

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { error: 'Razorpay keys not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env.local' },
        { status: 500 }
      )
    }

    // Razorpay expects amount in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(amount * 100)

    const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64')

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization:  `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount:   amountInPaise,
        currency,
        receipt:  receipt ?? `rcpt_${Date.now()}`,
      }),
    })

    const order = await response.json()

    if (!response.ok) {
      console.error('[razorpay/create-order] error:', order)
      return NextResponse.json(
        { error: order?.error?.description ?? 'Failed to create Razorpay order' },
        { status: 502 }
      )
    }

    return NextResponse.json(order)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[razorpay/create-order]', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

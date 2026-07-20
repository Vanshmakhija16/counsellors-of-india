import { NextRequest, NextResponse } from 'next/server'
import { getPlanPriceInr, normalizePlan } from '@/lib/pricing'
import { createServerSupabaseClient } from '@/lib/supabase-server'

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID ?? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? ''
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET ?? ''

export async function POST(req: NextRequest) {
  try {
    const { plan: rawPlan, currency = 'INR', receipt } = await req.json()
    const plan = normalizePlan(rawPlan)

    if (!plan || plan === 'growth') {
      return NextResponse.json({ error: 'Invalid or missing plan.' }, { status: 400 })
    }

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { error: 'Razorpay keys not configured.' },
        { status: 500 },
      )
    }

    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64')
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: Math.round(getPlanPriceInr(plan, user.email) * 100),
        currency,
        receipt: (receipt ?? `rcpt_${Date.now()}`).slice(0, 40),
        notes: { plan, therapist_id: user.id },
      }),
    })

    const order = await response.json()

    if (!response.ok) {
      console.error('[razorpay/create-order] error:', order)
      return NextResponse.json(
        { error: order?.error?.description ?? 'Failed to create Razorpay order' },
        { status: 502 },
      )
    }

    return NextResponse.json(order)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[razorpay/create-order]', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

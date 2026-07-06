import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import {
  fetchPlatformRazorpayOrder,
  RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET,
  toPaise,
  verifyRazorpaySignature,
} from '@/lib/razorpay'
import { getPlanPriceInr, highestPlan, normalizePlan } from '@/lib/pricing'

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action')

  if (action === 'order') return handleOrder(req)
  if (action === 'verify') return handleVerify(req)
  if (action === 'plan-upgrade') return handlePlanUpgrade(req)

  return NextResponse.json(
    { error: 'Unknown action. Use ?action=order|verify|plan-upgrade' },
    { status: 400 },
  )
}

async function handleOrder(req: NextRequest) {
  try {
    const { plan: rawPlan, receipt, notes = {} } = await req.json()
    const plan = normalizePlan(rawPlan)

    if (!plan || plan === 'growth') {
      return NextResponse.json({ error: 'Invalid or missing plan.' }, { status: 400 })
    }

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { error: 'Platform Razorpay keys not configured.' },
        { status: 500 },
      )
    }

    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const credentials = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64')
    const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Basic ${credentials}` },
      body: JSON.stringify({
        amount: toPaise(getPlanPriceInr(plan)),
        currency: 'INR',
        receipt: (receipt ?? `rcpt_${Date.now()}`).slice(0, 40),
        notes: { ...notes, plan, therapist_id: user.id },
      }),
    })

    if (!rzpRes.ok) {
      const errText = await rzpRes.text()
      console.error('[razorpay/order]', errText)
      return NextResponse.json({ error: 'Razorpay order creation failed', detail: errText }, { status: 502 })
    }

    const order = await rzpRes.json()
    return NextResponse.json({ order, key_id: RAZORPAY_KEY_ID })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 })
  }
}

async function handleVerify(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json()

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment fields' }, { status: 400 })
    }
    if (!RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: 'Platform Razorpay secret not configured.' }, { status: 500 })
    }

    if (!verifyRazorpaySignature(`${razorpay_order_id}|${razorpay_payment_id}`, razorpay_signature, RAZORPAY_KEY_SECRET)) {
      return NextResponse.json({ error: 'Payment signature invalid' }, { status: 400 })
    }

    return NextResponse.json({ verified: true })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 })
  }
}

async function handlePlanUpgrade(req: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      therapist_id,
      plan: rawPlan,
    } = await req.json()

    const plan = normalizePlan(rawPlan)

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing Razorpay payment fields' }, { status: 400 })
    }
    if (!RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: 'Platform Razorpay secret not configured.' }, { status: 500 })
    }
    if (!plan || plan === 'growth') {
      return NextResponse.json({ error: 'Missing or invalid plan' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (therapist_id && therapist_id !== user.id) {
      return NextResponse.json({ error: 'Payment user mismatch.' }, { status: 403 })
    }

    if (!verifyRazorpaySignature(`${razorpay_order_id}|${razorpay_payment_id}`, razorpay_signature, RAZORPAY_KEY_SECRET)) {
      console.error('[razorpay/plan-upgrade] Signature mismatch for therapist:', user.id)
      return NextResponse.json({ error: 'Payment signature invalid.' }, { status: 400 })
    }

    const order = await fetchPlatformRazorpayOrder(razorpay_order_id)
    const expectedAmount = toPaise(getPlanPriceInr(plan))
    if (
      order.amount !== expectedAmount ||
      order.currency !== 'INR' ||
      order.notes?.plan !== plan ||
      order.notes?.therapist_id !== user.id
    ) {
      console.error('[razorpay/plan-upgrade] Order mismatch:', {
        orderId: razorpay_order_id,
        userId: user.id,
        plan,
        orderAmount: order.amount,
        expectedAmount,
        notes: order.notes,
      })
      return NextResponse.json({ error: 'Payment order does not match this plan.' }, { status: 400 })
    }

    const { data: existing } = await supabase
      .from('therapists')
      .select('highest_plan')
      .eq('id', user.id)
      .single()

    const newHighest = highestPlan((existing as { highest_plan?: string } | null)?.highest_plan, plan)
    const { error } = await supabase
      .from('therapists')
      .update({
        plan,
        highest_plan: newHighest,
        razorpay_payment_id,
        plan_activated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (error) {
      console.error('[razorpay/plan-upgrade] DB error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, plan, highest_plan: newHighest })
  } catch (err: unknown) {
    console.error('[razorpay/plan-upgrade]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 },
    )
  }
}

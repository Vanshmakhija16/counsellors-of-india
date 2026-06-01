import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createServiceSupabaseClient } from '@/lib/supabase-server'
import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, toPaise } from '@/lib/razorpay'

/**
 * Unified Razorpay API route (platform-level Razorpay account)
 * Used ONLY for platform subscription payments (free → growth / pro).
 *
 * Session / appointment payments use /api/razorpay/therapist-order (per-therapist).
 *
 * POST /api/razorpay?action=order        → create a platform Razorpay order
 * POST /api/razorpay?action=verify       → verify payment signature
 * POST /api/razorpay?action=plan-upgrade → verify + write plan to DB
 */
export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action')

  if (action === 'order')        return handleOrder(req)
  if (action === 'verify')       return handleVerify(req)
  if (action === 'plan-upgrade') return handlePlanUpgrade(req)

  return NextResponse.json(
    { error: 'Unknown action. Use ?action=order|verify|plan-upgrade' },
    { status: 400 }
  )
}

// ── CREATE ORDER ──────────────────────────────────────────────────────────────
async function handleOrder(req: NextRequest) {
  try {
    const { amount, receipt, notes = {} } = await req.json()

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { error: 'Platform Razorpay keys not configured. Add RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET to .env.local' },
        { status: 500 }
      )
    }

    const credentials = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64')
    const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Basic ${credentials}` },
      body:    JSON.stringify({
        amount:   toPaise(Number(amount)),
        currency: 'INR',
        receipt:  (receipt ?? `rcpt_${Date.now()}`).slice(0, 40),
        notes,
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

// ── VERIFY PAYMENT SIGNATURE ──────────────────────────────────────────────────
async function handleVerify(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json()

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment fields' }, { status: 400 })
    }

    const body     = `${razorpay_order_id}|${razorpay_payment_id}`
    const expected = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET).update(body).digest('hex')

    if (expected !== razorpay_signature) {
      return NextResponse.json({ error: 'Payment signature invalid' }, { status: 400 })
    }

    return NextResponse.json({ verified: true })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 })
  }
}

// ── PLAN UPGRADE: verify + write plan to DB ───────────────────────────────────
async function handlePlanUpgrade(req: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      therapist_id,
      plan,
    } = await req.json()

    // ── 1. Input validation ───────────────────────────────────────────
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing Razorpay payment fields' }, { status: 400 })
    }
    if (!therapist_id || !plan) {
      return NextResponse.json({ error: 'Missing therapist_id or plan' }, { status: 400 })
    }
    if (!['growth', 'pro'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan. Must be growth or pro.' }, { status: 400 })
    }

    // ── 2. Verify HMAC-SHA256 signature ───────────────────────────────
    const body     = `${razorpay_order_id}|${razorpay_payment_id}`
    const expected = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET).update(body).digest('hex')

    if (expected !== razorpay_signature) {
      console.error('[razorpay/plan-upgrade] Signature mismatch for therapist:', therapist_id)
      return NextResponse.json({ error: 'Payment signature invalid — upgrade rejected.' }, { status: 400 })
    }

    // ── 3. Write plan + highest_plan to DB (service-role bypasses RLS) ─
    // highest_plan is a ratchet: it only ever goes up, never down.
    // This is the key field that lets us restore access without re-charging.
    const supabase = createServiceSupabaseClient()
    let updateError: unknown = null

    const { error: e1 } = await supabase
      .from('therapists')
      .update({
        plan,
        highest_plan: plan,   // ratchet — never decremented
        razorpay_payment_id,
        plan_activated_at:  new Date().toISOString(),
      })
      .eq('id', therapist_id)
    updateError = e1

    // Fallback: plan_activated_at column missing (pre-migration)
    if (e1 && (e1 as { code?: string }).code === '42703') {
      const { error: e2 } = await supabase
        .from('therapists')
        .update({ plan, highest_plan: plan, razorpay_payment_id })
        .eq('id', therapist_id)
      updateError = e2
    }

    // Fallback: razorpay_payment_id column missing
    if (updateError && (updateError as { code?: string }).code === '42703') {
      const { error: e3 } = await supabase
        .from('therapists')
        .update({ plan, highest_plan: plan })
        .eq('id', therapist_id)
      updateError = e3
    }

    // Fallback: highest_plan column missing (run migration_highest_plan.sql first)
    if (updateError && (updateError as { code?: string }).code === '42703') {
      const { error: e4 } = await supabase
        .from('therapists')
        .update({ plan })
        .eq('id', therapist_id)
      updateError = e4
    }

    if (updateError) {
      console.error('[razorpay/plan-upgrade] DB error:', updateError)
      return NextResponse.json(
        { error: (updateError as { message?: string }).message ?? 'Database update failed' },
        { status: 500 }
      )
    }

    console.log(`[razorpay/plan-upgrade] ✅ Therapist ${therapist_id} upgraded to ${plan}`)
    return NextResponse.json({ success: true, plan })
  } catch (err: unknown) {
    console.error('[razorpay/plan-upgrade]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    )
  }
}

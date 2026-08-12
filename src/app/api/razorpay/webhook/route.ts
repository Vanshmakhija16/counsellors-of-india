/**
 * API Route: POST /api/razorpay/webhook
 *
 * Server-to-server confirmation for PLATFORM plan-upgrade payments
 * (Starter/Pro subscriptions) -- fixes the bug where a paid therapist could
 * end up with no plan applied because the old flow relied ENTIRELY on the
 * browser staying open long enough to call /api/razorpay/upgrade-plan after
 * checkout succeeded. This route does the exact same DB update, but is
 * triggered directly by Razorpay the instant a payment is captured --
 * completely independent of what the browser does afterward.
 *
 * Configure in Razorpay Dashboard -> Webhooks -> Add Webhook:
 *   URL: https://counsellorsofindia.com/api/razorpay/webhook
 *   Events: payment.captured
 *   Secret: (generate one, put the SAME value in RAZORPAY_WEBHOOK_SECRET)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabase-server'
import { fetchPlatformRazorpayOrder, toPaise, verifyRazorpaySignature } from '@/lib/razorpay'
import { getPlanPriceInr, highestPlan, normalizePlan } from '@/lib/pricing'

const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET ?? ''

export async function POST(req: NextRequest) {
  // Signature must be verified against the RAW body text -- parsing to
  // JSON first and re-stringifying would produce a different byte
  // sequence than what Razorpay actually signed, breaking verification.
  const rawBody = await req.text()
  const signature = req.headers.get('x-razorpay-signature') ?? ''

  if (!WEBHOOK_SECRET) {
    console.error('[razorpay/webhook] RAZORPAY_WEBHOOK_SECRET not configured.')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  if (!verifyRazorpaySignature(rawBody, signature, WEBHOOK_SECRET)) {
    console.error('[razorpay/webhook] Invalid signature -- rejecting.')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  let event: { event?: string; payload?: { payment?: { entity?: Record<string, unknown> } } }
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Acknowledge everything else -- we only act on payment.captured.
  if (event.event !== 'payment.captured') {
    return NextResponse.json({ received: true })
  }

  try {
    const paymentEntity = event.payload?.payment?.entity as
      | { order_id?: string; id?: string; amount?: number }
      | undefined
    const razorpayOrderId = paymentEntity?.order_id
    const razorpayPaymentId = paymentEntity?.id

    if (!razorpayOrderId || !razorpayPaymentId) {
      console.warn('[razorpay/webhook] payment.captured missing order_id/payment_id.')
      return NextResponse.json({ received: true })
    }

    // Fetch the order fresh from Razorpay (rather than trusting the webhook
    // payload's own notes) to get the plan + therapist_id it was created
    // for -- same source of truth /api/razorpay/upgrade-plan already uses.
    const order = await fetchPlatformRazorpayOrder(razorpayOrderId)
    const targetPlan = normalizePlan(order.notes?.plan)
    const therapistId = order.notes?.therapist_id

    if (!targetPlan || targetPlan === 'growth' || !therapistId) {
      console.warn('[razorpay/webhook] Order missing plan/therapist_id notes -- not a plan-upgrade order, skipping.', { razorpayOrderId })
      return NextResponse.json({ received: true })
    }

    const db = createServiceSupabaseClient()

    const { data: therapist, error: fetchErr } = await db
      .from('therapists')
      .select('email, highest_plan, razorpay_payment_id')
      .eq('id', therapistId)
      .maybeSingle()

    if (fetchErr || !therapist) {
      console.error('[razorpay/webhook] Therapist not found for order notes:', { therapistId, razorpayOrderId })
      return NextResponse.json({ received: true })
    }

    // Idempotency: if this exact payment was already applied (e.g. the
    // browser's own upgrade-plan call succeeded first, and the webhook
    // arrived after as the normal redundant confirmation), don't redo it.
    if (therapist.razorpay_payment_id === razorpayPaymentId) {
      return NextResponse.json({ received: true, already_applied: true })
    }

    const expectedAmount = toPaise(getPlanPriceInr(targetPlan, therapist.email ?? undefined))
    if (order.amount !== expectedAmount || order.currency !== 'INR') {
      console.error('[razorpay/webhook] Amount/currency mismatch -- refusing to apply plan.', {
        razorpayOrderId, expected: expectedAmount, got: order.amount,
      })
      return NextResponse.json({ received: true })
    }

    const newHighest = highestPlan(therapist.highest_plan, targetPlan)

    const { error: updateErr } = await db
      .from('therapists')
      .update({
        plan: targetPlan,
        highest_plan: newHighest,
        razorpay_payment_id: razorpayPaymentId,
        plan_activated_at: new Date().toISOString(),
        subscription_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        subscription_status: 'active',
        subscription_plan: targetPlan,
        ...(targetPlan === 'pro'
          ? { pro_switches_used: 0, pro_switch_cycle_start: new Date().toISOString() }
          : {}),
      })
      .eq('id', therapistId)

    if (updateErr) {
      console.error('[razorpay/webhook] Failed to apply plan:', updateErr)
      return NextResponse.json({ error: 'DB update failed' }, { status: 500 })
    }

    console.log('[razorpay/webhook] Plan applied via webhook:', { therapistId, targetPlan, razorpayOrderId })
    return NextResponse.json({ received: true, applied: true })
  } catch (err: unknown) {
    console.error('[razorpay/webhook] Unhandled error:', err)
    // Still 200 so Razorpay doesn't hammer retries for a bug on our side
    // that a retry won't fix -- errors are logged for manual follow-up.
    return NextResponse.json({ received: true })
  }
}

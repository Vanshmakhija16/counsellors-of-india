import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { capturePayPalOrder } from '@/lib/paypal'
import { getPlanPriceUsd, highestPlan, normalizePlan } from '@/lib/pricing'
import { getCurrentTenant } from '@/lib/tenants/server'

// Captures (finalizes) a PayPal order after the buyer approves it, verifies
// the amount/plan/therapist match what was actually created in
// /api/paypal/create-order, then upgrades the therapist's plan — mirroring
// razorpay/upgrade-plan/route.ts's verification pattern.

export async function POST(req: NextRequest) {
  try {
    const { paypal_order_id, plan: rawPlan } = await req.json() as {
      paypal_order_id?: string
      plan?: string
    }

    const targetPlan = normalizePlan(rawPlan)
    if (!targetPlan || targetPlan === 'growth') {
      return NextResponse.json({ error: 'Invalid or missing plan.' }, { status: 400 })
    }

    if (!paypal_order_id) {
      return NextResponse.json({ error: 'Missing PayPal order id.' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tenant = await getCurrentTenant()
    const captured = await capturePayPalOrder({
      tenantPrefix: tenant.supabaseEnvPrefix,
      orderId: paypal_order_id,
    })

    if (captured.status !== 'COMPLETED') {
      console.error('[paypal/capture-order] Not completed:', captured)
      return NextResponse.json({ error: 'PayPal payment was not completed.' }, { status: 400 })
    }

    const purchaseUnit = captured.purchase_units?.[0]
    const capture = purchaseUnit?.payments?.captures?.[0]

    // Verify the captured order actually belongs to THIS user and matches
    // the expected plan price — same defense-in-depth as the Razorpay flow,
    // preventing a stale/mismatched order id being replayed against a
    // different plan or a different therapist's account.
    const expectedAmount = getPlanPriceUsd(targetPlan, user.email).toFixed(2)
    if (
      purchaseUnit?.reference_id !== user.id ||
      !capture ||
      capture.amount?.value !== expectedAmount ||
      capture.amount?.currency_code !== tenant.currency
    ) {
      console.error('[paypal/capture-order] Order mismatch:', {
        orderId: paypal_order_id,
        userId: user.id,
        targetPlan,
        expectedAmount,
        captured,
      })
      return NextResponse.json({ error: 'Payment order does not match this plan.' }, { status: 400 })
    }

    const { data: existing } = await supabase
      .from('therapists')
      .select('highest_plan')
      .eq('id', user.id)
      .single()

    const newHighest = highestPlan((existing as { highest_plan?: string } | null)?.highest_plan, targetPlan)

    const { error } = await supabase
      .from('therapists')
      .update({
        plan: targetPlan,
        highest_plan: newHighest,
        last_plan_payment_gateway: 'paypal',
        last_plan_payment_ref: capture.id,
        plan_activated_at: new Date().toISOString(),
        ...(targetPlan === 'pro'
          ? { pro_switches_used: 0, pro_switch_cycle_start: new Date().toISOString() }
          : {}),
      })
      .eq('id', user.id)

    if (error) throw error

    return NextResponse.json({ success: true, plan: targetPlan, highest_plan: newHighest })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[paypal/capture-order]', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

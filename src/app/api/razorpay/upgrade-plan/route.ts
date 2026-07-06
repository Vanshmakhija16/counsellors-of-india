import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { fetchPlatformRazorpayOrder, RAZORPAY_KEY_SECRET, toPaise, verifyRazorpaySignature } from '@/lib/razorpay'
import { getPlanPriceInr, highestPlan, normalizePlan } from '@/lib/pricing'

export async function POST(req: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan: rawPlan,
    } = await req.json() as {
      razorpay_order_id?: string
      razorpay_payment_id?: string
      razorpay_signature?: string
      plan?: string
    }

    const targetPlan = normalizePlan(rawPlan)
    if (!targetPlan || targetPlan === 'growth') {
      return NextResponse.json({ error: 'Invalid or missing plan.' }, { status: 400 })
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing Razorpay payment fields.' }, { status: 400 })
    }

    if (!RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: 'Razorpay secret not configured.' }, { status: 500 })
    }

    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const verified = verifyRazorpaySignature(
      `${razorpay_order_id}|${razorpay_payment_id}`,
      razorpay_signature,
      RAZORPAY_KEY_SECRET,
    )

    if (!verified) {
      console.error('[razorpay/upgrade-plan] Signature mismatch for user:', user.id)
      return NextResponse.json({ error: 'Payment signature invalid.' }, { status: 400 })
    }

    const order = await fetchPlatformRazorpayOrder(razorpay_order_id)
    const expectedAmount = toPaise(getPlanPriceInr(targetPlan))
    if (
      order.amount !== expectedAmount ||
      order.currency !== 'INR' ||
      order.notes?.plan !== targetPlan ||
      order.notes?.therapist_id !== user.id
    ) {
      console.error('[razorpay/upgrade-plan] Order mismatch:', {
        orderId: razorpay_order_id,
        userId: user.id,
        targetPlan,
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

    const newHighest = highestPlan((existing as { highest_plan?: string } | null)?.highest_plan, targetPlan)

    const { error } = await supabase
      .from('therapists')
      .update({
        plan: targetPlan,
        highest_plan: newHighest,
        razorpay_payment_id,
        plan_activated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (error) throw error

    return NextResponse.json({ success: true, plan: targetPlan, highest_plan: newHighest })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[razorpay/upgrade-plan]', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

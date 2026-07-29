import { NextRequest, NextResponse } from 'next/server'
import { getPlanPriceUsd, normalizePlan } from '@/lib/pricing'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createPayPalOrder } from '@/lib/paypal'
import { getCurrentTenant } from '@/lib/tenants/server'

// Creates a PayPal order for a therapist's PLAN SUBSCRIPTION payment
// (Starter/Pro) — money goes to the PLATFORM's own PayPal account, not to
// any therapist. This mirrors razorpay/create-order/route.ts, but for
// tenants using PayPal instead of Razorpay/PayU (currently: US).
//
// Session-booking payments (client -> therapist) are a SEPARATE flow — see
// /api/stripe/booking/create-payment-intent, which uses Stripe Connect so
// that money reaches the therapist directly instead.

export async function POST(req: NextRequest) {
  try {
    const { plan: rawPlan, redirectAfter } = await req.json()
    const plan = normalizePlan(rawPlan)

    if (!plan || plan === 'growth') {
      return NextResponse.json({ error: 'Invalid or missing plan.' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tenant = await getCurrentTenant()
    const tenantPrefix = tenant.supabaseEnvPrefix // e.g. 'US' — reused as the PayPal env-var prefix too

    const amountUsd = getPlanPriceUsd(plan, user.email)
    const planLabel = plan === 'pro' ? 'Pro Plan' : 'Starter Plan'

    const origin = req.nextUrl.origin
    const safeRedirect = typeof redirectAfter === 'string' && redirectAfter.startsWith('/') ? redirectAfter : '/dashboard'

    const order = await createPayPalOrder({
      tenantPrefix,
      amount: amountUsd.toFixed(2),
      currency: tenant.currency, // 'USD' for the us tenant
      planLabel,
      therapistId: user.id,
      returnUrl: `${origin}/payment/paypal-return?plan=${plan}&redirect=${encodeURIComponent(safeRedirect)}`,
      cancelUrl: `${origin}/pricing`,
    })

    return NextResponse.json(order)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[paypal/create-order]', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

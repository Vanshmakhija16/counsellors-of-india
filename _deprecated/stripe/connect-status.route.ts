import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getStripeClient } from '@/lib/stripe-client'
import { getCurrentTenant } from '@/lib/tenants/server'

// Call this after the therapist returns from Stripe's hosted onboarding
// flow (accountLink.return_url). Re-checks the connected account's actual
// status with Stripe directly (never trust the redirect alone — a
// therapist could land on the return_url without finishing every step),
// and persists stripe_onboarded / stripe_charges_enabled accordingly.

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tenant = await getCurrentTenant()
    const stripe = getStripeClient(tenant.supabaseEnvPrefix)

    const { data: therapist, error: fetchError } = await supabase
      .from('therapists')
      .select('stripe_account_id')
      .eq('id', user.id)
      .single()

    const accountId = (therapist as { stripe_account_id?: string | null } | null)?.stripe_account_id
    if (fetchError || !accountId) {
      return NextResponse.json({ onboarded: false, chargesEnabled: false })
    }

    const account = await stripe.accounts.retrieve(accountId)
    const onboarded = !!account.details_submitted
    const chargesEnabled = !!account.charges_enabled

    await supabase
      .from('therapists')
      .update({ stripe_onboarded: onboarded, stripe_charges_enabled: chargesEnabled })
      .eq('id', user.id)

    return NextResponse.json({ onboarded, chargesEnabled })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[stripe/connect/status]', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

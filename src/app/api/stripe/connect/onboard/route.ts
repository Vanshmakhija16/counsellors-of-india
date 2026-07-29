import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getStripeClient } from '@/lib/stripe-client'
import { getCurrentTenant } from '@/lib/tenants/server'

// Starts (or resumes) Stripe Connect onboarding for the logged-in
// therapist. Creates a Stripe "Express" connected account the FIRST time
// this is called for a given therapist (stored on therapists.stripe_account_id),
// then returns a fresh, one-time-use Account Link URL for them to complete
// identity/bank details on Stripe's own hosted flow.
//
// This is what makes "therapist collects their own booking fee directly"
// possible: once onboarded, session-booking PaymentIntents are created with
// transfer_data.destination = this account id, so the money lands directly
// in the therapist's own Stripe balance instead of the platform's.

export async function POST(req: NextRequest) {
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
      .select('stripe_account_id, email, full_name, country')
      .eq('id', user.id)
      .single()

    if (fetchError || !therapist) {
      return NextResponse.json({ error: 'Therapist profile not found.' }, { status: 404 })
    }

    let accountId = (therapist as { stripe_account_id?: string | null }).stripe_account_id

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        email: user.email ?? undefined,
        // Country is fixed per-tenant right now (single-country tenants);
        // revisit if a tenant ever spans multiple countries.
        country: 'US',
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      })

      accountId = account.id

      const { error: saveError } = await supabase
        .from('therapists')
        .update({ stripe_account_id: accountId })
        .eq('id', user.id)

      if (saveError) throw saveError
    }

    const { returnUrl, refreshUrl } = await req.json().catch(() => ({} as Record<string, string>))
    const origin = req.nextUrl.origin

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      type: 'account_onboarding',
      return_url: returnUrl || `${origin}/dashboard/payments?stripe_onboarding=complete`,
      refresh_url: refreshUrl || `${origin}/dashboard/payments?stripe_onboarding=refresh`,
    })

    return NextResponse.json({ url: accountLink.url })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[stripe/connect/onboard]', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

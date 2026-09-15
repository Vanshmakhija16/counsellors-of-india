import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabaseClientForTenant } from '@/lib/supabase-server'
import { getStripeClient } from '@/lib/stripe-client'
import { getCurrentTenant } from '@/lib/tenants/server'

// Creates a Stripe PaymentIntent for a CLIENT paying a THERAPIST for a
// session. `transfer_data.destination` routes the money directly into the
// therapist's own connected Stripe account, not the platform's. An optional
// small `application_fee_amount` can be taken by the platform on top —
// currently 0; change PLATFORM_FEE_BPS below if/when you want a cut.
//
// Payment state is tracked DIRECTLY on the `appointments` row (matching the
// existing PayU pattern: txnid/payu_id/status), not a separate `payments`
// table — there isn't one in this schema.

const PLATFORM_FEE_BPS = 0 // basis points, e.g. 1000 = 10%. 0 = therapist keeps 100%.

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { therapist_id, appointment_id } = body as {
      therapist_id?: string
      appointment_id?: string
    }

    if (!therapist_id || !appointment_id) {
      return NextResponse.json({ error: 'therapist_id and appointment_id are required' }, { status: 400 })
    }

    const tenant = await getCurrentTenant()
    const db = await createServiceSupabaseClientForTenant()

    const { data: appointment, error: appointmentErr } = await db
      .from('appointments')
      .select('id, therapist_id, service_price, status')
      .eq('id', appointment_id)
      .maybeSingle()

    if (appointmentErr) throw appointmentErr
    if (!appointment || appointment.therapist_id !== therapist_id) {
      return NextResponse.json({ error: 'Appointment not found for therapist.' }, { status: 404 })
    }
    if (['cancelled', 'expired', 'payment_failed', 'upcoming', 'confirmed', 'completed'].includes(String(appointment.status))) {
      return NextResponse.json({ error: 'Appointment is not payable.' }, { status: 409 })
    }

    const amount = Number(appointment.service_price)
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Appointment does not have a payable server-side price.' }, { status: 400 })
    }

    const { data: therapist, error: fetchErr } = await db
      .from('therapists')
      .select('stripe_account_id, stripe_onboarded, stripe_charges_enabled, full_name')
      .eq('id', therapist_id)
      .single()

    if (fetchErr || !therapist) {
      return NextResponse.json({ error: 'Therapist not found' }, { status: 404 })
    }
    if (!therapist.stripe_account_id || !therapist.stripe_onboarded || !therapist.stripe_charges_enabled) {
      return NextResponse.json(
        { error: 'Therapist has not finished connecting Stripe yet.' },
        { status: 422 },
      )
    }

    const stripe = getStripeClient(tenant.supabaseEnvPrefix)
    const amountCents = Math.round(amount * 100)
    const applicationFeeAmount = Math.round((amountCents * PLATFORM_FEE_BPS) / 10000)

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: tenant.currency.toLowerCase(), // e.g. 'usd'
      automatic_payment_methods: { enabled: true },
      transfer_data: { destination: therapist.stripe_account_id },
      ...(applicationFeeAmount > 0 ? { application_fee_amount: applicationFeeAmount } : {}),
      metadata: {
        therapist_id,
        appointment_id,
        therapist_name: therapist.full_name ?? '',
        platform: 'counsellors-of-america',
      },
    })

    const { error: updateErr } = await db
      .from('appointments')
      .update({
        stripe_payment_intent_id: paymentIntent.id,
        stripe_account_id: therapist.stripe_account_id,
        status: 'pending_payment',
      })
      .eq('id', appointment_id)

    if (updateErr) {
      console.error('[stripe/booking/create-payment-intent] Failed to save payment intent on appointment:', updateErr)
      return NextResponse.json({ error: 'Failed to record payment.' }, { status: 500 })
    }

    return NextResponse.json({
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
      amount: amountCents,
      currency: tenant.currency,
    })
  } catch (err: unknown) {
    console.error('[stripe/booking/create-payment-intent]', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 })
  }
}

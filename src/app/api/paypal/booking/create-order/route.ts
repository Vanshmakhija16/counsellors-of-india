import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabaseClientForTenant } from '@/lib/supabase-server'
import { createMultipartyOrder } from '@/lib/paypal'
import { getCurrentTenant } from '@/lib/tenants/server'

/**
 * Creates a PayPal MULTIPARTY order for a client paying a therapist for a
 * session — the PayPal equivalent of
 * stripe/booking/create-payment-intent/route.ts. `payee.merchant_id`
 * (set inside createMultipartyOrder) routes the money directly into the
 * therapist's own connected PayPal account, not the platform's.
 *
 * Payment state is tracked DIRECTLY on the `appointments` row
 * (paypal_order_id + status), matching the existing PayU/Stripe pattern —
 * there is no separate `payments` table in this schema.
 */

const PLATFORM_FEE_BPS = 0 // basis points, e.g. 1000 = 10%. 0 = therapist keeps 100%.

export async function POST(req: NextRequest) {
  try {
    const { therapist_id, appointment_id } = await req.json() as {
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
      .select('paypal_merchant_id, paypal_onboarding_status, paypal_payments_receivable, full_name')
      .eq('id', therapist_id)
      .single()

    if (fetchErr || !therapist) {
      return NextResponse.json({ error: 'Therapist not found' }, { status: 404 })
    }
    if (!therapist.paypal_merchant_id || therapist.paypal_onboarding_status !== 'completed' || !therapist.paypal_payments_receivable) {
      return NextResponse.json(
        { error: 'Therapist has not finished connecting PayPal yet.' },
        { status: 422 },
      )
    }

    const platformFeeAmount = ((amount * PLATFORM_FEE_BPS) / 10000).toFixed(2)
    const origin = tenant.siteUrl

    const order = await createMultipartyOrder({
      tenantPrefix: tenant.supabaseEnvPrefix,
      amount: amount.toFixed(2),
      currency: tenant.currency,
      therapistMerchantId: therapist.paypal_merchant_id,
      platformFeeAmount: PLATFORM_FEE_BPS > 0 ? platformFeeAmount : undefined,
      description: therapist.full_name ? `Therapy session with ${therapist.full_name}` : 'Therapy Session',
      therapistId: therapist_id,
      appointmentId: appointment_id,
      returnUrl: `${origin}/booking/paypal-return?appointment_id=${appointment_id}`,
      cancelUrl: `${origin}/booking/paypal-cancel?appointment_id=${appointment_id}`,
    })

    const { error: updateErr } = await db
      .from('appointments')
      .update({
        paypal_order_id: order.id,
        status: 'pending_payment',
      })
      .eq('id', appointment_id)

    if (updateErr) {
      console.error('[paypal/booking/create-order] Failed to save order on appointment:', updateErr)
      return NextResponse.json({ error: 'Failed to record payment.' }, { status: 500 })
    }

    const approveUrl = order.links.find(l => l.rel === 'approve')?.href
    if (!approveUrl) {
      return NextResponse.json({ error: 'PayPal did not return an approval link.' }, { status: 500 })
    }

    return NextResponse.json({ order_id: order.id, approve_url: approveUrl })
  } catch (err: unknown) {
    console.error('[paypal/booking/create-order]', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 })
  }
}

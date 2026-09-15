import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabaseClientForTenant } from '@/lib/supabase-server'
import { capturePayPalOrder } from '@/lib/paypal'
import { getCurrentTenant } from '@/lib/tenants/server'
import { notifyBookingConfirmed } from '@/lib/booking-notifications'

/**
 * Captures a previously-created PayPal MULTIPARTY order (see
 * paypal/booking/create-order/route.ts) after the client approves it on
 * PayPal's hosted page and the browser returns to
 * /booking/paypal-return?token=<order_id>&appointment_id=<id>.
 *
 * PayPal's capture endpoint is the same Orders v2 `/capture` call for both
 * a plain order and a multiparty one — capturePayPalOrder() from
 * paypal.ts (already used by the plan-subscription flow) is reused as-is.
 * What differs here is verification and what happens after: we check the
 * captured order against THIS appointment (not a plan/therapist), then
 * confirm the booking and notify both parties — mirroring
 * payu/booking-callback/route.ts's confirmation logic, adapted for
 * PayPal's redirect-then-capture shape instead of PayU's server-to-server
 * form POST.
 *
 * Payment state lives directly on the `appointments` row
 * (paypal_order_id / paypal_capture_id + status), matching the existing
 * PayU/Razorpay/PayPal-plan pattern — there is no separate `payments`
 * table in this schema.
 */

export async function POST(req: NextRequest) {
  try {
    const { paypal_order_id, appointment_id } = await req.json() as {
      paypal_order_id?: string
      appointment_id?: string
    }

    if (!paypal_order_id || !appointment_id) {
      return NextResponse.json({ error: 'paypal_order_id and appointment_id are required.' }, { status: 400 })
    }

    const tenant = await getCurrentTenant()
    const db = await createServiceSupabaseClientForTenant()

    const { data: appt, error: apptErr } = await db
      .from('appointments')
      .select('id, status, paypal_order_id, therapist_id, client_name, client_email, client_phone, scheduled_at, duration_mins, service_name, service_price')
      .eq('id', appointment_id)
      .maybeSingle()

    if (apptErr) throw apptErr
    if (!appt) {
      return NextResponse.json({ error: 'Appointment not found.' }, { status: 404 })
    }

    // Idempotency — a refreshed/duplicate return-page load should just
    // report success again instead of re-hitting PayPal's capture endpoint
    // (which would error on an already-captured order anyway).
    if (appt.status === 'upcoming') {
      return NextResponse.json({ success: true, appointment_id, already_confirmed: true })
    }

    if (appt.paypal_order_id !== paypal_order_id) {
      console.error('[paypal/booking/capture-order] order id mismatch', {
        appointment_id, expected: appt.paypal_order_id, got: paypal_order_id,
      })
      return NextResponse.json({ error: 'This order does not match the appointment.' }, { status: 400 })
    }

    const captured = await capturePayPalOrder({
      tenantPrefix: tenant.supabaseEnvPrefix,
      orderId: paypal_order_id,
    })

    if (captured.status !== 'COMPLETED') {
      console.error('[paypal/booking/capture-order] Not completed:', captured)
      return NextResponse.json({ error: 'PayPal payment was not completed.' }, { status: 400 })
    }

    const purchaseUnit = captured.purchase_units?.[0]
    const capture = purchaseUnit?.payments?.captures?.[0]

    // Verify the captured order actually belongs to THIS appointment and
    // matches the expected amount/currency — same defense-in-depth as
    // every other gateway's callback in this codebase, preventing a
    // stale/mismatched order id being replayed against a different
    // appointment.
    const expectedAmount = Number(appt.service_price).toFixed(2)
    if (
      purchaseUnit?.reference_id !== appointment_id ||
      !capture ||
      capture.amount?.value !== expectedAmount ||
      capture.amount?.currency_code !== tenant.currency
    ) {
      console.error('[paypal/booking/capture-order] Amount/reference mismatch:', {
        appointment_id, expectedAmount, captured,
      })
      return NextResponse.json({ error: 'Payment does not match this appointment.' }, { status: 400 })
    }

    const { error: updErr } = await db
      .from('appointments')
      .update({
        status: 'upcoming',
        payment_status: 'paid',
        paypal_capture_id: capture.id,
      })
      .eq('id', appointment_id)

    if (updErr) {
      console.error('[paypal/booking/capture-order] Failed to confirm appointment:', updErr)
      return NextResponse.json({ error: 'Failed to record payment.' }, { status: 500 })
    }

    // Fire-and-forget confirmation notifications — same single entrypoint
    // every other paid-booking path in this codebase uses. A notification
    // failure must never fail the payment response itself.
    const { data: therapist } = await db
      .from('therapists')
      .select('full_name, email, phone, whatsapp, meet_link, plan')
      .eq('id', appt.therapist_id)
      .single()

    if (therapist) {
      notifyBookingConfirmed({
        plan: therapist.plan,
        clientName: appt.client_name,
        clientEmail: appt.client_email,
        clientPhone: appt.client_phone,
        therapistName: therapist.full_name ?? 'Your Therapist',
        therapistEmail: therapist.email ?? null,
        therapistPhone: therapist.whatsapp || therapist.phone || null,
        meetLink: therapist.meet_link ?? null,
        serviceName: appt.service_name ?? null,
        scheduledAt: appt.scheduled_at,
        durationMins: appt.duration_mins ?? null,
        amountPaid: appt.service_price ?? null,
      }).catch(e => console.error('[paypal/booking/capture-order] notification failed:', e))
    }

    return NextResponse.json({ success: true, appointment_id })
  } catch (err: unknown) {
    console.error('[paypal/booking/capture-order]', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 })
  }
}

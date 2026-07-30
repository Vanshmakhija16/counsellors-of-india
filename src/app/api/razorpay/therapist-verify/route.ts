import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabase-server'
import { decrypt } from '@/lib/encryption'
import { verifyRazorpaySignature } from '@/lib/razorpay'
import { notifyBookingConfirmed } from '@/lib/booking-notifications'

export async function POST(req: NextRequest) {
  try {
    const {
      therapist_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = await req.json() as {
      therapist_id?: string
      razorpay_order_id?: string
      razorpay_payment_id?: string
      razorpay_signature?: string
      appointment_id?: string
    }

    if (!therapist_id || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing required fields: therapist_id, razorpay_order_id, razorpay_payment_id, razorpay_signature' },
        { status: 400 },
      )
    }

    const db = createServiceSupabaseClient()

    const { data: payment, error: paymentErr } = await db
      .from('payments')
      .select('id, appointment_id, therapist_id, amount_paise, status')
      .eq('razorpay_order_id', razorpay_order_id)
      .maybeSingle()

    if (paymentErr) throw paymentErr
    if (!payment || payment.therapist_id !== therapist_id) {
      return NextResponse.json({ error: 'Payment order not found for therapist.' }, { status: 404 })
    }

    const { data: therapist, error: fetchErr } = await db
      .from('therapists')
      .select('razorpay_key_secret_encrypted, payments_enabled, razorpay_oauth_merchant_id, full_name, email, meet_link, phone, whatsapp, plan')
      .eq('id', therapist_id)
      .single()

    if (fetchErr || !therapist) {
      return NextResponse.json({ error: 'Therapist not found' }, { status: 404 })
    }
    if (!therapist.payments_enabled) {
      return NextResponse.json({ error: 'Therapist payment credentials not configured' }, { status: 422 })
    }

    const { data: appointment, error: appointmentErr } = await db
      .from('appointments')
      .select('id, therapist_id, service_price, status, payment_status, client_name, client_email, client_phone, scheduled_at, duration_mins, service_name')
      .eq('id', payment.appointment_id)
      .maybeSingle()

    if (appointmentErr) throw appointmentErr
    if (!appointment || appointment.therapist_id !== therapist_id) {
      return NextResponse.json({ error: 'Payment is not bound to a valid appointment.' }, { status: 404 })
    }
    if (appointment.payment_status === 'paid' && payment.status !== 'paid') {
      return NextResponse.json({ error: 'Appointment is already paid.' }, { status: 409 })
    }
    if (['cancelled', 'expired', 'payment_failed'].includes(String(appointment.status))) {
      return NextResponse.json({ error: 'Appointment is not payable.' }, { status: 409 })
    }

    const expectedAmountPaise = Math.round(Number(appointment.service_price) * 100)
    if (!Number.isFinite(expectedAmountPaise) || expectedAmountPaise <= 0) {
      return NextResponse.json({ error: 'Appointment does not have a payable server-side price.' }, { status: 400 })
    }
    if (expectedAmountPaise !== Number(payment.amount_paise)) {
      console.error('[therapist-verify] Amount mismatch:', {
        order: razorpay_order_id,
        expectedAmountPaise,
        paymentAmountPaise: payment.amount_paise,
      })
      return NextResponse.json({ error: 'Payment amount does not match appointment price.' }, { status: 400 })
    }

    // OAuth-connected therapists: we never receive their key_secret (only
    // an access token), so the HMAC signature check below is IMPOSSIBLE for
    // them -- there's no secret on our side to compute it with. Razorpay's
    // documented pattern for this case is to trust the application-level
    // webhook instead (signed with OUR OWN RAZORPAY_OAUTH_WEBHOOK_SECRET,
    // which we do control) -- see /api/razorpay/oauth/webhook's handling of
    // `payment.captured`. So here we just record what the client reported
    // and tell it to wait for webhook confirmation, rather than either (a)
    // guessing at a verification scheme we can't actually trust, or (b)
    // marking it paid on the client's word alone.
    if (therapist.razorpay_oauth_merchant_id) {
      // The webhook may have already confirmed this payment before the
      // client's callback even reached us (webhooks and the browser
      // redirect race independently) -- check first instead of always
      // reporting pending.
      if (payment.status === 'paid') {
        return NextResponse.json({
          verified: true,
          appointment_id: payment.appointment_id,
          payment_id: payment.id,
        })
      }

      const { error: recordErr } = await db
        .from('payments')
        .update({ razorpay_payment_id, razorpay_signature })
        .eq('id', payment.id)
        .eq('status', 'created') // don't clobber if webhook already marked it paid

      if (recordErr) {
        console.error('[therapist-verify] Failed to record OAuth payment_id:', recordErr)
      }

      return NextResponse.json({
        verified: false,
        pending: true,
        message: 'Payment received -- confirming with Razorpay. This usually takes a few seconds.',
        appointment_id: payment.appointment_id,
        payment_id: payment.id,
      })
    }

    if (!therapist.razorpay_key_secret_encrypted) {
      return NextResponse.json({ error: 'Therapist payment credentials not configured' }, { status: 422 })
    }

    let keySecret: string
    try {
      keySecret = decrypt(therapist.razorpay_key_secret_encrypted)
    } catch {
      return NextResponse.json({ error: 'Credential decryption failed' }, { status: 500 })
    }

    const verified = verifyRazorpaySignature(
      `${razorpay_order_id}|${razorpay_payment_id}`,
      razorpay_signature,
      keySecret,
    )

    if (!verified) {
      console.error('[therapist-verify] Signature mismatch for therapist:', therapist_id)
      return NextResponse.json(
        { error: 'Payment verification failed. Invalid signature.' },
        { status: 400 },
      )
    }

    if (payment.status === 'paid') {
      return NextResponse.json({
        verified: true,
        appointment_id: payment.appointment_id,
        payment_id: payment.id,
      })
    }

    const { data: paymentRow, error: updatePaymentErr } = await db
      .from('payments')
      .update({ razorpay_payment_id, razorpay_signature, status: 'paid' })
      .eq('id', payment.id)
      .select('id, appointment_id')
      .single()

    if (updatePaymentErr) throw updatePaymentErr

    const { error: apptErr } = await db
      .from('appointments')
      .update({
        status: 'upcoming',
        payment_status: 'paid',
        payment_id: paymentRow.id,
      })
      .eq('id', paymentRow.appointment_id)
      .eq('therapist_id', therapist_id)

    if (apptErr) {
      console.error('[therapist-verify] Appointment update failed:', apptErr)
      return NextResponse.json({ error: 'Payment verified but appointment update failed.' }, { status: 500 })
    }

    // Fire-and-forget -- a notification failure must never affect the
    // payment-verified response the client is waiting on. Channel (email
    // vs WhatsApp) is decided inside by the therapist's plan.
    notifyBookingConfirmed({
      plan:           therapist.plan,
      clientName:     appointment.client_name,
      clientEmail:    appointment.client_email,
      clientPhone:    appointment.client_phone,
      therapistName:  therapist.full_name ?? 'Your Therapist',
      therapistEmail: therapist.email ?? null,
      therapistPhone: therapist.whatsapp || therapist.phone || null,
      meetLink:       therapist.meet_link ?? null,
      serviceName:    appointment.service_name ?? null,
      scheduledAt:    appointment.scheduled_at,
      durationMins:   appointment.duration_mins ?? null,
      amountPaid:     appointment.service_price ?? null,
    }).catch(e => console.error('[therapist-verify] notifyBookingConfirmed failed:', e))

    return NextResponse.json({
      verified: true,
      appointment_id: paymentRow.appointment_id,
      payment_id: paymentRow.id,
    })
  } catch (err: unknown) {
    console.error('[therapist-verify]', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 })
  }
}

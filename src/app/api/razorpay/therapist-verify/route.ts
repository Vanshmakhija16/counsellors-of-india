import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabase-server'
import { decrypt } from '@/lib/encryption'
import { verifyRazorpaySignature } from '@/lib/razorpay'

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
      .select('razorpay_key_secret_encrypted, payments_enabled')
      .eq('id', therapist_id)
      .single()

    if (fetchErr || !therapist) {
      return NextResponse.json({ error: 'Therapist not found' }, { status: 404 })
    }
    if (!therapist.payments_enabled || !therapist.razorpay_key_secret_encrypted) {
      return NextResponse.json({ error: 'Therapist payment credentials not configured' }, { status: 422 })
    }

    const { data: appointment, error: appointmentErr } = await db
      .from('appointments')
      .select('id, therapist_id, service_price, status, payment_status')
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

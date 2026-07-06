import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabase-server'
import { decrypt } from '@/lib/encryption'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      therapist_id,
      currency = 'INR',
      booking_id,
      appointment_id,
    } = body as {
      therapist_id?: string
      currency?: string
      booking_id?: string
      appointment_id?: string
    }

    if (!therapist_id || !appointment_id) {
      return NextResponse.json({ error: 'therapist_id and appointment_id are required' }, { status: 400 })
    }

    const db = createServiceSupabaseClient()

    const { data: appointment, error: appointmentErr } = await db
      .from('appointments')
      .select('id, therapist_id, service_price, status, payment_status')
      .eq('id', appointment_id)
      .maybeSingle()

    if (appointmentErr) throw appointmentErr
    if (!appointment || appointment.therapist_id !== therapist_id) {
      return NextResponse.json({ error: 'Appointment not found for therapist.' }, { status: 404 })
    }
    if (appointment.payment_status === 'paid') {
      return NextResponse.json({ error: 'Appointment is already paid.' }, { status: 409 })
    }
    if (['cancelled', 'expired', 'payment_failed'].includes(String(appointment.status))) {
      return NextResponse.json({ error: 'Appointment is not payable.' }, { status: 409 })
    }
    if (currency !== 'INR') {
      return NextResponse.json({ error: 'Only INR payments are supported.' }, { status: 400 })
    }

    const amount = Number(appointment.service_price)
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Appointment does not have a payable server-side price.' }, { status: 400 })
    }

    const { data: therapist, error: fetchErr } = await db
      .from('therapists')
      .select('razorpay_key_id, razorpay_key_secret_encrypted, payments_enabled, full_name')
      .eq('id', therapist_id)
      .single()

    if (fetchErr || !therapist) {
      return NextResponse.json({ error: 'Therapist not found' }, { status: 404 })
    }
    if (!therapist.payments_enabled) {
      return NextResponse.json({ error: 'Therapist has not connected Razorpay yet.' }, { status: 422 })
    }
    if (!therapist.razorpay_key_id || !therapist.razorpay_key_secret_encrypted) {
      return NextResponse.json({ error: 'Therapist payment credentials not configured.' }, { status: 422 })
    }

    let keySecret: string
    try {
      keySecret = decrypt(therapist.razorpay_key_secret_encrypted)
    } catch {
      return NextResponse.json({ error: 'Failed to load payment credentials.' }, { status: 500 })
    }

    const amountInPaise = Math.round(amount * 100)
    const receipt = (booking_id ?? appointment_id).slice(0, 40)
    const authHeader = 'Basic ' + Buffer.from(`${therapist.razorpay_key_id}:${keySecret}`).toString('base64')

    const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: authHeader },
      body: JSON.stringify({
        amount: amountInPaise,
        currency,
        receipt,
        notes: {
          therapist_id,
          appointment_id,
          therapist_name: therapist.full_name ?? '',
          platform: 'counsellors-of-india',
        },
      }),
    })

    const rzpOrder = await rzpRes.json()
    if (!rzpRes.ok) {
      console.error('[therapist-order] Razorpay error:', rzpOrder)
      return NextResponse.json(
        { error: rzpOrder?.error?.description ?? 'Failed to create payment order.' },
        { status: 502 },
      )
    }

    const { error: paymentErr } = await db.from('payments').insert({
      appointment_id,
      therapist_id,
      razorpay_order_id: rzpOrder.id,
      amount_paise: amountInPaise,
      currency,
      status: 'created',
    })

    if (paymentErr) {
      console.error('[therapist-order] Insert payment row failed:', paymentErr)
      return NextResponse.json({ error: 'Failed to record payment order.' }, { status: 500 })
    }

    return NextResponse.json({
      order_id: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      key_id: therapist.razorpay_key_id,
      receipt: rzpOrder.receipt,
    })
  } catch (err: unknown) {
    console.error('[therapist-order]', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 })
  }
}

/**
 * POST /api/razorpay/therapist-verify
 *
 * Verifies Razorpay payment signature using the THERAPIST'S OWN secret key.
 * On success, marks the appointment as paid.
 *
 * Body: { therapist_id, razorpay_order_id, razorpay_payment_id, razorpay_signature, appointment_id? }
 */

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createServiceSupabaseClient } from '@/lib/supabase-server'
import { decrypt } from '@/lib/encryption'

export async function POST(req: NextRequest) {
  try {
    const {
      therapist_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      appointment_id,
    } = await req.json() as {
      therapist_id:        string
      razorpay_order_id:   string
      razorpay_payment_id: string
      razorpay_signature:  string
      appointment_id?:     string
    }

    if (!therapist_id || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing required fields: therapist_id, razorpay_order_id, razorpay_payment_id, razorpay_signature' },
        { status: 400 }
      )
    }

    // Fetch therapist credentials — service-role (synchronous init)
    const db = createServiceSupabaseClient()
    const { data: therapist, error: fetchErr } = await db
      .from('therapists')
      .select('razorpay_key_id, razorpay_key_secret_encrypted, payments_enabled')
      .eq('id', therapist_id)
      .single()

    if (fetchErr || !therapist) {
      return NextResponse.json({ error: 'Therapist not found' }, { status: 404 })
    }
    if (!therapist.payments_enabled || !therapist.razorpay_key_secret_encrypted) {
      return NextResponse.json({ error: 'Therapist payment credentials not configured' }, { status: 422 })
    }

    // Decrypt secret
    let keySecret: string
    try {
      keySecret = decrypt(therapist.razorpay_key_secret_encrypted)
    } catch {
      return NextResponse.json({ error: 'Credential decryption failed' }, { status: 500 })
    }

    // Verify HMAC-SHA256 signature
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      console.error('[therapist-verify] Signature mismatch for therapist:', therapist_id)
      return NextResponse.json(
        { error: 'Payment verification failed — invalid signature.' },
        { status: 400 }
      )
    }

    // Update payments row
    const { data: paymentRow } = await db
      .from('payments')
      .update({ razorpay_payment_id, razorpay_signature, status: 'paid' })
      .eq('razorpay_order_id', razorpay_order_id)
      .select('id')
      .maybeSingle()

    // Update appointment
    if (appointment_id) {
      const updateFields: Record<string, unknown> = {
        status:         'upcoming',
        payment_status: 'paid',
      }
      if (paymentRow?.id) updateFields.payment_id = paymentRow.id

      const { error: apptErr } = await db
        .from('appointments')
        .update(updateFields)
        .eq('id', appointment_id)

      if (apptErr) console.error('[therapist-verify] Appointment update failed:', apptErr)
    }

    return NextResponse.json({
      verified:       true,
      appointment_id: appointment_id ?? null,
      payment_id:     paymentRow?.id ?? null,
    })
  } catch (err: unknown) {
    console.error('[therapist-verify]', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 })
  }
}

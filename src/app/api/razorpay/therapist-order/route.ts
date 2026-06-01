/**
 * POST /api/razorpay/therapist-order
 *
 * Creates a Razorpay order using the THERAPIST'S OWN credentials.
 * Money goes directly into the therapist's bank — platform never touches it.
 *
 * Body: { therapist_id, amount (INR), currency?, appointment_id?, booking_id? }
 * Returns: { order_id, amount (paise), currency, key_id (public, safe for browser) }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabase-server'
import { decrypt } from '@/lib/encryption'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      therapist_id,
      amount,
      currency = 'INR',
      booking_id,
      appointment_id,
    } = body as {
      therapist_id:    string
      amount:          number
      currency?:       string
      booking_id?:     string
      appointment_id?: string
    }

    if (!therapist_id) {
      return NextResponse.json({ error: 'therapist_id is required' }, { status: 400 })
    }
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'amount must be a positive number (INR)' }, { status: 400 })
    }

    // Fetch therapist credentials — service-role client (synchronous init)
    const db = createServiceSupabaseClient()
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

    // Decrypt secret — server-only, never sent to client
    let keySecret: string
    try {
      keySecret = decrypt(therapist.razorpay_key_secret_encrypted)
    } catch {
      return NextResponse.json({ error: 'Failed to load payment credentials.' }, { status: 500 })
    }

    // Create order via therapist's own Razorpay account
    const amountInPaise = Math.round(amount * 100)
    const receipt       = (booking_id ?? `rcpt_${Date.now()}`).slice(0, 40)
    const authHeader    = 'Basic ' + Buffer.from(`${therapist.razorpay_key_id}:${keySecret}`).toString('base64')

    const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Authorization: authHeader },
      body:    JSON.stringify({
        amount:   amountInPaise,
        currency,
        receipt,
        notes: {
          therapist_id,
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
        { status: 502 }
      )
    }

    // Record order in payments table (non-fatal if it fails)
    if (appointment_id) {
      await db.from('payments').insert({
        appointment_id,
        therapist_id,
        razorpay_order_id: rzpOrder.id,
        amount_paise:      amountInPaise,
        currency,
        status:            'created',
      }).then(({ error }) => {
        if (error) console.error('[therapist-order] Insert payment row failed:', error)
      })
    }

    // NEVER return key_secret — only the public key_id
    return NextResponse.json({
      order_id: rzpOrder.id,
      amount:   rzpOrder.amount,
      currency: rzpOrder.currency,
      key_id:   therapist.razorpay_key_id,
      receipt:  rzpOrder.receipt,
    })
  } catch (err: unknown) {
    console.error('[therapist-order]', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabase-server'
import { decrypt } from '@/lib/encryption'
import { getValidAccessToken, markOAuthHealth } from '@/lib/razorpay-oauth'

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
      .select('razorpay_key_id, razorpay_key_secret_encrypted, payments_enabled, full_name, razorpay_oauth_merchant_id, razorpay_oauth_public_token')
      .eq('id', therapist_id)
      .single()

    if (fetchErr || !therapist) {
      return NextResponse.json({ error: 'Therapist not found' }, { status: 404 })
    }
    if (!therapist.payments_enabled) {
      return NextResponse.json({ error: 'Therapist has not connected Razorpay yet.' }, { status: 422 })
    }

    // Two ways a therapist can be payment-ready: OAuth connect (preferred --
    // no keys ever touch our UI) or manual key entry. OAuth takes priority
    // if both happen to be present. Each path needs a different Razorpay
    // auth header and returns a different value as the frontend's `key`.
    const isOAuthConnected = !!therapist.razorpay_oauth_merchant_id

    let authHeader: string
    let clientKey: string // what the frontend Checkout widget uses as `key`

    if (isOAuthConnected) {
      if (!therapist.razorpay_oauth_public_token) {
        return NextResponse.json(
          { error: 'Razorpay connection is missing its public token -- ask the therapist to reconnect.' },
          { status: 422 },
        )
      }
      let accessToken: string
      try {
        accessToken = await getValidAccessToken(therapist_id)
      } catch (err) {
        console.error('[therapist-order] OAuth token unavailable:', err)
        // The failure IS the health check -- record it immediately instead
        // of waiting for a periodic check to notice. This is what makes
        // the dashboard reflect a broken connection the moment it actually
        // breaks, rather than a stale "Connected" badge that only checked
        // whether a merchant_id exists.
        await markOAuthHealth(therapist_id, 'broken', 'refresh_failed')
        return NextResponse.json({ error: 'Razorpay connection has expired -- ask the therapist to reconnect.' }, { status: 422 })
      }
      authHeader = `Bearer ${accessToken}`
      clientKey = therapist.razorpay_oauth_public_token
    } else {
      if (!therapist.razorpay_key_id || !therapist.razorpay_key_secret_encrypted) {
        return NextResponse.json({ error: 'Therapist payment credentials not configured.' }, { status: 422 })
      }
      let keySecret: string
      try {
        keySecret = decrypt(therapist.razorpay_key_secret_encrypted)
      } catch {
        return NextResponse.json({ error: 'Failed to load payment credentials.' }, { status: 500 })
      }
      authHeader = 'Basic ' + Buffer.from(`${therapist.razorpay_key_id}:${keySecret}`).toString('base64')
      clientKey = therapist.razorpay_key_id
    }

    const amountInPaise = Math.round(amount * 100)
    const receipt = (booking_id ?? appointment_id).slice(0, 40)

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
      // Same as above -- if this was an OAuth-connected therapist and
      // Razorpay rejected the call as an auth problem (not a validation
      // error like a bad amount), the connection itself is broken. Record
      // it right here, at the actual failure point, instead of only
      // finding out from a support message days later.
      if (isOAuthConnected && (rzpRes.status === 401 || rzpOrder?.error?.code === 'BAD_REQUEST_ERROR')) {
        await markOAuthHealth(therapist_id, 'broken', 'auth_failed')
      }
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

    // A successful order proves the connection genuinely works right now --
    // clear any stale 'broken' status from an earlier failure.
    if (isOAuthConnected) {
      markOAuthHealth(therapist_id, 'healthy').catch(() => {})
    }

    return NextResponse.json({
      order_id: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      key_id: clientKey,
      receipt: rzpOrder.receipt,
      // Tells the frontend whether to expect immediate client-side
      // verification (manual keys) or to wait on webhook confirmation
      // (OAuth -- see therapist-verify/route.ts for why).
      payment_flow: isOAuthConnected ? 'oauth' : 'manual',
    })
  } catch (err: unknown) {
    console.error('[therapist-order]', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 })
  }
}

/**
 * API Route: POST /api/payment/webhook
 *
 * Handles Razorpay webhook events for ALL therapists on the platform.
 * Each therapist must add this URL in their Razorpay Dashboard:
 *   Settings → Webhooks → https://yourdomain.com/api/payment/webhook
 *   Events: payment.captured, payment.failed, refund.processed
 */

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createServiceSupabaseClient } from '@/lib/supabase-server'
import { decrypt } from '@/lib/encryption'

// ── Types ─────────────────────────────────────────────────────────────
interface RazorpayWebhookEvent {
  event?: string
  payload?: {
    payment?: { entity?: { id?: string; order_id?: string; [k: string]: unknown } }
    order?:   { entity?: { id?: string; [k: string]: unknown } }
  }
}

interface PaymentRow {
  id:             string
  appointment_id: string
  therapist_id:   string
  amount_paise:   number
  currency:       string
  status:         string
  therapists:     unknown
}

// ── Main handler ──────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    // 1. Read raw body for HMAC verification
    const rawBody           = await req.text()
    const razorpaySignature = req.headers.get('x-razorpay-signature') ?? ''

    if (!razorpaySignature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    // 2. Parse payload
    let event: RazorpayWebhookEvent
    try {
      event = JSON.parse(rawBody) as RazorpayWebhookEvent
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const orderId = extractOrderId(event)
    if (!orderId) {
      return NextResponse.json({ received: true })
    }

    // 3. Look up payment + therapist — use service-role client (no cookies needed)
    const supabase = createServiceSupabaseClient()

    const { data: payment, error: paymentErr } = await supabase
      .from('payments')
      .select(`
        id,
        appointment_id,
        therapist_id,
        amount_paise,
        currency,
        status,
        therapists (
          razorpay_key_secret_encrypted,
          full_name,
          email
        )
      `)
      .eq('razorpay_order_id', orderId)
      .maybeSingle()

    if (paymentErr) {
      console.error('[webhook] DB lookup error:', paymentErr)
      return NextResponse.json({ error: 'DB error' }, { status: 500 })
    }

    if (!payment) {
      return NextResponse.json({ received: true })
    }

    // 4. Verify HMAC signature using therapist's own secret
    // payments.therapists can be returned as an array (due to select relation) or as an object.
    const rawTherapists = payment.therapists as unknown
    const therapistData = (Array.isArray(rawTherapists) ? (rawTherapists[0] as any) : (rawTherapists as any)) as {
      razorpay_key_secret_encrypted: string | null
      full_name: string | null
      email: string | null
    }

    if (!therapistData?.razorpay_key_secret_encrypted) {
      console.error('[webhook] No key secret for therapist:', payment.therapist_id)
      return NextResponse.json({ received: true })
    }

    let keySecret: string
    try {
      keySecret = decrypt(therapistData.razorpay_key_secret_encrypted)
    } catch {
      console.error('[webhook] Decryption failed for therapist:', payment.therapist_id)
      return NextResponse.json({ received: true })
    }

    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(rawBody)
      .digest('hex')

    if (expectedSignature !== razorpaySignature) {
      console.error('[webhook] Signature mismatch for order:', orderId)
      return NextResponse.json({ error: 'Signature verification failed' }, { status: 400 })
    }

    // 5. Process the event
    const eventType = event.event ?? ''

    if (eventType === 'payment.captured') {
      const paymentId = event.payload?.payment?.entity?.id ?? null

      await supabase
        .from('payments')
        .update({ razorpay_payment_id: paymentId, status: 'paid' })
        .eq('id', payment.id)

      await supabase
        .from('appointments')
        .update({ status: 'upcoming', payment_status: 'paid', payment_id: payment.id })
        .eq('id', payment.appointment_id)

      console.log('[webhook] payment.captured — appointment:', payment.appointment_id)

    } else if (eventType === 'payment.failed') {
      await supabase
        .from('payments')
        .update({ status: 'failed' })
        .eq('id', payment.id)

    } else if (eventType === 'refund.processed') {
      await supabase
        .from('payments')
        .update({ status: 'refunded' })
        .eq('id', payment.id)

      await supabase
        .from('appointments')
        .update({ payment_status: 'refunded' })
        .eq('id', payment.appointment_id)
    }

    // 6. Audit trail + mark webhook verified
    await supabase
      .from('payments')
      .update({ webhook_payload: event })
      .eq('id', payment.id)

    await supabase
      .from('therapists')
      .update({ webhook_verified: true })
      .eq('id', payment.therapist_id)
      .eq('webhook_verified', false)

    return NextResponse.json({ received: true })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[webhook] Unhandled error:', err)
    return NextResponse.json({ received: true, _error: message })
  }
}

function extractOrderId(event: RazorpayWebhookEvent): string | null {
  return (
    event?.payload?.payment?.entity?.order_id ??
    event?.payload?.order?.entity?.id ??
    null
  )
}

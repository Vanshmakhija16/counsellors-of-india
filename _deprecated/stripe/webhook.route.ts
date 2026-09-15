/**
 * API Route: POST /api/stripe/webhook
 *
 * Handles Stripe webhook events for session-booking payments (the Stripe
 * Connect destination-charge flow created in
 * stripe/booking/create-payment-intent/route.ts). Mirrors
 * payment/webhook/route.ts's Razorpay logic, but for Stripe.
 *
 * Set this URL in the Stripe Dashboard -> Developers -> Webhooks, for each
 * tenant's Stripe account:
 *   https://yourdomain.com/api/stripe/webhook
 *   Events: payment_intent.succeeded, payment_intent.payment_failed, charge.refunded
 *
 * Requires STRIPE_WEBHOOK_SECRET_<PREFIX> (e.g. STRIPE_WEBHOOK_SECRET_US)
 * set in .env.local — copy this from the webhook's "Signing secret" in the
 * Stripe Dashboard once you've created the endpoint there.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabaseClientForTenant } from '@/lib/supabase-server'
import { getStripeClient } from '@/lib/stripe-client'
import { getCurrentTenant } from '@/lib/tenants/server'
import type Stripe from 'stripe'

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get('stripe-signature') ?? ''

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    const tenant = await getCurrentTenant()
    const webhookSecret = process.env[`STRIPE_WEBHOOK_SECRET_${tenant.supabaseEnvPrefix}`]
    if (!webhookSecret) {
      console.error(`[stripe/webhook] Missing STRIPE_WEBHOOK_SECRET_${tenant.supabaseEnvPrefix}`)
      return NextResponse.json({ received: true })
    }

    const stripe = getStripeClient(tenant.supabaseEnvPrefix)

    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
    } catch (err) {
      console.error('[stripe/webhook] Signature verification failed:', err)
      return NextResponse.json({ error: 'Signature verification failed' }, { status: 400 })
    }

    const db = await createServiceSupabaseClientForTenant()

    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object as Stripe.PaymentIntent

      const { data: payment } = await db
        .from('payments')
        .select('id, appointment_id')
        .eq('stripe_payment_intent_id', intent.id)
        .maybeSingle()

      if (payment) {
        await db.from('payments').update({ status: 'paid' }).eq('id', payment.id)
        await db
          .from('appointments')
          .update({ status: 'upcoming', payment_status: 'paid', payment_id: payment.id })
          .eq('id', payment.appointment_id)

        console.log('[stripe/webhook] payment_intent.succeeded — appointment:', payment.appointment_id)
      }
    } else if (event.type === 'payment_intent.payment_failed') {
      const intent = event.data.object as Stripe.PaymentIntent
      await db.from('payments').update({ status: 'failed' }).eq('stripe_payment_intent_id', intent.id)
    } else if (event.type === 'charge.refunded') {
      const charge = event.data.object as Stripe.Charge
      const paymentIntentId = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id

      if (paymentIntentId) {
        const { data: payment } = await db
          .from('payments')
          .select('id, appointment_id')
          .eq('stripe_payment_intent_id', paymentIntentId)
          .maybeSingle()

        if (payment) {
          await db.from('payments').update({ status: 'refunded' }).eq('id', payment.id)
          await db.from('appointments').update({ payment_status: 'refunded' }).eq('id', payment.appointment_id)
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[stripe/webhook] Unhandled error:', err)
    return NextResponse.json({ received: true, _error: message })
  }
}

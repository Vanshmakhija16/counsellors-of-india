/**
 * API Route: POST /api/razorpay/oauth/webhook
 *
 * Receives events from Razorpay for THIS OAuth application (configured once
 * in the Partner Dashboard under the app's own webhook settings -- separate
 * from each therapist's personal payment webhook already documented in
 * RazorpayConnect.tsx). Handles two event types:
 *
 *   account.app.authorization_revoked -- therapist disconnected the app from
 *   their Razorpay account (or Razorpay revoked it). We clear their OAuth
 *   columns immediately so we stop trying to use a dead token instead of
 *   waiting to discover it on the next failed API call.
 *
 *   payment.captured -- the ONLY way we confirm an OAuth-connected
 *   therapist's payment as paid. OAuth never gives us the therapist's
 *   key_secret (only an access token), so therapist-verify/route.ts cannot
 *   run the usual client-side HMAC signature check for these therapists --
 *   there's no secret on our side to check it with. Instead we trust THIS
 *   webhook, which Razorpay signs with our OWN RAZORPAY_OAUTH_WEBHOOK_SECRET
 *   (a secret we configured ourselves and fully control), and flip the
 *   payment/appointment to paid from here.
 *
 * Other event types are acknowledged (200) but ignored.
 */

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { getOAuthWebhookSecret, disconnectOAuthByMerchantId } from '@/lib/razorpay-oauth'
import { createServiceSupabaseClient } from '@/lib/supabase-server'

function verifySignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature) return false
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
  const expectedBuf = Buffer.from(expected)
  const actualBuf = Buffer.from(signature)
  if (expectedBuf.length !== actualBuf.length) return false
  return crypto.timingSafeEqual(expectedBuf, actualBuf)
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-razorpay-signature')

  let secret: string
  try {
    secret = getOAuthWebhookSecret()
  } catch (err) {
    console.error('[razorpay/oauth/webhook] Webhook secret not configured:', err)
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  if (!verifySignature(rawBody, signature, secret)) {
    console.error('[razorpay/oauth/webhook] Invalid signature -- rejecting.')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  let event: { event?: string; account_id?: string; payload?: Record<string, any> }
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  try {
    if (event.event === 'account.app.authorization_revoked') {
      // Razorpay's payload nests the account id differently depending on
      // event; account_id at the top level is the documented location for
      // this specific event.
      const merchantId = event.account_id
      if (merchantId) {
        await disconnectOAuthByMerchantId(merchantId)
        console.log('[razorpay/oauth/webhook] Cleared OAuth connection for merchant:', merchantId)
      } else {
        console.warn('[razorpay/oauth/webhook] authorization_revoked event missing account_id.')
      }
    }

    if (event.event === 'payment.captured') {
      const paymentEntity = event.payload?.payment?.entity as
        | { id?: string; order_id?: string; amount?: number }
        | undefined
      const merchantId = event.account_id
      const razorpayOrderId = paymentEntity?.order_id
      const razorpayPaymentId = paymentEntity?.id
      const amountPaise = paymentEntity?.amount

      if (!merchantId || !razorpayOrderId || !razorpayPaymentId || amountPaise === undefined) {
        console.warn('[razorpay/oauth/webhook] payment.captured missing required fields.')
      } else {
        const db = createServiceSupabaseClient()

        const { data: paymentRow, error: paymentErr } = await db
          .from('payments')
          .select('id, appointment_id, therapist_id, amount_paise, status')
          .eq('razorpay_order_id', razorpayOrderId)
          .maybeSingle()

        if (paymentErr) {
          console.error('[razorpay/oauth/webhook] payment lookup failed:', paymentErr)
        } else if (!paymentRow) {
          console.warn('[razorpay/oauth/webhook] payment.captured for unknown order:', razorpayOrderId)
        } else if (paymentRow.status === 'paid') {
          // Already confirmed (webhooks can be delivered more than once) -- no-op.
        } else {
          // Defense in depth: confirm the account_id that captured this
          // payment actually belongs to the therapist we have on file for
          // it, and the amount matches what we created the order for.
          const { data: ownerCheck } = await db
            .from('therapists')
            .select('id')
            .eq('id', paymentRow.therapist_id)
            .eq('razorpay_oauth_merchant_id', merchantId)
            .maybeSingle()

          if (!ownerCheck) {
            console.error('[razorpay/oauth/webhook] account_id does not match payment\'s therapist -- refusing to mark paid.', {
              razorpayOrderId, merchantId, therapistId: paymentRow.therapist_id,
            })
          } else if (Number(amountPaise) !== Number(paymentRow.amount_paise)) {
            console.error('[razorpay/oauth/webhook] Amount mismatch on payment.captured -- refusing to mark paid.', {
              razorpayOrderId, expected: paymentRow.amount_paise, got: amountPaise,
            })
          } else {
            const { error: updatePaymentErr } = await db
              .from('payments')
              .update({ razorpay_payment_id: razorpayPaymentId, status: 'paid' })
              .eq('id', paymentRow.id)

            if (updatePaymentErr) {
              console.error('[razorpay/oauth/webhook] Failed to mark payment paid:', updatePaymentErr)
            } else {
              const { error: apptErr } = await db
                .from('appointments')
                .update({ status: 'upcoming', payment_status: 'paid', payment_id: paymentRow.id })
                .eq('id', paymentRow.appointment_id)
                .eq('therapist_id', paymentRow.therapist_id)

              if (apptErr) {
                console.error('[razorpay/oauth/webhook] Payment marked paid but appointment update failed:', apptErr)
              } else {
                console.log('[razorpay/oauth/webhook] Confirmed OAuth payment via webhook:', razorpayOrderId)
              }
            }
          }
        }
      }
    }
    // Other event types: acknowledged, no action needed yet.

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[razorpay/oauth/webhook] Handler error:', err)
    // Still 200 -- Razorpay will retry on non-2xx, and a DB hiccup here
    // shouldn't cause a retry storm. Logged above for follow-up.
    return NextResponse.json({ received: true, warning: 'Processing error, logged.' })
  }
}

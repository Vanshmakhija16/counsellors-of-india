import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabaseClientForTenant } from '@/lib/supabase-server'

/**
 * GET /booking/paypal-cancel?appointment_id=...
 *
 * PayPal's cancel_url (set in /api/paypal/booking/create-order) — the
 * client backed out of PayPal's hosted approval page instead of paying.
 * A plain Route Handler (not a page) so this can release the appointment
 * hold server-side before redirecting, the same way
 * payu/booking-callback/route.ts does for a non-success PayU status.
 */

function redirect(req: NextRequest, path: string) {
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin).replace(/\/+$/, '')
  return NextResponse.redirect(`${base}${path}`, { status: 303 })
}

export async function GET(req: NextRequest) {
  const appointmentId = req.nextUrl.searchParams.get('appointment_id')

  if (appointmentId) {
    try {
      const db = await createServiceSupabaseClientForTenant()
      // Only touch it if still awaiting payment — never stomp a booking
      // that was somehow already confirmed by the time the cancel redirect
      // lands (e.g. a second tab completed the payment first).
      await db
        .from('appointments')
        .update({ status: 'payment_failed', paypal_order_id: null, hold_until: null })
        .eq('id', appointmentId)
        .eq('status', 'pending_payment')
    } catch (err) {
      console.error('[booking/paypal-cancel]', err)
      // Fall through to the redirect regardless — a failed cleanup here
      // shouldn't strand the client on a blank page.
    }
  }

  return redirect(req, `/booking/failure?reason=cancelled`)
}

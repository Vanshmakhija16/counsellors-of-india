/**
 * API Route: GET /api/paypal/connect/status
 *
 * Returns the therapist's current PayPal connection status. If a
 * tracking_id exists but onboarding isn't yet marked complete, calls
 * PayPal's merchant-integrations lookup to refresh the real status first
 * (mirrors /api/razorpay/oauth/health's "check on load" pattern) --
 * PayPal's onboarding-complete redirect alone isn't reliable proof that
 * `payments_receivable` actually flipped true yet on their side.
 */

import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceSupabaseClientForTenant } from '@/lib/supabase-server'
import { getCurrentTenant } from '@/lib/tenants/server'
import { getMerchantIntegrationStatus } from '@/lib/paypal'

export async function GET() {
  const tenant = await getCurrentTenant()
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const serviceClient = await createServiceSupabaseClientForTenant()
  const { data: row } = await serviceClient
    .from('therapists')
    .select('paypal_tracking_id, paypal_merchant_id, paypal_onboarding_status, paypal_payments_receivable, paypal_email_confirmed, paypal_connected_at')
    .eq('id', user.id)
    .single()

  if (!row?.paypal_tracking_id) {
    return NextResponse.json({
      connected: false,
      merchant_id: null,
      onboarding_status: null,
      payments_receivable: false,
      email_confirmed: false,
      connected_at: null,
    })
  }

  // Already fully connected -- no need to hit PayPal's API again.
  if (row.paypal_onboarding_status === 'completed' && row.paypal_payments_receivable) {
    return NextResponse.json({
      connected: true,
      merchant_id: row.paypal_merchant_id,
      onboarding_status: row.paypal_onboarding_status,
      payments_receivable: row.paypal_payments_receivable,
      email_confirmed: row.paypal_email_confirmed,
      connected_at: row.paypal_connected_at,
    })
  }

  // Still pending -- ask PayPal for the live status.
  try {
    const liveStatus = await getMerchantIntegrationStatus({
      tenantPrefix: tenant.supabaseEnvPrefix,
      trackingId: row.paypal_tracking_id,
    })

    const nowCompleted = liveStatus.payments_receivable
    const updatePayload = {
      paypal_merchant_id: liveStatus.merchant_id,
      paypal_payments_receivable: liveStatus.payments_receivable,
      paypal_email_confirmed: liveStatus.primary_email_confirmed,
      paypal_onboarding_status: nowCompleted ? 'completed' : 'pending',
      ...(nowCompleted && !row.paypal_connected_at ? { paypal_connected_at: new Date().toISOString() } : {}),
    }

    await serviceClient.from('therapists').update(updatePayload).eq('id', user.id)

    return NextResponse.json({
      connected: nowCompleted,
      merchant_id: liveStatus.merchant_id,
      onboarding_status: updatePayload.paypal_onboarding_status,
      payments_receivable: liveStatus.payments_receivable,
      email_confirmed: liveStatus.primary_email_confirmed,
      connected_at: updatePayload.paypal_connected_at ?? row.paypal_connected_at,
    })
  } catch (err) {
    // PayPal lookup failing doesn't mean the therapist is disconnected --
    // just report what we last knew, same "fail soft" behaviour as
    // Razorpay's health check falling back to cached status.
    console.error('[paypal/connect/status] live lookup failed', err)
    return NextResponse.json({
      connected: false,
      merchant_id: row.paypal_merchant_id,
      onboarding_status: row.paypal_onboarding_status,
      payments_receivable: row.paypal_payments_receivable,
      email_confirmed: row.paypal_email_confirmed,
      connected_at: row.paypal_connected_at,
    })
  }
}

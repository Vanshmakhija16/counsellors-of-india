/**
 * API Route: GET /api/paypal/connect/onboard
 *
 * Starts the "Connect with PayPal" flow for a therapist (mirrors
 * /api/razorpay/oauth/connect and Stripe's accountLinks.create pattern).
 *
 * Requires an authenticated therapist (cookie session, tenant-aware --
 * uses whichever tenant's Supabase project the current request resolved
 * to via middleware.ts, NOT hardcoded to India). Generates/reuses a
 * tracking_id, calls PayPal's Partner Referrals API, stores the tracking
 * id + 'pending' status on the therapist row, then redirects to PayPal's
 * hosted onboarding page.
 */

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createServerSupabaseClient, createServiceSupabaseClientForTenant } from '@/lib/supabase-server'
import { getCurrentTenant } from '@/lib/tenants/server'
import { createPartnerReferral } from '@/lib/paypal'

export async function GET(req: NextRequest) {
  const tenant = await getCurrentTenant()
  const safeOrigin = tenant.siteUrl

  const supabase = await createServerSupabaseClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    const loginUrl = new URL('/login', safeOrigin)
    loginUrl.searchParams.set('redirect', '/dashboard/payments')
    return NextResponse.redirect(loginUrl)
  }

  const serviceClient = await createServiceSupabaseClientForTenant()

  // Reuse an existing tracking_id if this therapist already started
  // onboarding once before (e.g. they navigated away and came back) --
  // avoids creating a new orphaned partner-referral record with PayPal
  // every time the button is clicked.
  const { data: therapistRow } = await serviceClient
    .from('therapists')
    .select('paypal_tracking_id')
    .eq('id', user.id)
    .single()

  const trackingId = therapistRow?.paypal_tracking_id || crypto.randomUUID()

  try {
    const { actionUrl } = await createPartnerReferral({
      tenantPrefix: tenant.supabaseEnvPrefix,
      trackingId,
      returnUrl: `${safeOrigin}/dashboard/payments?paypal=return`,
      email: user.email ?? undefined,
    })

    await serviceClient
      .from('therapists')
      .update({
        paypal_tracking_id: trackingId,
        paypal_onboarding_status: 'pending',
      })
      .eq('id', user.id)

    return NextResponse.redirect(actionUrl)
  } catch (err) {
    console.error('[paypal/connect/onboard] failed', err)
    const paymentsUrl = new URL('/dashboard/payments', safeOrigin)
    paymentsUrl.searchParams.set('paypal_error', 'onboard_failed')
    return NextResponse.redirect(paymentsUrl)
  }
}

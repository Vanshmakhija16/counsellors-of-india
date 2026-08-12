/**
 * API Route: POST /api/subscription/check-expiry
 *
 * Lazy expiry check -- called once per dashboard visit (see
 * DashboardLayout.tsx). Every plan activation in upgrade-plan/route.ts now
 * stamps subscription_expires_at one year out. This route is what actually
 * enforces that date: if it's passed, the therapist gets downgraded to
 * 'starter' right here, right now.
 *
 * This is a lazy check, not a scheduled job -- it only runs when the
 * therapist visits the dashboard. A therapist who never logs back in stays
 * on their old plan value in the DB indefinitely (though with no session to
 * use it in). That's an accepted gap for now; a real daily cron job would
 * close it if it's ever needed.
 */

import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createServiceSupabaseClient } from '@/lib/supabase-server'

async function getUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cs) => cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  )
  const { data: { user }, error } = await supabase.auth.getUser()
  return error ? null : user
}

export async function POST() {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const db = createServiceSupabaseClient()
    const { data: therapist, error: fetchErr } = await db
      .from('therapists')
      .select('plan, subscription_expires_at, subscription_status')
      .eq('id', user.id)
      .single()

    if (fetchErr || !therapist) {
      return NextResponse.json({ error: 'Therapist not found.' }, { status: 404 })
    }

    const expiresAt = therapist.subscription_expires_at ? new Date(therapist.subscription_expires_at) : null
    const isExpired = !!expiresAt && expiresAt.getTime() < Date.now()
    const alreadyStarter = therapist.plan === 'starter' || !therapist.plan

    if (!isExpired || alreadyStarter) {
      return NextResponse.json({
        expired: false,
        plan: therapist.plan ?? 'starter',
      })
    }

    // Expired paid plan -- downgrade now. highest_plan (upgrade-plan/route.ts)
    // is left untouched, since that's a lifetime "best plan ever held"
    // record, not the current plan.
    const { error: updateErr } = await db
      .from('therapists')
      .update({
        plan: 'starter',
        subscription_status: 'expired',
      })
      .eq('id', user.id)

    if (updateErr) {
      console.error('[subscription/check-expiry] Downgrade failed:', updateErr)
      return NextResponse.json({ error: 'Failed to update subscription.' }, { status: 500 })
    }

    console.log('[subscription/check-expiry] Downgraded expired plan to starter:', user.id)

    return NextResponse.json({
      expired: true,
      plan: 'starter',
      expired_at: therapist.subscription_expires_at,
    })
  } catch (err: unknown) {
    console.error('[subscription/check-expiry]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to check subscription.' },
      { status: 500 }
    )
  }
}

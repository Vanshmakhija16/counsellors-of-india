/**
 * API Route: POST /api/razorpay/oauth/health
 *
 * Runs a REAL check against Razorpay's own API (see checkOAuthHealth in
 * lib/razorpay-oauth.ts) instead of just reading whether merchant_id
 * exists in the DB. Used by the dashboard's "Check Connection" button, and
 * safe to call on dashboard load too since it's a single cheap read call.
 */

import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { checkOAuthHealth } from '@/lib/razorpay-oauth'

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

    const result = await checkOAuthHealth(user.id)

    return NextResponse.json({
      health: result.health,
      error: result.error,
      checked_at: new Date().toISOString(),
    })
  } catch (err: unknown) {
    console.error('[razorpay/oauth/health]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to check connection health.' },
      { status: 500 }
    )
  }
}

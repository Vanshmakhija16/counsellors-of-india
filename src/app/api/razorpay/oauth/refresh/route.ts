/**
 * API Route: POST /api/razorpay/oauth/refresh
 *
 * Forces a refresh of the logged-in therapist's own OAuth access token.
 * Not called by checkout flows directly -- those should call
 * `getValidAccessToken()` from lib/razorpay-oauth.ts, which refreshes
 * lazily on its own. This route exists for an explicit "check connection"
 * action in the dashboard (e.g. after a long idle period) and for
 * internal/admin use.
 */

import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getValidAccessToken } from '@/lib/razorpay-oauth'
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

    // getValidAccessToken refreshes+stores if needed and returns the token --
    // we don't return the token itself to the client, just confirmation +
    // the new expiry, so the dashboard can show connection health.
    await getValidAccessToken(user.id)

    const db = createServiceSupabaseClient()
    const { data, error } = await db
      .from('therapists')
      .select('razorpay_oauth_access_expires_at, razorpay_oauth_connected_at')
      .eq('id', user.id)
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      access_expires_at: data.razorpay_oauth_access_expires_at,
      connected_at: data.razorpay_oauth_connected_at,
    })
  } catch (err: unknown) {
    console.error('[razorpay/oauth/refresh]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to refresh token.' },
      { status: 500 }
    )
  }
}

/**
 * API Route: GET /api/razorpay/oauth/connect
 *
 * Starts the "Connect with Razorpay" flow. Requires an authenticated
 * therapist (cookie session). Generates a random CSRF `state`, stashes it
 * in a short-lived httpOnly cookie, and redirects to Razorpay's consent
 * screen. The callback route verifies the state cookie matches before
 * exchanging the auth code.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import crypto from 'crypto'
import { buildAuthorizationUrl } from '@/lib/razorpay-oauth'

const STATE_COOKIE = 'rzp_oauth_state'
const STATE_TTL_SECONDS = 10 * 60 // 10 minutes -- plenty for a consent-screen redirect

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

export async function GET(req: NextRequest) {
  const user = await getUser()
  if (!user) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('redirect', '/dashboard/payments')
    return NextResponse.redirect(loginUrl)
  }

  const state = crypto.randomBytes(24).toString('hex')
  const authorizationUrl = buildAuthorizationUrl(state)

  const response = NextResponse.redirect(authorizationUrl)
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax', // 'lax' (not 'strict') so the cookie survives the cross-site redirect back from Razorpay
    maxAge: STATE_TTL_SECONDS,
    path: '/api/razorpay/oauth',
  })

  return response
}

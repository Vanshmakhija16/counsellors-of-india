/**
 * API Route: GET /api/razorpay/oauth/callback
 *
 * Razorpay redirects the therapist back here after they approve (or deny)
 * the consent screen. Verifies the CSRF state cookie, exchanges the auth
 * code for tokens, stores them encrypted against the logged-in therapist,
 * and redirects back into the dashboard with a status flag the frontend
 * can read.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { exchangeCodeForTokens, storeTokensForTherapist } from '@/lib/razorpay-oauth'

const STATE_COOKIE = 'rzp_oauth_state'
const PAYMENTS_PAGE = '/dashboard/payments'

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

function redirectWithStatus(req: NextRequest, status: string, clearStateCookie = true) {
  const url = new URL(PAYMENTS_PAGE, req.url)
  url.searchParams.set('oauth', status)
  const response = NextResponse.redirect(url)
  if (clearStateCookie) {
    response.cookies.set(STATE_COOKIE, '', { maxAge: 0, path: '/api/razorpay/oauth' })
  }
  return response
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const oauthError = searchParams.get('error')

  // Therapist denied consent, or Razorpay reported some other error.
  if (oauthError) {
    console.warn('[razorpay/oauth/callback] Razorpay returned error:', oauthError)
    return redirectWithStatus(req, 'denied')
  }

  if (!code || !state) {
    return redirectWithStatus(req, 'invalid_request')
  }

  // -- CSRF check: state must match what /connect set --
  const cookieStore = await cookies()
  const expectedState = cookieStore.get(STATE_COOKIE)?.value
  if (!expectedState || expectedState !== state) {
    console.error('[razorpay/oauth/callback] State mismatch -- possible CSRF attempt.')
    return redirectWithStatus(req, 'state_mismatch')
  }

  // -- Must still be logged in (same session that started /connect) --
  const user = await getUser()
  if (!user) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('redirect', PAYMENTS_PAGE)
    return NextResponse.redirect(loginUrl)
  }

  try {
    const tokens = await exchangeCodeForTokens(code)
    await storeTokensForTherapist(user.id, tokens)
  } catch (err) {
    console.error('[razorpay/oauth/callback] Token exchange/store failed:', err)
    return redirectWithStatus(req, 'exchange_failed')
  }

  return redirectWithStatus(req, 'connected')
}

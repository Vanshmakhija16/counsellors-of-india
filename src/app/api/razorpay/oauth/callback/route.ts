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

// Fallback origin used only if the request somehow arrives with no
// forwarded-host info at all -- should not happen in normal operation.
const FALLBACK_ORIGIN = 'https://www.counsellorsofindia.com'

/**
 * Canonical public origin for this flow. Deliberately NOT derived from
 * request headers (Host / X-Forwarded-Host / req.url / req.nextUrl).
 *
 * On this Azure App Service deployment, the request URL Next.js sees
 * internally -- and, it turns out, the `Host` header itself -- can reflect
 * the container's own internal hostname (e.g. 19d7e45db8a1:8080) instead of
 * the real public domain, whenever whatever's in front of the container
 * isn't reliably forwarding X-Forwarded-Host. That produced unreachable
 * redirect URLs for real users. APP_ORIGIN is a plain server-side env var
 * (not NEXT_PUBLIC_*, so it's read at request time and never gets inlined
 * into a build), giving one fixed, always-correct origin.
 */
function getSafeOrigin(): string {
  return process.env.APP_ORIGIN ?? FALLBACK_ORIGIN
}

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

function redirectWithStatus(status: string, clearStateCookie = true) {
  const url = new URL(PAYMENTS_PAGE, getSafeOrigin())
  url.searchParams.set('oauth', status)
  // -- TEMPORARY DEBUG LOGGING: remove once the flow is confirmed fixed --
  console.log('[razorpay/oauth/callback] final redirect URL:', url.toString())
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

  // -- CSRF check: state must match what /connect set --
  const cookieStore = await cookies()
  const expectedState = cookieStore.get(STATE_COOKIE)?.value

  // -- TEMPORARY DEBUG LOGGING: remove once the flow is confirmed fixed --
  console.log('[razorpay/oauth/callback] debug', {
    callbackState: state,
    cookieState: expectedState,
    host: req.headers.get('host'),
    xForwardedHost: req.headers.get('x-forwarded-host'),
    xForwardedProto: req.headers.get('x-forwarded-proto'),
    safeOrigin: getSafeOrigin(),
  })

  // Therapist denied consent, or Razorpay reported some other error.
  if (oauthError) {
    console.warn('[razorpay/oauth/callback] Razorpay returned error:', oauthError)
    return redirectWithStatus('denied')
  }

  if (!code || !state) {
    return redirectWithStatus('invalid_request')
  }

  if (!expectedState || expectedState !== state) {
    console.error('[razorpay/oauth/callback] State mismatch -- possible CSRF attempt, or cookie set on a different host (see APP_ORIGIN / canonical-host handling in /connect).')
    return redirectWithStatus('state_mismatch')
  }

  // -- Must still be logged in (same session that started /connect) --
  const user = await getUser()
  if (!user) {
    const loginUrl = new URL('/login', getSafeOrigin())
    loginUrl.searchParams.set('redirect', PAYMENTS_PAGE)
    return NextResponse.redirect(loginUrl)
  }

  try {
    const tokens = await exchangeCodeForTokens(code)
    await storeTokensForTherapist(user.id, tokens)
  } catch (err) {
    console.error('[razorpay/oauth/callback] Token exchange/store failed:', err)
    return redirectWithStatus('exchange_failed')
  }

  return redirectWithStatus('connected')
}

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

// Fallback origin used only if the request somehow arrives with no
// forwarded-host info at all -- should not happen in normal operation.
const FALLBACK_ORIGIN = 'https://www.counsellorsofindia.com'

/**
 * Canonical public origin for this flow. Deliberately NOT derived from
 * request headers (Host / X-Forwarded-Host) -- on Azure App Service those
 * can reflect the container's own internal hostname:port instead of the
 * public domain, which was sending therapists to unreachable URLs like
 * https://19d7e45db8a1:8080/...
 *
 * Also deliberately NOT NEXT_PUBLIC_APP_URL -- that prefix gets inlined at
 * build time by webpack, which is what broke forgot-password (baked in
 * localhost:3000). APP_ORIGIN is a plain server-side env var, read from
 * process.env at request time inside this server-only route file, so it's
 * never bundled to the client and never "baked in".
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

export async function GET(req: NextRequest) {
  const safeOrigin = getSafeOrigin()

  // -- Canonicalize host BEFORE setting the state cookie --
  // The redirect_uri we send to Razorpay (buildAuthorizationUrl -> getRedirectUri())
  // is fixed to a single host. The state cookie we set below has no explicit
  // Domain attribute, so it's host-only. If a therapist starts this flow on a
  // different host than the one baked into redirect_uri (e.g. apex
  // counsellorsofindia.com vs www.counsellorsofindia.com -- both are valid,
  // simultaneously-live hosts per src/lib/tenants/in.ts, with no canonical
  // redirect enforced anywhere), the cookie gets set on the wrong host and
  // will never be sent back on the callback request -> state_mismatch.
  // Forcing this redirect first guarantees the cookie is always set on
  // exactly the host Razorpay will return the browser to.
  const currentHost = req.headers.get('host')
  const canonicalHost = new URL(safeOrigin).host
  if (currentHost && currentHost !== canonicalHost) {
    console.warn('[razorpay/oauth/connect] Non-canonical host, redirecting.', { currentHost, canonicalHost })
    return NextResponse.redirect(new URL(req.nextUrl.pathname + req.nextUrl.search, safeOrigin))
  }

  const user = await getUser()
  if (!user) {
    const loginUrl = new URL('/login', safeOrigin)
    loginUrl.searchParams.set('redirect', '/dashboard/payments')
    return NextResponse.redirect(loginUrl)
  }

  const state = crypto.randomBytes(24).toString('hex')
  const authorizationUrl = buildAuthorizationUrl(state)

  // -- TEMPORARY DEBUG LOGGING: remove once the flow is confirmed fixed --
  // console.log('[razorpay/oauth/connect] debug', {
  //   generatedState: state,
  //   redirectUriSentToRazorpay: new URL(authorizationUrl).searchParams.get('redirect_uri'),
  //   host: req.headers.get('host'),
  //   xForwardedHost: req.headers.get('x-forwarded-host'),
  //   xForwardedProto: req.headers.get('x-forwarded-proto'),
  //   safeOrigin,
  // })

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

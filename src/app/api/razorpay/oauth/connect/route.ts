/**
 * API Route: GET /api/razorpay/oauth/connect
 *
 * Starts the "Connect with Razorpay" OAuth flow.
 *
 * Flow:
 * 1. Verify therapist is logged in
 * 2. Generate CSRF state
 * 3. Store state in secure httpOnly cookie
 * 4. Generate Razorpay authorization URL
 * 5. Redirect therapist to Razorpay
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import crypto from 'crypto'
import { buildAuthorizationUrl } from '@/lib/razorpay-oauth'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const STATE_COOKIE = 'rzp_oauth_state'
const STATE_TTL_SECONDS = 10 * 60

const FALLBACK_ORIGIN = 'https://www.counsellorsofindia.com'

/**
 * Always use the canonical public origin.
 *
 * Do NOT use Host / X-Forwarded-Host here because AWS/Amplify
 * may provide an internal hostname.
 */
function getSafeOrigin(): string {
  const origin = process.env.APP_ORIGIN

  if (origin) {
    return origin.replace(/\/$/, '')
  }

  return FALLBACK_ORIGIN
}

/**
 * Get currently authenticated Supabase user.
 */
async function getUser() {
  try {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },

          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options)
              })
            } catch {
              // Ignore cookie mutation errors in server context.
            }
          },
        },
      }
    )

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.error(
        '[razorpay/oauth/connect] Supabase auth error:',
        error.message
      )

      return null
    }

    return user
  } catch (error) {
    console.error(
      '[razorpay/oauth/connect] Failed to get authenticated user:',
      error
    )

    return null
  }
}

/**
 * GET /api/razorpay/oauth/connect
 */
export async function GET(req: NextRequest) {
  console.log(
    '============================================================'
  )

  console.log(
    '[razorpay/oauth/connect] REQUEST RECEIVED'
  )

  console.log(
    '[razorpay/oauth/connect] URL:',
    req.url
  )

  console.log(
    '[razorpay/oauth/connect] TIME:',
    new Date().toISOString()
  )

  try {
    const safeOrigin = getSafeOrigin()

    console.log(
      '[razorpay/oauth/connect] Safe origin:',
      safeOrigin
    )

    /**
     * ---------------------------------------------------------
     * ENVIRONMENT DEBUG
     * ---------------------------------------------------------
     */

    console.log(
      '[razorpay/oauth/connect] Environment check:',
      {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,

        hasSupabaseAnonKey:
          !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,

        hasAppOrigin:
          !!process.env.APP_ORIGIN,

        hasRazorpayClientId:
          !!process.env.RAZORPAY_OAUTH_CLIENT_ID,

        hasRazorpayClientSecret:
          !!process.env.RAZORPAY_OAUTH_CLIENT_SECRET,

        hasRazorpayRedirectUri:
          !!process.env.RAZORPAY_OAUTH_REDIRECT_URI,

        lambdaVersion:
          process.env.AWS_LAMBDA_FUNCTION_VERSION ??
          'unknown',

        lambdaFunction:
          process.env.AWS_LAMBDA_FUNCTION_NAME ??
          'unknown',
      }
    )

    /**
     * ---------------------------------------------------------
     * CANONICAL HOST CHECK
     * ---------------------------------------------------------
     */

    const currentHost = req.headers.get('host')

    const canonicalHost = new URL(safeOrigin).host

    console.log(
      '[razorpay/oauth/connect] Host information:',
      {
        currentHost,
        canonicalHost,
      }
    )

    /**
     * If user accesses:
     *
     * https://counsellorsofindia.com/...
     *
     * instead of:
     *
     * https://www.counsellorsofindia.com/...
     *
     * redirect them to the canonical domain first.
     */

    if (
      currentHost &&
      currentHost !== canonicalHost
    ) {
      console.warn(
        '[razorpay/oauth/connect] NON-CANONICAL HOST'
      )

      console.warn(
        '[razorpay/oauth/connect] Redirecting to:',
        safeOrigin
      )

      const canonicalUrl = new URL(
        req.nextUrl.pathname +
          req.nextUrl.search,
        safeOrigin
      )

      const redirectResponse =
        NextResponse.redirect(canonicalUrl)

      redirectResponse.headers.set(
        'Cache-Control',
        'no-store, no-cache, must-revalidate, proxy-revalidate'
      )

      redirectResponse.headers.set(
        'Pragma',
        'no-cache'
      )

      redirectResponse.headers.set(
        'Expires',
        '0'
      )

      return redirectResponse
    }

    /**
     * ---------------------------------------------------------
     * AUTHENTICATION CHECK
     * ---------------------------------------------------------
     */

    console.log(
      '[razorpay/oauth/connect] Checking authenticated user...'
    )

    const user = await getUser()

    if (!user) {
      console.warn(
        '[razorpay/oauth/connect] No authenticated user'
      )

      const loginUrl = new URL(
        '/login',
        safeOrigin
      )

      loginUrl.searchParams.set(
        'redirect',
        '/dashboard/payments'
      )

      console.log(
        '[razorpay/oauth/connect] Redirecting to login:',
        loginUrl.toString()
      )

      const loginResponse =
        NextResponse.redirect(loginUrl)

      loginResponse.headers.set(
        'Cache-Control',
        'no-store, no-cache, must-revalidate, proxy-revalidate'
      )

      return loginResponse
    }

    console.log(
      '[razorpay/oauth/connect] Authenticated user:',
      {
        id: user.id,
        email: user.email ?? 'no-email',
      }
    )

    /**
     * ---------------------------------------------------------
     * RAZORPAY ENVIRONMENT CHECK
     * ---------------------------------------------------------
     */

    if (!process.env.RAZORPAY_OAUTH_CLIENT_ID) {
      console.error(
        '[razorpay/oauth/connect] ❌ RAZORPAY_OAUTH_CLIENT_ID IS MISSING'
      )

      const errorResponse = NextResponse.json(
        {
          error:
            'RAZORPAY_OAUTH_CLIENT_ID is not configured.',
          debug: {
            hasClientId:
              !!process.env.RAZORPAY_OAUTH_CLIENT_ID,

            hasClientSecret:
              !!process.env.RAZORPAY_OAUTH_CLIENT_SECRET,

            hasRedirectUri:
              !!process.env.RAZORPAY_OAUTH_REDIRECT_URI,
          },
        },
        {
          status: 500,
        }
      )

      errorResponse.headers.set(
        'Cache-Control',
        'no-store, no-cache, must-revalidate, proxy-revalidate'
      )

      return errorResponse
    }

    if (!process.env.RAZORPAY_OAUTH_CLIENT_SECRET) {
      console.error(
        '[razorpay/oauth/connect] ❌ RAZORPAY_OAUTH_CLIENT_SECRET IS MISSING'
      )

      const errorResponse = NextResponse.json(
        {
          error:
            'RAZORPAY_OAUTH_CLIENT_SECRET is not configured.',
        },
        {
          status: 500,
        }
      )

      errorResponse.headers.set(
        'Cache-Control',
        'no-store, no-cache, must-revalidate, proxy-revalidate'
      )

      return errorResponse
    }

    /**
     * ---------------------------------------------------------
     * GENERATE CSRF STATE
     * ---------------------------------------------------------
     */

    const state = crypto
      .randomBytes(24)
      .toString('hex')

    console.log(
      '[razorpay/oauth/connect] OAuth state generated'
    )

    /**
     * ---------------------------------------------------------
     * BUILD RAZORPAY AUTHORIZATION URL
     * ---------------------------------------------------------
     */

    console.log(
      '[razorpay/oauth/connect] Building Razorpay authorization URL...'
    )

    let authorizationUrl: string

    try {
      authorizationUrl =
        buildAuthorizationUrl(state)
    } catch (error) {
      console.error(
        '[razorpay/oauth/connect] ❌ buildAuthorizationUrl FAILED:',
        error
      )

      const message =
        error instanceof Error
          ? error.message
          : 'Failed to build Razorpay authorization URL'

      const errorResponse = NextResponse.json(
        {
          error: message,
        },
        {
          status: 500,
        }
      )

      errorResponse.headers.set(
        'Cache-Control',
        'no-store, no-cache, must-revalidate, proxy-revalidate'
      )

      return errorResponse
    }

    console.log(
      '[razorpay/oauth/connect] Authorization URL generated'
    )

    /**
     * NEVER print the complete authorization URL in production
     * because it contains the OAuth state.
     *
     * We only log the destination hostname/path.
     */

    try {
      const parsedAuthorizationUrl =
        new URL(authorizationUrl)

      console.log(
        '[razorpay/oauth/connect] Razorpay OAuth destination:',
        {
          host: parsedAuthorizationUrl.host,
          pathname: parsedAuthorizationUrl.pathname,
        }
      )
    } catch {
      console.warn(
        '[razorpay/oauth/connect] Authorization URL could not be parsed for logging'
      )
    }

    /**
     * ---------------------------------------------------------
     * CREATE REDIRECT RESPONSE
     * ---------------------------------------------------------
     */

    const response =
      NextResponse.redirect(
        authorizationUrl
      )

    /**
     * Prevent CloudFront / Amplify from caching
     * the OAuth response.
     */

    response.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate'
    )

    response.headers.set(
      'Pragma',
      'no-cache'
    )

    response.headers.set(
      'Expires',
      '0'
    )

    /**
     * ---------------------------------------------------------
     * SAVE STATE COOKIE
     * ---------------------------------------------------------
     */

    response.cookies.set(
      STATE_COOKIE,
      state,
      {
        httpOnly: true,

        secure: true,

        sameSite: 'lax',

        maxAge: STATE_TTL_SECONDS,

        path: '/api/razorpay/oauth',
      }
    )

    console.log(
      '[razorpay/oauth/connect] OAuth state cookie set'
    )

    console.log(
      '[razorpay/oauth/connect] ✅ REDIRECTING TO RAZORPAY'
    )

    console.log(
      '============================================================'
    )

    return response

  } catch (error) {
    /**
     * ---------------------------------------------------------
     * GLOBAL ERROR HANDLER
     * ---------------------------------------------------------
     */

    console.error(
      '[razorpay/oauth/connect] ❌ UNHANDLED ERROR:',
      error
    )

    const message =
      error instanceof Error
        ? error.message
        : 'Unknown error'

    const errorResponse =
      NextResponse.json(
        {
          error: message,
        },
        {
          status: 500,
        }
      )

    errorResponse.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate'
    )

    errorResponse.headers.set(
      'Pragma',
      'no-cache'
    )

    errorResponse.headers.set(
      'Expires',
      '0'
    )

    return errorResponse
  }
}
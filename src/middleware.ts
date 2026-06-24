import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: always call getUser() — this refreshes the session cookie.
  // Without this, server components on /clinical/* get a stale/empty session
  // and RLS blocks every DB query → patient not found → 404.
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Not logged in → redirect to login for all protected routes
  if (!user && (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/clinical') ||
    pathname.startsWith('/onboarding')
  )) {
    return NextResponse.redirect(new URL('/login', request.url))
  }


  return supabaseResponse
}

export const config = {
  // Match every protected route so the session cookie is always refreshed
  matcher: [
    '/dashboard/:path*',
    '/clinical/:path*',
    '/onboarding/:path*',
    '/login',
    '/signup',
  ],
}


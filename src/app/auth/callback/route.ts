import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const code = searchParams.get('code')

  // Always use the public app URL for redirects — never request.url's origin
  // because on Azure App Service the internal hostname (5056c734d3b5:8080)
  // leaks into server-side URLs instead of the real public domain.
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXTAUTH_URL ??
    'https://www.counsellorsofindia.com'

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
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )

  // Path 1: token_hash flow (email template uses {{ .TokenHash }})
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type: type as any })

    if (!error) {
      return NextResponse.redirect(`${appUrl}/reset-password`)
    }

    console.error('[auth/callback] verifyOtp error:', error.message)
    return NextResponse.redirect(`${appUrl}/reset-password?error=invalid_link`)
  }

  // Path 2: PKCE code flow (fallback)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(`${appUrl}/reset-password`)
    }

    console.error('[auth/callback] exchangeCodeForSession error:', error.message)
    return NextResponse.redirect(`${appUrl}/reset-password?error=invalid_link`)
  }

  // No code or token_hash — bad URL
  return NextResponse.redirect(`${appUrl}/forgot-password`)
}

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')

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
  // This does NOT require a code_verifier cookie — works across devices/clients
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type: type as any })

    if (!error) {
      return NextResponse.redirect(new URL('/reset-password', origin))
    }

    console.error('[auth/callback] verifyOtp error:', error.message)
    return NextResponse.redirect(new URL('/reset-password?error=invalid_link', origin))
  }

  // Path 2: PKCE code flow (fallback)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(new URL('/reset-password', origin))
    }

    console.error('[auth/callback] exchangeCodeForSession error:', error.message)
    return NextResponse.redirect(new URL('/reset-password?error=invalid_link', origin))
  }

  // No code or token_hash — bad URL
  return NextResponse.redirect(new URL('/forgot-password', origin))
}

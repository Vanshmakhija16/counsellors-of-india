import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getCurrentTenant } from '@/lib/tenants/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const code = searchParams.get('code')
  // Set by SignupPageClient's emailRedirectTo — distinguishes "this link
  // was for signup" from the default (password-reset) behaviour below,
  // without changing anything about the existing reset-password flow.
  const next = searchParams.get('next')

  const tenant = await getCurrentTenant()

  // Always use the public app URL for redirects — never request.url's origin
  // because on Azure App Service the internal hostname (5056c734d3b5:8080)
  // leaks into server-side URLs instead of the real public domain.
  // Local/dev hosts (localhost, *.local) are the one exception: those are
  // never behind the Azure proxy, so it's safe (and necessary, since no
  // single env var can hold every tenant's local dev domain) to build the
  // redirect straight from the incoming request's own host.
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? ''
  const isLocalHost = host.includes('localhost') || host.endsWith('.local') || host.includes('.local:')
  const appUrl = isLocalHost
    ? `http://${host}`
    : process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? tenant.siteUrl

  // Tenant-aware client — resolves to this request's own Supabase project
  // (e.g. the US database on the America portal), not always India's.
  const supabase = await createServerSupabaseClient()

  // Shared helper: once we have a verified session, finish the signup the
  // same way SignupPageClient's finishSignup() does for the OTP-entry path
  // — create the therapists row, then continue to /pricing. The row's
  // details are pulled from signup_attempts (logged the moment the person
  // hit "send code", before this email even went out) since this
  // server-side link click never had access to the form's local state.
  async function finishSignupFromLink(userId: string, email: string | undefined) {
    if (!email) return NextResponse.redirect(`${appUrl}/signup?error=missing_email`)

    const { data: attempt } = await supabase
      .from('signup_attempts')
      .select('full_name, username, phone')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const fallbackUsername =
      email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + userId.slice(0, 6)

    const { error: upsertErr } = await supabase.from('therapists').upsert({
      id: userId,
      full_name: attempt?.full_name ?? 'New Therapist',
      email,
      username: attempt?.username ?? fallbackUsername,
      phone: attempt?.phone ?? null,
      plan: 'none',
      is_active: true,
      is_profile_complete: false,
    })

    if (upsertErr) {
      console.error('[auth/callback] therapist upsert error:', upsertErr.message)
      // Session is still valid even if this upsert failed — send them
      // onward rather than dead-ending; the dashboard/pricing page can
      // recover a missing row on next load rather than stranding the user.
    }

    return NextResponse.redirect(`${appUrl}/pricing`)
  }

  // Path 1: token_hash flow (email template uses {{ .TokenHash }})
  if (token_hash && type) {
    const { data, error } = await supabase.auth.verifyOtp({ token_hash, type: type as any })

    if (error) {
      console.error('[auth/callback] verifyOtp error:', error.message)
      const errDest = next === 'signup' ? '/signup' : '/reset-password'
      return NextResponse.redirect(`${appUrl}${errDest}?error=invalid_link`)
    }

    if (next === 'signup' && data.user) {
      return finishSignupFromLink(data.user.id, data.user.email)
    }
    return NextResponse.redirect(`${appUrl}/reset-password`)
  }

  // Path 2: PKCE code flow — this is what Supabase's default "Confirm
  // signup" email link actually sends (?code=...), which is why signup
  // needs handling here too, not just password-reset.
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('[auth/callback] exchangeCodeForSession error:', error.message)
      const errDest = next === 'signup' ? '/signup' : '/reset-password'
      return NextResponse.redirect(`${appUrl}${errDest}?error=invalid_link`)
    }

    if (next === 'signup' && data.user) {
      return finishSignupFromLink(data.user.id, data.user.email)
    }
    return NextResponse.redirect(`${appUrl}/reset-password`)
  }

  // No code or token_hash — bad URL
  return NextResponse.redirect(`${appUrl}/forgot-password`)
}

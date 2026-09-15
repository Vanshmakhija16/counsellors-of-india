'use client'
export const dynamic = 'force-dynamic'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSupabaseClient } from '@/components/providers/TenantSupabaseProvider'
import AuthLayout from '@/components/layout/AuthLayout'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'

export interface LoginPageClientProps {
  brandName: string
  tagline: string
  /** Path to the tenant's real logo image (e.g. '/coi.png'), if one exists.
   *  Undefined for tenants without a logo asset yet — AuthLayout falls
   *  back to a monogram/wordmark in that case. */
  logoPath?: string
  /** Tenant accent colors threaded through to AuthLayout as CSS variables
   *  (--auth-accent / --auth-accent-dark) — same pattern as
   *  SignupPageClient. This form's own links/button reference those
   *  variables instead of hardcoding saffron, so passing a different
   *  accent here re-themes the whole login page. Defaults to saffron. */
  accentColor?: string
  accentColorDark?: string
  /** Nudges the entire left-column content down a bit — currently used
   *  for the American portal only. Passed through to AuthLayout's
   *  contentClassName. */
  contentClassName?: string
  /** Classes for the logo+title+topLink header block — controls its own
   *  vertical position AND the gap before the form below it (include both
   *  a margin-top and margin-bottom utility). Defaults to the original
   *  'mt-8 mb-1' spacing; overridden per-tenant from page.tsx. */
  headerClassName?: string
  /** Right brand panel background gradient — tenant override. */
  panelBackground?: string
  /** Right panel link hover color — tenant override. */
  panelAccent?: string
}

export default function LoginPageClient(props: LoginPageClientProps) {
  const headerClassName = props.headerClassName ?? 'mt-8 mb-1'
  return (
    <Suspense fallback={<AuthLayout title="Welcome back" brandName={props.brandName} tagline={props.tagline} logoPath={props.logoPath} accentColor={props.accentColor} accentColorDark={props.accentColorDark} panelBackground={props.panelBackground} panelAccent={props.panelAccent} headerClassName={headerClassName} contentClassName={props.contentClassName}><div className="bg-white rounded-2xl border border-[#ece5d9] shadow-sm p-8"><div className="h-64" /></div></AuthLayout>}>
      <LoginForm {...props} headerClassName={headerClassName} />
    </Suspense>
  )
}

function LoginForm({ brandName, tagline, logoPath, accentColor, accentColorDark, contentClassName, headerClassName, panelBackground, panelAccent }: LoginPageClientProps) {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const supabase     = useSupabaseClient()

  // Where to go after login — defaults to /dashboard
  // e.g. /login?redirect=/pricing?plan=growth
  const redirectTo = searchParams.get('redirect') ?? '/dashboard'

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
try {
  const { error: loginError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (loginError) {
    throw loginError
  }

  router.push(redirectTo)
} catch (err: any) {
  setError(err.message || 'Unable to sign in')
} finally {
  setLoading(false)
}
  }

  return (
    <AuthLayout
      title="Welcome back"
      brandName={brandName}
      tagline={tagline}
      logoPath={logoPath}
      accentColor={accentColor}
      accentColorDark={accentColorDark}
      headerClassName={headerClassName}
      contentClassName={contentClassName}
      panelBackground={panelBackground}
      panelAccent={panelAccent}
      topLink={
        <span>
          Don&apos;t have an account?{' '}
          <Link
            href={`/signup${redirectTo !== '/dashboard' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
            className="font-semibold hover:underline"
            style={{ color: 'var(--auth-accent-dark)' }}
          >
            Create account
          </Link>
        </span>
      }
    >



      
      <div className="bg-white rounded-2xl border border-[#ece5d9] shadow-[0_25px_70px_-25px_rgba(31,28,24,0.35)] p-7 sm:p-8">
        <form onSubmit={handleLogin} className="space-y-5">

          <Input
            label="Email Address"
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email here..."
            className="placeholder:text-sm"
          />

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-500">Password</label>
              <Link
                href={`/forgot-password${email ? `?email=${encodeURIComponent(email)}` : ''}`}
                className="text-xs hover:underline"
                style={{ color: 'var(--auth-accent-dark)' }}
              >
                Forgot password?
              </Link>
            </div>
<div className="relative">
  <Input
    type={showPassword ? 'text' : 'password'}
    required
    value={password}
    onChange={e => setPassword(e.target.value)}
    placeholder="Your password"
  />

    <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
    aria-label={showPassword ? 'Hide password' : 'Show password'}
  >
    {showPassword ? (
      <EyeOff size={18} />
    ) : (
      <Eye size={18} />
    )}
  </button>


</div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>
          )}

          <div className="flex items-center gap-3 mt-1">
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Go back"
              className="h-11 w-11 flex items-center justify-center rounded-xl border border-[#e8e4df] text-[#3D3A33] hover:bg-[#FAF8F5] hover:border-[#d8d2c6] transition-colors shrink-0"
            >
              <ArrowLeft size={18} strokeWidth={2.2} />
            </button>

            <Button
              type="submit"
              fullWidth
              loading={loading}
              className="bg-[var(--auth-accent-dark)]! hover:bg-[color-mix(in_srgb,var(--auth-accent-dark)_82%,black)]! text-white! h-11! rounded-xl! shadow-lg"
              style={{ ['--tw-shadow-color' as string]: 'var(--auth-accent-dark)' }}
            >
              Sign in
            </Button>
          </div>
        </form>
      </div>
    </AuthLayout>
  )
}

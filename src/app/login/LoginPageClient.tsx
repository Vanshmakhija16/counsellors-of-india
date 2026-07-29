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
}

export default function LoginPageClient(props: LoginPageClientProps) {
  return (
    <Suspense fallback={<AuthLayout title="Welcome back" brandName={props.brandName} tagline={props.tagline} logoPath={props.logoPath}><div className="bg-white rounded-2xl border border-[#ece5d9] shadow-sm p-8"><div className="h-64" /></div></AuthLayout>}>
      <LoginForm {...props} />
    </Suspense>
  )
}

function LoginForm({ brandName, tagline, logoPath }: LoginPageClientProps) {
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
      topLink={
        <span>
          Don&apos;t have an account?{' '}
          <Link
            href={`/signup${redirectTo !== '/dashboard' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
            className="text-[#E07A12] font-semibold hover:underline"
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
            placeholder="priya@example.com"
          />

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-500">Password</label>
              <Link
                href={`/forgot-password${email ? `?email=${encodeURIComponent(email)}` : ''}`}
                className="text-xs text-[#E07A12] hover:underline"
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
              className="bg-[#FF9933]! hover:bg-[#E07A12]! text-white! h-11! rounded-xl! shadow-lg shadow-[#FF9933]/25"
            >
              Sign in
            </Button>
          </div>
        </form>
      </div>
    </AuthLayout>
  )
}

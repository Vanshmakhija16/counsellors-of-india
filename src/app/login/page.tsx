'use client'
export const dynamic = 'force-dynamic'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import AuthLayout from '@/components/layout/AuthLayout'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthLayout title="Welcome back"><div className="bg-white rounded-2xl border border-[#ece5d9] shadow-sm p-8"><div className="h-64" /></div></AuthLayout>}>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const supabase     = createClient()

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
    <AuthLayout title="Welcome back">



      
      <div className="bg-white rounded-2xl border border-[#ece5d9] shadow-[0_20px_60px_-30px_rgba(31,28,24,0.25)] p-7 sm:p-8">
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

<Button
  type="submit"
  fullWidth
  loading={loading}
  className="bg-[#FF9933]! hover:bg-[#E07A12]! text-white! h-12! rounded-xl! shadow-lg shadow-[#FF9933]/25"
>
  Sign in
</Button>

<button
  type="button"
  onClick={() => router.back()}
  className="
    w-full
    text-center
    text-sm
    text-[#E07A12]
    hover:text-[#C96B10]
    hover:underline
    transition-colors
  "
>
  ← Go Back
</button>
        </form>
      </div>

      <p className="text-center text-sm text-[#6E685F] mt-6">
        Don't have an account?{' '}
        <Link
          href={`/signup${redirectTo !== '/dashboard' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
          className="text-[#E07A12] font-medium hover:underline"
        >
          Create account
        </Link>
      </p>
    </AuthLayout>
  )
}

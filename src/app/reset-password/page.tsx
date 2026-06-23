'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import AuthLayout from '@/components/layout/AuthLayout'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { createClient } from '@/lib/supabase'
import { Eye, EyeOff, Lock } from 'lucide-react'
import Link from 'next/link'

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <AuthLayout title="Reset Password">
        <div className="bg-white rounded-3xl border border-[#ece5d9] shadow-sm p-8">
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div className="w-6 h-6 border-2 border-[#FF9933] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[#6b7280]">Loading…</p>
          </div>
        </div>
      </AuthLayout>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}

function ResetPasswordForm() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (searchParams.get('error') === 'invalid_link') {
      setError('This reset link is invalid or has already been used. Please request a new one.')
      setChecking(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionReady(true)
      } else {
        setError('This reset link is invalid or has expired. Please request a new one.')
      }
      setChecking(false)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    setError('')

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
    } else {
      router.push('/login?reset=success')
    }

    setLoading(false)
  }

  return (
    <AuthLayout title="Reset Password">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-3xl border border-[#ece5d9] shadow-[0_20px_60px_-30px_rgba(31,28,24,0.25)] p-6 sm:p-8">

          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-[#FFF3E6] flex items-center justify-center mb-4">
              <Lock size={24} className="text-[#FF9933]" />
            </div>
            <h2 className="text-xl font-semibold text-[#1c1c1e]">
              Create a New Password
            </h2>
            <p className="text-sm text-[#6b7280] mt-2 max-w-sm">
              Your new password must be different from your previous password.
            </p>
          </div>

          {checking && (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <div className="w-6 h-6 border-2 border-[#FF9933] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-[#6b7280]">Verifying your reset link…</p>
            </div>
          )}

          {!checking && error && !sessionReady && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
              <Link
                href="/forgot-password"
                className="block text-center text-sm text-[#E07A12] hover:underline"
              >
                Request a new reset link
              </Link>
            </div>
          )}

          {!checking && sessionReady && (
            <form onSubmit={handleReset} className="space-y-5">

              <div className="relative">
                <Input
                  label="New Password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  placeholder="Enter your new password"
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-[38px] text-gray-400 hover:text-gray-700 transition"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="relative">
                <Input
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  placeholder="Re-enter your password"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-[38px] text-gray-400 hover:text-gray-700 transition"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="rounded-xl bg-[#faf7f2] border border-[#ece5d9] px-4 py-3">
                <p className="text-xs text-[#6b7280]">
                  Password must be at least 6 characters.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                fullWidth
                loading={loading}
                className="bg-[#FF9933]! hover:bg-[#E07A12]! text-white! h-12! rounded-xl!"
              >
                Update Password
              </Button>

              <Link
                href="/login"
                className="block text-center text-sm text-[#E07A12] hover:underline"
              >
                Back to Login
              </Link>

            </form>
          )}

        </div>
      </div>
    </AuthLayout>
  )
}

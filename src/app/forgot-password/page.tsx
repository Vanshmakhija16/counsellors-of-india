'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import AuthLayout from '@/components/layout/AuthLayout'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { createClient } from '@/lib/supabase'

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<AuthLayout title="Forgot Password"><div className="bg-white rounded-2xl border border-[#ece5d9] shadow-sm p-8"><div className="h-48" /></div></AuthLayout>}>
      <ForgotPasswordForm />
    </Suspense>
  )
}

function ForgotPasswordForm() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Carry the email over from the login form (passed via ?email=).
  const [email, setEmail] = useState(searchParams.get('email') ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    setLoading(true)
    setError('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // Use the configured live URL in production; fall back to the current
      // origin locally so the reset link always points to the right site.
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin}/reset-password`,
    })

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
    }

    setLoading(false)
  }

  return (
    <AuthLayout title="Forgot Password">
      <div className="bg-white rounded-2xl border border-[#ece5d9] shadow-[0_20px_60px_-30px_rgba(31,28,24,0.25)] p-6 sm:p-8">

        {success ? (
          <div className="text-center space-y-4">
            <p className="text-green-600 font-medium">
              Password reset link sent successfully.
            </p>

            <p className="text-sm text-gray-500">
              Please check your email inbox.
            </p>

            <Button
              fullWidth
              onClick={() => router.push('/login')}
                            className="bg-[#FF9933]! hover:bg-[#E07A12]! text-white!"

            >
              Back to Login
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">

            <Input
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="priya@example.com"
            />

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
                {error}
              </p>
            )}

            <Button
              type="submit"
              fullWidth
              loading={loading}
              className="bg-[#FF9933]! hover:bg-[#E07A12]! text-white!"
            >
              Send Reset Link
            </Button>

          </form>
        )}
      </div>

      <p className="text-center text-sm text-[#6E685F] mt-6">
        Remember your password?{' '}
        <Link
          href="/login"
          className="text-[#E07A12] font-medium hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
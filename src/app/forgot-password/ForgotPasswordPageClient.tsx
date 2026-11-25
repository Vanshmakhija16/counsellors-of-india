'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSupabaseClient } from '@/components/providers/TenantSupabaseProvider'
import AuthLayout from '@/components/layout/AuthLayout'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export interface ForgotPasswordPageClientProps {
  brandName: string
  tagline: string
  logoPath?: string
  accentColor?: string
  accentColorDark?: string
  panelBackground?: string
  panelAccent?: string
  contentClassName?: string
  headerClassName?: string
}

export default function ForgotPasswordPageClient(props: ForgotPasswordPageClientProps) {
  return (
    <Suspense
      fallback={
        <AuthLayout title="Forgot Password" {...props}>
          <div className="bg-white rounded-2xl border border-[#ece5d9] shadow-sm p-8">
            <div className="h-48" />
          </div>
        </AuthLayout>
      }
    >
      <ForgotPasswordForm {...props} />
    </Suspense>
  )
}

function ForgotPasswordForm(props: ForgotPasswordPageClientProps) {
  const supabase = useSupabaseClient()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [email, setEmail] = useState(searchParams.get('email') ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [noAccount, setNoAccount] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    setLoading(true)
    setError('')
    setNoAccount(false)

    const checkRes = await fetch('/api/auth/check-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    const checkData = await checkRes.json()

    if (!checkRes.ok) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
      return
    }

    if (!checkData.exists) {
      setNoAccount(true)
      setLoading(false)
      return
    }

    const redirectTo = `${window.location.origin}/auth/callback`
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    })

    if (resetError) {
      setError(resetError.message)
    } else {
      setSuccess(true)
    }

    setLoading(false)
  }

  return (
    <AuthLayout title="Forgot Password" {...props}>
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
              className="bg-[var(--auth-accent)]! hover:bg-[var(--auth-accent-dark)]! text-white!"
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
              onChange={(e) => {
                setEmail(e.target.value)
                setNoAccount(false)
                setError('')
              }}
              placeholder="priya@example.com"
            />

            {noAccount && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 space-y-1">
                <p className="text-sm text-amber-800 font-medium">
                  No account found with this email.
                </p>
                <p className="text-sm text-amber-700">
                  Would you like to{' '}
                  <Link
                    href={`/signup?email=${encodeURIComponent(email)}`}
                    className="font-semibold underline underline-offset-2 hover:text-amber-900"
                  >
                    create an account
                  </Link>
                  {' '}instead?
                </p>
              </div>
            )}

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
                {error}
              </p>
            )}

            <Button
              type="submit"
              fullWidth
              loading={loading}
              className="bg-[var(--auth-accent)]! hover:bg-[var(--auth-accent-dark)]! text-white!"
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
          className="font-medium hover:underline"
          style={{ color: 'var(--auth-accent-dark)' }}
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}

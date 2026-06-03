'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AuthLayout from '@/components/layout/AuthLayout'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { createClient } from '@/lib/supabase'
import { Eye, EyeOff, Lock } from 'lucide-react' 
import Link from 'next/link'
export default function ResetPasswordPage() {
  const supabase = createClient()
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    setError('')

    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      router.push('/login')
    }

    setLoading(false)
  }

  return (
<AuthLayout title="Reset Password">
  <div className="w-full max-w-md mx-auto">

    <div className="bg-white rounded-3xl border border-[#ece5d9] shadow-[0_20px_60px_-30px_rgba(31,28,24,0.25)] p-6 sm:p-8">

      {/* Header */}
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

      <form onSubmit={handleReset} className="space-y-5">

        {/* New Password */}
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
            {showPassword ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        </div>

        {/* Confirm Password */}
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
            onClick={() =>
              setShowConfirmPassword(!showConfirmPassword)
            }
            className="absolute right-4 top-[38px] text-gray-400 hover:text-gray-700 transition"
          >
            {showConfirmPassword ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        </div>
{/* 
        <div className="rounded-xl bg-[#faf7f2] border border-[#ece5d9] px-4 py-3">
          <p className="text-xs text-[#6b7280]">
            Password should contain at least 6 characters.
          </p>
        </div> */}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-sm text-red-600">
              {error}
            </p>
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
    </div>
  </div>
</AuthLayout>
  )
}
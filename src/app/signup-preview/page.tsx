/* Public, static preview of the real /signup screen — used inside the
   "How it works" Step 1 iframe on the landing page.

   The actual /signup route is auth-guarded by middleware: a logged-in
   visitor gets redirected to /dashboard, so it can't be embedded. This
   route renders the IDENTICAL UI (same AuthLayout, Input, Button and form
   classes) but is static, public, and not matched by middleware — so it
   always shows the sign-up page exactly as it is. Keep in sync with
   src/app/signup/page.tsx if that form changes. */

import Link from 'next/link'
import AuthLayout from '@/components/layout/AuthLayout'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { User, CheckCircle } from 'lucide-react'

export const metadata = { robots: { index: false, follow: false } }

export default function SignupPreviewPage() {
  return (
    <AuthLayout title="Create your free account">
      <div className="bg-white rounded-2xl border border-[#ece5d9] shadow-[0_20px_60px_-30px_rgba(31,28,24,0.25)] p-7 sm:p-8">
        <form className="space-y-5">

          {/* Photo upload */}
          <div className="flex flex-col items-center gap-2 pb-2">
            <div className="cursor-pointer group">
              <div className="w-20 h-20 rounded-full bg-[#FBF3E6] border-2 border-[#F3D9B0] overflow-hidden flex items-center justify-center relative">
                <User size={28} className="text-[#E0A85C]" />
              </div>
            </div>
            <p className="text-xs text-[#6b7280]">Upload profile photo</p>
          </div>

          {/* Prefix + Name */}
          <div>
            <label className="block text-sm font-medium text-[#6b7280] mb-1.5">Full Name</label>
            <div className="flex gap-2">
              <select
                defaultValue="Dr."
                className="h-11 px-3 rounded-lg border border-[#e8e4df] text-[#1c1c1e] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FF9933]/50 shrink-0"
              >
                <option>Dr.</option>
                <option>Prof.</option>
                <option>Mr.</option>
                <option>Ms.</option>
                <option>Mrs.</option>
                <option>None</option>
              </select>
              <input
                type="text" defaultValue="Priya Sharma"
                placeholder="Priya Sharma"
                className="flex-1 h-11 px-4 rounded-lg border border-[#e8e4df] text-[#1c1c1e] placeholder-[#6b7280] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF9933]/50 focus:border-transparent"
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-[#6b7280] mb-1.5">Your profile URL</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex items-center px-3 py-2 sm:py-0 bg-[#f2f0ed] border border-[#e8e4df] rounded-lg text-sm text-[#6b7280] shrink-0 whitespace-nowrap overflow-hidden text-ellipsis">
                counsellorsofindia.com/
              </div>
              <div className="relative flex-1 min-w-0">
                <input
                  type="text" defaultValue="priya-sharma"
                  placeholder="yourname"
                  className="w-full h-11 px-4 pr-10 rounded-lg border border-green-300 text-sm text-[#1c1c1e] placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#FF9933]/50 focus:border-transparent"
                />
                <div className="absolute right-3 top-3">
                  <CheckCircle size={16} className="text-green-500" />
                </div>
              </div>
            </div>
            <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">
              <CheckCircle size={11} /> Available!
            </p>
            <p className="text-xs text-[#6b7280] mt-1.5">Only lowercase letters, numbers, and hyphens</p>
          </div>

          <Input
            label="Email Address" type="email" defaultValue="priya@example.com" placeholder="priya@example.com"
          />
          <Input
            label="Password" type="password" defaultValue="123456" placeholder="Minimum 6 characters"
          />

          <Button
            type="submit"
            fullWidth
            className="bg-[#FF9933]! hover:bg-[#E07A12]! text-white! h-12! rounded-xl! shadow-lg shadow-[#FF9933]/25"
          >
            Create account
          </Button>
        </form>
      </div>

      <p className="text-center text-sm text-[#6E685F] mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-[#E07A12] font-medium hover:underline">Sign in</Link>
      </p>
    </AuthLayout>
  )
}

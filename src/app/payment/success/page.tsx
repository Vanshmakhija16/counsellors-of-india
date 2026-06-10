'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

const REDIRECT_AFTER_MS = 4000

function PaymentSuccess() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan') ?? undefined
  const planLabel = plan ? plan.charAt(0).toUpperCase() + plan.slice(1) : 'your'

  const [seconds, setSeconds] = useState(Math.round(REDIRECT_AFTER_MS / 1000))

  // Show the confirmation briefly, then send the user to their dashboard.
  useEffect(() => {
    const redirect = setTimeout(() => router.push('/dashboard'), REDIRECT_AFTER_MS)
    const tick = setInterval(() => setSeconds(s => (s > 0 ? s - 1 : 0)), 1000)
    return () => { clearTimeout(redirect); clearInterval(tick) }
  }, [router])

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F6F3EE] px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-[#e8e1d6] bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#f5f5e8] text-[#ff9933]">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-[#1c1c1e]">Payment successful</h1>
        <p className="mt-3 text-sm leading-relaxed text-[#6b6056]">
          You&apos;re now on the <span className="font-semibold text-[#1c1c1e]">{planLabel} plan</span>.
        </p>
        <p className="mt-4 text-xs text-[#9ca3af]">
          Redirecting to your dashboard in {seconds}s&hellip;
        </p>
        <Link
          href="/dashboard"
          className="mt-7 inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#FF9933] px-6 text-sm font-semibold text-white transition hover:bg-[#f08a1f]"
        >
          Go to dashboard now
        </Link>
      </div>
    </main>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={null}>
      <PaymentSuccess />
    </Suspense>
  )
}

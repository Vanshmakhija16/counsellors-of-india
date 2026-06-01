'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import Button from '@/components/ui/Button'
import { Check, Lock, Zap, ArrowRight, ShieldCheck, Crown, X } from 'lucide-react'
import { useRazorpay } from '@/lib/useRazorpay'

const PLAN_PRICE: Record<string, number> = { starter: 1200, growth: 2500, clinic: 100000 }
const PLAN_RANK:  Record<string, number> = { starter: 1,    growth: 2,    clinic: 3      }

const plans = [
  {
    id:        'starter',
    name:      'Starter',
    price:     '₹1,200',
    period:    'per month',
    tagline:   'Everything to get your practice online',
    highlight: false,
    badge:     null as string | null,
    features: [
      'All 5 premium templates',
      'Public therapist profile page',
      'Shareable booking link',
      'Unlimited bookings',
      'Email confirmations',
      'Online payment links',
    ],
    locked:  [] as string[],
    cta:     'Choose Starter',
  },
  {
    id:        'growth',
    name:      'Growth',
    price:     '₹2,500',
    period:    'per month',
    tagline:   'For active, growing practices',
    highlight: true,
    badge:     'Most Popular',
    features: [
      'Everything in Starter',
      'Client profiles & session notes',
      'Availability management',
      'Session history & records',
      'Priority email support',
    ],
    locked:  [] as string[],
    cta:     'Choose Growth',
  },
  {
    id:        'clinic',
    name:      'Clinic',
    price:     '₹1,00,000',
    period:    'per month',
    tagline:   'For clinics & multi-therapist teams',
    highlight: false,
    badge:     'Enterprise',
    features: [
      'Everything in Growth',
      'Multiple therapist accounts',
      'Export session notes (PDF)',
      'Custom domain support',
      'Advanced analytics',
      'Dedicated priority support',
    ],
    locked:  [] as string[],
    cta:     'Choose Clinic',
  },
]

export default function PricingPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#F6F3EE] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#FF9933] border-t-transparent rounded-full animate-spin" />
      </main>
    }>
      <PricingPageInner />
    </Suspense>
  )
}

function PricingPageInner() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const supabase     = createClient()
  const { openRazorpay, loading: rzpLoading } = useRazorpay()

  const [currentPlan,   setCurrentPlan]   = useState<string | null>(null)
  const [highestPlan,   setHighestPlan]   = useState<string>('free') // highest plan ever paid for
  const [userId,        setUserId]        = useState<string | null>(null)
  const [userEmail,     setUserEmail]     = useState<string>('')
  const [selecting,     setSelecting]     = useState<string | null>(null)
  const [errorMsg,      setErrorMsg]      = useState<string | null>(null)
  const [successMsg,    setSuccessMsg]    = useState<string | null>(null)
  const [pageLoading,   setPageLoading]   = useState(true)

  const redirectAfter = searchParams.get('redirect') ?? '/dashboard'

  // Close / back: return to wherever the user came from. Prefer the explicit
  // ?redirect target; otherwise use browser history; otherwise the dashboard.
  function goBack() {
    const from = searchParams.get('redirect')
    if (from) { router.push(from); return }
    if (typeof window !== 'undefined' && window.history.length > 1) { router.back(); return }
    router.push('/')
  }

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        setUserEmail(user.email ?? '')
        const { data } = await supabase
          .from('therapists')
          .select('plan, highest_plan')
          .eq('id', user.id)
          .single()
        const plan    = data?.plan         ?? 'free'
const highest =
  data?.highest_plan ||
  (PLAN_RANK[data?.plan ?? 'free'] > 0
    ? data?.plan
    : 'free')
            setCurrentPlan(plan)
        setHighestPlan(highest)
      }
      setPageLoading(false)
    }
    load()
  }, [])

  async function handleSelectPlan(planId: string) {
    setErrorMsg(null)
    setSuccessMsg(null)
    setSelecting(planId)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      // Not logged in → go to login
      if (!user) {
        const returnUrl = `/pricing?plan=${planId}&redirect=${encodeURIComponent(redirectAfter)}`
        router.push(`/login?redirect=${encodeURIComponent(returnUrl)}`)
        return
      }

      // Already on this plan → just navigate
      if (planId === currentPlan) {
        router.push(redirectAfter)
        return
      }

      // ── Re-activation ─────────────────────────────────────────────────────
      // If the user has already paid for this plan (or a higher one) before,
      // re-activate it without charging again. (No free tier any more.)
      // ─────────────────────────────────────────────────────────────────────
      const alreadyPaid = PLAN_RANK[planId] != null
        && PLAN_RANK[highestPlan] != null
        && PLAN_RANK[planId] <= PLAN_RANK[highestPlan]

      if (alreadyPaid) {
        const { error } = await supabase
          .from('therapists')
          .update({ plan: planId })
          .eq('id', user.id)
        if (error) throw error
        setCurrentPlan(planId)
        setSuccessMsg(`✓ ${planId.charAt(0).toUpperCase() + planId.slice(1)} plan re-activated — no charge.`)
        setTimeout(() => router.push(redirectAfter), 1000)
        return
      }

      // New paid plan → Razorpay
      await openRazorpay({
        amount:      PLAN_PRICE[planId],
        description: `Counsellors of India — ${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan (Monthly)`,
        receipt:     `plan_${planId}_${user.id}`.slice(0, 40),
        prefill:     { email: user.email ?? '' },

        onSuccess: async (payload) => {
          const res = await fetch('/api/razorpay?action=plan-upgrade', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ ...payload, therapist_id: user.id, plan: planId }),
          })
          const data = await res.json()
          if (!res.ok || !data.success) {
            throw new Error(data.error ?? 'Plan upgrade failed. Please contact support.')
          }
          setCurrentPlan(planId)
          setHighestPlan(planId) // update local state so subsequent re-selections skip payment
          setSuccessMsg(`🎉 You're now on the ${planId.charAt(0).toUpperCase() + planId.slice(1)} plan!`)
          sessionStorage.removeItem('pending_plan')
          setTimeout(() => router.push(redirectAfter), 1200)
        },

        onFailure: (msg) => {
          if (msg !== 'Payment cancelled by user.') setErrorMsg(msg)
        },
      })
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSelecting(null)
    }
  }

  // Auto-trigger when redirected back from login with ?plan=
  useEffect(() => {
    const planFromUrl = searchParams.get('plan')
    if (planFromUrl && !pageLoading && userId) {
      const t = setTimeout(() => handleSelectPlan(planFromUrl), 300)
      return () => clearTimeout(t)
    }
  }, [pageLoading, userId])

  if (pageLoading) {
    return (
      <main className="min-h-screen bg-[#F6F3EE] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#FF9933] border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  const comingFrom = searchParams.get('redirect')

  return (
    <main
      className="min-h-screen px-4 py-14 sm:py-16"
      style={{
        background:
          'radial-gradient(ellipse 60% 45% at 80% 8%, rgba(255,153,51,.08) 0%, transparent 60%),' +
          'radial-gradient(ellipse 55% 50% at 10% 95%, rgba(255,217,176,.18) 0%, transparent 65%),' +
          'linear-gradient(180deg,#F6F3EE 0%,#F1ECE3 100%)',
      }}
    >
      {/* Close / back button — returns to where you came from */}
      <button
        type="button"
        onClick={goBack}
        aria-label="Close and go back"
        className="fixed top-5 right-5 sm:top-6 sm:right-6 z-50 h-11 w-11 rounded-full flex items-center justify-center bg-white/90 backdrop-blur border border-[#e8e1d6] text-[#6E685F] shadow-sm hover:text-[#1F1C18] hover:border-[#FF9933] hover:bg-white transition"
      >
        <X size={18} />
      </button>

      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#FF9933] mb-4">
            <span className="w-5 h-px bg-[#FF9933]" />
            {comingFrom?.includes('appearance') ? 'Unlock premium' : 'Plans & pricing'}
            <span className="w-5 h-px bg-[#FF9933]" />
          </div>
          <h1
            className="text-[#1F1C18] font-normal tracking-tight"
            style={{ fontFamily: "'Fraunces','Instrument Serif',Georgia,serif", fontSize: 'clamp(2.2rem,4.6vw,3.4rem)', lineHeight: 1.05 }}
          >
            Choose the plan that<br className="hidden sm:block" />{' '}
            <em style={{ fontStyle: 'italic', color: '#FF9933' }}>grows with you.</em>
          </h1>
          <p className="text-[#6E685F] text-[15px] font-light leading-relaxed max-w-md mx-auto mt-4">
            {/* Start free and upgrade whenever you're ready. No lock-in — switch or cancel anytime from your dashboard. */}
          </p>
          {!userId && (
            <p className="mt-5 text-sm text-[#6E685F]">
              Already have an account?{' '}
              <Link href={`/login?redirect=${encodeURIComponent(`/pricing?redirect=${encodeURIComponent(redirectAfter)}`)}`}
                className="text-[#E07A12] font-medium hover:underline">
                Log in
              </Link>
            </p>
          )}
        </div>

        {/* Banners */}
        {errorMsg && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-3.5 text-sm text-red-700 text-center">
            ⚠ {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-5 py-3.5 text-sm text-green-700 text-center font-medium">
            {successMsg}
          </div>
        )}
        {currentPlan && currentPlan !== 'free' && !successMsg && (
          <div className="mb-6 rounded-xl border border-[#F3D9B0] bg-[#FBF3E6] px-5 py-3.5 text-sm text-[#7a5a1e] text-center flex items-center justify-center gap-2">
            <Crown size={15} className="text-[#FF9933]" />
            You're on the <strong className="capitalize">{currentPlan}</strong> plan.
            {comingFrom && (
              <button onClick={goBack} className="ml-3 text-[#E07A12] font-semibold underline hover:no-underline">
                ← Go back
              </button>
            )}
          </div>
        )}

        {/* Re-activation info banner — shown when user downgraded but paid before */}
        {/* {currentPlan === 'free' && PLAN_RANK[highestPlan] > 0 && !successMsg && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-3.5 text-sm text-amber-800 text-center flex items-center justify-center gap-2">
            <Check size={15} className="text-amber-600" />
            You previously had the <strong className="capitalize">{highestPlan}</strong> plan.
            Re-select it below to restore access — <strong>no charge</strong>.
          </div>
        )} */}

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map(plan => {
            const isActive    = currentPlan === plan.id
            const isBusy      = selecting === plan.id
            const alreadyPaid = PLAN_RANK[plan.id] > 0 && PLAN_RANK[plan.id] <= PLAN_RANK[highestPlan]
            const isPaid      = PLAN_PRICE[plan.id] > 0

            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl border-2 flex flex-col p-7 transition
                  ${plan.highlight ? 'border-[#FF9933] shadow-xl shadow-[#FF9933]/15 md:-mt-4 md:mb-4' : 'border-[#ece5d9] shadow-sm'}
                  ${isActive ? 'ring-2 ring-[#FF9933]/40' : ''}
                `}
              >
                {plan.badge && (
                  <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 text-xs font-semibold px-3.5 py-1 rounded-full shadow-sm ${
                    plan.id === 'growth' ? 'bg-[#FF9933] text-white' : 'bg-[#1F1C18] text-white'
                  }`}>
                    {plan.badge}
                  </div>
                )}

                <div className="mb-5">
                  <div className="flex items-center gap-2">
                    {plan.id === 'growth' && <Zap size={16} className="text-[#FF9933]" />}
                    {plan.id === 'pro'    && <Crown size={16} className="text-[#E07A12]" />}
                    <h2 className="text-xl font-semibold text-[#1F1C18]" style={{ fontFamily: "'Fraunces','Instrument Serif',serif", fontWeight: 500 }}>{plan.name}</h2>
                    {/* "Paid" badge when user already paid for this plan */}
                    {alreadyPaid && !isActive && (
                      <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                        Paid ✓
                      </span>
                    )}
                  </div>
                  <div className="mt-4 flex items-end gap-1.5">
                    <span className="text-4xl font-semibold text-black/80">
                      {/* If already paid, show "Free to re-activate" */}
         {plan.price}
                    </span>
                    {/* {!(alreadyPaid && !isActive) && ( */}
                      <span className="text-gray-400 text-sm mb-1">/ {plan.period}</span>
                    {/* )} */}
                  </div>
                  <p className="text-gray-400 text-sm mt-2.5">{plan.tagline}</p>
                </div>

                <Button
                  variant={plan.highlight ? 'primary' : 'outline'}
                  fullWidth
                  loading={isBusy || (rzpLoading && isBusy)}
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={isActive}
                  className={plan.highlight
                    ? 'bg-[#FF9933]! hover:bg-[#E07A12]! text-white! shadow-lg shadow-[#FF9933]/25'
                    : 'hover:border-[#FF9933]! hover:text-[#E07A12]!'}
                >
                  {isActive ? (
                    <><Check size={15} className="mr-1.5" /> Current plan</>
                  ) : alreadyPaid ? (
                    <>Restore access <ArrowRight size={14} className="ml-1.5" /></>
                  ) : (
                    <>{plan.cta} <ArrowRight size={14} className="ml-1.5" /></>
                  )}
                </Button>

                <ul className="space-y-2.5 mt-10 flex-1 mb-7">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Check size={15} className="text-[#FF9933] mt-0.5 shrink-0" strokeWidth={2.5} />
                      <span className="text-sm text-[#3D3A33]">{f}</span>
                    </li>
                  ))}
                  {plan.locked.map(f => (
                    <li key={f} className="flex items-start gap-2.5 opacity-40">
                      <Lock size={13} className="text-gray-300 mt-0.5 shrink-0" />
                      <span className="text-sm text-gray-400 line-through">{f}</span>
                    </li>
                  ))}
                </ul>

                {isPaid && !alreadyPaid && (
                  <p className="text-xs text-gray-400 flex items-center gap-1.5 mb-3 justify-center">
                    <ShieldCheck size={12} className="text-[#FF9933]" />
                    Secure payment via Razorpay
                  </p>
                )}
              </div>
            )
          })}
        </div>

        <p className="text-center text-sm text-gray-400 mt-8" />
      </div>
    </main>
  )
}

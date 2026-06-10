'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import Button from '@/components/ui/Button'
import { Check, Lock, Zap, ArrowRight, ShieldCheck, Crown, X } from 'lucide-react'
import { startPayuPlanCheckout } from '@/lib/payu-client'

const PLAN_PRICE: Record<string, number> = { starter: 1499, pro: 2499 }
const PLAN_RANK:  Record<string, number> = { starter: 1,    pro: 2   }

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: '₹1499',
    period: '/ year',
    tagline: 'Professional website for independent therapists',
    highlight: false,
    badge: null,
    features: [
      'Professional therapist website',
      'Custom domain',
      'Online Appointment Booking',
      'Payment Collection',
      'Email confirmations',
      'Client Dashboard',
      'Shareable profile link',
      'Up to 10 bookings per month',
    ],
    locked: [],
    cta: 'Get Started',
  },
  {
    id: 'pro',
    name: 'PRO',
    price: '₹2499',
    period: '/ year',
    tagline: 'Grow your practice with unlimited bookings',
    highlight: true,
    badge: 'Most Popular',
    features: [
      'Professional therapist website',
      'Custom domain',
      'Online appointment booking',
      'Payment collection',
      'Client dashboard',
      'Email confirmations',
      'Shareable profile link',
      'Unlimited bookings',
      'Featured Therapist Badge',
      'Higher Visibility in Directory',
      'Priority Support',
    ],
    locked: [],
    cta: 'Grow Your Practice',
  },
];

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
      // Resolve the current user robustly. Right after signup the session can
      // take a moment to hydrate, so fall back to getSession() and the userId
      // already loaded into state before concluding the user is logged out.
      let user = (await supabase.auth.getUser()).data.user
      if (!user) user = (await supabase.auth.getSession()).data.session?.user ?? null

      // Not logged in → go to login (preserving the chosen plan so we resume)
      if (!user && !userId) {
        const returnUrl = `/pricing?plan=${planId}&redirect=${encodeURIComponent(redirectAfter)}`
        router.push(`/login?redirect=${encodeURIComponent(returnUrl)}`)
        return
      }
      const uid = user?.id ?? userId!

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
          .eq('id', uid)
        if (error) throw error
        setCurrentPlan(planId)
        setSuccessMsg(`✓ ${planId.charAt(0).toUpperCase() + planId.slice(1)} plan re-activated — no charge.`)
        setTimeout(() => router.push(redirectAfter), 1000)
        return
      }

      // New paid plan → PayU hosted checkout.
      // This redirects the browser away to PayU; on return, /api/payu/callback
      // verifies the response hash, applies the upgrade, and routes the user to
      // /payment/success (or /payment/failure). uid + plan travel via udf1/udf2.
      sessionStorage.setItem('pending_plan', planId)
      await startPayuPlanCheckout(planId)
      // Browser navigates to PayU here — nothing below runs on success.
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.')
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
        {/* {currentPlan && currentPlan !== 'free' && !successMsg && (
          <div className="mb-6 rounded-xl border border-[#F3D9B0] bg-[#FBF3E6] px-5 py-3.5 text-sm text-[#7a5a1e] text-center flex items-center justify-center gap-2">
            <Crown size={15} className="text-[#FF9933]" />
            You're on the <strong className="capitalize">{currentPlan}</strong> plan.
            {comingFrom && (
              <button onClick={goBack} className="ml-3 text-[#E07A12] font-semibold underline hover:no-underline">
                ← Go back
              </button>
            )}
          </div>
        )} */}

        {/* Re-activation info banner — shown when user downgraded but paid before */}
        {/* {currentPlan === 'free' && PLAN_RANK[highestPlan] > 0 && !successMsg && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-3.5 text-sm text-amber-800 text-center flex items-center justify-center gap-2">
            <Check size={15} className="text-amber-600" />
            You previously had the <strong className="capitalize">{highestPlan}</strong> plan.
            Re-select it below to restore access — <strong>no charge</strong>.
          </div>
        )} */}

        {/* Plans grid */}
<div className="mx-auto w-full max-w-[980px]">
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 xl:gap-8 items-stretch">

    {plans.map((plan) => {
      const isActive = currentPlan === plan.id
      const isBusy = selecting === plan.id
      const alreadyPaid =
        PLAN_RANK[plan.id] > 0 &&
        PLAN_RANK[plan.id] <= PLAN_RANK[highestPlan]

      const isPaid = PLAN_PRICE[plan.id] > 0

      return (
        <div
          key={plan.id}
          className={`
            relative
            flex flex-col
            h-full
            rounded-[28px]
            bg-white
            p-6 sm:p-8
            transition-all
            duration-300

            ${
              plan.highlight
                ? `
                  border border-[#FF9933]
                  shadow-[0_20px_60px_rgba(255,153,51,0.15)]
                  lg:scale-[1.03]
                `
                : `
                  border border-[#ECE5D9]
                  shadow-sm
                  hover:shadow-lg
                  hover:border-[#FF9933]/30
                `
            }

            ${isActive ? 'ring-2 ring-[#FF9933]/20' : ''}
          `}
        >
          {plan.badge && (
            <div
              className="
                absolute
                left-1/2
                -translate-x-1/2
                -top-3
                px-4
                py-1.5
                rounded-full
                text-xs
                font-semibold
                bg-[#FF9933]
                text-white
                shadow-md
                whitespace-nowrap
              "
            >
              {plan.badge}
            </div>
          )}

          <div className="mb-8">
            <div className="flex items-center gap-2">
              {plan.id === 'pro' && (
                <Crown size={16} className="text-[#FF9933]" />
              )}

              <h2
                className="text-2xl text-[#1F1C18]"
                style={{
                  fontFamily:
                    "'Fraunces','Instrument Serif',serif",
                  fontWeight: 500,
                }}
              >
                {plan.name}
              </h2>

              {alreadyPaid && !isActive && (
                <span className="ml-auto text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
                  Paid ✓
                </span>
              )}
            </div>

            <div className="mt-5 flex items-end gap-2">
<span
  className="text-5xl font-semibold tracking-tight text-[#1F1C18]"
  style={{
    fontFamily: 'Inter, system-ui, sans-serif'
  }}
>
  {plan.price}
</span>

              <span className="text-sm text-gray-400 mb-1">
                {plan.period}
              </span>
            </div>

            <p className="mt-3 text-sm text-[#6E685F] leading-relaxed">
              {plan.tagline}
            </p>
          </div>

          <Button
            variant={plan.highlight ? 'primary' : 'outline'}
            fullWidth
            loading={isBusy}
            onClick={() => handleSelectPlan(plan.id)}
            disabled={isActive}
            className={
              plan.highlight
                ? `
                  h-12
                  rounded-xl
                  bg-[#FF9933]!
                  hover:bg-[#E07A12]!
                  text-white!
                `
                : `
                  h-12
                  rounded-xl
                  hover:border-[#FF9933]!
                  hover:text-[#FF9933]!
                `
            }
          >
            {isActive ? (
              <>
                <Check size={15} className="mr-2" />
                Current Plan
              </>
            ) : alreadyPaid ? (
              <>
               Continue 
                <ArrowRight size={14} className="ml-2" />
              </>
            ) : (
              <>
                {plan.cta}
                <ArrowRight size={14} className="ml-2" />
              </>
            )}
          </Button>

          <ul className="mt-8 mb-8 flex-1 space-y-4">
            {plan.features.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-3"
              >
                <Check
                  size={16}
                  className="mt-1 shrink-0 text-[#FF9933]"
                />

                <span className="text-[15px] leading-relaxed text-[#3D3A33]">
                  {feature}
                </span>
              </li>
            ))}

            {plan.locked?.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-3 opacity-40"
              >
                <Lock
                  size={14}
                  className="mt-1 shrink-0 text-gray-300"
                />

                <span className="text-[15px] text-gray-400 line-through">
                  {feature}
                </span>
              </li>
            ))}
          </ul>

          {isPaid && !alreadyPaid && (
            <div className="mt-auto pt-2">
              <p className="flex items-center justify-center gap-2 text-xs text-gray-400">
                <ShieldCheck
                  size={12}
                  className="text-[#FF9933]"
                />
                Secure payment via PayU
              </p>
            </div>
          )}
        </div>
      )
    })}
  </div>
</div>

        <p className="text-center text-sm text-gray-400 mt-8" />
      </div>
    </main>
  )
}

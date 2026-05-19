'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Button from '@/components/ui/Button'
import Logo from '@/components/ui/Logo'
import { Check } from 'lucide-react'

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '₹0',
    period: 'forever',
    description: 'Get started with a basic profile',
    color: 'border-gray-200',
    badge: null,
    features: [
      'Public profile page',
      'Up to 10 bookings/month',
      'Basic appointment view',
      'Shareable booking link',
    ],
    missing: [
      'Client management',
      'Session notes',
      'Availability settings',
      'Payment links',
    ],
    cta: 'Start Free',
    variant: 'outline' as const,
  },
  {
    id: 'growth',
    name: 'Growth',
    price: '₹999',
    period: 'per month',
    description: 'For active practitioners',
    color: 'border-[#a3b8b4]',
    badge: 'Most Popular',
    features: [
      'Everything in Free',
      'Unlimited bookings',
      'Client profiles & notes',
      'Availability management',
      'Email confirmations',
      'Razorpay payment links',
      'Session history',
    ],
    missing: [],
    cta: 'Start 14-day Trial',
    variant: 'primary' as const,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '₹2,499',
    period: 'per month',
    description: 'For clinics and senior therapists',
    color: 'border-amber-400',
    badge: 'Best Value',
    features: [
      'Everything in Growth',
      'Custom profile templates',
      'Export session notes (PDF)',
      'Up to 3 therapists',
      'Priority support',
      'Advanced analytics',
    ],
    missing: [],
    cta: 'Start 14-day Trial',
    variant: 'outline' as const,
  },
]

export default function PricingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [selecting, setSelecting] = useState<string | null>(null)

  async function handleSelectPlan(planId: string) {
    setSelecting(planId)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/signup')
      return
    }

    await supabase
      .from('therapists')
      .update({ plan: planId })
      .eq('id', user.id)

    router.push('/onboarding')
  }

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-12">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          {/* <div className="mb-6">
            <Logo size="md" centered />
          </div> */}
          <h2
            className="text-4xl font-semibold text-gray-900 mb-3"
            style={{ fontFamily: 'var(--font-cormorant), serif' }}
          >
            Choose your plan
          </h2>
          <p className="text-gray-500 text-base max-w-md mx-auto">
            Start free and upgrade anytime. 
            Paid plans include a 14-day free trial — no credit card required.
          </p>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`
                relative bg-white rounded-xl border-2 shadow-sm p-7 flex flex-col
                ${plan.color}
                ${plan.id === 'growth' ? 'shadow-[#d4e4e1] shadow-md' : ''}
              `}
            >
              {/* Badge */}
              {plan.badge && (
                <div className={`
                  absolute -top-3 left-1/2 -translate-x-1/2
                  text-xs font-semibold px-3 py-1 rounded-full
                  ${plan.id === 'growth'
                    ? 'bg-[#a3b8b4] text-white'
                    : 'bg-amber-400 text-white'}
                `}>
                  {plan.badge}
                </div>
              )}

              {/* Plan name & price */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {plan.name}
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  {plan.description}
                </p>
                <div className="flex items-end gap-1">
                  <span
                    className="text-4xl font-bold text-[#c9a96e]"
                    style={{ fontFamily: 'var(--font-cormorant), serif' }}
                  >
                    {plan.price}
                  </span>
                  <span className="text-gray-400 text-sm mb-1">
                    /{plan.period}
                  </span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check
                      className="text-[#5a7f7a] mt-0.5 shrink-0"
                      size={16}
                      strokeWidth={2.5}
                    />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
                {plan.missing.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 opacity-35">
                    <Check
                      className="text-gray-300 mt-0.5 shrink-0"
                      size={16}
                      strokeWidth={2.5}
                    />
                    <span className="text-sm text-gray-400 line-through">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                variant={plan.variant}
                fullWidth
                loading={selecting === plan.id}
                onClick={() => handleSelectPlan(plan.id)}
              >
                {plan.cta}
              </Button>

            </div>
          ))}
        </div>

        {/* Footer note */}
        <p className="text-center text-sm text-gray-400 mt-8">
          You can change your plan anytime from settings. 
          Annual billing saves 20%.
        </p>

      </div>
    </main>
  )
}
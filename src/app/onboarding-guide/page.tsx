import type { Metadata } from 'next'
import Link from 'next/link'
import SiteNav from '@/components/layout/SiteNav'
import SiteFooter from '@/components/layout/SiteFooter'
import OnboardingSteps from '@/components/onboarding/OnboardingSteps'
import { ArrowRight } from 'lucide-react'
import { getCurrentTenant } from '@/lib/tenants/server'

export const metadata: Metadata = {
  title: 'Onboarding Guide',
  description:
    'Go live in 10 minutes - create your account, build your profile, choose a template, and start accepting bookings and payments.',
}

export default async function OnboardingGuidePage() {
  const tenant = await getCurrentTenant()
  return (
    <div className="flex min-h-screen flex-col bg-[#FFFCF8]">
      <SiteNav tenant={{ brandName: tenant.brandName }} />

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pt-28 pb-16">
        <div className="pointer-events-none absolute -top-32 right-[-8%] h-[440px] w-[440px] rounded-full bg-[#FF9933] opacity-[0.08] blur-[110px]" />
        <div className="pointer-events-none absolute -bottom-32 left-[-10%] h-[360px] w-[360px] rounded-full bg-[#456554] opacity-[0.06] blur-[100px]" />
        <div className="relative mx-auto max-w-2xl text-center">
          <h1
            className="text-4xl leading-[1.12] text-[#1F1C18] sm:text-5xl"
            style={{ fontFamily: 'var(--font-jakarta)' }}
          >
            Go live in <span className="text-[#FF9933]">10 minutes.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-[#6E685F]">
            Seven calm steps from sign-up to your first client booking, one at a time. Scroll through the journey,
            or tap any step on the rail to jump straight to it.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="pb-20">
        <OnboardingSteps />
      </section>

      {/* CTA */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-3xl rounded-3xl bg-[#1F1C18] p-10 text-center text-white shadow-[0_24px_60px_-24px_rgba(31,28,24,0.45)] sm:p-14">
          <p
            className="mb-6 text-2xl leading-snug sm:text-[28px]"
            style={{ fontFamily: 'var(--font-jakarta)' }}
          >
            Ready to see your practice online?
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-full bg-[#FF9933] px-6 py-3 text-[14px] font-semibold text-white transition hover:bg-[#E07A12]"
          >
            Create your account <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      <SiteFooter tenant={{ brandName: tenant.brandName, footerTagline: tenant.footerTagline }} />
    </div>
  )
}

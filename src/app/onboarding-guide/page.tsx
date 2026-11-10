import type { Metadata } from 'next'
import Link from 'next/link'
import SiteNav from '@/components/layout/SiteNav'
import SiteFooter from '@/components/layout/SiteFooter'
import FooterReveal from '@/components/landing/FooterReveal'
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
  // Accent colors: India keeps its original saffron values exactly; every
  // other tenant (e.g. America) uses its own brand colors instead.
  const isIndia = tenant.id === 'in'
  const BRAND = isIndia ? '#FF9933' : tenant.primaryColor
  const BRAND_HOVER = isIndia ? '#E07A12' : tenant.primaryColorDark
  const BRAND_LABEL = isIndia ? '#B4600F' : tenant.primaryColorDark
  const BLOB_2 = isIndia ? '#456554' : tenant.primaryColorDark
  return (
    <div className="flex min-h-screen flex-col bg-[#FFFCF8]">
      <SiteNav tenant={{
        brandName: tenant.brandName,
        logoPath: tenant.logoPath,
        primaryColor: tenant.primaryColor,
        primaryColorDark: tenant.primaryColorDark,
      }} />

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pt-28 pb-16">
        <div className="pointer-events-none absolute -top-32 right-[-8%] h-[440px] w-[440px] rounded-full opacity-[0.08] blur-[110px]" style={{ background: BRAND }} />
        <div className="pointer-events-none absolute -bottom-32 left-[-10%] h-[360px] w-[360px] rounded-full opacity-[0.06] blur-[100px]" style={{ background: BLOB_2 }} />
        <div className="relative mx-auto max-w-2xl text-center">
          <h1
            className="text-4xl leading-[1.12] text-[#1F1C18] sm:text-5xl"
            style={{ fontFamily: 'var(--font-jakarta)' }}
          >
            Go live in <span style={{ color: BRAND }}>10 minutes.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-[#6E685F]">
            Seven calm steps from sign-up to your first client booking, one at a time. Scroll through the journey,
            or tap any step on the rail to jump straight to it.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="pb-20">
        <OnboardingSteps colors={{ brand: BRAND, hover: BRAND_HOVER, label: BRAND_LABEL }} />
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
            className="inline-flex items-center gap-2 rounded-full bg-[color:var(--cta)] px-6 py-3 text-[14px] font-semibold text-white transition hover:bg-[color:var(--cta-hover)]"
            style={{ ['--cta' as string]: BRAND, ['--cta-hover' as string]: BRAND_HOVER } as React.CSSProperties}
          >
            Create your account <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      <SiteFooter tenant={{ brandName: tenant.brandName, footerTagline: tenant.footerTagline, logoPath: tenant.logoPath }} />
      <FooterReveal wordmark={tenant.brandName} />
    </div>
  )
}

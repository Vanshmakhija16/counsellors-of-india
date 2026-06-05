'use client'

import type { ReactNode } from 'react'
import type { TherapistProfile } from '../templateUtils'

interface FooterProps { therapist: TherapistProfile }

export default function Footer({ therapist }: FooterProps) {
  // Peel off a leading honorific ("Dr.") so it can carry the accent colour,
  // matching the hero headline. The rest of the name keeps the footer's cream.
  const footerNameParts = (therapist.name ?? '').trim().split(/\s+/).filter(Boolean)
  const footerHasHonorific = /^(dr|mr|mrs|ms|prof)\.?$/i.test(footerNameParts[0] ?? '')
  const footerPrefix = footerHasHonorific ? footerNameParts[0] : ''
  const footerRest = (footerHasHonorific ? footerNameParts.slice(1) : footerNameParts).join(' ')

  return (
<footer className="relative overflow-hidden border-t border-[#e8dfc8] bg-[#1a1a18]">

  {/* soft gradients */}
  <div className="pointer-events-none absolute -left-24 top-0 h-[260px] w-[260px] rounded-full bg-[#b46b50]/10 blur-[90px]" />
  <div className="pointer-events-none absolute -right-24 bottom-0 h-[240px] w-[240px] rounded-full bg-[#b46b50]/10 blur-[90px]" />

  <div className="relative mx-auto max-w-[1180px] px-6 py-14 lg:px-12 lg:py-16">

    {/* TOP */}
    <div className="grid gap-12 border-b border-red pb-12 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">

      {/* BRAND */}
      <div className="max-w-[320px]">

        <p
          className="text-[30px] leading-none tracking-[-0.03em] text-[#f3ece4]"
          style={{ fontFamily: "var(--font-fraunces), serif" }}
        >
          {footerPrefix && <span className="text-[#b46b50]">{footerPrefix} </span>}
          {footerRest || therapist.name}
        </p>

        <p className="mt-2 text-[12px] tracking-[0.08em] text-[#b46b50]">
          {therapist.credentials ?? "Licensed Psychotherapist"}
        </p>

        <p className="mt-5 text-[13px] leading-[1.9] text-[#6b6056]">
          {therapist.tagline ||
            'A calm and confidential space for thoughtful, evidence-based psychological care.'}
        </p>

        {/* socials */}
        <div className="mt-7 flex items-center gap-2.5">
          {(() => {
            const socials: { key: string; href: string; icon: ReactNode }[] = []
            if (therapist.instagram) {
              socials.push({
                key: 'ig',
                href: therapist.instagram.startsWith('http')
                  ? therapist.instagram
                  : `https://instagram.com/${therapist.instagram.replace(/^@/, '')}`,
                icon: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                    <rect x="2" y="2" width="20" height="20" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="1" />
                  </svg>
                ),
              })
            }
            const wa = therapist.whatsapp || therapist.phone
            if (wa) {
              socials.push({
                key: 'wa',
                href: `https://wa.me/91${wa.replace(/\D/g, '')}`,
                icon: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
                  </svg>
                ),
              })
            }
            if (therapist.linkedin) {
              socials.push({
                key: 'li',
                href: therapist.linkedin.startsWith('http')
                  ? therapist.linkedin
                  : `https://linkedin.com/in/${therapist.linkedin}`,
                icon: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4.98 3.5C4.98 4.881 3.87 6 2.5 6S.02 4.881.02 3.5C.02 2.12 1.13 1 2.5 1s2.48 1.12 2.48 2.5zM.22 8h4.56v14H.22V8zm7.49 0h4.37v1.92h.06c.61-1.16 2.1-2.39 4.32-2.39 4.62 0 5.47 3.04 5.47 7v7.47h-4.56v-6.62c0-1.58-.03-3.6-2.2-3.6-2.2 0-2.54 1.72-2.54 3.49V22H7.71V8z" />
                  </svg>
                ),
              })
            }
            if (therapist.website) {
              socials.push({
                key: 'web',
                href: therapist.website.startsWith('http')
                  ? therapist.website
                  : `https://${therapist.website}`,
                icon: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M3 12h18" />
                    <path d="M12 3a14 14 0 010 18M12 3a14 14 0 000 18" />
                  </svg>
                ),
              })
            }
            return socials.map((s) => (
              <a
                key={s.key}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.02] text-[#b46b50] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#b46b50] hover:text-[#f3ece4]"
              >
                {s.icon}
              </a>
            ))
          })()}
        </div>
      </div>

      {/* LINKS */}
      {[
        {
          title: "Navigation",
          links: [
            { label: "Home", id: "home" },
            { label: "About", id: "about" },
            { label: "Services", id: "services" },
            { label: "Contact", id: "contact" },
          ],
        },

        {
          title: "Practice",
          links: [
            { label: "Approach" },
            { label: "Credentials" },
            { label: "Session Fees" },
            { label: "FAQs" },
          ],
        },

        {
          title: "Legal",
          links: [
            { label: "Privacy Policy" },
            { label: "Terms & Conditions" },
            { label: "Cancellation Policy" },
            { label: "Disclaimer" },
          ],
        },
      ].map((col) => (
        <div key={col.title}>

          <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.30em] text-[#b46b50]">
            {col.title}
          </p>

          <ul className="space-y-3">

            {col.links.map((link) => (
              <li key={link.label}>

                <button
                  suppressHydrationWarning
                  onClick={() => {
                    const id = (link as { id?: string }).id
                    if (id) document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="text-[13px] text-[#6b6056] transition-all duration-300 hover:translate-x-1 hover:text-[#f3ece4]"
                >
                  {link.label}
                </button>

              </li>
            ))}

          </ul>
        </div>
      ))}
    </div>

    {/* BOTTOM */}
    <div className="flex flex-col gap-6 pt-8 lg:flex-row lg:items-center lg:justify-between">

      {/* copyright */}
      <p className="text-[11.5px] text-[#6b6056]">
        © {new Date().getFullYear()} Counsellors of India ·
        All rights reserved.
      </p>

      {/* newsletter */}
      <div className="flex w-full max-w-[360px] items-center overflow-hidden rounded-full border border-white/10 bg-white/[0.03]">

        <input
          suppressHydrationWarning
          type="email"
          placeholder="Your email address"
          className="h-[42px] flex-1 bg-transparent px-5 text-[12px] text-[#efe7d6] placeholder-[#6b6056] outline-none"
        />

        <button
        suppressHydrationWarning
        className="mr-1 flex h-[34px] items-center justify-center rounded-full bg-[#b46b50] px-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#1a1a18] transition-all duration-300 hover:bg-[#b46b50]">
          Subscribe
        </button>
      </div>
    </div>

  </div>

  {/* back to top */}
  <button
  suppressHydrationWarning
    onClick={() =>
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })
    }
    className="fixed bottom-6 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-[#b46b50]/30 bg-[#1a1a18]/90 text-[#c8b19a] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[#b46b50] hover:text-white"
  >
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
    >
      <path
        d="M6 9V3M3.5 5.5 6 3l2.5 2.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </button>

</footer>
  )
}

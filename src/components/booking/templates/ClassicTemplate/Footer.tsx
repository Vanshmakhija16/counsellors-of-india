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
  <div className="grid gap-12 border-b border-white/10 pb-12 lg:grid-cols-[1.8fr_1fr_1fr]">

    {/* BRAND */}
    <div>

      <p
        className="text-[30px] leading-none tracking-[-0.03em] text-[#f3ece4]"
        style={{ fontFamily: "var(--font-fraunces), serif" }}
      >
        {footerPrefix && (
          <span className="text-[#b46b50]">
            {footerPrefix}{' '}
          </span>
        )}
        {footerRest || therapist.name}
      </p>

      <p className="mt-2 text-[12px] tracking-[0.08em] text-[#b46b50]">
        {therapist.credentials ?? 'Licensed Psychotherapist'}
      </p>

      <p className="mt-5 max-w-[420px] text-[13px] leading-[1.9] text-[#6b6056]">
        {therapist.tagline ||
          'A calm and confidential space for thoughtful, evidence-based psychological care.'}
      </p>

    </div>

    {/* NAVIGATION */}
    <div>

      <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.30em] text-[#b46b50]">
        Navigation
      </p>

      <ul className="space-y-3">

        {[
          { label: 'Home', id: 'home' },
          { label: 'About', id: 'about' },
          { label: 'Services', id: 'services' },
          { label: 'Contact', id: 'contact' },
        ].map((link) => (
          <li key={link.label}>
            <button
              suppressHydrationWarning
              onClick={() =>
                document
                  .getElementById(link.id)
                  ?.scrollIntoView({ behavior: 'smooth' })
              }
              className="text-[13px] text-[#6b6056] transition-all duration-300 hover:translate-x-1 hover:text-[#f3ece4]"
            >
              {link.label}
            </button>
          </li>
        ))}

      </ul>

    </div>

    {/* CONNECT */}
    <div>

      <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.30em] text-[#b46b50]">
        Socials``
      </p>

      <div className="flex flex-wrap gap-2.5">

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

          return socials.map((s) => (
            <a
              key={s.key}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.02] text-[#b46b50] transition-all duration-300 hover:border-[#b46b50] hover:text-[#f3ece4]"
            >
              {s.icon}
            </a>
          ))
        })()}

      </div>

    </div>

  </div>

  {/* BOTTOM */}
  <div className="flex flex-col gap-4 pt-8 lg:flex-row lg:items-center lg:justify-between">

    <p className="text-[11px] text-[#6b6056]">
      © {new Date().getFullYear()} {footerRest || therapist.name} · Counsellors of India · All rights reserved.
    </p>

    <button
      suppressHydrationWarning
      onClick={() =>
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        })
      }
      className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-[#b46b50] transition-all duration-300 hover:text-[#f3ece4]"
    >
      Back To Top

      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path
          d="M6 9V3M3.5 5.5 6 3l2.5 2.5"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>

  </div>

</div>

  {/* back to top */}
  {/* <button
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
  </button> */}

</footer>
  )
}

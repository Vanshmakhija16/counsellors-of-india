'use client'

import type { TherapistProfile } from '../templateUtils'

interface ExpertiseProps {
  therapist: TherapistProfile
}

export default function Expertise({ therapist }: ExpertiseProps) {
  const specialties = therapist.specialties ?? []
  if (specialties.length === 0) return null

  return (
    <section
      id="expertise"
      className="relative overflow-hidden border-t border-[#e8dfc8] bg-[#efe7d6] px-6 py-20 lg:px-12 lg:py-24"
    >
      <div className="pointer-events-none absolute right-[-100px] top-[-80px] h-[280px] w-[280px] rounded-full bg-[#e8dfc8] blur-3xl opacity-50" />

      <div className="relative mx-auto max-w-[1180px]">
        <div className="grid items-end gap-10 border-b border-[#e8dfc8] pb-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.30em] text-[#b46b50]">
              <span className="h-px w-7 bg-[#b46b50]" />
              03 — Areas of Expertise
            </p>

            <h2
              className="mt-6 text-[34px] leading-[1.02] tracking-[-0.03em] text-[#1a1a18] lg:text-[44px]"
              style={{ fontFamily: 'var(--font-fraunces), serif' }}
            >
              Thoughtful support for{' '}
              <span className="italic text-[#6b6056]">emotional wellbeing.</span>
            </h2>
          </div>

          <p className="max-w-[480px] text-[15px] leading-[1.85] text-[#6b6056]">
            Personalized therapeutic support designed around your experiences,
            emotional patterns, and long-term healing journey.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {specialties.map((s, i) => (
            <article
              key={s}
              className="group relative overflow-hidden rounded-[20px] border border-[#e8dfc8] bg-[#f5ecd6] p-6 transition-all duration-500 hover:-translate-y-1 hover:border-[#b46b50] hover:shadow-[0_10px_30px_rgba(0,0,0,0.04)]"
            >
              <div className="flex items-start justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#b46b50]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#b46b50] transition-all duration-500 group-hover:bg-[#1a1a18]" />
              </div>

              <h3
                className="mt-6 text-[20px] leading-tight tracking-[-0.02em] text-[#1a1a18]"
                style={{ fontFamily: 'var(--font-fraunces), serif' }}
              >
                {s}
              </h3>

              <p className="mt-3 text-[13px] leading-[1.7] text-[#6b6056]">
                Evidence-based therapeutic guidance tailored to your emotional
                wellbeing and personal growth.
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

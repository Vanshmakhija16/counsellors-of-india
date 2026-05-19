'use client'

import type { TherapistProfile } from '../templateUtils'

interface AboutProps {
  therapist: TherapistProfile
  /** unused — booking has been moved to the Hero card + dedicated Booking section */
  days?: { label: string; date: number; month: string }[]
}

export default function About({ therapist }: AboutProps) {
  const yearsLabel =
    (therapist.experience ?? 0) > 0
      ? `${therapist.experience}+ years`
      : 'Practicing'

  return (
    <section
      id="about"
      className="relative overflow-hidden border-t border-[#b46b50] bg-[#efe7d6]"
    >
      <div className="mx-auto max-w-[1180px] px-6 py-20 lg:px-12 lg:py-24">
        <div className="grid items-start gap-14 lg:grid-cols-[1.05fr_360px]">
          {/* LEFT — bio + philosophy */}
          <div className="max-w-[680px]">
            <div className="mb-6 flex items-center gap-3">
              <span className="h-px w-7 bg-[#b46b50]" />
              <p className="text-[11px] font-medium uppercase tracking-[0.30em] text-[#b46b50]">
                01 — About
              </p>
            </div>

            <h2
              className="max-w-[560px] text-[34px] leading-[1.02] tracking-[-0.03em] text-[#1a1a18] lg:text-[44px]"
              style={{ fontFamily: 'var(--font-fraunces), serif' }}
            >
              A practice built on listening
            </h2>

            <div className="mt-7 space-y-6">
              {therapist.bio ? (
                <p className="text-[17px] leading-[1.85] text-[#2d4a3e]">
                  <span
                    className="mr-2 float-left text-[52px] leading-[0.85] text-[#2d4a3e]"
                    style={{ fontFamily: 'var(--font-fraunces), serif' }}
                  >
                    {therapist.bio.trim().charAt(0) || 'I'}
                  </span>
                  {therapist.bio.trim().slice(1)}
                </p>
              ) : (
                <>
                  <p className="text-[17px] leading-[1.85] text-[#2d4a3e]">
                    <span
                      className="mr-2 float-left text-[52px] leading-[0.85] text-[#2d4a3e]"
                      style={{ fontFamily: 'var(--font-fraunces), serif' }}
                    >
                      I
                    </span>
                    work with adults navigating anxiety, burnout, relationship
                    difficulties, and childhood experiences. My approach is warm,
                    direct, and grounded in evidence — never preachy, never
                    performative.
                  </p>

                  <p className="text-[17px] leading-[1.85] text-[#2d4a3e]">
                    Sessions are collaborative. We move at your pace, with
                    curiosity rather than judgement. Most clients experience
                    meaningful shifts within 8–12 sessions.
                  </p>
                </>
              )}

              {therapist.approach_text && (
                <p className="text-[17px] leading-[1.85] text-[#2d4a3e]">
                  {therapist.approach_text}
                </p>
              )}
            </div>

            {/* pull quote */}
            <div className="mt-10 border-l-2 border-[#b46b50] bg-[#f5ecd6] px-6 py-6">
              <p
                className="text-[22px] italic leading-[1.5] tracking-[-0.01em] text-[#6b6056]"
                style={{ fontFamily: 'var(--font-fraunces), serif' }}
              >
                "Therapy is not about being fixed. It is about being understood."
              </p>
            </div>
          </div>

          {/* RIGHT — credentials & highlights card */}
          <aside className="lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-[20px] border border-[#b46b50] bg-[#f5ecd6] shadow-[0_8px_28px_-12px_rgba(31,42,35,0.12)]">
              {/* header strip */}
              <div className="border-b border-[#efe7d6] bg-[#f5ecd6] px-6 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#6b6056]">
                  Credentials
                </p>
                <p
                  className="mt-2 text-[22px] leading-tight tracking-[-0.02em] text-[#1a1a18]"
                  style={{ fontFamily: 'var(--font-fraunces), serif' }}
                >
                  {therapist.name || 'Your therapist'}
                </p>
                {therapist.credentials && (
                  <p className="mt-1 text-[12px] leading-snug text-[#6b6056]">
                    {therapist.credentials}
                  </p>
                )}
              </div>

              {/* stats row */}
              <div className="grid grid-cols-2 divide-x divide-[#efe7d6] border-b border-[#efe7d6] text-center">
                <div className="px-4 py-5">
                  <p
                    className="text-[26px] leading-none tracking-[-0.02em] text-[#1a1a18]"
                    style={{ fontFamily: 'var(--font-fraunces), serif' }}
                  >
                    {yearsLabel}
                  </p>
                  <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-[#6b6056]">
                    Experience
                  </p>
                </div>
                <div className="px-4 py-5">
                  <p
                    className="text-[26px] leading-none tracking-[-0.02em] text-[#1a1a18]"
                    style={{ fontFamily: 'var(--font-fraunces), serif' }}
                  >
                    {therapist.sessionDuration} min
                  </p>
                  <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-[#6b6056]">
                    Per session
                  </p>
                </div>
              </div>

              {/* meta list */}
              <div className="space-y-4 px-6 py-5 text-[13px] text-[#6b6056]">
                {therapist.location && (
                  <div className="flex items-start gap-3">
                    <svg
                      className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#6b6056]"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 21s-6-5.33-6-11a6 6 0 1112 0c0 5.67-6 11-6 11z" />
                      <circle cx="12" cy="10" r="2.5" />
                    </svg>
                    <span>{therapist.location}</span>
                  </div>
                )}

                {therapist.languages && therapist.languages.length > 0 && (
                  <div className="flex items-start gap-3">
                    <svg
                      className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#6b6056]"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      viewBox="0 0 24 24"
                    >
                      <path d="M4 5h16M4 12h10M4 19h16M15 5c0 7-2 11-6 14" />
                    </svg>
                    <span>{therapist.languages.join(', ')}</span>
                  </div>
                )}

                {therapist.sessionMode && (
                  <div className="flex items-start gap-3">
                    <svg
                      className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#6b6056]"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      viewBox="0 0 24 24"
                    >
                      <rect x="3" y="6" width="14" height="12" rx="2" />
                      <path d="m21 8-4 3 4 3V8z" />
                    </svg>
                    <span>
                      {therapist.sessionMode === 'online'
                        ? 'Online sessions'
                        : therapist.sessionMode === 'offline'
                        ? 'In-person sessions'
                        : 'Online & in-person'}
                    </span>
                  </div>
                )}
              </div>

              {/* education */}
              {therapist.education && therapist.education.length > 0 && (
                <div className="border-t border-[#efe7d6] px-6 py-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#6b6056]">
                    Education
                  </p>
                  <ul className="mt-3 space-y-2 text-[12.5px] leading-[1.55] text-[#6b6056]">
                    {therapist.education.map((e) => (
                      <li key={e} className="flex gap-2">
                        <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-[#b46b50]" />
                        <span>{e}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* certifications */}
              {therapist.certifications && therapist.certifications.length > 0 && (
                <div className="border-t border-[#efe7d6] px-6 py-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#6b6056]">
                    Certifications
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {therapist.certifications.map((c) => (
                      <span
                        key={c}
                        className="rounded-full border border-[#b46b50] bg-white/60 px-2.5 py-1 text-[11px] text-[#6b6056]"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}

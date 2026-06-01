'use client'

import type { TherapistProfile } from '../templateUtils'

interface FooterProps {
  therapist: TherapistProfile
}

export default function Footer({ therapist }: FooterProps) {
  const year = new Date().getFullYear()
  const fullName = therapist.name ?? 'Practice'

  return (
    <footer
      style={{
        background: 'var(--ink-1)',
        borderTop: '1px solid var(--ink-3)',
      }}
      className="px-6 lg:px-10 pt-20 pb-10"
    >
      <div className="mx-auto max-w-[1240px]">
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr] gap-12 mb-16">
          <div>
            <div
              className="ct2-serif"
              style={{ fontSize: 36, lineHeight: 1.1, color: 'var(--bone)', fontStyle: 'italic' }}
            >
              {fullName}.
            </div>
            <p
              className="mt-5"
              style={{ color: 'var(--mute)', lineHeight: 1.7, maxWidth: '40ch' }}
            >
              {therapist.credentials || 'Psychotherapy practice'} based in{' '}
              {therapist.location || 'India'}. Currently accepting a small number of new clients.
            </p>
          </div>

          <div>
            <div className="ct2-eyebrow mb-4">Contact</div>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--bone)' }}>
              {therapist.phone && <li>{therapist.phone}</li>}
              {therapist.whatsapp && <li>WhatsApp · {therapist.whatsapp}</li>}
              {therapist.location && (
                <li style={{ color: 'var(--mute)' }}>{therapist.location}</li>
              )}
            </ul>
          </div>

          <div>
            <div className="ct2-eyebrow mb-4">Elsewhere</div>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--bone)' }}>
              {therapist.instagram && (
                <li>
                  <a
                    href={therapist.instagram}
                    style={{ color: 'var(--bone)' }}
                    className="hover:underline"
                  >
                    Instagram
                  </a>
                </li>
              )}
              {therapist.linkedin && (
                <li>
                  <a
                    href={therapist.linkedin}
                    style={{ color: 'var(--bone)' }}
                    className="hover:underline"
                  >
                    LinkedIn
                  </a>
                </li>
              )}
              {therapist.website && (
                <li>
                  <a
                    href={therapist.website}
                    style={{ color: 'var(--bone)' }}
                    className="hover:underline"
                  >
                    Website
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-8"
          style={{ borderTop: '1px solid var(--ink-3)' }}
        >
          <p
            className="ct2-mono"
            style={{ fontSize: 11, color: 'var(--mute)', letterSpacing: '0.14em' }}
          >
            © {year} {fullName.toUpperCase()} · COUNSELLORS OF INDIA
          </p>
          <p
            className="ct2-mono"
            style={{ fontSize: 11, color: 'var(--mute)', letterSpacing: '0.14em' }}
          >
            EDITORIAL DARK · CT2
          </p>
        </div>
      </div>
    </footer>
  )
}

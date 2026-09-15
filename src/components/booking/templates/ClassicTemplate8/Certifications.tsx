'use client'

import { useRef, useState } from 'react'
import type { TherapistProfile } from '../templateUtils'
import { resolveCT8Content } from '../templateUtils'

interface CertificationsProps { therapist: TherapistProfile }

// Fallback images for certification entries saved before the `image` field
// existed (or added without one via the editor) — cycles through the
// certificate photos already sitting in /public so the carousel still shows
// something real instead of an empty placeholder.
const FALLBACK_IMAGES = ['/certificate1.png', '/certificate2.jpg', '/certificate3.jpg']

export default function Certifications({ therapist }: CertificationsProps) {
  const ct8 = resolveCT8Content(therapist.profile_content?.classic8)
  const items = ct8.certifications
  if (items.length === 0) return null

  const trackRef = useRef<HTMLDivElement | null>(null)
  const [active, setActive] = useState(0)

  // Tracks which card is currently centered/leading in the viewport so the
  // dot indicator stays in sync as the person swipes or drags a scrollbar.
  const handleScroll = () => {
    const track = trackRef.current
    if (!track) return
    const card = track.querySelector<HTMLElement>('.ct8-cert-slide')
    const step = card ? card.offsetWidth + 44 : track.clientWidth
    const i = Math.round(track.scrollLeft / step)
    setActive(Math.max(0, Math.min(items.length - 1, i)))
  }

  const goTo = (i: number) => {
    const track = trackRef.current
    if (!track) return
    const card = track.querySelector<HTMLElement>('.ct8-cert-slide')
    const step = card ? card.offsetWidth + 44 : track.clientWidth
    track.scrollTo({ left: i * step, behavior: 'smooth' })
  }

  return (
    <section id="certifications" className="ct8-section ct8-section-alt ct8-cert-section-vh " style={{ background: '#F0EEE6' }} >
      <div className="ct8-container">
        <div className="ct8-section-head">
          <span className="ct8-eyebrow">Certifications &amp; Workshops</span>
          <h2 className="ct8-heading ct8-section-title">Beyond the core degree</h2>
        </div>

        <div className="ct8-cert-carousel ct8-reveal">
          <div
            className="ct8-cert-track"
            ref={trackRef}
            onScroll={handleScroll}
          >
            {items.map((c, i) => {
              const src = c.image || FALLBACK_IMAGES[i % FALLBACK_IMAGES.length]
              return (
                <div key={i} className="ct8-cert-slide">
                  <div className="ct8-cert-slide-frame">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={c.title} className="ct8-cert-slide-img" draggable={false} />
                  </div>
                </div>
              )
            })}
          </div>

          {items.length > 1 && (
            <div className="ct8-cert-dots">
              {items.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`ct8-cert-dot${i === active ? ' ct8-cert-dot--active' : ''}`}
                  onClick={() => goTo(i)}
                  aria-label={`Go to certificate ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

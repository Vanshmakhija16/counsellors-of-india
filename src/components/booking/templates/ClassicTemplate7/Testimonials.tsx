'use client'

import { useRef } from 'react'
import type { TherapistProfile, Review } from '../templateUtils'
import { useCt7Reveal } from './_reveal'

// Same shape as the other templates' published feedback rows (from the
// dashboard's Feedback Manager).
export interface CT7FeedbackItem {
  id: string
  client_name: string
  client_role: string | null
  rating: number
  text: string
  created_at: string
}

interface TestimonialsProps { therapist: TherapistProfile; feedbacks?: CT7FeedbackItem[] }

const FALLBACK: Review[] = [
  { name: 'A. M.', rating: 5, text: 'I came in feeling completely lost. Months later I have language for my feelings, tools for hard days, and a relationship with myself I never thought possible.' },
  { name: 'R. V.', rating: 5, text: 'I was nervous about therapy. Somehow it never once felt like being assessed \u2014 just genuinely heard, week after week.' },
  { name: 'S. P.', rating: 5, text: 'Unhurried, honest, and kind. I never felt rushed toward an answer I wasn\u2019t ready for.' },
]

function entryLabel(idx: number, createdAt?: string) {
  if (createdAt) {
    const d = new Date(createdAt)
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }).toUpperCase()
    }
  }
  return `ENTRY / ${String(idx + 1).padStart(2, '0')}`
}

export default function Testimonials({ therapist, feedbacks }: TestimonialsProps) {
  const rootRef = useRef<HTMLElement | null>(null)
  useCt7Reveal(rootRef)

  const reviews = feedbacks?.length
    ? feedbacks.map(f => ({
        name: f.client_role ? `${f.client_name}, ${f.client_role}` : f.client_name,
        text: f.text,
        createdAt: f.created_at,
      }))
    : therapist.reviews?.length
      ? therapist.reviews.map(r => ({ name: r.name, text: r.text, createdAt: undefined }))
      : FALLBACK.map(r => ({ name: r.name, text: r.text, createdAt: undefined }))

  return (
    <section id="testimonials" ref={rootRef} className="ct7-section" style={{ background: 'var(--ct7-ink)' }}>
      <style>{`
        .ct7-tm-inner { max-width: 900px; margin: 0 auto; padding: 0 clamp(20px,5vw,56px); }
        .ct7-tm-row {
          padding: clamp(28px, 4vw, 40px) 0; border-top: 1px solid rgba(246,241,231,0.1);
        }
        .ct7-tm-row:last-child { border-bottom: 1px solid rgba(246,241,231,0.1); }
        .ct7-tm-tag {
          font-family: 'JetBrains Mono', monospace; font-size: 10.5px; letter-spacing: 0.1em;
          color: var(--ct7-brass); text-transform: uppercase; margin-bottom: 14px; display: block;
        }
        .ct7-tm-quote {
          font-family: 'Fraunces', Georgia, serif; font-style: italic; font-weight: 400;
          font-size: clamp(19px, 2.4vw, 25px); line-height: 1.5; color: #F6F1E7; margin: 0 0 14px; max-width: 62ch;
        }
        .ct7-tm-attr {
          font-family: 'Inter', system-ui, sans-serif; font-size: 12.5px; color: rgba(246,241,231,0.5);
        }
      `}</style>

      <div className="ct7-section-head" style={{ margin: '0 auto clamp(32px, 5vw, 56px)' }}>
        <span className="ct7-eyebrow ct7-reveal">What clients say</span>
        <h2 className="ct7-section-title ct7-reveal-clip" style={{ color: '#F6F1E7' }}>Entries from the <em>register</em>.</h2>
      </div>

      <div className="ct7-tm-inner">
        {reviews.slice(0, 4).map((r, i) => (
          <div key={i} className="ct7-tm-row ct7-reveal">
            <span className="ct7-tm-tag">{entryLabel(i, r.createdAt)}</span>
            <p className="ct7-tm-quote">&ldquo;{r.text}&rdquo;</p>
            <p className="ct7-tm-attr">&mdash; {r.name}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MapPin, Star, Clock, CheckCircle, Sparkles } from 'lucide-react'

const templates = [
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean and distraction-free',
    accent: '#a3b8b4',
    accentLight: '#d4e4e1',
    therapist: 'Dr. Vansh Makhija',
    title: 'Clinical Psychologist',
    city: 'Mumbai',
    fee: '₹1,500',
    rating: '4.9',
    specialties: ['Anxiety', 'Depression', 'CBT'],
    bio: 'Helping individuals navigate life transitions with evidence-based approaches for over 8 years.',
  },
  {
    id: 'warm',
    name: 'Warm',
    description: 'Friendly and approachable',
    accent: '#D97706',
    accentLight: '#FFFBEB',
    therapist: 'Meera Krishnan',
    title: 'Counselling Psychologist',
    city: 'Bangalore',
    fee: '₹1,200',
    rating: '4.8',
    specialties: ['Relationships', 'Grief', 'Stress'],
    bio: 'Creating a safe, non-judgmental space where you can explore your thoughts and feelings freely.',
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Structured and formal',
    accent: '#ff9933',
    accentLight: '#EEF2FF',
    therapist: 'Dr. Arjun Mehta',
    title: 'Psychiatrist & Therapist',
    city: 'Delhi',
    fee: '₹2,000',
    rating: '5.0',
    specialties: ['Trauma', 'OCD', 'ADHD'],
    bio: 'Board-certified psychiatrist offering integrated psychiatric care and psychotherapy sessions.',
  },
]

export default function TemplateShowcase() {
  const [active, setActive] = useState('minimal')

  const current = templates.find(t => t.id === active)!

  return (
<section className="py-24 bg-gradient-to-b from-[#f8fbfa] to-white overflow-visible">
        <div className="max-w-5xl mx-auto px-6">

        {/* Heading */}
        <div className="text-center mb-12">
          <span className="text-[#5a7f7a] text-sm font-medium tracking-wide uppercase">
            Portfolio templates
          </span>
          <h2
            className="text-4xl font-semibold text-gray-900 mt-2"
            style={{ fontFamily: 'var(--font-cormorant), serif' }}
          >
            Your profile, your style
          </h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">
            Choose from professionally designed templates. 
            Every template includes a built-in booking form for your clients.
          </p>
        </div>

        {/* Template tabs */}
        <div className="flex gap-3 justify-center mb-10">
          {templates.map(t => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={`
                px-5 py-2.5 rounded-lg text-sm font-medium transition border
                ${active === t.id
                  ? 'bg-[#a3b8b4] text-white border-[#a3b8b4]'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}
              `}
            >
              {t.name}
            </button>
          ))}
        </div>

        {/* Preview card */}
<div className="max-w-sm mx-auto pt-14">
            <div className="text-xs text-center text-gray-400 mb-3 font-medium tracking-wide uppercase">
            Live preview — {current.name} template
          </div>

<div
  className="
    bg-white rounded-2xl border border-gray-200 overflow-hidden
    shadow-[0_28px_70px_rgba(0,0,0,0.14)]
    transition-all duration-500
    relative z-10
    -translate-y-6 scale-[1.03]
  "

>


  <div
    className="absolute inset-0 rounded-2xl pointer-events-none"
    style={{
      boxShadow: `0 0 0 1px ${current.accent}20`,
    }}
  />


            {/* Template header banner */}
            <div
              className="h-28 w-full"
              style={{ backgroundColor: current.accentLight }}
            />

            {/* Avatar + info */}
<div className="px-6 pb-6 -mt-14 relative z-20">
              {/* Avatar */}
              <div
className="
  w-20 h-20 rounded-full border-4 border-white
  flex items-center justify-center
  text-white text-2xl font-semibold
  shadow-[0_10px_30px_rgba(0,0,0,0.18)]
  mb-3
"                style={{ backgroundColor: current.accent }}
              >
                {current.therapist.split(' ').map(w => w[0]).join('').slice(0, 2)}
              </div>

              {/* Name & title */}
              <h3 className="text-lg font-semibold text-gray-900">
                {current.therapist}
              </h3>
              <p className="text-sm text-gray-500 mb-1">{current.title}</p>

              {/* Meta row */}
              <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                <span className="flex items-center gap-1">
                  <MapPin size={11} /> {current.city}
                </span>
                <span className="flex items-center gap-1">
                  <Star size={11} className="text-amber-400 fill-amber-400" />
                  {current.rating}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={11} /> 50 min
                </span>
              </div>

              {/* Bio */}
              <p className="text-xs text-gray-500 leading-relaxed mb-4">
                {current.bio}
              </p>

              {/* Specialties */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {current.specialties.map(s => (
                  <span
                    key={s}
                    className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{
                      backgroundColor: current.accentLight,
                      color: current.accent,
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>

              {/* Fee + Book */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-400">Per session</p>
                  <p className="text-xl font-semibold text-gray-900"
                    style={{ fontFamily: 'var(--font-cormorant), serif' }}>
                    {current.fee}
                  </p>
                </div>
                <button
                  className="px-5 py-2.5 rounded-lg text-sm text-white font-medium transition"
                  style={{ backgroundColor: current.accent }}
                >
                  Book Session
                </button>
              </div>

              {/* Trust badge */}
              <div className="flex items-center gap-1.5 text-xs text-gray-400 border-t border-gray-100 pt-3">
                <CheckCircle size={12} className="text-[#a3b8b4]" />
                Verified on Counsellors of India
              </div>

            </div>
          </div>

          {/* Description */}
          <p className="text-center text-sm text-gray-400 mt-4">
            {current.description} · Available on all paid plans
          </p>
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link
              href="/try"
              className="inline-flex items-center gap-2 bg-[#1c1c1e] text-white
                         px-8 py-3 rounded-lg font-medium hover:bg-black transition"
            >
              <Sparkles size={16} /> Try with my details
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-white text-[#5a7f7a] border border-[#cdded9]
                         px-8 py-3 rounded-lg font-medium hover:border-[#a3b8b4] transition"
            >
              Create your free profile
            </Link>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            See your name on a real template in seconds · No signup needed
          </p>
        </div>

      </div>
    </section>
  )
}
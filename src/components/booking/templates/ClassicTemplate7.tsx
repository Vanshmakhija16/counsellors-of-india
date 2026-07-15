'use client'

// ───────────────────────────────────────────────────────────────────────────
// "The Atrium" (classic7) — premium template.
// A counted-in loading ritual leads into the hero, then the rest of the
// site continues that restraint as "The Ledger": numbered, editorial
// sections on a soothing sand/sage palette, closing with an elevated
// "Ceremony" booking panel that echoes the loader's step-counting motif.
// ───────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import type { TherapistProfile } from './templateUtils'
import { getOrderedSections } from '@/lib/template'
import { ct7Styles } from './ClassicTemplate7/styles'
import { useCt7ScrollFx } from './ClassicTemplate7/_scrollFx'
import { useCt7Rooms } from './ClassicTemplate7/_rooms'
import Loader from './ClassicTemplate7/Loader'
import Navbar from './ClassicTemplate7/Navbar'
import Hero from './ClassicTemplate7/Hero'
import About from './ClassicTemplate7/About'
import Expertise from './ClassicTemplate7/Expertise'
import Process from './ClassicTemplate7/Process'
import Testimonials, { type CT7FeedbackItem } from './ClassicTemplate7/Testimonials'
import FAQ from './ClassicTemplate7/FAQ'
import Booking from './ClassicTemplate7/Booking'
import Footer from './ClassicTemplate7/Footer'

interface ClassicTemplate7Props {
  therapist: TherapistProfile
  bookedTimes?: string[]
  hiddenSections?: string[]
  feedbacks?: CT7FeedbackItem[]
}

export default function ClassicTemplate7({ therapist, bookedTimes = [], hiddenSections = [], feedbacks = [] }: ClassicTemplate7Props) {
  const [loaded, setLoaded] = useState(false)
  useCt7ScrollFx()
  useCt7Rooms()

  const orderedIds = getOrderedSections('classic7', therapist.section_order, hiddenSections).map(s => s.id)

  function scrollTo(id: string) {
    const target = document.getElementById(id)
    if (!target) return
    const y = target.getBoundingClientRect().top + window.scrollY - 12
    window.scrollTo({ top: y, behavior: 'smooth' })
  }

  return (
    <div className="ct7-root">
      <style>{ct7Styles}</style>
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;1,9..144,400&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
        rel="stylesheet"
      />

      <Loader onDone={() => setLoaded(true)} therapistName={therapist.name} />

      <Navbar therapist={therapist} scrollTo={scrollTo} />

      <div className={`ct7-stage ${loaded ? 'ct7-stage--in' : ''}`}>
        {orderedIds.map(id => {
          switch (id) {
            case 'hero':         return <Hero key={id} therapist={therapist} scrollTo={scrollTo} />
            case 'about':        return <About key={id} therapist={therapist} />
            case 'expertise':    return <Expertise key={id} therapist={therapist} />
            case 'process':      return <Process key={id} />
            case 'testimonials': return <Testimonials key={id} therapist={therapist} feedbacks={feedbacks} />
            case 'faq':          return <FAQ key={id} />
            case 'booking':      return <Booking key={id} therapist={therapist} bookedTimes={bookedTimes} />
            case 'footer':       return <Footer key={id} therapist={therapist} scrollTo={scrollTo} />
            default: return null
          }
        })}
      </div>
    </div>
  )
}

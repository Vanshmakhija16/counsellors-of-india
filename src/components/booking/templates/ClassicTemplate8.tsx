'use client'

// ───────────────────────────────────────────────────────────────────────────
// "The Common Room" (classic8) — built to genuinely serve two different
// audiences on one page: students (budget, flexibility, informal warmth)
// and working professionals (credibility, discretion, structure).
//
// Mechanic: a persona toggle in the hero re-tints the accent color (via a
// data-persona attribute on the root) and swaps supporting copy, so the
// SAME page quietly leans toward whichever visitor is looking at it.
// ───────────────────────────────────────────────────────────────────────────

import { useRef, useState } from 'react'
import type { TherapistProfile } from './templateUtils'
import { getOrderedSections } from '@/lib/template'
import { ct8Styles } from './ClassicTemplate8/styles'
import { useCt8Reveal } from './ClassicTemplate8/_reveal'
import Navbar from './ClassicTemplate8/Navbar'
import Hero, { type Persona } from './ClassicTemplate8/Hero'
import About from './ClassicTemplate8/About'
import Education from './ClassicTemplate8/Education'
import Research from './ClassicTemplate8/Research'
import Experience from './ClassicTemplate8/Experience'
import Skills from './ClassicTemplate8/Skills'
import Certifications from './ClassicTemplate8/Certifications'
import Recommendations from './ClassicTemplate8/Recommendations'
import Services from './ClassicTemplate8/Services'
import FAQ from './ClassicTemplate8/FAQ'
import Booking from './ClassicTemplate8/Booking'
import Footer from './ClassicTemplate8/Footer'

interface ClassicTemplate8Props {
  therapist: TherapistProfile
  bookedTimes?: string[]
  hiddenSections?: string[]
}

export default function ClassicTemplate8({ therapist, bookedTimes = [], hiddenSections = [] }: ClassicTemplate8Props) {
  const [persona, setPersona] = useState<Persona>(null)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const orderedIds = getOrderedSections('classic8', therapist.section_order, hiddenSections).map(s => s.id)
  useCt8Reveal(rootRef, [orderedIds.join(',')])

  function scrollTo(id: string) {
    const target = document.getElementById(id)
    if (!target) return
    const y = target.getBoundingClientRect().top + window.scrollY - 12
    window.scrollTo({ top: y, behavior: 'smooth' })
  }

  return (
    <div className="ct8-root" data-persona={persona ?? undefined} ref={rootRef}>
      <style>{ct8Styles}</style>
      <link
        href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=Inter:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />

      <Navbar therapist={therapist} scrollTo={scrollTo} />

      <main>
        {orderedIds.map(id => {
          switch (id) {
            case 'hero':     return <Hero key={id} therapist={therapist} />
            case 'about':    return <About key={id} therapist={therapist} />
            case 'education':       return <Education key={id} therapist={therapist} />
            case 'research':        return <Research key={id} therapist={therapist} />
            case 'experience':      return <Experience key={id} therapist={therapist} />
            case 'skills':          return <Skills key={id} therapist={therapist} />
            case 'certifications':  return <Certifications key={id} therapist={therapist} />
            case 'recommendations': return <Recommendations key={id} therapist={therapist} />
            case 'services': return <Services key={id} therapist={therapist} persona={persona} />
            case 'faq':      return <FAQ key={id} therapist={therapist} />
            case 'booking':  return <Booking key={id} therapist={therapist} bookedTimes={bookedTimes} />
            case 'footer':   return <Footer key={id} therapist={therapist} />
            default: return null
          }
        })}
      </main>
    </div>
  )
}

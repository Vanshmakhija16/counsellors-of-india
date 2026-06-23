'use client'

// ───────────────────────────────────────────────────────────────────────────
// "The Quiet Room" (classic6) — a therapy-practice template whose light shifts
// from dusk → daylight → dusk as the visitor goes deeper. Each section is its
// own file under ./QuietRoom; this root just orders and assembles them.
// ───────────────────────────────────────────────────────────────────────────

import type { TherapistProfile } from './templateUtils'
import { getOrderedSections } from '@/lib/template'
import { quietRoomStyles } from './QuietRoom/styles'
import Navbar from './QuietRoom/Navbar'
import Hero from './QuietRoom/Hero'
import About from './QuietRoom/About'
import Expertise from './QuietRoom/Expertise'
import Process from './QuietRoom/Process'
import Testimonials from './QuietRoom/Testimonials'
import FAQ from './QuietRoom/FAQ'
import Readings from './QuietRoom/Readings'
import Booking from './QuietRoom/Booking'
import Footer from './QuietRoom/Footer'

interface ClassicTemplate6Props {
  therapist: TherapistProfile
  bookedTimes?: string[]
  hiddenSections?: string[]
}

export default function ClassicTemplate6({ therapist, bookedTimes = [], hiddenSections = [] }: ClassicTemplate6Props) {
  const orderedIds = getOrderedSections('classic6', therapist.section_order, hiddenSections).map(s => s.id)

  // Scroll only THIS document's window (never asks a parent iframe host).
  function scrollTo(id: string) {
    const target = document.getElementById(id)
    if (!target) return
    const y = target.getBoundingClientRect().top + window.scrollY - 12
    window.scrollTo({ top: y, behavior: 'smooth' })
  }

  return (
    <div className="qr-root">
      <style>{quietRoomStyles}</style>
      <link
        href="https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,300;0,400;1,300;1,400&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"
        rel="stylesheet"
      />

      <Navbar scrollTo={scrollTo} therapist={therapist} />

      {orderedIds.map(id => {
        switch (id) {
          case 'hero':         return <Hero key={id} therapist={therapist} scrollTo={scrollTo} />
          case 'about':        return <About key={id} therapist={therapist} />
          case 'expertise':    return <Expertise key={id} therapist={therapist} />
          case 'process':      return <Process key={id} />
          case 'testimonials': return <Testimonials key={id} therapist={therapist} />
          case 'faq':          return <FAQ key={id} therapist={therapist} />
          case 'readings':     return <Readings key={id} therapist={therapist} />
          case 'booking':      return <Booking key={id} therapist={therapist} bookedTimes={bookedTimes} />
          case 'footer':       return <Footer key={id} therapist={therapist} scrollTo={scrollTo} />
          default: return null
        }
      })}
    </div>
  )
}

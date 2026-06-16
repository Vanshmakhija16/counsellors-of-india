'use client'

import { useEffect, useRef, useState } from 'react'
import type { TherapistProfile } from './templateUtils'
import { getOrderedSections } from '@/lib/template'
import { ct5Styles } from './ClassicTemplate5/styles'
import Navbar from './ClassicTemplate5/Navbar'
import Hero from './ClassicTemplate5/Hero'
import Ticker from './ClassicTemplate5/Ticker'
import About from './ClassicTemplate5/About'
import Services from './ClassicTemplate5/Services'
import Insights from './ClassicTemplate5/Insights'
import FAQ from './ClassicTemplate5/FAQ'
import Booking from './ClassicTemplate5/Booking'
import Footer from './ClassicTemplate5/Footer'

interface ClassicTemplate5Props {
  therapist: TherapistProfile
  bookedTimes?: string[]
  hiddenSections?: string[]
}

export default function ClassicTemplate5({ therapist, bookedTimes = [], hiddenSections = [] }: ClassicTemplate5Props) {
  const show = (id: string) => !hiddenSections.includes(id)
  const orderedIds = getOrderedSections('classic5', therapist.section_order, hiddenSections).map(s => s.id)
  const [loaded, setLoaded] = useState(false)
  const heroRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const t = window.setTimeout(() => setLoaded(true), 80)
    return () => window.clearTimeout(t)
  }, [])

  function scrollTo(id: string) {
    const target = document.getElementById(id)
    if (!target) return
    // Scroll only THIS document's own window — never asks a parent (e.g. the
    // live-preview iframe's host page) to scroll the iframe into view.
    const y = target.getBoundingClientRect().top + window.scrollY - 20
    window.scrollTo({ top: y, behavior: 'smooth' })
  }

  return (
    <div className="ct5">
      <style>{ct5Styles}</style>
      <Navbar scrollTo={scrollTo} therapist={therapist} />
      <main>
        {orderedIds.map(id => {
          switch (id) {
            case 'hero':     return <Hero key={id} therapist={therapist} loaded={loaded} heroRef={heroRef} />
            case 'ticker':   return <Ticker key={id} />
            case 'about':    return <About key={id} therapist={therapist} />
            case 'services': return <Services key={id} therapist={therapist} />
            case 'insights': return <Insights key={id} therapist={therapist} />
            case 'faq':      return <FAQ key={id} />
            case 'booking':  return <Booking key={id} therapist={therapist} bookedTimes={bookedTimes} />
            case 'footer':   return <Footer key={id} therapist={therapist} />
            default: return null
          }
        })}
      </main>
    </div>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'
import type { TherapistProfile, EditableService } from './templateUtils'
import { ct4Styles } from './ClassicTemplate4/styles'
import Navbar from './ClassicTemplate4/Navbar'
import Hero from './ClassicTemplate4/Hero'
import Ticker from './ClassicTemplate4/Ticker'
import About from './ClassicTemplate4/About'
import Services from './ClassicTemplate4/Services'
import Insights from './ClassicTemplate4/Insights'
import FAQ from './ClassicTemplate4/FAQ'
import Booking from './ClassicTemplate4/Booking'
import Footer from './ClassicTemplate4/Footer'

interface ClassicTemplate4Props {
  therapist: TherapistProfile
  bookedTimes?: string[]
  hiddenSections?: string[]
}

export default function ClassicTemplate4({ therapist, bookedTimes = [], hiddenSections = [] }: ClassicTemplate4Props) {
  const show = (id: string) => !hiddenSections.includes(id)
  const [loaded, setLoaded] = useState(false)
  const heroRef = useRef<HTMLElement | null>(null)
  const rootRef = useRef<HTMLDivElement | null>(null)

  // Lifted state: which service was "Book Now" clicked on
  const [selectedService, setSelectedService] = useState<EditableService | null>(null)

  useEffect(() => {
    const t = window.setTimeout(() => setLoaded(true), 80)
    return () => window.clearTimeout(t)
  }, [])

  // Scroll helper — works both inside the LivePreview iframe-like div and on the real page
  function scrollTo(id: string) {
    // Try inside our root container first (handles LivePreview's overflow-y scroll)
    const root = rootRef.current
    const target = root
      ? (root.querySelector(`#${id}`) as HTMLElement | null)
      : (document.getElementById(id))

    if (!target) return

    // If the root container itself scrolls, scroll within it
    const scrollParent = root?.closest('[style*="overflow"]') as HTMLElement | null
    if (scrollParent) {
      const parentRect = scrollParent.getBoundingClientRect()
      const targetRect = target.getBoundingClientRect()
      scrollParent.scrollBy({ top: targetRect.top - parentRect.top - 20, behavior: 'smooth' })
    } else {
      // Scroll only THIS document's own window — never asks a parent (e.g. the
      // live-preview iframe's host page) to scroll the iframe into view.
      const y = target.getBoundingClientRect().top + window.scrollY - 20
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  function handleBookService(service: EditableService) {
    setSelectedService(service)
    // Small timeout so state is set before we scroll, avoiding layout shift
    setTimeout(() => scrollTo('book'), 50)
  }

  return (
    <div className="ct4-root" ref={rootRef}>
      <style>{ct4Styles}</style>
      <Navbar scrollTo={scrollTo} therapist={therapist} />
      <main>
        {show('hero')     && <Hero     therapist={therapist} loaded={loaded} heroRef={heroRef} />}
        {show('ticker')   && <Ticker   therapist={therapist} />}
        {show('about')    && <About    therapist={therapist} />}
        {show('services') && <Services therapist={therapist} onBookService={handleBookService} />}
        {show('insights') && <Insights therapist={therapist} />}
        {show('booking')  && (
          <Booking
            therapist={therapist}
            bookedTimes={bookedTimes}
            selectedService={selectedService}
            onClearService={() => setSelectedService(null)}
          />
        )}
        {show('faq')      && <FAQ      therapist={therapist} />}
        {show('footer')   && <Footer   therapist={therapist} />}
      </main>
    </div>
  )
}

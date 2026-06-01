'use client'

import { useEffect, useRef, useState } from 'react'
import type { TherapistProfile, EditableService } from './templateUtils'
import { ct3Styles } from './ClassicTemplate3/styles'
import SideNav  from './ClassicTemplate3/SideNav'
import Hero     from './ClassicTemplate3/Hero'
import About    from './ClassicTemplate3/About'
import Services from './ClassicTemplate3/Services'
import Insights from './ClassicTemplate3/Insights'
import FAQ      from './ClassicTemplate3/FAQ'
import Booking  from './ClassicTemplate3/Booking'
import Footer   from './ClassicTemplate3/Footer'

interface ClassicTemplate3Props {
  therapist: TherapistProfile
  bookedTimes?: string[]
  hiddenSections?: string[]
}

export default function ClassicTemplate3({ therapist, bookedTimes = [], hiddenSections = [] }: ClassicTemplate3Props) {
  const show = (id: string) => !hiddenSections.includes(id)
  const [heroLoaded, setHeroLoaded]           = useState(false)
  const heroRef                               = useRef<HTMLElement | null>(null)
  const rootRef                               = useRef<HTMLDivElement | null>(null)
  const [selectedService, setSelectedService] = useState<EditableService | null>(null)

  useEffect(() => {
    const t = window.setTimeout(() => setHeroLoaded(true), 80)
    return () => window.clearTimeout(t)
  }, [])

  // Scroll that works both on the real page and inside the LivePreview container
  function scrollTo(id: string) {
    const root   = rootRef.current
    const target = root
      ? (root.querySelector(`#${id}`) as HTMLElement | null)
      : document.getElementById(id)
    if (!target) return

    const scrollParent = root?.closest('[style*="overflow"]') as HTMLElement | null
    if (scrollParent) {
      const pr = scrollParent.getBoundingClientRect()
      const tr = target.getBoundingClientRect()
      scrollParent.scrollBy({ top: tr.top - pr.top - 20, behavior: 'smooth' })
    } else {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  function handleBookService(svc: EditableService) {
    setSelectedService(svc)
    setTimeout(() => scrollTo('book'), 50)
  }

  return (
    <div className="ct3-root" ref={rootRef}>
      <style>{ct3Styles}</style>
      <SideNav scrollTo={scrollTo} therapist={therapist} />
      <div style={{ paddingTop: 'var(--nav-h)' }}>
        {show('hero')     && <Hero therapist={therapist} heroLoaded={heroLoaded} heroRef={heroRef} />}
        {/* About includes the ticker above it */}
        {show('about')    && <About therapist={therapist} />}
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
                {show('faq')      && <FAQ therapist={therapist} />}

        {show('footer')   && <Footer therapist={therapist} />}
      </div>
    </div>
  )
}

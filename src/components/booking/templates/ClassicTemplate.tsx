'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { TherapistProfile, getNext7Days, resolveCT1Content } from './templateUtils'
import { getOrderedSections } from '@/lib/template'
import { globalStyles } from './ClassicTemplate/styles'
import Navbar from './ClassicTemplate/Navbar'
import Hero from './ClassicTemplate/Hero'
import About from './ClassicTemplate/About'
import Services, { type ServiceItem } from './ClassicTemplate/Services'
import Expertise from './ClassicTemplate/Expertise'
import Carousel from './ClassicTemplate/Carousel'
import Booking from './ClassicTemplate/Booking'
import Footer from './ClassicTemplate/Footer'
import Feedback, { type FeedbackItem } from './ClassicTemplate/Feedback'

interface ClassicTemplateProps {
  therapist: TherapistProfile
  slots?: any[]
  bookedTimes?: string[]
  feedbacks?: FeedbackItem[]
  hiddenSections?: string[]
}

// Hardcoded carousel slide backgrounds/accents (visual only, not editable)
const SLIDE_STYLES = [
  { bg: 'linear-gradient(135deg, #1a2e2b 0%, #243d38 60%, #1c3330 100%)', accent: '#a8c5be' },
  { bg: 'linear-gradient(135deg, #2d1f14 0%, #3d2b1a 60%, #2a1c10 100%)', accent: '#c9a97a' },
  { bg: 'linear-gradient(135deg, #1e1e2e 0%, #262636 60%, #1a1a28 100%)', accent: '#9b8ec4' },
  { bg: 'linear-gradient(135deg, #1f2a1f 0%, #293829 60%, #1c2b1c 100%)', accent: '#8ab89a' },
  { bg: 'linear-gradient(135deg, #1f2430 0%, #29303f 60%, #1a1f2a 100%)', accent: '#7a9fc4' },
]

export default function ClassicTemplate({ therapist, bookedTimes = [], feedbacks = [], hiddenSections = [] }: ClassicTemplateProps) {
  const show = (id: string) => !hiddenSections.includes(id)
  const orderedIds = getOrderedSections('classic', therapist.section_order, hiddenSections).map(s => s.id)
  const days = getNext7Days()
  const rootRef = useRef<HTMLDivElement | null>(null)

  // ── Resolve saved content from profile_content ──────────────────────────
  // resolveCT1Content falls back to defaults only when the field is undefined/null
  // (never set), but respects [] as intentional empty (Array.isArray check).
  const ct1 = resolveCT1Content((therapist.profile_content as any)?.classic)

  // Map CT1 services → ServiceItem shape the Services component expects
  const servicesData: ServiceItem[] = ct1.services.map((s, i) => ({
    code:    s.code ?? `S/${String(i + 1).padStart(2, '0')}`,
    title:   s.name,
    kind:    s.kind ?? '',
    desc:    s.desc,
    forWhom: s.forWhom ?? [],
    price:   s.price,
  }))

  // Map CT1 carousel slides → the shape Carousel expects, merging visual styles
  const carouselSlides = ct1.carousel.map((slide, i) => ({
    ...slide,
    ...(SLIDE_STYLES[i % SLIDE_STYLES.length]),
  }))

  const baseSlides = carouselSlides.length > 0 ? carouselSlides : []
  const slides = therapist.specialties && therapist.specialties.length > 0
    ? [...baseSlides, { type: 'specialties', bg: 'linear-gradient(135deg, #2a1f1f 0%, #3a2929 60%, #251a1a 100%)', accent: '#c49090', headline: 'Areas of Focus', items: therapist.specialties, tag: 'Specialties' }]
    : baseSlides

  const [scrolled, setScrolled] = useState(false)
  const [heroLoaded, setHeroLoaded] = useState(false)
  const heroRef = useRef<HTMLElement | null>(null)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [carouselAnim, setCarouselAnim] = useState<'idle' | 'left' | 'right'>('idle')
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const svcTrackRef = useRef<HTMLDivElement | null>(null)
  const [svcCanPrev, setSvcCanPrev] = useState(false)
  const [svcCanNext, setSvcCanNext] = useState(true)

  // Lifted state for selected service
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null)

  const updateSvcArrows = useCallback(() => {
    const el = svcTrackRef.current
    if (!el) return
    setSvcCanPrev(el.scrollLeft > 4)
    setSvcCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  const scrollSvc = useCallback((dir: 1 | -1) => {
    const el = svcTrackRef.current
    if (!el) return
    const card = el.querySelector('.ct-svc-card') as HTMLElement | null
    const step = card ? card.offsetWidth + 28 : el.clientWidth * 0.8
    el.scrollBy({ left: step * dir, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    const el = svcTrackRef.current
    if (!el) return
    updateSvcArrows()
    el.addEventListener('scroll', updateSvcArrows, { passive: true })
    window.addEventListener('resize', updateSvcArrows)
    return () => { el.removeEventListener('scroll', updateSvcArrows); window.removeEventListener('resize', updateSvcArrows) }
  }, [updateSvcArrows])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const t = window.setTimeout(() => setHeroLoaded(true), 60)
    const hero = heroRef.current
    if (!hero) return () => window.clearTimeout(t)
    let raf = 0, targetX = 0, targetY = 0, curX = 0, curY = 0
    const onMove = (e: MouseEvent) => {
      const rect = hero.getBoundingClientRect()
      targetX = (e.clientX - rect.left - rect.width / 2) / rect.width
      targetY = (e.clientY - rect.top - rect.height / 2) / rect.height
    }
    const loop = () => {
      curX += (targetX - curX) * 0.08; curY += (targetY - curY) * 0.08
      hero.style.setProperty('--px', curX.toFixed(3)); hero.style.setProperty('--py', curY.toFixed(3))
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => { window.clearTimeout(t); cancelAnimationFrame(raf); window.removeEventListener('mousemove', onMove) }
  }, [])

  const startAuto = useCallback(() => {
    if (autoRef.current) clearInterval(autoRef.current)
    autoRef.current = setInterval(() => goNext(), 5000)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    startAuto()
    return () => { if (autoRef.current) clearInterval(autoRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carouselIndex])

  function goNext() {
    setCarouselAnim('left')
    setTimeout(() => { setCarouselIndex(i => (i + 1) % slides.length); setCarouselAnim('idle') }, 380)
    startAuto()
  }
  function goPrev() {
    setCarouselAnim('right')
    setTimeout(() => { setCarouselIndex(i => (i - 1 + slides.length) % slides.length); setCarouselAnim('idle') }, 380)
    startAuto()
  }

  function scrollTo(id: string) {
    const root = rootRef.current
    const target = root
      ? (root.querySelector(`#${id}`) as HTMLElement | null)
      : document.getElementById(id)
    if (!target) return
    const scrollParent = root?.closest('[style*="overflow"]') as HTMLElement | null
    if (scrollParent) {
      const parentRect = scrollParent.getBoundingClientRect()
      const targetRect = target.getBoundingClientRect()
      scrollParent.scrollBy({ top: targetRect.top - parentRect.top - 20, behavior: 'smooth' })
    } else {
      const y = target.getBoundingClientRect().top + window.scrollY - 20
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  function handleBookService(service: ServiceItem) {
    setSelectedService(service)
    setTimeout(() => scrollTo('contact'), 50)
  }

  const slide = slides[carouselIndex] ?? slides[0]

  const sectionEls: Record<string, React.ReactNode> = {
    hero: <Hero key="hero" therapist={therapist} heroLoaded={heroLoaded} heroRef={heroRef} />,
    about: <About key="about" therapist={therapist} days={days} />,
    services: (
      <Services
        key="services"
        services={servicesData}
        svcTrackRef={svcTrackRef}
        svcCanPrev={svcCanPrev}
        svcCanNext={svcCanNext}
        scrollSvc={scrollSvc}
        defaultFee={therapist.fee}
        onBookService={handleBookService}
      />
    ),
    feedback: <Feedback key="feedback" feedbacks={feedbacks} />,
    expertise: <Expertise key="expertise" therapist={therapist} />,
    carousel: (
      <Carousel
        key="carousel"
        slide={slide} slides={slides}
        carouselIndex={carouselIndex} carouselAnim={carouselAnim}
        goPrev={goPrev} goNext={goNext}
        setCarouselIndex={setCarouselIndex} setCarouselAnim={setCarouselAnim}
      />
    ),
    booking: (
      <Booking
        key="booking"
        therapist={therapist}
        bookedTimes={bookedTimes}
        selectedService={selectedService}
        onClearService={() => setSelectedService(null)}
      />
    ),
    footer: <Footer key="footer" therapist={therapist} />,
  }

  return (
    <div className="font-sans" ref={rootRef}>
      <style>{globalStyles}</style>
      <Navbar scrolled={scrolled} scrollTo={scrollTo} therapist={therapist} />
      {orderedIds.map(id => sectionEls[id])}
    </div>
  )
}

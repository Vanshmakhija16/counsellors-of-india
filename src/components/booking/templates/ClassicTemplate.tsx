'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { TherapistProfile, getNext7Days } from './templateUtils'
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
}

const servicesData: ServiceItem[] = [
  {
    code: 'S/01',
    title: 'Counselling Psychology',
    kind: 'Individual Therapy',
    desc:
      'One-to-one psychotherapy for adults navigating anxiety, depression, ' +
      'self-worth, identity, burnout, and life transitions — grounded in CBT, ACT, and somatic work.',
    forWhom: ['Anxiety', 'Burnout', 'Self-Esteem', 'Life Transitions'],
  },
  {
    code: 'S/02',
    title: 'Relationship Counselling',
    kind: 'Couples & Partners',
    desc:
      'Structured sessions for couples and partners working through communication ' +
      'breakdowns, attachment patterns, conflict, intimacy, and rebuilding trust.',
    forWhom: ['Couples', 'Communication', 'Attachment', 'Trust'],
  },
  {
    code: 'S/03',
    title: 'Trauma & EMDR',
    kind: 'Trauma-Informed Care',
    desc:
      'Specialist trauma work using EMDR and somatic methods, at your pace — ' +
      'helping you process difficult experiences while restoring safety in your body.',
    forWhom: ['PTSD', 'EMDR', 'Somatic', 'Recovery'],
  },
  {
    code: 'S/04',
    title: 'Career & Identity',
    kind: 'Personal Direction',
    desc:
      'Reflective psychotherapy for professionals questioning purpose, identity, ' +
      'or major career inflection points — clarity-focused and non-prescriptive.',
    forWhom: ['Direction', 'Meaning', 'Purpose', 'Mid-Career'],
  },
]

const carouselSlides = [
  {
    type: 'quote',
    bg: 'linear-gradient(135deg, #1a2e2b 0%, #243d38 60%, #1c3330 100%)',
    accent: '#a8c5be',
    text: '"The curious paradox is that when I accept myself just as I am, then I can change."',
    author: '— Carl Rogers',
    sub: 'On becoming a person',
    tag: 'Guiding Philosophy',
  },
  {
    type: 'stats',
    bg: 'linear-gradient(135deg, #2d1f14 0%, #3d2b1a 60%, #2a1c10 100%)',
    accent: '#c9a97a',
    headline: 'Proven Results',
    stats: [
      { val: '94%', label: 'Report reduced anxiety after 8 sessions' },
      { val: '87%', label: 'Clients return for continued growth' },
      { val: '500+', label: 'Sessions delivered across 6 countries' },
    ],
    tag: 'By The Numbers',
  },
  {
    type: 'process',
    bg: 'linear-gradient(135deg, #1e1e2e 0%, #262636 60%, #1a1a28 100%)',
    accent: '#9b8ec4',
    headline: 'How We Work Together',
    steps: [
      { n: '01', t: 'Free Consultation', d: 'A 20-min call to understand your needs and answer your questions.' },
      { n: '02', t: 'Tailored Plan', d: 'We co-create a therapy approach matched to your goals.' },
      { n: '03', t: 'Weekly Sessions', d: 'Consistent, focused 50-minute sessions online or in-person.' },
    ],
    tag: 'The Process',
  },
  {
    type: 'quote',
    bg: 'linear-gradient(135deg, #1f2a1f 0%, #293829 60%, #1c2b1c 100%)',
    accent: '#8ab89a',
    text: '"You don\'t have to see the whole staircase. Just take the first step."',
    author: '— Martin Luther King Jr.',
    sub: 'On courage and beginnings',
    tag: 'Words of Courage',
  },
  // 'specialties' slide is injected at render time from therapist.specialties
  {
    type: 'testimonial',
    bg: 'linear-gradient(135deg, #1f2430 0%, #29303f 60%, #1a1f2a 100%)',
    accent: '#7a9fc4',
    quote:
      '"I came in feeling completely lost. Six months later I have language for my feelings, tools for hard days, and a relationship with myself I never thought possible."',
    name: 'Priya M.',
    role: 'Client — 2024',
    tag: 'Client Stories',
  },
]

export default function ClassicTemplate({ therapist, bookedTimes = [], feedbacks = [] }: ClassicTemplateProps) {
  const days = getNext7Days()

  const slides =
    therapist.specialties && therapist.specialties.length > 0
      ? [
          ...carouselSlides,
          {
            type: 'specialties',
            bg: 'linear-gradient(135deg, #2a1f1f 0%, #3a2929 60%, #251a1a 100%)',
            accent: '#c49090',
            headline: 'Areas of Focus',
            items: therapist.specialties,
            tag: 'Specialties',
          },
        ]
      : carouselSlides

  const [scrolled, setScrolled] = useState(false)
  const [heroLoaded, setHeroLoaded] = useState(false)
  const heroRef = useRef<HTMLElement | null>(null)

  // Slide carousel state
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [carouselAnim, setCarouselAnim] = useState<'idle' | 'left' | 'right'>('idle')
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Services horizontal scroller
  const svcTrackRef = useRef<HTMLDivElement | null>(null)
  const [svcCanPrev, setSvcCanPrev] = useState(false)
  const [svcCanNext, setSvcCanNext] = useState(true)

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
    const gap = 28
    const step = card ? card.offsetWidth + gap : el.clientWidth * 0.8
    el.scrollBy({ left: step * dir, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    const el = svcTrackRef.current
    if (!el) return
    updateSvcArrows()
    el.addEventListener('scroll', updateSvcArrows, { passive: true })
    window.addEventListener('resize', updateSvcArrows)
    return () => {
      el.removeEventListener('scroll', updateSvcArrows)
      window.removeEventListener('resize', updateSvcArrows)
    }
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

    let raf = 0
    let targetX = 0
    let targetY = 0
    let curX = 0
    let curY = 0

    const onMove = (e: MouseEvent) => {
      const rect = hero.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      targetX = (e.clientX - cx) / rect.width
      targetY = (e.clientY - cy) / rect.height
    }

    const loop = () => {
      curX += (targetX - curX) * 0.08
      curY += (targetY - curY) * 0.08
      hero.style.setProperty('--px', curX.toFixed(3))
      hero.style.setProperty('--py', curY.toFixed(3))
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => {
      window.clearTimeout(t)
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
    }
  }, [])

  const startAuto = useCallback(() => {
    if (autoRef.current) clearInterval(autoRef.current)
    autoRef.current = setInterval(() => goNext(), 5000)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    startAuto()
    return () => {
      if (autoRef.current) clearInterval(autoRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carouselIndex])

  function goNext() {
    setCarouselAnim('left')
    setTimeout(() => {
      setCarouselIndex((i) => (i + 1) % slides.length)
      setCarouselAnim('idle')
    }, 380)
    startAuto()
  }

  function goPrev() {
    setCarouselAnim('right')
    setTimeout(() => {
      setCarouselIndex((i) => (i - 1 + slides.length) % slides.length)
      setCarouselAnim('idle')
    }, 380)
    startAuto()
  }

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const slide = slides[carouselIndex] ?? slides[0]

  return (
    <div className="font-sans">
      <style>{globalStyles}</style>

      <Navbar scrolled={scrolled} scrollTo={scrollTo} therapist={therapist} />

      <Hero therapist={therapist} heroLoaded={heroLoaded} heroRef={heroRef} />

      <About therapist={therapist} days={days} />

      <Services
        services={servicesData}
        svcTrackRef={svcTrackRef}
        svcCanPrev={svcCanPrev}
        svcCanNext={svcCanNext}
        scrollSvc={scrollSvc}
      />

      <Feedback feedbacks={feedbacks} />

      <Expertise therapist={therapist} />

      <Carousel
        slide={slide}
        slides={slides}
        carouselIndex={carouselIndex}
        carouselAnim={carouselAnim}
        goPrev={goPrev}
        goNext={goNext}
        setCarouselIndex={setCarouselIndex}
        setCarouselAnim={setCarouselAnim}
      />

      <Booking therapist={therapist} bookedTimes={bookedTimes} />

      <Footer therapist={therapist} />
    </div>
  )
}

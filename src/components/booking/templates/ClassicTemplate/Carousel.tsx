'use client'

import { ChevronLeft, ChevronRight, Quote } from 'lucide-react'

interface CarouselProps {
  slide: any
  slides: any[]
  carouselIndex: number
  carouselAnim: 'idle' | 'left' | 'right'
  goPrev: () => void
  goNext: () => void
  setCarouselIndex: (i: number) => void
  setCarouselAnim: (a: 'idle' | 'left' | 'right') => void
}

export default function Carousel({ slide, slides, carouselIndex, carouselAnim, goPrev, goNext, setCarouselIndex, setCarouselAnim }: CarouselProps) {
  const carouselSlides = slides
  return (
      <section
        id="carousel"
        className="ct-carousel-section relative overflow-hidden border-t border-[#e8dfc8] bg-[#efe7d6] px-6 py-20 lg:px-12 lg:py-24"
      >
        <div className="ct-carousel-section__inner mx-auto max-w-[1180px]">

          <p className="ct-section-label ct-carousel-section__label">
            <span className="ct-section-label__line" />04 — Explore
          </p>

          <div className="ct-carousel-wrap">
            {/* Left arrow */}
            <button className="ct-carousel-arrow ct-carousel-arrow--left" onClick={goPrev} aria-label="Previous">
              <ChevronLeft size={22} />
            </button>

            {/* Slide viewport */}
            <div className="ct-carousel-viewport">
              <div
                className={`ct-carousel-slide ct-carousel-slide--${carouselAnim}`}
                style={{ background: slide.bg }}
              >
                {/* Tag pill */}
                <div className="ct-slide-tag" style={{ color: slide.accent, borderColor: slide.accent + '55' }}>
                  {slide.tag}
                </div>

                {/* QUOTE type */}
                {slide.type === 'quote' && (
                  <div className="ct-slide-quote">
                    <div className="ct-slide-quote__mark" style={{ color: slide.accent + '30' }}>"</div>
                    <blockquote className="ct-slide-quote__text" style={{ color: '#efe7d6' }}>
                      {(slide as any).text}
                    </blockquote>
                    <div className="ct-slide-quote__attr">
                      <span style={{ color: slide.accent }}>{(slide as any).author}</span>
                      <span className="ct-slide-quote__sub">{(slide as any).sub}</span>
                    </div>
                  </div>
                )}

                {/* STATS type */}
                {slide.type === 'stats' && (
                  <div className="ct-slide-stats">
                    <h3 className="ct-slide-stats__headline" style={{ color: '#efe7d6' }}>{(slide as any).headline}</h3>
                    <div className="ct-slide-stats__grid">
                      {(slide as any).stats.map((st: any, i: number) => (
                        <div key={i} className="ct-slide-stat-item" style={{ borderColor: slide.accent + '40' }}>
                          <span className="ct-slide-stat-item__val" style={{ color: slide.accent }}>{st.val}</span>
                          <span className="ct-slide-stat-item__label">{st.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* PROCESS type */}
                {slide.type === 'process' && (
                  <div className="ct-slide-process">
                    <h3 className="ct-slide-process__headline" style={{ color: '#efe7d6' }}>{(slide as any).headline}</h3>
                    <div className="ct-slide-process__steps">
                      {(slide as any).steps.map((st: any, i: number) => (
                        <div key={i} className="ct-slide-process__step">
                          <span className="ct-slide-process__num" style={{ color: slide.accent }}>{st.n}</span>
                          <div>
                            <p className="ct-slide-process__step-title" style={{ color: '#efe7d6' }}>{st.t}</p>
                            <p className="ct-slide-process__step-desc">{st.d}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SPECIALTIES type */}
                {slide.type === 'specialties' && (
                  <div className="ct-slide-specialties">
                    <h3 className="ct-slide-specialties__headline" style={{ color: '#efe7d6' }}>{(slide as any).headline}</h3>
                    <div className="ct-slide-specialties__tags">
                      {(slide as any).items.map((item: string, i: number) => (
                        <span key={i} className="ct-slide-specialty-tag"
                          style={{ borderColor: slide.accent + '60', color: slide.accent }}>
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* TESTIMONIAL type */}
                {slide.type === 'testimonial' && (
                  <div className="ct-slide-testimonial">
                    <div className="ct-slide-testimonial__icon" style={{ color: slide.accent }}>
                      <Quote size={32} />
                    </div>
                    <blockquote className="ct-slide-testimonial__quote" style={{ color: '#efe7d6' }}>
                      {(slide as any).quote}
                    </blockquote>
                    <div className="ct-slide-testimonial__attr">
                      <span className="ct-slide-testimonial__name" style={{ color: slide.accent }}>{(slide as any).name}</span>
                      <span className="ct-slide-testimonial__role">{(slide as any).role}</span>
                    </div>
                  </div>
                )}

                {/* Decorative corner ring */}
                <div className="ct-slide-ring" style={{ borderColor: slide.accent + '20' }} />
              </div>
            </div>

            {/* Right arrow */}
            <button className="ct-carousel-arrow ct-carousel-arrow--right" onClick={goNext} aria-label="Next">
              <ChevronRight size={22} />
            </button>
          </div>

          {/* Dots */}
          <div className="ct-carousel-dots">
            {carouselSlides.map((_, i) => (
              <button key={i}
                className={`ct-carousel-dot ${i === carouselIndex ? 'ct-carousel-dot--active' : ''}`}
                onClick={() => { setCarouselAnim('left'); setTimeout(() => { setCarouselIndex(i); setCarouselAnim('idle') }, 380) }}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>
  )
}

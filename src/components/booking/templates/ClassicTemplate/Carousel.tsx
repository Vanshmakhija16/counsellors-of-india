'use client'

import { ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { useEditableTemplate } from '../edit/EditContext'
import type { CT1CarouselSlide } from '../templateUtils'

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

// ── tiny shared edit-mode input styles (matches Services.tsx) ────────────
const editInp = `w-full rounded border border-dashed border-[#ff9933] bg-[#fffbf5]/10
  px-2 py-1 outline-none focus:border-solid focus:ring-2
  focus:ring-[#ff9933]/30 resize-none placeholder:text-white/40`

export default function Carousel({ slide, slides, carouselIndex, carouselAnim, goPrev, goNext, setCarouselIndex, setCarouselAnim }: CarouselProps) {
  const { editMode, updateProfileContent } = useEditableTemplate()
  const carouselSlides = slides

  // ── helper to patch the currently-viewed slide in profile_content.classic.carousel ──
  // Only the editable fields (headline/steps text) are persisted here; visual
  // styling (bg/accent) is re-merged from SLIDE_STYLES by the parent on read.
  function patchSlide(patch: Partial<CT1CarouselSlide>) {
    updateProfileContent(pc => {
      const existing: CT1CarouselSlide[] = (pc as any)?.classic?.carousel ?? carouselSlides.map((s: any) => ({
        type: s.type, tag: s.tag, text: s.text, author: s.author, sub: s.sub,
        headline: s.headline, stats: s.stats, steps: s.steps, quote: s.quote, name: s.name, role: s.role,
      }))
      const updated = existing.map((s, j) => j === carouselIndex ? { ...s, ...patch } : s)
      return { ...pc, classic: { ...((pc as any)?.classic ?? {}), carousel: updated } }
    })
  }

  function patchStep(stepIdx: number, patch: Partial<{ t: string; d: string }>) {
    const steps = ((slide as any).steps ?? []).map((st: any, j: number) => j === stepIdx ? { ...st, ...patch } : st)
    patchSlide({ steps })
  }

  return (
      <section
        id="carousel"
        className="ct-carousel-section relative overflow-hidden bg-[#1a1a18] px-6 py-20 lg:px-12 lg:py-24"
      >
        <div className="ct-carousel-section__inner mx-auto max-w-[1180px]">

          <p className="ct-section-label font-bold ct-carousel-section__label">
             Explore
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
                    {editMode ? (
                      <input
                        value={(slide as any).headline ?? ''}
                        onChange={e => patchSlide({ headline: e.target.value })}
                        placeholder="Section headline"
                        className={`${editInp} ct-slide-process__headline`}
                        style={{ color: '#efe7d6' }}
                      />
                    ) : (
                      <h3 className="ct-slide-process__headline" style={{ color: '#efe7d6' }}>{(slide as any).headline}</h3>
                    )}
                    <div className="ct-slide-process__steps">
                      {(slide as any).steps.map((st: any, i: number) => (
                        <div key={i} className="ct-slide-process__step">
                          <span className="ct-slide-process__num" style={{ color: slide.accent }}>{st.n}</span>
                          <div className="w-full">
                            {editMode ? (
                              <>
                                <input
                                  value={st.t}
                                  onChange={e => patchStep(i, { t: e.target.value })}
                                  placeholder="Step title"
                                  className={`${editInp} mb-1.5`}
                                  style={{ color: '#efe7d6' }}
                                />
                                <textarea
                                  rows={2}
                                  value={st.d}
                                  onChange={e => patchStep(i, { d: e.target.value })}
                                  placeholder="Step description"
                                  className={editInp}
                                  style={{ color: '#c8b99a' }}
                                />
                              </>
                            ) : (
                              <>
                                <p className="ct-slide-process__step-title" style={{ color: '#efe7d6' }}>{st.t}</p>
                                <p className="ct-slide-process__step-desc">{st.d}</p>
                              </>
                            )}
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

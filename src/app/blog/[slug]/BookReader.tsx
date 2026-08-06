'use client'

import { useEffect, useLayoutEffect, useRef, useState, type TouchEvent } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'

interface BookReaderProps {
  title: string
  dateLabel: string
  readingMinutes: number
  contentHtml: string
}

// Gap between pages in a spread — on desktop this IS the visual spine, so
// the decorative spine graphic is positioned to sit exactly in this gap.
// Mobile shows one page at a time (no facing page, no spine), so the gap
// there just has to separate consecutive columns, not frame a spine.
const GAP_DESKTOP = 64
const GAP_MOBILE = 24
// Horizontal padding on the columns element below — must be subtracted
// before sizing columns, or the requested column width won't actually fit
// and the browser silently collapses/overflows (text runs under the spine
// on desktop, or gets clipped at the edge on mobile).
const PAD_X_DESKTOP = 56 * 2 // 3.5rem left + 3.5rem right, at the default 16px root
const PAD_X_MOBILE = 24 * 2 // 1.5rem left + 1.5rem right — desktop's padding
// eats too much of a narrow screen and crushes the single column
// Below this viewport width the two-page spread (with its fixed 64px
// spine gap) leaves too little room per page to read comfortably, so we
// switch to one page per screen instead of a shrunk-down facing pair.
const MOBILE_BREAKPOINT = 640

export default function BookReader({ title, dateLabel, readingMinutes, contentHtml }: BookReaderProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const columnsRef = useRef<HTMLDivElement>(null)

  const [colWidth, setColWidth] = useState(0)
  const [spread, setSpread] = useState(0)
  const [totalSpreads, setTotalSpreads] = useState(1)
  const [isMobile, setIsMobile] = useState(false)

  const gap = isMobile ? GAP_MOBILE : GAP_DESKTOP
  const pagesPerSpread = isMobile ? 1 : 2

  // Column width: on desktop, exactly half the padded viewport (minus the
  // spine gap) so precisely 2 columns show at once and page 1 ends right
  // where the spine is drawn. On mobile, the full padded viewport width so
  // exactly 1 column (page) shows at a time — no facing page, no spine.
  useLayoutEffect(() => {
    function measure() {
      if (!viewportRef.current) return
      const vw = viewportRef.current.clientWidth
      const mobile = vw < MOBILE_BREAKPOINT
      setIsMobile(mobile)
      const padX = mobile ? PAD_X_MOBILE : PAD_X_DESKTOP
      const g = mobile ? GAP_MOBILE : GAP_DESKTOP
      // -1px safety margin: without it, rounding can leave just enough
      // leftover width for the browser to start rendering a sliver of an
      // extra column, which peeks out past the visible page's edge.
      const width = mobile
        ? Math.floor(vw - padX) - 1
        : Math.floor((vw - padX - g) / 2) - 1
      setColWidth(width)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  // Once columns are sized and content has flowed into them, measure how
  // many columns the browser actually generated, to know the total page
  // count for Next/Prev — the browser's own line-breaking does all the
  // real pagination work here, we just count the result.
  useEffect(() => {
    if (!columnsRef.current || colWidth === 0) return
    const id = requestAnimationFrame(() => {
      if (!columnsRef.current) return
      const scrollW = columnsRef.current.scrollWidth
      const perCol = colWidth + gap
      // Math.ceil, not round: the last column is almost always only
      // partially filled, so scrollW rarely divides evenly. Rounding down
      // silently drops that last (real, content-bearing) column from the
      // page count — whatever's on it becomes unreachable via Next, even
      // though it's sitting right there in the DOM.
      const totalCols = Math.max(1, Math.ceil(scrollW / perCol))
      const spreads = Math.max(1, Math.ceil(totalCols / pagesPerSpread))
      setTotalSpreads(spreads)
      setSpread(s => Math.min(s, spreads - 1))
    })
    return () => cancelAnimationFrame(id)
  }, [colWidth, contentHtml, gap, pagesPerSpread])

  const translateX = -(spread * pagesPerSpread * (colWidth + gap))

  const goPrev = () => setSpread(s => Math.max(0, s - 1))
  const goNext = () => setSpread(s => Math.min(totalSpreads - 1, s + 1))

  // Swipe-to-turn-page — the natural mobile gesture, and a much easier
  // target than a small edge button: the entire page is swipeable, not
  // just a 44px circle at the corner. Desktop keeps the edge-arrow click
  // (a swipe handler doesn't hurt there, it just never fires on a mouse).
  const touchStartX = useRef<number | null>(null)
  const SWIPE_THRESHOLD = 40
  const onTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const onTouchEnd = (e: TouchEvent) => {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(dx) < SWIPE_THRESHOLD) return
    if (dx < 0) goNext()
    else goPrev()
  }

  return (
    <div className="flex h-full flex-col items-center gap-3">
      <div
        ref={viewportRef}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="relative w-full flex-1 overflow-hidden rounded-xl shadow-[0_25px_60px_-15px_rgba(120,90,50,.28)]"
        style={{ background: '#FFFFFF' }}
      >
        {/* Spine — sits exactly in the gap between the two visible columns.
            Desktop only: mobile shows a single page, so there's no facing
            page for a spine to sit between. */}
        {!isMobile && (
          <div className="pointer-events-none absolute inset-y-0 left-1/2 z-10 w-[24px] -translate-x-1/2">
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to right,#a28b68,#d7c7ab,#a28b68)' }}
            />
            <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-black/10" />
          </div>
        )}

        {/* Rise wrapper — plays a bottom-to-top + fade reveal on every page
            change. key={spread} forces a fresh mount each time, replaying
            the animation. Kept separate from the columns element below so
            the column strip's own translateX positioning (which must jump
            instantly and land exactly right, or text ends up mis-paginated)
            never fights with this animation's transform. */}
        <div key={spread} className="book-page-rise h-full">
          {/* Sliding strip of ALL columns — CSS multi-column auto-paginates
              the header+content flow; translateX pages between spreads. */}
          <div
            ref={columnsRef}
            className="blog-book-columns h-full"
            style={{
              columnWidth: colWidth ? `${colWidth}px` : undefined,
              columnGap: `${gap}px`,
              columnFill: 'auto',
              transform: `translateX(${translateX}px)`,
              padding: isMobile ? '2rem 1.5rem' : '3.25rem 3.5rem',
            }}
            dangerouslySetInnerHTML={{
              __html:
                `<div class="blog-book-header">` +
                `<div class="blog-book-kicker"><span>The Practice Notebook</span><span>${dateLabel}</span></div>` +
                `<div class="blog-book-meta"><span class="blog-book-dot"></span>${readingMinutes} min read</div>` +
                `<h1 class="blog-book-title">${title}</h1>` +
                `</div>` +
                contentHtml,
            }}
          />
        </div>

        <style>{`
          @keyframes bookPageRise {
            from { transform: translateY(26px); opacity: 0; }
            to   { transform: translateY(0);     opacity: 1; }
          }
          .book-page-rise {
            animation: bookPageRise .45s cubic-bezier(.22,.87,.36,1) both;
          }
        `}</style>

        {/* Page numbers */}
        <div
          className={`pointer-events-none absolute bottom-6 text-sm text-[#857861] ${isMobile ? 'left-1/2 -translate-x-1/2' : 'left-10'}`}
        >
          {spread * pagesPerSpread + 1}
        </div>
        {!isMobile && spread * pagesPerSpread + 2 <= totalSpreads * pagesPerSpread && (
          <div className="pointer-events-none absolute bottom-6 right-10 text-sm text-[#857861]">{spread * pagesPerSpread + 2}</div>
        )}

        {/* Edge nav arrows — desktop only. They sit right on the book's own
            edges, revealed on hover, matching how a real book/e-reader
            turns pages. On mobile there's no hover state to reveal them,
            so they'd sit invisible and untappable right over the reading
            text — replaced below with swipe + a solid always-visible bar. */}
        {!isMobile && totalSpreads > 1 && (
          <>
            <button
              onClick={goPrev}
              disabled={spread === 0}
              aria-label="Previous spread"
              className="group absolute left-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[#2B3B37]/0 text-[#5d665f] transition hover:bg-[#2B3B37]/[0.06] hover:text-[#2B3B37] disabled:pointer-events-none disabled:opacity-0"
            >
              <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-0.5" />
            </button>
            <button
              onClick={goNext}
              disabled={spread >= totalSpreads - 1}
              aria-label="Next spread"
              className="group absolute right-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[#2B3B37]/0 text-[#5d665f] transition hover:bg-[#2B3B37]/[0.06] hover:text-[#2B3B37] disabled:pointer-events-none disabled:opacity-0"
            >
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </>
        )}
      </div>

      {/* Mobile page controls — a solid, always-visible bar below the book
          instead of hover-only buttons floating over the text. Swiping the
          page itself (see onTouchStart/onTouchEnd above) is the primary way
          to turn pages; these buttons are the fallback for anyone who
          doesn't discover the swipe. */}
      {isMobile && totalSpreads > 1 && (
        <div className="flex items-center gap-4">
          <button
            onClick={goPrev}
            disabled={spread === 0}
            aria-label="Previous page"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2B3B37]/[0.06] text-[#2B3B37] transition active:bg-[#2B3B37]/[0.12] disabled:opacity-30"
          >
            <ArrowLeft size={18} />
          </button>
          <span className="shrink-0 text-xs text-[#8c7b63]">Page {spread + 1} of {totalSpreads}</span>
          <button
            onClick={goNext}
            disabled={spread >= totalSpreads - 1}
            aria-label="Next page"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2B3B37]/[0.06] text-[#2B3B37] transition active:bg-[#2B3B37]/[0.12] disabled:opacity-30"
          >
            <ArrowRight size={18} />
          </button>
        </div>
      )}

      {!isMobile && totalSpreads > 1 && (
        <span className="shrink-0 text-xs text-[#8c7b63]">Page {spread + 1} of {totalSpreads}</span>
      )}
    </div>
  )
}

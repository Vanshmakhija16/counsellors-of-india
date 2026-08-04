'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'

interface BookReaderProps {
  title: string
  dateLabel: string
  readingMinutes: number
  contentHtml: string
}

// Gap between the two pages of a spread — this IS the visual spine, so the
// decorative spine graphic below is positioned to sit exactly in this gap.
const GAP = 64
// Horizontal padding on the columns element below (padding: 3.25rem 3.5rem)
// — must be subtracted before splitting the viewport into 2 columns, or the
// requested column width won't actually fit twice and the browser silently
// collapses to a single wide column (text then runs straight under the
// spine instead of stopping at the edge of page 1).
const PAD_X = 56 * 2 // 3.5rem left + 3.5rem right, at the default 16px root

export default function BookReader({ title, dateLabel, readingMinutes, contentHtml }: BookReaderProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const columnsRef = useRef<HTMLDivElement>(null)

  const [colWidth, setColWidth] = useState(0)
  const [spread, setSpread] = useState(0)
  const [totalSpreads, setTotalSpreads] = useState(1)

  // Column width = exactly half the PADDED viewport (content box minus the
  // columns element's own left/right padding, minus half the spine gap), so
  // precisely 2 columns (1 spread) ever show at once — and page 1 actually
  // ends where the spine is drawn, instead of running underneath it.
  useLayoutEffect(() => {
    function measure() {
      if (!viewportRef.current) return
      const vw = viewportRef.current.clientWidth
      // -1px safety margin: without it, rounding can leave just enough
      // leftover width for the browser to start rendering a sliver of a
      // 3rd column, which peeks out past the right page's edge.
      setColWidth(Math.floor((vw - PAD_X - GAP) / 2) - 1)
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
      const perCol = colWidth + GAP
      const totalCols = Math.max(1, Math.round(scrollW / perCol))
      setTotalSpreads(Math.max(1, Math.ceil(totalCols / 2)))
      setSpread(s => Math.min(s, Math.max(0, Math.ceil(totalCols / 2) - 1)))
    })
    return () => cancelAnimationFrame(id)
  }, [colWidth, contentHtml])

  const translateX = -(spread * 2 * (colWidth + GAP))

  return (
    <div className="flex h-full flex-col items-center gap-3">
      <div
        ref={viewportRef}
        className="relative w-full flex-1 overflow-hidden rounded-xl shadow-[0_25px_60px_-15px_rgba(120,90,50,.28)]"
        style={{ background: '#FFFFFF' }}
      >
        {/* Spine — sits exactly in the gap between the two visible columns */}
        <div className="pointer-events-none absolute inset-y-0 left-1/2 z-10 w-[40px] -translate-x-1/2">
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to right,#a28b68,#d7c7ab,#a28b68)' }}
          />
          <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-black/10" />
        </div>

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
              columnGap: `${GAP}px`,
              columnFill: 'auto',
              transform: `translateX(${translateX}px)`,
              padding: '3.25rem 3.5rem',
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
        <div className="pointer-events-none absolute bottom-6 left-10 text-sm text-[#857861]">{spread * 2 + 1}</div>
        {spread * 2 + 2 <= totalSpreads * 2 && (
          <div className="pointer-events-none absolute bottom-6 right-10 text-sm text-[#857861]">{spread * 2 + 2}</div>
        )}

        {/* Edge nav arrows — sit right on the book's own edges, vertically
            centered, instead of a toolbar below it. Matches how a real
            book/e-reader turns pages (from the outer edge of the page
            you're on), and keeps eye/cursor travel to zero since the
            controls are exactly where attention already is. */}
        {totalSpreads > 1 && (
          <>
            <button
              onClick={() => setSpread(s => Math.max(0, s - 1))}
              disabled={spread === 0}
              aria-label="Previous spread"
              className="group absolute left-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[#2B3B37]/0 text-[#5d665f] transition hover:bg-[#2B3B37]/[0.06] hover:text-[#2B3B37] disabled:pointer-events-none disabled:opacity-0"
            >
              <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-0.5" />
            </button>
            <button
              onClick={() => setSpread(s => Math.min(totalSpreads - 1, s + 1))}
              disabled={spread >= totalSpreads - 1}
              aria-label="Next spread"
              className="group absolute right-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[#2B3B37]/0 text-[#5d665f] transition hover:bg-[#2B3B37]/[0.06] hover:text-[#2B3B37] disabled:pointer-events-none disabled:opacity-0"
            >
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </>
        )}
      </div>

      {totalSpreads > 1 && (
        <span className="shrink-0 text-xs text-[#8c7b63]">Page {spread + 1} of {totalSpreads}</span>
      )}
    </div>
  )
}

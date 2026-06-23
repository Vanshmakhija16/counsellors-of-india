'use client'

import { useEffect, useRef, useState } from 'react'
import { Sparkles, Check, Lock, ChevronLeft, ChevronRight } from 'lucide-react'
import { TEMPLATES, type TemplateId } from '@/lib/template'

// template id → preview route number + /try demo param
const META: Record<TemplateId, { n: number; t: string }> = {
  classic:  { n: 1, t: 't1' },
  classic2: { n: 2, t: 't2' },
  classic3: { n: 3, t: 't3' },
  classic4: { n: 4, t: 't4' },
  classic5: { n: 5, t: 't5' },
  classic6: { n: 6, t: 't6' },
}

interface Props {
  selectedTemplate: TemplateId
  committedTemplate: TemplateId
  isLocked: boolean              // starter template locked for the year
  lockDateLabel: string
  brandColor: string
  onSelect: (id: TemplateId) => void   // user picks this template
  onLockedAttempt: (id: TemplateId) => void
  // Controlled preview tab (when provided, the internal tab bar is hidden and
  // the parent drives which template is shown).
  active?: TemplateId
  onActiveChange?: (id: TemplateId) => void
  hideTabs?: boolean
  hideActionBar?: boolean        // hide the name + Try/Select footer
  frameHeight?: number           // preview viewport height (px)
}

// Fixed design size of the rendered template (scaled to fit the frame).
const DESIGN_W = 1280

export default function TemplateLiveSwitcher({
  selectedTemplate, committedTemplate, isLocked, lockDateLabel,
  brandColor, onSelect, onLockedAttempt,
  active: controlledActive, onActiveChange, hideTabs = false,
  hideActionBar = false, frameHeight = 460,
}: Props) {
  const [internalActive, setInternalActive] = useState<TemplateId>(selectedTemplate)
  const active = controlledActive ?? internalActive
  const setActive = (id: TemplateId) => {
    if (onActiveChange) onActiveChange(id)
    else setInternalActive(id)
  }
  const [loading, setLoading] = useState(true)
  const frameRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.4)

  const meta = META[active]
  const activeTpl = TEMPLATES.find(t => t.id === active)!

  // Keep the uncontrolled switcher in sync if the parent changes the selection.
  useEffect(() => {
    if (!controlledActive) setInternalActive(selectedTemplate)
  }, [selectedTemplate, controlledActive])

  // Clear the loading overlay shortly after switching (iframe onLoad backup).
  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => setLoading(false), 1400)
    return () => clearTimeout(t)
  }, [active])

  // Scale the 1280-wide template to fill the frame width.
  useEffect(() => {
    function measure() {
      const el = frameRef.current
      if (!el) return
      const w = el.clientWidth
      if (w > 0) setScale(w / DESIGN_W)
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (frameRef.current) ro.observe(frameRef.current)
    window.addEventListener('resize', measure)
    return () => { ro.disconnect(); window.removeEventListener('resize', measure) }
  }, [])

  const canSelect = !isLocked || active === committedTemplate
  const isCurrentSelection = active === selectedTemplate

  // Step through templates with the arrows (wraps around).
  const activeIndex = TEMPLATES.findIndex(t => t.id === active)
  const step = (dir: 1 | -1) => {
    const next = (activeIndex + dir + TEMPLATES.length) % TEMPLATES.length
    setActive(TEMPLATES[next].id)
  }

  return (
    <div className="rounded-2xl border border-[#e8e4df] overflow-hidden bg-white">
      {/* ── Tabs: switch between the real templates (hidden when controlled) ── */}
      {!hideTabs && (
      <div className="flex flex-wrap gap-2 p-3 border-b border-[#ede9e4] bg-[#fafaf9]">
        {TEMPLATES.map((t, i) => {
          const on = active === t.id
          const committed = t.id === committedTemplate
          return (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition"
              style={on
                ? { background: brandColor, borderColor: brandColor, color: '#fff' }
                : { borderColor: '#e8e4df', color: '#6b7280', background: '#fff' }}
            >
              <span className="opacity-70">{String(i + 1).padStart(2, '0')}</span>
              {t.name}
              {committed && <Check size={11} className={on ? 'text-white' : 'text-emerald-500'} />}
            </button>
          )
        })}
      </div>
      )}

      {/* ── Browser chrome + live iframe ── */}
      <div>
        <div className="px-4 py-2.5 bg-[#f5f5f5] border-b border-[#e8e4df] flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 mx-2 h-6 rounded-md bg-white border border-[#e8e4df] flex items-center justify-center">
            <span className="text-[11px] text-[#9ca3af]">counsellorsofindia.com/your-name</span>
          </div>
          <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> LIVE
          </span>
        </div>

        <div ref={frameRef} className="relative bg-white overflow-hidden" style={{ height: frameHeight }}>
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white">
              <span className="w-6 h-6 rounded-full border-2 border-[#e8e4df] border-t-[#a3b8b4] animate-spin" />
            </div>
          )}
          <div style={{ width: DESIGN_W, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
            <iframe
              key={active}
              src={`/preview/classic${meta.n}?embed=1`}
              title={`${activeTpl.name} preview`}
              scrolling="no"
              tabIndex={-1}
              onLoad={() => setLoading(false)}
              style={{ width: DESIGN_W, height: frameHeight / scale, border: 'none', display: 'block', pointerEvents: 'none' }}
            />
          </div>

          {/* ── Prominent prev / next arrows so switching is obvious ── */}
          <button
            type="button"
            aria-label="Previous template"
            onClick={() => step(-1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/95 shadow-lg border border-[#e8e4df] flex items-center justify-center text-[#1c1c1e] hover:bg-white hover:scale-105 transition"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            aria-label="Next template"
            onClick={() => step(1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/95 shadow-lg border border-[#e8e4df] flex items-center justify-center text-[#1c1c1e] hover:bg-white hover:scale-105 transition"
          >
            <ChevronRight size={20} />
          </button>

  
        </div>
      </div>

      {/* ── Action bar: name + Try demo + Select ── */}
      {!hideActionBar && (
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-[#ede9e4] bg-white flex-wrap">
        <div>
          <p className="text-sm font-semibold text-[#1c1c1e]">{activeTpl.name}</p>
          <p className="text-[11px] text-[#9ca3af]">{activeTpl.style}</p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`/try?t=${meta.t}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#e8e4df] text-xs font-semibold text-[#6b7280] hover:text-[#1c1c1e] hover:border-[#a3b8b4] transition"
          >
            <Sparkles size={13} /> Try demo
          </a>

          {isCurrentSelection ? (
            <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white"
              style={{ background: brandColor }}>
              <Check size={13} /> Selected
            </span>
          ) : canSelect ? (
            <button
              onClick={() => onSelect(active)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition hover:opacity-90"
              style={{ background: brandColor }}
            >
              Select this template
            </button>
          ) : (
            <button
              onClick={() => onLockedAttempt(active)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-[#d9c7aa] bg-[#fff8ed] text-[#7c5a2f]"
            >
              <Lock size={13} /> Locked until {lockDateLabel}
            </button>
          )}
        </div>
      </div>
      )}
    </div>
  )
}

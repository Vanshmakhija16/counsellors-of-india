'use client'

import { useEffect, useRef, useState } from 'react'
import { Sparkles, Check, Lock, ChevronLeft, ChevronRight } from 'lucide-react'
import { TEMPLATES, type TemplateId } from '@/lib/template'

const META: Record<TemplateId, { slug: string; t: string }> = {
  classic:  { slug: 'classic',  t: 't1' },
  classic2: { slug: 'classic2', t: 't2' },
  classic3: { slug: 'classic3', t: 't3' },
  classic4: { slug: 'classic4', t: 't4' },
  classic5: { slug: 'classic5', t: 't5' },
  classic6: { slug: 'classic6', t: 't6' },
}

interface Props {
  selectedTemplate: TemplateId
  committedTemplate: TemplateId
  isLocked: boolean
  lockDateLabel: string
  brandColor: string
  onSelect: (id: TemplateId) => void
  onLockedAttempt: (id: TemplateId) => void
  active?: TemplateId
  onActiveChange?: (id: TemplateId) => void
  hideTabs?: boolean
  hideActionBar?: boolean
  hideArrows?: boolean
  frameHeight?: number
  profileContent?: Record<string, unknown>
}

export default function TemplateLiveSwitcher({
  selectedTemplate, committedTemplate, isLocked, lockDateLabel,
  brandColor, onSelect, onLockedAttempt,
  active: controlledActive, onActiveChange, hideTabs = false,
  hideActionBar = false, hideArrows = false, frameHeight = 680,
  profileContent,
}: Props) {
  const [internalActive, setInternalActive] = useState<TemplateId>(selectedTemplate)
  const active = controlledActive ?? internalActive
  const setActive = (id: TemplateId) => {
    if (onActiveChange) onActiveChange(id)
    else setInternalActive(id)
  }
  const [loading, setLoading] = useState(true)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const iframeWrapRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)

  const meta = META[active]
  const activeTpl = TEMPLATES.find(t => t.id === active)!

  useEffect(() => {
    // Measure iframe wrapper width — this is the actual available space
    const el = iframeWrapRef.current
    if (!el) return
    const measure = () => {
      const w = el.getBoundingClientRect().width
      if (w > 0) setContainerWidth(w)
    }
    // Measure immediately + after paint
    measure()
    requestAnimationFrame(measure)
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (!controlledActive) setInternalActive(selectedTemplate)
  }, [selectedTemplate, controlledActive])

  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => setLoading(false), 1800)
    return () => clearTimeout(t)
  }, [active])

  useEffect(() => {
    if (!profileContent || !iframeRef.current?.contentWindow) return
    iframeRef.current.contentWindow.postMessage(
      { type: 'PROFILE_CONTENT_UPDATE', profileContent },
      '*'
    )
  }, [profileContent])

  const canSelect = !isLocked || active === committedTemplate
  const isCurrentSelection = active === selectedTemplate

  const activeIndex = TEMPLATES.findIndex(t => t.id === active)
  const step = (dir: 1 | -1) => {
    const next = (activeIndex + dir + TEMPLATES.length) % TEMPLATES.length
    setActive(TEMPLATES[next].id)
  }

  function buildSrc(templateId: TemplateId) {
    const slug = META[templateId].slug
    let src = `/dashboard/appearance/live-preview/${slug}?embed=1`
    if (profileContent && Object.keys(profileContent).length > 0) {
      try {
        src += `&pc=${encodeURIComponent(JSON.stringify(profileContent))}`
      } catch { /* ignore */ }
    }
    return src
  }

  return (
    <div ref={containerRef} className="rounded-2xl border border-[#e8e4df] overflow-hidden bg-white flex">
      {/* ── Left sidebar tabs ── */}
      {!hideTabs && (
        <div className="flex flex-col gap-1 p-2 border-r border-[#ede9e4] bg-[#fafaf9] w-36 shrink-0">
          {TEMPLATES.map((t, i) => {
            const on = active === t.id
            const committed = t.id === committedTemplate
            return (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs font-semibold border transition text-left w-full"
                style={on
                  ? { background: brandColor, borderColor: brandColor, color: '#fff' }
                  : { borderColor: 'transparent', color: '#6b7280', background: 'transparent' }}
              >
                <span className="flex items-center gap-2">
                  <span className="opacity-50 text-[10px]">{String(i + 1).padStart(2, '0')}</span>
                  {t.name}
                </span>
                {committed && <Check size={11} className={on ? 'text-white' : 'text-emerald-500'} />}
              </button>
            )
          })}
        </div>
      )}

      {/* ── Right: chrome + iframe + action bar ── */}
      <div className="flex flex-col flex-1 min-w-0">

      {/* ── Browser chrome ── */}
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

      {/* ── iframe viewport ── */}
      <div ref={iframeWrapRef} className="relative bg-white overflow-hidden" style={{ height: frameHeight }}>
        {(loading || containerWidth === 0) && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white pointer-events-none">
            <span className="w-6 h-6 rounded-full border-2 border-[#e8e4df] border-t-[#a3b8b4] animate-spin" />
          </div>
        )}

        {containerWidth > 0 && (
          <div className="absolute top-0 left-0 overflow-hidden" style={{ width: containerWidth, height: frameHeight }}>
            <iframe
              ref={iframeRef}
              key={active}
              src={buildSrc(active)}
              title={`${activeTpl.name} preview`}
              onLoad={() => setLoading(false)}
              scrolling="no"
              style={{
                width: 1280,
                height: Math.ceil(frameHeight / (containerWidth / 1280)),
                border: 'none',
                display: 'block',
                transformOrigin: 'top left',
                transform: `scale(${containerWidth / 1280})`,
                pointerEvents: 'none',
              }}
            />
          </div>
        )}

        {/* prev/next arrows */}
        {!hideArrows && (
          <>
            <button
              type="button"
              aria-label="Previous template"
              onClick={() => step(-1)}
              className="absolute left-3 top-4 z-20 w-10 h-10 rounded-full bg-white/95 shadow-lg border border-[#e8e4df] flex items-center justify-center text-[#1c1c1e] hover:bg-white hover:scale-105 transition"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              aria-label="Next template"
              onClick={() => step(1)}
              className="absolute right-3 top-4 z-20 w-10 h-10 rounded-full bg-white/95 shadow-lg border border-[#e8e4df] flex items-center justify-center text-[#1c1c1e] hover:bg-white hover:scale-105 transition"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* ── Action bar ── */}
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
    </div>
  )
}

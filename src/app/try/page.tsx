'use client'

import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  TEMPLATES, getColor,
  type TemplateId,
} from '@/lib/template'
import TemplateCanvas from '@/components/booking/templates/TemplateCanvas'
import TemplateThumbnail from '@/components/appearance/TemplateThumbnail'
import QuickFillForm from '@/components/demo/QuickFillForm'
import {
  loadDemo, saveDemo, demoToProfile,
  type DemoProfile,
} from '@/lib/demoSession'
import {
  Sparkles, X, Pencil, ChevronRight, Check,
  ArrowLeft, Layers, MousePointerClick, Zap,
} from 'lucide-react'

const TPARAM_TO_TEMPLATE: Record<string, TemplateId> = {
  t1: 'classic', t2: 'classic2', t3: 'classic3', t4: 'classic4', t5: 'classic5',
  classic: 'classic', classic2: 'classic2', classic3: 'classic3', classic4: 'classic4', classic5: 'classic5',
}

export default function TryDemoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#080808]">
        <div className="w-6 h-6 border-[1.5px] border-white/10 border-t-white/50 rounded-full animate-spin" />
      </div>
    }>
      <TryDemo />
    </Suspense>
  )
}

const SIDEBAR_W = 300

function TryDemo() {
  const searchParams = useSearchParams()
  const [demo, setDemo] = useState<DemoProfile | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [morphing, setMorphing] = useState(false)
  const morphTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let d = loadDemo()
    const requested = TPARAM_TO_TEMPLATE[searchParams.get('t') ?? '']
    if (requested && requested !== d.template_id) d = saveDemo({ template_id: requested })
    setDemo(d)
  }, [])

  useEffect(() => {
    if (!sidebarOpen) return
    const fn = (e: MouseEvent) => {
      const sidebar = document.getElementById('demo-sidebar')
      const trigger = document.getElementById('demo-sidebar-trigger')
      if (sidebar && !sidebar.contains(e.target as Node) && !trigger?.contains(e.target as Node)) {
        setSidebarOpen(false)
      }
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [sidebarOpen])

  function patch(p: Partial<DemoProfile>) { setDemo(saveDemo(p)) }

  function pickTemplate(id: TemplateId) {
    if (id === demo?.template_id) return
    setMorphing(true)
    if (morphTimer.current) clearTimeout(morphTimer.current)
    morphTimer.current = setTimeout(() => {
      patch({ template_id: id })
      setMorphing(false)
    }, 220)
  }

  const profile = useMemo(() => (demo ? demoToProfile(demo) : null), [demo])

  if (!demo || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080808]">
        <div className="w-6 h-6 border-[1.5px] border-white/10 border-t-white/50 rounded-full animate-spin" />
      </div>
    )
  }

  const color = getColor(demo.color_id)
  const activeTemplate = TEMPLATES.find(t => t.id === demo.template_id) ?? TEMPLATES[0]
  const theme = activeTemplate.accent

  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `${r}, ${g}, ${b}`
  }
  const themeRgb = hexToRgb(theme)

  return (
    <div className="min-h-screen bg-[#080808] overflow-hidden">

      {/* ─── Floating trigger pill ────────────────────────────────────────── */}
      <button
        id="demo-sidebar-trigger"
        onClick={() => setSidebarOpen(o => !o)}
        aria-label="Toggle sidebar"
        style={{ zIndex: 10002 }}
        className="fixed top-5 left-5"
      >
        <span
          className="flex items-center gap-2 px-3.5 h-10 rounded-full transition-all duration-300"
          style={{
            background: sidebarOpen
              ? `rgba(${themeRgb}, 0.15)`
              : 'rgba(15, 15, 15, 0.92)',
            border: `1px solid ${sidebarOpen ? `rgba(${themeRgb}, 0.35)` : 'rgba(255,255,255,0.09)'}`,
            boxShadow: sidebarOpen
              ? `0 0 0 1px rgba(${themeRgb},0.12), 0 8px 28px rgba(0,0,0,0.55)`
              : '0 4px 20px rgba(0,0,0,0.45)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <span className="w-[14px] h-[14px] flex flex-col justify-center gap-[3.5px] relative shrink-0">
            <span className="block h-[1.5px] rounded-full transition-all duration-300 origin-center w-full"
              style={{
                background: sidebarOpen ? theme : 'rgba(255,255,255,0.65)',
                transform: sidebarOpen ? 'translateY(5px) rotate(45deg)' : 'none',
              }} />
            <span className="block h-[1.5px] rounded-full transition-all duration-200 w-[75%]"
              style={{
                background: sidebarOpen ? theme : 'rgba(255,255,255,0.4)',
                opacity: sidebarOpen ? 0 : 1,
                transform: sidebarOpen ? 'scaleX(0)' : 'none',
              }} />
            <span className="block h-[1.5px] rounded-full transition-all duration-300 origin-center"
              style={{
                background: sidebarOpen ? theme : 'rgba(255,255,255,0.65)',
                transform: sidebarOpen ? 'translateY(-5px) rotate(-45deg)' : 'none',
                width: sidebarOpen ? '100%' : '88%',
              }} />
          </span>
          {/* <span className="text-[12px] font-medium tracking-tight transition-colors duration-200"
            style={{ color: sidebarOpen ? theme : 'rgba(255,255,255,0.5)' }}>
            {sidebarOpen ? 'Close' : 'Menu'}
          </span> */}
        </span>
      </button>

      {/* ─── Backdrop ────────────────────────────────────────────────────── */}
      <div
        className="fixed inset-0 transition-all duration-300"
        style={{
          zIndex: 10000,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)',
          opacity: sidebarOpen ? 1 : 0,
          pointerEvents: sidebarOpen ? 'auto' : 'none',
        }}
        onClick={() => setSidebarOpen(false)}
      />

      {/* ─── SIDEBAR ─────────────────────────────────────────────────────── */}
      <aside
        id="demo-sidebar"
        style={{ zIndex: 10001, width: `min(${SIDEBAR_W}px, 88vw)` }}
        className={`fixed top-0 left-0 h-full flex flex-col transition-transform duration-[320ms] ease-[cubic-bezier(.32,.72,0,1)] ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div
          className="relative flex flex-col h-full overflow-hidden"
          style={{
            background: 'linear-gradient(160deg, #141414 0%, #0d0d0d 60%, #0a0a0a 100%)',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            boxShadow: `6px 0 60px rgba(0,0,0,0.7), 1px 0 0 rgba(255,255,255,0.03), 0 0 80px -20px rgba(${themeRgb},0.12)`,
          }}
        >
          {/* Noise texture */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
              backgroundSize: '160px',
            }} />

          {/* Top edge glow */}
          <div className="pointer-events-none absolute top-0 left-0 right-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent 5%, rgba(${themeRgb},0.45) 40%, rgba(${themeRgb},0.45) 60%, transparent 95%)` }} />

          {/* Ambient glows */}
          <div className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl"
            style={{ background: theme, opacity: 0.07 }} />
          <div className="pointer-events-none absolute bottom-20 -left-8 w-36 h-36 rounded-full blur-3xl"
            style={{ background: theme, opacity: 0.05 }} />

          {/* ══════════════════════════════════════════════════════════════
              HEADER
              Layout: two independent rows inside a normal block container.
              Row 1 — icon + title (flex-1) + close button (shrink-0)
              Row 2 — live badge (left) + back link (right)
              The close button is part of Row 1 only, so it can never
              sit on top of the Back-to-site text in Row 2.
          ══════════════════════════════════════════════════════════════ */}
          <div
            className="shrink-0 px-5 pt-[22px] pb-5"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.055)' }}
          >
            {/* ── Row 1: logo + title + close ── */}
            <div className="flex  items-start gap-3 mb-4">

              {/* Logo mark */}
              {/* <span
                className="relative w-9 h-9 rounded-[11px] flex items-center justify-center shrink-0"
                style={{
                  background: `linear-gradient(145deg, rgba(${themeRgb},0.22), rgba(${themeRgb},0.06))`,
                  border: `1px solid rgba(${themeRgb},0.28)`,
                  boxShadow: `0 0 0 3px rgba(${themeRgb},0.06), 0 8px 20px rgba(0,0,0,0.3)`,
                }}
              >
                <Sparkles size={15} style={{ color: theme }} />
                <span
                  className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
                  style={{ background: theme, opacity: 0.6, filter: 'blur(1px)' }}
                />
              </span> */}

              {/* Title — takes all remaining width */}
              <div className="flex-1 ml-14 mt-2  min-w-0 pt-[1px]">
                <p className="text-white/90 text-[13.5px] font-semibold tracking-tight leading-none">
                  Live Preview
                </p>
                <p className="text-white/28 text-[10px] mt-[3px] leading-none font-medium tracking-wide">
                  Counsellors of India
                </p>
              </div>

              {/* Close — lives only inside Row 1, never floats over Row 2 */}
              {/* <button
                onClick={() => setSidebarOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-150"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.09)'
                  ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.14)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'
                  ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'
                }}
              >
                <X size={13} className="text-white/40" />
              </button> */}
            </div>

            {/* ── Row 2: live badge (left) + back link (right) ── */}
            {/* This row is entirely separate from the close button — no z-index overlap */}
            <div className="flex items-center justify-between gap-2">
              <span
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full shrink-0"
                style={{
                  background: 'rgba(74,222,128,0.07)',
                  border: '1px solid rgba(74,222,128,0.15)',
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="text-[10px] font-semibold text-emerald-400/80 tracking-wider uppercase whitespace-nowrap">
                  Demo active
                </span>
              </span>

              <Link
                href="/"
                onClick={() => setSidebarOpen(false)}
                className="group flex items-center gap-1.5 shrink-0 text-[11px] font-medium text-white/30 hover:text-white/60 transition-colors whitespace-nowrap"
              >
                <ArrowLeft size={10} className="shrink-0 group-hover:-translate-x-0.5 transition-transform" />
                Back to site
              </Link>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════
              SCROLLABLE BODY
          ══════════════════════════════════════════════════════════════ */}
          <div
            className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-none flex flex-col gap-6"
            style={{ padding: '20px 16px 80px' }}
          >
            {/* ── Active template card ── */}
            <div
              className="relative overflow-hidden rounded-2xl"
              style={{
                background: `linear-gradient(145deg, rgba(${themeRgb},0.1), rgba(${themeRgb},0.03))`,
                border: `1px solid rgba(${themeRgb},0.18)`,
                boxShadow: `0 8px 28px rgba(0,0,0,0.25), 0 0 0 1px rgba(${themeRgb},0.06) inset`,
              }}
            >
              <div className="w-full overflow-hidden relative" style={{ height: 116 }}>
                <TemplateThumbnail
                  id={activeTemplate.id}
                  accent={activeTemplate.accent}
                  bg={activeTemplate.bg}
                  color={color.primary}
                />
                <div
                  className="absolute inset-x-0 bottom-0 h-8 pointer-events-none"
                  style={{ background: `linear-gradient(to bottom, transparent, rgba(${themeRgb},0.08))` }}
                />
              </div>
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-white/88 text-[13px] font-semibold leading-none tracking-tight truncate">
                    {activeTemplate.name}
                  </p>
                  <p className="text-white/30 text-[10.5px] mt-1.5 leading-none font-normal">
                    {activeTemplate.style}
                  </p>
                </div>
                <span
                  className="flex items-center gap-1.5 shrink-0 ml-2 px-2.5 py-1 rounded-full"
                  style={{
                    background: `rgba(${themeRgb},0.14)`,
                    border: `1px solid rgba(${themeRgb},0.25)`,
                  }}
                >
                  <Check size={9} strokeWidth={3} style={{ color: theme }} />
                  <span className="text-[9.5px] font-bold uppercase tracking-wider" style={{ color: theme }}>
                    Active
                  </span>
                </span>
              </div>
            </div>


                        {/* ── Edit details ── */}
            <div>
              <div className="flex items-center gap-2 mb-3 px-1">
                <MousePointerClick size={10} className="text-white/22 shrink-0" />
                <p className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-white/22">
                  Personalise
                </p>
              </div>
              <button
                onClick={() => { setPanelOpen(true); setSidebarOpen(false) }}
                className="group w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative overflow-hidden"
                style={{
                  background: 'rgba(255,255,255,0.035)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.background = `rgba(${themeRgb},0.07)`
                  el.style.borderColor = `rgba(${themeRgb},0.2)`
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.background = 'rgba(255,255,255,0.035)'
                  el.style.borderColor = 'rgba(255,255,255,0.07)'
                }}
              >
                <span
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200"
                  style={{
                    background: `rgba(${themeRgb},0.12)`,
                    border: `1px solid rgba(${themeRgb},0.2)`,
                  }}
                >
                  <Pencil size={14} style={{ color: theme }} />
                </span>
                <span className="min-w-0 flex-1 text-left">
                  <span className="block text-[13px] font-semibold text-white/75 leading-none">
                    Edit your details
                  </span>
                  <span className="block text-[10.5px] text-white/28 mt-1 leading-none">
                    Name, bio, specialties & more
                  </span>
                </span>
                <ChevronRight size={13} className="text-white/20 group-hover:text-white/45 group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            </div>

            {/* ── Template switcher ── */}
            <div>
              <div className="flex items-center gap-2 mb-3 px-1">
                <Layers size={10} className="text-white/22 shrink-0" />
                <p className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-white/22">
                  Switch template
                </p>
              </div>

              <div className="flex flex-col gap-[5px]">
                {TEMPLATES.map((tpl, i) => {
                  const active = demo.template_id === tpl.id
                  const tplRgb = hexToRgb(tpl.accent)
                  return (
                    <button
                      key={tpl.id}
                      onClick={() => pickTemplate(tpl.id)}
                      className="group w-full flex items-center gap-3 px-3 py-[10px] rounded-xl text-left transition-all duration-200 relative overflow-hidden"
                      style={{
                        background: active
                          ? `linear-gradient(90deg, rgba(${tplRgb},0.14), rgba(${tplRgb},0.05))`
                          : 'transparent',
                        border: active
                          ? `1px solid rgba(${tplRgb},0.22)`
                          : '1px solid transparent',
                      }}
                      onMouseEnter={e => {
                        if (!active) {
                          (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'
                          ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'
                        }
                      }}
                      onMouseLeave={e => {
                        if (!active) {
                          (e.currentTarget as HTMLElement).style.background = 'transparent'
                          ;(e.currentTarget as HTMLElement).style.borderColor = 'transparent'
                        }
                      }}
                    >
                      {active && (
                        <span
                          className="absolute left-0 top-2 bottom-2 w-[2.5px] rounded-full"
                          style={{ background: tpl.accent }}
                        />
                      )}
                      <span
                        className="shrink-0 rounded-[8px] overflow-hidden transition-all duration-200"
                        style={{
                          width: 46,
                          height: 32,
                          boxShadow: active
                            ? `0 0 0 1.5px ${tpl.accent}, 0 4px 12px rgba(${tplRgb},0.25)`
                            : '0 0 0 1px rgba(255,255,255,0.09)',
                        }}
                      >
                        <TemplateThumbnail id={tpl.id} accent={tpl.accent} bg={tpl.bg} color={color.primary} />
                      </span>
                      <span className="min-w-0 flex-1 flex items-center gap-2.5">
                        <span
                          className="text-[9px] font-bold tabular-nums shrink-0 w-4 text-center"
                          style={{ color: active ? tpl.accent : 'rgba(255,255,255,0.2)' }}
                        >
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="min-w-0">
                          <span
                            className="block text-[12.5px] font-semibold truncate leading-none transition-colors duration-150"
                            style={{ color: active ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.45)' }}
                          >
                            {tpl.name}
                          </span>
                          <span
                            className="block text-[10px] truncate mt-[3.5px] leading-none"
                            style={{ color: 'rgba(255,255,255,0.2)' }}
                          >
                            {tpl.style}
                          </span>
                        </span>
                      </span>
                      <span
                        className="shrink-0 w-[7px] h-[7px] rounded-full transition-all duration-200"
                        style={{
                          background: active ? tpl.accent : 'rgba(255,255,255,0.07)',
                          boxShadow: active ? `0 0 8px ${tpl.accent}90` : 'none',
                        }}
                      />
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px mx-1" style={{ background: 'rgba(255,255,255,0.05)' }} />



            {/* Demo hint */}
            <div
              className="rounded-xl px-4 py-3.5 flex items-start gap-3"
              style={{
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.048)',
              }}
            >
              <Zap size={13} className="shrink-0 mt-0.5" style={{ color: 'rgba(255,255,255,0.2)' }} />
              <p className="text-[11px] text-white/28 leading-[1.65]">
                This is a live demo, nothing is saved to any account yet.
                <span className="text-white/40 font-medium"> Claim your site to go live.</span>
              </p>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════
              FOOTER CTA
          ══════════════════════════════════════════════════════════════ */}
          <div
            className="shrink-0 px-4 pb-6 pt-4 relative"
            style={{ borderTop: '1px solid rgba(255,255,255,0.055)' }}
          >
            <div
              className="absolute -top-8 inset-x-0 h-8 pointer-events-none"
              style={{ background: 'linear-gradient(to top, #0d0d0d, transparent)' }}
            />
            <Link
              href="/signup?from=demo"
              className="relative flex items-center justify-center gap-2 w-full py-[13px] rounded-2xl text-sm font-semibold overflow-hidden transition-all duration-200 hover:opacity-90 hover:-translate-y-px"
              style={{
                background: `linear-gradient(135deg, ${theme} 0%, ${theme}cc 100%)`,
                boxShadow: `0 1px 0 rgba(255,255,255,0.18) inset, 0 10px 36px -6px rgba(${themeRgb},0.55), 0 4px 14px rgba(0,0,0,0.35)`,
                color: '#fff',
              }}
            >
              <span className="pointer-events-none absolute inset-0 rounded-2xl overflow-hidden">
                <span
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.14) 50%, transparent 65%)',
                    animation: 'tdemoshimmer 2.8s ease infinite',
                  }}
                />
              </span>
              <Sparkles size={14} className="relative z-10" />
              <span className="relative z-10 tracking-tight">Claim this profile</span>
              <ChevronRight size={14} className="relative z-10" />
            </Link>
            <div className="flex items-center justify-center gap-4 mt-3.5">
              {['Easy to implement', 'No coding'].map((t) => (
                <span key={t} className="flex items-center gap-1 text-[10.5px] text-white/20 font-medium">
                  <Check size={8} strokeWidth={3} style={{ color: 'rgba(255,255,255,0.25)' }} />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom glow line */}
          <div
            className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
            style={{
              background: `linear-gradient(90deg, transparent 5%, rgba(${themeRgb},0.35) 40%, rgba(${themeRgb},0.35) 60%, transparent 95%)`,
            }}
          />
        </div>
      </aside>

      {/* ─── Canvas ──────────────────────────────────────────────────────── */}
      <main className="relative" style={{ ['--demo-bar' as string]: '0px' }}>
        <div
          className="demo-canvas bg-white transition-opacity duration-200"
          style={{ opacity: morphing ? 0 : 1 }}
        >
          <TemplateCanvas profile={profile} />
        </div>
      </main>

      {/* ─── Quick-fill slide-in panel ───────────────────────────────────── */}
      {panelOpen && (
        <div style={{ zIndex: 10003 }} className="fixed inset-0 flex" onClick={() => setPanelOpen(false)}>
          <div className="flex-1 bg-black/50 backdrop-blur-[2px]" />
          <div
            className="w-full max-w-md h-full bg-[#fbfaf8] flex flex-col shadow-2xl"
            style={{ animation: 'tdemoslidein .25s ease both' }}
            onClick={e => e.stopPropagation()}
          >
            <div
              className="relative px-6 pt-6 pb-5 shrink-0 overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${theme}12, transparent)` }}
            >
              <span
                className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: `linear-gradient(90deg, transparent, ${theme}, transparent)` }}
              />
              <button
                onClick={() => setPanelOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-[#9a9488] hover:bg-black/5 transition"
              >
                <X size={18} />
              </button>
              <div className="flex items-center gap-2.5 mb-1.5">
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${theme}1e` }}
                >
                  <Sparkles size={14} style={{ color: theme }} />
                </span>
                <h2 className="text-[15px] font-semibold text-[#1c1c1e] tracking-tight">Make it yours</h2>
              </div>
              <p className="text-[12px] text-[#6b7280] leading-relaxed">
                Type your details your site updates live. Switch templates anytime, your data stays.
              </p>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <QuickFillForm demo={demo} theme={theme} onChange={patch} onSkip={() => setPanelOpen(false)} />
            </div>
            <div className="shrink-0 border-t border-[#ece7df] bg-white px-6 py-4">
              <Link
                href="/signup?from=demo"
                className="flex items-center justify-center gap-1.5 w-full py-3 rounded-xl text-white text-[13.5px] font-semibold transition hover:opacity-90"
                style={{
                  background: `linear-gradient(135deg, ${theme}, ${theme}cc)`,
                  boxShadow: `0 6px 20px -6px rgba(${themeRgb},0.5)`,
                }}
              >
                Claim this site <ChevronRight size={14} />
              </Link>
              <p className="text-center text-[11px] text-[#9ca3af] mt-2">Claim Now</p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes tdemoslidein {
          from { transform: translateX(24px); opacity: 0 }
          to   { transform: translateX(0);    opacity: 1 }
        }
        @keyframes tdemoshimmer {
          0%   { transform: translateX(-120%) skewX(-12deg) }
          60%  { transform: translateX(120%)  skewX(-12deg) }
          100% { transform: translateX(120%)  skewX(-12deg) }
        }
        .scrollbar-none::-webkit-scrollbar { display: none }
        .scrollbar-none { scrollbar-width: none }

        .demo-canvas .ct-nav,
        .demo-canvas .ct3-nav,
        .demo-canvas .ct4-nav,
        .demo-canvas .ct5-nav {
          top: var(--demo-bar) !important;
        }
        .demo-canvas .ct3-progress,
        .demo-canvas .ct4-progress,
        .demo-canvas .ct5-progress {
          top: calc(var(--demo-bar) + var(--nav-h, 0px)) !important;
        }
      `}</style>
    </div>
  )
}

'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import {
  TEMPLATES, TEMPLATE_SECTIONS, COLORS, canUseTemplate, getColor, PAID_PLANS,
  type TemplateId, type ColorId, type TherapistProfile,
} from '@/lib/template'
import Button from '@/components/ui/Button'
import LivePreview from '@/components/appearance/LivePreview'
import TemplatePreviewModal from '@/components/appearance/TemplatePreviewModal'
import TemplateThumbnail from '@/components/appearance/TemplateThumbnail'
import TemplateCanvas from '@/components/booking/templates/TemplateCanvas'
import TemplateLiveSwitcher from '@/components/appearance/TemplateLiveSwitcher'
import { Save, Lock, Check, AlertCircle, Zap, Crown, ChevronRight, Sparkles } from 'lucide-react'
import type { ProfileContent, CT1Content, CT2Content, CT3Content, CT4Content, CT5Content } from '@/components/booking/templates/templateUtils'
import dynamic from 'next/dynamic'

const CT1ContentEditor = dynamic(() => import('../../../components/appearance/CT1ContentEditor'), { ssr: false })
const CT2ContentEditor = dynamic(() => import('../../../components/appearance/CT2ContentEditor'), { ssr: false })
const CT3ContentEditor = dynamic(() => import('../../../components/appearance/CT3ContentEditor'), { ssr: false })
const CT4ContentEditor = dynamic(() => import('../../../components/appearance/CT4ContentEditor'), { ssr: false })
const CT5ContentEditor = dynamic(() => import('../../../components/appearance/CT5ContentEditor'), { ssr: false })

type Tab = 'design' | 'sections' | 'content'

// template id → /try demo param
const TEMPLATE_TPARAM: Record<TemplateId, string> = {
  classic: 't1', classic2: 't2', classic3: 't3', classic4: 't4', classic5: 't5',
}

const STARTER_TEMPLATE_LOCK_DAYS = 365

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function formatLockDate(iso: string | null) {
  if (!iso) return ''
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso))
}

export default function AppearancePage() {
  const supabase = createClient()
  const router   = useRouter()

  const [profile,          setProfile]          = useState<TherapistProfile | null>(null)
  const [currentPlan,      setCurrentPlan]      = useState<string>('free')
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('classic')
  const [selectedColor,    setSelectedColor]    = useState<ColorId>('teal')
  const [hiddenSections,   setHiddenSections]   = useState<string[]>([])
  const [profileContent,   setProfileContent]   = useState<ProfileContent>({})
  const [activeTab,        setActiveTab]        = useState<Tab>('design')
  const [previewOpen,      setPreviewOpen]      = useState(false)
  const [templatePreview,  setTemplatePreview]  = useState<TemplateId | null>(null)
  // Which template is being PREVIEWED in the switcher (independent of the
  // committed selection until the user clicks Select).
  const [previewTemplate,  setPreviewTemplate]  = useState<TemplateId>('classic')
  const [confirmOpen,      setConfirmOpen]      = useState(false)
  const [saving,           setSaving]           = useState(false)
  const [saved,            setSaved]            = useState(false)
  const [saveError,        setSaveError]        = useState<string | null>(null)
  const [lockedTemplate,   setLockedTemplate]   = useState<TemplateId | null>(null)
  const [committedTemplate,setCommittedTemplate]= useState<TemplateId>('classic')
  const [templateLockedUntil, setTemplateLockedUntil] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('therapists').select('*').eq('id', user.id).single()
      if (data) {
        setProfile(data)
        setCurrentPlan(data.plan ?? 'free')
        setSelectedTemplate(data.template_id ?? 'classic')
        setCommittedTemplate(data.template_id ?? 'classic')
        setPreviewTemplate(data.template_id ?? 'classic')
        setSelectedColor(data.color_id ?? 'teal')
        setHiddenSections(data.hidden_sections ?? [])
        setProfileContent(data.profile_content ?? {})
        setTemplateLockedUntil(data.template_locked_until ?? null)
      }
    }
    load()
  }, [])

  function handleTemplateClick(template: typeof TEMPLATES[0]) {
    if (isTemplateLocked && template.id !== committedTemplate) {
      setLockedTemplate(template.id)
      return
    }
    if (!canUseTemplate(template, currentPlan)) {
      setLockedTemplate(template.id)
      return
    }
    setSelectedTemplate(template.id)
    setHiddenSections([])
    setLockedTemplate(null)
  }

  function toggleSection(id: string) {
    setHiddenSections(p => p.includes(id) ? p.filter(s => s !== id) : [...p, id])
  }

  function patchContent<K extends keyof ProfileContent>(key: K, val: ProfileContent[K]) {
    setProfileContent(p => ({ ...p, [key]: val }))
  }

  async function handleSave() {
    setSaving(true); setSaveError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setSaving(false); return }
      const template = TEMPLATES.find(t => t.id === selectedTemplate)!
      if (!canUseTemplate(template, currentPlan)) {
        setSaveError(`"${template.name}" requires a Growth plan.`)
        setSaving(false); return
      }
      if (isTemplateLocked && selectedTemplate !== committedTemplate) {
        setSaveError(`Your Starter template is locked until ${formatLockDate(templateLockedUntil)}.`)
        setSaving(false); return
      }
      const shouldStartStarterLock =
        currentPlan === 'starter' &&
        !isTemplateLocked &&
        (!templateLockedUntil || new Date(templateLockedUntil).getTime() <= Date.now())
      const nextLockedUntil = shouldStartStarterLock
        ? addDays(new Date(), STARTER_TEMPLATE_LOCK_DAYS).toISOString()
        : templateLockedUntil
      const { error } = await supabase
        .from('therapists')
        .update({
          template_id: selectedTemplate,
          color_id: selectedColor,
          hidden_sections: hiddenSections,
          profile_content: profileContent,
          template_locked_until: nextLockedUntil,
        })
        .eq('id', user.id)
      if (error) throw new Error(error.message)
      setCommittedTemplate(selectedTemplate)
      setTemplateLockedUntil(nextLockedUntil)
      setSaved(true); setTimeout(() => setSaved(false), 2500)
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : String(e))
    } finally {
      setSaving(false)
    }
  }

  const isPaid    = PAID_PLANS.has(currentPlan)
  const isStarter = currentPlan === 'starter'
  const isTemplateLocked = isStarter && !!templateLockedUntil && new Date(templateLockedUntil).getTime() > Date.now()
  const lockDateLabel = formatLockDate(templateLockedUntil)
  const color     = getColor(selectedColor)
  const activeTemplate = TEMPLATES.find(t => t.id === selectedTemplate)!
  const currentSections = TEMPLATE_SECTIONS[selectedTemplate] ?? []

  const previewProfile: TherapistProfile = {
    ...(profile ?? {}),
    full_name: profile?.full_name ?? 'Dr. Your Name',
    template_id: selectedTemplate, color_id: selectedColor,
    hidden_sections: hiddenSections,
    profile_content: profileContent as Record<string, unknown>,
    plan: currentPlan,
  }

  return (
    <div className="min-h-screen bg-[#f9f8f6]">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-white border-b border-[#ede9e4] px-4 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-[#1c1c1e]" style={{ fontFamily: 'var(--font-cormorant), serif' }}>
            Appearance
          </h1>
          <p className="text-xs text-[#9ca3af] mt-0.5">Customise your public profile</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`/try?t=${TEMPLATE_TPARAM[previewTemplate]}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#e8e4df] bg-white text-sm font-medium text-[#6b7280] hover:border-[#a3b8b4] hover:text-[#1c1c1e] transition"
          >
            <Sparkles size={15} /> Try demo
          </a>
          <button
            onClick={() => {
              // Already locked & trying a different template → show the locked notice.
              if (isTemplateLocked && selectedTemplate !== committedTemplate) {
                setLockedTemplate(selectedTemplate)
                return
              }
              setConfirmOpen(true)
            }}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white transition"
            style={{ background: saving ? '#ff9933' : saved ? '#16a34a' : color.primary }}
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : saved ? (
              <Check size={15} />
            ) : (
              <Save size={15} />
            )}
            {saved ? 'Applied!' : 'Apply this template'}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:h-[calc(100vh-65px)]">
        {/* ── Left sidebar ──────────────────────────────────────────────────── */}
        <div className="w-full lg:w-72 shrink-0 bg-white border-b lg:border-b-0 lg:border-r border-[#ede9e4] overflow-y-auto">
          <nav className="p-3 sm:p-4 flex lg:flex-col gap-1 lg:space-y-1 overflow-x-auto">
            {([
              ['design',   'Choose Template',    '🎨'],
              ['sections', 'Page Sections',      '⊞'],
              ['content',  'Edit Content',       '✏️'],
            ] as [Tab, string, string][]).map(([id, label, icon]) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex-1 lg:w-full flex items-center justify-center lg:justify-start gap-2 lg:gap-3 px-3 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition ${
                  activeTab === id
                    ? 'text-white'
                    : 'text-[#6b7280] hover:bg-[#f9f8f6] hover:text-[#1c1c1e]'
                }`}
                style={activeTab === id ? { background: color.primary } : {}}
              >
                <span className="text-base">{icon}</span>
                {label}
                {activeTab !== id && <ChevronRight size={14} className="ml-auto opacity-40 hidden lg:block" />}
              </button>
            ))}
          </nav>

          <div className="hidden lg:block px-4 pt-2 pb-4 border-t border-[#f0ece8] mt-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#9ca3af] mb-3">Your Plan</p>
            <div className={`rounded-xl p-3 text-xs ${isPaid ? 'bg-amber-50 border border-amber-200' : 'bg-[#f0f8f7] border border-[#d4e4e1]'}`}>
              <div className="flex items-center gap-2 font-semibold mb-1" style={{ color: isPaid ? '#92400e' : '#2d4a47' }}>
                {isPaid ? <Crown size={13} /> : <Zap size={13} />}
                {isPaid ? `${currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} Plan` : 'Free Plan'}
              </div>
              {isStarter && (
                <p className="text-[11px] leading-4 text-amber-700">
                  {isTemplateLocked
                    ? `Template locked until ${lockDateLabel}`
                    : 'Choose one template. Your final choice locks for 1 year.'}
                </p>
              )}
              {!isPaid && (
                <button onClick={() => router.push('/pricing?redirect=/dashboard/appearance')}
                  className="mt-1.5 w-full py-1.5 rounded-lg text-white text-[11px] font-bold transition hover:opacity-90"
                  style={{ background: color.primary }}>
                  Upgrade — ₹0.9/y →
                </button>
              )}
            </div>
          </div>

          {/* Template list — click to preview; active is highlighted */}
          <div className="hidden lg:block px-4 pb-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#9ca3af] mb-2">Templates</p>
            <div className="space-y-1.5">
              {TEMPLATES.map((t, i) => {
                const on = previewTemplate === t.id
                const committed = committedTemplate === t.id
                return (
                  <button
                    key={t.id}
                    onClick={() => { setPreviewTemplate(t.id); setActiveTab('design') }}
                    className="w-full flex items-center gap-2.5 rounded-xl border p-2 transition text-left"
                    style={on
                      ? { borderColor: color.primary, background: `${color.primary}0d` }
                      : { borderColor: '#e8e4df', background: '#fff' }}
                  >
                    <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0">
                      <TemplateThumbnail id={t.id} accent={t.accent} bg={t.bg} color={color.primary} selected={on} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[#1c1c1e] truncate flex items-center gap-1">
                        <span className="text-[#9ca3af] font-mono">{String(i + 1).padStart(2, '0')}</span>
                        {t.name}
                        {committed && <Check size={11} className="text-emerald-500 shrink-0" />}
                      </p>
                      <p className="text-[10px] text-[#9ca3af] truncate">{t.style}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Main content area ────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto min-h-[50vh]">
          {/* Error banner */}
          {saveError && (
            <div className="mx-6 mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <div><p className="font-semibold">Save failed</p><p className="text-red-600">{saveError}</p></div>
              <button onClick={() => setSaveError(null)} className="ml-auto text-red-400 hover:text-red-600">×</button>
            </div>
          )}

          {isTemplateLocked && (
            <div className="mx-6 mt-6 flex items-start gap-3 rounded-xl border border-[#d9c7aa] bg-[#fff8ed] px-4 py-3 text-sm text-[#7c5a2f]">
              <Lock size={16} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">Template locked until {lockDateLabel}</p>
                <p className="text-[#8a6a3e]">You can still edit colors, sections, and page content. Trying demos remains open.</p>
              </div>
            </div>
          )}

          {/* Locked template nudge */}
          {lockedTemplate && (
            <div className="mx-6 mt-6 rounded-2xl overflow-hidden border-2 border-amber-200">
              <div className="bg-amber-50 px-5 py-4 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#fef3c7' }}>
                  <Lock size={18} className="text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-amber-900">{TEMPLATES.find(t => t.id === lockedTemplate)?.name} can be previewed, but not selected yet</p>
                  <p className="text-sm text-amber-700 mt-0.5">Your Starter template choice is final until {lockDateLabel}. Use Full preview or Try demo to explore it without changing your live site.</p>
                </div>
                <button onClick={() => setLockedTemplate(null)} className="text-amber-400 hover:text-amber-600 text-xl leading-none shrink-0">×</button>
              </div>
              <div className="bg-white px-5 py-3 flex items-center gap-3">
                <button onClick={() => setTemplatePreview(lockedTemplate)}
                  className="px-5 py-2 rounded-xl text-white text-sm font-bold transition hover:opacity-90"
                  style={{ background: color.primary }}>
                  View plans & upgrade →
                </button>
                <button onClick={() => setLockedTemplate(null)} className="text-sm text-[#6b7280] hover:text-[#1c1c1e]">Maybe later</button>
              </div>
            </div>
          )}

          {/* ══ TAB: DESIGN ════════════════════════════════════════════════ */}
          {activeTab === 'design' && (
            <div className="p-6 space-y-8">

              {/* Color Picker — at top so changes feel instant in thumbnails */}
              {/* <section>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-bold text-[#1c1c1e] uppercase tracking-wide">Brand Color</h2>
                    <p className="text-xs text-[#9ca3af] mt-0.5">Applied across buttons, accents, and highlights</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#e8e4df] bg-white">
                    <div className="w-4 h-4 rounded-full" style={{ background: color.primary }} />
                    <span className="text-xs font-semibold text-[#1c1c1e]">{color.name}</span>
                  </div>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {COLORS.map(c => {
                    const isSelected = selectedColor === c.id
                    return (
                      <button
                        key={c.id}
                        onClick={() => setSelectedColor(c.id)}
                        className="group flex flex-col items-center gap-2"
                      >
                        <div className={`w-12 h-12 rounded-2xl transition-all duration-200 flex items-center justify-center shadow-sm ${
                          isSelected ? 'scale-110 ring-4 ring-offset-2' : 'hover:scale-105'
                        }`}
                          style={{ background: c.primary, ['--tw-ring-color' as string]: c.primary }}>
                          {isSelected && <Check size={16} className="text-white" strokeWidth={3} />}
                        </div>
                        <span className={`text-xs font-medium transition-colors ${isSelected ? 'text-[#1c1c1e]' : 'text-[#9ca3af] group-hover:text-[#6b7280]'}`}>
                          {c.name}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </section> */}

              {/* Divider */}
              <div className="border-t border-[#ede9e4]" />

              {/* Template picker — live, switchable, real-template previews */}
              <section>
                <div className="mb-2">
                  <h2 className="text-sm font-bold text-[#1c1c1e] uppercase tracking-wide">Choose Template</h2>
                  <p className="text-xs text-[#9ca3af] mt-0.5">
                    Switch between the real templates, try a live demo, then select one.
                  </p>
                </div>

                <TemplateLiveSwitcher
                  selectedTemplate={selectedTemplate}
                  committedTemplate={committedTemplate}
                  isLocked={isTemplateLocked}
                  lockDateLabel={lockDateLabel}
                  brandColor={color.primary}
                  onSelect={(id) => handleTemplateClick(TEMPLATES.find(t => t.id === id)!)}
                  onLockedAttempt={(id) => setLockedTemplate(id)}
                  active={previewTemplate}
                  onActiveChange={setPreviewTemplate}
                  hideTabs
                />
              </section>
            </div>
          )}

          {/* ══ TAB: SECTIONS ══════════════════════════════════════════════ */}
          {activeTab === 'sections' && (
            <div className="p-6">
              <div className="mb-5">
                <h2 className="text-sm font-bold text-[#1c1c1e] uppercase tracking-wide">Page Sections</h2>
                <p className="text-xs text-[#9ca3af] mt-0.5">Toggle which sections appear on <strong>{activeTemplate.name}</strong></p>
              </div>

              <div className="space-y-2">
                {currentSections.map((section, i) => {
                  const enabled = !hiddenSections.includes(section.id)
                  return (
                    <div
                      key={section.id}
                      onClick={() => toggleSection(section.id)}
                      className="flex items-center gap-4 px-4 py-3.5 rounded-xl border cursor-pointer transition-all"
                      style={enabled
                        ? { borderColor: `${color.primary}40`, background: `${color.primary}08` }
                        : { borderColor: '#e8e4df', background: 'white' }}
                    >
                      <span className="text-xs font-mono text-[#9ca3af] w-5">{String(i + 1).padStart(2, '0')}</span>
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${enabled ? 'shadow-sm' : 'bg-[#f0ece8]'}`}
                        style={enabled ? { background: color.primary } : {}}>
                        {enabled && <Check size={12} className="text-white" strokeWidth={3} />}
                      </div>
                      <span className={`text-sm font-medium flex-1 ${enabled ? 'text-[#1c1c1e]' : 'text-[#9ca3af] line-through'}`}>
                        {section.label}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-[#f0ece8] text-[#9ca3af]'}`}>
                        {enabled ? 'Visible' : 'Hidden'}
                      </span>
                    </div>
                  )
                })}
              </div>

              <p className="mt-4 text-xs text-[#9ca3af] text-center">
                {currentSections.filter(s => !hiddenSections.includes(s.id)).length} of {currentSections.length} sections visible
              </p>
            </div>
          )}

          {/* ══ TAB: CONTENT ═══════════════════════════════════════════════ */}
          {activeTab === 'content' && (
            <div className="p-6">
              <div className="mb-5">
                <h2 className="text-sm font-bold text-[#1c1c1e] uppercase tracking-wide">Edit Page Content</h2>
                <p className="text-xs text-[#9ca3af] mt-0.5">Editing: <strong>{activeTemplate.name}</strong> · Save when done</p>
              </div>

              {!canUseTemplate(activeTemplate, currentPlan) ? (
                <div className="rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50 p-10 text-center">
                  <Lock size={28} className="text-amber-300 mx-auto mb-3" />
                  <p className="font-semibold text-amber-800">This template is locked</p>
                  <p className="text-sm text-amber-600 mt-1 mb-4">Upgrade to Growth to edit content for this template.</p>
                  <button onClick={() => router.push('/pricing?redirect=/dashboard/appearance')}
                    className="px-5 py-2.5 rounded-xl text-white text-sm font-bold transition hover:opacity-90"
                    style={{ background: color.primary }}>
                    View plans & upgrade →
                  </button>
                </div>
              ) : (
                <>
                  {selectedTemplate === 'classic'  && <CT1ContentEditor value={(profileContent as any).classic  ?? {}} onChange={v => patchContent('classic',  v as CT1Content)} />}
                  {selectedTemplate === 'classic2' && <CT2ContentEditor value={(profileContent as any).classic2 ?? {}} onChange={v => patchContent('classic2', v as CT2Content)} />}
                  {selectedTemplate === 'classic3' && <CT3ContentEditor value={(profileContent as any).classic3 ?? {}} onChange={v => patchContent('classic3', v as CT3Content)} />}
                  {selectedTemplate === 'classic4' && <CT4ContentEditor value={(profileContent as any).classic4 ?? {}} onChange={v => patchContent('classic4', v as CT4Content)} />}
                  {selectedTemplate === 'classic5' && <CT5ContentEditor value={(profileContent as any).classic5 ?? {}} onChange={v => patchContent('classic5', v as CT5Content)} />}
                </>
              )}
            </div>
          )}
        </div>

        {/* ── Right: Live mini preview ─────────────────────────────────────── */}
      </div>

      {previewOpen     && <LivePreview profile={previewProfile} onClose={() => setPreviewOpen(false)} />}
      {templatePreview && <TemplatePreviewModal templateId={templatePreview} onClose={() => setTemplatePreview(null)} />}

      {/* ── Apply confirmation: warns about the 12-month lock ── */}
      {confirmOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 p-4"
          onClick={() => !saving && setConfirmOpen(false)}>
          <div className="w-full max-w-sm bg-white rounded-2xl overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}>
            <div className="px-6 pt-6 pb-4 text-center">
              <div className="mx-auto mb-4 w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: `${color.primary}1e` }}>
                <Lock size={24} style={{ color: color.primary }} />
              </div>
              <h2 className="text-lg font-semibold text-[#1c1c1e]">Apply “{activeTemplate.name}”?</h2>
              <p className="text-sm text-[#6b7280] mt-2 leading-relaxed">
                {isStarter
                  ? <>This becomes your live template. You <strong>cannot change it for 12 months</strong>. You can still try other templates as a demo, but applying a different one won’t be allowed until the lock ends.</>
                  : <>This will be applied to your live profile.</>}
              </p>
            </div>
            <div className="px-6 pb-6 flex gap-2">
              <button
                onClick={() => setConfirmOpen(false)}
                disabled={saving}
                className="flex-1 h-11 rounded-xl border border-[#e8e4df] text-sm font-medium text-[#6b7280] hover:bg-[#f5f4f1] transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={async () => { await handleSave(); setConfirmOpen(false) }}
                disabled={saving}
                className="flex-1 h-11 rounded-xl text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: color.primary }}
              >
                {saving
                  ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  : <>{isStarter ? 'OK, apply & lock' : 'OK, apply'}</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

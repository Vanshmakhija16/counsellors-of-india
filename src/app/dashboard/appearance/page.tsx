'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import {
  TEMPLATES, TEMPLATE_SECTIONS, canUseTemplate, getColor, getOrderedSections,
  type TemplateId, type ColorId, type TherapistProfile,
} from '@/lib/template'
import LivePreview from '@/components/appearance/LivePreview'
import TemplatePreviewModal from '@/components/appearance/TemplatePreviewModal'
import TemplateLiveSwitcher from '@/components/appearance/TemplateLiveSwitcher'
import DraggableDock from '@/components/appearance/DraggableDock'
import { Save, Lock, Check, AlertCircle, Sparkles, Pencil, LayoutList, X, GripVertical, ArrowLeft, ChevronLeft, ChevronRight, Image as ImageIcon, ChevronUp, ChevronDown } from 'lucide-react'
import type { ProfileContent, CT1Content, CT2Content, CT3Content, CT4Content, CT5Content } from '@/components/booking/templates/templateUtils'
import dynamic from 'next/dynamic'

const CT1ContentEditor = dynamic(() => import('../../../components/appearance/CT1ContentEditor'), { ssr: false })
const CT2ContentEditor = dynamic(() => import('../../../components/appearance/CT2ContentEditor'), { ssr: false })
const CT3ContentEditor = dynamic(() => import('../../../components/appearance/CT3ContentEditor'), { ssr: false })
const CT4ContentEditor = dynamic(() => import('../../../components/appearance/CT4ContentEditor'), { ssr: false })
const CT5ContentEditor = dynamic(() => import('../../../components/appearance/CT5ContentEditor'), { ssr: false })

// template id → /try demo param
const TEMPLATE_TPARAM: Record<TemplateId, string> = {
  classic: 't1', classic2: 't2', classic3: 't3', classic4: 't4', classic5: 't5', classic6: 't6',
}

const STARTER_TEMPLATE_LOCK_DAYS = 365

// Brand saffron — keep primary actions on-theme regardless of selected color.
const BRAND = '#ff9933'

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
  const [savedHiddenSections, setSavedHiddenSections] = useState<string[]>([])
  const [sectionOrder,     setSectionOrder]     = useState<string[]>([])
  const [savedSectionOrder, setSavedSectionOrder] = useState<string[]>([])
  const [draggedId,        setDraggedId]        = useState<string | null>(null)
  const [dragOverId,       setDragOverId]       = useState<string | null>(null)
  const [profileContent,   setProfileContent]   = useState<ProfileContent>({})
  const [savedProfileContent, setSavedProfileContent] = useState<ProfileContent>({})
  const [previewOpen,      setPreviewOpen]      = useState(false)
  const [editOpen,         setEditOpen]         = useState(false)
  const [editMode,         setEditMode]         = useState<'choose' | 'content' | 'sections'>('choose')
  const [templatePreview,  setTemplatePreview]  = useState<TemplateId | null>(null)
  const [previewTemplate,  setPreviewTemplate]  = useState<TemplateId>('classic')
  const [confirmOpen,      setConfirmOpen]      = useState(false)
  const [saving,           setSaving]           = useState(false)
  const [saved,            setSaved]            = useState(false)
  const [savingSections,   setSavingSections]   = useState(false)
  const [savedSections,    setSavedSections]    = useState(false)
  const [savingContent,    setSavingContent]    = useState(false)
  const [savedContent,     setSavedContent]     = useState(false)
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
        setSavedHiddenSections(data.hidden_sections ?? [])
        setSectionOrder(data.section_order ?? [])
        setSavedSectionOrder(data.section_order ?? [])
        setProfileContent(data.profile_content ?? {})
        setSavedProfileContent(data.profile_content ?? {})
        setTemplateLockedUntil(data.template_locked_until ?? null)
      }
    }
    load()
  }, [])

  // Step through templates with prev/next arrows (wraps around).
  const activeIndex = TEMPLATES.findIndex(t => t.id === previewTemplate)
  function stepTemplate(dir: 1 | -1) {
    const next = (activeIndex + dir + TEMPLATES.length) % TEMPLATES.length
    setPreviewTemplate(TEMPLATES[next].id)
  }

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
    setSectionOrder([])
    setLockedTemplate(null)
  }

  function toggleSection(id: string) {
    setHiddenSections(p => p.includes(id) ? p.filter(s => s !== id) : [...p, id])
  }

  function moveSection(id: string, dir: -1 | 1) {
    const ids = orderedSections.map(s => s.id)
    const i = ids.indexOf(id)
    const j = i + dir
    if (i === -1 || j < 0 || j >= ids.length) return
    const next = [...ids]
    ;[next[i], next[j]] = [next[j], next[i]]
    setSectionOrder(next)
  }

  function reorderByDrag(draggedSectionId: string, targetId: string) {
    if (draggedSectionId === targetId) return
    const ids = orderedSections.map(s => s.id)
    const from = ids.indexOf(draggedSectionId)
    const to   = ids.indexOf(targetId)
    if (from === -1 || to === -1) return
    const next = [...ids]
    next.splice(from, 1)
    next.splice(to, 0, draggedSectionId)
    setSectionOrder(next)
  }

  function patchContent<K extends keyof ProfileContent>(key: K, val: ProfileContent[K]) {
    setProfileContent(p => ({ ...p, [key]: val }))
  }

  async function updateTherapist(userId: string, payload: Record<string, unknown>) {
    let { error } = await supabase.from('therapists').update(payload).eq('id', userId)
    if (error && 'section_order' in payload && /section_order/i.test(error.message ?? '')) {
      const { section_order: _omit, ...rest } = payload
      ;({ error } = await supabase.from('therapists').update(rest).eq('id', userId))
    }
    if (error) throw new Error(error.message)
  }

  async function handleSaveSections() {
    setSavingSections(true); setSaveError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setSavingSections(false); return }
      await updateTherapist(user.id, { hidden_sections: hiddenSections, section_order: sectionOrder })
      setSavedHiddenSections(hiddenSections)
      setSavedSectionOrder(sectionOrder)
      setSavedSections(true); setTimeout(() => setSavedSections(false), 2500)
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : String(e))
    } finally {
      setSavingSections(false)
    }
  }

  async function handleSaveContent() {
    setSavingContent(true); setSaveError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setSavingContent(false); return }
      await updateTherapist(user.id, { profile_content: profileContent })
      setSavedProfileContent(profileContent)
      setSavedContent(true); setTimeout(() => setSavedContent(false), 2500)
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : String(e))
    } finally {
      setSavingContent(false)
    }
  }

  async function handleSave() {
    setSaving(true); setSaveError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setSaving(false); return }
      const templateToApply = previewTemplate
      const template = TEMPLATES.find(t => t.id === templateToApply)!
      if (!canUseTemplate(template, currentPlan)) {
        setSaveError(`"${template.name}" requires a Growth plan.`)
        setSaving(false); return
      }
      if (isTemplateLocked && templateToApply !== committedTemplate) {
        setSaveError(`Your template is locked until ${formatLockDate(templateLockedUntil)}.`)
        setSaving(false); return
      }
      const shouldStartStarterLock =
        currentPlan === 'starter' &&
        !isTemplateLocked &&
        (!templateLockedUntil || new Date(templateLockedUntil).getTime() <= Date.now())
      const nextLockedUntil = shouldStartStarterLock
        ? addDays(new Date(), STARTER_TEMPLATE_LOCK_DAYS).toISOString()
        : templateLockedUntil
      await updateTherapist(user.id, {
        template_id: templateToApply,
        color_id: selectedColor,
        hidden_sections: hiddenSections,
        section_order: sectionOrder,
        profile_content: profileContent,
        template_locked_until: nextLockedUntil,
      })
      setSelectedTemplate(templateToApply)
      setCommittedTemplate(templateToApply)
      setSavedHiddenSections(hiddenSections)
      setSavedSectionOrder(sectionOrder)
      setSavedProfileContent(profileContent)
      setTemplateLockedUntil(nextLockedUntil)
      setSaved(true); setTimeout(() => setSaved(false), 2500)
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : String(e))
    } finally {
      setSaving(false)
    }
  }

  const isStarter = currentPlan === 'starter'
  const isTemplateLocked = isStarter && !!templateLockedUntil && new Date(templateLockedUntil).getTime() > Date.now()
  const lockDateLabel = formatLockDate(templateLockedUntil)
  const color     = getColor(selectedColor)
  const activeTemplate = TEMPLATES.find(t => t.id === selectedTemplate)!
  const orderedSections = getOrderedSections(selectedTemplate, sectionOrder, null)
  const sectionsHaveUnsavedChanges =
    JSON.stringify([...hiddenSections].sort()) !== JSON.stringify([...savedHiddenSections].sort()) ||
    JSON.stringify(sectionOrder) !== JSON.stringify(savedSectionOrder)

  const contentHasUnsavedChanges =
    JSON.stringify(profileContent) !== JSON.stringify(savedProfileContent)

  const previewProfile: TherapistProfile = {
    ...(profile ?? {}),
    full_name: profile?.full_name ?? 'Dr. Your Name',
    template_id: selectedTemplate, color_id: selectedColor,
    hidden_sections: hiddenSections,
    section_order: sectionOrder,
    profile_content: profileContent as Record<string, unknown>,
    plan: currentPlan,
  }

  return (
    <div className="min-h-screen bg-[#f9f8f6]">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div
        data-dock-bounds
        className="sticky top-0 z-30 bg-white border-b border-[#ede9e4] px-4 sm:px-8 py-4 flex items-center justify-between gap-3"
      >
        <div>
          <h1 className="text-xl font-semibold text-[#1c1c1e]" style={{ fontFamily: 'var(--font-cormorant), serif' }}>
            Your Website
          </h1>
          <p className="text-xs text-[#9ca3af] mt-0.5">Pick a design, edit your content, then apply</p>
        </div>

        {/* Template prev / next arrows */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-[#9ca3af] mr-1 hidden sm:inline">
            {activeIndex + 1} / {TEMPLATES.length}
          </span>
          <button
            type="button"
            aria-label="Previous template"
            onClick={() => stepTemplate(-1)}
            className="h-9 w-9 rounded-xl border border-[#e8e4df] bg-white flex items-center justify-center text-[#1c1c1e] hover:bg-[#fff7ee] hover:border-[#FF9933] hover:text-[#C46800] transition"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            aria-label="Next template"
            onClick={() => stepTemplate(1)}
            className="h-9 w-9 rounded-xl border border-[#e8e4df] bg-white flex items-center justify-center text-[#1c1c1e] hover:bg-[#fff7ee] hover:border-[#FF9933] hover:text-[#C46800] transition"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* ── Banners ──────────────────────────────────────────────────── */}
      <div className="px-4 sm:px-8 pt-4 space-y-3 empty:hidden">
        {saveError && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <div><p className="font-semibold">Save failed</p><p className="text-red-600">{saveError}</p></div>
            <button onClick={() => setSaveError(null)} className="ml-auto text-red-400 hover:text-red-600">×</button>
          </div>
        )}
      </div>

      {/* ── Full-width live preview ────────────────────────────────────── */}
      <div className="px-4 sm:px-8 py-4">
        <div className="rounded-2xl overflow-hidden shadow-sm border border-[#ede9e4]">
          <TemplateLiveSwitcher
            selectedTemplate={selectedTemplate}
            committedTemplate={committedTemplate}
            isLocked={isTemplateLocked}
            lockDateLabel={lockDateLabel}
            brandColor={BRAND}
            onSelect={(id) => handleTemplateClick(TEMPLATES.find(t => t.id === id)!)}
            onLockedAttempt={(id) => setLockedTemplate(id)}
            active={previewTemplate}
            onActiveChange={setPreviewTemplate}
            hideTabs
            hideActionBar
            hideArrows
            frameHeight={680}
            profileContent={profileContent as Record<string, unknown>}
          />
        </div>
      </div>

      {/* ── Slide-in Edit drawer (right side) ─────────────────────────────────── */}
      {editOpen && (
        <button
          aria-label="Close editor"
          onClick={() => setEditOpen(false)}
          className="fixed inset-0 z-40 bg-black/30"
        />
      )}
      <aside
        className={`fixed top-0 right-0 z-50 h-screen w-full sm:w-[460px] bg-white shadow-2xl border-l border-[#ede9e4] flex flex-col transition-transform duration-300 ${
          editOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center gap-2 px-5 py-4 border-b border-[#ede9e4]">
          {editMode !== 'choose' && (
            <button onClick={() => setEditMode('choose')}
              className="h-9 w-9 rounded-lg flex items-center justify-center text-[#6b7280] hover:bg-[#f5f4f1] transition shrink-0">
              <ArrowLeft size={18} />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-[#1c1c1e] flex items-center gap-2">
              {editMode === 'content'  && <><Pencil size={16} style={{ color: BRAND }} /> Edit text &amp; photos</>}
              {editMode === 'sections' && <><LayoutList size={16} style={{ color: BRAND }} /> Show / hide sections</>}
              {editMode === 'choose'   && <><Pencil size={16} style={{ color: BRAND }} /> Edit your page</>}
            </h2>
            <p className="text-xs text-[#9ca3af] mt-0.5 truncate">{activeTemplate.name}</p>
          </div>
          <button onClick={() => setEditOpen(false)}
            className="h-9 w-9 rounded-lg flex items-center justify-center text-[#6b7280] hover:bg-[#f5f4f1] transition shrink-0">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {/* ── STEP A: choose what to edit ── */}
          {editMode === 'choose' && (
            <div className="space-y-3">
              <p className="text-sm text-[#6b7280] mb-1">What would you like to edit?</p>

              <button
                onClick={() => setEditMode('content')}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border border-[#e8e4df] bg-white hover:border-[#FF9933] hover:shadow-sm transition text-left"
              >
                <span className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${BRAND}14`, color: BRAND }}>
                  <ImageIcon size={20} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-bold text-[#1c1c1e]">Edit text &amp; photos</span>
                  <span className="block text-xs text-[#9ca3af] mt-0.5">Your name, bio, fees, images</span>
                </span>
                <ChevronRight size={18} className="text-[#c4bdb2] shrink-0" />
              </button>

              <button
                onClick={() => setEditMode('sections')}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border border-[#e8e4df] bg-white hover:border-[#FF9933] hover:shadow-sm transition text-left"
              >
                <span className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${BRAND}14`, color: BRAND }}>
                  <LayoutList size={20} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-bold text-[#1c1c1e]">Show / hide sections</span>
                  <span className="block text-xs text-[#9ca3af] mt-0.5">
                    {orderedSections.filter(s => !hiddenSections.includes(s.id)).length} of {orderedSections.length} sections visible
                  </span>
                </span>
                <ChevronRight size={18} className="text-[#c4bdb2] shrink-0" />
              </button>
            </div>
          )}

          {/* ── STEP B: edit text & photos ── */}
          {editMode === 'content' && (
            !canUseTemplate(activeTemplate, currentPlan) ? (
              <div className="rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50 p-8 text-center">
                <Lock size={26} className="text-amber-300 mx-auto mb-3" />
                <p className="font-semibold text-amber-800">This template is locked</p>
                <p className="text-sm text-amber-600 mt-1 mb-4">Upgrade to Growth to edit this template.</p>
                <button onClick={() => router.push('/pricing?redirect=/dashboard/appearance')}
                  className="px-5 py-2.5 rounded-xl text-white text-sm font-bold transition hover:opacity-90"
                  style={{ background: BRAND }}>
                  View plans & upgrade →
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {contentHasUnsavedChanges && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700">
                    <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                    Unsaved changes — hit Save Changes to make them live
                  </div>
                )}

                {selectedTemplate === 'classic'  && <CT1ContentEditor value={(profileContent as any).classic  ?? {}} onChange={v => patchContent('classic',  v as CT1Content)} />}
                {selectedTemplate === 'classic2' && <CT2ContentEditor value={(profileContent as any).classic2 ?? {}} onChange={v => patchContent('classic2', v as CT2Content)} />}
                {selectedTemplate === 'classic3' && <CT3ContentEditor value={(profileContent as any).classic3 ?? {}} onChange={v => patchContent('classic3', v as CT3Content)} />}
                {selectedTemplate === 'classic4' && <CT4ContentEditor value={(profileContent as any).classic4 ?? {}} onChange={v => patchContent('classic4', v as CT4Content)} />}
                {selectedTemplate === 'classic5' && <CT5ContentEditor value={(profileContent as any).classic5 ?? {}} onChange={v => patchContent('classic5', v as CT5Content)} />}

                <button
                  onClick={handleSaveContent}
                  disabled={savingContent || !contentHasUnsavedChanges}
                  className="w-full flex items-center justify-center gap-2 h-12 mt-2 rounded-xl text-sm font-bold text-white transition disabled:opacity-50"
                  style={{ background: savedContent ? '#16a34a' : BRAND }}
                >
                  {savingContent ? (
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : savedContent ? (
                    <Check size={16} />
                  ) : (
                    <Save size={16} />
                  )}
                  {savedContent ? 'Saved! Changes are live ✓' : contentHasUnsavedChanges ? 'Save Changes' : 'No changes to save'}
                </button>
              </div>
            )
          )}

          {/* ── STEP C: show / hide sections ── */}
          {editMode === 'sections' && (
            <div className="space-y-2">
              <p className="text-xs text-[#9ca3af] -mt-1 mb-2">Drag a row by its handle to reorder, or tap a row to show/hide it.</p>
              {orderedSections.map((section, i) => {
                const enabled = !hiddenSections.includes(section.id)
                const isFirst = i === 0
                const isLast  = i === orderedSections.length - 1
                const isDragging = draggedId === section.id
                const isDragOver  = dragOverId === section.id && draggedId !== null && draggedId !== section.id
                return (
                  <div
                    key={section.id}
                    draggable
                    onDragStart={(e) => {
                      setDraggedId(section.id)
                      e.dataTransfer.effectAllowed = 'move'
                    }}
                    onDragEnd={() => { setDraggedId(null); setDragOverId(null) }}
                    onDragOver={(e) => {
                      e.preventDefault()
                      if (draggedId && draggedId !== section.id) setDragOverId(section.id)
                    }}
                    onDragLeave={() => { if (dragOverId === section.id) setDragOverId(null) }}
                    onDrop={(e) => {
                      e.preventDefault()
                      if (draggedId) reorderByDrag(draggedId, section.id)
                      setDraggedId(null); setDragOverId(null)
                    }}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all"
                    style={{
                      ...(enabled
                        ? { borderColor: `${BRAND}40`, background: `${BRAND}08` }
                        : { borderColor: '#e8e4df', background: 'white' }),
                      opacity: isDragging ? 0.4 : 1,
                      borderColor: isDragOver ? BRAND : undefined,
                      boxShadow: isDragOver ? `0 0 0 2px ${BRAND}30` : undefined,
                      transform: isDragOver ? 'scale(1.01)' : undefined,
                    }}
                  >
                    <span
                      title="Drag to reorder"
                      className="h-6 w-5 flex items-center justify-center text-[#c4bdb2] cursor-grab active:cursor-grabbing shrink-0 -ml-1"
                    >
                      <GripVertical size={14} />
                    </span>

                    <div className="flex flex-col -my-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); moveSection(section.id, -1) }}
                        disabled={isFirst}
                        aria-label={`Move ${section.label} up`}
                        className="h-5 w-5 flex items-center justify-center rounded text-[#9ca3af] hover:text-[#1c1c1e] hover:bg-black/5 disabled:opacity-25 disabled:hover:bg-transparent transition"
                      >
                        <ChevronUp size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); moveSection(section.id, 1) }}
                        disabled={isLast}
                        aria-label={`Move ${section.label} down`}
                        className="h-5 w-5 flex items-center justify-center rounded text-[#9ca3af] hover:text-[#1c1c1e] hover:bg-black/5 disabled:opacity-25 disabled:hover:bg-transparent transition"
                      >
                        <ChevronDown size={13} />
                      </button>
                    </div>

                    <span className="text-xs font-mono text-[#9ca3af] w-5 shrink-0">{String(i + 1).padStart(2, '0')}</span>

                    <button
                      type="button"
                      onClick={() => toggleSection(section.id)}
                      className="flex items-center gap-3 flex-1 min-w-0 text-left"
                    >
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all shrink-0 ${enabled ? 'shadow-sm' : 'bg-[#f0ece8]'}`}
                        style={enabled ? { background: BRAND } : {}}>
                        {enabled && <Check size={12} className="text-white" strokeWidth={3} />}
                      </div>
                      <span className={`text-sm font-medium flex-1 truncate ${enabled ? 'text-[#1c1c1e]' : 'text-[#9ca3af] line-through'}`}>
                        {section.label}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-[#f0ece8] text-[#9ca3af]'}`}>
                        {enabled ? 'Visible' : 'Hidden'}
                      </span>
                    </button>
                  </div>
                )
              })}

              <button
                onClick={handleSaveSections}
                disabled={savingSections || !sectionsHaveUnsavedChanges}
                className="w-full flex items-center justify-center gap-2 h-11 mt-4 rounded-xl text-sm font-bold text-white transition disabled:opacity-50"
                style={{ background: savedSections ? '#16a34a' : BRAND }}
              >
                {savingSections ? (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : savedSections ? (
                  <Check size={16} />
                ) : (
                  <Save size={16} />
                )}
                {savedSections ? 'Saved!' : sectionsHaveUnsavedChanges ? 'Save changes' : 'No changes to save'}
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── Draggable dock ── */}
      <DraggableDock storageKey="appearance-dock-pos" defaultTop={16}>
        <div className="flex items-center gap-1 rounded-2xl bg-white shadow-xl border border-[#ede9e4] p-1.5">
          <span
            data-drag-handle
            title="Drag to move"
            className="h-10 w-7 flex items-center justify-center text-[#c4bdb2] cursor-grab active:cursor-grabbing rounded-lg hover:bg-[#f5f4f1]"
          >
            <GripVertical size={16} />
          </span>

          <button
            onClick={() => setEditOpen(o => { if (!o) setEditMode('choose'); return !o })}
            className="flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold border transition hover:bg-[#fff7ee] hover:border-[#FF9933] hover:text-[#C46800]"
            style={{ background: '#fff', borderColor: '#e8e4df', color: editOpen ? '#6b7280' : '#1c1c1e' }}
          >
            {editOpen ? <X size={15} /> : <Pencil size={15} />}
            {editOpen ? 'Close' : 'Edit'}
          </button>

          <button
            onClick={() => {
              if (isTemplateLocked && previewTemplate !== committedTemplate) {
                setLockedTemplate(previewTemplate)
                return
              }
              setConfirmOpen(true)
            }}
            disabled={saving}
            className={`flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-bold transition disabled:opacity-60 border ${
              saved ? '' : 'hover:bg-[#fff7ee] hover:border-[#FF9933] hover:text-[#C46800]'
            }`}
            style={saved
              ? { background: '#16a34a', borderColor: '#16a34a', color: '#ffffff' }
              : { background: '#fff', borderColor: '#e8e4df', color: '#1c1c1e' }}
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-[#1c1c1e]/30 border-t-[#1c1c1e] rounded-full animate-spin" />
            ) : saved ? (
              <Check size={16} />
            ) : (
              <Save size={16} />
            )}
            {saved ? 'Applied!' : 'Apply'}
          </button>

          <a
            href={`/try?t=${TEMPLATE_TPARAM[previewTemplate]}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-bold transition hover:opacity-90 hover:shadow-md"
            style={{ background: BRAND, borderColor: BRAND, color: '#ffffff' }}
          >
            <Sparkles size={15} /> Try demo
          </a>
        </div>
      </DraggableDock>

      {previewOpen     && <LivePreview profile={previewProfile} onClose={() => setPreviewOpen(false)} />}
      {templatePreview && <TemplatePreviewModal templateId={templatePreview} onClose={() => setTemplatePreview(null)} />}

      {/* ── Locked notice popup ── */}
      {lockedTemplate && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 p-4"
          onClick={() => setLockedTemplate(null)}>
          <div className="w-full max-w-sm bg-white rounded-2xl overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}>
            <div className="px-6 pt-6 pb-4 text-center">
              <div className="mx-auto mb-4 w-14 h-14 rounded-2xl flex items-center justify-center bg-amber-100">
                <Lock size={24} className="text-amber-600" />
              </div>
              <h2 className="text-lg font-semibold text-[#1c1c1e]">
                Can't switch to "{TEMPLATES.find(t => t.id === lockedTemplate)?.name}" yet
              </h2>
              <p className="text-sm text-[#6b7280] mt-2 leading-relaxed">
                Your template choice is final until <strong>{lockDateLabel}</strong>. You can still
                preview this design or open it as a demo, but it can't go live until the lock ends.
              </p>
            </div>
            <div className="px-6 pb-6 flex gap-2">
              <button
                onClick={() => setLockedTemplate(null)}
                className="flex-1 h-11 rounded-xl border border-[#e8e4df] text-sm font-medium text-[#6b7280] hover:bg-[#f5f4f1] transition"
              >
                Got it
              </button>
              <a
                href={`/try?t=${TEMPLATE_TPARAM[lockedTemplate]}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setLockedTemplate(null)}
                className="flex-1 h-11 rounded-xl text-sm font-bold text-white transition hover:opacity-90 flex items-center justify-center gap-2"
                style={{ background: BRAND }}
              >
                <Sparkles size={15} /> Try demo
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── Apply confirmation ── */}
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
              <h2 className="text-lg font-semibold text-[#1c1c1e]">Apply "{TEMPLATES.find(t => t.id === previewTemplate)?.name}"?</h2>
              <p className="text-sm text-[#6b7280] mt-2 leading-relaxed">
                {isStarter
                  ? <>This becomes your live template and will show on your public page. You <strong>cannot change it for 12 months</strong>. You can still preview other templates, but applying a different one won't be allowed until the lock ends.</>
                  : <>This will be applied to your live public profile.</>}
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

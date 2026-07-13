'use client'

/**
 * UnifiedContentEditor
 * ─────────────────────────────────────────────────────────────────────────────
 * The single place where a therapist edits everything about their public page.
 * Replaces the previous split between:
 *   - /dashboard/settings  → name, photo, bio, credentials, fee, specialties
 *   - /dashboard/appearance → Edit drawer → CT1ContentEditor → services/carousel
 *
 * Three tabs shown in the drawer header:
 *   [Profile]  [Website Content]  [Sections]
 *
 * Profile tab writes to `therapists` table columns directly (same as settings page).
 * Website Content tab writes to `profile_content` (same as CT1ContentEditor).
 * Sections tab is the existing show/hide + reorder UI, just moved in here.
 *
 * Each tab has its own Save button so users only save what they changed.
 * A small "unsaved dot" on each tab header signals pending changes without
 * blocking the user from switching tabs.
 */

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase'
import {
  Camera, Check, ChevronDown, ChevronUp, GripVertical,
  Plus, Save, Trash2, User,
} from 'lucide-react'
import type { CT1Content, CT1CarouselSlide, CT6ExpertiseItem } from '@/components/booking/templates/templateUtils'
import { DEFAULT_CT1_CONTENT, DEFAULT_CT6_CONTENT } from '@/components/booking/templates/templateUtils'
import type { TherapistProfile } from '@/lib/template'
import Cropper, { type Area } from 'react-easy-crop'

const BRAND = '#ff9933'
const SPECIALTIES = [
  'Anxiety', 'Depression', 'Trauma & PTSD', 'Relationship Issues',
  'Grief & Loss', 'OCD', 'Stress Management', 'Self-Esteem',
  'Burnout', 'Panic Disorders', 'Family Conflict', 'Life Transitions',
  'Anger Management', 'Sleep Issues', 'ADHD', 'Eating Disorders',
]
const LANGUAGES = [
  'English', 'Hindi', 'Marathi', 'Tamil', 'Telugu',
  'Kannada', 'Bengali', 'Gujarati', 'Punjabi', 'Malayalam',
]

type Tab = 'profile' | 'content' | 'sections'

interface Section { id: string; label: string }

interface Props {
  profile: TherapistProfile | null
  profileContent: Record<string, unknown>
  selectedTemplate: string
  orderedSections: Section[]
  hiddenSections: string[]
  onProfileSaved: (updated: Partial<TherapistProfile>) => void
  onContentChange: (key: string, val: unknown) => void
  onContentSaved: () => void
  onToggleSection: (id: string) => void
  onMoveSection: (id: string, dir: -1 | 1) => void
  onSaveSections: () => void
  savingContent: boolean
  savedContent: boolean
  contentHasUnsavedChanges: boolean
  savingSections: boolean
  savedSections: boolean
  sectionsHaveUnsavedChanges: boolean
}

async function getCroppedFile(src: string, area: Area): Promise<File> {
  const image = await new Promise<HTMLImageElement>((res, rej) => {
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => res(img)
    img.onerror = rej
    img.src = src
  })
  const canvas = document.createElement('canvas')
  canvas.width = area.width; canvas.height = area.height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, area.width, area.height)
  const blob = await new Promise<Blob>(res => canvas.toBlob(b => res(b!), 'image/jpeg', 0.92))
  return new File([blob], 'profile.jpg', { type: 'image/jpeg' })
}

export default function UnifiedContentEditor({
  profile, profileContent, selectedTemplate,
  orderedSections, hiddenSections,
  onProfileSaved,
  onContentChange, onContentSaved,
  onToggleSection, onMoveSection, onSaveSections,
  savingContent, savedContent, contentHasUnsavedChanges,
  savingSections, savedSections, sectionsHaveUnsavedChanges,
}: Props) {
  const supabase = createClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [tab, setTab] = useState<Tab>('profile')

  // ── Profile form state ─────────────────────────────────────────────────────
  const [form, setForm] = useState({
    full_name: '', title: '', bio: '',
    fee_per_session: '', session_duration_mins: '50',
    specialties: [] as string[], languages: ['English'] as string[],
    instagram: '', linkedin: '', whatsapp: '',
  })
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savedProfile, setSavedProfile] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileDirty, setProfileDirty] = useState(false)
  const [customSpecialty, setCustomSpecialty] = useState('')

  // Pre-fill from profile prop
  useEffect(() => {
    if (!profile) return
    setForm({
      full_name: (profile as any).full_name ?? '',
      title: (profile as any).title ?? '',
      bio: (profile as any).bio ?? '',
      fee_per_session: String((profile as any).fee_per_session ?? ''),
      session_duration_mins: String((profile as any).session_duration_mins ?? 50),
      specialties: (profile as any).specialties ?? [],
      languages: (profile as any).languages ?? ['English'],
      instagram: (profile as any).instagram ?? '',
      linkedin: (profile as any).linkedin ?? '',
      whatsapp: (profile as any).whatsapp ?? '',
    })
    setPhotoPreview((profile as any).photo_url ?? null)
    setProfileDirty(false)
  }, [profile?.id])

  function setField<K extends keyof typeof form>(k: K, v: typeof form[K]) {
    setForm(prev => ({ ...prev, [k]: v }))
    setProfileDirty(true)
  }

  function toggleSpecialty(s: string) {
    setField('specialties', form.specialties.includes(s)
      ? form.specialties.filter(x => x !== s)
      : [...form.specialties, s])
  }

  function toggleLanguage(l: string) {
    setField('languages', form.languages.includes(l)
      ? form.languages.filter(x => x !== l)
      : [...form.languages, l])
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setCropSrc(URL.createObjectURL(file))
    setCrop({ x: 0, y: 0 }); setZoom(1)
    e.target.value = ''
  }

  async function applyCrop() {
    if (!cropSrc || !croppedAreaPixels) return
    const file = await getCroppedFile(cropSrc, croppedAreaPixels)
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
    setCropSrc(null)
    setProfileDirty(true)
  }

  async function saveProfile() {
    if (!profile?.id) return
    setSavingProfile(true); setProfileError('')
    try {
      let photo_url = (profile as any).photo_url
      if (photoFile) {
        const path = `${profile.id}/profile-${Date.now()}.jpg`
        const { error: upErr } = await supabase.storage.from('avatars').upload(path, photoFile, { upsert: true })
        if (upErr) throw upErr
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
        photo_url = urlData.publicUrl
      }
      const payload = {
        full_name: form.full_name,
        title: form.title,
        bio: form.bio,
        fee_per_session: Number(form.fee_per_session) || null,
        session_duration_mins: Number(form.session_duration_mins) || 50,
        specialties: form.specialties,
        languages: form.languages,
        instagram: form.instagram || null,
        linkedin: form.linkedin || null,
        whatsapp: form.whatsapp || null,
        photo_url,
        is_profile_complete: true,
      }
      const { error } = await supabase.from('therapists').update(payload).eq('id', profile.id)
      if (error) throw error
      onProfileSaved(payload as Partial<TherapistProfile>)
      setProfileDirty(false)
      setSavedProfile(true)
      setTimeout(() => setSavedProfile(false), 2500)
    } catch (e: any) {
      setProfileError(e.message ?? 'Failed to save. Try again.')
    } finally {
      setSavingProfile(false)
    }
  }

  // ── Template content (CT1) ─────────────────────────────────────────────────
  const ct1Raw = (profileContent as any)?.classic ?? {}
  const ct1: CT1Content = {
    services: Array.isArray(ct1Raw.services) ? ct1Raw.services : DEFAULT_CT1_CONTENT.services,
    carousel: Array.isArray(ct1Raw.carousel) ? ct1Raw.carousel : DEFAULT_CT1_CONTENT.carousel,
  }
  function patchCT1(updates: Partial<CT1Content>) {
    onContentChange('classic', { ...ct1Raw, ...updates })
  }

  // ── Section drag state ─────────────────────────────────────────────────────
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  const tabs: { key: Tab; label: string; dirty: boolean }[] = [
    { key: 'profile', label: 'Profile', dirty: profileDirty },
    { key: 'content', label: 'Website Content', dirty: contentHasUnsavedChanges },
    { key: 'sections', label: 'Sections', dirty: sectionsHaveUnsavedChanges },
  ]

  return (
    <div className="flex flex-col h-full">

      {/* ── Tab bar ────────────────────────────────────────────────────────── */}
      <div className="flex border-b border-[#ede9e4] px-4 pt-2 gap-1 shrink-0">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="relative flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-xs font-semibold transition"
            style={tab === t.key
              ? { color: BRAND, borderBottom: `2px solid ${BRAND}`, marginBottom: -1 }
              : { color: '#6b7280' }}
          >
            {t.label}
            {t.dirty && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
            )}
          </button>
        ))}
      </div>

      {/* ── Tab content ────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">

        {/* ════════ PROFILE TAB ════════ */}
        {tab === 'profile' && (
          <div className="p-4 space-y-5">

            {/* Photo */}
            <div className="flex items-center gap-4 p-4 bg-[#f9f7f5] rounded-xl border border-[#ede9e4]">
              <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#F5D9B0] bg-[#FFEFD9] flex items-center justify-center">
                  {photoPreview
                    ? <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                    : <User size={24} style={{ color: BRAND }} />}
                </div>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-white transition hover:opacity-90"
                  style={{ background: BRAND }}
                >
                  <Camera size={11} />
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1c1c1e]">Profile photo</p>
                <p className="text-xs text-[#6b7280] mt-0.5">Shown on your public page</p>
                <button onClick={() => fileRef.current?.click()} className="text-xs font-medium mt-1 hover:underline" style={{ color: BRAND }}>
                  Change photo
                </button>
              </div>
            </div>

            <Field label="Full name">
              <input value={form.full_name} onChange={e => setField('full_name', e.target.value)}
                placeholder="Dr. Arjun Sharma" className={inp} />
            </Field>

            <Field label="Professional title" hint="Shown below your name — e.g. Clinical Psychologist · RCI Licensed">
              <input value={form.title} onChange={e => setField('title', e.target.value)}
                placeholder="Clinical Psychologist · RCI Licensed" className={inp} />
            </Field>

            <Field label="Bio">
              <textarea rows={4} value={form.bio} onChange={e => setField('bio', e.target.value)}
                placeholder="Tell clients about your approach and experience…" className={ta} />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Session fee (₹)">
                <input type="number" value={form.fee_per_session} onChange={e => setField('fee_per_session', e.target.value)}
                  placeholder="1500" className={inp} />
              </Field>
              <Field label="Duration">
                <select value={form.session_duration_mins} onChange={e => setField('session_duration_mins', e.target.value)} className={inp}>
                  {[30, 45, 50, 60, 90].map(d => <option key={d} value={d}>{d} min</option>)}
                </select>
              </Field>
            </div>

            {/* Specialties */}
            <div>
              <label className="block text-xs font-semibold text-[#6b7280] mb-2 uppercase tracking-wider">
                Specialties <span style={{ color: BRAND }}>({form.specialties.length})</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {SPECIALTIES.map(s => (
                  <button key={s} type="button" onClick={() => toggleSpecialty(s)}
                    className="px-2.5 py-1 rounded-full text-xs font-medium border transition"
                    style={form.specialties.includes(s)
                      ? { background: BRAND, color: '#fff', borderColor: BRAND }
                      : { background: '#fff', color: '#6b7280', borderColor: '#e8e4df' }}>
                    {s}
                  </button>
                ))}
                {form.specialties.filter(s => !SPECIALTIES.includes(s)).map(s => (
                  <button key={s} type="button" onClick={() => toggleSpecialty(s)}
                    className="px-2.5 py-1 rounded-full text-xs font-medium border inline-flex items-center gap-1"
                    style={{ background: BRAND, color: '#fff', borderColor: BRAND }}>
                    {s} <span className="opacity-70">×</span>
                  </button>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <input value={customSpecialty} onChange={e => setCustomSpecialty(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (customSpecialty.trim()) { toggleSpecialty(customSpecialty.trim()); setCustomSpecialty('') } } }}
                  placeholder="Add custom…" className={`${inp} flex-1`} />
                <button type="button" onClick={() => { if (customSpecialty.trim()) { toggleSpecialty(customSpecialty.trim()); setCustomSpecialty('') } }}
                  disabled={!customSpecialty.trim()}
                  className="px-3 h-9 rounded-lg text-xs font-medium text-white disabled:opacity-50 transition"
                  style={{ background: BRAND }}>Add</button>
              </div>
            </div>

            {/* Languages */}
            <div>
              <label className="block text-xs font-semibold text-[#6b7280] mb-2 uppercase tracking-wider">Languages</label>
              <div className="flex flex-wrap gap-1.5">
                {LANGUAGES.map(l => (
                  <button key={l} type="button" onClick={() => toggleLanguage(l)}
                    className="px-2.5 py-1 rounded-full text-xs font-medium border transition"
                    style={form.languages.includes(l)
                      ? { background: BRAND, color: '#fff', borderColor: BRAND }
                      : { background: '#fff', color: '#6b7280', borderColor: '#e8e4df' }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Social links */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Social & Contact</label>
              {[
                { key: 'instagram', placeholder: 'instagram.com/yourhandle' },
                { key: 'linkedin',  placeholder: 'linkedin.com/in/yourprofile' },
                { key: 'whatsapp', placeholder: '+91 98765 43210' },
              ].map(({ key, placeholder }) => (
                <input key={key} value={(form as any)[key]}
                  onChange={e => setField(key as any, e.target.value)}
                  placeholder={placeholder} className={inp} />
              ))}
            </div>

            {profileError && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{profileError}</p>}

            <button
              onClick={saveProfile}
              disabled={savingProfile || !profileDirty}
              className="w-full flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-bold text-white transition disabled:opacity-50"
              style={{ background: savedProfile ? '#16a34a' : BRAND }}
            >
              {savingProfile ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : savedProfile ? <Check size={15} />
                : <Save size={15} />}
              {savedProfile ? 'Profile saved ✓' : profileDirty ? 'Save profile' : 'No changes'}
            </button>

          </div>
        )}

        {/* ════════ WEBSITE CONTENT TAB ════════ */}
        {tab === 'content' && (
          <div className="p-4 space-y-3">

            <p className="text-xs text-[#9ca3af] -mt-1 mb-1">
              {selectedTemplate === 'classic6'
                ? 'Edit the expertise cards shown on your Quiet Room website — label and supporting line for each area you work in.'
                : 'Edit what appears in each section of your website — services you offer, client testimonials, process steps.'}
            </p>

            {/* ── Quiet Room (classic6) — Expertise cards ── */}
            {selectedTemplate === 'classic6' && (() => {
              const rawC6 = (profileContent as any)?.classic6 ?? {}
              const expertiseItems: CT6ExpertiseItem[] = Array.isArray(rawC6.expertise)
                ? rawC6.expertise
                : DEFAULT_CT6_CONTENT.expertise

              function patchExpertise(updated: CT6ExpertiseItem[]) {
                onContentChange('classic6', { ...rawC6, expertise: updated })
              }

              return (
                <Accordion label="Expertise Cards — What You Work On" defaultOpen>
                  <div className="space-y-3">
                    {expertiseItems.map((item, i) => (
                      <div key={i} className="rounded-lg border border-[#e8e4df] p-3 space-y-2 bg-white">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af]">Card {String(i + 1).padStart(2, '0')}</span>
                          <button
                            onClick={() => patchExpertise(expertiseItems.filter((_, j) => j !== i))}
                            className="text-[#d1d5db] hover:text-red-400 transition"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                        <Field label="Label / area name">
                          <input
                            value={item.label}
                            onChange={e => patchExpertise(expertiseItems.map((x, j) => j === i ? { ...x, label: e.target.value } : x))}
                            placeholder="e.g. Anxiety & Stress"
                            className={inp}
                          />
                        </Field>
                        <Field label="Supporting line" hint="A short, human sentence — not clinical.">
                          <input
                            value={item.blurb}
                            onChange={e => patchExpertise(expertiseItems.map((x, j) => j === i ? { ...x, blurb: e.target.value } : x))}
                            placeholder="e.g. For the worry that never quite switches off."
                            className={inp}
                          />
                        </Field>
                      </div>
                    ))}
                    {expertiseItems.length < 8 && (
                      <button
                        onClick={() => patchExpertise([...expertiseItems, { label: '', blurb: '' }])}
                        className={addBtn}
                      >
                        <Plus size={13} /> Add expertise card
                      </button>
                    )}
                  </div>
                </Accordion>
              )
            })()}

            {/* Services — not shown for Quiet Room which uses Expertise instead */}
            {selectedTemplate !== 'classic6' && (
            <Accordion label="Services — What You Offer" defaultOpen>
              <div className="space-y-4">
                {ct1.services.map((svc, i) => (
                  <div key={i} className="rounded-lg border border-[#e8e4df] p-3 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af]">Service {String(i + 1).padStart(2, '0')}</span>
                      <button onClick={() => patchCT1({ services: ct1.services.filter((_, j) => j !== i) })} className="text-[#d1d5db] hover:text-red-400 transition">
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Left: name + price + kind + tags */}
                      <div className="space-y-2">
                        <Field label="Service name">
                          <input value={svc.name} onChange={e => patchCT1({ services: ct1.services.map((s, j) => j === i ? { ...s, name: e.target.value } : s) })} placeholder="e.g. Individual Psychotherapy" className={inp} />
                        </Field>
                        <Field label="Price">
                          <input value={svc.price ?? ''} onChange={e => patchCT1({ services: ct1.services.map((s, j) => j === i ? { ...s, price: e.target.value } : s) })} placeholder="e.g. 1500 or Varies" className={inp} />
                        </Field>
                        <Field label="Kind / subtitle">
                          <input value={svc.kind ?? ''} onChange={e => patchCT1({ services: ct1.services.map((s, j) => j === i ? { ...s, kind: e.target.value } : s) })} placeholder="e.g. One-to-one · weekly" className={inp} />
                        </Field>
                        <Field label="Tags">
                          <input value={(svc.forWhom ?? []).join(', ')} onChange={e => patchCT1({ services: ct1.services.map((s, j) => j === i ? { ...s, forWhom: e.target.value.split(',').map(t => t.trim()).filter(Boolean) } : s) })} placeholder="e.g. Anxiety, Burnout" className={inp} />
                        </Field>
                      </div>
                      {/* Right: description */}
                      <div>
                        <Field label="Description">
                          <textarea rows={7} value={svc.desc} onChange={e => patchCT1({ services: ct1.services.map((s, j) => j === i ? { ...s, desc: e.target.value } : s) })} placeholder="Short description…" className={ta} style={{ height: '100%', minHeight: '148px' }} />
                        </Field>
                      </div>
                    </div>
                  </div>
                ))}
                {ct1.services.length < 8 && (
                  <button onClick={() => patchCT1({ services: [...ct1.services, { name: '', kind: '', desc: '', forWhom: [] }] })} className={addBtn}>
                    <Plus size={13} /> Add service
                  </button>
                )}
              </div>
            </Accordion>

            {/* Carousel slides */}
            <Accordion label="Carousel Slides — Quotes, Stats, Testimonials">
              <div className="space-y-4">
                {ct1.carousel.map((slide, i) => (
                  <div key={i} className="rounded-lg border border-[#e8e4df] p-3 space-y-2 bg-white">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af]">Slide {i + 1}</span>
                      <button onClick={() => patchCT1({ carousel: ct1.carousel.filter((_, j) => j !== i) })} className="text-[#d1d5db] hover:text-red-400 transition">
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <Field label="Tag">
                      <input value={slide.tag} onChange={e => patchCT1({ carousel: ct1.carousel.map((s, j) => j === i ? { ...s, tag: e.target.value } : s) })} placeholder="e.g. Guiding Philosophy" className={inp} />
                    </Field>
                    <Field label="Type">
                      <select value={slide.type} onChange={e => patchCT1({ carousel: ct1.carousel.map((s, j) => j === i ? { ...s, type: e.target.value as CT1CarouselSlide['type'] } : s) })} className={inp}>
                        <option value="quote">Quote</option>
                        <option value="stats">Stats</option>
                        <option value="process">Process</option>
                        <option value="testimonial">Testimonial</option>
                      </select>
                    </Field>
                    {slide.type === 'quote' && (
                      <>
                        <Field label="Quote"><textarea rows={2} value={slide.text ?? ''} onChange={e => patchCT1({ carousel: ct1.carousel.map((s, j) => j === i ? { ...s, text: e.target.value } : s) })} placeholder='"The curious paradox…"' className={ta} /></Field>
                        <Field label="Author"><input value={slide.author ?? ''} onChange={e => patchCT1({ carousel: ct1.carousel.map((s, j) => j === i ? { ...s, author: e.target.value } : s) })} placeholder="— Carl Rogers" className={inp} /></Field>
                      </>
                    )}
                    {slide.type === 'testimonial' && (
                      <>
                        <Field label="Quote"><textarea rows={2} value={slide.quote ?? ''} onChange={e => patchCT1({ carousel: ct1.carousel.map((s, j) => j === i ? { ...s, quote: e.target.value } : s) })} placeholder='"I came in feeling lost…"' className={ta} /></Field>
                        <Field label="Client name"><input value={slide.name ?? ''} onChange={e => patchCT1({ carousel: ct1.carousel.map((s, j) => j === i ? { ...s, name: e.target.value } : s) })} placeholder="Karan M." className={inp} /></Field>
                        <Field label="Role / label"><input value={slide.role ?? ''} onChange={e => patchCT1({ carousel: ct1.carousel.map((s, j) => j === i ? { ...s, role: e.target.value } : s) })} placeholder="Client — 2024" className={inp} /></Field>
                      </>
                    )}
                  </div>
                ))}
                {ct1.carousel.length < 8 && (
                  <button onClick={() => patchCT1({ carousel: [...ct1.carousel, { type: 'quote', tag: 'New Slide' }] })} className={addBtn}>
                    <Plus size={13} /> Add slide
                  </button>
                )}
              </div>
            </Accordion>

            {contentHasUnsavedChanges && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700">
                <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                Unsaved changes — save to make them live
              </div>
            )}

            <button
              onClick={onContentSaved}
              disabled={savingContent || !contentHasUnsavedChanges}
              className="w-full flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-bold text-white transition disabled:opacity-50"
              style={{ background: savedContent ? '#16a34a' : BRAND }}
            >
              {savingContent ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : savedContent ? <Check size={15} />
                : <Save size={15} />}
              {savedContent ? 'Saved ✓' : contentHasUnsavedChanges ? 'Save content' : 'No changes'}
            </button>
          </div>
        )}

        {/* ════════ SECTIONS TAB ════════ */}
        {tab === 'sections' && (
          <div className="p-4 space-y-2">
            <p className="text-xs text-[#9ca3af] mb-3">Drag to reorder, tap to show/hide.</p>
            {orderedSections.map((section, i) => {
              const enabled = !hiddenSections.includes(section.id)
              const isFirst = i === 0
              const isLast = i === orderedSections.length - 1
              const isDragging = draggedId === section.id
              const isDragOver = dragOverId === section.id && draggedId !== null && draggedId !== section.id
              return (
                <div
                  key={section.id}
                  draggable
                  onDragStart={e => { setDraggedId(section.id); e.dataTransfer.effectAllowed = 'move' }}
                  onDragEnd={() => { setDraggedId(null); setDragOverId(null) }}
                  onDragOver={e => { e.preventDefault(); if (draggedId && draggedId !== section.id) setDragOverId(section.id) }}
                  onDragLeave={() => { if (dragOverId === section.id) setDragOverId(null) }}
                  onDrop={e => { e.preventDefault(); setDraggedId(null); setDragOverId(null) }}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all"
                  style={{
                    ...(enabled ? { borderColor: `${BRAND}40`, background: `${BRAND}08` } : { borderColor: '#e8e4df', background: 'white' }),
                    opacity: isDragging ? 0.4 : 1,
                    ...(isDragOver ? { borderColor: BRAND, boxShadow: `0 0 0 2px ${BRAND}30`, transform: 'scale(1.01)' } : {}),
                  }}
                >
                  <span className="h-6 w-5 flex items-center justify-center text-[#c4bdb2] cursor-grab shrink-0 -ml-1">
                    <GripVertical size={14} />
                  </span>
                  <div className="flex flex-col -my-1 shrink-0">
                    <button type="button" onClick={() => onMoveSection(section.id, -1)} disabled={isFirst}
                      className="h-5 w-5 flex items-center justify-center rounded text-[#9ca3af] hover:text-[#1c1c1e] disabled:opacity-25 transition">
                      <ChevronUp size={13} />
                    </button>
                    <button type="button" onClick={() => onMoveSection(section.id, 1)} disabled={isLast}
                      className="h-5 w-5 flex items-center justify-center rounded text-[#9ca3af] hover:text-[#1c1c1e] disabled:opacity-25 transition">
                      <ChevronDown size={13} />
                    </button>
                  </div>
                  <button type="button" onClick={() => onToggleSection(section.id)}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left">
                    <div className="w-5 h-5 rounded-md flex items-center justify-center transition-all shrink-0"
                      style={enabled ? { background: BRAND } : { background: '#f0ece8' }}>
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
              onClick={onSaveSections}
              disabled={savingSections || !sectionsHaveUnsavedChanges}
              className="w-full flex items-center justify-center gap-2 h-11 mt-2 rounded-xl text-sm font-bold text-white transition disabled:opacity-50"
              style={{ background: savedSections ? '#16a34a' : BRAND }}
            >
              {savingSections ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : savedSections ? <Check size={15} />
                : <Save size={15} />}
              {savedSections ? 'Saved!' : sectionsHaveUnsavedChanges ? 'Save sections' : 'No changes'}
            </button>
          </div>
        )}
      </div>

      {/* ── Crop modal ─────────────────────────────────────────────────────── */}
      {cropSrc && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl overflow-hidden shadow-2xl">
            <div className="relative w-full h-64 overflow-hidden bg-[#1c1c1e]">
              <Cropper image={cropSrc} crop={crop} zoom={zoom} aspect={1} cropShape="round" showGrid={false}
                onCropChange={setCrop} onZoomChange={setZoom}
                onCropComplete={(_, area) => setCroppedAreaPixels(area)}
                style={{ cropAreaStyle: { boxShadow: '0 0 0 9999px rgba(28,28,30,0.9)' } }} />
            </div>
            <div className="px-5 py-4 flex justify-end gap-2">
              <button onClick={() => setCropSrc(null)}
                className="px-4 h-10 rounded-lg text-sm font-medium border border-[#e8e4df] text-[#6b7280] hover:bg-[#f5f4f1] transition">
                Cancel
              </button>
              <button onClick={applyCrop}
                className="px-4 h-10 rounded-lg text-sm font-medium text-white transition"
                style={{ background: BRAND }}>
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Shared field primitives ────────────────────────────────────────────────────

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#6b7280] mb-1.5 uppercase tracking-wider">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-[#9ca3af] mt-1">{hint}</p>}
    </div>
  )
}

function Accordion({ label, children, defaultOpen }: { label: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen ?? false)
  return (
    <div className="rounded-xl border border-[#e8e4df] overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-[#f9f7f5] hover:bg-[#f2f0ed] transition text-left">
        <span className="text-sm font-semibold text-[#1c1c1e]">{label}</span>
        {open ? <ChevronUp size={16} className="text-[#6b7280]" /> : <ChevronDown size={16} className="text-[#6b7280]" />}
      </button>
      {open && <div className="px-4 py-4 bg-[#fdfcfb] border-t border-[#e8e4df]">{children}</div>}
    </div>
  )
}

const inp = `w-full px-3 py-2 rounded-lg border border-[#e8e4df] text-sm text-[#1c1c1e]
  placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#ff993340]
  focus:border-transparent bg-white transition h-9`

const ta = `w-full px-3 py-2 rounded-lg border border-[#e8e4df] text-sm text-[#1c1c1e]
  placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#ff993340]
  focus:border-transparent bg-white transition resize-none`

const addBtn = `flex items-center gap-1.5 text-xs font-medium text-[#5a7f7a]
  hover:text-[#3d5c58] border border-dashed border-[#b8ceca] rounded-lg
  px-3 py-2 w-full justify-center hover:bg-[#f0f8f7] transition`

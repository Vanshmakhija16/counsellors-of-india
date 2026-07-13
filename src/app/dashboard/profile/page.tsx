'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase'
import { State, City } from 'country-state-city'
import Cropper, { type Area } from 'react-easy-crop'
import {
  TEMPLATES, canUseTemplate, getOrderedSections,
  type TemplateId, type ColorId,
} from '@/lib/template'
import AvailabilitySettings from '@/components/dashboard/AvailabilitySettings'
import FeedbackManager from '@/components/dashboard/FeedbackManager'
import TemplateLiveSwitcher from '@/components/appearance/TemplateLiveSwitcher'
import { addNormalizedUnique } from '@/lib/specialties'
import type { ProfileContent, CT1Content, CT2Content, CT3Content, CT4Content, CT5Content, CT6Content } from '@/components/booking/templates/templateUtils'
import {
  User, Briefcase, Camera, CheckCircle, Clock, ExternalLink, Globe2,
  IndianRupee, Languages, Link as LinkIcon, MapPin, Phone, Save, ShieldCheck,
  Sparkles, Lock, Check, AlertCircle, GripVertical, ChevronUp, ChevronDown,
  CalendarClock, Palette, ListChecks, Video,
} from 'lucide-react'

const CT1ContentEditor = dynamic(() => import('@/components/appearance/CT1ContentEditor'), { ssr: false })
const CT2ContentEditor = dynamic(() => import('@/components/appearance/CT2ContentEditor'), { ssr: false })
const CT3ContentEditor = dynamic(() => import('@/components/appearance/CT3ContentEditor'), { ssr: false })
const CT4ContentEditor = dynamic(() => import('@/components/appearance/CT4ContentEditor'), { ssr: false })
const CT5ContentEditor = dynamic(() => import('@/components/appearance/CT5ContentEditor'), { ssr: false })
const CT6ContentEditor = dynamic(() => import('@/components/appearance/CT6ContentEditor'), { ssr: false })

const BRAND = '#ff9933'
const INK = '#171412'
const STARTER_TEMPLATE_LOCK_DAYS = 365

const TEMPLATE_TPARAM: Record<TemplateId, string> = {
  classic: 't1', classic2: 't2', classic3: 't3', classic4: 't4', classic5: 't5', classic6: 't6',
}

async function getCroppedFile(src: string, area: Area): Promise<File> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
  const canvas = document.createElement('canvas')
  canvas.width = area.width
  canvas.height = area.height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, area.width, area.height)
  const blob = await new Promise<Blob>((resolve) => canvas.toBlob(b => resolve(b!), 'image/jpeg', 0.92))
  return new File([blob], 'profile.jpg', { type: 'image/jpeg' })
}

const SPECIALTIES_LIST = [
  'Anxiety', 'Depression', 'Trauma & PTSD', 'Relationship Issues',
  'Grief & Loss', 'OCD', 'Stress Management', 'Self-Esteem',
  'Burnout', 'Panic Disorders', 'Family Conflict', 'Life Transitions',
  'Anger Management', 'Sleep Issues', 'ADHD', 'Eating Disorders',
]

const IN_STATES = State.getStatesOfCountry('IN')
const STATES_LIST = IN_STATES.map(s => s.name).sort()

function citiesOfState(stateName: string): string[] {
  const st = IN_STATES.find(s => s.name === stateName)
  if (!st) return []
  const names = City.getCitiesOfState('IN', st.isoCode).map(c => c.name)
  return Array.from(new Set(names)).sort()
}

const LANGUAGES_LIST = [
  'English', 'Hindi', 'Marathi', 'Tamil', 'Telugu',
  'Kannada', 'Bengali', 'Gujarati', 'Punjabi', 'Malayalam'
]

const COUNTRY_CODES: { code: string; dial: string; flag: string; len: number }[] = [
  { code: 'IN', dial: '+91',  flag: '🇮🇳', len: 10 },
  { code: 'US', dial: '+1',   flag: '🇺🇸', len: 10 },
  { code: 'GB', dial: '+44',  flag: '🇬🇧', len: 10 },
  { code: 'AE', dial: '+971', flag: '🇦🇪', len: 9  },
  { code: 'AU', dial: '+61',  flag: '🇦🇺', len: 9  },
  { code: 'CA', dial: '+1',   flag: '🇨🇦', len: 10 },
  { code: 'SG', dial: '+65',  flag: '🇸🇬', len: 8  },
  { code: 'NP', dial: '+977', flag: '🇳🇵', len: 10 },
  { code: 'NZ', dial: '+64',  flag: '🇳🇿', len: 9  },
  { code: 'DE', dial: '+49',  flag: '🇩🇪', len: 11 },
]

function splitPhone(stored: string): { dial: string; number: string } {
  const s = (stored ?? '').trim()
  const match = [...COUNTRY_CODES].sort((a, b) => b.dial.length - a.dial.length)
    .find(c => s.startsWith(c.dial))
  if (match) return { dial: match.dial, number: s.slice(match.dial.length).replace(/\D/g, '') }
  return { dial: '+91', number: s.replace(/\D/g, '') }
}

function formatLockDate(iso: string | null) {
  if (!iso) return ''
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso))
}

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

const TABS = [
  { id: 'basic',        label: 'Basic Info',        icon: User },
  { id: 'services',     label: 'Section Content', icon: Briefcase },
  { id: 'availability', label: 'Availability',       icon: CalendarClock },
  { id: 'template',     label: 'Template & Design',  icon: Palette },
  { id: 'sections',     label: 'Page Layout',        icon: ListChecks },
] as const
type TabId = typeof TABS[number]['id']

export default function ProfilePage() {
  const supabase = createClient()
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [tab, setTab] = useState<TabId>('basic')
  const [userId, setUserId] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPlan, setCurrentPlan] = useState('free')

  const [form, setForm] = useState({
    full_name: '', title: '', bio: '', city: '', phone: '',
    fee_per_session: '', session_duration_mins: '50', years_experience: '',
    session_mode: 'both', specialties: [] as string[], languages: ['English'] as string[],
    instagram: '', linkedin: '', whatsapp: '', website: '', meet_link: '',
  })
  const [stateName, setStateName] = useState('')
  const [cityName, setCityName] = useState('')
  const [customSpecialty, setCustomSpecialty] = useState('')
  const [customLanguage, setCustomLanguage] = useState('')
  const [dialCode, setDialCode] = useState('+91')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [savingBasic, setSavingBasic] = useState(false)
  const [savedBasic, setSavedBasic] = useState(false)
  const [basicError, setBasicError] = useState('')

  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('classic')
  const [committedTemplate, setCommittedTemplate] = useState<TemplateId>('classic')
  const [selectedColor, setSelectedColor] = useState<ColorId>('teal')
  const [hiddenSections, setHiddenSections] = useState<string[]>([])
  const [savedHiddenSections, setSavedHiddenSections] = useState<string[]>([])
  const [sectionOrder, setSectionOrder] = useState<string[]>([])
  const [savedSectionOrder, setSavedSectionOrder] = useState<string[]>([])
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [profileContent, setProfileContent] = useState<ProfileContent>({})
  const [savedProfileContent, setSavedProfileContent] = useState<ProfileContent>({})
  const [templateLockedUntil, setTemplateLockedUntil] = useState<string | null>(null)
  const [lockedTemplate, setLockedTemplate] = useState<TemplateId | null>(null)
  const [pendingTemplate, setPendingTemplate] = useState<TemplateId | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const [savingTemplate, setSavingTemplate] = useState(false)
  const [savedTemplate, setSavedTemplate] = useState(false)
  const [savingContent, setSavingContent] = useState(false)
  const [savedContent, setSavedContent] = useState(false)
  const [savingSections, setSavingSections] = useState(false)
  const [savedSections, setSavedSections] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      setUserId(user.id)
      const { data } = await supabase.from('therapists').select('*').eq('id', user.id).single()
      if (data) {
        setUsername(data.username ?? null)
        setCurrentPlan(data.plan ?? 'free')
        setForm({
          full_name: data.full_name ?? '', title: data.title ?? '', bio: data.bio ?? '',
          city: data.city ?? '', phone: data.phone ?? '',
          fee_per_session: String(data.fee_per_session ?? ''),
          session_duration_mins: String(data.session_duration_mins ?? 50),
          years_experience: String(data.years_experience ?? ''),
          session_mode: data.session_mode ?? 'both',
          specialties: data.specialties ?? [], languages: data.languages ?? ['English'],
          instagram: data.instagram ?? '', linkedin: data.linkedin ?? '',
          whatsapp: data.whatsapp ?? '', website: data.website ?? '', meet_link: data.meet_link ?? '',
        })
        setPhotoPreview(data.photo_url ?? null)
        const { dial, number } = splitPhone(data.phone ?? '')
        setDialCode(dial); setPhoneNumber(number)
        const stored = (data.city ?? '').trim()
        if (stored) {
          const [c, s] = stored.split(',').map((p: string) => p.trim())
          setStateName(s && STATES_LIST.includes(s) ? s : '')
          setCityName(c ?? '')
        }
        setSelectedTemplate(data.template_id ?? 'classic')
        setCommittedTemplate(data.template_id ?? 'classic')
        setSelectedColor(data.color_id ?? 'teal')
        setHiddenSections(data.hidden_sections ?? [])
        setSavedHiddenSections(data.hidden_sections ?? [])
        setSectionOrder(data.section_order ?? [])
        setSavedSectionOrder(data.section_order ?? [])
        setProfileContent(data.profile_content ?? {})
        setSavedProfileContent(data.profile_content ?? {})
        setTemplateLockedUntil(data.template_locked_until ?? null)
      }
      setLoading(false)
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleStateChange(s: string) {
    setStateName(s)
    if (!citiesOfState(s).includes(cityName)) setCityName('')
  }
  const cityOptions = useMemo(() => citiesOfState(stateName), [stateName])

  function addCustomSpecialty() {
    const v = customSpecialty.trim(); if (!v) return
    setForm(prev => ({ ...prev, specialties: addNormalizedUnique(prev.specialties, v) }))
    setCustomSpecialty('')
  }
  function addCustomLanguage() {
    const v = customLanguage.trim(); if (!v) return
    setForm(prev => ({ ...prev, languages: addNormalizedUnique(prev.languages, v) }))
    setCustomLanguage('')
  }

  const activeCountry = COUNTRY_CODES.find(c => c.dial === dialCode) ?? COUNTRY_CODES[0]
  const phoneTooShort = phoneNumber.length > 0 && phoneNumber.length !== activeCountry.len

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setCropSrc(URL.createObjectURL(file)); setCrop({ x: 0, y: 0 }); setZoom(1); e.target.value = ''
  }
  async function applyCrop() {
    if (!cropSrc || !croppedAreaPixels) return
    const file = await getCroppedFile(cropSrc, croppedAreaPixels)
    setPhotoFile(file); setPhotoPreview(URL.createObjectURL(file)); setCropSrc(null)
  }
  function toggleSpecialty(s: string) {
    setForm(prev => ({ ...prev, specialties: prev.specialties.includes(s) ? prev.specialties.filter(x => x !== s) : [...prev.specialties, s] }))
  }
  function toggleLanguage(l: string) {
    setForm(prev => ({ ...prev, languages: prev.languages.includes(l) ? prev.languages.filter(x => x !== l) : [...prev.languages, l] }))
  }

  async function handleSaveBasic() {
    if (!userId) return
    if (phoneNumber && phoneNumber.length !== activeCountry.len) {
      setBasicError(`Enter a valid ${activeCountry.len}-digit number for ${activeCountry.dial}.`); return
    }
    setSavingBasic(true); setBasicError('')
    try {
      let photo_url = photoPreview
      if (photoFile) {
        const ext = photoFile.name.split('.').pop()
        const path = `${userId}/profile-${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage.from('avatars').upload(path, photoFile, { upsert: true })
        if (uploadError) throw uploadError
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
        photo_url = urlData.publicUrl
      }
      const { error: updateError } = await supabase.from('therapists').update({
        full_name: form.full_name, title: form.title, bio: form.bio,
        city: [cityName, stateName].filter(Boolean).join(', '),
        phone: phoneNumber ? `${dialCode} ${phoneNumber}` : '',
        fee_per_session: Number(form.fee_per_session),
        session_duration_mins: Number(form.session_duration_mins),
        years_experience: Number(form.years_experience || 0),
        session_mode: form.session_mode, specialties: form.specialties, languages: form.languages,
        instagram: form.instagram || null, linkedin: form.linkedin || null,
        whatsapp: form.whatsapp || null, website: form.website || null,
        meet_link: form.meet_link || null,
        photo_url, is_profile_complete: true,
      }).eq('id', userId)
      if (updateError) throw updateError
      setSavedBasic(true); setTimeout(() => setSavedBasic(false), 3000)
    } catch (err: any) {
      setBasicError(err.message ?? 'Failed to save. Please try again.')
    } finally { setSavingBasic(false) }
  }

  async function updateTherapist(payload: Record<string, unknown>) {
    if (!userId) return
    let { error } = await supabase.from('therapists').update(payload).eq('id', userId)
    if (error && 'section_order' in payload && /section_order/i.test(error.message ?? '')) {
      const { section_order: _omit, ...rest } = payload
      ;({ error } = await supabase.from('therapists').update(rest).eq('id', userId))
    }
    if (error) throw new Error(error.message)
  }

  const isStarter = currentPlan === 'starter'
  const isTemplateLocked = isStarter && !!templateLockedUntil && new Date(templateLockedUntil).getTime() > Date.now()
  const lockDateLabel = formatLockDate(templateLockedUntil)
  const activeTemplateDef = TEMPLATES.find(t => t.id === selectedTemplate)!
  const orderedSections = getOrderedSections(selectedTemplate, sectionOrder, null)

  function requestTemplate(id: TemplateId) {
    const template = TEMPLATES.find(t => t.id === id)!
    if (isTemplateLocked && id !== committedTemplate) { setLockedTemplate(id); return }
    if (!canUseTemplate(template, currentPlan)) { setLockedTemplate(id); return }
    setPendingTemplate(id); setConfirmOpen(true)
  }

  async function confirmApplyTemplate() {
    if (!pendingTemplate) return
    setSavingTemplate(true); setSaveError(null)
    try {
      const shouldStartStarterLock =
        currentPlan === 'starter' && !isTemplateLocked &&
        (!templateLockedUntil || new Date(templateLockedUntil).getTime() <= Date.now())
      const nextLockedUntil = shouldStartStarterLock
        ? addDays(new Date(), STARTER_TEMPLATE_LOCK_DAYS).toISOString()
        : templateLockedUntil
      await updateTherapist({ template_id: pendingTemplate, template_locked_until: nextLockedUntil })
      setSelectedTemplate(pendingTemplate); setCommittedTemplate(pendingTemplate)
      setTemplateLockedUntil(nextLockedUntil)
      setHiddenSections([]); setSavedHiddenSections([])
      setSectionOrder([]); setSavedSectionOrder([])
      setSavedTemplate(true); setTimeout(() => setSavedTemplate(false), 2500)
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : String(e))
    } finally { setSavingTemplate(false); setConfirmOpen(false); setPendingTemplate(null) }
  }

  function toggleSection(id: string) {
    setHiddenSections(p => p.includes(id) ? p.filter(s => s !== id) : [...p, id])
  }
  function moveSection(id: string, dir: -1 | 1) {
    const ids = orderedSections.map(s => s.id)
    const i = ids.indexOf(id); const j = i + dir
    if (i === -1 || j < 0 || j >= ids.length) return
    const next = [...ids]; [next[i], next[j]] = [next[j], next[i]]
    setSectionOrder(next)
  }
  function reorderByDrag(draggedSectionId: string, targetId: string) {
    if (draggedSectionId === targetId) return
    const ids = orderedSections.map(s => s.id)
    const from = ids.indexOf(draggedSectionId); const to = ids.indexOf(targetId)
    if (from === -1 || to === -1) return
    const next = [...ids]; next.splice(from, 1); next.splice(to, 0, draggedSectionId)
    setSectionOrder(next)
  }
  const sectionsHaveUnsavedChanges =
    JSON.stringify([...hiddenSections].sort()) !== JSON.stringify([...savedHiddenSections].sort()) ||
    JSON.stringify(sectionOrder) !== JSON.stringify(savedSectionOrder)

  async function handleSaveSections() {
    setSavingSections(true); setSaveError(null)
    try {
      await updateTherapist({ hidden_sections: hiddenSections, section_order: sectionOrder })
      setSavedHiddenSections(hiddenSections); setSavedSectionOrder(sectionOrder)
      setSavedSections(true); setTimeout(() => setSavedSections(false), 2500)
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : String(e))
    } finally { setSavingSections(false) }
  }

  function patchContent<K extends keyof ProfileContent>(key: K, val: ProfileContent[K]) {
    setProfileContent(p => ({ ...p, [key]: val }))
  }
  const contentHasUnsavedChanges = JSON.stringify(profileContent) !== JSON.stringify(savedProfileContent)

  async function handleSaveContent() {
    setSavingContent(true); setSaveError(null)
    try {
      await updateTherapist({ profile_content: profileContent })
      setSavedProfileContent(profileContent)
      setSavedContent(true); setTimeout(() => setSavedContent(false), 2500)
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : String(e))
    } finally { setSavingContent(false) }
  }

  const contentSaveButton = (
    <button
      onClick={handleSaveContent}
      disabled={savingContent || !contentHasUnsavedChanges}
      className="flex h-10 w-full items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold text-white transition disabled:opacity-50 sm:w-auto sm:min-w-40"
      style={{ background: savedContent ? '#16a34a' : BRAND }}
    >
      {savingContent ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : savedContent ? <Check size={16} /> : <Save size={16} />}
      {savedContent ? 'Saved!' : contentHasUnsavedChanges ? 'Save changes' : 'No changes'}
    </button>
  )

  if (loading) return (
    <div className="flex min-h-64 items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#FF9933] border-t-transparent" />
    </div>
  )

  return (
    <div className="w-full" style={{ fontFamily: "'Plus Jakarta Sans','Inter',system-ui,sans-serif" }}>

      {saveError && (
        <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <div><p className="font-semibold">Save failed</p><p className="text-red-600">{saveError}</p></div>
          <button onClick={() => setSaveError(null)} className="ml-auto text-red-400 hover:text-red-600">x</button>
        </div>
      )}

      {/* Tab strip */}
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-[#eadfd2] bg-white p-1 shadow-sm scrollbar-none lg:inline-flex lg:w-auto">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = tab === id
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="relative flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition"
              style={active
                ? { background: '#eaf6ef', color: '#ff9933', boxShadow: 'inset 0 0 0 1px #9bd1b3' }
                : { color: '#6f665d' }}
            >
              <Icon size={15} />
              {label}
            </button>
          )
        })}
      </div>

      {/* BASIC INFO */}
      {tab === 'basic' && (
        <div className="space-y-4">
          {basicError && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{basicError}</div>}
          {savedBasic && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
              <CheckCircle size={16} /> Saved — your public page has been updated.
            </div>
          )}

          <section className="rounded-lg border border-[#eadfd2] bg-white">
            <div className="border-b border-[#ece7df] p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#eaf6ef] text-[#ff9933]"><User size={18} /></div>
                <div>
                  <h2 className="text-base font-semibold text-[#171412]">Identity</h2>
                  <p className="text-sm text-[#766c62]">Name, photo, credentials, location, and how clients contact you.</p>
                </div>
              </div>
            </div>
            <div className="p-5">
              <div className="mb-5 flex items-center gap-4">
                <div className="relative">
                  <div className="h-16 w-16 overflow-hidden rounded-2xl border border-[#d7eadf] bg-[#f1faf5] flex items-center justify-center">
                    {photoPreview ? <img src={photoPreview} alt="Profile" className="h-full w-full object-cover" /> : <User size={22} className="text-[#8b8278]" />}
                  </div>
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-white bg-[#ff9933] text-white shadow-sm transition hover:bg-[#176344]">
                    <Camera size={11} />
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#171412]">Profile photo</p>
                  <button type="button" onClick={() => fileRef.current?.click()} className="text-xs font-semibold text-[#c2650a] hover:underline">Change photo</button>
                </div>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <label className="space-y-1.5">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8b8278]">Full name</span>
                  <input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} placeholder="Dr. Arjun Sharma"
                    className="h-11 w-full rounded-lg border border-[#ded8ce] bg-[#fffdfb] px-4 text-sm text-[#171412] outline-none transition placeholder:text-[#aaa197] focus:border-[#171412]" />
                </label>
                <label className="space-y-1.5">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8b8278]">Professional title</span>
                  <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Clinical Psychologist - RCI Licensed"
                    className="h-11 w-full rounded-lg border border-[#ded8ce] bg-[#fffdfb] px-4 text-sm text-[#171412] outline-none transition placeholder:text-[#aaa197] focus:border-[#171412]" />
                </label>
                <label className="space-y-1.5 md:col-span-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8b8278]">Bio</span>
                  <textarea rows={5} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })}
                    placeholder="Tell clients about your approach, experience, and who you help."
                    className="w-full resize-none rounded-lg border border-[#ded8ce] bg-[#fffdfb] px-4 py-3 text-sm leading-6 text-[#171412] outline-none transition placeholder:text-[#aaa197] focus:border-[#171412]" />
                </label>
                <label className="space-y-1.5">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#8b8278]"><MapPin size={12} /> State</span>
                  <select value={stateName} onChange={e => handleStateChange(e.target.value)}
                    className="h-11 w-full rounded-lg border border-[#ded8ce] bg-[#fffdfb] px-4 text-sm text-[#171412] outline-none transition focus:border-[#171412]">
                    <option value="">Select state</option>
                    {STATES_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </label>
                <label className="space-y-1.5">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#8b8278]"><MapPin size={12} /> City</span>
                  <select value={cityName} onChange={e => setCityName(e.target.value)} disabled={!stateName}
                    className="h-11 w-full rounded-lg border border-[#ded8ce] bg-[#fffdfb] px-4 text-sm text-[#171412] outline-none transition disabled:bg-[#f4f0ea] disabled:text-[#aaa197] focus:border-[#171412]">
                    <option value="">{stateName ? 'Select city' : 'Select a state first'}</option>
                    {cityOptions.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </label>
                <div className="space-y-1.5 md:col-span-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#8b8278]"><Phone size={12} /> WhatsApp / phone</span>
                  <div className="grid gap-2 sm:grid-cols-[140px_1fr]">
                    <select value={dialCode} onChange={e => { const next = e.target.value; setDialCode(next); const max = (COUNTRY_CODES.find(c => c.dial === next) ?? activeCountry).len; setPhoneNumber(p => p.slice(0, max)) }}
                      className="h-11 rounded-lg border border-[#ded8ce] bg-[#fffdfb] px-3 text-sm text-[#171412] outline-none transition focus:border-[#171412]">
                      {COUNTRY_CODES.map(c => <option key={c.code} value={c.dial}>{c.dial}</option>)}
                    </select>
                    <input type="tel" inputMode="numeric" value={phoneNumber}
                      onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, activeCountry.len))}
                      placeholder={'9'.repeat(Math.min(activeCountry.len, 10))}
                      className={`h-11 rounded-lg border bg-[#fffdfb] px-4 text-sm text-[#171412] outline-none transition placeholder:text-[#aaa197] focus:border-[#171412] ${phoneTooShort ? 'border-red-300' : 'border-[#ded8ce]'}`} />
                  </div>
                  <p className={`text-xs ${phoneTooShort ? 'text-red-500' : 'text-[#9a9188]'}`}>
                    {phoneTooShort ? `${activeCountry.dial} needs exactly ${activeCountry.len} digits (${phoneNumber.length}/${activeCountry.len}).` : `${activeCountry.dial} requires ${activeCountry.len} digits.`}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-[#eadfd2] bg-white">
            <div className="border-b border-[#ece7df] p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#fff1df] text-[#c2650a]"><Briefcase size={18} /></div>
                <div><h2 className="text-base font-semibold text-[#171412]">Practice details</h2><p className="text-sm text-[#766c62]">Session pricing, duration, experience, and mode.</p></div>
              </div>
            </div>
            <div className="grid gap-5 p-5 md:grid-cols-2">
              <label className="space-y-1.5">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#8b8278]"><IndianRupee size={12} /> Session fee</span>
                <input type="number" value={form.fee_per_session} onChange={e => setForm({ ...form, fee_per_session: e.target.value })} placeholder="1500"
                  className="h-11 w-full rounded-lg border border-[#ded8ce] bg-[#fffdfb] px-4 text-sm text-[#171412] outline-none transition placeholder:text-[#aaa197] focus:border-[#171412]" />
              </label>
              <label className="space-y-1.5">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#8b8278]"><Clock size={12} /> Session duration</span>
                <select value={form.session_duration_mins} onChange={e => setForm({ ...form, session_duration_mins: e.target.value })}
                  className="h-11 w-full rounded-lg border border-[#ded8ce] bg-[#fffdfb] px-4 text-sm text-[#171412] outline-none transition focus:border-[#171412]">
                  {[30, 45, 50, 60, 90].map(d => <option key={d} value={d}>{d} minutes</option>)}
                </select>
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8b8278]">Years of experience</span>
                <select value={form.years_experience} onChange={e => setForm({ ...form, years_experience: e.target.value })}
                  className="h-11 w-full rounded-lg border border-[#ded8ce] bg-[#fffdfb] px-4 text-sm text-[#171412] outline-none transition focus:border-[#171412]">
                  <option value="0">Fresher</option>
                  {Array.from({ length: 40 }, (_, i) => i + 1).map(y => <option key={y} value={y}>{y} {y === 1 ? 'year' : 'years'}</option>)}
                </select>
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8b8278]">Session mode</span>
                <select value={form.session_mode} onChange={e => setForm({ ...form, session_mode: e.target.value })}
                  className="h-11 w-full rounded-lg border border-[#ded8ce] bg-[#fffdfb] px-4 text-sm text-[#171412] outline-none transition focus:border-[#171412]">
                  <option value="online">Online only</option>
                  <option value="offline">In-person only</option>
                  <option value="both">Both</option>
                </select>
              </label>
              <label className="space-y-1.5 md:col-span-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#8b8278]"><Video size={12} /> Meeting link</span>
                <input value={form.meet_link} onChange={e => setForm({ ...form, meet_link: e.target.value })}
                  placeholder="https://meet.google.com/xxx-xxxx-xxx or your Zoom link"
                  className="h-11 w-full rounded-lg border border-[#ded8ce] bg-[#fffdfb] px-4 text-sm text-[#171412] outline-none transition placeholder:text-[#aaa197] focus:border-[#171412]" />
                <p className="text-xs text-[#9a9188]">This link is included in the booking confirmation email sent to your client. Leave blank if you'll share it separately.</p>
              </label>
            </div>
          </section>

          <section className="rounded-lg border border-[#eadfd2] bg-white">
            <div className="border-b border-[#ece7df] p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#edf3ff] text-[#2f5fba]"><Languages size={18} /></div>
                <div><h2 className="text-base font-semibold text-[#171412]">Clinical focus</h2><p className="text-sm text-[#766c62]">Help clients quickly understand who you support.</p></div>
              </div>
            </div>
            <div className="space-y-6 p-5">
              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[#171412]">Specialties</p>
                  <span className="text-xs font-semibold text-[#9a9188]">{form.specialties.length} selected</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SPECIALTIES_LIST.map(s => {
                    const active = form.specialties.includes(s)
                    return <button key={s} type="button" onClick={() => toggleSpecialty(s)}
                      className="rounded-full border px-3 py-1.5 text-xs font-semibold transition"
                      style={active ? { background: '#eaf6ef', color: '#ff9933', borderColor: '#9bd1b3' } : { background: '#fffdfb', color: '#6f665d', borderColor: '#ded8ce' }}>{s}</button>
                  })}
                  {form.specialties.filter(s => !SPECIALTIES_LIST.includes(s)).map(s => (
                    <button key={s} type="button" onClick={() => toggleSpecialty(s)}
                      className="rounded-full border border-[#9bd1b3] bg-[#eaf6ef] px-3 py-1.5 text-xs font-semibold text-[#ff9933]">{s} x</button>
                  ))}
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
                  <input value={customSpecialty} onChange={e => setCustomSpecialty(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomSpecialty() } }} placeholder="Add another specialty"
                    className="h-10 rounded-lg border border-[#ded8ce] bg-[#fffdfb] px-4 text-sm text-[#171412] outline-none transition placeholder:text-[#aaa197] focus:border-[#171412]" />
                  <button type="button" onClick={addCustomSpecialty} disabled={!customSpecialty.trim()}
                    className="h-10 rounded-lg bg-[#ff9933] px-4 text-sm font-semibold text-white transition hover:bg-[#176344] disabled:opacity-50">Add</button>
                </div>
              </div>
              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[#171412]">Languages</p>
                  <span className="text-xs font-semibold text-[#9a9188]">{form.languages.length} selected</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES_LIST.map(l => {
                    const active = form.languages.includes(l)
                    return <button key={l} type="button" onClick={() => toggleLanguage(l)}
                      className="rounded-full border px-3 py-1.5 text-xs font-semibold transition"
                      style={active ? { background: '#fff1df', color: '#c2650a', borderColor: '#f0bd82' } : { background: '#fffdfb', color: '#6f665d', borderColor: '#ded8ce' }}>{l}</button>
                  })}
                  {form.languages.filter(l => !LANGUAGES_LIST.includes(l)).map(l => (
                    <button key={l} type="button" onClick={() => toggleLanguage(l)}
                      className="rounded-full border border-[#f0bd82] bg-[#fff1df] px-3 py-1.5 text-xs font-semibold text-[#c2650a]">{l} x</button>
                  ))}
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
                  <input value={customLanguage} onChange={e => setCustomLanguage(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomLanguage() } }} placeholder="Add another language"
                    className="h-10 rounded-lg border border-[#ded8ce] bg-[#fffdfb] px-4 text-sm text-[#171412] outline-none transition placeholder:text-[#aaa197] focus:border-[#171412]" />
                  <button type="button" onClick={addCustomLanguage} disabled={!customLanguage.trim()}
                    className="h-10 rounded-lg bg-[#ff9933] px-4 text-sm font-semibold text-white transition hover:bg-[#176344] disabled:opacity-50">Add</button>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-[#eadfd2] bg-white">
            <div className="border-b border-[#ece7df] p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f4f0ff] text-[#6d55b8]"><LinkIcon size={18} /></div>
                <div><h2 className="text-base font-semibold text-[#171412]">Social and contact links</h2><p className="text-sm text-[#766c62]">Optional links shown on your public profile footer.</p></div>
              </div>
            </div>
            <div className="grid gap-3 p-5 md:grid-cols-2">
              {[
                { key: 'instagram', label: 'Instagram', icon: Globe2, placeholder: 'instagram.com/yourhandle or @handle' },
                { key: 'linkedin',  label: 'LinkedIn',  icon: Briefcase, placeholder: 'linkedin.com/in/yourprofile' },
                { key: 'whatsapp', label: 'WhatsApp',  icon: Phone, placeholder: '+91 98765 43210' },
                { key: 'website',  label: 'Website',   icon: Globe2, placeholder: 'https://yourwebsite.com' },
              ].map(({ key, label, icon: Icon, placeholder }) => (
                <label key={key} className="space-y-1.5">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8b8278]">{label}</span>
                  <div className="flex h-11 items-center gap-3 rounded-lg border border-[#ded8ce] bg-[#fffdfb] px-3 transition focus-within:border-[#ff9933] focus-within:ring-2 focus-within:ring-[#d9efe3]">
                    <Icon size={15} className="shrink-0 text-[#8b8278]" />
                    <input value={(form as any)[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                      placeholder={placeholder} className="min-w-0 flex-1 bg-transparent text-sm text-[#171412] outline-none placeholder:text-[#aaa197]" />
                  </div>
                </label>
              ))}
            </div>
          </section>



          {userId && <section className="rounded-lg border border-[#eadfd2] bg-white p-5"><FeedbackManager therapistId={userId} /></section>}

          {cropSrc && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#4b4036]/35 p-4 backdrop-blur-sm">
              <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[#eadfd2] bg-white shadow-2xl">
                <div className="relative h-72 w-full overflow-hidden bg-[#f4f0ea]">
                  <Cropper image={cropSrc} crop={crop} zoom={zoom} aspect={1} cropShape="round" showGrid={false}
                    onCropChange={setCrop} onZoomChange={setZoom}
                    onCropComplete={(_, areaPixels) => setCroppedAreaPixels(areaPixels)}
                    style={{ cropAreaStyle: { boxShadow: '0 0 0 9999px rgba(244,240,234,0.78)' } }} />
                </div>
                <div className="flex justify-end gap-2 px-5 py-4">
                  <button type="button" onClick={() => setCropSrc(null)}
                    className="h-10 rounded-lg border border-[#ded8ce] px-4 text-sm font-semibold text-[#6f665d] transition hover:bg-[#f6f2ec]">Cancel</button>
                  <button type="button" onClick={applyCrop}
                    className="h-10 rounded-lg bg-[#ff9933] px-4 text-sm font-bold text-[#24170a] transition hover:bg-[#f08a22]">Apply crop</button>
                </div>
              </div>
            </div>
          )}



          <div className="sticky bottom-4 z-20 rounded-lg border border-[#eadfd2] bg-white/95 p-3 shadow-[0_18px_50px_rgba(31,26,20,0.10)] backdrop-blur">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[#6f665d]">Save to update your public website and booking details.</p>
              <button type="button" onClick={handleSaveBasic} disabled={savingBasic}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#ff9933] px-5 text-sm font-bold text-[#171412] transition hover:brightness-95 disabled:opacity-60">
                {savingBasic ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#171412]/30 border-t-[#171412]" /> : savedBasic ? <CheckCircle size={15} /> : <Save size={15} />}
                {savedBasic ? 'Saved' : 'Save basic info'}
              </button>
            </div>
          </div>


        </div>
      )}

      {/* MY SERVICES */}
      {tab === 'services' && (
        <div className="space-y-4">
          <div className="rounded-lg border border-[#ded8ce] bg-white p-5">
            <div className="mb-4">
              {contentHasUnsavedChanges && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
                  <span className="h-2 w-2 rounded-full bg-amber-400" /> Unsaved changes
                </span>
              )}
            </div>
            {!canUseTemplate(activeTemplateDef, currentPlan) ? (
              <div className="rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50 p-8 text-center">
                <Lock size={26} className="mx-auto mb-3 text-amber-300" />
                <p className="font-semibold text-amber-800">This template is locked</p>
                <p className="mt-1 mb-4 text-sm text-amber-600">Upgrade to a Growth plan to edit this template's content.</p>
                <button onClick={() => router.push('/pricing?redirect=/dashboard/profile')}
                  className="rounded-xl px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90" style={{ background: BRAND }}>
                  View plans &amp; upgrade
                </button>
              </div>
            ) : (
              <>
                {selectedTemplate === 'classic'  && <CT1ContentEditor value={(profileContent as any).classic  ?? {}} onChange={v => patchContent('classic',  v as CT1Content)} saveButton={contentSaveButton} />}
                {selectedTemplate === 'classic2' && <CT2ContentEditor value={(profileContent as any).classic2 ?? {}} onChange={v => patchContent('classic2', v as CT2Content)} saveButton={contentSaveButton} />}
                {selectedTemplate === 'classic3' && <CT3ContentEditor value={(profileContent as any).classic3 ?? {}} onChange={v => patchContent('classic3', v as CT3Content)} saveButton={contentSaveButton} />}
                {selectedTemplate === 'classic4' && <CT4ContentEditor value={(profileContent as any).classic4 ?? {}} onChange={v => patchContent('classic4', v as CT4Content)} saveButton={contentSaveButton} />}
                {selectedTemplate === 'classic5' && <CT5ContentEditor value={(profileContent as any).classic5 ?? {}} onChange={v => patchContent('classic5', v as CT5Content)} saveButton={contentSaveButton} />}
                {selectedTemplate === 'classic6' && <CT6ContentEditor value={(profileContent as any).classic6 ?? {}} onChange={v => patchContent('classic6', v as CT6Content)} saveButton={contentSaveButton} />}
              </>
            )}
          </div>
        </div>
      )}

      {/* AVAILABILITY */}
      {tab === 'availability' && (
        <div className="rounded-lg border border-[#ded8ce] bg-white p-5">
          <AvailabilitySettings />
        </div>
      )}

      {/* TEMPLATE — live switcher inline, no redirect */}
      {tab === 'template' && (
        <div className="space-y-4">
          <div className="mb-2">
            <h2 className="text-base font-semibold text-[#171412]">Pick how your page looks</h2>
            <p className="text-sm text-[#766c62] mt-1 max-w-xl">
              Preview each template live below. Select one to apply it to your public page.
            </p>
          </div>

          {isTemplateLocked && (
            <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <Lock size={16} className="mt-0.5 shrink-0" />
              <p>Your template is locked until <strong>{lockDateLabel}</strong>. You can still browse designs, but switching won't go live until the lock ends.</p>
            </div>
          )}

          <TemplateLiveSwitcher
            selectedTemplate={selectedTemplate}
            committedTemplate={committedTemplate}
            isLocked={isTemplateLocked}
            lockDateLabel={lockDateLabel}
            brandColor={BRAND}
            onSelect={requestTemplate}
            onLockedAttempt={id => setLockedTemplate(id as TemplateId)}
            hideTabs={false}
            hideActionBar={false}
            frameHeight={520}
          />
        </div>
      )}

      {/* SECTIONS */}
      {tab === 'sections' && (
        <div className="space-y-3 rounded-lg border border-[#ded8ce] bg-white p-5">
          <div className="mb-1">
            <h2 className="text-base font-semibold text-[#171412]">Arrange your page</h2>
            <p className="text-sm text-[#766c62] mt-1 max-w-2xl">
              Drag or use arrows to reorder sections. Toggle visibility per section. Template: <strong>{activeTemplateDef.name}</strong>.
            </p>
            {sectionsHaveUnsavedChanges && (
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                <span className="h-2 w-2 rounded-full bg-amber-400" /> Unsaved
              </span>
            )}
          </div>
          {orderedSections.map((section, i) => {
            const enabled = !hiddenSections.includes(section.id)
            const isFirst = i === 0; const isLast = i === orderedSections.length - 1
            const isDragging = draggedId === section.id
            const isDragOver = dragOverId === section.id && draggedId !== null && draggedId !== section.id
            return (
              <div key={section.id}
                draggable
                onDragStart={(e) => { setDraggedId(section.id); e.dataTransfer.effectAllowed = 'move' }}
                onDragEnd={() => { setDraggedId(null); setDragOverId(null) }}
                onDragOver={(e) => { e.preventDefault(); if (draggedId && draggedId !== section.id) setDragOverId(section.id) }}
                onDragLeave={() => { if (dragOverId === section.id) setDragOverId(null) }}
                onDrop={(e) => { e.preventDefault(); if (draggedId) reorderByDrag(draggedId, section.id); setDraggedId(null); setDragOverId(null) }}
                className="flex items-center gap-2 rounded-xl border px-3 py-2.5 transition-all"
                style={{
                  ...(enabled ? { borderColor: `${BRAND}40`, background: `${BRAND}08` } : { borderColor: '#e8e4df', background: 'white' }),
                  opacity: isDragging ? 0.4 : 1,
                  borderColor: isDragOver ? BRAND : undefined,
                  boxShadow: isDragOver ? `0 0 0 2px ${BRAND}30` : undefined,
                  transform: isDragOver ? 'scale(1.01)' : undefined,
                }}>
                <span title="Drag to reorder" className="-ml-1 flex h-6 w-5 shrink-0 cursor-grab items-center justify-center text-[#c4bdb2] active:cursor-grabbing">
                  <GripVertical size={14} />
                </span>
                <div className="-my-1 flex shrink-0 flex-col">
                  <button type="button" onClick={(e) => { e.stopPropagation(); moveSection(section.id, -1) }} disabled={isFirst}
                    className="flex h-5 w-5 items-center justify-center rounded text-[#9ca3af] transition hover:bg-[#f4f0ea] hover:text-[#1c1c1e] disabled:opacity-25 disabled:hover:bg-transparent">
                    <ChevronUp size={13} />
                  </button>
                  <button type="button" onClick={(e) => { e.stopPropagation(); moveSection(section.id, 1) }} disabled={isLast}
                    className="flex h-5 w-5 items-center justify-center rounded text-[#9ca3af] transition hover:bg-[#f4f0ea] hover:text-[#1c1c1e] disabled:opacity-25 disabled:hover:bg-transparent">
                    <ChevronDown size={13} />
                  </button>
                </div>
                <span className="w-5 shrink-0 font-mono text-xs text-[#9ca3af]">{String(i + 1).padStart(2, '0')}</span>
                <button type="button" onClick={() => toggleSection(section.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                  <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition-all ${enabled ? 'shadow-sm' : 'bg-[#f0ece8]'}`}
                    style={enabled ? { background: BRAND } : {}}>
                    {enabled && <Check size={12} className="text-white" strokeWidth={3} />}
                  </div>
                  <span className={`flex-1 truncate text-sm font-medium ${enabled ? 'text-[#1c1c1e]' : 'text-[#9ca3af] line-through'}`}>{section.label}</span>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-[#f0ece8] text-[#9ca3af]'}`}>
                    {enabled ? 'Visible' : 'Hidden'}
                  </span>
                </button>
              </div>
            )
          })}
          <button onClick={handleSaveSections} disabled={savingSections || !sectionsHaveUnsavedChanges}
            className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-white transition disabled:opacity-50"
            style={{ background: savedSections ? '#16a34a' : BRAND }}>
            {savingSections ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : savedSections ? <Check size={16} /> : <Save size={16} />}
            {savedSections ? 'Saved!' : sectionsHaveUnsavedChanges ? 'Save changes' : 'No changes to save'}
          </button>
        </div>
      )}

      {/* Locked notice popup */}
      {lockedTemplate && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#4b4036]/35 p-4 backdrop-blur-sm" onClick={() => setLockedTemplate(null)}>
          <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-[#eadfd2] bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 pb-4 pt-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100"><Lock size={24} className="text-amber-600" /></div>
              <h2 className="text-lg font-semibold text-[#1c1c1e]">Can't switch to "{TEMPLATES.find(t => t.id === lockedTemplate)?.name}" yet</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#6b7280]">
                {canUseTemplate(TEMPLATES.find(t => t.id === lockedTemplate)!, currentPlan)
                  ? <>Your template choice is final until <strong>{lockDateLabel}</strong>. You can still preview this design as a demo.</>
                  : <>This template requires a Growth plan.</>}
              </p>
            </div>
            <div className="flex gap-2 px-6 pb-6">
              <button onClick={() => setLockedTemplate(null)}
                className="h-11 flex-1 rounded-xl border border-[#e8e4df] text-sm font-medium text-[#6b7280] transition hover:bg-[#f5f4f1]">Got it</button>
              <a href={`/try?t=${TEMPLATE_TPARAM[lockedTemplate]}`} target="_blank" rel="noopener noreferrer" onClick={() => setLockedTemplate(null)}
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-bold text-white transition hover:opacity-90" style={{ background: BRAND }}>
                <Sparkles size={15} /> Try demo
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Apply template confirmation */}
      {confirmOpen && pendingTemplate && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#4b4036]/35 p-4 backdrop-blur-sm" onClick={() => !savingTemplate && setConfirmOpen(false)}>
          <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-[#eadfd2] bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 pb-4 pt-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: `${BRAND}1e` }}>
                <Palette size={24} style={{ color: BRAND }} />
              </div>
              <h2 className="text-lg font-semibold text-[#1c1c1e]">Use "{TEMPLATES.find(t => t.id === pendingTemplate)?.name}"?</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#6b7280]">
                {isStarter
                  ? <>This becomes your live template. You <strong>cannot change it for 12 months</strong> once applied.</>
                  : <>This will be applied to your live public profile.</>}
              </p>
            </div>
            <div className="flex gap-2 px-6 pb-6">
              <button onClick={() => setConfirmOpen(false)} disabled={savingTemplate}
                className="h-11 flex-1 rounded-xl border border-[#e8e4df] text-sm font-medium text-[#6b7280] transition hover:bg-[#f5f4f1] disabled:opacity-50">Cancel</button>
              <button onClick={confirmApplyTemplate} disabled={savingTemplate}
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60" style={{ background: BRAND }}>
                {savingTemplate ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : (isStarter ? 'OK, use & lock' : 'OK, use it')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { TEMPLATES, type TemplateId } from '@/lib/template'
import Logo from '@/components/ui/Logo'
import TemplateLiveSwitcher from '@/components/appearance/TemplateLiveSwitcher'
import {
  Check, ChevronLeft, Camera, User,
  ArrowRight, Sparkles, Globe, Copy, CheckCircle,
  Palette, UserCircle, Rocket,
} from 'lucide-react'
import type { Area } from 'react-easy-crop'
import dynamic from 'next/dynamic'

const Cropper = dynamic(() => import('react-easy-crop'), { ssr: false })

const BRAND = '#FF9933'

// ── helpers ───────────────────────────────────────────────────────────────────

async function getCroppedFile(src: string, area: Area): Promise<File> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
  const canvas = document.createElement('canvas')
  canvas.width = area.width; canvas.height = area.height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, area.width, area.height)
  const blob = await new Promise<Blob>(res => canvas.toBlob(b => res(b!), 'image/jpeg', 0.92))
  return new File([blob], 'profile.jpg', { type: 'image/jpeg' })
}

// ── Vertical step tracker ─────────────────────────────────────────────────────

const STEPS = [
  { icon: Palette,     label: 'Pick template',  desc: 'Choose your page style'       },
  { icon: UserCircle,  label: 'Your profile',   desc: 'Name, photo, bio & services'  },
  { icon: Rocket,      label: 'Publish',        desc: 'Go live instantly'             },
]

function VerticalStepper({ current }: { current: number }) {
  return (
    <aside
      className="hidden lg:flex flex-col shrink-0 w-64 px-8 py-10 border-r"
      style={{ borderColor: '#EDE9E4', background: '#FAFAF7', minHeight: '100%' }}
    >
      {/* Brand */}
      <div className="mb-1">
        <Logo size="sm" />
      </div>
      {/* Continuity marker — this is step 4 of the account→plan→payment→build journey */}
      <p className="text-[10px] font-semibold uppercase tracking-wide mb-9" style={{ color: '#22c55e' }}>
        ✓ Account · ✓ Plan · ✓ Payment · Build site
      </p>

      {/* Steps */}
      <div className="flex flex-col gap-0">
        {STEPS.map((s, i) => {
          const done   = i < current
          const active = i === current
          const last   = i === STEPS.length - 1

          return (
            <div key={i} className="flex gap-4">
              {/* Line + circle column */}
              <div className="flex flex-col items-center">
                {/* Circle */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 z-10"
                  style={{
                    background: done    ? '#22c55e'
                              : active  ? BRAND
                              : '#F0EBE3',
                    border: active ? `3px solid ${BRAND}33` : done ? '3px solid #22c55e33' : '2px dashed #D9CFC4',
                    boxShadow: active ? `0 0 0 5px ${BRAND}18` : 'none',
                  }}
                >
                  {done
                    ? <Check size={15} color="#fff" strokeWidth={2.5} />
                    : <s.icon size={15} color={active ? '#fff' : '#B0A89E'} />
                  }
                </div>

                {/* Connector line */}
                {!last && (
                  <div
                    className="w-0.5 flex-1 my-1 transition-all duration-500"
                    style={{
                      background: done
                        ? 'linear-gradient(to bottom, #22c55e, #22c55e88)'
                        : 'linear-gradient(to bottom, #E5E0D9, #E5E0D9)',
                      minHeight: 40,
                    }}
                  />
                )}
              </div>

              {/* Text */}
              <div className="pb-10 pt-1 min-w-0">
                <p
                  className="text-sm font-bold leading-tight transition-all"
                  style={{
                    color: done    ? '#22c55e'
                         : active  ? '#1F1A14'
                         : '#B0A89E',
                  }}
                >
                  {s.label}
                </p>
                <p
                  className="text-xs mt-0.5 leading-snug"
                  style={{ color: active ? '#7A7166' : '#C4BDB2' }}
                >
                  {s.desc}
                </p>
                {active && (
                  <span
                    className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: `${BRAND}18`, color: BRAND }}
                  >
                    ● In progress
                  </span>
                )}
                {done && (
                  <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold text-emerald-600">
                    <Check size={10} /> Done
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Bottom hint */}
      <div className="mt-auto pt-8">
        <p className="text-[11px] text-[#C4BDB2] leading-relaxed">
          Your page goes live the moment you hit publish. You can edit everything after.
        </p>
      </div>
    </aside>
  )
}

// ── Service row ───────────────────────────────────────────────────────────────

interface Service { name: string; duration: string; price: string }

function ServiceRow({ svc, onChange, onRemove, showRemove }: {
  svc: Service; onChange: (s: Service) => void; onRemove: () => void; showRemove: boolean
}) {
  const inp = 'h-10 px-3 rounded-lg border border-[#e8e4df] text-sm text-[#1c1c1e] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#FF9933] focus:border-transparent bg-white w-full'
  return (
    <div className="flex gap-2 items-start">
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
        <input className={inp} placeholder="e.g. Individual Therapy" value={svc.name} onChange={e => onChange({ ...svc, name: e.target.value })} />
        <input className={inp} placeholder="50 min" value={svc.duration} onChange={e => onChange({ ...svc, duration: e.target.value })} />
        <input className={inp} placeholder="₹1,500" value={svc.price} onChange={e => onChange({ ...svc, price: e.target.value })} />
      </div>
      {showRemove && (
        <button type="button" onClick={onRemove}
          className="h-10 w-10 rounded-lg flex items-center justify-center text-[#9ca3af] hover:text-red-400 hover:bg-red-50 transition shrink-0">
          ×
        </button>
      )}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

interface Props {
  therapistId: string; username: string
  existingName?: string; existingPhoto?: string
  existingBio?: string; existingFee?: string
  onComplete: () => void
}

export default function SetupWizard({
  therapistId, username, existingName = '', existingPhoto = '',
  existingBio = '', existingFee = '', onComplete,
}: Props) {
  const supabase = createClient()
  const fileRef  = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState(0)

  // Step 1
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('classic')

  // Step 2
  const [name,      setName]      = useState(existingName)
  const [bio,       setBio]       = useState(existingBio)
  const [fee,       setFee]       = useState(existingFee)
  const [photo,     setPhoto]     = useState(existingPhoto)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [services,  setServices]  = useState<Service[]>([{ name: '', duration: '50 min', price: '' }])
  const [cropSrc,   setCropSrc]   = useState<string | null>(null)
  const [crop,      setCrop]      = useState({ x: 0, y: 0 })
  const [zoom,      setZoom]      = useState(1)
  const [cropArea,  setCropArea]  = useState<Area | null>(null)

  // Step 3
  const [publishing, setPublishing] = useState(false)
  const [published,  setPublished]  = useState(false)
  const [copied,     setCopied]     = useState(false)
  const [pubError,   setPubError]   = useState('')

  const hasMinService = services.some(s => s.name.trim())
  const step2Ready    = name.trim() && bio.trim() && fee.trim() && photo && hasMinService
  const filledFields  = [name.trim(), bio.trim(), fee.trim(), photo, hasMinService].filter(Boolean).length
  const progress      = Math.round((filledFields / 5) * 100)
  const liveUrl       = `counsellorsofindia.com/${username}`
  const hasSelectedTemplate = TEMPLATES.some(t => t.id === selectedTemplate)

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setCropSrc(URL.createObjectURL(file)); setCrop({ x: 0, y: 0 }); setZoom(1); e.target.value = ''
  }
  async function applyCrop() {
    if (!cropSrc || !cropArea) return
    const file = await getCroppedFile(cropSrc, cropArea)
    setPhotoFile(file); setPhoto(URL.createObjectURL(file)); setCropSrc(null)
  }

  async function handlePublish() {
    setPublishing(true); setPubError('')
    try {
      let photo_url = photo
      if (photoFile) {
        const path = `${therapistId}/profile-${Date.now()}.jpg`
        const { error: upErr } = await supabase.storage.from('avatars').upload(path, photoFile, { upsert: true })
        if (upErr) throw upErr
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
        photo_url = urlData.publicUrl
      }
      const { error } = await supabase.from('therapists').update({
        full_name: name, bio, fee_per_session: Number(fee) || 0, photo_url,
        template_id: selectedTemplate, is_profile_complete: true, setup_complete: true,
        profile_content: { [selectedTemplate]: { services: services.filter(s => s.name.trim()) } },
      }).eq('id', therapistId)
      if (error) throw error
      localStorage.setItem(`coi_setup_done_${therapistId}`, '1')
      setPublished(true)
    } catch (e: unknown) {
      let message = 'Publish failed. Please try again.'
      if (e instanceof Error) {
        message = e.message
      } else if (typeof e === 'string') {
        message = e
      } else if (e && typeof e === 'object') {
        const errObj = e as Record<string, unknown>
        if (typeof errObj.message === 'string') {
          message = errObj.message
        } else if (typeof errObj.error === 'string') {
          message = errObj.error
        } else {
          message = String(errObj)
        }
      }
      setPubError(message)
    } finally { setPublishing(false) }
  }

  function copyLink() {
    navigator.clipboard.writeText(`https://counsellorsofindia.com/${username}`)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col"
      style={{ background: '#FFFCF8', fontFamily: "'Plus Jakarta Sans','Inter',system-ui,sans-serif" }}>

      {/* ── Mobile top bar (shown only on small screens) ── */}
      <div className="lg:hidden shrink-0 flex items-center justify-between px-5 py-3 border-b"
        style={{ borderColor: '#EDE9E4' }}>
        <div className="flex items-center gap-2">
          <Logo size="sm" />
        </div>
        {/* Mobile step pills */}
        <div className="flex items-center gap-1.5">
          {STEPS.map((_, i) => (
            <div key={i} className="transition-all duration-300 rounded-full"
              style={{ width: i === step ? 20 : 7, height: 7, background: i <= step ? BRAND : '#E5E0D9' }} />
          ))}
        </div>
      </div>

      {/* ── Main layout: left sidebar + right content ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left: vertical stepper ── */}
        <VerticalStepper current={step} />

        {/* ── Right: scrollable step content ── */}
        <div className="flex-1 overflow-y-auto">

          {/* ══ STEP 1 — TEMPLATE ══ */}
          {step === 0 && (
            <div className="max-w-5xl mx-auto px-4 sm:px-10 py-4">
              <div className="flex items-center justify-between gap-4 mb-8">
                <div>
                  <h1 className="text-xl sm:text-xl font-bold text-[#1c1c1e]" style={{ letterSpacing: '-0.02em' }}>
                    Choose how your page looks.
                  </h1>
                  <p className="text-[#6b7280] text-xs mt-1">
                    Use the sidebar to switch templates, preview live, then continue.
                  </p>
                </div>
                <button type="button" onClick={() => hasSelectedTemplate && setStep(1)} disabled={!hasSelectedTemplate}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-white text-sm transition hover:opacity-90 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: BRAND }}>
                  Use this template <ArrowRight size={16} />
                </button>
              </div>

              <TemplateLiveSwitcher
                selectedTemplate={selectedTemplate}
                committedTemplate={selectedTemplate}
                isLocked={false}
                lockDateLabel=""
                brandColor={BRAND}
                onSelect={id => setSelectedTemplate(id)}
                onLockedAttempt={() => {}}
                active={selectedTemplate}
                onActiveChange={id => setSelectedTemplate(id)}
                hideTabs={false}
                hideActionBar={false}
                frameHeight={420}
              />
            </div>
          )}

          {/* ══ STEP 2 — PROFILE ══ */}
          {step === 1 && (
            <div className="max-w-5xl mx-auto px-4 sm:px-10 py-10">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-[#1c1c1e]" style={{ letterSpacing: '-0.02em' }}>
                    Tell clients about yourself.
                  </h1>
                  <p className="text-[#6b7280] text-sm mt-1">
                    Fill all fields to unlock publishing.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button type="button" onClick={() => setStep(0)}
                    className="flex items-center gap-1.5 px-6 py-3 rounded-2xl font-semibold text-[#6b7280] bg-white border border-[#E5E0D9] hover:text-[#1c1c1e] hover:border-[#D4C9BF] transition shrink-0">
                    <ChevronLeft size={16} /> Back
                  </button>
                  <button type="button" onClick={() => setStep(2)} disabled={!step2Ready}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-white text-sm transition disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
                    style={{ background: BRAND }}>
                    {step2Ready ? <>Looks good, next <ArrowRight size={16} /></> : 'Looks good, next'}
                  </button>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-[#6b7280]">Profile completion</span>
                  <span className="text-xs font-bold" style={{ color: BRAND }}>{progress}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#EDE9E4] overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: BRAND }} />
                </div>
                {progress < 100 && (
                  <p className="text-xs text-[#9ca3af] mt-1.5">
                    {!name.trim() ? 'Add your name' : !photo ? 'Add your profile photo'
                      : !bio.trim() ? 'Write a short bio' : !fee.trim() ? 'Enter your session fee'
                      : !hasMinService ? 'Add at least one service' : 'Looking good!'}
                  </p>
                )}
              </div>

              <div className="space-y-6">
                {/* Photo */}
                <div>
                  <label className="block text-sm font-semibold text-[#1c1c1e] mb-3">
                    Profile photo <span style={{ color: BRAND }}>*</span>
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="relative shrink-0">
                      <div className="w-20 h-20 rounded-full overflow-hidden border-2 flex items-center justify-center"
                        style={{ borderColor: photo ? BRAND : '#E5E0D9', background: '#F5F0EA' }}>
                        {photo ? <img src={photo} alt="Profile" className="w-full h-full object-cover" /> : <User size={28} style={{ color: '#C4BDB2' }} />}
                      </div>
                      <button type="button" onClick={() => fileRef.current?.click()}
                        className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-white"
                        style={{ background: BRAND }}>
                        <Camera size={12} />
                      </button>
                      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1c1c1e]">{photo ? 'Looking great! ' : 'Upload a clear, friendly photo'}</p>
                      <p className="text-xs text-[#9ca3af] mt-0.5">Clients are 3× more likely to book when they see your face</p>
                      <button type="button" onClick={() => fileRef.current?.click()}
                        className="text-xs font-semibold mt-1.5" style={{ color: BRAND }}>
                        {photo ? 'Change photo' : 'Choose photo →'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-[#1c1c1e] mb-1.5">Full name <span style={{ color: BRAND }}>*</span></label>
                  <input className="w-full h-11 px-4 rounded-xl border border-[#e8e4df] text-sm text-[#1c1c1e] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#FF9933] focus:border-transparent bg-white transition"
                    placeholder="e.g. Dr. Priya Sharma" value={name} onChange={e => setName(e.target.value)} />
                  <p className="text-xs text-[#9ca3af] mt-1">Include your title — clients trust "Dr." or "Counsellor" prefixes</p>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-semibold text-[#1c1c1e] mb-1.5">Bio <span style={{ color: BRAND }}>*</span></label>
                  <textarea rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-[#e8e4df] text-sm text-[#1c1c1e] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#FF9933] focus:border-transparent resize-none bg-white transition"
                    placeholder="I help adults navigate anxiety, burnout, and relationship stress…"
                    value={bio} onChange={e => setBio(e.target.value)} />
                  <p className="text-xs text-[#9ca3af] mt-1">2–4 sentences. Speak directly to the client.</p>
                </div>

                {/* Fee */}
                <div>
                  <label className="block text-sm font-semibold text-[#1c1c1e] mb-1.5">Session fee (₹) <span style={{ color: BRAND }}>*</span></label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af] text-sm">₹</span>
                    <input type="number"
                      className="w-full h-11 pl-8 pr-4 rounded-xl border border-[#e8e4df] text-sm text-[#1c1c1e] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#FF9933] focus:border-transparent bg-white transition"
                      placeholder="1500" value={fee} onChange={e => setFee(e.target.value)} />
                  </div>
                </div>

                {/* Services */}
                <div>
                  <label className="block text-sm font-semibold text-[#1c1c1e] mb-1">Services <span style={{ color: BRAND }}>*</span></label>
                  <p className="text-xs text-[#9ca3af] mb-3">Add at least one service</p>
                  <div className="space-y-2">
                    <div className="hidden sm:grid grid-cols-3 gap-2">
                      {['Service name', 'Duration', 'Price'].map(h => (
                        <p key={h} className="text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af]">{h}</p>
                      ))}
                    </div>
                    {services.map((svc, i) => (
                      <ServiceRow key={i} svc={svc}
                        onChange={u => setServices(s => s.map((x, j) => j === i ? u : x))}
                        onRemove={() => setServices(s => s.filter((_, j) => j !== i))}
                        showRemove={services.length > 1} />
                    ))}
                    <button type="button"
                      onClick={() => setServices(s => [...s, { name: '', duration: '50 min', price: '' }])}
                      className="text-xs font-semibold mt-1" style={{ color: BRAND }}>
                      + Add another service
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══ STEP 3 — PUBLISH ══ */}
          {step === 2 && (
            <div className="max-w-5xl mx-auto px-4 sm:px-10 py-10">
              {!published ? (
                <>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
                    <div className="text-center sm:text-left">
                      <h1 className="text-3xl sm:text-4xl font-bold text-[#1c1c1e] mb-3" style={{ letterSpacing: '-0.02em' }}>
                        Your page is ready.
                      </h1>
                      <p className="text-[#6b7280] text-sm max-w-md mx-auto sm:mx-0">
                        Hit publish and your booking page goes live instantly at:
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
                      <button type="button" onClick={() => setStep(1)}
                        className="flex items-center gap-1.5 px-6 py-3 rounded-2xl font-semibold text-[#6b7280] bg-white border border-[#E5E0D9] hover:text-[#1c1c1e] hover:border-[#D4C9BF] transition">
                        <ChevronLeft size={16} /> Back
                      </button>
                      <button type="button" onClick={handlePublish} disabled={publishing}
                        className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-white text-sm transition disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
                        style={{ background: BRAND }}>
                        {publishing
                          ? <><span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Publishing…</>
                          : <><Sparkles size={18} /> Publish my page →</>}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col items-center text-center gap-6">
                    {/* <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
                      style={{ background: `${BRAND}14` }}>
                      <Sparkles size={36} style={{ color: BRAND }} />
                    </div> */}
                    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border mb-4 text-left w-full max-w-2xl"
                      style={{ background: '#F5F0EA', borderColor: '#E5E0D9' }}>
                      <Globe size={16} style={{ color: BRAND }} />
                      <span className="text-sm font-semibold text-[#1c1c1e] flex-1">{liveUrl}</span>
                    </div>
                    <div className="rounded-2xl border p-5 mb-8 text-left space-y-3 w-full max-w-2xl"
                      style={{ borderColor: '#E5E0D9', background: '#fff' }}>
                      <p className="text-xs font-bold uppercase tracking-widest text-[#9ca3af]">What you're publishing</p>
                      {[
                        { label: 'Template', value: TEMPLATES.find(t => t.id === selectedTemplate)?.name ?? selectedTemplate },
                        { label: 'Name',     value: name },
                        { label: 'Fee',      value: `₹${fee} / session` },
                        { label: 'Services', value: `${services.filter(s => s.name.trim()).length} service(s)` },
                      ].map(row => (
                        <div key={row.label} className="flex items-center justify-between gap-2">
                          <span className="text-xs text-[#9ca3af]">{row.label}</span>
                          <span className="text-sm font-semibold text-[#1c1c1e] flex items-center gap-1.5">
                            <Check size={12} style={{ color: '#22c55e' }} /> {row.value}
                          </span>
                        </div>
                      ))}
                    </div>
                    {pubError && <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-xl mb-4">{pubError}</p>}
                    <p className="text-xs text-[#9ca3af]">Your public page at <strong className='text-[#ff9933]'> {liveUrl}</strong> will update instantly.</p>
                  </div>
                </>
              ) : (
                <div>
                  {/* <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: '#DCFCE7' }}>
                    <CheckCircle size={40} style={{ color: '#16a34a' }} />
                  </div> */}
                  <h1 className="text-3xl sm:text-4xl font-bold text-[#1c1c1e] mb-3" style={{ letterSpacing: '-0.02em' }}>You're live! </h1>
                  <p className="text-[#6b7280] text-sm mb-8">Your booking page is now public. Share your link and start getting clients.</p>

                  <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border mb-4"
                    style={{ background: '#F5F0EA', borderColor: `${BRAND}40` }}>
                    <Globe size={16} style={{ color: BRAND }} />
                    <span className="text-sm font-semibold text-[#1c1c1e] flex-1 text-left truncate">{liveUrl}</span>
                    <button type="button" onClick={copyLink}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition"
                      style={{ background: copied ? '#16a34a' : BRAND }}>
                      {copied ? <><CheckCircle size={12} /> Copied!</> : <><Copy size={12} /> Copy link</>}
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <a href={`/${username}`} target="_blank" rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm border transition hover:bg-[#f5f0ea]"
                      style={{ borderColor: '#E5E0D9', color: '#1c1c1e' }}>
                      <Globe size={15} /> View my page
                    </a>
                    <button type="button" onClick={() => { localStorage.setItem(`coi_just_published_${therapistId}`, '1'); onComplete() }}
                      className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-white text-sm transition hover:opacity-90"
                      style={{ background: BRAND }}>
                      Go to dashboard <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>{/* end right */}
      </div>{/* end main layout */}

      {/* ── Crop modal ── */}
      {cropSrc && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl overflow-hidden shadow-2xl">
            <div className="relative w-full h-72 bg-[#1c1c1e]">
              <Cropper image={cropSrc} crop={crop} zoom={zoom} aspect={1} cropShape="round" showGrid={false}
                onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={(_, a) => setCropArea(a)}
                style={{ cropAreaStyle: { boxShadow: '0 0 0 9999px rgba(28,28,30,0.9)' } }} />
            </div>
            <div className="px-5 py-4 flex justify-end gap-2">
              <button onClick={() => setCropSrc(null)}
                className="px-4 h-10 rounded-lg text-sm font-medium border border-[#e8e4df] text-[#6b7280] hover:bg-[#f5f4f1] transition">Cancel</button>
              <button onClick={applyCrop}
                className="px-4 h-10 rounded-lg text-sm font-medium text-white transition hover:opacity-90"
                style={{ background: BRAND }}>Apply crop</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

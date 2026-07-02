'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import { createClient } from '@/lib/supabase'
import { useTherapist } from '@/lib/useTherapist'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Camera, User, CheckCircle } from 'lucide-react'
import FeedbackManager from '@/components/dashboard/FeedbackManager'
import { State, City } from 'country-state-city'
import Cropper, { type Area } from 'react-easy-crop'

// Crops the selected region of an image (from react-easy-crop pixel area)
// and returns a square JPEG File ready for upload.
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
  ctx.drawImage(
    image,
    area.x, area.y, area.width, area.height,
    0, 0, area.width, area.height,
  )

  const blob = await new Promise<Blob>((resolve) =>
    canvas.toBlob(b => resolve(b!), 'image/jpeg', 0.92)
  )
  return new File([blob], 'profile.jpg', { type: 'image/jpeg' })
}

const SPECIALTIES_LIST = [
  'Anxiety', 'Depression', 'Trauma & PTSD', 'Relationship Issues',
  'Grief & Loss', 'OCD', 'Stress Management', 'Self-Esteem',
  'Burnout', 'Panic Disorders', 'Family Conflict', 'Life Transitions',
  'Anger Management', 'Sleep Issues', 'ADHD', 'Eating Disorders',
]

// All Indian states + their full city lists, from the country-state-city lib.
const IN_STATES = State.getStatesOfCountry('IN')
const STATES_LIST = IN_STATES.map(s => s.name).sort()

// Map a state NAME → its full list of city names (deduped, sorted).
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

// Country dial codes + the exact national number length we expect (digits
// AFTER the country code). Used to validate the WhatsApp / phone field.
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

// Split a stored phone like "+91 9876543210" into { dial, number }.
function splitPhone(stored: string): { dial: string; number: string } {
  const s = (stored ?? '').trim()
  // Longest dial codes first so "+1" doesn't steal "+91".
  const match = [...COUNTRY_CODES].sort((a, b) => b.dial.length - a.dial.length)
    .find(c => s.startsWith(c.dial))
  if (match) return { dial: match.dial, number: s.slice(match.dial.length).replace(/\D/g, '') }
  return { dial: '+91', number: s.replace(/\D/g, '') }
}

export default function SettingsPage() {
  const supabase = createClient()
  const { therapist, loading } = useTherapist()
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    full_name: '',
    title: '',
    bio: '',
    city: '',
    phone: '',
    fee_per_session: '',
    session_duration_mins: '50',
    years_experience: '',
    session_mode: 'both',
    specialties: [] as string[],
    languages: ['English'] as string[],
    instagram: '',
    linkedin: '',
    whatsapp: '',
    website: '',
  })

  // City/State are chosen via dropdowns; the combined "City, State" is stored
  // in the existing `city` field.
  const [stateName, setStateName] = useState('')
  const [cityName, setCityName] = useState('')
  // Lets the user type a specialty not in the preset list.
  const [customSpecialty, setCustomSpecialty] = useState('')
  // Lets the user type a language not in the preset list.
  const [customLanguage, setCustomLanguage] = useState('')
  // WhatsApp / phone split into country dial code + national number.
  const [dialCode, setDialCode] = useState('+91')
  const [phoneNumber, setPhoneNumber] = useState('')

  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)

  // Cropper state — the raw image to crop + pan/zoom + chosen pixel area.
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  // Pre-fill form when therapist loads
  useEffect(() => {
    if (!therapist) return
    setForm({
      full_name:             therapist.full_name ?? '',
      title:                 therapist.title ?? '',
      bio:                   therapist.bio ?? '',
      city:                  therapist.city ?? '',
      phone:                 (therapist as any).phone ?? '',
      fee_per_session:       String(therapist.fee_per_session ?? ''),
      session_duration_mins: String(therapist.session_duration_mins ?? 50),
      years_experience:      String(therapist.years_experience ?? ''),
      session_mode:          therapist.session_mode ?? 'both',
      specialties:           therapist.specialties ?? [],
      languages:             therapist.languages ?? ['English'],
      instagram:             therapist.instagram ?? '',
      linkedin:              therapist.linkedin ?? '',
      whatsapp:              therapist.whatsapp ?? '',
      website:               therapist.website ?? '',
    })
    setPhotoPreview(therapist.photo_url ?? null)

    // Split a stored phone "+91 9876543210" into dial code + national number.
    const { dial, number } = splitPhone((therapist as any).phone ?? '')
    setDialCode(dial)
    setPhoneNumber(number)

    // Split a stored "City, State" back into the two dropdowns.
    const stored = (therapist.city ?? '').trim()
    if (stored) {
      const [c, s] = stored.split(',').map(p => p.trim())
      const matchedState = s && STATES_LIST.includes(s) ? s : ''
      setStateName(matchedState)
      setCityName(c ?? '')
    } else {
      setStateName('')
      setCityName('')
    }
  }, [therapist])

  // When state changes, clear the city if it's not in the new state's list.
  function handleStateChange(s: string) {
    setStateName(s)
    if (!citiesOfState(s).includes(cityName)) setCityName('')
  }

  // City list for the selected state (recomputed only when the state changes).
  const cityOptions = useMemo(() => citiesOfState(stateName), [stateName])

  function addCustomSpecialty() {
    const v = customSpecialty.trim()
    if (!v) return
    setForm(prev =>
      prev.specialties.includes(v)
        ? prev
        : { ...prev, specialties: [...prev.specialties, v] }
    )
    setCustomSpecialty('')
  }

  function addCustomLanguage() {
    const v = customLanguage.trim()
    if (!v) return
    setForm(prev =>
      prev.languages.includes(v)
        ? prev
        : { ...prev, languages: [...prev.languages, v] }
    )
    setCustomLanguage('')
  }

  // Current country's expected national number length (for validation).
  const activeCountry = COUNTRY_CODES.find(c => c.dial === dialCode) ?? COUNTRY_CODES[0]
  const phoneTooShort = phoneNumber.length > 0 && phoneNumber.length !== activeCountry.len

  // Selecting a file opens the crop modal instead of using it directly.
  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setCropSrc(URL.createObjectURL(file))
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    e.target.value = '' // allow re-selecting the same file
  }

  // Confirm the crop → produce the final square image for upload + preview.
  async function applyCrop() {
    if (!cropSrc || !croppedAreaPixels) return
    const file = await getCroppedFile(cropSrc, croppedAreaPixels)
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
    setCropSrc(null)
  }

  function toggleSpecialty(s: string) {
    setForm(prev => ({
      ...prev,
      specialties: prev.specialties.includes(s)
        ? prev.specialties.filter(x => x !== s)
        : [...prev.specialties, s]
    }))
  }

  function toggleLanguage(l: string) {
    setForm(prev => ({
      ...prev,
      languages: prev.languages.includes(l)
        ? prev.languages.filter(x => x !== l)
        : [...prev.languages, l]
    }))
  }

  async function handleSave() {
    if (!therapist) return

    // Validate the phone number length for the chosen country before saving.
    if (phoneNumber && phoneNumber.length !== activeCountry.len) {
      setError(`Enter a valid ${activeCountry.len}-digit number for ${activeCountry.dial}.`)
      return
    }

    setSaving(true)
    setError('')

    try {
      let photo_url = therapist.photo_url

      // Upload new photo if selected
      if (photoFile) {
        const ext = photoFile.name.split('.').pop()
        const path = `${therapist.id}/profile-${Date.now()}.${ext}`

        console.log('Uploading to path:', path)

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(path, photoFile, {
            upsert: true,
          })

        console.log('UPLOAD DATA:', uploadData)
        console.log('UPLOAD ERROR:', uploadError)

        if (uploadError) {
          throw uploadError
        }

        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(path)

        console.log('PUBLIC URL:', urlData)

        photo_url = urlData.publicUrl
      }

      const { error: updateError } = await supabase
        .from('therapists')
        .update({
          full_name:             form.full_name,
          title:                 form.title,
          bio:                   form.bio,
          // Combine the City + State dropdowns into the single city field.
          city:                  [cityName, stateName].filter(Boolean).join(', '),
          phone:                 phoneNumber ? `${dialCode} ${phoneNumber}` : '',
          fee_per_session:       Number(form.fee_per_session),
          session_duration_mins: Number(form.session_duration_mins),
          // "Fresher" is stored as 0 years.
          years_experience:      Number(form.years_experience || 0),
          session_mode:          form.session_mode,
          specialties:           form.specialties,
          languages:             form.languages,
          instagram:             form.instagram || null,
          linkedin:              form.linkedin || null,
          whatsapp:              form.whatsapp || null,
          website:               form.website || null,
          photo_url,
          is_profile_complete:   true,
        })
        .eq('id', therapist.id)

      if (updateError) throw updateError

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)

    } catch (err: any) {
      setError(err.message ?? 'Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-64">
      <div className="animate-spin w-6 h-6 rounded-full border-2
                      border-[#FF9933] border-t-transparent" />
    </div>
  )

  return (
    <div className="p-5 sm:p-8 max-w-2xl">

      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-3xl font-semibold text-[#1c1c1e]"
          style={{ fontFamily: 'var(--font-cormorant), serif' }}
        >
          Profile Settings
        </h1>
        <p className="text-[#6b7280] mt-1 text-sm">
          This is what clients see on your public page.
        </p>
      </div>

      {/* Photo */}
      <div className="flex items-center gap-5 mb-8 p-5
                      bg-[#f2f0ed] rounded-xl border border-[#e8e4df]">
        <div className="relative">
          <div className="w-20 h-20 rounded-full overflow-hidden
                          border-2 border-[#F5D9B0] bg-[#FFEFD9]
                          flex items-center justify-center">
            {photoPreview ? (
              <img src={photoPreview} alt="Profile"
                className="w-full h-full object-cover" />
            ) : (
              <User size={28} className="text-[#FF9933]" />
            )}
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full
                       bg-[#FF9933] flex items-center justify-center
                       hover:bg-[#E07A12] transition"
          >
            <Camera size={12} className="text-white" />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#1c1c1e]">
            Profile photo
          </p>
          <p className="text-xs text-[#6b7280] mt-0.5">
            Shown on your public portfolio page
          </p>
          <button
            onClick={() => fileRef.current?.click()}
            className="text-xs text-[#C46800] font-medium mt-1
                       hover:underline"
          >
            Change photo
          </button>
        </div>
      </div>

      {/* Form fields */}
      <div className="space-y-5">

        <Input
          label="Full name"
          value={form.full_name}
          onChange={e => setForm({ ...form, full_name: e.target.value })}
          placeholder="Dr. Arjun Sharma"
        />

        <Input
          label="Professional title"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
          placeholder="Clinical Psychologist · RCI Licensed"
          hint="Shown below your name on your portfolio"
        />

        <div>
          <label className="block text-sm font-medium
                             text-[#6b7280] mb-1.5">
            Bio
          </label>
          <textarea
            rows={4}
            value={form.bio}
            onChange={e => setForm({ ...form, bio: e.target.value })}
            placeholder="Tell clients about your approach and experience..."
            className="w-full px-4 py-3 rounded-lg border border-[#e8e4df]
                       text-[#1c1c1e] placeholder-[#6b7280] text-sm
                       focus:outline-none focus:ring-2 focus:ring-[#FF9933]
                       focus:border-transparent resize-none transition
                       bg-white"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#6b7280] mb-1.5">
              State
            </label>
            <select
              value={stateName}
              onChange={e => handleStateChange(e.target.value)}
              className="w-full h-11 px-4 rounded-lg border border-[#e8e4df]
                         text-[#1c1c1e] text-sm bg-white
                         focus:outline-none focus:ring-2
                         focus:ring-[#FF9933] focus:border-transparent"
            >
              <option value="">Select state</option>
              {STATES_LIST.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#6b7280] mb-1.5">
              City
            </label>
            <select
              value={cityName}
              onChange={e => setCityName(e.target.value)}
              disabled={!stateName}
              className="w-full h-11 px-4 rounded-lg border border-[#e8e4df]
                         text-[#1c1c1e] text-sm bg-white disabled:bg-[#f5f4f1]
                         disabled:text-[#FF9933]
                         focus:outline-none focus:ring-2
                         focus:ring-[#FF9933] focus:border-transparent"
            >
              <option value="">
                {stateName ? 'Select city' : 'Select a state first'}
              </option>
              {cityOptions.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#6b7280] mb-1.5">
            WhatsApp / Phone
          </label>
          <div className="flex gap-2">
            <select
              value={dialCode}
              onChange={e => {
                const next = e.target.value
                setDialCode(next)
                // Trim the number if it now exceeds the new country's length.
                const max = (COUNTRY_CODES.find(c => c.dial === next) ?? activeCountry).len
                setPhoneNumber(p => p.slice(0, max))
              }}
              className="h-11 px-2 rounded-lg border border-[#e8e4df]
                         text-[#1c1c1e] text-sm bg-white shrink-0
                         focus:outline-none focus:ring-2
                         focus:ring-[#FF9933] focus:border-transparent"
            >
              {COUNTRY_CODES.map(c => (
                <option key={c.code} value={c.dial}>{c.flag} {c.dial}</option>
              ))}
            </select>
            <input
              type="tel"
              inputMode="numeric"
              value={phoneNumber}
              onChange={e => {
                // Keep digits only, capped at this country's expected length.
                const digits = e.target.value.replace(/\D/g, '').slice(0, activeCountry.len)
                setPhoneNumber(digits)
              }}
              placeholder={'9'.repeat(Math.min(activeCountry.len, 10))}
              className={`flex-1 h-11 px-4 rounded-lg border text-[#1c1c1e]
                          placeholder-[#9ca3af] text-sm bg-white
                          focus:outline-none focus:ring-2 focus:border-transparent
                          ${phoneTooShort
                            ? 'border-red-300 focus:ring-red-300'
                            : 'border-[#e8e4df] focus:ring-[#FF9933]'}`}
            />
          </div>
          <p className={`text-xs mt-1 ${phoneTooShort ? 'text-red-500' : 'text-[#9ca3af]'}`}>
            {phoneTooShort
              ? `${activeCountry.dial} needs exactly ${activeCountry.len} digits (${phoneNumber.length}/${activeCountry.len}).`
              : `${activeCountry.dial} requires ${activeCountry.len} digits.`}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Session fee (₹)"
            type="number"
            value={form.fee_per_session}
            onChange={e => setForm({ ...form, fee_per_session: e.target.value })}
            placeholder="1500"
          />
          <div>
            <label className="block text-sm font-medium
                               text-[#6b7280] mb-1.5">
              Session duration
            </label>
            <select
              value={form.session_duration_mins}
              onChange={e => setForm({
                ...form, session_duration_mins: e.target.value
              })}
              className="w-full h-11 px-4 rounded-lg border border-[#e8e4df]
                         text-[#1c1c1e] text-sm bg-white
                         focus:outline-none focus:ring-2
                         focus:ring-[#FF9933] focus:border-transparent"
            >
              {[30, 45, 50, 60, 90].map(d => (
                <option key={d} value={d}>{d} minutes</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#6b7280] mb-1.5">
              Years of experience
            </label>
            <select
              value={form.years_experience}
              onChange={e => setForm({ ...form, years_experience: e.target.value })}
              className="w-full h-11 px-4 rounded-lg border border-[#e8e4df]
                         text-[#1c1c1e] text-sm bg-white
                         focus:outline-none focus:ring-2
                         focus:ring-[#FF9933] focus:border-transparent"
            >
              <option value="0">Fresher</option>
              {Array.from({ length: 40 }, (_, i) => i + 1).map(y => (
                <option key={y} value={y}>{y} {y === 1 ? 'year' : 'years'}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium
                               text-[#6b7280] mb-1.5">
              Session mode
            </label>
            <select
              value={form.session_mode}
              onChange={e => setForm({
                ...form, session_mode: e.target.value
              })}
              className="w-full h-11 px-4 rounded-lg border border-[#e8e4df]
                         text-[#1c1c1e] text-sm bg-white
                         focus:outline-none focus:ring-2
                         focus:ring-[#FF9933] focus:border-transparent"
            >
              <option value="online">Online only</option>
              <option value="offline">In-person only</option>
              <option value="both">Both</option>
            </select>
          </div>
        </div>

        {/* Specialties */}
        <div>
          <label className="block text-sm font-medium
                             text-[#6b7280] mb-3">
            Specialties
            <span className="ml-2 text-xs text-[#FF9933]">
              {form.specialties.length} selected
            </span>
          </label>
          <div className="flex flex-wrap gap-2">
            {SPECIALTIES_LIST.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSpecialty(s)}
                className={`
                  px-3 py-1.5 rounded-full text-xs font-medium
                  border transition
                  ${form.specialties.includes(s)
                    ? 'bg-[#FF9933] text-white border-[#FF9933]'
                    : 'bg-white text-[#6b7280] border-[#e8e4df] hover:border-[#FF9933]'}
                `}
              >
                {s}
              </button>
            ))}

            {/* Custom specialties the user added (not in the preset list) */}
            {form.specialties
              .filter(s => !SPECIALTIES_LIST.includes(s))
              .map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSpecialty(s)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium border
                             bg-[#FF9933] text-white border-[#FF9933]
                             inline-flex items-center gap-1.5"
                  title="Click to remove"
                >
                  {s}
                  <span className="text-white/80">×</span>
                </button>
              ))}
          </div>

          {/* Add your own specialty */}
          <div className="mt-3 flex gap-2">
            <input
              value={customSpecialty}
              onChange={e => setCustomSpecialty(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') { e.preventDefault(); addCustomSpecialty() }
              }}
              placeholder="Add another specialty…"
              className="flex-1 h-10 px-4 rounded-lg border border-[#e8e4df]
                         text-[#1c1c1e] placeholder-[#9ca3af] text-sm bg-white
                         focus:outline-none focus:ring-2 focus:ring-[#FF9933]
                         focus:border-transparent"
            />
            <button
              type="button"
              onClick={addCustomSpecialty}
              disabled={!customSpecialty.trim()}
              className="px-4 h-10 rounded-lg text-sm font-medium border
                         bg-[#FF9933] text-white border-[#FF9933]
                         disabled:opacity-50 disabled:cursor-not-allowed
                         hover:bg-[#E07A12] transition"
            >
              Add
            </button>
          </div>
        </div>

        {/* Languages */}
        <div>
          <label className="block text-sm font-medium
                             text-[#6b7280] mb-3">
            Languages spoken
            <span className="ml-2 text-xs text-[#FF9933]">
              {form.languages.length} selected
            </span>
          </label>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES_LIST.map(l => (
              <button
                key={l}
                type="button"
                onClick={() => toggleLanguage(l)}
                className={`
                  px-3 py-1.5 rounded-full text-xs font-medium
                  border transition
                  ${form.languages.includes(l)
                    ? 'bg-[#FF9933] text-white border-[#FF9933]'
                    : 'bg-white text-[#6b7280] border-[#e8e4df] hover:border-[#FF9933]'}
                `}
              >
                {l}
              </button>
            ))}

            {/* Custom languages the user added (not in the preset list) */}
            {form.languages
              .filter(l => !LANGUAGES_LIST.includes(l))
              .map(l => (
                <button
                  key={l}
                  type="button"
                  onClick={() => toggleLanguage(l)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium border
                             bg-[#FF9933] text-white border-[#FF9933]
                             inline-flex items-center gap-1.5"
                  title="Click to remove"
                >
                  {l}
                  <span className="text-white/80">×</span>
                </button>
              ))}
          </div>

          {/* Add your own language */}
          <div className="mt-3 flex gap-2">
            <input
              value={customLanguage}
              onChange={e => setCustomLanguage(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') { e.preventDefault(); addCustomLanguage() }
              }}
              placeholder="Add another language…"
              className="flex-1 h-10 px-4 rounded-lg border border-[#e8e4df]
                         text-[#1c1c1e] placeholder-[#9ca3af] text-sm bg-white
                         focus:outline-none focus:ring-2 focus:ring-[#FF9933]
                         focus:border-transparent"
            />
            <button
              type="button"
              onClick={addCustomLanguage}
              disabled={!customLanguage.trim()}
              className="px-4 h-10 rounded-lg text-sm font-medium border
                         bg-[#FF9933] text-white border-[#FF9933]
                         disabled:opacity-50 disabled:cursor-not-allowed
                         hover:bg-[#E07A12] transition"
            >
              Add
            </button>
          </div>
        </div>

        {/* Social Media Links */}
        <div>
          <label className="block text-sm font-medium text-[#6b7280] mb-3">
            Social & contact links
          </label>
          <div className="space-y-3">

            {/* Instagram */}
            <div className="flex items-center gap-3 h-11 px-4 rounded-lg border border-[#e8e4df] bg-white focus-within:ring-2 focus-within:ring-[#FF9933] focus-within:border-transparent transition">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E1306C" strokeWidth="1.8" className="shrink-0">
                <rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/>
              </svg>
              <input
                value={form.instagram}
                onChange={e => setForm({ ...form, instagram: e.target.value })}
                placeholder="instagram.com/yourhandle or @handle"
                className="flex-1 text-sm text-[#1c1c1e] placeholder-[#9ca3af] bg-transparent outline-none"
              />
            </div>

            {/* LinkedIn */}
            <div className="flex items-center gap-3 h-11 px-4 rounded-lg border border-[#e8e4df] bg-white focus-within:ring-2 focus-within:ring-[#FF9933] focus-within:border-transparent transition">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#0077B5" className="shrink-0">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                <rect x="2" y="9" width="4" height="12"/>
                <circle cx="4" cy="4" r="2"/>
              </svg>
              <input
                value={form.linkedin}
                onChange={e => setForm({ ...form, linkedin: e.target.value })}
                placeholder="linkedin.com/in/yourprofile"
                className="flex-1 text-sm text-[#1c1c1e] placeholder-[#9ca3af] bg-transparent outline-none"
              />
            </div>

            {/* WhatsApp */}
            <div className="flex items-center gap-3 h-11 px-4 rounded-lg border border-[#e8e4df] bg-white focus-within:ring-2 focus-within:ring-[#FF9933] focus-within:border-transparent transition">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366" className="shrink-0">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
              </svg>
              <input
                value={form.whatsapp}
                onChange={e => setForm({ ...form, whatsapp: e.target.value })}
                placeholder="+91 98765 43210"
                className="flex-1 text-sm text-[#1c1c1e] placeholder-[#9ca3af] bg-transparent outline-none"
              />
            </div>

            {/* Website */}
            <div className="flex items-center gap-3 h-11 px-4 rounded-lg border border-[#e8e4df] bg-white focus-within:ring-2 focus-within:ring-[#FF9933] focus-within:border-transparent transition">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.8" className="shrink-0">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              <input
                value={form.website}
                onChange={e => setForm({ ...form, website: e.target.value })}
                placeholder="https://yourwebsite.com"
                className="flex-1 text-sm text-[#1c1c1e] placeholder-[#9ca3af] bg-transparent outline-none"
              />
            </div>

          </div>
          <p className="text-xs text-[#9ca3af] mt-2">These appear in the footer of your public profile page.</p>
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-600 bg-red-50
                        px-4 py-2 rounded-lg">
            {error}
          </p>
        )}



        {/* Save */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            onClick={handleSave}
            loading={saving}
            fullWidth
          >
            {saved
              ? <><CheckCircle size={15} className="mr-2" /> Saved!</>
              : 'Save Profile'}
          </Button>
        </div>

        {saved && (
          <p className="text-xs text-center text-[#C46800]">
            Your public page has been updated.{' '}

          <a    href={`/${(therapist as any)?.username}`}
              target="_blank"
              className="underline font-medium"
            >
              View it →
            </a>
          </p>
        )}

        {therapist?.id && <FeedbackManager therapistId={therapist.id} />}

      </div>

      {/* ── Image crop modal (pan / zoom, like Instagram) ── */}
      {cropSrc && (
        <div className="fixed inset-0 z-10000 flex items-center justify-center
                        bg-black/70 p-4">
          <div className="w-full max-w-md bg-white overflow-hidden rounded-2xl overflow-hidden shadow-2xl">
            <div className="relative w-full h-72 overflow-hidden bg-[#1c1c1e]">
              <Cropper
                image={cropSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, areaPixels) => setCroppedAreaPixels(areaPixels)}
                style={{
                  cropAreaStyle: {
                    boxShadow: '0 0 0 9999px rgba(28,28,30,0.9)',
                  },
                }}
              />
            </div>

            <div className="px-5 py-4 flex items-center gap-3">
            </div>

            <div className="px-5 pb-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCropSrc(null)}
                className="px-4 h-10 rounded-lg text-sm font-medium border
                           border-[#e8e4df] text-[#6b7280] hover:bg-[#f5f4f1] transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={applyCrop}
                className="px-4 h-10 rounded-lg text-sm font-medium
                           bg-[#FF9933] text-white hover:bg-[#E07A12] transition"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

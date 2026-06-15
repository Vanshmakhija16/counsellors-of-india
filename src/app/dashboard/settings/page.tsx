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
  })

  // City/State are chosen via dropdowns; the combined "City, State" is stored
  // in the existing `city` field.
  const [stateName, setStateName] = useState('')
  const [cityName, setCityName] = useState('')
  // Lets the user type a specialty not in the preset list.
  const [customSpecialty, setCustomSpecialty] = useState('')

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
    })
    setPhotoPreview(therapist.photo_url ?? null)

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
    setSaving(true)
    setError('')

    try {
      let photo_url = therapist.photo_url

      // Upload new photo if selected
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
          phone:                 form.phone,
          fee_per_session:       Number(form.fee_per_session),
          session_duration_mins: Number(form.session_duration_mins),
          years_experience:      Number(form.years_experience),
          session_mode:          form.session_mode,
          specialties:           form.specialties,
          languages:             form.languages,
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
                      border-[#a3b8b4] border-t-transparent" />
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
                          border-2 border-[#b8ceca] bg-[#d4e4e1]
                          flex items-center justify-center">
            {photoPreview ? (
              <img src={photoPreview} alt="Profile"
                className="w-full h-full object-cover" />
            ) : (
              <User size={28} className="text-[#a3b8b4]" />
            )}
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full
                       bg-[#a3b8b4] flex items-center justify-center
                       hover:bg-[#7d9e99] transition"
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
            className="text-xs text-[#5a7f7a] font-medium mt-1
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
                       focus:outline-none focus:ring-2 focus:ring-[#a3b8b4]
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
                         focus:ring-[#a3b8b4] focus:border-transparent"
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
                         disabled:text-[#a3b8b4]
                         focus:outline-none focus:ring-2
                         focus:ring-[#a3b8b4] focus:border-transparent"
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="WhatsApp / Phone"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
            placeholder="9876543210"
          />
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
                         focus:ring-[#a3b8b4] focus:border-transparent"
            >
              {[30, 45, 50, 60, 90].map(d => (
                <option key={d} value={d}>{d} minutes</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Years of experience"
            type="number"
            value={form.years_experience}
            onChange={e => setForm({
              ...form, years_experience: e.target.value
            })}
            placeholder="5"
          />
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
                         focus:ring-[#a3b8b4] focus:border-transparent"
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
            <span className="ml-2 text-xs text-[#a3b8b4]">
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
                    ? 'bg-[#a3b8b4] text-white border-[#a3b8b4]'
                    : 'bg-white text-[#6b7280] border-[#e8e4df] hover:border-[#a3b8b4]'}
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
                             bg-[#a3b8b4] text-white border-[#a3b8b4]
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
                         text-[#1c1c1e] placeholder-[#a3b8b4] text-sm bg-white
                         focus:outline-none focus:ring-2 focus:ring-[#a3b8b4]
                         focus:border-transparent"
            />
            <button
              type="button"
              onClick={addCustomSpecialty}
              disabled={!customSpecialty.trim()}
              className="px-4 h-10 rounded-lg text-sm font-medium border
                         bg-[#3e4645] text-white border-[#a3b8b4]
                         disabled:opacity-50 disabled:cursor-not-allowed
                         hover:bg-[#92a8a4] transition"
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
                    ? 'bg-[#1c1c1e] text-white border-[#1c1c1e]'
                    : 'bg-white text-[#6b7280] border-[#e8e4df] hover:border-[#a3b8b4]'}
                `}
              >
                {l}
              </button>
            ))}
          </div>
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
          <p className="text-xs text-center text-[#5a7f7a]">
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
          <div className="w-full max-w-md bg-white rounded-2xl overflow-hidden shadow-2xl">
            <div className="px-5 py-4 border-b border-[#e8e4df]">
              <p className="text-sm font-semibold text-[#1c1c1e]">Adjust your photo</p>
              <p className="text-xs text-[#6b7280] mt-0.5">Drag to move · pinch or use the slider to zoom</p>
            </div>

            <div className="relative w-full h-72 bg-[#1c1c1e]">
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
              />
            </div>

            <div className="px-5 py-4 flex items-center gap-3">
              <span className="text-xs text-[#6b7280]">Zoom</span>
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={e => setZoom(Number(e.target.value))}
                className="flex-1 accent-[#a3b8b4]"
              />
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
                           bg-[#a3b8b4] text-white hover:bg-[#7d9e99] transition"
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
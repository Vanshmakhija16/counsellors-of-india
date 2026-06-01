'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { useTherapist } from '@/lib/useTherapist'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Camera, User, CheckCircle } from 'lucide-react'
import FeedbackManager from '@/components/dashboard/FeedbackManager'

const SPECIALTIES_LIST = [
  'Anxiety', 'Depression', 'Trauma & PTSD', 'Relationship Issues',
  'Grief & Loss', 'OCD', 'Stress Management', 'Self-Esteem',
  'Burnout', 'Panic Disorders', 'Family Conflict', 'Life Transitions',
  'Anger Management', 'Sleep Issues', 'ADHD', 'Eating Disorders',
]

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

  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
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
  }, [therapist])

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
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
          city:                  form.city,
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
          placeholder="Dr. Priya Sharma"
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
          <Input
            label="City"
            value={form.city}
            onChange={e => setForm({ ...form, city: e.target.value })}
            placeholder="Mumbai"
          />
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
    </div>
  )
}
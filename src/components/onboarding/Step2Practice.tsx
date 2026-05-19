'use client'

import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { X, Plus } from 'lucide-react'

interface Props {
  data: any
  onChange: (data: any) => void
  onNext: () => void
  onBack: () => void
}

const SUGGESTED_SPECIALTIES = [
  'Anxiety', 'Depression', 'Trauma & PTSD', 'Relationship Issues',
  'Grief & Loss', 'OCD', 'Stress Management', 'Self-Esteem',
  'Burnout', 'Panic Disorders', 'Family Conflict', 'Life Transitions',
  'Anger Management', 'Sleep Issues', 'ADHD', 'Eating Disorders',
]

const LANGUAGES = ['English', 'Hindi', 'Marathi', 'Tamil', 'Telugu',
  'Kannada', 'Bengali', 'Gujarati', 'Punjabi', 'Malayalam']

const SESSION_MODES = [
  { id: 'online', label: 'Online only', desc: 'Video calls via Zoom / Meet' },
  { id: 'offline', label: 'In-person only', desc: 'At your clinic or office' },
  { id: 'both', label: 'Both', desc: 'Client chooses' },
]

export default function Step2Practice({ data, onChange, onNext, onBack }: Props) {
  const [error, setError] = useState('')
  const specialties: string[] = data.specialties ?? []
  const languages: string[] = data.languages ?? ['English']

  function toggleSpecialty(s: string) {
    const updated = specialties.includes(s)
      ? specialties.filter(x => x !== s)
      : [...specialties, s]
    onChange({ ...data, specialties: updated })
  }

  function toggleLanguage(l: string) {
    const updated = languages.includes(l)
      ? languages.filter(x => x !== l)
      : [...languages, l]
    onChange({ ...data, languages: updated })
  }

  function handleNext() {
    if (specialties.length === 0) {
      setError('Select at least one specialty')
      return
    }
    if (!data.fee_per_session) {
      setError('Session fee is required')
      return
    }
    setError('')
    onNext()
  }

  return (
    <div className="space-y-7">

      {/* Specialties */}
      <div>
        <label className="block text-sm font-medium text-[#6b7280] mb-3">
          Areas of speciality
          <span className="ml-2 text-xs text-[#a3b8b4]">
            {specialties.length} selected
          </span>
        </label>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_SPECIALTIES.map(s => (
            <button
              key={s}
              onClick={() => toggleSpecialty(s)}
              className={`
                px-3 py-1.5 rounded-full text-xs font-medium border transition
                ${specialties.includes(s)
                  ? 'bg-[#a3b8b4] text-white border-[#a3b8b4]'
                  : 'bg-white text-[#6b7280] border-[#e8e4df] hover:border-[#a3b8b4]'}
              `}
            >
              {specialties.includes(s) ? '✓ ' : ''}{s}
            </button>
          ))}
        </div>
      </div>

      {/* Languages */}
      <div>
        <label className="block text-sm font-medium text-[#6b7280] mb-3">
          Languages spoken
        </label>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map(l => (
            <button
              key={l}
              onClick={() => toggleLanguage(l)}
              className={`
                px-3 py-1.5 rounded-full text-xs font-medium border transition
                ${languages.includes(l)
                  ? 'bg-[#2d4a47] text-white border-[#2d4a47]'
                  : 'bg-white text-[#6b7280] border-[#e8e4df] hover:border-[#a3b8b4]'}
              `}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Fee + Duration */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Session fee (₹)"
          type="number"
          placeholder="1500"
          value={data.fee_per_session || ''}
          onChange={e => onChange({ ...data, fee_per_session: Number(e.target.value) })}
          hint="What you charge per session"
        />
        <div>
          <label className="block text-sm font-medium text-[#6b7280] mb-1.5">
            Session duration
          </label>
          <select
            value={data.session_duration_mins || 50}
            onChange={e => onChange({ ...data, session_duration_mins: Number(e.target.value) })}
            className="w-full h-11 px-4 rounded-lg border border-[#e8e4df]
                       text-[#1c1c1e] text-sm bg-white
                       focus:outline-none focus:ring-2 focus:ring-[#a3b8b4]
                       focus:border-transparent transition"
          >
            {[30, 45, 50, 60, 90].map(d => (
              <option key={d} value={d}>{d} minutes</option>
            ))}
          </select>
        </div>
      </div>

      {/* Years experience */}
      <Input
        label="Years of experience"
        type="number"
        placeholder="5"
        value={data.years_experience || ''}
        onChange={e => onChange({ ...data, years_experience: Number(e.target.value) })}
      />

      {/* Session mode */}
      <div>
        <label className="block text-sm font-medium text-[#6b7280] mb-3">
          Session mode
        </label>
        <div className="grid grid-cols-3 gap-3">
          {SESSION_MODES.map(mode => (
            <button
              key={mode.id}
              onClick={() => onChange({ ...data, session_mode: mode.id })}
              className={`
                p-4 rounded-xl border text-left transition
                ${data.session_mode === mode.id
                  ? 'border-[#a3b8b4] bg-[#d4e4e1] text-[#2d4a47]'
                  : 'border-[#e8e4df] bg-white text-[#6b7280] hover:border-[#a3b8b4]'}
              `}
            >
              <p className="text-xs font-semibold mb-1">{mode.label}</p>
              <p className="text-xs opacity-70">{mode.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-sm text-[#b07d7d] bg-red-50 px-4 py-2 rounded-lg">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          ← Back
        </Button>
        <Button onClick={handleNext} className="flex-2 flex-grow">
          Continue to Availability →
        </Button>
      </div>
    </div>
  )
}
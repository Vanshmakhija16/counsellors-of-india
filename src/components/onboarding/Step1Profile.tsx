'use client'

import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Camera, User } from 'lucide-react'

interface Props {
  data: any
  onChange: (data: any) => void
  onNext: () => void
}

export default function Step1Profile({ data, onChange, onNext }: Props) {
  const [preview, setPreview] = useState<string | null>(data.photo_url || null)
  const [error, setError] = useState('')

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreview(url)
    onChange({ ...data, photo_file: file, photo_url: url })
  }

  function handleNext() {
    if (!data.full_name?.trim()) {
      setError('Full name is required')
      return
    }
    if (!data.title?.trim()) {
      setError('Your professional title is required')
      return
    }
    setError('')
    onNext()
  }

  return (
    <div className="space-y-6">

      {/* Photo upload */}
      <div className="flex flex-col items-center gap-3 mb-2">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-[#d4e4e1] border-2 border-[#b8ceca]
                          flex items-center justify-center overflow-hidden">
            {preview ? (
              <img src={preview} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User size={32} className="text-[#a3b8b4]" />
            )}
          </div>
          <label className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full
                            bg-[#a3b8b4] flex items-center justify-center
                            cursor-pointer hover:bg-[#7d9e99] transition">
            <Camera size={14} className="text-white" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </label>
        </div>
        <p className="text-xs text-[#6b7280]">Upload your professional photo</p>
      </div>

      {/* Fields */}
      <Input
        label="Full name"
        type="text"
        placeholder="Dr. Priya Sharma"
        value={data.full_name || ''}
        onChange={e => onChange({ ...data, full_name: e.target.value })}
      />

      <Input
        label="Professional title"
        type="text"
        placeholder="Clinical Psychologist · RCI Licensed"
        value={data.title || ''}
        onChange={e => onChange({ ...data, title: e.target.value })}
        hint="This appears below your name on your public profile"
      />

      <Input
        label="City"
        type="text"
        placeholder="Mumbai, Maharashtra"
        value={data.city || ''}
        onChange={e => onChange({ ...data, city: e.target.value })}
      />

      <div>
        <label className="block text-sm font-medium text-[#6b7280] mb-1.5">
          Bio
        </label>
        <textarea
          rows={4}
          placeholder="Tell clients about your approach, experience, and what makes your practice unique..."
          value={data.bio || ''}
          onChange={e => onChange({ ...data, bio: e.target.value })}
          className="w-full px-4 py-3 rounded-lg border border-[#e8e4df]
                     text-[#1c1c1e] placeholder-[#6b7280] text-sm
                     focus:outline-none focus:ring-2 focus:ring-[#a3b8b4]
                     focus:border-transparent resize-none transition"
        />
        <p className="text-xs text-[#6b7280] mt-1">
          {data.bio?.length ?? 0}/500 characters
        </p>
      </div>

      {error && (
        <p className="text-sm text-[#b07d7d] bg-red-50 px-4 py-2 rounded-lg">
          {error}
        </p>
      )}

      <Button fullWidth onClick={handleNext}>
        Continue to Practice Details →
      </Button>
    </div>
  )
}
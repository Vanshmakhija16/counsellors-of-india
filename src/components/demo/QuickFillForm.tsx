'use client'

import { useRef, useState } from 'react'
import { Camera, User } from 'lucide-react'
import type { DemoProfile } from '@/lib/demoSession'
import { DEMO_PLACEHOLDERS } from '@/lib/demoSession'

interface Props {
  demo: DemoProfile
  /** Accent color of the active template — used for focus rings / highlights. */
  theme?: string
  /** Patch a field on the demo — parent persists + re-renders the canvas. */
  onChange: (patch: Partial<DemoProfile>) => void
  /** Skip the form and keep using the sample data as-is. */
  onSkip?: () => void
}

export default function QuickFillForm({ demo, theme = '#5a7f7a', onChange, onSkip }: Props) {
  const fileRef = useRef<HTMLInputElement | null>(null)
  const [focused, setFocused] = useState<string | null>(null)
  // Keep specialties as raw text while typing so commas/spaces survive; only
  // split into an array on change. Seeded once from whatever was saved.
  const [specialtiesText, setSpecialtiesText] = useState(() => (demo.specialties ?? []).join(', '))

  function handleSpecialties(value: string) {
    setSpecialtiesText(value)
    onChange({ specialties: value.split(',').map(s => s.trim()).filter(Boolean) })
  }

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    onChange({ photo_url: URL.createObjectURL(file) })
  }

  // Field wrapper that lights up its border + label in the theme color on focus.
  function fieldStyle(name: string): React.CSSProperties {
    return focused === name
      ? { borderColor: theme, boxShadow: `0 0 0 3px ${theme}22` }
      : {}
  }
  const baseField =
    'w-full px-3.5 rounded-xl border border-[#e6e1d8] text-[#1c1c1e] placeholder-[#b6b0a8] text-sm bg-white outline-none transition'

  function Label({ name, children, hint }: { name: string; children: React.ReactNode; hint?: string }) {
    return (
      <label className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wide transition-colors"
          style={{ color: focused === name ? theme : '#9a9488' }}>
          {children}
        </span>
        {hint && <span className="text-[10px] text-[#bdb6aa] normal-case font-normal tracking-normal">{hint}</span>}
      </label>
    )
  }

  return (
    <div className="space-y-5">
      {/* Photo */}
      <div className="flex items-center gap-3.5">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center relative group shrink-0 transition"
          style={{ background: `${theme}1a`, boxShadow: `0 0 0 2px ${theme}3a` }}
        >
          {demo.photo_url
            ? <img src={demo.photo_url} alt="" className="w-full h-full object-cover" />
            : <User size={22} style={{ color: theme }} />}
          <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
            <Camera size={16} className="text-white" />
          </div>
        </button>
        <div className="text-xs">
          <p className="font-semibold text-[#1c1c1e]">Profile photo</p>
          <p className="text-[#9a9488]">{demo.photo_url ? 'Looks great ✓' : 'Optional — tap to add'}</p>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
      </div>

      <div>
        <Label name="full_name">Your name</Label>
        <input className={`${baseField} h-11`} style={fieldStyle('full_name')}
          onFocus={() => setFocused('full_name')} onBlur={() => setFocused(null)}
          value={demo.full_name ?? ''} placeholder={DEMO_PLACEHOLDERS.full_name}
          onChange={e => onChange({ full_name: e.target.value })} />
      </div>

      <div>
        <Label name="title">Credentials</Label>
        <input className={`${baseField} h-11`} style={fieldStyle('title')}
          onFocus={() => setFocused('title')} onBlur={() => setFocused(null)}
          value={demo.title ?? ''} placeholder={DEMO_PLACEHOLDERS.title}
          onChange={e => onChange({ title: e.target.value })} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label name="city">City</Label>
          <input className={`${baseField} h-11`} style={fieldStyle('city')}
            onFocus={() => setFocused('city')} onBlur={() => setFocused(null)}
            value={demo.city ?? ''} placeholder={DEMO_PLACEHOLDERS.city}
            onChange={e => onChange({ city: e.target.value })} />
        </div>
        <div>
          <Label name="fee">Fee (₹)</Label>
          <input className={`${baseField} h-11`} type="number" inputMode="numeric" style={fieldStyle('fee')}
            onFocus={() => setFocused('fee')} onBlur={() => setFocused(null)}
            value={demo.fee ?? ''} placeholder={String(DEMO_PLACEHOLDERS.fee)}
            onChange={e => onChange({ fee: e.target.value === '' ? undefined : Number(e.target.value) })} />
        </div>
      </div>

      <div>
        <Label name="bio">Short bio</Label>
        <textarea
          className={`${baseField} py-2.5 leading-relaxed resize-none`}
          style={fieldStyle('bio')}
          rows={3}
          onFocus={() => setFocused('bio')} onBlur={() => setFocused(null)}
          value={demo.bio ?? ''}
          placeholder={DEMO_PLACEHOLDERS.bio}
          onChange={e => onChange({ bio: e.target.value })}
        />
      </div>

      <div>
        <Label name="specialties" hint="comma separated">Specialties</Label>
        <input className={`${baseField} h-11`} style={fieldStyle('specialties')}
          onFocus={() => setFocused('specialties')} onBlur={() => setFocused(null)}
          value={specialtiesText} placeholder="Anxiety, Relationships, Trauma"
          onChange={e => handleSpecialties(e.target.value)} />
        {/* Live specialty chips */}
        {(demo.specialties?.length ?? 0) > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {demo.specialties!.slice(0, 8).map((s, i) => (
              <span key={i} className="text-[11px] px-2.5 py-1 rounded-full font-medium"
                style={{ background: `${theme}14`, color: theme }}>
                {s}
              </span>
            ))}
          </div>
        )}
      </div>

      {onSkip && (
        <button type="button" onClick={onSkip}
          className="text-xs text-[#9ca3af] hover:text-[#6b7280] underline underline-offset-2 transition">
          Skip &amp; use demo data
        </button>
      )}
    </div>
  )
}

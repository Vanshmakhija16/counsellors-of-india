'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import {
  Clock, Check, Plus, Trash2, Copy,
  CalendarOff, ChevronDown, Info,
  Sun, Sunset, Moon, Save,
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────
interface TimeRange { start: string; end: string }
interface DaySchedule { enabled: boolean; ranges: TimeRange[] }
type WeekSchedule = Record<string, DaySchedule>
export interface DateException {
  date: string
  type: 'off' | 'custom'
  ranges?: TimeRange[]
}
export interface AvailabilityData {
  duration: number
  schedule: WeekSchedule
  buffer?: number
  exceptions?: DateException[]
}

// ── Constants ──────────────────────────────────────────────────────────────
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const DURATION_OPTIONS = [
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 50, label: '50 minutes' },
  { value: 60, label: '1 hour' },
  { value: 75, label: '1 hr 15 min' },
  { value: 90, label: '1 hr 30 min' },
]
const BUFFER_OPTIONS = [
  { value: 0,  label: 'No buffer' },
  { value: 5,  label: '5 minutes' },
  { value: 10, label: '10 minutes' },
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
]

const DEFAULT_SCHEDULE: WeekSchedule = {
  Monday:    { enabled: true,  ranges: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }] },
  Tuesday:   { enabled: true,  ranges: [{ start: '09:00', end: '13:00' }] },
  Wednesday: { enabled: true,  ranges: [{ start: '14:00', end: '18:00' }] },
  Thursday:  { enabled: true,  ranges: [{ start: '09:00', end: '17:00' }] },
  Friday:    { enabled: true,  ranges: [{ start: '10:00', end: '15:00' }] },
  Saturday:  { enabled: false, ranges: [] },
  Sunday:    { enabled: false, ranges: [] },
}

const BRAND       = '#FF9933'
const BRAND_DARK  = '#C46800'
const BRAND_LIGHT = '#FFF7EE'
const BRAND_BDR   = '#F5D9B0'

// ── Slot generator ─────────────────────────────────────────────────────────
export function generateSlots(ranges: TimeRange[], durationMin: number, bufferMin = 0): string[] {
  const slots: string[] = []
  const step = durationMin + bufferMin
  for (const range of ranges) {
    const [startH, startM] = range.start.split(':').map(Number)
    const [endH,   endM  ] = range.end.split(':').map(Number)
    let cur = startH * 60 + startM
    const end = endH * 60 + endM
    while (cur + durationMin <= end) {
      const h = Math.floor(cur / 60), m = cur % 60
      const ampm = h >= 12 ? 'PM' : 'AM'
      const dh = h > 12 ? h - 12 : h === 0 ? 12 : h
      slots.push(`${dh}:${m.toString().padStart(2, '0')} ${ampm}`)
      cur += step
    }
  }
  return slots
}

// ── Shared primitives ──────────────────────────────────────────────────────
function Dropdown({ value, onChange, options }: {
  value: number
  onChange: (v: number) => void
  options: { value: number; label: string }[]
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full appearance-none h-10 pl-3 pr-9 rounded-xl border border-[#e8e4df]
          bg-white text-sm font-medium text-[#1c1c1e] focus:outline-none
          focus:ring-2 focus:ring-[#FF993340] transition cursor-pointer"
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] pointer-events-none" />
    </div>
  )
}

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      role="switch"
      aria-checked={on}
      className="w-10 h-[22px] rounded-full transition-all relative shrink-0 focus:outline-none focus:ring-2 focus:ring-[#FF993340]"
      style={{ background: on ? BRAND : '#e5e7eb' }}
    >
      <span
        className="absolute top-[2px] w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-all"
        style={{ left: on ? '20px' : '2px' }}
      />
    </button>
  )
}

function ColHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="px-5 py-4 border-b border-[#f0ece8]">
      <p className="text-sm font-bold text-[#1c1c1e]">{title}</p>
      <p className="text-xs text-[#9ca3af] mt-0.5">{subtitle}</p>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────
export default function AvailabilitySettings() {
  const supabase = createClient()
  const [schedule,   setSchedule]   = useState<WeekSchedule>(DEFAULT_SCHEDULE)
  const [duration,   setDuration]   = useState(50)
  const [buffer,     setBuffer]     = useState(0)
  const [exceptions, setExceptions] = useState<DateException[]>([])
  const [activeDay,  setActiveDay]  = useState('Monday')
  const [saving,     setSaving]     = useState(false)
  const [saved,      setSaved]      = useState(false)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')
  const [dirty,      setDirty]      = useState(false)
  const [infoOpen,   setInfoOpen]   = useState(false)

  // ── Load ────────────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      const { data } = await supabase
        .from('therapists')
        .select('availability, session_duration_mins, availability_buffer_mins, availability_exceptions')
        .eq('id', user.id).single()
      if (data?.availability) {
        const av = data.availability as AvailabilityData
        setSchedule(av.schedule ?? DEFAULT_SCHEDULE)
        setDuration(av.duration ?? data.session_duration_mins ?? 50)
        setBuffer((data as any).availability_buffer_mins ?? av.buffer ?? 0)
        setExceptions((data as any).availability_exceptions ?? av.exceptions ?? [])
      } else if (data?.session_duration_mins) {
        setDuration(data.session_duration_mins)
      }
      setLoading(false)
    }
    load()
  }, [])

  function mark() { setDirty(true) }

  // ── Schedule mutations ──────────────────────────────────────────────────
  function toggleDay(day: string) {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled: !prev[day].enabled,
        ranges: prev[day].ranges.length === 0 ? [{ start: '09:00', end: '17:00' }] : prev[day].ranges,
      }
    }))
    mark()
  }

  function updateRange(day: string, i: number, field: 'start' | 'end', val: string) {
    setSchedule(prev => {
      const ranges = [...prev[day].ranges]
      ranges[i] = { ...ranges[i], [field]: val }
      return { ...prev, [day]: { ...prev[day], ranges } }
    })
    mark()
  }

  function addRange(day: string) {
    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], ranges: [...prev[day].ranges, { start: '09:00', end: '13:00' }] }
    }))
    mark()
  }

  function removeRange(day: string, i: number) {
    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], ranges: prev[day].ranges.filter((_, j) => j !== i) }
    }))
    mark()
  }

  function copyToAllDays() {
    const src = schedule[activeDay]
    setSchedule(prev => Object.fromEntries(
      DAYS.map(d => [d, d === activeDay ? prev[d] : structuredClone(src)])
    ))
    mark()
  }

  // ── Exceptions ──────────────────────────────────────────────────────────
  function addException(type: 'off' | 'custom') {
    const today = new Date().toISOString().slice(0, 10)
    setExceptions(prev => [...prev,
      type === 'off'
        ? { date: today, type: 'off' }
        : { date: today, type: 'custom', ranges: [{ start: '10:00', end: '14:00' }] }
    ])
    mark()
  }

  function updateException(i: number, patch: Partial<DateException>) {
    setExceptions(prev => prev.map((e, idx) => idx === i ? { ...e, ...patch } : e))
    mark()
  }

  function updateExceptionRange(i: number, field: 'start' | 'end', val: string) {
    setExceptions(prev => prev.map((e, idx) => {
      if (idx !== i) return e
      const ranges = e.ranges?.length ? [...e.ranges] : [{ start: '10:00', end: '14:00' }]
      ranges[0] = { ...ranges[0], [field]: val }
      return { ...e, ranges }
    }))
    mark()
  }

  function removeException(i: number) {
    setExceptions(prev => prev.filter((_, idx) => idx !== i))
    mark()
  }

  // ── Save ────────────────────────────────────────────────────────────────
  async function handleSave() {
    setSaving(true); setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not logged in')
      const availability: AvailabilityData = { duration, schedule, buffer, exceptions }
      const { error: dbErr } = await supabase.from('therapists').update({
        availability,
        session_duration_mins: duration,
        availability_buffer_mins: buffer,
        availability_exceptions: exceptions,
      }).eq('id', user.id)
      if (dbErr) throw dbErr
      setDirty(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err: any) {
      setError(err.message ?? 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  // ── Derived ─────────────────────────────────────────────────────────────
  const previewSlots = generateSlots(schedule[activeDay]?.ranges ?? [], duration, buffer)
  const enabledDays  = Object.values(schedule).filter(d => d.enabled).length
  const totalSlots   = Object.values(schedule).filter(d => d.enabled)
    .reduce((a, d) => a + generateSlots(d.ranges, duration, buffer).length, 0)

  const slotGroups = [
    { label: 'Morning',   Icon: Sun,    slots: previewSlots.filter(s => { const h = parseInt(s); const pm = s.includes('PM'); return !pm || (pm && h === 12) }) },
    { label: 'Afternoon', Icon: Sunset, slots: previewSlots.filter(s => { const h = parseInt(s); return s.includes('PM') && h >= 1 && h < 5 }) },
    { label: 'Evening',   Icon: Moon,   slots: previewSlots.filter(s => { const h = parseInt(s); return s.includes('PM') && h >= 5 }) },
  ].filter(g => g.slots.length > 0)

  if (loading) return (
    <div className="flex items-center justify-center min-h-64 p-8">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#FF9933] border-t-transparent animate-spin" />
        <p className="text-sm text-[#9ca3af]">Loading your schedule…</p>
      </div>
    </div>
  )

  return (
    <div className="-mx-5 sm:-mx-8 -my-8 min-h-screen bg-[#faf9f7]">

      {/* ── Sticky header ──────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-white border-b border-[#ede9e4] px-6 py-3.5 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-bold text-[#1c1c1e]">Availability</h1>
          <p className="text-xs text-[#9ca3af] mt-0.5">
            {enabledDays} active day{enabledDays !== 1 ? 's' : ''} · {totalSlots} weekly slots
          </p>
        </div>
        <div className="flex items-center gap-2">
          {dirty && (
            <span className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
              Unsaved
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !dirty}
            className="flex items-center gap-2 h-9 px-5 rounded-xl text-sm font-bold text-white transition disabled:opacity-50"
            style={{ background: saved ? '#16a34a' : BRAND }}
          >
            {saving
              ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : saved ? <Check size={14} /> : <Save size={14} />}
            {saved ? 'Saved!' : 'Save changes'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-4 px-4 py-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
          {error}
        </div>
      )}

      {/* ── 3-column grid ──────────────────────────────────────────────── */}
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

          {/* ══ COLUMN 1 — Session settings ═══════════════════════════════ */}
          <div className="bg-white rounded-2xl border border-[#ede9e4] overflow-hidden">
            <ColHeader
              title="Session settings"
              subtitle=""
            />
            <div className="p-5 space-y-5">

              {/* Duration */}
              <div>
                <label className="block text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-2">
                  Session duration
                </label>
                <Dropdown
                  value={duration}
                  onChange={v => { setDuration(v); mark() }}
                  options={DURATION_OPTIONS}
                />
                {/* <p className="text-xs text-[#9ca3af] mt-1.5">
                  Slots are generated at this interval on your booking page.
                </p> */}
              </div>

              {/* Buffer */}
              <div>
                <label className="block text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-2">
                  Buffer between sessions
                </label>
                <Dropdown
                  value={buffer}
                  onChange={v => { setBuffer(v); mark() }}
                  options={BUFFER_OPTIONS}
                />
                {/* <p className="text-xs text-[#9ca3af] mt-1.5">
                  Hidden from clients — used for notes, breaks, or travel time.
                </p> */}
              </div>

              {/* Live summary */}
              <div className="rounded-xl border border-[#F5D9B0] bg-[#FFF7EE] p-4 space-y-2">
                {[
                  { label: 'Each session',  value: `${duration} min` },
                  { label: 'Buffer',        value: buffer > 0 ? `${buffer} min` : 'None' },
                  { label: 'Total weekly',  value: `${totalSlots} slots` },
                  { label: 'Active days',   value: `${enabledDays} days` },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between text-xs">
                    <span className="text-[#9A5200]">{row.label}</span>
                    <span className="font-bold text-[#C46800]">{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Time off & exceptions ── inside col 1 below settings */}
              <div className="pt-1">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-[#1c1c1e] uppercase tracking-wider">Time off & exceptions</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => addException('off')}
                      className="flex items-center gap-1 text-[10px] font-semibold h-7 px-2.5 rounded-lg border transition"
                      style={{ borderColor: '#e8e4df', color: '#6b7280', background: 'white' }}
                    >
                      <CalendarOff size={11} /> Day off
                    </button>
                    <button
                      onClick={() => addException('custom')}
                      className="flex items-center gap-1 text-[10px] font-semibold h-7 px-2.5 rounded-lg border transition"
                      style={{ borderColor: BRAND_BDR, color: BRAND_DARK, background: BRAND_LIGHT }}
                    >
                      <Plus size={11} /> Custom
                    </button>
                  </div>
                </div>

                {exceptions.length === 0 ? (
                  <p className="text-xs text-[#9ca3af] text-center py-4 border border-dashed border-[#e8e4df] rounded-xl">
                    No exceptions, weekly schedule applies to every date
                  </p>
                ) : (
                  <div className="space-y-2">
                    {exceptions.map((ex, i) => (
                      <div key={i} className="rounded-xl border border-[#e8e4df] bg-[#faf9f7] p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="date"
                            value={ex.date}
                            onChange={e => updateException(i, { date: e.target.value })}
                            className="flex-1 h-8 px-2 rounded-lg border border-[#e8e4df] text-xs text-[#1c1c1e]
                              focus:outline-none focus:ring-2 focus:ring-[#FF993340] bg-white transition"
                          />
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                            ex.type === 'off' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-[#FFF7EE] text-[#C46800] border border-[#F5D9B0]'
                          }`}>
                            {ex.type === 'off' ? 'Day off' : 'Custom'}
                          </span>
                          <button onClick={() => removeException(i)} className="text-[#d1d5db] hover:text-red-400 transition shrink-0">
                            <Trash2 size={13} />
                          </button>
                        </div>
                        {ex.type === 'custom' && (
                          <div className="flex items-center gap-2">
                            <input type="time" value={ex.ranges?.[0]?.start ?? '10:00'}
                              onChange={e => updateExceptionRange(i, 'start', e.target.value)}
                              className="h-8 px-2 rounded-lg border border-[#e8e4df] text-xs text-[#1c1c1e] focus:outline-none focus:ring-2 focus:ring-[#FF993340] bg-white w-24" />
                            <span className="text-[#9ca3af] text-xs">to</span>
                            <input type="time" value={ex.ranges?.[0]?.end ?? '14:00'}
                              onChange={e => updateExceptionRange(i, 'end', e.target.value)}
                              className="h-8 px-2 rounded-lg border border-[#e8e4df] text-xs text-[#1c1c1e] focus:outline-none focus:ring-2 focus:ring-[#FF993340] bg-white w-24" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ══ COLUMN 2 — Working days & hours ═══════════════════════════ */}
          <div className="bg-white rounded-2xl border border-[#ede9e4] overflow-hidden">
            <ColHeader
              title="Working days & hours"
              subtitle=""
            />

            {/* Day list */}
            <div className="divide-y divide-[#f5f3f0]">
              {DAYS.map((day, di) => {
                const ds = schedule[day]
                const on = ds?.enabled
                const isActive = activeDay === day
                const slotCount = on ? generateSlots(ds.ranges, duration, buffer).length : 0

                return (
                  <div key={day}>
                    {/* Day row — click to expand */}
                  <div
  role="button"
  tabIndex={0}
  onClick={() => setActiveDay(day)}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setActiveDay(day);
    }
  }}
  className="w-full flex items-center gap-3 px-5 py-3.5 text-left transition hover:bg-[#faf9f7] cursor-pointer"
  style={isActive ? { background: BRAND_LIGHT } : {}}
>
  <Toggle on={!!on} onChange={() => toggleDay(day)} />

  <span className="flex-1 text-[14px] font-semibold" style={{ color: on ? '#1c1c1e' : '#9ca3af' }}>
  {DAY_SHORT[di]}
  </span>

  {on && slotCount > 0 && (
    <span className="text-[11px] font-medium shrink-0" style={{ color: BRAND_DARK }}>
                      {slotCount} slots
                    </span>
                  )}

                  {isActive && (
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: BRAND }}
                    />
                  )}
</div>

                    {/* Expanded time editor — only for active day */}
                    {isActive && on && (
                      <div className="px-5 pb-4 pt-1 space-y-2" style={{ background: BRAND_LIGHT }}>
                        {ds.ranges.map((range, ri) => (
                          <div key={ri} className="flex items-center gap-2 bg-white rounded-xl px-3 py-2.5 border border-[#F5D9B0]">
                            <Clock size={13} className="text-[#c4bdb2] shrink-0" />
                            <input
                              type="time"
                              value={range.start}
                              onChange={e => updateRange(day, ri, 'start', e.target.value)}
                              className="h-8 px-2 rounded-lg border border-[#e8e4df] text-xs text-[#1c1c1e]
                                focus:outline-none focus:ring-2 focus:ring-[#FF993340] bg-white w-[88px] transition"
                            />
                            <span className="text-[#9ca3af] text-xs">–</span>
                            <input
                              type="time"
                              value={range.end}
                              onChange={e => updateRange(day, ri, 'end', e.target.value)}
                              className="h-8 px-2 rounded-lg border border-[#e8e4df] text-xs text-[#1c1c1e]
                                focus:outline-none focus:ring-2 focus:ring-[#FF993340] bg-white w-[79px] transition"
                            />
                            {/* <span className="text-[4px] font-medium ml-auto shrink-0" style={{ color: BRAND_DARK }}>
                              {generateSlots([range], duration, buffer).length}
                            </span> */}
                            {ds.ranges.length > 1 && (
                              <button onClick={() => removeRange(day, ri)} className="text-[#d1d5db] hover:text-red-400 transition shrink-0">
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        ))}
                        <div className="flex items-center gap-3 pt-1">
                          <button
                            onClick={() => addRange(day)}
                            className="flex items-center gap-1.5 text-xs font-semibold h-7 px-3 rounded-lg border transition"
                            style={{ borderColor: BRAND_BDR, color: BRAND_DARK, background: 'white' }}
                          >
                            <Plus size={11} /> Add range
                          </button>
                          <button
                            onClick={copyToAllDays}
                            className="flex items-center gap-1.5 text-xs font-medium transition hover:underline"
                            style={{ color: BRAND_DARK }}
                          >
                            <Copy size={11} /> Copy to all days
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Active day is off */}
                    {isActive && !on && (
                      <div className="px-5 pb-4 pt-2" style={{ background: BRAND_LIGHT }}>
                        <button
                          onClick={() => toggleDay(day)}
                          className="text-xs font-semibold h-7 px-3 rounded-lg transition"
                          style={{ background: BRAND, color: '#fff' }}
                        >
                          Enable {day}
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* ══ COLUMN 3 — Slot preview ════════════════════════════════════ */}
          <div className="bg-white rounded-2xl border border-[#ede9e4] overflow-hidden">
            <ColHeader
              title={`Slots: ${activeDay}`}
              subtitle={""}
            />

            <div className="p-5">
              {!schedule[activeDay]?.enabled ? (
                <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-[#f5f4f1] flex items-center justify-center mb-1">
                    <CalendarOff size={20} className="text-[#c4bdb2]" />
                  </div>
                  <p className="text-sm font-medium text-[#6b7280]">{activeDay} is off</p>
                  <p className="text-xs text-[#9ca3af]">Enable this day in column 2 to see slots</p>
                </div>
              ) : previewSlots.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-[#f5f4f1] flex items-center justify-center mb-1">
                    <Clock size={20} className="text-[#c4bdb2]" />
                  </div>
                  <p className="text-sm font-medium text-[#6b7280]">No slots generated</p>
                  <p className="text-xs text-[#9ca3af]">Your time range may be too short for a {duration}-min session</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {slotGroups.map(group => (
                    <div key={group.label}>
                      <div className="flex items-center gap-1.5 mb-2 text-[10px] font-semibold text-[#9ca3af] uppercase tracking-wider">
                        <group.Icon size={11} />
                        {group.label}
                        <span className="ml-auto font-normal">{group.slots.length}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {group.slots.map(slot => (
                          <div
                            key={slot}
                            className="h-9 rounded-xl text-[11px] font-semibold flex items-center justify-center border"
                            style={{ background: BRAND_LIGHT, color: BRAND_DARK, borderColor: BRAND_BDR }}
                          >
                            {slot}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* <p className="text-[11px] text-[#9ca3af] pt-2 border-t border-[#f0ece8]">
                    These are the exact slots clients see when they visit your booking page on a {activeDay}.
                  </p> */}
                </div>
              )}
            </div>

            {/* How it works — collapsible at the bottom of col 3 */}
            <div className="border-t border-[#f0ece8]">
              <button
                onClick={() => setInfoOpen(o => !o)}
                className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-[#faf9f7] transition"
              >
                <div className="flex items-center gap-2">
                  <Info size={13} className="text-[#9ca3af]" />
                  <span className="text-xs font-semibold text-[#6b7280]">How this works</span>
                </div>
                <ChevronDown size={13} className={`text-[#9ca3af] transition-transform ${infoOpen ? 'rotate-180' : ''}`} />
              </button>
              {infoOpen && (
                <div className="px-5 pb-4 space-y-2 text-[11px] text-[#6b7280] leading-relaxed">
                  <p>Your booking page shows the next 14 days with real slots based on this schedule.</p>
                  <p>When a client books a slot it's automatically removed so no double-bookings happen.</p>
                  <p>Buffer time is invisible to clients, the gap is handled automatically.</p>
                  <p>Date exceptions override the weekly schedule for that one date only.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ── Sticky bottom save bar ─────────────────────────────────────── */}
      {dirty && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30">
          <div className="flex items-center gap-3 bg-[#1c1c1e] text-white px-5 py-3 rounded-2xl shadow-2xl">
            <span className="text-sm">Unsaved changes</span>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 h-8 px-4 rounded-xl text-sm font-bold transition disabled:opacity-60"
              style={{ background: BRAND }}
            >
              {saving
                ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <Save size={13} />}
              Save now
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

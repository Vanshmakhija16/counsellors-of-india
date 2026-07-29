'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Country } from 'country-state-city'
import { ChevronDown, Search, Check } from 'lucide-react'

export interface CountryCodeSelectProps {
  /** Currently selected ISO 3166-1 alpha-2 code, e.g. 'IN', 'US'. */
  value: string
  onChange: (isoCode: string, dialCode: string) => void
  className?: string
}

// Loaded once per module (not per render) — this is a static ~250-row list,
// no need to recompute it on every mount.
const ALL_COUNTRIES = Country.getAllCountries()
  .filter(c => c.phonecode) // a handful of entries have no dial code
  .sort((a, b) => a.name.localeCompare(b.name))

function dialCodeOf(isoCode: string): string {
  const c = ALL_COUNTRIES.find(c => c.isoCode === isoCode)
  if (!c) return ''
  // Some entries already include the '+', some don't — normalize.
  return c.phonecode.startsWith('+') ? c.phonecode : `+${c.phonecode}`
}

export { dialCodeOf }

/**
 * Country dial-code picker for phone number fields — flag + code shown on
 * the trigger, full searchable list (by country name or dial code) in the
 * dropdown. Defaults to whichever ISO code the tenant config passes in as
 * `value` (see signup page), but the person can search and pick any of the
 * ~195 countries.
 */
export default function CountryCodeSelect({ value, onChange, className = '' }: CountryCodeSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  // Captured once on mount — the tenant's own default country (e.g. 'US' on
  // the America portal) pinned to the top of the list, even after the
  // person picks something else. Deliberately NOT re-derived from the
  // current `value`, or picking any country would keep re-sorting the list
  // underneath the person as they browse.
  const pinnedIsoRef = useRef(value)

  const selected = ALL_COUNTRIES.find(c => c.isoCode === value) ?? ALL_COUNTRIES.find(c => c.isoCode === 'US')!

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const base = !q
      ? ALL_COUNTRIES
      : ALL_COUNTRIES.filter(c =>
          c.name.toLowerCase().includes(q) ||
          c.phonecode.replace('+', '').includes(q.replace('+', ''))
        )
    // Pin the tenant's default country to the top of the unfiltered list
    // only — once someone's actively searching, plain relevance order (as
    // typed) makes more sense than a pinned item breaking the flow.
    if (q) return base
    const pinned = base.find(c => c.isoCode === pinnedIsoRef.current)
    if (!pinned) return base
    return [pinned, ...base.filter(c => c.isoCode !== pinnedIsoRef.current)]
  }, [query])

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 0)
    else setQuery('')
  }, [open])

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`h-10 flex items-center gap-2 pl-3 pr-2.5 rounded-xl border text-sm text-[#1c1c1e] font-semibold shrink-0 transition-colors ${
          open
            ? 'border-[#FF9933] bg-white ring-2 ring-[#FF9933]/30'
            : 'border-[#e8e4df] bg-[#f7f5f2] hover:bg-[#f0ede8] hover:border-[#ddd6c9]'
        }`}
      >
        <span className="text-lg leading-none">{selected.flag}</span>
        <span className="tabular-nums">{dialCodeOf(selected.isoCode)}</span>
        <ChevronDown size={14} className={`text-[#9a9188] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 mt-2 w-72 max-h-80 flex flex-col bg-white rounded-2xl border border-[#e8e4df] shadow-[0_20px_50px_-20px_rgba(31,28,24,0.35)] overflow-hidden">
          <div className="p-2.5 border-b border-[#ede9e4] shrink-0">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search country or code"
                className="w-full h-9 pl-8 pr-3 rounded-lg border border-[#e8e4df] bg-[#FAFAF8] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF9933]/40 focus:bg-white transition-colors"
              />
            </div>
          </div>
          <ul role="listbox" className="flex-1 overflow-y-auto py-1.5">
            {filtered.length === 0 ? (
              <li className="px-3 py-4 text-xs text-[#9ca3af] text-center">No matches</li>
            ) : (
              filtered.map(c => (
                <li key={c.isoCode}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={c.isoCode === selected.isoCode}
                    onClick={() => { onChange(c.isoCode, dialCodeOf(c.isoCode)); setOpen(false) }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 mx-1 rounded-lg text-sm text-left transition-colors ${
                      c.isoCode === selected.isoCode ? 'bg-[#FFF3E0]' : 'hover:bg-[#FAF8F5]'
                    }`}
                    style={{ width: 'calc(100% - 8px)' }}
                  >
                    <span className="text-lg leading-none shrink-0">{c.flag}</span>
                    <span className={`flex-1 min-w-0 truncate ${c.isoCode === selected.isoCode ? 'font-semibold text-[#1F1C18]' : 'text-[#1c1c1e]'}`}>{c.name}</span>
                    <span className="text-xs text-[#9a9188] tabular-nums shrink-0">{dialCodeOf(c.isoCode)}</span>
                    {c.isoCode === selected.isoCode && <Check size={14} className="text-[#E07A12] shrink-0" strokeWidth={2.5} />}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

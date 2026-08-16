'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { normalizeSpecialtyKey, titleCaseLabel } from '@/lib/specialties'
import SiteNavbar from '@/components/layout/SiteNavbar'
import '../page.css'

const AVP = [
  { bg: '#F0EDE8', t: '#3a3a30' }, { bg: '#EBE8E4', t: '#3a3a30' },
  { bg: '#EDE9E2', t: '#13140F' }, { bg: '#E8E5E0', t: '#3a3a30' },
  { bg: '#EEEBE6', t: '#13140F' }, { bg: '#EAE7E2', t: '#3a3a30' },
]

// Kept in sync with the homepage's own hidden list — these usernames/names
// never appear in either the homepage teaser or this full directory.
const HIDDEN_THERAPISTS = ['ayush', 'harsh']

function handleCardTiltMove(e: React.MouseEvent<HTMLAnchorElement>) {
  const card = e.currentTarget
  const rect = card.getBoundingClientRect()
  const px = (e.clientX - rect.left) / rect.width - 0.5
  const py = (e.clientY - rect.top) / rect.height - 0.5
  card.style.transition = 'transform .12s ease-out'
  card.style.transform = `perspective(900px) rotateX(${(-py * 9)}deg) rotateY(${(px * 9)}deg) translateY(-4px) scale(1.015)`
}
function handleCardTiltLeave(e: React.MouseEvent<HTMLAnchorElement>) {
  const card = e.currentTarget
  card.style.transition = 'transform .45s cubic-bezier(.22,.87,.36,1)'
  card.style.transform = ''
}

export default function TherapistsDirectoryPage() {
  const [therapists, setTherapists] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetch('/api/public/therapists', { cache: 'no-store' })
      .then(async r => {
        const ct = r.headers.get('content-type') ?? ''
        if (!r.ok || !ct.includes('application/json')) return { therapists: [] }
        return r.json().catch(() => ({ therapists: [] }))
      })
      .then(d => setTherapists((d.therapists ?? []).filter((t: any) => t.username)))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const visibleTherapists = useMemo(() => {
    const list = therapists.filter((t: any) => {
      const uname = (t.username || '').toLowerCase()
      const fname = (t.full_name || t.name || '').toLowerCase()
      return !HIDDEN_THERAPISTS.some(h => uname === h || uname.includes(h) || fname.includes(h))
    })
    // Pro-plan therapists surface first (stable sort keeps everyone else in
    // their existing, newest-first order beneath them).
    return [...list].sort((a: any, b: any) => (b.plan === 'pro' ? 1 : 0) - (a.plan === 'pro' ? 1 : 0))
  }, [therapists])

  const filtered = useMemo(() => {
    let list = visibleTherapists
    const q = search.trim().toLowerCase()
    if (q) list = list.filter((t: any) => [t.full_name, t.title, t.city, ...(t.specialties ?? [])].join(' ').toLowerCase().includes(q))
    if (filter === 'online') list = list.filter((t: any) => t.session_mode === 'online' || t.session_mode === 'both')
    else if (filter === 'in-person') list = list.filter((t: any) => t.session_mode === 'offline' || t.session_mode === 'both')
    else if (filter !== 'all') list = list.filter((t: any) => (t.specialties ?? []).some((s: string) => normalizeSpecialtyKey(s) === filter))
    return list
  }, [visibleTherapists, search, filter])

  const dynamicFilters = useMemo(() => {
    const counts = new Map<string, { label: string; count: number }>()
    visibleTherapists.forEach((t: any) => {
      ;(t.specialties ?? []).forEach((raw: string) => {
        if (!raw || !raw.trim()) return
        const key = normalizeSpecialtyKey(raw)
        const existing = counts.get(key)
        if (existing) existing.count += 1
        else counts.set(key, { label: titleCaseLabel(raw), count: 1 })
      })
    })
    const specialtyChips = [...counts.entries()].map(([key, v]) => ({ key, label: v.label, count: v.count })).sort((a, b) => b.count - a.count)
    const onlineCount = visibleTherapists.filter((t: any) => t.session_mode === 'online' || t.session_mode === 'both').length
    const inPersonCount = visibleTherapists.filter((t: any) => t.session_mode === 'offline' || t.session_mode === 'both').length
    const modeChips = [
      ...(onlineCount > 0 ? [{ key: 'online', label: 'Online', count: onlineCount }] : []),
      ...(inPersonCount > 0 ? [{ key: 'in-person', label: 'In-person', count: inPersonCount }] : []),
    ]
    return [{ key: 'all', label: 'All', count: visibleTherapists.length }, ...specialtyChips, ...modeChips]
  }, [visibleTherapists])

  return (
    <div className="pg">
      <style>{`
        .pg{ background: var(--surf-2); } /* match the therapist-card area's near-white tone across the whole page, instead of the deeper beige --bg used elsewhere */
        .tdp-hero { max-width: 760px;  margin: 8px auto 0; padding: 0 clamp(20px,5vw,40px); text-align: center; }
        .tdp-hero h1 {
          font-family: 'Fraunces','Instrument Serif', Georgia, serif; font-weight: 500;
          font-size: clamp(32px, 5vw, 48px); color: #1F1C18; margin: 0 0 10px; letter-spacing: -0.01em;
        }
        .tdp-hero p { font-family: 'Inter', system-ui, sans-serif; font-size: 15px; color: #6E685F; margin: 0; }
      `}</style>

      <SiteNavbar />

      <div className="tdp-hero" style={{ marginTop: 'clamp(90px, 12vw, 120px)' }}>
        <h1>All Practitioners</h1>
        <p>{loading ? 'Loading practitioners…' : ` Therapists and counsellors across India.`}</p>
      </div>

      <section className="td-section sec-rise" style={{ paddingTop: 'clamp(1.5rem,3vw,2.5rem)' }}>
        <div className="td-bg-aura" aria-hidden="true" />
        <div className="td-wrap">
          <div className="td-filter-bar">
            <div className="td-search">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                placeholder="Search by name, city, specialty..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                aria-label="Search therapists"
              />
            </div>
            <div className="td-chips">
              {dynamicFilters.map(f => (
                <button key={f.key} type="button" className={`td-chip ${filter === f.key ? 'on' : ''}`} onClick={() => setFilter(f.key)}>{f.label}</button>
              ))}
            </div>
          </div>

          <div className="td-grid">
            {loading
              ? Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="td-card td-card-skel">
                    <div className="td-card-skel-top">
                      <div className="sk" style={{ width: 60, height: 60, borderRadius: 14 }} />
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div className="sk" style={{ height: 18, width: '60%' }} />
                        <div className="sk" style={{ height: 11, width: '40%' }} />
                      </div>
                    </div>
                    <div className="sk" style={{ height: 1, marginTop: 18 }} />
                    <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
                      <div className="sk" style={{ height: 20, width: 64, borderRadius: 999 }} />
                      <div className="sk" style={{ height: 20, width: 80, borderRadius: 999 }} />
                    </div>
                  </div>
                ))
              : filtered.length === 0
                ? (
                    <div className="td-empty">
                      <div className="td-empty-icon" aria-hidden="true">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="7"/>
                          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                      </div>
                      <div className="td-empty-t">No therapists match your filters.</div>
                      <div className="td-empty-s">Try a different city or specialty - our network is growing every week.</div>
                      <button type="button" className="td-empty-reset" onClick={() => { setSearch(''); setFilter('all') }}>Reset filters</button>
                    </div>
                  )
                : filtered.map((t: any, idx: number) => {
                    const name = t.full_name || t.name || 'Therapist'
                    const photo = t.photo_url || ''
                    const role = t.title || t.qualification || ''
                    const city = t.city || t.location || ''
                    const specs: string[] = t.specialties || t.specializations || []
                    const fee = t.fee_per_session ?? null
                    const exp = t.experience || 0
                    const mode = t.session_mode || ''
                    const modeLabel = mode === 'online' ? 'Online' : mode === 'offline' ? 'In-person' : mode === 'both' ? 'Online & In-person' : ''
                    const init = name.split(' ').filter((w: string) => !/^(dr|mr|mrs|ms|prof)\.?$/i.test(w)).map((w: string) => w[0]).slice(0, 2).join('').toUpperCase() || '?'
                    return (
                      <a key={`${t.id || name}-${idx}`} href={t.username ? `/${t.username}` : '#'} className="td-card" onMouseMove={handleCardTiltMove} onMouseLeave={handleCardTiltLeave}>
                        <div className="td-card-glow" aria-hidden="true" />
                        <div className="td-card-top">
                          <div className="td-card-av">
                            {photo ? <img src={photo} alt={name} loading="lazy" /> : <span>{init}</span>}
                            <span className="td-card-verified" title="Verified therapist">
                              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                            </span>
                          </div>
                          <div className="td-card-id">
                            <div className="td-card-name">{name}</div>
                            {role && <div className="td-card-role">{role}</div>}
                            {city && (
                              <div className="td-card-loc">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                  <circle cx="12" cy="10" r="3"/>
                                </svg>
                                {city}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="td-card-tags">
                          {specs.slice(0, 3).map(s => (<span key={s} className="td-card-tag">{s}</span>))}
                          {specs.length === 0 && <span className="td-card-tag td-card-tag-muted">General practice</span>}
                        </div>

                        <div className="td-card-foot">
                          <div className="td-card-meta">
                            {exp > 0 && <span>{exp}+ yrs</span>}
                            {exp > 0 && modeLabel && <span className="td-card-meta-sep" />}
                            {modeLabel && <span>{modeLabel}</span>}
                          </div>
                          {fee != null && fee > 0 && (
                            <div className="td-card-fee">
                              <span className="td-card-fee-n">₹{fee.toLocaleString('en-IN')}</span>
                              <span className="td-card-fee-l">/ session</span>
                            </div>
                          )}
                        </div>

                        <span className="td-card-arrow" aria-hidden="true">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="7" y1="17" x2="17" y2="7"/>
                            <polyline points="7 7 17 7 17 17"/>
                          </svg>
                        </span>
                      </a>
                    )
                  })
            }
          </div>
        </div>
      </section>
    </div>
  )
}

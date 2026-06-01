'use client'

import type { TemplateId } from '@/lib/template'

// ──────────────────────────────────────────────────────────────────────────
// Animated mini thumbnail for each template. Extracted from the appearance
// page so the /try demo switcher and the dashboard share one set of previews.
// ──────────────────────────────────────────────────────────────────────────

export default function TemplateThumbnail({ id, accent, bg, color }: {
  id: TemplateId; accent: string; bg: string; color: string; selected?: boolean
}) {
  const c = color // active brand color

  if (id === 'classic') return (
    <div className="w-full h-full flex flex-col" style={{ background: bg, fontFamily: 'Georgia, serif' }}>
      {/* Nav */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-black/10">
        <div className="w-14 h-2 rounded-full" style={{ background: '#1a1a18' }} />
        <div className="w-8 h-1.5 rounded-full" style={{ background: c }} />
      </div>
      {/* Hero */}
      <div className="flex-1 px-3 pt-3 flex gap-2">
        <div className="flex-1">
          <div className="w-8 h-1 rounded mb-1.5" style={{ background: c }} />
          <div className="w-full h-3 rounded mb-1" style={{ background: '#1a1a18' }} />
          <div className="w-4/5 h-3 rounded mb-2" style={{ background: '#1a1a18' }} />
          <div className="w-full h-1.5 rounded mb-1 opacity-50" style={{ background: '#6b6056' }} />
          <div className="w-4/5 h-1.5 rounded opacity-50" style={{ background: '#6b6056' }} />
          <div className="mt-3 flex gap-1.5">
            <div className="h-5 w-16 rounded-full" style={{ background: '#1a1a18' }} />
            <div className="h-5 w-12 rounded-full border" style={{ borderColor: '#1a1a18' }} />
          </div>
        </div>
        <div className="w-14 h-16 rounded-full overflow-hidden flex-shrink-0" style={{ background: '#d8c9b0' }}>
          <div className="w-full h-full" style={{ background: `radial-gradient(circle at 40% 30%, ${c}40, transparent 70%)` }} />
        </div>
      </div>
      {/* Services strip */}
      <div className="px-3 pb-2 pt-2 flex gap-1.5">
        {[0,1,2].map(i => (
          <div key={i} className="flex-1 rounded-lg p-1.5" style={{ background: 'rgba(180,107,80,0.08)', border: `1px solid ${c}30` }}>
            <div className="w-full h-1 rounded mb-1" style={{ background: c, opacity: 0.5 }} />
            <div className="w-4/5 h-1 rounded" style={{ background: '#1a1a18', opacity: 0.3 }} />
          </div>
        ))}
      </div>
    </div>
  )

  if (id === 'classic2') return (
    <div className="w-full h-full flex flex-col" style={{ background: bg }}>
      <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: '#2a2f33' }}>
        <div className="w-5 h-5 border flex items-center justify-center text-[8px] italic" style={{ borderColor: accent, color: accent }}>E</div>
        <div className="flex gap-2">
          {[0,1,2].map(i => <div key={i} className="w-5 h-1 rounded" style={{ background: '#2a2f33' }} />)}
        </div>
      </div>
      <div className="px-3 pt-3 flex-1">
        <div className="w-6 h-0.5 mb-2" style={{ background: accent }} />
        <div className="w-full h-4 rounded mb-1" style={{ background: '#ece5d7', opacity: 0.15 }} />
        <div className="w-3/4 h-4 rounded mb-2" style={{ background: accent, opacity: 0.7 }} />
        <div className="w-full h-1 rounded mb-1" style={{ background: '#2a2f33' }} />
        <div className="w-4/5 h-1 rounded" style={{ background: '#2a2f33' }} />
        <div className="mt-3 h-6 w-20 rounded" style={{ background: accent }} />
      </div>
      <div className="px-3 pb-2 grid grid-cols-2 gap-1">
        {[0,1,2,3].map(i => (
          <div key={i} className="p-1.5 rounded" style={{ background: '#12161a', border: `1px solid ${accent}25` }}>
            <div className="w-4 h-0.5 mb-1" style={{ background: accent }} />
            <div className="w-full h-1 rounded" style={{ background: '#2a2f33' }} />
          </div>
        ))}
      </div>
    </div>
  )

  if (id === 'classic3') return (
    <div className="w-full h-full flex flex-col" style={{ background: bg }}>
      <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: `1px solid ${accent}30` }}>
        <div className="w-5 h-5 border" style={{ borderColor: accent }} />
        <div className="text-[7px] font-medium" style={{ letterSpacing: '0.15em', color: accent }}>ATELIER</div>
        <div className="w-12 h-5 rounded-full border" style={{ borderColor: '#1a1612' }} />
      </div>
      <div className="flex-1 px-3 pt-2 flex gap-2">
        <div className="flex-1">
          <div className="w-full h-0.5 mb-2" style={{ background: `${accent}40` }} />
          <div className="w-full h-4 rounded-sm mb-1" style={{ background: '#1a1612', opacity: 0.85 }} />
          <div className="w-2/3 h-4 rounded-sm mb-2" style={{ background: accent, opacity: 0.6 }} />
          <div className="w-full h-1 rounded mb-1 opacity-40" style={{ background: '#8b6f47' }} />
          <div className="w-4/5 h-1 rounded opacity-40" style={{ background: '#8b6f47' }} />
        </div>
      </div>
      <div className="px-3 pb-2 flex gap-1">
        {[0,1,2,3].map(i => (
          <div key={i} className="flex-1 p-1 rounded" style={{ background: `${accent}12`, border: `0.5px solid ${accent}30` }}>
            <div className="text-[6px] mb-0.5" style={{ color: accent }}>0{i+1}</div>
            <div className="w-full h-1 rounded" style={{ background: '#1a1612', opacity: 0.4 }} />
          </div>
        ))}
      </div>
    </div>
  )

  if (id === 'classic4') return (
    <div className="w-full h-full flex flex-col" style={{ background: bg }}>
      <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: `0.5px solid ${accent}30` }}>
        <div className="w-5 h-5 border text-[8px] italic flex items-center justify-center" style={{ borderColor: accent, color: accent }}>P</div>
        <div className="h-0.5 flex-1 mx-2" style={{ background: `${accent}30` }} />
        <div className="w-12 h-4 rounded-full border" style={{ borderColor: accent, background: 'transparent' }}>
          <div className="text-[5px] text-center leading-4" style={{ color: accent }}>BOOK</div>
        </div>
      </div>
      {/* Quote hero */}
      <div className="px-3 py-2 flex-1">
        <div className="text-[18px] leading-none mb-1" style={{ color: `${accent}50` }}>&ldquo;</div>
        <div className="w-full h-1.5 rounded mb-1" style={{ background: '#E8E8E8', opacity: 0.15 }} />
        <div className="w-4/5 h-1.5 rounded mb-1" style={{ background: '#E8E8E8', opacity: 0.1 }} />
        <div className="w-1/2 h-1.5 rounded mb-2" style={{ background: '#E8E8E8', opacity: 0.1 }} />
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5" style={{ background: `${accent}60` }} />
          <div className="w-12 h-1 rounded" style={{ background: accent, opacity: 0.6 }} />
        </div>
      </div>
      {/* Services */}
      <div className="px-2 pb-2 grid grid-cols-3 gap-1">
        {[0,1,2].map(i => (
          <div key={i} className="p-1 rounded" style={{ border: `0.5px solid ${accent}30`, background: '#0f0f0f' }}>
            <div className="text-[6px] mb-0.5 font-bold" style={{ color: accent }}>0{i+1}</div>
            <div className="w-full h-1 rounded" style={{ background: '#2a2a2a' }} />
          </div>
        ))}
      </div>
    </div>
  )

  // classic5
  return (
    <div className="w-full h-full flex flex-col" style={{ background: bg }}>
      <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: `1px solid ${accent}25` }}>
        <div className="w-5 h-5 border text-[8px] italic flex items-center justify-center" style={{ borderColor: accent, color: accent }}>S</div>
        <div className="flex gap-1.5">
          {[0,1,2].map(i => <div key={i} className="w-5 h-1 rounded" style={{ background: `${accent}30` }} />)}
        </div>
      </div>
      <div className="flex flex-1 gap-0">
        {/* Left text */}
        <div className="flex-1 px-3 pt-3">
          <div className="w-12 h-1 rounded mb-2" style={{ background: c, opacity: 0.6 }} />
          <div className="w-full h-3 rounded mb-1" style={{ background: '#2d2015', opacity: 0.8 }} />
          <div className="w-3/4 h-3 rounded mb-2" style={{ background: '#2d2015', opacity: 0.6 }} />
          <div className="w-full h-1 rounded mb-1 opacity-40" style={{ background: '#9b7c5c' }} />
          <div className="w-4/5 h-1 rounded opacity-40" style={{ background: '#9b7c5c' }} />
          <div className="mt-2 h-5 w-16 rounded-full" style={{ background: c }} />
        </div>
        {/* Right photo */}
        <div className="w-16 relative overflow-hidden" style={{ background: '#c5b49a', opacity: 0.7 }}>
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${c}30 0%, transparent 60%)` }} />
        </div>
      </div>
      {/* Stats */}
      <div className="px-3 pb-2 flex gap-2 pt-1.5" style={{ borderTop: `1px solid ${accent}20` }}>
        {['8+yrs', '200+', '4.9★'].map((s, i) => (
          <div key={i} className="flex-1 text-center">
            <div className="text-[7px] font-bold" style={{ color: i === 0 ? c : '#2d2015', opacity: 0.7 }}>{s}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

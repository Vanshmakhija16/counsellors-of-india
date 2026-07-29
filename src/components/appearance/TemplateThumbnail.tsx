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

  if (id === 'classic5') return (
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

  // classic6 — "The Quiet Room": dusk ink-plum field, a soft honey window-glow,
  // and an italic serif opener — echoes the dusk-to-daylight hero.
  if (id === 'classic6') return (
    <div className="w-full h-full flex flex-col relative overflow-hidden" style={{ background: bg }}>
      <div
        className="absolute rounded-full"
        style={{
          width: 90, height: 90, top: -20, right: -20,
          background: `radial-gradient(circle, ${accent}35, transparent 70%)`,
          filter: 'blur(6px)',
        }}
      />
      <div className="flex items-center justify-between px-3 py-2 relative z-10" style={{ borderBottom: `1px solid ${accent}25` }}>
        <div className="w-12 h-1.5 rounded-full" style={{ background: '#F2EEE4', opacity: 0.5 }} />
        <div className="flex gap-1">
          {[0,1,2].map(i => <div key={i} className="w-3 h-1 rounded" style={{ background: accent, opacity: 0.5 }} />)}
        </div>
      </div>
      <div className="flex-1 px-3 pt-3 relative z-10">
        <div className="text-[6px] tracking-widest mb-1.5" style={{ color: accent }}>&mdash; A NOTE, BEFORE WE BEGIN</div>
        <div className="w-full h-3 rounded mb-1 italic" style={{ background: '#F2EEE4', opacity: 0.9 }} />
        <div className="w-3/4 h-3 rounded mb-2 italic" style={{ background: accent, opacity: 0.75 }} />
        <div className="w-full h-1 rounded mb-1 opacity-40" style={{ background: '#F2EEE4' }} />
        <div className="w-3/5 h-1 rounded opacity-40" style={{ background: '#F2EEE4' }} />
      </div>
      <div className="px-3 pb-2.5 flex items-center gap-2 relative z-10">
        <div className="w-9 h-9 rounded-full flex-shrink-0" style={{ background: '#F2EEE4', opacity: 0.95 }} />
        <div className="h-5 flex-1 rounded" style={{ background: `${accent}25`, border: `1px solid ${accent}50` }} />
      </div>
    </div>
  )

  // classic7 — "The Atrium": the arrival ritual is the whole idea, so the
  // thumbnail shows the counter mid-count rather than the hero underneath —
  // this is the one thing that should make someone stop scrolling the picker.
  if (id === 'classic7') return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden" style={{ background: bg }}>
      <span className="absolute" style={{ top: 6, left: 7, fontSize: 8, color: accent, opacity: 0.55, fontFamily: 'monospace' }}>+</span>
      <span className="absolute" style={{ top: 6, right: 7, fontSize: 8, color: accent, opacity: 0.55, fontFamily: 'monospace' }}>+</span>
      <span className="absolute" style={{ bottom: 6, left: 7, fontSize: 8, color: accent, opacity: 0.55, fontFamily: 'monospace' }}>+</span>
      <span className="absolute" style={{ bottom: 6, right: 7, fontSize: 8, color: accent, opacity: 0.55, fontFamily: 'monospace' }}>+</span>

      <div className="text-[6px] tracking-[0.3em] mb-1" style={{ color: accent, fontFamily: 'monospace' }}>SETTLING IN</div>
      <div className="text-2xl font-semibold tabular-nums" style={{ color: '#F6F1E7', fontFamily: 'monospace', letterSpacing: '-0.02em' }}>074</div>
      <div className="w-16 h-px mt-2 relative overflow-hidden" style={{ background: 'rgba(246,241,231,0.15)' }}>
        <div className="h-full absolute left-0 top-0" style={{ width: '74%', background: accent }} />
      </div>
    </div>
  )

  // classic8 — "The Common Room": the persona toggle IS the idea, so the
  // thumbnail leads with a small pill switch (Student / Pro) above a hero
  // that reads as warm-but-credible — the middle ground the template lives in.
  if (id === 'classic8') return (
    <div className="w-full h-full flex flex-col" style={{ background: bg }}>
      <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: `${accent}25` }}>
        <div className="w-10 h-1.5 rounded-full" style={{ background: '#1E2124', opacity: 0.7 }} />
        <div className="flex gap-1.5">
          {[0,1,2].map(i => <div key={i} className="w-4 h-1 rounded" style={{ background: '#1E2124', opacity: 0.25 }} />)}
        </div>
      </div>
      <div className="px-3 pt-2.5">
        <div className="inline-flex rounded-full p-0.5" style={{ background: `${accent}12`, border: `1px solid ${accent}25` }}>
          <div className="px-2 py-0.5 rounded-full text-[6px] font-bold" style={{ background: accent, color: '#fff' }}>Student</div>
          <div className="px-2 py-0.5 rounded-full text-[6px] font-bold" style={{ color: '#5B6470' }}>Pro</div>
        </div>
      </div>
      <div className="flex-1 px-3 pt-2 flex gap-2">
        <div className="flex-1">
          <div className="w-full h-3 rounded mb-1" style={{ background: '#1E2124', opacity: 0.85 }} />
          <div className="w-3/4 h-3 rounded mb-2" style={{ background: accent, opacity: 0.7 }} />
          <div className="w-full h-1 rounded mb-1 opacity-35" style={{ background: '#5B6470' }} />
          <div className="w-4/5 h-1 rounded opacity-35" style={{ background: '#5B6470' }} />
          <div className="mt-2.5 h-5 w-16 rounded-full" style={{ background: accent }} />
        </div>
        <div className="w-12 h-16 rounded-2xl overflow-hidden flex-shrink-0" style={{ background: `${accent}20` }} />
      </div>
      <div className="px-3 pb-2 pt-1.5 flex gap-1.5">
        {[0,1,2].map(i => (
          <div key={i} className="flex-1 rounded-lg p-1.5" style={{ background: '#FFFFFF', border: `1px solid ${accent}25` }}>
            <div className="w-4 h-0.5 rounded mb-1" style={{ background: accent, opacity: 0.6 }} />
            <div className="w-full h-1 rounded" style={{ background: '#1E2124', opacity: 0.25 }} />
          </div>
        ))}
      </div>
    </div>
  )

  return null
}

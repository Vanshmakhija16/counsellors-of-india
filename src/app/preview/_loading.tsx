// ───────────────────────────────────────────────────────────────────────────
// Shared instant loading screen for every /preview/classicN route.
// Same rationale as /[username]/loading.tsx: Next.js streams this in
// immediately on navigation (no client JS required to paint it) while the
// preview page's async Server Component resolves — so visitors see
// something on-brand instead of the browser's bare spinner during that gap.
// Static only (no ticking count / readiness signal) since no client JS is
// running yet when this paints.
// ───────────────────────────────────────────────────────────────────────────

export default function PreviewLoading() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#1a1a18',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        padding: '0 32px',
        textAlign: 'center',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <span
        style={{
          fontSize: 12,
          letterSpacing: '.34em',
          textTransform: 'uppercase',
          color: '#b46b50',
        }}
      >
        Preparing
      </span>
      <p
        style={{
          fontFamily: "'Fraunces', 'Playfair Display', serif",
          fontStyle: 'italic',
          fontWeight: 400,
          fontSize: 'clamp(16px, 2.2vw, 20px)',
          color: 'rgba(245,239,232,.7)',
          margin: 0,
        }}
      >
        A quiet space, just for you
      </p>
      <div
        style={{
          width: 'min(220px, 40vw)',
          height: 2,
          borderRadius: 2,
          background: 'rgba(245,239,232,.15)',
          overflow: 'hidden',
        }}
      >
        <span
          className="coi-preview-loading-fill"
          style={{
            display: 'block',
            height: '100%',
            width: '40%',
            background: '#b46b50',
            animation: 'coi-loading-sweep 1.3s ease-in-out infinite',
          }}
        />
      </div>

      <style>{`
        @keyframes coi-loading-sweep {
          0%   { transform: translateX(-120%); }
          100% { transform: translateX(360%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .coi-preview-loading-fill { animation: none !important; }
        }
      `}</style>
    </div>
  )
}

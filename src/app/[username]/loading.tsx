// ───────────────────────────────────────────────────────────────────────────
// Instant route-level loading state for /[username].
// Next.js streams this in immediately on navigation (no JS required to
// paint it) while the async Server Component in page.tsx does its Supabase
// work (username lookup, therapist row, auth check, booked slots,
// feedbacks). Without this file, the browser shows its own bare spinner /
// blank tab for that entire wait — this replaces that gap with something
// on-brand instead, in the same bark/terracotta language as Template 1's
// client-side Loader, so the transition into the real page feels
// continuous rather than like two unrelated loaders back to back.
//
// This is intentionally static (no ticking count, no readiness signal —
// there's no client JS running yet to drive one). It just needs to hold
// the screen calmly until the real page takes over.
// ───────────────────────────────────────────────────────────────────────────

export default function Loading() {
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
          span[style*="coi-loading-sweep"] { animation: none !important; }
        }
      `}</style>
    </div>
  )
}

// ───────────────────────────────────────────────────────────────────────────
// "The Quiet Room" — design system, scoped under .qr-root
//
// A therapy-practice template whose load-bearing idea is that the light in the
// room changes as the visitor goes deeper: dusk (Ink-Plum) for the intimate
// sections, daylight (Stone) for the practical ones. See section 9 of the brief.
// ───────────────────────────────────────────────────────────────────────────

export const quietRoomStyles = `
.qr-root {
  /* ── Color tokens ── */
  --qr-stone:    #E8E2D6;   /* primary light bg — raw linen */
  --qr-ink:      #2A2330;   /* primary dark bg — warm aubergine-charcoal */
  --qr-paper:    #F2EEE4;   /* card surface on stone; body text on ink */
  --qr-charcoal: #2E2A26;   /* body text on stone */
  --qr-moss:     #5C6B52;   /* trust accent — icons, secondary links, hairlines */
  --qr-fig:      #8B4F52;   /* primary CTA fill — muted wine-brown */
  --qr-honey:    #C79A3D;   /* rationed accent — focus, one underline, confirm */

  --qr-stone-warm: #E2DACB; /* a half-step warmer neutral, for hovers */
  --qr-ink-soft:   #3A3140; /* lifted ink for cards on dusk sections */

  /* ── Named eases (brief §0) ── */
  --qr-calm-out:   cubic-bezier(0.16, 1, 0.3, 1);
  --qr-calm-inout: cubic-bezier(0.65, 0, 0.35, 1);
  --qr-breath:     cubic-bezier(0.37, 0, 0.63, 1);
  --qr-settle:     cubic-bezier(0.34, 1.2, 0.64, 1);

  color: var(--qr-charcoal);
  background: var(--qr-stone);
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
  font-size: 17px;
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

.qr-root *, .qr-root *::before, .qr-root *::after { box-sizing: border-box; }

/* ── Type ── */
.qr-display { font-family: 'Spectral', Georgia, serif; font-weight: 300; letter-spacing: -0.02em; line-height: 1.05; }
.qr-italic  { font-family: 'Spectral', Georgia, serif; font-weight: 300; font-style: italic; }
.qr-mono    { font-family: 'IBM Plex Mono', ui-monospace, monospace; text-transform: uppercase; letter-spacing: 0.08em; }

/* ── Layout ── */
.qr-wrap { max-width: 1140px; margin: 0 auto; padding: 0 32px; }
.qr-section { position: relative; padding: 120px 0; }
@media (max-width: 768px) { .qr-section { padding: 84px 0; } .qr-root { font-size: 16px; } }

/* Light rhythm: dusk sections vs daylight sections */
.qr-dusk     { background: var(--qr-ink); color: var(--qr-paper); }
.qr-daylight { background: var(--qr-stone); color: var(--qr-charcoal); }
.qr-dusk .qr-display { color: var(--qr-paper); }

/* Dark sections get slightly sharper corners than light ones (brief §0). */
.qr-card        { background: var(--qr-paper); border-radius: 16px; }
.qr-dusk .qr-card { background: var(--qr-ink-soft); border-radius: 10px; }

/* ── Eyebrow ── */
.qr-eyebrow { font-family: 'IBM Plex Mono', monospace; text-transform: uppercase; letter-spacing: 0.08em;
  font-size: 11px; color: var(--qr-moss); display: inline-flex; align-items: center; gap: 10px; margin-bottom: 22px; }
.qr-dusk .qr-eyebrow { color: var(--qr-honey); }
.qr-eyebrow::before { content: ''; width: 24px; height: 1px; background: currentColor; opacity: 0.7; }

/* ── The Window — an irregular soft glow of light through an old pane ── */
.qr-window {
  position: absolute; pointer-events: none; z-index: 0;
  width: 60vw; height: 60vw; max-width: 720px; max-height: 720px;
  border-radius: 45% 55% 52% 48% / 50% 46% 54% 50%;
  background: radial-gradient(circle at 42% 38%,
    rgba(199, 154, 61, 0.55) 0%,
    rgba(199, 154, 61, 0.28) 28%,
    rgba(139, 79, 82, 0.12) 52%,
    transparent 72%);
  filter: blur(34px);
  opacity: 0.2;
  will-change: transform, opacity;
}
/* Static fallback strength when JS / motion is off. */
.qr-window--static { opacity: 0.16; }

/* ── Primary CTA ── */
.qr-cta {
  position: relative; display: inline-flex; align-items: center; gap: 10px;
  padding: 15px 28px; border-radius: 12px; border: none; cursor: pointer;
  background: var(--qr-fig); color: var(--qr-paper);
  font-family: 'IBM Plex Sans', sans-serif; font-size: 15px; font-weight: 500;
  letter-spacing: 0.01em; overflow: hidden;
  transition: box-shadow 600ms var(--qr-calm-out), transform 600ms var(--qr-calm-out);
  box-shadow: inset 0 0 0 rgba(255,255,255,0);
}
.qr-cta::after {
  content: ''; position: absolute; inset: 0; opacity: 0;
  background: linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.16) 50%, transparent 100%);
  transition: opacity 600ms var(--qr-calm-out);
}
.qr-cta:hover { box-shadow: inset 0 1px 14px rgba(255,255,255,0.18); }
.qr-cta:hover::after { opacity: 1; }

.qr-ghost {
  background: none; border: none; cursor: pointer; color: inherit;
  font-family: 'IBM Plex Sans', sans-serif; font-size: 15px; font-weight: 500;
  display: inline-flex; align-items: center; gap: 8px; padding: 14px 4px; opacity: 0.85;
}
.qr-ghost:hover { opacity: 1; }

/* ── Animated underline (SVG-like, via background draw) ── */
.qr-underline { position: relative; }
.qr-underline::after {
  content: ''; position: absolute; left: 0; bottom: -3px; height: 1px; width: 100%;
  background: currentColor; transform: scaleX(0); transform-origin: left;
  transition: transform 300ms var(--qr-calm-inout);
}
.qr-underline:hover::after { transform: scaleX(1); }

/* ── Reveal primitives driven by GSAP (initial states baked here so SSR is safe) ── */
.qr-reveal     { opacity: 0; transform: translateY(16px); }
.qr-mask-line  { display: block; overflow: hidden; }
.qr-mask-line > span { display: block; transform: translateY(110%); }

/* Focus ring uses the rationed Honey accent. */
.qr-root :focus-visible { outline: 2px solid var(--qr-honey); outline-offset: 3px; border-radius: 4px; }

/* ── Reduced motion: everything becomes a quiet opacity fade ── */
@media (prefers-reduced-motion: reduce) {
  .qr-reveal { opacity: 1 !important; transform: none !important; }
  .qr-mask-line > span { transform: none !important; }
  .qr-window { animation: none !important; }
  .qr-root * { transition-duration: 150ms !important; }
}
`

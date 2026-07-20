// ───────────────────────────────────────────────────────────────────────────
// "The Atrium" (classic7) — a premium therapy-practice template.
// Signature idea: the site doesn't just "load" — it counts you in, like a
// held breath before a session begins. A tabular-mono counter climbs 1→100
// against a deep pine-ink field, then the screen opens like double doors to
// reveal the practice. Every later section is scoped under .ct7-root.
// ───────────────────────────────────────────────────────────────────────────

export const ct7Styles = `
.ct7-root {
  /* ── Color tokens ── */
  /* Soothing, muted "ledger" palette: a deep, calm sage-charcoal anchors
     dark panels, a warm ivory field surrounds the page, and one soft sand
     accent is rationed for CTAs and numbered marks — calm rather than
     bright, fitting a therapy practice rather than a fitness brand. */
  --ct7-ink:        #263630;  /* deep muted sage-charcoal — loader field, dark hero panel */
  --ct7-ink-soft:   #32453D;  /* lifted ink for cards/chips on the dark panel */
  --ct7-bone:       #F7F4EC;  /* warm ivory — the light field */
  --ct7-bone-dim:   #ECE5D6;  /* half-step deeper neutral, hovers/hairlines/inputs */
  --ct7-brass:      #C6A76B;  /* the one thing that glows — soft muted sand/gold accent */
  --ct7-brass-dim:  rgba(198,167,107,0.20);
  --ct7-moss:       #6B7A70;  /* secondary text on bone, borders */
  --ct7-charcoal:   #2B332E;  /* body text on bone */

  --ct7-ease-out:   cubic-bezier(0.16, 1, 0.3, 1);
  --ct7-ease-inout: cubic-bezier(0.65, 0, 0.35, 1);

  color: var(--ct7-charcoal);
  background: var(--ct7-bone);
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 17px;
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}
.ct7-root *, .ct7-root *::before, .ct7-root *::after { box-sizing: border-box; }

/* ── Type roles ── */
.ct7-display { font-family: 'Fraunces', Georgia, serif; font-weight: 500; letter-spacing: -0.01em; line-height: 1.04; }
.ct7-italic  { font-family: 'Fraunces', Georgia, serif; font-weight: 400; font-style: italic; color: var(--ct7-brass); }
.ct7-mono    { font-family: 'JetBrains Mono', ui-monospace, monospace; letter-spacing: 0.12em; text-transform: uppercase; }

/* ── Layout ── */
.ct7-wrap    { max-width: 1180px; margin: 0 auto; padding: 0 clamp(20px, 5vw, 56px); }
.ct7-section { position: relative; padding: 120px 0; }
@media (max-width: 768px) { .ct7-section { padding: 84px 0; } .ct7-root { font-size: 16px; } }

/* Small "+" corner marks — a recurring signature, first seen on the loader,
   echoed quietly on the hero frame so the ritual doesn't feel disconnected
   from the page it hands off to. */
.ct7-corner {
  position: absolute; font-family: 'JetBrains Mono', monospace;
  font-size: 13px; line-height: 1; color: var(--ct7-brass); opacity: 0.55;
  user-select: none;
}

.ct7-eyebrow {
  font-family: 'JetBrains Mono', monospace; text-transform: uppercase; letter-spacing: 0.14em;
  font-size: 11px; color: var(--ct7-brass); display: inline-flex; align-items: center; gap: 10px;
  margin-bottom: 20px;
}

/* ── Loading ritual ─────────────────────────────────────────────────────── */
.ct7-loader {
  position: fixed; inset: 0; z-index: 9999;
}
.ct7-loader-panel {
  position: fixed; left: 0; right: 0; height: 50vh;
  background:
    radial-gradient(120% 180% at 50% 0%, rgba(198,167,107,0.07) 0%, transparent 55%),
    var(--ct7-ink);
  transition: transform 900ms var(--ct7-ease-inout);
}
.ct7-loader-panel--top    { top: 0; background-position: top; }
.ct7-loader-panel--bottom { bottom: 0; }
.ct7-loader--opening .ct7-loader-panel--top    { transform: translateY(-100%); }
.ct7-loader--opening .ct7-loader-panel--bottom { transform: translateY(100%); }

/* faint grain so the deep ink field doesn't read as flat digital black */
.ct7-loader-panel::after {
  content: ''; position: absolute; inset: 0; opacity: 0.5; mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E");
}

.ct7-loader-brand {
  position: fixed; top: 32px; left: 50%; transform: translateX(-50%);
  font-family: 'JetBrains Mono', monospace; font-size: 10.5px; letter-spacing: 0.26em;
  text-transform: uppercase; color: rgba(246,241,231,0.38);
  opacity: 0; animation: ct7-rise 700ms var(--ct7-ease-out) 150ms forwards;
}

.ct7-loader-corner { position: fixed; font-size: 15px; color: var(--ct7-brass); opacity: 0; font-family: 'JetBrains Mono', monospace; animation: ct7-fade 900ms var(--ct7-ease-out) 200ms forwards; }
.ct7-loader-corner--tl { top: 28px; left: 28px; }
.ct7-loader-corner--tr { top: 28px; right: 28px; }
.ct7-loader-corner--bl { bottom: 28px; left: 28px; }
.ct7-loader-corner--br { bottom: 28px; right: 28px; }

.ct7-loader-center {
  position: fixed; inset: 0; z-index: 2;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 14px;
  transition: opacity 500ms var(--ct7-ease-out), transform 500ms var(--ct7-ease-out);
}
.ct7-loader--opening .ct7-loader-center { opacity: 0; transform: scale(0.96); }

.ct7-loader-label {
  font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.28em;
  text-transform: uppercase; color: var(--ct7-brass);
  opacity: 0; animation: ct7-rise 700ms var(--ct7-ease-out) 80ms forwards;
}
.ct7-loader-count {
  font-family: 'JetBrains Mono', monospace; font-variant-numeric: tabular-nums;
  font-size: clamp(64px, 16vw, 168px); font-weight: 500; line-height: 1;
  color: var(--ct7-bone); letter-spacing: -0.02em;
  text-shadow: 0 0 60px rgba(198,167,107,0.18);
  opacity: 0; animation: ct7-rise 800ms var(--ct7-ease-out) 160ms forwards;
}
.ct7-loader-rule {
  width: min(220px, 40vw); height: 1px; background: rgba(246,241,231,0.14);
  position: relative; overflow: visible;
  opacity: 0; animation: ct7-fade 700ms var(--ct7-ease-out) 260ms forwards;
}
.ct7-loader-rule-fill {
  position: absolute; left: 0; top: 0; bottom: 0; background: var(--ct7-brass);
  transition: width 80ms linear;
}
.ct7-loader-rule-fill::after {
  content: ''; position: absolute; right: -1px; top: 50%; translate: 0 -50%;
  width: 7px; height: 7px; border-radius: 50%; background: var(--ct7-brass);
  box-shadow: 0 0 12px 3px rgba(198,167,107,0.5);
}
.ct7-loader-name {
  font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.1em;
  color: rgba(246,241,231,0.4); margin-top: 4px;
  opacity: 0; animation: ct7-fade 700ms var(--ct7-ease-out) 340ms forwards;
}

@keyframes ct7-rise {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes ct7-fade {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .ct7-loader-panel, .ct7-loader-center,
  .ct7-loader-brand, .ct7-loader-corner, .ct7-loader-label,
  .ct7-loader-count, .ct7-loader-rule, .ct7-loader-name {
    transition: none !important; animation: none !important; opacity: 1 !important; transform: none !important;
  }
}

/* Hero (and later sections) fade/lift in just behind the doors as they open,
   instead of popping in the instant the loader unmounts. */
.ct7-stage { opacity: 0; transform: translateY(14px); }
.ct7-stage--in {
  opacity: 1; transform: translateY(0);
  transition: opacity 700ms var(--ct7-ease-out) 300ms, transform 700ms var(--ct7-ease-out) 300ms;
}

/* ── Ledger reveal ──────────────────────────────────────────────────────
   Two variants:
   .ct7-reveal       — fade + translateY (blocks, cards, images)
   .ct7-reveal-clip  — clip-path horizontal wipe (ledger rows, titles)
   Both driven by IntersectionObserver in _reveal.ts.
   Both honour prefers-reduced-motion. */
.ct7-reveal {
  opacity: 0; transform: translateY(20px);
  transition:
    opacity  700ms var(--ct7-ease-out) var(--ct7-d, 0ms),
    transform 700ms var(--ct7-ease-out) var(--ct7-d, 0ms);
}
.ct7-reveal--in { opacity: 1; transform: translateY(0); }

.ct7-reveal-clip {
  clip-path: inset(0 100% 0 0);
  transition: clip-path 700ms var(--ct7-ease-out) var(--ct7-d, 0ms);
}
.ct7-reveal-clip.ct7-reveal--in { clip-path: inset(0 0% 0 0); }

@media (prefers-reduced-motion: reduce) {
  .ct7-reveal, .ct7-reveal-clip {
    transition: none !important; opacity: 1 !important;
    transform: none !important; clip-path: none !important;
  }
}

/* Hero entrance — each child animates in staggered */
@keyframes ct7-hero-in {
  from { opacity: 0; transform: translateY(22px); }
  to   { opacity: 1; transform: translateY(0); }
}
.ct7-hero-enter {
  opacity: 0;
  animation: ct7-hero-in 800ms var(--ct7-ease-out) var(--ct7-d, 0ms) forwards;
}

/* Expertise row hover line — the brass underline slides in on hover */
.ct7-xp-list-row {
  position: relative; cursor: default;
  transition: padding-left 350ms var(--ct7-ease-out);
}
.ct7-xp-list-row::before {
  content: '';
  position: absolute; left: 0; bottom: -1px; height: 1px;
  width: 0; background: var(--ct7-brass);
  transition: width 400ms var(--ct7-ease-out);
}
.ct7-xp-list-row:hover::before { width: 100%; }
.ct7-xp-list-row:hover { padding-left: 6px; }

/* Number counter — animate when row enters viewport */
@keyframes ct7-num-in {
  from { opacity: 0; transform: translateX(-12px); }
  to   { opacity: 1; transform: translateX(0); }
}
.ct7-xp-list-row.ct7-reveal--in .ct7-xp-list-num {
  animation: ct7-num-in 500ms var(--ct7-ease-out) calc(var(--ct7-d, 0ms) + 80ms) both;
}

/* Label clip reveal — title wipes in after number */
.ct7-xp-list-label {
  clip-path: inset(0 100% 0 0);
  transition: clip-path 600ms var(--ct7-ease-out) calc(var(--ct7-d, 0ms) + 120ms);
}
.ct7-xp-list-row.ct7-reveal--in .ct7-xp-list-label { clip-path: inset(0 0% 0 0); }

/* Blurb fade — follows the label */
.ct7-xp-list-blurb {
  opacity: 0;
  transition: opacity 500ms var(--ct7-ease-out) calc(var(--ct7-d, 0ms) + 260ms);
}
.ct7-xp-list-row.ct7-reveal--in .ct7-xp-list-blurb { opacity: 1; }

/* About image — scale from slightly dark */
.ct7-ab-card {
  transform: scale(0.97); filter: brightness(0.85);
  transition:
    transform 900ms var(--ct7-ease-out) var(--ct7-d, 0ms),
    filter    900ms var(--ct7-ease-out) var(--ct7-d, 0ms),
    opacity   700ms var(--ct7-ease-out) var(--ct7-d, 0ms);
  opacity: 0;
}
.ct7-ab-card.ct7-reveal--in { transform: scale(1); filter: none; opacity: 1; }

/* Section title wipe */
.ct7-section-title {
  clip-path: inset(0 100% 0 0);
  transition: clip-path 800ms var(--ct7-ease-out) var(--ct7-d, 80ms);
}
.ct7-section-title.ct7-reveal--in { clip-path: inset(0 0% 0 0); }

/* ── Ledger primitives (shared across About/Expertise/Process/FAQ) ── */
.ct7-ledger-row {
  display: flex; gap: clamp(18px, 4vw, 40px);
  padding: clamp(24px, 4vw, 36px) 0;
  border-top: 1px solid var(--ct7-bone-dim);
}
.ct7-ledger-row:last-child { border-bottom: 1px solid var(--ct7-bone-dim); }
.ct7-ledger-num {
  flex-shrink: 0; width: 44px;
  font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 500;
  color: var(--ct7-brass); padding-top: 3px;
}
.ct7-ledger-body { flex: 1; min-width: 0; }
.ct7-ledger-title {
  font-family: 'Fraunces', Georgia, serif; font-weight: 500; font-size: clamp(19px, 2.2vw, 23px);
  color: var(--ct7-charcoal); margin: 0 0 8px; letter-spacing: -0.01em;
}
.ct7-ledger-text {
  font-family: 'Inter', system-ui, sans-serif; font-size: 15px; line-height: 1.68;
  color: rgba(43,51,46,0.68); margin: 0; max-width: 62ch;
}

.ct7-section-head { max-width: 1140px; margin: 0 auto clamp(32px, 5vw, 56px); padding: 0 clamp(20px,5vw,56px); }
.ct7-section-title {
  font-family: 'Fraunces', Georgia, serif; font-weight: 500; letter-spacing: -0.01em;
  font-size: clamp(30px, 4vw, 46px); line-height: 1.08; color: var(--ct7-charcoal); margin: 12px 0 0;
}
.ct7-section-title em { font-style: italic; color: var(--ct7-brass); }
.ct7-wrap-narrow { max-width: 780px; margin: 0 auto; padding: 0 clamp(20px, 5vw, 56px); }

/* ── Rooms: the doorway transition system ────────────────────────────────
   As the visitor scrolls into a new section, two ink panels sweep in from
   top and bottom to meet at centre, hold just long enough to show the
   room's number and name, then part again — echoing the loader's own
   opening ritual so the whole site reads as one continuous hand-off from
   room to room, not a stack of unrelated sections. */
.ct7-doors { position: fixed; inset: 0; z-index: 70; pointer-events: none; }
.ct7-doors-panel {
  position: absolute; left: 0; right: 0; height: 51%;
  background: var(--ct7-ink);
  transform: scaleY(0);
  transition: transform 480ms var(--ct7-ease-inout);
}
.ct7-doors-panel--top    { top: 0; transform-origin: top; }
.ct7-doors-panel--bottom { bottom: 0; transform-origin: bottom; }
.ct7-doors[data-state="closing"] .ct7-doors-panel,
.ct7-doors[data-state="hold"]    .ct7-doors-panel { transform: scaleY(1); }
.ct7-doors[data-state="opening"] .ct7-doors-panel { transition-duration: 560ms; }

.ct7-doors-label {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  display: flex; align-items: baseline; gap: 12px; white-space: nowrap;
  opacity: 0; transition: opacity 260ms var(--ct7-ease-out);
}
.ct7-doors[data-state="closing"] .ct7-doors-label,
.ct7-doors[data-state="hold"]    .ct7-doors-label { opacity: 1; }
.ct7-doors-num {
  font-family: 'JetBrains Mono', monospace; font-size: 13px; color: var(--ct7-brass); letter-spacing: 0.14em;
}
.ct7-doors-name {
  font-family: 'Fraunces', Georgia, serif; font-style: italic; font-weight: 400;
  font-size: clamp(20px, 3vw, 28px); color: #F6F1E7;
}

/* Room rail — a quiet you-are-here index down the right edge, doubling as
   a secondary nav. Colour flips light/dark depending on which room's
   background is currently active, so it stays legible over the ink panels. */
.ct7-rail {
  position: fixed; right: 22px; top: 50%; transform: translateY(-50%); z-index: 45;
  display: flex; flex-direction: column; align-items: center; gap: 16px;
}
@media (max-width: 900px) { .ct7-rail { display: none; } }
.ct7-rail-dot {
  width: 22px; height: 22px; border-radius: 50%; border: none; cursor: pointer;
  background: transparent; display: flex; align-items: center; justify-content: center; position: relative;
  padding: 0;
}
.ct7-rail-dot::before {
  content: ''; width: 6px; height: 6px; border-radius: 50%;
  background: rgba(43,51,46,0.28); transition: all 320ms var(--ct7-ease-out);
}
.ct7-rail-dot--active::before {
  background: var(--ct7-brass); width: 9px; height: 9px;
  box-shadow: 0 0 10px 2px rgba(198,167,107,0.5);
}
.ct7-rail-dot-num {
  position: absolute; right: 30px; top: 50%; transform: translateY(-50%) translateX(6px);
  font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.06em; text-transform: uppercase;
  color: var(--ct7-charcoal); background: var(--ct7-bone); padding: 5px 10px; border-radius: 6px;
  white-space: nowrap; opacity: 0; pointer-events: none;
  box-shadow: 0 4px 14px rgba(16,42,28,0.14);
  transition: opacity 220ms var(--ct7-ease-out), transform 220ms var(--ct7-ease-out);
}
.ct7-rail-dot:hover .ct7-rail-dot-num,
.ct7-rail-dot:focus-visible .ct7-rail-dot-num { opacity: 1; transform: translateY(-50%) translateX(0); }
.ct7-rail--dark .ct7-rail-dot::before { background: rgba(246,241,231,0.32); }
.ct7-rail--dark .ct7-rail-dot--active::before { background: var(--ct7-brass); }
.ct7-rail--dark .ct7-rail-dot-num { background: var(--ct7-ink); color: #F6F1E7; }

@media (prefers-reduced-motion: reduce) {
  .ct7-doors { display: none !important; }
}
`

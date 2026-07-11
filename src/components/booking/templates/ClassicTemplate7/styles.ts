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
  /* PhysioLogic-style deep-green palette: dark forest panel anchors the
     hero, a clean light page surrounds it, one bright lime accent is
     rationed for CTAs and the highlighted headline phrase. */
  --ct7-ink:        #102A1C;  /* deep forest — loader field, dark hero panel */
  --ct7-ink-soft:   #193826;  /* lifted ink for cards/chips on the dark panel */
  --ct7-bone:       #F5F8F3;  /* clean pale green-white — the light field */
  --ct7-bone-dim:   #E9EFE4;  /* half-step deeper neutral, hovers/hairlines/inputs */
  --ct7-brass:      #A8E063;  /* the one thing that glows — bright lime accent */
  --ct7-brass-dim:  rgba(168,224,99,0.20);
  --ct7-moss:       #4B5D52;  /* secondary text on bone, borders */
  --ct7-charcoal:   #14201A;  /* body text on bone */

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
.ct7-eyebrow::before { content: ''; width: 22px; height: 1px; background: currentColor; opacity: 0.8; }

/* ── Loading ritual ─────────────────────────────────────────────────────── */
.ct7-loader {
  position: fixed; inset: 0; z-index: 9999;
}
.ct7-loader-panel {
  position: fixed; left: 0; right: 0; height: 50vh;
  background:
    radial-gradient(120% 180% at 50% 0%, rgba(156,138,165,0.09) 0%, transparent 55%),
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
  text-shadow: 0 0 60px rgba(156,138,165,0.2);
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
  box-shadow: 0 0 12px 3px rgba(156,138,165,0.6);
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
`

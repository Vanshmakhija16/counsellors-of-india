// ClassicTemplate8 — "The Common Room"
// Built to genuinely serve two different audiences on one page: students
// (budget, flexibility, informal warmth) and working professionals
// (credibility, discretion, structure) — without feeling generic to either.
// The mechanic: a persona toggle in the hero ("Student" / "Professional" /
// unselected) that retints an accent color and swaps supporting copy across
// sections, so the SAME page quietly leans toward whichever visitor is
// looking at it, rather than forcing one-size-fits-all copy.

export const ct8Styles = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;0,600;1,500&family=Manrope:wght@500;600;700;800&family=Inter:wght@300;400;500;600&display=swap');

  .ct8-root {
    /* “Sage & Clay” — earthy, grounded palette: warm clay-linen paper,
       a deep loam/umber ink instead of navy, near-black, or bottle-green,
       muted sage green as the primary accent, and a warm terracotta clay
       used only in small, deliberate doses (persona toggle, dividers)
       rather than as the everywhere accent. Reads calm, organic and
       grounded (fitting a therapy practice) while still feeling
       considered and warm rather than default-soft. */
    --paper:        #F7F1E7;
    --paper-2:      #EDE0CE;
    --card:         #FFFDF8;
    --ink:          #2E2A22;
    --ink-soft:     #7A7061;
    --line:         rgba(46,42,34,0.10);
    --line-strong:  rgba(46,42,34,0.18);

    /* Default/neutral brand accent — muted slate/ocean blue, reads calm
       and trustworthy, and gives a crisp complementary contrast against
       the warm cream/clay base rather than blending into it. */
    --accent:       #3D6B8C;
    --accent-soft:  rgba(61,107,140,0.12);
    --accent-ink:   #FFFFFF;

    /* Persona accents — swapped in as --accent when a persona is active.
       Student leans warm terracotta clay (approachable, informal);
       Professional deepens further into olive sage (authoritative,
       discreet). */
    --student:      #BF6E4C;
    --student-soft: rgba(191,110,76,0.14);
    --professional: #3F4E37;
    --professional-soft: rgba(63,78,55,0.10);

    --radius:   16px;
    --radius-sm: 10px;
    --shadow-sm: 0 2px 10px rgba(30,33,36,0.05);
    --shadow-md: 0 16px 40px rgba(30,33,36,0.08);
    --ease: cubic-bezier(0.4, 0, 0.2, 1);

    background:
      radial-gradient(ellipse 900px 560px at 12% -8%, rgba(61,107,140,0.08), transparent 60%),
      radial-gradient(ellipse 800px 520px at 108% 22%, rgba(191,110,76,0.06), transparent 58%),
      radial-gradient(ellipse 700px 480px at 20% 108%, rgba(61,107,140,0.05), transparent 55%),
      radial-gradient(circle, rgba(46,42,34,0.08) 1.4px, transparent 1.4px) 0 0/26px 26px,
      var(--paper);
    color: var(--ink);
    font-family: 'Inter', system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }

  /* Persona theme swap — data-persona set on the root by Hero's toggle */
  .ct8-root[data-persona='student']       { --accent: var(--student);       --accent-soft: var(--student-soft); }
  .ct8-root[data-persona='professional']  { --accent: var(--professional);  --accent-soft: var(--professional-soft); }

  .ct8-root * { transition: color 0.3s var(--ease), background-color 0.3s var(--ease), border-color 0.3s var(--ease); }

  .ct8-heading {
    font-family: 'Manrope', system-ui, sans-serif;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--ink);
  }

  .ct8-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    font-family: 'Manrope', system-ui, sans-serif;
    font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--accent);
  }
  .ct8-eyebrow::before {
    content: ''; width: 7px; height: 7px; border-radius: 50%;
    background: var(--accent); flex-shrink: 0;
  }

  .ct8-section { padding: clamp(3.5rem, 8vh, 6.5rem) clamp(1.25rem, 5vw, 4rem); position: relative; }
  .ct8-container { max-width: 1140px; margin: 0 auto; }
  .ct8-section-alt { background: var(--paper-2); }

  .ct8-section-head { max-width: 640px; margin: 0 0 2.75rem; }
  .ct8-section-title { font-size: clamp(30px, 3.8vw, 46px); font-weight: 800; letter-spacing: -0.025em; line-height: 1.08; margin: 0.85rem 0 0; position: relative; padding-top: 1.1rem; }
  .ct8-section-title::before {
    content: ''; position: absolute; top: 0; left: 0;
    width: 38px; height: 3px; border-radius: 2px; background: var(--accent);
  }
  .ct8-section-sub { font-size: 15px; color: var(--ink-soft); line-height: 1.7; margin: 0.9rem 0 0; max-width: 56ch; }

  .ct8-card {
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: var(--radius);
    box-shadow: var(--shadow-sm);
  }

  .ct8-btn-primary {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 13px 26px; border-radius: 100px; border: none; cursor: pointer;
    background: var(--accent); color: var(--accent-ink);
    font-family: 'Manrope', system-ui, sans-serif; font-weight: 700; font-size: 14px;
    box-shadow: 0 10px 24px -8px var(--accent);
    transition: transform 0.2s var(--ease), box-shadow 0.2s var(--ease), background 0.3s var(--ease);
  }
  .ct8-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 14px 30px -6px var(--accent); }
  .ct8-btn-primary:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

  .ct8-btn-ghost {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 12px 24px; border-radius: 100px;
    border: 1px solid var(--line-strong); background: transparent; color: var(--ink);
    font-family: 'Manrope', system-ui, sans-serif; font-weight: 700; font-size: 14px;
    cursor: pointer; transition: all 0.2s var(--ease);
  }
  .ct8-btn-ghost:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-soft); }

  .ct8-reveal { opacity: 0; transform: translateY(22px); transition: opacity 0.7s var(--ease), transform 0.7s var(--ease); }
  .ct8-reveal.visible { opacity: 1; transform: translateY(0); }

  /* ── Navbar ── dark bar (own palette: deep bottle-green ink, not pure
     black) so it reads as one continuous surface with the dark hero
     directly beneath it, developer-portfolio style. ── */
  .ct8-nav {
    position: fixed; top: clamp(0.7rem, 1.6vw, 1rem); left: 0; right: 0; z-index: 40;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    padding: 0.5rem clamp(1.4rem, 3vw, 2rem);
    margin: 0 clamp(1rem, 4vw, 3rem);
    background:
      linear-gradient(180deg, rgba(255,255,255,0.6), rgba(255,255,255,0.32) 55%),
      rgba(240,238,230,0.55);
    backdrop-filter: blur(16px) saturate(160%);
    -webkit-backdrop-filter: blur(16px) saturate(160%);
    border: 1px solid rgba(46,42,34,0.08);
    border-radius: 100px;
    box-shadow: 0 10px 30px -16px rgba(46,42,34,0.25), inset 0 1px 0 rgba(255,255,255,0.6);
  }
  .ct8-nav-name { justify-self: start; font-family: 'Manrope', sans-serif; font-weight: 800; font-size: 15px; color: #2E2A22; letter-spacing: 0.04em; text-transform: uppercase; white-space: nowrap; }
  .ct8-nav-center { justify-self: center; }
  .ct8-nav-links { display: flex; align-items: center; gap: clamp(1.6rem, 3vw, 2.4rem); }
  .ct8-nav-link {
    position: relative;
    background: none; border: none; cursor: pointer;
    font-family: 'Manrope', sans-serif; font-size: 11px; font-weight: 700;
    letter-spacing: 0.14em; text-transform: uppercase;
    color: rgba(46,42,34,0.6); padding: 4px 0;
  }
  .ct8-nav-link::after {
    content: ''; position: absolute; left: 0; right: 0; bottom: -3px; height: 2px;
    background: var(--accent); transform: scaleX(0); transform-origin: left center;
    transition: transform 0.25s var(--ease);
  }
  .ct8-nav-link:hover { color: #2E2A22; }
  .ct8-nav-link:hover::after { transform: scaleX(1); }
  .ct8-nav-right { justify-self: end; display: flex; align-items: center; gap: 14px; }
  .ct8-nav-cta {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 7px 15px 7px 13px; border-radius: 100px; border: none; cursor: pointer;
    background: var(--accent); color: #FFFFFF;
    font-family: 'Manrope', sans-serif; font-weight: 700; font-size: 11.5px;
    letter-spacing: 0.02em; white-space: nowrap;
    box-shadow: 0 6px 16px -6px var(--accent);
    transition: transform 0.2s var(--ease), box-shadow 0.2s var(--ease), background 0.3s var(--ease);
  }
  .ct8-nav-cta:hover { transform: translateY(-1px); box-shadow: 0 9px 20px -5px var(--accent); }
  .ct8-nav-cta svg { flex-shrink: 0; }
  .ct8-nav-burger { display: none; }
  @media (max-width: 760px) {
    .ct8-nav-center { display: none; }
    .ct8-nav-cta-label { display: none; }
    .ct8-nav-cta { padding: 9px; }
    .ct8-nav-burger {
      display: flex; align-items: center; justify-content: center;
      width: 32px; height: 32px; border-radius: 50%; border: 1px solid rgba(46,42,34,0.16);
      background: transparent; color: #2E2A22; cursor: pointer; flex-shrink: 0;
    }
    .ct8-nav-burger:hover { border-color: var(--accent); color: var(--accent); }
  }
  .ct8-nav-mobile-sheet {
    position: absolute; top: calc(100% + 10px); left: 0; right: 0; z-index: 39;
    display: flex; flex-direction: column; gap: 0.2rem;
    padding: 1rem clamp(1.4rem, 3vw, 2rem) 1.4rem;
    background:
      linear-gradient(180deg, rgba(255,255,255,0.6), rgba(255,255,255,0.32) 55%),
      rgba(240,238,230,0.55);
    backdrop-filter: blur(16px) saturate(160%);
    -webkit-backdrop-filter: blur(16px) saturate(160%);
    border: 1px solid rgba(46,42,34,0.08);
    border-radius: 22px;
    box-shadow: 0 10px 30px -16px rgba(46,42,34,0.25), inset 0 1px 0 rgba(255,255,255,0.6);
    animation: ct8-nav-sheet-in 0.2s var(--ease);
  }
  @keyframes ct8-nav-sheet-in {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .ct8-nav-mobile-link {
    background: none; border: none; cursor: pointer; text-align: left;
    padding: 0.75rem 0; border-bottom: 1px solid rgba(46,42,34,0.1);
    font-family: 'Inter', sans-serif; font-size: 14.5px; font-weight: 500; color: #2E2A22;
  }
  .ct8-nav-mobile-cta { margin-top: 0.9rem; justify-content: center; }
  @media (prefers-reduced-motion: reduce) {
    .ct8-nav-mobile-sheet { animation: none; }
  }

  /* ── Hero ── dark developer-portfolio pass, but restricted to this
     site's own palette (deep bottle-green ink + warm ivory) rather than
     literal black/white. .ct8-hero-dark remaps --ink/--ink-soft/--paper/
     --line/--card locally so every existing hero rule below (which
     already reads from those tokens) flips to light-text-on-dark for
     free, without needing separate dark-specific rules. Nothing outside
     this section is affected — About, Services, FAQ, Booking stay on the
     original light palette. ── */
  .ct8-hero-premium {
    position: relative;
    background: #FFFFFF;
    color: var(--ink);
    padding: clamp(8.5rem, 18vh, 11.5rem) clamp(1.25rem, 5vw, 4rem) 0;
  }
  .ct8-hero-premium.ct8-hero-dark {
    /* Light, warm off-white/cream hero — Claude's own site background
       tone — so the coral accent (name gradient, CTA pill, avatar ring)
       pops against it instead of sitting on a dark panel. */
    --paper:       #F0EEE6;
    --ink:         #2E2A22;
    --ink-soft:    rgba(46,42,34,0.62);
    --line:        rgba(46,42,34,0.14);
    --line-strong: rgba(46,42,34,0.26);
    --card:        #FFFFFF;
    background: var(--paper);
    color: var(--ink);
  }

  .ct8-hero-dark-inner {
    max-width: 900px; margin: 0 auto;
    display: flex; flex-direction: column; align-items: center; text-align: center;
    padding-bottom: clamp(3rem, 7vh, 4.5rem);
  }

  /* Two-column split: photo left, identity block + copy + CTAs right
     (left-aligned). The scroll indicator + divider stay centered below,
     spanning the full width, since they're page-level not column-level. */
  .ct8-hero-dark-inner--split { max-width: 1040px; }
  .ct8-hero-dark-grid {
    display: grid;
    grid-template-columns: minmax(250px, 390px) 1fr;
    gap: clamp(2.5rem, 6vw, 4.5rem);
    align-items: center;
    width: 100%;
    text-align: left;
    margin-bottom: clamp(2.5rem, 6vh, 3.5rem);
  }
  .ct8-hero-photo-ring-wrap {
    width: 100%; aspect-ratio: 1/1; border-radius: 50%;
    padding: 20px; /* the visible gap between photo and ring */
    border: 1.5px solid rgba(61,107,140,0.13); /* lighter tint of the theme accent, independent of the shared var so buttons/CTAs elsewhere stay unaffected */
    box-sizing: border-box;
    position: relative; z-index: 1;
  }
  .ct8-hero-dark-grid-photo {
    width: 100%; height: 100%; border-radius: 50%;
    overflow: hidden;
    box-shadow: 0 20px 45px -12px rgba(46,42,34,0.22);
  }
  .ct8-hero-dark-grid-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }

  /* Soft warm halo behind the photo -- a wide, gently blurred cream glow
     (matches this template's own "Sage & Clay" palette rather than the
     cooler --accent blue) so the circle reads as floating in warm light,
     like the reference. No dashed ring, no orbiting dots -- kept simple. */
  .ct8-hero-photo-orbit {
    position: relative;
  }
  .ct8-hero-photo-glow {
    position: absolute; inset: -10%; z-index: 0; border-radius: 50%;
    background: radial-gradient(circle, var(--paper-2) 0%, transparent 72%);
    filter: blur(18px);
    opacity: 1;
  }
  .ct8-hero-dark-grid-content { display: flex; flex-direction: column; align-items: flex-start; min-width: 0; padding-top: 1.4rem; }
  .ct8-hero-dark-grid-content .ct8-hero-dark-eyebrow,
  .ct8-hero-dark-grid-content .ct8-hero-greeting-prefix,
  .ct8-hero-dark-grid-content .ct8-hero-dark-name,
  .ct8-hero-dark-grid-content .ct8-hero-dark-sub { text-align: left; }
  .ct8-hero-dark-grid-content .ct8-hero-dark-name { white-space: normal; }
  .ct8-hero-dark-grid-content .ct8-hero-dark-ctas { justify-content: flex-start; margin-bottom: clamp(1.6rem, 4vh, 2.2rem); }
  .ct8-hero-dark-stats--left { justify-content: flex-start; margin-bottom: 0; }

  @media (max-width: 760px) {
    .ct8-hero-dark-grid { grid-template-columns: 1fr; text-align: center; }
    .ct8-hero-dark-grid-photo { max-width: 240px; margin: 0 auto; aspect-ratio: 1/1; border-radius: 50%; }
    .ct8-hero-dark-grid-content { align-items: center; }
    .ct8-hero-dark-grid-content .ct8-hero-dark-eyebrow,
    .ct8-hero-dark-grid-content .ct8-hero-greeting-prefix,
    .ct8-hero-dark-grid-content .ct8-hero-dark-name,
    .ct8-hero-dark-grid-content .ct8-hero-dark-sub { text-align: center; }
    .ct8-hero-dark-grid-content .ct8-hero-dark-ctas,
    .ct8-hero-dark-stats--left { justify-content: center; }
  }

  .ct8-hero-dark-avatar {
    width: 72px; height: 72px; border-radius: 50%; overflow: hidden; flex-shrink: 0;
    border: 3px solid var(--card); box-shadow: var(--shadow-md);
    margin-bottom: 1.2rem;
  }
  .ct8-hero-dark-avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }

  .ct8-hero-dark-eyebrow {
    font-family: 'Manrope', sans-serif; font-size: 11.5px; font-weight: 600;
    letter-spacing: 0.22em; text-transform: uppercase; color: var(--ink-soft);
    margin: 0 0 1.4rem;
  }
  .ct8-hero-greeting-prefix {
    font-family: 'Fraunces', Georgia, serif; font-style: italic; font-weight: 500;
    font-size: clamp(17px, 1.9vw, 21px); color: var(--accent);
    margin: 0 0 0.3rem;
  }
  .ct8-hero-tagline {
    font-family: 'Manrope', sans-serif; font-weight: 700;
    font-size: clamp(16px, 1.9vw, 21px); line-height: 1.4; color: var(--accent);
    margin: 0.3rem 0 0.6rem; max-width: 46ch;
  }
  .ct8-hero-dark-eyebrow--from {
    text-transform: none; letter-spacing: 0.02em; font-weight: 500; margin: 0 0 1.6rem;
  }
  .ct8-hero-dark-divider {
    display: block; width: 1px; height: 34px; background: var(--line-strong);
    margin: 0 auto 1.1rem;
  }

  /* Flat ivory headline (swapped from the gradient-clip technique) so each
     letter can carry its own color for the hover wave below — gradient
     text-fill and per-letter color animation don't compose. */
  .ct8-hero-dark-name {
    font-family: 'Manrope', system-ui, sans-serif; font-weight: 800;
    line-height: 0.9; letter-spacing: -0.01em;
    text-transform: uppercase;
    margin: 0 0 2.6rem;
    white-space: normal; /* wrap IS allowed here -- but only between .ct8-name-word units below, never inside one */
    -webkit-user-select: none; user-select: none;
    display: inline-block;
  }
  /* Each word (first name, last name, "I'm") is its OWN non-breakable
     unit -- this is what actually guarantees a word can never split
     mid-letter (e.g. "Vansh" becoming "VAN"/"SH"), which happened on Mac's
     renderer with the old all-letters-in-one-nowrap-block approach.
     word-break/overflow-wrap are pinned to "never break" too, as a second
     line of defense in case a global CSS reset sets more aggressive
     defaults elsewhere in the app. */
  .ct8-name-word {
    display: inline-block;
    white-space: nowrap;
    word-break: keep-all;
    overflow-wrap: normal;
  }
  .ct8-name-letter {
    display: inline-block;
    background: linear-gradient(180deg, var(--ink) 0%, var(--accent) 100%);
    -webkit-background-clip: text; background-clip: text; color: transparent;
  }
  .ct8-hero-dark-name:hover .ct8-name-letter {
    animation: ct8-name-wave 0.7s ease;
    animation-delay: calc(var(--i) * 35ms);
  }
  @keyframes ct8-name-wave {
    0%   { background: linear-gradient(180deg, var(--ink) 0%, var(--accent) 100%); -webkit-background-clip: text; background-clip: text; }
    45%  { background: linear-gradient(180deg, var(--accent) 0%, var(--accent) 100%); -webkit-background-clip: text; background-clip: text; }
    100% { background: linear-gradient(180deg, var(--ink) 0%, var(--accent) 100%); -webkit-background-clip: text; background-clip: text; }
  }
  @media (prefers-reduced-motion: reduce) {
    .ct8-hero-dark-name:hover .ct8-name-letter { animation: none; }
  }

  .ct8-hero-dark-sub {
    font-size: clamp(15px, 1.6vw, 18px); line-height: 1.6; color: var(--ink-soft);
    margin: 0 0 3rem; max-width: 46ch; font-weight: 400;
  }

  .ct8-hero-dark-ctas {
    display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; justify-content: center;
    margin-bottom: clamp(2rem, 5vh, 2.75rem);
  }

  .ct8-hero-pill-btn {
    display: inline-flex; align-items: center; gap: 10px;
    padding: 16px 32px; border-radius: 12px; border: none; cursor: pointer;
    background: var(--accent); color: var(--accent-ink);
    font-family: 'Manrope', sans-serif; font-weight: 700; font-size: 12.5px;
    letter-spacing: 0.06em; text-transform: uppercase;
    text-decoration: none;
    box-shadow: 0 10px 24px -8px var(--accent);
    transition: transform 0.2s var(--ease), background 0.2s var(--ease), box-shadow 0.2s var(--ease);
  }
  .ct8-hero-pill-btn:hover { transform: translateY(-2px); box-shadow: 0 14px 30px -6px var(--accent); }

  /* Secondary CTA — outline/ghost so the primary "Book a Session" pill
     stays the single visually-dominant action instead of two identical
     competing pills. Fill sweeps in from the left on hover (rather than
     an instant color swap) to read as more deliberate/premium. */
  .ct8-hero-pill-btn--ghost {
    position: relative; overflow: hidden; isolation: isolate;
    background: transparent; color: var(--ink);
    border: 1.5px solid var(--line-strong); box-shadow: none;
  }
  .ct8-hero-pill-btn--ghost::before {
    content: ''; position: absolute; inset: 0; z-index: -1;
    background: var(--ink);
    transform: scaleX(0); transform-origin: left center;
    transition: transform 0.35s var(--ease);
  }
  .ct8-hero-pill-btn--ghost:hover {
    border-color: var(--ink); color: var(--paper);
    box-shadow: none;
  }
  .ct8-hero-pill-btn--ghost:hover::before { transform: scaleX(1); }
  @media (prefers-reduced-motion: reduce) {
    .ct8-hero-pill-btn--ghost::before { transition: none; }

    }

  .ct8-hero-dark-stats {
    display: flex; align-items: center; justify-content: center;
    gap: clamp(1.4rem, 3.5vw, 2.2rem);
    margin-bottom: clamp(2.5rem, 6vh, 3.5rem);
  }
  .ct8-hero-dark-stat-group { display: flex; align-items: center; gap: clamp(1.4rem, 3.5vw, 2.2rem); }
  .ct8-hero-dark-stat-divider { width: 1px; height: 30px; background: var(--line-strong); }
  .ct8-hero-dark-stat { display: flex; flex-direction: column; align-items: center; gap: 3px; }
  .ct8-hero-dark-stat-num {
    display: flex; align-items: center;
    font-family: 'Fraunces', Georgia, serif; font-weight: 500; font-size: 22px; color: var(--ink); line-height: 1;
  }
  .ct8-hero-dark-stat-num svg { color: var(--accent); }
  .ct8-hero-dark-stat-lbl {
    font-size: 10px; color: var(--ink-soft); text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600;
  }

  .ct8-hero-dark-scroll {
    display: flex; flex-direction: column; align-items: center; gap: 10px;
    background: none; border: none; cursor: pointer; padding: 0;
    font-family: 'Manrope', sans-serif; font-size: 10px; font-weight: 600;
    letter-spacing: 0.2em; text-transform: uppercase; color: var(--ink-soft);
    margin-top: 1.5rem;
    animation: ct8-hero-scroll-bob 2.2s ease-in-out infinite;
  }
  @keyframes ct8-hero-scroll-bob {
    0%, 100% { transform: translateY(0); }
    50%      { transform: translateY(5px); }
  }
  @media (prefers-reduced-motion: reduce) {
    .ct8-hero-dark-scroll { animation: none; }
  }

  @media (max-width: 640px) {
    .ct8-hero-dark-ctas { flex-direction: column; align-items: stretch; width: 100%; }
    .ct8-hero-pill-btn { justify-content: center; }
    .ct8-hero-dark-stats { flex-wrap: wrap; row-gap: 1.2rem; }
  }

  /* ── Marquee strip beneath the hero ── still nested inside
     .ct8-hero-premium's scope, so var(--paper)/var(--ink-soft)/var(--line)
     here automatically resolve to the dark-hero values above -- no
     separate dark override needed. ── */
  .ct8-hero-marquee-wrap {
    position: relative;
    border-top: 1px solid var(--line); border-bottom: 1px solid var(--line);
    background: var(--paper); overflow: hidden;
    -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
    mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
  }
  .ct8-hero-marquee-track {
    display: flex; align-items: center; gap: 2.75rem; width: max-content;
    padding: 1rem 0; animation: ct8-marquee 32s linear infinite;
  }
  .ct8-hero-marquee-wrap:hover .ct8-hero-marquee-track { animation-play-state: paused; }
  .ct8-hero-marquee-item {
    display: inline-flex; align-items: center; gap: 12px;
    font-family: 'Manrope', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 0.08em;
    text-transform: uppercase; color: var(--ink-soft);
    white-space: nowrap;
  }
  .ct8-hero-marquee-item span { color: var(--line-strong); }
  @keyframes ct8-marquee {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }
  @media (prefers-reduced-motion: reduce) {
    .ct8-hero-marquee-track { animation: none; }
  }

  /* ── About — premium circular photo: soft accent glow behind, a thin
     dashed accent ring floating outside the frame (offset from the photo
     itself, matching the hero's photo-orbit treatment), then the photo
     with its cream border and shadow. ── */
  .ct8-about-photo-orbit { position: relative; max-width: 320px; margin: 0 auto; }
  .ct8-about-photo-glow {
    position: absolute; inset: -14%; z-index: 0; border-radius: 50%;
    background: radial-gradient(circle, var(--accent-soft) 0%, transparent 70%);
    filter: blur(20px);
  }
  .ct8-about-photo-ring {
    position: absolute; inset: -10px; z-index: 0; border-radius: 50%;
    border: 1.5px dashed var(--line-strong);
  }
  .ct8-about-photo-wrap {
    position: relative; z-index: 1; border-radius: 50%; overflow: hidden;
    aspect-ratio: 1/1; width: 100%; max-width: 320px;
    box-shadow: var(--shadow-md); margin: 0 auto;
    border: 6px solid var(--card);
  }
  .ct8-about-photo { width: 100%; height: 100%; object-fit: cover; display: block; }
  .ct8-about-photo-badge {
    position: relative; z-index: 2; margin: -1.6rem auto 0; width: fit-content;
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--card); backdrop-filter: blur(6px);
    padding: 8px 16px 8px 8px; border-radius: 100px;
    font-family: 'Manrope', system-ui, sans-serif; font-weight: 700; font-size: 12px; color: var(--ink);
    box-shadow: var(--shadow-md);
  }
  .ct8-about-photo-badge-icon {
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    width: 24px; height: 24px; border-radius: 50%; background: var(--accent-soft); color: var(--accent);
  }

  /* ── About ── */
  .ct8-about-grid { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: clamp(2rem, 5vw, 3.5rem); align-items: start; }
  .ct8-about-grid--with-photo { grid-template-columns: 0.8fr 1.2fr; align-items: center; }
  @media (max-width: 860px) { .ct8-about-grid, .ct8-about-grid--with-photo { grid-template-columns: 1fr; } }
  .ct8-about-body { font-size: 15.5px; line-height: 1.8; color: var(--ink-soft); margin: 0 0 1.8rem; }
  .ct8-about-body--lead { font-size: 17px; line-height: 1.85; color: var(--ink); font-weight: 450; }
  .ct8-about-quote-wrap { position: relative; margin: 0 0 1.8rem; }
  .ct8-about-quote-mark {
    position: absolute; top: -1.6rem; left: -0.3rem; z-index: 0;
    font-family: 'Fraunces', Georgia, serif; font-size: 84px; line-height: 1;
    color: var(--accent-soft); pointer-events: none; user-select: none;
  }
  .ct8-about-quote-wrap .ct8-about-body { position: relative; z-index: 1; margin: 0; }
  .ct8-stat-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.9rem; margin-bottom: 1.6rem; }
  .ct8-stat-box { padding: 1.3rem; text-align: center; transition: transform 0.25s var(--ease), box-shadow 0.25s var(--ease), border-color 0.25s var(--ease); }
  .ct8-stat-box:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); border-color: var(--accent); }
  .ct8-stat-box-icon { display: flex; align-items: center; justify-content: center; color: var(--accent); margin-bottom: 6px; }
  .ct8-stat-box-num { font-family: 'Manrope', sans-serif; font-weight: 800; font-size: 28px; color: var(--accent); }
  .ct8-stat-box-lbl { font-size: 10.5px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-soft); margin-top: 4px; }
  .ct8-cred-card { padding: 1.5rem; margin-bottom: 1.4rem; }
  .ct8-cred-title { font-family: 'Manrope', sans-serif; font-weight: 700; font-size: 12px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink); display: block; margin-bottom: 0.9rem; }
  .ct8-cred-item { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 0.6rem; }
  .ct8-cred-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); margin-top: 6px; flex-shrink: 0; }
  .ct8-cred-text { font-size: 13.5px; color: var(--ink-soft); line-height: 1.5; }
  .ct8-chip-wrap { display: flex; flex-wrap: wrap; gap: 8px; }
  .ct8-chip { display: inline-flex; padding: 6px 14px; border-radius: 100px; border: 1px solid var(--line-strong); font-size: 12.5px; color: var(--ink-soft); background: var(--paper); }

  /* ── Services ── uses the shared bento system below (.ct8-bento-grid /
     .ct8-bento-tile) ── */

  /* ── FAQ ── */
  .ct8-faq-title { font-size: clamp(28px, 3.2vw, 38px); margin: 0 0 2rem; }
  .ct8-faq-item { border-bottom: 1px solid var(--line); transition: background 0.2s var(--ease); }
  .ct8-faq-item:hover { background: var(--accent-soft); }
  .ct8-faq-trigger { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 20px; background: none; border: none; cursor: pointer; padding: 1.5rem clamp(0.5rem, 2vw, 1rem); text-align: left; }
  .ct8-faq-q { font-family: 'Manrope', sans-serif; font-weight: 700; font-size: 18px; color: var(--ink); letter-spacing: -0.01em; }
  .ct8-faq-icon { font-size: 23px; color: var(--accent); transition: transform 0.25s var(--ease); flex-shrink: 0; }
  .ct8-faq-icon.open { transform: rotate(45deg); }
  .ct8-faq-body { max-height: 0; overflow: hidden; transition: max-height 0.35s var(--ease); }
  .ct8-faq-body.open { max-height: 600px; }
  .ct8-faq-ans { font-size: 15.5px; line-height: 1.72; color: var(--ink-soft); margin: 0 clamp(0.5rem, 2vw, 1rem) 1.5rem; max-width: 78ch; }

  /* ── Booking ── */
  .ct8-booking-grid { display: grid; grid-template-columns: 0.85fr 1.15fr; gap: clamp(2rem, 5vw, 3.5rem); align-items: start; }
  @media (max-width: 860px) { .ct8-booking-grid { grid-template-columns: 1fr; } }
  .ct8-session-card { padding: 1.5rem; margin-top: 1.2rem; }
  .ct8-session-row { display: flex; justify-content: space-between; padding: 0.55rem 0; border-bottom: 1px solid var(--line); font-size: 13.5px; }
  .ct8-session-row:last-child { border-bottom: none; }
  .ct8-session-key { color: var(--ink-soft); }
  .ct8-session-val { font-weight: 600; color: var(--ink); }
  .ct8-booking-card { padding: 1.8rem; }
  .ct8-step-label { font-family: 'Manrope', sans-serif; font-weight: 700; font-size: 11.5px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink-soft); display: block; margin-bottom: 0.8rem; }
  .ct8-day-chips, .ct8-time-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 1.6rem; }
  .ct8-day-chip, .ct8-time-chip {
    padding: 9px 15px; border-radius: 100px; border: 1px solid var(--line-strong);
    background: var(--paper); font-size: 12.5px; font-weight: 600; color: var(--ink);
    cursor: pointer; transition: all 0.2s var(--ease);
  }
  .ct8-day-chip.selected, .ct8-time-chip.selected { background: var(--accent); border-color: var(--accent); color: var(--accent-ink); }
  .ct8-input-group { display: flex; flex-direction: column; gap: 5px; }
  .ct8-input-label { font-size: 11.5px; font-weight: 600; color: var(--ink-soft); }
  .ct8-input {
    padding: 11px 14px; border-radius: var(--radius-sm); border: 1px solid var(--line-strong);
    background: var(--paper); font-family: 'Inter', sans-serif; font-size: 14px; color: var(--ink);
  }
  .ct8-input:focus { outline: none; border-color: var(--accent); }
  .ct8-btn-full { width: 100%; justify-content: center; }
  .ct8-booking-success { text-align: center; padding: 1.5rem 0; }
  .ct8-success-icon { width: 52px; height: 52px; border-radius: 50%; background: var(--accent-soft); color: var(--accent); display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; }
  .ct8-success-title { font-family: 'Manrope', sans-serif; font-weight: 700; font-size: 19px; margin: 0 0 0.5rem; }
  .ct8-success-body { font-size: 13.5px; color: var(--ink-soft); line-height: 1.6; }

  /* ── Footer ── */
  .ct8-footer { position: relative; background: var(--paper-2); border-top: 1px solid var(--line); padding: clamp(2.5rem, 6vh, 3.5rem) clamp(1.25rem, 5vw, 4rem) 1.6rem; }
  .ct8-footer::before {
    content: ''; position: absolute; top: -1px; left: 0; width: 64px; height: 3px;
    background: var(--accent);
  }
  .ct8-footer-inner { max-width: 1140px; margin: 0 auto; }
  .ct8-footer-top { display: grid; grid-template-columns: 1.3fr 1fr 1fr; gap: 2rem; padding-bottom: 2rem; }
  @media (max-width: 700px) { .ct8-footer-top { grid-template-columns: 1fr; gap: 1.4rem; } }
  .ct8-footer-name { font-family: 'Manrope', sans-serif; font-weight: 800; letter-spacing: -0.02em; font-size: clamp(26px, 3vw, 32px); margin: 0 0 0.5rem; }
  .ct8-footer-tagline { font-size: 16.5px; color: var(--ink-soft); line-height: 1.6; }
  .ct8-footer-col-title { display: block; font-family: 'Manrope', sans-serif; font-weight: 700; font-size: 14.5px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink); margin-bottom: 0.8rem; }
  .ct8-footer-link { display: block; background: none; border: none; padding: 0 0 0.7rem; cursor: pointer; text-align: left; font-size: 17px; color: var(--ink-soft); font-family: 'Inter', sans-serif; }
  .ct8-footer-link:hover { color: var(--accent); }
  .ct8-footer-socials { display: flex; flex-wrap: wrap; gap: 1.4rem; padding-bottom: 1.6rem; }
  .ct8-footer-social-link {
    font-family: 'Manrope', sans-serif; font-size: 16px; font-weight: 700;
    color: var(--ink-soft); text-decoration: none; letter-spacing: 0.02em;
  }
  .ct8-footer-social-link:hover { color: var(--accent); }
  .ct8-footer-bottom { border-top: 1px solid var(--line); padding-top: 1.4rem; }
  .ct8-footer-copy { font-size: 15px; color: var(--ink-soft); }

  /* ── Booking — Calendly-style modal card ── */
  .ct8-book-card {
    position: relative;
    display: grid;
    grid-template-columns: 380px 500px;
    border-radius: var(--radius); overflow: hidden;
    box-shadow: var(--shadow-md); background: var(--card);
    min-height: 460px;
    width: fit-content; max-width: 100%;
    margin: 0 auto;
  }
  .ct8-book-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px;
    background: var(--accent); z-index: 1;
  }
  .ct8-book-card--with-times { grid-template-columns: 380px 500px 280px; }
  .ct8-book-card--details { grid-template-columns: 380px 500px; }
  @media (max-width: 900px) {
    .ct8-book-card, .ct8-book-card--with-times, .ct8-book-card--details { grid-template-columns: 1fr; width: 100%; margin: 0; }
  }
  .ct8-book-info {
    padding: 2rem 2.2rem;
    border-right: 1px solid var(--line);
  }
  @media (max-width: 900px) { .ct8-book-info { border-right: none; border-bottom: 1px solid var(--line); } }
  .ct8-book-brand { font-family: 'Manrope', sans-serif; font-weight: 700; font-size: 12.5px; color: var(--accent); margin-bottom: 0.6rem; }
  .ct8-book-title { font-family: 'Manrope', sans-serif; font-weight: 800; font-size: 20px; color: var(--ink); margin: 0 0 1.1rem; line-height: 1.25; }
  .ct8-book-meta-row { display: flex; align-items: center; gap: 9px; font-size: 13px; font-weight: 600; color: var(--ink-soft); margin-bottom: 0.7rem; }
  .ct8-book-meta-row svg { flex-shrink: 0; color: var(--ink-soft); }
  .ct8-book-tz {
    margin-top: 1.6rem; padding-top: 1.2rem; border-top: 1px solid var(--line);
  }
  .ct8-book-tz-label { font-family: 'Manrope', sans-serif; font-weight: 700; font-size: 11.5px; color: var(--ink); margin-bottom: 0.5rem; }
  .ct8-book-tz-value { display: flex; align-items: center; gap: 7px; font-size: 12.5px; font-weight: 700; color: var(--ink-soft); }
  .ct8-book-tz-value svg { flex-shrink: 0; }
  .ct8-book-summary {
    font-size: 13px; color: var(--ink); line-height: 1.5;
  }
  .ct8-book-summary b { color: var(--accent); }

  .ct8-book-confirm-box {
    display: flex; align-items: center; gap: 9px;
    margin-top: 1.4rem; padding: 0.85rem 1rem;
    background: var(--accent-soft); border-radius: var(--radius-sm);
    font-size: 12.5px; color: var(--accent); line-height: 1.4;
  }
  .ct8-book-confirm-box svg { flex-shrink: 0; }
  .ct8-book-confirm-box b { color: var(--ink); }

  .ct8-book-details-head { display: flex; align-items: center; gap: 14px; margin-bottom: 1.4rem; }

  .ct8-book-cal-col { padding: 1.5rem 1.4rem; border-right: 1px solid var(--line); }
  @media (max-width: 900px) { .ct8-book-cal-col { border-right: none; border-bottom: 1px solid var(--line); } }
  .ct8-book-times-col {
    padding: 1.8rem 1.2rem;
    overflow-y: auto; overflow-x: hidden; max-height: 460px;
    border-left: 1px solid var(--line);
    box-sizing: border-box;
  }
  @media (max-width: 900px) { .ct8-book-times-col { border-left: none; border-top: 1px solid var(--line); } }
  .ct8-book-times-date { font-family: 'Manrope', sans-serif; font-weight: 700; font-size: 13.5px; color: var(--ink); margin-bottom: 1rem; }
  .ct8-book-slot-list { display: flex; flex-direction: column; gap: 10px; width: 100%; }
  .ct8-book-slot {
    width: 100%; box-sizing: border-box;
    padding: 12px 14px; border-radius: var(--radius-sm); border: 1.5px solid var(--accent);
    background: var(--paper); color: var(--accent); font-weight: 700; font-size: 13.5px;
    cursor: pointer; text-align: center; transition: all 0.2s var(--ease);
  }
  .ct8-book-slot:hover { background: var(--accent-soft); }
  .ct8-book-slot-row { display: flex; gap: 6px; align-items: center; }
  .ct8-book-slot-row .ct8-book-slot {
    flex: 1 1 0; min-width: 0; padding: 10px 6px; font-size: 12px;
  }
  .ct8-book-slot--picked { background: var(--ink); border-color: var(--ink); color: #fff; }
  .ct8-book-slot--picked:hover { background: var(--ink); border-color: var(--ink); color: #fff; filter: brightness(1.4); }
  .ct8-book-next {
    flex: 1 1 0; min-width: 0; padding: 10px 6px; border-radius: var(--radius-sm); border: none;
    background: var(--accent); color: var(--accent-ink); font-weight: 700; font-size: 12px; cursor: pointer;
  }

  /* ── Booking — calendar grid ── */
  .ct8-cal { max-width: 430px; margin: 0 auto; }
  .ct8-cal-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
  .ct8-cal-month { font-family: 'Manrope', sans-serif; font-weight: 800; font-size: 14px; color: var(--ink); }
  .ct8-cal-nav {
    width: 24px; height: 24px; border-radius: 50%; border: 1px solid var(--line-strong);
    background: transparent; color: var(--ink); display: grid; place-items: center; cursor: pointer;
    transition: all 0.2s var(--ease);
  }
  .ct8-cal-nav svg { width: 13px; height: 13px; }
  .ct8-cal-nav:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); background: var(--accent-soft); }
  .ct8-cal-nav:disabled { opacity: 0.25; cursor: default; }
  .ct8-cal-weekdays { display: grid; grid-template-columns: repeat(7,1fr); gap: 4px; margin-bottom: 10px; }
  .ct8-cal-weekdays span { text-align: center; font-size: 11px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: var(--ink-soft); padding: 2px 0; }
  .ct8-cal-grid { display: grid; grid-template-columns: repeat(7,1fr); gap: 8px; }
  .ct8-cal-cell {
    position: relative; aspect-ratio: 1; display: grid; place-items: center; border-radius: 50%;
    font-size: 15px; font-weight: 500; background: transparent; border: none;
    color: var(--ink-soft); cursor: default; transition: all 0.2s var(--ease);
    width: 48px; height: 48px; max-width: 100%; margin: 0 auto;
  }
  .ct8-cal-cell--blank { visibility: hidden; }
  .ct8-cal-cell--muted { color: var(--line-strong); }
  .ct8-cal-cell--open { color: var(--accent); cursor: pointer; font-weight: 500; background: var(--accent-soft); }
  .ct8-cal-cell--open:hover { background: var(--accent); color: var(--accent-ink); }
  .ct8-cal-cell--today:not(.ct8-cal-cell--selected) .ct8-cal-cell-dot { display: block; }
  .ct8-cal-cell--selected { background: var(--accent) !important; color: var(--accent-ink) !important; font-weight: 700; }
  .ct8-cal-cell-dot { display: none; position: absolute; bottom: 4px; left: 50%; transform: translateX(-50%); width: 4px; height: 4px; border-radius: 50%; background: var(--accent); }
  .ct8-cal-heading { font-family: 'Manrope', sans-serif; font-weight: 800; font-size: 18px; color: var(--ink); margin: 0 0 1.2rem; }

  /* ── Booking — details step ── */
  .ct8-book-details-col { grid-column: 2 / 3; padding: 1.8rem clamp(1.4rem, 4vw, 2.4rem); }
  @media (max-width: 900px) { .ct8-book-details-col { grid-column: 1 / -1; } }
  .ct8-book-back { display: inline-flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 50%; border: 1px solid var(--line-strong); background: transparent; color: var(--ink); cursor: pointer; flex-shrink: 0; }
  .ct8-book-back:hover { border-color: var(--accent); color: var(--accent); }
  .ct8-book-field { display: flex; flex-direction: column; gap: 5px; margin-bottom: 1rem; width: 100%; }
  .ct8-book-field label { font-size: 12px; font-weight: 700; color: var(--ink); }
  .ct8-book-field input, .ct8-book-field textarea {
    width: 100%; box-sizing: border-box;
    padding: 11px 14px; border-radius: var(--radius-sm); border: 1px solid var(--line-strong);
    background: var(--paper); font-family: 'Inter', sans-serif; font-size: 14px; color: var(--ink); resize: vertical;
  }
  .ct8-book-field input:focus, .ct8-book-field textarea:focus { outline: none; border-color: var(--accent); }
  .ct8-book-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; width: 100%; }

  @media (prefers-reduced-motion: reduce) {
    .ct8-root *, .ct8-root *::before, .ct8-root *::after {
      transition-duration: 0.001ms !important; animation-duration: 0.001ms !important;
    }
  }

  /* ───────────────────────────────────────────────────────────
     Student-portfolio sections ── Education / Research / Experience /
     Skills / Certifications / Recommendations. All additive, reuse the
     shared .ct8-card / .ct8-chip / .ct8-chip-wrap primitives defined above
     (in the About block) rather than redefining them.
     ──────────────────────────────────────────────────────── */

  /* Education — interactive icon journey. Icon-only nodes (no connecting
     line, no captions) — hovering/tapping reveals that milestone's details
     in a single shared detail card below. The final node summarizes
     clinical experience, so the row reads school → degrees → practice. */
  .ct8-journey { margin-top: 0.5rem; }
  .ct8-journey-track {
    position: relative;
    display: flex; justify-content: center; align-items: center;
    flex-wrap: wrap;
    gap: clamp(1.4rem, 4vw, 2.6rem);
    margin-bottom: clamp(2rem, 5vw, 3rem);
  }
  .ct8-journey-node-wrap {
    position: relative; z-index: 1;
    display: flex; flex-direction: column; align-items: center;
    background: none; border: none; cursor: pointer; padding: 0;
  }
  .ct8-journey-node {
    width: 84px; height: 84px; border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    background: var(--card); border: 2px solid var(--line-strong); color: var(--ink-soft);
    transition: all 0.25s var(--ease);
  }
  .ct8-journey-node-wrap:hover .ct8-journey-node,
  .ct8-journey-node-wrap:focus-visible .ct8-journey-node {
    border-color: var(--accent); color: var(--accent);
  }
  .ct8-journey-node-wrap.active .ct8-journey-node {
    background: var(--accent); border-color: var(--accent); color: var(--accent-ink);
    box-shadow: 0 8px 20px -6px var(--accent); transform: scale(1.08);
  }

  .ct8-journey-detail {
    position: relative; overflow: hidden;
    padding: 1.8rem clamp(1.6rem, 4vw, 2.4rem);
    animation: ct8-journey-fade 0.35s var(--ease);
  }
  .ct8-journey-detail::before {
    content: ''; position: absolute; top: 0; left: 0; bottom: 0; width: 4px; background: var(--accent);
  }
  @keyframes ct8-journey-fade {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .ct8-journey-detail-year {
    display: inline-flex; padding: 3px 11px; border-radius: 100px;
    background: var(--accent-soft); color: var(--accent);
  }
  .ct8-journey-detail-degree {
    font-family: 'Fraunces', Georgia, serif; font-weight: 500;
    font-size: clamp(20px, 2.2vw, 26px); line-height: 1.25; color: var(--ink);
    margin: 0.7rem 0 0.2rem;
  }
  .ct8-journey-detail-inst { font-size: 14.5px; font-weight: 600; color: var(--ink-soft); margin: 0 0 0.8rem; }
  .ct8-journey-detail-desc { font-size: 14.5px; line-height: 1.7; color: var(--ink-soft); margin: 0; max-width: 70ch; }
  @media (prefers-reduced-motion: reduce) {
    .ct8-journey-detail { animation: none; }
  }

  /* Experience node's detail body — stacked mini-entries within the same
     shared detail card used by education milestones. */
  .ct8-journey-exp-list { display: flex; flex-direction: column; gap: 1.1rem; margin-top: 0.9rem; }
  .ct8-journey-exp-item { padding-top: 1.1rem; border-top: 1px solid var(--line); }
  .ct8-journey-exp-item:first-child { padding-top: 0; border-top: none; }
  .ct8-journey-exp-head { display: flex; align-items: baseline; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
  .ct8-journey-exp-role { font-family: 'Manrope', sans-serif; font-weight: 700; font-size: 15.5px; color: var(--ink); }
  .ct8-journey-exp-duration { font-family: 'Manrope', sans-serif; font-size: 11.5px; font-weight: 700; color: var(--ink-soft); white-space: nowrap; }

  /* Education — vertical timeline. Marker + year pill both use --accent,
     so this automatically re-tints with the student/professional persona
     toggle rather than a fixed color that could clash with it. The ring
     around each marker matches the section's own background (paper-2, via
     ct8-section-alt) so it reads as a clean "cutout" on the connecting
     line instead of a hard edge. */
  .ct8-timeline { position: relative; display: flex; flex-direction: column; gap: 1.8rem; margin-top: 0.5rem; }
  .ct8-timeline::before {
    content: ''; position: absolute; left: 15px; top: 4px; bottom: 4px; width: 1px;
    background: var(--line-strong);
  }
  .ct8-timeline-item { position: relative; padding-left: 3.6rem; }
  .ct8-timeline-marker {
    position: absolute; left: 0; top: 0; width: 30px; height: 30px; border-radius: 50%;
    background: var(--accent); color: var(--accent-ink);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 0 5px var(--paper-2);
  }
  .ct8-timeline-card {
    padding: 1.4rem 1.6rem;
    transition: border-color 0.25s var(--ease), transform 0.25s var(--ease), box-shadow 0.25s var(--ease);
  }
  .ct8-timeline-card:hover { border-color: var(--accent); transform: translateX(3px); box-shadow: var(--shadow-md); }
  .ct8-timeline-year {
    display: inline-flex; padding: 3px 11px; border-radius: 100px;
    background: var(--accent-soft); color: var(--accent);
    font-family: 'Manrope', system-ui, sans-serif; font-size: 11px; font-weight: 700;
    letter-spacing: 0.06em; text-transform: uppercase;
  }
  .ct8-timeline-title { font-size: 18px; margin: 0.65rem 0 0.15rem; }
  .ct8-timeline-sub { font-size: 13.5px; color: var(--ink-soft); margin: 0; font-weight: 500; }
  .ct8-timeline-desc { font-size: 13.5px; color: var(--ink-soft); line-height: 1.6; margin: 0.6rem 0 0; }

  /* Research & Projects — card grid */
  .ct8-research-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem; }
  .ct8-research-card { padding: 1.6rem; display: flex; flex-direction: column; }
  .ct8-research-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.8rem; }
  .ct8-research-type {
    font-family: 'Manrope', system-ui, sans-serif; font-size: 11px; font-weight: 700;
    letter-spacing: 0.05em; text-transform: uppercase; color: var(--accent);
    background: var(--accent-soft); padding: 4px 10px; border-radius: 100px;
  }
  .ct8-research-year { font-size: 12px; color: var(--ink-soft); font-weight: 500; }
  .ct8-research-title { font-size: 17px; line-height: 1.3; margin: 0 0 0.6rem; }
  .ct8-research-desc { font-size: 13.5px; color: var(--ink-soft); line-height: 1.65; margin: 0; flex: 1; }
  .ct8-research-link {
    display: inline-block; margin-top: 1rem; font-size: 13px; font-weight: 700;
    color: var(--accent); text-decoration: none; font-family: 'Manrope', system-ui, sans-serif;
  }
  .ct8-research-link:hover { text-decoration: underline; }

  /* Clinical Experience — stacked cards */
  .ct8-exp-list { display: flex; flex-direction: column; gap: 1rem; }
  .ct8-exp-card { padding: 1.5rem 1.75rem; }
  .ct8-exp-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
  .ct8-exp-role { font-size: 17px; margin: 0; }
  .ct8-exp-org { font-size: 13.5px; color: var(--ink-soft); margin: 0.2rem 0 0; font-weight: 500; }
  .ct8-exp-duration {
    font-family: 'Manrope', system-ui, sans-serif; font-size: 11.5px; font-weight: 700;
    color: var(--ink-soft); white-space: nowrap; padding-top: 0.2rem;
  }
  .ct8-exp-desc { font-size: 13.5px; color: var(--ink-soft); line-height: 1.65; margin: 0.9rem 0 0; }

  /* Skills — two cards */
  .ct8-skills-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.25rem; }
  .ct8-skills-card { padding: 1.75rem; }
  .ct8-skills-card-title {
    font-family: 'Manrope', system-ui, sans-serif; font-size: 13px; font-weight: 700;
    color: var(--ink); display: block;
  }

  /* Certifications — compact grid */
  .ct8-cert-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 1.1rem; }
  .ct8-cert-card { padding: 1.4rem 1.5rem; }
  .ct8-cert-year {
    font-family: 'Manrope', system-ui, sans-serif; font-size: 11px; font-weight: 700;
    letter-spacing: 0.05em; color: var(--accent);
  }
  .ct8-cert-title { font-size: 15.5px; margin: 0.4rem 0 0.15rem; line-height: 1.35; }
  .ct8-cert-issuer { font-size: 12.5px; color: var(--ink-soft); margin: 0; }

  /* ───────────────────────────────────────────────────────────────
     Shared bento grid ── used by every content section except Hero, About,
     FAQ, and Booking. A fixed 6-column grid with a repeating asymmetric
     span pattern (nth-child based, so it self-adjusts to any list length),
     mixing one solid-ink "feature" tile in with plain hairline-bordered
     tiles — a bento layout that stays inside the same restrained
     ink/paper/hairline palette as the rest of the redesign.
     ───────────────────────────────────────────────────────── */
  .ct8-bento-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    grid-auto-rows: minmax(220px, auto);
    gap: 1rem;
  }
  .ct8-bento-tile {
    grid-column: span 2;
    padding: clamp(1.5rem, 2.6vw, 2rem);
    display: flex; flex-direction: column;
    position: relative;
    overflow: hidden;
    transition: transform 0.3s var(--ease), box-shadow 0.3s var(--ease), border-color 0.3s var(--ease);
  }
  .ct8-bento-tile::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: var(--accent); transform: scaleX(0); transform-origin: left center;
    transition: transform 0.3s var(--ease);
  }
  .ct8-bento-tile:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); border-color: var(--line-strong); }
  .ct8-bento-tile:hover::before { transform: scaleX(1); }

  .ct8-bento-grid .ct8-bento-tile:nth-child(6n+1) { grid-column: span 2; grid-row: span 2; }
  .ct8-bento-grid .ct8-bento-tile:nth-child(6n+2) { grid-column: span 2; grid-row: span 2; }
  .ct8-bento-grid .ct8-bento-tile:nth-child(6n+3) { grid-column: span 2; grid-row: span 2; }
  .ct8-bento-grid .ct8-bento-tile:nth-child(6n+4) { grid-column: span 2; }
  .ct8-bento-grid .ct8-bento-tile:nth-child(6n+5) { grid-column: span 2; }
  .ct8-bento-grid .ct8-bento-tile:nth-child(6n+6) { grid-column: span 2; }

  @media (max-width: 860px) {
    .ct8-bento-grid { grid-template-columns: 1fr; }
    .ct8-bento-grid .ct8-bento-tile,
    .ct8-bento-grid .ct8-bento-tile:nth-child(6n+1),
    .ct8-bento-grid .ct8-bento-tile:nth-child(6n+2),
    .ct8-bento-grid .ct8-bento-tile:nth-child(6n+3),
    .ct8-bento-grid .ct8-bento-tile:nth-child(6n+4),
    .ct8-bento-grid .ct8-bento-tile:nth-child(6n+5),
    .ct8-bento-grid .ct8-bento-tile:nth-child(6n+6) { grid-column: span 1; grid-row: auto; }
  }

  /* An equal-halves variant for pairs that should read as siblings rather
     than a hierarchy (e.g. Skills' two chip clusters). */
  .ct8-bento-grid--pair { grid-template-columns: repeat(2, 1fr); }
  .ct8-bento-grid--pair .ct8-bento-tile { grid-column: span 1 !important; grid-row: auto !important; }
  @media (max-width: 700px) { .ct8-bento-grid--pair { grid-template-columns: 1fr; } }
  /* When only one of the pair's tiles has content (e.g. Skills with only
     clinical OR only technical filled in), don't leave the other half of
     the grid empty — the single tile takes the full row instead. */
  .ct8-bento-grid--single { grid-template-columns: 1fr; }

  .ct8-bento-tile--dark {
    background: var(--ink); border-color: var(--ink); color: var(--paper);
  }
  .ct8-bento-tile--dark .ct8-bento-label { color: rgba(250,246,239,0.55); }
  .ct8-bento-tile--dark .ct8-bento-title { color: var(--paper); }
  .ct8-bento-tile--dark .ct8-bento-sub   { color: rgba(250,246,239,0.65); }
  .ct8-bento-tile--dark .ct8-bento-desc  { color: rgba(250,246,239,0.72); }
  .ct8-bento-tile--dark .ct8-bento-meta  { color: rgba(250,246,239,0.65); border-top-color: rgba(250,246,239,0.18); }
  .ct8-bento-tile--dark .ct8-bento-quote-mark { color: rgba(250,246,239,0.25); }
  .ct8-bento-tile--dark .ct8-chip { border-color: rgba(250,246,239,0.25); color: rgba(250,246,239,0.85); background: rgba(250,246,239,0.08); }
  .ct8-bento-tile--dark .ct8-bento-link { color: var(--paper); }

  .ct8-bento-label {
    font-family: 'Manrope', sans-serif; font-size: 10.5px; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase; 
  }
  .ct8-bento-title {
    font-family: 'Fraunces', Georgia, serif; font-weight: 500;
    font-size: clamp(18px, 1.7vw, 21px); line-height: 1.28;
    margin: 0.55rem 0 0.3rem; color: var(--ink);
  }
  .ct8-bento-sub { font-size: 13px; color: var(--ink-soft); font-weight: 500; margin: 0 0 0.6rem; }
  .ct8-bento-desc { font-size: 13.5px; line-height: 1.65; color: var(--ink-soft); margin: 0; flex: 1; }
  .ct8-bento-meta {
    margin-top: auto; padding-top: 0.9rem; border-top: 1px solid var(--line);
    font-size: 11.5px; font-weight: 600; color: var(--ink-soft);
  }
  .ct8-bento-link {
    display: inline-flex; align-items: center; gap: 5px; margin-top: 1rem;
    font-family: 'Manrope', sans-serif; font-weight: 700; font-size: 12.5px; color: var(--ink);
    text-decoration: underline; text-decoration-color: var(--line-strong); text-underline-offset: 4px;
  }
  .ct8-bento-link:hover { text-decoration-color: var(--ink); }
  .ct8-bento-quote-mark {
    font-family: 'Fraunces', Georgia, serif; font-size: 38px; line-height: 1; color: var(--line-strong);
    display: block; margin-bottom: -0.3rem;
  }
`

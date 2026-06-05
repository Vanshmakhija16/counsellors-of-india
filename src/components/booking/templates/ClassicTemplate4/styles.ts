// ClassicTemplate4 — Obsidian Noir · Ultra-Premium Dark Luxury

export const ct4Styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400;1,500&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@300;400;500&display=swap');

  /* ═══════════════════════════════════════
     ROOT DESIGN TOKENS — OBSIDIAN NOIR
  ═══════════════════════════════════════ */
  .ct4-root {
    --void:        #080808;
    --obsidian:    #0e0e0e;
    --charcoal:    #161616;
    --surface:     #1c1c1c;
    --surface-2:   #242424;
    --border:      rgba(255,255,255,0.07);
    --border-gold: rgba(212,175,55,0.35);

    --gold:        #D4AF37;
    --gold-light:  #F0D060;
    --gold-muted:  rgba(212,175,55,0.55);
    --gold-glow:   rgba(212,175,55,0.12);

    --platinum:    #E8E8E8;
    --silver:      #A0A0A0;
    --ghost:       rgba(232,232,232,0.45);

    --nav-h:       72px;
    --radius-sm:   2px;
    --radius:      8px;    /* subtle radius for cards */
    --radius-btn:  6px;    /* subtle radius for buttons */

    /* #5 — one easing + duration system for all interaction */
    --ease:        cubic-bezier(0.4, 0, 0.2, 1);
    --dur:         0.3s;

    /* #4 — elevation: soft layered shadows + a top inner-light that reads
       as polished stone/glass on dark surfaces */
    --shadow-1:    0 1px 2px rgba(0,0,0,0.4), 0 8px 24px -12px rgba(0,0,0,0.6);
    --shadow-2:    0 2px 4px rgba(0,0,0,0.4), 0 24px 60px -28px rgba(0,0,0,0.7);
    --edge-light:  inset 0 1px 0 rgba(255,255,255,0.045);

    background:  var(--void);
    color:       var(--platinum);
    font-family: 'DM Sans', system-ui, sans-serif;
    font-weight: 400;
    min-height:  100vh;
    overflow-x:  hidden;
    -webkit-font-smoothing: antialiased;
    transition: background 0.5s ease, color 0.5s ease;
  }

  /* ═══════════════════════════════════════
     LIGHT THEME — "AMETHYST & PEARL"
     Premium light counterpart to Obsidian Noir: soft lilac-pearl surfaces, a
     dusty mauve / amethyst accent with a warm brass secondary, and deep
     plum-ink text. Calm, dignified, introspective — purple reads as luxury +
     emotional safety, on-brief for therapy. Only the token VALUES change;
     every component reads the same var() names, so the accent (--gold) now
     resolves to mauve everywhere. */
  .ct4-root[data-theme='light'] {
    /* Warm greige page — the warm neutral makes the cool mauve read rich,
       not washed-out (warm/cool tension = the "expensive" look). */
    --void:        #ECE7E1;   /* warm greige page */
    --obsidian:    #E6E0D8;
    --charcoal:    #E0D9D0;
    --surface:     #F6F2EC;   /* cream raised card */
    --surface-2:   #FBF8F3;
    --border:      rgba(40,32,28,0.10);
    --border-gold: rgba(107,91,126,0.34);   /* mauve-tinted hairline */

    /* Accent (named --gold for legacy reasons) is now MAUVE / AMETHYST */
    --gold:        #5A4A6E;   /* deep mauve — crisp for text/links */
    --gold-light:  #6B5B7E;   /* the chosen dusty mauve — fills / hover */
    --gold-muted:  rgba(107,91,126,0.55);
    --gold-glow:   rgba(107,91,126,0.12);

    /* Warm brass kept available as a quiet secondary */
    --brass:       #B08A4F;

    --platinum:    #241C2B;   /* deep plum-ink primary text */
    --silver:      #756B66;   /* warm muted gray secondary */
    --ghost:       rgba(36,28,43,0.5);

    /* #4 — softer, longer, mauve-tinted shadows for the light surface */
    --shadow-1:    0 1px 2px rgba(40,32,28,0.06), 0 10px 30px -14px rgba(60,48,70,0.22);
    --shadow-2:    0 2px 6px rgba(40,32,28,0.07), 0 30px 70px -30px rgba(60,48,70,0.28);
    --edge-light:  inset 0 1px 0 rgba(255,255,255,0.6);

    background: var(--void);
    color: var(--platinum);
  }
  /* Nav glass adapts to the greige surface */
  .ct4-root[data-theme='light'] .ct4-nav { background: rgba(236,231,225,0.74); }
  .ct4-root[data-theme='light'] .ct4-nav[data-scrolled='true'] {
    background: rgba(236,231,225,0.96);
    box-shadow: 0 1px 40px rgba(40,32,28,0.09), 0 0 0 0.5px rgba(107,91,126,0.16);
  }
  .ct4-root[data-theme='light'] .ct4-drawer { background: rgba(240,235,229,0.98); }
  /* Marble overlay is meant for dark surfaces — mute it on light */
  .ct4-root[data-theme='light'] .ct4-marble::before { opacity: 0; }

  /* ── Marble texture overlay on key sections ── */
  .ct4-marble::before {
    content: '';
    position: absolute; inset: 0; pointer-events: none; z-index: 0;
    opacity: 0.03; mix-blend-mode: screen;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600'><filter id='m'><feTurbulence type='turbulence' baseFrequency='0.012' numOctaves='6' seed='5'/><feColorMatrix values='0 0 0 0 0.85 0 0 0 0 0.7 0 0 0 0 0.2 0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23m)'/></svg>");
    background-size: 600px 600px;
  }

  /* ── Gold shimmer keyframe ── */
  @keyframes ct4-shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
  .ct4-gold-shimmer {
    background: linear-gradient(90deg, var(--gold) 0%, var(--gold-light) 40%, var(--gold) 100%);
    background-size: 800px 100%;
    animation: ct4-shimmer 3.5s linear infinite;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  /* ═══════════════════════════════════════
     NAVIGATION
  ═══════════════════════════════════════ */
  .ct4-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 50;
    height: var(--nav-h);
    background: rgba(8,8,8,0.7);
    backdrop-filter: blur(24px) saturate(180%);
    -webkit-backdrop-filter: blur(24px) saturate(180%);
    border-bottom: 1px solid var(--border);
    transition: background 0.5s ease, box-shadow 0.5s ease;
  }
  .ct4-nav[data-scrolled='true'] {
    background: rgba(8,8,8,0.95);
    box-shadow: 0 1px 40px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(212,175,55,0.12);
  }
  .ct4-nav-inner {
    max-width: 1400px; margin: 0 auto;
    height: 100%; padding: 0 clamp(1.25rem, 4vw, 5.7rem);
    display: flex; align-items: center; justify-content: space-between; gap: 1rem;
  }

  /* Logo mark */
  .ct4-nav-logo {
    display: flex; align-items: center; gap: 12px;
    background: none; border: none; cursor: pointer; text-decoration: none;
  }
  .ct4-nav-emblem {
    width: auto; height: 38px;
    // border: 1px solid var(--gold-muted);
    display: flex; align-items: center; justify-content: center;
    position: relative;
    // background: rgba(212,175,55,0.04);
    transition: border-color 0.3s ease, background 0.3s ease;
  }
  // .ct4-nav-emblem:hover { border-color: var(--gold); background: var(--gold-glow); }
  .ct4-nav-emblem-text {
    font-family: 'Playfair Display', serif;
    font-size: 15px; font-weight: 500;
    color: var(--gold);
    letter-spacing: 0.04em;
  }
  .ct4-nav-wordmark {
    font-family: 'DM Mono', monospace;
    font-size: 9px; letter-spacing: 0.15em;
    text-transform: uppercase; color: var(--silver);
  }

  /* Nav links */
  .ct4-nav-links {
    display: none; align-items: center; gap: 0;
  }
  @media (min-width: 900px) { .ct4-nav-links { display: flex; } }
  .ct4-nav-link {
    position: relative;
    background: none; border: none; cursor: pointer;
    font-family: 'DM Mono', monospace;
    font-size: 9.5px; letter-spacing: 0.28em; text-transform: uppercase;
    color: var(--silver); padding: 10px 18px;
    transition: color 0.25s ease;
  }
  .ct4-nav-link::after {
    content: ''; position: absolute;
    bottom: 6px; left: 18px; right: 18px; height: 0.5px;
    background: var(--gold); transform: scaleX(0);
    transition: transform 0.35s cubic-bezier(0.7, 0, 0.2, 1);
    transform-origin: left;
  }
  .ct4-nav-link:hover, .ct4-nav-link.active { color: var(--gold-light); }
  .ct4-nav-link:hover::after, .ct4-nav-link.active::after { transform: scaleX(1); }

  /* Nav CTA */
  .ct4-nav-cta {
    display: none; align-items: center; gap: 8px;
    padding: 10px 22px; border: 1px solid var(--gold-muted);
    background: transparent; color: var(--gold);
    font-family: 'DM Mono', monospace;
    font-size: 9px; letter-spacing: 0.3em; text-transform: uppercase;
    border-radius: var(--radius-btn);
    cursor: pointer; transition: all var(--dur) var(--ease);
  }
  @media (min-width: 560px) { .ct4-nav-cta { display: inline-flex; } }
  .ct4-nav-cta:hover {
    background: var(--gold); color: var(--void);
    box-shadow: 0 0 24px rgba(212,175,55,0.35);
  }

  /* Right-actions cluster — sits hard-right (brand sits hard-left) */
  .ct4-nav-actions { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }

  /* Theme toggle */
  .ct4-theme-toggle {
    display: flex; align-items: center; justify-content: center;
    width: 38px; height: 38px; flex-shrink: 0;
    border: 1px solid var(--border-gold);
    border-radius: 50%;
    background: transparent;
    color: var(--gold);
    cursor: pointer;
    transition: color 0.3s ease, border-color 0.3s ease, background 0.3s ease, transform 0.2s ease;
  }
  .ct4-theme-toggle:hover {
    color: var(--gold-light);
    border-color: var(--gold);
    background: var(--gold-glow);
    transform: translateY(-1px);
  }
  .ct4-theme-toggle:active { transform: scale(0.94); }
  .ct4-theme-toggle svg { transition: transform 0.4s cubic-bezier(0.7,0,0.2,1); }
  .ct4-theme-toggle:hover svg { transform: rotate(35deg); }

  /* Hamburger */
  .ct4-hamburger {
    display: flex; flex-direction: column; justify-content: center;
    gap: 5px; width: 30px; height: 30px;
    background: none; border: none; cursor: pointer; padding: 3px;
  }
  @media (min-width: 900px) { .ct4-hamburger { display: none; } }
  .ct4-ham-line {
    display: block; width: 100%; height: 0.5px;
    background: var(--platinum);
    transition: transform 0.3s ease, opacity 0.3s ease;
    transform-origin: center;
  }
  .ct4-ham-line.open:nth-child(1) { transform: translateY(5.5px) rotate(45deg); }
  .ct4-ham-line.open:nth-child(2) { opacity: 0; }
  .ct4-ham-line.open:nth-child(3) { transform: translateY(-5.5px) rotate(-45deg); }

  /* Mobile drawer */
  .ct4-drawer {
    background: rgba(8,8,8,0.98);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border-gold);
    overflow: hidden; max-height: 0;
    transition: max-height 0.5s cubic-bezier(0.7, 0, 0.2, 1);
  }
  @media (min-width: 900px) { .ct4-drawer { display: none; } }
  .ct4-drawer.open { max-height: 500px; }
  .ct4-drawer-inner { padding: 1.5rem 2.5rem 2rem; }
  .ct4-drawer-item {
    display: flex; align-items: center; gap: 16px;
    width: 100%; background: none; border: none;
    border-bottom: 0.5px solid var(--border);
    padding: 16px 0; cursor: pointer; text-align: left;
    font-family: 'Playfair Display', serif;
    font-size: 20px; font-weight: 400;
    color: var(--platinum);
    transition: color 0.2s ease, padding-left 0.2s ease;
  }
  .ct4-drawer-item:hover, .ct4-drawer-item.active {
    color: var(--gold); padding-left: 10px;
  }
  .ct4-drawer-num {
    font-family: 'DM Mono', monospace;
    font-size: 9px; letter-spacing: 0.2em;
    color: var(--gold-muted); flex-shrink: 0;
  }

  /* ═══════════════════════════════════════
     TYPOGRAPHY SYSTEM
  ═══════════════════════════════════════ */
  .ct4-display {
    font-family: 'Playfair Display', Georgia, serif;
    font-weight: 400; letter-spacing: -0.02em;
  }
  .ct4-display-italic {
    font-family: 'Playfair Display', Georgia, serif;
    font-weight: 400; font-style: italic;
  }
  .ct4-serif { font-family: 'Playfair Display', Georgia, serif; }
  .ct4-sans  { font-family: 'DM Sans', system-ui, sans-serif; }
  .ct4-mono  { font-family: 'DM Mono', ui-monospace, monospace; }

  /* #1 — eyebrow is a "whisper" accent: muted gold, not full strength,
     so the loud accent is reserved for CTAs and the one italic emphasis. */
  .ct4-eyebrow {
    font-family: 'DM Mono', monospace;
    font-size: 10px; letter-spacing: 0.35em;
    text-transform: uppercase; color: var(--gold-muted);
  }
  .ct4-rule         { height: 0.5px; background: var(--border); }
  .ct4-rule-gold    { height: 0.5px; background: var(--gold-muted); }
  .ct4-rule-gold-2  { height: 1px; background: linear-gradient(90deg, transparent, var(--gold), transparent); }

  /* ═══════════════════════════════════════
     SCROLL PROGRESS
  ═══════════════════════════════════════ */
  .ct4-progress {
    position: fixed; top: var(--nav-h); left: 0; z-index: 60;
    height: 1px;
    background: linear-gradient(90deg, var(--gold-muted), var(--gold-light), var(--gold-muted));
    pointer-events: none;
    transition: width 0.05s linear;
    box-shadow: 0 0 8px var(--gold-muted);
  }

  /* ═══════════════════════════════════════
     HERO — PLAIN CENTRED (NO PHOTO)
  ═══════════════════════════════════════ */
  .ct4-hero-plain {
    position: relative;
    min-height: 100vh;
    background: var(--void);
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    text-align: center;
    padding: clamp(5rem, 12vh, 9rem) clamp(1.5rem, 8vw, 10rem);
    overflow: hidden;
  }

  /* Noise-grain texture */
  .ct4-hero-grain {
    position: absolute; inset: 0; pointer-events: none; z-index: 0;
    opacity: 0.028;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' seed='3'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 0.85  0 0 0 0 0.2  0 0 0 0.22 0'/></filter><rect width='100%' height='100%' filter='url(%23g)'/></svg>");
    background-size: 300px 300px;
  }

  /* Faint radial gold glow behind quote */
  .ct4-hero-glow {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: min(900px, 120vw); height: min(600px, 80vh);
    background: radial-gradient(ellipse at center, rgba(212,175,55,0.055) 0%, transparent 68%);
    pointer-events: none; z-index: 0;
  }

  /* All hero plain children sit above grain/glow */
  .ct4-hero-plain > *:not(.ct4-hero-grain):not(.ct4-hero-glow) {
    position: relative; z-index: 1;
  }

  /* Top label — "Licensed Therapist · City" */
  .ct4-hero-plain-label {
    display: flex; align-items: center; gap: 16px;
    margin-bottom: 2.4rem;
  }
  .ct4-hero-plain-label-line {
    display: block; width: 36px; height: 0.5px;
    background: var(--gold-muted); flex-shrink: 0;
  }

  /* Name */
  .ct4-hero-plain-name {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(42px, 6.5vw, 88px);
    font-weight: 400; line-height: 1.04;
    letter-spacing: -0.03em;
    color: var(--platinum);
    margin: 0 0 0.5rem;
  }

  /* Credential subtitle */
  .ct4-hero-plain-cred {
    font-family: 'DM Sans', system-ui, sans-serif;
    font-size: clamp(13px, 1.3vw, 16px);
    font-weight: 300; letter-spacing: 0.04em;
    color: var(--silver); margin: 0;
  }

  /* Gold ornament divider */
  .ct4-hero-plain-ornament {
    display: flex; align-items: center; justify-content: center;
    gap: 10px; margin: 5rem auto;
    

    width: min(280px, 80vw);
  }
  .ct4-hero-plain-orn-line {
    flex: 1; height: 0.5px;
    background: linear-gradient(90deg, transparent, var(--gold-muted));
  }
  .ct4-hero-plain-orn-line:last-child {
    background: linear-gradient(90deg, var(--gold-muted), transparent);
  }
  .ct4-hero-plain-orn-diamond {
    width: 5px; height: 5px;
    background: var(--gold);
    transform: rotate(45deg); flex-shrink: 0;
    opacity: 0.7;
  }
  .ct4-hero-plain-orn-dot {
    width: 3px; height: 3px; border-radius: 50%;
    background: var(--gold); flex-shrink: 0;
  }

  /* Pull quote */
  .ct4-hero-plain-quote {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(20px, 3vw, 38px);
    font-weight: 400; font-style: italic;
    line-height: 1.5; letter-spacing: -0.01em;
    color: var(--platinum);
    max-width: 22em; margin: 0;
    position: relative;
  }
  .ct4-hero-plain-qmark {
    font-family: 'Playfair Display', serif;
    font-size: 1.6em; line-height: 0;
    vertical-align: -0.28em;
    color: var(--gold); opacity: 0.55;
    font-style: normal; margin: 0 0.08em;
    user-select: none;
  }
  .ct4-hero-plain-qmark-close { vertical-align: -0.15em; }

  /* Quote attribution */
  .ct4-hero-plain-attr {
    display: flex; align-items: center; justify-content: center;
    gap: 14px; margin-top: 1.4rem;
  }
  .ct4-hero-plain-attr-line {
    display: block; width: 24px; height: 0.5px; background: var(--gold-muted);
  }

  /* Stats row */
  .ct4-hero-plain-stats {
    display: flex; gap: clamp(2rem, 5vw, 4rem); flex-wrap: wrap;
    justify-content: center;
    margin-top: 3.5rem; padding-top: 2.5rem;
    border-top: 0.5px solid var(--border);
    width: 100%;
  }
  .ct4-hero-plain-stat {
    display: flex; flex-direction: column; align-items: center; gap: 6px;
  }

  /* Shared stat number/label (reused from above) */
  .ct4-stat-num {
    font-family: 'Playfair Display', serif;
    font-size: 26px; font-weight: 400;
    color: var(--gold); line-height: 1;
  }
  .ct4-stat-label {
    font-family: 'DM Mono', monospace;
    font-size: 9px; letter-spacing: 0.28em;
    text-transform: uppercase; color: var(--silver);
  }

  /* CTAs */
  .ct4-hero-plain-ctas {
    display: flex; gap: 14px; flex-wrap: wrap;
    justify-content: center; margin-top: 2.8rem;
  }

  /* Scroll hint */
  .ct4-hero-plain-scroll {
    display: flex; flex-direction: column; align-items: center; gap: 10px;
    margin-top: 3.5rem;
  }
  .ct4-hero-plain-scroll-line {
    display: block; width: 0.5px; height: 40px;
    background: linear-gradient(to bottom, var(--gold-muted), transparent);
    animation: ct4-scroll-drop 1.8s ease-in-out infinite;
  }
  @keyframes ct4-scroll-drop {
    0%   { opacity: 0; transform: scaleY(0); transform-origin: top; }
    40%  { opacity: 1; transform: scaleY(1); transform-origin: top; }
    80%  { opacity: 0; transform: scaleY(1); transform-origin: bottom; }
    100% { opacity: 0; }
  }

  /* ═══════════════════════════════════════
     MARQUEE TICKER
  ═══════════════════════════════════════ */
  .ct4-ticker {
    border-top: 0.5px solid var(--border-gold);
    border-bottom: 0.5px solid var(--border-gold);
    background: var(--charcoal);
    overflow: hidden; padding: 11px 0;
  }
  .ct4-ticker-belt {
    display: flex; white-space: nowrap;
    animation: ct4-ticker-scroll 40s linear infinite;
  }
  .ct4-ticker-belt:hover { animation-play-state: paused; }
  @keyframes ct4-ticker-scroll {
    from { transform: translateX(0); } to { transform: translateX(-50%); }
  }
  .ct4-ticker-item {
    font-family: 'DM Mono', monospace;
    font-size: 9.5px; letter-spacing: 0.32em;
    text-transform: uppercase; color: var(--gold-muted);
    padding-right: 3.5rem; flex-shrink: 0;
    display: flex; align-items: center; gap: 3rem;
  }
  .ct4-ticker-dot {
    width: 3px; height: 3px; border-radius: 50%;
    background: var(--gold); flex-shrink: 0;
  }

  /* ═══════════════════════════════════════
     SECTION SHELL — SHARED LAYOUT
  ═══════════════════════════════════════ */
  .ct4-section {
    position: relative;
    padding: clamp(4rem, 10vh, 8rem) clamp(2rem, 6vw, 7rem);
  }
  .ct4-container { max-width: 1200px; margin: 0 auto; }

  .ct4-section-header {
    display: flex; align-items: flex-end; justify-content: space-between;
    padding-bottom: 2rem; margin-bottom: 4rem;
    border-bottom: 0.5px solid var(--border);
  }
  .ct4-section-pg {
    font-family: 'DM Mono', monospace;
    font-size: 10px; letter-spacing: 0.28em;
    color: var(--silver); opacity: 0.4;
  }
  .ct4-section-title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(38px, 5.5vw, 72px);
    font-weight: 400; line-height: 1.02; letter-spacing: -0.025em;
    color: var(--platinum); margin: 0.6rem 0 0;
  }
  .ct4-section-title em { font-style: italic; color: var(--gold); }

  /* ═══════════════════════════════════════
     ABOUT SECTION
  ═══════════════════════════════════════ */
  .ct4-about { background: var(--obsidian); }
  .ct4-about-grid {
    display: grid;
    grid-template-columns: 1.5fr 1fr;
    gap: 4rem 6rem;
    align-items: start;
  }
  @media (max-width: 900px) { .ct4-about-grid { grid-template-columns: 1fr; gap: 3rem; } }

  .ct4-drop-cap {
    float: left; font-family: 'Playfair Display', serif;
    font-size: clamp(72px, 9vw, 108px);
    line-height: 0.72; margin: 0.12em 0.18em 0 0;
    color: var(--gold); font-weight: 400;
  }
  .ct4-about-body {
    font-size: clamp(15px, 1.4vw, 18px);
    line-height: 1.85; font-weight: 300;
    color: var(--ghost); margin: 0;
  }

  /* Spec card */
  .ct4-spec-card {
    background: var(--surface);
    border: 0.5px solid var(--border-gold);
    padding: 2rem 2.2rem;
    position: relative;
    border-radius: var(--radius);
    max-height:81vh;
    overflow: hidden;
    box-shadow: var(--shadow-1), var(--edge-light);
  }
  .ct4-spec-card::before {
    content: ''; position: absolute;
    top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, var(--gold), transparent);
  }
  .ct4-spec-row {
    display: flex; justify-content: space-between; align-items: baseline;
    padding: 13px 0; border-bottom: 0.5px solid var(--border);
  }
  .ct4-spec-row:last-child { border-bottom: none; }
  .ct4-spec-key {
    font-family: 'DM Mono', monospace;
    font-size: 9px; letter-spacing: 0.26em;
    text-transform: uppercase; color: var(--silver); opacity: 0.7;
  }
  .ct4-spec-val {
    font-family: 'Playfair Display', serif;
    font-size: 14px; color: var(--platinum);
    text-align: right; max-width: 60%;
  }

  /* ═══════════════════════════════════════
     SERVICES / METHOD
  ═══════════════════════════════════════ */
  .ct4-services { background: var(--void); }
  .ct4-services-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1px;
    background: var(--border);
    border: 0.5px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
  }
  @media (max-width: 768px) { .ct4-services-grid { grid-template-columns: 1fr; } }
  .ct4-service-card {
    background: var(--charcoal);
    padding: 2.5rem 2rem;
    position: relative; overflow: hidden;
    transition: background var(--dur) var(--ease), box-shadow var(--dur) var(--ease), transform var(--dur) var(--ease);
  }
  .ct4-service-card::before {
    content: ''; position: absolute;
    inset: 0; opacity: 0;
    background: radial-gradient(ellipse at top left, var(--gold-glow) 0%, transparent 70%);
    transition: opacity 0.4s var(--ease);
  }
  .ct4-service-card:hover { background: var(--surface); box-shadow: var(--shadow-2), var(--edge-light); transform: translateY(-2px); z-index: 1; }
  .ct4-service-card:hover::before { opacity: 1; }
  .ct4-service-number {
    font-family: 'Playfair Display', serif;
    font-size: 48px; font-weight: 400;
    color: var(--gold); opacity: 0.15; line-height: 1;
    display: block; margin-bottom: 1rem;
    transition: opacity 0.3s ease;
  }
  .ct4-service-card:hover .ct4-service-number { opacity: 0.4; }
  .ct4-service-name {
    font-family: 'Playfair Display', serif;
    font-size: 18px; font-weight: 400;
    color: var(--platinum); margin: 0 0 0.8rem;
  }
  .ct4-service-desc {
    font-size: 13px; line-height: 1.75;
    color: var(--silver); font-weight: 300;
  }

  /* Specialty chips */
  .ct4-specialty-wrap { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 2.5rem; }
  .ct4-specialty-chip {
    padding: 7px 14px;
    border: 0.5px solid var(--border-gold);
    background: transparent; color: var(--gold-muted);
    font-family: 'DM Mono', monospace;
    font-size: 9.5px; letter-spacing: 0.16em; text-transform: uppercase;
    transition: all 0.25s ease; cursor: default;
  }
  .ct4-specialty-chip:hover {
    background: var(--gold-glow); color: var(--gold); border-color: var(--gold);
  }

  /* ═══════════════════════════════════════
     TESTIMONIALS / INSIGHTS
  ═══════════════════════════════════════ */
  .ct4-testimonials { background: var(--charcoal); overflow: hidden; }
  .ct4-testimonial-main { max-width: 1120px; }
  .ct4-quote-mark {
    font-family: 'Playfair Display', serif;
    font-size: clamp(80px, 12vw, 160px);
    line-height: 0.6; color: var(--gold); opacity: 0.12;
    user-select: none; display: block; margin-bottom: -0.3em;
  }
  .ct4-quote-text {
    font-family: 'Playfair Display', serif;
    font-size: clamp(20px, 3.2vw, 36px);
    font-weight: 400; font-style: italic;
    line-height: 1.45; letter-spacing: -0.01em;
    color: var(--platinum);
  }
  .ct4-quote-author {
    margin-top: 2rem; display: flex; align-items: center; gap: 12px;
  }
  .ct4-quote-author-line { width: 24px; height: 0.5px; background: var(--gold-muted); }
  .ct4-quote-author-name {
    font-family: 'DM Mono', monospace;
    font-size: 9.5px; letter-spacing: 0.26em;
    text-transform: uppercase; color: var(--gold-muted);
  }
  .ct4-quote-dots { display: flex; gap: 10px; margin-top: 2.5rem; }
  .ct4-quote-dot {
    height: 0.5px; background: var(--border);
    border: none; cursor: pointer; padding: 0;
    transition: background 0.3s ease, width 0.3s ease;
  }
  .ct4-quote-dot.active { background: var(--gold); width: 36px !important; }

  /* ═══════════════════════════════════════
     FAQ
  ═══════════════════════════════════════ */
  .ct4-faq { background: var(--obsidian); }
  .ct4-faq-item { border-bottom: 0.5px solid var(--border); overflow: hidden; }
  .ct4-faq-trigger {
    width: 100%; background: none; border: none; cursor: pointer;
    padding: 1.6rem 0; text-align: left;
    display: flex; align-items: center; justify-content: space-between; gap: 2rem;
    transition: color 0.25s ease;
  }
  .ct4-faq-trigger:hover .ct4-faq-q { color: var(--gold-light); }
  .ct4-faq-q {
    font-family: 'Playfair Display', serif;
    font-size: clamp(16px, 1.6vw, 20px); font-weight: 400;
    color: var(--platinum); transition: color 0.25s ease;
  }
  .ct4-faq-icon {
    width: 20px; height: 20px; flex-shrink: 0;
    border: 0.5px solid var(--border-gold); border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    color: var(--gold-muted); transition: transform 0.3s ease, background 0.3s ease;
    font-size: 12px;
  }
  .ct4-faq-icon.open {
    transform: rotate(45deg); background: var(--gold-glow);
    border-color: var(--gold); color: var(--gold);
  }
  .ct4-faq-body {
    max-height: 0; overflow: hidden;
    transition: max-height 0.45s cubic-bezier(0.7, 0, 0.2, 1);
  }
  .ct4-faq-body.open { max-height: 500px; }
  .ct4-faq-ans {
    font-size: 15px; line-height: 1.85;
    color: var(--ghost); font-weight: 300;
    padding: 0 0 1.8rem; max-width: 68ch;
  }

  /* ═══════════════════════════════════════
     BOOKING SECTION
  ═══════════════════════════════════════ */
  .ct4-booking { background: var(--void); }
  .ct4-booking-grid {
    display: grid; grid-template-columns: 1fr 1.3fr;
    gap: 4rem 5rem; align-items: start;
  }
  @media (max-width: 900px) { .ct4-booking-grid { grid-template-columns: 1fr; gap: 3rem; } }

  .ct4-booking-info-body {
    font-size: 15px; line-height: 1.85;
    color: var(--ghost); font-weight: 300;
    max-width: 44ch; margin: 0 0 2rem;
  }

  /* Calendar chips */
  .ct4-day-chips { display: flex; flex-wrap: wrap; gap: 6px; }
  .ct4-day-chip {
    padding: 9px 14px; border: 0.5px solid var(--border);
    background: transparent; color: var(--silver);
    font-family: 'DM Mono', monospace;
    font-size: 9.5px; letter-spacing: 0.14em; text-transform: uppercase;
    border-radius: var(--radius-btn);
    cursor: pointer; transition: all var(--dur) var(--ease);
  }
  .ct4-day-chip:hover:not(.selected) { border-color: var(--gold-muted); color: var(--gold-muted); }
  .ct4-day-chip.selected {
    background: var(--gold); color: var(--void); border-color: var(--gold);
    box-shadow: 0 0 16px rgba(212,175,55,0.3);
  }

  /* Time chips */
  .ct4-time-chips { display: flex; flex-wrap: wrap; gap: 6px; }
  .ct4-time-chip {
    padding: 8px 14px; border: 0.5px solid var(--border);
    background: transparent; color: var(--silver);
    font-family: 'DM Mono', monospace;
    font-size: 9.5px; letter-spacing: 0.12em;
    border-radius: var(--radius-btn);
    cursor: pointer; transition: all var(--dur) var(--ease);
  }
  .ct4-time-chip:hover:not(.selected):not(:disabled) { border-color: var(--gold-muted); color: var(--gold-muted); }
  .ct4-time-chip.selected {
    background: var(--gold); color: var(--void); border-color: var(--gold);
  }
  .ct4-time-chip:disabled { opacity: 0.25; cursor: not-allowed; text-decoration: line-through; }

  /* Input fields */
  .ct4-input {
    width: 100%; background: transparent;
    border: none; border-bottom: 0.5px solid var(--border);
    color: var(--platinum); padding: 14px 0;
    font-family: 'DM Sans', system-ui; font-size: 14px; font-weight: 300;
    outline: none; transition: border-color 0.25s ease; border-radius: 0;
  }
  .ct4-input::placeholder { color: var(--silver); opacity: 0.4; font-style: italic; }
  .ct4-input:focus { border-bottom-color: var(--gold); }

  /* Booking card */
  .ct4-booking-card {
    // background: var(--charcoal);
    background: var(--surface);

    border: 0.5px solid var(--border-gold);
    padding: 2.5rem 2.5rem;
    position: relative;
    border-radius: var(--radius);
    overflow: hidden;
    box-shadow: var(--shadow-1), var(--edge-light);
  }
  .ct4-booking-card::before {
    content: ''; position: absolute;
    top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, var(--gold-muted), transparent);
  }

  /* Success state */
  .ct4-booking-success {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; text-align: center; padding: 4rem 2rem;
  }
  .ct4-success-ring {
    width: 64px; height: 64px;
    border: 1px solid var(--gold); border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    color: var(--gold); margin-bottom: 1.5rem;
    box-shadow: 0 0 32px rgba(212,175,55,0.2);
  }

  /* ═══════════════════════════════════════
     FOOTER
  ═══════════════════════════════════════ */
  .ct4-footer {
    background: var(--void);
    padding: 3rem clamp(2rem, 6vw, 7rem) 2.5rem;
    border-top: 0.5px solid var(--border);
  }
  .ct4-footer-inner {
    max-width: 1200px; margin: 0 auto;
    display: flex; flex-wrap: wrap; gap: 1.5rem;
    align-items: center; justify-content: space-between;
  }
  .ct4-footer-brand {
    font-family: 'Playfair Display', serif;
    font-size: 18px; color: var(--gold); letter-spacing: 0.04em;
  }
  .ct4-footer-copy {
    font-family: 'DM Mono', monospace;
    font-size: 9px; letter-spacing: 0.22em;
    text-transform: uppercase; color: var(--silver); opacity: 0.4;
  }
  .ct4-footer-links { display: flex; gap: 1.5rem; flex-wrap: wrap; }
  .ct4-footer-link {
    font-family: 'DM Mono', monospace;
    font-size: 9px; letter-spacing: 0.22em;
    text-transform: uppercase; color: var(--silver); opacity: 0.55;
    background: none; border: none; cursor: pointer;
    transition: color 0.2s ease, opacity 0.2s ease;
  }
  .ct4-footer-link:hover { color: var(--gold); opacity: 1; }

  /* ═══════════════════════════════════════
     BUTTONS
  ═══════════════════════════════════════ */
  .ct4-btn-primary {
    display: inline-flex; align-items: center; gap: 10px;
    padding: 16px 32px; background: var(--gold); color: var(--void);
    font-family: 'DM Mono', monospace;
    font-size: 9.5px; letter-spacing: 0.28em; text-transform: uppercase;
    border: none; cursor: pointer;
    border-radius: var(--radius-btn);
    box-shadow: var(--shadow-1);
    transition: background var(--dur) var(--ease), box-shadow var(--dur) var(--ease), transform var(--dur) var(--ease);
  }
  .ct4-btn-primary:hover {
    background: var(--gold-light);
    box-shadow: 0 0 32px var(--gold-glow), var(--shadow-2);
    transform: translateY(-2px);
  }
  .ct4-btn-ghost {
    display: inline-flex; align-items: center; gap: 10px;
    padding: 15px 30px; background: transparent; color: var(--gold);
    font-family: 'DM Mono', monospace;
    font-size: 9.5px; letter-spacing: 0.28em; text-transform: uppercase;
    border: 0.5px solid var(--gold-muted); cursor: pointer;
    border-radius: var(--radius-btn);
    transition: all var(--dur) var(--ease);
  }
  .ct4-btn-ghost:hover {
    background: var(--gold-glow); border-color: var(--gold);
    box-shadow: 0 0 20px rgba(212,175,55,0.15);
  }
  .ct4-btn-full { width: 100%; justify-content: center; }
  .ct4-btn-full:disabled { opacity: 0.5; cursor: not-allowed; }

  /* ═══════════════════════════════════════
     SCROLL REVEALS
  ═══════════════════════════════════════ */
  .ct4-reveal {
    opacity: 0; transform: translateY(32px);
    transition: opacity 0.8s cubic-bezier(0.16, 0.84, 0.3, 1),
                transform 0.8s cubic-bezier(0.16, 0.84, 0.3, 1);
  }
  .ct4-reveal.visible { opacity: 1; transform: translateY(0); }

  /* ═══════════════════════════════════════
     ENTRANCE ANIMATIONS
  ═══════════════════════════════════════ */
  @keyframes ct4-fade-in { from { opacity: 0; } to { opacity: 1; } }
  .ct4-fade-in { animation: ct4-fade-in 1.2s ease both; }

  @keyframes ct4-fade-up {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .ct4-fade-up { animation: ct4-fade-up 1s cubic-bezier(0.16, 0.84, 0.3, 1) both; }

  @keyframes ct4-draw {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }
  .ct4-draw { transform-origin: left; animation: ct4-draw 1.6s cubic-bezier(0.7, 0, 0.2, 1) 0.5s both; }

  /* ═══════════════════════════════════════
     #5 — INTERACTION POLISH: focus + reduced motion
  ═══════════════════════════════════════ */
  /* Keyboard focus rings in the accent colour — accessible AND considered.
     (Mouse clicks don't show it; only keyboard nav does.) */
  .ct4-root :focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px var(--void), 0 0 0 4px var(--gold-muted);
    border-radius: 2px;
  }
  /* Respect users who prefer less motion — kill transitions/animations. */
  @media (prefers-reduced-motion: reduce) {
    .ct4-root *, .ct4-root *::before, .ct4-root *::after {
      animation-duration: 0.001ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.001ms !important;
      scroll-behavior: auto !important;
    }
  }
`

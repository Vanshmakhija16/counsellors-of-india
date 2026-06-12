// ClassicTemplate5 — "Sage & Stone"
// Theme: Warm sage greens, soft terracotta, cream parchment, deep forest
// Mood: Grounded · Safe · Hopeful · Human · Breathable
// Layout: Editorial magazine feel with generous whitespace, split compositions,
//         organic shapes, and hand-crafted typographic rhythm

export const ct5Styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Inter:wght@300;400;500;600&family=Instrument+Serif:ital@0;1&display=swap');

  /* ════════════════════════════════════════════
     DESIGN TOKENS — SAGE & STONE
  ════════════════════════════════════════════ */
  .ct5 {
    /* Palette */
    --cream:        #F7F4EF;
    --parchment:    #EDE8DF;
    --stone:        #D6CFC4;
    --warm-gray:    #9E9589;
    --charcoal:     #3D3830;
    --ink:          #1E1A14;

    --sage:         #7A9E7E;
    --sage-light:   #A8C5AB;
    --sage-muted:   rgba(122,158,126,0.18);
    --sage-glow:    rgba(122,158,126,0.08);

    --terra:        #C4855A;
    --terra-light:  #D9A07A;
    --terra-muted:  rgba(196,133,90,0.2);

    --forest:       #2D4A32;
    --forest-deep:  #1A2E1C;

    --blush:        #E8D5C4;
    --blush-light:  #F0E4D8;

    /* Surfaces */
    --bg:           var(--cream);
    --surface:      #FFFFFF;
    --surface-warm: var(--parchment);
    --border:       rgba(61,56,48,0.1);
    --border-sage:  rgba(122,158,126,0.25);

    /* Typography */
    --nav-h: 76px;
    --radius: 4px;
    --radius-lg: 20px;
    --radius-pill: 999px;

    background: var(--bg);
    color: var(--ink);
    font-family: 'Inter', system-ui, sans-serif;
    font-weight: 400;
    min-height: 100vh;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* ════════════════════════════════════════════
     SCROLL PROGRESS
  ════════════════════════════════════════════ */
  .ct5-progress {
    position: fixed;
    top: 0; left: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--sage), var(--terra-light));
    z-index: 1000;
    pointer-events: none;
    transition: width 0.08s linear;
  }

  /* ════════════════════════════════════════════
     NAVBAR
  ════════════════════════════════════════════ */
  .ct5-nav {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 500;
    height: var(--nav-h);
    background: rgba(247,244,239,0.82);
    backdrop-filter: blur(20px) saturate(160%);
    -webkit-backdrop-filter: blur(20px) saturate(160%);
    border-bottom: 1px solid transparent;
    transition: border-color 0.4s ease, background 0.4s ease, box-shadow 0.4s ease;
  }
  .ct5-nav[data-scrolled='true'] {
    border-color: var(--border);
    background: rgba(247,244,239,0.96);
    box-shadow: 0 1px 24px rgba(30,26,20,0.06);
  }
  .ct5-nav-inner {
    max-width: 1320px;
    margin: 0 auto;
    height: 100%;
    padding: 0 2.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
  }

  /* Logo */
  .ct5-nav-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    background: none;
    border: none;
    cursor: pointer;
    text-decoration: none;
    flex-shrink: 0;
  }
  .ct5-nav-monogram {
    width: 38px; height: 38px;
    background: var(--forest);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Cormorant Garamond', serif;
    font-size: 16px;
    font-weight: 500;
    color: var(--cream);
    letter-spacing: 0.04em;
    flex-shrink: 0;
    transition: background 0.3s ease;
  }
  .ct5-nav-logo:hover .ct5-nav-monogram { background: var(--sage); }
  .ct5-nav-name {
    font-family: 'Cormorant Garamond', serif;
    font-size: 17px;
    font-weight: 500;
    color: var(--charcoal);
    letter-spacing: 0.01em;
    line-height: 1;
    white-space: nowrap;
  }
  .ct5-nav-cred {
    font-family: 'Inter', sans-serif;
    font-size: 9px;
    font-weight: 400;
    color: var(--warm-gray);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-top: 2px;
  }

  /* Desktop links */
  .ct5-nav-links {
    display: none;
    align-items: center;
    gap: 0;
  }
  @media (min-width: 860px) { .ct5-nav-links { display: flex; } }
  .ct5-nav-link {
    background: none;
    border: none;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--warm-gray);
    padding: 8px 16px;
    border-radius: var(--radius-pill);
    transition: color 0.2s ease, background 0.2s ease;
  }
  .ct5-nav-link:hover { color: var(--charcoal); background: var(--sage-muted); }
  .ct5-nav-link.active { color: var(--forest); background: var(--sage-muted); }

  /* Nav CTA */
  .ct5-nav-cta {
    display: none;
    align-items: center;
    gap: 8px;
    padding: 11px 24px;
    // background: var(--forest);
    color: var(--sage);
    font-family: 'Inter', sans-serif;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
 background: transparent; transform: translateY(-1px); color:var(--sage); border :5px inset var(--sage); border-radius:50px;  

    cursor: pointer;
    transition: background 0.25s ease, transform 0.2s ease;
    white-space: nowrap;
  }
  @media (min-width: 580px) { .ct5-nav-cta { display: inline-flex; } }

  // .ct5-nav-cta:hover { background: var(--sage); transform: translateY(-1px); }
  .ct5-nav-cta:hover { background: transparent; transform: translateY(-1px); color:var(--sage); border :5px outset var(--sage); border-radius:50px;  }

  /* Hamburger */
  .ct5-hamburger {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 5px;
    width: 32px; height: 32px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
  }
  @media (min-width: 860px) { .ct5-hamburger { display: none; } }
  .ct5-ham-line {
    display: block;
    height: 1.5px;
    background: var(--charcoal);
    border-radius: 2px;
    transition: transform 0.3s ease, opacity 0.3s ease, width 0.3s ease;
    transform-origin: center;
  }
  .ct5-ham-line:nth-child(1) { width: 100%; }
  .ct5-ham-line:nth-child(2) { width: 70%; }
  .ct5-ham-line:nth-child(3) { width: 85%; }
  .ct5-ham-line.open:nth-child(1) { width: 100%; transform: translateY(6.5px) rotate(45deg); }
  .ct5-ham-line.open:nth-child(2) { opacity: 0; }
  .ct5-ham-line.open:nth-child(3) { width: 100%; transform: translateY(-6.5px) rotate(-45deg); }

  /* Mobile drawer */
  .ct5-drawer {
    background: var(--cream);
    border-bottom: 1px solid var(--border);
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.45s cubic-bezier(0.7,0,0.2,1);
  }
  @media (min-width: 860px) { .ct5-drawer { display: none; } }
  .ct5-drawer.open { max-height: 480px; }
  .ct5-drawer-inner { padding: 1.5rem 2.5rem 2.5rem; }
  .ct5-drawer-link {
    display: flex;
    align-items: center;
    gap: 14px;
    width: 100%;
    background: none;
    border: none;
    border-bottom: 1px solid var(--border);
    padding: 15px 0;
    cursor: pointer;
    text-align: left;
    font-family: 'Cormorant Garamond', serif;
    font-size: 22px;
    font-weight: 400;
    color: var(--charcoal);
    transition: color 0.2s ease, padding-left 0.2s ease;
  }
  .ct5-drawer-link:hover, .ct5-drawer-link.active { color: var(--sage); padding-left: 8px; }
  .ct5-drawer-num {
    font-family: 'Inter', sans-serif;
    font-size: 9px;
    font-weight: 500;
    letter-spacing: 0.2em;
    color: var(--sage);
    flex-shrink: 0;
  }
  .ct5-drawer-cta {
    margin-top: 1.5rem;
    width: 100%;
    padding: 14px;
    background: var(--forest);
    color: var(--cream);
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    border: none;
    border-radius: var(--radius-pill);
    cursor: pointer;
  }

  /* ════════════════════════════════════════════
     HERO — SPLIT EDITORIAL
  ════════════════════════════════════════════ */
  .ct5-hero {
    min-height: 100vh;
    padding-top: var(--nav-h);
    display: grid;
    grid-template-columns: 1fr 1fr;
    position: relative;
    overflow: hidden;
  }
  @media (max-width: 860px) {
    .ct5-hero { grid-template-columns: 1fr; min-height: auto; }
  }

  /* Left panel — text */
  .ct5-hero-left {
    background: var(--bg);
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: clamp(3rem, 6vw, 7rem) clamp(2rem, 5vw, 6rem) clamp(3rem, 6vw, 7rem) clamp(2rem, 7vw, 9rem);
    position: relative;
    z-index: 2;
  }

  /* Right panel — visual */
  .ct5-hero-right {
    background: var(--forest);
    position: relative;
    overflow: hidden;
    min-height: 420px;
  }
  @media (max-width: 860px) { .ct5-hero-right { order: -1; min-height: 320px; } }

  /* Photo or monogram fill */
  .ct5-hero-photo {
    position: absolute;
    inset: 0;
    object-fit: cover;
    object-position: center 11%;
    width: 100%; height: 100%;
    // opacity: 0.75;
    // mix-blend-mode: luminosity;
  }
  // .ct5-hero-photo-overlay {
  //   position: absolute; inset: 0;
  //   background: linear-gradient(
  //     135deg,
  //     rgba(45,74,50,0.55) 0%,
  //     rgba(122,158,126,0.2) 60%,
  //     rgba(196,133,90,0.15) 100%
  //   );
  }
  .ct5-hero-no-photo {
    position: absolute; inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .ct5-hero-monogram-bg {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(140px, 22vw, 260px);
    font-weight: 300;
    font-style: italic;
    color: rgba(255,255,255,0.07);
    line-height: 1;
    user-select: none;
    pointer-events: none;
  }

  /* Floating stat cards */
  .ct5-hero-stat-strip {
    position: absolute;
    bottom: 2.5rem; left: 2rem; right: 2rem;
    display: flex;
    gap: 12px;
    z-index: 10;
  }
  @media (max-width: 860px) { .ct5-hero-stat-strip { display: none; } }
  .ct5-hero-stat-card {
    flex: 1;
    background: rgba(247,244,239,0.1);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: var(--radius-lg);
    padding: 14px 16px;
    text-align: center;
  }
  .ct5-hero-stat-num {
    font-family: 'Cormorant Garamond', serif;
    font-size: 28px;
    font-weight: 400;
    color: var(--cream);
    line-height: 1;
    display: block;
  }
  .ct5-hero-stat-lbl {
    font-family: 'Inter', sans-serif;
    font-size: 9px;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(247,244,239,0.55);
    margin-top: 4px;
    display: block;
  }

  /* Text content */
  .ct5-hero-tag {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 1.8rem;
  }
  .ct5-hero-tag-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--sage);
    flex-shrink: 0;
  }
  .ct5-hero-tag-text {
    font-family: 'Inter', sans-serif;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--sage);
  }

  .ct5-hero-name {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(44px, 5.5vw, 82px);
    font-weight: 400;
    line-height: 1.0;
    letter-spacing: -0.02em;
    // color: var(--ink);
        color: var(--forest);

    margin: 0 0 1rem;
  }
  .ct5-hero-name em {
    font-style: italic;
    // color: var(--forest);
        color: var(--ink);

  }

  .ct5-hero-cred {
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    font-weight: 400;
    color: var(--sage);
    letter-spacing: 0.02em;
    margin: 0 0 1.6rem;
  }

  .ct5-hero-divider {
    width: 48px;
    height: 1.5px;
    background: var(--sage);
    margin-bottom: 1.8rem;
    border-radius: 2px;
  }

  .ct5-hero-bio {
    font-family: 'Inter', sans-serif;
    font-size: 15px;
    font-weight: 300;
    line-height: 1.85;
    color: var(--charcoal);
    max-width: 55ch;
    margin: 0 0 2.5rem;
    opacity: 0.9;
  }

  .ct5-hero-ctas {
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
    margin-bottom: 3rem;
  }
  /* Mobile: keep both CTAs on a single row, sharing the width evenly */
  @media (max-width: 560px) {
    .ct5-hero-ctas { flex-wrap: nowrap; gap: 10px; }
    .ct5-hero-ctas .ct5-btn-primary,
    .ct5-hero-ctas .ct5-btn-ghost {
      flex: 1 1 0;
      justify-content: center;
      padding-left: 16px;
      padding-right: 16px;
      white-space: nowrap;
    }
  }

  /* Mobile stats */
  .ct5-hero-stats-mobile {
    display: none;
    gap: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border);
  }
  @media (max-width: 860px) { .ct5-hero-stats-mobile { display: flex; flex-wrap: wrap; } }
  .ct5-hero-stat-m { display: flex; flex-direction: column; gap: 2px; }
  .ct5-hero-stat-m-num {
    font-family: 'Cormorant Garamond', serif;
    font-size: 28px;
    font-weight: 400;
    color: var(--forest);
    line-height: 1;
  }
  .ct5-hero-stat-m-lbl {
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--warm-gray);
  }

  /* ════════════════════════════════════════════
     BUTTONS
  ════════════════════════════════════════════ */
  .ct5-btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 14px 30px;
    background: var(--forest);
    color: var(--cream);
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    border: none;
    border-radius: var(--radius-pill);
    cursor: pointer;
    transition: background 0.25s ease, transform 0.2s ease, box-shadow 0.25s ease;
  }
  .ct5-btn-primary:hover {
    background: var(--sage);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(122,158,126,0.35);
  }
  .ct5-btn-ghost {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 13px 28px;
    background: transparent;
    color: var(--charcoal);
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    border: 1.5px solid var(--border);
    border-radius: var(--radius-pill);
    cursor: pointer;
    transition: all 0.25s ease;
  }
  .ct5-btn-ghost:hover {
    border-color: var(--sage);
    color: var(--forest);
    background: var(--sage-muted);
    transform: translateY(-2px);
  }
  .ct5-btn-full { width: 100%; justify-content: center; }
  .ct5-btn-full:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
  .ct5-btn-sage {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 13px 28px;
    background: var(--sage-muted);
    color: var(--forest);
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    border: 1.5px solid var(--border-sage);
    border-radius: var(--radius-pill);
    cursor: pointer;
    transition: all 0.25s ease;
  }
  .ct5-btn-sage:hover { background: var(--sage); color: var(--cream); border-color: var(--sage); }

  /* ════════════════════════════════════════════
     SECTION SHARED
  ════════════════════════════════════════════ */
  .ct5-section {
    padding: clamp(4rem, 9vh, 8rem) clamp(1.5rem, 5vw, 7rem);
  }
  .ct5-container {
    max-width: 1220px;
    margin: 0 auto;
    
  }

  .ct5-label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: 'Inter', sans-serif;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--sage);
    margin-bottom: 1.2rem;
  }
  // .ct5-label::before {
  //   content: '';
  //   display: block;
  //   width: 20px; height: 1.5px;
  //   background: var(--sage);
  //   border-radius: 2px;
  //   flex-shrink: 0;
  // }

  .ct5-section-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(38px, 5vw, 68px);
    font-weight: 400;
    line-height: 1.05;
    letter-spacing: -0.02em;
    color: var(--ink);
    margin: 0 0 1.5rem;
  }
  .ct5-section-title em { font-style: italic; color: var(--sage); }
  .ct5-section-body {
    font-size: 15px;
    font-weight: 300;
    line-height: 1.85;
    color: var(--charcoal);
    opacity: 0.85;
    max-width: 56ch;
  }

  /* ════════════════════════════════════════════
     SCROLL REVEAL
  ════════════════════════════════════════════ */
  .ct5-reveal {
    opacity: 0;
    transform: translateY(24px);
    transition:
      opacity 0.75s cubic-bezier(0.22, 0.87, 0.36, 1),
      transform 0.75s cubic-bezier(0.22, 0.87, 0.36, 1);
  }
  .ct5-reveal.visible { opacity: 1; transform: translateY(0); }
  .ct5-reveal-left {
    opacity: 0;
    transform: translateX(-24px);
    transition:
      opacity 0.75s cubic-bezier(0.22, 0.87, 0.36, 1),
      transform 0.75s cubic-bezier(0.22, 0.87, 0.36, 1);
  }
  .ct5-reveal-left.visible { opacity: 1; transform: translateX(0); }
  .ct5-reveal-right {
    opacity: 0;
    transform: translateX(24px);
    transition:
      opacity 0.75s cubic-bezier(0.22, 0.87, 0.36, 1),
      transform 0.75s cubic-bezier(0.22, 0.87, 0.36, 1);
  }
  .ct5-reveal-right.visible { opacity: 1; transform: translateX(0); }

  /* ════════════════════════════════════════════
     TICKER
  ════════════════════════════════════════════ */
  .ct5-ticker {
    background: var(--forest);
    overflow: hidden;
    padding: 12px 0;
  }
  .ct5-ticker-track {
    display: flex;
    white-space: nowrap;
    animation: ct5-ticker 35s linear infinite;
  }
  .ct5-ticker-track:hover { animation-play-state: paused; }
  @keyframes ct5-ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
  .ct5-ticker-item {
    display: inline-flex;
    align-items: center;
    gap: 2.5rem;
    padding-right: 2.5rem;
    flex-shrink: 0;
    font-family: 'Inter', sans-serif;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: rgba(247,244,239,0.6);
  }
  .ct5-ticker-sep {
    width: 4px; height: 4px;
    border-radius: 50%;
    background: var(--sage);
    flex-shrink: 0;
  }

  /* ════════════════════════════════════════════
     ABOUT SECTION
  ════════════════════════════════════════════ */
  // .ct5-about { background: var(--surface-warm); }
  .ct5-about { background: var(--bg); }

  .ct5-about-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 5rem 6rem;
    align-items: start;
  }
  @media (max-width: 860px) { .ct5-about-grid { grid-template-columns: 1fr; gap: 3rem; } }

  .ct5-about-body {
    font-size: 16px;
    font-weight: 300;
    line-height: 1.9;
    color: var(--charcoal);
    margin: 0;
  }
  .ct5-about-body p + p { margin-top: 1.4em; }
  .ct5-about-body strong { font-weight: 600; color: var(--ink); }

  /* Values list */
  .ct5-values { display: flex; flex-direction: column; gap: 0; }
  .ct5-value-row {
    display: flex;
    align-items: flex-start;
    gap: 18px;
    padding: 20px 0;
    border-bottom: 1px solid var(--border);
  }
  .ct5-value-row:first-child { border-top: 1px solid var(--border); }
  .ct5-value-icon {
    width: 40px; height: 40px;
    border-radius: 50%;
    background: var(--sage-muted);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 18px;
    margin-top: 2px;
  }
  .ct5-value-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 20px;
    font-weight: 500;
    color: var(--ink);
    margin-bottom: 4px;
    display: block;
  }
  .ct5-value-desc {
    font-size: 13px;
    font-weight: 300;
    line-height: 1.65;
    color: var(--warm-gray);
  }

  /* Credentials card */
  .ct5-cred-card {
    background: var(--forest);
    border-radius: var(--radius-lg);
    padding: 2.5rem;
    margin-top: 2rem;
  }
  .ct5-cred-title {
    font-family: 'Inter', sans-serif;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--sage-light);
    margin-bottom: 1.4rem;
    display: block;
  }
  .ct5-cred-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 0;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }
  .ct5-cred-item:last-child { border-bottom: none; }
  .ct5-cred-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--sage); flex-shrink: 0; }
  .ct5-cred-text { font-size: 13px; font-weight: 400; color: rgba(247,244,239,0.8); }

  /* ════════════════════════════════════════════
     SPECIALTIES / SERVICES
  ════════════════════════════════════════════ */
  .ct5-services { background: var(--bg); }
  .ct5-services-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 2rem;
    margin-bottom: 4rem;
  }
  .ct5-services-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5px;
    background: var(--border);
    border: 1.5px solid var(--border);
    border-radius: var(--radius-lg);
    overflow: hidden;
  }
  @media (max-width: 900px) { .ct5-services-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 560px) { .ct5-services-grid { grid-template-columns: 1fr; } }

  .ct5-service-card {
    background: var(--surface);
    padding: 2.5rem 2rem;
    position: relative;
    overflow: hidden;
    transition: background 0.3s ease;
  }
  .ct5-service-card:hover { background: var(--blush-light); }
  .ct5-service-num {
    font-family: 'Cormorant Garamond', serif;
    font-size: 48px;
    font-weight: 300;
    color: var(--stone);
    line-height: 1;
    display: block;
    margin-bottom: 1rem;
    transition: color 0.3s ease;
  }
  .ct5-service-card:hover .ct5-service-num { color: var(--terra-light); }
  .ct5-service-name {
    font-family: 'Cormorant Garamond', serif;
    font-size: 20px;
    font-weight: 500;
    color: var(--ink);
    margin: 0 0 0.7rem;
  }
  .ct5-service-desc {
    font-size: 13px;
    line-height: 1.7;
    color: var(--warm-gray);
    font-weight: 300;
  }
  .ct5-service-tag {
    display: inline-block;
    margin-top: 1.2rem;
    padding: 5px 12px;
    background: var(--sage-muted);
    border-radius: var(--radius-pill);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--forest);
    transition: background 0.3s ease;
  }
  .ct5-service-card:hover .ct5-service-tag { background: var(--terra-muted); }

  /* Specialty chips */
  .ct5-chip-wrap { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 3rem; }
  .ct5-chip {
    padding: 8px 18px;
    background: transparent;
    border: 1.5px solid var(--border);
    border-radius: var(--radius-pill);
    font-family: 'Inter', sans-serif;
    font-size: 11px;
    font-weight: 500;
    color: var(--charcoal);
    cursor: default;
    transition: all 0.2s ease;
  }
  .ct5-chip:hover { border-color: var(--sage); color: var(--forest); background: var(--sage-muted); }

  /* ════════════════════════════════════════════
     TESTIMONIALS
  ════════════════════════════════════════════ */
  .ct5-testimonials { background: var(--forest); }
  .ct5-testimonials .ct5-label { color: var(--sage-light); }
  .ct5-testimonials .ct5-label::before { background: var(--sage-light); }
  .ct5-testimonials .ct5-section-title { color: var(--cream); }

  .ct5-review-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
    margin-top: 3.5rem;
  }
  @media (max-width: 900px) { .ct5-review-grid { grid-template-columns: 1fr; } }

  .ct5-review-card {
    background: rgba(247,244,239,0.06);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: var(--radius-lg);
    padding: 2rem 1.8rem;
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
    transition: background 0.3s ease;
  }
  .ct5-review-card:hover { background: rgba(247,244,239,0.1); }

  .ct5-review-stars { display: flex; gap: 4px; }
  .ct5-star { color: var(--terra-light); font-size: 13px; }
  .ct5-review-text {
    font-family: 'Instrument Serif', serif;
    font-size: 16px;
    font-style: italic;
    line-height: 1.65;
    color: rgba(247,244,239,0.8);
    flex: 1;
  }
  .ct5-review-author {
    display: flex;
    align-items: center;
    gap: 10px;
    padding-top: 1rem;
    border-top: 1px solid rgba(255,255,255,0.08);
  }
  .ct5-review-avatar {
    width: 32px; height: 32px;
    border-radius: 50%;
    background: var(--sage);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Cormorant Garamond', serif;
    font-size: 13px;
    color: var(--cream);
    flex-shrink: 0;
  }
  .ct5-review-name {
    font-family: 'Inter', sans-serif;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;
    color: rgba(247,244,239,0.6);
    text-transform: uppercase;
  }

  /* Rating bar */
  .ct5-rating-hero {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin-top: 3rem;
    padding: 2rem;
    background: rgba(247,244,239,0.05);
    border-radius: var(--radius-lg);
    border: 1px solid rgba(255,255,255,0.08);
  }
  .ct5-rating-big {
    font-family: 'Cormorant Garamond', serif;
    font-size: 56px;
    font-weight: 300;
    color: var(--cream);
    line-height: 1;
  }
  .ct5-rating-label { font-size: 12px; color: rgba(247,244,239,0.5); margin-top: 4px; font-weight: 300; }

  /* ════════════════════════════════════════════
     FAQ
  ════════════════════════════════════════════ */
  .ct5-faq { background: var(--bg); }
  .ct5-faq-grid {
    display: grid;
    grid-template-columns: 1fr 1.5fr;
    gap: 4rem 6rem;
    align-items: start;
  }
  @media (max-width: 860px) { .ct5-faq-grid { grid-template-columns: 1fr; } }

  .ct5-faq-sticky {
    position: sticky;
    top: calc(var(--nav-h) + 2rem);
  }

  .ct5-faq-list { display: flex; flex-direction: column; }
  .ct5-faq-item { border-bottom: 1px solid var(--border); }
  .ct5-faq-trigger {
    width: 100%;
    background: none;
    border: none;
    cursor: pointer;
    padding: 1.5rem 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
    text-align: left;
  }
  .ct5-faq-q {
    font-family: 'Cormorant Garamond', serif;
    font-size: 19px;
    font-weight: 500;
    color: var(--ink);
    transition: color 0.2s ease;
    flex: 1;
  }
  .ct5-faq-trigger:hover .ct5-faq-q { color: var(--sage); }
  .ct5-faq-icon {
    width: 26px; height: 26px;
    border-radius: 50%;
    border: 1.5px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--warm-gray);
    font-size: 14px;
    flex-shrink: 0;
    transition: all 0.3s ease;
  }
  .ct5-faq-icon.open { transform: rotate(45deg); background: var(--sage-muted); border-color: var(--sage); color: var(--forest); }
  .ct5-faq-body { max-height: 0; overflow: hidden; transition: max-height 0.4s cubic-bezier(0.7,0,0.2,1); }
  .ct5-faq-body.open { max-height: 400px; }
  .ct5-faq-ans {
    font-size: 14px;
    line-height: 1.8;
    color: var(--charcoal);
    font-weight: 300;
    padding: 0 0 1.5rem;
    max-width: 60ch;
  }

  /* ════════════════════════════════════════════
     BOOKING SECTION
  ════════════════════════════════════════════ */
  .ct5-booking { background: var(--bg); }
  .ct5-booking-grid {
    display: grid;
    grid-template-columns: 1fr 1.4fr;
    gap: 4rem 5rem;
    align-items: start;
  }
  @media (max-width: 900px) { .ct5-booking-grid { grid-template-columns: 1fr; gap: 3rem; } }

  .ct5-booking-info-text {
    font-size: 15px;
    font-weight: 300;
    line-height: 1.85;
    color: var(--charcoal);
    max-width: 42ch;
    margin: 1rem 0 2rem;
  }

  /* Session card — premium dark "ticket" with depth + organic glow */
  .ct5-session-card {
    position: relative;
    background:
      radial-gradient(120% 80% at 0% 0%, rgba(122,158,126,0.20), transparent 55%),
      var(--forest);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: var(--radius-lg);
    padding: 1.9rem 2.1rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 1px 2px rgba(26,46,28,0.2), 0 24px 50px -28px rgba(26,46,28,0.55);
    overflow: hidden;
  }
  /* faint corner ring for crafted, editorial feel */
  .ct5-session-card::after {
    content: '';
    position: absolute; right: -50px; bottom: -50px;
    width: 150px; height: 150px; border-radius: 50%;
    border: 1px solid rgba(168,197,171,0.16);
    pointer-events: none;
  }
  .ct5-session-title {
    display: flex; align-items: center; gap: 9px;
    font-family: 'Inter', sans-serif;
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.24em;
    text-transform: uppercase;
    color: var(--sage-light);
    margin-bottom: 1.3rem;
  }
  .ct5-session-title::before {
    content: '';
    width: 16px; height: 1.5px; border-radius: 2px;
    background: var(--sage-light); flex-shrink: 0;
  }
  .ct5-session-row {
    position: relative; z-index: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 11px 0;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }
  .ct5-session-row:last-child { border-bottom: none; padding-bottom: 0; }
  .ct5-session-key {
    font-family: 'Inter', sans-serif;
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(247,244,239,0.5);
    font-weight: 500;
  }
  .ct5-session-val {
    font-family: 'Cormorant Garamond', serif;
    font-size: 18px;
    font-weight: 500;
    color: var(--cream);
    text-align: right;
  }

  /* Booking card */
  .ct5-booking-card {
    position: relative;
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: 24px;
    padding: 2.5rem;
    box-shadow: 0 1px 2px rgba(30,26,20,0.04), 0 20px 50px -24px rgba(30,26,20,0.18);
    overflow: hidden;
  }
  /* Subtle sage→terra hairline across the top — quiet premium accent */
  .ct5-booking-card::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg, var(--sage), var(--terra-light));
    opacity: 0.9;
  }

  .ct5-booking-step-label {
    font-family: 'Inter', sans-serif;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--sage);
    margin-bottom: 0.75rem;
    display: block;
  }
  .ct5-booking-step-divider {
    height: 1px;
    background: var(--border);
    margin-bottom: 1.2rem;
  }

  /* Day chips */
  .ct5-day-chips { display: flex; flex-wrap: wrap; gap: 9px; }
  .ct5-day-chip {
    padding: 11px 18px;
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: 12px;            /* match the time slots (was pill) */
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.01em;
    color: var(--charcoal);
    cursor: pointer;
    transition: transform 0.2s ease, border-color 0.2s ease, color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
    white-space: nowrap;
  }
  .ct5-day-chip:hover:not(.selected) { border-color: var(--sage); color: var(--forest); transform: translateY(-1px); box-shadow: 0 6px 16px rgba(45,74,50,0.08); }
  .ct5-day-chip.selected { background: var(--forest); color: var(--cream); border-color: var(--forest); box-shadow: 0 8px 20px rgba(45,74,50,0.22); }

  /* Time chips — grid so they tile evenly, rounded to match day chips */
  .ct5-time-chips { display: grid; grid-template-columns: repeat(auto-fill, minmax(84px, 1fr)); gap: 9px; }
  .ct5-time-chip {
    padding: 11px 12px;
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: 12px;
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    font-weight: 500;
    color: var(--charcoal);
    cursor: pointer;
    text-align: center;
    transition: transform 0.2s ease, border-color 0.2s ease, color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
  }
  .ct5-time-chip:hover:not(.selected) { border-color: var(--sage-light); color: var(--forest); transform: translateY(-1px); box-shadow: 0 6px 16px rgba(122,158,126,0.12); }
  .ct5-time-chip.selected { background: var(--sage); color: var(--cream); border-color: var(--sage); box-shadow: 0 8px 20px rgba(122,158,126,0.3); }

  /* Input fields */
  .ct5-input-group { display: flex; flex-direction: column; gap: 4px; }
  .ct5-input-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--warm-gray);
  }
  .ct5-input {
    width: 100%;
    background: var(--bg);
    border: 1.5px solid var(--border);
    border-radius: 12px;
    color: var(--ink);
    padding: 13px 16px;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    font-weight: 400;
    outline: none;
    transition: border-color 0.25s ease, box-shadow 0.25s ease;
    box-sizing: border-box;
  }
  .ct5-input::placeholder { color: var(--stone); }
  .ct5-input:focus {
    border-color: var(--sage);
    box-shadow: 0 0 0 3px rgba(122,158,126,0.12);
  }

  /* Booking success */
  .ct5-booking-success {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 3rem 1.5rem;
    gap: 1rem;
  }
  .ct5-success-icon {
    width: 64px; height: 64px;
    border-radius: 50%;
    background: var(--sage-muted);
    border: 2px solid var(--sage);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--forest);
    margin-bottom: 0.5rem;
  }
  .ct5-success-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 30px;
    font-weight: 400;
    color: var(--ink);
  }
  .ct5-success-body {
    font-size: 14px;
    font-weight: 300;
    line-height: 1.75;
    color: var(--warm-gray);
    max-width: 34ch;
  }

  /* ════════════════════════════════════════════
     FOOTER
  ════════════════════════════════════════════ */
  .ct5-footer {
    background: var(--ink);
    padding: 4rem clamp(1.5rem, 5vw, 7rem) 2.5rem;
  }
  .ct5-footer-inner {
    max-width: 1220px;
    margin: 0 auto;
  }
  .ct5-footer-top {
    display: grid;
    grid-template-columns: 1.5fr 1fr 1fr;
    gap: 3rem 4rem;
    padding-bottom: 3rem;
    border-bottom: 1px solid rgba(255,255,255,0.08);
    margin-bottom: 2rem;
  }
  @media (max-width: 720px) { .ct5-footer-top { grid-template-columns: 1fr; gap: 2rem; } }

  .ct5-footer-name {
    font-family: 'Cormorant Garamond', serif;
    font-size: 26px;
    font-weight: 400;
    color: var(--cream);
    margin: 0 0 0.5rem;
  }
  .ct5-footer-tagline {
    font-size: 13px;
    font-weight: 300;
    color: rgba(247,244,239,0.4);
    line-height: 1.7;
    margin: 0;
  }
  .ct5-footer-col-title {
    font-family: 'Inter', sans-serif;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: rgba(247,244,239,0.35);
    margin-bottom: 1.2rem;
    display: block;
  }
  .ct5-footer-link {
    display: block;
    font-size: 13px;
    font-weight: 300;
    color: rgba(247,244,239,0.6);
    background: none;
    border: none;
    cursor: pointer;
    padding: 5px 0;
    text-align: left;
    text-decoration: none;
    transition: color 0.2s ease;
  }
  .ct5-footer-link:hover { color: var(--sage-light); }
  .ct5-footer-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
  }
  .ct5-footer-copy {
    font-size: 11px;
    color: rgba(247,244,239,0.25);
    font-weight: 300;
  }
  .ct5-footer-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    background: rgba(122,158,126,0.12);
    border: 1px solid rgba(122,158,126,0.2);
    border-radius: var(--radius-pill);
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--sage-light);
  }

  /* ════════════════════════════════════════════
     KEYFRAMES
  ════════════════════════════════════════════ */
  @keyframes ct5-fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes ct5-fade-up {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes ct5-slide-right {
    from { opacity: 0; transform: translateX(-22px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  .ct5-anim-fade-in  { animation: ct5-fade-in  0.9s ease both; }
  .ct5-anim-fade-up  { animation: ct5-fade-up  0.9s cubic-bezier(0.22,0.87,0.36,1) both; }
  .ct5-anim-slide-r  { animation: ct5-slide-right 0.9s cubic-bezier(0.22,0.87,0.36,1) both; }

  /* Scroll hint */
  .ct5-scroll-hint {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    margin-top: 2.5rem;
  }
  .ct5-scroll-hint-text {
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--warm-gray);
    opacity: 0.6;
  }
  .ct5-scroll-line {
    display: block;
    width: 1.5px;
    height: 40px;
    background: linear-gradient(to bottom, var(--sage), transparent);
    border-radius: 2px;
    animation: ct5-scroll-drop 2s ease-in-out infinite;
  }
  @keyframes ct5-scroll-drop {
    0%   { opacity: 0; transform: scaleY(0); transform-origin: top; }
    40%  { opacity: 1; transform: scaleY(1); transform-origin: top; }
    80%  { opacity: 0; transform: scaleY(1); transform-origin: bottom; }
    100% { opacity: 0; }
  }
`

// ClassicTemplate3 — Serene Light · Modern Wellness
// Design: Fresh, breathable light theme with sage-teal accents, soft lavender highlights
// Fonts: Playfair Display (editorial serif) + Plus Jakarta Sans (clean modern) + JetBrains Mono (data/labels)
// Palette: Soft white base, sage green primary, warm peach accent, slate text

export const ct3Styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Plus+Jakarta+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@300;400;500&display=swap');

  /* ═══════════════════════════════════════════════════════════
     DESIGN TOKENS — SERENE LIGHT
  ═══════════════════════════════════════════════════════════ */
  .ct3-root {
    --bg-base:      #F8FAF9;
    --bg-alt:       #EEF4F1;
    --bg-card:      #FFFFFF;
    --bg-deep:      #E8F0EC;
    --ink:          #1C2B26;
    --ink-2:        #354C42;
    --ink-3:        #6B8C7D;
    --ink-4:        #A0B8AD;
    --sage:         #3D7A6A;
    --sage-light:   #52A08C;
    --sage-pale:    #D4EBE3;
    --sage-border:  rgba(61,122,106,0.2);
    --peach:        #E8825A;
    --peach-light:  #F0A882;
    --peach-pale:   #FDEEE6;
    --lavender:     #7B6FAC;
    --lavender-pale:#EDE9F7;
    --rule:         rgba(28,43,38,0.08);
    --rule-strong:  rgba(28,43,38,0.14);
    --nav-h: 72px;
    background:              var(--bg-base);
    color:                   var(--ink);
    font-family:             'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
    font-weight:             400;
    min-height:              100vh;
    overflow-x:              hidden;
    -webkit-font-smoothing:  antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering:          optimizeLegibility;
  }

  /* ═══════════════════════════════════════════════════════════ TYPOGRAPHY */
  .ct3-display { font-family: 'Playfair Display', Georgia, serif; font-weight: 500; letter-spacing: -0.02em; }
  .ct3-display-italic { font-family: 'Playfair Display', Georgia, serif; font-style: italic; font-weight: 400; }
  .ct3-serif { font-family: 'Playfair Display', Georgia, serif; }
  .ct3-sans  { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
  .ct3-mono  { font-family: 'JetBrains Mono', 'Courier New', monospace; }
  .ct3-eyebrow {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px; letter-spacing: 0.24em; text-transform: uppercase;
    color: var(--sage); font-weight: 400;
  }

  /* ═══════════════════════════════════════════════════════════ SCROLL PROGRESS */
  .ct3-progress {
    position: fixed; top: var(--nav-h); left: 0; z-index: 9999;
    height: 3px; background: linear-gradient(90deg, var(--sage), var(--peach));
    pointer-events: none; transition: width 0.08s linear;
    box-shadow: 0 0 8px rgba(61,122,106,0.3);
  }

  /* ═══════════════════════════════════════════════════════════
     NAVBAR — fixed, always full viewport width
  ═══════════════════════════════════════════════════════════ */
  .ct3-nav {
    position: fixed;
    top: 0; left: 0; right: 0;   /* explicit instead of inset-x which can collapse */
    width: 100%;                  /* belt-and-suspenders */
    z-index: 200;
    height: var(--nav-h);
    background: rgba(248,250,249,0.88);
    backdrop-filter: blur(20px) saturate(160%);
    -webkit-backdrop-filter: blur(20px) saturate(160%);
    border-bottom: 1px solid var(--rule);
    transition: background 0.4s ease, box-shadow 0.4s ease;
    box-sizing: border-box;
  }
  .ct3-nav[data-scrolled='true'] {
    background: rgba(248,250,249,0.97);
    box-shadow: 0 2px 32px rgba(28,43,38,0.06);
    border-bottom-color: var(--rule-strong);
  }
  .ct3-nav-inner {
    width: 100%;
    max-width: 100%;
    height: 100%;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 clamp(1.5rem, 4vw, 3rem);
    gap: 1.5rem;
    box-sizing: border-box;
  }
  .ct3-nav-brand {
    display: flex; align-items: center; gap: 12px;
    background: none; border: none; cursor: pointer; flex-shrink: 0; text-decoration: none;
  }
  .ct3-nav-monogram {
    width: 40px; height: 40px; border-radius: 10px;
    background: var(--sage); display: flex; align-items: center; justify-content: center;
    font-family: 'Playfair Display', serif; font-size: 17px; font-weight: 500; color: #fff;
    transition: background 0.3s ease, transform 0.2s ease;
    box-shadow: 0 4px 12px rgba(61,122,106,0.25);
  }
  .ct3-nav-monogram:hover { background: var(--sage-light); transform: scale(1.05); }
  .ct3-nav-label { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; font-weight: 600; color: var(--ink); letter-spacing: -0.01em; }
  .ct3-nav-label-sub { display: block; font-family: 'JetBrains Mono', monospace; font-size: 9px; letter-spacing: 0.18em; color: var(--ink-3); text-transform: uppercase; margin-top: 1px; }
  .ct3-nav-links { display: none; align-items: center; gap: 4px; }
  @media (min-width: 820px) { .ct3-nav-links { display: flex; } }
  .ct3-nav-link {
    position: relative; background: none; border: none; cursor: pointer;
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; font-weight: 500;
    letter-spacing: -0.01em; color: var(--ink-3); padding: 8px 14px; border-radius: 8px;
    transition: color 0.2s ease, background 0.2s ease;
  }
  .ct3-nav-link:hover { color: var(--ink); background: var(--bg-alt); }
  .ct3-nav-link.active { color: var(--sage); background: var(--sage-pale); }
  .ct3-nav-actions { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
  .ct3-nav-cta { display: none; align-items: center; gap: 8px; padding: 10px 22px !important; }
  @media (min-width: 560px) { .ct3-nav-cta { display: inline-flex !important; } }
  .ct3-hamburger {
    display: flex; flex-direction: column; justify-content: center;
    gap: 5px; width: 32px; height: 32px; background: var(--bg-alt);
    border: none; cursor: pointer; padding: 6px; border-radius: 8px;
    transition: background 0.2s ease;
  }
  @media (min-width: 820px) { .ct3-hamburger { display: none; } }
  .ct3-hamburger:hover { background: var(--sage-pale); }
  .ct3-ham-bar { display: block; width: 100%; height: 1.5px; background: var(--ink); transition: transform 0.3s ease, opacity 0.3s ease; transform-origin: center; border-radius: 2px; }
  .ct3-ham-bar.open:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
  .ct3-ham-bar.open:nth-child(2) { opacity: 0; transform: scaleX(0); }
  .ct3-ham-bar.open:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }
  .ct3-drawer {
    background: rgba(248,250,249,0.98); backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--rule-strong);
    overflow: hidden; max-height: 0; padding: 0 clamp(1.25rem, 4vw, 2.5rem);
    transition: max-height 0.45s cubic-bezier(0.7, 0, 0.2, 1), padding 0.3s ease;
  }
  @media (min-width: 820px) { .ct3-drawer { display: none; } }
  .ct3-drawer.open { max-height: 460px; padding: 1.25rem clamp(1.25rem, 4vw, 2.5rem) 2rem; }
  .ct3-drawer-link {
    display: flex; align-items: center; gap: 16px; width: 100%;
    background: none; border: none; border-bottom: 1px solid var(--rule);
    cursor: pointer; padding: 16px 0;
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 20px; font-weight: 600;
    color: var(--ink); text-align: left; transition: color 0.2s ease, padding-left 0.2s ease;
  }
  .ct3-drawer-link:hover, .ct3-drawer-link.active { color: var(--sage); padding-left: 10px; }
  .ct3-drawer-num { font-family: 'JetBrains Mono', monospace; font-size: 9px; letter-spacing: 0.2em; color: var(--sage); }

  /* ═══════════════════════════════════════════════════════════ HERO */
  .ct3-hero { min-height: calc(100vh - var(--nav-h)); display: grid; grid-template-columns: 1fr 1fr; position: relative; overflow: hidden; background: var(--bg-base); }
  @media (max-width: 820px) { .ct3-hero { grid-template-columns: 1fr; grid-template-rows: 55vw 1fr; } }
  .ct3-hero-photo { position: relative; overflow: hidden; background: var(--bg-alt); }
.ct3-hero-photo img {
  position: absolute;
  inset: 0;

  width: 100%;
  height: 100%;

  object-fit: cover;
  object-position: center top;

  transform: scale(0.92);

  transition:
    transform 0.7s ease,
    filter 0.4s ease;
}  .ct3-hero-photo::after { content: ''; position: absolute; inset: 0; background: linear-gradient(to right, transparent 70%, var(--bg-base) 100%); pointer-events: none; }
  @media (max-width: 820px) { .ct3-hero-photo::after { background: linear-gradient(to bottom, transparent 70%, var(--bg-base) 100%); } }
  .ct3-hero-initials { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
  .ct3-hero-initials-text { font-family: 'Playfair Display', serif; font-size: clamp(80px, 14vw, 160px); font-weight: 400; font-style: italic; color: var(--sage); opacity: 0.15; user-select: none; line-height: 1; }
  .ct3-hero-badge { position: absolute; top: 2rem; right: 2rem; z-index: 3; background: var(--bg-card); border-radius: 14px; border: 1px solid var(--rule-strong); padding: 12px 18px; box-shadow: 0 8px 32px rgba(28,43,38,0.1); max-width: 210px; }
  @media (max-width: 820px) { .ct3-hero-badge { top: 1rem; right: 1rem; } }
  .ct3-hero-badge-label { font-family: 'JetBrains Mono', monospace; font-size: 9px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--sage); display: block; margin-bottom: 5px; }
  .ct3-hero-badge-text { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; color: var(--ink); line-height: 1.45; font-weight: 500; }
  .ct3-hero-text { position: relative; display: flex; flex-direction: column; justify-content: center; padding: clamp(2.5rem, 7vh, 5rem) clamp(2rem, 6vw, 5.5rem); background: var(--bg-base); }
  .ct3-hero-folio { position: absolute; top: clamp(1.2rem, 2.5vh, 1.8rem); left: clamp(2rem, 6vw, 5.5rem); font-family: 'JetBrains Mono', monospace; font-size: 9px; letter-spacing: 0.28em; text-transform: uppercase; color: var(--ink-4); }
  .ct3-hero-name { font-family: 'Playfair Display', Georgia, serif; font-size: clamp(40px, 5.5vw, 72px); font-weight: 500; line-height: 1.06; letter-spacing: -0.025em; color: var(--ink); margin: 0; }
  .ct3-hero-name em { font-style: italic; color: var(--sage); }
  .ct3-hero-cred { font-family: 'Plus Jakarta Sans', sans-serif; font-size: clamp(13px, 1.3vw, 16px); font-weight: 400; color: var(--ink-3); line-height: 1.5; margin: 0; }
  .ct3-hero-ornament { display: flex; align-items: center; gap: 12px; margin: clamp(1.4rem, 3vh, 2rem) 0; }
  .ct3-hero-orn-line { height: 1px; background: var(--sage-border); flex: 1; max-width: 56px; }
  .ct3-hero-orn-diamond { width: 6px; height: 6px; background: var(--sage); transform: rotate(45deg); flex-shrink: 0; }
  .ct3-hero-tagline { font-family: 'Playfair Display', serif; font-size: clamp(17px, 1.85vw, 24px); font-weight: 400; line-height: 1.55; color: var(--ink); max-width: 44ch; margin: 0; }
  .ct3-hero-bio { font-family: 'Plus Jakarta Sans', sans-serif; font-size: clamp(14px, 1.1vw, 15.5px); font-weight: 400; line-height: 1.8; color: var(--ink-2); max-width: 50ch; margin: 0; }
  .ct3-hero-stats { display: flex; gap: clamp(1.5rem, 4vw, 3rem); flex-wrap: wrap; padding-top: 1.5rem; border-top: 1px solid var(--rule); margin-top: clamp(1.4rem, 3vh, 2.2rem); }
  .ct3-hero-stat-num { font-family: 'Playfair Display', serif; font-size: clamp(24px, 2.8vw, 34px); font-weight: 500; color: var(--sage); line-height: 1; display: block; }
  .ct3-hero-stat-label { font-family: 'JetBrains Mono', monospace; font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--ink-3); display: block; margin-top: 5px; }

  /* ═══════════════════════════════════════════════════════════ SECTION SHELL */
.ct3-section {
  position: relative;
  padding: clamp(4.5rem, 10vh, 8rem) clamp(1.5rem, 5vw, 4rem);

  border-bottom: 1px solid var(--rule-strong);
}  .ct3-container { max-width: 1240px; margin: 0 auto; }
  .ct3-folio-header { display: flex; align-items: flex-end; justify-content: space-between; padding-bottom: 2rem; margin-bottom: clamp(2.5rem, 5vh, 4rem); border-bottom: 1px solid var(--rule-strong); }
  .ct3-folio-pg { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.26em; text-transform: uppercase; color: var(--ink-4); }
  .ct3-folio-title { font-family: 'monospace', Georgia, serif; font-size: clamp(36px, 1vw, 68px); font-weight: 500; line-height: 1.06; letter-spacing: -0.025em; color: var(--ink); margin: 0.5rem 0 0; }
  .ct3-folio-title em { font-style: italic; color: var(--sage); }

  /* ═══════════════════════════════════════════════════════════ TICKER */
  .ct3-ticker-wrap { border-top: 1px solid var(--rule-strong); border-bottom: 1px solid var(--rule-strong); background: var(--bg-alt); overflow: hidden; padding: 12px 0; }
  .ct3-ticker-belt { display: flex; white-space: nowrap; animation: ct3-ticker 32s linear infinite; will-change: transform; }
  .ct3-ticker-belt:hover { animation-play-state: paused; }
  @keyframes ct3-ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
  .ct3-ticker-item { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.26em; text-transform: uppercase; color: var(--ink-3); padding-right: 3rem; flex-shrink: 0; display: flex; align-items: center; gap: 2.5rem; }
  .ct3-ticker-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--sage); flex-shrink: 0; }

  /* ═══════════════════════════════════════════════════════════ ABOUT */
  .ct3-about { background: var(--bg-base); }
  .ct3-about-grid { display: grid; grid-template-columns: 1.4fr 1fr; gap: 4rem 6rem; align-items: start; }
  @media (max-width: 900px) { .ct3-about-grid { grid-template-columns: 1fr; gap: 3rem; } }
  .ct3-drop-cap { float: left; font-family: 'Playfair Display', serif; font-size: clamp(72px, 9vw, 100px); font-weight: 400; font-style: italic; line-height: 0.78; color: var(--sage); margin: 0.1em 0.15em 0 0; }
  .ct3-about-body { font-family: 'Plus Jakarta Sans', sans-serif; font-size: clamp(15px, 1.3vw, 18px); line-height: 1.85; font-weight: 400; color: var(--ink-2); margin: 0; }
  .ct3-about-body-2 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: clamp(14px, 1.15vw, 16px); line-height: 1.85; font-weight: 400; color: var(--ink-3); margin: 1.5rem 0 0; }
  .ct3-spec-card { background: var(--bg-card); border-radius: 18px; border: 1px solid var(--rule-strong); border-top: 4px solid var(--sage); padding: 2rem 2.2rem; box-shadow: 0 4px 32px rgba(28,43,38,0.07); }
  .ct3-spec-row { display: flex; justify-content: space-between; align-items: baseline; padding: 13px 0; border-bottom: 1px solid var(--rule); }
  .ct3-spec-row:last-child { border-bottom: none; }
  .ct3-spec-key { font-family: 'JetBrains Mono', monospace; font-size: 9.5px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--ink-3); }
  .ct3-spec-val { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; color: var(--ink); text-align: right; max-width: 60%; font-weight: 500; }

  /* ═══════════════════════════════════════════════════════════
     SERVICES — SHOWCASE + LIST LAYOUT
  ═══════════════════════════════════════════════════════════ */
  .ct3-services {
    background: var(--bg-base);
    padding-bottom: clamp(5rem, 12vh, 10rem);
  }

  .ct3-svc-header {
    display: flex; align-items: flex-end; justify-content: space-between;
    padding-bottom: 2rem; margin-bottom: clamp(2.5rem, 5vh, 4rem);
    border-bottom: 1px solid var(--rule-strong);
  }
  .ct3-svc-header-sub {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 14px; color: var(--ink-3); font-weight: 400;
    max-width: 28ch; line-height: 1.6; text-align: right; margin: 0;
  }

  /* Two-column layout */
  .ct3-svc-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0 3rem;
    align-items: start;
  }
  @media (max-width: 860px) {
    .ct3-svc-layout { grid-template-columns: 1fr; gap: 2.5rem; }
  }

  /* ── LEFT: Showcase panel ── */
  .ct3-svc-showcase {
    position: sticky; top: calc(var(--nav-h) + 2rem);
  }
  .ct3-svc-showcase-inner {
    background: var(--ink);
    border-radius: 24px;
    padding: 2.8rem 3rem 2.4rem;
    position: relative; overflow: hidden;
    min-height: 460px;
    display: flex; flex-direction: column;
    animation: ct3-fade-up-anim 0.4s cubic-bezier(0.16,0.84,0.3,1) both;
  }

  .ct3-svc-bg-numeral {
    position: absolute; right: -0.1em; bottom: -0.2em;
    font-family: 'Playfair Display', serif;
    font-size: clamp(120px, 16vw, 200px);
    font-style: italic; font-weight: 500;
    color: rgba(255,255,255,0.04);
    line-height: 1; pointer-events: none; user-select: none;
    letter-spacing: -0.05em;
  }

  .ct3-svc-sc-meta {
    display: flex; align-items: center; gap: 10px; margin-bottom: 1.6rem;
  }
  .ct3-svc-sc-icon { font-size: 20px; color: var(--sage-light); line-height: 1; }
  .ct3-svc-sc-kind {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px; letter-spacing: 0.26em; text-transform: uppercase;
    color: var(--sage-light); padding: 4px 12px; border-radius: 100px;
    border: 1px solid rgba(82,160,140,0.3); background: rgba(82,160,140,0.1);
  }

  .ct3-svc-sc-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(26px, 3vw, 38px); font-weight: 500; font-style: italic;
    color: #fff; line-height: 1.15; margin: 0 0 1.4rem; letter-spacing: -0.02em;
  }

  .ct3-svc-sc-rule { height: 1px; background: rgba(255,255,255,0.1); margin-bottom: 1.4rem; }

  .ct3-svc-sc-desc {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 14px; line-height: 1.8; font-weight: 400;
    color: rgba(248,250,249,0.65); flex: 1; margin: 0 0 1.4rem;
  }

  .ct3-svc-sc-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 1.6rem; }
  .ct3-svc-sc-tag {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase;
    padding: 4px 10px; border-radius: 100px;
    border: 1px solid rgba(255,255,255,0.12); color: rgba(248,250,249,0.5);
  }

  .ct3-svc-sc-footer {
    display: flex; align-items: center; gap: 1.2rem; flex-wrap: wrap; margin-top: auto;
  }
  .ct3-svc-sc-price-block { display: flex; flex-direction: column; gap: 2px; }
  .ct3-svc-sc-price-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 8px; letter-spacing: 0.24em; text-transform: uppercase;
    color: rgba(248,250,249,0.35);
  }
  .ct3-svc-sc-price {
    font-family: 'Playfair Display', serif;
    font-size: 22px; font-weight: 500; color: var(--sage-light);
  }
  .ct3-svc-sc-btn {
    display: inline-flex; align-items: center; gap: 10px;
    flex: 1; justify-content: center;
    background: var(--sage); color: #fff;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 13px; font-weight: 600;
    border: none; cursor: pointer; border-radius: 12px;
    padding: 13px 22px;
    transition: background 0.25s ease, transform 0.2s ease;
    box-shadow: 0 4px 20px rgba(61,122,106,0.4);
  }
  .ct3-svc-sc-btn:hover { background: var(--sage-light); transform: translateY(-2px); }

  .ct3-svc-dots { display: flex; align-items: center; gap: 6px; margin-top: 1.8rem; }
  .ct3-svc-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: rgba(255,255,255,0.2); border: none; cursor: pointer;
    padding: 0; transition: all 0.25s ease;
  }
  .ct3-svc-dot.active { background: var(--sage-light); width: 20px; border-radius: 3px; }

  /* ── RIGHT: Service list ── */
  .ct3-svc-list { display: flex; flex-direction: column; border-top: 1px solid var(--rule); }

  .ct3-svc-item {
    display: flex; align-items: center; justify-content: space-between;
    gap: 1.5rem; width: 100%;
    background: none; border: none; border-bottom: 1px solid var(--rule);
    cursor: pointer; padding: 1.6rem 1rem;
    text-align: left; border-radius: 0;
    transition: background 0.2s ease, padding-left 0.2s ease;
    position: relative;
  }
  .ct3-svc-item::before {
    content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
    background: var(--sage); border-radius: 0 2px 2px 0;
    transform: scaleY(0); transform-origin: center;
    transition: transform 0.25s cubic-bezier(0.7,0,0.2,1);
  }
  .ct3-svc-item:hover, .ct3-svc-item.active { background: var(--bg-alt); padding-left: 1.6rem; }
  .ct3-svc-item.active::before { transform: scaleY(1); }
  .ct3-svc-item:hover::before { transform: scaleY(0.6); }

  .ct3-svc-item-left { display: flex; align-items: flex-start; gap: 1.2rem; flex: 1; min-width: 0; }
  .ct3-svc-item-num {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px; letter-spacing: 0.18em;
    color: var(--ink-4); flex-shrink: 0; margin-top: 3px;
  }
  .ct3-svc-item.active .ct3-svc-item-num { color: var(--sage); }
  .ct3-svc-item-body { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
  .ct3-svc-item-kind {
    font-family: 'JetBrains Mono', monospace;
    font-size: 8.5px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--ink-4);
  }
  .ct3-svc-item.active .ct3-svc-item-kind { color: var(--sage); }
  .ct3-svc-item-name {
    font-family: 'Playfair Display', serif;
    font-size: clamp(16px, 1.6vw, 20px); font-weight: 500;
    color: var(--ink); line-height: 1.2; transition: color 0.2s ease;
  }
  .ct3-svc-item-preview {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 12.5px; color: var(--ink-3); font-weight: 400;
    line-height: 1.5; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    max-width: 42ch; opacity: 0; max-height: 0;
    transition: opacity 0.25s ease, max-height 0.25s ease;
  }
  .ct3-svc-item.active .ct3-svc-item-preview,
  .ct3-svc-item:hover .ct3-svc-item-preview { opacity: 1; max-height: 2em; }
  .ct3-svc-item-right { display: flex; align-items: center; gap: 0.8rem; flex-shrink: 0; }
  .ct3-svc-item-price {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 13px; font-weight: 600; color: var(--sage); white-space: nowrap;
  }
  .ct3-svc-item-arrow { color: var(--ink-4); transition: color 0.2s ease, transform 0.2s ease; display: flex; align-items: center; }
  .ct3-svc-item:hover .ct3-svc-item-arrow,
  .ct3-svc-item.active .ct3-svc-item-arrow { color: var(--sage); transform: translateX(3px); }

  /* Legacy — hidden */
  .ct3-service-row { display: none; }
  .ct3-services-cards { display: none; }

  /* ═══════════════════════════════════════════════════════════ INSIGHTS */
  .ct3-insights { background: var(--bg-base); }
  .ct3-insights-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
  @media (max-width: 760px) { .ct3-insights-grid { grid-template-columns: 1fr; } }
  .ct3-insight-card { background: var(--bg-card); border-radius: 18px; border: 1px solid var(--rule); padding: 2rem 2rem 1.8rem; cursor: pointer; transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease; position: relative; overflow: hidden; }
  .ct3-insight-card::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, var(--sage), var(--peach)); transform: scaleX(0); transform-origin: left; transition: transform 0.4s ease; border-radius: 0 0 18px 18px; }
  .ct3-insight-card:hover { transform: translateY(-5px); box-shadow: 0 12px 40px rgba(28,43,38,0.1); border-color: var(--sage-border); }
  .ct3-insight-card:hover::after { transform: scaleX(1); }
  .ct3-insight-meta { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
  .ct3-insight-num { font-family: 'JetBrains Mono', monospace; font-size: 9px; letter-spacing: 0.22em; color: var(--sage); }
  .ct3-insight-category { font-family: 'JetBrains Mono', monospace; font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-3); background: var(--bg-alt); padding: 3px 8px; border-radius: 100px; }
  .ct3-insight-rule { height: 1px; background: var(--rule); margin-bottom: 1rem; }
  .ct3-insight-title { font-family: 'Playfair Display', serif; font-size: clamp(18px, 2vw, 22px); font-weight: 500; line-height: 1.25; color: var(--ink); margin: 0 0 0.75rem; }
  .ct3-insight-excerpt { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13.5px; line-height: 1.75; color: var(--ink-2); font-weight: 400; }
  .ct3-insight-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 1.4rem; padding-top: 1rem; border-top: 1px solid var(--rule); }
  .ct3-insight-date { font-family: 'JetBrains Mono', monospace; font-size: 9px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--ink-4); }
  .ct3-insight-arrow { color: var(--sage); transition: transform 0.25s ease; }
  .ct3-insight-card:hover .ct3-insight-arrow { transform: translate(3px, -3px); }

  /* ═══════════════════════════════════════════════════════════ FAQ */
  .ct3-faq { background: var(--bg-alt); }
  .ct3-faq-item { border-bottom: 1px solid var(--rule); position: relative; }
  .ct3-faq-item:first-of-type { border-top: 1px solid var(--rule); }
  .ct3-faq-trigger { width: 100%; background: none; border: none; cursor: pointer; padding: 1.4rem 0; text-align: left; display: flex; align-items: center; justify-content: space-between; gap: 2rem; transition: color 0.25s ease; }
  .ct3-faq-trigger:hover .ct3-faq-q { color: var(--sage); }
  .ct3-faq-q-wrap { display: flex; align-items: baseline; gap: 1.2rem; }
  .ct3-faq-num { font-family: 'JetBrains Mono', monospace; font-size: 9px; letter-spacing: 0.22em; color: var(--ink-4); flex-shrink: 0; width: 28px; }
  .ct3-faq-q { font-family: 'Plus Jakarta Sans', sans-serif; font-size: clamp(15px, 1.6vw, 19px); font-weight: 600; color: var(--ink); line-height: 1.3; transition: color 0.25s ease; }
  .ct3-faq-icon { width: 35px; height: 35px; border-radius: 50%; border: 1px solid var(--rule-strong); display: flex; align-items: center; justify-content: center; color: var(--ink-3); flex-shrink: 0; transition: border-color 0.25s ease, background 0.25s ease, transform 0.3s ease; font-size: 18px; font-weight: 300; font-family: 'Plus Jakarta Sans', sans-serif; }
  .ct3-faq-icon.open { transform: rotate(45deg); border-color: var(--sage); color: var(--sage); background: var(--sage-pale); }
  .ct3-faq-body { max-height: 0; overflow: hidden; transition: max-height 0.45s cubic-bezier(0.7, 0, 0.2, 1), opacity 0.3s ease; opacity: 0; }
  .ct3-faq-body.open { max-height: 500px; opacity: 1; }
  .ct3-faq-ans { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 15px; line-height: 1.8; color: var(--ink-2); font-weight: 400; padding: 0 0 1.6rem 3.2rem; max-width: 68ch; }

  /* ═══════════════════════════════════════════════════════════ BOOKING */
  .ct3-booking { background: var(--bg-base); }
  .ct3-booking-grid { display: grid; grid-template-columns: 1fr 1.3fr; gap: 4rem 5rem; align-items: start; }
  @media (max-width: 900px) { .ct3-booking-grid { grid-template-columns: 1fr; gap: 3rem; } }
  .ct3-booking-intro { font-family: 'Plus Jakarta Sans', sans-serif; font-size: clamp(14px, 1.25vw, 16.5px); line-height: 1.8; color: var(--ink-2); font-weight: 400; max-width: 44ch; margin: 0 0 2rem; }
  .ct3-booking-details { background: var(--bg-card); border-radius: 18px; border: 1px solid var(--rule-strong); border-top: 4px solid var(--sage); padding: 2rem 2.2rem; box-shadow: 0 4px 24px rgba(28,43,38,0.06); }
  .ct3-chips { display: flex; flex-wrap: wrap; gap: 8px; }
  .ct3-chip { padding: 9px 16px; border-radius: 100px; border: 1px solid var(--rule-strong); background: var(--bg-card); color: var(--ink-2); font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.08em; cursor: pointer; transition: all 0.2s ease; }
  .ct3-chip:hover:not(.selected):not(:disabled) { border-color: var(--sage); color: var(--sage); background: var(--sage-pale); }
  .ct3-chip.selected { background: var(--sage); color: #fff; border-color: var(--sage); }
  .ct3-chip:disabled { opacity: 0.3; cursor: not-allowed; text-decoration: line-through; }
  .ct3-booking-card { background: var(--bg-card); border-radius: 20px; border: 1px solid var(--rule-strong); border-top: 4px solid var(--sage); padding: 2.5rem 2.8rem; box-shadow: 0 8px 40px rgba(28,43,38,0.08); }
  .ct3-input { width: 100%; background: var(--bg-alt); border-radius: 10px; border: 1px solid var(--rule-strong); color: var(--ink); padding: 13px 16px; margin-top: 10px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; font-weight: 400; outline: none; transition: border-color 0.25s ease, background 0.25s ease; }
  .ct3-input::placeholder { color: var(--ink-4); }
  .ct3-input:focus { border-color: var(--sage); background: #fff; box-shadow: 0 0 0 3px var(--sage-pale); }
  .ct3-booking-success { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 3.5rem 2rem; }
  .ct3-success-circle { width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, var(--sage), var(--sage-light)); display: flex; align-items: center; justify-content: center; color: #fff; margin-bottom: 1.4rem; box-shadow: 0 0 0 10px var(--sage-pale); }

  /* ═══════════════════════════════════════════════════════════ FOOTER */
  .ct3-footer { background: var(--ink); color: var(--bg-base); padding: clamp(3rem, 7vh, 5rem) clamp(1.5rem, 5vw, 4rem) clamp(1.5rem, 4vh, 2.5rem); }
  .ct3-footer-name { font-family: 'Playfair Display', serif; font-size: clamp(40px, 4vw, 96px); font-style: italic;  line-height: 0.95; letter-spacing: -0.005em; color: #fff; margin: 0 0 clamp(1.5rem, 3vh, 2.5rem); opacity: 0.95; }
  .ct3-footer-grid { display: grid; grid-template-columns: 1.5fr 1fr 1fr; gap: 3rem 5rem; padding-top: 2.5rem; border-top: 1px solid rgba(255,255,255,0.1); }
  @media (max-width: 720px) { .ct3-footer-grid { grid-template-columns: 1fr; gap: 2rem; } }
  .ct3-footer-col-label { font-family: 'JetBrains Mono', monospace; font-size: 9px; letter-spacing: 0.26em; text-transform: uppercase; color: var(--sage-light); margin-bottom: 1rem; display: block; }
  .ct3-footer-col-text { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; line-height: 1.75; color: rgba(248,250,249,0.6); font-weight: 400; }
  .ct3-footer-link { display: block; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; color: rgba(248,250,249,0.65); font-weight: 400; text-decoration: none; margin-bottom: 8px; transition: color 0.2s ease; }
  .ct3-footer-link:hover { color: var(--sage-light); }
  .ct3-footer-bottom { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem; padding-top: 2rem; margin-top: 2.5rem; border-top: 1px solid rgba(255,255,255,0.08); }
  .ct3-footer-copy { font-family: 'JetBrains Mono', monospace; font-size: 9px; letter-spacing: 0.22em; text-transform: uppercase; color: rgba(248,250,249,0.3); }
  .ct3-footer-tag { font-family: 'JetBrains Mono', monospace; font-size: 9px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--sage-light); }

  /* ═══════════════════════════════════════════════════════════ ACCENTS */
  .ct3-gold-rule-top { border-top: 4px solid var(--sage); }
  .ct3-gold-rule-bottom { border-bottom: 1px solid var(--sage-border); }

  /* ═══════════════════════════════════════════════════════════ BUTTONS */
  .ct3-btn-primary { display: inline-flex; align-items: center; gap: 10px; padding: 13px 28px; background: var(--sage); color: #fff; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; font-weight: 600; letter-spacing: -0.01em; border: none; cursor: pointer; border-radius: 12px; transition: background 0.25s ease, transform 0.2s ease, box-shadow 0.25s ease; box-shadow: 0 4px 16px rgba(61,122,106,0.3); }
  .ct3-btn-primary:hover { background: var(--sage-light); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(61,122,106,0.35); }
  .ct3-btn-primary:disabled { opacity: 0.55; cursor: not-allowed; transform: none; box-shadow: none; }
  .ct3-btn-ghost { display: inline-flex; align-items: center; gap: 10px; padding: 12px 26px; background: transparent; color: var(--ink); font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; font-weight: 600; letter-spacing: -0.01em; border: 1.5px solid var(--rule-strong); cursor: pointer; border-radius: 12px; transition: all 0.25s ease; }
  .ct3-btn-ghost:hover { background: var(--bg-alt); border-color: var(--ink); }
  .ct3-btn-full { width: 100%; justify-content: center; }

  /* ═══════════════════════════════════════════════════════════ ANIMATIONS */
  .ct3-reveal { opacity: 0; transform: translateY(20px); transition: opacity 0.7s cubic-bezier(0.16, 0.84, 0.3, 1), transform 0.7s cubic-bezier(0.16, 0.84, 0.3, 1); }
  .ct3-reveal.visible { opacity: 1; transform: translateY(0); }
  @keyframes ct3-fade-in { from { opacity: 0; } to { opacity: 1; } }
  .ct3-fade-in { animation: ct3-fade-in 0.9s ease both; }
  @keyframes ct3-fade-up { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
  .ct3-fade-up { animation: ct3-fade-up 0.85s cubic-bezier(0.16, 0.84, 0.3, 1) both; }
  @keyframes ct3-slide-left { from { opacity: 0; transform: translateX(-16px); } to { opacity: 1; transform: translateX(0); } }
  .ct3-slide-left { animation: ct3-slide-left 0.75s cubic-bezier(0.16, 0.84, 0.3, 1) both; }
  @keyframes ct3-draw { from { transform: scaleX(0); } to { transform: scaleX(1); } }
  .ct3-draw { transform-origin: left; animation: ct3-draw 1.1s cubic-bezier(0.7, 0, 0.2, 1) 0.4s both; }
  @keyframes ct3-fade-up-anim { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }




  /* HERO */
/* =========================================
   HERO SECTION
========================================= */

.ct3-hero {
  min-height: calc(100vh - var(--nav-h));

  display: grid;
  grid-template-columns: 0.95fr 1.05fr;

  align-items: center;

  gap: clamp(2rem, 3vw, 4rem);

  padding:
    clamp(1.2rem, 2vw, 2rem)
    clamp(1.5rem, 4vw, 5rem);

  overflow: hidden;

  background: var(--bg-base);
}

/* =========================================
   LEFT SIDE
========================================= */

.ct3-hero-photo-wrap {
  position: relative;

  display: flex;
  justify-content: center;
  align-items: center;
}

.ct3-hero-glow {
  position: absolute;

  width: 420px;
  height: 420px;

  background: radial-gradient(
    circle,
    rgba(82,160,140,0.14),
    transparent 70%
  );

  filter: blur(28px);

  z-index: 0;
}

.ct3-hero-photo-card {
  position: relative;
  z-index: 2;

  width: min(100%, 500px);

  border-radius: 32px;

  overflow: hidden;

  background: white;

  border: 1px solid rgba(255,255,255,0.55);

  box-shadow:
    0 30px 60px rgba(0,0,0,0.06),
    0 10px 24px rgba(0,0,0,0.04);
}

.ct3-hero-photo {
  position: relative;

  width: 100%;

  height: min(62vh, 680px);

  overflow: hidden;

  border-radius: 32px;

  background: var(--bg-alt);
}

.ct3-hero-photo img {
  width: 100%;
  height: 100%;

  object-fit: cover;
  object-position: center top;
}

/* =========================================
   FLOATING CARD
========================================= */

.ct3-floating-card {
  position: absolute;

  bottom: 18px;
  left: 18px;

  display: flex;
  align-items: center;
  gap: 12px;

  padding: 12px 16px;

  background: rgba(255,255,255,0.82);

  backdrop-filter: blur(14px);

  border-radius: 16px;

  border: 1px solid rgba(255,255,255,0.6);

  box-shadow:
    0 10px 24px rgba(0,0,0,0.06);
}

.ct3-floating-dot {
  width: 10px;
  height: 10px;

  border-radius: 50%;

  background: #3D7A6A;

  box-shadow:
    0 0 0 5px rgba(61,122,106,0.14);
}

.ct3-floating-label {
  font-size: 12px;
  font-weight: 600;

  color: var(--ink);
}

.ct3-floating-text {
  margin: 0;

  font-size: 12px;

  color: var(--ink-3);
}

/* =========================================
   RIGHT SIDE
========================================= */

.ct3-hero-content {
  max-width: 640px;
}

.ct3-hero-title {
  font-family: 'Playfair Display', serif;

  font-size: clamp(3.6rem, 5.5vw, 5.8rem);

  line-height: 0.92;

  letter-spacing: -0.05em;

  margin:
    0.5rem 0
    1.2rem;
}

.ct3-hero-title em {
  color: var(--sage);

  font-style: italic;
}

.ct3-hero-subtitle {
  font-size: 1.02rem;

  line-height: 1.8;

  color: var(--ink-2);

  max-width: 52ch;
}

/* =========================================
   META CARDS
========================================= */

.ct3-hero-meta {
  display: flex;

  gap: 0.9rem;

  flex-wrap: wrap;

  margin-top: 2rem;
}

.ct3-meta-card {
  background: rgba(255,255,255,0.72);

  border: 1px solid var(--rule);

  backdrop-filter: blur(10px);

  border-radius: 18px;

  padding: 1rem 1.2rem;

  min-width: 130px;

  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;
}

.ct3-meta-card:hover {
  transform: translateY(-3px);

  box-shadow:
    0 10px 24px rgba(0,0,0,0.05);
}

.ct3-meta-number {
  display: block;

  font-size: 1.6rem;

  font-family: 'Playfair Display', serif;

  color: var(--sage);

  margin-bottom: 4px;
}

.ct3-meta-label {
  font-size: 10px;

  letter-spacing: 0.18em;

  text-transform: uppercase;

  color: var(--ink-3);

  font-family: 'JetBrains Mono', monospace;
}

/* =========================================
   BUTTONS
========================================= */

.ct3-hero-actions {
  display: flex;

  gap: 0.9rem;

  flex-wrap: wrap;

  margin-top: 2.2rem;
}

.ct3-btn-primary,
.ct3-btn-secondary {
  height: 50px;

  padding: 0 24px;

  border-radius: 14px;

  font-size: 14px;

  font-weight: 600;

  transition: all 0.25s ease;
}

.ct3-btn-primary {
  background: var(--sage);

  color: white;

  border: none;

  box-shadow:
    0 8px 24px rgba(61,122,106,0.22);
}

.ct3-btn-primary:hover {
  transform: translateY(-2px);

  background: var(--sage-light);
}

.ct3-btn-secondary {
  background: transparent;

  border: 1px solid var(--rule-strong);
}

.ct3-btn-secondary:hover {
  background: white;

  transform: translateY(-2px);
}

/* =========================================
   MOBILE
========================================= */

@media (max-width: 900px) {
  .ct3-hero {
    grid-template-columns: 1fr;

    padding:
      1.5rem
      1.25rem
      3rem;

    gap: 2rem;
  }

  .ct3-hero-photo {
    height: 480px;
  }

  .ct3-hero-title {
    font-size: clamp(3rem, 12vw, 4.6rem);
  }

  .ct3-hero-content {
    max-width: 100%;
  }
}
  `

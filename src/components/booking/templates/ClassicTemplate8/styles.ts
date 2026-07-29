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
    --paper:        #FBFAF7;
    --paper-2:      #F3F0E8;
    --card:         #FFFFFF;
    --ink:          #1E2124;
    --ink-soft:     #5B6470;
    --line:         rgba(30,33,36,0.10);
    --line-strong:  rgba(30,33,36,0.16);

    /* Default/neutral brand accent — reads professional-but-warm even
       before a persona is picked. */
    --accent:       #3E6C64;
    --accent-soft:  rgba(62,108,100,0.10);
    --accent-ink:   #FFFFFF;

    /* Persona accents — swapped in as --accent when a persona is active */
    --student:      #FF7A59;
    --student-soft: rgba(255,122,89,0.12);
    --professional: #2B5750;
    --professional-soft: rgba(43,87,80,0.10);

    --radius:   16px;
    --radius-sm: 10px;
    --shadow-sm: 0 2px 10px rgba(30,33,36,0.05);
    --shadow-md: 0 16px 40px rgba(30,33,36,0.08);
    --ease: cubic-bezier(0.4, 0, 0.2, 1);

    background: var(--paper);
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
  .ct8-section-title { font-size: clamp(28px, 3.6vw, 42px); line-height: 1.12; margin: 0.6rem 0 0; }
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

  /* ── Navbar ── */
  .ct8-nav {
    position: sticky; top: 0; z-index: 40;
    display: flex; align-items: center; justify-content: space-between;
    padding: 1.1rem clamp(1.25rem, 5vw, 3rem);
    background: rgba(251,250,247,0.88); backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--line);
  }
  .ct8-nav-name { font-family: 'Manrope', sans-serif; font-weight: 800; font-size: 15px; color: var(--ink); }
  .ct8-nav-links { display: flex; align-items: center; gap: 1.6rem; }
  .ct8-nav-link { background: none; border: none; cursor: pointer; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; color: var(--ink-soft); padding: 0; }
  .ct8-nav-link:hover { color: var(--ink); }
  @media (max-width: 760px) { .ct8-nav-links-desktop { display: none; } }

  /* ── Hero ── premium/editorial: near-monochrome (ink, paper, hairlines),
     serif display headline, thin-underline persona tabs instead of a
     colored pill, and a plain numeric stat row instead of icon chips.
     Accent color appears in exactly one place — a hover state. ── */
  .ct8-hero-premium {
    position: relative;
    padding: clamp(4rem, 10vh, 7rem) clamp(1.25rem, 5vw, 4rem) 0;
  }

  .ct8-hero-premium-inner {
    max-width: 720px; margin: 0 auto;
    display: flex; flex-direction: column; align-items: center; text-align: center;
    padding-bottom: clamp(3.5rem, 8vh, 5rem);
  }

  .ct8-persona-tabs {
    display: inline-flex; gap: clamp(1.75rem, 4vw, 2.75rem);
    margin-bottom: clamp(2.5rem, 6vh, 3.5rem);
  }
  .ct8-persona-tab {
    position: relative;
    background: none; border: none; cursor: pointer; padding: 0 0 13px;
    font-family: 'Manrope', sans-serif; font-size: 11.5px; font-weight: 700;
    letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-soft);
    transition: color 0.25s var(--ease);
  }
  .ct8-persona-tab::after {
    content: ''; position: absolute; left: 0; right: 0; bottom: 0; height: 1px;
    background: var(--ink); transform: scaleX(0); transform-origin: center;
    transition: transform 0.3s var(--ease);
  }
  .ct8-persona-tab.active { color: var(--ink); }
  .ct8-persona-tab.active::after { transform: scaleX(1); }
  .ct8-persona-tab:not(.active):hover { color: var(--ink); }

  .ct8-hero-premium-eyebrow {
    display: flex; align-items: center; gap: 12px;
    font-family: 'Manrope', sans-serif; font-size: 11px; font-weight: 600;
    letter-spacing: 0.16em; text-transform: uppercase; color: var(--ink-soft);
    margin-bottom: 1.4rem;
  }
  .ct8-hero-premium-eyebrow::before,
  .ct8-hero-premium-eyebrow::after {
    content: ''; width: 26px; height: 1px; background: var(--line-strong);
  }

  .ct8-hero-premium-headline {
    font-family: 'Fraunces', Georgia, serif;
    font-weight: 500;
    font-size: clamp(38px, 5.6vw, 60px); line-height: 1.08; letter-spacing: -0.01em;
    margin: 0 0 1.6rem; max-width: 17ch; color: var(--ink);
  }
  .ct8-hero-premium-headline em { font-style: italic; font-weight: 500; color: var(--ink); }

  .ct8-hero-premium-cred {
    display: inline-flex; align-items: center; gap: 10px;
    font-family: 'Manrope', sans-serif; font-weight: 600; font-size: 12.5px;
    letter-spacing: 0.03em; color: var(--ink-soft);
    margin: 0 0 1.6rem;
  }
  .ct8-hero-premium-cred-avatar {
    width: 24px; height: 24px; border-radius: 50%; overflow: hidden; flex-shrink: 0;
    border: 1px solid var(--line-strong); filter: grayscale(0.4);
  }
  .ct8-hero-premium-cred-avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .ct8-hero-premium-cred-sep { color: var(--line-strong); }

  .ct8-hero-bio {
    font-size: 15.5px; line-height: 1.8; color: var(--ink-soft);
    margin: 0 0 2.4rem; max-width: 46ch; font-weight: 400;
  }

  .ct8-hero-ctas { display: flex; flex-wrap: wrap; gap: 1.6rem; align-items: center; justify-content: center; margin-bottom: clamp(2.5rem, 6vh, 3.5rem); }

  .ct8-hero-premium-btn {
    display: inline-flex; align-items: center; gap: 9px;
    padding: 15px 34px; border: none; cursor: pointer;
    background: var(--ink); color: var(--paper);
    font-family: 'Manrope', sans-serif; font-weight: 600; font-size: 12px;
    letter-spacing: 0.08em; text-transform: uppercase;
    transition: background 0.25s var(--ease), transform 0.25s var(--ease);
  }
  .ct8-hero-premium-btn:hover { background: var(--accent); transform: translateY(-1px); }

  .ct8-hero-premium-link {
    background: none; border: none; cursor: pointer; padding: 0;
    font-family: 'Manrope', sans-serif; font-weight: 600; font-size: 12px;
    letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink);
    text-decoration: underline; text-decoration-color: var(--line-strong);
    text-underline-offset: 5px; transition: text-decoration-color 0.25s var(--ease);
  }
  .ct8-hero-premium-link:hover { text-decoration-color: var(--ink); }

  .ct8-hero-stats { display: flex; align-items: center; gap: clamp(1.75rem, 4vw, 3rem); }
  .ct8-hero-stat {
    display: flex; flex-direction: column; align-items: center; gap: 4px;
  }
  .ct8-hero-stat-num {
    font-family: 'Fraunces', Georgia, serif; font-weight: 500; font-size: 27px; color: var(--ink); line-height: 1;
  }
  .ct8-hero-stat-lbl {
    font-size: 10px; color: var(--ink-soft); text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600;
  }
  .ct8-hero-stat-divider { width: 1px; height: 34px; background: var(--line-strong); }

  /* ── Marquee strip beneath the hero ── monochrome, thin hairlines only ── */
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

  /* ── About — photo card ── */
  .ct8-about-photo-wrap {
    position: relative; border-radius: 22px; overflow: hidden;
    aspect-ratio: 4/4.6; box-shadow: var(--shadow-md); margin-bottom: 1.1rem;
  }
  .ct8-about-photo { width: 100%; height: 100%; object-fit: cover; display: block; }
  .ct8-about-photo-badge {
    position: absolute; left: 12px; bottom: 12px; z-index: 1;
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(255,255,255,0.92); backdrop-filter: blur(6px);
    padding: 8px 14px 8px 8px; border-radius: 100px;
    font-family: 'Manrope', system-ui, sans-serif; font-weight: 700; font-size: 12px; color: var(--ink);
    box-shadow: var(--shadow-sm);
  }
  .ct8-about-photo-badge-icon {
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    width: 24px; height: 24px; border-radius: 50%; background: var(--accent-soft); color: var(--accent);
  }

  /* ── About ── */
  .ct8-about-grid { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: clamp(2rem, 5vw, 3.5rem); align-items: start; }
  .ct8-about-grid--with-photo { grid-template-columns: 0.8fr 1.2fr; }
  @media (max-width: 860px) { .ct8-about-grid, .ct8-about-grid--with-photo { grid-template-columns: 1fr; } }
  .ct8-about-body { font-size: 15.5px; line-height: 1.8; color: var(--ink-soft); margin: 0 0 1.6rem; }
  .ct8-stat-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.9rem; margin-bottom: 1.4rem; }
  .ct8-stat-box { padding: 1.3rem; text-align: center; }
  .ct8-stat-box-num { font-family: 'Manrope', sans-serif; font-weight: 800; font-size: 26px; color: var(--accent); }
  .ct8-stat-box-lbl { font-size: 10.5px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-soft); margin-top: 4px; }
  .ct8-cred-card { padding: 1.5rem; }
  .ct8-cred-title { font-family: 'Manrope', sans-serif; font-weight: 700; font-size: 12px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink); display: block; margin-bottom: 0.9rem; }
  .ct8-cred-item { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 0.6rem; }
  .ct8-cred-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); margin-top: 6px; flex-shrink: 0; }
  .ct8-cred-text { font-size: 13.5px; color: var(--ink-soft); line-height: 1.5; }
  .ct8-chip-wrap { display: flex; flex-wrap: wrap; gap: 8px; }
  .ct8-chip { display: inline-flex; padding: 6px 14px; border-radius: 100px; border: 1px solid var(--line-strong); font-size: 12.5px; color: var(--ink-soft); background: var(--paper); }

  /* ── Services ── uses the shared bento system below (.ct8-bento-grid /
     .ct8-bento-tile) ── */

  /* ── FAQ ── */
  .ct8-faq-grid { display: grid; grid-template-columns: 0.85fr 1.15fr; gap: clamp(2rem, 5vw, 3.5rem); }
  @media (max-width: 860px) { .ct8-faq-grid { grid-template-columns: 1fr; } }
  .ct8-faq-item { border-bottom: 1px solid var(--line); }
  .ct8-faq-trigger { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 12px; background: none; border: none; cursor: pointer; padding: 1.1rem 0; text-align: left; }
  .ct8-faq-q { font-family: 'Manrope', sans-serif; font-weight: 600; font-size: 15px; color: var(--ink); }
  .ct8-faq-icon { font-size: 18px; color: var(--accent); transition: transform 0.25s var(--ease); flex-shrink: 0; }
  .ct8-faq-icon.open { transform: rotate(45deg); }
  .ct8-faq-body { max-height: 0; overflow: hidden; transition: max-height 0.35s var(--ease); }
  .ct8-faq-body.open { max-height: 320px; }
  .ct8-faq-ans { font-size: 13.5px; line-height: 1.7; color: var(--ink-soft); margin: 0 0 1.2rem; }

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
  .ct8-footer { background: var(--paper-2); border-top: 1px solid var(--line); padding: clamp(2.5rem, 6vh, 3.5rem) clamp(1.25rem, 5vw, 4rem) 1.6rem; }
  .ct8-footer-inner { max-width: 1140px; margin: 0 auto; }
  .ct8-footer-top { display: grid; grid-template-columns: 1.3fr 1fr 1fr; gap: 2rem; padding-bottom: 2rem; }
  @media (max-width: 700px) { .ct8-footer-top { grid-template-columns: 1fr; gap: 1.4rem; } }
  .ct8-footer-name { font-family: 'Manrope', sans-serif; font-weight: 800; font-size: 19px; margin: 0 0 0.5rem; }
  .ct8-footer-tagline { font-size: 13px; color: var(--ink-soft); line-height: 1.6; }
  .ct8-footer-col-title { display: block; font-family: 'Manrope', sans-serif; font-weight: 700; font-size: 11.5px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink); margin-bottom: 0.8rem; }
  .ct8-footer-link { display: block; background: none; border: none; padding: 0 0 0.55rem; cursor: pointer; text-align: left; font-size: 13.5px; color: var(--ink-soft); font-family: 'Inter', sans-serif; }
  .ct8-footer-link:hover { color: var(--accent); }
  .ct8-footer-bottom { border-top: 1px solid var(--line); padding-top: 1.4rem; }
  .ct8-footer-copy { font-size: 12px; color: var(--ink-soft); }

  /* ── Booking — Calendly-style modal card ── */
  .ct8-book-card {
    display: grid;
    grid-template-columns: 380px 500px;
    border-radius: var(--radius); overflow: hidden;
    box-shadow: var(--shadow-md); background: var(--card);
    min-height: 460px;
    width: fit-content; max-width: 100%;
    margin: 0 auto;
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

  /* Education — vertical timeline */
  .ct8-timeline { position: relative; display: flex; flex-direction: column; gap: 1.6rem; margin-top: 0.5rem; }
  .ct8-timeline::before {
    content: ''; position: absolute; left: 5px; top: 8px; bottom: 8px; width: 1px;
    background: var(--line-strong);
  }
  .ct8-timeline-item { position: relative; padding-left: 2.2rem; }
  .ct8-timeline-marker {
    position: absolute; left: 0; top: 10px; width: 11px; height: 11px; border-radius: 50%;
    background: var(--accent); box-shadow: 0 0 0 4px var(--accent-soft);
  }
  .ct8-timeline-card { padding: 1.4rem 1.6rem; }
  .ct8-timeline-year {
    font-family: 'Manrope', system-ui, sans-serif; font-size: 11px; font-weight: 700;
    letter-spacing: 0.06em; text-transform: uppercase; color: var(--accent);
  }
  .ct8-timeline-title { font-size: 18px; margin: 0.4rem 0 0.15rem; }
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
    transition: transform 0.3s var(--ease), box-shadow 0.3s var(--ease);
  }
  .ct8-bento-tile:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }

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

  .ct8-bento-tile--dark {
    background: var(--ink); border-color: var(--ink); color: var(--paper);
  }
  .ct8-bento-tile--dark .ct8-bento-label { color: rgba(251,250,247,0.55); }
  .ct8-bento-tile--dark .ct8-bento-title { color: var(--paper); }
  .ct8-bento-tile--dark .ct8-bento-sub   { color: rgba(251,250,247,0.65); }
  .ct8-bento-tile--dark .ct8-bento-desc  { color: rgba(251,250,247,0.72); }
  .ct8-bento-tile--dark .ct8-bento-meta  { color: rgba(251,250,247,0.65); border-top-color: rgba(251,250,247,0.18); }
  .ct8-bento-tile--dark .ct8-bento-quote-mark { color: rgba(251,250,247,0.25); }
  .ct8-bento-tile--dark .ct8-chip { border-color: rgba(251,250,247,0.25); color: rgba(251,250,247,0.85); background: rgba(251,250,247,0.08); }
  .ct8-bento-tile--dark .ct8-bento-link { color: var(--paper); }

  .ct8-bento-label {
    font-family: 'Manrope', sans-serif; font-size: 10.5px; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-soft);
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

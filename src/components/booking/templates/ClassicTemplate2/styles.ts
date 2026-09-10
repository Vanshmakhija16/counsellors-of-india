// ClassicTemplate2 — "Rosewater Quiet" (light-mode evolution of the
// original Editorial Dark Mode). Same structure/tokens, values flipped to
// a pale blush-grey page, warm charcoal ink, and a dusty-rose accent that
// grows out of the dark version's existing --rose secondary tone.
// PALETTE
// --ink-0   #F9F4F1  page bg (pale blush-grey)
// --ink-1   #FFFFFF  surface (cards)
// --ink-2   #F3E7E2  raised surface
// --ink-3   #E8D9D2  border / divider
// --bone    #2A2420  primary text (warm charcoal ink)
// --mute    #8A756C  secondary text
// --gold    #B98079  accent (CTAs, highlights) — dusty rose
// --rose    #A66B5C  secondary accent (hover/active states, rare variety)

export const ct2Styles = `
  @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300..700;1,6..72,300..700&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Libre+Caslon+Text:ital,wght@0,400;0,700;1,400&display=swap');

  .ct2-root {
    --ink-0: #F9F4F1;
    --ink-1: #FFFFFF;
    --ink-2: #F3E7E2;
    --ink-3: #E8D9D2;
    --bone:  #2A2420;
    --mute:  #8A756C;
    --gold:  #B98079;
    --rose:  #A66B5C;
    background: var(--ink-0);
    color: var(--bone);
    font-family: 'Geist', 'Inter', system-ui, sans-serif;
    font-feature-settings: 'ss01', 'cv11';
    min-height: 100vh;
    overflow-x: hidden;

  }
  .ct2-serif {
    font-family: 'Fraunces', 'Playfair Display', Georgia, serif;
    font-weight: 400;
    font-optical-sizing: auto;
    font-variation-settings: 'SOFT' 50, 'WONK' 0;
    letter-spacing: -0.02em;
  }
  .ct2-serif-soft {
    font-family: 'Fraunces', 'Playfair Display', Georgia, serif;
    font-weight: 300;
    font-style: italic;
    font-variation-settings: 'SOFT' 100, 'WONK' 1;
    letter-spacing: -0.015em;
  }
  /* Hero tagline — Libre Caslon Text: classic, timeless old-style serif
     (restrained, print/editorial feel, no flourish) — confident and
     established-practice in tone rather than decorative or script-like. */
  .ct2-tagline-font {
    font-family: 'Libre Caslon Text', 'Fraunces', Georgia, serif;
    font-style: normal;
    font-weight: 700;
    letter-spacing: -0.005em;
  }
  .ct2-nav-font {
    font-family: 'Newsreader', 'Fraunces', Georgia, serif;
    font-optical-sizing: auto;
  }
  .ct2-mono {
    font-family: 'Geist Mono', 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
    font-feature-settings: 'ss03', 'zero';
  }

  .ct2-eyebrow {
    font-size: 11px;
    letter-spacing: 0.32em;
    text-transform: uppercase;
    color: var(--gold);
    font-weight: 500;
  }

  .ct2-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--ink-3) 20%, var(--ink-3) 80%, transparent);
  }

  .ct2-btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 14px 26px;
    background: var(--gold);
    color: #FFF9F6;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    border-radius: 100px;
    transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
    cursor: pointer;
    border:none;
  }
  .ct2-btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 12px 28px -10px rgba(185, 128, 121, 0.45);
    background: var(--rose);
  }

  .ct2-btn-ghost {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 14px 26px;
    background: transparent;
    color: var(--bone);
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    border: 1px solid var(--ink-3);
    border-radius: 102px;
    transition: border-color 0.2s ease, color 0.2s ease;
    cursor: pointer;
    margin-top:20px;
  }
  .ct2-btn-ghost:hover {
    border-color: var(--gold);
    color: var(--gold);
  }

  .ct2-hero-cta {
    display: inline-flex;
    align-items: center;
    padding: 17px 30px;
    background: var(--bone);
    color: var(--ink-1);
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    border-radius: 100px;
    border: none;
    cursor: pointer;
    box-shadow: 0 12px 28px -10px rgba(185, 128, 121, 0.55);
    transition: background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
  }
  .ct2-hero-cta:hover {
    background: var(--gold);
    transform: translateY(-1px);
    box-shadow: 0 14px 32px -10px rgba(185, 128, 121, 0.6);
  }

  .ct2-card {
    background: var(--ink-1);
    border: 1px solid var(--ink-3);
    border-radius: 4px;
    transition: border-color 0.25s ease, transform 0.25s ease;
  }
  .ct2-card:hover {
    border-color: rgba(185, 128, 121, 0.45);
  }

  /* ── Services — premium pricing-style cards ──
     Real card surfaces (not the old hairline-grid split), each with a
     price/duration footer + its own "Book" CTA. Subtle warm glow in the
     corner on hover, plus a slow lift, so the section reads as considered
     rather than a plain list of text blocks. */
  .ct2-service-card {
    position: relative;
    background: var(--ink-1);
    border: 1px solid var(--ink-3);
    border-radius: 14px;
    padding: clamp(34px, 3.6vw, 48px);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: border-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
  }
  .ct2-service-card:hover {
    border-color: rgba(185, 128, 121, 0.45);
    transform: translateY(-4px);
    box-shadow: 0 20px 44px -22px rgba(42, 36, 32, 0.28);
  }

  .ct2-service-code { font-size: 11px; color: var(--gold); letter-spacing: 0.18em; }
  .ct2-service-kind { font-size: 10px; color: var(--mute); letter-spacing: 0.16em; }

  .ct2-service-title {
    font-size: clamp(26px, 2.6vw, 34px);
    line-height: 1.18;
    color: #8C5C52;
    margin-bottom: 14px;
  }
  .ct2-service-desc {
    color: #6B5C55;
    font-size: 16.5px;
    line-height: 1.72;
    max-width: 46ch;
    text-align: justify;
    text-justify: inter-word;
  }

  .ct2-service-tag {
    padding: 5px 12px;
    border: 1px solid var(--ink-3);
    border-radius: 100px;
    color: var(--mute);
    font-size: 11px;
    letter-spacing: 0.03em;
  }

  .ct2-service-footer {
    margin-top: auto;
    padding-top: 22px;
    border-top: 1px solid var(--ink-3);
  }
  .ct2-service-price { font-size: 26px; color: var(--bone); line-height: 1; }
  .ct2-service-contact { font-size: 10.5px; letter-spacing: 0.1em; color: var(--mute); }
  .ct2-service-duration {
    margin-top: 6px;
    font-size: 10.5px;
    letter-spacing: 0.08em;
    color: var(--mute);
  }
  .ct2-service-cta {
    flex-shrink: 0;
    padding: 11px 20px;
    border-radius: 100px;
    border: 1px solid var(--ink-3);
    background: transparent;
    color: var(--bone);
    font-size: 12.5px;
    font-weight: 600;
    letter-spacing: 0.03em;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .ct2-service-cta:hover {
    background: var(--gold);
    border-color: var(--gold);
    color: #FFF9F6;
  }

  /* ── Insights — premium article cards (own bordered surface each,
     instead of the old hairline-grid split), with a soft lift + glow
     on hover so they read as considered editorial pieces. ── */
  .ct2-insight-card {
    position: relative;
    background: var(--ink-1);
    border: 1px solid var(--ink-3);
    border-radius: 14px;
    box-shadow: 0 1px 2px rgba(42, 36, 32, 0.04);
    transition: border-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
  }
  .ct2-insight-card:hover {
    border-color: rgba(185, 128, 121, 0.45);
    transform: translateY(-4px);
    box-shadow: 0 20px 44px -22px rgba(42, 36, 32, 0.28);
  }

  /* ── Insights v2 — editorial index list (a magazine table-of-contents,
     not cards): each entry is a hairline row, the number/category sits in
     a fixed left column, the title grows large and shifts to gold on
     hover, the whole row nudges right so it reads as an inviting link
     rather than a static block. ── */
  .ct2-insight-list { border-top: 1px solid var(--ink-3); }
  .ct2-insight-row {
    display: grid;
    grid-template-columns: 84px 1fr auto;
    align-items: start;
    gap: clamp(18px, 3vw, 40px);
    padding: clamp(26px, 3.4vw, 40px) clamp(6px, 1.4vw, 18px);
    border-bottom: 1px solid var(--ink-3);
    cursor: pointer;
    transition: transform 0.35s cubic-bezier(.16,.84,.3,1), padding-left 0.35s cubic-bezier(.16,.84,.3,1);
  }
  .ct2-insight-row:hover { transform: translateX(6px); }
  .ct2-insight-index {
    font-family: 'Fraunces', 'Playfair Display', Georgia, serif;
    font-weight: 400;
    font-size: clamp(28px, 3vw, 36px);
    color: var(--ink-3);
    line-height: 1;
    transition: color 0.3s ease;
  }
  .ct2-insight-row:hover .ct2-insight-index { color: var(--gold); }
  .ct2-insight-category {
    display: block;
    margin-top: 8px;
    font-family: 'Geist Mono', 'JetBrains Mono', ui-monospace, monospace;
    font-size: 9.5px;
    letter-spacing: 0.14em;
    color: var(--mute);
  }
  .ct2-insight-title {
    font-size: clamp(22px, 2.6vw, 32px);
    line-height: 1.2;
    color: var(--bone);
    transition: color 0.3s ease;
  }
  .ct2-insight-row:hover .ct2-insight-title { color: var(--gold); }
  .ct2-insight-excerpt {
    margin-top: 10px;
    color: var(--mute);
    font-size: 14px;
    line-height: 1.7;
    max-width: 56ch;
  }
  .ct2-insight-meta {
    display: flex;
    align-items: center;
    gap: 14px;
    justify-self: end;
    white-space: nowrap;
    padding-top: 6px;
  }
  .ct2-insight-meta-text {
    font-family: 'Geist Mono', 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10px;
    letter-spacing: 0.1em;
    color: var(--mute);
  }
  .ct2-insight-arrow {
    width: 34px; height: 34px; border-radius: 50%;
    border: 1px solid var(--ink-3);
    display: grid; place-items: center; flex-shrink: 0;
    color: var(--bone);
    transition: all 0.3s cubic-bezier(.16,.84,.3,1);
  }
  .ct2-insight-row:hover .ct2-insight-arrow {
    background: var(--gold); border-color: var(--gold); color: #FFF9F6;
    transform: rotate(45deg);
  }
  @media (max-width: 640px) {
    .ct2-insight-row { grid-template-columns: 48px 1fr; }
    .ct2-insight-meta { display: none; }
  }

  /* ── Insights v3 — one large featured card (first item) above a grid of
     smaller cards for the rest, mirroring the Services section's premium
     card treatment but with a bigger "lead story" moment up top. ── */
  .ct2-insight-featured {
    position: relative;
    background: var(--ink-1);
    border: 1px solid var(--ink-3);
    border-radius: 18px;
    padding: clamp(32px, 4vw, 56px);
    display: flex;
    flex-direction: column;
    cursor: pointer;
    overflow: hidden;
    transition: border-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
  }
  .ct2-insight-featured:hover {
    border-color: rgba(185, 128, 121, 0.45);
    transform: translateY(-4px);
    box-shadow: 0 26px 56px -24px rgba(42, 36, 32, 0.30);
  }
  .ct2-insight-featured-tag {
    display: inline-flex;
    align-self: flex-start;
    padding: 6px 14px;
    border-radius: 100px;
    background: rgba(185,128,121,0.10);
    border: 1px solid rgba(185,128,121,0.3);
    font-family: 'Geist Mono', 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10px;
    letter-spacing: 0.14em;
    color: var(--gold);
    margin-bottom: 22px;
  }
  .ct2-insight-featured-title {
    font-size: clamp(28px, 3.6vw, 44px);
    line-height: 1.15;
    color: var(--bone);
    max-width: 26ch;
  }
  .ct2-insight-featured-excerpt {
    margin-top: 16px;
    color: var(--mute);
    font-size: 15.5px;
    line-height: 1.75;
    max-width: 60ch;
  }
  .ct2-insight-featured-footer {
    margin-top: 28px;
    padding-top: 22px;
    border-top: 1px solid var(--ink-3);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .ct2-insight-featured-meta {
    font-family: 'Geist Mono', 'JetBrains Mono', ui-monospace, monospace;
    font-size: 11px;
    letter-spacing: 0.1em;
    color: var(--mute);
  }

  .ct2-insight-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: clamp(18px, 2.4vw, 26px); }
  @media (max-width: 640px) { .ct2-insight-grid { grid-template-columns: 1fr; } }

  /* Animated grain overlay for the hero -- multiply (not overlay) so the
     texture gently darkens the light background instead of blowing out
     highlights, which is what 'overlay' did on the old black bg. */
  .ct2-grain {
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0.045;
    mix-blend-mode: multiply;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' seed='5'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
  }

  /* Marquee specialties strip */
  @keyframes ct2-marquee {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }
  .ct2-marquee-track {
    display: inline-flex;
    gap: 56px;
    animation: ct2-marquee 32s linear infinite;
    white-space: nowrap;
  }

  /* Section reveal */
  @keyframes ct2-rise {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .ct2-rise {
    animation: ct2-rise 0.7s cubic-bezier(.16,.84,.3,1) both;
  }

  /* Hero word reveal — staggered */
  @keyframes ct2-word {
    from { opacity: 0; transform: translateY(38px); filter: blur(8px); }
    to   { opacity: 1; transform: translateY(0); filter: blur(0); }
  }
  .ct2-word {
    display: inline-block;
    opacity: 0;
    animation: ct2-word 0.9s cubic-bezier(.16,.84,.3,1) forwards;
  }

  /* Slow pulse — for status dot */
  @keyframes ct2-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%      { opacity: 0.35; transform: scale(0.9); }
  }
  .ct2-pulse {
    animation: ct2-pulse 2.4s ease-in-out infinite;
  }

  /* Soft float — for orbital card */
  @keyframes ct2-float {
    0%, 100% { transform: translateY(0); }
    50%      { transform: translateY(-8px); }
  }
  .ct2-float {
    animation: ct2-float 6s ease-in-out infinite;
  }

  /* Scroll cue */
  @keyframes ct2-scroll {
    0%   { transform: translateY(0); opacity: 0; }
    30%  { opacity: 1; }
    100% { transform: translateY(24px); opacity: 0; }
  }
  .ct2-scroll-dot {
    animation: ct2-scroll 2s ease-in-out infinite;
  }

  /* FAQ chevron rotate */
  .ct2-chevron {
    transition: transform 0.25s ease;
  }
  .ct2-chevron.open {
    transform: rotate(180deg);
  }

  /* Inputs */
  .ct2-input {
    width: 100%;
    background: transparent;
    border: none;
    border-radius: 4px;
    border-bottom: 1px solid var(--ink-3);
    color: var(--bone);
    padding: 12px 10px;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s ease;
  }
  .ct2-input::placeholder {
    color: var(--mute);
    
  }
  .ct2-input:focus {
    border-bottom-color: var(--gold);
  }

  /* Day / slot chips */
  .ct2-chip {
    padding: 10px 14px;
    border: 1px solid var(--ink-3);
    background: var(--ink-1);
    color: var(--bone);
    border-radius: 2px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    letter-spacing: 0.04em;
  }
  .ct2-chip:hover:not(:disabled) {
    border-color: var(--gold);
  }
  .ct2-chip.selected {
    background: var(--gold);
    color: #FFF9F6;
    border-color: var(--gold);
  }
  .ct2-chip:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    text-decoration: line-through;
  }

  /* ── Month-grid calendar (same interaction model as ClassicTemplate7's
     MonthCalendar, restyled to CT2's Rosewater Quiet palette) ── */
  .ct2-cal { padding: 6px 3px; }
  .ct2-cal-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
  .ct2-cal-month { font-size: 20px; font-weight: 400; color: var(--bone); letter-spacing: -0.01em; }
  .ct2-cal-nav {
    width: 36px; height: 36px; border-radius: 50%;
    border: 1px solid var(--ink-3); background: transparent;
    color: var(--bone); display: grid; place-items: center;
    cursor: pointer; transition: all 0.2s ease;
  }
  .ct2-cal-nav:hover:not(:disabled) { border-color: var(--gold); color: var(--gold); background: rgba(185,128,121,0.08); }
  .ct2-cal-nav:disabled { opacity: 0.25; cursor: default; }
  .ct2-cal-weekdays {
    display: grid; grid-template-columns: repeat(7,1fr); gap: 1px;
    padding-bottom: 10px; margin-bottom: 8px; border-bottom: 1px solid var(--ink-3);
  }
  .ct2-cal-weekdays span {
    text-align: center; font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 11.5px; font-weight: 600; letter-spacing: 0.08em; color: var(--mute);
    text-transform: uppercase; padding: 2px 0;
  }
  .ct2-cal-grid { display: grid; grid-template-columns: repeat(7,1fr); gap: 5px; }
  .ct2-cal-cell {
    position: relative; aspect-ratio: 1; display: grid; place-items: center; border-radius: 50%;
    font-size: 15px; font-weight: 500; font-family: 'Geist', 'Inter', system-ui, sans-serif;
    background: transparent; border: 1px solid transparent;
    color: var(--mute); cursor: default; opacity: 0.5;
    transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
  }
  .ct2-cal-cell--blank { visibility: hidden; }
  .ct2-cal-cell--muted { color: var(--mute); opacity: 0.45; }
  .ct2-cal-cell--open {
    color: var(--bone); cursor: pointer; font-weight: 600; opacity: 1;
    background: rgba(185,128,121,0.10); border-color: rgba(185,128,121,0.35);
  }
  .ct2-cal-cell--open:hover {
    background: var(--gold); border-color: var(--gold); color: #FFF9F6;
    transform: scale(1.08);
  }
  .ct2-cal-cell--selected {
    background: var(--rose) !important; border-color: var(--rose) !important; color: #FFF9F6 !important;
    font-weight: 700; opacity: 1;
  }
  .ct2-cal-cell-dot {
    position: absolute; bottom: 4px; left: 50%; transform: translateX(-50%);
    width: 3.5px; height: 3.5px; border-radius: 50%; background: var(--mute);
  }
  .ct2-cal-cell-dot--open { background: var(--gold); }
  .ct2-cal-msg {
    margin-top: 14px; padding: 9px 11px; border-radius: 6px; background: var(--ink-2);
    font-size: 11.5px; line-height: 1.5; color: var(--mute); text-align: center;
  }
  .ct2-cal-msg:empty { display: none; }
`

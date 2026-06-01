// ClassicTemplate2 — Editorial Dark Mode
// PALETTE
// --ink-0   #0b0d0e  page bg
// --ink-1   #131618  surface
// --ink-2   #1c2023  raised surface
// --ink-3   #2a2f33  border / divider
// --bone    #ece5d7  primary text
// --mute    #8b8478  secondary text
// --gold    #c9a35a  warm accent (CTAs, highlights)
// --rose    #c98a8a  soft secondary accent (rare, for variety)

export const ct2Styles = `
  .ct2-root {
    --ink-0: #0b0d0e;
    --ink-1: #131618;
    --ink-2: #1c2023;
    --ink-3: #2a2f33;
    --bone:  #ece5d7;
    --mute:  #8b8478;
    --gold:  #c9a35a;
    --rose:  #c98a8a;
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
    color: #1a1410;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    border-radius: 4px;
    transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
    cursor: pointer;
    border:none;
  }
  .ct2-btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 12px 28px -10px rgba(201, 163, 90, 0.55);
    background: #d4ad62;
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
    border-radius: 2px;
    transition: border-color 0.2s ease, color 0.2s ease;
    cursor: pointer;
  }
  .ct2-btn-ghost:hover {
    border-color: var(--gold);
    color: var(--gold);
  }

  .ct2-card {
    background: var(--ink-1);
    border: 1px solid var(--ink-3);
    border-radius: 4px;
    transition: border-color 0.25s ease, transform 0.25s ease;
  }
  .ct2-card:hover {
    border-color: rgba(201, 163, 90, 0.4);
  }

  /* Animated grain overlay for the hero */
  .ct2-grain {
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0.07;
    mix-blend-mode: overlay;
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
    color: #1a1410;
    border-color: var(--gold);
  }
  .ct2-chip:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    text-decoration: line-through;
  }
`

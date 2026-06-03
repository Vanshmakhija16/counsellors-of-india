export const globalStyles = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@300;400;500;600&display=swap');

/* ── BRAND COLOR TOKENS ──
   --brand is injected by the dashboard/preview wrapper.
   Every template uses these so color changes apply instantly. */
:root {
  --brand:          #b46b50;   /* overridden by parent style injection */
  --brand-light:    #f5efe7;
  --brand-dark:     #8c4e36;

  --sand:        #efe7d6;
  --sand-mid:    #e8dfc8;
  --sand-deep:   #b46b50;
  --bark:        #1a1a18;
  --bark-mid:    #6b6056;
  --bark-light:  #6b6056;

  /* Alias warm-accent → brand so ALL hardcoded refs update */
  --warm-accent: var(--brand);
  --teal:        var(--brand);
  --teal-mid:    var(--brand);

  --serif: 'Fraunces', 'Playfair Display', serif;
  --sans:  'DM Sans', sans-serif;
  --ease-out: cubic-bezier(0.22, 0.61, 0.36, 1);
}

* { box-sizing: border-box; }
body { margin: 0; font-family: var(--sans); background: var(--sand); }

/* Section borders */
#services, #expertise, .ct-svc, .ct-services, .ct-booking {
  border-top: 1px solid rgba(26,26,24,0.12);
  border-bottom: 1px solid rgba(26,26,24,0.12);
}
#about, #feedback, .ct-about, .sp-section {
  border-top: 1px solid rgba(236,231,223,0.10);
  border-bottom: 1px solid rgba(236,231,223,0.10);
}
.ct-carousel-section {
  border-top: 1.5px solid rgba(26,26,24,0.14);
  border-bottom: 1.5px solid rgba(26,26,24,0.14);
}
.ct-footer { border-top: 2px solid rgba(26,26,24,0.18); }

.ct-section-label::after {
  content: '';
  display: inline-block;
  width: 5px; height: 5px;
  border-radius: 50%;
  background: var(--warm-accent);
  margin-left: 10px;
  flex-shrink: 0;
  align-self: center;
}

.ct-section-label {
  display: flex;
  align-items: center;
  gap: 14px;
  font-family: var(--sans);
  font-size: 14px;
  letter-spacing: .38em;
  text-transform: uppercase;
  color: var(--bark-light);
  margin-bottom: 48px;
}
.ct-section-label__line {
  display: inline-block;
  width: 40px; height: 1.5px;
  background: var(--warm-accent);
  flex-shrink: 0;
}

.ct-fade { opacity: 0; transform: translateY(26px); transition: opacity .7s var(--ease-out), transform .7s var(--ease-out); }
.ct-fade--in { opacity: 1; transform: translateY(0); }

/* NAVBAR */
.ct-nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  height: 88px;
  display: grid; grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 0 calc((100% - 1180px) / 2);
  box-sizing: border-box;
  transition: background .4s, backdrop-filter .4s, box-shadow .4s;
}
@media (max-width: 1228px) { .ct-nav { padding: 0 24px; } }
.ct-nav--scrolled {
  background: rgba(245,239,232,0.85);
  backdrop-filter: blur(16px);
  box-shadow: 0 1px 0 rgba(181,156,132,.25);
}
.ct-nav__links { display: flex; align-items: center; gap: 36px; justify-self: start; }
.ct-nav__logo { font-family: var(--serif); font-size: 20px; color: var(--bark); letter-spacing: -.02em; justify-self: center; }
.ct-nav__right { display: flex; justify-content: flex-end; }
.ct-nav__link {
  font-family: var(--sans); font-size: 12px; letter-spacing: .18em; text-transform: uppercase;
  color: var(--bark-mid); background: none; border: none; cursor: pointer; padding: 4px 0; position: relative; transition: color .25s;
}
.ct-nav__link::after { content: ''; position: absolute; bottom: 0; left: 0; width: 0; height: 1px; background: var(--bark); transition: width .3s var(--ease-out); }
.ct-nav__link:hover { color: var(--bark); }
.ct-nav__link:hover::after { width: 100%; }
.ct-nav__cta {
  position: relative; overflow: hidden;
  font-family: var(--sans); font-size: 11px; letter-spacing: .22em; text-transform: uppercase;
  color: black; background: transparent; border: 1px solid black; border-radius: 100px; padding: 10px 22px;
  cursor: pointer; transition: color .35s ease, transform .2s ease; z-index: 1;
}
.ct-nav__cta::before { content: ""; position: absolute; left: 0; bottom: 0; width: 100%; height: 0%; background: black; transition: height .35s ease; z-index: -1; }
.ct-nav__cta:hover::before { height: 100%; }
.ct-nav__cta:hover { color: white; transform: translateY(-1px); }

/* HERO */
.ct-hero {
  --px: 0; --py: 0;
  position: relative; overflow: hidden;
  background: radial-gradient(120% 80% at 80% -10%, #ece1d2 0%, transparent 55%),
              radial-gradient(90% 60% at -10% 110%, #efe6d8 0%, transparent 60%),
              linear-gradient(180deg, #f7f1e7 0%, #f1e8da 60%, #ece1d0 100%);
  min-height: 100vh; color: var(--bark); isolation: isolate;
}
.ct-hero__noise {
  position: absolute; inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E");
  background-size: 220px; pointer-events: none; opacity: .7; mix-blend-mode: multiply; z-index: 1;
}
.ct-hero__glow { pointer-events: none; position: absolute; border-radius: 50%; filter: blur(2px); transition: transform .8s cubic-bezier(.2,.7,.2,1); will-change: transform; }
.ct-hero__glow--a { top: -160px; right: -160px; width: 720px; height: 720px; background: radial-gradient(circle, rgba(214,184,150,.55) 0%, rgba(214,184,150,0) 65%); transform: translate3d(calc(var(--px) * -22px), calc(var(--py) * -22px), 0); }
.ct-hero__glow--b { bottom: -220px; left: -180px; width: 640px; height: 640px; background: radial-gradient(circle, rgba(36,61,56,.18) 0%, rgba(36,61,56,0) 60%); transform: translate3d(calc(var(--px) * 18px), calc(var(--py) * 18px), 0); }
.ct-hero__grid-lines { position: absolute; inset: 120px 8% 120px 8%; display: grid; grid-template-columns: repeat(5, 1fr); pointer-events: none; z-index: 2; opacity: .35; }
.ct-hero__grid-lines span { border-left: 1px solid rgba(31,31,31,.06); }
.ct-hero__grid-lines span:last-child { border-right: 1px solid rgba(31,31,31,.06); }
.ct-hero__bracket { position: absolute; width: 56px; height: 56px; border: 1px solid rgba(31,31,31,.35); pointer-events: none; z-index: 4; opacity: 0; transition: opacity 1s ease .4s; }
.ct-hero--in .ct-hero__bracket { opacity: 1; }
.ct-hero__bracket--tl { top: 28px; left: 28px; border-right: 0; border-bottom: 0; }
.ct-hero__bracket--tr { top: 28px; right: 28px; border-left: 0; border-bottom: 0; }
.ct-hero__bracket--bl { bottom: 28px; left: 28px; border-right: 0; border-top: 0; }
.ct-hero__bracket--br { bottom: 28px; right: 28px; border-left: 0; border-top: 0; }
.ct-hero__strip { position: absolute; top: 92px; left: 0; right: 0; height: 38px; z-index: 5; overflow: hidden; border-top: 1px solid rgba(31,31,31,.08); border-bottom: 1px solid rgba(31,31,31,.08); background: rgba(255,253,248,.4); backdrop-filter: blur(6px); display: flex; align-items: center; }
.ct-hero__strip-track { display: flex; gap: 40px; animation: ct-strip-scroll 38s linear infinite; white-space: nowrap; }
.ct-hero__strip-group { display: flex; align-items: center; gap: 40px; padding-right: 40px; font-family: var(--sans); font-size: 10px; letter-spacing: .38em; text-transform: uppercase; color: #8a7a6d; }
.ct-hero__strip-dot { width: 4px; height: 4px; border-radius: 50%; background: #c2a992; display: inline-block; }
@keyframes ct-strip-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
.ct-hero__inner { position: relative; z-index: 10; max-width: 1450px; margin: 0 auto; display: flex; align-items: center; min-height: calc(100vh - 200px); padding: 24px 80px 120px; gap: 80px; }
.ct-hero__left { flex: 1; z-index: 20; position: relative; }
.ct-reveal { opacity: 0; transform: translateY(18px); filter: blur(6px); transition: opacity 1.1s cubic-bezier(.2,.7,.2,1) var(--d, 0s), transform 1.1s cubic-bezier(.2,.7,.2,1) var(--d, 0s), filter 1.1s ease var(--d, 0s); }
.ct-hero--in .ct-reveal { opacity: 1; transform: translateY(0); filter: blur(0); }
.ct-hero__eyebrow { display: flex; align-items: center; gap: 16px; font-family: var(--sans); font-size: 10px; letter-spacing: .42em; text-transform: uppercase; color: #9b8776; }
.ct-hero__eyebrow-line { display: inline-block; width: 0; height: 1px; background: #bda792; transition: width 1.2s cubic-bezier(.2,.7,.2,1) .15s; }
.ct-hero--in .ct-hero__eyebrow-line { width: 56px; }
.ct-hero__eyebrow-num { margin-left: auto; font-family: var(--serif); font-style: italic; font-size: 12px; letter-spacing: .1em; color: #b09a86; text-transform: none; }
.ct-hero__h1 { margin: 36px 0 0; font-family: var(--serif); font-size: clamp(3.8rem, 6.2vw, 7rem); line-height: .92; letter-spacing: -.045em; color: var(--bark); font-weight: 400; }
.ct-hero__h1-row { display: block; overflow: visible; position: relative; }
.ct-hero__h1-name { display: inline-block; }
.ct-hero__h1-surname { display: inline-block; color: #6d6055; font-style: italic; position: relative; }
.ct-hero__h1-underline { position: absolute; left: 4%; right: -2%; bottom: -.08em; width: 96%; height: .35em; color: var(--brand); stroke-dasharray: 600; stroke-dashoffset: 600; transition: stroke-dashoffset 1.6s cubic-bezier(.2,.7,.2,1) .9s; }
.ct-hero--in .ct-hero__h1-underline { stroke-dashoffset: 0; }
.ct-hero__meta { margin-top: 28px; display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.ct-hero__creds-badge { display: inline-block; font-family: var(--sans); font-size: 10.5px; letter-spacing: .26em; text-transform: uppercase; color: #8a7a6d; border: 1px solid #d9c9b8; border-radius: 100px; padding: 8px 18px; background: rgba(255,253,248,.5); }
.ct-hero__avail { display: inline-flex; align-items: center; gap: 10px; font-family: var(--sans); font-size: 10.5px; letter-spacing: .22em; text-transform: uppercase; color: #3a574f; padding: 8px 18px 8px 14px; border: 1px solid rgba(58,87,79,.25); border-radius: 100px; background: rgba(238,247,243,.5); }
.ct-hero__avail-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--brand); box-shadow: 0 0 0 0 rgba(74,138,120,.6); animation: ct-avail-pulse 2.2s ease-out infinite; }
@keyframes ct-avail-pulse { 0% { box-shadow: 0 0 0 0 rgba(74,138,120,.55); } 70% { box-shadow: 0 0 0 12px rgba(74,138,120,0); } 100% { box-shadow: 0 0 0 0 rgba(74,138,120,0); } }
.ct-hero__desc { margin-top: 28px; max-width: 540px; font-size: 16px; line-height: 1.9; color: #5e554d; }
.ct-hero__btns { margin-top: 44px; display: flex; align-items: center; gap: 28px; flex-wrap: wrap; }
.ct-hero__btn-primary { position: relative; overflow: hidden; display: inline-flex; align-items: center; gap: 16px; border-radius: 100px; border: 1px solid var(--bark); background: transparent; color: var(--bark); padding: 18px 34px; font-size: 10px; letter-spacing: .3em; text-transform: uppercase; cursor: pointer; z-index: 1; transition: color .4s ease, transform .35s ease, border-color .4s ease; }
.ct-hero__btn-primary::before { content: ''; position: absolute; inset: 0; background: var(--bark); transform: translateY(101%); transition: transform .55s cubic-bezier(.7,0,.2,1); z-index: -1; }
.ct-hero__btn-primary:hover { color: #f5efe8; transform: translateY(-2px); }
.ct-hero__btn-primary:hover::before { transform: translateY(0); }
.ct-hero__btn-primary svg { width: 22px; height: 11px; transition: transform .4s ease; }
.ct-hero__btn-primary:hover svg { transform: translateX(4px); }
.ct-hero__btn-ghost { display: flex; align-items: center; gap: 14px; font-size: 10px; letter-spacing: .3em; text-transform: uppercase; color: #75695f; background: none; border: none; cursor: pointer; transition: color .25s, gap .35s; }
.ct-hero__btn-ghost:hover { color: var(--bark); gap: 18px; }
.ct-hero__btn-ghost-line { display: inline-block; width: 28px; height: 1px; background: #75695f; transition: width .35s; }
.ct-hero__btn-ghost:hover .ct-hero__btn-ghost-line { width: 40px; }
.ct-hero__stats { margin-top: 56px; display: flex; gap: 0; padding-top: 36px; border-top: 1px solid #e2d5c8; max-width: 540px; }
.ct-hero__stat { flex: 1; padding: 0 28px; border-left: 1px solid rgba(194,169,146,.4); }
.ct-hero__stat:first-child { padding-left: 0; border-left: 0; }
.ct-hero__stat-val { font-family: var(--serif); font-size: 44px; line-height: 1; color: var(--bark); margin: 0; display: inline-flex; align-items: flex-start; }
.ct-hero__stat-val sup { font-size: 16px; font-style: italic; color: var(--brand); margin-left: 4px; margin-top: 6px; }
.ct-hero__stat-label { margin: 10px 0 0; font-size: 10px; letter-spacing: .26em; text-transform: uppercase; color: #9a8776; }
.ct-hero__right { display: none; position: relative; flex: 0 0 46%; height: calc(100vh - 240px); min-height: 600px; align-items: flex-end; justify-content: center; transform: translate3d(calc(var(--px) * -10px), calc(var(--py) * -10px), 0); transition: transform .8s cubic-bezier(.2,.7,.2,1); padding-left: 56px; }
@media(min-width:1024px){ .ct-hero__right { display: flex; } }
.ct-hero__rule { position: absolute; top: 60px; bottom: 60px; left: 8px; width: 32px; display: flex; flex-direction: column; align-items: center; gap: 14px; z-index: 25; }
.ct-hero__rule-tick { font-family: var(--sans); font-size: 9px; letter-spacing: .28em; color: #9a8776; writing-mode: vertical-rl; transform: rotate(180deg); }
.ct-hero__rule-tick--now { color: var(--bark); }
.ct-hero__rule-line { flex: 1; width: 1px; background: linear-gradient(180deg, transparent 0%, rgba(31,31,31,.25) 30%, rgba(31,31,31,.25) 70%, transparent 100%); }
.ct-hero__stage { position: relative; width: 100%; height: 100%; display: flex; align-items: flex-end; justify-content: center; }
.ct-hero__ring { position: absolute; bottom: 8%; left: 50%; width: 88%; max-width: 480px; aspect-ratio: 1/1; transform: translateX(-50%); border: 1px dashed rgba(194,169,146,.55); border-radius: 50%; animation: ct-ring-spin 60s linear infinite; pointer-events: none; z-index: 1; }
.ct-hero__ring::after { content: ''; position: absolute; inset: 24px; border: 1px solid rgba(194,169,146,.3); border-radius: 50%; animation: ct-ring-breathe 6s ease-in-out infinite; }
@keyframes ct-ring-spin { to { transform: translateX(-50%) rotate(360deg); } }
@keyframes ct-ring-breathe { 0%, 100% { transform: scale(1); opacity: .9; } 50% { transform: scale(1.04); opacity: .5; } }
.ct-hero__frame { position: relative; z-index: 2; width: 84%; max-width: 460px; height: 92%; border-radius: 240px 240px 6px 6px; border: 1px solid #d8c8b6; background: linear-gradient(180deg, #efe4d2 0%, #d9c6ad 100%); overflow: hidden; box-shadow: inset 0 0 0 1px rgba(255,255,255,.45), inset 0 -60px 80px -40px rgba(80,60,40,.18), 0 60px 80px -40px rgba(80,60,40,.25); }
.ct-hero__portrait { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center 18%; filter: saturate(.92) contrast(1.02); z-index: 1; transition: transform 6s cubic-bezier(.2,.7,.2,1); }
.ct-hero__stage:hover .ct-hero__portrait { transform: scale(1.03); }
.ct-hero__frame-grain { position: absolute; inset: 0; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)' opacity='0.5'/%3E%3C/svg%3E"); background-size: 240px; mix-blend-mode: overlay; opacity: .25; z-index: 2; pointer-events: none; }
.ct-hero__frame::after { content: ''; position: absolute; left: 0; right: 0; bottom: 0; height: 38%; background: linear-gradient(180deg, transparent 0%, rgba(31,27,22,.55) 100%); z-index: 3; pointer-events: none; }
.ct-hero__frame-caption { position: absolute; left: 0; right: 0; bottom: 22px; z-index: 4; display: flex; justify-content: center; gap: 10px; font-family: var(--sans); font-size: 9.5px; letter-spacing: .34em; text-transform: uppercase; color: rgba(245,239,232,.85); }
.ct-hero__frame-caption span:nth-child(2) { color: rgba(245,239,232,.5); }
.ct-hero__seal { position: absolute; top: 6%; right: 4%; width: 118px; height: 118px; z-index: 35; color: #f5efe8; pointer-events: none; }
.ct-hero__seal::before { content: ''; position: absolute; inset: -4px; background: rgba(31,27,22,.55); border-radius: 50%; backdrop-filter: blur(6px); }
.ct-hero__seal svg { position: relative; width: 100%; height: 100%; animation: ct-seal-spin 28s linear infinite; }
.ct-hero__seal-text { font-family: var(--sans); font-size: 8px; letter-spacing: .28em; fill: currentColor; text-transform: uppercase; }
.ct-hero__seal-mark text { fill: #f5efe8; }
.ct-hero__seal-mark circle { stroke: #f5efe8; }
@keyframes ct-seal-spin { to { transform: rotate(360deg); transform-origin: center; } }
.ct-hero__card { position: absolute; margin-top: 30px; left: 28px; bottom: 1%; z-index: 30; max-width: 240px; border-radius: 20px; border: 1px solid #e2d6ca; background: rgba(255,253,248,.92); padding: 22px 22px 20px; backdrop-filter: blur(14px); box-shadow: 0 30px 50px -20px rgba(80,60,40,.25); animation: ct-card-float 7s ease-in-out infinite; }
@keyframes ct-card-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
.ct-hero__card-quote { font-family: var(--serif); font-size: 40px; line-height: .6; color: var(--brand); display: block; }
.ct-hero__card-text { margin-top: 6px; font-family: var(--serif); font-size: 15px; font-style: italic; line-height: 1.5; color: #3a342e; }
.ct-hero__card-sign { margin: 14px 0 0; font-family: var(--sans); font-size: 9px; letter-spacing: .3em; text-transform: uppercase; color: #9a8776; }
.ct-hero__accolade { position: absolute; top: 36px; right: 12px; z-index: 36; padding: 14px 22px; background: var(--bark); color: #f5efe8; border-radius: 4px; box-shadow: 0 20px 40px -20px rgba(0,0,0,.4); animation: ct-card-float 8s ease-in-out -2s infinite; }
.ct-hero__accolade-eyebrow { display: block; font-family: var(--sans); font-size: 8.5px; letter-spacing: .32em; text-transform: uppercase; color: var(--brand); }
.ct-hero__accolade-id { display: block; margin-top: 6px; font-family: var(--serif); font-style: italic; font-size: 15px; letter-spacing: .04em; }
.ct-hero__geo { position: absolute; right: 4%; bottom: -28px; z-index: 20; display: flex; align-items: center; gap: 10px; font-family: var(--sans); font-size: 11px; letter-spacing: .12em; color: #75695f; }
.ct-hero__geo em { font-family: var(--serif); font-style: italic; color: var(--bark); letter-spacing: 0; margin: 0 2px; }
.ct-hero__geo svg { width: 14px; height: 14px; color: var(--brand); }
.ct-hero__img { position: relative; z-index: 20; height: 86%; width: auto; object-fit: contain; object-position: bottom; }
.ct-hero__press { position: relative; z-index: 10; max-width: 1450px; margin: 0 auto; padding: 0 80px 36px; display: flex; align-items: center; gap: 36px; }
.ct-hero__press-label { font-family: var(--sans); font-size: 10px; letter-spacing: .32em; text-transform: uppercase; color: #b09a86; white-space: nowrap; }
.ct-hero__press-row { display: flex; align-items: center; gap: 48px; flex-wrap: wrap; border-top: 1px solid rgba(31,31,31,.08); padding-top: 18px; flex: 1; }
.ct-hero__press-row span { font-family: var(--serif); font-style: italic; font-size: 17px; color: #8a7a6d; opacity: .55; transition: opacity .35s, color .35s; cursor: default; }
.ct-hero__press-row span:hover { opacity: 1; color: var(--bark); }
.ct-hero__scroll { position: absolute; bottom: 28px; left: 50%; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; gap: 10px; background: none; border: 0; cursor: pointer; z-index: 10; }
.ct-hero__scroll-label { font-family: var(--sans); font-size: 9px; letter-spacing: .42em; text-transform: uppercase; color: #9a8776; }
.ct-hero__scroll-line { position: relative; display: block; width: 1px; height: 56px; background: rgba(154,135,118,.3); overflow: hidden; }
.ct-hero__scroll-line span { position: absolute; top: -40%; left: 0; width: 100%; height: 40%; background: var(--bark); animation: ct-scroll-drop 2.4s cubic-bezier(.7,0,.3,1) infinite; }
@keyframes ct-scroll-drop { 0% { top: -40%; } 60% { top: 100%; } 100% { top: 100%; } }
@media (max-width: 1023px) { .ct-hero__inner { padding: 40px 28px 100px; min-height: auto; } .ct-hero__strip { top: 80px; } .ct-hero__bracket { width: 36px; height: 36px; } .ct-hero__press { padding: 0 28px 28px; flex-direction: column; align-items: flex-start; gap: 18px; } .ct-hero__press-row { width: 100%; gap: 24px; } .ct-hero__stats { gap: 0; flex-wrap: wrap; } }

/* ABOUT */
.ct-about { position: relative; overflow: hidden; background: var(--sand); padding: 100px 48px 120px; }
.ct-about__blob { position: absolute; border-radius: 50%; pointer-events: none; }
.ct-about__blob--tl { top: -80px; left: -80px; width: 360px; height: 360px; background: #ece2d7; filter: blur(80px); opacity: .7; }
.ct-about__blob--br { bottom: -60px; right: -60px; width: 280px; height: 280px; background: #e0d4c5; filter: blur(80px); opacity: .5; }
.ct-about__inner { position: relative; z-index: 10; max-width: 1200px; margin: 0 auto; }
.ct-about__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px 72px; align-items: start; }
@media(max-width:900px){ .ct-about__grid { grid-template-columns: 1fr; gap: 56px; } }
.ct-photo-wrap { position: relative; margin-bottom: 44px; }
.ct-photo-frame-border { position: absolute; inset: -14px -14px 14px 14px; border: 1.5px solid #c9b99f; border-radius: 3px; z-index: 0; pointer-events: none; }
.ct-photo-inner { position: relative; z-index: 1; width: 100%; aspect-ratio: 4/5; background: linear-gradient(160deg, #e4d8ca 0%, #cfc0ac 100%); border-radius: 3px; display: flex; align-items: flex-end; overflow: hidden; }
.ct-photo-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center top; z-index: 0; display: block; }
.ct-photo-overlay { position: absolute; inset: 0; background: radial-gradient(circle at 30% 30%, rgba(255,255,255,.18) 0%, transparent 60%); z-index: 1; pointer-events: none; }
.ct-photo-nameplate { position: relative; z-index: 2; width: 100%; background: rgba(31,27,22,.72); backdrop-filter: blur(6px); padding: 20px 24px; }
.ct-photo-nameplate__name { font-family: var(--serif); font-size: 22px; color: var(--sand); margin: 0; font-style: italic; }
.ct-photo-nameplate__role { font-family: var(--sans); font-size: 12px; color: #c9b99f; margin: 4px 0 0; letter-spacing: .12em; text-transform: uppercase; }
.ct-cred-row { display: flex; align-items: baseline; gap: 10px; margin-bottom: 12px; }
.ct-cred-dot { display: inline-block; width: 4px; height: 4px; border-radius: 50%; background: var(--warm-accent); flex-shrink: 0; }
.ct-cred-text { font-size: 14px; color: #675f58; line-height: 1.6; margin: 0; }
.ct-about__big-quote { font-family: var(--serif); font-size: 120px; line-height: .6; color: #e8ddd1; display: block; margin-bottom: 10px; user-select: none; }
.ct-about__headline { font-family: var(--serif); font-size: clamp(2.2rem,3.4vw,3.8rem); line-height: 1.08; letter-spacing: -.02em; color: var(--bark); font-weight: 400; margin: 0 0 28px; }
.ct-about__body { font-size: 16px; line-height: 1.85; color: #675f58; margin: 0; }
.ct-about__blockquote { margin: 28px 0 48px; padding-left: 20px; border-left: 2px solid var(--brand); }
.ct-about__blockquote-text { font-family: var(--serif); font-size: 15px; line-height: 1.7; color: #8c7c6d; margin: 0; font-style: italic; }
.ct-about__blockquote-attr { font-size: 12px; color: #a8998b; margin-top: 10px; letter-spacing: .1em; text-transform: uppercase; }
.ct-pillars { display: grid; grid-template-columns: 1fr 1fr; gap: 28px 32px; }
.ct-pillar { border-top: 1px solid #d9cfc2; padding-top: 22px; transition: border-color .3s; }
.ct-pillar:hover { border-color: var(--warm-accent); }
.ct-pillar__num { font-size: 11px; letter-spacing: .2em; color: var(--warm-accent); text-transform: uppercase; margin: 0 0 8px; }
.ct-pillar__title { font-family: var(--serif); font-size: 18px; color: var(--bark); margin: 0 0 8px; font-weight: 500; }
.ct-pillar__desc { font-size: 14px; line-height: 1.7; color: #746b63; margin: 0; }
.ct-about__strip { margin-top: 72px; padding-top: 32px; border-top: 1px solid #d9cfc2; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; }
.ct-about__strip-text { font-size: 14px; color: #8c7c6d; margin: 0; }
.ct-about__strip-text strong { color: #675f58; }
.ct-about__strip-link { font-size: 13px; letter-spacing: .18em; text-transform: uppercase; color: var(--bark); background: none; border: none; border-bottom: 1px solid var(--bark); padding-bottom: 2px; cursor: pointer; transition: color .2s, border-color .2s; }
.ct-about__strip-link:hover { color: var(--brand); border-color: var(--brand); }

/* SERVICES */
.ct-svc { position: relative; overflow: hidden; background: #f7f1e7; padding: 140px 80px 160px; isolation: isolate; }
.ct-svc__bg { position: absolute; inset: 0; background: radial-gradient(80% 50% at 90% 0%, rgba(214,184,150,.25) 0%, transparent 60%), radial-gradient(70% 60% at 0% 100%, rgba(36,61,56,.08) 0%, transparent 60%); z-index: 0; pointer-events: none; }
.ct-svc__bg-line { position: absolute; left: 50%; top: 0; bottom: 0; width: 1px; background: linear-gradient(180deg, transparent 0%, rgba(31,31,31,.06) 18%, rgba(31,31,31,.06) 82%, transparent 100%); z-index: 0; }
.ct-svc__inner { position: relative; z-index: 2; max-width: 1280px; margin: 0 auto; }
.ct-svc__head { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; padding-bottom: 80px; border-bottom: 1px solid rgba(31,31,31,.1); margin-bottom: 24px; }
.ct-svc__head-left { align-self: end; }
.ct-svc__h2 { margin: 24px 0 0; font-family: var(--serif); font-size: clamp(2.4rem, 4vw, 4rem); line-height: 1; letter-spacing: -.035em; color: var(--bark); font-weight: 400; }
.ct-svc__h2 em { font-style: italic; color: #6d6055; }
.ct-svc__head-right { align-self: end; }
.ct-svc__sub { margin: 0; font-size: 16px; line-height: 1.85; color: #5e554d; max-width: 460px; }
.ct-svc__head-meta { margin-top: 24px; display: flex; align-items: center; gap: 14px; font-family: var(--sans); font-size: 10.5px; letter-spacing: .3em; text-transform: uppercase; color: #9a8776; }
.ct-svc__head-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--brand); }
.ct-svc__carousel { position: relative; margin-top: 16px; }
.ct-svc__carousel::before, .ct-svc__carousel::after { content: ''; position: absolute; top: 0; bottom: 28px; width: 80px; pointer-events: none; z-index: 3; transition: opacity .3s ease; }
.ct-svc__carousel::before { left: 0; background: linear-gradient(90deg, #f7f1e7 0%, rgba(247,241,231,0) 100%); }
.ct-svc__carousel::after { right: 0; background: linear-gradient(270deg, #f7f1e7 0%, rgba(247,241,231,0) 100%); }
.ct-svc__track { display: flex; gap: 28px; overflow-x: auto; overflow-y: hidden; scroll-snap-type: x mandatory; scroll-padding-left: 8px; padding: 12px 8px 28px; scrollbar-width: none; -webkit-overflow-scrolling: touch; outline: none; }
.ct-svc__track::-webkit-scrollbar { display: none; }
.ct-svc__track-end { flex: 0 0 8px; }
.ct-svc__arrow { position: absolute; top: 50%; transform: translateY(calc(-50% - 14px)); z-index: 4; width: 56px; height: 56px; border-radius: 999px; border: 1px solid rgba(31,31,31,.18); background: rgba(255,253,248,.92); color: var(--bark); cursor: pointer; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px); box-shadow: 0 18px 30px -16px rgba(80,60,40,.18); transition: background .3s ease, color .3s ease, transform .3s ease, opacity .3s ease, border-color .3s ease; }
.ct-svc__arrow--left { left: -28px; }
.ct-svc__arrow--right { right: -28px; }
.ct-svc__arrow:hover:not(.ct-svc__arrow--disabled) { background: var(--bark); color: #f5efe8; border-color: var(--bark); transform: translateY(calc(-50% - 14px)) scale(1.04); }
.ct-svc__arrow--disabled { opacity: .35; cursor: default; }
.ct-svc-card { position: relative; flex: 0 0 380px; scroll-snap-align: start; display: flex; flex-direction: column; border: 1px solid rgba(31,31,31,.14); border-radius: 28px; background: linear-gradient(180deg, rgba(255,253,248,.95) 0%, rgba(247,241,231,.85) 100%); padding: 32px 30px 28px; box-shadow: inset 0 0 0 1px rgba(255,255,255,.5), 0 30px 50px -30px rgba(80,60,40,.18); transition: transform .45s cubic-bezier(.2,.7,.2,1), box-shadow .45s ease, border-color .45s ease; overflow: hidden; isolation: isolate; }
.ct-svc-card::before { content: ''; position: absolute; inset: 6px; border: 1px dashed rgba(194,160,122,.35); border-radius: 22px; pointer-events: none; z-index: 0; }
.ct-svc-card::after { content: ''; position: absolute; inset: -1px; border-radius: 28px; background: radial-gradient(70% 50% at 50% 0%, rgba(194,160,122,.18) 0%, transparent 70%); opacity: 0; z-index: -1; transition: opacity .45s ease; }
.ct-svc-card:hover { transform: translateY(-6px); border-color: rgba(194,160,122,.55); box-shadow: inset 0 0 0 1px rgba(255,255,255,.6), 0 40px 60px -30px rgba(80,60,40,.28); }
.ct-svc-card:hover::after { opacity: 1; }
.ct-svc-card__corner { position: absolute; width: 14px; height: 14px; border: 1px solid var(--brand); z-index: 1; opacity: .8; transition: opacity .35s ease, transform .35s ease; }
.ct-svc-card__corner--tl { top: 14px; left: 14px; border-right: 0; border-bottom: 0; border-top-left-radius: 6px; }
.ct-svc-card__corner--tr { top: 14px; right: 14px; border-left: 0; border-bottom: 0; border-top-right-radius: 6px; }
.ct-svc-card__corner--bl { bottom: 14px; left: 14px; border-right: 0; border-top: 0; border-bottom-left-radius: 6px; }
.ct-svc-card__corner--br { bottom: 14px; right: 14px; border-left: 0; border-top: 0; border-bottom-right-radius: 6px; }
.ct-svc-card:hover .ct-svc-card__corner { opacity: 1; }
.ct-svc-card:hover .ct-svc-card__corner--tl { transform: translate(-2px,-2px); }
.ct-svc-card:hover .ct-svc-card__corner--tr { transform: translate(2px,-2px); }
.ct-svc-card:hover .ct-svc-card__corner--bl { transform: translate(-2px,2px); }
.ct-svc-card:hover .ct-svc-card__corner--br { transform: translate(2px,2px); }
.ct-svc-card__top { position: relative; z-index: 2; display: flex; align-items: center; justify-content: space-between; padding-bottom: 18px; border-bottom: 1px solid rgba(31,31,31,.08); }
.ct-svc-card__code { font-family: var(--sans); font-size: 10px; letter-spacing: .32em; text-transform: uppercase; color: #9a8776; padding: 6px 12px; border: 1px solid rgba(31,31,31,.15); border-radius: 100px; background: rgba(255,253,248,.6); }
.ct-svc-card__index { font-family: var(--serif); font-style: italic; font-size: 36px; line-height: 1; color: rgba(194,160,122,.5); }
.ct-svc-card__body { position: relative; z-index: 2; padding: 22px 0 16px; flex: 1; }
.ct-svc-card__kind { margin: 0; font-family: var(--sans); font-size: 10px; letter-spacing: .32em; text-transform: uppercase; color: #9a8776; }
.ct-svc-card__title { margin: 10px 0 0; font-family: var(--serif); font-size: 28px; line-height: 1.1; letter-spacing: -.02em; color: var(--bark); font-weight: 400; }
.ct-svc-card__desc { margin: 14px 0 0; font-size: 14.5px; line-height: 1.7; color: #5e554d; }
.ct-svc-card__tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 18px; }
.ct-svc-card__tag { display: inline-flex; align-items: center; font-family: var(--sans); font-size: 10px; letter-spacing: .12em; color: #5e554d; padding: 5px 11px; border: 1px solid rgba(31,31,31,.15); border-radius: 100px; background: rgba(255,253,248,.5); transition: background .25s, border-color .25s; }
.ct-svc-card:hover .ct-svc-card__tag { border-color: rgba(194,160,122,.5); background: rgba(255,253,248,.9); }
.ct-svc-card__foot { position: relative; z-index: 2; margin-top: auto; padding-top: 20px; border-top: 1px dashed rgba(31,31,31,.12); }
.ct-svc-card__meta { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 18px; margin-bottom: 20px; }
.ct-svc-card__meta-label { margin: 0 0 6px; font-family: var(--sans); font-size: 9px; letter-spacing: .3em; text-transform: uppercase; color: #b09a86; }
.ct-svc-card__meta-val { margin: 0; font-family: var(--serif); font-size: 14px; color: var(--bark); letter-spacing: 0; }
.ct-svc-card__meta-val--price { font-style: italic; color: #6d6055; }
.ct-svc-card__cta { display: inline-flex; align-items: center; gap: 12px; background: none; border: 1px solid var(--bark); color: var(--bark); padding: 12px 20px; border-radius: 100px; font-family: var(--sans); font-size: 10px; letter-spacing: .3em; text-transform: uppercase; cursor: pointer; position: relative; overflow: hidden; z-index: 1; width: 100%; justify-content: center; transition: color .4s ease, transform .35s ease; }
.ct-svc-card__cta::before { content: ''; position: absolute; inset: 0; background: var(--bark); transform: translateY(101%); transition: transform .5s cubic-bezier(.7,0,.2,1); z-index: -1; }
.ct-svc-card__cta:hover { color: #f5efe8; }
.ct-svc-card__cta:hover::before { transform: translateY(0); }
.ct-svc-card__cta svg { width: 22px; height: 11px; transition: transform .4s ease; }
.ct-svc-card__cta:hover svg { transform: translateX(4px); }

/* CAROUSEL */
.ct-carousel-section { background: var(--sand); padding: 80px 8px; }
.ct-carousel-section__inner { margin: 0 auto; }
.ct-carousel-section__label { margin-bottom: 32px; }
.ct-carousel-wrap { display: flex; align-items: center; gap: 16px; }
.ct-carousel-arrow { flex-shrink: 0; width: 48px; height: 48px; border-radius: 50%; border: 1.5px solid #c9b99f; background: white; color: var(--bark-mid); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background .25s, color .25s, border-color .25s, transform .2s; z-index: 10; }
.ct-carousel-arrow:hover { background: var(--brand); color: white; border-color: var(--brand); transform: scale(1.08); }
.ct-carousel-viewport { flex: 1; min-width: 0; overflow: hidden; border-radius: 24px; }
.ct-carousel-slide { min-height: 380px; border-radius: 20px; padding: 40px 48px; position: relative; overflow: hidden; transition: opacity .38s ease, transform .38s var(--ease-out); }
.ct-carousel-slide--idle { opacity: 1; transform: translateX(0); }
.ct-carousel-slide--left { opacity: 0; transform: translateX(-40px); }
.ct-carousel-slide--right { opacity: 0; transform: translateX(40px); }
.ct-slide-tag { display: inline-flex; align-items: center; font-family: var(--sans); font-size: 10px; letter-spacing: .3em; text-transform: uppercase; border: 1px solid; border-radius: 100px; padding: 5px 14px; margin-bottom: 36px; }
.ct-slide-ring { position: absolute; right: -80px; bottom: -80px; width: 280px; height: 280px; border-radius: 50%; border: 1.5px solid; pointer-events: none; }
.ct-slide-quote { max-width: 640px; }
.ct-slide-quote__mark { font-family: var(--serif); font-size: 100px; line-height: .7; display: block; margin-bottom: 4px; }
.ct-slide-quote__text { font-family: var(--serif); font-size: clamp(1.5rem,2.4vw,2.2rem); line-height: 1.35; margin: 0 0 28px; font-style: italic; font-weight: 400; }
.ct-slide-quote__attr { display: flex; flex-direction: column; gap: 4px; font-family: var(--sans); font-size: 14px; }
.ct-slide-quote__sub { color: rgba(240,235,228,.5); font-size: 12px; letter-spacing: .1em; }
.ct-slide-stats__headline { font-family: var(--serif); font-size: clamp(2rem,3vw,3rem); font-weight: 400; margin: 0 0 36px; }
.ct-slide-stats__grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; }
.ct-slide-stat-item { border-top: 1px solid; padding-top: 20px; }
.ct-slide-stat-item__val { display: block; font-family: var(--serif); font-size: 42px; line-height: 1; margin-bottom: 10px; }
.ct-slide-stat-item__label { font-size: 13px; color: rgba(240,235,228,.6); line-height: 1.5; }
.ct-slide-process__headline { font-family: var(--serif); font-size: clamp(2rem,3vw,3rem); font-weight: 400; margin: 0 0 32px; }
.ct-slide-process__steps { display: flex; flex-direction: column; gap: 22px; }
.ct-slide-process__step { display: flex; gap: 20px; align-items: flex-start; }
.ct-slide-process__num { font-family: var(--serif); font-size: 28px; line-height: 1; flex-shrink: 0; margin-top: 2px; }
.ct-slide-process__step-title { font-size: 16px; font-weight: 500; margin: 0 0 4px; }
.ct-slide-process__step-desc { font-size: 13px; color: rgba(240,235,228,.6); line-height: 1.6; margin: 0; }
.ct-slide-specialties__headline { font-family: var(--serif); font-size: clamp(2rem,3vw,3rem); font-weight: 400; margin: 0 0 32px; }
.ct-slide-specialties__tags { display: flex; flex-wrap: wrap; gap: 12px; }
.ct-slide-specialty-tag { font-family: var(--sans); font-size: 13px; border: 1px solid; border-radius: 100px; padding: 8px 20px; letter-spacing: .06em; transition: background .25s; }
.ct-slide-specialty-tag:hover { background: rgba(255,255,255,.08); }
.ct-slide-testimonial { max-width: 640px; }
.ct-slide-testimonial__icon { margin-bottom: 20px; opacity: .8; }
.ct-slide-testimonial__quote { font-family: var(--serif); font-size: clamp(1.3rem,2vw,1.8rem); font-style: italic; line-height: 1.6; margin: 0 0 28px; font-weight: 400; }
.ct-slide-testimonial__attr { display: flex; flex-direction: column; gap: 4px; }
.ct-slide-testimonial__name { font-size: 15px; font-weight: 500; }
.ct-slide-testimonial__role { font-size: 12px; color: rgba(240,235,228,.5); letter-spacing: .1em; }
.ct-carousel-dots { display: flex; justify-content: center; gap: 10px; margin-top: 24px; }
.ct-carousel-dot { width: 6px; height: 6px; border-radius: 50%; border: none; background: #c9b99f; cursor: pointer; transition: background .25s, transform .25s, width .25s; padding: 0; }
.ct-carousel-dot--active { background: var(--brand); width: 20px; border-radius: 100px; }

/* BOOKING */
.ct-booking { position: relative; overflow: hidden; background: var(--sand-mid); padding: 120px 48px; }
.ct-booking__blob { position: absolute; left: -120px; bottom: -140px; width: 320px; height: 320px; border-radius: 50%; background: rgba(221,208,193,.6); filter: blur(60px); pointer-events: none; }
.ct-booking__inner { position: relative; z-index: 10; max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: .9fr 1.1fr; gap: 80px; align-items: start; }
@media(max-width:900px){ .ct-booking__inner { grid-template-columns: 1fr; } }
.ct-booking__left-bar { width: 1px; height: 80px; background: var(--warm-accent); margin-bottom: 28px; }
.ct-booking__h2 { font-family: var(--serif); font-size: clamp(3rem,4vw,5rem); line-height: .95; letter-spacing: -.05em; color: var(--bark); margin: 16px 0 0; font-weight: 400; }
.ct-booking__sub { margin-top: 28px; max-width: 26rem; font-size: 16px; line-height: 2; color: #6d645c; }
.ct-booking__info-list { margin-top: 48px; display: flex; flex-direction: column; gap: 24px; }
.ct-booking__info-row { display: flex; align-items: center; gap: 18px; }
.ct-booking__info-icon { width: 48px; height: 48px; border-radius: 50%; border: 1px solid #d9cab8; background: rgba(255,255,255,.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.ct-booking__info-label { font-size: 15px; color: #5f5750; }
.ct-booking__fee-badge { margin-top: 44px; display: inline-flex; flex-direction: column; gap: 4px; border: 1px solid #c9b99f; border-radius: 20px; padding: 20px 28px; background: rgba(255,255,255,.4); backdrop-filter: blur(4px); }
.ct-booking__fee-label { font-size: 10px; letter-spacing: .28em; text-transform: uppercase; color: var(--bark-light); }
.ct-booking__fee-val { font-family: var(--serif); font-size: 36px; color: var(--bark); }
.ct-booking__fee-note { font-size: 12px; color: #8c7c6d; }
.ct-booking__divider { height: 1px; background: rgba(255,255,255,.4); margin-bottom: 40px; }
.ct-booking__step-label { font-size: 10px; letter-spacing: .3em; text-transform: uppercase; color: #86796c; margin-bottom: 18px; }
.ct-booking__dates { display: grid; grid-template-columns: repeat(5,1fr); gap: 10px; }
.ct-date-card { display: flex; flex-direction: column; align-items: center; gap: 4px; border-radius: 20px; border: 1px solid rgba(255,255,255,.5); background: rgba(255,255,255,.25); padding: 18px 8px; cursor: pointer; transition: background .3s, border-color .3s, transform .2s; }
.ct-date-card:hover { background: rgba(255,255,255,.45); transform: translateY(-2px); }
.ct-date-card--active { border-color: var(--brand); background: var(--brand); color: white; }
.ct-date-card__day { font-size: 9px; letter-spacing: .18em; text-transform: uppercase; }
.ct-date-card__num { font-family: var(--serif); font-size: 28px; line-height: 1; }
.ct-date-card__month { font-size: 9px; letter-spacing: .1em; text-transform: uppercase; color: inherit; opacity: .7; }
.ct-booking__slots { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; }
.ct-slot { border-radius: 100px; border: 1px solid rgba(255,255,255,.5); background: rgba(255,255,255,.25); padding: 14px; font-size: 12px; letter-spacing: .06em; color: #5f5750; cursor: pointer; transition: background .25s, border-color .25s, transform .2s; }
.ct-slot:hover { background: rgba(255,255,255,.45); transform: translateY(-1px); }
.ct-slot--active { border-color: var(--brand); background: var(--brand); color: white; }
.ct-booking__form { margin-top: 40px; }
.ct-booking__form-divider { height: 1px; background: rgba(255,255,255,.35); margin-bottom: 28px; }
.ct-booking__fields { display: flex; flex-direction: column; gap: 12px; }
.ct-field { height: 56px; width: 100%; border-radius: 100px; border: 1px solid rgba(255,255,255,.45); background: rgba(255,255,255,.22); padding: 0 24px; font-size: 15px; color: var(--bark); outline: none; backdrop-filter: blur(4px); transition: border-color .25s, background .25s; font-family: var(--sans); }
.ct-field::placeholder { color: #7f746b; }
.ct-field:focus { border-color: var(--brand); background: rgba(255,255,255,.35); }
.ct-booking__error { margin-top: 12px; font-size: 13px; color: #9c5f5f; }
.ct-booking__cta { margin-top: 32px; width: 100%; border-radius: 18px; border: none; padding: 20px; font-size: 12px; letter-spacing: .25em; text-transform: uppercase; cursor: pointer; transition: background .3s, transform .2s; font-family: var(--sans); display: flex; align-items: center; justify-content: center; }
.ct-booking__cta--active { background: var(--bark); color: white; }
.ct-booking__cta--active:hover { transform: translateY(-2px); background: var(--brand); }
.ct-booking__cta:not(.ct-booking__cta--active) { background: rgba(255,255,255,.25); color: #8c8177; cursor: default; }
.ct-spinner { display: inline-block; width: 18px; height: 18px; border: 2px solid rgba(255,255,255,.3); border-top-color: white; border-radius: 50%; animation: spin .7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* FOOTER */
.ct-footer { position: relative; overflow: hidden; background: var(--sand-deep); padding: 80px 48px 40px; }
.ct-footer__glow { position: absolute; right: -100px; top: -100px; width: 240px; height: 240px; border-radius: 50%; background: rgba(255,255,255,.2); filter: blur(60px); pointer-events: none; }
.ct-footer__inner { position: relative; z-index: 10; max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 60px; padding-bottom: 60px; border-bottom: 1px solid rgba(181,156,132,.35); }
@media(max-width:768px){ .ct-footer__inner { grid-template-columns: 1fr; gap: 40px; } }
.ct-footer__name { font-family: var(--serif); font-size: 44px; color: var(--bark); margin: 0 0 8px; }
.ct-footer__creds { font-size: 14px; color: #6f655c; margin: 0 0 10px; }
.ct-footer__tagline { font-size: 13px; color: var(--bark-light); font-style: italic; margin: 0; }
.ct-footer__nav-heading { font-size: 10px; letter-spacing: .3em; text-transform: uppercase; color: var(--bark-light); margin: 0 0 20px; }
.ct-footer__nav { display: flex; flex-direction: column; gap: 14px; }
.ct-footer__nav-link { font-size: 14px; color: #6f655c; background: none; border: none; cursor: pointer; text-align: left; padding: 0; transition: color .2s; }
.ct-footer__nav-link:hover { color: var(--bark); }
.ct-footer__contact { display: flex; flex-direction: column; gap: 14px; }
.ct-footer__contact-item { display: flex; align-items: center; gap: 10px; font-size: 13px; color: #6f655c; margin: 0; }
.ct-footer__bottom { position: relative; z-index: 10; max-width: 1200px; margin: 28px auto 0; display: flex; justify-content: space-between; font-size: 12px; color: #7c736b; flex-wrap: wrap; gap: 10px; }












`

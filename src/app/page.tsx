'use client'

import { useState, useEffect, useRef, useMemo, lazy, Suspense } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import FaqRevealEffect from "@/components/landing/FaqRevealEffect";
import FooterReveal from '@/components/landing/FooterReveal'
import { loadDemo, saveDemo, emptyDemo, type DemoProfile } from '@/lib/demoSession'

const headlines = [
  <>
    Build your own website <span className="text-[#ff9933]"> in minutes. </span> 
  </>,
  <>
    Grow your counselling <span className="text-[#ff9933]"> practice online.</span> 
  </>,
  <>
    Get clients & bookings<span className="text-[#ff9933]"> seamlessly.  </span> <span className="text-[#ff9933]"> </span>  
  </>,
];
/* ─────────────────────────────────────────────────────────────────
   COUNSELLORS OF INDIA  —  Premium homepage
   Selling points (in order of focus):
   1. Find a therapist (directory + rotating profiles)
   2. List your practice (5 templates, beautiful by default)
───────────────────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

:root{
  --bg:#FBFAF7;
  --bg2:#F4F1EA;
  --bg3:#ECE8DE;
  --paper:#ffffff;
  /* ── SECTION SURFACE SCALE ──────────────────────────────────────
     A deliberate 3-step warm-light scale so every section boundary is a
     clear, consistent tonal step (instead of 5 near-random off-whites).
     Sections alternate s1 / s2; the footer uses the dark anchor. */
  /* Warm saffron-tinted surface scale (near-white, brand undertone). Keeps
     text crisp while the page reads warm; saffron lives in the accents. */
  --surf-1:#FFFCF8;   /* warm white   — Hero, Templates, How-it-works, FAQ */
  --surf-2:#FDF5EC;   /* saffron cream— Therapists, Try Demo, Pricing      */
  --surf-dark:#14110C;/* warm anchor  — Footer only                        */
  /* Text colours tuned for clean contrast on the saffron-tint surfaces */
  --ink:#1F1A14;      /* warm near-black — headings/primary text  */
  --ink2:#46403A;     /* secondary text                          */
  --ink3:#7A7166;     /* muted text / captions                   */
  --ink4:#A89F94;     /* faint / hints                           */
  /* Saffron is the brand accent (replaces the old gold accent role) */
  --gold:#E07A12;     /* deep saffron — small accents / borders   */
  --gold2:#FF9933;    /* saffron     — primary accent             */
  --gold-bg:rgba(255,153,51,0.07);
  --gold-line:rgba(255,153,51,0.24);
  --border:rgba(31,26,20,0.09);
  --border2:rgba(31,26,20,0.05);
  /* ── ONE premium type system ──────────────────────────────────────
     Fraunces (high-contrast optical serif) for all display/headings,
     Inter for all body. Both are already loaded via next/font + @import,
     so there is no extra request and no font flash. */
  /* ── TYPE SYSTEM ──────────────────────────────────────────────────
     --display / --serif both map to Plus Jakarta Sans so existing
     var(--serif) heading call-sites pick up the new display font without
     editing every site. --sans = Inter for body. */
  --display:'Plus Jakarta Sans','Inter',system-ui,sans-serif;
  --serif:'Plus Jakarta Sans','Inter',system-ui,sans-serif;
  --sans:'Inter',system-ui,-apple-system,sans-serif;

  /* ── SPACING SCALE (strict 8-based rhythm) ────────────────────────
     Use these everywhere instead of ad-hoc rem values so the page has a
     consistent vertical rhythm. */
  --s-1:8px;  --s-2:16px; --s-3:24px; --s-4:32px;
  --s-5:48px; --s-6:64px; --s-7:96px; --s-8:128px; --s-9:160px;
  /* fluid section padding built on the scale (premium breathing room) */
  --section-y:clamp(var(--s-6), 11vw, var(--s-9));   /* 64 → 160 */
  --section-x:clamp(var(--s-3), 6vw, var(--s-7));    /* 24 → 96  */

  /* ── ELEVATION & RADIUS ───────────────────────────────────────────
     Soft, layered shadows + large radii (Linear/Stripe surface feel). */
  --r-sm:12px; --r-md:18px; --r-lg:24px; --r-xl:32px; --r-2xl:40px;
  --shadow-sm:0 1px 2px rgba(31,26,20,.04), 0 4px 12px -6px rgba(31,26,20,.08);
  --shadow-md:0 2px 4px rgba(31,26,20,.04), 0 12px 28px -12px rgba(31,26,20,.12);
  --shadow-lg:0 4px 8px rgba(31,26,20,.05), 0 28px 56px -20px rgba(31,26,20,.16);
  --shadow-ring:0 0 0 1px rgba(31,26,20,.06);

  --nav:68px;
  --max:1180px;
  --px:var(--section-x);
  --gap:clamp(5rem,10vh,9rem);
}



html{scroll-behavior:smooth}
body,.pg{font-family:var(--sans);background:var(--bg);color:var(--ink);-webkit-font-smoothing:antialiased;overflow-x:clip}

/* ─ NAV ─────────────────────────────────────────── */
/* ─ NAV ─────────────────────────────────────────── */
.nav{
  position:fixed;
  top:14px;left:50%;transform:translateX(-50%);
  width:calc(100% - 32px);max-width:1180px;
  height:68px;padding:0 10px 0 22px;
  display:flex;align-items:center;justify-content:space-between;gap:1rem;
  z-index:1000;
  border-radius:999px;
  background:rgba(15,15,14,.32);
  border:1px solid rgba(255,255,255,.1);
  backdrop-filter:blur(20px) saturate(150%);
  -webkit-backdrop-filter:blur(20px) saturate(150%);
  box-shadow:0 1px 0 rgba(255,255,255,.07) inset,0 16px 48px -10px rgba(0,0,0,.5);
  transition:background .4s ease,border-color .4s ease,box-shadow .4s ease;
}
.nav.scrolled{
  background:rgba(251,249,244,.32);
  border-color:rgba(31,28,24,.07);
  box-shadow:0 1px 0 rgba(255,255,255,.8) inset,0 14px 36px -10px rgba(63,90,74,.14);
}
.logo{
font-family: "Times New Roman", Times, serif;font-size:16px;font-weight:900;
  color:rgba(255,255,255,.95);text-decoration:none;letter-spacing:-.02em;
  display:flex;align-items:center;gap:10px;flex-shrink:0;
  transition:color .35s ease;
}
.nav.scrolled .logo{color:var(--ink)}
.logo-pip{
  width:8px;height:8px;border-radius:50%;
  background:var(--wn-saffron,#FF9933);flex-shrink:0;
  box-shadow:0 0 0 3px rgba(255,153,51,.2);
}
.logo-img{height:38px;width:auto;display:block;object-fit:contain;flex-shrink:0}
.nav-mid{
  display:flex;align-items:center;gap:28px;
  position:absolute;left:50%;transform:translateX(-50%);
}
@media(max-width:780px){.nav-mid{display:none}}
.nav-a{
  font-size:13.5px;font-weight:400;
  color:rgba(255,255,255,.62);
  text-decoration:none;background:none;border:none;cursor:pointer;
  transition:color .2s;letter-spacing:-.003em;
}
.nav.scrolled .nav-a{color:var(--ink3)}
.nav-a:hover{color:#fff}
.nav.scrolled .nav-a:hover{color:var(--ink)}
.nav-r{display:flex;align-items:center;gap:8px}
.btn{
  display:inline-flex;align-items:center;gap:6px;
  height:40px;padding:0 18px;border-radius:999px;
  font-family:var(--sans);font-size:13px;font-weight:500;
  text-decoration:none;border:1px solid transparent;cursor:pointer;
  transition:all .25s;letter-spacing:-.005em;line-height:1;
}
.btn-line{
  background:rgba(255,255,255,.1);
  color:rgba(255,255,255,.75);
  border-color:rgba(255,255,255,.18);
}
.btn-line:hover{background:rgba(255,255,255,.2);color:#fff;border-color:rgba(255,255,255,.35)}
.nav.scrolled .btn-line{
  background:transparent;color:var(--ink2);
  border-color:rgba(31,28,24,.12);
}
.nav.scrolled .btn-line:hover{background:rgba(31,28,24,.05);color:var(--ink);border-color:rgba(31,28,24,.22)}
.btn-dark{
  background:var(--wn-saffron,#FF9933);color:#fff;border-color:transparent;
  box-shadow:0 1px 0 rgba(255,255,255,.25) inset,0 8px 20px -6px rgba(255,153,51,.55);
}
.btn-dark:hover{background:var(--wn-saffron-deep,#E07A12);transform:translateY(-1px);box-shadow:0 10px 26px -6px rgba(255,153,51,.5)}
.btn-gold{background:var(--wn-saffron,#FF9933);color:#fff}
.btn-gold:hover{background:var(--wn-saffron-deep,#E07A12);transform:translateY(-1px);box-shadow:0 10px 26px -6px rgba(255,153,51,.45)}
.btn-line{background:transparent;color:var(--ink2);border:1px solid var(--border)}
.btn-line:hover{border-color:var(--ink);color:var(--ink);background:rgba(19,20,15,.03)}

/* ─ SHARED ───────────────────────────────────────── */
.wrap{max-width:var(--max);margin:0 auto;padding:0 var(--px)}
.section{padding:var(--gap) var(--px)}
.section-alt{background:var(--bg2)}
.section-dark{background:var(--ink);color:#fff}

.eyebrow{
  display:inline-flex;align-items:center;gap:9px;
  font-size:11px;font-weight:500;color:var(--gold);
  letter-spacing:.2em;text-transform:uppercase;margin-bottom:1.3rem;
}
.eyebrow::before{content:'';width:16px;height:1px;background:var(--gold)}
.eyebrow-light{color:var(--gold2)}
.eyebrow-light::before{background:var(--gold2)}

.h2{
  font-family:var(--serif);
  font-size:clamp(34px,4.2vw,56px);
  font-weight:400;line-height:1.04;letter-spacing:-.028em;
  color:var(--ink);
}
.h2 i{font-style:italic;color:var(--ink3)}
.h2-light{color:#fff}
.h2-light i{color:rgba(255,255,255,.45)}

.lead{
  font-size:15px;font-weight:300;line-height:1.78;
  color:var(--ink3);max-width:52ch;
  margin-top:1rem;
}

/* ═══════════════════════════════════════════════════════════════
   HERO — two-column editorial: copy + dual CTAs on left,
   layered product showcase (therapist + template) on right.
═══════════════════════════════════════════════════════════════ */
@keyframes fadeUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes pulseDot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.7)}}
@keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@keyframes popIn{0%{opacity:0;transform:translateY(14px) scale(.96)}100%{opacity:1;transform:translateY(0) scale(1)}}
@keyframes floatA{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-8px) rotate(0deg)}}
@keyframes floatB{0%,100%{transform:translateY(0) rotate(-4deg)}50%{transform:translateY(6px) rotate(-4deg)}}
@keyframes floatC{0%,100%{transform:translateY(0) rotate(3deg)}50%{transform:translateY(-5px) rotate(3deg)}}
@keyframes drift{0%,100%{transform:translate(0,0)}50%{transform:translate(8px,-6px)}}

.hero{
  position:relative;
  padding:calc(var(--nav) + 1rem) var(--px) 0;
  background:var(--bg);
  overflow:hidden;
}
.hero::before{
  content:'';position:absolute;inset:0;
  background:
    radial-gradient(ellipse 55% 45% at 78% 28%,rgba(184,134,44,.06) 0%,transparent 60%),
    radial-gradient(ellipse 50% 50% at 12% 70%,rgba(19,20,15,.025) 0%,transparent 60%);
  pointer-events:none;
}
/* Faint editorial grid lines */
.hero::after{
  content:'';position:absolute;inset:0;
  background-image:
    linear-gradient(90deg,var(--border2) 1px,transparent 1px);
  background-size:calc(100% / 6) 100%;
  background-position:0 0;
  opacity:.5;mask-image:linear-gradient(180deg,transparent,#000 30%,#000 70%,transparent);
  -webkit-mask-image:linear-gradient(180deg,transparent,#000 30%,#000 70%,transparent);
  pointer-events:none;
}

.hero-inner{
  position:relative;z-index:2;
  margin:0 auto;
  display:grid;grid-template-columns:1.05fr .95fr;
  // gap:clamp(2.5rem,5vw,5rem);
  align-items:center;
  min-height:calc(100svh - var(--nav) - 7rem);
}
@media(max-width:960px){
  .hero-inner{grid-template-columns:1fr;min-height:auto;gap:3rem}
  .hero-showcase{display:none}
}

/* ── LEFT COLUMN ───────────────────────────── */
.hero-left{display:flex;flex-direction:column}

.hero-stamp{
  display:inline-flex;align-items:center;gap:10px;
  padding:7px 16px;
  border-radius:100px;
  background:var(--paper);
  border:1px solid var(--gold-line);
  font-size:11px;font-weight:500;letter-spacing:.18em;text-transform:uppercase;
  color:var(--gold);
  box-shadow:0 2px 12px rgba(19,20,15,.04);
  // margin-bottom:none  ;
  width:fit-content;
  animation:fadeIn .8s ease .1s both;
}
.hero-stamp-dot{width:6px;height:6px;border-radius:50%;background:var(--gold);animation:pulseDot 2.4s ease-in-out infinite}

.hero-h{
  font-family:var(--serif);
  font-size:clamp(44px,5.4vw,82px);
  font-weight:400;line-height:.98;letter-spacing:-.038em;
  color:var(--ink);
  animation:fadeUp .9s cubic-bezier(.22,.87,.36,1) .15s both;
}
.hero-h i{font-style:italic;color:var(--ink3);position:relative;display:inline-block}
.hero-h i::after{
  content:'';position:absolute;left:4%;right:4%;bottom:.04em;height:3px;
  background:linear-gradient(90deg,transparent,var(--gold) 20%,var(--gold) 80%,transparent);
  opacity:.45;
}

.hero-sub{
  font-size:clamp(14.5px,1.2vw,16.5px);
  font-weight:300;line-height:1.7;
  color:var(--ink3);
  max-width:46ch;
  margin-top:1.6rem;
  animation:fadeUp .9s cubic-bezier(.22,.87,.36,1) .3s both;
}

/* Dual audience selector — visualises both selling points */
.hero-paths{
  display:grid;grid-template-columns:1fr 1fr;gap:14px;
  margin-top:2.2rem;
  animation:fadeUp .9s cubic-bezier(.22,.87,.36,1) .4s both;
}
@media(max-width:520px){.hero-paths{grid-template-columns:1fr}}
.hero-path{
  display:flex;flex-direction:column;gap:8px;
  padding:18px 20px;border-radius:12px;
  background:var(--paper);border:1px solid var(--border);
  text-decoration:none;color:inherit;cursor:pointer;
  transition:all .3s;position:relative;overflow:hidden;
}
.hero-path::before{
  content:'';position:absolute;top:0;left:0;right:0;height:2px;
  background:linear-gradient(90deg,transparent,var(--gold),transparent);
  opacity:0;transition:opacity .3s;
}
.hero-path:hover{border-color:var(--gold);transform:translateY(-3px);box-shadow:0 14px 32px rgba(19,20,15,.08)}
.hero-path:hover::before{opacity:1}
.hero-path-tag{
  font-size:10px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;
  color:var(--gold);display:flex;align-items:center;gap:6px;
}
.hero-path-tag::before{content:'';width:5px;height:5px;border-radius:50%;background:var(--gold)}
.hero-path-h{
  font-family:var(--serif);font-size:18px;color:var(--ink);
  letter-spacing:-.012em;line-height:1.2;
}
.hero-path-h i{font-style:italic;color:var(--ink3)}
.hero-path-d{font-size:12px;color:var(--ink3);line-height:1.5;font-weight:300}
.hero-path-arrow{
  position:absolute;top:18px;right:18px;
  font-size:14px;color:var(--ink4);
  transition:transform .3s,color .3s;
}
.hero-path:hover .hero-path-arrow{color:var(--gold);transform:translate(3px,-3px)}

/* Trust line under paths */
.hero-trust{
  display:flex;align-items:center;gap:14px;margin-top:1.8rem;
  animation:fadeIn 1s ease .6s both;
}
.hero-trust-avs{display:flex}
.hero-trust-av{
  width:28px;height:28px;border-radius:50%;
  border:2px solid var(--bg);
  display:flex;align-items:center;justify-content:center;
  font-family:var(--serif);font-style:italic;font-size:10px;color:var(--ink2);
  margin-right:-9px;flex-shrink:0;
  box-shadow:0 2px 6px rgba(19,20,15,.08);
}
.hero-trust-text{font-size:12px;color:var(--ink3);font-weight:300;margin-left:18px;line-height:1.5}
.hero-trust-text strong{color:var(--ink);font-weight:500}
.hero-trust-text b{color:var(--gold);font-weight:500;font-family:var(--serif);font-style:italic;font-size:13.5px}

/* ── RIGHT COLUMN — product showcase ── */
.hero-showcase{
  position:relative;
  height:520px;max-height:520px;
  animation:fadeIn 1s ease .35s both;
}
@media(max-width:1100px){.hero-showcase{height:480px;max-height:480px}}

/* Main therapist card — featured (largest, center) */
.hs-card{
  position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
  width:300px;
  background:var(--ink);
  border-radius:18px;
  overflow:hidden;
  box-shadow:0 30px 70px rgba(19,20,15,.32),0 10px 26px rgba(19,20,15,.16);
  animation:popIn .8s cubic-bezier(.22,.87,.36,1) .5s both;
  z-index:5;
}
.hs-card::before{
  content:'';position:absolute;top:0;left:0;right:0;height:2px;
  background:linear-gradient(90deg,transparent 10%,var(--gold) 40%,var(--gold) 60%,transparent 90%);
  z-index:2;
}
.hs-card-photo{
  height:158px;position:relative;overflow:hidden;
  background:linear-gradient(145deg,#2a2415,#1a1a14);
  display:flex;align-items:center;justify-content:center;
}
.hs-card-photo::before{
  content:'';position:absolute;inset:0;
  background:radial-gradient(circle at 70% 30%,rgba(184,134,44,.18),transparent 60%);
}
.hs-card-init{
  font-family:var(--serif);font-style:italic;font-size:84px;
  color:rgba(255,255,255,.08);line-height:1;position:relative;
}
.hs-card-live{
  position:absolute;top:14px;left:14px;
  display:inline-flex;align-items:center;gap:6px;
  background:rgba(0,0,0,.4);backdrop-filter:blur(10px);
  padding:5px 11px;border-radius:100px;
  border:1px solid rgba(255,255,255,.1);
}
.hs-card-live-dot{width:6px;height:6px;border-radius:50%;background:#4ade80;animation:pulseDot 2s infinite}
.hs-card-live-t{font-size:10px;color:rgba(255,255,255,.75);letter-spacing:.04em;font-weight:500}
.hs-card-body{padding:16px 18px 18px}
.hs-card-name{
  font-family:var(--serif);font-size:20px;color:#f0ebe2;
  line-height:1.1;letter-spacing:-.018em;margin-bottom:3px;
}
.hs-card-role{font-size:10.5px;color:rgba(255,255,255,.4);font-weight:300;margin-bottom:12px;letter-spacing:.01em}
.hs-card-tags{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:13px}
.hs-card-tag{
  font-size:9px;padding:3px 9px;border-radius:100px;
  background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);
  color:rgba(255,255,255,.55);letter-spacing:.03em;
}
.hs-card-rule{height:1px;background:rgba(255,255,255,.07);margin-bottom:12px}
.hs-card-foot{display:flex;align-items:center;justify-content:space-between}
.hs-card-fee{font-family:var(--serif);font-size:19px;font-style:italic;color:var(--gold2);line-height:1}
.hs-card-fee small{font-family:var(--sans);font-style:normal;font-size:9px;color:rgba(255,255,255,.35);display:block;margin-top:2px;letter-spacing:.04em;text-transform:uppercase}
.hs-card-btn{
  font-size:9.5px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;
  background:var(--gold);color:var(--ink);
  padding:8px 13px;border-radius:6px;
}

/* Floating mini cards — smaller than featured, sit behind */
.hs-mini{
  position:absolute;
  width:172px;background:var(--paper);
  border-radius:12px;overflow:hidden;
  border:1px solid var(--border);
  box-shadow:0 14px 36px rgba(19,20,15,.14),0 4px 10px rgba(19,20,15,.06);
  z-index:2;
}
.hs-mini-a{
  top:8%;left:-2%;
  transform:rotate(-4deg) scale(.94);
  animation:popIn .8s cubic-bezier(.22,.87,.36,1) .75s both,floatB 9s ease-in-out 2s infinite;
  filter:brightness(.98);
}
.hs-mini-b{
  bottom:6%;right:-3%;
  transform:rotate(3deg) scale(.92);
  animation:popIn .8s cubic-bezier(.22,.87,.36,1) .9s both,floatC 10s ease-in-out 2.4s infinite;
  filter:brightness(.96);
}
.hs-mini-photo{
  height:64px;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;
}
.hs-mini-photo::after{
  content:'';position:absolute;inset:0;
  background:radial-gradient(circle at 70% 30%,rgba(255,255,255,.06),transparent 60%);
}
.hs-mini-photo span{font-family:var(--serif);font-size:34px;font-style:italic;color:rgba(255,255,255,.14);position:relative;z-index:1}
.hs-mini-body{padding:10px 12px 12px}
.hs-mini-name{font-family:var(--serif);font-size:12.5px;color:var(--ink);line-height:1.2;letter-spacing:-.012em}
.hs-mini-role{font-size:9px;color:var(--ink4);font-weight:300;margin-top:2px;margin-bottom:8px}
.hs-mini-foot{display:flex;align-items:center;justify-content:space-between;border-top:1px solid var(--border2);padding-top:7px}
.hs-mini-fee{font-family:var(--serif);font-size:12px;font-style:italic;color:var(--gold)}
.hs-mini-btn{font-size:8px;font-weight:600;background:var(--ink);color:#fff;padding:4px 8px;border-radius:4px;letter-spacing:.06em;text-transform:uppercase}

/* Floating badges */
.hs-badge{
  position:absolute;z-index:6;
  background:var(--paper);border-radius:10px;
  box-shadow:0 10px 28px rgba(19,20,15,.14),0 2px 8px rgba(19,20,15,.06);
  padding:9px 13px;
  display:flex;align-items:center;gap:9px;
  border:1px solid var(--border2);
  max-width:200px;
}
.hs-badge-a{
  top:4%;right:2%;
  animation:popIn .7s cubic-bezier(.22,.87,.36,1) 1.1s both,floatA 8s ease-in-out 2.6s infinite;
}
.hs-badge-b{
  bottom:8%;left:4%;
  animation:popIn .7s cubic-bezier(.22,.87,.36,1) 1.25s both,drift 9s ease-in-out 2.8s infinite;
}
.hs-badge-icon{
  width:30px;height:30px;border-radius:7px;
  display:flex;align-items:center;justify-content:center;flex-shrink:0;
  font-size:13px;
}
.hs-badge-icon-g{background:var(--gold-bg);color:var(--gold);border:1px solid var(--gold-line)}
.hs-badge-icon-d{background:var(--ink);color:var(--gold2)}
.hs-badge-t{font-size:11.5px;font-weight:500;color:var(--ink);line-height:1.3;letter-spacing:-.008em}
.hs-badge-s{font-size:9.5px;color:var(--ink4);margin-top:1px;line-height:1.3}

/* Template peek — sits inside the showcase, mirrors the actual templates section */
.hs-tmpl{
  position:absolute;
  top:48%;right:-2%;
  width:142px;
  border-radius:10px;overflow:hidden;
  border:1px solid var(--border);
  background:var(--paper);
  box-shadow:0 14px 36px rgba(19,20,15,.16);
  z-index:3;
  animation:popIn .8s cubic-bezier(.22,.87,.36,1) 1s both;
  transform:rotate(5deg);
}
.hs-tmpl-thumb{
  width:100%;aspect-ratio:4/3;
  position:relative;overflow:hidden;
}
.hs-tmpl-thumb-inner{
  position:absolute;top:0;left:0;
  width:320px;height:240px;
  transform-origin:top left;
  pointer-events:none;
}
.hs-tmpl-foot{
  padding:7px 10px;display:flex;align-items:center;justify-content:space-between;
  border-top:1px solid var(--border2);
}
.hs-tmpl-foot-t{font-size:9.5px;font-weight:500;color:var(--ink);letter-spacing:-.005em}
.hs-tmpl-foot-n{font-family:var(--serif);font-size:9.5px;font-style:italic;color:var(--gold)}

/* Decorative gold thread */
.hs-thread{
  position:absolute;top:6%;bottom:6%;left:50%;width:1px;
  background:linear-gradient(180deg,transparent,var(--gold-line) 20%,var(--gold-line) 80%,transparent);
  z-index:1;opacity:.4;
}

/* Trust pillars row — sits below grid on the left side full-width */
.hero-pillars{
  margin-top:3rem;padding:1.8rem 0 2rem;
  border-top:1px solid var(--border);
  display:grid;grid-template-columns:repeat(4,1fr);gap:1.5rem;
  animation:fadeIn 1s ease .8s both;
  position:relative;z-index:2;
}
@media(max-width:760px){.hero-pillars{grid-template-columns:repeat(2,1fr);gap:1.4rem}}
.hero-pillar-n{
  font-family:var(--serif);font-size:clamp(26px,2.6vw,34px);
  font-weight:400;color:var(--ink);letter-spacing:-.025em;line-height:1;
}
.hero-pillar-n i{font-style:italic;color:var(--gold)}
.hero-pillar-l{
  font-size:11.5px;color:var(--ink3);font-weight:400;
  margin-top:7px;line-height:1.5;letter-spacing:.01em;
}

/* ═══════════════════════════════════════════════════════════════
   PROFILE STRIP — dedicated full section
═══════════════════════════════════════════════════════════════ */
.ps-section{
  padding:clamp(4rem,7vh,6rem) 0;
  background:linear-gradient(180deg,var(--bg) 0%,var(--bg2) 50%,var(--bg) 100%);
  border-top:1px solid var(--border);
  border-bottom:1px solid var(--border);
  position:relative;overflow:hidden;
}
.ps-section::before{
  content:'';position:absolute;inset:0;
  background:
    radial-gradient(ellipse 40% 60% at 20% 50%,rgba(184,134,44,.04),transparent 70%),
    radial-gradient(ellipse 40% 60% at 80% 50%,rgba(184,134,44,.04),transparent 70%);
  pointer-events:none;
}
.ps-head{
  text-align:center;max-width:680px;margin:0 auto;
  padding:0 var(--px);position:relative;z-index:2;
  margin-bottom:3rem;
}
.ps-eyebrow{
  display:inline-flex;align-items:center;gap:9px;
  font-size:11px;font-weight:500;color:var(--gold);
  letter-spacing:.2em;text-transform:uppercase;margin-bottom:1.2rem;
}
.ps-eyebrow::before,.ps-eyebrow::after{content:'';width:24px;height:1px;background:var(--gold);opacity:.5}
.ps-h{
  font-family:var(--serif);
  font-size:clamp(28px,3.4vw,44px);
  font-weight:400;line-height:1.08;letter-spacing:-.025em;
  color:var(--ink);
}
.ps-h i{font-style:italic;color:var(--ink3)}
.ps-sub{
  font-size:14.5px;font-weight:300;line-height:1.7;
  color:var(--ink3);margin-top:1rem;max-width:54ch;margin-left:auto;margin-right:auto;
}
.ps-marquee-wrap{position:relative;z-index:2}
.ps-foot{
  text-align:center;margin-top:2.6rem;padding:0 var(--px);
  position:relative;z-index:2;
  font-size:12px;color:var(--ink4);letter-spacing:.04em;
}
.ps-foot strong{
  color:var(--gold);font-weight:500;
  font-family:var(--serif);font-style:italic;font-size:14px;
}

/* ═══════════════════════════════════════════════════════════════
   MARQUEE — rotating circular therapist profiles
═══════════════════════════════════════════════════════════════ */
.mq{
  position:relative;overflow:hidden;
  mask-image:linear-gradient(90deg,transparent,#000 7%,#000 93%,transparent);
  -webkit-mask-image:linear-gradient(90deg,transparent,#000 7%,#000 93%,transparent);
}
.mq-track{
  display:flex;gap:3.2rem;
  width:max-content;
  animation:marquee 70s linear infinite;
}
.mq:hover .mq-track{animation-play-state:paused}
.mq-item{
  display:flex;flex-direction:column;align-items:center;gap:11px;
  flex-shrink:0;width:118px;
  text-decoration:none;color:inherit;
}
.mq-photo{
  width:96px;height:96px;border-radius:50%;
  overflow:hidden;
  background:linear-gradient(135deg,var(--bg2),var(--bg3));
  border:1px solid var(--border);
  display:flex;align-items:center;justify-content:center;
  font-family:var(--serif);font-size:30px;font-style:italic;color:var(--ink3);
  box-shadow:0 8px 24px rgba(19,20,15,.08);
  transition:transform .35s ease,box-shadow .35s ease;
  position:relative;
}
.mq-photo::after{
  content:'';position:absolute;inset:-4px;border-radius:50%;
  border:1px solid transparent;
  transition:border-color .35s ease;
}
.mq-item:hover .mq-photo{transform:translateY(-4px);box-shadow:0 16px 36px rgba(19,20,15,.14)}
.mq-item:hover .mq-photo::after{border-color:var(--gold)}
.mq-photo img{width:100%;height:100%;object-fit:cover;object-position:top center;display:block}
.mq-name{
  font-family:var(--serif);font-size:14px;color:var(--ink);
  line-height:1.25;letter-spacing:-.012em;text-align:center;
  white-space:nowrap;max-width:118px;overflow:hidden;text-overflow:ellipsis;
}
.mq-role{
  font-size:10.5px;color:var(--ink4);font-weight:400;
  margin-top:2px;letter-spacing:.015em;text-align:center;
  white-space:nowrap;max-width:118px;overflow:hidden;text-overflow:ellipsis;
}

/* ═══════════════════════════════════════════════════════════════
   THERAPIST DIRECTORY — premium grid
═══════════════════════════════════════════════════════════════ */
.dir-head{
  display:flex;align-items:flex-end;justify-content:space-between;
  gap:2rem;flex-wrap:wrap;margin-bottom:2rem;
}
.dir-count{font-size:13px;color:var(--ink3);font-weight:300;margin-top:.8rem}
.dir-count strong{color:var(--gold);font-weight:500;font-family:var(--serif);font-size:15px;font-style:italic}

.search-wrap{position:relative}
.search-icon{
  position:absolute;left:13px;top:50%;transform:translateY(-50%);
  pointer-events:none;color:var(--ink4);
}
.search{
  padding:11px 15px 11px 38px;border-radius:8px;
  border:1px solid var(--border);background:var(--paper);
  font-family:var(--sans);font-size:13px;color:var(--ink);
  width:260px;outline:none;transition:border-color .2s,box-shadow .2s;
}
.search:focus{border-color:var(--gold);box-shadow:0 0 0 3px var(--gold-bg)}
.search::placeholder{color:var(--ink4)}

.chips{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:2.4rem}
.chip{
  font-size:12px;color:var(--ink3);padding:6px 14px;
  border-radius:100px;border:1px solid var(--border);
  background:var(--paper);cursor:pointer;transition:all .18s;font-weight:400;
}
.chip:hover{color:var(--ink);border-color:var(--ink3)}
.chip.on{background:var(--ink);color:#fff;border-color:var(--ink)}

.dir-grid{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:1px;
  border:1px solid var(--border);
  border-radius:14px;
  overflow:hidden;
  background:var(--border);
  box-shadow:0 4px 24px rgba(19,20,15,.04);
}
@media(max-width:960px){.dir-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:580px){.dir-grid{grid-template-columns:1fr}}

.tc{
  background:var(--paper);
  display:flex;flex-direction:column;
  text-decoration:none;color:inherit;
  padding:24px;
  position:relative;
  transition:background .25s;
  cursor:pointer;
  min-height:200px;
}
.tc:hover{background:#FEFCF7}
.tc::before{
  content:'';
  position:absolute;top:0;left:0;bottom:0;width:2.5px;
  background:linear-gradient(180deg,transparent,var(--gold) 30%,var(--gold) 70%,transparent);
  opacity:0;transition:opacity .3s;
}
.tc:hover::before{opacity:1}

.tc-top{display:flex;align-items:flex-start;gap:14px}
.tc-av{
  width:56px;height:56px;border-radius:12px;
  flex-shrink:0;overflow:hidden;
  display:flex;align-items:center;justify-content:center;
  font-family:var(--serif);font-size:19px;font-style:italic;
  border:1px solid var(--border2);
  position:relative;
}
.tc-av img{width:100%;height:100%;object-fit:cover;object-position:top center;display:block}

.tc-id{flex:1;min-width:0}
.tc-name{
  font-family:var(--serif);font-size:19px;font-weight:400;
  color:var(--ink);letter-spacing:-.015em;line-height:1.2;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
}
.tc-cred{
  font-size:11.5px;color:var(--ink4);font-weight:300;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
  margin-top:3px;line-height:1.4;
}
.tc-loc{
  display:flex;align-items:center;gap:6px;
  font-size:10.5px;color:var(--ink4);font-weight:400;
  margin-top:7px;letter-spacing:.015em;
}
.tc-loc-dot{width:3px;height:3px;border-radius:50%;background:var(--gold);flex-shrink:0}

.tc-fee-block{flex-shrink:0;text-align:right}
.tc-fee{
  font-family:var(--serif);font-size:19px;font-style:italic;
  color:var(--gold);line-height:1;
}
.tc-fee-lbl{
  font-size:9px;color:var(--ink4);font-weight:400;
  margin-top:3px;white-space:nowrap;letter-spacing:.04em;text-transform:uppercase;
}

.tc-div{height:1px;background:var(--border2);margin:16px 0}

.tc-bottom{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
.tc-tags{display:flex;flex-wrap:wrap;gap:5px;flex:1;min-width:0}
.tc-tag{
  font-size:10px;padding:4px 10px;border-radius:100px;
  background:var(--bg2);border:1px solid var(--border2);
  color:var(--ink3);white-space:nowrap;font-weight:400;
  transition:background .18s,border-color .18s,color .18s;
}
.tc:hover .tc-tag{background:#F4EFE2;border-color:var(--gold-line);color:var(--ink2)}

.tc-pills{display:flex;gap:5px;flex-shrink:0}
.tc-pill{
  font-size:10px;padding:4px 10px;border-radius:100px;
  white-space:nowrap;font-weight:400;
}
.tc-pill-exp{background:var(--bg2);color:var(--ink3);border:1px solid var(--border2)}
.tc-pill-mode{background:var(--gold-bg);color:var(--gold);border:1px solid var(--gold-line)}

.tc-arrow{
  position:absolute;bottom:20px;right:20px;
  font-size:14px;color:var(--gold);
  opacity:0;transform:translate(-4px,4px);
  transition:opacity .25s,transform .25s;
}
.tc:hover .tc-arrow{opacity:1;transform:translate(0,0)}

.tc-skel{background:var(--paper);padding:24px;display:flex;flex-direction:column;gap:12px;min-height:200px}
.sk{
  border-radius:6px;
  background:linear-gradient(90deg,var(--bg2) 25%,var(--bg3) 50%,var(--bg2) 75%);
  background-size:200% 100%;animation:shi 1.6s infinite;
}
@keyframes shi{0%{background-position:200% 0}100%{background-position:-200% 0}}

.dir-empty{
  grid-column:1/-1;padding:5rem 1.5rem;text-align:center;
  background:var(--paper);
  font-family:var(--serif);font-size:20px;font-style:italic;color:var(--ink4);
}
.dir-footer{
  text-align:center;margin-top:2rem;
  font-size:12.5px;color:var(--ink4);
}
.dir-footer a{color:var(--gold);text-decoration:none;border-bottom:1px solid var(--gold-line);font-weight:500}

/* ═══════════════════════════════════════════════════════════════
   TEMPLATES — full-screen horizontal carousel
   Each slide fills the viewport width and shows one complete
   template preview. Side arrows + dot nav + swipe supported.
═══════════════════════════════════════════════════════════════ */
.tmpl-section{
  position:relative;
  padding:var(--gap) 0;
  background:
    radial-gradient(ellipse 70% 55% at 50% 0%, rgba(200,212,203,.22) 0%, transparent 60%),
    radial-gradient(ellipse 45% 45% at 85% 85%, rgba(212,196,170,.14) 0%, transparent 70%),
    linear-gradient(180deg, #F6F3EE 0%, #F2EEE7 100%);
  overflow:hidden;
}
.tmpl-header{
  display:flex;align-items:flex-end;justify-content:space-between;
  gap:2rem;flex-wrap:wrap;
  padding:0 clamp(1.5rem, 5vw, 3rem);
  max-width: 1180px;
  margin:0 auto 3rem;
  width:100%;
}
.tmpl-header-left{}
.tmpl-header-right{
  display:flex;flex-direction:column;align-items:flex-end;gap:1rem;
}

/* ── carousel viewport ── */
.tmpl-viewport{
  position:relative;
  width:100%;
  
  overflow:hidden;
  /* subtle fade mask on left/right edges */
  -webkit-mask-image:linear-gradient(90deg,transparent 0%,#000 4%,#000 96%,transparent 100%);
  mask-image:linear-gradient(90deg,transparent 0%,#000 4%,#000 96%,transparent 100%);
}
.tmpl-track{
  display:flex;
  transition:transform .55s cubic-bezier(.4,0,.2,1);
  will-change:transform;
}

/* ── each slide ── */
.tmpl-slide{
  flex:0 0 100%;
  width:100%;
  
  
  padding:0 var(--px);
  display:flex;
  justify-content:center;
}

/* ── the actual card inside the slide ── */
.tmpl-card{
  position:relative;
  width:100%;
  max-width:760px;
  border-radius:20px;
  overflow:hidden;
  border:1px solid rgba(31,28,24,.06);
  // background:rgba(255,255,255,.82);
  backdrop-filter:blur(8px);
  -webkit-backdrop-filter:blur(8px);
  box-shadow:
    0 2px 0 rgba(255,255,255,.7) inset,
    0 32px 80px rgba(63,90,74,.1),
    0 8px 24px rgba(31,28,24,.06);
  cursor:pointer;
  transition:box-shadow .35s ease, transform .35s ease;
}
.tmpl-card:hover{
  box-shadow:
    0 2px 0 rgba(255,255,255,.6) inset,
    0 48px 100px rgba(19,20,15,.14),
    0 12px 32px rgba(19,20,15,.08);
  transform:translateY(-2px);
}

/* top chrome bar — mimics browser look */
.tmpl-card-chrome{
  display:flex;align-items:center;justify-content:space-between;
  padding:12px 18px;
  background:var(--bg2);
  border-bottom:1px solid var(--border);
  gap:1rem;
}
.tmpl-card-dots{display:flex;gap:6px}
.tmpl-card-dot{
  width:10px;height:10px;border-radius:50%;
  background:var(--border);
}
.tmpl-card-dot:nth-child(1){background:#FF5F57}
.tmpl-card-dot:nth-child(2){background:#FFBD2E}
.tmpl-card-dot:nth-child(3){background:#28C840}
.tmpl-card-url{
  flex:1;
  display:flex;align-items:center;justify-content:center;
  gap:7px;
  background:var(--paper);
  border:1px solid var(--border);
  border-radius:6px;
  padding:5px 12px;
  font-size:11.5px;color:var(--ink4);
  font-family:var(--sans);
  letter-spacing:-.01em;
  max-width:300px;
  margin:0 auto;
}
.tmpl-card-url svg{color:var(--ink4);flex-shrink:0}
.tmpl-card-open{
  display:inline-flex;align-items:center;gap:5px;
  font-size:11.5px;font-weight:500;color:var(--ink3);
  padding:5px 12px;border-radius:6px;
  border:1px solid var(--border);background:var(--paper);
  text-decoration:none;cursor:pointer;
  transition:border-color .2s,color .2s,background .2s;
  flex-shrink:0;
  font-family:var(--sans);
}
.tmpl-card-open:hover{border-color:var(--gold);color:var(--gold);background:var(--gold-bg)}

/* preview area — full 16:9-ish scaled template */
.tmpl-card-preview{
  width:100%;
  aspect-ratio:16/9.5;
  position:relative;
  overflow:hidden;
  background:var(--bg2);
}
.tmpl-card-preview-inner{
  position:absolute;
  top:0;left:0;
  width:1080px;
  height:560px;
  transform-origin:top left;
  pointer-events:none;
}

/* template footer bar */
.tmpl-card-foot{
  display:flex;align-items:center;justify-content:space-between;
  padding:14px 20px;
  border-top:1px solid var(--border);
  background:var(--paper);
  gap:1rem;
}
.tmpl-card-foot-l{}
.tmpl-card-foot-name{
  font-family:var(--serif);font-size:16px;font-weight:400;
  color:var(--ink);letter-spacing:-.014em;line-height:1.2;
}
.tmpl-card-foot-desc{
  font-size:11.5px;color:var(--ink4);margin-top:2px;font-weight:300;
}
.tmpl-card-foot-r{display:flex;align-items:center;gap:10px}
.tmpl-card-foot-num{
  font-family:var(--serif);font-size:13px;font-style:italic;
  color:var(--ink4);
}

/* ── side arrows ── */
.tmpl-arrow{
  position:absolute;top:50%;transform:translateY(-50%);
  z-index:10;
  width:44px;height:44px;
  border-radius:50%;
  background:rgba(255,255,255,.72);
  border:1px solid rgba(31,28,24,.07);
  backdrop-filter:blur(12px);
  -webkit-backdrop-filter:blur(12px);
  display:flex;align-items:center;justify-content:center;
  cursor:pointer;
  box-shadow:0 1px 0 rgba(255,255,255,.6) inset, 0 6px 20px rgba(63,90,74,.1);
  transition:all .25s cubic-bezier(.22,.87,.36,1);
  color:var(--wn-text-2, #3D3A33);
}
.tmpl-arrow:hover{
  background:var(--wn-sage, #5A7864);
  border-color:var(--wn-sage, #5A7864);
  color:#fff;
  box-shadow:0 1px 0 rgba(255,255,255,.18) inset, 0 10px 28px rgba(63,90,74,.28);
  transform:translateY(-50%) scale(1.06);
}
.tmpl-arrow:disabled{opacity:.3;pointer-events:none}
.tmpl-arrow-prev { left: calc((100vw - min(1180px, 100vw - 3rem)) / 2 + 12px) }
.tmpl-arrow-next { right: calc((100vw - min(1180px, 100vw - 3rem)) / 2 + 12px) }
@media (max-width: 980px){
  .tmpl-arrow-prev { left: 16px }
  .tmpl-arrow-next { right: 16px }
}

/* ── dot navigator ── */
.tmpl-dots{
  display:flex;align-items:center;justify-content:center;
  gap:8px;
  margin-top:2.2rem;
}
.tmpl-dot{
  width:7px;height:7px;border-radius:50%;
  background:var(--border);border:none;padding:0;cursor:pointer;
  transition:background .3s,transform .3s,width .4s cubic-bezier(.22,.87,.36,1);
}
.tmpl-dot:hover{background:var(--ink3)}
.tmpl-dot.on{
  width:22px;border-radius:4px;
  background:var(--wn-sage, #5A7864);
  transform:none;
}

/* ── counter pill ── */
.tmpl-counter{
  display:inline-flex;align-items:center;gap:6px;
  font-family:var(--serif);font-size:13px;font-style:italic;
  color:var(--ink3);
  padding:5px 13px;border-radius:100px;
  background:var(--paper);border:1px solid var(--border);
  margin-top:1rem;
}
.tmpl-counter strong{font-style:normal;color:var(--ink);font-family:var(--sans);font-size:12px;font-weight:500}

/* responsive */
@media(max-width:760px){
  .tmpl-header{flex-direction:column;align-items:flex-start;gap:1.5rem}
  .tmpl-header-right{align-items:flex-start}
  .tmpl-card-url{display:none}
  .tmpl-card-chrome{padding:10px 14px}
}

/* ═══════════════════════════════════════════════════════════════
   PRACTITIONERS DASHBOARD PREVIEW
═══════════════════════════════════════════════════════════════ */
.two-col{
  display:grid;grid-template-columns:1fr 1fr;
  gap:4rem 6rem;align-items:center;
}
@media(max-width:860px){.two-col{grid-template-columns:1fr;gap:3rem}}

.feat-list{list-style:none;display:flex;flex-direction:column;gap:0;margin:2rem 0 2.6rem}
.feat-list li{
  display:flex;align-items:flex-start;gap:14px;
  font-size:14.5px;font-weight:400;color:var(--ink2);line-height:1.6;
  padding:1rem 0;border-bottom:1px solid var(--border);
}
.feat-list li:first-child{border-top:1px solid var(--border)}
.feat-li-num{
  font-family:var(--serif);font-size:12px;font-style:italic;
  color:var(--gold);flex-shrink:0;width:22px;padding-top:3px;
}
.feat-li-text{flex:1}
.feat-li-text strong{color:var(--ink);font-weight:500}

.prac-panel{
  border-radius:14px;border:1px solid var(--border);
  overflow:hidden;display:flex;flex-direction:column;background:var(--paper);
  box-shadow:0 20px 50px rgba(19,20,15,.08),0 4px 14px rgba(19,20,15,.04);
}
.prac-panel-header{
  background:var(--ink);padding:1.5rem 1.6rem;
  display:flex;align-items:center;gap:13px;
  position:relative;
}
.prac-panel-header::before{
  content:'';position:absolute;top:0;left:0;right:0;height:2px;
  background:linear-gradient(90deg,transparent 10%,var(--gold) 50%,transparent 90%);
}
.prac-panel-av{
  width:46px;height:46px;border-radius:50%;
  background:rgba(255,255,255,.12);flex-shrink:0;
  display:flex;align-items:center;justify-content:center;
  font-family:var(--serif);font-size:18px;font-style:italic;color:#fff;
  border:1px solid rgba(255,255,255,.1);
}
.prac-panel-id{flex:1;min-width:0}
.prac-panel-name{font-family:var(--serif);font-size:17px;color:#fff;line-height:1.2;letter-spacing:-.012em}
.prac-panel-role{font-size:11.5px;color:rgba(255,255,255,.42);margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.prac-panel-live{
  display:inline-flex;align-items:center;gap:6px;
  font-size:10.5px;color:rgba(255,255,255,.55);
  border:1px solid rgba(255,255,255,.16);padding:4px 10px;border-radius:5px;
  letter-spacing:.04em;
}
.prac-panel-live-dot{width:6px;height:6px;border-radius:50%;background:#6de0a0;flex-shrink:0;animation:pulseDot 2s infinite}
.prac-panel-body{padding:1.5rem 1.6rem;flex:1;display:flex;flex-direction:column;gap:1.2rem}
.prac-panel-stat-row{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--border);border-radius:8px;overflow:hidden}
.prac-stat{background:var(--bg2);padding:1rem .9rem;display:flex;flex-direction:column;gap:4px}
.prac-stat-n{font-family:var(--serif);font-size:22px;color:var(--ink);line-height:1;letter-spacing:-.02em}
.prac-stat-n i{font-style:italic;color:var(--gold)}
.prac-stat-l{font-size:10px;color:var(--ink4);letter-spacing:.04em;text-transform:uppercase}
.prac-panel-upcoming{display:flex;flex-direction:column;gap:8px}
.prac-panel-upcoming-label{font-size:10px;color:var(--ink4);letter-spacing:.06em;text-transform:uppercase;margin-bottom:4px;font-weight:500}
.prac-appt{
  display:flex;align-items:center;gap:11px;
  padding:.75rem 1rem;background:var(--bg2);border-radius:8px;border:1px solid var(--border2);
  transition:background .2s;
}
.prac-appt:hover{background:var(--bg3)}
.prac-appt-av{
  width:30px;height:30px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  font-family:var(--serif);font-size:11px;font-style:italic;flex-shrink:0;
}
.prac-appt-info{flex:1;min-width:0}
.prac-appt-name{font-size:13px;color:var(--ink);font-weight:500;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:-.005em}
.prac-appt-time{font-size:11px;color:var(--ink3);font-weight:300;margin-top:1px}
.prac-appt-badge{font-size:10px;padding:3px 9px;border-radius:4px;font-weight:500;white-space:nowrap;flex-shrink:0;letter-spacing:.03em}
.prac-panel-footer{
  padding:1rem 1.6rem;background:var(--bg2);
  border-top:1px solid var(--border);
  display:flex;align-items:center;justify-content:space-between;
}
.prac-panel-footer-t{font-size:12.5px;color:var(--ink);font-weight:500}
.prac-panel-footer-s{font-size:11px;color:var(--ink3);font-family:var(--serif);font-style:italic}

/* ═══════════════════════════════════════════════════════════════
   HOW IT WORKS
═══════════════════════════════════════════════════════════════ */
.steps{
  display:grid;grid-template-columns:repeat(4,1fr);gap:0;
  border-top:1px solid var(--border);margin-top:3.5rem;
}
@media(max-width:920px){.steps{grid-template-columns:repeat(2,1fr)}}
@media(max-width:520px){.steps{grid-template-columns:1fr}}
.step{padding:2.8rem 0;border-right:1px solid var(--border);padding-right:2.4rem;position:relative}
.step:last-child{border-right:none}
.step+.step{padding-left:2.4rem}
@media(max-width:920px){
  .step:nth-child(2){border-right:none}
  .step:nth-child(3){border-top:1px solid var(--border);padding-left:0}
  .step:nth-child(4){border-top:1px solid var(--border)}
}
@media(max-width:520px){
  .step{border-right:none;border-top:1px solid var(--border);padding-left:0}
  .step:first-child{border-top:none}
}
.step-n{
  font-family:var(--serif);font-size:13px;font-style:italic;color:var(--gold);
  display:block;margin-bottom:1.4rem;letter-spacing:.04em;
}
.step-t{font-size:15.5px;font-weight:500;color:var(--ink);margin-bottom:.7rem;letter-spacing:-.012em}
.step-d{font-size:13.5px;font-weight:300;color:var(--ink3);line-height:1.7;max-width:28ch}

/* ═══════════════════════════════════════════════════════════════
   MODAL
═══════════════════════════════════════════════════════════════ */
.modal{position:fixed;inset:0;z-index:9999;display:flex;flex-direction:column;animation:mfade .25s ease both}
@keyframes mfade{from{opacity:0}to{opacity:1}}
.mbar{height:54px;flex-shrink:0;display:flex;align-items:center;justify-content:space-between;padding:0 1.6rem;background:var(--ink);gap:1rem}
.mbadge{font-size:10.5px;background:rgba(255,255,255,.1);color:rgba(255,255,255,.55);padding:4px 11px;border-radius:5px;border:1px solid rgba(255,255,255,.12);white-space:nowrap;flex-shrink:0;letter-spacing:.05em;text-transform:uppercase;font-weight:500}
.mtitle{font-size:13px;color:rgba(255,255,255,.5);letter-spacing:-.005em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:var(--serif);font-style:italic}
.mright{display:flex;gap:8px;flex-shrink:0}
.mopen{font-size:11.5px;padding:7px 15px;border-radius:5px;background:rgba(255,255,255,.14);color:#fff;border:1px solid rgba(255,255,255,.16);cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;font-weight:500}
.mopen:hover{background:rgba(255,255,255,.22)}
.mclose{width:32px;height:32px;border-radius:5px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);cursor:pointer;color:rgba(255,255,255,.5);font-size:13px;display:flex;align-items:center;justify-content:center;transition:background .2s}
.mclose:hover{background:rgba(255,255,255,.18)}
.mbody{flex:1;overflow:hidden;position:relative}
.miframe{width:100%;height:100%;border:none;display:block}
.mload{position:absolute;inset:0;background:#111;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;pointer-events:none;transition:opacity .3s}
.mload.gone{opacity:0}
.mspin{width:22px;height:22px;border-radius:50%;border:1.5px solid rgba(255,255,255,.1);border-top-color:rgba(255,255,255,.65);animation:spin .7s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.mload-t{font-size:11.5px;color:rgba(255,255,255,.25);letter-spacing:.06em;text-transform:uppercase}

/* ═══════════════════════════════════════════════════════════════
   TESTIMONIALS
═══════════════════════════════════════════════════════════════ */
.tgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:0;border:1px solid var(--border);border-radius:12px;overflow:hidden;background:var(--border);margin-top:3rem}
@media(max-width:880px){.tgrid{grid-template-columns:1fr}}
.tcard{padding:2.2rem 2rem 2rem;background:var(--paper);display:flex;flex-direction:column;gap:0;position:relative}
.tcard::before{content:'\\201C';font-family:var(--serif);font-size:80px;line-height:1;color:var(--gold);opacity:.18;position:absolute;top:1rem;left:1.6rem;pointer-events:none;font-weight:400}
.tquote{font-family:var(--serif);font-size:16px;font-style:italic;color:var(--ink);line-height:1.65;flex:1;padding-top:1.8rem;margin-bottom:2rem;letter-spacing:-.005em}
.tattr{display:flex;align-items:center;gap:12px;padding-top:1.6rem;border-top:1px solid var(--border)}
.tav{width:40px;height:40px;border-radius:50%;background:var(--bg2);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-family:var(--serif);font-size:14px;font-style:italic;color:var(--ink2);flex-shrink:0}
.tname{font-size:13.5px;font-weight:500;color:var(--ink);line-height:1.3;letter-spacing:-.008em}
.trole{font-size:11.5px;color:var(--ink4);margin-top:2px}

/* ═══════════════════════════════════════════════════════════════
   PRICING
═══════════════════════════════════════════════════════════════ */
.pgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:0;border:1px solid var(--border);border-radius:14px;overflow:hidden;background:var(--border);margin-top:3rem;box-shadow:0 8px 32px rgba(19,20,15,.05)}
@media(max-width:720px){.pgrid{grid-template-columns:1fr}}
.plan{background:var(--paper);padding:2.4rem 2rem;display:flex;flex-direction:column;position:relative}
.plan.hi{background:linear-gradient(180deg,#FEFCF7,var(--paper))}
.plan.hi::before{
  content:'';position:absolute;top:0;left:0;right:0;height:3px;
  background:linear-gradient(90deg,var(--gold),var(--gold2),var(--gold));
}
.plan-badge{
  font-size:10.5px;font-weight:500;color:var(--gold);letter-spacing:.16em;text-transform:uppercase;
  margin-bottom:1.6rem;display:inline-flex;align-items:center;gap:6px;
}
.plan-badge::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--gold)}
.plan-name{font-size:12px;font-weight:500;color:var(--ink3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:.7rem}
.plan-price{font-family:var(--serif);font-size:46px;font-weight:400;line-height:1;color:var(--ink);margin-bottom:.4rem;letter-spacing:-.025em}
.plan-period{font-size:12.5px;color:var(--ink4);margin-bottom:2rem}
.plan-rule{height:1px;background:var(--border);margin-bottom:1.6rem}
.plan-feats{list-style:none;display:flex;flex-direction:column;gap:.85rem;margin-bottom:2rem;flex:1}
.plan-feat{display:flex;gap:10px;font-size:13.5px;color:var(--ink2);line-height:1.5}
.plan-check{color:var(--gold);flex-shrink:0;margin-top:1px;font-size:12px;font-weight:600}
.pcta-p{display:flex;align-items:center;justify-content:center;padding:13px;border-radius:7px;background:var(--ink);color:#fff;font-size:13.5px;font-weight:500;text-decoration:none;border:none;cursor:pointer;transition:background .2s,transform .2s;letter-spacing:-.005em}
.pcta-p:hover{background:#000;transform:translateY(-1px)}
.pcta-g{display:flex;align-items:center;justify-content:center;padding:13px;border-radius:7px;background:transparent;color:var(--ink2);font-size:13.5px;font-weight:400;text-decoration:none;border:1px solid var(--border);cursor:pointer;transition:border-color .2s,color .2s;letter-spacing:-.005em}
.pcta-g:hover{border-color:var(--gold);color:var(--gold)}

/* ═══════════════════════════════════════════════════════════════
   FINAL CTA
═══════════════════════════════════════════════════════════════ */
// .final{padding:calc(var(--gap) * 1.2) var(--px);background:var(--ink);position:relative;overflow:hidden}
// .final::before{content:'';position:absolute;top:-30%;left:50%;transform:translateX(-50%);width:800px;height:800px;border-radius:50%;background:radial-gradient(circle,rgba(184,134,44,.06) 0%,transparent 60%);pointer-events:none}
// .final-inner{max-width:var(--max);  margin:0 auto;gap:3rem 6rem;align-items:center;position:relative}
// @media(max-width:820px){.final-inner{grid-template-columns:1fr;gap:2.5rem}.final-right{display:none}}
// .final-h{font-family:var(--serif);font-size:clamp(38px,5vw,68px);font-weight:400;line-height:1.05;letter-spacing:-.03em;color:#fff;margin-bottom:1.4rem}
// .final-h i{font-style:italic;color:var(--gold2)}
// .final-p{font-size:15px;font-weight:300;line-height:1.75;color:rgba(255,255,255,.45);margin-bottom:2.6rem;max-width:42ch}
// .final-ctas{display:flex;gap:10px;flex-wrap:wrap}
// .final-btn{padding:13px 28px;border-radius:7px;background:#fff;color:var(--ink);font-size:13.5px;font-weight:500;text-decoration:none;transition:opacity .2s,transform .2s;letter-spacing:-.005em;display:inline-flex;align-items:center;gap:8px}
// .final-btn:hover{opacity:.92;transform:translateY(-1px)}
// .final-btn-g{padding:13px 28px;border-radius:7px;background:transparent;color:rgba(255,255,255,.55);font-size:13.5px;font-weight:400;text-decoration:none;border:1px solid rgba(255,255,255,.16);cursor:pointer;transition:border-color .2s,color .2s;letter-spacing:-.005em}
// .final-btn-g:hover{border-color:rgba(255,255,255,.4);color:#fff}
// .final-right{display:flex;flex-direction:column;gap:0;border:1px solid rgba(255,255,255,.1);border-radius:12px;overflow:hidden;background:rgba(255,255,255,.02)}
// .final-stat{padding:1.6rem 2rem;border-bottom:1px solid rgba(255,255,255,.06);display:flex;align-items:baseline;justify-content:space-between;gap:1rem}
// .final-stat:last-child{border-bottom:none}
// .final-stat-n{font-family:var(--serif);font-size:32px;color:#fff;letter-spacing:-.025em;line-height:1}
// .final-stat-n i{font-style:italic;color:var(--gold2)}
// .final-stat-l{font-size:12px;color:rgba(255,255,255,.4);font-weight:300;text-align:right}




































/* ═══════════════════════════════════════════════════════════════
   FINAL / FOOTER
═══════════════════════════════════════════════════════════════ */

.final{
  padding:calc(var(--section-y) * 1.05) var(--section-x);
  background:var(--surf-dark);
  position:relative;
  overflow:hidden;
}

.final::before{
  content:'';
  position:absolute;
  top:-30%;
  left:50%;
  transform:translateX(-50%);
  width:800px;
  height:800px;
  border-radius:50%;
  background:radial-gradient(circle,rgba(255,153,51,.10) 0%,transparent 60%);
  pointer-events:none;
}

.final-inner{
  max-width:820px;
  margin:0 auto;

  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;

  text-align:center;
  position:relative;
}

.final-h{
  font-family:var(--display);
  font-size:clamp(34px,6vw,60px);
  font-weight:800;

  line-height:1.06;
  letter-spacing:-.03em;
  color:#fff;
  margin-bottom:var(--s-3);
}

.final-h i{
  font-style:normal;
  color:var(--wn-saffron,#FF9933);
}

.final-p{
  font-family:var(--sans);
  font-size:16px;
  font-weight:400;
  line-height:1.65;
  color:rgba(255,255,255,.6);
  margin-bottom:var(--s-5);
  max-width:48ch;
}

.final-ctas{
  display:flex;
  justify-content:center;
  gap:var(--s-2);
  flex-wrap:wrap;
}

.final-btn{
  padding:15px 30px;
  border-radius:var(--r-sm);
  background:var(--wn-saffron,#FF9933);
  color:#fff;
  font-family:var(--sans);
  font-size:14.5px;
  font-weight:600;
  text-decoration:none;
  transition:background .25s,transform .25s,box-shadow .25s;
  letter-spacing:-.005em;
  display:inline-flex;
  align-items:center;
  gap:8px;
  box-shadow:0 14px 34px -12px rgba(255,153,51,.6);
}

.final-btn:hover{
  background:var(--wn-saffron-deep,#E07A12);
  transform:translateY(-2px);
}

.final-btn-g{
  padding:15px 30px;
  border-radius:var(--r-sm);
  background:transparent;
  color:rgba(255,255,255,.7);
  font-family:var(--sans);
  font-size:14.5px;
  font-weight:600;
  text-decoration:none;
  border:1px solid rgba(255,255,255,.2);
  cursor:pointer;
  transition:border-color .2s,color .2s,background .2s;
  letter-spacing:-.005em;
}

.final-btn-g:hover{
  border-color:rgba(255,255,255,.4);
  color:#fff;
}

/* remove right stats section */
.final-right{
  display:none;
}













/* ═══════════════════════════════════════════════════════════════
   FOOTER
═══════════════════════════════════════════════════════════════ */
.footer{padding:2rem var(--px);border-top:1px solid var(--border);background:var(--bg)}
.footer-inner{max-width:var(--max);margin:0 auto;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem}
.footer-logo{font-family:var(--serif);font-size:15px;color:var(--ink3);display:flex;align-items:center;gap:9px}
.flinks{display:flex;gap:1.6rem}
.flink{font-size:12px;color:var(--ink4);text-decoration:none;transition:color .2s}
.flink:hover{color:var(--ink)}
.fcopy{font-size:11.5px;color:var(--ink4)}



:root{ --bg: #F6F3EE; --surface: rgba(255,255,255,.65); --text: #1F1C18; --muted: #6E685F; --line: #E7E1D8; --green: #456554; --green-dark: #31493C; } /* ───────────────────────────── NAVBAR ───────────────────────────── */ .nav{ position: fixed; top: 0; left: 0; width: 100%; z-index: 1000; height: 78px; display:flex; align-items:center; justify-content:space-between; padding:0 42px; background: rgba(246,243,238,.78); backdrop-filter: blur(14px); border-bottom:1px solid rgba(231,225,216,.7); } .logo{ display:flex; align-items:center; gap:10px; text-decoration:none; color:var(--text); font-size:15px; font-weight:500; } .logo-dot{ width:8px; height:8px; border-radius:999px; background:var(--green); } .nav-links{ display:flex; align-items:center; gap:38px; } .nav-links a{ text-decoration:none; color:var(--muted); font-size:14px; font-weight:500; transition:.2s ease; } .nav-links a:hover{ color:var(--text); } .nav-actions{ display:flex; align-items:center; gap:12px; } /* ───────────────────────────── BUTTONS ───────────────────────────── */ .btn{ height:44px; padding:0 18px; border-radius:12px; display:inline-flex; align-items:center; justify-content:center; text-decoration:none; font-size:14px; font-weight:500; transition:.2s ease; } .btn-light{ border:1px solid var(--line); background:transparent; color:var(--text); } .btn-light:hover{ background:#EFEAE2; } .btn-dark{ background:var(--green); color:white; } .btn-dark:hover{ background:var(--green-dark); } /* ───────────────────────────── HERO ───────────────────────────── */ 




/* ═══════════════════════════════════════════════════════════════
   WELLNESS HERO — premium editorial redesign
   Palette: warm off-white, sage accents, soft gradients, no harsh borders
═══════════════════════════════════════════════════════════════ */
:root{
  /* Warm saffron-tint surfaces (aligned to the --surf scale; no more beige) */
  --wn-bg: #FFFCF8;
  --wn-bg-2: #FDF5EC;
  --wn-paper: #FFFFFF;
  --wn-text: #1F1A14;
  --wn-text-2: #46403A;
  --wn-muted: #7A7166;
  --wn-muted-2: #A89F94;
  --wn-line: rgba(31,26,20,.07);
  --wn-line-2: rgba(31,26,20,.04);
  --wn-sage: #FF9933;
  --wn-sage-deep: #C66A0F;
  --wn-sage-soft: #FFD9B0;
  --wn-sage-tint: rgba(255,153,51,.08);
  --wn-saffron: #FF9933;
  --wn-saffron-deep: #E07A12;
  --wn-saffron-soft: #FFD9B0;
  --wn-saffron-tint: rgba(255,153,51,.1);
}

/* ── NAVBAR — full-width minimal editorial bar ───────────── */
/* ── Floating glassmorphism pill ────────────────────────────────
   A centred capsule that hovers below the top edge. Frosted blur,
   soft transparency, rounded fully, premium spacing. It deepens a
   touch on scroll. GPU-only transitions. */
.nav {
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);

  width: min(1180px, calc(100% - 32px));
  height: 68px;
  padding: 0 20px;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.25rem;

  z-index: 1000;

  border-radius: 999px;

  /* HERO STATE */
  background: transparent;
  border: 1px solid transparent;

  backdrop-filter: none;
  -webkit-backdrop-filter: none;

  box-shadow: none;

  transition:
    background .35s ease,
    border-color .35s ease,
    box-shadow .35s ease,
    backdrop-filter .35s ease;
}

/* AFTER HERO */
.nav.scrolled {
  background: rgba(251, 249, 244, 0.72);

  border: 1px solid rgba(255,255,255,.65);

  backdrop-filter: blur(22px) saturate(180%);
  -webkit-backdrop-filter: blur(22px) saturate(180%);

  box-shadow:
    0 1px 0 rgba(255,255,255,.7) inset,
    0 12px 40px -16px rgba(31,28,24,.20);
}

/* nav children — dark editorial palette on the frosted pill */
.nav .logo{color:var(--ink);font-family:var(--serif);font-size:16px;letter-spacing:-.012em;display:flex;align-items:center;gap:10px;text-decoration:none;flex-shrink:0}
.nav .logo-img{height:98px;width:auto;display:block;object-fit:contain;flex-shrink:0;opacity:.95}
.nav .nav-mid{position:static;left:auto;transform:none;display:flex;align-items:center;gap:32px;margin:0 auto}
.nav .nav-a{font-size:13.5px;font-weight:400;color:var(--ink3);text-decoration:none;background:none;border:none;cursor:pointer;letter-spacing:-.003em;position:relative;transition:color .2s;padding:4px 0}
.nav .nav-a::after{content:'';position:absolute;left:0;right:0;bottom:-2px;height:1px;background:var(--gold);transform:scaleX(0);transform-origin:center;transition:transform .28s cubic-bezier(.22,.87,.36,1)}
.nav .nav-a:hover{color:var(--ink)}
.nav .nav-a:hover::after{transform:scaleX(1)}
.nav .nav-r{display:flex;align-items:center;gap:6px;flex-shrink:0}
.nav .btn{height:40px;border-radius:999px;font-size:13px;font-weight:500;letter-spacing:-.005em}
.nav .btn-line{background:transparent;color:var(--ink2);border:1px solid transparent}
.nav .btn-line:hover{color:var(--ink);background:rgba(19,20,15,.05);border-color:transparent}
.nav .btn-dark{background:var(--wn-saffron,#FF9933);color:#fff;border:1px solid transparent;box-shadow:0 1px 0 rgba(255,255,255,.25) inset,0 6px 18px -6px rgba(255,153,51,.55)}
.nav .btn-dark:hover{background:var(--wn-saffron-deep,#E07A12);transform:translateY(-1px);box-shadow:0 1px 0 rgba(255,255,255,.25) inset,0 10px 24px -8px rgba(255,153,51,.55)}
@media(max-width:980px){.nav .nav-mid,.nav .nav-r{display:none}}


.logo{
  display: inline-flex;
  align-items: center;
  gap: 9px;
  text-decoration: none;
  color: var(--wn-text);
  font-family: var(--display);
  font-size: 17px;
  font-weight: 400;
  letter-spacing: -.015em;
  flex-shrink: 0;
}
.logo-dot{
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--wn-sage);
  box-shadow: 0 0 0 4px rgba(90,120,100,.12);
}
/* logo mark sized to fit inside the pill */
.logo-img{
  height: 38px;
  width: auto;
  display: block;
  object-fit: contain;
  flex-shrink: 0;
}
@media (max-width: 600px){
  .logo-name{ display:none; }   /* keep just the mark on small screens */
}

.nav-mid{
  display: flex;
  align-items: center;
  gap: 32px;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}
.nav-link{
  position: relative;
  text-decoration: none;
  color: var(--wn-muted);
  font-size: 14px;
  font-weight: 400;
  letter-spacing: -.003em;
  transition: color .25s ease;
}
.nav-link:hover{ color: var(--wn-text); }

.nav-r{
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.btn{
  height: 42px;
  padding: 0 18px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  text-decoration: none;
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: -.005em;
  transition: all .25s ease;
  border: 1px solid transparent;
  background: transparent;
  color: var(--wn-text);
  cursor: pointer;
}
.btn-light{
  color: var(--wn-text-2);
  padding: 0 16px;
}
.btn-light:hover{
  background: rgba(31,28,24,.05);
  color: var(--wn-text);
}
.btn-dark{
  background: var(--wn-sage);
  color: #fff;
  box-shadow:
    0 1px 0 rgba(255,255,255,.18) inset,
    0 6px 18px -4px rgba(63,90,74,.32);
}
.btn-dark:hover{
  background: var(--wn-sage-deep);
  box-shadow:
    0 1px 0 rgba(255,255,255,.18) inset,
    0 8px 22px -4px rgba(63,90,74,.4);
}

@media (max-width: 980px){

  .nav{
    top: 12px;
    left: 10px;
    right: 10px;
    transform: none;        /* cancel the desktop translateX(-50%) centering */
    width: auto;
    max-width: none;
    height: 60px;
    padding: 0 10px 0 16px;
    border-radius: 999px;
    justify-content: space-between;
  }

  .logo span{
    display: none;
  }

  .logo-img{
    width: 39px;
    height: 54px;
  }

  /* hamburger-only on mobile: hide the desktop links + CTAs entirely */
  .nav-mid,
  .nav-r{
    display: none;
  }

}


/* HAMBURGER */

.menu-btn{
  width: 46px;
  height: 46px;
  border: none;
  background: rgba(255,255,255,0.75);
  backdrop-filter: blur(12px);
  border-radius: 14px;
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  z-index: 1200;
  transition: all 0.3s ease;
  box-shadow: 0 6px 24px rgba(0,0,0,0.08);
}

.menu-btn span{
  width: 20px;
  height: 2px;
  background: #111827;
  border-radius: 999px;
  transition: all 0.35s ease;
}
  .menu-btn span{
  background: #ff9933;
}

/* OPEN ANIMATION */

.menu-btn.active span:nth-child(1){
  transform: translateY(7px) rotate(45deg);
}

.menu-btn.active span:nth-child(2){
  opacity: 0;
  transform: scaleX(0);
}

.menu-btn.active span:nth-child(3){
  transform: translateY(-7px) rotate(-45deg);
}

/* OVERLAY */

.mobile-overlay{
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0);
  backdrop-filter: blur(0px);
  visibility: hidden;
  transition: all 0.35s ease;
  z-index: 998;
}

.mobile-overlay.show{
  visibility: visible;
  background: rgba(0,0,0,0.35);
  backdrop-filter: blur(4px);
}

/* SIDEBAR */

.mobile-menu{
  position: fixed;
  top: 0;
  right: -100%;
  width: 82%;
  max-width: 360px;
  height: 100vh;
  background: rgba(255,255,255,0.82);
  backdrop-filter: blur(24px);
  border-left: 1px solid rgba(255,255,255,0.4);
  padding: 26px;
  display: flex;
  flex-direction: column;
  transition: all 0.45s cubic-bezier(.77,0,.18,1);
  z-index: 999;
  box-shadow: -10px 0 40px rgba(0,0,0,0.12);
}

.mobile-menu.show{
  right: 0;
}

/* TOP */

.mobile-head{
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 40px;
}

.mobile-head img{
  width: 42px;
  height: 42px;
  border-radius: 12px;
}

.mobile-head h3{
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}

/* LINKS */

.mobile-links{
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.mobile-links a{
  position: relative;
  text-decoration: none;
  color: #111827;
  font-size: 16px;
  font-weight: 600;
  padding: 16px 18px;
  border-radius: 18px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.mobile-links a::before{
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(99,102,241,0.08),
    rgba(168,85,247,0.08)
  );
  opacity: 0;
  transition: 0.3s ease;
}

.mobile-links a:hover::before{
  opacity: 1;
}

.mobile-links a:hover{
  transform: translateX(6px);
}

/* BOTTOM */

.mobile-bottom{
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-top: 24px;
}

.mobile-bottom .btn{
  width: 100%;
  justify-content: center;
  height: 50px;
  border-radius: 16px;
}

/* MOBILE */

@media (max-width: 980px){

  .nav-mid{
    display: none;
  }

  .nav-r{
    display: none;
  }

  .menu-btn{
    display: flex;
  }
}






/* ── HERO — premium editorial composition ─────────── */
.hero{
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
padding:
  8rem
  clamp(24px, 6vw, 72px)
  7rem;
    background:
    radial-gradient(
      ellipse 70% 60% at 50% 0%,
      rgba(200, 212, 203, 0.45) 0%,
      transparent 60%
    ),
    radial-gradient(
      ellipse 50% 45% at 85% 80%,
      rgba(90, 120, 100, 0.08) 0%,
      transparent 70%
    ),
    radial-gradient(
      ellipse 45% 40% at 15% 75%,
      rgba(212, 196, 170, 0.18) 0%,
      transparent 70%
    ),
    linear-gradient(180deg, #F6F3EE 0%, #F2EEE7 100%);
}

/* atmospheric depth layers */
.hero-aura{
  position: absolute;
  top: -10%;
  left: 50%;
  transform: translateX(-50%);
  width: min(1100px, 110%);
  aspect-ratio: 1 / 1;
  background:
    radial-gradient(
      circle at center,
      rgba(168, 192, 178, 0.32) 0%,
      rgba(168, 192, 178, 0.12) 30%,
      transparent 65%
    );
  filter: blur(20px);
  pointer-events: none;
  z-index: 0;
  animation: heroAura 14s ease-in-out infinite;
}
@keyframes heroAura{
  0%, 100% { transform: translateX(-50%) translateY(0) scale(1); opacity: 1; }
  50%      { transform: translateX(-50%) translateY(-14px) scale(1.03); opacity: .85; }
}

.hero-glow{
  position: absolute;
  width: 760px;
  height: 760px;
  top: 28%;
  left: 50%;
  transform: translate(-50%, -50%);
  background:
    radial-gradient(circle, rgba(90,120,100,.14) 0%, rgba(90,120,100,.04) 35%, transparent 65%);
  filter: blur(6px);
  pointer-events: none;
  z-index: 0;
}

.hero-noise{
  position: absolute;
  inset: 0;
  opacity: .025;
  background-image: radial-gradient(#000 0.5px, transparent 0.5px);
  background-size: 5px 5px;
  pointer-events: none;
  z-index: 1;
  mask-image: radial-gradient(ellipse at center, black 40%, transparent 90%);
  -webkit-mask-image: radial-gradient(ellipse at center, black 40%, transparent 90%);
}

/* subtle organic shape, soft sage leaf */
.hero-orb{
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
}
.hero-orb-a{
  top: 18%;
  left: 8%;
  width: 140px;
  height: 140px;
  background: radial-gradient(circle at 30% 30%, rgba(200,212,203,.7), rgba(200,212,203,0) 70%);
  filter: blur(8px);
  animation: heroOrbA 16s ease-in-out infinite;
}
.hero-orb-b{
  bottom: 16%;
  right: 10%;
  width: 180px;
  height: 180px;
  background: radial-gradient(circle at 70% 40%, rgba(212,196,170,.5), rgba(212,196,170,0) 70%);
  filter: blur(10px);
  animation: heroOrbB 18s ease-in-out infinite;
}
@keyframes heroOrbA{
  0%,100% { transform: translate(0,0); }
  50%     { transform: translate(20px,-14px); }
}
@keyframes heroOrbB{
  0%,100% { transform: translate(0,0); }
  50%     { transform: translate(-18px,12px); }
}

.hero-inner{
  position: relative;
  width: 100%;
  max-width: 820px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  z-index: 5;
}
.hero-text{
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-width: 0;
}

/* top tagline — small, sage, intimate */
.hero-stamp{
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(255,255,255,.55);
  border: 1px solid rgba(90,120,100,.18);
  color: var(--wn-sage-deep);
  font-family: var(--sans);
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: .005em;
  margin-bottom: 1.5rem;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  animation: heroFadeIn .9s ease .1s both;
}
.hero-stamp-dot{
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #138808;
  box-shadow: 0 0 0 3px rgba(255,153,51,.22);
  animation: pulseDot 2.4s ease-in-out infinite;
}

@keyframes heroFadeIn{
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* headline — Fraunces, premium editorial serif */
.hero-h{
  position: relative;
  display: block;
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  text-align: center;
  color: var(--wn-text);
  font-family: var(--display);
  font-weight: 400;
  font-size: clamp(36px, 5vw, 60px);
  line-height: 1.1;
  letter-spacing: -.028em;
  font-optical-sizing: auto;
  font-variation-settings: 'SOFT' 50, 'WONK' 0;
  text-wrap: balance;
  animation: heroFadeIn 1s cubic-bezier(.22,.87,.36,1) .2s both;
}
.hero-h .hero-stage{
  position: relative;
  display: grid;
  grid-template-columns: 1fr;
  width: 100%;
}
.hero-msg{
  grid-row: 1;
  grid-column: 1;
  display: block;
  text-align: inherit;
  opacity: 0;
  transform: translateY(10px);
  transition: opacity .9s cubic-bezier(.22,.87,.36,1), transform .9s cubic-bezier(.22,.87,.36,1);
  pointer-events: none;
  visibility: hidden;
}
.hero-msg.on{
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
  visibility: visible;
}
.hero-msg-inner{
  display: block;
}
.hero-msg em{
  font-style: italic;
  color: #ff9933;
  // color: var(--wn-sage-deep);
  font-weight: 400;
  font-variation-settings: 'SOFT' 100, 'WONK' 1;
}

/* supporting line — sits directly under headline, tighter spacing */
.hero-lede-wrap{
  position: relative;
  display: grid;
  grid-template-columns: 1fr;
  margin: 1.2rem auto 0;
  width: 100%;
  max-width: 540px;
  animation: heroFadeIn 1s cubic-bezier(.22,.87,.36,1) .35s both;
}
.hero-lede{
  grid-row: 1;
  grid-column: 1;
  margin: 0;
  text-align: inherit;
  color: var(--wn-muted);
  font-family: var(--sans);
  font-size: clamp(15px, 1.15vw, 16.5px);
  font-weight: 300;
  line-height: 1.65;
  letter-spacing: -.003em;
  opacity: 0;
  transform: translateY(8px);
  transition: opacity .9s cubic-bezier(.22,.87,.36,1), transform .9s cubic-bezier(.22,.87,.36,1);
  visibility: hidden;
}
.hero-lede.on{
  opacity: 1;
  transform: translateY(0);
  visibility: visible;
}

/* CTAs — integrated, soft, premium */
.hero-actions{
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin-top: 2.2rem;
  padding: 6px;
  background: rgba(255,255,255,.4);
  border: 1px solid rgba(31,28,24,.05);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow:
    0 1px 0 rgba(255,255,255,.6) inset,
    0 16px 40px -16px rgba(63,90,74,.18);
  animation: heroFadeIn 1s cubic-bezier(.22,.87,.36,1) .5s both;
}

.hero-btn{
  height: 48px;
  padding: 0 22px;
  border-radius: 11px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-decoration: none;
  font-family: var(--sans);
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -.005em;
  transition: all .3s cubic-bezier(.22,.87,.36,1);
  border: none;
  cursor: pointer;
}
.hero-btn-primary{
  background: var(--wn-sage);
  color: #fff;
  box-shadow:
    0 1px 0 rgba(255,255,255,.18) inset,
    0 8px 24px -6px rgba(63,90,74,.42);
}
.hero-btn-primary:hover{
  background: var(--wn-sage-deep);
  transform: translateY(-1px);
  box-shadow:
    0 1px 0 rgba(255,255,255,.18) inset,
    0 12px 28px -6px rgba(63,90,74,.5);
}
.hero-btn-primary svg{ transition: transform .3s ease; }
.hero-btn-primary:hover svg{ transform: translateX(3px); }

.hero-btn-secondary{
  background: transparent;
  color: var(--wn-text-2);
}
.hero-btn-secondary:hover{
  background: rgba(255,255,255,.7);
  color: var(--wn-text);
}

/* legacy paths block — retained styles kept harmless (no markup uses them) */
.hero-paths{ display: none; }
.hero-path{
  display: inline-flex;
  align-items: center;
  gap: 11px;
  text-align: left;
}
.hero-path-icon{
  width: 30px;
  height: 30px;
  border-radius: 9px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--wn-sage-tint);
  color: var(--wn-sage-deep);
  flex-shrink: 0;
}
.hero-path-text{
  display: inline-flex;
  flex-direction: column;
  gap: 1px;
  line-height: 1.25;
}
.hero-path-text b{
  font-family: var(--sans);
  font-size: 12px;
  font-weight: 500;
  color: var(--wn-text);
  letter-spacing: -.003em;
}
.hero-path-text span{
  font-family: var(--sans);
  font-size: 12px;
  font-weight: 300;
  color: var(--wn-muted);
  letter-spacing: -.003em;
}
.hero-path-divider{
  width: 1px;
  height: 28px;
  background: linear-gradient(180deg, transparent, rgba(31,28,24,.12), transparent);
}

/* dot indicator — subtle pagination for the rotation */
.hero-dots{
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 1.6rem;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255,255,255,.35);
  border: 1px solid rgba(31,28,24,.04);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  animation: heroFadeIn 1s ease .8s both;
}
.hero-dot{
  width: 18px;
  height: 4px;
  border-radius: 999px;
  background: rgba(31,28,24,.14);
  border: none;
  padding: 0;
  cursor: pointer;
  transition: background .35s ease, width .45s cubic-bezier(.22,.87,.36,1);
}
.hero-dot:hover{ background: rgba(31,28,24,.28); }
.hero-dot.on{
  width: 28px;
  background: var(--wn-sage);
}

/* ── floating therapist preview card — trust anchor ── */
.hero-card-stack{
  position: relative;
  width: 100%;
  max-width: 380px;
  justify-self: end;
  align-self: center;
  animation: heroFadeIn 1.1s cubic-bezier(.22,.87,.36,1) .35s both;
}
.hero-card{
  position: relative;
  width: 100%;
  padding: 22px 22px 20px;
  background: rgba(255,255,255,.78);
  border: 1px solid rgba(31,28,24,.06);
  border-radius: 22px;
  backdrop-filter: blur(14px) saturate(140%);
  -webkit-backdrop-filter: blur(14px) saturate(140%);
  box-shadow:
    0 1px 0 rgba(255,255,255,.7) inset,
    0 40px 80px -28px rgba(63,90,74,.18),
    0 14px 32px -12px rgba(31,28,24,.08);
  animation: heroCardFloat 9s ease-in-out 1s infinite;
  z-index: 2;
}
@keyframes heroCardFloat{
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-8px); }
}

.hero-card-top{
  display: flex;
  align-items: center;
  gap: 12px;
}
.hero-card-av{
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #D8C9B0 0%, #B59E7E 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--serif);
  font-style: italic;
  font-size: 16px;
  color: rgba(31,28,24,.55);
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(63,90,74,.12);
}
.hero-card-id{
  flex: 1;
  min-width: 0;
}
.hero-card-name{
  font-family: var(--display);
  font-weight: 400;
  font-size: 16.5px;
  color: var(--wn-text);
  letter-spacing: -.012em;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.hero-card-role{
  font-family: var(--sans);
  font-size: 11.5px;
  color: var(--wn-muted);
  font-weight: 400;
  margin-top: 2px;
  letter-spacing: -.003em;
}
.hero-card-verified{
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--wn-sage);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 0 0 3px rgba(90,120,100,.12);
}

.hero-card-meta{
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 14px;
  font-family: var(--sans);
  font-size: 11.5px;
  color: var(--wn-muted);
}
.hero-card-loc{
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--wn-text-2);
}
.hero-card-loc svg{ color: var(--wn-sage); }
.hero-card-sep{
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--wn-muted-2);
  opacity: .5;
}

.hero-card-tags{
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 14px;
}
.hero-card-tag{
  font-family: var(--sans);
  font-size: 10.5px;
  font-weight: 400;
  color: var(--wn-text-2);
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(90,120,100,.07);
  border: 1px solid rgba(90,120,100,.14);
  letter-spacing: .005em;
}

.hero-card-foot{
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid rgba(31,28,24,.06);
}
.hero-card-price{ display: flex; align-items: baseline; gap: 4px; }
.hero-card-price-n{
  font-family: var(--display);
  font-weight: 400;
  font-style: italic;
  font-size: 20px;
  color: var(--wn-sage-deep);
  letter-spacing: -.02em;
}
.hero-card-price-l{
  font-family: var(--sans);
  font-size: 11px;
  color: var(--wn-muted-2);
  font-weight: 300;
}
.hero-card-cta{
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-family: var(--sans);
  font-size: 12px;
  font-weight: 500;
  color: var(--wn-sage-deep);
  padding: 7px 13px;
  border-radius: 999px;
  background: rgba(90,120,100,.1);
  border: 1px solid rgba(90,120,100,.2);
  transition: background .25s ease, transform .25s ease;
}
.hero-card:hover .hero-card-cta{
  background: var(--wn-sage);
  border-color: var(--wn-sage);
  color: #fff;
  transform: translateX(2px);
}

/* floating chips — small trust signals around the card */
.hero-card-chip{
  position: absolute;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(255,255,255,.92);
  border: 1px solid rgba(31,28,24,.06);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  font-family: var(--sans);
  font-size: 11.5px;
  color: var(--wn-text-2);
  font-weight: 500;
  letter-spacing: -.003em;
  box-shadow:
    0 1px 0 rgba(255,255,255,.7) inset,
    0 12px 28px -10px rgba(31,28,24,.14);
  z-index: 3;
}
.hero-card-chip b{
  font-weight: 600;
  color: var(--wn-text);
}
.hero-card-chip span{
  color: var(--wn-muted);
  font-weight: 400;
}
.hero-card-chip-a{
  top: -14px;
  left: -22px;
  animation: heroChipFloat 7s ease-in-out 1.3s infinite;
}
.hero-card-chip-a .hero-card-chip-dot{
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #6FAE7F;
  box-shadow: 0 0 0 3px rgba(111,174,127,.18);
  animation: pulseDot 2.2s ease-in-out infinite;
}
.hero-card-chip-b{
  bottom: -10px;
  right: -16px;
  color: var(--wn-text-2);
  animation: heroChipFloat 8s ease-in-out 1.6s infinite;
}
.hero-card-chip-b svg{ color: #C99544; }
@keyframes heroChipFloat{
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-5px); }
}

@media (max-width: 960px){
  .hero-card-stack{
    justify-self: center;
    max-width: 340px;
  }
}

@media (max-width: 820px){
  .hero{ padding: 7rem 1.5rem 4rem; }
  .hero-actions{
    flex-direction: column;
    width: 100%;
    max-width: 320px;
    gap: 8px;
  }
  .hero-btn{ width: 100%; }
  .hero-card-chip-a{ left: -8px; }
  .hero-card-chip-b{ right: -4px; }
}

/* ═══════════════════════════════════════════════════════════════
   HERO v2 — product-led two-column (copy + rotating template)
═══════════════════════════════════════════════════════════════ */
.hero.hero-v2{
  display:block;
  min-height:auto;
  padding:calc(var(--nav) + 5rem) clamp(1.5rem,5vw,3rem) clamp(4rem,8vw,7rem);
}
.hero-v2-inner{
  position:relative; z-index:5;
  max-width:1180px; margin:0 auto;
  display:grid;
  grid-template-columns:minmax(0,1.02fr) minmax(0,1.12fr);
  gap:clamp(2.5rem,5vw,5rem);
  align-items:center;
}
@media(max-width:920px){
  .hero-v2-inner{ grid-template-columns:1fr; gap:3rem; }
}

/* LEFT */
.hero-v2-text{ display:flex; flex-direction:column; align-items:flex-start; text-align:left; }
.hero-v2-text .hero-stamp{ margin-bottom:1.4rem; }
.hero-v2-h{
  margin:0;
  font-family: var(--display);
  font-weight:400;
  font-size:clamp(38px,5vw,64px);
  line-height:1.04;
  letter-spacing:-.03em;
  color:var(--wn-text);
  font-optical-sizing:auto;
  font-variation-settings:'SOFT' 40;
  text-wrap:balance;
  animation:heroFadeIn 1s cubic-bezier(.22,.87,.36,1) .1s both;
}
.hero-v2-h em{
  font-style:italic;
  color:var(--wn-sage);
  font-variation-settings:'SOFT' 100,'WONK' 1;
}
.hero-v2-lede{
  margin:1.4rem 0 0;
  max-width:46ch;
  font-family:var(--sans);
  font-size:clamp(15px,1.15vw,16.5px);
  font-weight:300;
  line-height:1.7;
  color:var(--wn-muted);
  letter-spacing:-.003em;
  animation:heroFadeIn 1s cubic-bezier(.22,.87,.36,1) .25s both;
}
.hero-v2-actions{
  display:flex; align-items:center; gap:14px;
  margin-top:2.2rem; flex-wrap:wrap;
  animation:heroFadeIn 1s cubic-bezier(.22,.87,.36,1) .4s both;
}
.hero-v2-secondary{
  display:inline-flex; align-items:center; gap:7px;
  font-family:var(--sans); font-size:14px; font-weight:500;
  color:var(--wn-text-2); text-decoration:none;
  letter-spacing:-.005em; transition:color .25s ease, gap .25s ease;
}
.hero-v2-secondary:hover{ color:var(--wn-sage-deep); gap:11px; }
.hero-v2-trust{
  list-style:none; margin:2.2rem 0 0; padding:0;
  display:flex; flex-wrap:wrap; gap:10px 22px;
  animation:heroFadeIn 1s ease .6s both;
}
.hero-v2-trust li{
  display:inline-flex; align-items:center; gap:8px;
  font-family:var(--sans); font-size:12.5px; font-weight:400;
  color:var(--wn-muted); letter-spacing:-.003em;
}
.hero-v2-trust-i{
  color:var(--wn-sage-deep); font-size:12px;
}

/* RIGHT — browser-framed rotating template */
.hero-v2-visual{
  position:relative;
  animation:heroFadeIn 1.1s cubic-bezier(.22,.87,.36,1) .3s both;
}
.hero-v2-browser{
  border-radius:16px; overflow:hidden;
  border:1px solid rgba(31,28,24,.08);
  background:var(--wn-paper);
  box-shadow:
    0 1px 0 rgba(255,255,255,.8) inset,
    0 40px 90px -30px rgba(63,90,74,.28),
    0 16px 40px -20px rgba(31,28,24,.14);
  animation:heroCardFloat 9s ease-in-out 1s infinite;
}
.hero-v2-chrome{
  display:flex; align-items:center; gap:14px;
  padding:11px 16px;
  background:#F0ECE4;
  border-bottom:1px solid rgba(31,28,24,.07);
}
.hero-v2-chrome-dots{ display:flex; gap:6px; flex-shrink:0; }
.hero-v2-chrome-dots span{ width:10px; height:10px; border-radius:50%; }
.hero-v2-chrome-dots span:nth-child(1){ background:#FF5F57; }
.hero-v2-chrome-dots span:nth-child(2){ background:#FFBD2E; }
.hero-v2-chrome-dots span:nth-child(3){ background:#28C840; }
.hero-v2-chrome-url{
  flex:1; display:flex; align-items:center; justify-content:center; gap:6px;
  background:rgba(255,255,255,.7);
  border:1px solid rgba(31,28,24,.07);
  border-radius:6px; padding:5px 12px;
  font-family:var(--sans); font-size:11.5px; color:var(--wn-muted);
  max-width:320px; margin:0 auto;
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
}
.hero-v2-screen{
  position:relative; width:100%;
  aspect-ratio:16/10; overflow:hidden;
  background:var(--bg2);
}
.hero-v2-slide{
  position:absolute; inset:0;
  opacity:0; transition:opacity .8s cubic-bezier(.22,.87,.36,1);
  pointer-events:none;
}
.hero-v2-slide.on{ opacity:1; }
.hero-v2-slide-inner{
  position:absolute; top:0; left:0;
  width:1080px; height:675px;
  transform-origin:top left; pointer-events:none;
}
.hero-v2-caption{
  display:flex; align-items:center; justify-content:space-between;
  margin-top:1rem; padding:0 4px;
}
.hero-v2-caption-name{
  font-family: var(--display); font-style:italic;
  font-size:14px; color:var(--wn-muted);
}
.hero-v2-dots{ display:flex; align-items:center; gap:7px; }
.hero-v2-dot{
  width:7px; height:7px; border-radius:50%;
  background:rgba(31,28,24,.16); border:none; padding:0; cursor:pointer;
  transition:background .3s ease, width .4s cubic-bezier(.22,.87,.36,1);
}
.hero-v2-dot:hover{ background:rgba(31,28,24,.3); }
.hero-v2-dot.on{ width:20px; border-radius:4px; background:var(--wn-sage); }

@media(max-width:920px){
  .hero.hero-v2{ padding:calc(var(--nav) + 4rem) 1.5rem 4rem; }
  .hero-v2-text{ align-items:center; text-align:center; }
  .hero-v2-lede{ margin-left:auto; margin-right:auto; }
  .hero-v2-actions, .hero-v2-trust{ justify-content:center; }
}
@media(max-width:560px){
  .hero-v2-actions{ flex-direction:column; align-items:stretch; width:100%; max-width:320px; }
  .hero-v2-actions .hero-btn{ width:100%; }
  .hero-v2-secondary{ justify-content:center; }
}







/* ═══════════════════════════════════════════════════════════════
   HERO — TEMPLATE SHOWCASE carousel (framed browser windows)
   Each template is shown WHOLE inside a rounded browser frame on a
   soft background, with padding around it. No crop, no zoom.
═══════════════════════════════════════════════════════════════ */






/* ═══════════════════════════════════════════════════════════════
   HERO — full-bleed template carousel (Zomato / Airbnb style)
═══════════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════════
   HERO — editorial value-prop, calm negative space, one CTA
═══════════════════════════════════════════════════════════════ */
.hero-bn{
  position:relative;
  min-height:auto;
  display:flex;align-items:center;
  padding:calc(var(--nav) + var(--s-3)) var(--section-x) var(--s-3);
  background:
    radial-gradient(ellipse 60% 50% at 82% 18%, rgba(255,153,51,.08) 0%, transparent 62%),
    radial-gradient(ellipse 50% 55% at 8% 88%, rgba(255,153,51,.045) 0%, transparent 60%),
    var(--surf-1);
  overflow:hidden;
}
/* faint editorial baseline grid — barely there */
.hero-bn::before{
  content:'';position:absolute;inset:0;pointer-events:none;
  background-image:linear-gradient(90deg,var(--border2) 1px,transparent 1px);
  background-size:calc(100%/6) 100%;
  opacity:.45;
  -webkit-mask-image:linear-gradient(180deg,transparent,#000 22%,#000 78%,transparent);
  mask-image:linear-gradient(180deg,transparent,#000 22%,#000 78%,transparent);
}

/* ── single centered hero: rotating headline + quote + CTAs ── */
.hero-bn-inner{
  position:relative;z-index:2;
  width:100%;max-width:920px;margin:0 auto;
  display:flex;flex-direction:column;align-items:center;text-align:center;
}

.hero-bn-badge{
  display:inline-flex;align-items:center;gap:8px;
  font-family:var(--sans);font-size:13px;font-weight:500;letter-spacing:-.005em;
  color:var(--ink2);
  padding:7px 14px 7px 12px;border-radius:999px;
  background:rgba(255,153,51,.08);border:1px solid rgba(255,153,51,.22);
  margin-bottom:var(--s-4);
  animation:fadeUp .7s cubic-bezier(.22,.87,.36,1) .05s both;
}
.hero-bn-badge-dot{
  width:7px;height:7px;border-radius:50%;background:var(--wn-saffron,#FF9933);
  box-shadow:0 0 0 3px rgba(255,153,51,.18);
}

.hero-bn-h{
  font-family:var(--display);
  font-size:clamp(40px,6vw,80px);
  font-weight:800;line-height:1.04;letter-spacing:-.03em;
  color:var(--ink);max-width:16ch;margin:0 auto;
  min-height:1.04em;            /* hold height so rotation does not jump */
}
/* the saffron emphasis words inside the rotating headlines
   (target by attribute substring → no CSS escaping needed in this JS string) */
.hero-bn-h [class*="ff9933"]{ color:var(--wn-saffron,#FF9933); }

.hero-bn-sub{
  font-family:var(--sans);
  font-size:clamp(16px,1.3vw,19px);
  font-weight:400;line-height:1.6;
  color:var(--ink3);max-width:52ch;margin:var(--s-3) auto 0;
  min-height:1.6em;
}

/* one shared rotate-in animation for both the headline and the quote.
   The span is remounted each cycle (React key), replaying the animation. */
.hero-rotate{
  display:inline-block;
  animation:heroRotateIn .7s cubic-bezier(.22,.87,.36,1) both;
}
.hero-rotate-sub{ animation-delay:.08s; }
@keyframes heroRotateIn{
  from{ opacity:0; transform:translateY(14px); filter:blur(4px); }
  to  { opacity:1; transform:translateY(0);    filter:blur(0);   }
}

.hero-bn-ctas{
  display:flex;align-items:center;justify-content:center;gap:var(--s-2);flex-wrap:wrap;
  margin-top:var(--s-5);
  animation:fadeUp .8s cubic-bezier(.22,.87,.36,1) .28s both;
}

.hero-bn-trust{
  display:flex;align-items:center;justify-content:center;gap:var(--s-2);flex-wrap:wrap;
  margin-top:var(--s-5);
  font-family:var(--sans);font-size:13.5px;color:var(--ink3);
  animation:fadeUp .8s cubic-bezier(.22,.87,.36,1) .36s both;
}
.hero-bn-trust-item strong{ color:var(--ink);font-weight:700; }
.hero-bn-trust-sep{ width:4px;height:4px;border-radius:50%;background:var(--ink4); }
.hero-bn-cta-p{
  display:inline-flex;align-items:center;gap:10px;
  height:56px;padding:0 32px;border-radius:999px;
  font-family:var(--sans);font-size:15px;font-weight:500;
  color:#fff;background:var(--wn-saffron,#FF9933);border:none;cursor:pointer;
  letter-spacing:-.005em;text-decoration:none;
  box-shadow:0 1px 0 rgba(255,255,255,.25) inset,0 14px 34px -10px rgba(255,153,51,.55);
  transition:all .3s cubic-bezier(.22,.87,.36,1);
}
.hero-bn-cta-p svg{transition:transform .3s}
.hero-bn-cta-p:hover{background:var(--wn-saffron-deep,#E07A12);transform:translateY(-2px);box-shadow:0 18px 40px -10px rgba(19,20,15,.55)}
.hero-bn-cta-p:hover svg{transform:translateX(4px)}
.hero-bn-cta-g{
  display:inline-flex;align-items:center;gap:8px;
  font-family:var(--sans);font-size:14.5px;font-weight:400;
  color:var(--ink2);text-decoration:none;cursor:pointer;letter-spacing:-.005em;
  border-bottom:1px solid var(--border);padding-bottom:3px;
  transition:color .2s,border-color .2s;
}
.hero-bn-cta-g:hover{color:var(--ink);border-color:var(--wn-saffron,#FF9933)}
.hero-bn-cta-g svg{color:var(--wn-saffron,#FF9933)}

/* ── Hero responsive ── */
@media(max-width:760px){
  .hero-bn{ min-height:auto; padding-top:calc(var(--nav) + var(--s-5)); }
  .hero-bn-ctas{ gap:var(--s-2); }
  .hero-bn-cta-p{ width:100%; justify-content:center; }
  .hero-bn-trust{ font-size:12.5px; }
}
@media(prefers-reduced-motion:reduce){
  .hero-bn-badge,.hero-bn-h,.hero-bn-sub,.hero-bn-ctas,.hero-bn-trust,.hero-rotate{ animation:none; }
}






/* ═══════════════════════════════════════════════════════════════
   THERAPIST DIRECTORY — premium wellness redesign
═══════════════════════════════════════════════════════════════ */
.td-section{
  position: relative;
  /* horizontal padding matches .tshow-head / .texp-head so the
     "Meet our Practioners" heading lines up with the other sections */
  padding: var(--section-y) clamp(1.5rem, 5vw, 3rem);
  /* background owned by the section-ladder rule (var(--surf-2)) */
  overflow: hidden;
}
.td-bg-aura{
  position: absolute;
  top: -10%;
  left: 50%;
  transform: translateX(-50%);
  width: 1100px;
  height: 1100px;
  background: radial-gradient(circle, rgba(255,153,51,.08) 0%, rgba(255,153,51,.02) 30%, transparent 60%);
  filter: blur(20px);
  pointer-events: none;
  z-index: 0;
}
.td-wrap{
  position: relative;
  z-index: 2;
  max-width: 1180px;
  margin: 0 auto;
}

/* HEAD */
.td-head{
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
  gap: 3rem;
  align-items: end;
  margin-bottom: 3rem;
}
@media (max-width: 880px){
  .td-head{ grid-template-columns: 1fr; gap: 2rem; }
  .td-head-right{ justify-self: start !important; }
}
.td-eyebrow{
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--sans);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -.005em;
  color: var(--wn-saffron-deep,#E07A12);
  padding: 6px 13px;
  border-radius: 999px;
  background: rgba(255,153,51,.08);
  border: 1px solid rgba(255,153,51,.2);
  margin-bottom: var(--s-3);
}
.td-eyebrow-line{ display:none; }
.td-h{
  margin: 0;
  font-family: var(--display);
  font-weight: 800;
  font-size: clamp(30px, 4vw, 52px);
  line-height: 1.08;
  letter-spacing: -.03em;
  color: var(--ink);
}
.td-h em{
  font-style: normal;
  color: var(--wn-saffron,#FF9933);
  font-weight: 800;
}
.td-sub{
  margin: var(--s-3) 0 0;
  max-width: 52ch;
  font-family: var(--sans);
  font-size: 16px;
  font-weight: 400;
  line-height: 1.65;
  color: var(--ink3);
  letter-spacing: -.003em;
}

.td-head-right{
  display: inline-flex;
  align-items: center;
  gap: 28px;
  justify-self: end;
  padding: 18px 26px;
  border-radius: 18px;
  background: rgba(255,255,255,.55);
  border: 1px solid rgba(31,28,24,.06);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow:
    0 1px 0 rgba(255,255,255,.6) inset,
    0 12px 32px -14px rgba(120,86,30,.14);
}
.td-stat{ display: flex; flex-direction: column; gap: 2px; }
.td-stat-n{
  font-family: var(--display);
  font-weight: 400;
  font-size: 30px;
  line-height: 1;
  color: var(--wn-text);
  letter-spacing: -.02em;
}
.td-stat-n i{
  font-style: italic;
  color: var(--wn-saffron-deep);
  font-variation-settings: 'SOFT' 100, 'WONK' 1;
}
.td-stat-l{
  font-family: var(--sans);
  font-size: 11.5px;
  color: var(--wn-muted);
  letter-spacing: .005em;
  font-weight: 400;
}
.td-stat-sep{
  width: 1px;
  height: 36px;
  background: linear-gradient(180deg, transparent, rgba(31,28,24,.14), transparent);
}

/* FILTER BAR */
.td-filter-bar{
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 14px 12px 18px;
  border-radius: 999px;
  background: rgba(255,255,255,.6);
  border: 1px solid rgba(31,28,24,.06);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow:
    0 1px 0 rgba(255,255,255,.6) inset,
    0 14px 36px -16px rgba(120,86,30,.12);
  margin-bottom: 2.4rem;
}
@media (max-width: 760px){
  .td-filter-bar{ flex-direction: column; align-items: stretch; border-radius: 22px; padding: 14px; }
}
.td-search{
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 280px;
  flex-shrink: 0;
  padding-right: 16px;
  border-right: 1px solid rgba(31,28,24,.07);
  color: var(--wn-muted-2);
}
@media (max-width: 760px){
  .td-search{ border-right: none; border-bottom: 1px solid rgba(31,28,24,.07); padding-right: 0; padding-bottom: 12px; min-width: 0; }
}
.td-search input{
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-family: var(--sans);
  font-size: 14px;
  color: var(--wn-text);
  font-weight: 400;
  letter-spacing: -.003em;
  min-width: 0;
}
.td-search input::placeholder{ color: var(--wn-muted-2); font-weight: 300; }
.td-chips{
  display: flex;
  align-items: center;
  gap: 6px;
  overflow-x: auto;
  scrollbar-width: none;
  flex: 1;
  min-width: 0;
}
.td-chips::-webkit-scrollbar{ display: none; }
.td-chip{
  flex-shrink: 0;
  font-family: var(--sans);
  font-size: 12.5px;
  font-weight: 400;
  letter-spacing: -.003em;
  color: var(--wn-muted);
  padding: 7px 14px;
  border-radius: 999px;
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all .22s ease;
}
.td-chip:hover{ background: rgba(31,28,24,.04); color: var(--wn-text-2); }
.td-chip.on{
  background: var(--wn-sage);
  color: #fff;
  box-shadow: 0 4px 14px -2px rgba(120,86,30,.32);
}

/* GRID + CARD */
.td-grid{
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
@media (max-width: 980px){ .td-grid{ grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 620px){ .td-grid{ grid-template-columns: 1fr; } }

.td-card{
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 220px;
  padding: 22px;
  border-radius: 20px;
  background: rgba(255,255,255,.75);
  border: 1px solid rgba(31,28,24,.05);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  overflow: hidden;
  transition: transform .35s cubic-bezier(.22,.87,.36,1), box-shadow .35s ease, border-color .35s ease, background .35s ease;
  box-shadow:
    0 1px 0 rgba(255,255,255,.7) inset,
    0 6px 18px -10px rgba(31,28,24,.08);
}
.td-card:hover{
  transform: translateY(-4px);
  background: rgba(255,255,255,.95);
  border-color: rgba(255,153,51,.22);
  box-shadow:
    0 1px 0 rgba(255,255,255,.8) inset,
    0 28px 56px -22px rgba(120,86,30,.22),
    0 12px 28px -16px rgba(31,28,24,.12);
}
.td-card-glow{
  position: absolute;
  top: -40%;
  right: -20%;
  width: 220px;
  height: 220px;
  background: radial-gradient(circle, rgba(255,153,51,.16) 0%, transparent 60%);
  filter: blur(8px);
  pointer-events: none;
  opacity: 0;
  transition: opacity .4s ease;
}
.td-card:hover .td-card-glow{ opacity: 1; }

.td-card-top{ display: flex; align-items: flex-start; gap: 14px; }
.td-card-av{
  position: relative;
  width: 58px;
  height: 58px;
  border-radius: 16px;
  background: linear-gradient(135deg, #E0D4BC 0%, #C8B597 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  box-shadow: 0 4px 14px -4px rgba(120,86,30,.18);
}
.td-card-av img{ width: 100%; height: 100%; object-fit: cover; object-position: top center; display: block; }
.td-card-av span{
  font-family: var(--display);
  font-style: italic;
  font-size: 18px;
  color: rgba(31,28,24,.55);
  letter-spacing: -.01em;
}
.td-card-verified{
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--wn-sage);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #FBF9F4;
  box-shadow: 0 2px 6px rgba(120,86,30,.28);
}
.td-card-id{ flex: 1; min-width: 0; padding-top: 2px; }
.td-card-name{
  font-family: var(--display);
  font-weight: 400;
  font-size: 18px;
  color: var(--wn-text);
  line-height: 1.2;
  letter-spacing: -.018em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.td-card-role{
  font-family: var(--sans);
  font-size: 11.5px;
  color: var(--wn-muted);
  font-weight: 400;
  margin-top: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -.003em;
}
.td-card-loc{
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 7px;
  font-family: var(--sans);
  font-size: 11px;
  color: var(--wn-text-2);
  font-weight: 400;
}
.td-card-loc svg{ color: var(--wn-sage); }

.td-card-tags{
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 16px;
}
.td-card-tag{
  font-family: var(--sans);
  font-size: 10.5px;
  font-weight: 400;
  color: var(--wn-text-2);
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(255,153,51,.06);
  border: 1px solid rgba(255,153,51,.14);
  letter-spacing: .005em;
  transition: background .25s ease, border-color .25s ease;
}
.td-card:hover .td-card-tag{
  background: rgba(255,153,51,.1);
  border-color: rgba(255,153,51,.22);
}
.td-card-tag-muted{
  background: rgba(31,28,24,.04);
  border-color: rgba(31,28,24,.06);
  color: var(--wn-muted-2);
}

.td-card-foot{
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: auto;
  padding-top: 18px;
  border-top: 1px solid rgba(31,28,24,.06);
}
.td-card-meta{
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--sans);
  font-size: 11px;
  color: var(--wn-muted);
  font-weight: 400;
  letter-spacing: -.003em;
}
.td-card-meta-sep{
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--wn-muted-2);
  opacity: .5;
}
.td-card-fee{ display: inline-flex; align-items: baseline; gap: 3px; }
.td-card-fee-n{
  font-family: var(--display);
  font-style: italic;
  font-weight: 400;
  font-size: 18px;
  color: var(--wn-saffron-deep);
  letter-spacing: -.018em;
  font-variation-settings: 'SOFT' 100, 'WONK' 1;
}
.td-card-fee-l{
  font-family: var(--sans);
  font-size: 10.5px;
  color: var(--wn-muted-2);
  font-weight: 300;
}

.td-card-arrow{
  position: absolute;
  top: 22px;
  right: 22px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255,153,51,.08);
  color: var(--wn-sage-deep);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: translate(-4px, 4px) scale(.85);
  transition: opacity .3s ease, transform .3s cubic-bezier(.22,.87,.36,1), background .3s ease;
}
.td-card:hover .td-card-arrow{
  opacity: 1;
  transform: translate(0,0) scale(1);
  background: var(--wn-sage);
  color: #fff;
}

/* skeleton */
.td-card-skel{ pointer-events: none; }
.td-card-skel .sk{
  background: linear-gradient(90deg, rgba(31,28,24,.04) 25%, rgba(31,28,24,.08) 50%, rgba(31,28,24,.04) 75%);
  background-size: 200% 100%;
  animation: shi 1.6s infinite;
  border-radius: 6px;
}
.td-card-skel-top{ display: flex; gap: 14px; align-items: flex-start; }

/* empty */
.td-empty{
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
  padding: 5rem 2rem;
  border-radius: 22px;
  background: rgba(255,255,255,.5);
  border: 1px dashed rgba(31,28,24,.1);
}
.td-empty-icon{
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(255,153,51,.08);
  color: var(--wn-sage-deep);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}
.td-empty-t{
  font-family: var(--display);
  font-weight: 400;
  font-size: 22px;
  color: var(--wn-text);
  letter-spacing: -.018em;
}
.td-empty-s{
  font-family: var(--sans);
  font-size: 13.5px;
  color: var(--wn-muted);
  font-weight: 300;
  max-width: 42ch;
  line-height: 1.6;
}
.td-empty-reset{
  margin-top: 8px;
  font-family: var(--sans);
  font-size: 13px;
  font-weight: 500;
  color: var(--wn-sage-deep);
  padding: 9px 18px;
  border-radius: 999px;
  background: rgba(255,153,51,.1);
  border: 1px solid rgba(255,153,51,.22);
  cursor: pointer;
  transition: background .25s ease, color .25s ease;
}
.td-empty-reset:hover{ background: var(--wn-sage); color: #fff; }

/* foot */
.td-foot{
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1.2rem;
  margin-top: 2.6rem;
  padding: 1.4rem 1.8rem;
  border-radius: 18px;
  background: rgba(255,255,255,.55);
  border: 1px solid rgba(31,28,24,.05);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
.td-foot-text{
  font-family: var(--sans);
  font-size: 13.5px;
  color: var(--wn-muted);
  font-weight: 400;
  letter-spacing: -.003em;
}
.td-foot-text b{ color: var(--wn-text); font-weight: 500; }
.td-foot-cta{
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--sans);
  font-size: 13.5px;
  font-weight: 500;
  color: #fff;
  text-decoration: none;
  padding: 11px 22px;
  border-radius: 999px;
  background: var(--wn-sage);
  letter-spacing: -.005em;
  box-shadow:
    0 1px 0 rgba(255,255,255,.18) inset,
    0 8px 22px -6px rgba(120,86,30,.38);
  transition: background .25s ease, transform .25s ease, box-shadow .25s ease;
}
.td-foot-cta:hover{
  background: var(--wn-sage-deep);
  transform: translateY(-1px);
  box-shadow:
    0 1px 0 rgba(255,255,255,.18) inset,
    0 12px 28px -6px rgba(120,86,30,.5);
}
.td-foot-cta svg{ transition: transform .25s ease; }
.td-foot-cta:hover svg{ transform: translateX(3px); }

/* ═══════════════════════════════════════════════════════════════
   HOW IT WORKS
═══════════════════════════════════════════════════════════════ */
.how-section{
  position: relative;
  padding: clamp(5rem, 9vw, 8rem) clamp(1.5rem, 5vw, 3rem);
  background:
    radial-gradient(ellipse 60% 50% at 50% 0%, rgba(200,212,203,.18) 0%, transparent 60%),
    linear-gradient(180deg, #F6F3EE 0%, #F2EEE7 100%);
  overflow: hidden;
}
.how-wrap{
  position: relative;
  max-width: 1180px;
  margin: 0 auto;
}
.how-head{
  text-align: left;
  max-width: 640px;
  margin: 0 0 3.5rem;
}
.how-h{
  margin: 0;
  font-family: var(--serif);
  font-weight: 400;
  font-size: clamp(34px, 4.4vw, 56px);
  line-height: 1.08;
  letter-spacing: -.025em;
  color: white;
  // color: var(--wn-text);
  font-variation-settings: 'SOFT' 50;
}
.how-h em{
  font-style: italic;
  color: #ff9933 ;
  font-variation-settings: 'SOFT' 100, 'WONK' 1;
}
.how-sub{
  margin: 1.2rem 0 0;
  max-width: 52ch;
  font-family: var(--sans);
  font-size: 15.5px;
  font-weight: 300;
  line-height: 1.7;
  // color: var(--wn-muted);
  color: white;
  letter-spacing: -.003em;
}
.how-grid{
  position: relative;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  
  z-index: 2;
}
@media (max-width: 920px){ .how-grid{ grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 520px){ .how-grid{ grid-template-columns: 1fr; } }
.how-thread{
  position: absolute;
  left: 12.5%;
  right: 12.5%;
  top: calc(3.5rem + clamp(34px, 4.4vw, 56px) * 1.08 + 1.2rem + 1.7em + 6.5rem);
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,153,51,.3) 15%, rgba(255,153,51,.3) 85%, transparent);
  z-index: 1;
  pointer-events: none;
}
@media (max-width: 920px){ .how-thread{ display: none; } }

.how-step{
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 28px 22px 26px;
  border-radius: 22px;
  background: rgba(255,255,255,.6);
  border: 1px solid rgba(31,28,24,.05);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow:
    0 1px 0 rgba(255,255,255,.7) inset,
    0 10px 28px -16px rgba(63,90,74,.12);
  transition: transform .35s cubic-bezier(.22,.87,.36,1), box-shadow .35s ease, border-color .35s ease;
}
.how-step:hover{
  transform: translateY(-4px);
  border-color: rgba(90,120,100,.18);
  box-shadow:
    0 1px 0 rgba(255,255,255,.8) inset,
    0 22px 44px -18px rgba(63,90,74,.2);
}
.how-step-num{
  position: relative;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--wn-saffron-tint);
  border: 1px solid rgba(255,153,51,.28);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.4rem;
  box-shadow: 0 0 0 6px rgba(246,243,238,.9);
}
.how-step-num-i{
  font-family: var(--display);
  font-style: italic;
  font-weight: 400;
  font-size: 22px;
  color: var(--wn-saffron-deep);
  letter-spacing: -.018em;
  font-variation-settings: 'SOFT' 100, 'WONK' 1;
}
.how-step-t{
  margin: 0 0 .6rem;
  font-family: var(--display);
  font-weight: 400;
  font-size: 18px;
  color: var(--wn-text);
  letter-spacing: -.015em;
  line-height: 1.25;
}
.how-step-d{
  margin: 0;
  font-family: var(--sans);
  font-size: 13.5px;
  font-weight: 300;
  line-height: 1.6;
  color: var(--wn-muted);
  max-width: 28ch;
  letter-spacing: -.003em;
}

/* ═══════════════════════════════════════════════════════════════
   PRICING
═══════════════════════════════════════════════════════════════ */
.price-section{
  position: relative;
  padding: var(--section-y) var(--section-x);
  /* background owned by the section-ladder rule (var(--surf-2)) */
  overflow: hidden;
}
.price-bg-aura{
  position: absolute;
  top: -20%;
  left: 50%;
  transform: translateX(-50%);
  width: 900px;
  height: 900px;
  background: radial-gradient(circle, rgba(90,120,100,.06) 0%, transparent 60%);
  filter: blur(20px);
  pointer-events: none;
  z-index: 0;
}
.price-wrap{
  position: relative;
  z-index: 2;
  max-width: 1180px;
  margin: 0 auto;
}
.price-head{
  text-align: center;
  max-width: 680px;
  margin: 0 auto var(--s-6);
}
.price-h{
  margin: 0;
  font-family: var(--display);
  font-weight: 800;
  font-size: clamp(30px, 4vw, 52px);
  line-height: 1.08;
  letter-spacing: -.03em;
  color: var(--ink);
}
.price-h em{
  font-style: normal;
  color: var(--wn-saffron,#FF9933);
  font-weight: 800;
}
.price-sub{
  margin: var(--s-3) auto 0;
  max-width: 52ch;
  font-family: var(--sans);
  font-size: 16px;
  font-weight: 400;
  line-height: 1.65;
  color: var(--ink3);
  letter-spacing: -.003em;
}

.price-grid{
  /* Auto-adjusts to the number of plans (2 or 3): each card keeps a fixed
     width and the whole set is centred, so it never left-aligns or stretches. */
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(0, 420px);
  justify-content: center;
  gap: 48px;
  align-items: stretch;
  max-width: 100%;
  margin: 0 auto;
}
@media (max-width: 880px){
  .price-grid{
    grid-auto-flow: row;
    grid-auto-columns: auto;
    grid-template-columns: minmax(0, 460px);
    max-width: 460px;
    margin: 0 auto;
  }
}

.price-card{
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 32px 28px 28px;
  border-radius: 22px;
  background: rgba(255,255,255,.7);
  border: 1px solid rgba(31,28,24,.06);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow:
    0 1px 0 rgba(255,255,255,.7) inset,
    0 12px 32px -16px rgba(63,90,74,.14);
  transition: transform .35s cubic-bezier(.22,.87,.36,1), box-shadow .35s ease, border-color .35s ease;
  overflow: hidden;
}
.price-card:hover{
  transform: translateY(-4px);
  border-color: rgba(90,120,100,.2);
  box-shadow:
    0 1px 0 rgba(255,255,255,.8) inset,
    0 28px 56px -22px rgba(63,90,74,.24);
}
.price-card-hi{
  background: linear-gradient(180deg, rgba(255,255,255,.92) 0%, rgba(243,247,244,.85) 100%);
  border-color: rgba(90,120,100,.22);
  box-shadow:
    0 1px 0 rgba(255,255,255,.8) inset,
    0 20px 48px -18px rgba(63,90,74,.22);
}
.price-card-accent{
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent 10%, var(--wn-sage) 30%, var(--wn-sage) 70%, transparent 90%);
}
.price-card-badge{
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-family: var(--sans);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: var(--wn-sage-deep);
  background: rgba(90,120,100,.08);
  border: 1px solid rgba(90,120,100,.2);
  padding: 5px 12px;
  border-radius: 999px;
  align-self: flex-start;
  margin-bottom: 1.4rem;
}
.price-card-badge-dot{
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--wn-sage);
  box-shadow: 0 0 0 3px rgba(90,120,100,.18);
}
.price-card-name{
  font-family: var(--sans);
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--wn-muted);
  margin-bottom: .9rem;
}
.price-card-price{
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 1.8rem;
  padding-bottom: 1.8rem;
  border-bottom: 1px solid rgba(31,28,24,.06);
}
.price-card-price-n{
  font-family: var(--display);
  font-weight: 400;
  font-size: 46px;
  color: var(--wn-text);
  letter-spacing: -.028em;
  line-height: 1;
  font-variation-settings: 'SOFT' 50;
}
.price-card-hi .price-card-price-n{ color: var(--wn-sage-deep); }
.price-card-price-p{
  font-family: var(--sans);
  font-size: 13px;
  font-weight: 300;
  color: var(--wn-muted);
  letter-spacing: -.003em;
}
.price-card-feats{
  list-style: none;
  margin: 0 0 2rem;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: .85rem;
  flex: 1;
}
.price-card-feats li{
  display: flex;
  align-items: flex-start;
  gap: 11px;
  font-family: var(--sans);
  font-size: 13.5px;
  font-weight: 400;
  line-height: 1.55;
  color: var(--wn-text-2);
  letter-spacing: -.003em;
}
.price-card-check{
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(90,120,100,.12);
  color: var(--wn-sage-deep);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
}
.price-card-cta{
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: var(--sans);
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: -.005em;
  text-decoration: none;
  padding: 13px 22px;
  border-radius: 999px;
  transition: all .25s ease;
}
.price-card-cta-p{
  background: var(--wn-sage);
  color: #fff;
  box-shadow:
    0 1px 0 rgba(255,255,255,.18) inset,
    0 8px 22px -6px rgba(63,90,74,.38);
}
.price-card-cta-p:hover{
  background: var(--wn-sage-deep);
  transform: translateY(-1px);
}
.price-card-cta-g{
  background: transparent;
  color: var(--wn-text-2);
  border: 1px solid rgba(31,28,24,.1);
}
.price-card-cta-g:hover{
  background: rgba(255,255,255,.6);
  border-color: rgba(90,120,100,.3);
  color: var(--wn-sage-deep);
}
.price-card-cta svg{ transition: transform .25s ease; }
.price-card-cta:hover svg{ transform: translateX(3px); }

.price-foot{
  margin-top: 2.4rem;
  text-align: center;
  font-family: var(--sans);
  font-size: 12.5px;
  color: var(--wn-muted-2);
  letter-spacing: .01em;
}

/* ═══════════════════════════════════════════════════════════════
   FAQ — calm accordion
═══════════════════════════════════════════════════════════════ */
.faq-section{
  position: relative;
  /* no padding on the section: the curtain must span the COMPLETE width
     edge-to-edge. Horizontal gutters live on .faq-wrap (the content column);
     vertical padding lives on .faq-curtain. */
  padding: 0;
  background:
    radial-gradient(ellipse 50% 50% at 50% 100%, rgba(200,212,203,.16) 0%, transparent 60%),
    linear-gradient(180deg, #F6F3EE 0%, #F2EEE7 100%);
  /* NOTE: must stay visible -- the .faq-wordmark-reveal child is revealed on
     scroll and any clip/hidden here would hide it. Containment for the FAQ
     cards is handled per-card (.faq-item has its own overflow hidden). */
  overflow: visible;
}
.faq-wrap{
  max-width: 1180px;
  margin: 0 auto;
  /* horizontal gutters (moved off .faq-section so the curtain can be
     full-bleed); box-sizing keeps the 1180px cap correct */
  padding: 0 clamp(1.5rem, 5vw, 3rem);
}
.faq-head{
  max-width: 640px;
  margin: 0 0 3.5rem;
  text-align: left;
}
.faq-h{
  margin: 0;
  font-family: var(--display);
  font-weight: 800;
  font-size: clamp(30px, 4vw, 50px);
  line-height: 1.08;
  letter-spacing: -.03em;
  color: var(--ink);
}
.faq-h em{
  font-style: normal;
  color: var(--wn-saffron,#FF9933);
  font-weight: 800;
}
.faq-sub{
  margin: var(--s-3) 0 0;
  max-width: 44ch;
  font-family: var(--sans);
  font-size: 16px;
  font-weight: 400;
  line-height: 1.65;
  color: var(--ink3);
  letter-spacing: -.003em;
}
.faq-sub a{
  color: var(--wn-sage-deep);
  font-weight: 500;
  text-decoration: none;
  border-bottom: 1px solid rgba(90,120,100,.3);
  transition: border-color .25s ease;
}
.faq-sub a:hover{ border-bottom-color: var(--wn-sage); }

.faq-list{ display: flex; flex-direction: column; gap: 10px; width: 100%; }

.faq-item{
  position: relative;
  border-radius: var(--r-md);
  background: #fff;
  border: 1px solid var(--border2);
  transition: border-color .3s ease, box-shadow .3s ease;
  overflow: hidden;
}
.faq-item:hover{ border-color: var(--border); box-shadow: var(--shadow-sm); }
.faq-item.open{
  background: #fff;
  border-color: rgba(255,153,51,.3);
  box-shadow: var(--shadow-md);
}

.faq-q{
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.2rem;
  padding: 22px 24px;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  font-family: var(--display);
  font-weight: 700;
  font-size: 16.5px;
  letter-spacing: -.015em;
  line-height: 1.35;
  color: var(--ink);
  transition: color .25s ease;
}
.faq-q:hover{ color: var(--wn-saffron-deep,#E07A12); }
.faq-q-text{ flex: 1; }
.faq-q-icon{
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(255,153,51,.1);
  color: var(--wn-saffron-deep,#E07A12);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform .35s cubic-bezier(.22,.87,.36,1), background .25s ease, color .25s ease;
}
.faq-item.open .faq-q-icon{
  transform: rotate(180deg);
  background: var(--wn-saffron,#FF9933);
  color: #fff;
}

.faq-a-wrap{
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows .35s cubic-bezier(.22,.87,.36,1);
}
.faq-item.open .faq-a-wrap{ grid-template-rows: 1fr; }
.faq-a-wrap > .faq-a{
  overflow: hidden;
  font-family: var(--sans);
  font-size: 14.5px;
  font-weight: 300;
  line-height: 1.75;
  color: var(--wn-muted);
  letter-spacing: -.003em;
}
.faq-item.open .faq-a-wrap > .faq-a{
  padding: 0 24px 22px;
}

/* ═══════════════════════════════════════════════════════
   CINEMATIC CURTAIN REVEAL  (FAQ slides off a pinned wordmark)

   Effect: the HangingWordmark does NOT move. It is pinned to the bottom of
   the viewport (position:sticky) and sits BEHIND the FAQ content. The FAQ
   content is an opaque "curtain" with a higher z-index that scrolls up and
   off, uncovering the stationary wordmark like a curtain being drawn away.
   Scroll back down and the curtain slides over it again, hiding it fully.

   How the layering works:
   - .faq-section is the positioning context and must be overflow visible
     so the sticky child can pin (handled in the .faq-section rule below).
   - .faq-curtain  : the FAQ content. Opaque background + z-index:2. It owns
     normal document height, so it is what scrolls past.
   - .faq-wordmark-reveal : position:sticky; bottom:0; z-index:1. It pins at
     the bottom of the viewport while the curtain scrolls off above it.

   No JS, no opacity/transform reveal — the uncovering is purely the curtain
   scrolling away, so the wordmark itself never moves and there is no flash.
═══════════════════════════════════════════════════════ */

/* The FAQ content is the opaque curtain that covers the fixed wordmark.
   Flat opaque fill, no rounded corners, no shadow, no top gradient -> no
   sharp shapes / hard edges bleeding through. */
.faq-curtain{
  position: relative;
  z-index: 2;
  /* full-bleed opaque layer: spans the COMPLETE width so nothing of the
     wordmark bleeds through the side gutters of the centred content column. */
  width: 100%;
  background: var(--surf-1); /* matches the FAQ section -> seamless, no shapes */
  /* carry the section's own vertical padding here so the opaque area covers
     edge-to-edge top and bottom */
  padding-top: clamp(5rem, 9vw, 8rem);
  /* room at the bottom so the curtain has travel to clear the 40vh wordmark */
  padding-bottom: 42vh;
}
/* zero-height marker at the very bottom of the curtain; JS measures it to know
   when the wordmark strip is uncovered. Takes no layout space. */
.faq-curtain-end{
  position: absolute;
  bottom: 0;
  left: 0;
  width: 1px;
  height: 1px;
  pointer-events: none;
}

/* The wordmark layer: position:fixed so it CANNOT move, ever. It is pinned to
   the bottom of the viewport, 1/4 of the viewport tall, sitting behind the
   curtain. It is only shown while the FAQ section is in view (the
   faq-pinned class is toggled on the section by a small IntersectionObserver).
   When hidden it is fully transparent and non-interactive. */
.faq-wordmark-reveal{
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 40vh;            /* strip height, at the bottom */
  z-index: 0;             /* behind the curtain (z-index:2) */
  background: var(--surf-1); /* solid base -> no flash, matches FAQ surface */
  pointer-events: none;
  /* HARD-CUT hide: no transition. A fade would make the wordmark appear to
     "move"/peek in and out as you cross the threshold while scrolling up.
     visibility:hidden guarantees it is genuinely gone, not a faint layer. */
  opacity: 0;
  visibility: hidden;
}
/* shown ONLY at the very end of the FAQ, when the curtain has fully cleared
   the strip (class set by the strict check in FaqRevealEffect). Hard cut. */
.faq-section.faq-pinned .faq-wordmark-reveal{
  opacity: 1;
  visibility: visible;
}
/* the inner hangmark fills the 40vh pinned strip exactly, centred, no scroll */
.faq-wordmark-reveal .hangmark{
  /* the wordmark content keys off --reveal for its fade-in. In this pinned
     strip the strip itself is shown/hidden via opacity, so the content must
     always be fully drawn -> force --reveal to 1. */
  --reveal: 1;
  height: 40vh;
  min-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  overflow: hidden;
}
/* Compact the decorations away so just the swaying wordmark fits in 40vh:
   the eyebrow, rod, threads, rule and the big concentric ring are hidden. */
.faq-wordmark-reveal .hangmark::before,
.faq-wordmark-reveal .hangmark-eyebrow,
.faq-wordmark-reveal .hangmark-rod,
.faq-wordmark-reveal .hangmark-thread,
.faq-wordmark-reveal .hangmark-rule{
  display: none;
}
.faq-wordmark-reveal .hangmark-hang{
  padding-top: 0;
}

/* ═══════════════════════════════════════════════════════════════
   REVEAL
═══════════════════════════════════════════════════════════════ */
.rv{opacity:0;transform:translateY(16px);transition:opacity .7s cubic-bezier(.22,.87,.36,1),transform .7s cubic-bezier(.22,.87,.36,1)}
.rv.on{opacity:1;transform:none}

/* ═══════════════════════════════════════════════════════════════
   PREMIUM SCROLL ANIMATIONS — additive layer
═══════════════════════════════════════════════════════════════ */

/* Ambient living background — replaces the flat --bg feel
   Two slow drifting radial gradients + a faint warm wash. Sits behind everything. */
.pg{position:relative;isolation:isolate}
.pg::before{
  content:'';position:fixed;inset:-10vh -10vw;z-index:-2;pointer-events:none;
  background:
    radial-gradient(38vw 38vw at 18% 22%, rgba(184,134,44,.085), transparent 62%),
    radial-gradient(46vw 46vw at 82% 78%, rgba(120,140,118,.075), transparent 65%),
    radial-gradient(60vw 50vw at 50% 110%, rgba(217,176,98,.055), transparent 70%);
  animation: pgDrift 32s ease-in-out infinite alternate;
  will-change:transform;
}
.pg::after{
  content:'';position:fixed;inset:0;z-index:-1;pointer-events:none;
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .07  0 0 0 0 .07  0 0 0 0 .06  0 0 0 .55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
  opacity:.035;mix-blend-mode:multiply;
}
@keyframes pgDrift{
  0%   {transform:translate3d(0,0,0) scale(1)}
  50%  {transform:translate3d(-2.5%, 1.8%, 0) scale(1.04)}
  100% {transform:translate3d(2%, -1.5%, 0) scale(1.02)}
}

/* Subtle parallax — driven by --sy (set via JS, 0..1 across viewport).
   Hero atmosphere drifts upward at different rates → depth. */
.hero-aura{transform:translate3d(0, calc(var(--sy, 0) * -40px), 0); will-change:transform}
.hero-glow{transform:translate3d(0, calc(var(--sy, 0) * -70px), 0); will-change:transform}
.hero-orb-a{transform:translate3d(0, calc(var(--sy, 0) * -110px), 0) !important; will-change:transform}
.hero-orb-b{transform:translate3d(0, calc(var(--sy, 0) * -160px), 0) !important; will-change:transform}

/* Section headers — gentle on-reveal lift instead of sticky (sticky was overlapping content) */
.td-head, .tmpl-header, .how-head, .price-head, .faq-head{
  transition: transform .9s cubic-bezier(.22,.87,.36,1), opacity .9s cubic-bezier(.22,.87,.36,1);
}
.sec-rise .td-head, .sec-rise .tmpl-header, .sec-rise .how-head, .sec-rise .price-head, .sec-rise .faq-head{
  transform: translateY(18px); opacity: .6;
}
.sec-rise.on .td-head, .sec-rise.on .tmpl-header, .sec-rise.on .how-head, .sec-rise.on .price-head, .sec-rise.on .faq-head{
  transform: none; opacity: 1;
}

/* Staggered child reveal inside revealed grids — adds cinematic cascade
   without changing markup. Applies to existing grids the page already uses. */
.td-grid.rv > *, .tgrid.rv > *, .how-grid.rv > *, .price-grid.rv > *, .faq-list.rv > *{
  opacity:0;transform:translateY(22px);
  transition:opacity .75s cubic-bezier(.22,.87,.36,1), transform .75s cubic-bezier(.22,.87,.36,1);
}
.td-grid.rv.on > *, .tgrid.rv.on > *, .how-grid.rv.on > *, .price-grid.rv.on > *, .faq-list.rv.on > *{
  opacity:1;transform:none;
}
.td-grid.rv.on > *:nth-child(1), .tgrid.rv.on > *:nth-child(1), .how-grid.rv.on > *:nth-child(1), .price-grid.rv.on > *:nth-child(1), .faq-list.rv.on > *:nth-child(1){transition-delay:.04s}
.td-grid.rv.on > *:nth-child(2), .tgrid.rv.on > *:nth-child(2), .how-grid.rv.on > *:nth-child(2), .price-grid.rv.on > *:nth-child(2), .faq-list.rv.on > *:nth-child(2){transition-delay:.10s}
.td-grid.rv.on > *:nth-child(3), .tgrid.rv.on > *:nth-child(3), .how-grid.rv.on > *:nth-child(3), .price-grid.rv.on > *:nth-child(3), .faq-list.rv.on > *:nth-child(3){transition-delay:.16s}
.td-grid.rv.on > *:nth-child(4), .tgrid.rv.on > *:nth-child(4), .how-grid.rv.on > *:nth-child(4), .price-grid.rv.on > *:nth-child(4), .faq-list.rv.on > *:nth-child(4){transition-delay:.22s}
.td-grid.rv.on > *:nth-child(5), .tgrid.rv.on > *:nth-child(5), .how-grid.rv.on > *:nth-child(5), .faq-list.rv.on > *:nth-child(5){transition-delay:.28s}
.td-grid.rv.on > *:nth-child(6), .tgrid.rv.on > *:nth-child(6), .how-grid.rv.on > *:nth-child(6), .faq-list.rv.on > *:nth-child(6){transition-delay:.34s}
.td-grid.rv.on > *:nth-child(n+7), .faq-list.rv.on > *:nth-child(n+7){transition-delay:.40s}

/* Depth-on-hover for cards — gentle lift, no shadow blow-out */
.td-card, .price-card, .how-card, .tcard{
  transition: transform .55s cubic-bezier(.22,.87,.36,1), box-shadow .55s cubic-bezier(.22,.87,.36,1), border-color .35s ease;
  will-change: transform;
}
.td-card:hover, .price-card:hover, .how-card:hover, .tcard:hover{
  transform: translateY(-4px);
  box-shadow: 0 18px 40px -22px rgba(19,20,15,.18), 0 4px 12px -6px rgba(19,20,15,.08);
}

/* Section enter — slight scale-up + fade for the whole section the first time it appears.
   Uses the same .rv mechanism, but stronger on the section wrappers we tag. */
.sec-rise{opacity:0;transform:translateY(40px) scale(.985);transition:opacity 1s cubic-bezier(.22,.87,.36,1), transform 1s cubic-bezier(.22,.87,.36,1)}
.sec-rise.on{opacity:1;transform:none}

/* ─── LAYERED / OVERLAPPING SECTIONS ───────────────────────────
   Each section rises over the previous one with rounded top corners and a
   soft shadow above — the Apple/Stripe/Linear "stacked layers" feel.
   Pure CSS: negative top margin + own background + radius + z-index ladder. */

   
/* ── SECTION SEPARATION: soft rounded-top "stacked layers" ──────────
   Each content section lifts slightly over the previous one with a rounded
   top edge + a soft shadow above. Combined with the alternating surf-1/surf-2
   tones, every boundary clearly reads as "a new section is arriving" on
   scroll — the premium Apple/Stripe/Linear layered feel, all in the light
   palette. The negative margin is small so it overlaps, not collides. */
.td-section, .tmpl-section, .how-section, .price-section, .faq-section, .texp, .tshow{
  position:relative;
  margin-top: -28px;                                  /* gentle overlap */
  // border-top-left-radius: 28px;
  // border-top-right-radius: 28px;
  box-shadow: 0 -18px 40px -26px rgba(19,20,15,.18);  /* soft lift above */
}
/* first content section after the hero sits flush (no lift onto the hero) */
.hero-bn + .td-section,
.hero-bn + .tshow{
  margin-top: 0;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  box-shadow: none;
}

/* PERF: skip rendering + animating off-screen sections entirely. The browser
   does not paint, lay out, or run infinite animations inside a section while
   it is far outside the viewport -> big scroll-FPS win, zero visual change.
   Applied ONLY to plain-flow sections (NOT the GSAP-pinned .tshow / .tmpl
   nor the .faq-section which hosts the fixed wordmark) so containment never
   fights those positioned effects. contain-intrinsic-size reserves height so
   the scrollbar does not jump as sections virtualise in/out. */
.td-section, .how-section, .price-section{
  content-visibility: auto;
  contain-intrinsic-size: auto 900px;
}
/* Each section gets its own surface color so the rise is visible against neighbours.
   Colors stay inside the existing palette (--bg / --bg2 / --bg3 / --paper / --ink). */
/* ─── PIN-AT-END OVERLAP ──────────────────────────────────────
   Each section scrolls naturally and is fully visible end-to-end.
   Once the user scrolls past its content, its LAST viewport-worth
   pins (position: sticky bottom) while the next section slides up
   and overlaps it. Pure CSS, no height assumptions.

   Trick: sticky with top calculated so the section's bottom
   aligns with the viewport bottom — i.e. its tail pins. We get
   this by making the section itself sticky with top:0 but
   giving it min-height of just 100vh — the previous section
   naturally pins at top, next section slides up over it.

   For variable-height content, we use sticky on the section root
   with min-height:auto + the negative-margin ladder for the
   overlap visual. Sticky engages only for the last 100vh. */

/* Theme-matching surface palette — warm wellness/editorial tones that complement the gold accent.
   Each section steps in tone so the layered overlap reads clearly. */
.hero         { position:relative; z-index:1; }
.hero-bn      { position:relative; z-index:1; }
/* the banner hero is self-contained — the first content section sits flush
   below it (no negative-margin overlap onto the caption bar) */
.hero-bn + .td-section{ margin-top:0; }
/* ── Unified surface rhythm: alternate surf-1 / surf-2 down the page so each
   boundary is a clear, consistent tonal step. All light (one warm family). */
.td-section   { background: var(--surf-2); z-index:2; opacity:1; transform:none; } /* therapists */
.tmpl-section { background: var(--surf-1); z-index:3; opacity:1; transform:none; } /* templates  */
.how-section  { background: var(--surf-1); z-index:4; opacity:1; transform:none; } /* how it works */
.price-section{ background: var(--surf-2); z-index:5; opacity:1; transform:none; } /* pricing    */
.faq-section{
  background: var(--surf-1);
  z-index: 6;
  position: relative;
  overflow: visible;
}

/* How-it-works is now LIGHT (was a dark inversion). It uses the default light
   tokens like every other section — the dark override is removed so the
   timeline + heading read correctly on the warm surface. */
.how-section .how-card{ background: rgba(19,20,15,.025); border-color: var(--border); }
.how-section .how-card:hover{ background: rgba(19,20,15,.05); border-color: rgba(19,20,15,.12); }

/* Match dark "final" footer to the ladder so it caps the stack cleanly */
.final{
  position:relative;z-index:7;
  margin-top:0;
  border-top-left-radius:36px;border-top-right-radius:36px;
  box-shadow:0 -22px 50px -24px rgba(19,20,15,.35);
}

/* Mobile: sections stay flush (no overlap), rounded tops kept for the soft step */
@media (max-width: 720px){
  .td-section, .tmpl-section, .how-section, .price-section, .faq-section, .final{
    margin-top:0;
    // border-top-left-radius:36px;
    // border-top-right-radius:36px;
  }
}

/* ─── HOW IT WORKS — v2 redesign (alternating SaaS rows) ─────── */




/* ─── HOW IT WORKS — v2 redesign (alternating SaaS rows) ─────── */
.how-v2 .how-wrap{ max-width: var(--max); margin: 0 auto; padding: clamp(4rem, 8vw, 7rem) var(--px); }
.how-v2 .how-head{ max-width: 720px; margin: 0 0 clamp(3rem, 6vw, 5rem); }
.how-v2 .how-h{
  font-family: var(--display);
  font-size: clamp(2.4rem, 5vw, 4.2rem);
  line-height: 1.02;
  letter-spacing: -.028em;
  font-weight: 350;
  font-optical-sizing: auto;
  font-variation-settings: "opsz" 120, "SOFT" 30;
  color: inherit;
  margin: 0 0 1.2rem;
}
.how-v2 .how-h em{ font-style: italic; font-weight: 300; color: var(--gold2); font-variation-settings: "opsz" 144, "SOFT" 50; }
.how-v2 .how-sub{
  font-family: var(--sans);
  font-size: clamp(1rem, 1.25vw, 1.125rem);
  line-height: 1.55;
  color: var(--ink3);
  /* FIX 4: removed the max-width: 56ch cap that was starving the column on wide screens */
  margin: 0;
}

/* ═══════════════════════════════════════════════════════════════
   HOW IT WORKS — connected ZIG-ZAG timeline (premium redesign)
   Centred gold spine that "draws" on scroll (--fill 0→1, set by JS).
   Steps alternate left / right of the spine; nodes ignite and step
   cards rise + slide in from their side as the fill passes them.
   Lives on the dark .how-section surface (light --ink text, gold accent).
═══════════════════════════════════════════════════════════════ */
.how-v2 .how-tl{
  --gap: clamp(2.4rem, 5vw, 4rem);   /* vertical gap between steps */
  --node: clamp(50px, 5vw, 64px);    /* node diameter */
  /* brand theme accent = saffron (the page's primary colour, 73 uses) */
  --tl-accent: #FF9933;
  --tl-accent-deep: #E07A12;
  position: relative;
  max-width: 1000px;
  margin: clamp(1.5rem, 4vw, 3rem) auto 0;
}

/* the spine: a faint centred rail with a saffron fill that grows with scroll */
.how-v2 .how-tl-spine{
  position: absolute;
  top: calc(var(--node) / 2);
  bottom: calc(var(--node) / 2);
  left: 50%;
  width: 2px;
  transform: translateX(-50%);
  background: rgba(19,20,15,.10);   /* faint dark rail on the light surface */
  border-radius: 2px;
  overflow: hidden;
}
.how-v2 .how-tl-spine-fill{
  position: absolute;
  inset: 0 0 auto 0;
  height: calc(var(--fill) * 100%);
  background: linear-gradient(180deg, var(--tl-accent) 0%, var(--tl-accent-deep) 100%);
  box-shadow: 0 0 16px rgba(255,153,51,.55);
  transition: height .15s linear;
}

.how-v2 .how-tl-list{
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--gap);
}

/* each step is a 3-column grid: [ left zone | centred node | right zone ] */
.how-v2 .how-tl-step{
  position: relative;
  display: grid;
  grid-template-columns: 1fr var(--node) 1fr;
  align-items: center;
  column-gap: clamp(1.2rem, 2.6vw, 2.4rem);
  /* lit threshold from the scroll fill (0 → 1 as the line reaches this step) */
  --lit: clamp(0, (var(--fill) - var(--at)) * 1000, 1);
  --slide: calc(34px * (1 - var(--lit)));   /* slide-in distance from the side */
}

/* the node sits in the centre column, on the spine */
.how-v2 .how-tl-node{
  grid-column: 2;
  position: relative;
  z-index: 1;
  width: var(--node);
  height: var(--node);
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #FFFFFF;                              /* white node on light surface */
  border: 1px solid rgba(19,20,15,.10);
  color: var(--ink3);
  transition: border-color .5s ease, color .5s ease, box-shadow .5s ease;
  border-color: color-mix(in srgb, var(--tl-accent) calc(var(--lit, 0) * 80%), rgba(19,20,15,.10));
  color: color-mix(in srgb, var(--tl-accent) calc(var(--lit, 0) * 100%), var(--ink3));
  box-shadow:
    0 6px 16px -8px rgba(19,20,15,.18),
    0 0 calc(var(--lit, 0) * 22px) rgba(255,153,51,calc(var(--lit,0) * .35));
}
.how-v2 .how-tl-node-icon{ width: 46%; height: 46%; display: block; }
.how-v2 .how-tl-node-icon svg{ width: 100%; height: 100%; }

/* the body card — warm tinted surface so the layout never reads empty */
.how-v2 .how-tl-body{
  min-width: 0;
  padding: clamp(1.1rem, 2vw, 1.6rem) clamp(1.3rem, 2.4vw, 2rem);
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255,153,51,.06), rgba(255,255,255,.6));
  border: 1px solid rgba(19,20,15,.07);
  box-shadow: 0 18px 40px -30px rgba(19,20,15,.28);
  opacity: calc(.35 + .65 * var(--lit));
  transition: opacity .55s ease, transform .55s cubic-bezier(.22,.87,.36,1), border-color .5s ease;
}
.how-v2 .how-tl-step:nth-child(odd) .how-tl-body{
  grid-column: 1;
  text-align: right;
  transform: translateX(calc(-1 * var(--slide)));   /* slides in from the left */
}
.how-v2 .how-tl-step:nth-child(even) .how-tl-body{
  grid-column: 3;
  text-align: left;
  transform: translateX(var(--slide));              /* slides in from the right */
}
/* a soft connector tab from the card toward the node */
.how-v2 .how-tl-body::after{
  content: '';
  position: absolute;
  top: 50%;
  width: clamp(1rem, 2.4vw, 2.2rem);
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,153,51,calc(.2 + var(--lit,0) * .5)));
  transform: translateY(-50%);
}
.how-v2 .how-tl-step:nth-child(odd) .how-tl-body::after{ right: calc(-1 * clamp(1rem,2.4vw,2.4rem)); background: linear-gradient(270deg, transparent, rgba(255,153,51,calc(.2 + var(--lit,0) * .5))); }
.how-v2 .how-tl-step:nth-child(even) .how-tl-body::after{ left: calc(-1 * clamp(1rem,2.4vw,2.4rem)); }

.how-v2 .how-tl-num{
  display: block;
  font-family: var(--display);
  font-size: clamp(.85rem, 1vw, 1rem);
  letter-spacing: .08em;
  color: var(--tl-accent);
  opacity: .9;
  margin-bottom: .35rem;
}
.how-v2 .how-tl-t{
  font-family: var(--display);
  font-size: clamp(1.35rem, 2.4vw, 2.1rem);
  line-height: 1.1;
  letter-spacing: -.02em;
  font-weight: 350;
  font-optical-sizing: auto;
  font-variation-settings: "opsz" 100, "SOFT" 40;
  color: var(--ink);
  margin: 0 0 .6rem;
}
.how-v2 .how-tl-d{
  font-family: var(--sans);
  font-size: clamp(.92rem, 1.05vw, 1.02rem);
  line-height: 1.6;
  color: var(--ink3);
  margin: 0;
}

/* ── Mobile: collapse the zig-zag to a single left-aligned column ── */
@media (max-width: 720px){
  .how-v2 .how-tl-spine{ left: calc(var(--node) / 2); }
  .how-v2 .how-tl-step{
    grid-template-columns: var(--node) 1fr;
    column-gap: clamp(1rem, 4vw, 1.6rem);
    align-items: start;
  }
  .how-v2 .how-tl-node{ grid-column: 1; }
  .how-v2 .how-tl-step:nth-child(odd) .how-tl-body,
  .how-v2 .how-tl-step:nth-child(even) .how-tl-body{
    grid-column: 2;
    text-align: left;
    transform: translateX(var(--slide));
  }
  .how-v2 .how-tl-step:nth-child(odd) .how-tl-body::after,
  .how-v2 .how-tl-step:nth-child(even) .how-tl-body::after{
    left: calc(-1 * clamp(1rem,4vw,1.6rem)); right: auto;
    background: linear-gradient(90deg, transparent, rgba(255,153,51,calc(.2 + var(--lit,0) * .5)));
  }
}

@media (prefers-reduced-motion: reduce){
  .how-v2 .how-tl-body{ opacity: 1; transform: none !important; transition: none; }
  .how-v2 .how-tl-spine-fill{ transition: none; }
}

.how-v2 .how-rows{ display: flex; flex-direction: column; gap: clamp(4.5rem, 9vw, 8rem); }

.how-v2 .how-row{
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr);
  gap: clamp(2.5rem, 6vw, 5rem);
  align-items: center;
}
.how-v2 .how-row-rev{ direction: rtl; }
.how-v2 .how-row-rev > *{ direction: ltr; }

.how-v2 .how-row-text{
  /* FIX 4: raised cap from 460px → 580px so text breathes on wide screens */
  max-width: 580px;
}

/* FIX 5: step label pill — stronger fill + border so it reads as a pill, not floating text */
.how-v2 .how-row-label{
  display: inline-flex; align-items: center; gap: 10px;
  font-family: var(--sans);
  font-size: 11px; font-weight: 600;
  letter-spacing: .14em; text-transform: uppercase;
  color: var(--gold2);
  padding: 6px 14px;
  border: 1px solid rgba(217,176,98,.45);          /* was .28 — now clearly visible */
  border-radius: 999px;
  background: rgba(217,176,98,.12);               /* was .06 — now a legible warm tint */
  margin-bottom: 1.4rem;
}

.how-v2 .how-row-t{
  font-family: var(--display);
  font-size: clamp(2rem, 3.6vw, 3rem);
  line-height: 1.05;
  letter-spacing: -.022em;
  font-weight: 350;
  font-optical-sizing: auto;
  font-variation-settings: "opsz" 100, "SOFT" 40;
  color: inherit;
  margin: 0 0 1.2rem;
}
.how-v2 .how-row-d{
  font-family: var(--sans);
  font-size: clamp(.98rem, 1.1vw, 1.05rem);
  line-height: 1.65;
  color: var(--ink3);
  margin: 0;
}

/* ── Visual column — FIX 1 + 2: proper portrait ratio and a grounding surface ── */
.how-v2 .how-row-visual{
  position: relative;
  aspect-ratio: 16 / 11;   /* laptop landscape — leaves room for the hinge lip */
  width: 100%;
  max-width: none;
  margin: 0 auto;
  perspective: 1600px;
}

/* FIX 1 + 3 + 6: card is no longer transparent/invisible.
   It's a concrete sized container. The phone floats inside it.
   The animation moves to .smock so the shadow lifts with the phone. */
.how-v2 .how-row-card{
  position: absolute;
  inset: 0;
  /* warm paper ground — subtle radial light underneath the phone */
  background: radial-gradient(ellipse 80% 70% at 50% 60%, rgba(217,176,98,.10) 0%, transparent 75%);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* FIX 3: .smock no longer uses height: 97% (which collapses inside an absolute parent).
   Instead it fills the card via explicit sizing from its aspect-ratio + width. */
.how-v2 .how-row-card .smock{
  width: 100%;             /* the floating screen fills the column */
  height: auto;            /* let aspect-ratio drive the height */
  /* gentle float so the soft shadow lifts with the screen */
  animation: howFloat 7s ease-in-out infinite;
  /* soft, diffuse premium shadow — warm-tinted, layered, not a hard smudge */
  filter:
    drop-shadow(0 2px 4px rgba(31,28,24,.06))
    drop-shadow(0 18px 32px rgba(31,28,24,.14))
    drop-shadow(0 40px 60px rgba(31,28,24,.10));
  transition: filter .4s;
}
.how-v2 .how-row-card .smock:hover{
  filter:
    drop-shadow(0 2px 4px rgba(31,28,24,.05))
    drop-shadow(0 24px 40px rgba(31,28,24,.12))
    drop-shadow(0 52px 72px rgba(31,28,24,.08));
}

/* hide the decorative offset backdrop layer (kept in DOM for legacy, hidden in CSS) */
.how-v2 .how-row-card-bg{ display: none; }

.how-v2 .how-row-card img{
  width: 100%; height: 100%; object-fit: center;
  display: block;
}
.how-v2 .how-row-card-fallback{
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--serif); font-size: clamp(4rem, 10vw, 7rem);
  color: rgba(244,240,231,.08); letter-spacing: -.04em;
  pointer-events: none;
  z-index: -1;
}

@keyframes howFloat{
  0%, 100% { transform: translateY(0);       }
  50%      { transform: translateY(-12px);   }   /* slightly more lift than before (-10px) */
}

/* ── How-it-works step mockups (floating app screens, no device) ─────
   No laptop / browser chrome — the real app UI floats in a clean rounded
   card with a soft drop shadow. container-type:inline-size is kept so the
   existing .smk-* screen content scales unchanged. */
.smock{
  --c-ink:#1F1C18; --c-mut:#9a9183; --c-line:#ece6db; --c-paper:#fff;
  --c-saf:#FF9933; --c-saf2:#E07A12; --c-soft:#FBF3E6;
  position: relative;
  aspect-ratio: 16 / 10;
  width: 100%;
  display: flex; flex-direction: column;
  overflow: hidden;                 /* clip the screen to the card radius */
  border-radius: clamp(12px,1.8cqw,22px);
  background: var(--c-paper);
  /* hairline edge so the card reads against the warm page, no device chrome */
  box-shadow: inset 0 0 0 1px rgba(31,28,24,.06);
  container-type: inline-size;
  font-family: var(--sans); color: var(--c-ink);
  font-size: clamp(7px,2.05cqw,15px);
}

/* the screen surface fills the card */
.smock-body{
  position:relative; flex:1; min-height:0; overflow:hidden;
  border-radius:inherit;
  background:linear-gradient(180deg,#FBF6EE 0%,#F6EDDF 100%);
  display:flex; flex-direction:column;
}
/* the browser chrome bar is removed — collapse its node entirely */
.smock-status{ display:none; }

/* a scrollable app screen *//* ═══════════════════════════════════════════════════════════════
   SMK SCREEN SYSTEM — refined edition
   Warm paper aesthetic — deep curves — layered depth
   ═══════════════════════════════════════════════════════════════ */

/* ── Scrollable app screen ─────────────────────────────────────── */
.smk-screen {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: .5em;
  padding: clamp(6px, 2.5cqw, 13px) clamp(7px, 2.8cqw, 14px);
}

/* ── App brand header ──────────────────────────────────────────── */
.smk-appbrand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .5em;
  font-family: var(--serif);
  font-size: 1em;
  color: var(--c-ink);
  font-weight: 500;
  letter-spacing: .01em;
  padding-bottom: .35em;
  border-bottom: 1px solid rgba(236,230,219,.8);
}
.smk-appbrand.sm { font-size: .88em; justify-content: flex-start; }

.smk-pip {
  width: .52em; height: .52em;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #FFB84D, var(--c-saf));
  box-shadow: 0 0 0 2.5px rgba(255,153,51,.2), 0 1px 3px rgba(255,120,0,.35);
  flex-shrink: 0;
}

/* ── White card — the main form container ─────────────────────── */
.smk-card {
  background: #fff;
  border: 1px solid rgba(240,233,221,.9);
  border-radius: 18px;                        /* rounder than before (was 14px) */
  padding: clamp(9px, 3cqw, 16px);
  display: flex;
  flex-direction: column;
  gap: .58em;
  box-shadow:
    0 2px 0 rgba(255,255,255,.9) inset,       /* top inner highlight */
    0 1px 2px rgba(240,220,190,.6) inset,     /* warm inner glow */
    0 8px 24px -12px rgba(31,28,24,.18),      /* soft ground shadow */
    0 2px 6px -2px rgba(200,160,100,.12);     /* warm ambient */
}

/* ── Headings ──────────────────────────────────────────────────── */
.smk-h {
  font-family: var(--serif);
  font-size: 1.28em;
  text-align: center;
  line-height: 1.08;
  color: var(--c-ink);
  margin: .05em 0 .05em;
  letter-spacing: -.01em;
}
.smk-h2 {
  font-family: var(--display);
  font-weight: 400;
  font-size: 1.34em;
  line-height: 1.08;
  color: var(--c-ink);
  letter-spacing: -.015em;
}

/* ── Avatar uploader ───────────────────────────────────────────── */
.smk-avatar {
  width: clamp(32px, 10cqw, 44px);
  height: clamp(32px, 10cqw, 44px);
  border-radius: 50%;
  background: radial-gradient(circle at 38% 32%, #fff 0%, #FDF0DC 60%, #FAE4C0 100%);
  border: 2px solid #fff;                       /* clean white frame— */
  align-self: center;
  display: flex;
  align-items: center;
  justify-content: center;
  /* —with a soft orange ring around it */
  box-shadow:
    0 0 0 2px rgba(255,153,51,.45),
    0 6px 16px -8px rgba(255,120,0,.35);
  position: relative;
}
/* camera/edit badge bottom-right */
.smk-avatar::after {
  content: '';
  position: absolute;
  bottom: -3%; right: -3%;
  width: 38%; height: 38%;
  border-radius: 50%;
  background:
    /* tiny camera lens dot */
    radial-gradient(circle at 50% 54%, #fff 0 18%, transparent 19%),
    var(--c-saf);
  border: 2px solid #fff;
  box-shadow: 0 2px 5px rgba(200,100,0,.35);
}
.smk-usr {
  width: 40%; height: 40%;
  border-radius: 50%;
  border: 1.5px solid #DFA055;
  position: relative;
}
.smk-usr::after {
  content: '';
  position: absolute;
  left: 50%; bottom: -52%;
  transform: translateX(-50%);
  width: 140%; height: 78%;
  border-radius: 50% 50% 0 0;
  border: 1.5px solid #DFA055;
  border-bottom: 0;
}
.smk-uplab {
  text-align: center;
  font-size: .75em;
  color: #b08a4a;
  margin-top: -.15em;
  font-weight: 500;
  letter-spacing: .01em;
}

/* ── Form fields ───────────────────────────────────────────────── */
.smk-field { display: flex; flex-direction: column; gap: 3px; }

.smk-flabel {
  display: block;
  font-size: .7em;
  color: #9a8f80;
  margin-bottom: 4px;
  font-weight: 600;
  letter-spacing: .11em;          /* wider, refined tracking */
  text-transform: uppercase;
}

.smk-input {
  display: flex;
  align-items: center;
  border: 1px solid #ECE0CF;                  /* warm tan border so it doesn't float */
  border-radius: 12px;                        /* softer, more premium */
  padding: .58em .78em;
  font-size: .88em;
  color: var(--c-ink);
  background: #fff;
  box-shadow:
    0 1px 0 rgba(255,255,255,.9) inset,
    0 1px 2px rgba(180,140,90,.08),
    0 2px 6px -2px rgba(120,90,50,.08);       /* gentle tactile lift */
  transition: border-color .15s, box-shadow .15s;
}
.smk-input:focus-within {
  border-color: rgba(255,153,51,.5);
  box-shadow: 0 0 0 2.5px rgba(255,153,51,.15), 0 1px 3px rgba(0,0,0,.04);
}
.smk-ph { color: #c4bbb0; }

/* ── URL field — single combined row ───────────────────────────── */
.smk-url-row {
  display: flex;
  align-items: stretch;
  border: 1px solid #e8e0d4;
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,.04);
}
.smk-url-row .smk-prefix {
  background: #f4f0ea;
  border: none;
  border-right: 1px solid #e8e0d4;
  border-radius: 0;
  padding: .52em .6em;
  font-size: .8em;
  color: #9a9183;
  white-space: nowrap;
  flex-shrink: 0;
  width: auto;
  display: flex;
  align-items: center;
}
.smk-url-input {
  padding: .52em .68em;
  font-size: .88em;
  color: #c4bbb0;
  flex: 1;
  display: flex;
  align-items: center;
}

/* legacy prefix (keep for backward compat, hidden when url-row is used) */
.smk-pre { padding: 0; border: 0; background: transparent; }
.smk-prefix {
  background: #f4f0ea;
  border: 1px solid #e8e0d4;
  border-radius: 10px;
  padding: .5em .65em;
  font-size: .84em;
  color: #9a9183;
  width: 100%;
}

.smk-hint { font-size: .7em; color: #b0a89e; margin-top: 1px; }

/* ── Name row ──────────────────────────────────────────────────── */
.smk-row-name { display: flex; gap: .4em; }
.smk-select {
  display: flex;
  align-items: center;
  gap: .28em;
  border: 1px solid #e8e0d4;
  border-radius: 10px;
  padding: .52em .58em;
  font-size: .88em;
  background: #faf8f4;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0,0,0,.04);
}
.smk-chev {
  width: 0; height: 0;
  border-left: .3em solid transparent;
  border-right: .3em solid transparent;
  border-top: .3em solid #9a9183;
}
.smk-row-name .smk-input { flex: 1; min-width: 0; }

/* ── Textarea ──────────────────────────────────────────────────── */
.smk-area {
  border: 1px solid #e8e0d4;
  border-radius: 10px;
  padding: .52em .68em;
  font-size: .84em;
  color: #9a9183;
  background: #fff;
  min-height: 2.8em;
  line-height: 1.45;
  box-shadow: 0 1px 3px rgba(0,0,0,.04);
}

/* ── CTA button ────────────────────────────────────────────────── */
.smk-cta {
  margin-top: .2em;
  background: linear-gradient(175deg, #FFB347 0%, #FF9933 45%, #E07A12 100%);
  color: #fff;
  font-weight: 700;
  border-radius: 12px;                        /* rounder pill feel */
  padding: .72em;
  text-align: center;
  font-size: .92em;
  letter-spacing: .01em;
  box-shadow:
    0 1px 0 rgba(255,255,255,.35) inset,      /* top shine */
    0 -1px 0 rgba(0,0,0,.12) inset,           /* bottom depth */
    0 6px 20px -8px rgba(224,122,18,.7),      /* warm glow */
    0 2px 4px rgba(200,80,0,.2);
}

/* ── Footer ────────────────────────────────────────────────────── */
.smk-foot {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .45em;
  font-size: .78em;
  color: #8a7f72;
  margin-top: .1em;
}
.smk-foot em { font-style: normal; color: var(--c-saf2); font-weight: 700; }
.smk-foot-av {
  width: 1.6em; height: 1.6em;
  border-radius: 50%;
  background: #1F1C18;
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: .78em; font-weight: 700;
  flex-shrink: 0;
  box-shadow: 0 1px 4px rgba(0,0,0,.3);
}

/* ── Progress bar ──────────────────────────────────────────────── */
.smk-prog {
  height: .45em;
  border-radius: 999px;
  background: #ede7dc;
  overflow: hidden;
  margin: -.15em 0 .1em;
}
.smk-prog span {
  display: block;
  height: 100%;
  width: var(--p, 66%);
  border-radius: 999px;
  background: linear-gradient(90deg, #FFB347, var(--c-saf2));
  box-shadow: 0 1px 3px rgba(255,120,0,.3);
}

/* ── Specialty chips ───────────────────────────────────────────── */
.smk-chips { display: flex; flex-wrap: wrap; gap: 4px; }
.smk-chips span {
  background: linear-gradient(160deg, #fff 0%, #FDF4E7 100%);
  border: 1px solid #F0D9B0;
  color: #8a6314;
  border-radius: 999px;
  padding: .3em .75em;
  font-size: .78em;
  font-weight: 700;
  box-shadow: 0 1px 2px rgba(200,140,50,.1);
}
.smk-chips span.add {
  background: #fff;
  border-style: dashed;
  border-color: #d4c9b8;
  color: #a09689;
  font-weight: 500;
}

/* ── Dashboard top bar ─────────────────────────────────────────── */
.smk-topbar {
  display: flex;
  align-items: center;
  gap: .6em;
  padding: .15em .05em .35em;
  border-bottom: 1px solid rgba(236,230,219,.9);
}
.smk-burger {
  width: 1.2em; height: 1.2em;
  flex-shrink: 0;
  background:
    linear-gradient(#7d756a 0 0) center/100% 1.5px no-repeat,
    linear-gradient(#7d756a 0 0) center 30%/100% 1.5px no-repeat,
    linear-gradient(#7d756a 0 0) center 70%/100% 1.5px no-repeat;
}
.smk-pad {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: .5em;
  padding-top: .15em;
}

/* ── Share link row ────────────────────────────────────────────── */
.smk-share {
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(160deg, #fff 0%, #FDF6EC 100%);
  border: 1px solid #F0D9B0;
  border-radius: 12px;
  padding: .5em .6em;
  box-shadow:
    0 1px 0 rgba(255,255,255,.9) inset,
    0 3px 10px -6px rgba(255,153,51,.35);
}
.smk-globe {
  width: 1em; height: 1em;
  border-radius: 50%;
  border: 1.5px solid var(--c-saf);
  flex-shrink: 0;
  box-shadow: 0 0 0 2px rgba(255,153,51,.1);
}
.smk-link {
  flex: 1;
  min-width: 0;
  font-size: .78em;
  color: #8a6314;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.smk-copy {
  background: linear-gradient(175deg, #FFB347, var(--c-saf));
  color: #fff;
  border-radius: 8px;
  padding: .38em .75em;
  font-size: .76em;
  font-weight: 700;
  flex-shrink: 0;
  box-shadow: 0 3px 8px -4px rgba(255,120,0,.6), 0 1px 0 rgba(255,255,255,.3) inset;
}

/* ── Stat cards ────────────────────────────────────────────────── */
.smk-stats { display: grid; grid-template-columns: 1fr 1fr; gap: .5em; }
.smk-stat {
  border: 1px solid #ECE0CF;
  border-radius: 14px;
  padding: .7em .75em;
  display: flex;
  flex-direction: column;
  gap: 2px;
  background: linear-gradient(160deg, #fff 0%, #fdfaf5 100%);
  box-shadow:
    0 1px 0 rgba(255,255,255,.9) inset,
    0 2px 6px -3px rgba(120,90,50,.12);
}
.smk-stat b {
  font-family: var(--display);
  font-weight: 400;
  font-size: 1.5em;
  color: var(--c-ink);
  line-height: 1;
}
.smk-stat span { font-size: .74em; color: var(--c-mut); }
.smk-up { font-size: .68em; font-weight: 700; color: #3EA76A; }
.smk-stat-rate span { color: var(--c-saf); letter-spacing: .04em; }

/* ── Mini bar chart ────────────────────────────────────────────── */
.smk-chart {
  display: flex;
  align-items: flex-end;
  gap: .38em;
  height: 2.8em;
  padding: .35em .15em 0;
  margin-top: .05em;
  border-top: 1px solid #ede7dc;
}
.smk-chart span {
  flex: 1;
  border-radius: 4px 4px 0 0;
  background: linear-gradient(180deg, #FFD4A0 0%, #FFA847 50%, var(--c-saf) 100%);
  box-shadow: 0 -1px 3px rgba(255,153,51,.2) inset;
}
.smk-chart span:nth-child(1){ height: 40%; }
.smk-chart span:nth-child(2){ height: 62%; }
.smk-chart span:nth-child(3){ height: 50%; }
.smk-chart span:nth-child(4){ height: 80%; opacity: 1; }
.smk-chart span:nth-child(5){ height: 68%; }
.smk-chart span:nth-child(6){ height: 95%; }
.smk-chart span:nth-child(7){ height: 72%; }

/* ── Appointment list ──────────────────────────────────────────── */
.smk-appttop {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: .15em;
}
.smk-appttop .smk-pill-today{ margin-top: .3em; }
.smk-pill-today {
  background: linear-gradient(135deg, #FDF4E7, #FBE8CB);
  color: #8a6314;
  border: 1px solid #F0D9B0;
  border-radius: 999px;
  padding: .28em .65em;
  font-size: .72em;
  font-weight: 700;
  box-shadow: 0 1px 3px rgba(200,140,50,.1);
}
/* appointments screen — its own tighter rhythm so all rows fit cleanly */
.smk-main:has(.smk-appt){ gap:.5em; }
.smk-appt {
  display: flex;
  align-items: center;
  gap: .6em;
  border: 1px solid #ECE0CF;                   /* match the warm input border */
  border-radius: 14px;
  padding: .58em .7em;
  background: linear-gradient(160deg, #fff 0%, #fdfaf5 100%);
  box-shadow:
    0 1px 0 rgba(255,255,255,.9) inset,
    0 2px 6px -3px rgba(120,90,50,.14);
}
.smk-ini {
  width: clamp(20px, 8.5cqw, 32px);
  height: clamp(20px, 8.5cqw, 32px);
  border-radius: 50%;
  color: #fff;
  font-weight: 800;
  font-size: .74em;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 6px -2px rgba(0,0,0,.25);
}
.smk-ini.g-a { background: linear-gradient(140deg, #FFB661 0%, #E07A12 100%); }
.smk-ini.g-b { background: linear-gradient(140deg, #9AC9B0 0%, #5A8A6E 100%); }
.smk-ini.g-c { background: linear-gradient(140deg, #E8A6A0 0%, #C16A62 100%); }
.smk-apptmid { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.smk-apptmid b { font-size: .92em; color: var(--c-ink); }
.smk-apptmid span { font-size: .76em; color: var(--c-mut); }
.smk-badge {
  font-size: .7em;
  font-weight: 700;
  border-radius: 999px;
  padding: .3em .7em;
  flex-shrink: 0;
}
.smk-badge.is-ok {
  background: linear-gradient(135deg, #EAF5EE, #D4EDDE);
  color: #2B7A4B;
  border: 1px solid rgba(46,160,90,.2);
}
.smk-badge.is-wait {
  background: linear-gradient(135deg, #FDF3E3, #FAE5C0);
  color: #9a7327;
  border: 1px solid rgba(200,150,50,.2);
}

/* ═══════════════════════════════════════════════════════════════
   DESKTOP LAYOUTS for the laptop mock screens
   ═══════════════════════════════════════════════════════════════ */

/* ── Step 1 — the REAL /signup page embedded live, scaled to fit ──
   The iframe renders at a desktop viewport and is scaled down so the whole
   page fits the card. --smk-z is the zoom (0.4 = page shown at 40%), so the
   iframe is sized at 1/0.4 = 250% and scaled back. Pure CSS, responsive. */
.smk-live{
  --smk-z: .5;
  position: relative;
  flex: 1; min-height: 0;
  overflow: hidden;
  background: linear-gradient(180deg,#F8F4EE 0%,#F2ECE2 100%);
}
.smk-live-frame{
  position: absolute; top: 0; left: 0;
  width: calc(100% / var(--smk-z));
  height: calc(100% / var(--smk-z));
  border: 0;
  transform: scale(var(--smk-z));
  transform-origin: top left;
  background: transparent;
  pointer-events: none;            /* belt-and-braces: never interactive */
}
/* transparent shield over the frame so clicks/scroll pass to the page */
.smk-live-shield{ position: absolute; inset: 0; z-index: 2; }
/* zoom in a touch on small cards so text stays legible */
@container (max-width: 360px){ .smk-live{ --smk-z: .6; } }

/* ── Steps 2–4 — app shell (sidebar + main) ───────────────────── */
.smk-app{
  flex: 1; min-height: 0;
  display: grid;
  grid-template-columns: clamp(70px,22cqw,150px) 1fr;
  overflow: hidden;
  background: linear-gradient(180deg,#FBF8F2 0%,#F6F0E6 100%);
}
.smk-side{
  display: flex; flex-direction: column; gap: 1.1em;
  padding: clamp(10px,2.6cqw,20px) clamp(8px,2cqw,15px);
  background: linear-gradient(180deg,#FFFFFF 0%,#FCF8F1 100%);
  border-right: 1px solid rgba(236,230,219,.9);
}
.smk-side .smk-appbrand{ border:0; padding:0 .2em .9em; justify-content:flex-start; font-size:.92em; border-bottom:1px solid rgba(236,230,219,.9); }
.smk-nav{ display:flex; flex-direction:column; gap:.5em; }
.smk-nav span{
  position: relative;
  display: flex; align-items: center;
  font-size: .8em; font-weight: 400;
  color: #9a8f80;
  padding: .42em .8em;
  border-radius: 8px;
  letter-spacing: .005em;
  transition: color .15s;
}
/* active item — soft tint + orange left-border accent line (no dot) */
.smk-nav span.on{
  background: linear-gradient(90deg, rgba(255,153,51,.10), rgba(255,153,51,0));
  color: #b46410; font-weight: 600;
}
.smk-nav span.on::before{
  content: ''; position: absolute;
  left: 0; top: 50%; transform: translateY(-50%);
  width: 2.5px; height: 1.05em; border-radius: 999px;
  background: var(--c-saf);
}
.smk-main{
  position: relative;
  min-width: 0; min-height: 0; overflow: hidden;
  display: flex; flex-direction: column; gap: .8em;
  padding: clamp(12px,3cqw,24px) clamp(13px,3.2cqw,26px);
}
/* faint ambient warmth in the corner so the pane isn't flat */
.smk-main::before{
  content: ''; position: absolute; z-index: 0;
  width: 60%; aspect-ratio: 1; border-radius: 50%;
  top: -28%; right: -16%;
  background: radial-gradient(circle, rgba(255,153,51,.08) 0%, transparent 68%);
  pointer-events: none;
}
.smk-main > *{ position: relative; z-index: 1; }
.smk-mainhead{ display:flex; align-items:flex-start; justify-content:space-between; gap:.6em; }
.smk-grid2{ display:grid; grid-template-columns:1fr 1fr; gap:.5em; }
.smk-cta-inline{ align-self:flex-start; padding:.62em 1.4em; }
.smk-stats-3{ grid-template-columns: repeat(3, 1fr); }
.smk-chart-wrap{ display:flex; flex-direction:column; gap:.35em; margin-top:.1em; }
.smk-chart-wrap .smk-chart{ border-top:0; height:3.4em; }

/* ── Build-your-profile screen polish ─────────────────────────── */
/* this screen is content-dense — keep a consistent, slightly tighter rhythm */
.smk-app:has(.smk-idrow) .smk-main{ gap:.55em; }
.smk-app:has(.smk-idrow) .smk-area{ min-height:2.2em; }
.smk-eyebrow{
  font-size:.62em; font-weight:500; letter-spacing:.2em; text-transform:uppercase;
  color:#b6a690; margin-bottom:.5em; display:block;
}
/* 3-step indicator — uniform circles, active is an orange pill */
.smk-steps{ display:flex; align-items:center; gap:.45em; padding-top:.4em; flex-shrink:0; }
.smk-steps i{ width:.5em; height:.5em; border-radius:50%; background:#E3DAC8; }
.smk-steps i.done{ background:rgba(255,153,51,.45); }
.smk-steps i.on{
  width:1.5em; border-radius:999px;
  background:var(--c-saf);
  box-shadow:0 1px 4px rgba(255,120,0,.35);
}

/* identity row — avatar beside the first fields */
.smk-idrow{ display:flex; align-items:flex-end; gap:.7em; }
.smk-idrow-fields{ flex:1; min-width:0; }
.smk-avatar.lg{
  width:clamp(34px,11cqw,52px); height:clamp(34px,11cqw,52px);
  align-self:flex-end; flex-shrink:0; margin-bottom:.05em;
}

.smk-count{ font-style:normal; font-weight:600; color:var(--c-saf2); text-transform:none; letter-spacing:0; margin-left:.4em; }

/* selected specialty pills read as active toggles */
.smk-chips span.sel{
  background:linear-gradient(135deg,#FFF3E1,#FCE4C0);
  border-color:var(--c-saf);
  color:#a85e0c;
  box-shadow:0 1px 4px rgba(255,140,30,.18);
}

/* money input with a soft currency chip */
.smk-input-money{ gap:.45em; }
.smk-input-money i{
  font-style:normal; font-weight:700; color:#a89a86;
  background:#f4f0ea; border-radius:6px; padding:.05em .42em; font-size:.85em;
}

/* footer with Back + primary action */
.smk-footer{ display:flex; align-items:center; justify-content:space-between; gap:.6em; margin-top:.25em; }
.smk-btn-ghost{
  font-size:.86em; font-weight:600; color:#8a7f72;
  padding:.6em 1.1em; border-radius:12px;
  border:1px solid #e8e0d4; background:#fff;
}

/* ── Responsive ────────────────────────────────────────────────── */
@media (max-width: 860px) {
  .how-v2 .how-row,
  .how-v2 .how-row-rev {
    grid-template-columns: 1fr;
    direction: ltr;
    gap: 2rem;
  }
  .how-v2 .how-row-visual {
    aspect-ratio: 16 / 11;
    max-width: 460px;
    margin: 0 auto;
  }
}



/* ═══════════════════════════════════════════════════════════════
   TEMPLATES — Tosea-style premium gallery
═══════════════════════════════════════════════════════════════ */
.tshow {
  position: relative;
  z-index: 3;
  background: var(--surf-1, #FFFCF8);
  padding: clamp(1.5rem, 3vw, 2.5rem) 0 clamp(3rem, 6vw, 5rem);
  overflow: hidden;
}

/* ambient glow */
.tshow-glow {
  position: absolute; inset: 0; pointer-events: none; z-index: 0;
  background:
    radial-gradient(ellipse 55% 45% at 15% 20%, rgba(255,153,51,.08) 0%, transparent 60%),
    radial-gradient(ellipse 50% 50% at 88% 80%, rgba(255,217,176,.18) 0%, transparent 65%);
}

/* ── section header ── */
.tshow-head {
  position: relative; z-index: 2;
  text-align: left;
  max-width: 1180px;
  margin: 0 auto clamp(1rem, 2vh, 1.6rem);
  padding: 0 clamp(1.5rem, 5vw, 3rem);
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 2rem;
  flex-wrap: wrap;
}

.tshow-head-left {}

.tshow-eyebrow {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 11px; font-weight: 600; letter-spacing: .18em; text-transform: uppercase;
  color: var(--wn-saffron, #FF9933);
  background: rgba(255,153,51,.08);
  border: 1px solid rgba(255,153,51,.2);
  padding: 5px 13px; border-radius: 999px;
  margin-bottom: 1rem;
}
.tshow-eyebrow::before, .tshow-eyebrow::after { content: none; }

.tshow-h {
  margin: 0 0 2rem 0 ;
  // margin-bottom:4;
  font-family: var(--display);
  font-size: clamp(2rem, 4vw, 3.2rem);
  font-weight: 800;
  line-height: 1.06;
  letter-spacing: -.03em;
  color: var(--ink);
}
.tshow-h em { font-style: normal; color: var(--wn-saffron, #FF9933); }

.tshow-sub {
  font-family: var(--sans);
  font-size: 15px; font-weight: 300; line-height: 1.7;
  color: var(--ink3);
  max-width: 46ch;
  margin: .9rem 0 0;
}

.tshow-head-right {
  display: flex; align-items: center; gap: 10px; flex-shrink: 0;
}
.tshow-nav-btn {
  width: 40px; height: 40px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: var(--paper);
  border: 1px solid var(--border);
  cursor: pointer; color: var(--ink2);
  transition: all .25s ease;
  flex-shrink: 0;
}
.tshow-nav-btn:hover {
  background: var(--ink); color: #fff;
  border-color: var(--ink);
  transform: scale(1.06);
}
.tshow-nav-btn:disabled { opacity: .3; pointer-events: none; }

/* ── gallery track (horizontal scroll) ── */
.tshow-stage {
  position: relative; z-index: 2;
  overflow: hidden;
  /* match the header's centered container so the first card's left edge
     lines up with the headline text */
  max-width: 1180px;
  margin: 0 auto;
}

.tshow-track {
  display: flex;
  height: 100%;
  align-items: stretch;
  gap: clamp(1rem, 2vw, 1.5rem);
  padding: 0;
  /* no overflow-x here — controlled by JS translateX */
  transition: transform .55s cubic-bezier(.4, 0, .2, 1);
  will-change: transform;
  width: max-content;
}

.tshow-card {
  flex: 0 0 auto;
  width: clamp(380px, 42vw, 560px);
  min-height: 480px;
  border-radius: 16px;
  overflow: hidden;
  background: var(--paper);
  border: 1px solid rgba(31,28,24,.07);
  box-shadow:
    0 2px 0 rgba(255,255,255,.7) inset,
    0 8px 24px -12px rgba(31,28,24,.14),
    0 2px 8px -4px rgba(31,28,24,.06);
  cursor: pointer;
  position: relative;
  opacity: 0.82;
  transform: scale(.97);
  transition:
    transform .42s cubic-bezier(.22,.87,.36,1),
    opacity .42s ease,
    box-shadow .42s ease,
    border-color .3s ease;
}

.tshow-card.is-active {
  opacity: 1;
  transform: scale(1);
  border-color: rgba(255,153,51,.30);
  box-shadow:
    0 2px 0 rgba(255,255,255,.7) inset,
    0 36px 70px -24px rgba(31,28,24,.30),
    0 12px 30px -12px rgba(255,153,51,.14);
  z-index: 2;
}

.tshow-card:hover {
  opacity: 1;
  border-color: rgba(255,153,51,.35);
}

.tshow-card.is-active:hover {
  transform: scale(1.01) translateY(-3px);
}

.tshow-card-screen {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 11;
  border-radius: 16px 16px 0 0;
  overflow: hidden;
  background: var(--bg2);
}

.tshow-card-screen-inner {
  position: absolute;
  top: 0;
  left: 50%;
  width: 1080px;
  height: 742px;
  transform-origin: top center;
  pointer-events: none;
  transition: transform .55s cubic-bezier(.22,.87,.36,1);
}

.tshow-card:hover .tshow-card-screen-inner {
  transform-origin: top center;
}

/* live badge top-left */
.tshow-card-live-badge {
  position: absolute; top: 12px; left: 12px; z-index: 4;
  display: inline-flex; align-items: center; gap: 6px;
  background: rgba(255,255,255,.88);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(31,28,24,.06);
  border-radius: 999px;
  padding: 4px 10px 4px 8px;
  font-family: var(--sans); font-size: 10px; font-weight: 600;
  color: var(--ink2); letter-spacing: .03em;
  box-shadow: 0 2px 10px rgba(31,28,24,.08);
}
.tshow-card-live-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: #3EA76A;
  box-shadow: 0 0 0 3px rgba(62,167,106,.18);
  animation: pulseDot 2.2s ease-in-out infinite;
  flex-shrink: 0;
}

/* category badge top-right */
.tshow-card-badge {
  position: absolute; top: 12px; right: 12px; z-index: 4;
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 10px;
  border-radius: 999px;
  font-family: var(--sans); font-size: 10px; font-weight: 600;
  letter-spacing: .04em;
  backdrop-filter: blur(10px);
  border: 1px solid transparent;
}
.tshow-card-badge.badge-therapist {
  background: rgba(255,153,51,.14); color: #b46010;
  border-color: rgba(255,153,51,.28);
}
.tshow-card-badge.badge-psychologist {
  background: rgba(90,120,100,.12); color: #2d5a40;
  border-color: rgba(90,120,100,.24);
}
.tshow-card-badge.badge-relationship {
  background: rgba(180,107,80,.10); color: #8b3e22;
  border-color: rgba(180,107,80,.22);
}
.tshow-card-badge.badge-career {
  background: rgba(60,90,160,.08); color: #1e3a7a;
  border-color: rgba(60,90,160,.2);
}
.tshow-card-badge.badge-premium {
  background: rgba(212,175,55,.12); color: #7a5a00;
  border-color: rgba(212,175,55,.28);
}

/* hover overlay — dark gradient with CTA */
.tshow-card-hover {
  position: absolute; inset: 0; z-index: 3;
  display: flex; flex-direction: column;
  align-items: center; justify-content: flex-end;
  gap: 9px; padding: 20px 16px;
  background: linear-gradient(
    to top,
    rgba(15,12,8,.82) 0%,
    rgba(15,12,8,.4) 30%,
    transparent 60%
  );
  opacity: 0;
  transition: opacity .35s ease;
  pointer-events: none;
}
.tshow-card:hover .tshow-card-hover { opacity: 1; }
.tshow-card:hover .tshow-card-hover .tshow-btn { pointer-events: auto; }
/* the hero (active) card always shows its CTAs so users can act immediately */
.tshow-card.is-active .tshow-card-hover { opacity: 1; }
.tshow-card.is-active .tshow-card-hover .tshow-btn { pointer-events: auto; }

.tshow-btn {
  display: inline-flex; align-items: center; gap: 7px;
  height: 38px; padding: 0 18px; border-radius: 999px;
  font-family: var(--sans); font-size: 12px; font-weight: 600;
  letter-spacing: -.003em; text-decoration: none; cursor: pointer;
  border: 1px solid transparent;
  transition: transform .25s, background .25s, box-shadow .25s;
}
.tshow-btn svg { flex-shrink: 0; }
.tshow-btn-ghost {
  background: rgba(255,255,255,.14); color: #fff;
  border-color: rgba(255,255,255,.28);
  backdrop-filter: blur(10px);
}
.tshow-btn-ghost:hover { background: rgba(255,255,255,.24); transform: translateY(-1px); }
.tshow-btn-solid {
  background: var(--wn-saffron, #FF9933); color: #fff;
  box-shadow: 0 1px 0 rgba(255,255,255,.25) inset, 0 8px 22px -6px rgba(255,153,51,.55);
}
.tshow-btn-solid:hover {
  background: var(--wn-saffron-deep, #E07A12);
  transform: translateY(-1px);
}
.tshow-btn-solid svg { transition: transform .25s; }
.tshow-btn-solid:hover svg { transform: translateX(3px); }

/* ── minimal footer — 10-15% of card ── */
.tshow-card-foot {
  display: flex; align-items: center; justify-content: space-between;
  gap: .75rem;
  padding: 12px 14px 13px;
  background: var(--paper);
  border-top: 1px solid rgba(31,28,24,.06);
}
.tshow-card-meta { display: flex; align-items: center; gap: 10px; min-width: 0; }
.tshow-card-num {
  font-family: var(--sans); font-size: 10px; font-weight: 700;
  letter-spacing: .1em; color: var(--wn-saffron); flex-shrink: 0;
}
.tshow-card-name {
  font-family: var(--display); font-size: 13.5px; font-weight: 400;
  color: var(--ink); letter-spacing: -.012em; line-height: 1.2;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.tshow-card-desc {
  font-size: 10px; color: var(--ink4); margin-top: 1px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.tshow-card-open {
  width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: transparent; border: 1px solid rgba(31,28,24,.1);
  color: var(--ink3); cursor: pointer;
  transition: all .25s ease;
}
.tshow-card-open:hover {
  background: var(--wn-saffron, #FF9933);
  border-color: var(--wn-saffron, #FF9933);
  color: #fff; transform: translateY(-1px);
}

/* ── progress dots ── */
.tshow-progress {
  position: relative; z-index: 2;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  margin-top: 2rem;
}
.tshow-progress-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: rgba(31,28,24,.14);
  border: none; padding: 0; cursor: pointer;
  transition: all .38s cubic-bezier(.22,.87,.36,1);
}
.tshow-progress-dot.on {
  width: 24px; border-radius: 4px;
  background: var(--wn-saffron, #FF9933);
}

/* ── two equal columns: templates (left) + details form (right) ── */
.tshow-split {
  position: relative; z-index: 2;
  max-width: 1180px;
  
  margin: 0 auto;
  padding: 0 clamp(1.5rem, 5vw, 3rem);
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(380px, 0.65fr);
  gap: 2rem;
  align-items: start;
  gap: clamp(1.5rem, 3vw, 2.5rem);
  // align-items: stretch;             /* equal height */
}
.tshow-split-left {
  min-width: 0;
    // border: 1px solid var(--border, rgba(31,26,20,.45));
  border-radius: 38px;
  display: flex; flex-direction: column;
}
/* the gallery fills the column height so cards match the form's height */
.tshow-split-left .tshow-stage { max-width: none; margin: 0; flex: 1; }
.tshow-form {
  display: flex; flex-direction: column; gap: 10px;
  background: var(--paper, #fff);
  border: 1px solid var(--border, rgba(31,26,20,.09));
  border-radius: 18px;
  padding: clamp(1rem, 1.6vw, 1.4rem);
  box-shadow: 0 18px 44px -24px rgba(31,28,24,.22), 0 2px 8px -4px rgba(31,28,24,.06);
}
.tshow-form-head { display: flex; flex-direction: column; gap: 2px; margin-bottom: 0; }
.tshow-form-eyebrow {
  font-size: 10.5px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase;
  color: var(--wn-saffron, #FF9933);
}
.tshow-form-h {
  margin: 0; font-family: var(--display); font-size: 19px; font-weight: 800;
  letter-spacing: -.02em; color: var(--ink);
}
.tshow-form-note { margin: 0; font-size: 12.5px; line-height: 1.5; color: var(--ink3); }
/* avatar row: thumbnail + label/actions */
.tshow-photo-row { display: flex; align-items: center; gap: 12px; }
.tshow-form-photo {
  flex: 0 0 auto;
  width: 56px; height: 56px; border-radius: 50%;
  cursor: pointer; padding: 0;
  border: 1.5px dashed var(--border, rgba(31,26,20,.22));
  background: rgba(255,153,51,.05);
  color: var(--ink3);
  display: flex; align-items: center; justify-content: center; overflow: hidden;
  transition: border-color .2s, background .2s;
}
.tshow-form-photo:hover { border-color: rgba(255,153,51,.5); background: rgba(255,153,51,.1); color: var(--wn-saffron, #FF9933); }
.tshow-form-photo.has-img { border-style: solid; border-color: rgba(255,153,51,.4); background: none; }
.tshow-form-photo-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.tshow-form-photo-ph { display: flex; align-items: center; justify-content: center; }
.tshow-photo-meta { display: flex; flex-direction: column; gap: 5px; min-width: 0; }
.tshow-photo-label { font-size: 11px; font-weight: 600; color: var(--ink2); }
.tshow-photo-actions { display: flex; align-items: center; gap: 8px; }
.tshow-photo-btn {
  font-family: var(--sans); font-size: 11.5px; font-weight: 600; cursor: pointer;
  padding: 5px 12px; border-radius: 8px;
  border: 1px solid var(--border, rgba(31,26,20,.14));
  background: var(--surf-1, #FFFCF8); color: var(--ink);
  transition: border-color .18s, background .18s, color .18s;
}
.tshow-photo-btn:hover { border-color: rgba(255,153,51,.45); color: var(--wn-saffron-deep, #E07A12); }
.tshow-photo-btn.ghost { background: none; color: var(--ink3); border-color: transparent; }
.tshow-photo-btn.ghost:hover { color: #c0392b; }
.tshow-field { display: flex; flex-direction: column; gap: 3px; }
.tshow-field-l { font-size: 11px; font-weight: 600; color: var(--ink2); }
.tshow-field-l i { color: var(--wn-saffron, #FF9933); font-style: normal; margin-left: 2px; }
.tshow-input {
  font-family: var(--sans); font-size: 13px; color: var(--ink);
  padding: 11px 11px; border-radius: 14px;
  border: 1px solid var(--border, rgba(31,26,20,.12));
  background: var(--surf-1, #FFFCF8);
  transition: border-color .18s, box-shadow .18s;
  width: 100%;
}
.tshow-input:focus {
  outline: none; border-color: var(--wn-saffron, #FF9933);
  box-shadow: 0 0 0 3px rgba(255,153,51,.14);
}
.tshow-textarea { resize: vertical; line-height: 1.55; }
.tshow-form-cta {
  margin-top: 2px;
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  height: 40px; border-radius: 50px; border: none; cursor: pointer;
  font-family: var(--sans); font-size: 13.5px; font-weight: 700; color: #fff;
  background: var(--wn-saffron, #FF9933);
  box-shadow: 0 8px 22px -6px rgba(255,153,51,.55);
  transition: transform .2s, background .2s, opacity .2s;
}
.tshow-form-cta:hover:not(:disabled) { background: var(--wn-saffron-deep, #E07A12); transform: translateY(-1px); }
.tshow-form-cta:disabled { opacity: .45; cursor: not-allowed; box-shadow: none; }
.tshow-form-hint { margin: -4px 0 0; font-size: 11px; color: var(--ink3); text-align: center; }

/* ── "Preparing your website" first-time overlay ── */
.coi-prep {
  position: fixed; inset: 0; z-index: 99999;
  display: flex; align-items: center; justify-content: center;
  background: rgba(12,10,8,.72);
  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
  animation: coiPrepFade .25s ease both;
}
.coi-prep-card {
  display: flex; flex-direction: column; align-items: center; gap: 14px;
  padding: 36px 44px; border-radius: 20px;
  background: var(--paper, #fff);
  box-shadow: 0 30px 80px -20px rgba(0,0,0,.5);
  text-align: center;
}
.coi-prep-spin {
  width: 38px; height: 38px; border-radius: 50%;
  border: 3px solid rgba(255,153,51,.18);
  border-top-color: var(--wn-saffron, #FF9933);
  animation: coiPrepSpin .8s linear infinite;
}
.coi-prep-t { font-family: var(--display); font-size: 17px; font-weight: 800; color: var(--ink); letter-spacing: -.01em; }
.coi-prep-sub { font-size: 12.5px; color: var(--ink3); }
@keyframes coiPrepSpin { to { transform: rotate(360deg); } }
@keyframes coiPrepFade { from { opacity: 0; } to { opacity: 1; } }
@media (max-width: 980px) {
  .tshow-split { grid-template-columns: 1fr; }
  /* stacked: give the gallery a fixed height since the form no longer sets it */
  .tshow-split-left .tshow-stage { flex: none; height: 62vh; min-height: 420px; }
}

/* ── mobile: native horizontal scroll-snap ── */
@media (max-width: 860px) {
  .tshow-stage { overflow-x: auto; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; }
  .tshow-track { transform: none !important; gap: 1.2rem; padding: 1rem clamp(1.25rem, 6vw, 2rem) 2rem; }
  .tshow-card { width: 82vw; scroll-snap-align: center; transform: none !important; }
  .tshow-card:hover { transform: none !important; }
  .tshow-card-hover { opacity: 1; background: linear-gradient(to top, rgba(15,12,8,.6), transparent 50%); }
  .tshow-head { flex-direction: column; align-items: flex-start; gap: 1.2rem; }
}
@media (prefers-reduced-motion: reduce) {
  .tshow-card { transition: none; }
  .tshow-track { transition: none; }
}


/* ═══════════════════════════════════════════════════════════════
   LIVE TEMPLATE EXPERIENCE — iframe preview, 80vh × 80vw
═══════════════════════════════════════════════════════════════ */
.texp{
  position:relative;
  z-index:4;
  padding:var(--section-y) 0;
  background: var(--surf-2, #FDF5EC);   /* opaque surface so it covers the hero behind it */
}
.texp-glow{
  position:absolute;inset:0;pointer-events:none;z-index:0;
  background:
    radial-gradient(ellipse 45% 40% at 80% 12%, rgba(255,153,51,.08) 0%, transparent 62%),
    radial-gradient(ellipse 50% 45% at 12% 90%, rgba(255,217,176,.14) 0%, transparent 65%);
}
.texp-head{
  position:relative;z-index:2;text-align:left;max-width:1180px;
  margin:0 auto clamp(1.4rem, 3vh, 2.4rem);
  padding:0 clamp(1.5rem, 5vw, 3rem);
}
.texp-eyebrow{
  display:inline-flex;align-items:center;gap:8px;
  font-family:var(--sans);font-size:13px;font-weight:600;letter-spacing:-.005em;
  color:var(--wn-saffron-deep,#E07A12);
  padding:6px 13px;border-radius:999px;
  background:rgba(255,153,51,.08);border:1px solid rgba(255,153,51,.2);
  margin-bottom:var(--s-3);
}
.texp-eyebrow::before,.texp-eyebrow::after{ content:none; }
.texp-h{
  margin:0;font-family:var(--display);
  font-size:clamp(30px,4vw,52px);font-weight:800;line-height:1.08;
  letter-spacing:-.03em;color:var(--ink);
}
.texp-h em{font-style:normal;color:var(--wn-saffron,#FF9933)}
.texp-sub{
  font-family:var(--sans);
  font-size:clamp(15px,1.1vw,17px);font-weight:400;line-height:1.6;color:var(--ink3);
  max-width:56ch;margin:var(--s-3) auto 0;
}

/* template switch tabs */
.texp-tabs{
  position:relative;z-index:2;
  display:flex;align-items:center;justify-content:center;gap:var(--s-1);flex-wrap:wrap;
  margin:var(--s-5) auto var(--s-4);padding:0 var(--section-x);max-width:1000px;
}
.texp-tab{
  display:inline-flex;align-items:center;gap:8px;
  padding:10px 18px;border-radius:999px;
  font-family:var(--sans);font-size:13px;font-weight:600;letter-spacing:-.005em;
  color:var(--ink3);
  background:#fff;border:1px solid var(--border);
  cursor:pointer;transition:all .25s cubic-bezier(.22,.87,.36,1);white-space:nowrap;
}
.texp-tab:hover{border-color:rgba(255,153,51,.45);color:var(--ink);transform:translateY(-1px)}
.texp-tab.on{
  background:var(--wn-saffron,#FF9933);color:#fff;border-color:var(--wn-saffron,#FF9933);
  box-shadow:0 10px 24px -10px rgba(255,153,51,.6);
}
.texp-tab-n{font-size:10px;font-weight:700;letter-spacing:.04em;opacity:.55}
.texp-tab.on .texp-tab-n{color:#fff;opacity:.9}

/* the experience stage */
.texp-stage{
  position:relative;z-index:2;
  width:min(98vw,1440px);margin:0 auto;
}
.texp-window{
  width:min(1500px,80%);
  // height:82vh;
  margin:0 auto;
  border-radius:var(--r-sm);
  overflow:hidden;
  background:#fff;
  border:1px solid var(--border);
  box-shadow:var(--shadow-lg);
}
.texp-chrome{
  display:flex;align-items:center;gap:8px;
  padding:13px 18px;background:#FBFAF8;
  border-bottom:1px solid var(--border2);
}
.texp-chrome-dot{width:11px;height:11px;border-radius:50%;background:rgba(31,28,24,.14)}
.texp-chrome-dot:nth-child(1){background:#FF9F8A}
.texp-chrome-dot:nth-child(2){background:#FFD27A}
.texp-chrome-dot:nth-child(3){background:#9BD8A0}
.texp-chrome-url{
  flex:1;text-align:center;font-family:var(--sans);font-size:12px;color:var(--ink4);
  background:#fff;border:1px solid var(--border2);
  border-radius:8px;padding:6px 14px;max-width:360px;margin:0 auto;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:-.01em;
}
.texp-chrome-live{
  display:inline-flex;align-items:center;gap:6px;flex-shrink:0;
  font-size:10.5px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;
  color:#2d7a4f;
}
.texp-chrome-live-dot{width:6px;height:6px;border-radius:50%;background:#3aa76d;box-shadow:0 0 0 3px rgba(58,167,109,.18);animation:pulseDot 2.2s ease-in-out infinite}
/* device toggle (mobile / tablet / desktop) in the chrome bar */
.texp-devices{display:inline-flex;gap:4px;flex-shrink:0}
.texp-device-btn{
  width:28px;height:24px;display:inline-flex;align-items:center;justify-content:center;
  border:1px solid var(--border2);border-radius:7px;background:#fff;
  font-size:13px;line-height:1;color:var(--ink4);cursor:pointer;
  transition:all .18s;
}
.texp-device-btn:hover{color:var(--ink3);border-color:var(--border)}
.texp-device-btn.on{
  background:var(--wn-saffron,#FF9933);border-color:var(--wn-saffron,#FF9933);color:#fff;
}
@media(max-width:640px){.texp-chrome-url,.texp-chrome-live{display:none}}

/* frame */
.texp-frame-wrap{
  /* fit the whole window (chrome bar + frame) inside one screen with padding:
     100vh − top/bottom section padding − chrome bar height */
  position:relative;width:100%;
  /* center the simulated device horizontally */
  display:flex;justify-content:center;align-items:stretch;
  height:calc(100svh - 2 * var(--section-y) - 56px);
  max-height:760px;min-height:420px;
  background:var(--surf-1);
  overflow:hidden;
  overscroll-behavior: contain;

}
/* holds the device-sized iframe and never lets it exceed the wrap width */
.texp-frame-scaler{
  height:100%;max-width:100%;display:flex;
}
.texp-frame{
  height:100%;border:0;display:block;background:#fff;max-width:100%;
}
.texp-loading{
  position:absolute;inset:0;z-index:2;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:var(--s-2);
  background:var(--surf-1);
}
.texp-spin{
  width:26px;height:26px;border-radius:50%;
  border:2px solid rgba(31,26,20,.12);border-top-color:var(--wn-saffron,#FF9933);
  animation:spin .7s linear infinite;
}
.texp-loading-t{font-family:var(--sans);font-size:13px;color:var(--ink3);letter-spacing:.01em}

/* footer under the window */
.texp-foot{
  display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;
  margin-top:1.1rem;
}
.texp-foot-name{
  font-family: var(--display);font-size:16px;color:var(--wn-text,#1F1C18);letter-spacing:-.01em;
}
.texp-foot-name span{font-family:var(--sans);font-size:12.5px;font-weight:300;color:var(--wn-muted-2,#9A9387)}
.texp-foot-cta{
  display:inline-flex;align-items:center;gap:8px;
  height:44px;padding:0 22px;border-radius:999px;
  font-family:var(--sans);font-size:13.5px;font-weight:500;color:#fff;
  text-decoration:none;background:var(--wn-saffron,#FF9933);letter-spacing:-.005em;
  box-shadow:0 1px 0 rgba(255,255,255,.25) inset,0 10px 26px -8px rgba(255,153,51,.55);
  transition:all .25s;
}
.texp-foot-cta svg{transition:transform .25s}
.texp-foot-cta:hover{background:var(--wn-saffron-deep,#E07A12);transform:translateY(-1px)}
.texp-foot-cta:hover svg{transform:translateX(3px)}

@media(max-width:980px){
  .texp-stage{width:90vw}
}
@media(max-width:640px){
  .texp-stage{width:92vw}
  .texp-frame-wrap{height:calc(100svh - 2 * var(--section-y) - 52px);min-height:360px}
}


/* ═══════════════════════════════════════════════════════════════
   BIG WORDMARK — shutter reveal on scroll (sits at the very bottom)
═══════════════════════════════════════════════════════════════ */
.bigmark{
  --reveal:0;
  position:relative;
  background:white;
  // background:var(--ink,#13140F);
  // color:#fff;
  overflow:hidden;
  min-height:min(78vh,640px);
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  padding:clamp(3rem,8vh,6rem) clamp(1.25rem,5vw,3rem) clamp(2rem,5vh,4rem);
  text-align:center;
  /* shutter: the WHOLE section opens upward as --reveal goes 0→1 */
  clip-path:inset(calc((1 - var(--reveal)) * 100%) 0 0 0);
  will-change:clip-path;
}
/* soft warm glow that fades in with the reveal */
.bigmark::before{
  content:'';position:absolute;inset:0;pointer-events:none;
  background:radial-gradient(ellipse 60% 50% at 50% 60%, rgba(255,153,51,calc(.10 * var(--reveal))) 0%, transparent 65%);
}
.bigmark-inner{
  position:relative;z-index:1;width:100%;
}
.bigmark-eyebrow{
  display:inline-block;
  font-family:var(--sans);font-size:11px;font-weight:500;
  letter-spacing:.24em;text-transform:uppercase;
  color:var(--gold2,#D9B062);
  margin-bottom:clamp(1.2rem,3vh,2rem);
  opacity:var(--reveal);
  transform:translateY(calc(14px * (1 - var(--reveal))));
  transition:opacity .2s linear, transform .2s linear;
}
.bigmark-word{
  margin:0;
  font-family:var(--serif);
  font-weight:400;line-height:.92;letter-spacing:-.01em;
  font-size:clamp(3rem,9vw,11rem);
  color:#ff9933;
}
.bigmark-copy{
  position:relative;z-index:1;
  margin-top:clamp(1.6rem,4vh,2.6rem);
  font-family:var(--sans);font-size:12.5px;font-weight:300;
  color:rgba(255,255,255,.4);letter-spacing:.01em;
  opacity:calc(var(--reveal) * var(--reveal));
}
@media(prefers-reduced-motion:reduce){
  .bigmark{clip-path:none}
  .bigmark-word{clip-path:none;transform:none}
  .bigmark-eyebrow,.bigmark-copy{opacity:1;transform:none}
}

/* ── BRAND FINALE ─────────────────────────────────────────────
   A calm, editorial closing section. The saffron wordmark reveals
   on scroll: each letter rises + fades in, framed by a small
   eyebrow, a thin gold rule, and a quiet tagline. Minimal luxury.
   Scroll progress drives --reveal (0→1). GPU-only transforms. */
.hangmark{
  --reveal:0;
  position:relative;
  z-index:8;
  background:
    radial-gradient(110% 80% at 50% 32%, rgba(255,153,51,calc(.07 + .05 * var(--reveal))) 0%, transparent 60%),
    linear-gradient(180deg, var(--surf-1) 0%, var(--surf-2) 100%);
  overflow:hidden;
  min-height:min(78vh,600px);
  display:flex;align-items:center;justify-content:center;
  /* guarantee comfortable gutters at both ends (min 20px) */
  padding:clamp(3rem,9vh,7rem) max(20px,clamp(1.25rem,5vw,3rem));
}
/* faint concentric ring framing the wordmark */
.hangmark::before{
  content:'';position:absolute;left:50%;top:50%;
  width:min(120vw,1100px);aspect-ratio:1;border-radius:50%;
  transform:translate(-50%,-50%) scale(calc(.92 + .08 * var(--reveal)));
  border:1px solid rgba(184,134,44,.14);
  box-shadow:0 0 0 1px rgba(184,134,44,.05), 0 0 120px rgba(255,153,51,.06) inset;
  opacity:calc(.4 + .6 * var(--reveal));pointer-events:none;
}
/* decorative curtain rod — the wordmark hangs from this */
.hangmark-rod{
  position:relative;
  width:min(88vw,920px);height:9px;border-radius:999px;z-index:2;
  background:linear-gradient(180deg,#fff6e4 0%,#E9C878 22%,#B8862C 60%,#8A6314 100%);
  box-shadow:0 4px 12px -4px rgba(120,80,20,.45), inset 0 1px 0 rgba(255,255,255,.6);
}
/* finial end caps (the decorative knobs on each end of the rod) */
.hangmark-rod::before,.hangmark-rod::after{
  content:'';position:absolute;top:50%;width:20px;height:20px;border-radius:50%;
  transform:translateY(-50%);
  background:radial-gradient(circle at 34% 28%,#fff7e6 0%,#E9C878 42%,#B8862C 72%,#7d5712 100%);
  box-shadow:0 3px 8px -2px rgba(120,80,20,.5), inset 0 1px 0 rgba(255,255,255,.5);
}
.hangmark-rod::before{left:-12px}
.hangmark-rod::after{right:-12px}

.hangmark-stage{
  position:relative;z-index:1;
  display:flex;flex-direction:column;align-items:center;text-align:center;
  width:100%;max-width:100%;
}
/* eyebrow — sits ABOVE the rod */
.hangmark-eyebrow{
  display:inline-flex;align-items:center;gap:.7em;
  font-family:var(--sans);font-size:clamp(10px,1.1vw,12px);font-weight:600;
  letter-spacing:.26em;text-transform:uppercase;color:var(--gold,#B8862C);
  margin-bottom:clamp(1.6rem,4vh,2.6rem);   /* gap to the rod below it */
  opacity:var(--reveal);
  transform:translateY(calc(12px * (1 - var(--reveal))));
  transition:opacity .25s linear,transform .25s linear;
}
.hangmark-eyebrow::before,.hangmark-eyebrow::after{
  content:'';width:clamp(20px,4vw,46px);height:1px;background:rgba(184,134,44,.5);
}

/* the whole hanging piece swings gently from a pivot up at the rod */
.hangmark-hang{
  position:relative;
  padding-top:clamp(2.4rem,6vh,4rem);       /* room for the threads */
  transform-origin:50% -8%;
  animation:hm-swing 7.5s ease-in-out infinite;
  will-change:transform;
}
/* two threads dropping from the rod to the wordmark */
.hangmark-thread{
  position:absolute;top:0;width:1.5px;height:clamp(2.4rem,6vh,4rem);
  background:linear-gradient(180deg,rgba(138,99,20,.55),rgba(184,134,44,.18));
  /* little hook ring at the top where it meets the rod */
}
.hangmark-thread::before{
  content:'';position:absolute;top:-4px;left:50%;transform:translateX(-50%);
  width:7px;height:7px;border-radius:50%;
  border:1.5px solid rgba(138,99,20,.6);background:#FBF8F2;
}
.hangmark-thread.l{left:22%}
.hangmark-thread.r{right:22%}
.hangmark-word{
  margin:0;
  font-family:var(--serif);
  font-weight:400;line-height:.95;letter-spacing:-.012em;
  /* sized so the full wordmark fits within the section padding on every width.
     ~6.4vw keeps "Counsellors of India" (≈20 chars) inside the viewport with
     comfortable side gutters; capped at 7rem so it stays elegant on desktop. */
  font-size:clamp(1.5rem,6.4vw,7rem);
  color:#FF9933;
  display:flex;flex-wrap:nowrap;justify-content:center;white-space:nowrap;
  max-width:100%;
}
/* each letter fades in staggered, then sways gently as if hanging */
.hangmark-ch{
  display:inline-block;white-space:pre;
  transform-origin:50% 0%;
  opacity:clamp(0, calc((var(--reveal) - var(--ci) * 0.02) * 6), 1);
  animation:hm-cloth 4.8s ease-in-out infinite;
  animation-delay:calc(var(--ci) * -0.16s);
  will-change:opacity,transform;
}
/* thin gold rule */
.hangmark-rule{
  height:1px;width:clamp(60px,18vw,180px);margin:clamp(2rem,5vh,3rem) 0 clamp(1rem,2.5vh,1.6rem);
  background:linear-gradient(90deg,transparent,rgba(184,134,44,.7),transparent);
  transform:scaleX(var(--reveal));transform-origin:center;
  transition:transform .3s ease;
}
/* tagline */
.hangmark-tag{
  margin:0;font-family:var(--sans);font-size:clamp(12px,1.5vw,15px);font-weight:300;
  letter-spacing:.01em;color:var(--ink3,#6E685F);max-width:34ch;
  opacity:calc(var(--reveal) * var(--reveal));
  transform:translateY(calc(10px * (1 - var(--reveal))));
  transition:opacity .25s linear,transform .25s linear;
}
@keyframes hm-swing{
  0%,100%{transform:rotate(-1.1deg)}
  50%{transform:rotate(1.1deg)}
}
@keyframes hm-cloth{
  0%,100%{transform:translateY(0) rotate(0deg)}
  50%{transform:translateY(2px) rotate(.4deg)}
}
@media(max-width:600px){
  .hangmark-thread.l{left:16%}
  .hangmark-thread.r{right:16%}
}
@media(prefers-reduced-motion:reduce){
  .hangmark-ch,.hangmark-eyebrow,.hangmark-tag{opacity:1;transform:none;animation:none}
  .hangmark-hang{animation:none}
  .hangmark-rule{transform:none}
}

/* OVERLAY */

.mobile-overlay{
  position: fixed;
  inset: 0;
  background: rgba(2,6,23,0);
  // backdrop-filter: blur(0px);
  // visibility: hidden;
  transition: 0.4s ease;
  z-index: 998;
}

.mobile-overlay.show{
  visibility: visible;
  background: rgba(2,6,23,0.55);
  // backdrop-filter: blur(8px);
}

/* SIDEBAR */
.mobile-sidebar{
  position: fixed;
  top: 12px;
  right: 12px;
  width: 88%;
  max-width: 380px;
  height: calc(100vh - 24px);
  border-radius: 32px 0 0 32px;

  /* hidden off-canvas by default. We use transform (not right:-100%)
     because an ancestor .nav has transform/backdrop-filter, which makes
     position:fixed resolve against the nav pill — not the viewport — so a
     percentage offset wouldn't push the panel fully off-screen. translateX
     is always relative to the element's own width, so it hides reliably. */
  transform: translateX(calc(100% + 24px));
  visibility: hidden;
  pointer-events: none;

  background:
    linear-gradient(
      145deg,
      #1a120b,
      #2b1d0e,
      #ff9933,
      #ffb866
    );

  background-size: 300% 300%;
  animation: gradientMove 10s ease infinite;


  backdrop-filter: blur(30px);

  border: 1px solid rgba(255,255,255,0.08);

  box-shadow:
    -20px 0 60px rgba(0,0,0,0.35);

  padding: 22px;
  display: flex;
  flex-direction: column;

  transition:
    transform 0.55s cubic-bezier(.16,1,.3,1),
    visibility 0s linear 0.55s;

  overflow: hidden;
  z-index: 999;
}


.mobile-sidebar::before{
  content: "";

  position: absolute;
  width: 260px;
  height: 260px;

  background:
    radial-gradient(
      circle,
      rgba(255,153,51,0.35),
      transparent 70%
    );


  top: -80px;
  right: -60px;

  filter: blur(10px);
}

.mobile-sidebar::after{
  content: "";

  position: absolute;
  width: 220px;
  height: 220px;

  background:
    radial-gradient(
      circle,
      rgba(255,190,92,0.28),
      transparent 70%
    );

  bottom: -100px;
  left: -80px;

  filter: blur(14px);
}

@keyframes gradientMove{
  0%{
    background-position: 0% 50%;
  }

  50%{
    background-position: 100% 50%;
  }

  100%{
    background-position: 0% 50%;
  }
}

.sidebar-brand h3,
.sidebar-links a,
.sidebar-card p,
.footer-link{
  color: white;
}

.sidebar-brand p,
.sidebar-links a span{
  color: rgba(255,255,255,0.65);
}



.sidebar-links a{
 background: rgba(255,255,255,0.12);


  color: white;
  border: 1px solid rgba(255,255,255,0.08);

  backdrop-filter: blur(12px);

  box-shadow:
    inset 0 1px 1px rgba(255,255,255,0.06);
}

.sidebar-links a:hover{


  transform: translateX(8px) scale(1.02);

  background: rgba(255,255,255,0.18);

  box-shadow:
    0 10px 30px rgba(255,153,51,0.25);
}

.mobile-sidebar.show{
  transform: translateX(0);
  visibility: visible;
  pointer-events: auto;
  transition:
    transform 0.55s cubic-bezier(.16,1,.3,1),
    visibility 0s linear 0s;
}

/* GLOW */

.sidebar-glow{
  position: absolute;
  width: 280px;
  height: 280px;
  background: radial-gradient(
    circle,
    rgba(99,102,241,0.22),
    transparent 70%
  );

  top: -100px;
  right: -100px;
  pointer-events: none;
}

/* TOP */

.sidebar-top{
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 50px;
  position: relative;
  z-index: 2;
}

.sidebar-brand{
  display: flex;
  align-items: center;
  gap: 14px;
}

.sidebar-brand img{
  width: 52px;
  height: 52px;
  border-radius: 18px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.12);
}

.sidebar-brand h3{
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1;
}

.sidebar-brand p{
  font-size: 14px;
  color: #64748b;
  margin-top: 4px;
}

/* LINKS */

.sidebar-links{
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  z-index: 2;
}

.sidebar-links a{
  position: relative;

  display: flex;
  align-items: center;
  gap: 16px;

  text-decoration: none;

  padding: 18px 20px;

  border-radius: 22px;

  color: #0f172a;
  font-size: 16px;
  font-weight: 600;

  background: rgba(255,255,255,0.42);

  border: 1px solid rgba(255,255,255,0.35);

  overflow: hidden;

  transition: all 0.32s cubic-bezier(.16,1,.3,1);
}

.sidebar-links a span{
  font-size: 12px;
  color: #64748b;
  font-weight: 700;
}

.sidebar-links a::before{
  content: "";

  position: absolute;
  inset: 0;

  background:
    linear-gradient(
      135deg,
      rgba(99,102,241,0.14),
      rgba(168,85,247,0.10)
    );

  opacity: 0;

  transition: 0.3s ease;
}

.sidebar-links a:hover::before{
  opacity: 1;
}

.sidebar-links a:hover{
  transform: translateX(8px) scale(1.02);

  box-shadow:
    0 12px 28px rgba(99,102,241,0.12);
}

/* CARD */

.sidebar-card{
  margin-top: auto;

  padding: 22px;

  border-radius: 28px;

  background:
    linear-gradient(
      135deg,
      rgba(0,0,0,0.35),
      rgba(255,255,255,0.08)
    );

  border: 1px solid rgba(255,255,255,0.1);

  backdrop-filter: blur(18px);


  color: white;

  position: relative;
  overflow: hidden;

  box-shadow:
    0 18px 40px rgba(15,23,42,0.28);
}

.sidebar-card::before{
  content: "";

  position: absolute;

  width: 180px;
  height: 180px;

  background: rgba(255,255,255,0.08);

  border-radius: 50%;

  right: -60px;
  top: -60px;
}

.sidebar-card p{
  font-size: 15px;
  line-height: 1.6;
  margin-bottom: 18px;
  position: relative;
  z-index: 2;
}

.sidebar-card .btn{
  width: 100%;
  justify-content: center;
  height: 52px;
  border-radius: 18px;
  position: relative;
  z-index: 2;
}

/* FOOTER */

.sidebar-footer{
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;

  padding-top: 22px;
}

.footer-link{
  text-decoration: none;
  color: #475569;
  font-size: 14px;
  font-weight: 600;
}

.footer-dot{
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #94a3b8;
}

/* PREMIUM MENU BUTTON */

.menu-btn{
  width: 48px;
  height: 48px;

  border: none;
  border-radius: 16px;

  background: rgba(255,255,255,0.65);

  backdrop-filter: blur(18px);

  box-shadow:
    0 10px 30px rgba(0,0,0,0.08);

  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  gap: 5px;

  cursor: pointer;

  /* sit above the pill, overlay (998) and sidebar (999) so the
     X stays tappable while the menu is open */
  position: relative;
  z-index: 1200;

  flex-shrink: 0;

  transition: all 0.35s ease;
}

.menu-btn span{
  width: 20px;
  height: 2px;

  background: #0f172a;

  border-radius: 999px;

  transition: 0.35s ease;
}

.menu-btn.active span:nth-child(1){
  transform: translateY(7px) rotate(45deg);
}

.menu-btn.active span:nth-child(2){
  opacity: 0;
}

.menu-btn.active span:nth-child(3){
  transform: translateY(-7px) rotate(-45deg);
}

.menu-btn:hover{
  transform: scale(1.06);
}

/* MOBILE */

@media (max-width: 980px){

  .nav-mid,
  .nav-r{
    display: none;
  }

  .menu-btn{
    display: flex;
  }
}

/* small phones — tighten the pill + give the sidebar a touch more room */
@media (max-width: 480px){

  .nav{
    height: 54px;shows 
    padding: 0 8px 0 14px;
  }

  .menu-btn{
    width: 44px;
    height: 44px;
    border-radius: 14px;
  }

  .mobile-sidebar{
    width: 92%;
    padding: 20px 18px;
    border-radius: 28px 0 0 28px;
  }

  .sidebar-top{
    margin-bottom: 32px;
  }

  .sidebar-links a{
    padding: 15px 18px;
    font-size: 15px;
  }
}

/* respect users who prefer reduced motion — kill the animated gradient */
@media (prefers-reduced-motion: reduce){

  .mobile-sidebar{
    animation: none;
  }

  .menu-btn,
  .menu-btn span,
  .sidebar-links a{
    transition: none;
  }
}




  .hero-quote-wrap {
  height: 40px;
  overflow: hidden;
  margin-top: 1rem;
  position: relative;
}

.hero-quote {
  font-size: 1rem;
  color: #5f5f5f;
  font-weight: 500;
  animation: fadeSlide 0.6s ease;
}

@keyframes fadeSlide {
  from {
    opacity: 0;
    transform: translateY(12px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}


.hero-heading-animate{
  display:inline-block;
  animation: heroFade .7s ease;
}

@keyframes heroFade{
  from{
    opacity:0;
    transform: translateY(20px);
  }
  to{
    opacity:1;
    transform: translateY(0);
  }
}


















.tshow-iframe-tabs {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  padding: 0 clamp(1.5rem, 5vw, 3rem);
  margin-bottom: 1rem;
}
.tshow-iframe-tab {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 16px;
  border-radius: 999px;
  font-family: var(--sans);
  font-size: 12.5px;
  font-weight: 500;
  color: var(--ink3);
  background: var(--paper);
  border: 1px solid var(--border);
  cursor: pointer;
  white-space: nowrap;
  transition: all .22s cubic-bezier(.22,.87,.36,1);
}
.tshow-iframe-tab:hover {
  border-color: rgba(255,153,51,.45);
  color: var(--ink);
  transform: translateY(-1px);
}
.tshow-iframe-tab.on {
  background: var(--wn-saffron, #FF9933);
  color: #fff;

  border-color: var(--wn-saffron, #FF9933);
  box-shadow: 0 8px 20px -8px rgba(255,153,51,.55);
}
.tshow-iframe-tab-n {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .05em;
  opacity: .55;
}
.tshow-iframe-tab.on .tshow-iframe-tab-n { opacity: .9; }
.tshow-iframe-browser {
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(31,28,24,.08);

  box-shadow:
    0 2px 0 rgba(255,255,255,.7) inset,
    0 20px 60px -20px rgba(31,28,24,.22),
    0 6px 20px -8px rgba(31,28,24,.1);

  margin: 0;
  width: 100%;
  height: auto;
  max-height:70vh;
}
.tshow-iframe-chrome {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: #F2EDE6;
  border-bottom: 1px solid rgba(31,28,24,.07);
}
.tshow-iframe-dots {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}
.tshow-iframe-dots span { width: 10px; height: 10px; border-radius: 50%; }
.tshow-iframe-dots span:nth-child(1) { background: #FF5F57; }
.tshow-iframe-dots span:nth-child(2) { background: #FFBD2E; }
.tshow-iframe-dots span:nth-child(3) { background: #28C840; }
.tshow-iframe-url {
  flex: 1;
  text-align: center;
  font-family: var(--sans);
  font-size: 11.5px;
  color: var(--ink4);
  background: rgba(255,255,255,.7);
  border: 1px solid rgba(31,28,24,.07);
  border-radius: 6px;
  padding: 5px 14px;
  max-width: 340px;
  margin: 0 auto;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -.01em;
}
.tshow-iframe-live {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--sans);
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: .04em;
  color: #2d7a4f;
  flex-shrink: 0;
}
.tshow-iframe-wrap {
  position: relative;
  width: 100%;
  overflow: hidden;
  background: var(--surf-1);
}
.tshow-iframe-loading {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: var(--surf-1);
}
.tshow-iframe-spin {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 2px solid rgba(31,26,20,.1);
  border-top-color: var(--wn-saffron, #FF9933);
  animation: spin .7s linear infinite;
}
.tshow-iframe-loading-t {
  font-family: var(--sans);
  font-size: 13px;
  color: var(--ink3);
  letter-spacing: .01em;
}



/* ========================================
   OVERLAY
======================================== */

.mobile-overlay {
  position: fixed;
  inset: 0;
  background: rgba(255, 153, 51, 0.08);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  opacity: 0;
  visibility: hidden;
  transition: all 0.35s ease;
  z-index: 999;
}

.mobile-overlay.show {
  opacity: 1;
  visibility: visible;
}

/* ========================================
   SIDEBAR
======================================== */

.mobile-sidebar {
  position: fixed;
  top: 0;
  right: 0;

  width: min(88vw, 380px);
  height: 100vh;

  background: #ffffff;

  display: flex;
  flex-direction: column;

  padding: 28px;

  transform: translateX(100%);
  transition: transform 0.4s cubic-bezier(.22,1,.36,1);

  z-index: 1000;

  overflow-y: auto;

  border-left: 1px solid rgba(255, 153, 51, 0.15);

  box-shadow:
    -20px 0 60px rgba(255, 153, 51, 0.12);
}

.mobile-sidebar.show {
  transform: translateX(0);
}

/* ========================================
   ORANGE GLOW
======================================== */

.sidebar-glow {
  position: absolute;
  top: -100px;
  right: -100px;

  width: 240px;
  height: 240px;

  border-radius: 50%;

  background: rgba(255, 153, 51, 0.15);

  filter: blur(80px);

  pointer-events: none;
}

/* ========================================
   TOP AREA
======================================== */

.sidebar-top {
  position: relative;

  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-bottom: 42px;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 14px;
}

.sidebar-brand img {
  width: 52px;
  height: 52px;
  object-fit: contain;
}

.sidebar-brand h3 {
  font-size: 1.05rem;
  font-weight: 700;
  color: #111;
  margin: 0;
  line-height: 1.1;
}

.sidebar-brand p {
  margin: 0;
  font-size: 0.88rem;
  color: #666;
}

/* ========================================
   NAVIGATION
======================================== */

.sidebar-links {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sidebar-links a {
  position: relative;

  display: flex;
  align-items: center;
  gap: 14px;

  text-decoration: none;

  color: #111;

  font-size: 1rem;
  font-weight: 600;

  padding: 16px 18px;

  border-radius: 18px;

  transition: all 0.25s ease;
}

.sidebar-links a span {
  color: #ff9933;
  font-size: 0.8rem;
  font-weight: 700;
  min-width: 24px;
}

.sidebar-links a:hover {
  background: rgba(255, 153, 51, 0.08);
  transform: translateX(6px);
}

.sidebar-links a::after {
  content: "";
  position: absolute;
  right: 18px;

  width: 6px;
  height: 6px;

  border-radius: 50%;

  background: #ff9933;

  opacity: 0;

  transition: all 0.25s ease;
}

.sidebar-links a:hover::after {
  opacity: 1;
}

/* ========================================
   CTA CARD
======================================== */

.sidebar-card {
  margin-top: 32px;

  padding: 24px;

  border-radius: 24px;

  background:
    linear-gradient(
      135deg,
      rgba(255,153,51,0.08),
      rgba(255,153,51,0.02)
    );

  border: 1px solid rgba(255,153,51,0.18);
}

.sidebar-card p {
  color: #222;

  font-size: 0.95rem;
  line-height: 1.6;

  margin-bottom: 18px;

  font-weight: 500;
}

/* ========================================
   PRIMARY BUTTON
======================================== */

.sidebar-card .btn {
  width: 100%;

  height: 52px;

  border-radius: 16px;

  background: #ff9933;
  color: white;

  font-weight: 700;
  font-size: 0.95rem;

  display: flex;
  align-items: center;
  justify-content: center;

  text-decoration: none;

  transition: all 0.3s ease;

  box-shadow:
    0 10px 30px rgba(255,153,51,0.3);
}

.sidebar-card .btn:hover {
  transform: translateY(-2px);

  box-shadow:
    0 16px 35px rgba(255,153,51,0.35);
}

/* ========================================
   FOOTER
======================================== */

.sidebar-footer {
  margin-top: auto;

  padding-top: 28px;

  display: flex;
  justify-content: center;
  align-items: center;
  gap: 14px;
}

.footer-link {
  color: white;
  background-color:#ff9933;
  padding: 16px;
  border-radius:10px;
  text-decoration: none;

  font-size: 0.92rem;
  font-weight: 600;

  transition: all 0.25s ease;
}

.footer-link:hover {
  color: #ff9933;
  background-color : white;
}

.footer-dot {
  width: 5px;
  height: 5px;

  border-radius: 50%;

  background: #ff9933;
}

/* ========================================
   SCROLLBAR
======================================== */

.mobile-sidebar::-webkit-scrollbar {
  width: 5px;
}

.mobile-sidebar::-webkit-scrollbar-thumb {
  background: rgba(255,153,51,0.35);
  border-radius: 999px;
}

/* ========================================
   MOBILE
======================================== */

@media (max-width: 480px) {
  .mobile-sidebar {
    width: 92vw;
    padding: 24px;
  }

  .sidebar-links a {
    padding: 15px 16px;
  }
}


.sidebar-close {
  width: 44px;
  height: 44px;

  display: flex;
  align-items: center;
  justify-content: center;

  border: none;
  cursor: pointer;

  border-radius: 14px;

  background: rgba(255, 153, 51, 0.08);

  color: #ff9933;

  font-size: 1.25rem;
  font-weight: 600;

  transition: all 0.25s ease;
}

.sidebar-close:hover {
  background: #ff9933;
  color: #fff;

  transform: rotate(90deg);
}



/* Each device width makes the iframe a real browser window of that size, so
   the template's own @media breakpoints fire correctly inside the frame.
   max-width:100% keeps the wide frames from overflowing on small screens. */

/* Desktop */
.texp-frame.desktop{
  width:1280px;
  max-width:100%;
}

/* Tablet */
.texp-frame.tablet{
  width:768px;
  max-width:100%;
}

/* Mobile */
.texp-frame.mobile{
  width:390px;
  max-width:100%;
}
  
`

/* ─────────────────────────────────────────────────────────────────
   TEMPLATE MINI THUMBNAILS
───────────────────────────────────────────────────────────────── */
const TMPLS = [
  { id:'t1', name:'Warm & Simple',  desc:'Therapist · Ivory & Terracotta',  bg:'#F0EBE2', accent:'#b46b50', badge:'Therapist',            badgeClass:'badge-therapist',    img:'/t1.png', url:'/preview/classic1' },
  { id:'t2', name:'Dark & Bold',    desc:'Psychologist · Gold on Black',     bg:'#0B0D0E', accent:'#c9a35a', badge:'Psychologist',         badgeClass:'badge-psychologist', img:'/t2.png', url:'/preview/classic2' },
  { id:'t3', name:'Sage & Clean',   desc:'Counsellor · Green Minimal',       bg:'#F4F8F5', accent:'#3D7A6A', badge:'Relationship Counsellor', badgeClass:'badge-relationship', img:'/t3.png', url:'/preview/classic3' },
  { id:'t4', name:'Premium Black',  desc:'Trauma Specialist · Luxury Edit.', bg:'#080808', accent:'#D4AF37', badge:'Premium',              badgeClass:'badge-premium',      img:'/t4.png', url:'/preview/classic4' },
  { id:'t5', name:'Calm & Natural', desc:'Career Coach · Warm Greens',       bg:'#F7F4EF', accent:'#2D4A32', badge:'Career Coach',         badgeClass:'badge-career',       img:'/t5.png', url:'/preview/classic5' },
]

/* Full-page sized template renders (1280×720 logical, scaled down) */
const MINIS: Record<string,React.ReactNode> = {
  t1:(
    <div style={{background:'#F0EBE2',width:'100%',height:'100%',display:'flex',flexDirection:'column',fontFamily:'Georgia,serif'}}>
      <div style={{background:'rgba(240,235,226,.97)',borderBottom:'1px solid rgba(26,26,24,.08)',padding:'14px 28px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <span style={{fontSize:15,color:'#1a1a18',letterSpacing:'-.01em'}}>Dr. Karan Sharma</span>
        <span style={{fontSize:10,background:'#1a1a18',color:'#f0ebe2',padding:'5px 14px',borderRadius:4,letterSpacing:'.08em'}}>BOOK SESSION</span>
      </div>
      <div style={{flex:1,padding:'48px 60px',display:'flex',gap:48,alignItems:'center'}}>
        <div style={{flex:1}}>
          <div style={{fontSize:10,color:'#b46b50',letterSpacing:'.18em',textTransform:'uppercase',marginBottom:12}}>Clinical Psychologist · Mumbai</div>
          <div style={{fontSize:64,fontWeight:300,color:'#1a1a18',lineHeight:.95,letterSpacing:'-.03em',marginBottom:24}}>Karan<br/>Sharma</div>
          <div style={{fontSize:11,color:'#6a6a60',lineHeight:1.7,maxWidth:'44ch',marginBottom:28}}>A calm, trusted space for healing. Specialising in anxiety, relationships, and life transitions.</div>
          <div style={{display:'inline-block',background:'#1a1a18',color:'#f0ebe2',fontSize:10,padding:'10px 22px',borderRadius:4,letterSpacing:'.08em'}}>Begin your journey</div>
        </div>
        <div style={{width:260,height:300,borderRadius:16,background:'linear-gradient(135deg,#d8c9b0,#c2aa8a)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:80,color:'rgba(26,26,24,.08)',flexShrink:0,fontStyle:'italic'}}>PS</div>
      </div>
      <div style={{background:'#1a1a18',padding:'18px 60px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div style={{fontSize:12,color:'#f0ebe2',fontWeight:300,opacity:.55}}>Anxiety · Relationships · Life Transitions</div>
        <div style={{fontSize:12,color:'#c9a35a',fontStyle:'italic'}}>₹1,200 / session</div>
      </div>
    </div>
  ),
  t2:(
    <div style={{background:'#0b0d0e',width:'100%',height:'100%',display:'flex',flexDirection:'column',fontFamily:'Georgia,serif'}}>
      <div style={{padding:'14px 28px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'.5px solid rgba(255,255,255,.06)'}}>
        <span style={{fontSize:13,color:'rgba(236,229,215,.55)',letterSpacing:'.04em'}}>Vikram Nair</span>
        <span style={{fontSize:10,background:'rgba(201,163,90,.15)',color:'#c9a35a',padding:'5px 14px',borderRadius:4,letterSpacing:'.08em',border:'.5px solid rgba(201,163,90,.3)'}}>ENQUIRE</span>
      </div>
      <div style={{flex:1,padding:'60px',display:'flex',alignItems:'center',gap:60}}>
        <div style={{flex:1}}>
          <div style={{fontSize:9,letterSpacing:'.28em',textTransform:'uppercase',color:'#c9a35a',marginBottom:18,opacity:.8}}>Psychotherapist</div>
          <div style={{fontSize:72,color:'#ece5d7',lineHeight:.92,letterSpacing:'-.03em',marginBottom:28}}>Vikram<br/>Nair</div>
          <div style={{fontSize:11,color:'rgba(236,229,215,.35)',lineHeight:1.75,maxWidth:'40ch',marginBottom:32}}>Integrative therapy for individuals navigating identity, grief, and relationship complexity.</div>
          <div style={{display:'inline-block',background:'#c9a35a',color:'#1a1410',fontSize:10,padding:'11px 24px',letterSpacing:'.08em'}}>Begin</div>
        </div>
        <div style={{width:1,alignSelf:'stretch',background:'linear-gradient(180deg,transparent,rgba(201,163,90,.2),transparent)',flexShrink:0}}/>
        <div style={{display:'flex',flexDirection:'column',gap:20,alignItems:'flex-end'}}>
          {['Individual','Couples','Grief'].map(tag=>(
            <span key={tag} style={{fontSize:11,color:'rgba(236,229,215,.35)',padding:'6px 16px',border:'.5px solid rgba(255,255,255,.08)',borderRadius:2,letterSpacing:'.06em'}}>{tag}</span>
          ))}
        </div>
      </div>
      <div style={{background:'#131618',borderTop:'.5px solid rgba(255,255,255,.05)',padding:'14px 60px',display:'flex',justifyContent:'space-between'}}>
        <div style={{fontSize:10,color:'rgba(236,229,215,.22)',letterSpacing:'.06em'}}>12+ years · Online & In-person</div>
        <div style={{fontSize:12,color:'rgba(201,163,90,.6)',fontStyle:'italic'}}>₹2,000 / session</div>
      </div>
    </div>
  ),
  t3:(
    <div style={{background:'#F4F8F5',width:'100%',height:'100%',display:'flex',flexDirection:'column'}}>
      <div style={{background:'rgba(244,248,245,.96)',borderBottom:'1px solid rgba(28,43,38,.07)',padding:'14px 28px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <span style={{fontSize:14,color:'#1C2B26',fontFamily:'Georgia,serif',letterSpacing:'-.01em'}}>Karan Singh</span>
        <span style={{fontSize:10,background:'#3A6655',color:'#fff',padding:'5px 14px',borderRadius:100,letterSpacing:'.04em'}}>Book a session</span>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',flex:1}}>
        <div style={{padding:'60px 48px',display:'flex',flexDirection:'column',justifyContent:'center'}}>
          <div style={{fontSize:10,letterSpacing:'.16em',textTransform:'uppercase',color:'#3A6655',marginBottom:16,opacity:.7}}>Counsellor</div>
          <div style={{fontFamily:'Georgia,serif',fontSize:64,color:'#1C2B26',lineHeight:.95,marginBottom:8}}>Karan<br/><em style={{color:'#3A6655'}}>Singh</em></div>
          <div style={{height:2,width:48,background:'#3A6655',opacity:.3,margin:'20px 0'}}/>
          <div style={{fontSize:11,color:'#5a6e6a',lineHeight:1.75,maxWidth:'36ch',marginBottom:32}}>Creating space for clarity, growth, and authentic self-understanding.</div>
          <div style={{display:'inline-block',background:'#3A6655',color:'#fff',fontSize:10,padding:'10px 22px',borderRadius:100,width:'fit-content'}}>Begin today</div>
        </div>
        <div style={{background:'#1C2B26',display:'flex',alignItems:'center',justifyContent:'center',position:'relative'}}>
          <span style={{fontFamily:'Georgia,serif',fontSize:160,fontStyle:'italic',color:'rgba(255,255,255,.04)',lineHeight:1}}>A</span>
          <div style={{position:'absolute',bottom:32,left:0,right:0,textAlign:'center',fontSize:10,color:'rgba(255,255,255,.3)',letterSpacing:'.12em',textTransform:'uppercase'}}>Delhi · Online</div>
        </div>
      </div>
    </div>
  ),
  t4:(
    <div style={{background:'#080808',width:'100%',height:'100%',display:'flex',flexDirection:'column'}}>
      <div style={{padding:'14px 28px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'.5px solid rgba(212,175,55,.06)'}}>
        <span style={{fontSize:12,color:'rgba(232,232,232,.4)',letterSpacing:'.06em'}}>Dr. Rahul Verma</span>
        <span style={{fontSize:10,background:'transparent',color:'#D4AF37',padding:'5px 14px',borderRadius:3,border:'.5px solid rgba(212,175,55,.3)',letterSpacing:'.1em'}}>CONSULT</span>
      </div>
      <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'60px',textAlign:'center',position:'relative'}}>
        <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at center,rgba(212,175,55,.05) 0%,transparent 65%)'}}/>
        <div style={{fontSize:10,letterSpacing:'.22em',textTransform:'uppercase',color:'rgba(212,175,55,.5)',marginBottom:24}}>Trauma & EMDR Specialist</div>
        <div style={{fontFamily:'Georgia,serif',fontSize:80,color:'#E8E8E8',lineHeight:.9,marginBottom:20,fontWeight:300,letterSpacing:'-.02em'}}>Dr. Rahul<br/>Verma</div>
        <div style={{height:.5,width:80,background:'rgba(212,175,55,.3)',margin:'0 auto 24px'}}/>
        <div style={{fontSize:11,color:'rgba(232,232,232,.28)',lineHeight:1.75,maxWidth:'42ch',marginBottom:40}}>Specialising in trauma recovery, EMDR, and complex PTSD with 12 years of clinical practice.</div>
        <div style={{display:'inline-block',background:'#D4AF37',color:'#080808',fontSize:10,padding:'12px 28px',letterSpacing:'.12em',textTransform:'uppercase',fontWeight:500}}>Begin</div>
      </div>
      <div style={{background:'#0e0e0e',borderTop:'.5px solid rgba(212,175,55,.06)',padding:'14px 60px',display:'flex',justifyContent:'space-between'}}>
        <div style={{fontSize:10,color:'rgba(232,232,232,.22)',letterSpacing:'.06em'}}>Trauma · EMDR · Complex PTSD · 12 Years</div>
        <div style={{fontSize:11,color:'rgba(212,175,55,.45)',fontStyle:'italic',fontFamily:'Georgia,serif'}}>₹2,500 / session</div>
      </div>
    </div>
  ),
  t5:(
    <div style={{background:'#F7F4EF',width:'100%',height:'100%',display:'flex',flexDirection:'column'}}>
      <div style={{background:'rgba(247,244,239,.97)',borderBottom:'1px solid rgba(30,26,20,.07)',padding:'14px 28px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <span style={{fontSize:14,fontFamily:'Georgia,serif',color:'#1E1A14',letterSpacing:'-.01em'}}>Meera Joshi</span>
        <span style={{fontSize:10,background:'#2D4A32',color:'#F7F4EF',padding:'5px 14px',borderRadius:100,letterSpacing:'.04em'}}>Book session</span>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',flex:1}}>
        <div style={{padding:'60px 48px',display:'flex',flexDirection:'column',justifyContent:'center'}}>
          <div style={{fontSize:9,letterSpacing:'.18em',textTransform:'uppercase',color:'#2D4A32',marginBottom:16,opacity:.65}}>CBT Therapist · Pune</div>
          <div style={{fontFamily:'Georgia,serif',fontSize:62,color:'#1E1A14',lineHeight:.95,marginBottom:24}}>Meera<br/><em style={{color:'#2D4A32'}}>Joshi</em></div>
          <div style={{fontSize:11,color:'#5a5245',lineHeight:1.75,maxWidth:'36ch',marginBottom:32}}>Calm, structured support for anxiety, burnout, and the weight of everyday life.</div>
          <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'#2D4A32',color:'#F7F4EF',fontSize:10,padding:'10px 22px',borderRadius:100,width:'fit-content'}}>
            Begin today
            <span style={{opacity:.6}}>→</span>
          </div>
        </div>
        <div style={{background:'#2D4A32',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:0,position:'relative'}}>
          <span style={{fontFamily:'Georgia,serif',fontSize:140,fontStyle:'italic',color:'rgba(255,255,255,.04)',lineHeight:1}}>M</span>
          <div style={{position:'absolute',bottom:40,left:0,right:0,display:'flex',justifyContent:'center',gap:16}}>
            {['Calm','Grounded','Safe'].map(w=>(
              <span key={w} style={{fontSize:9,color:'rgba(247,244,239,.3)',letterSpacing:'.1em',textTransform:'uppercase'}}>{w}</span>
            ))}
          </div>
        </div>
      </div>
      <div style={{background:'#EDE8DF',padding:'14px 60px',borderTop:'1px solid rgba(30,26,20,.07)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div style={{fontSize:11,fontFamily:'Georgia,serif',color:'#1E1A14',fontStyle:'italic',opacity:.5}}>Calm · Grounded · Safe</div>
        <div style={{fontSize:11,color:'#2D4A32',fontFamily:'Georgia,serif',fontStyle:'italic'}}>₹1,500 / session</div>
      </div>
    </div>
  ),
}

const AVP=[
  {bg:'#F0EDE8',t:'#3a3a30'},{bg:'#EBE8E4',t:'#3a3a30'},
  {bg:'#EDE9E2',t:'#13140F'},{bg:'#E8E5E0',t:'#3a3a30'},
  {bg:'#EEEBE6',t:'#13140F'},{bg:'#EAE7E2',t:'#3a3a30'},
]

const FILTERS = ['All','Anxiety','Depression','Trauma','Relationships','Burnout','Career','Online','In-person']

const PLANS_DATA = [
  { id:'starter', name:'Starter', price:'₹0.9',    period:'/ year', hi:true, badge:null,           feats:['professional therapist website','Custom domain' ,'Online Appointment Booking','Payment Collection ','Email confirmations','Client Dashboard', 'Shareable profile link', 'Up to 10 bookings per month'], cta:'Get Started', g:true  },
{ 
  id:'pro',
  name:'PRO',
  price:'₹2499',
  period:'/ year',
  hi:true,
  // badge:'Most popular',
  feats:[
    'Professional therapist website',
    'Custom domain',
    'Online appointment booking',
    'Payment collection',
    'Client dashboard',
    'Email confirmations',
    'Shareable profile link',
    'Unlimited bookings',
    'Featured Therapist Badge',
    'Higher Visibility in Directory',
    'Priority Support'
  ],
  cta:'Grow Your Practice',
  g:false
},  // { id:'clinic',  name:'Clinic',  price:'₹1,00,000', period:'/month', hi:false, badge:'Enterprise',   feats:['Everything in Growth','Multiple therapist accounts','Export notes PDF','Custom domain','Advanced analytics','Dedicated support'], cta:'Choose Clinic', g:true },
]

const TESTIS = [
  { q:"I had a fully working booking page within an hour of signing up. My clients love how clean and professional it looks.", n:'Dr. Karan M.', r:'Clinical Psychologist, Mumbai' },
  { q:"Before this I was managing everything on WhatsApp. Now my schedule is organised and I look credible.", n:'Rajan K.', r:'Therapist, Bangalore' },
  { q:"The templates are beautiful. I got three new clients in the first week just from sharing my profile link.", n:'Karan S.', r:'Counsellor, Delhi' },
]

/* ─────────────────────────────────────────────────────────────────
   THERAPIST CARD
───────────────────────────────────────────────────────────────── */
function TherapistCard({ t }: { t: any }) {
  const name   = t.full_name || t.name || 'Unnamed'
  const photo  = t.photo_url || ''
  const specs:string[] = t.specialties || t.specializations || []
  const fee    = t.fee_per_session ?? null
  const city   = t.city || t.location || ''
  const cred   = t.title || t.qualification || t.degree || ''
  const exp    = t.experience || 0
  const mode   = t.session_mode || ''
  const aidx   = name.charCodeAt(0) % AVP.length
  const apal   = AVP[aidx]
  const init   = name.split(' ').filter((w:string)=>!/^(dr|mr|mrs|ms|prof)\.?$/i.test(w)).map((w:string)=>w[0]).slice(0,2).join('').toUpperCase()||'?'
  const modeLabel = mode==='online'?'Online':mode==='offline'?'In-person':mode==='both'?'Online & In-person':''

  return (
    <a href={`/${t.username}`} target="_blank" rel="noopener noreferrer" className="tc">
      <div className="tc-top">
        <div className="tc-av" style={{background:photo?undefined:apal.bg,color:apal.t}}>
          {photo
            ? <img src={photo} alt={name} loading="lazy"/>
            : init
          }
        </div>
        <div className="tc-id">
          <div className="tc-name">{name}</div>
          {cred && <div className="tc-cred">{cred}</div>}
          {city && (
            <div className="tc-loc">
              <span className="tc-loc-dot"/>
              {city}
            </div>
          )}
        </div>
        {fee && (
          <div className="tc-fee-block">
            <div className="tc-fee">₹{fee.toLocaleString('en-IN')}</div>
            <div className="tc-fee-lbl">/ session</div>
          </div>
        )}
      </div>

      <div className="tc-div"/>

      <div className="tc-bottom">
        <div className="tc-tags">
          {specs.slice(0,2).map((s:string)=>(
            <span key={s} className="tc-tag">{s}</span>
          ))}
          {specs.length===0 && <span className="tc-tag" style={{opacity:.4}}>General practice</span>}
        </div>
        <div className="tc-pills">
          {exp>0 && <span className="tc-pill tc-pill-exp">{exp}+ yrs</span>}
          {modeLabel && <span className="tc-pill tc-pill-mode">{modeLabel}</span>}
        </div>
      </div>

      <span className="tc-arrow">↗</span>
    </a>
  )
}

function SkeletonCard() {
  return (
    <div className="tc-skel">
      <div style={{display:'flex',gap:14,alignItems:'flex-start'}}>
        <div className="sk" style={{width:56,height:56,borderRadius:12,flexShrink:0}}/>
        <div style={{flex:1,display:'flex',flexDirection:'column',gap:8}}>
          <div className="sk" style={{height:19,width:'55%'}}/>
          <div className="sk" style={{height:12,width:'38%'}}/>
          <div className="sk" style={{height:11,width:'26%'}}/>
        </div>
        <div className="sk" style={{width:60,height:34,borderRadius:5,flexShrink:0}}/>
      </div>
      <div className="sk" style={{height:1,margin:'16px 0'}}/>
      <div style={{display:'flex',gap:6}}>
        {[64,80].map(w=><div key={w} className="sk" style={{height:22,width:w,borderRadius:100}}/>)}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   HERO TEMPLATE PEEK — reuses the real t2 thumbnail, scaled to fit
───────────────────────────────────────────────────────────────── */
function HeroTemplatePeek() {
  const ref = useRef<HTMLDivElement>(null)
  const [sc,setSc] = useState(.32)
  useEffect(()=>{
    function m(){ if(!ref.current) return; const w=ref.current.getBoundingClientRect().width; if(w>0) setSc(w/320) }
    requestAnimationFrame(()=>requestAnimationFrame(m))
    const ro=new ResizeObserver(m); if(ref.current) ro.observe(ref.current)
    return ()=>ro.disconnect()
  },[])
  return (
    <div className="hs-tmpl">
      <div className="hs-tmpl-thumb" ref={ref}>
        <div className="hs-tmpl-thumb-inner" style={{transform:`scale(${sc})`}}>
          {MINIS['t2']}
        </div>
      </div>
      <div className="hs-tmpl-foot">
        <span className="hs-tmpl-foot-t">Dark & Bold</span>
        <span className="hs-tmpl-foot-n">02</span>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   TEMPLATE CAROUSEL — full-width slide with browser chrome
───────────────────────────────────────────────────────────────── */
/* ─────────────────────────────────────────────────────────────────
   TEMPLATE SHOWCASE v3 — Two-column editorial layout
───────────────────────────────────────────────────────────────── */
const TMPL_ACCENTS = ['#b46b50','#c9a35a','#3D7A6A','#D4AF37','#2D4A32']

/* Order for the scrolling showcase (section 3): t3 (Sage & Clean) is the
   default centred card on load, so it leads. The rest keep their original
   order after it. (Other components still use the original TMPLS order.) */
const SHOWCASE_TMPLS = [
  ...TMPLS.filter(t => t.id === 't3'),
  ...TMPLS.filter(t => t.id !== 't3'),
]

/* Live "experience the template" section — embeds the real template site in
   an iframe (80vh × 80vw) so visitors feel exactly what they'll get after
   payment. Defaults to template 4 (Premium Black). */
/* Giant wordmark revealed with a smooth "shutter" as you scroll to the very
   bottom — hidden by default, opens upward as the section enters view. */
function BigWordmark() {
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let raf = 0
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        const r = el.getBoundingClientRect()
        const vh = window.innerHeight
        // progress 0 → 1 as the section travels from just-entering to centred
        const p = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.9)))
        el.style.setProperty('--reveal', String(p))
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => { window.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf) }
  }, [])

  return (
    <section ref={ref} className="bigmark" aria-label="Counsellors of India">
      <div className="bigmark-inner">
        {/* <span className="bigmark-eyebrow">Built in India — for India</span> */}
        <h2 className="bigmark-word">Counsellors of India</h2>
      </div>
      {/* <p className="bigmark-copy">© {new Date().getFullYear()} Counsellors of India — A calm home for every practice.</p> */}
    </section>
  )
}

/* White section with the saffron wordmark hanging from a rod, swaying gently. */
/* Mini UI mockups for the four "How it works" steps. Pure CSS/markup —
   each is a little browser window showing the real screen the step refers to:
   1) sign-up page  2) build-your-profile form  3) dashboard + shareable link
   4) appointments list. They scale to fill the card. */
/* ─── HOW IT WORKS — connected vertical timeline ───────────────────
   A single elegant spine with 4 numbered nodes. The connector "draws"
   (fills with gold) as the section scrolls through the viewport, and each
   step rises in as its node passes the mid-line. Calm, editorial, premium.
   Refined line icons replace the old app mockups. */
const HOW_STEPS = [
  {
    n: '01',
    t: 'Create your account',
    d: 'Sign up with your name and email. Takes under a minute and gets you instant access to your therapist dashboard.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="8" r="3.4" />
        <path d="M5 20c0-3.6 3.1-5.6 7-5.6s7 2 7 5.6" />
      </svg>
    ),
  },
  {
    n: '02',
    t: 'Build your profile',
    d: 'Add credentials, approach, availability, and a photo. Choose a premium template that matches your practice tone.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="4" y="3.5" width="16" height="17" rx="2.5" />
        <path d="M8 8h8M8 12h8M8 16h5" />
      </svg>
    ),
  },
  {
    n: '03',
    t: 'Share your link',
    d: 'Send your personal page link via WhatsApp, email, or Instagram. Clients book sessions directly through your profile.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="6.5" cy="12" r="2.6" />
        <circle cx="17.5" cy="6" r="2.6" />
        <circle cx="17.5" cy="18" r="2.6" />
        <path d="M8.8 10.8 15.2 7.2M8.8 13.2l6.4 3.6" />
      </svg>
    ),
  },
  {
    n: '04',
    t: 'Manage bookings',
    d: 'Accept appointments, track clients, and write secure session notes, all from one calm, focused dashboard.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
        <path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" />
        <path d="m9.2 14.4 2 2 3.6-3.8" />
      </svg>
    ),
  },
]

function HowTimeline() {
  const ref = useRef<HTMLDivElement | null>(null)

  // Scroll-driven fill: --fill goes 0 → 1 as the timeline crosses the viewport
  // centre, drawing the gold connector. Nodes flip to .is-on once the fill
  // reaches them (pure CSS, driven off --fill). rAF-throttled, passive.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.style.setProperty('--fill', '1')
      return
    }
    let raf = 0
const onScroll = () => {
  if (raf) return
  raf = requestAnimationFrame(() => {
    raf = 0
    const r = el.getBoundingClientRect()
    const vh = window.innerHeight
    // Start when top enters at 80vh, end when bottom is at 40vh from top
    const start = vh * 0.8
    const end   = vh * 0.4
    const total = r.height + (start - end)          // total travel distance
    const traveled = start - r.top                  // how far we've scrolled
    const p = traveled / Math.max(1, total)
    el.style.setProperty('--fill', String(Math.min(1, Math.max(0, p))))
  })
}
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div ref={ref} className="how-tl" style={{ ['--fill' as string]: 0 }}>
      <div className="how-tl-spine" aria-hidden="true">
        <span className="how-tl-spine-fill" />
      </div>
      <ol className="how-tl-list">
        {HOW_STEPS.map((s, i) => (
          <li
            key={s.n}
            className="how-tl-step"
style={{
  ['--i' as string]: i,
  ['--at' as string]: Math.min(0.92, i / (HOW_STEPS.length - 1))
}}          >
            <div className="how-tl-node" aria-hidden="true">
              <span className="how-tl-node-icon">{s.icon}</span>
            </div>
            <div className="how-tl-body">
              <span className="how-tl-num">{s.n}</span>
              <h3 className="how-tl-t">{s.t}</h3>
              <p className="how-tl-d">{s.d}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

function StepMock({ step }: { step: number }) {
  return (
    <div className="smock">
      <div className="smock-body">

        {/* STEP 1 — the REAL sign-up page, embedded live + scaled to fit */}
        {step === 0 && (
          <div className="smk-live">
            <iframe
              className="smk-live-frame"
              src="/signup-preview"
              title="Sign-up page"
              loading="lazy"
              scrolling="no"
              tabIndex={-1}
              aria-hidden="true"
            />
            {/* transparent shield so the page reads as a static visual, not interactive */}
            <div className="smk-live-shield" aria-hidden="true" />
          </div>
        )}

        {/* STEP 2 — Build your profile (desktop: sidebar + form) */}
        {step === 1 && (
          <div className="smk-app">
            <aside className="smk-side">
              <div className="smk-appbrand sm"><span className="smk-pip" />Counsellors</div>
              <nav className="smk-nav">
                <span>Overview</span>
                <span className="on">Profile</span>
                <span>Appearance</span>
                <span>Appointments</span>
                <span>Payments</span>
              </nav>
            </aside>
            <div className="smk-main">
              <div className="smk-mainhead">
                <div>
                  <div className="smk-eyebrow">Step 1 of 3 · Your profile</div>
                  <div className="smk-h2">Build your profile</div>
                </div>
                <div className="smk-steps" aria-hidden="true">
                  <i className="done" /><i className="on" /><i />
                </div>
              </div>

              {/* identity row — avatar in context */}
              <div className="smk-idrow">
                <div className="smk-avatar lg"><span className="smk-usr" /></div>
                <div className="smk-grid2 smk-idrow-fields">
                  <div className="smk-field"><span className="smk-flabel">Full name</span><div className="smk-input">Dr. Karan Sharma</div></div>
                  <div className="smk-field"><span className="smk-flabel">City</span><div className="smk-input">Mumbai</div></div>
                </div>
              </div>

              <div className="smk-field"><span className="smk-flabel">Professional title</span><div className="smk-input">Clinical Psychologist · RCI Licensed</div></div>

              <div className="smk-field"><span className="smk-flabel">About your approach</span><div className="smk-area">A warm, collaborative space for anxiety &amp; burnout. CBT and trauma-informed care, helping clients move toward steadier, fuller lives.</div></div>

              <div className="smk-field">
                <span className="smk-flabel">Specialties <em className="smk-count">3 selected</em></span>
                <div className="smk-chips">
                  <span className="sel">? Anxiety</span>
                  <span className="sel">? Couples</span>
                  <span className="sel">? Grief</span>
                  <span>Trauma</span>
                  <span>Burnout</span>
                  <span>Depression</span>
                </div>
              </div>

              <div className="smk-grid2">
                <div className="smk-field"><span className="smk-flabel">Session fee</span><div className="smk-input smk-input-money"><i>₹</i>1,500</div></div>
                <div className="smk-field"><span className="smk-flabel">Years of experience</span><div className="smk-input">8 years</div></div>
              </div>

              <div className="smk-footer">
                <div className="smk-btn-ghost">Back</div>
                <div className="smk-cta smk-cta-inline">Save &amp; continue →</div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 — Dashboard + share link (desktop) */}
        {step === 2 && (
          <div className="smk-app">
            <aside className="smk-side">
              <div className="smk-appbrand sm"><span className="smk-pip" />Counsellors</div>
              <nav className="smk-nav">
                <span className="on">Overview</span>
                <span>Profile</span>
                <span>Appearance</span>
                <span>Appointments</span>
                <span>Payments</span>
              </nav>
            </aside>
            <div className="smk-main">
              <div className="smk-mainhead">
                <div>
                  <div className="smk-eyebrow">Step 3 of 3 · Dashboard</div>
                  <div className="smk-h2">Welcome back, Karan </div>
                </div>
                <div className="smk-steps" aria-hidden="true">
                  <i className="done" /><i className="done" /><i className="on" />
                </div>
              </div>
              <div className="smk-share">
                <span className="smk-globe" />
                <span className="smk-link">counsellorsofindia.com/priya-sharma</span>
                <span className="smk-copy">Copy link</span>
              </div>
              <div className="smk-stats smk-stats-3">
                <div className="smk-stat"><b>128</b><span>Profile views</span><i className="smk-up">▲ 12%</i></div>
                <div className="smk-stat"><b>14</b><span>Bookings</span><i className="smk-up">▲ 5%</i></div>
                <div className="smk-stat smk-stat-rate"><b>4.9</b><span>★★★★★ · 32 reviews</span></div>
              </div>
              <div className="smk-chart-wrap">
                <span className="smk-flabel">Bookings · last 7 days</span>
                <div className="smk-chart"><span /><span /><span /><span /><span /><span /><span /></div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4 — Appointments (desktop) */}
        {step === 3 && (
          <div className="smk-app">
            <aside className="smk-side">
              <div className="smk-appbrand sm"><span className="smk-pip" />Counsellors</div>
              <nav className="smk-nav">
                <span>Overview</span>
                <span>Profile</span>
                <span>Appearance</span>
                <span className="on">Appointments</span>
                <span>Payments</span>
              </nav>
            </aside>
            <div className="smk-main">
              <div className="smk-appttop">
                <div>
                  <div className="smk-eyebrow">Your practice · Schedule</div>
                  <div className="smk-h2">Appointments</div>
                </div>
                <span className="smk-pill-today">Today · 3</span>
              </div>
              {[
                { i: 'AM', n: 'Aarav Mehta', t: 'Today — 4:00 PM ✓ Anxiety', g: 'a', s: 'ok' },
                { i: 'SK', n: 'Sara Khan', t: 'Tomorrow — 11:30 AM — Couples', g: 'b', s: 'wait' },
                { i: 'RV', n: 'Rohan Verma', t: 'Fri — 6:00 PM — Grief', g: 'c', s: 'ok' },
                { i: 'IN', n: 'Isha Nair', t: 'Fri — 7:30 PM — Burnout', g: 'b', s: 'ok' },
              ].map((a) => (
                <div key={a.n} className="smk-appt">
                  <span className={`smk-ini g-${a.g}`}>{a.i}</span>
                  <div className="smk-apptmid"><b>{a.n}</b><span>{a.t}</span></div>
                  <span className={`smk-badge ${a.s === 'ok' ? 'is-ok' : 'is-wait'}`}>{a.s === 'ok' ? 'Confirmed' : 'Pending'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function HangingWordmark() {
  const text = 'Counsellors of India'
  const ref = useRef<HTMLElement | null>(null)

  // No scroll-driven --reveal here: the wordmark lives in a fixed 25vh strip
  // that is shown/hidden via the curtain (.faq-wordmark-reveal opacity). The
  // content's --reveal is forced to 1 in CSS so it is always fully drawn while
  // visible. Writing --reveal inline from JS would override that CSS and make
  // the text fade with scroll again, so it is intentionally removed.

  return (
    <section ref={ref} className="hangmark" aria-label="Counsellors of India">
      <div className="hangmark-stage">
        <span className="hangmark-eyebrow">Built in India · for India</span>
        {/* the rod, with the wordmark hanging from it by threads */}
        <div className="hangmark-rod" aria-hidden="true" />
        <div className="hangmark-hang">
        <span className="hangmark-thread l" aria-hidden="true" />
        <span className="hangmark-thread r" aria-hidden="true" />
        <h2 className="hangmark-word">
          {text.split('').map((ch, i) => (
            <span key={i} className="hangmark-ch" style={{ ['--ci' as string]: i }}>
              {ch === ' ' ? ' ' : ch}
            </span>
          ))}
        </h2>
        </div>
        <div className="hangmark-rule" />
        {/* <p className="hangmark-tag">A calm, premium home for every therapy practice.</p> */}
      </div>
    </section>
  )
}


function LiveTemplateExperience() {
  const EXP = [
    { id: 't1', n: 1, name: 'Warm & Simple',  desc: 'Ivory, soft terracotta' },
    { id: 't2', n: 2, name: 'Dark & Bold',    desc: 'Gold on deep black' },
    { id: 't3', n: 3, name: 'Sage & Clean',   desc: 'Green tones, minimal' },
    { id: 't4', n: 4, name: 'Premium Black',  desc: 'Luxury editorial' },
    { id: 't5', n: 5, name: 'Calm & Natural', desc: 'Warm greens, parchment' },
  ]
  const [active, setActive] = useState(2) // default → template 3 (Sage & Clean)
  const [loading, setLoading] = useState(true)
  const cur = EXP[active]


  // User explicitly chooses which device to preview (not driven by the real
  // browser width). The iframe itself is sized to the device width below, so
  // each template's own @media breakpoints fire correctly inside the frame.
  const [device, setDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')

const previewUrl = `/preview/classic${cur.n}`


  // Fallback: clear the loading overlay even if the iframe onLoad is missed
  // (lazy frames / dev hydration can swallow the event).
  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(t)
  }, [active, device])

  const frameClass =
  device === 'mobile'
    ? 'texp-frame mobile'
    : device === 'tablet'
    ? 'texp-frame tablet'
    : 'texp-frame desktop'

  return (
    <section id="experience" className="texp">

      
      {/* <div className="texp-glow" aria-hidden="true" /> */}
      <div className="texp-head">
        <h2 className="texp-h">Explore templates,<em>your way</em></h2>
      </div>

            <div className="texp-tabs" role="tablist" aria-label="Choose a template to experience">
        {EXP.map((t, i) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={active === i}
            className={`texp-tab ${active === i ? 'on' : ''}`}
            onClick={() => { if (i !== active) { setLoading(true); setActive(i) } }}
          >
            <span className="texp-tab-n">{String(t.n).padStart(2, '0')}</span>
            {t.name}
          </button>
        ))}
      </div>

      <div className="texp-stage">
        <div className="texp-window">
          <div className="texp-chrome">
            <span className="texp-chrome-dot" /><span className="texp-chrome-dot" /><span className="texp-chrome-dot" />
            <span className="texp-chrome-url">counsellorsofindia.com/your-name</span>
            {/* <div className="texp-devices" role="group" aria-label="Preview device">
              {(['mobile', 'tablet', 'desktop'] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  className={`texp-device-btn ${device === d ? 'on' : ''}`}
                  aria-pressed={device === d}
                  aria-label={`Preview ${d}`}
                  title={d.charAt(0).toUpperCase() + d.slice(1)}
                  onClick={() => { if (d !== device) { setLoading(true); setDevice(d) } }}
                >
                  {d === 'mobile' ? '▯' : d === 'tablet' ? '▭' : '▢'}
                </button>
              ))}
            </div> */}
            <span className="texp-chrome-live"><span className="texp-chrome-live-dot" />Live demo</span>
          </div>
          <div className="texp-frame-wrap">
            {loading && (
              <div className="texp-loading">
                <span className="texp-spin" />
                <span className="texp-loading-t">Loading {cur.name}…</span>
              </div>
            )}
            <div className="texp-frame-scaler">
              <iframe
                key={`${cur.id}-${device}`}
                className={frameClass}
                src={previewUrl}
                title={`${cur.name} live preview`}
                onLoad={() => setLoading(false)}
              />
            </div>
          </div>
        </div>

      </div>


    </section>
  )
}


// maps the showcase card ids (t1..t5) to the demoSession template ids
const TPARAM_TO_TEMPLATE_ID: Record<string, DemoProfile['template_id']> = {
  t1: 'classic', t2: 'classic2', t3: 'classic3', t4: 'classic4', t5: 'classic5',
}

// function TemplateShowcase({ onPreview }: { onPreview: (t: typeof TMPLS[0]) => void }) {
//   const [active, setActive] = useState(0)
//   const trackRef = useRef<HTMLDivElement>(null)
//   const stageRef = useRef<HTMLDivElement>(null)
//   const innerRefs = useRef<(HTMLDivElement | null)[]>([])
//   const [scales, setScales] = useState<number[]>(TMPLS.map(() => 1))

//   // Scale each 1080×675 mock to fill its card's 16:10 preview area
//   useEffect(() => {
//     function measure() {
//       setScales(innerRefs.current.map(el => {
//         const parent = el?.parentElement
//         if (!parent) return 1
//         const rect = parent.getBoundingClientRect()
//         const w = rect.width
//         return w > 0 ? w / 1080 : 1
//       }))
//     }
//     measure()
//     const ro = new ResizeObserver(measure)
//     innerRefs.current.forEach(el => { if (el?.parentElement) ro.observe(el.parentElement) })
//     window.addEventListener('resize', measure)
//     return () => { ro.disconnect(); window.removeEventListener('resize', measure) }
//   }, [])

//   // Compute translateX so the active card is centered in the stage
//   const [offset, setOffset] = useState(0)
//   useEffect(() => {
//     const stage = stageRef.current
//     const track = trackRef.current
//     if (!stage || !track) return
//     const cards = track.querySelectorAll<HTMLElement>('.tshow-card')
//     const card = cards[active]
//     if (!card) return
//     const stageW = stage.getBoundingClientRect().width
//     const cardLeft = card.offsetLeft
//     const cardW = card.offsetWidth
//     const paddingLeft = parseFloat(getComputedStyle(track).paddingLeft) || 0
//     // center the active card
//     const target = cardLeft - (stageW / 2 - cardW / 2) - paddingLeft
//     setOffset(Math.max(0, target))
//   }, [active])

//   const prev = () => setActive(a => Math.max(0, a - 1))
//   const next = () => setActive(a => Math.min(TMPLS.length - 1, a + 1))

//   // ── free hand-drag (mouse / touch) ───────────────────────────────
//   const [drag, setDrag] = useState(0)          // live finger/cursor delta
//   const [dragging, setDragging] = useState(false)
//   const startX = useRef(0)
//   const moved = useRef(0)

//   const onPointerDown = (e: React.PointerEvent) => {
//     startX.current = e.clientX
//     moved.current = 0
//     setDragging(true)
//     ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
//   }
//   const onPointerMove = (e: React.PointerEvent) => {
//     if (!dragging) return
//     const dx = e.clientX - startX.current
//     moved.current = dx
//     setDrag(dx)
//   }
//   const endDrag = () => {
//     if (!dragging) return
//     setDragging(false)
//     const dx = moved.current
//     setDrag(0)
//     // snap to nearest card based on how far the user dragged
//     const card = trackRef.current?.querySelector<HTMLElement>('.tshow-card')
//     const step = card ? card.offsetWidth + (parseFloat(getComputedStyle(trackRef.current!).gap) || 0) : 320
//     const jump = Math.round(-dx / step)
//     if (jump !== 0) setActive(a => Math.min(TMPLS.length - 1, Math.max(0, a + jump)))
//   }

//   // ── mouse-wheel: horizontal scroll steps through templates ───────
//   const wheelLock = useRef(false)
//   const onWheel = (e: React.WheelEvent) => {
//     const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
//     if (Math.abs(d) < 8 || wheelLock.current) return
//     wheelLock.current = true
//     if (d > 0) next(); else prev()
//     setTimeout(() => { wheelLock.current = false }, 320)
//   }

//   return (
//     <section id="templates" className="tshow sec-rise rv">
//       <div className="tshow-glow" aria-hidden="true" />

//       {/* ── header (outside / above the two columns) ── */}
//       <div className="tshow-head">
//         <div className="tshow-head-left">
//           <div className="tshow-eyebrow">Profile Templates</div>
//           <h2 className="tshow-h">Try<em> Demo</em></h2>
//           <p className="tshow-sub">
//             Every template is a complete, live therapist website. Browse like you're exploring real practices.
//           </p>
//         </div>
//         <div className="tshow-head-right">
//           <button className="tshow-nav-btn" onClick={prev} disabled={active === 0} aria-label="Previous">
//             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//               <polyline points="15 18 9 12 15 6"/>
//             </svg>
//           </button>
//           <button className="tshow-nav-btn" onClick={next} disabled={active === TMPLS.length - 1} aria-label="Next">
//             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//               <polyline points="9 18 15 12 9 6"/>
//             </svg>
//           </button>
//         </div>
//       </div>

//       {/* ── two equal columns: templates (left) + details form (right) ── */}
//       <div className="tshow-split">
//       <div className="tshow-split-left">

//       {/* ── gallery ── */}
//       <div
//         ref={stageRef}
//         className="tshow-stage"
//         onPointerDown={onPointerDown}
//         onPointerMove={onPointerMove}
//         onPointerUp={endDrag}
//         onPointerCancel={endDrag}
//         onWheel={onWheel}
//         style={{ cursor: dragging ? 'grabbing' : 'grab', touchAction: 'pan-y' }}
//       >
//         <div
//           ref={trackRef}
//           className="tshow-track"
//           style={{
//             transform: `translateX(${-offset + drag}px)`,
//             transition: dragging ? 'none' : undefined,
//           }}
//         >
//           {TMPLS.map((t, i) => {
//             const sc = scales[i] ?? 1
//             return (
//               <article
//                 key={t.id}
//                 className={`tshow-card ${active === i ? 'is-active' : ''}`}
//                 onClick={() => {
//                   // ignore clicks that were actually drags
//                   if (Math.abs(moved.current) > 6) return
//                   if (active !== i) { setActive(i); return }
//                   onPreview(t)
//                 }}
//                 tabIndex={0}
//                 onKeyDown={e => { if (e.key === 'Enter') { if (active === i) onPreview(t); else setActive(i) } }}
//                 aria-label={`${t.name} template`}
//               >
//                 {/* ── preview (fills the card; height matches the form) ── */}
//                 <div className="tshow-card-screen">

//                   {/* live dot badge */}
//                   <div className="tshow-card-live-badge">
//                     <span className="tshow-card-live-dot" />
//                     Live preview
//                   </div>

//                   {/* category badge */}
//                   {/* <span className={`tshow-card-badge ${t.badgeClass}`}>
//                     {t.badge}
//                   </span> */}

//                   {/* the actual template render, scaled down */}
//                   <div
//                     ref={el => { innerRefs.current[i] = el }}
//                     className="tshow-card-screen-inner"
//                     style={{ transform: `scale(${sc})`, transformOrigin: 'top left' }}
//                   >
//                     {MINIS[t.id]}
//                   </div>

//                   {/* hover overlay with CTAs */}
//                   <div className="tshow-card-hover">
//                     {/* <button
//                       type="button"
//                       className="tshow-btn tshow-btn-ghost"
//                       onClick={e => { e.stopPropagation(); onPreview(t) }}
//                     >
//                       <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                         <circle cx="12" cy="12" r="3"/><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/>
//                       </svg>
//                       Preview
//                     </button> */}
//                     <a
//                       href={`/try?t=${t.id}`}
//                       className="tshow-btn tshow-btn-solid"
//                       onClick={e => e.stopPropagation()}
//                     >
//                       Enter details
//                       <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                         <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
//                       </svg>
//                     </a>
//                   </div>
//                 </div>

//                 {/* ── minimal footer ── */}
//                 {/* <div className="tshow-card-foot">
//                   <div className="tshow-card-meta">
//                     <span className="tshow-card-num">{String(i + 1).padStart(2, '0')}</span>
//                     <div>
//                       <div className="tshow-card-name">{t.name}</div>
//                       <div className="tshow-card-desc">{t.desc}</div>
//                     </div>
//                   </div>
//                   <button
//                     type="button"
//                     className="tshow-card-open"
//                     onClick={e => { e.stopPropagation(); onPreview(t) }}
//                     aria-label={`Open ${t.name} live preview`}
//                   >
//                     <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                       <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
//                     </svg>
//                   </button>
//                 </div> */}
//               </article>
//             )
//           })}
//         </div>
//       </div>

//       {/* ── dots ── */}
//       <div className="tshow-progress" aria-label="Template navigation">
//         {TMPLS.map((t, i) => (
//           <button
//             key={t.id}
//             className={`tshow-progress-dot ${active === i ? 'on' : ''}`}
//             onClick={() => setActive(i)}
//             aria-label={`Go to ${t.name}`}
//           />
//         ))}
//       </div>
//       </div>{/* /tshow-split-left */}

//       {/* ── right column: minimal details form ── */}
//       <DemoForm
//         templateId={TPARAM_TO_TEMPLATE_ID[TMPLS[active].id]}
//         previewHref={`/try?t=${TMPLS[active].id}`}
//         activeName={TMPLS[active].name}
//       />
//       </div>{/* /tshow-split */}
//     </section>
//   )
// }

function TemplateShowcase({ onPreview }: { onPreview: (t: typeof TMPLS[0]) => void }) {

  const [active, setActive] = useState(0)
const [loading, setLoading] = useState(true)
const wrapperRef = useRef<HTMLDivElement>(null)
const [scale, setScale] = useState(1)
const [autoPlay, setAutoPlay] = useState(true)
const IFRAME_W = 1280
const IFRAME_H = 960

useEffect(() => {
  if (!autoPlay) return

  const interval = setInterval(() => {
    setActive((prev) => (prev + 1) % TMPLS.length)
  }, 4000)

  return () => clearInterval(interval)
}, [autoPlay])

useEffect(() => {
  function measure() {
    if (!wrapperRef.current) return
    const w = wrapperRef.current.getBoundingClientRect().width
    if (w > 0) setScale(w / IFRAME_W)
  }
  measure()
  const ro = new ResizeObserver(measure)
  if (wrapperRef.current) ro.observe(wrapperRef.current)
  window.addEventListener('resize', measure)
  return () => { ro.disconnect(); window.removeEventListener('resize', measure) }
}, [])

useEffect(() => {
  setLoading(true)
  const t = setTimeout(() => setLoading(false), 2500)
  return () => clearTimeout(t)
}, [active])

const cur = TMPLS[active]








return (
  <section id="templates" className="tshow sec-rise rv">
    <div className="tshow-glow" aria-hidden="true" />

    {/* header */}
    <div className="tshow-head">
      <div className="tshow-head-left">
        {/* <div className="tshow-eyebrow">Profile Templates</div> */}
        <h2 className="tshow-h ">Make your website,<em> Try Demo</em></h2>
        {/* <p className="tshow-sub">
          Every template is a complete, live therapist website. Browse like you&apos;re exploring real practices.
        </p> */}
      </div>
      <div className="tshow-head-right">
<button
  className="tshow-nav-btn"
  onClick={() => {
    setAutoPlay(false)

    setActive(prev =>
      prev === 0
        ? TMPLS.length - 1
        : prev - 1
    )
  }}
  aria-label="Previous"
>

          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
<button
  className="tshow-nav-btn"
  onClick={() => {
    setAutoPlay(false)

    setActive(prev =>
      (prev + 1) % TMPLS.length
    )
  }}
  aria-label="Next"
>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </div>

    {/* two columns */}
    <div className="tshow-split">

      {/* LEFT */}
      <div className="tshow-split-left">

        {/* tabs */}
        {/* <div className="tshow-iframe-tabs">
          {TMPLS.map((t, i) => (
            <button
              key={t.id}
              type="button"
              className={`tshow-iframe-tab ${active === i ? 'on' : ''}`}
              onClick={() => { if (i !== active) setActive(i) }}
            >
              <span className="tshow-iframe-tab-n">{String(i + 1).padStart(2, '0')}</span>
              {t.name}
            </button>
          ))}
        </div> */}

        {/* browser frame */}
<div
  className="tshow-iframe-browser"
  onMouseEnter={() => setAutoPlay(false)}
  onMouseLeave={() => setAutoPlay(true)}
>
            <div className="tshow-iframe-chrome">
            <div className="tshow-iframe-dots"><span /><span /><span /></div>
            <div className="tshow-iframe-url">counsellorsofindia.com/{cur.id}</div>
            <div className="tshow-iframe-live"><span className="tshow-card-live-dot" />Live</div>
          </div>

          <div ref={wrapperRef} className="tshow-iframe-wrap" style={{ height: `${IFRAME_H * scale}px` }}>
            {loading && (
              <div className="tshow-iframe-loading">
                <span className="tshow-iframe-spin" />
                <span className="tshow-iframe-loading-t">Loading {cur.name}&hellip;</span>
              </div>
            )}
            <iframe
              key={cur.id}
              src={cur.url}
              title={`${cur.name} live preview`}
              scrolling="no"
              tabIndex={-1}
              aria-hidden="true"
              onLoad={() => setLoading(false)}
              style={{
                width: `${IFRAME_W}px`,
                height: `${IFRAME_H}px`,
                border: 'none',
                display: 'block',
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                pointerEvents: 'none',
              }}
            />
          </div>
        </div>

        {/* dots */}
        {/* <div className="tshow-progress" aria-label="Template navigation">
          {TMPLS.map((t, i) => (
            <button key={t.id} className={`tshow-progress-dot ${active === i ? 'on' : ''}`} onClick={() => setActive(i)} aria-label={`Go to ${t.name}`} />
          ))}
        </div> */}

      </div>

      {/* RIGHT */}
      <DemoForm
        templateId={TPARAM_TO_TEMPLATE_ID[cur.id]}
        previewHref={`/try?t=${cur.id}`}
        activeName={cur.name}
      />

    </div>
  </section>
)



}

/* ── Minimal "Try with my details" form. Persists to the shared demoSession
   so the data follows the user across every template and into /try. ── */
function DemoForm({ templateId, previewHref, activeName }:
  { templateId: DemoProfile['template_id']; previewHref: string; activeName: string }) {
  const router = useRouter()
  // Start from emptyDemo() so the first client render matches the server
  // (localStorage isn't available during SSR). We hydrate real values after
  // mount, which avoids a hydration mismatch on input values and `disabled`.
  const [form, setForm] = useState<DemoProfile>(() => emptyDemo())
  const [mounted, setMounted] = useState(false)
  const [preparing, setPreparing] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // hydrate from storage on mount (loadDemo is SSR-safe but returns empty on server)
  useEffect(() => { setForm(loadDemo()); setMounted(true) }, [])

  function update(patch: Partial<DemoProfile>) {
    setForm(f => ({ ...f, ...patch }))
    saveDemo(patch)               // shared across templates immediately
  }

  function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    update({ photo_url: url })
  }

  // Only "ready" after mount so SSR and first client render agree (disabled stays true).
  const ready = mounted && !!(form.full_name && form.full_name.trim() && form.bio && form.bio.trim())

  function seePreview() {
    if (!ready) return
    // ensure the chosen template is saved before navigating
    saveDemo({ template_id: templateId })

    // Show "Preparing your website…" — but only the FIRST time ever.
    let seen = false
    try { seen = localStorage.getItem('coi_prepared_v1') === '1' } catch {}
    if (seen) { router.push(previewHref); return }

    try { localStorage.setItem('coi_prepared_v1', '1') } catch {}
    setPreparing(true)
    setTimeout(() => router.push(previewHref), 2500)
  }

  return (
    <>
    <form className="tshow-form" onSubmit={e => { e.preventDefault(); seePreview() }}>
      <div className="tshow-form-head">
        <div className="tshow-form-eyebrow">Enter Your details</div>
        {/* <h3 className="tshow-form-h">See it with your name on it</h3> */}
        {/* <p className="tshow-form-note">Fill a few fields, then preview them live in any template.</p> */}
      </div>

      {/* photo */}
      <div className="tshow-photo-row">
        <button
          type="button"
          className={`tshow-form-photo ${form.photo_url ? 'has-img' : ''}`}
          onClick={() => fileRef.current?.click()}
          aria-label={form.photo_url ? 'Change profile image' : 'Add profile image'}
        >
          {form.photo_url
            ? <img src={form.photo_url} alt="" className="tshow-form-photo-img" />
            : (
              <span className="tshow-form-photo-ph">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="2"/><path d="m21 15-4.5-4.5L7 20"/>
                </svg>
              </span>
            )}
        </button>
        <div className="tshow-photo-meta">
          <span className="tshow-photo-label">Profile image</span>
          <div className="tshow-photo-actions">
            <button type="button" className="tshow-photo-btn" onClick={() => fileRef.current?.click()}>
              {form.photo_url ? 'Change' : 'Upload'}
            </button>
            {form.photo_url && (
              <button type="button" className="tshow-photo-btn ghost" onClick={() => update({ photo_url: undefined })}>
                Remove
              </button>
            )}
          </div>
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPhoto} />

      <label className="tshow-field">
        <span className="tshow-field-l">Name<i>*</i></span>
        <input
          className="tshow-input"
          value={form.full_name ?? ''}
          onChange={e => update({ full_name: e.target.value })}
          placeholder="Dr. Karan Sharma"
        />
      </label>

      <label className="tshow-field">
        <span className="tshow-field-l">Title</span>
        <input
          className="tshow-input"
          value={form.title ?? ''}
          onChange={e => update({ title: e.target.value })}
          placeholder="Clinical Psychologist"
        />
      </label>

      {/* <label className="tshow-field">
        <span className="tshow-field-l">City</span>
        <input
          className="tshow-input"
          value={form.city ?? ''}
          onChange={e => update({ city: e.target.value })}
          placeholder="Mumbai"
        />
      </label> */}

      <label className="tshow-field">
        <span className="tshow-field-l">Bio<i>*</i></span>
        <textarea
          className="tshow-input tshow-textarea"
          rows={2}
          value={form.bio ?? ''}
          onChange={e => update({ bio: e.target.value })}
          placeholder="A calm, trusted space for healing — specialising in anxiety, relationships, and life transitions."
        />
      </label>

      <button type="submit" className="tshow-form-cta" disabled={!ready}>
        See preview in {activeName}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
        </svg>
      </button>
      {!ready && <p className="tshow-form-hint">Name and bio are required.</p>}
    </form>

    {preparing && (
      <div className="coi-prep" role="status" aria-live="polite">
        <div className="coi-prep-card">
          <span className="coi-prep-spin" aria-hidden="true" />
          <div className="coi-prep-t">Preparing your website…</div>
          <div className="coi-prep-sub">Building your live preview in {activeName}</div>
        </div>
      </div>
    )}
    </>
  )
}

function TemplateCarousel({ onPreview, onTry }: { onPreview: (t: typeof TMPLS[0]) => void; onTry: (t: typeof TMPLS[0]) => void }) {
  const [cur, setCur] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)
  const startX = useRef(0)
  const isDragging = useRef(false)

  const prev = () => setCur(c => Math.max(0, c - 1))
  const next = () => setCur(c => Math.min(TMPLS.length - 1, c + 1))

  // touch / mouse swipe
  const onPointerDown = (e: React.PointerEvent) => {
    startX.current = e.clientX
    isDragging.current = true
  }
  const onPointerUp = (e: React.PointerEvent) => {
    if (!isDragging.current) return
    isDragging.current = false
    const dx = e.clientX - startX.current
    if (dx < -50) next()
    else if (dx > 50) prev()
  }

  // Scale template preview to fill the card area
  const previewRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  useEffect(() => {
    function measure() {
      if (!previewRef.current) return
      const w = previewRef.current.getBoundingClientRect().width
      if (w > 0) setScale(w / 1280)
    }
    requestAnimationFrame(() => requestAnimationFrame(measure))
    const ro = new ResizeObserver(measure)
    if (previewRef.current) ro.observe(previewRef.current)
    return () => ro.disconnect()
  }, [])

  const t = TMPLS[cur]

  return (
    <div style={{position:'relative'}}>


      {/* ── viewport + track ── */}

      <div

        className="tmpl-viewport"

        onPointerDown={onPointerDown}

        onPointerUp={onPointerUp}

        onPointerCancel={() => { isDragging.current = false }}

      >

        {/* ── left arrow ── */}

        <button

          className="tmpl-arrow tmpl-arrow-prev"

          onClick={prev}

          disabled={cur === 0}

          aria-label="Previous template"

        >

          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">

            <polyline points="15 18 9 12 15 6"/>

          </svg>

        </button>

        {/* ── right arrow ── */}

        <button

          className="tmpl-arrow tmpl-arrow-next"

          onClick={next}

          disabled={cur === TMPLS.length - 1}

          aria-label="Next template"

        >

          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">

            <polyline points="9 18 15 12 9 6"/>

          </svg>

        </button>
        
        <div
          ref={trackRef}
          className="tmpl-track"
          style={{ transform: `translateX(-${cur * 100}%)` }}
        >
          {TMPLS.map((tmpl, i) => (
            <div key={tmpl.id} className="tmpl-slide" aria-hidden={i !== cur}>
              <div className="tmpl-card">
                {/* browser chrome bar */}
                <div className="tmpl-card-chrome">
                  <div className="tmpl-card-dots">
                    <div className="tmpl-card-dot"/>
                    <div className="tmpl-card-dot"/>
                    <div className="tmpl-card-dot"/>
                  </div>

                  <div className="tmpl-card-url">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    counsellorsofindia.com/{tmpl.name.toLowerCase().replace(/\s+/g,'-')}
                  </div>

                  <a
                    href={`/preview/classic${tmpl.id.replace('t', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tmpl-card-open"
                    onClick={e => e.stopPropagation()}
                  >
                    Open
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                      <polyline points="15 3 21 3 21 9"/>
                      <line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                  </a>
                </div>

                {/* full template preview — scaled to fill 16:9 */}
                <div
                  className="tmpl-card-preview"
                  ref={i === cur ? previewRef : undefined}
                  onClick={() => onPreview(tmpl)}
                >
                  <div
                    className="tmpl-card-preview-inner"
                    style={{ transform: `scale(${i === cur ? scale : scale})` }}
                  >
                    {MINIS[tmpl.id]}
                  </div>
                </div>

                {/* footer */}
                {/* <div className="tmpl-card-foot">
                  <div className="tmpl-card-foot-l">
                    <div className="tmpl-card-foot-name">{tmpl.name}</div>
                    <div className="tmpl-card-foot-desc">{tmpl.desc}</div>
                  </div>
                  <div className="tmpl-card-foot-r">
                    <button
                      type="button"
                      onClick={() => onPreview(tmpl)}
                      style={{
                        display:'inline-flex',alignItems:'center',gap:6,
                        fontSize:12,fontWeight:500,color:'var(--ink)',
                        padding:'7px 16px',borderRadius:6,
                        border:'1px solid var(--border)',background:'var(--paper)',
                        cursor:'pointer',transition:'all .2s',fontFamily:'var(--sans)',
                        letterSpacing:'-.005em',
                      }}
                    >
                      Full preview
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                      </svg>
                    </button>
                    <div className="tmpl-card-foot-num">0{i + 1} / 0{TMPLS.length}</div>
                  </div>
                </div> */}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── dot navigator ── */}
      <div className="tmpl-dots" role="tablist" aria-label="Template selector">
        {TMPLS.map((tmpl, i) => (
          <button
            key={tmpl.id}
            type="button"
            role="tab"
            aria-selected={cur === i}
            aria-label={tmpl.name}
            className={`tmpl-dot ${cur === i ? 'on' : ''}`}
            onClick={() => setCur(i)}
          />
        ))}
      </div>
    </div>
  )
}

function PreviewModal({ t, onClose }:{ t:typeof TMPLS[0]; onClose:()=>void }) {
  const [ok,setOk]=useState(false)
  const url=`/preview/classic${t.id.replace('t', '')}`
  useEffect(()=>{
    const fn=(e:KeyboardEvent)=>{ if(e.key==='Escape') onClose() }
    document.addEventListener('keydown',fn); document.body.style.overflow='hidden'
    return ()=>{ document.removeEventListener('keydown',fn); document.body.style.overflow='' }
  },[onClose])
  return (
    <div className="modal">
      <div className="mbar">
        <div style={{display:'flex',alignItems:'center',gap:12,minWidth:0}}>
          <span className="mbadge">Preview</span>
          <span className="mtitle">{t.name}</span>
        </div>
        <div className="mright">
          <a href={url} target="_blank" rel="noopener noreferrer" className="mopen">Open full ↗</a>
          <button className="mclose" onClick={onClose}>?</button>
        </div>
      </div>
      <div className="mbody">
        <div className={`mload ${ok?'gone':''}`}>
          <div className="mspin"/>
          <div className="mload-t">Loading {t.name}</div>
        </div>
        <iframe className="miframe" src={url} title={t.name} onLoad={()=>setOk(true)} style={{opacity:ok?1:0,transition:'opacity .3s'}}/>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   FAQ ITEM — calm accordion row
───────────────────────────────────────────────────────────────── */
function FaqItem({ q, a, idx }: { q: string; a: string; idx: number }) {
  const [open, setOpen] = useState(idx === 0)
  return (
    <div className={`faq-item ${open ? 'open' : ''}`}>
      <button
        type="button"
        className="faq-q"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
      >
        <span className="faq-q-text">{q}</span>
        <span className="faq-q-icon" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </span>
      </button>
      <div className="faq-a-wrap">
        <div className="faq-a">{a}</div>
      </div>
    </div>
  )
}

const quotes = [
  "Make your counselling websites in minutes",
  "Manage your clients on a dedicated dashbaord",
  "Accept bookings & payments with ease.",
];

/* ─────────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────────── */
export default function Home() {
  const [scrolled,setScrolled]=useState(false)
  const [menuOpen, setMenuOpen] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % quotes.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);
  // lock body scroll + allow Esc to close while the mobile sidebar is open
  useEffect(()=>{
    if(!menuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if(e.key === 'Escape') setMenuOpen(false) }
    document.addEventListener('keydown', onKey)
    return ()=>{
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  },[menuOpen])

  useEffect(()=>{
    let ticking = false
    const fn = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const y = window.scrollY
        setScrolled(y > 18)
        // Normalised hero-parallax progress (0 → 1 across first viewport)
        const sy = Math.min(1, Math.max(0, y / Math.max(1, window.innerHeight)))
        document.documentElement.style.setProperty('--sy', String(sy))
        ticking = false
      })
    }
    window.addEventListener('scroll', fn, { passive: true }); fn()
    return () => window.removeEventListener('scroll', fn)
  },[])

  useEffect(()=>{
    const obs=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting) e.target.classList.add('on')}),{threshold:.04})
    document.querySelectorAll('.rv').forEach(el=>obs.observe(el))
    return ()=>obs.disconnect()
  })

  // Lenis smooth scroll only — pin removed (was fighting variable-height lists)
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let cleanup: (() => void) | undefined
    let cancelled = false

    ;(async () => {
      const { default: Lenis } = await import('lenis')
      if (cancelled) return
      const lenis = new Lenis({ duration: 1.05, easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) })
      let rafId = 0
      const raf = (time: number) => { lenis.raf(time); rafId = requestAnimationFrame(raf) }
      rafId = requestAnimationFrame(raf)
      cleanup = () => { cancelAnimationFrame(rafId); lenis.destroy() }
    })()

    return () => { cancelled = true; cleanup?.() }
  }, [])

  const [previewT,setPreviewT]=useState<typeof TMPLS[0]|null>(null)
  const [therapists,setTherapists]=useState<any[]>([])
  const [loading,setLoading]=useState(true)
  const [search,setSearch]=useState('')
  const [filter,setFilter]=useState('All')




  useEffect(()=>{
    fetch('/api/public/therapists',{cache:'no-store'})
      .then(async r=>{
        const ct = r.headers.get('content-type') ?? ''
        if(!r.ok || !ct.includes('application/json')) return { therapists: [] }
        return r.json().catch(()=>({ therapists: [] }))
      })
      .then(d=>setTherapists((d.therapists??[]).filter((t:any)=>t.username)))
      .catch(console.error)
      .finally(()=>setLoading(false))
  },[])

  const filtered = useMemo(()=>{
    let list = therapists
    const q = search.trim().toLowerCase()
    if(q) list=list.filter(t=>[t.full_name,t.title,t.city,...(t.specialties??[])].join(' ').toLowerCase().includes(q))
    if(filter==='Online') list=list.filter(t=>t.session_mode==='online'||t.session_mode==='both')
    else if(filter==='In-person') list=list.filter(t=>t.session_mode==='offline'||t.session_mode==='both')
    else if(filter!=='All') list=list.filter(t=>(t.specialties??[]).some((s:string)=>s.toLowerCase().includes(filter.toLowerCase())))
    return list
  },[therapists,search,filter])

  // Marquee profiles — use real therapists if available, otherwise placeholder data
  const marqueeProfiles = useMemo(()=>{
    if(therapists.length>=6) return therapists
    const placeholders = [
      {full_name:'Dr. Karan Sharma', title:'Clinical Psychologist · Mumbai', username:'#'},
      {full_name:'Rajan Kumar',       title:'Psychotherapist · Bangalore',   username:'#'},
      {full_name:'Karan Singh',      title:'Counsellor · Delhi',            username:'#'},
      {full_name:'Dr. Rahul Verma',   title:'Trauma · EMDR · Mumbai',         username:'#'},
      {full_name:'Vikram Nair',       title:'Psychotherapist · Chennai',      username:'#'},
      {full_name:'Meera Joshi',       title:'CBT Therapist · Pune',           username:'#'},
      {full_name:'Dr. Kavya Iyer',    title:'Family Counsellor · Hyderabad',  username:'#'},
      {full_name:'Arjun Mehta',       title:'Career Counsellor · Gurgaon',    username:'#'},
    ]
    return [...therapists, ...placeholders].slice(0,12)
  },[therapists])




  return (
    <div className="pg">
      <style dangerouslySetInnerHTML={{__html:CSS}}/>
      
      {previewT && <PreviewModal t={previewT} onClose={()=>setPreviewT(null)}/>}


{/* ───────────────────────────── NAVBAR ───────────────────────────── */}
{/* ───────────────────────────── NAVBAR ───────────────────────────── */}
<nav className={`nav ${scrolled ? 'scrolled' : ''}`}>

  <Link href="/" className="logo">
    <img src="/coi.png" alt="Counsellors of India" className="logo-img"/>
    <span className=' ' >Counsellors of India</span>
  </Link>

  <div className="nav-mid">
    <a href="#hero" className="nav-a">Home</a>
    <a href="#templates" className="nav-a">Demo</a>
    <a href="#experience" className="nav-a">Templates</a>
    <a href="#how" className="nav-a">How it works</a>
    <a href="#therapists" className="nav-a">Therapists</a>
    <a href="#pricing" className="nav-a">Pricing</a>
  </div>

  <div className="nav-r">
    <Link href="/login" className="btn btn-line">
      Sign in
    </Link>

    <Link href="/signup" className="btn btn-dark">
      List your practice
    </Link>
  </div>

  {/* MENU BUTTON */}
  <button
    className={`menu-btn ${menuOpen ? "active" : ""}`}
    onClick={() => setMenuOpen(!menuOpen)}
  >
    <span></span>
    <span></span>
    <span></span>
  </button>

</nav>

{/* Overlay + sidebar live OUTSIDE <nav>: the nav pill has transform +
    backdrop-filter, which would make these position:fixed elements resolve
    against the pill instead of the viewport. As siblings of <nav> they pin
    to the viewport correctly. */}
<>
  <div
    className={`mobile-overlay ${menuOpen ? "show" : ""}`}
    onClick={() => setMenuOpen(false)}
  />

  <aside
    className={`mobile-sidebar ${menuOpen ? "show" : ""}`}
    onClick={(e) => {
      // close the sidebar whenever a link inside it is tapped
      if ((e.target as HTMLElement).closest("a")) setMenuOpen(false);
    }}
  >

    <div className="sidebar-glow"></div>

 <div className="sidebar-top">
  <div className="sidebar-brand">
    <img src="/coi.png" alt="logo" />

    <div>
      <h3>Counsellors</h3>
      <p>of India</p>
    </div>
  </div>

  <button
    className="sidebar-close"
    onClick={() => setMenuOpen(false)}
    aria-label="Close Menu"
  >
    ✕
  </button>
</div>

    <div className="sidebar-links">

      <a href="#hero">
        <span>01</span>
        Home
      </a>

     <a href="#templates">
        <span>02</span>
        Templates
      </a>

      <a href="#how">
        <span>02</span>
        How it works
      </a>

      <a href="#therapists">
        <span>03</span>
        Therapists
      </a>



      <a href="#pricing">
        <span>05</span>
        Pricing
      </a>

    </div>

    <div className="sidebar-card">
      <p>Grow your counselling practice online.</p>

      <Link href="/signup" className="btn btn-dark">
        Get Started
      </Link>
    </div>

    <div className="sidebar-footer">

      <Link href="/login" className="footer-link">
        Sign in
      </Link>

      <div className="footer-dot"></div>

      <a href="#pricing" className="footer-link">
        Plans
      </a>

    </div>

  </aside>
</>


      {/* ── HERO: editorial value-prop (templates live in their own section) ── */}
<section className="hero-bn" id="hero">
      <div className="hero-bn-inner">
        <div className="hero-bn-badge">
          <span className="hero-bn-badge-dot" aria-hidden="true" />
          Trusted by therapists across India
        </div>

        <h1 className="hero-bn-h">
          <span key={index} className="hero-rotate">
            {headlines[index]}
          </span>
        </h1>

        <p className="hero-bn-sub">
          <span key={index} className="hero-rotate hero-rotate-sub">
            {quotes[index]}
          </span>
        </p>

        <div className="hero-bn-ctas">
          <Link href="/signup" className="hero-bn-cta-p">
            Get Started
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
          <a href="#templates" className="hero-bn-cta-g">
            Try Demo first
          </a>
        </div>

        <div className="hero-bn-trust">
          {/* <div className="hero-bn-trust-item"><strong>500+</strong> therapists onboarded</div>
          <span className="hero-bn-trust-sep" aria-hidden="true" />
          <div className="hero-bn-trust-item"><strong>Verified</strong> credentials</div>
          <span className="hero-bn-trust-sep" aria-hidden="true" />
          <div className="hero-bn-trust-item"><strong>10 min</strong> to go live</div> */}
        </div>

      </div>


    </section>

            {/* ── TEMPLATES: sticky-stack showcase (cards overlap on scroll) ── */}
      <TemplateShowcase onPreview={setPreviewT}/>

      {/* live iframe experience now sits BELOW the showcase, not inside the hero */}
      <LiveTemplateExperience/>
      
      

      {/* ── LIVE EXPERIENCE: full template in an iframe (80vh×80vw) ── */}



      {/* ══════════════════════════════════════════════════════════════
          PRACTITIONERS — what therapists get
      ══════════════════════════════════════════════════════════════ */}
      {/* <section className="section section-alt">
        <div className="wrap">
          <div className="two-col rv">
            <div>
              <div className="eyebrow">Your practice, online</div>
              <h2 className="h2">Everything your practice <i>needs.</i><br/>Nothing it doesn't.</h2>
              <p className="lead">
                A calm, professional home for your therapy practice — no website building, no code. Just your information and a link you can share anywhere.
              </p>
              <ul className="feat-list">
                {[
                  ['01','A beautiful public profile clients actually read'],
                  ['02','Online booking integrated directly into your page'],
                  ['03','Appointment management and session notes in one place'],
                  ['04','Secure payments via Razorpay, built in'],
                  ['05','Live in under 10 minutes, no technical skills needed'],
                ].map(([n,text])=>(
                  <li key={n}>
                    <span className="feat-li-num">{n}</span>
                    <span className="feat-li-text">{text}</span>
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="btn btn-dark" style={{padding:'12px 26px',fontSize:14}}>Create your profile →</Link>
            </div>

            <div className="prac-panel">
              <div className="prac-panel-header">
                <div className="prac-panel-av">P</div>
                <div className="prac-panel-id">
                  <div className="prac-panel-name">Dr. Karan Sharma</div>
                  <div className="prac-panel-role">Clinical Psychologist · Mumbai</div>
                </div>
                <div className="prac-panel-live">
                  <span className="prac-panel-live-dot"/>
                  Live
                </div>
              </div>
              <div className="prac-panel-body">
                <div className="prac-panel-stat-row">
                  {[['24','Bookings'],['₹48k','Earned'],['4.9','Rating']].map(([n,l])=>(
                    <div key={l} className="prac-stat">
                      <div className="prac-stat-n">{n}</div>
                      <div className="prac-stat-l">{l}</div>
                    </div>
                  ))}
                </div>
                <div className="prac-panel-upcoming">
                  <div className="prac-panel-upcoming-label">Upcoming today</div>
                  {[
                    {i:'R',n:'Rajan K.',t:'10:00 AM — 50 min',bg:'#EBEBEB',c:'#13140F',b:'Confirmed',bc:'#F4EFE2',bt:'#B8862C'},
                    {i:'A',n:'Karan S.',t:'12:30 PM — 50 min',bg:'#E8E8E8',c:'#13140F',b:'Pending',bc:'#F5F0E8',bt:'#8A6030'},
                    {i:'M',n:'Meera T.',t:'3:00 PM — 50 min',bg:'#F0F0F0',c:'#3a3a30',b:'Confirmed',bc:'#F4EFE2',bt:'#B8862C'},
                  ].map(a=>(
                    <div key={a.n} className="prac-appt">
                      <div className="prac-appt-av" style={{background:a.bg,color:a.c}}>{a.i}</div>
                      <div className="prac-appt-info">
                        <div className="prac-appt-name">{a.n}</div>
                        <div className="prac-appt-time">{a.t}</div>
                      </div>
                      <div className="prac-appt-badge" style={{background:a.bc,color:a.bt}}>{a.b}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="prac-panel-footer">
                <div className="prac-panel-footer-t">Manage practice</div>
                <div className="prac-panel-footer-s">counsellorsofindia.com/priya-sharma</div>
              </div>
            </div>
          </div>
        </div>
      </section> */}


      {/* ══════════════════════════════════════════════════════════════
          HOW IT WORKS — editorial steps with sage thread
      ══════════════════════════════════════════════════════════════ */}
      <section id="how" className="how-section how-v2">
        <div className="how-wrap">
          <div className="how-head rv">
            <h2 className="how-h">Live in <em>under 10 minutes.</em></h2>
            <p className="how-sub">
              Four calm steps from sign-up to your first client booking, no website builder, no code, no technical skills.
            </p>
          </div>

          <HowTimeline />
        </div>
      </section>



            {/* ══════════════════════════════════════════════════════════════
          PROFILE STRIP — dedicated section showcasing live therapists
      ══════════════════════════════════════════════════════════════ */}
      <section id="therapists" className="td-section sec-rise rv">
        <div className="td-bg-aura" aria-hidden="true"/>

        <div className="td-wrap">
          <div className="td-head rv">
            <div className="td-head-left">
              {/* <div className="td-eyebrow">
                <span className="td-eyebrow-line"/>
                Find your therapist
              </div> */}
              <h2 className="td-h">
                Meet our <em> Practioners</em>
              </h2>
              <p className="td-sub">
                Every practitioner who registers on Counsellors of India and buy any of the templates, automatically gets listed here.
              </p>
            </div>

            <div className="td-head-right">
              <div className="td-stat">
                <span className="td-stat-n">500<i>+</i></span>
                <span className="td-stat-l">Verified therapists</span>
              </div>
              <span className="td-stat-sep"/>
              <div className="td-stat">
                <span className="td-stat-n">22<i>+</i></span>
                <span className="td-stat-l">Cities across India</span>
              </div>
            </div>
          </div>

          <div className="td-filter-bar rv" style={{transitionDelay:'.06s'}}>
            <div className="td-search">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                placeholder="Search by name, city, or specialty—"
                value={search}
                onChange={e=>setSearch(e.target.value)}
                aria-label="Search therapists"
              />
            </div>
            <div className="td-chips">
              {FILTERS.map(f=>(
                <button
                  key={f}
                  type="button"
                  className={`td-chip ${filter===f?'on':''}`}
                  onClick={()=>setFilter(f)}
                >{f}</button>
              ))}
            </div>
          </div>

          <div className="td-grid rv" style={{transitionDelay:'.12s'}}>
            {loading
              ? Array.from({length:6}).map((_,i)=>(
                  <div key={i} className="td-card td-card-skel">
                    <div className="td-card-skel-top">
                      <div className="sk" style={{width:60,height:60,borderRadius:14}}/>
                      <div style={{flex:1,display:'flex',flexDirection:'column',gap:8}}>
                        <div className="sk" style={{height:18,width:'60%'}}/>
                        <div className="sk" style={{height:11,width:'40%'}}/>
                      </div>
                    </div>
                    <div className="sk" style={{height:1,marginTop:18}}/>
                    <div style={{display:'flex',gap:6,marginTop:14}}>
                      <div className="sk" style={{height:20,width:64,borderRadius:999}}/>
                      <div className="sk" style={{height:20,width:80,borderRadius:999}}/>
                    </div>
                  </div>
                ))
              : filtered.length===0
                ? (
                    <div className="td-empty">
                      <div className="td-empty-icon" aria-hidden="true">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="7"/>
                          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                      </div>
                      <div className="td-empty-t">No therapists match your filters.</div>
                      <div className="td-empty-s">Try a different city or specialty — our network is growing every week.</div>
                      <button type="button" className="td-empty-reset" onClick={()=>{setSearch('');setFilter('All')}}>Reset filters</button>
                    </div>
                  )
                : [...filtered, ...filtered].slice(0,6).map((t, idx) => {
                    const name = t.full_name || t.name || 'Therapist'
                    const photo = t.photo_url || ''
                    const role = t.title || t.qualification || ''
                    const city = t.city || t.location || ''
                    const specs: string[] = t.specialties || t.specializations || []
                    const fee = t.fee_per_session ?? null
                    const exp = t.experience || 0
                    const mode = t.session_mode || ''
                    const modeLabel = mode==='online'?'Online':mode==='offline'?'In-person':mode==='both'?'Online & In-person':''
                    const init = name.split(' ').filter((w:string)=>!/^(dr|mr|mrs|ms|prof)\.?$/i.test(w)).map((w:string)=>w[0]).slice(0,2).join('').toUpperCase()||'?'
                    return (
                      <a key={`${t.id||name}-${idx}`} href={t.username?`/${t.username}`:'#'} target={t.username?'_blank':undefined} rel="noopener noreferrer" className="td-card">
                        <div className="td-card-glow" aria-hidden="true"/>
                        <div className="td-card-top">
                          <div className="td-card-av">
                            {photo
                              ? <img src={photo} alt={name} loading="lazy"/>
                              : <span>{init}</span>
                            }
                            <span className="td-card-verified" title="Verified therapist">
                              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                            </span>
                          </div>
                          <div className="td-card-id">
                            <div className="td-card-name">{name}</div>
                            {role && <div className="td-card-role">{role}</div>}
                            {city && (
                              <div className="td-card-loc">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                  <circle cx="12" cy="10" r="3"/>
                                </svg>
                                {city}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="td-card-tags">
                          {specs.slice(0,3).map(s => (
                            <span key={s} className="td-card-tag">{s}</span>
                          ))}
                          {specs.length===0 && <span className="td-card-tag td-card-tag-muted">General practice</span>}
                        </div>

                        <div className="td-card-foot">
                          <div className="td-card-meta">
                            {exp>0 && <span>{exp}+ yrs</span>}
                            {exp>0 && modeLabel && <span className="td-card-meta-sep"/>}
                            {modeLabel && <span>{modeLabel}</span>}
                          </div>
                          {fee && (
                            <div className="td-card-fee">
                              <span className="td-card-fee-n">₹{fee.toLocaleString('en-IN')}</span>
                              <span className="td-card-fee-l">/ session</span>
                            </div>
                          )}
                        </div>

                        <span className="td-card-arrow" aria-hidden="true">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="7" y1="17" x2="17" y2="7"/>
                            <polyline points="7 7 17 7 17 17"/>
                          </svg>
                        </span>
                      </a>
                    )
                  })
            }
          </div>

          {/* {!loading && filtered.length>0 && (
            <div className="td-foot rv" style={{transitionDelay:'.18s'}}>
              <div className="td-foot-text">
                Showing <b>{Math.min(filtered.length, 9)}</b> of <b>{filtered.length}</b> verified therapist{filtered.length!==1?'s':''}
              </div>
              <Link href="#therapists" className="td-foot-cta">
                View all therapists
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </Link>
            </div>
          )} */}
        </div>
      </section>

      
      {/* ══════════════════════════════════════════════════════════════
          PRICING — frosted sage plans
      ══════════════════════════════════════════════════════════════ */}
      <section id="pricing" className="price-section">



        <div className="price-bg-aura" aria-hidden="true"/>
        
        <div className="price-wrap">
          <div className="price-head rv">
            {/* <div className="td-eyebrow"> */}
              {/* <span className="td-eyebrow-line"/> */}
              {/* Pricing
            
            </div> */}

            

            <h2 className="price-h">See our <em>plans</em></h2>
            {/* <p className="price-sub">Start free. Upgrade when your practice grows. No hidden fees, ever.</p> */}
          </div>

          <div className="price-grid rv" style={{transitionDelay:'.08s'}}>
            {PLANS_DATA.map(p=>(
              <div key={p.id} className={`price-card ${p.hi?'price-card-hi':''}`}>
                {p.hi && <div className="price-card-accent" aria-hidden="true"/>}
                {/* {p.badge && (
                  <span className="price-card-badge">
                    <span className="price-card-badge-dot"/>
                    {p.badge}
                  </span>
                )} */}
                <div className="price-card-name">{p.name}</div>
                <div className="price-card-price">
                  <span className="price-card-price-n">{p.price}</span>
                  <span className="price-card-price-p">{p.period}</span>
                </div>
                <ul className="price-card-feats">
                  {p.feats.map(f=>(
                    <li key={f}>
                      <span className="price-card-check" aria-hidden="true">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className={`price-card-cta ${p.hi?'price-card-cta-p':'price-card-cta-g'}`}>
                  {p.cta}
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </Link>
              </div>
            ))}
          </div>

          <p className="price-foot rv" style={{transitionDelay:'.14s'}}>
            {/* All paid plans include a 14-day trial — Cancel anytime */}
          </p>
        </div>
      </section>








      {/* ══════════════════════════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════════════════════════ */}
      {/* <section className="section section-alt">
        <div className="wrap">
          <div className="rv" style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',flexWrap:'wrap',gap:'1.4rem'}}>
            <div>
              <div className="eyebrow">From practitioners</div>
              <h2 className="h2">What therapists <i>say</i></h2>
            </div>
            <p className="lead" style={{maxWidth:'28ch',textAlign:'right',marginTop:0}}>
              Trusted by 500+ therapists across India.
            </p>
          </div>
          <div className="tgrid rv" style={{transitionDelay:'.06s'}}>
            {TESTIS.map(t=>(
              <div key={t.n} className="tcard">
                <p className="tquote">{t.q}</p>
                <div className="tattr">
                  <div className="tav">{t.n.split(' ').map((w:string)=>w[0]).join('').slice(0,2)}</div>
                  <div><div className="tname">{t.n}</div><div className="trole">{t.r}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}


      {/* ══════════════════════════════════════════════════════════════
          FAQ — calm accordion
      ══════════════════════════════════════════════════════════════ */}

      {/* <FaqRevealEffect /> */}
      <section id="faq" className="faq-section">
        <div className="faq-curtain">
        <div className="faq-wrap">
          <div className="faq-head rv">
            {/* <div className="td-eyebrow">
              <span className="td-eyebrow-line"/>
              FAQ
            </div> */}
            <h2 className="faq-h">Things people <em>often ask.</em></h2>
            <p className="faq-sub">
              {/* Quick answers about how Counsellors of India works for therapists and clients. Still curious? <a href="mailto:hello@counsellorsofindia.com">Write to us</a>. */}
            </p>
          </div>

          <div className="faq-list rv" style={{transitionDelay:'.08s'}}>
            {[
              {
                q: 'Who can list a practice on Counsellors of India?',
                a: 'Any dedicated counsellor, psychologist, or psychotherapist practising in India. We verify credentials before your profile goes live to keep the network trustworthy for clients.',
              },
              {
                q: 'How long does it take to set up my profile?',
                a: 'Most therapists are live in under 10 minutes. You add your credentials, approach, availability, and a photo, we handle the rest, including your custom /your-name web address.',
              },
              {
                q: 'How do clients book sessions with me?',
                a: 'Clients book directly from your profile page. You receive an instant notification, and the appointment lands in your dashboard. Online payments via Razorpay are built in.',
              },
              {
                q: 'Is there a free plan?',
                a: 'No, there is not a Free plan but there is starter plan that includes a public profile, up to 10 bookings per month, and a shareable link. You can upgrade to Pro any time your practice needs more.',
              },
              {
                q: 'How is client data protected?',
                a: 'All client information, notes, and bookings are encrypted. We follow Indian data protection guidelines and never share your client data with third parties.',
              },
              {
                q: 'Can I cancel or downgrade later?',
                a: 'Yes. You can upgrade, downgrade, or cancel your plan at any time before your next billing cycle. Your current plan benefits will remain active until the end of your subscription period.',
              },
            ].map((item, i) => (
              <FaqItem key={i} q={item.q} a={item.a} idx={i}/>
            ))}
          </div>
        </div>
        {/* sentinel marking the bottom edge of the full-width curtain. The
            wordmark is only uncovered once this point scrolls up past the
            strip band. Sits inside the curtain, outside the centred wrap. */}
        <div className="faq-curtain-end" aria-hidden="true" />
        </div>
          <div className="faq-wordmark-reveal">
    {/* <HangingWordmark /> */}
  </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════════════════════════════ */}


      {/* ══════════════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════════════ */}
      {/* <footer className="footer">
        <div className="footer-inner">
          <div className="footer-logo">
            <span style={{width:7,height:7,borderRadius:'50%',background:'var(--gold)',display:'inline-block'}}/>
            Counsellors of India
          </div>
          <div className="flinks">
            <a href="#" className="flink">Privacy</a>
            <a href="#" className="flink">Terms</a>
            <a href="#" className="flink">Contact</a>
          </div>
          <span className="fcopy">© {new Date().getFullYear()} Counsellors of India</span>
        </div>
      </footer> */}

      {/* ── HANGING WORDMARK: saffron text on white, swaying ── */}
      {/* <HangingWordmark/> */}

      {/* ── BIG WORDMARK: shutter reveal on scroll ── */}
      {/* <BigWordmark/> */}




            <FooterReveal />

    </div>
  )
}
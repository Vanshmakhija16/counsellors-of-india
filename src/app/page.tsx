'use client'

import { useState, useEffect, useRef, useMemo, lazy, Suspense } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import FaqRevealEffect from "@/components/landing/FaqRevealEffect";
import FooterReveal from '@/components/landing/FooterReveal'
import { loadDemo, saveDemo, emptyDemo, type DemoProfile } from '@/lib/demoSession'
import './page.css'


const HERO_STATIC = <>Your practice deserves </>;

const headlines = [
  <>better website.</>,
  <> better bookings.</>,
  <> better growth.</>,
]

const quotes = [
  " For Therapists & Counsellors",
]



/* ─────────────────────────────────────────────────────────────────
   COUNSELLORS OF INDIA  —  Premium homepage
   Selling points (in order of focus):
   1. Find a therapist (directory + rotating profiles)
   2. List your practice (5 templates, beautiful by default)
───────────────────────────────────────────────────────────────── */


/* ─────────────────────────────────────────────────────────────────
   TEMPLATE MINI THUMBNAILS
───────────────────────────────────────────────────────────────── */
const TMPLS = [
  { id:'t1', name:'The Consultation Room', desc:'Therapist · Ivory & Terracotta',  bg:'#F0EBE2', accent:'#b46b50', badge:'Therapist',            badgeClass:'badge-therapist',    img:'/t1.png', url:'/preview/classic1' },
  { id:'t2', name:'The Night Clinic',      desc:'Psychologist · Gold on Black',     bg:'#0B0D0E', accent:'#c9a35a', badge:'Psychologist',         badgeClass:'badge-psychologist', img:'/t2.png', url:'/preview/classic2' },
  { id:'t3', name:'The Mindful Space',     desc:'Counsellor · Green Minimal',       bg:'#F4F8F5', accent:'#3D7A6A', badge:'Relationship Counsellor', badgeClass:'badge-relationship', img:'/t3.png', url:'/preview/classic3' },
  { id:'t4', name:'The Executive Suite',   desc:'Trauma Specialist · Luxury Edit.', bg:'#080808', accent:'#D4AF37', badge:'Premium',              badgeClass:'badge-premium',      img:'/t4.png', url:'/preview/classic4' },
  { id:'t5', name:'The Retreat',           desc:'Career Coach · Warm Greens',       bg:'#F7F4EF', accent:'#2D4A32', badge:'Career Coach',         badgeClass:'badge-career',       img:'/t5.png', url:'/preview/classic5' },
]

/* Full-page sized template renders (1280×720 logical, scaled down) */
const MINIS: Record<string,React.ReactNode> = {
  t1:(
    <div style={{background:'#F0EBE2',width:'100%',height:'100%',display:'flex',flexDirection:'column',fontFamily:'Georgia,serif'}}>
      <div style={{background:'rgba(240,235,226,.97)',borderBottom:'1px solid rgba(26,26,24,.08)',padding:'14px 28px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <span style={{fontSize:15,color:'#1a1a18',letterSpacing:'-.01em'}}>Dr. Karan </span>
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
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'Get started quickly',
    price: '₹1499',
    period: '/ year',
    hi: false,
    recommended: false,
    feats: [
      'Professional therapist website',
      'Custom domain',
      'Online Appointment Booking',
      'Payment Collection',
      'Email confirmations',
      'Client Dashboard',
      'Shareable profile link',
      'Up to 10 bookings per month',
    ],
    cta: 'Get Started',
    ctaStyle: 'ghost',
  },
  {
    id: 'pro',
    name: 'PRO',
    tagline: 'Best for growing practices',
    price: '₹2499',
    period: '/ year',
    hi: true,
    recommended: true,
    feats: [
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
      'Priority Support',
    ],
    cta: 'Grow Your Practice',
    ctaStyle: 'filled',
  },
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
                  <div className="smk-field"><span className="smk-flabel">Full name</span><div className="smk-input">Dr. Karan </div></div>
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

  return (
    <section ref={ref} className="hangmark" aria-label="Counsellors of India">
      <div className="hangmark-stage">
        <span className="hangmark-eyebrow">Built in India · for India</span>
        <div className="hangmark-rod" aria-hidden="true" />
        <div className="hangmark-hang">
        <span className="hangmark-thread l" aria-hidden="true" />
        <span className="hangmark-thread r" aria-hidden="true" />
        <h2 className="hangmark-word">
          {text.split('').map((ch, i) => (
            <span key={i} className="hangmark-ch" style={{ ['--ci' as string]: i }}>
              {ch === ' ' ? ' ' : ch}
            </span>
          ))}
        </h2>
        </div>
        <div className="hangmark-rule" />
      </div>
    </section>
  )
}


function LiveTemplateExperience() {
  const EXP = [
    { id: 't1', n: 1, name: 'The Consultation Room', desc: 'Ivory, soft terracotta' },
    { id: 't2', n: 2, name: 'The Night Clinic',      desc: 'Gold on deep black' },
    { id: 't3', n: 3, name: 'The Mindful Space',     desc: 'Green tones, minimal' },
    { id: 't4', n: 4, name: 'The Executive Suite',   desc: 'Luxury editorial' },
    { id: 't5', n: 5, name: 'The Retreat',           desc: 'Warm greens, parchment' },
  ]
  const [active, setActive] = useState(2) // default → template 3 (Sage & Clean)
  const [loading, setLoading] = useState(true)
  const cur = EXP[active]

  const [device, setDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')

  const userPickedDevice = useRef(false)
  useEffect(() => {
    function syncDeviceToViewport() {
      if (userPickedDevice.current) return
      const w = window.innerWidth
      if (w < 640) setDevice('mobile')
      else if (w < 1024) setDevice('tablet')
      else setDevice('desktop')
    }
    syncDeviceToViewport()
    window.addEventListener('resize', syncDeviceToViewport)
    return () => window.removeEventListener('resize', syncDeviceToViewport)
  }, [])

  const DESIGN_W: Record<typeof device, number> = {
    desktop: 1280,
    tablet:  834,
    mobile:  390,
  }
  const VIEWPORT_H: Record<typeof device, number> = {
    desktop: 900,
    tablet:  1112,
    mobile:  844,
  }
  const FULL_PAGE_H: Record<typeof device, number> = {
    desktop: 3200,
    tablet:  3600,
    mobile:  4200,
  }
  const frameWrapRef = useRef<HTMLDivElement>(null)
  const iframeElRef  = useRef<HTMLIFrameElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    function measure() {
      const el = frameWrapRef.current
      if (!el) return
      const cs = getComputedStyle(el)
      const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight)
      const padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom)
      const aw = el.clientWidth - padX
      const ah = el.clientHeight - padY
      if (aw <= 0 || ah <= 0) return
      const dw = DESIGN_W[device]
      if (device === 'desktop') {
        const s = aw / dw
        setScale(s)
      } else {
        const s = ah / VIEWPORT_H[device]
        setScale(s)
      }
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (frameWrapRef.current) ro.observe(frameWrapRef.current)
    window.addEventListener('resize', measure)
    return () => { ro.disconnect(); window.removeEventListener('resize', measure) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device])

  const previewUrl = `/preview/classic${cur.n}?embed=1`

  useEffect(() => {
    setLoading(true)
    if (frameWrapRef.current) frameWrapRef.current.scrollTop = 0
    const t = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(t)
  }, [active, device])

  function handleIframeLoad() {
    setLoading(false)
  }

  const frameClass =
  device === 'mobile'
    ? 'texp-frame mobile'
    : device === 'tablet'
    ? 'texp-frame tablet'
    : 'texp-frame desktop'

  return (
    <section id="experience" className="texp">
      <div className="texp-head">
        <h2 className="texp-h">Explore <em>Templates</em> 
          {/* ,<em>your way</em> */}
          </h2>
        <div style={{marginBottom:'32px'}} />
      </div>

      <div className="texp-layout" style={{display:'flex',alignItems:'stretch'}}>

        {/* LEFT — vertical template sidebar */}
        <div
          role="tablist"
          aria-label="Choose a template to experience"
          className="texp-sidebar"
        >
          <p className="texp-sidebar-label">Templates</p>
          {EXP.map((t, i) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active === i}
              className={`texp-tab ${active === i ? 'on' : ''}`}
              onClick={() => { if (i !== active) { setLoading(true); setActive(i) } }}
            >
              <span className="texp-tab-num">{String(t.n).padStart(2,'0')}</span>
              <span className="texp-tab-body">
                <span className="texp-tab-name">{t.name}</span>
                <span className="texp-tab-desc">{t.desc}</span>
              </span>
              <span className="texp-tab-dot" />
            </button>
          ))}
        </div>

        {/* RIGHT — iframe stage */}
        <div className="texp-stage" style={{flex:1,minWidth:0}}>
          <div className="texp-window">
            <div className="texp-chrome">
              <span className="texp-chrome-dot" /><span className="texp-chrome-dot" /><span className="texp-chrome-dot" />
              <span className="texp-chrome-url">counsellorsofindia.com/<em>yourName</em> </span>
              <div className="texp-devices" role="group" aria-label="Preview device">
                {(['mobile', 'tablet', 'desktop'] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    className={`texp-device-btn ${device === d ? 'on' : ''}`}
                    aria-pressed={device === d}
                    aria-label={`Preview ${d}`}
                    title={d.charAt(0).toUpperCase() + d.slice(1)}
                    onClick={() => { userPickedDevice.current = true; if (d !== device) { setLoading(true); setDevice(d) } }}
                  >
                    {d === 'mobile' ? '▯' : d === 'tablet' ? '▭' : '▢'}
                  </button>
                ))}
              </div>
              <span className="texp-chrome-live"><span className="texp-chrome-live-dot" />Live demo</span>
            </div>
            <div ref={frameWrapRef} className={`texp-frame-wrap is-${device}`}>
              {loading && (
                <div className="texp-loading">
                  <span className="texp-spin" />
                  <span className="texp-loading-t">Loading {cur.name}…</span>
                </div>
              )}
              <div
                className="texp-frame-scaler"
                style={{
                  width: `${DESIGN_W[device] * scale}px`,
                  height: `${FULL_PAGE_H[device] * scale}px`,
                }}
              >
                <iframe
                  ref={iframeElRef}
                  key={`${cur.id}-${device}`}
                  className={frameClass}
                  src={previewUrl}
                  title={`${cur.name} live preview`}
                  onLoad={handleIframeLoad}
                  style={{
                    width: `${DESIGN_W[device]}px`,
                    height: `${FULL_PAGE_H[device]}px`,
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                  }}
                />
              </div>
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
    <div className="tshow-head ">
      <div className="tshow-head-left">
        <h2 className="tshow-h ">Try <em>Demo</em></h2>
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
  const [form, setForm] = useState<DemoProfile>(() => emptyDemo())
  const [mounted, setMounted] = useState(false)
  const [preparing, setPreparing] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setForm(loadDemo()); setMounted(true) }, [])

  function update(patch: Partial<DemoProfile>) {
    setForm(f => ({ ...f, ...patch }))
    saveDemo(patch)
  }

  function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    update({ photo_url: url })
  }

  const ready = mounted && !!(form.full_name && form.full_name.trim() && form.bio && form.bio.trim())

  function seePreview() {
    if (!ready) return
    saveDemo({ template_id: templateId })

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
          placeholder="Dr. Karan"
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
      <div
        className="tmpl-viewport"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => { isDragging.current = false }}
      >
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
              </div>
            </div>
          ))}
        </div>
      </div>

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
/* ────────────────────────────────────────────────────────────────
   HERO PRODUCT PEEK — a real, scaled template preview shown directly
   under the hero CTAs, inside a small browser-chrome frame. Gives
   visitors visual proof of the product in the very first viewport
   instead of asking them to scroll three sections to believe it.
─────────────────────────────────────────────────────────────────── */
function HeroProductPeek() {
  const stageRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.5)

  useEffect(() => {
    function measure() {
      if (!stageRef.current) return
      const w = stageRef.current.getBoundingClientRect().width
      if (w > 0) setScale(w / 1280)
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (stageRef.current) ro.observe(stageRef.current)
    window.addEventListener('resize', measure)
    return () => { ro.disconnect(); window.removeEventListener('resize', measure) }
  }, [])

  return (
    <a href="#templates" className="hero-bn-peek" aria-label="See a live example of a Counsellors of India website">
      <span className="hero-bn-peek-badge">5 templates · Live preview</span>
      <div className="hero-bn-peek-chrome">
        <span className="hero-bn-peek-dots"><span /><span /><span /></span>
        <span className="hero-bn-peek-url">counsellorsofindia.com/ <em>your-name</em> </span>
      </div>
      <div ref={stageRef} className="hero-bn-peek-stage">
        <div className="hero-bn-peek-stage-inner" style={{ transform: `scale(${scale})` }}>
          {MINIS['t1']}
        </div>
      </div>
    </a>
  )
}

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



/* ─────────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────────── */
export default function Home() {
  const [scrolled,setScrolled]=useState(false)
  const [menuOpen, setMenuOpen] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex(i => (i + 1) % headlines.length), 3500)
    return () => clearInterval(id)
  }, [])

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

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let cleanup: (() => void) | undefined
    let cancelled = false

    ;(async () => {
      const { default: Lenis } = await import('lenis')
      if (cancelled) return
      const lenis = new Lenis({
        duration: 0.7,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        wheelMultiplier: 1.15,
        touchMultiplier: 1.6,
        syncTouch: false, // let touch devices scroll natively — JS smoothing on touch feels laggy
      })
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

  const marqueeProfiles = useMemo(()=>{
    if(therapists.length>=6) return therapists
    const placeholders = [
      {full_name:'Dr. Karan ', title:'Clinical Psychologist · Mumbai', username:'#'},
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
      
      {previewT && <PreviewModal t={previewT} onClose={()=>setPreviewT(null)}/>}


{/* ───────────────────────────── NAVBAR ───────────────────────────── */}
<nav className={`nav ${scrolled ? 'scrolled' : ''}`}>

  <Link href="/" className="logo">
    <img src="/coi.png" alt="" className="logo-img"/>
    <span className="logo-tagline">Counsellors<br/>of India</span>
  </Link>

  <span className="nav-mobile-title">Counsellors of India</span>

  <div className="nav-mid">
    <a href="#hero" className="nav-a">Home</a>
    <a href="#experience" className="nav-a">Templates</a>
        <a href="#templates" className="nav-a">Demo</a>

    <a href="#how" className="nav-a">Steps </a>
    <a href="#therapists" className="nav-a">Therapists</a>
    <a href="#pricing" className="nav-a">Pricing</a>
    {/* <a href="#faq" className="nav-a">Resources</a> */}
  </div>

  <div className="nav-r">
    <Link href="/login" className="btn btn-light">
      Sign in
    </Link>

    <Link href="/signup" className="btn btn-dark">
      List your practice
    </Link>
  </div>

  <button
    className={`menu-btn ${menuOpen ? "active" : ""}`}
    onClick={() => setMenuOpen(!menuOpen)}
  >
    <span></span>
    <span></span>
    <span></span>
  </button>

</nav>

<>
  <div
    className={`mobile-overlay ${menuOpen ? "show" : ""}`}
    onClick={() => setMenuOpen(false)}
  />

  <aside
    className={`mobile-sidebar ${menuOpen ? "show" : ""}`}
    onClick={(e) => {
      if ((e.target as HTMLElement).closest("a")) setMenuOpen(false);
    }}
  >

    <div className="sidebar-glow"></div>

 <div className="sidebar-top">
  <div className="sidebar-brand">
    <img src="/coi.png" alt="Counsellors of India" />

    <h3>Counsellors of India</h3>
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
        Home
      </a>

     <a href="#templates">
        Demo
      </a>

      <a href="#experience">
        Templates
      </a>

      <a href="#how">
        Steps
      </a>

      <a href="#therapists">
        Therapists
      </a>



      <a href="#pricing">
        Pricing
      </a>

      <a href="#faq">
        Resources
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

    </div>

  </aside>
</>


      {/* ── HERO ── */}
      <section className="hero-main" id="hero">
        <div className="hero-main-inner">
          <div className="hero-main-copy">
            <h1 className="hero-main-title">
              <span className="hero-main-title-line hero-main-title-black">{HERO_STATIC}</span>
              <span key={index} className="hero-main-title-rotating">{headlines[index]}</span>
            </h1>
            <p className="hero-main-text">
              Launch your practice website, bookings, and payments in minutes with one calm, therapist-friendly platform.
            </p>
            <div className="hero-main-buttons">
              <Link href="/signup" className="hero-main-btn-primary">
                Get Started
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
              <a href="#templates" className="hero-main-btn-secondary">
                Try demo
              </a>
            </div>
            <div className="hero-main-trust">
              {/* <span>1,000+ therapists use Counsellors of India for online bookings.</span> */}
            </div>
          </div>
          {/* <div className="hero-main-visual">
            <img src="/heroright.png" alt="Counsellors of India preview" />
          </div> */}
        </div>
      </section>

            <LiveTemplateExperience/>


      <TemplateShowcase onPreview={setPreviewT}/>


      {/* ══════════════════════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════════════════════ */}
      <section id="how" className="how-section how-v2">
        <div className="how-wrap">
          <div className="how-head rv">
            <h2 className="how-h">Live in under <em> 10 minutes.</em></h2>
            <p className="how-sub" style={{textAlign:'center'}}>
              Four calm steps from sign-up to your first client booking, no website builder, no code, no technical skills.
            </p>
          </div>

          <HowTimeline />
        </div>
      </section>



      {/* ══════════════════════════════════════════════════════════════
          THERAPISTS
      ══════════════════════════════════════════════════════════════ */}
      <section id="therapists" className="td-section sec-rise rv">
        <div className="td-bg-aura" aria-hidden="true"/>

        <div className="td-wrap">
          <div className="td-head rv">
            <div className="td-head-left">
              <h2 className="td-h">
                Meet our <em> Practioners</em>
              </h2>
              {/* <p className="td-sub">
                Every practitioner who registers on Counsellors of India and buy any of the templates, automatically gets listed here.
              </p> */}
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
                : [...filtered].filter(t => t.username !== 'harsh').slice(0,6).map((t, idx) => {
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
        </div>
      </section>

      
      {/* ══════════════════════════════════════════════════════════════
          PRICING
      ══════════════════════════════════════════════════════════════ */}
      <section id="pricing" className="price-section">
        <div className="price-bg-aura" aria-hidden="true"/>
        
        <div className="price-wrap">
          <div className="price-head rv">
            <h2 className="price-h">See our <em>Plans</em></h2>
          </div>

          <div className="price-grid rv" style={{transitionDelay:'.08s'}}>
            {PLANS_DATA.map(p=>(
              <div key={p.id} className={`price-card ${p.hi?'price-card-hi':''} ${p.recommended?'price-card-recommended':''}`}>
                {p.hi && <div className="price-card-accent" aria-hidden="true"/>}
                {p.recommended && <div className="price-card-badge">Recommended</div>}
                <div className="price-card-name">{p.name}</div>
                <div className="price-card-tagline">{p.tagline}</div>
                <div className="price-card-price">
                  <span className="price-card-price-n">{p.price}</span>
                  <span className="price-card-price-p">{p.period}</span>
                </div>
                <Link href="/signup" className={`price-card-cta ${p.ctaStyle==='filled'?'price-card-cta-p':'price-card-cta-g'}`}>
                  {p.cta}
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </Link>
                <div className="price-card-divider"/>
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
              </div>
            ))}
          </div>

          <p className="price-foot rv" style={{transitionDelay:'.14s'}}>
          </p>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════════════
          FAQ
      ══════════════════════════════════════════════════════════════ */}
      <section id="faq" className="faq-section">
        <div className="faq-curtain">
        <div className="faq-wrap">
          <div className="faq-head rv">
            <h2 className="faq-h">Frequently Asked <em>Questions</em></h2>
            <p className="faq-sub">
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
        <div className="faq-curtain-end" aria-hidden="true" />
        </div>
          <div className="faq-wordmark-reveal">
        </div>

  
      </section>

      <FooterReveal />

    </div>
  )
}
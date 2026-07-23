'use client'

import { useState, useEffect, useCallback } from 'react'

const WHATSAPP_NUMBER = '918854030924'
const WHATSAPP_MESSAGE = 'Hii, I want to know more about Counsellors of India'
const CALENDLY_URL = 'https://calendly.com/counsellorsofindia-coi/30min'

declare global {
  interface Window {
    Calendly?: {
      initPopupWidget: (opts: { url: string }) => void
    }
  }
}

function loadCalendlyAssets(onReady: () => void) {
  if (!document.getElementById('calendly-widget-css')) {
    const link = document.createElement('link')
    link.id = 'calendly-widget-css'
    link.rel = 'stylesheet'
    link.href = 'https://assets.calendly.com/assets/external/widget.css'
    document.head.appendChild(link)
  }
  if (window.Calendly) {
    onReady()
    return
  }
  const existing = document.getElementById('calendly-widget-js') as HTMLScriptElement | null
  if (existing) {
    existing.addEventListener('load', onReady, { once: true })
    return
  }
  const script = document.createElement('script')
  script.id = 'calendly-widget-js'
  script.src = 'https://assets.calendly.com/assets/external/widget.js'
  script.async = true
  script.onload = onReady
  document.body.appendChild(script)
}

export default function WhatsAppFab() {
  const waHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`
  const [waHovered, setWaHovered] = useState(false)
  const [demoHovered, setDemoHovered] = useState(false)
  const [calendlyLoading, setCalendlyLoading] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => loadCalendlyAssets(() => {}), 4000)
    return () => clearTimeout(t)
  }, [])

  const openCalendly = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    if (window.Calendly) {
      window.Calendly.initPopupWidget({ url: CALENDLY_URL })
      return
    }
    setCalendlyLoading(true)
    loadCalendlyAssets(() => {
      setCalendlyLoading(false)
      window.Calendly?.initPopupWidget({ url: CALENDLY_URL })
    })
  }, [])

  return (
    <>
      <style>{`
        @keyframes fab-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fab-stack { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; }
        .fab-item-1 { animation: fab-in .4s cubic-bezier(.22,.87,.36,1) .25s both; }
        .fab-item-2 { animation: fab-in .4s cubic-bezier(.22,.87,.36,1) .35s both; }
        .fab-btn{
          position: relative;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          border: 1px solid rgba(31,28,24,.06);
          transition: transform .22s cubic-bezier(.22,.87,.36,1), box-shadow .22s ease;
        }
        .fab-tip {
          position: absolute; right: calc(100% + 10px); top: 50%;
          transform: translateY(-50%) translateX(4px);
          background: #1F1C18; color: #fff;
          font: 500 12px/1 'Inter', system-ui, sans-serif;
          padding: 6px 11px; border-radius: 7px; white-space: nowrap;
          opacity: 0; pointer-events: none;
          transition: opacity .18s ease, transform .18s ease;
        }
        .fab-item-1:hover .fab-tip,
        .fab-item-2:hover .fab-tip { opacity: 1; transform: translateY(-50%) translateX(0); }
        @media (prefers-reduced-motion: reduce) {
          .fab-item-1, .fab-item-2 { animation: none; }
        }
        @media (max-width: 480px) {
          .fab-stack { gap: 8px; }
          .fab-tip { display: none; }
        }
      `}</style>
      <div
        className="fab-stack"
        style={{
          position: 'fixed',
          right: 'clamp(14px, 4vw, 24px)',
          bottom: 'clamp(14px, 4vw, 24px)',
          zIndex: 2000,
        }}
      >
        {/* Book a Demo — Calendly popup */}
        <div className="fab-item-2" style={{ position: 'relative' }}>
          <span className="fab-tip" aria-hidden="true">
            {calendlyLoading ? 'Loading…' : 'Book a Demo'}
          </span>
          <a
            href={CALENDLY_URL}
            onClick={openCalendly}
            aria-label="Book a demo call"
            onMouseEnter={() => setDemoHovered(true)}
            onMouseLeave={() => setDemoHovered(false)}
            className="fab-btn"
            style={{
              width: 44,
              height: 44,
              background: '#FF9933',
              boxShadow: demoHovered
                ? '0 10px 22px -8px rgba(255,153,51,.5), 0 2px 6px -2px rgba(31,28,24,.14)'
                : '0 6px 16px -8px rgba(255,153,51,.38), 0 1px 4px -1px rgba(31,28,24,.1)',
              transform: demoHovered ? 'translateY(-2px)' : 'none',
              cursor: 'pointer',
            }}
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="4" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
              <path d="M9 15l1.8 1.8L15 13" />
            </svg>
          </a>
        </div>

        {/* WhatsApp */}
        <div className="fab-item-1" style={{ position: 'relative' }}>
          <span className="fab-tip" aria-hidden="true">Chat with us</span>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with us on WhatsApp"
            onMouseEnter={() => setWaHovered(true)}
            onMouseLeave={() => setWaHovered(false)}
            className="fab-btn"
            style={{
              width: 44,
              height: 44,
              background: '#25D366',
              boxShadow: waHovered
                ? '0 10px 22px -8px rgba(37,211,102,.5), 0 2px 6px -2px rgba(31,28,24,.14)'
                : '0 6px 16px -8px rgba(37,211,102,.4), 0 1px 4px -1px rgba(31,28,24,.1)',
              transform: waHovered ? 'translateY(-2px)' : 'none',
            }}
          >
            <svg width="21" height="21" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <path
                fill="#fff"
                d="M16.003 3C9.376 3 4 8.373 4 15c0 2.32.646 4.49 1.77 6.34L4 29l7.86-1.73A11.93 11.93 0 0 0 16.003 27C22.63 27 28 21.627 28 15S22.63 3 16.003 3Zm0 21.7a9.6 9.6 0 0 1-4.9-1.35l-.352-.21-4.66 1.03 1.05-4.54-.23-.37A9.6 9.6 0 1 1 25.6 15a9.61 9.61 0 0 1-9.597 9.7Z"
              />
              <path
                fill="#fff"
                d="M21.16 17.87c-.29-.145-1.71-.845-1.975-.94-.265-.096-.458-.145-.65.144-.193.29-.746.94-.915 1.133-.168.193-.337.217-.626.072-.29-.145-1.223-.451-2.33-1.437-.861-.768-1.443-1.716-1.612-2.005-.168-.29-.018-.446.127-.59.13-.13.29-.338.434-.507.145-.169.193-.29.29-.483.096-.193.048-.362-.024-.507-.072-.145-.65-1.566-.891-2.145-.235-.564-.474-.487-.65-.496l-.554-.01c-.193 0-.507.072-.772.362-.265.29-1.012.988-1.012 2.409s1.036 2.795 1.181 2.988c.144.193 2.04 3.114 4.943 4.367.69.298 1.229.475 1.649.608.693.22 1.324.189 1.823.115.556-.083 1.71-.699 1.951-1.373.24-.675.24-1.253.168-1.373-.072-.121-.265-.193-.554-.338Z"
              />
            </svg>
          </a>
        </div>
      </div>
    </>
  )
}

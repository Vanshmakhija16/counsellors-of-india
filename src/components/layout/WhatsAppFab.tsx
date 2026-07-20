'use client'

import { useState } from 'react'

const WHATSAPP_NUMBER = '918854030924'
const WHATSAPP_MESSAGE = 'Hii, I want to know more about Counsellors of India'

export default function WhatsAppFab() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`
  const [hovered, setHovered] = useState(false)
  return (
    <>
      <style>{`
        @keyframes wa-fab-in {
          from { opacity: 0; transform: scale(.4) translateY(16px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes wa-fab-pulse {
          0%   { transform: scale(1);   opacity: .55; }
          70%  { transform: scale(1.85); opacity: 0; }
          100% { transform: scale(1.85); opacity: 0; }
        }
        .wa-fab-wrap { animation: wa-fab-in .5s cubic-bezier(.22,.87,.36,1) .3s both; }
        .wa-fab-ring {
          position: absolute; inset: 0; border-radius: 50%;
          background: #25D366; animation: wa-fab-pulse 2.6s ease-out infinite;
          pointer-events: none;
        }
        .wa-fab-tip {
          position: absolute; right: calc(100% + 12px); top: 50%;
          transform: translateY(-50%) translateX(6px);
          background: #1a1a18; color: #fff; font: 500 12.5px/1 'Inter', system-ui, sans-serif;
          padding: 8px 13px; border-radius: 8px; white-space: nowrap;
          opacity: 0; pointer-events: none;
          transition: opacity .2s ease, transform .2s ease;
          box-shadow: 0 6px 18px rgba(0,0,0,.18);
        }
        .wa-fab-tip::after {
          content: ''; position: absolute; left: 100%; top: 50%; transform: translateY(-50%);
          border: 5px solid transparent; border-left-color: #1a1a18;
        }
        .wa-fab-wrap:hover .wa-fab-tip { opacity: 1; transform: translateY(-50%) translateX(0); }
        @media (prefers-reduced-motion: reduce) {
          .wa-fab-wrap { animation: none; }
          .wa-fab-ring { animation: none; display: none; }
        }
      `}</style>
      <div
        className="wa-fab-wrap"
        style={{
          position: 'fixed',
          right: 'clamp(16px, 4vw, 28px)',
          bottom: 'clamp(16px, 4vw, 28px)',
          zIndex: 2000,
          width: 58,
          height: 58,
        }}
      >
        <span className="wa-fab-ring" aria-hidden="true" />
        <span className="wa-fab-tip" aria-hidden="true">Chat with us</span>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with us on WhatsApp"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            position: 'relative',
            width: 58,
            height: 58,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(145deg, #2be374, #1fb855)',
            boxShadow: hovered
              ? '0 16px 36px rgba(37,211,102,.5), 0 4px 10px rgba(0,0,0,.18), inset 0 1px 1px rgba(255,255,255,.35)'
              : '0 10px 28px rgba(37,211,102,.4), 0 2px 8px rgba(0,0,0,.15), inset 0 1px 1px rgba(255,255,255,.25)',
            transform: hovered ? 'scale(1.08) translateY(-2px)' : 'scale(1)',
            transition: 'transform .25s cubic-bezier(.22,.87,.36,1), box-shadow .25s ease',
          }}
        >
          <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden="true" style={{ transition: 'transform .25s ease', transform: hovered ? 'rotate(-8deg)' : 'none' }}>
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
    </>
  )
}

import Link from 'next/link'
import SiteNavbar from '@/components/layout/SiteNavbar'
import SiteFooter from '@/components/layout/SiteFooter'
import FooterReveal from '@/components/landing/FooterReveal'
import '../app/page.css'

// Shown for ANY unmatched URL on the site (Next.js wires this up
// automatically). Kept deliberately minimal — a lost visitor has one job
// here: get back to something real. No navbar, no extra links, just the
// error, one line of context, and exactly two ways forward, then the
// real site footer underneath.
export default function NotFound() {
  return (
    <div className="nf-page">
      <style>{`
        .nf-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: #FDF5EC;
        }
        .nf-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: clamp(48px, 10vw, 96px) 20px;
          padding-top: clamp(110px, 16vw, 170px);
        }
        .nf-code {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-weight: 800;
          font-size: clamp(56px, 10vw, 84px);
          line-height: 1;
          color: #FF9933;
          margin: 0;
          letter-spacing: -0.02em;
        }
        .nf-title {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-weight: 700;
          font-size: clamp(19px, 2.4vw, 23px);
          color: #1F1C18;
          margin: 14px 0 8px;
        }
        .nf-sub {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 14.5px;
          color: #6E685F;
          max-width: 380px;
          margin: 0 0 34px;
          line-height: 1.6;
        }

        .nf-illustration-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: clamp(28px, 6vw, 56px);
          flex-wrap: wrap;
          margin-bottom: 42px;
        }
        .nf-laptop-wrap { flex-shrink: 0; filter: drop-shadow(0 18px 26px rgba(31,28,24,0.14)); }
        .nf-json {
          text-align: left;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: clamp(19px, 3vw, 25px);
          line-height: 1.7;
          color: #1F1C18;
          white-space: pre;
        }
        .nf-json .nf-json-key { color: #B4693B; }
        .nf-json .nf-json-str { color: #2D6A4F; }
        .nf-json .nf-json-num { color: #FF9933; font-weight: 700; }

        .nf-oops {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 17px;
          color: #6E685F;
          margin: 0 0 40px;
        }

        .nf-links {
          display: flex;
          align-items: center;
          gap: 18px;
        }
        .nf-link-primary {
          font-family: 'Inter', system-ui, sans-serif;
          font-weight: 600;
          font-size: 16px;
          color: #fff;
          background: #FF9933;
          padding: 14px 28px;
          border-radius: 12px;
          text-decoration: none;
          transition: background 160ms ease;
        }
        .nf-link-primary:hover { background: #E07A12; }
        .nf-link-secondary {
          font-family: 'Inter', system-ui, sans-serif;
          font-weight: 600;
          font-size: 16px;
          color: #1F1C18;
          padding: 14px 28px;
          border-radius: 12px;
          border: 1px solid #E8E2D6;
          text-decoration: none;
          transition: border-color 160ms ease, color 160ms ease;
        }
        .nf-link-secondary:hover { border-color: #FF9933; color: #FF9933; }
      `}</style>


      <div className="nf-main">
              <SiteNavbar />

        
        <div className="nf-illustration-row">
          <div className="nf-laptop-wrap">
            <svg width="340" height="190" viewBox="0 0 340 190" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              {/* ground shadow */}
              <ellipse cx="170" cy="180" rx="148" ry="8" fill="#F0C89A" opacity="0.35" />

              {/* small side table with a plant, between the two chairs */}
              <rect x="158" y="128" width="24" height="5" rx="2.5" fill="#D9A26A" />
              <rect x="168" y="133" width="4" height="30" fill="#D9A26A" />
              <path d="M164 122 C164 112 176 112 176 122 C176 128 170 132 170 132 C170 132 164 128 164 122 Z" fill="#7FA36C" />

              {/* ── LEFT chair: the client, mid-conversation (open hand) ── */}
              <path d="M18 168 L118 168 L118 104 C118 95 111 90 102 90 L34 90 C25 90 18 95 18 104 Z" fill="#F6A75C" />
              <rect x="18" y="106" width="16" height="52" rx="8" fill="#EE9750" />
              <rect x="102" y="106" width="16" height="52" rx="8" fill="#EE9750" />
              <path d="M18 168 L11 181 L26 181 L30 168 Z" fill="#B4693B" />
              <path d="M118 168 L125 181 L110 181 L106 168 Z" fill="#B4693B" />
              {/* client body, turned slightly toward the therapist (right) */}
              <path d="M46 160 C46 132 54 118 70 118 C86 118 94 132 94 160 Z" fill="#5C8B7A" />
              {/* client's legs — seated, feet resting near the floor */}
              <rect x="50" y="155" width="13" height="32" rx="6.5" fill="#4A7364" />
              <rect x="78" y="155" width="13" height="32" rx="6.5" fill="#4A7364" />
              <ellipse cx="56.5" cy="189" rx="9" ry="5" fill="#3A2A1D" />
              <ellipse cx="84.5" cy="189" rx="9" ry="5" fill="#3A2A1D" />
              {/* client's near arm, raised in an open, talking gesture */}
              <path d="M90 140 C100 134 108 128 110 118 C112 114 118 116 116 121 C112 132 104 140 94 146 Z" fill="#5C8B7A" />
              <circle cx="70" cy="98" r="18" fill="#D99B72" />
              <path d="M52 96 C52 82 60 74 70 74 C80 74 88 82 88 96 C82 89 76 87 70 87 C64 87 58 89 52 96 Z" fill="#3A2A1D" />

              {/* ── RIGHT chair: the therapist, notepad in lap, listening ── */}
              <path d="M222 168 L322 168 L322 104 C322 95 315 90 306 90 L238 90 C229 90 222 95 222 104 Z" fill="#F6A75C" />
              <rect x="222" y="106" width="16" height="52" rx="8" fill="#EE9750" />
              <rect x="306" y="106" width="16" height="52" rx="8" fill="#EE9750" />
              <path d="M222 168 L215 181 L230 181 L234 168 Z" fill="#B4693B" />
              <path d="M322 168 L329 181 L314 181 L310 168 Z" fill="#B4693B" />
              {/* therapist body, facing the client (left) */}
              <path d="M246 160 C246 132 254 118 270 118 C286 118 294 132 294 160 Z" fill="#B4693B" />
              {/* therapist's legs — seated, feet resting near the floor */}
              <rect x="250" y="155" width="13" height="32" rx="6.5" fill="#8B4E32" />
              <rect x="278" y="155" width="13" height="32" rx="6.5" fill="#8B4E32" />
              <ellipse cx="256.5" cy="189" rx="9" ry="5" fill="#3A2A1D" />
              <ellipse cx="284.5" cy="189" rx="9" ry="5" fill="#3A2A1D" />
              <circle cx="270" cy="98" r="18" fill="#E0AE82" />
              <path d="M252 96 C252 82 260 74 270 74 C280 74 288 82 288 96 C282 89 276 87 270 87 C264 87 258 89 252 96 Z" fill="#4A3527" />
              {/* the notepad — drawn last so it sits on top of the legs, in the lap */}
              <rect x="244" y="142" width="30" height="22" rx="2" fill="#FFFDF9" stroke="#E8D9C3" strokeWidth="1.5" transform="rotate(-8 244 142)" />
              <line x1="248" y1="149" x2="268" y2="146" stroke="#D9A26A" strokeWidth="1.6" strokeLinecap="round" transform="rotate(-8 244 142)" />
              <line x1="248" y1="154" x2="264" y2="152" stroke="#D9A26A" strokeWidth="1.6" strokeLinecap="round" transform="rotate(-8 244 142)" />
              <line x1="248" y1="159" x2="266" y2="157" stroke="#D9A26A" strokeWidth="1.6" strokeLinecap="round" transform="rotate(-8 244 142)" />

              {/* a warm connecting arc between them, quietly signalling "session in progress" */}
              <path d="M130 66 C170 40 200 40 232 62" stroke="#FF9933" strokeWidth="2" strokeDasharray="1 8" strokeLinecap="round" fill="none" opacity="0.55" />
            </svg>
          </div>
          <div className="nf-json">
{'{'} <span className="nf-json-key">status</span>: <span className="nf-json-num">404</span>,
{'\n'}  <span className="nf-json-key">message</span>: <span className="nf-json-str">&ldquo;Page not found.&rdquo;</span> {'}'}
          </div>
        </div>

        <p className="nf-oops">Oops! We can&rsquo;t find the page you were looking for.</p>

        <div className="nf-links">
          <Link href="/" className="nf-link-primary">Go to homepage</Link>
          <Link href="/therapists" className="nf-link-secondary">Browse all therapists</Link>
        </div>
      </div>

      <SiteFooter />
      <FooterReveal />
    </div>
  )
}

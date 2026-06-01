import Link from 'next/link'

interface AuthLayoutProps {
  children: React.ReactNode
  title?: string
}

/* Premium, warm auth shell — matches the saffron / parchment brand.
   Used by /login and /signup. */
export default function AuthLayout({ children, title }: AuthLayoutProps) {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{
        background:
          'radial-gradient(ellipse 55% 45% at 82% 8%, rgba(255,153,51,.08) 0%, transparent 60%),' +
          'radial-gradient(ellipse 55% 50% at 10% 95%, rgba(255,217,176,.20) 0%, transparent 65%),' +
          'linear-gradient(180deg,#F6F3EE 0%,#F1ECE3 100%)',
      }}
    >
      <div className="w-full max-w-md">

        {/* Brand */}
        <div className="text-center mb-7">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ background: '#FF9933', boxShadow: '0 0 0 3px rgba(255,153,51,.18)' }}
            />
            <span
              className="text-[1.55rem] leading-none text-[#1F1C18] group-hover:opacity-80 transition"
              style={{ fontFamily: "'Fraunces','Instrument Serif',Georgia,serif", fontWeight: 400, letterSpacing: '-0.015em' }}
            >
              Counsellors of India
            </span>
          </Link>
          {title && (
            <p
              className="mt-3 text-[#3D3A33]"
              style={{ fontFamily: "'Fraunces','Instrument Serif',serif", fontSize: '1.05rem', letterSpacing: '-0.01em' }}
            >
              {title}
            </p>
          )}
        </div>

        {children}

      </div>
    </main>
  )
}

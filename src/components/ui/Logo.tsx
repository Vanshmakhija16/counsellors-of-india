import Link from 'next/link'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  centered?: boolean
  subtitle?: string
  /** Pass showTagline={true} to show the mobile tagline under the wordmark */
  showTagline?: boolean
  /** Disable the built-in homepage link when Logo is already wrapped in a Link */
  disableLink?: boolean
  /** Tenant brand name, e.g. "Counsellors of America" on the US portal.
   *  Defaults to India's original copy so any call site that doesn't pass
   *  this yet renders exactly what it did before. */
  brandName?: string
  /** Mobile-only tagline text under the wordmark. Defaults to India's
   *  original copy. */
  tagline?: string
}

export default function Logo({
  size = 'md',
  centered = false,
  subtitle,
  showTagline = false,
  disableLink = false,
  brandName = 'Counsellors of India',
  tagline = 'practice management for Indian therapists',
}: LogoProps) {

  const sizes = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-4xl',
  }

  return (
    <div className={centered ? 'text-center' : ''}>
      {disableLink ? (
        <>
          <h1
            className={`${sizes[size]} font-semibold text-gray-900 hover:opacity-80 transition`}
            style={{ fontFamily: 'var(--font-cormorant), serif' }}
            aria-label={`${brandName} – therapist website builder`}
          >
            {brandName}
          </h1>
          {/* Mobile-only tagline shown directly under wordmark */}
          {showTagline && (
            <span
              className="sm:hidden block text-[10px] text-gray-400 tracking-wide -mt-0.5"
              style={{ fontFamily: 'var(--font-inter), sans-serif' }}
            >
              {tagline}
            </span>
          )}
        </>
      ) : (
        <Link href="/" className="block">
          <h1
            className={`${sizes[size]} font-semibold text-gray-900 hover:opacity-80 transition`}
            style={{ fontFamily: 'var(--font-cormorant), serif' }}
            aria-label={`${brandName} – therapist website builder`}
          >
            {brandName}
          </h1>
          {/* Mobile-only tagline shown directly under wordmark */}
          {showTagline && (
            <span
              className="sm:hidden block text-[10px] text-gray-400 tracking-wide -mt-0.5"
              style={{ fontFamily: 'var(--font-inter), sans-serif' }}
            >
              {tagline}
            </span>
          )}
        </Link>
      )}
      {subtitle && (
        <p className="text-gray-500 mt-1 text-sm">{subtitle}</p>
      )}
    </div>
  )
}

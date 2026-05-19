import Link from 'next/link'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  centered?: boolean
  subtitle?: string
}

export default function Logo({
  size = 'md',
  centered = false,
  subtitle,
}: LogoProps) {

  const sizes = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-4xl',
  }

  return (
    <div className={centered ? 'text-center' : ''}>
      <Link href="/">
        <h1
          className={`${sizes[size]} font-semibold text-gray-900 hover:opacity-80 transition`}
          style={{ fontFamily: 'var(--font-cormorant), serif' }}
        >
          Counsellors of India
        </h1>
      </Link>
      {subtitle && (
        <p className="text-gray-500 mt-1 text-sm">{subtitle}</p>
      )}
    </div>
  )
}
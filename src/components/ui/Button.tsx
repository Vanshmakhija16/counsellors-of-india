import { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {

  const base = `
    inline-flex items-center justify-center font-medium 
    rounded-lg transition focus:outline-none 
    disabled:opacity-50 disabled:cursor-not-allowed
  `

  const variants = {
    primary:  'bg-[#ff9933] text-white hove:bg-[#354748]  hover:text-[#f2f2f2]',
    outline:  'border border-gray-200 text-gray-700 hover:bg-gray-50',
    ghost:    'text-gray-600 hover:bg-gray-100',
    danger:   'bg-red-600 text-white hover:bg-red-700',
  }

  const sizes = {
    sm: 'h-8  px-3 text-sm',
    md: 'h-11 px-5 text-sm',
    lg: 'h-12 px-6 text-base',
  }

  const width = fullWidth ? 'w-full' : ''

  return (
    <button
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${width} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10"
              stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          {children}
        </span>
      ) : children}
    </button>
  )
}
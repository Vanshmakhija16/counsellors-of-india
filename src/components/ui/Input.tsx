import { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export default function Input({
  label,
  error,
  hint,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="w-full space-y-1.5">

      {label && (
        <label className="block text-sm font-medium text-gray-500">
          {label}
        </label>
      )}

      <input
        className={`
          w-full h-11 px-4 rounded-lg border text-gray-900
          placeholder-gray-400 transition
          focus:outline-none focus:ring-2 focus:ring-[#a3b8b4] focus:border-transparent
          ${error ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'}
          ${className}
        `}
        {...props}
      />

      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}

      {hint && !error && (
        <p className="text-xs text-gray-400">{hint}</p>
      )}

    </div>
  )
}
import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'warning'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  fullWidth?: boolean
}

const variants: Record<Variant, string> = {
  primary:   'bg-cep-lime-400 text-cep-purple-950 hover:bg-cep-lime-500 active:bg-cep-lime-500 font-semibold',
  secondary: 'bg-cep-purple-800 text-cep-white border border-cep-purple-700 hover:bg-cep-purple-850 active:bg-cep-purple-900',
  ghost:     'text-cep-muted hover:bg-cep-purple-850 hover:text-cep-white active:bg-cep-purple-800',
  danger:    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
  success:   'bg-green-600 text-white hover:bg-green-700 active:bg-green-800',
  warning:   'bg-cep-gold-400 text-cep-purple-950 hover:bg-cep-gold-500 active:bg-cep-gold-500 font-semibold',
}

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cep-lime-400',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className,
      )}
    >
      {loading ? (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : null}
      {children}
    </button>
  )
}

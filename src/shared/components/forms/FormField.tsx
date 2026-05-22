import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface FormFieldProps {
  id: string
  label: string
  children: ReactNode
  required?: boolean
  helperText?: ReactNode
  error?: ReactNode
  className?: string
}

export function FormField({
  id,
  label,
  children,
  required = false,
  helperText,
  error,
  className,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={id} className="block text-xs font-semibold text-cep-muted tracking-wide uppercase">
        {label}{required ? <span aria-hidden="true"> *</span> : null}
      </label>
      {children}
      {helperText ? (
        <p id={`${id}-helper`} className="text-xs text-cep-muted/60">
          {helperText}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export function getFieldDescriptionIds(id: string, helperText?: ReactNode, error?: ReactNode) {
  return [helperText ? `${id}-helper` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(' ') || undefined
}

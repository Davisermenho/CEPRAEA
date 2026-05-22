import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { FormField, getFieldDescriptionIds } from './FormField'

interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  id: string
  label: string
  required?: boolean
  helperText?: ReactNode
  error?: ReactNode
  fieldClassName?: string
}

export function TextInput({
  id,
  label,
  required = false,
  helperText,
  error,
  fieldClassName,
  className,
  ...props
}: TextInputProps) {
  return (
    <FormField
      id={id}
      label={label}
      required={required}
      helperText={helperText}
      error={error}
      className={fieldClassName}
    >
      <input
        id={id}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={getFieldDescriptionIds(id, helperText, error)}
        required={required}
        className={cn(
          'w-full h-12 rounded-xl border px-4 text-base transition-colors',
          'bg-cep-purple-850 border-cep-purple-700 text-cep-white placeholder:text-cep-muted/40',
          'focus:outline-none focus:ring-2 focus:ring-cep-lime-400 focus:border-transparent',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error && 'border-red-500/40 focus:ring-red-400 focus:border-transparent',
          className,
        )}
        {...props}
      />
    </FormField>
  )
}

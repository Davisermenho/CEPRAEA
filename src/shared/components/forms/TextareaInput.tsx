import type { ReactNode, TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { FormField, getFieldDescriptionIds } from './FormField'

interface TextareaInputProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {
  id: string
  label: string
  required?: boolean
  helperText?: ReactNode
  error?: ReactNode
  fieldClassName?: string
  showCount?: boolean
}

export function TextareaInput({
  id,
  label,
  required = false,
  helperText,
  error,
  fieldClassName,
  className,
  showCount = false,
  maxLength,
  value,
  ...props
}: TextareaInputProps) {
  const currentLength = typeof value === 'string' ? value.length : 0
  const countText = showCount && maxLength ? `${currentLength}/${maxLength}` : null
  const combinedHelper = countText ? (
    <span className="flex items-center justify-between gap-3">
      <span>{helperText}</span>
      <span>{countText}</span>
    </span>
  ) : helperText

  return (
    <FormField
      id={id}
      label={label}
      required={required}
      helperText={combinedHelper}
      error={error}
      className={fieldClassName}
    >
      <textarea
        id={id}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={getFieldDescriptionIds(id, combinedHelper, error)}
        required={required}
        maxLength={maxLength}
        value={value}
        className={cn(
          'w-full min-h-24 rounded-xl border px-4 py-3 text-base resize-none transition-colors',
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

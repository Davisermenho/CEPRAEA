import type { ReactNode, SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { FormField, getFieldDescriptionIds } from './FormField'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectInputProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  id: string
  label: string
  options: SelectOption[]
  required?: boolean
  helperText?: ReactNode
  error?: ReactNode
  placeholder?: string
  fieldClassName?: string
}

export function SelectInput({
  id,
  label,
  options,
  required = false,
  helperText,
  error,
  placeholder,
  fieldClassName,
  className,
  ...props
}: SelectInputProps) {
  return (
    <FormField
      id={id}
      label={label}
      required={required}
      helperText={helperText}
      error={error}
      className={fieldClassName}
    >
      <select
        id={id}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={getFieldDescriptionIds(id, helperText, error)}
        required={required}
        className={cn(
          'w-full h-12 rounded-xl border px-4 text-base transition-colors',
          'bg-cep-purple-850 border-cep-purple-700 text-cep-white',
          'focus:outline-none focus:ring-2 focus:ring-cep-lime-400 focus:border-transparent',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error && 'border-red-500/40 focus:ring-red-400 focus:border-transparent',
          className,
        )}
        {...props}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
    </FormField>
  )
}

import { cn } from '@/lib/utils'
import { FormField } from './FormField'

export interface StatusSegmentedOption<TValue extends string = string> {
  value: TValue
  label: string
  selectedClassName?: string
}

interface StatusSegmentedControlProps<TValue extends string = string> {
  id: string
  label: string
  value: TValue
  options: StatusSegmentedOption<TValue>[]
  onChange: (value: TValue) => void
  required?: boolean
  error?: string
  disabled?: boolean
  className?: string
}

export function StatusSegmentedControl<TValue extends string = string>({
  id,
  label,
  value,
  options,
  onChange,
  required = false,
  error,
  disabled = false,
  className,
}: StatusSegmentedControlProps<TValue>) {
  return (
    <FormField id={id} label={label} required={required} error={error} className={className}>
      <div id={id} role="radiogroup" aria-label={label} className="flex gap-2">
        {options.map((option) => {
          const selected = value === option.value

          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              onClick={() => onChange(option.value)}
              className={cn(
                'flex-1 h-12 rounded-xl text-base font-semibold border transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cep-lime-400',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                selected
                  ? option.selectedClassName ?? 'bg-cep-lime-400 text-cep-purple-950 border-cep-lime-400'
                  : 'bg-cep-purple-850 text-cep-muted border-cep-purple-700 hover:text-cep-white',
              )}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </FormField>
  )
}

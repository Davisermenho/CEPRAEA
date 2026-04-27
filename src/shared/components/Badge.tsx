import { cn } from '@/lib/utils'

type BadgeVariant = 'green' | 'red' | 'yellow' | 'blue' | 'gray' | 'lime' | 'gold' | 'purple'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

const variants: Record<BadgeVariant, string> = {
  green:  'bg-green-500/20 text-green-400',
  red:    'bg-red-500/20 text-red-400',
  yellow: 'bg-cep-gold-400/20 text-cep-gold-400',
  blue:   'bg-cep-purple-700 text-cep-white',
  gray:   'bg-cep-purple-800 text-cep-muted',
  lime:   'bg-cep-lime-400/20 text-cep-lime-400',
  gold:   'bg-cep-gold-400/20 text-cep-gold-400',
  purple: 'bg-cep-purple-700 text-cep-white',
}

export function Badge({ variant = 'gray', children, className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  )
}

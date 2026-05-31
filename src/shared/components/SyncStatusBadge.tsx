import { Badge } from './Badge'
import { cn } from '@/lib/utils'

/**
 * SyncStatusBadge — DDR-009 vocabulary.
 *
 * Indicador discreto e reutilizável para sinalizar o estado de sincronização
 * de um recurso (plano de treino, jogadas, metas, etc.) com o Supabase.
 *
 * Estados (vocabulário fixo do DDR-009):
 *   • "salvo-localmente" — alteração ainda não enviada ao backend.
 *   • "sincronizando"     — request em vôo.
 *   • "sincronizado"      — backend confirmou; recurso íntegro.
 *   • "falha"             — última tentativa falhou; usuário deve reagir.
 */
export type SyncStatus = 'salvo-localmente' | 'sincronizando' | 'sincronizado' | 'falha'

interface SyncStatusBadgeProps {
  status: SyncStatus
  className?: string
}

const labels: Record<SyncStatus, string> = {
  'salvo-localmente': 'Salvo localmente',
  'sincronizando': 'Sincronizando…',
  'sincronizado': 'Sincronizado',
  'falha': 'Falha ao sincronizar',
}

const variants: Record<SyncStatus, 'gray' | 'blue' | 'green' | 'red'> = {
  'salvo-localmente': 'gray',
  'sincronizando': 'blue',
  'sincronizado': 'green',
  'falha': 'red',
}

export function SyncStatusBadge({ status, className }: SyncStatusBadgeProps) {
  return (
    <Badge
      variant={variants[status]}
      className={cn('gap-1', className)}
      aria-live="polite"
    >
      {status === 'sincronizando' && (
        <span
          className="inline-block h-2 w-2 animate-pulse rounded-full bg-current"
          aria-hidden="true"
        />
      )}
      {labels[status]}
    </Badge>
  )
}

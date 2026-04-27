import { AlertTriangle, X, CalendarPlus } from 'lucide-react'
import type { HolidayConflict } from '@/types'
import { useTrainingStore } from '@/stores/trainingStore'
import { formatDateCompact } from '@/lib/utils'
import { formatHolidayLabel, formatAlternativeDate, morningSchedule } from '@/lib/holidays'
import { useState } from 'react'

interface HolidayAlertProps {
  conflicts: HolidayConflict[]
}

export function HolidayAlert({ conflicts }: HolidayAlertProps) {
  const { update, addExtra } = useTrainingStore()
  const [resolving, setResolving] = useState<string | null>(null)

  if (conflicts.length === 0) return null

  const handleCancel = async (id: string) => {
    setResolving(id)
    await update(id, { status: 'cancelado' })
    setResolving(null)
  }

  const handleCreateAlternative = async (conflict: HolidayConflict, altDate: string) => {
    setResolving(conflict.training.id)
    const schedule = morningSchedule(conflict.training.horaInicio)
    await addExtra({
      status: 'agendado',
      data: altDate,
      horaInicio: schedule.horaInicio,
      horaFim: schedule.horaFim,
      local: conflict.training.local,
      feriadoOrigem: conflict.training.data,
      observacoes: `Treino alternativo — ${formatHolidayLabel(conflict.holiday)}`,
    })
    await update(conflict.training.id, { status: 'cancelado' })
    setResolving(null)
  }

  return (
    <div className="mx-4 mt-4 rounded-2xl bg-cep-gold-400/10 border border-cep-gold-400/40 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-cep-gold-400/15 border-b border-cep-gold-400/30">
        <AlertTriangle className="h-4 w-4 text-cep-gold-400 shrink-0" />
        <p className="text-sm font-bold text-cep-gold-400">
          {conflicts.length === 1
            ? '1 treino coincide com feriado'
            : `${conflicts.length} treinos coincidem com feriados`}
        </p>
      </div>

      <div className="divide-y divide-cep-gold-400/20">
        {conflicts.map((conflict) => (
          <div key={conflict.training.id} className="p-4 space-y-3">
            <div>
              <p className="text-sm font-bold text-cep-white">
                {formatDateCompact(conflict.training.data)} — {conflict.training.horaInicio}
              </p>
              <p className="text-xs text-cep-sand-100 mt-0.5">
                🗓 {formatHolidayLabel(conflict.holiday)}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {conflict.alternatives.slice(0, 3).map((alt) => (
                <button
                  key={alt}
                  onClick={() => handleCreateAlternative(conflict, alt)}
                  disabled={resolving === conflict.training.id}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-cep-purple-850 border border-cep-gold-400/40 text-xs font-semibold text-cep-gold-400 hover:bg-cep-purple-800 active:bg-cep-purple-900 disabled:opacity-50 transition-colors"
                >
                  <CalendarPlus className="h-3.5 w-3.5" />
                  {formatAlternativeDate(alt)} (manhã)
                </button>
              ))}

              <button
                onClick={() => handleCancel(conflict.training.id)}
                disabled={resolving === conflict.training.id}
                className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-cep-purple-850 border border-red-500/40 text-xs font-semibold text-red-400 hover:bg-red-500/15 active:bg-red-500/25 disabled:opacity-50 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
                Cancelar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

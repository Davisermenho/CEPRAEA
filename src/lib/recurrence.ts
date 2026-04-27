import type { Training } from '@/types'
import { dateToISO, todayISO } from './utils'
import { isHoliday } from './holidays'

interface Schedule {
  dow: number      // 0 = domingo, 4 = quinta
  horaInicio: string
  horaFim: string
}

const SCHEDULES: Schedule[] = [
  { dow: 4, horaInicio: '20:00', horaFim: '21:30' },  // quinta
  { dow: 0, horaInicio: '07:30', horaFim: '09:00' },  // domingo
]

type TrainingDraft = Omit<Training, 'id' | 'createdAt' | 'updatedAt'>

/**
 * Gera rascunhos de treinos recorrentes para as próximas `weeksAhead` semanas.
 * Treinos já existentes são excluídos via `existingKeys` (Set de "YYYY-MM-DD|HH:MM").
 * Treinos em feriado são marcados com `feriadoOrigem` mas incluídos na lista
 * para que o treinador decida o que fazer via HolidayAlert.
 */
export function generateRecurringDrafts(
  weeksAhead: number,
  existingKeys: Set<string>,
): TrainingDraft[] {
  const result: TrainingDraft[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = todayISO()

  for (let week = 0; week < weeksAhead; week++) {
    for (const schedule of SCHEDULES) {
      // Início da semana (domingo) a partir de hoje + week * 7 dias
      const base = new Date(today)
      base.setDate(today.getDate() + week * 7)

      // Encontrar o dia correto da semana
      const currentDow = base.getDay()
      let diff = schedule.dow - currentDow
      if (diff < 0) diff += 7

      const target = new Date(base)
      target.setDate(base.getDate() + diff)
      const dateISO = dateToISO(target)

      // Não gerar no passado
      if (dateISO < todayStr) continue

      const key = `${dateISO}|${schedule.horaInicio}`
      if (existingKeys.has(key)) continue

      const holiday = isHoliday(dateISO)

      result.push({
        tipo: 'recorrente',
        status: 'agendado',
        data: dateISO,
        horaInicio: schedule.horaInicio,
        horaFim: schedule.horaFim,
        criadoManualmente: false,
        feriadoOrigem: holiday ? dateISO : undefined,
      })
    }
  }

  return result
}

/** Constrói o Set de chaves existentes a partir dos treinos no banco */
export function buildExistingKeys(trainings: Training[]): Set<string> {
  return new Set(trainings.map((t) => `${t.data}|${t.horaInicio}`))
}

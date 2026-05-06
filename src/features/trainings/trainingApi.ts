// trainingApi.ts — Supabase-first CRUD de treinos.
// Nenhuma dependência de IndexedDB ou sync.ts.

import { supabase } from '@/lib/supabase'
import { assertSupabaseTeamId } from '@/features/presence-tokens/presenceTokenConfig'
import type { Training, TrainingStatus, TrainingType, RecurrenceSchedule } from '@/types'
import { DEFAULT_SCHEDULES } from '@/lib/recurrence'

type TrainingRow = {
  id: string
  team_id: string
  type: string
  status: string
  training_date: string
  start_time: string
  end_time: string
  location: string | null
  notes: string | null
  holiday_origin: string | null
  created_manually: boolean
  created_at: string
  updated_at: string
}

function mapRow(row: TrainingRow): Training {
  return {
    id: row.id,
    tipo: row.type as TrainingType,
    status: row.status as TrainingStatus,
    data: row.training_date,
    horaInicio: row.start_time.slice(0, 5),
    horaFim: row.end_time.slice(0, 5),
    local: row.location ?? undefined,
    observacoes: row.notes ?? undefined,
    feriadoOrigem: row.holiday_origin ?? undefined,
    criadoManualmente: row.created_manually,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function fetchTrainings(): Promise<Training[]> {
  const teamId = assertSupabaseTeamId()
  const { data, error } = await supabase
    .from('trainings')
    .select('id, team_id, type, status, training_date, start_time, end_time, location, notes, holiday_origin, created_manually, created_at, updated_at')
    .eq('team_id', teamId)
    .is('deleted_at', null)
    .order('training_date')
    .order('start_time')

  if (error) throw new Error(error.message)
  return (data as TrainingRow[]).map(mapRow)
}

export async function createTraining(
  data: Omit<Training, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Training> {
  const teamId = assertSupabaseTeamId()
  const generationKey = `manual:${teamId}:${data.data}:${data.horaInicio}:${Date.now()}`

  const { data: row, error } = await supabase
    .from('trainings')
    .insert({
      team_id: teamId,
      type: data.tipo,
      status: data.status,
      training_date: data.data,
      start_time: data.horaInicio,
      end_time: data.horaFim,
      timezone: 'America/Sao_Paulo',
      starts_at: computeStartsAt(data.data, data.horaInicio),
      location: data.local ?? null,
      notes: data.observacoes ?? null,
      holiday_origin: data.feriadoOrigem ?? null,
      created_manually: data.criadoManualmente,
      generation_key: generationKey,
    })
    .select('id, team_id, type, status, training_date, start_time, end_time, location, notes, holiday_origin, created_manually, created_at, updated_at')
    .single<TrainingRow>()

  if (error) throw new Error(error.message)
  return mapRow(row)
}

export async function updateTraining(
  id: string,
  data: Partial<Omit<Training, 'id' | 'createdAt'>>
): Promise<Training> {
  const patch: Record<string, unknown> = {}
  if (data.status !== undefined)      patch.status        = data.status
  if (data.local !== undefined)       patch.location      = data.local ?? null
  if (data.observacoes !== undefined) patch.notes         = data.observacoes ?? null
  if (data.horaInicio !== undefined)  patch.start_time    = data.horaInicio
  if (data.horaFim !== undefined)     patch.end_time      = data.horaFim
  if (data.data !== undefined)        patch.training_date = data.data

  const { data: row, error } = await supabase
    .from('trainings')
    .update(patch)
    .eq('id', id)
    .select('id, team_id, type, status, training_date, start_time, end_time, location, notes, holiday_origin, created_manually, created_at, updated_at')
    .single<TrainingRow>()

  if (error) throw new Error(error.message)
  return mapRow(row)
}

export async function deleteTraining(id: string): Promise<void> {
  const { error } = await supabase
    .from('trainings')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)
}

/**
 * Gera treinos recorrentes via RPC Supabase.
 * Chama generate_trainings uma vez por schedule.
 * Retorna o total de treinos criados.
 */
export async function generateRecurringViaRPC(
  schedules: RecurrenceSchedule[] = DEFAULT_SCHEDULES,
  weeksAhead = 12
): Promise<number> {
  const teamId = assertSupabaseTeamId()
  const today = new Date()
  const end = new Date(today)
  end.setDate(today.getDate() + weeksAhead * 7)

  const startDate = today.toISOString().slice(0, 10)
  const endDate = end.toISOString().slice(0, 10)

  let totalCreated = 0
  for (const schedule of schedules) {
    const { data, error } = await supabase.rpc('generate_trainings', {
      input_team_id: teamId,
      input_series_id: null,
      input_start_date: startDate,
      input_end_date: endDate,
      input_days_of_week: [schedule.dow],
      input_start_time: schedule.horaInicio,
      input_end_time: schedule.horaFim,
      input_timezone: 'America/Sao_Paulo',
      input_type: 'recorrente',
      input_location: null,
    })
    if (error) throw new Error(error.message)
    const rows = data as Array<{ created_count: number; skipped_count: number; failed_count: number }>
    if (rows?.[0]) totalCreated += rows[0].created_count ?? 0
  }
  return totalCreated
}

function computeStartsAt(date: string, time: string): string {
  // Usa horário de São Paulo (UTC-3 no inverno, UTC-2 no verão)
  // O Supabase armazena em UTC; aqui retornamos uma string ISO para inserção
  const dt = new Date(`${date}T${time}:00-03:00`)
  return dt.toISOString()
}

// attendanceStore.ts — Supabase-first. Sem IndexedDB nem sync.ts.

import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { assertSupabaseTeamId } from '@/features/presence-tokens/presenceTokenConfig'
import type { AttendanceRecord, AttendanceStatus, FrequencyReport, TrainingSummary } from '@/types'
import { useAthleteStore } from './athleteStore'
import { useTrainingStore } from './trainingStore'

// ---------------------------------------------------------------------------
// Tipos internos da tabela attendance_records no Supabase
// ---------------------------------------------------------------------------
type AttendanceRow = {
  id: string
  training_id: string
  athlete_id: string
  status: string
  justification: string | null
  confirmed_by_athlete: boolean
  created_at: string
  updated_at: string
}

function mapRow(row: AttendanceRow): AttendanceRecord {
  return {
    id: `${row.training_id}::${row.athlete_id}`,
    treinoId: row.training_id,
    atletaId: row.athlete_id,
    status: row.status as AttendanceStatus,
    justificativa: row.justification ?? undefined,
    confirmadoPelaAtleta: row.confirmed_by_athlete,
    registradoEm: row.updated_at || row.created_at,
  }
}

// ---------------------------------------------------------------------------
// Interface do store
// ---------------------------------------------------------------------------
interface AttendanceStore {
  records: AttendanceRecord[]
  isLoading: boolean
  loadAll: () => Promise<void>
  loadForTraining: (treinoId: string) => Promise<void>
  upsert: (
    treinoId: string,
    atletaId: string,
    status: AttendanceStatus,
    opts?: { justificativa?: string; confirmadoPelaAtleta?: boolean }
  ) => Promise<void>
  upsertOwn: (
    treinoId: string,
    atletaId: string,
    status: AttendanceStatus,
    opts?: { justificativa?: string }
  ) => Promise<void>
  getForTraining: (treinoId: string) => AttendanceRecord[]
  getForAthlete: (atletaId: string) => AttendanceRecord[]
  getTrainingSummary: (treinoId: string, totalAtivos: number) => TrainingSummary
  getFrequencyReports: (fromISO?: string, toISO?: string) => FrequencyReport[]
  getAthleteFrequency: (atletaId: string, fromISO?: string, toISO?: string) => FrequencyReport
}

// ---------------------------------------------------------------------------
// Implementação
// ---------------------------------------------------------------------------
export const useAttendanceStore = create<AttendanceStore>((set, get) => ({
  records: [],
  isLoading: false,

  loadAll: async () => {
    set({ isLoading: true })
    try {
      const teamId = assertSupabaseTeamId()
      // attendance_records usa training_id → join com trainings para filtrar por team
      const { data, error } = await supabase
        .from('attendance_records')
        .select('id, training_id, athlete_id, status, justification, confirmed_by_athlete, created_at, updated_at, trainings!attendance_records_training_team_fk!inner(team_id)')
        .eq('trainings.team_id', teamId)

      if (error) throw new Error(error.message)
      const rows = (data ?? []) as unknown as AttendanceRow[]
      set({ records: rows.map((r) => mapRow(r)), isLoading: false })
    } catch (err) {
      set({ isLoading: false })
      throw err
    }
  },

  loadForTraining: async (treinoId) => {
    const teamId = assertSupabaseTeamId()
    const { data, error } = await supabase
      .from('attendance_records')
      .select('id, training_id, athlete_id, status, justification, confirmed_by_athlete, created_at, updated_at')
      .eq('training_id', treinoId)

    if (error) throw new Error(error.message)
    const rows = (data ?? []) as AttendanceRow[]
    const loaded = rows.map((r) => mapRow(r))

    set((s) => {
      const existing = s.records.filter((r) => r.treinoId !== treinoId)
      return { records: [...existing, ...loaded] }
    })
  },

  upsert: async (treinoId, atletaId, status, opts = {}) => {
    // Usa a RPC upsert_coach_attendance criada em T02.
    // Confirma presença como coach; RLS garante que só coach pode chamar esta RPC.
    const teamId = assertSupabaseTeamId()

    if (status === 'pendente') {
      // "pendente" remove o registro (soft-reset): delete ou update para null não existe no modelo.
      // Por convenção, não persistimos "pendente" — apenas removemos da store local.
      set((s) => ({
        records: s.records.filter((r) => !(r.treinoId === treinoId && r.atletaId === atletaId)),
      }))
      return
    }

    const { error } = await supabase.rpc('upsert_coach_attendance', {
      input_team_id: teamId,
      input_training_id: treinoId,
      input_athlete_id: atletaId,
      input_status: status,
      input_justification: opts.justificativa ?? null,
      input_confirmed_by_athlete: opts.confirmadoPelaAtleta ?? false,
    })
    if (error) throw new Error(error.message)

    const record: AttendanceRecord = {
      id: `${treinoId}::${atletaId}`,
      treinoId,
      atletaId,
      status,
      justificativa: opts.justificativa,
      confirmadoPelaAtleta: opts.confirmadoPelaAtleta ?? false,
      registradoEm: new Date().toISOString(),
    }
    set((s) => {
      const without = s.records.filter((r) => r.id !== record.id)
      return { records: [...without, record] }
    })
  },

  upsertOwn: async (treinoId, atletaId, status, opts = {}) => {
    const { error } = await supabase.rpc('upsert_own_attendance', {
      input_training_id: treinoId,
      input_status: status,
      input_justification: opts.justificativa ?? null,
    })
    if (error) throw new Error(error.message)

    const record: AttendanceRecord = {
      id: `${treinoId}::${atletaId}`,
      treinoId,
      atletaId,
      status,
      justificativa: opts.justificativa,
      confirmadoPelaAtleta: true,
      registradoEm: new Date().toISOString(),
    }
    set((s) => {
      const without = s.records.filter((r) => r.id !== record.id)
      return { records: [...without, record] }
    })
  },

  getForTraining: (treinoId) =>
    get().records.filter((r) => r.treinoId === treinoId),

  getForAthlete: (atletaId) =>
    get().records.filter((r) => r.atletaId === atletaId),

  getTrainingSummary: (treinoId, totalAtivos) => {
    const records = get().getForTraining(treinoId)
    const presentes = records.filter((r) => r.status === 'presente').length
    const ausentes = records.filter((r) => r.status === 'ausente').length
    const justificados = records.filter((r) => r.status === 'justificado').length
    const registrados = presentes + ausentes + justificados
    return {
      treinoId,
      totalAtivos,
      presentes,
      ausentes,
      justificados,
      pendentes: totalAtivos - registrados,
    }
  },

  getFrequencyReports: (fromISO, toISO) => {
    const athletes = useAthleteStore.getState().athletes.filter((a) => a.status === 'ativo')
    const trainings = useTrainingStore
      .getState()
      .trainings.filter(
        (t) =>
          t.status === 'realizado' &&
          (!fromISO || t.data >= fromISO) &&
          (!toISO || t.data <= toISO)
      )
    const trainingIds = new Set(trainings.map((t) => t.id))
    const records = get().records.filter((r) => trainingIds.has(r.treinoId))

    return athletes.map((a) => {
      const athleteRecords = records.filter((r) => r.atletaId === a.id)
      const presentes = athleteRecords.filter((r) => r.status === 'presente').length
      const ausentes = athleteRecords.filter((r) => r.status === 'ausente').length
      const justificados = athleteRecords.filter((r) => r.status === 'justificado').length
      const total = trainings.length
      return {
        atletaId: a.id,
        nomeAtleta: a.nome,
        totalTreinos: total,
        presentes,
        ausentes,
        justificados,
        percentualPresenca: total > 0 ? Math.round((presentes / total) * 100) : 0,
      }
    })
  },

  getAthleteFrequency: (atletaId, fromISO, toISO) => {
    const athlete = useAthleteStore.getState().getById(atletaId)
    const trainings = useTrainingStore
      .getState()
      .trainings.filter(
        (t) =>
          t.status === 'realizado' &&
          (!fromISO || t.data >= fromISO) &&
          (!toISO || t.data <= toISO)
      )
    const trainingIds = new Set(trainings.map((t) => t.id))
    const records = get().records.filter(
      (r) => r.atletaId === atletaId && trainingIds.has(r.treinoId)
    )
    const presentes = records.filter((r) => r.status === 'presente').length
    const ausentes = records.filter((r) => r.status === 'ausente').length
    const justificados = records.filter((r) => r.status === 'justificado').length
    const total = trainings.length
    return {
      atletaId,
      nomeAtleta: athlete?.nome ?? atletaId,
      totalTreinos: total,
      presentes,
      ausentes,
      justificados,
      percentualPresenca: total > 0 ? Math.round((presentes / total) * 100) : 0,
    }
  },
}))

import { create } from 'zustand'
import { getDB } from '@/db'
import type { AttendanceRecord, AttendanceStatus, FrequencyReport, TrainingSummary } from '@/types'
import { useAthleteStore } from './athleteStore'
import { useTrainingStore } from './trainingStore'
import { pullConfirmations, type SyncConfig } from '@/lib/sync'

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
  getForTraining: (treinoId: string) => AttendanceRecord[]
  getForAthlete: (atletaId: string) => AttendanceRecord[]
  getTrainingSummary: (treinoId: string, totalAtivos: number) => TrainingSummary
  getFrequencyReports: (fromISO?: string, toISO?: string) => FrequencyReport[]
  getAthleteFrequency: (atletaId: string, fromISO?: string, toISO?: string) => FrequencyReport
  syncFromRemote: (config: SyncConfig, opts?: { treinoId?: string; since?: string }) => Promise<{ ok: boolean; merged: number; error?: string }>
}

export const useAttendanceStore = create<AttendanceStore>((set, get) => ({
  records: [],
  isLoading: false,

  loadAll: async () => {
    set({ isLoading: true })
    const db = await getDB()
    const records = await db.getAll('attendance')
    set({ records, isLoading: false })
  },

  loadForTraining: async (treinoId) => {
    const db = await getDB()
    const records = await db.getAllFromIndex('attendance', 'by-treino', treinoId)
    set((s) => {
      const existing = s.records.filter((r) => r.treinoId !== treinoId)
      return { records: [...existing, ...records] }
    })
  },

  upsert: async (treinoId, atletaId, status, opts = {}) => {
    const id = `${treinoId}::${atletaId}`
    const now = new Date().toISOString()
    const record: AttendanceRecord = {
      id,
      treinoId,
      atletaId,
      status,
      justificativa: opts.justificativa,
      confirmadoPelaAtleta: opts.confirmadoPelaAtleta ?? false,
      registradoEm: now,
    }
    const db = await getDB()
    await db.put('attendance', record)
    set((s) => {
      const without = s.records.filter((r) => r.id !== id)
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

  syncFromRemote: async (config, opts) => {
    const result = await pullConfirmations(config, opts)
    if (!result.ok) return { ok: false, merged: 0, error: result.error }

    const remote = result.records ?? []
    const db = await getDB()
    const local = await db.getAll('attendance')
    const localById = new Map(local.map((r) => [r.id, r]))

    let merged = 0
    const tx = db.transaction('attendance', 'readwrite')
    const promises: Promise<unknown>[] = []
    for (const r of remote) {
      const id = `${r.treinoId}::${r.atletaId}`
      const existing = localById.get(id)
      const isFromAthlete = r.origem === 'link'
      // Regra (mantém a do TrainingDetailPage atual): override se vazio, ou pendente local,
      // ou remote veio do link (atleta confirmou).
      const shouldOverride = !existing || existing.status === 'pendente' || isFromAthlete
      if (!shouldOverride) continue
      if (r.status !== 'presente' && r.status !== 'ausente' && r.status !== 'justificado') continue

      const next: AttendanceRecord = {
        id,
        treinoId: r.treinoId,
        atletaId: r.atletaId,
        status: r.status,
        justificativa: existing?.justificativa,
        confirmadoPelaAtleta: isFromAthlete,
        registradoEm: r.timestamp || new Date().toISOString(),
      }
      promises.push(tx.store.put(next))
      merged++
    }
    await Promise.all(promises)
    await tx.done

    if (merged > 0) {
      await get().loadAll()
    }
    return { ok: true, merged }
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

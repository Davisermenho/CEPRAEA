import { create } from 'zustand'
import { getDB } from '@/db'
import type { AppSettings, RecurrenceSchedule, Training, TrainingStatus, TrainingType, HolidayConflict } from '@/types'
import { generateRecurringDrafts, buildExistingKeys, DEFAULT_SCHEDULES } from '@/lib/recurrence'
import { getTrainingConflicts } from '@/lib/holidays'
import { getSetting } from '@/db'
import {
  loadSyncConfig,
  pullTrainings,
  pushTraining,
  deleteTrainingRemote,
  type SyncConfig,
} from '@/lib/sync'

interface TrainingStore {
  trainings: Training[]
  isLoading: boolean
  loadAll: () => Promise<void>
  generateRecurring: () => Promise<number>
  addExtra: (data: Omit<Training, 'id' | 'tipo' | 'criadoManualmente' | 'createdAt' | 'updatedAt'>) => Promise<Training>
  add: (data: Omit<Training, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Training>
  update: (id: string, data: Partial<Omit<Training, 'id' | 'createdAt'>>) => Promise<void>
  remove: (id: string) => Promise<void>
  updateStatus: (id: string, status: TrainingStatus) => Promise<void>
  getById: (id: string) => Training | undefined
  getConflicts: () => HolidayConflict[]
  syncFromRemote: (config: SyncConfig, opts?: { since?: string; until?: string }) => Promise<{ ok: boolean; merged: number; error?: string }>
}

function sortTrainings(list: Training[]): Training[] {
  return [...list].sort((a, b) => a.data.localeCompare(b.data) || a.horaInicio.localeCompare(b.horaInicio))
}

function pushSilently(training: Training) {
  void loadSyncConfig().then((config) => {
    if (config) void pushTraining(config, training)
  })
}

export const useTrainingStore = create<TrainingStore>((set, get) => ({
  trainings: [],
  isLoading: false,

  loadAll: async () => {
    set({ isLoading: true })
    const db = await getDB()
    const trainings = await db.getAll('trainings')
    set({ trainings: sortTrainings(trainings), isLoading: false })
  },

  generateRecurring: async () => {
    const settings = await getSetting<AppSettings>('appSettings')
    const semanasFuturas = settings?.semanasFuturas ?? (await getSetting<number>('semanasFuturas')) ?? 12
    const schedules: RecurrenceSchedule[] = settings?.recurrenceSchedules?.length
      ? settings.recurrenceSchedules
      : DEFAULT_SCHEDULES
    const existing = get().trainings
    const existingKeys = buildExistingKeys(existing)
    const drafts = generateRecurringDrafts(semanasFuturas, existingKeys, schedules)

    if (drafts.length === 0) return 0

    const now = new Date().toISOString()
    const newTrainings: Training[] = drafts.map((d) => ({
      ...d,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    }))

    const db = await getDB()
    const tx = db.transaction('trainings', 'readwrite')
    await Promise.all(newTrainings.map((t) => tx.store.put(t)))
    await tx.done

    set((s) => ({ trainings: sortTrainings([...s.trainings, ...newTrainings]) }))

    // Push em batch (silencioso)
    void loadSyncConfig().then((config) => {
      if (!config) return
      for (const t of newTrainings) void pushTraining(config, t)
    })

    return newTrainings.length
  },

  addExtra: async (data) => {
    return get().add({ ...data, tipo: 'extra', criadoManualmente: true })
  },

  add: async (data) => {
    const now = new Date().toISOString()
    const training: Training = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    }
    const db = await getDB()
    await db.put('trainings', training)
    set((s) => ({ trainings: sortTrainings([...s.trainings, training]) }))
    pushSilently(training)
    return training
  },

  update: async (id, data) => {
    const db = await getDB()
    const existing = await db.get('trainings', id)
    if (!existing) return
    const updated: Training = { ...existing, ...data, updatedAt: new Date().toISOString() }
    await db.put('trainings', updated)
    set((s) => ({ trainings: sortTrainings(s.trainings.map((t) => (t.id === id ? updated : t))) }))
    pushSilently(updated)
  },

  remove: async (id) => {
    const db = await getDB()
    await db.delete('trainings', id)
    set((s) => ({ trainings: s.trainings.filter((t) => t.id !== id) }))

    void loadSyncConfig().then((config) => {
      if (config) void deleteTrainingRemote(config, id)
    })
  },

  updateStatus: async (id, status) => {
    await get().update(id, { status })
  },

  getById: (id) => get().trainings.find((t) => t.id === id),

  getConflicts: () => getTrainingConflicts(get().trainings),

  syncFromRemote: async (config, opts) => {
    const result = await pullTrainings(config, opts)
    if (!result.ok) return { ok: false, merged: 0, error: result.error }

    const remote = result.records ?? []
    const db = await getDB()
    const local = await db.getAll('trainings')
    const localById = new Map(local.map((t) => [t.id, t]))

    let merged = 0
    const tx = db.transaction('trainings', 'readwrite')
    const promises: Promise<unknown>[] = []
    for (const r of remote) {
      const localTraining = localById.get(r.id)
      const next: Training = {
        id: r.id,
        tipo: (r.tipo as TrainingType) || 'recorrente',
        status: (r.status as TrainingStatus) || 'agendado',
        data: r.data,
        horaInicio: r.horaInicio,
        horaFim: r.horaFim || '',
        local: r.local || undefined,
        observacoes: r.observacoes || undefined,
        feriadoOrigem: r.feriadoOrigem || undefined,
        criadoManualmente: !!r.criadoManualmente,
        createdAt: r.createdAt || localTraining?.createdAt || new Date().toISOString(),
        updatedAt: r.updatedAt || new Date().toISOString(),
      }
      if (!localTraining || (r.updatedAt && r.updatedAt > localTraining.updatedAt)) {
        promises.push(tx.store.put(next))
        merged++
      }
    }
    await Promise.all(promises)
    await tx.done

    if (merged > 0) {
      await get().loadAll()
    }
    return { ok: true, merged }
  },
}))

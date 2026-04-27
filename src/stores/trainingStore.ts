import { create } from 'zustand'
import { getDB } from '@/db'
import type { Training, TrainingStatus, HolidayConflict } from '@/types'
import { generateRecurringDrafts, buildExistingKeys } from '@/lib/recurrence'
import { getTrainingConflicts } from '@/lib/holidays'
import { getSetting } from '@/db'

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
}

export const useTrainingStore = create<TrainingStore>((set, get) => ({
  trainings: [],
  isLoading: false,

  loadAll: async () => {
    set({ isLoading: true })
    const db = await getDB()
    const trainings = await db.getAll('trainings')
    trainings.sort((a, b) => a.data.localeCompare(b.data) || a.horaInicio.localeCompare(b.horaInicio))
    set({ trainings, isLoading: false })
  },

  generateRecurring: async () => {
    const semanasFuturas = (await getSetting<number>('semanasFuturas')) ?? 12
    const existing = get().trainings
    const existingKeys = buildExistingKeys(existing)
    const drafts = generateRecurringDrafts(semanasFuturas, existingKeys)

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

    set((s) => ({
      trainings: [...s.trainings, ...newTrainings].sort(
        (a, b) => a.data.localeCompare(b.data) || a.horaInicio.localeCompare(b.horaInicio)
      ),
    }))

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
    set((s) => ({
      trainings: [...s.trainings, training].sort(
        (a, b) => a.data.localeCompare(b.data) || a.horaInicio.localeCompare(b.horaInicio)
      ),
    }))
    return training
  },

  update: async (id, data) => {
    const db = await getDB()
    const existing = await db.get('trainings', id)
    if (!existing) return
    const updated: Training = { ...existing, ...data, updatedAt: new Date().toISOString() }
    await db.put('trainings', updated)
    set((s) => ({
      trainings: s.trainings
        .map((t) => (t.id === id ? updated : t))
        .sort((a, b) => a.data.localeCompare(b.data) || a.horaInicio.localeCompare(b.horaInicio)),
    }))
  },

  remove: async (id) => {
    const db = await getDB()
    await db.delete('trainings', id)
    set((s) => ({ trainings: s.trainings.filter((t) => t.id !== id) }))
  },

  updateStatus: async (id, status) => {
    await get().update(id, { status })
  },

  getById: (id) => get().trainings.find((t) => t.id === id),

  getConflicts: () => getTrainingConflicts(get().trainings),
}))

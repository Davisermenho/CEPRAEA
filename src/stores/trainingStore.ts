// trainingStore.ts — Supabase-first. Sem IndexedDB nem sync.ts.

import { create } from 'zustand'
import type { Training, TrainingStatus, HolidayConflict, RecurrenceSchedule } from '@/types'
import { DEFAULT_SCHEDULES } from '@/lib/recurrence'
import { getTrainingConflicts } from '@/lib/holidays'
import {
  fetchTrainings,
  createTraining,
  updateTraining,
  deleteTraining,
  generateRecurringViaRPC,
} from '@/features/trainings/trainingApi'

interface TrainingStore {
  trainings: Training[]
  isLoading: boolean
  error: string | null
  loadAll: () => Promise<void>
  generateRecurring: (schedules?: RecurrenceSchedule[], weeksAhead?: number) => Promise<{ count: number }>
  addExtra: (data: Omit<Training, 'id' | 'tipo' | 'criadoManualmente' | 'createdAt' | 'updatedAt'>) => Promise<Training>
  add: (data: Omit<Training, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Training>
  update: (id: string, data: Partial<Omit<Training, 'id' | 'createdAt'>>) => Promise<void>
  remove: (id: string) => Promise<void>
  updateStatus: (id: string, status: TrainingStatus) => Promise<void>
  getById: (id: string) => Training | undefined
  getConflicts: () => HolidayConflict[]
}

function sortTrainings(list: Training[]): Training[] {
  return [...list].sort((a, b) => a.data.localeCompare(b.data) || a.horaInicio.localeCompare(b.horaInicio))
}

export const useTrainingStore = create<TrainingStore>((set, get) => ({
  trainings: [],
  isLoading: false,
  error: null,

  loadAll: async () => {
    set({ isLoading: true, error: null })
    try {
      const trainings = await fetchTrainings()
      set({ trainings: sortTrainings(trainings), isLoading: false })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar treinos.'
      set({ isLoading: false, error: message })
    }
  },

  generateRecurring: async (schedules = DEFAULT_SCHEDULES, weeksAhead = 12) => {
    const count = await generateRecurringViaRPC(schedules, weeksAhead)
    if (count > 0) {
      await get().loadAll()
    }
    return { count }
  },

  addExtra: async (data) => {
    return get().add({ ...data, tipo: 'extra', criadoManualmente: true })
  },

  add: async (data) => {
    const training = await createTraining(data)
    set((s) => ({ trainings: sortTrainings([...s.trainings, training]) }))
    return training
  },

  update: async (id, data) => {
    const updated = await updateTraining(id, data)
    set((s) => ({
      trainings: sortTrainings(s.trainings.map((t) => (t.id === id ? updated : t))),
    }))
  },

  remove: async (id) => {
    await deleteTraining(id)
    set((s) => ({ trainings: s.trainings.filter((t) => t.id !== id) }))
  },

  updateStatus: async (id, status) => {
    await get().update(id, { status })
  },

  getById: (id) => get().trainings.find((t) => t.id === id),

  getConflicts: () => getTrainingConflicts(get().trainings),
}))

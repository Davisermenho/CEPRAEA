// athleteStore.ts — Supabase-first. Sem IndexedDB nem sync.ts.

import { create } from 'zustand'
import type { Athlete, AthleteStatus } from '@/types'
import {
  fetchAthletes,
  createAthlete,
  updateAthlete,
  deleteAthlete,
  toggleAthleteStatus,
} from '@/features/athletes/athleteApi'

interface AthleteStore {
  athletes: Athlete[]
  isLoading: boolean
  error: string | null
  loadAll: () => Promise<void>
  add: (data: Omit<Athlete, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Athlete>
  update: (id: string, data: Partial<Omit<Athlete, 'id' | 'createdAt'>>) => Promise<void>
  remove: (id: string) => Promise<void>
  toggleStatus: (id: string) => Promise<void>
  getById: (id: string) => Athlete | undefined
}

function sortByName(list: Athlete[]): Athlete[] {
  return [...list].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
}

export const useAthleteStore = create<AthleteStore>((set, get) => ({
  athletes: [],
  isLoading: false,
  error: null,

  loadAll: async () => {
    set({ isLoading: true, error: null })
    try {
      const athletes = await fetchAthletes()
      set({ athletes: sortByName(athletes), isLoading: false })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar atletas.'
      set({ isLoading: false, error: message })
    }
  },

  add: async (data) => {
    const athlete = await createAthlete(data)
    set((s) => ({ athletes: sortByName([...s.athletes, athlete]) }))
    return athlete
  },

  update: async (id, data) => {
    const updated = await updateAthlete(id, data)
    set((s) => ({
      athletes: sortByName(s.athletes.map((a) => (a.id === id ? updated : a))),
    }))
  },

  remove: async (id) => {
    await deleteAthlete(id)
    set((s) => ({ athletes: s.athletes.filter((a) => a.id !== id) }))
  },

  toggleStatus: async (id) => {
    const athlete = get().athletes.find((a) => a.id === id)
    if (!athlete) return
    const updated = await toggleAthleteStatus(id, athlete.status as AthleteStatus)
    set((s) => ({
      athletes: sortByName(s.athletes.map((a) => (a.id === id ? updated : a))),
    }))
  },

  getById: (id) => get().athletes.find((a) => a.id === id),
}))

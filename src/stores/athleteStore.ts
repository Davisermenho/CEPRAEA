import { create } from 'zustand'
import { getDB } from '@/db'
import type { Athlete, AthleteStatus } from '@/types'

interface AthleteStore {
  athletes: Athlete[]
  isLoading: boolean
  loadAll: () => Promise<void>
  add: (data: Omit<Athlete, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Athlete>
  update: (id: string, data: Partial<Omit<Athlete, 'id' | 'createdAt'>>) => Promise<void>
  remove: (id: string) => Promise<void>
  toggleStatus: (id: string) => Promise<void>
  getById: (id: string) => Athlete | undefined
}

export const useAthleteStore = create<AthleteStore>((set, get) => ({
  athletes: [],
  isLoading: false,

  loadAll: async () => {
    set({ isLoading: true })
    const db = await getDB()
    const athletes = await db.getAll('athletes')
    athletes.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
    set({ athletes, isLoading: false })
  },

  add: async (data) => {
    const now = new Date().toISOString()
    const athlete: Athlete = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    }
    const db = await getDB()
    await db.put('athletes', athlete)
    set((s) => ({
      athletes: [...s.athletes, athlete].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')),
    }))
    return athlete
  },

  update: async (id, data) => {
    const db = await getDB()
    const existing = await db.get('athletes', id)
    if (!existing) return
    const updated: Athlete = { ...existing, ...data, updatedAt: new Date().toISOString() }
    await db.put('athletes', updated)
    set((s) => ({
      athletes: s.athletes
        .map((a) => (a.id === id ? updated : a))
        .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')),
    }))
  },

  remove: async (id) => {
    const db = await getDB()
    await db.delete('athletes', id)
    set((s) => ({ athletes: s.athletes.filter((a) => a.id !== id) }))
  },

  toggleStatus: async (id) => {
    const athlete = get().athletes.find((a) => a.id === id)
    if (!athlete) return
    const newStatus: AthleteStatus = athlete.status === 'ativo' ? 'inativo' : 'ativo'
    await get().update(id, { status: newStatus })
  },

  getById: (id) => get().athletes.find((a) => a.id === id),
}))

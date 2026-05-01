import { create } from 'zustand'
import { getDB } from '@/db'
import type { ScoutGame, ScoutEvent } from '@/types'

interface ScoutStore {
  games: ScoutGame[]
  events: ScoutEvent[]
  isLoading: boolean
  loadGames: () => Promise<void>
  loadEvents: (jogoId: string) => Promise<void>
  addGame: (data: Omit<ScoutGame, 'id' | 'createdAt' | 'updatedAt'>) => Promise<ScoutGame>
  updateGame: (id: string, data: Partial<Omit<ScoutGame, 'id' | 'createdAt'>>) => Promise<void>
  removeGame: (id: string) => Promise<void>
  addEvent: (data: Omit<ScoutEvent, 'id' | 'createdAt'>) => Promise<ScoutEvent>
  updateEvent: (id: string, data: Partial<Omit<ScoutEvent, 'id' | 'createdAt'>>) => Promise<void>
  removeEvent: (id: string) => Promise<void>
  getGame: (id: string) => ScoutGame | undefined
}

export const useScoutStore = create<ScoutStore>((set, get) => ({
  games: [],
  events: [],
  isLoading: false,

  loadGames: async () => {
    set({ isLoading: true })
    const db = await getDB()
    const games = await db.getAll('scoutGames')
    games.sort((a, b) => b.data.localeCompare(a.data))
    set({ games, isLoading: false })
  },

  loadEvents: async (jogoId) => {
    set({ isLoading: true })
    const db = await getDB()
    const events = await db.getAllFromIndex('scoutEvents', 'by-jogo', jogoId)
    events.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    set({ events, isLoading: false })
  },

  addGame: async (data) => {
    const now = new Date().toISOString()
    const game: ScoutGame = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now }
    const db = await getDB()
    await db.put('scoutGames', game)
    set((s) => ({ games: [game, ...s.games] }))
    return game
  },

  updateGame: async (id, data) => {
    const db = await getDB()
    const existing = await db.get('scoutGames', id)
    if (!existing) return
    const updated: ScoutGame = { ...existing, ...data, updatedAt: new Date().toISOString() }
    await db.put('scoutGames', updated)
    set((s) => ({ games: s.games.map((g) => (g.id === id ? updated : g)) }))
  },

  removeGame: async (id) => {
    const db = await getDB()
    await db.delete('scoutGames', id)
    // Remove all events of this game
    const events = await db.getAllFromIndex('scoutEvents', 'by-jogo', id)
    for (const e of events) await db.delete('scoutEvents', e.id)
    set((s) => ({ games: s.games.filter((g) => g.id !== id) }))
  },

  addEvent: async (data) => {
    const now = new Date().toISOString()
    const event: ScoutEvent = { ...data, id: crypto.randomUUID(), createdAt: now }
    const db = await getDB()
    await db.put('scoutEvents', event)
    set((s) => ({ events: [...s.events, event] }))
    return event
  },

  updateEvent: async (id, data) => {
    const db = await getDB()
    const existing = await db.get('scoutEvents', id)
    if (!existing) return
    const updated: ScoutEvent = { ...existing, ...data }
    await db.put('scoutEvents', updated)
    set((s) => ({ events: s.events.map((e) => (e.id === id ? updated : e)) }))
  },

  removeEvent: async (id) => {
    const db = await getDB()
    await db.delete('scoutEvents', id)
    set((s) => ({ events: s.events.filter((e) => e.id !== id) }))
  },

  getGame: (id) => get().games.find((g) => g.id === id),
}))

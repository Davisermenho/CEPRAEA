import { create } from 'zustand'
import { getDB } from '@/db'
import type { Athlete, AthleteStatus } from '@/types'
import {
  loadSyncConfig,
  pullAthletes,
  pushAthlete,
  deleteAthleteRemote,
  type SyncConfig,
  type RemoteAthlete,
} from '@/lib/sync'

interface AthleteStore {
  athletes: Athlete[]
  isLoading: boolean
  loadAll: () => Promise<void>
  add: (data: Omit<Athlete, 'id' | 'createdAt' | 'updatedAt'>, opts?: { pin?: string }) => Promise<Athlete>
  update: (id: string, data: Partial<Omit<Athlete, 'id' | 'createdAt'>>, opts?: { pin?: string }) => Promise<void>
  remove: (id: string) => Promise<void>
  toggleStatus: (id: string) => Promise<void>
  getById: (id: string) => Athlete | undefined
  syncFromRemote: (config: SyncConfig) => Promise<{ ok: boolean; merged: number; error?: string }>
}

function sortByName(list: Athlete[]): Athlete[] {
  return [...list].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
}

export const useAthleteStore = create<AthleteStore>((set, get) => ({
  athletes: [],
  isLoading: false,

  loadAll: async () => {
    set({ isLoading: true })
    const db = await getDB()
    const athletes = await db.getAll('athletes')
    set({ athletes: sortByName(athletes), isLoading: false })
  },

  add: async (data, opts) => {
    const now = new Date().toISOString()
    const athlete: Athlete = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    }
    const db = await getDB()
    await db.put('athletes', athlete)
    set((s) => ({ athletes: sortByName([...s.athletes, athlete]) }))

    // Push (silencioso, só se treinador estiver configurado)
    void loadSyncConfig().then((config) => {
      if (config) void pushAthlete(config, athlete, { pin: opts?.pin })
    })

    return athlete
  },

  update: async (id, data, opts) => {
    const db = await getDB()
    const existing = await db.get('athletes', id)
    if (!existing) return
    const updated: Athlete = { ...existing, ...data, updatedAt: new Date().toISOString() }
    await db.put('athletes', updated)
    set((s) => ({ athletes: sortByName(s.athletes.map((a) => (a.id === id ? updated : a))) }))

    void loadSyncConfig().then((config) => {
      if (config) void pushAthlete(config, updated, { pin: opts?.pin })
    })
  },

  remove: async (id) => {
    const db = await getDB()
    await db.delete('athletes', id)
    set((s) => ({ athletes: s.athletes.filter((a) => a.id !== id) }))

    void loadSyncConfig().then((config) => {
      if (config) void deleteAthleteRemote(config, id)
    })
  },

  toggleStatus: async (id) => {
    const athlete = get().athletes.find((a) => a.id === id)
    if (!athlete) return
    const newStatus: AthleteStatus = athlete.status === 'ativo' ? 'inativo' : 'ativo'
    await get().update(id, { status: newStatus })
  },

  getById: (id) => get().athletes.find((a) => a.id === id),

  syncFromRemote: async (config) => {
    const result = await pullAthletes(config)
    if (!result.ok) return { ok: false, merged: 0, error: result.error }

    const remote = result.records ?? []
    const db = await getDB()
    const local = await db.getAll('athletes')
    const localById = new Map(local.map((a) => [a.id, a]))

    let merged = 0
    const tx = db.transaction('athletes', 'readwrite')
    const promises: Promise<unknown>[] = []
    for (const r of remote) {
      const localAthlete = localById.get(r.id)
      // Atleta tem versão pública (sem telefone/pinHash) — preserva campos locais quando existem
      const next: Athlete = {
        id: r.id,
        nome: r.nome,
        telefone: localAthlete?.telefone ?? '',
        categoria: r.categoria || undefined,
        nivel: r.nivel || undefined,
        status: (r.status as AthleteStatus) || 'ativo',
        observacoes: r.observacoes || undefined,
        createdAt: r.createdAt || localAthlete?.createdAt || new Date().toISOString(),
        updatedAt: r.updatedAt || new Date().toISOString(),
      }
      // Last-write-wins: só sobrescreve se remote.updatedAt > local.updatedAt
      if (!localAthlete || (r.updatedAt && r.updatedAt > localAthlete.updatedAt)) {
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

// Re-exporta tipo para uso interno se necessário
export type { RemoteAthlete }

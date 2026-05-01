import { openDB, type DBSchema } from 'idb'
import type { Athlete, Training, AttendanceRecord, ScoutGame, ScoutEvent } from '@/types'

interface CepraeaDB extends DBSchema {
  athletes: {
    key: string
    value: Athlete
  }
  trainings: {
    key: string
    value: Training
    indexes: { 'by-data': string }
  }
  attendance: {
    key: string
    value: AttendanceRecord
    indexes: {
      'by-treino': string
      'by-atleta': string
    }
  }
  settings: {
    key: string
    value: { key: string; value: unknown }
  }
  scoutGames: {
    key: string
    value: ScoutGame
    indexes: { 'by-data': string }
  }
  scoutEvents: {
    key: string
    value: ScoutEvent
    indexes: { 'by-jogo': string }
  }
}

const DB_NAME = 'cepraea-db'
const DB_VERSION = 2

let dbPromise: ReturnType<typeof openDB<CepraeaDB>> | null = null

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<CepraeaDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('athletes')) {
          db.createObjectStore('athletes', { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('trainings')) {
          const ts = db.createObjectStore('trainings', { keyPath: 'id' })
          ts.createIndex('by-data', 'data')
        }
        if (!db.objectStoreNames.contains('attendance')) {
          const as = db.createObjectStore('attendance', { keyPath: 'id' })
          as.createIndex('by-treino', 'treinoId')
          as.createIndex('by-atleta', 'atletaId')
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' })
        }
        if (!db.objectStoreNames.contains('scoutGames')) {
          const sg = db.createObjectStore('scoutGames', { keyPath: 'id' })
          sg.createIndex('by-data', 'data')
        }
        if (!db.objectStoreNames.contains('scoutEvents')) {
          const se = db.createObjectStore('scoutEvents', { keyPath: 'id' })
          se.createIndex('by-jogo', 'jogoId')
        }
      },
    })
  }
  return dbPromise
}

export async function getSetting<T>(key: string): Promise<T | undefined> {
  const db = await getDB()
  const row = await db.get('settings', key)
  return row?.value as T | undefined
}

export async function setSetting<T>(key: string, value: T): Promise<void> {
  const db = await getDB()
  await db.put('settings', { key, value })
}

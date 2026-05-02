import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Polyfill crypto.subtle para jsdom
Object.defineProperty(globalThis, 'crypto', {
  value: {
    subtle: {
      digest: async (algorithm: string, data: BufferSource) => {
        // Implementação real usando Node.js crypto para garantir resultados corretos
        const { createHash } = await import('crypto')
        const algo = algorithm.replace('-', '').toLowerCase()
        const buffer = Buffer.from(data as ArrayBuffer)
        return createHash(algo).update(buffer).digest().buffer
      },
    },
    getRandomValues: (arr: Uint8Array) => {
      const { randomFillSync } = require('crypto')
      return randomFillSync(arr)
    },
  },
  writable: true,
})

// Polyfill sessionStorage e localStorage
const createStorage = () => {
  const store: Record<string, string> = {}
  return {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => { store[k] = v },
    removeItem: (k: string) => { delete store[k] },
    clear: () => { Object.keys(store).forEach(k => delete store[k]) },
    get length() { return Object.keys(store).length },
    key: (i: number) => Object.keys(store)[i] ?? null,
  }
}

Object.defineProperty(window, 'sessionStorage', { value: createStorage(), writable: true })
Object.defineProperty(window, 'localStorage', { value: createStorage(), writable: true })

// Reset storage entre testes
beforeEach(() => {
  window.sessionStorage.clear()
  window.localStorage.clear()
  vi.clearAllMocks()
})

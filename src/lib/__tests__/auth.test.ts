/**
 * Testes unitários — lib/auth.ts
 *
 * SABOTAGENS documentadas (como fazer cada teste falhar de verdade):
 * - hashPin: mudar o salt 'cepraea_salt_2025' → hash muda → verifyPin retorna false
 * - verifyPin: retornar sempre true → test_verifyPin_wrong_pin vai passar mesmo com pin errado → DETECTADO
 * - setSession/clearSession: trocar sessionStorage por localStorage → reset entre testes falha → DETECTADO
 */

import { describe, test, expect, beforeEach } from 'vitest'
import { hashPin, verifyPin, setSession, clearSession, isAuthenticated } from '../auth'

// ─── hashPin ──────────────────────────────────────────────────────────────────

describe('hashPin', () => {
  test('retorna string hex de 64 chars (SHA-256)', async () => {
    const hash = await hashPin('1234')
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
  })

  test('é determinístico — mesmo input sempre retorna mesmo hash', async () => {
    const hash1 = await hashPin('1234')
    const hash2 = await hashPin('1234')
    expect(hash1).toBe(hash2)
  })

  test('é sensível ao input — PINs diferentes produzem hashes diferentes', async () => {
    const h1 = await hashPin('1234')
    const h2 = await hashPin('1235')
    const h3 = await hashPin('0000')
    expect(h1).not.toBe(h2)
    expect(h1).not.toBe(h3)
    expect(h2).not.toBe(h3)
  })

  test('inclui o salt cepraea_salt_2025 — hash de "1234" não é SHA-256 puro de "1234"', async () => {
    // SHA-256 puro de "1234" é conhecido
    const pureHash = '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4'
    const saltedHash = await hashPin('1234')
    expect(saltedHash).not.toBe(pureHash)
  })
})

// ─── verifyPin ────────────────────────────────────────────────────────────────

describe('verifyPin', () => {
  test('retorna true para PIN correto', async () => {
    const hash = await hashPin('5678')
    const result = await verifyPin('5678', hash)
    expect(result).toBe(true)
  })

  test('retorna false para PIN incorreto — não vaza acesso', async () => {
    const hash = await hashPin('5678')
    const result = await verifyPin('9999', hash)
    expect(result).toBe(false)
  })

  test('retorna false para hash vazio — sem acesso sem PIN configurado', async () => {
    const result = await verifyPin('1234', '')
    expect(result).toBe(false)
  })

  test('retorna false para hash corrompido', async () => {
    const result = await verifyPin('1234', 'hash_invalido_nao_hex')
    expect(result).toBe(false)
  })

  test('é sensível a case — hash em maiúsculas não casa com hash em minúsculas', async () => {
    const hash = await hashPin('1234')
    const upper = hash.toUpperCase()
    if (upper !== hash) {
      const result = await verifyPin('1234', upper)
      expect(result).toBe(false)
    }
  })
})

// ─── Session (treinador) ──────────────────────────────────────────────────────

describe('session do treinador', () => {
  beforeEach(() => {
    clearSession()
  })

  test('isAuthenticated retorna false quando não há sessão', () => {
    expect(isAuthenticated()).toBe(false)
  })

  test('isAuthenticated retorna true após setSession', () => {
    setSession()
    expect(isAuthenticated()).toBe(true)
  })

  test('clearSession remove a autenticação', () => {
    setSession()
    clearSession()
    expect(isAuthenticated()).toBe(false)
  })

  test('sessão não persiste entre simulações de reload (sessionStorage é ephemeral)', () => {
    setSession()
    // Simula "outro aba" limpando sessionStorage
    window.sessionStorage.clear()
    expect(isAuthenticated()).toBe(false)
  })

  test('setSession múltiplos calls não causa erro', () => {
    setSession()
    setSession()
    setSession()
    expect(isAuthenticated()).toBe(true)
  })
})

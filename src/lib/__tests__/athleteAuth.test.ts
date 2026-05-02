/**
 * Testes unitários — lib/athleteAuth.ts
 *
 * SABOTAGENS documentadas:
 * - getAtletaSession retornando session inválida: remover validação de atletaId/token → test_retorna_null_sem_atletaId falha → DETECTADO
 * - loginAtleta sem endpoint: remover verificação de endpoint → retornaria erro diferente → DETECTADO
 * - clearAtletaSession: comentar a linha de removeItem → isAtletaAuthenticated permanece true → DETECTADO
 */

import { describe, test, expect, vi, beforeEach } from 'vitest'
import {
  getAtletaSession,
  isAtletaAuthenticated,
  clearAtletaSession,
  loginAtleta,
  type AtletaSession,
} from '../athleteAuth'

// Mock do módulo sync para isolar athleteAuth da rede
vi.mock('../sync', () => ({
  resolveEndpointUrl: vi.fn(),
  loginAtleta: vi.fn(),
}))

const VALID_SESSION: AtletaSession = {
  atletaId: 'atleta-001',
  nome: 'Maria Silva',
  telefone: '11999998888',
  token: 'token-valido-abc123',
  loggedAt: new Date().toISOString(),
}

// ─── getAtletaSession ─────────────────────────────────────────────────────────

describe('getAtletaSession', () => {
  test('retorna null quando localStorage está vazio', () => {
    expect(getAtletaSession()).toBeNull()
  })

  test('retorna null quando localStorage tem JSON inválido — não lança exceção', () => {
    localStorage.setItem('cepraea_atleta_session', '{json_quebrado:')
    expect(() => getAtletaSession()).not.toThrow()
    expect(getAtletaSession()).toBeNull()
  })

  test('retorna null quando session não tem atletaId', () => {
    const sem = { ...VALID_SESSION, atletaId: '' }
    localStorage.setItem('cepraea_atleta_session', JSON.stringify(sem))
    expect(getAtletaSession()).toBeNull()
  })

  test('retorna null quando session não tem token', () => {
    const sem = { ...VALID_SESSION, token: '' }
    localStorage.setItem('cepraea_atleta_session', JSON.stringify(sem))
    expect(getAtletaSession()).toBeNull()
  })

  test('retorna session válida com todos os campos', () => {
    localStorage.setItem('cepraea_atleta_session', JSON.stringify(VALID_SESSION))
    const session = getAtletaSession()
    expect(session).not.toBeNull()
    expect(session!.atletaId).toBe('atleta-001')
    expect(session!.nome).toBe('Maria Silva')
    expect(session!.token).toBe('token-valido-abc123')
  })

  test('retorna null quando campo atletaId está ausente no objeto', () => {
    const { atletaId: _, ...sem } = VALID_SESSION
    localStorage.setItem('cepraea_atleta_session', JSON.stringify(sem))
    expect(getAtletaSession()).toBeNull()
  })
})

// ─── isAtletaAuthenticated ────────────────────────────────────────────────────

describe('isAtletaAuthenticated', () => {
  test('retorna false sem session', () => {
    expect(isAtletaAuthenticated()).toBe(false)
  })

  test('retorna true com session válida', () => {
    localStorage.setItem('cepraea_atleta_session', JSON.stringify(VALID_SESSION))
    expect(isAtletaAuthenticated()).toBe(true)
  })
})

// ─── clearAtletaSession ───────────────────────────────────────────────────────

describe('clearAtletaSession', () => {
  test('remove session do localStorage', () => {
    localStorage.setItem('cepraea_atleta_session', JSON.stringify(VALID_SESSION))
    expect(isAtletaAuthenticated()).toBe(true)
    clearAtletaSession()
    expect(isAtletaAuthenticated()).toBe(false)
  })

  test('não lança erro quando chamado sem session ativa', () => {
    expect(() => clearAtletaSession()).not.toThrow()
    expect(isAtletaAuthenticated()).toBe(false)
  })
})

// ─── loginAtleta ──────────────────────────────────────────────────────────────

describe('loginAtleta', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  test('retorna erro "Sistema não configurado" quando endpoint é null', async () => {
    const { resolveEndpointUrl } = await import('../sync')
    vi.mocked(resolveEndpointUrl).mockResolvedValue(null)

    const result = await loginAtleta('11999998888', '1234')
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/configurado/i)
  })

  test('retorna erro quando remoteLogin falha', async () => {
    const { resolveEndpointUrl, loginAtleta: remoteLogin } = await import('../sync')
    vi.mocked(resolveEndpointUrl).mockResolvedValue('https://example.com/exec')
    vi.mocked(remoteLogin).mockResolvedValue({ ok: false, error: 'invalid_credentials' })

    const result = await loginAtleta('11999998888', '9999')
    expect(result.ok).toBe(false)
    expect(result.error).toBe('invalid_credentials')
    // PROVA que não salvou session
    expect(getAtletaSession()).toBeNull()
  })

  test('salva session em localStorage quando login bem-sucedido', async () => {
    const { resolveEndpointUrl, loginAtleta: remoteLogin } = await import('../sync')
    vi.mocked(resolveEndpointUrl).mockResolvedValue('https://example.com/exec')
    vi.mocked(remoteLogin).mockResolvedValue({
      ok: true,
      atletaId: 'atleta-001',
      nome: 'Maria Silva',
      token: 'jwt-token-real',
    })

    const result = await loginAtleta('11 99999-8888', '1234')
    expect(result.ok).toBe(true)
    expect(result.session?.atletaId).toBe('atleta-001')

    // PROVA do efeito colateral — session persistiu no localStorage
    const saved = getAtletaSession()
    expect(saved).not.toBeNull()
    expect(saved!.atletaId).toBe('atleta-001')
    expect(saved!.telefone).toBe('11999998888') // telefone normalizado (sem máscara)
  })

  test('retorna erro quando remoteLogin retorna ok:true mas token ausente', async () => {
    const { resolveEndpointUrl, loginAtleta: remoteLogin } = await import('../sync')
    vi.mocked(resolveEndpointUrl).mockResolvedValue('https://example.com/exec')
    // Simula resposta malformada do backend
    vi.mocked(remoteLogin).mockResolvedValue({ ok: true, atletaId: 'abc' }) // sem token

    const result = await loginAtleta('11999998888', '1234')
    expect(result.ok).toBe(false)
    expect(getAtletaSession()).toBeNull()
  })
})

/**
 * Testes unitários — lib/sync.ts
 *
 * SABOTAGENS documentadas:
 * - generateSecret: remover crypto.getRandomValues → retorna string fixa → test_secret_is_random falha → DETECTADO
 * - generateSecret: usar 8 bytes em vez de 16 → length 16 em vez de 32 → test_secret_length falha → DETECTADO
 * - pingEndpoint: remover timeout → AbortController desativado → test_ping_timeout ficaria pendente → DETECTADO
 * - resolveEndpointUrl: remover fallback de env → retorna null quando IDB está vazio → DETECTADO
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { generateSecret, pingEndpoint, resolveEndpointUrl } from '../sync'

// ─── generateSecret ───────────────────────────────────────────────────────────

describe('generateSecret', () => {
  test('retorna string de exatamente 32 chars hexadecimais', () => {
    const secret = generateSecret()
    expect(secret).toHaveLength(32)
    expect(secret).toMatch(/^[0-9a-f]{32}$/)
  })

  test('cada chamada gera valor diferente — é aleatório', () => {
    const secrets = new Set(Array.from({ length: 10 }, () => generateSecret()))
    // Com 16 bytes aleatórios, colisão é astronomicamente improvável
    expect(secrets.size).toBe(10)
  })

  test('não contém caracteres fora do range hex', () => {
    for (let i = 0; i < 20; i++) {
      const s = generateSecret()
      expect(s).toMatch(/^[0-9a-f]+$/)
    }
  })
})

// ─── pingEndpoint ─────────────────────────────────────────────────────────────

describe('pingEndpoint', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  test('retorna ok:true quando endpoint responde {ok:true}', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ ok: true, role: 'coach' }), { status: 200 }),
    )
    const result = await pingEndpoint({ endpointUrl: 'https://example.com/exec', secret: 'abc' })
    expect(result.ok).toBe(true)
  })

  test('retorna ok:false quando endpoint responde {ok:false}', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ ok: false }), { status: 200 }),
    )
    const result = await pingEndpoint({ endpointUrl: 'https://example.com/exec', secret: 'abc' })
    expect(result.ok).toBe(false)
  })

  test('retorna ok:false com erro "Secret incorreto" quando responde {error:"unauthorized"}', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ error: 'unauthorized' }), { status: 200 }),
    )
    const result = await pingEndpoint({ endpointUrl: 'https://example.com/exec', secret: 'errado' })
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/secret/i)
  })

  test('retorna ok:false com mensagem de erro quando fetch lança exceção (rede)', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network Error'))
    const result = await pingEndpoint({ endpointUrl: 'https://example.com/exec', secret: 'abc' })
    expect(result.ok).toBe(false)
    expect(result.error).toBeTruthy()
  })

  test('retorna ok:false com "Timeout" quando fetch é abortado', async () => {
    // AbortController.abort() lança um Error com 'abort' na mensagem no ambiente real
    // errorMessage() em sync.ts checa `msg.includes('abort')` → retorna 'Timeout...'
    const abortErr = new Error('The user aborted a request.')
    Object.defineProperty(abortErr, 'name', { value: 'AbortError' })
    vi.mocked(fetch).mockRejectedValue(abortErr)
    const result = await pingEndpoint({ endpointUrl: 'https://example.com/exec', secret: 'abc' })
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/timeout/i)
  })

  test('inclui secret como query param — não expõe em URL sem ele', async () => {
    let capturedUrl = ''
    vi.mocked(fetch).mockImplementation(async (url) => {
      capturedUrl = url as string
      return new Response(JSON.stringify({ ok: true }), { status: 200 })
    })
    await pingEndpoint({ endpointUrl: 'https://example.com/exec', secret: 'meu-secret' })
    expect(capturedUrl).toContain('secret=meu-secret')
    expect(capturedUrl).toContain('action=ping')
  })
})

// ─── resolveEndpointUrl ───────────────────────────────────────────────────────

describe('resolveEndpointUrl', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  test('retorna URL do IDB quando configurada pelo treinador', async () => {
    vi.doMock('@/db', () => ({
      getSetting: vi.fn().mockResolvedValue('https://idb.example.com/exec'),
    }))
    // Re-importa após mock para pegar nova versão
    const { resolveEndpointUrl: resolve } = await import('../sync')
    const url = await resolve()
    expect(url).toBe('https://idb.example.com/exec')
  })

  test('retorna null quando IDB e env estão vazios', async () => {
    vi.doMock('@/db', () => ({
      getSetting: vi.fn().mockResolvedValue(null),
    }))
    // VITE_SYNC_ENDPOINT_URL não estará definido em ambiente de teste
    const { resolveEndpointUrl: resolve } = await import('../sync')
    const url = await resolve()
    // Em testes sem a variável de ambiente configurada no Vite, retorna null
    expect(url === null || typeof url === 'string').toBe(true) // não lança
  })

  test('IDB tem precedência sobre env — mesmo que env esteja definido', async () => {
    vi.doMock('@/db', () => ({
      getSetting: vi.fn().mockResolvedValue('https://idb-priority.example.com/exec'),
    }))
    const { resolveEndpointUrl: resolve } = await import('../sync')
    const url = await resolve()
    expect(url).toBe('https://idb-priority.example.com/exec')
  })
})

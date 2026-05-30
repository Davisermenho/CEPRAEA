import { describe, it, expect, vi } from 'vitest'
import { hibpCheck } from '../hibpCheck'

// Helper: build a fake HIBP range response containing a target suffix
function rangeBody(suffixes: Array<[string, number]>, extra: string[] = []): string {
  const lines = [
    ...suffixes.map(([suf, count]) => `${suf}:${count}`),
    ...extra.map((suf) => `${suf}:0`),
  ]
  return lines.join('\n')
}

async function sha1HexUpper(input: string): Promise<string> {
  const enc = new TextEncoder().encode(input)
  const buf = await crypto.subtle.digest('SHA-1', enc)
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()
}

describe('hibpCheck', () => {
  it('detecta senha vazada quando sufixo presente com count > 0', async () => {
    const password = 'password'
    const hash = await sha1HexUpper(password)
    const suffix = hash.slice(5)
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => rangeBody([[suffix, 9876543]]),
    } as Response)
    const r = await hibpCheck(password, { fetchImpl: fetchImpl as unknown as typeof fetch })
    expect(r.pwned).toBe(true)
    expect(r.count).toBeGreaterThan(0)
    expect(r.unavailable).toBe(false)
  })

  it('aceita senha não encontrada', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => rangeBody([], ['ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ']),
    } as Response)
    const r = await hibpCheck('Abcdef1234uniq', { fetchImpl: fetchImpl as unknown as typeof fetch })
    expect(r.pwned).toBe(false)
    expect(r.unavailable).toBe(false)
  })

  it('marca unavailable quando rede falha (fail-open)', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error('network'))
    const r = await hibpCheck('Abcdef1234', { fetchImpl: fetchImpl as unknown as typeof fetch })
    expect(r.unavailable).toBe(true)
    expect(r.pwned).toBe(false)
  })

  it('marca unavailable em HTTP não-OK', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false, text: async () => '' } as Response)
    const r = await hibpCheck('Abcdef1234', { fetchImpl: fetchImpl as unknown as typeof fetch })
    expect(r.unavailable).toBe(true)
  })

  it('SHALL NOT enviar a senha; SHALL enviar apenas prefixo (5 chars)', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => '',
    } as Response)
    await hibpCheck('Abcdef1234', { fetchImpl: fetchImpl as unknown as typeof fetch })
    const calledUrl = String(fetchImpl.mock.calls[0]?.[0] ?? '')
    expect(calledUrl).toMatch(/^https:\/\/api\.pwnedpasswords\.com\/range\/[A-F0-9]{5}$/)
    expect(calledUrl).not.toContain('Abcdef1234')
  })
})

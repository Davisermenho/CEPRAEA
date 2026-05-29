import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const URL_KEY = 'VITE_SUPABASE_URL'
const PUB_KEY = 'VITE_SUPABASE_PUBLISHABLE_KEY'

describe('src/lib/supabase — fail-fast [CEPR-AUTH-02:E001]', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('lança [CEPR-AUTH-02:E001] ao acessar supabase quando VITE_SUPABASE_URL está ausente', async () => {
    vi.stubEnv(URL_KEY, '')
    vi.stubEnv(PUB_KEY, 'fake-key')

    const mod = await import('../supabase')
    expect(mod.isSupabaseConfigured()).toBe(false)
    expect(() => mod.supabase.auth).toThrowError(/\[CEPR-AUTH-02:E001\]/)
  })

  it('lança [CEPR-AUTH-02:E001] ao acessar supabase quando VITE_SUPABASE_PUBLISHABLE_KEY está ausente', async () => {
    vi.stubEnv(URL_KEY, 'https://example.supabase.co')
    vi.stubEnv(PUB_KEY, '')

    const mod = await import('../supabase')
    expect(mod.isSupabaseConfigured()).toBe(false)
    expect(() => mod.supabase.auth).toThrowError(/\[CEPR-AUTH-02:E001\]/)
  })

  it('a mensagem de erro orienta o operador a configurar .env.local / Vercel / CI', async () => {
    vi.stubEnv(URL_KEY, '')
    vi.stubEnv(PUB_KEY, '')

    const mod = await import('../supabase')
    try {
      // força avaliação do Proxy
      void mod.supabase.auth
      throw new Error('expected throw')
    } catch (err) {
      const msg = (err as Error).message
      expect(msg).toContain(mod.SUPABASE_FAIL_FAST_CODE)
      expect(msg).toMatch(/VITE_SUPABASE_URL/)
      expect(msg).toMatch(/VITE_SUPABASE_PUBLISHABLE_KEY/)
      expect(msg).toMatch(/\.env\.local|Vercel|CI/)
    }
  })

  it('inicializa o client com sucesso quando ambas as envs estão presentes', async () => {
    vi.stubEnv(URL_KEY, 'https://example.supabase.co')
    vi.stubEnv(PUB_KEY, 'eyJhbGciOi.fake.key')

    const mod = await import('../supabase')
    expect(mod.isSupabaseConfigured()).toBe(true)
    expect(() => mod.supabase.auth).not.toThrow()
    expect(mod.supabase.auth).toBeDefined()
  })

  it('expõe constante SUPABASE_FAIL_FAST_CODE no formato [CEPR-AUTH-02:E001]', async () => {
    vi.stubEnv(URL_KEY, 'https://example.supabase.co')
    vi.stubEnv(PUB_KEY, 'eyJhbGciOi.fake.key')

    const mod = await import('../supabase')
    expect(mod.SUPABASE_FAIL_FAST_CODE).toBe('[CEPR-AUTH-02:E001]')
  })
})

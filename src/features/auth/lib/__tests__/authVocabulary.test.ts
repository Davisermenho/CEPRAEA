import { describe, it, expect } from 'vitest'
import { interpretSupabaseAuthError, AUTH_MESSAGES } from '../authVocabulary'

describe('interpretSupabaseAuthError', () => {
  it('mapeia status 429 para LOGIN-003', () => {
    const r = interpretSupabaseAuthError('whatever', 429)
    expect(r.code).toBe('LOGIN-003')
    expect(r.message).toBe(AUTH_MESSAGES['AUTH-LOGIN-003'])
  })

  it('mapeia "rate limit exceeded" para LOGIN-003', () => {
    const r = interpretSupabaseAuthError('Email rate limit exceeded')
    expect(r.code).toBe('LOGIN-003')
  })

  it('mapeia "weak password" para WEAK-PASSWORD', () => {
    const r = interpretSupabaseAuthError('weak_password: too common')
    expect(r.code).toBe('WEAK-PASSWORD')
    expect(r.message).toBe(AUTH_MESSAGES['AUTH-RESET-002'])
  })

  it('mapeia "email not confirmed" para LOGIN-002', () => {
    const r = interpretSupabaseAuthError('Email not confirmed')
    expect(r.code).toBe('LOGIN-002')
  })

  it('default para LOGIN-001 (anti-enumeração)', () => {
    expect(interpretSupabaseAuthError('Invalid login credentials').code).toBe('LOGIN-001')
    expect(interpretSupabaseAuthError(undefined).code).toBe('LOGIN-001')
  })
})

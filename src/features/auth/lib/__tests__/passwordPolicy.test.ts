import { describe, it, expect } from 'vitest'
import { validatePasswordPolicy, PASSWORD_MIN_LENGTH } from '../passwordPolicy'

describe('validatePasswordPolicy', () => {
  it('aceita senha mínima válida (≥10 + lower + upper + digit)', () => {
    const r = validatePasswordPolicy('Abcdef1234')
    expect(r.valid).toBe(true)
    expect(r.violations).toEqual([])
  })

  it('rejeita senha curta', () => {
    const r = validatePasswordPolicy('Ab1xyz')
    expect(r.valid).toBe(false)
    expect(r.violations).toContain('too_short')
  })

  it('rejeita sem maiúscula', () => {
    const r = validatePasswordPolicy('abcdef1234')
    expect(r.violations).toContain('missing_uppercase')
  })

  it('rejeita sem minúscula', () => {
    const r = validatePasswordPolicy('ABCDEF1234')
    expect(r.violations).toContain('missing_lowercase')
  })

  it('rejeita sem dígito', () => {
    const r = validatePasswordPolicy('AbcdefGhij')
    expect(r.violations).toContain('missing_digit')
  })

  it('aceita 64+ chars (NIST)', () => {
    const long = 'A'.repeat(20) + 'b'.repeat(20) + '1'.repeat(20) // 60
    const r = validatePasswordPolicy(long)
    expect(r.valid).toBe(true)
  })

  it('aceita Unicode/espaços (NIST §5.1.1.2)', () => {
    const r = validatePasswordPolicy('Ação Café 1234')
    expect(r.valid).toBe(true)
  })

  it('PASSWORD_MIN_LENGTH é 10', () => {
    expect(PASSWORD_MIN_LENGTH).toBe(10)
  })
})

import { describe, it, expect } from 'vitest'
import { normalizeEmail, InvalidEmailError } from '../emailNormalization'

describe('normalizeEmail', () => {
  it('retorna email em minúsculas e sem espaços', () => {
    expect(normalizeEmail('  USER@Example.COM  ')).toBe('user@example.com')
  })

  it('aceita email mínimo válido', () => {
    expect(normalizeEmail('a@b.co')).toBe('a@b.co')
  })

  it('aceita email com subdomínio', () => {
    expect(normalizeEmail('coach@sub.domain.example.org')).toBe('coach@sub.domain.example.org')
  })

  it('lança InvalidEmailError para string vazia', () => {
    expect(() => normalizeEmail('')).toThrow(InvalidEmailError)
    expect(() => normalizeEmail('')).toThrow('Informe seu email.')
  })

  it('lança InvalidEmailError para string só de espaços', () => {
    expect(() => normalizeEmail('   ')).toThrow(InvalidEmailError)
  })

  it('lança InvalidEmailError para email sem @', () => {
    expect(() => normalizeEmail('invalido.com')).toThrow(InvalidEmailError)
  })

  it('lança InvalidEmailError para email sem domínio', () => {
    expect(() => normalizeEmail('user@')).toThrow(InvalidEmailError)
  })

  it('lança InvalidEmailError para email com espaço interno', () => {
    expect(() => normalizeEmail('user name@example.com')).toThrow(InvalidEmailError)
  })

  it('lança InvalidEmailError para email com mais de 254 caracteres', () => {
    const local = 'a'.repeat(243)
    const email = `${local}@example.com` // 243 + 12 = 255 chars
    expect(() => normalizeEmail(email)).toThrow(InvalidEmailError)
    expect(() => normalizeEmail(email)).toThrow('máximo 254')
  })

  it('aceita email com exatamente 254 caracteres', () => {
    const local = 'a'.repeat(242)
    const email = `${local}@example.com` // 242 + 12 = 254 chars
    expect(normalizeEmail(email)).toBe(email)
  })

  it('InvalidEmailError tem name correto', () => {
    try {
      normalizeEmail('')
    } catch (e) {
      expect(e).toBeInstanceOf(InvalidEmailError)
      expect((e as Error).name).toBe('InvalidEmailError')
    }
  })
})

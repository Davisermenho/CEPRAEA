import { describe, it, expect } from 'vitest'
import { redirectGuard } from '../redirectGuard'

const ORIGIN = 'http://localhost:5173'

describe('redirectGuard', () => {
  it('retorna / para url nula', () => {
    expect(redirectGuard(null, ORIGIN)).toBe('/')
  })

  it('retorna / para url undefined', () => {
    expect(redirectGuard(undefined, ORIGIN)).toBe('/')
  })

  it('retorna / para string vazia', () => {
    expect(redirectGuard('', ORIGIN)).toBe('/')
  })

  it('retorna / para URL de origem diferente (open redirect)', () => {
    expect(redirectGuard('https://evil.com', ORIGIN)).toBe('/')
  })

  it('retorna / para URL com subdomínio diferente', () => {
    expect(redirectGuard('https://evil.localhost:5173', ORIGIN)).toBe('/')
  })

  it('retorna / para protocolo javascript:', () => {
    expect(redirectGuard('javascript:alert(1)', ORIGIN)).toBe('/')
  })

  it('retorna / para protocolo data:', () => {
    expect(redirectGuard('data:text/html,<script>alert(1)</script>', ORIGIN)).toBe('/')
  })

  it('retorna / para returnUrl=/login (evitar loop)', () => {
    expect(redirectGuard('/login', ORIGIN)).toBe('/')
  })

  it('retorna / para returnUrl=/login?next=/ (evitar loop)', () => {
    expect(redirectGuard('/login?next=/', ORIGIN)).toBe('/')
  })

  it('retorna / para returnUrl=/atleta/login (evitar loop)', () => {
    expect(redirectGuard('/atleta/login', ORIGIN)).toBe('/')
  })

  it('retorna / para returnUrl=/aceitar-convite/xxx', () => {
    expect(redirectGuard('/aceitar-convite/abc123', ORIGIN)).toBe('/')
  })

  it('retorna / para returnUrl=/atleta/nova-senha', () => {
    expect(redirectGuard('/atleta/nova-senha', ORIGIN)).toBe('/')
  })

  it('retorna /://invalid como path relativo (comportamento URL parser)', () => {
    // '://invalid' é resolvido como path relativo '/://invalid' pelo URL parser
    expect(redirectGuard('://invalid', ORIGIN)).toBe('/://invalid')
  })

  it('retorna / para protocol-relative URL de origem diferente (//evil.com)', () => {
    expect(redirectGuard('//evil.com/path', ORIGIN)).toBe('/')
  })

  it('retorna /atletas para returnUrl válida de mesma origem', () => {
    expect(redirectGuard('/atletas', ORIGIN)).toBe('/atletas')
  })

  it('retorna /configuracoes para returnUrl válida', () => {
    expect(redirectGuard('/configuracoes', ORIGIN)).toBe('/configuracoes')
  })

  it('retorna / para returnUrl=/', () => {
    expect(redirectGuard('/', ORIGIN)).toBe('/')
  })

  it('retorna URL absoluta de mesma origem como pathname', () => {
    expect(redirectGuard(`${ORIGIN}/atletas`, ORIGIN)).toBe('/atletas')
  })

  it('retorna path com query string', () => {
    expect(redirectGuard('/treinos?filter=hoje', ORIGIN)).toBe('/treinos?filter=hoje')
  })
})

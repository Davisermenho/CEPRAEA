/**
 * guards.spec.ts — Verifica que rotas protegidas redirecionam usuários não autenticados.
 *
 * SABOTAGEM: comentar AuthGuard ou AtletaGuard → navegação direta funcionaria → DETECTADO.
 */
import { test, expect } from '@playwright/test'

// Rotas reais da aplicação (em português, conforme App.tsx)
const PROTECTED_COACH_ROUTES = [
  '/',
  '/atletas',
  '/treinos',
  '/configuracoes',
  '/exportar',
  '/relatorios',
]

const PROTECTED_ATLETA_ROUTES = [
  '/atleta/perfil',
  '/atleta/treinos',
]

test.describe('AuthGuard — rotas do treinador', () => {
  for (const route of PROTECTED_COACH_ROUTES) {
    test(`${route} redireciona para /welcome quando não autenticado`, async ({ page }) => {
      await page.goto(route)
      // AuthGuard redireciona para /welcome quando não há sessão de treinador
      await page.waitForURL(/\/welcome/, { timeout: 5000 })
      expect(page.url()).toContain('/welcome')
    })
  }
})

test.describe('AtletaGuard — rotas da atleta', () => {
  for (const route of PROTECTED_ATLETA_ROUTES) {
    test(`${route} redireciona quando não autenticado`, async ({ page }) => {
      await page.goto(route)
      await page.waitForURL(/\/atleta\/login|\/welcome/, { timeout: 5000 })
      const url = new URL(page.url())
      expect(url.pathname).not.toBe(route)
    })
  }
})

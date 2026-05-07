import { test, expect } from '@playwright/test'

const protectedCoachRoutes = [
  '/',
  '/atletas',
  '/treinos',
  '/configuracoes',
  '/relatorios',
]

const protectedAthleteRoutes = [
  '/atleta/perfil',
  '/atleta/treinos',
]

test.describe('AuthGuard — rotas do treinador', () => {
  for (const route of protectedCoachRoutes) {
    test(`${route} redireciona para /login quando não autenticado`, async ({ page }) => {
      await page.goto(route)
      await page.waitForURL(/\/login$/, { timeout: 10_000 })
      await expect(page).toHaveURL(/\/login$/)
      await expect(page.getByText(/acesso do treinador/i)).toBeVisible()
    })
  }
})

test.describe('AtletaGuard — rotas da atleta', () => {
  for (const route of protectedAthleteRoutes) {
    test(`${route} redireciona para /atleta/login quando não autenticado`, async ({ page }) => {
      await page.goto(route)
      await page.waitForURL(/\/atleta\/login$/, { timeout: 10_000 })
      await expect(page).toHaveURL(/\/atleta\/login$/)
      await expect(page.getByText(/acesso da atleta/i)).toBeVisible()
    })
  }
})

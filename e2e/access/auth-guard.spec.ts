// CEPR-AUTH-01: E2E tests for AppAccessGuard role enforcement.
// Tests that an athlete user (no team_members row) cannot access coach routes.

import { test, expect } from '@playwright/test'

const coachRoutes = ['/', '/atletas', '/treinos', '/configuracoes', '/relatorios']

test.describe('AppAccessGuard — coach routes', () => {
  for (const route of coachRoutes) {
    test(`${route} redireciona para /login quando não autenticado`, async ({ page }) => {
      await page.goto(route)
      await page.waitForURL(/\/login$/, { timeout: 10_000 })
      await expect(page).toHaveURL(/\/login$/)
      await expect(page.getByText(/acesso do treinador/i)).toBeVisible()
    })
  }
})

test.describe('AppAccessGuard — athlete cannot access coach area', () => {
  test.skip(
    !process.env.ATHLETE_EMAIL,
    'ATHLETE_EMAIL not set — skip athlete-as-coach test'
  )

  test('atleta autenticada não acessa o painel do treinador', async ({ page }) => {
    // Log in as athlete.
    await page.goto('/atleta/login')
    await page.fill('#atleta-email', process.env.ATHLETE_EMAIL!)
    await page.fill('#atleta-password', process.env.ATHLETE_PASSWORD!)
    await page.getByRole('button', { name: /entrar/i }).click()
    await page.waitForURL(/\/atleta\/treinos/, { timeout: 10_000 })

    // Try to navigate to coach area directly.
    await page.goto('/')
    // Should see "Sem acesso" page, NOT dashboard.
    await expect(page.getByText(/área restrita/i)).toBeVisible({ timeout: 10_000 })
    await expect(page).not.toHaveURL(/\/login$/)
  })
})

import { test, expect } from '@playwright/test'
import { loginAsCoach } from './helpers/auth'

test.describe('SettingsPage', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsCoach(page)
    await page.goto('/configuracoes')
  })

  test('salva o nome da equipe e mantém o valor após recarregar', async ({ page }) => {
    const teamName = page.locator('input').first()
    await teamName.fill('CEPRAEA E2E')
    await page.getByRole('button', { name: /salvar configurações/i }).click()
    await expect(page.getByRole('button', { name: /salvo!/i })).toBeVisible()

    await page.reload()
    await expect(page.locator('input').first()).toHaveValue('CEPRAEA E2E')
  })

  test('logout volta para /login', async ({ page }) => {
    await page.getByRole('button', { name: /sair/i }).click()
    await page.waitForURL(/\/login$/, { timeout: 10_000 })
    await expect(page).toHaveURL(/\/login$/)
    await expect(page.getByText(/acesso do treinador/i)).toBeVisible()
  })
})

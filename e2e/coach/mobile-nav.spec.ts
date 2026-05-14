import { test, expect, type Page } from '@playwright/test'
import { loginAsCoach } from '../helpers/auth'

// Estes testes só fazem sentido no viewport mobile (< lg = 1024 px).
// O projeto "mobile-coach" no playwright.config.ts garante que rodam no Pixel 5.

function nav(page: Page) {
  // O AppLayout tem dois <nav>: sidebar (dentro de <aside>, oculta no mobile)
  // e bottom nav (fixed bottom-0, visível apenas no mobile). O último é o bottom nav.
  return page.locator('nav').last()
}

test.describe('Coach — layout mobile', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsCoach(page)
  })

  test('sidebar está oculta no viewport mobile', async ({ page }) => {
    await expect(page.locator('aside')).not.toBeVisible()
  })

  test('bottom nav exibe os 5 itens de navegação', async ({ page }) => {
    await expect(nav(page).getByRole('link', { name: 'Início' })).toBeVisible()
    await expect(nav(page).getByRole('link', { name: 'Atletas' })).toBeVisible()
    await expect(nav(page).getByRole('link', { name: 'Treinos' })).toBeVisible()
    await expect(nav(page).getByRole('link', { name: 'Relatórios' })).toBeVisible()
    await expect(nav(page).getByRole('link', { name: 'Config' })).toBeVisible()
  })

  test('bottom nav navega corretamente entre as seções', async ({ page }) => {
    await nav(page).getByRole('link', { name: 'Atletas' }).click()
    await expect(page).toHaveURL(/\/atletas$/, { timeout: 10_000 })

    await nav(page).getByRole('link', { name: 'Treinos' }).click()
    await expect(page).toHaveURL(/\/treinos$/, { timeout: 10_000 })

    await nav(page).getByRole('link', { name: 'Relatórios' }).click()
    await expect(page).toHaveURL(/\/relatorios$/, { timeout: 10_000 })

    await nav(page).getByRole('link', { name: 'Config' }).click()
    await expect(page).toHaveURL(/\/configuracoes$/, { timeout: 10_000 })

    await nav(page).getByRole('link', { name: 'Início' }).click()
    await expect(page).toHaveURL(/\/$/, { timeout: 10_000 })
  })

  test('item ativo no bottom nav recebe destaque lime', async ({ page }) => {
    // Início ativo ao carregar o dashboard
    await expect(nav(page).getByRole('link', { name: 'Início' })).toHaveClass(/text-cep-lime-400/, { timeout: 5_000 })

    await nav(page).getByRole('link', { name: 'Atletas' }).click()
    await expect(page).toHaveURL(/\/atletas$/, { timeout: 10_000 })
    await expect(nav(page).getByRole('link', { name: 'Atletas' })).toHaveClass(/text-cep-lime-400/, { timeout: 5_000 })
    await expect(nav(page).getByRole('link', { name: 'Início' })).not.toHaveClass(/text-cep-lime-400/)

    await nav(page).getByRole('link', { name: 'Treinos' }).click()
    await expect(page).toHaveURL(/\/treinos$/, { timeout: 10_000 })
    await expect(nav(page).getByRole('link', { name: 'Treinos' })).toHaveClass(/text-cep-lime-400/, { timeout: 5_000 })
  })

  test('dashboard carrega o heading principal no mobile', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /central de comando/i })).toBeVisible({ timeout: 10_000 })
    await expect(page.locator('main')).toBeVisible()
  })
})

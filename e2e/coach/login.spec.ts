import { test, expect } from '@playwright/test'

const coachEmail = process.env.E2E_COACH_EMAIL ?? 'coach@cepraea.test'

test.describe('WelcomePage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/welcome')
  })

  test('exibe a apresentação da landing', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /bem-vindo ao cepraea/i })).toBeVisible()
    await expect(page.getByText(/gestão e acompanhamento de treinos/i)).toBeVisible()
    await expect(page.getByText(/cepraea • rio de janeiro/i)).toBeVisible()
  })

  test('mostra as opções de treinador e atleta', async ({ page }) => {
    await expect(page.getByRole('link', { name: /sou atleta/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /sou treinador/i })).toBeVisible()
  })

  test('clicar em treinador navega para /login', async ({ page }) => {
    await page.getByRole('link', { name: /sou treinador/i }).click()
    await page.waitForURL('**/login')
    await expect(page).toHaveURL(/\/login$/)
  })

  test('clicar em atleta navega para /atleta/login', async ({ page }) => {
    await page.getByRole('link', { name: /sou atleta/i }).click()
    await page.waitForURL('**/atleta/login')
    await expect(page).toHaveURL(/\/atleta\/login$/)
  })
})

test.describe('LoginPage (treinador)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('exibe campos de email e senha', async ({ page }) => {
    await expect(page.locator('#coach-email')).toBeVisible()
    await expect(page.locator('#coach-password')).toBeVisible()
    await expect(page.getByRole('button', { name: /entrar/i })).toBeVisible()
  })

  test('credenciais inválidas exibem erro', async ({ page }) => {
    await page.locator('#coach-email').fill(coachEmail)
    await page.locator('#coach-password').fill('senha-errada')
    await page.getByRole('button', { name: /entrar/i }).click()
    await expect(page.getByText(/não foi possível entrar/i)).toBeVisible()
  })
})

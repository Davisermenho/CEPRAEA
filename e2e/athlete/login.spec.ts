import { test, expect } from '@playwright/test'

test.describe('AtletaLoginPage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/atleta/login')
  })

  test('exibe campos de email e senha no modo login', async ({ page }) => {
    await expect(page.locator('#atleta-email')).toBeVisible()
    await expect(page.locator('#atleta-password')).toBeVisible()
    await expect(page.getByRole('button', { name: /^entrar\s*→?$/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /criar conta/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /esqueci minha senha/i })).toBeVisible()
  })

  test('modo primeiro acesso troca o CTA para criar conta', async ({ page }) => {
    await page.getByRole('button', { name: /criar conta/i }).click()
    await expect(page.getByText(/primeiro acesso/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /^criar conta$/i })).toBeVisible()
    await expect(page.getByText(/mínimo 6 caracteres/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /já tenho conta/i })).toBeVisible()
  })

  test('modo redefinir senha valida email inválido', async ({ page }) => {
    await page.getByRole('button', { name: /esqueci minha senha/i }).click()
    await expect(page.getByText(/redefinir senha/i)).toBeVisible()
    await page.locator('#atleta-email').fill('')
    await page.getByRole('button', { name: /enviar email de redefinição/i }).click()
    await expect(page.getByText(/informe um email válido/i)).toBeVisible()
  })
})

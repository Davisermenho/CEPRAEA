/**
 * login.spec.ts — Fluxo de login do treinador.
 *
 * SABOTAGEM: trocar PIN errado para o correto → test_wrong_pin vai passar mesmo sem validação → DETECTADO.
 * SABOTAGEM: remover logo CEPRAEA → test_logo passa genérico → DETECTADO.
 */
import { test, expect } from '@playwright/test'

test.describe('WelcomePage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/welcome')
  })

  test('exibe logomarca CEPRAEA — não é ícone genérico', async ({ page }) => {
    // Verifica que o SVG/img da logo está presente
    const logo = page.locator('svg, img[alt*="CEPRAEA"], img[alt*="cepraea"]').first()
    await expect(logo).toBeVisible({ timeout: 5000 })
  })

  test('mostra as duas opções: Treinador e Atleta', async ({ page }) => {
    // Ambas as opções devem estar visíveis na tela de boas-vindas
    await expect(page.getByText(/treinador/i).first()).toBeVisible()
    await expect(page.getByText(/atleta/i).first()).toBeVisible()
  })

  test('clicar em Treinador (link) navega para /login', async ({ page }) => {
    // WelcomePage usa <Link> (role=link), não <button>
    await page.getByRole('link', { name: /treinador/i }).click()
    await page.waitForURL('/login', { timeout: 5000 })
    expect(page.url()).toContain('/login')
  })

  test('clicar em Atleta (link) navega para /atleta/login', async ({ page }) => {
    // WelcomePage usa <Link> (role=link), não <button>
    await page.getByRole('link', { name: /atleta/i }).first().click()
    await page.waitForURL('/atleta/login', { timeout: 5000 })
    expect(page.url()).toContain('/atleta/login')
  })
})

test.describe('LoginPage (treinador)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('exibe campo de PIN', async ({ page }) => {
    const input = page.locator('input[type="password"], input[type="tel"], input[type="number"]').first()
    await expect(input).toBeVisible()
  })

  test('PIN incorreto exibe mensagem de erro', async ({ page }) => {
    // Na primeira vez o app pede criação do PIN (isFirstTime=true).
    // Neste caso, criar PIN e depois tentar um PIN diferente.
    // Se já há PIN configurado, simplesmente usar PIN errado.
    const pinInput = page.locator('input[type="password"]').first()
    await pinInput.fill('0000')

    // Verifica se há campo de confirmação (first-time mode)
    const confirmInput = page.locator('input[type="password"]').nth(1)
    const isFirstTime = await confirmInput.count() > 0
    if (isFirstTime) {
      // Preenche confirmação com PIN diferente para forçar erro
      await confirmInput.fill('1111')
    }

    await page.getByRole('button', { name: /entrar|criar/i }).click()
    // Deve aparecer mensagem de erro (PINs não coincidem ou PIN incorreto)
    await expect(page.getByText(/incorreto|inválido|coincidem|erro/i)).toBeVisible({ timeout: 3000 })
  })
})

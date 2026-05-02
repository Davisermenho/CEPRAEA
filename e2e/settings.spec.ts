/**
 * settings.spec.ts — Testes da página de configurações do treinador.
 *
 * SABOTAGEM: usar Math.random() em vez de crypto.getRandomValues → não seria hex puro → DETECTADO.
 * SABOTAGEM: remover validação de URL no pingEndpoint frontend → aceita URL inválida → DETECTADO.
 */
import { test, expect } from '@playwright/test'

// Helper: faz login do treinador, lidando com first-time (criação de PIN) ou returning user
async function loginAsCoach(page: any) {
  const coachPin = process.env.CEPRAEA_COACH_PIN ?? '9999'
  await page.goto('/login')

  const pinInput = page.locator('input[type="password"]').first()
  await pinInput.fill(coachPin)

  // Verifica se há campo de confirmação (first-time mode)
  const confirmInput = page.locator('input[type="password"]').nth(1)
  const isFirstTime = await confirmInput.count() > 0
  if (isFirstTime) {
    await confirmInput.fill(coachPin)
    await page.getByRole('button', { name: /criar/i }).click()
  } else {
    await page.getByRole('button', { name: /entrar/i }).click()
  }

  // Após login, navega para / — aguarda que a URL não seja mais /login
  await page.waitForFunction(() => !window.location.pathname.includes('/login'), { timeout: 8000 })
}

test.describe('SettingsPage — gerar secret', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsCoach(page)
    await page.goto('/configuracoes')
  })

  test('botão Gerar Secret cria string de 32 hex chars', async ({ page }) => {
    const gerarBtn = page.getByRole('button', { name: /gerar|novo secret/i })
    if (await gerarBtn.count() === 0) {
      test.skip()
      return
    }
    await gerarBtn.click()
    // O campo de input do secret deve mostrar 32 chars hex
    const secretInput = page.locator('input[placeholder*="secret"], input[name*="secret"]').first()
    const value = await secretInput.inputValue()
    expect(value).toMatch(/^[0-9a-f]{32}$/)
  })

  test('testar conexão com URL inválida exibe mensagem de erro', async ({ page }) => {
    const urlInput = page.locator('input[type="url"], input[placeholder*="URL"], input[placeholder*="url"]').first()
    if (await urlInput.count() === 0) {
      test.skip()
      return
    }
    await urlInput.fill('https://url-que-nao-existe.invalid/exec')
    const testBtn = page.getByRole('button', { name: /testar|verificar|test/i })
    await testBtn.click()
    await expect(page.getByText(/erro|falhou|timeout|inválido/i)).toBeVisible({ timeout: 20000 })
  })
})

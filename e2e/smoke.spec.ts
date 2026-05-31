import { test, expect } from '@playwright/test'

// Erros conhecidos de bot-detection (Turnstile retorna 400 para headless/CI)
// Não são erros fatais da aplicação.
const KNOWN_BOT_DETECTION_ERRORS = [
  /Failed to load resource: the server responded with a status of 400/,
]

function isBotDetectionError(msg: string): boolean {
  return KNOWN_BOT_DETECTION_ERRORS.some((re) => re.test(msg))
}

test.describe('Smoke', () => {
  test('homepage carrega com status 200', async ({ page }) => {
    const resp = await page.goto('/')
    expect(resp?.status()).toBe(200)
  })

  test('título da página contém CEPRAEA', async ({ page }) => {
    await page.goto('/')
    const title = await page.title()
    expect(title).toMatch(/cepraea/i)
  })

  test('app React renderiza conteúdo na raiz', async ({ page }) => {
    await page.goto('/')
    // Usar 'load' em vez de 'networkidle': o Turnstile faz polling contínuo em
    // produção, impedindo que networkidle seja atingido dentro do timeout.
    await page.waitForLoadState('load', { timeout: 15000 })
    const root = page.locator('#root')
    await expect(root).not.toBeEmpty()
  })

  test('homepage inicializa sem erros fatais de frontend', async ({ page }) => {
    const pageErrors: string[] = []
    const consoleErrors: string[] = []

    page.on('pageerror', (error) => {
      pageErrors.push(error.message)
    })
    page.on('console', (message) => {
      if (message.type() === 'error' && !isBotDetectionError(message.text())) {
        consoleErrors.push(message.text())
      }
    })

    await page.goto('/')
    // Usar 'load' em vez de 'networkidle': o Turnstile faz polling contínuo em
    // produção, impedindo que networkidle seja atingido dentro do timeout.
    await page.waitForLoadState('load', { timeout: 15000 })

    expect(pageErrors).toEqual([])
    expect(consoleErrors).toEqual([])
  })
})

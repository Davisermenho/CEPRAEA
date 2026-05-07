import { test, expect } from '@playwright/test'

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
    await page.waitForLoadState('networkidle', { timeout: 15000 })
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
      if (message.type() === 'error') {
        consoleErrors.push(message.text())
      }
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle', { timeout: 15000 })

    expect(pageErrors).toEqual([])
    expect(consoleErrors).toEqual([])
  })
})

// CEPR-AUTH-02C §18.3 — Open redirect guard
// Verifica que returnUrl maliciosos são descartados após login.

import { test, expect } from '@playwright/test'

const coachEmail = process.env.E2E_COACH_EMAIL ?? 'coach@cepraea.test'
const coachPassword = process.env.E2E_COACH_PASSWORD ?? 'Passw0rdXy!'

async function loginWithReturnUrl(page: import('@playwright/test').Page, returnUrl: string) {
  const encoded = encodeURIComponent(returnUrl)
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await page.goto(`/login?returnUrl=${encoded}`)
    await page.locator('#coach-email').fill(coachEmail)
    await page.locator('#coach-password').fill(coachPassword)
    const submit = page.getByRole('button', { name: /entrar →/i })
    await expect(submit).toBeEnabled({ timeout: 20_000 })
    await submit.click()
    try {
      await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 30_000 })
      return
    } catch {
      const retryAccess = page.getByRole('button', { name: /tentar novamente/i })
      if (await retryAccess.isVisible({ timeout: 1_000 }).catch(() => false)) {
        await retryAccess.click()
        await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 30_000 })
        return
      }
      const rateLimited = page.getByText(/muitas tentativas/i)
      if (await rateLimited.isVisible({ timeout: 1_000 }).catch(() => false)) {
        await page.waitForTimeout(31_000)
      }
      if (attempt === 2) throw new Error('Login with returnUrl did not complete after retries.')
    }
  }
}

test.describe('redirectGuard — open redirect', () => {
  test.describe.configure({ timeout: 120_000 })

  test('returnUrl externo (https://evil.com) redireciona para /', async ({ page }) => {
    await loginWithReturnUrl(page, 'https://evil.com')
    expect(new URL(page.url()).pathname).toBe('/')
  })

  test('returnUrl com javascript: redireciona para /', async ({ page }) => {
    await loginWithReturnUrl(page, 'javascript:alert(1)')
    expect(new URL(page.url()).pathname).toBe('/')
  })

  test('returnUrl=/login redireciona para / (evitar loop)', async ({ page }) => {
    await loginWithReturnUrl(page, '/login')
    expect(new URL(page.url()).pathname).toBe('/')
  })

  test('returnUrl=/atletas mantém /atletas (mesma origem válida)', async ({ page }) => {
    await loginWithReturnUrl(page, '/atletas')
    await page.waitForURL(/\/atletas/, { timeout: 15_000 })
    expect(new URL(page.url()).pathname).toBe('/atletas')
  })
})

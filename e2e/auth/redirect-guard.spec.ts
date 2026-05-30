// CEPR-AUTH-02C §18.3 — Open redirect guard
// Verifica que returnUrl maliciosos são descartados após login.

import { test, expect } from '@playwright/test'

const coachEmail = process.env.E2E_COACH_EMAIL ?? 'coach@cepraea.test'
const coachPassword = process.env.E2E_COACH_PASSWORD ?? 'password'

async function loginWithReturnUrl(page: import('@playwright/test').Page, returnUrl: string) {
  const encoded = encodeURIComponent(returnUrl)
  await page.goto(`/login?returnUrl=${encoded}`)
  await page.locator('#coach-email').fill(coachEmail)
  await page.locator('#coach-password').fill(coachPassword)
  await page.getByRole('button', { name: /entrar →/i }).click()
  // Aguardar navegação pós-login
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 30_000 })
}

test.describe('redirectGuard — open redirect', () => {
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

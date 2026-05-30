// CEPR-AUTH-02C §13.3 — Anti-enumeração
// Verifica que login/signup/reset retornam a mensagem canônica do vocabulário,
// independente de o email existir ou não na base.

import { test, expect } from '@playwright/test'

const FAKE_EMAIL = 'nao-existe-mesmo@cepraea-test-never.example.com'

test.describe('Anti-enumeração — vocabulário canônico', () => {
  test('login com email inexistente exibe AUTH-LOGIN-001', async ({ page }) => {
    await page.goto('/atleta/login')
    await page.locator('#atleta-email').fill(FAKE_EMAIL)
    await page.locator('#atleta-password').fill('senhaqualquer')
    await page.getByRole('button', { name: /entrar →/i }).click()
    await expect(page.getByText('Email ou senha incorretos.')).toBeVisible({ timeout: 10_000 })
  })

  test('signup com qualquer email exibe AUTH-SIGNUP-001 (não revela se já existe)', async ({ page }) => {
    await page.goto('/atleta/login')
    await page.getByRole('button', { name: /criar conta/i }).click()
    await page.locator('#atleta-email').fill(FAKE_EMAIL)
    await page.locator('#atleta-password').fill('senhaqualquer')
    await page.getByRole('button', { name: /criar conta/i }).click()
    await expect(page.getByText('Verifique seu email para confirmar a conta.')).toBeVisible({ timeout: 10_000 })
  })

  test('reset com qualquer email exibe AUTH-RESET-001 (não revela se existe)', async ({ page }) => {
    await page.goto('/atleta/login')
    await page.getByRole('button', { name: /esqueci minha senha/i }).click()
    await page.locator('#atleta-email').fill(FAKE_EMAIL)
    await page.getByRole('button', { name: /enviar email de redefinição/i }).click()
    await expect(page.getByText('Se o email existir em nossa base, enviaremos o link.')).toBeVisible({ timeout: 10_000 })
  })

  test('coach login com email inexistente exibe AUTH-LOGIN-001', async ({ page }) => {
    await page.goto('/login')
    await page.locator('#coach-email').fill(FAKE_EMAIL)
    await page.locator('#coach-password').fill('senhaqualquer')
    await page.getByRole('button', { name: /entrar →/i }).click()
    await expect(page.getByText('Email ou senha incorretos.')).toBeVisible({ timeout: 10_000 })
  })

  test('paridade de timing: login inexistente vs senha errada ≤ 3 s diferença', async ({ page }) => {
    // Mede tempo para login com email inexistente
    await page.goto('/atleta/login')
    await page.locator('#atleta-email').fill(FAKE_EMAIL)
    await page.locator('#atleta-password').fill('senhaerrada1')
    const t1 = Date.now()
    await page.getByRole('button', { name: /entrar →/i }).click()
    await expect(page.getByText('Email ou senha incorretos.')).toBeVisible({ timeout: 15_000 })
    const elapsed1 = Date.now() - t1

    // Mede tempo para login com email existente mas senha errada (usa o email de test do env)
    const knownEmail = process.env.E2E_COACH_EMAIL ?? 'coach@cepraea.test'
    await page.goto('/login')
    await page.locator('#coach-email').fill(knownEmail)
    await page.locator('#coach-password').fill('senha-deliberadamente-errada-123!')
    const t2 = Date.now()
    await page.getByRole('button', { name: /entrar →/i }).click()
    await expect(page.getByText('Email ou senha incorretos.')).toBeVisible({ timeout: 15_000 })
    const elapsed2 = Date.now() - t2

    // SHOULD (soft): diferença menor que 3 s (timing server-side, pode variar)
    const diff = Math.abs(elapsed1 - elapsed2)
    console.log(`Timing diff: ${diff}ms (t1=${elapsed1}ms, t2=${elapsed2}ms)`)
    expect(diff).toBeLessThan(3000)
  })
})

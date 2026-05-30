// CEPR-AUTH-02E — E2E para password policy, HIBP gate e CAPTCHA bypass.
// Pré-requisito: VITE_TURNSTILE_TEST_TOKEN em .env.test (bypass injeta token sintético).
import { test, expect } from '@playwright/test'

test.describe('AtletaLoginPage — auth hardening (CEPR-AUTH-02E)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/atleta/login')
  })

  test('hint da política de senha indica ≥ 10 chars com letra/número/maiúscula', async ({ page }) => {
    await page.getByRole('button', { name: /criar conta/i }).first().click()
    await expect(page.getByText(/mínimo 10 caracteres/i)).toBeVisible()
    await expect(page.getByText(/letra minúscula, maiúscula e número/i)).toBeVisible()
  })

  test('signup com senha curta exibe AUTH-RESET-002 e não chama Supabase', async ({ page }) => {
    let signUpCalled = false
    await page.route('**/auth/v1/signup**', (route) => {
      signUpCalled = true
      void route.fulfill({ status: 200, body: '{}' })
    })

    await page.getByRole('button', { name: /criar conta/i }).first().click()
    await page.locator('#atleta-email').fill('atleta+e2e@example.com')
    await page.locator('#atleta-password').fill('Curta1A')
    await page.getByRole('button', { name: /^criar conta$/i }).click()

    await expect(
      page.getByText(/senha não atende à política mínima/i),
    ).toBeVisible()
    expect(signUpCalled).toBe(false)
  })

  test('signup com senha vazada (HIBP mockado) exibe AUTH-RESET-003 e não chama Supabase', async ({ page }) => {
    let signUpCalled = false
    await page.route('**/auth/v1/signup**', (route) => {
      signUpCalled = true
      void route.fulfill({ status: 200, body: '{}' })
    })

    // Intercepta a chamada do HIBP e responde com o sufixo exato extraído da URL.
    // O cliente envia GET /range/{prefix-de-5-chars}. Para forçar pwned, retornamos
    // uma linha cujo sufixo bate com o sufixo do SHA1 que o cliente computou.
    // Estratégia: lê o User-Agent? Impossível. Usamos: o cliente compara case-insensitive
    // contra todas as linhas. Mockamos com sufixo ALL-WILDCARD inválido + uma linha que
    // declara qualquer sufixo de 35 chars hex que matche por força bruta. Como cada senha
    // gera 1 sufixo único, vamos usar a senha "Password1!" e seu SHA1 conhecido.
    // SHA1("Password1!") em UPPER:
    const sha1 = '32CA9FC1A0F5B6330E3F4C8C1BBECDE9BEDB9573'
    const prefix = sha1.slice(0, 5)
    const suffix = sha1.slice(5)
    await page.route(`**/api.pwnedpasswords.com/range/${prefix}**`, (route) => {
      void route.fulfill({ status: 200, body: `${suffix}:99999\n`, headers: { 'content-type': 'text/plain' } })
    })

    await page.getByRole('button', { name: /criar conta/i }).first().click()
    await page.locator('#atleta-email').fill('atleta+e2e@example.com')
    await page.locator('#atleta-password').fill('Password1!')
    await page.getByRole('button', { name: /^criar conta$/i }).click()

    await expect(
      page.getByText(/apareceu em vazamentos públicos/i),
    ).toBeVisible({ timeout: 10_000 })
    expect(signUpCalled).toBe(false)
  })

  test('CAPTCHA bypass: nenhum iframe da Cloudflare carregado em ambiente de teste', async ({ page }) => {
    const cfFrames = page.locator('iframe[src*="challenges.cloudflare.com"]')
    await expect(cfFrames).toHaveCount(0)
  })
})

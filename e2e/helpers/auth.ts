import { expect, type Page } from '@playwright/test'

const coachEmail = process.env.E2E_COACH_EMAIL ?? 'coach@cepraea.test'
const coachPassword = process.env.E2E_COACH_PASSWORD ?? 'Passw0rdXy!'

export async function loginAsCoach(page: Page) {
  const homeLink = page.getByRole('link', { name: 'Início', exact: true })
  for (let attempt = 0; attempt < 4; attempt += 1) {
    await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 30_000 })
    await page.locator('#coach-email').fill(coachEmail)
    await page.locator('#coach-password').fill(coachPassword)
    const submit = page.getByRole('button', { name: /entrar/i })
    await expect(submit).toBeEnabled({ timeout: 15_000 })
    await submit.click()

    try {
      await page.waitForURL((url) => !url.pathname.endsWith('/login'), { timeout: 20_000 })
      if (await homeLink.isVisible({ timeout: 5_000 }).catch(() => false)) {
        return
      }
      if (!/\/login$/.test(new URL(page.url()).pathname)) {
        return
      }
      await expect(homeLink).toBeVisible({ timeout: 15_000 })
      return
    } catch {
      const retryAccess = page.getByRole('button', { name: /tentar novamente/i })
      if (await retryAccess.isVisible({ timeout: 1_000 }).catch(() => false)) {
        await retryAccess.click()
        if (await homeLink.isVisible({ timeout: 10_000 }).catch(() => false)) return
      }
      if (attempt === 3) throw new Error('Coach login completed but app access did not stabilize.')
      await page.waitForTimeout(1_000)
    }
  }
}

export async function loginAsAthlete(page: Page, email: string, password: string) {
  await page.goto('/atleta/login')
  await page.locator('#atleta-email').fill(email)
  await page.locator('#atleta-password').fill(password)
  const submit = page.getByRole('button', { name: /entrar/i })
  await expect(submit).toBeEnabled({ timeout: 15_000 })
  await submit.click()
  await page.waitForURL((url) => url.pathname.startsWith('/atleta/treinos'), { timeout: 10_000 })
}

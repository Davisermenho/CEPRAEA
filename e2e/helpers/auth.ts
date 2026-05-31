import { expect, type Page } from '@playwright/test'

const coachEmail = process.env.E2E_COACH_EMAIL ?? 'coach@cepraea.test'
const coachPassword = process.env.E2E_COACH_PASSWORD ?? 'Passw0rdXy!'

export async function loginAsCoach(page: Page) {
  await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 30_000 })
  await page.locator('#coach-email').fill(coachEmail)
  await page.locator('#coach-password').fill(coachPassword)
  const submit = page.getByRole('button', { name: /entrar/i })
  await expect(submit).toBeEnabled({ timeout: 15_000 })
  await submit.click()
  const homeLink = page.getByRole('link', { name: 'Início', exact: true })
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await expect(homeLink).toBeVisible({ timeout: 20_000 })
      await expect(page).not.toHaveURL(/\/login/)
      return
    } catch {
      const retryAccess = page.getByRole('button', { name: /tentar novamente/i })
      if (await retryAccess.isVisible({ timeout: 1_000 }).catch(() => false)) {
        await retryAccess.click()
        continue
      }
      if (attempt === 2) throw new Error('Coach login completed but app access did not stabilize.')
      await page.reload({ waitUntil: 'domcontentloaded' })
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

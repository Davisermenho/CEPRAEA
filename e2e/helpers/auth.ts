import { expect, type Page } from '@playwright/test'

const coachEmail = process.env.E2E_COACH_EMAIL ?? 'coach@cepraea.test'
const coachPassword = process.env.E2E_COACH_PASSWORD ?? 'Passw0rdXy!'

export async function loginAsCoach(page: Page) {
  await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 30_000 })
  await page.locator('#coach-email').fill(coachEmail)
  await page.locator('#coach-password').fill(coachPassword)
  await page.getByRole('button', { name: /entrar/i }).click()
  await expect(page.getByRole('link', { name: 'Início', exact: true })).toBeVisible({
    timeout: 45_000,
  })
  await expect(page).not.toHaveURL(/\/login/)
}

export async function loginAsAthlete(page: Page, email: string, password: string) {
  await page.goto('/atleta/login')
  await page.locator('#atleta-email').fill(email)
  await page.locator('#atleta-password').fill(password)
  await page.getByRole('button', { name: /entrar/i }).click()
  await page.waitForURL((url) => url.pathname.startsWith('/atleta/treinos'), { timeout: 10_000 })
}

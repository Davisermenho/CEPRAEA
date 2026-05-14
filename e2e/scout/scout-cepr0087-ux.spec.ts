/**
 * Smoke UX CEPR-0087: Atletas e Equipes com design CEPRAEA dark
 * Verifica que /scout/athletes e /scout/teams têm visual dark (não páginas brancas),
 * que o CRUD mínimo funciona, e que atleta ativa aparece no elenco da sessão.
 */
import { test, expect } from '@playwright/test'
import { loginAsCoach } from '../helpers/auth'

const TODAY = new Date().toISOString().split('T')[0]
const UNIQUE = Date.now()

// ─────────────────────────────────────────────────────────────────────────────
// CEPR0087-01: /scout/athletes — visual dark + criar atleta mínima
// ─────────────────────────────────────────────────────────────────────────────
test.describe('CEPR0087-01: /scout/athletes visual e CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsCoach(page)
    await page.goto('/scout/athletes')
    // Wait for the lazy-loaded component to fully mount
    await page.waitForSelector('h1', { timeout: 20_000 })
  })

  test('página tem fundo dark (não branco)', async ({ page }) => {
    // The outer div carries the radial-gradient — computed bg is dark (not white or gray-50)
    const outerBg = await page.evaluate(() => {
      const el = document.querySelector('[class*="radial-gradient"]') as HTMLElement | null
      return el ? getComputedStyle(el).backgroundImage : 'none'
    })
    expect(outerBg, 'deve ter radial-gradient dark').toContain('radial-gradient')
  })

  test('h1 "Atletas" e link "Central do Scout" são visíveis', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Atletas')
    await expect(page.getByText('Central do Scout')).toBeVisible()
  })

  test('criar atleta mínima com nome e status ativo', async ({ page }) => {
    const athleteName = `Atleta-CEPR0087-${UNIQUE}`

    // Abrir formulário
    await page.getByRole('button', { name: /Nova Atleta/i }).click()
    await page.waitForSelector('form', { timeout: 5_000 })

    // Preencher nome (form input — não confundir com a busca que também tem input)
    await page.locator('form input').first().fill(athleteName)

    // Submeter
    await page.getByRole('button', { name: /Cadastrar/i }).click()
    await page.waitForTimeout(1_500)

    // Atleta criada deve aparecer na lista
    await expect(page.getByText(athleteName)).toBeVisible({ timeout: 10_000 })
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// CEPR0087-02: /scout/teams — visual dark + criar equipe adversária mínima
// ─────────────────────────────────────────────────────────────────────────────
test.describe('CEPR0087-02: /scout/teams visual e CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsCoach(page)
    await page.goto('/scout/teams')
    await page.waitForSelector('h1', { timeout: 20_000 })
  })

  test('página tem fundo dark (não branco)', async ({ page }) => {
    const outerBg = await page.evaluate(() => {
      const el = document.querySelector('[class*="radial-gradient"]') as HTMLElement | null
      return el ? getComputedStyle(el).backgroundImage : 'none'
    })
    expect(outerBg, 'deve ter radial-gradient dark').toContain('radial-gradient')
  })

  test('h1 "Cadastro de Equipes" e link "Central do Scout" são visíveis', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Cadastro de Equipes')
    await expect(page.getByText('Central do Scout')).toBeVisible()
  })

  test('criar equipe adversária mínima', async ({ page }) => {
    const teamName = `Adversária-CEPR0087-${UNIQUE}`

    // Abrir formulário
    await page.getByRole('button', { name: /Nova Equipe/i }).click()
    await page.waitForSelector('form', { timeout: 5_000 })

    // Preencher nome (placeholder específico do input do formulário de equipe)
    await page.locator('input[placeholder*="Nome da equipe"]').fill(teamName)

    // Submeter (tipo e categoria são opcionais)
    await page.getByRole('button', { name: /Cadastrar/i }).click()
    await page.waitForTimeout(1_500)

    // Equipe criada deve aparecer na lista
    await expect(page.getByText(teamName)).toBeVisible({ timeout: 10_000 })
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// CEPR0087-03: atleta ativa aparece no elenco de /scout/preparar/:gameId
// ─────────────────────────────────────────────────────────────────────────────
test.describe('CEPR0087-03: atleta ativa aparece no elenco', () => {
  test('criar sessão e confirmar atleta ativa no elenco', async ({ page }) => {
    await loginAsCoach(page)

    // Criar atleta ativa via /scout/athletes
    const athleteName = `Elenco-CEPR0087-${UNIQUE}`
    await page.goto('/scout/athletes')
    await page.waitForSelector('h1', { timeout: 20_000 })
    await page.getByRole('button', { name: /Nova Atleta/i }).click()
    await page.waitForSelector('form', { timeout: 5_000 })
    await page.locator('form input').first().fill(athleteName)
    await page.getByRole('button', { name: /Cadastrar/i }).click()
    await expect(page.getByText(athleteName)).toBeVisible({ timeout: 10_000 })

    // Criar sessão em /scout/preparar (TREINO não exige adversária)
    await page.goto('/scout/preparar')
    await page.waitForSelector('h1', { timeout: 20_000 })
    await page.getByRole('button', { name: 'Treino', exact: true }).click()
    await page.locator('input[type="date"]').fill(TODAY)
    await page.getByRole('button', { name: /Confirmar sessão/i }).click()
    await page.waitForURL(/\/scout\/preparar\/[0-9a-f-]{36}/, { timeout: 10_000 })

    // Atleta criada deve aparecer na lista de elenco
    await expect(page.getByText(athleteName)).toBeVisible({ timeout: 10_000 })
  })
})

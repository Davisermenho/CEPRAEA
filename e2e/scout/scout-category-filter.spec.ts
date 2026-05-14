import { test, expect } from '@playwright/test'
import { loginAsCoach } from '../helpers/auth'

/**
 * CEPR-0085 — Filtro de Categoria da ação por fase (0028)
 *
 * Regras:
 *   AT_POS    -> PASSE, ARREMESSO, NAO_OBSERVADO
 *   DEF_POS   -> ACAO_DEFENSIVA, NAO_OBSERVADO
 *   TRANS_OF  -> PASSE, ARREMESSO, TROCA_TRANSICAO, NAO_OBSERVADO
 *   TRANS_DEF -> ACAO_DEFENSIVA, TROCA_TRANSICAO, NAO_OBSERVADO
 */

const TODAY = new Date().toISOString().split('T')[0]

test.describe('Scout — filtro de categoria por fase', () => {
  let gameId: string

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage()
    await loginAsCoach(page)
    await page.goto('/scout/preparar')
    await page.waitForLoadState('networkidle', { timeout: 15_000 })
    await page.getByRole('button', { name: 'Jogo', exact: true }).click()
    await page.locator('input[type="date"]').fill(TODAY)
    await page.locator('input[placeholder="Nome da equipe adversária"]').fill('Rival-CAT')
    await page.getByRole('button', { name: /Confirmar sessão/i }).click()
    await page.waitForURL(/\/scout\/preparar\/[0-9a-f-]{36}/, { timeout: 10_000 })
    gameId = page.url().match(/\/scout\/preparar\/([0-9a-f-]{36})/)?.[1]!
    expect(gameId).toBeTruthy()
    await page.close()
  })

  test.beforeEach(async ({ page }) => {
    await loginAsCoach(page)
    await page.goto(`/scout/ao-vivo/${gameId}`)
    await page.waitForLoadState('networkidle', { timeout: 20_000 })
  })

  // ── Teste 1 ──────────────────────────────────────────────────────────────
  test('AT_POS não exibe Ação defensiva', async ({ page }) => {
    await page.getByRole('button', { name: 'Ataque posicionado', exact: true }).click()
    await page.waitForTimeout(200)
    await expect(page.getByRole('button', { name: 'Ação defensiva', exact: true })).not.toBeVisible()
    await expect(page.getByRole('button', { name: 'Troca/Transição', exact: true })).not.toBeVisible()
    await expect(page.getByRole('button', { name: 'Passe', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Arremesso', exact: true }).first()).toBeVisible()
  })

  // ── Teste 2 ──────────────────────────────────────────────────────────────
  test('DEF_POS não exibe Passe nem Arremesso', async ({ page }) => {
    await page.getByRole('button', { name: 'Defesa posicionada', exact: true }).click()
    await page.waitForTimeout(200)
    await expect(page.getByRole('button', { name: 'Passe', exact: true })).not.toBeVisible()
    const categoriaSection = page.locator('.space-y-2').filter({ hasText: 'Categoria da ação' })
    await expect(categoriaSection.getByRole('button', { name: 'Arremesso', exact: true })).not.toBeVisible()
    await expect(page.getByRole('button', { name: 'Ação defensiva', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Não observado', exact: true })).toBeVisible()
  })

  // ── Teste 3 ──────────────────────────────────────────────────────────────
  test('TRANS_OF não exibe Ação defensiva', async ({ page }) => {
    await page.getByRole('button', { name: 'Transição ofensiva', exact: true }).click()
    await page.waitForTimeout(200)
    await expect(page.getByRole('button', { name: 'Ação defensiva', exact: true })).not.toBeVisible()
    await expect(page.getByRole('button', { name: 'Passe', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Troca/Transição', exact: true })).toBeVisible()
  })

  // ── Teste 4 ──────────────────────────────────────────────────────────────
  test('TRANS_DEF não exibe Passe nem Arremesso', async ({ page }) => {
    await page.getByRole('button', { name: 'Transição defensiva', exact: true }).click()
    await page.waitForTimeout(200)
    await expect(page.getByRole('button', { name: 'Passe', exact: true })).not.toBeVisible()
    const categoriaSection = page.locator('.space-y-2').filter({ hasText: 'Categoria da ação' })
    await expect(categoriaSection.getByRole('button', { name: 'Arremesso', exact: true })).not.toBeVisible()
    await expect(page.getByRole('button', { name: 'Ação defensiva', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Troca/Transição', exact: true })).toBeVisible()
  })

  // ── Teste 5 ──────────────────────────────────────────────────────────────
  test('Trocar fase limpa categoria incompatível', async ({ page }) => {
    await page.getByRole('button', { name: 'Ataque posicionado', exact: true }).click()
    await page.waitForTimeout(200)
    // Passe é categoria válida em AT_POS
    await page.getByRole('button', { name: 'Passe', exact: true }).first().click()
    await page.waitForTimeout(200)
    // Seção Ação básica deve aparecer — clicar para expandir classificação
    await page.getByRole('button', { name: 'Passe' }).last().click()
    await page.waitForTimeout(300)
    // Com categoria+ação_básica Passe selecionados, Classificação deve mostrar opções de Passe
    await expect(page.getByRole('button', { name: 'Passe apoiado', exact: true })).toBeVisible()

    // Trocar para DEF_POS — "Passe" não é categoria válida em DEF_POS
    await page.getByRole('button', { name: 'Defesa posicionada', exact: true }).click()
    await page.waitForTimeout(300)
    // Após trocar para DEF_POS, "Passe" nao deve aparecer como categoria
    await expect(page.getByRole('button', { name: 'Passe', exact: true }).first()).not.toBeVisible()
    // E Classificação de Passe também some
    await expect(page.getByRole('button', { name: 'Passe apoiado', exact: true })).not.toBeVisible()
  })

  // ── Teste 5b ─────────────────────────────────────────────────────────────
  test('Trocar fase mantém categoria compatível', async ({ page }) => {
    await page.getByRole('button', { name: 'Transição ofensiva', exact: true }).click()
    await page.waitForTimeout(200)
    // Passe é categoria válida em TRANS_OF
    await page.getByRole('button', { name: 'Passe', exact: true }).first().click()
    await page.waitForTimeout(200)
    // Clicar ação básica Passe para expandir classificação
    await page.getByRole('button', { name: 'Passe' }).last().click()
    await page.waitForTimeout(300)
    // Classificação de Passe deve aparecer
    await expect(page.getByRole('button', { name: 'Passe apoiado', exact: true })).toBeVisible()

    // Trocar para AT_POS — "Passe" também é válida em AT_POS
    await page.getByRole('button', { name: 'Ataque posicionado', exact: true }).click()
    await page.waitForTimeout(300)
    // Passe deve continuar visível como categoria em AT_POS
    await expect(page.getByRole('button', { name: 'Passe', exact: true }).first()).toBeVisible()
    // E Classificação de Passe deve continuar (categoria mantida ao trocar fase compatível)
    await expect(page.getByRole('button', { name: 'Passe apoiado', exact: true })).toBeVisible()
  })

  // ── Teste 6 ──────────────────────────────────────────────────────────────
  test('COLETA_AO_VIVO (TRANS_DEF + NAO_OBSERVADO) cria somente scout_live_entries', async ({ page }) => {
    // Transicao defensiva + categoria NAO_OBSERVADO + resultado Nao observado
    await page.getByRole('button', { name: 'Transição defensiva', exact: true }).click()
    await page.waitForTimeout(200)
    // Categoria NAO_OBSERVADO (não requer ação básica nem acao_principal_text)
    await page.getByRole('button', { name: 'Não observado', exact: true }).click()
    await page.waitForTimeout(200)
    // Resultado: Nao observado (sem acento — label do codebook)
    await page.getByRole('button', { name: 'Nao observado', exact: true }).click()
    await page.waitForTimeout(300)
    // Clicar Registrar
    await page.getByRole('button', { name: 'Registrar entrada' }).click()
    // Após registro, um artigo deve aparecer na lista de entradas registradas
    await expect(page.locator('article').first()).toBeVisible({ timeout: 15_000 })
  })
})

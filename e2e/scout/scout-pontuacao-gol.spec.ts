import { test, expect } from '@playwright/test'
import { loginAsCoach } from '../helpers/auth'
import { execFileSync } from 'node:child_process'

/**
 * CEPR-0085 Solução 2 — Pontuação de arremesso com gol
 *
 * Regras:
 *   GIRO/AEREA: sem chips de motivo; chips 1/2 visíveis; motivo derivado automaticamente.
 *   ARREM_SIMPLES + Simples: apenas 1 ponto.
 *   ARREM_SIMPLES + 6M/Goleira/Especialista: apenas 2 pontos.
 *   ARREM_SIMPLES + Gol contra: apenas 1 ponto.
 *   GIRO/AEREA + 1 → persiste motivo_pontuacao_code = GIRO ou AEREA (não VALIDACAO_ARBITRAL).
 *   SHOOTOUT removido de LISTA_MOTIVO_PONTUACAO.
 */

const TODAY = new Date().toISOString().split('T')[0]
const DB_URL = process.env['E2E_SUPABASE_DB_URL'] ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'

function queryScalar(sql: string): string {
  return execFileSync('psql', [DB_URL, '-t', '-c', sql], { encoding: 'utf-8' }).trim()
}

async function expectEntryCreated(page: import('@playwright/test').Page) {
  await expect(page.getByText(/Entrada criada como/i)).toBeVisible({ timeout: 15_000 })
}

async function selectNaoObservadoSlice(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: 'Não observado', exact: true }).click()
  await page.waitForTimeout(200)
  await page.getByRole('button', { name: 'Nao observado', exact: true }).click()
}

/** Navega até a tela de coleta ao vivo e seleciona AT_POS + ARREMESSO + ARREMESSO.
 *
 * A ação básica ARREMESSO é auto-selecionada pelo useEffect [0028] assim que a categoria
 * ARREMESSO é escolhida (a lista tem apenas 1 opção). NÃO clicar no botão de ação básica
 * manualmente — isso causaria toggle off e quebraria o estado.
 */
async function goToArremesso(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: 'Ataque posicionado', exact: true }).click()
  await page.getByLabel('Sistema ofensivo').selectOption({ label: 'Ataque 4:0' })
  // Clicar na categoria Arremesso; o useEffect [0028] auto-seleciona a ação básica.
  await page.getByRole('button', { name: 'Arremesso', exact: true }).click()
  // Aguardar que a seção de classificação apareça — prova que o auto-select rodou.
  await page.getByRole('button', { name: 'Giro', exact: true }).waitFor({ state: 'visible', timeout: 5000 })
}

test.describe('Scout — pontuação de gol CEPR-0085 Solução 2', () => {
  let gameId: string

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage()
    await loginAsCoach(page)
    await page.goto('/scout/preparar')
    await page.waitForLoadState('networkidle', { timeout: 15_000 })
    await page.getByRole('button', { name: 'Jogo', exact: true }).click()
    await page.locator('input[type="date"]').fill(TODAY)
    await page.locator('input[placeholder="Nome da equipe adversária"]').fill('Rival-PONTUACAO')
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

  // ── Teste 1 ───────────────────────────────────────────────────────────────
  test('1 — SHOOTOUT inativo em LISTA_MOTIVO_PONTUACAO e ausente na UI', async ({ page }) => {
    // Verificação no banco: SHOOTOUT deve estar inativo
    const activeInDb = queryScalar(
      `SELECT cv.active FROM public.scout_code_values cv
       JOIN public.scout_code_lists l ON l.id = cv.list_id
       WHERE l.list_key = 'LISTA_MOTIVO_PONTUACAO' AND cv.code = 'SHOOTOUT'`
    )
    expect(activeInDb).toBe('f')

    // Verificação na UI: botão Shootout não deve aparecer
    await goToArremesso(page)
    await page.getByRole('button', { name: 'Arremesso simples', exact: true }).click()
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Gol', exact: true }).click()
    await page.waitForTimeout(300)
    await expect(page.getByRole('button', { name: 'Shootout', exact: true })).not.toBeVisible()
  })

  // ── Teste 2 ───────────────────────────────────────────────────────────────
  test('2 — GIRO + GOL: chips 1 e 2 visíveis (sem chips de motivo)', async ({ page }) => {
    await goToArremesso(page)
    await page.getByRole('button', { name: 'Giro', exact: true }).click()
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Gol', exact: true }).click()
    await page.waitForTimeout(300)
    // Chips de pontos devem aparecer
    await expect(page.getByRole('button', { name: '1', exact: true })).toBeVisible({ timeout: 5000 })
    await expect(page.getByRole('button', { name: '2', exact: true })).toBeVisible({ timeout: 5000 })
    // O botão 'Giro' como motivo NÃO deve aparecer (seria redundante com a classificação)
    // (Nota: o botão 'Giro' de classificação está selecionado; verificamos que não há chip adicional de motivo 'Giro')
    const giroButtons = page.getByRole('button', { name: 'Giro', exact: true })
    // Deve haver exatamente 1 botão Giro visível (o da classificação, já clicado)
    await expect(giroButtons).toHaveCount(1)
  })

  // ── Teste 3 ───────────────────────────────────────────────────────────────
  test('3 — AÉREA + GOL: chips 1 e 2 visíveis (sem chips de motivo)', async ({ page }) => {
    await goToArremesso(page)
    await page.getByRole('button', { name: 'Aérea', exact: true }).click()
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Gol', exact: true }).click()
    await page.waitForTimeout(300)
    await expect(page.getByRole('button', { name: '1', exact: true })).toBeVisible({ timeout: 5000 })
    await expect(page.getByRole('button', { name: '2', exact: true })).toBeVisible({ timeout: 5000 })
    // Sem chip de motivo 'Aérea'/'Aerea'
    await expect(page.getByRole('button', { name: 'Aérea', exact: true })).toHaveCount(1)
  })

  // ── Teste 4 ───────────────────────────────────────────────────────────────
  test('4 — ARREM_SIMPLES + Simples + GOL: apenas chip 1 disponível', async ({ page }) => {
    await goToArremesso(page)
    await page.getByRole('button', { name: 'Arremesso simples', exact: true }).click()
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Gol', exact: true }).click()
    await page.waitForTimeout(300)
    await page.getByRole('button', { name: 'Simples', exact: true }).click()
    await page.waitForTimeout(200)
    await expect(page.getByRole('button', { name: '1', exact: true })).toBeVisible({ timeout: 5000 })
    await expect(page.getByRole('button', { name: '2', exact: true })).not.toBeVisible()
  })

  // ── Teste 5 ───────────────────────────────────────────────────────────────
  test('5 — ARREM_SIMPLES + 6 metros + GOL: apenas chip 2 disponível', async ({ page }) => {
    await goToArremesso(page)
    await page.getByRole('button', { name: 'Arremesso simples', exact: true }).click()
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Gol', exact: true }).click()
    await page.waitForTimeout(300)
    await page.getByRole('button', { name: '6 metros', exact: true }).click()
    await page.waitForTimeout(200)
    await expect(page.getByRole('button', { name: '2', exact: true })).toBeVisible({ timeout: 5000 })
    await expect(page.getByRole('button', { name: '1', exact: true })).not.toBeVisible()
  })

  // ── Teste 6 ───────────────────────────────────────────────────────────────
  test('6 — ARREM_SIMPLES + Goleira + GOL: apenas chip 2 disponível', async ({ page }) => {
    await goToArremesso(page)
    await page.getByRole('button', { name: 'Arremesso simples', exact: true }).click()
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Gol', exact: true }).click()
    await page.waitForTimeout(300)
    await page.getByRole('button', { name: 'Goleira', exact: true }).click()
    await page.waitForTimeout(200)
    await expect(page.getByRole('button', { name: '2', exact: true })).toBeVisible({ timeout: 5000 })
    await expect(page.getByRole('button', { name: '1', exact: true })).not.toBeVisible()
  })

  // ── Teste 7 ───────────────────────────────────────────────────────────────
  test('7 — ARREM_SIMPLES + Especialista + GOL: apenas chip 2 disponível', async ({ page }) => {
    await goToArremesso(page)
    await page.getByRole('button', { name: 'Arremesso simples', exact: true }).click()
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Gol', exact: true }).click()
    await page.waitForTimeout(300)
    await page.getByRole('button', { name: 'Especialista', exact: true }).click()
    await page.waitForTimeout(200)
    await expect(page.getByRole('button', { name: '2', exact: true })).toBeVisible({ timeout: 5000 })
    await expect(page.getByRole('button', { name: '1', exact: true })).not.toBeVisible()
  })

  // ── Teste 8 ───────────────────────────────────────────────────────────────
  test('8 — ARREM_SIMPLES + Gol contra + GOL: apenas chip 1 disponível', async ({ page }) => {
    await goToArremesso(page)
    await page.getByRole('button', { name: 'Arremesso simples', exact: true }).click()
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Gol', exact: true }).click()
    await page.waitForTimeout(300)
    await page.getByRole('button', { name: 'Gol contra', exact: true }).click()
    await page.waitForTimeout(200)
    await expect(page.getByRole('button', { name: '1', exact: true })).toBeVisible({ timeout: 5000 })
    await expect(page.getByRole('button', { name: '2', exact: true })).not.toBeVisible()
  })

  // ── Teste 9 ───────────────────────────────────────────────────────────────
  test('9 — GIRO + GOL + 1 ponto: persiste motivo_pontuacao_code = GIRO', async ({ page }) => {
    await goToArremesso(page)
    await page.getByRole('button', { name: 'Giro', exact: true }).click()
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Gol', exact: true }).click()
    await expect(page.getByRole('button', { name: '2', exact: true })).toBeVisible({ timeout: 5000 })
    // Alterar para 1 ponto
    await page.getByRole('button', { name: '1', exact: true }).click()
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Registrar entrada' }).click()
    await expectEntryCreated(page)

    const motivo = queryScalar(
      `SELECT motivo_pontuacao_code FROM public.scout_live_entries
       WHERE scout_game_id = '${gameId}' ORDER BY created_at DESC LIMIT 1`
    )
    const pontos = queryScalar(
      `SELECT pontos_jogada FROM public.scout_live_entries
       WHERE scout_game_id = '${gameId}' ORDER BY created_at DESC LIMIT 1`
    )
    expect(motivo).toBe('GIRO')
    expect(Number(pontos)).toBe(1)
  })

  // ── Teste 10 ──────────────────────────────────────────────────────────────
  test('10 — AÉREA + GOL + 1 ponto: persiste motivo_pontuacao_code = AEREA', async ({ page }) => {
    await goToArremesso(page)
    await page.getByRole('button', { name: 'Aérea', exact: true }).click()
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Gol', exact: true }).click()
    await expect(page.getByRole('button', { name: '2', exact: true })).toBeVisible({ timeout: 5000 })
    // Alterar para 1 ponto
    await page.getByRole('button', { name: '1', exact: true }).click()
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Registrar entrada' }).click()
    await expectEntryCreated(page)

    const motivo = queryScalar(
      `SELECT motivo_pontuacao_code FROM public.scout_live_entries
       WHERE scout_game_id = '${gameId}' ORDER BY created_at DESC LIMIT 1`
    )
    const pontos = queryScalar(
      `SELECT pontos_jogada FROM public.scout_live_entries
       WHERE scout_game_id = '${gameId}' ORDER BY created_at DESC LIMIT 1`
    )
    expect(motivo).toBe('AEREA')
    expect(Number(pontos)).toBe(1)
  })

  // ── Teste 11 ──────────────────────────────────────────────────────────────
  test('11 — COLETA_AO_VIVO cria somente scout_live_entries (não cria scout_plays)', async ({ page }) => {
    await page.getByRole('button', { name: 'Transição defensiva', exact: true }).click()
    await selectNaoObservadoSlice(page)
    await page.getByRole('button', { name: 'Registrar entrada' }).click()
    await expectEntryCreated(page)

    const playsCount = queryScalar(
      `SELECT COUNT(*) FROM public.scout_plays WHERE scout_game_id = '${gameId}'`
    )
    expect(Number(playsCount)).toBe(0)
  })

  // ── Teste 12 ──────────────────────────────────────────────────────────────
  test('12 — scout_play_participations = 0 para entradas COLETA_AO_VIVO', async ({ page }) => {
    void page
    const participationsCount = queryScalar(
      `SELECT COUNT(*)
       FROM public.scout_play_participations spp
       JOIN public.scout_plays sp ON sp.id = spp.scout_play_id
       WHERE sp.scout_game_id = '${gameId}'`
    )
    expect(Number(participationsCount)).toBe(0)
  })
})

import { test, expect } from '@playwright/test'
import { loginAsCoach } from '../helpers/auth'
import { execFileSync } from 'node:child_process'

/**
 * CEPR-0085 DEF_POS — Ajuste semântico de ação defensiva posicionada
 * CEPR-0092 DEF_POS + BLOQUEIO — Separar Finalização Adversária da Execução do Bloqueio
 *
 * Regras testadas:
 *   BLOQUEIO (0092): exibe "Finalização adversária enfrentada" (chips) + "Execução do bloqueio" (chips).
 *   BLOQUEIO (0092): tipo_finalizacao derivado da classificação (GIRO→GIRO, AEREA→AEREA).
 *   BLOQUEIO (0092): ARREM_SIMPLES + ATRASADO + 6m concedido → tipo_finalizacao_code = NULL.
 *   INTERCEPTACAO/ROUBO: sem Gol sofrido nos resultados; sem campo de finalização.
 *   COBERTURA/MARCACAO_PRESSAO/RECOMPOSICAO: campo de finalização só quando resultado envolve arremesso adversário.
 *   Em DEF_POS, opções de finalização filtradas: apenas SIMPLES/GIRO/AEREA/NAO_OBSERVADO.
 */

const TODAY = new Date().toISOString().split('T')[0]
const DB_URL = process.env['E2E_SUPABASE_DB_URL'] ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'

function queryScalar(sql: string): string {
  return execFileSync('psql', [DB_URL, '-t', '-c', sql], { encoding: 'utf-8' }).trim()
}

async function fillTempo(page: import('@playwright/test').Page, tempo = '03:21') {
  await page.getByLabel(/Tempo do vídeo \/ relógio/i).fill(tempo)
}

/** Navega para Defesa posicionada e seleciona ACAO_DEFENSIVA.
 *
 * Após essa função, os botões de ação básica (Bloqueio, Interceptação…) ficam visíveis.
 */
async function goToDefPosAcaoDefensiva(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: 'Defesa posicionada', exact: true }).click()
  await page.getByLabel('Sistema defensivo').selectOption({ index: 1 })
  await page.getByRole('button', { name: 'Ação defensiva', exact: true }).click()
  // Aguarda botões de ação básica aparecerem
  await page.getByRole('button', { name: 'Bloqueio', exact: true }).waitFor({ state: 'visible', timeout: 5000 })
}

test.describe('Scout — DEF_POS semântico CEPR-0085 / CEPR-0092', () => {
  let gameId: string

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage()
    await loginAsCoach(page)
    await page.goto('/scout/preparar')
    await page.waitForLoadState('networkidle', { timeout: 15_000 })
    await page.getByRole('button', { name: 'Jogo', exact: true }).click()
    await page.locator('input[type="date"]').fill(TODAY)
    await page.locator('input[placeholder="Nome da equipe adversária"]').fill('Rival-DEF-POS')
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
  test('1 — CEPR-0092: BLOQUEIO exibe chips "Finalização adversária enfrentada" e "Execução do bloqueio"', async ({ page }) => {
    await goToDefPosAcaoDefensiva(page)
    await page.getByRole('button', { name: 'Bloqueio', exact: true }).click()
    await page.waitForTimeout(200)
    // A seção "Finalização adversária enfrentada" deve aparecer (chips de classificação)
    await expect(page.getByText('Finalização adversária enfrentada', { exact: true })).toBeVisible()
    // A seção "Execução do bloqueio" deve aparecer
    await expect(page.getByText('Execução do bloqueio', { exact: true })).toBeVisible()
    // Os chips de classificação devem estar visíveis
    await expect(page.getByRole('button', { name: 'Giro', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Aérea', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Arremesso simples', exact: true })).toBeVisible()
    // Os chips de execução devem estar visíveis
    await expect(page.getByRole('button', { name: 'Executado', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Não executado', exact: true })).toBeVisible()
    // SELECT de "Finalização adversária" (usado por COBERTURA/MARCACAO_PRESSAO) NÃO deve estar visível
    await expect(page.getByLabel('Finalização adversária enfrentada')).not.toBeVisible()
  })

  // ── Teste 2 ───────────────────────────────────────────────────────────────
  test('2 — CEPR-0092: BLOQUEIO + Giro + Executado + Bloqueado → tipo_finalizacao=GIRO, execucao=EXECUTADO', async ({ page }) => {
    await goToDefPosAcaoDefensiva(page)
    await page.getByRole('button', { name: 'Bloqueio', exact: true }).click()
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Giro', exact: true }).click()
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Executado', exact: true }).click()
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Bloqueado', exact: true }).click()
    await page.waitForTimeout(200)
    await fillTempo(page, '03:21')
    await page.getByRole('button', { name: 'Registrar entrada' }).click()
    await expect(page.locator('article').last()).toBeVisible({ timeout: 15_000 })

    await expect
      .poll(
        () =>
          queryScalar(
            `SELECT tipo_finalizacao_code FROM public.scout_live_entries
             WHERE scout_game_id = '${gameId}'
               AND classificacao_acao_code = 'GIRO'
               AND execucao_bloqueio_code = 'EXECUTADO'
             ORDER BY created_at DESC, id DESC LIMIT 1`
          ),
        { timeout: 15_000 }
      )
      .toBe('GIRO')
  })

  // ── Teste 3 ───────────────────────────────────────────────────────────────
  test('3 — CEPR-0092: BLOQUEIO + Aérea + Não executado + Gol → tipo_finalizacao=AEREA', async ({ page }) => {
    await goToDefPosAcaoDefensiva(page)
    await page.getByRole('button', { name: 'Bloqueio', exact: true }).click()
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Aérea', exact: true }).click()
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Não executado', exact: true }).click()
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Gol sofrido', exact: true }).click()
    await page.waitForTimeout(200)
    await fillTempo(page, '04:21')
    await page.getByRole('button', { name: 'Registrar entrada' }).click()
    await expect(page.locator('article').last()).toBeVisible({ timeout: 15_000 })

    await expect
      .poll(
        () =>
          queryScalar(
            `SELECT tipo_finalizacao_code FROM public.scout_live_entries
             WHERE scout_game_id = '${gameId}'
               AND classificacao_acao_code = 'AEREA'
               AND execucao_bloqueio_code = 'NAO_EXECUTADO'
             ORDER BY created_at DESC, id DESC LIMIT 1`
          ),
        { timeout: 15_000 }
      )
      .toBe('AEREA')
  })

  // ── Teste 4 (novo) ────────────────────────────────────────────────────────
  test('4 — CEPR-0092: BLOQUEIO + Arremesso simples + Atrasado + 6m concedido → tipo_finalizacao=NULL', async ({ page }) => {
    await goToDefPosAcaoDefensiva(page)
    await page.getByRole('button', { name: 'Bloqueio', exact: true }).click()
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Arremesso simples', exact: true }).click()
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Atrasado', exact: true }).click()
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: '6m concedido', exact: true }).click()
    await page.waitForTimeout(200)
    await fillTempo(page, '05:00')
    await page.getByRole('button', { name: 'Registrar entrada' }).click()
    await expect(page.locator('article').last()).toBeVisible({ timeout: 15_000 })

    await expect
      .poll(
        () =>
          queryScalar(
            `SELECT COALESCE(tipo_finalizacao_code, 'NULL') FROM public.scout_live_entries
             WHERE scout_game_id = '${gameId}'
               AND classificacao_acao_code = 'ARREM_SIMPLES'
               AND resultado_factual_code = 'TIRO_6M_CONCEDIDO'
             ORDER BY created_at DESC, id DESC LIMIT 1`
          ),
        { timeout: 15_000 }
      )
      .toBe('NULL')
  })

  // ── Teste 5 ───────────────────────────────────────────────────────────────
  test('5 — CEPR-0090A: Cobrança de 6m adversária aparece na UI e salva com tipo_finalizacao=6M', async ({ page }) => {
    await goToDefPosAcaoDefensiva(page)
    await page.getByRole('button', { name: 'Cobrança de 6m adversária', exact: true }).click()
    await page.waitForTimeout(200)
    // Nao deve haver classificacao para esse evento; o tipo 6m deve aparecer como automático
    await expect(page.getByText('Classificação', { exact: true })).not.toBeVisible()
    await expect(page.getByText('Tipo de finalização: 6m (automático).', { exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Gol sofrido', exact: true }).click()
    await page.waitForTimeout(200)
    await fillTempo(page, '05:30')
    await page.getByRole('button', { name: 'Registrar entrada' }).click()
    await expect(page.locator('article').last()).toBeVisible({ timeout: 15_000 })

    await expect
      .poll(
        () =>
          queryScalar(
            `SELECT COALESCE(tipo_finalizacao_code, 'NULL') || '|' || resultado_factual_code
             FROM public.scout_live_entries
             WHERE scout_game_id = '${gameId}'
               AND acao_basica_code = 'FINALIZACAO_6M_ADV'
             ORDER BY created_at DESC, id DESC LIMIT 1`
          ),
        { timeout: 15_000 }
      )
      .toBe('6M|GOL')
  })

  // ── Teste 6 ───────────────────────────────────────────────────────────────
  test('6 — DEF_POS + Interceptação: resultado "Gol sofrido" não aparece', async ({ page }) => {
    await goToDefPosAcaoDefensiva(page)
    await page.getByRole('button', { name: 'Interceptação', exact: true }).click()
    await page.waitForTimeout(200)
    // Aguardar que algum resultado válido apareça (Recuperacao de posse)
    await page.getByRole('button', { name: 'Recuperacao de posse', exact: true }).waitFor({ state: 'visible', timeout: 5000 })
    // "Gol sofrido" NÃO deve aparecer
    await expect(page.getByRole('button', { name: 'Gol sofrido', exact: true })).not.toBeVisible()
  })

  // ── Teste 7 ───────────────────────────────────────────────────────────────
  test('7 — DEF_POS + Roubo de bola: resultado "Gol sofrido" não aparece', async ({ page }) => {
    await goToDefPosAcaoDefensiva(page)
    await page.getByRole('button', { name: 'Roubo de bola', exact: true }).click()
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Recuperacao de posse', exact: true }).waitFor({ state: 'visible', timeout: 5000 })
    await expect(page.getByRole('button', { name: 'Gol sofrido', exact: true })).not.toBeVisible()
  })

  // ── Teste 8 ───────────────────────────────────────────────────────────────
  test('8 — DEF_POS + Interceptação: campo "Finalização adversária" não aparece', async ({ page }) => {
    await goToDefPosAcaoDefensiva(page)
    await page.getByRole('button', { name: 'Interceptação', exact: true }).click()
    await page.waitForTimeout(200)
    // Campo de finalização adversária NÃO deve estar visível (INTERCEPTACAO não envolve arremesso)
    await expect(page.getByLabel('Finalização adversária enfrentada')).not.toBeVisible()
    // Selecionar resultado válido e confirmar que continua oculto
    await page.getByRole('button', { name: 'Recuperacao de posse', exact: true }).click()
    await page.waitForTimeout(200)
    await expect(page.getByLabel('Finalização adversária enfrentada')).not.toBeVisible()
  })

  // ── Teste 9 ───────────────────────────────────────────────────────────────
  test('9 — DEF_POS + Marcação/pressão + Gol sofrido: campo "Finalização adversária" aparece', async ({ page }) => {
    await goToDefPosAcaoDefensiva(page)
    await page.getByRole('button', { name: 'Marcação/pressão', exact: true }).click()
    await page.waitForTimeout(200)
    // Aguardar botões de resultado
    await page.getByRole('button', { name: 'Gol sofrido', exact: true }).waitFor({ state: 'visible', timeout: 5000 })
    await page.getByRole('button', { name: 'Gol sofrido', exact: true }).click()
    await page.waitForTimeout(300)
    // Campo deve aparecer quando o resultado envolve arremesso adversário
    await expect(page.getByLabel('Finalização adversária enfrentada')).toBeVisible()
  })

  // ── Teste 10 ──────────────────────────────────────────────────────────────
  test('10 — DEF_POS: opções de finalização filtradas (sem CONTRA, GOL_CONTRA, SHOOTOUT)', async ({ page }) => {
    await goToDefPosAcaoDefensiva(page)
    await page.getByRole('button', { name: 'Marcação/pressão', exact: true }).click()
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Gol sofrido', exact: true }).waitFor({ state: 'visible', timeout: 5000 })
    await page.getByRole('button', { name: 'Gol sofrido', exact: true }).click()
    await page.waitForTimeout(300)
    // Confirmar que o campo está visível
    const selectEl = page.getByLabel('Finalização adversária enfrentada')
    await expect(selectEl).toBeVisible()
    // As opções proibidas NÃO devem aparecer
    const optionTexts = await selectEl.locator('option').allTextContents()
    expect(optionTexts).not.toContain('Finalização em contra-ataque')
    expect(optionTexts).not.toContain('Gol contra')
    expect(optionTexts).not.toContain('Shootout')
    // Opções permitidas devem aparecer
    expect(optionTexts.some((t) => t.includes('Arremesso simples'))).toBe(true)
    expect(optionTexts.some((t) => t.includes('Giro'))).toBe(true)
    expect(optionTexts.some((t) => t.includes('Aerea'))).toBe(true)
  })

  // ── Teste 11 ──────────────────────────────────────────────────────────────
  test('11 — scout_plays = 0 e scout_play_participations = 0 para entradas COLETA_AO_VIVO', async ({ page }) => {
    void page
    const playsCount = queryScalar(
      `SELECT COUNT(*) FROM public.scout_plays WHERE scout_game_id = '${gameId}'`
    )
    expect(Number(playsCount)).toBe(0)

    const participationsCount = queryScalar(
      `SELECT COUNT(*)
       FROM public.scout_play_participations spp
       JOIN public.scout_plays sp ON sp.id = spp.scout_play_id
       WHERE sp.scout_game_id = '${gameId}'`
    )
    expect(Number(participationsCount)).toBe(0)
  })
})

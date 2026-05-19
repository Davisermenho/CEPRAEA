import { test, expect } from '@playwright/test'
import { loginAsCoach } from '../helpers/auth'
import { execFileSync } from 'node:child_process'

/**
 * CEPR-0085 Solução 2 — Pontuação de arremesso com gol
 *
 * Regras:
 *   GIRO/AEREA: sem chips de motivo; chips 1/2 visíveis; motivo derivado automaticamente.
 *   ARREM_SIMPLES + Simples: apenas 1 ponto.
 *   ARREM_SIMPLES + Goleira/Especialista: apenas 2 pontos.
 *   ARREM_SIMPLES + Gol contra: apenas 1 ponto.
 *   ARREM_SIMPLES não exibe motivos GIRO/AEREA/6M.
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

async function fillTempo(page: import('@playwright/test').Page, tempo = '03:21') {
  await page.getByLabel(/Tempo do vídeo \/ relógio/i).fill(tempo)
}

async function selectNaoObservadoSlice(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: 'Não observado', exact: true }).click()
  await page.waitForTimeout(200)
  await page.getByRole('button', { name: 'Nao observado', exact: true }).click()
}

async function goToArremesso(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: 'Ataque posicionado', exact: true }).click()
  await page.getByLabel('Sistema ofensivo').selectOption({ label: 'Ataque 4:0' })
  await page.getByRole('button', { name: 'Arremesso', exact: true }).click()
  await page.getByRole('button', { name: 'Arremesso', exact: true }).last().click()
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
    await page.getByRole('button', { name: 'Simples', exact: true }).last().click()
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
    await page.getByRole('button', { name: 'Simples', exact: true }).last().click()
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Gol', exact: true }).click()
    await page.waitForTimeout(300)
    await page.getByRole('button', { name: 'Simples', exact: true }).last().click()
    await page.waitForTimeout(200)
    await expect(page.getByRole('button', { name: '1', exact: true })).toBeVisible({ timeout: 5000 })
    await expect(page.getByRole('button', { name: '2', exact: true })).not.toBeVisible()
  })

  // ── Teste 5 ───────────────────────────────────────────────────────────────
  test('5 — ARREM_SIMPLES + GOL: não exibe motivos Giro, Aérea ou 6 metros', async ({ page }) => {
    await goToArremesso(page)
    await page.getByRole('button', { name: 'Simples', exact: true }).click()
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Gol', exact: true }).click()
    await page.waitForTimeout(300)
    await expect(page.getByRole('button', { name: 'Giro', exact: true })).toHaveCount(1)
    await expect(page.getByRole('button', { name: 'Aérea', exact: true })).toHaveCount(1)
    await expect(page.getByRole('button', { name: '6 metros', exact: true })).not.toBeVisible()
  })

  // ── Teste 5A ──────────────────────────────────────────────────────────────
  test('5A — CEPR-0096: Cobrança de 6m favorável salva com tipo_finalizacao=6M, motivo=6M e 2 pontos', async ({ page }) => {
    await page.getByRole('button', { name: 'Ataque posicionado', exact: true }).click()
    await page.getByLabel('Sistema ofensivo').selectOption({ label: 'Ataque 4:0' })
    await page.getByRole('button', { name: 'Arremesso', exact: true }).click()
    await page.getByRole('button', { name: 'Cobrança de 6m favorável', exact: true }).click()
    await expect(page.getByText('Classificação', { exact: true })).not.toBeVisible()
    await expect(page.getByText('Tipo de finalização: 6m (automático).', { exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Gol', exact: true }).click()
    await expect(page.getByRole('button', { name: '2', exact: true })).toBeVisible({ timeout: 5000 })
    await expect(page.getByRole('button', { name: '1', exact: true })).not.toBeVisible()
    await fillTempo(page, '05:30')
    await page.getByRole('button', { name: 'Registrar entrada' }).click()
    await expectEntryCreated(page)

    await expect
      .poll(
        () =>
          queryScalar(
            `SELECT COALESCE(tipo_finalizacao_code, 'NULL') || '|' ||
                    COALESCE(motivo_pontuacao_code, 'NULL') || '|' ||
                    pontos_jogada::text || '|' || resultado_factual_code
             FROM public.scout_live_entries
             WHERE scout_game_id = '${gameId}'
               AND acao_basica_code = 'FINALIZACAO_6M_FAV'
             ORDER BY created_at DESC, id DESC LIMIT 1`
          ),
        { timeout: 15_000 }
      )
      .toBe('6M|6M|2|GOL')
  })

  // ── Teste 5B ──────────────────────────────────────────────────────────────
  test('5B — AT_POS + Arremesso permite PASSIVO como interrupção da posse', async ({ page }) => {
    await goToArremesso(page)
    await page.getByRole('button', { name: 'Simples', exact: true }).click()
    await expect(page.getByRole('button', { name: 'Passivo', exact: true })).toBeVisible({ timeout: 5000 })
    await page.getByRole('button', { name: 'Passivo', exact: true }).click()
    await expect(page.getByText('Motivo da pontuação', { exact: true })).not.toBeVisible()
    await fillTempo(page, '05:45')
    await expect(page.getByRole('button', { name: 'Registrar entrada' })).toBeEnabled({ timeout: 5_000 })
    await page.getByRole('button', { name: 'Registrar entrada' }).click()
    await expectEntryCreated(page)

    await expect
      .poll(
        () =>
          queryScalar(
            `SELECT resultado_factual_code || '|' ||
                    COALESCE(motivo_pontuacao_code, 'NULL') || '|' ||
                    pontos_jogada::text
             FROM public.scout_live_entries
             WHERE scout_game_id = '${gameId}'
               AND resultado_factual_code = 'PASSIVO'
             ORDER BY created_at DESC, id DESC LIMIT 1`
          ),
        { timeout: 15_000 }
      )
      .toBe('PASSIVO|NULL|0')
  })

  // ── Teste 5C ──────────────────────────────────────────────────────────────
  test('5C — CEPR-0100: AT_POS + Arremesso usa preset de passivo como contexto, não resultado', async ({ page }) => {
    await goToArremesso(page)
    await page.getByRole('button', { name: 'Simples', exact: true }).click()
    await page.getByRole('button', { name: 'Arremesso forçado por passivo', exact: true }).click()
    await page.getByRole('button', { name: 'Bloqueado', exact: true }).click()
    await fillTempo(page, '05:55')
    await page.getByRole('button', { name: 'Registrar entrada' }).click()
    await expectEntryCreated(page)

    await expect
      .poll(
        () =>
          queryScalar(
            `SELECT resultado_factual_code || '|' ||
                    COALESCE(contexto_decisao_code, 'NULL') || '|' ||
                    COALESCE(contexto_arremesso_code, 'NULL') || '|' ||
                    COALESCE(tipo_finalizacao_code, 'NULL')
             FROM public.scout_live_entries
             WHERE scout_game_id = '${gameId}'
               AND contexto_arremesso_code = 'SOB_PASSIVO'
             ORDER BY created_at DESC, id DESC LIMIT 1`
          ),
        { timeout: 15_000 }
      )
      .toBe('BLOQUEADO|PASSIVO_SINALIZADO|SOB_PASSIVO|SIMPLES')
  })

  // ── Teste 6 ───────────────────────────────────────────────────────────────
  test('6 — ARREM_SIMPLES + Goleira + GOL: apenas chip 2 disponível', async ({ page }) => {
    await goToArremesso(page)
    await page.getByRole('button', { name: 'Simples', exact: true }).click()
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
    await page.getByRole('button', { name: 'Simples', exact: true }).click()
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
    await page.getByRole('button', { name: 'Simples', exact: true }).click()
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
    await fillTempo(page, '03:21')
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
    await fillTempo(page, '04:11')
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
    await fillTempo(page, '05:00')
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

import { test, expect } from '@playwright/test'
import { loginAsCoach } from '../helpers/auth'
import { execFileSync } from 'node:child_process'

/**
 * CEPR-0089 — Refinamento semântico de TRANS_OF + ARREMESSO
 *
 * Regras testadas:
 *   1. TRANS_OF + ARREMESSO expõe estrutura da transição como campo separado.
 *   2. Classificações legadas ('Transição direta', 'Transição indireta', 'Aérea na transição')
 *      NÃO aparecem mais em novos registros.
 *   3. 'Transição direta' + GOL + finalização simples → persiste estrutura_transicao_code = 'TRANS_DIRETA'.
 *   4. 'Transição indireta (2x1)' + GOL + finalização simples → persiste estrutura_transicao_code = 'TRANS_INDIRETA_2X1'.
 *   5. 'Transição indireta (2x1)' + GOL + finalização aérea → persiste tipo_finalizacao_code = 'AEREA'.
 *   6. PILOTO-01 #14: transição indireta 3x3 + passivo + giro de longe bloqueado preserva contexto.
 *   7. CEPR-0097: TRANS_OF + ARREMESSO começa com fluxo rápido e detalhes avançados recolhidos.
 *   8. CEPR-0097: preset operacional de passivo preenche contexto sem abrir revisão completa.
 */

const TODAY = new Date().toISOString().split('T')[0]
const DB_URL = process.env['E2E_SUPABASE_DB_URL'] ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'

function queryScalar(sql: string): string {
  return execFileSync('psql', [DB_URL, '-t', '-c', sql], { encoding: 'utf-8' }).trim()
}

async function fillTempo(page: import('@playwright/test').Page, tempo = '03:21') {
  await page.getByLabel(/Tempo do vídeo \/ relógio/i).fill(tempo)
}

async function goToTransOfArremesso(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: 'Transição ofensiva', exact: true }).click()
  await page.waitForTimeout(200)
  await page.getByRole('button', { name: 'Arremesso', exact: true }).first().click()
  await page.waitForTimeout(200)
  await page.getByLabel('Estrutura da transição').waitFor({ state: 'visible', timeout: 5000 })
}

test.describe('Scout — TRANS_OF semântico CEPR-0089', () => {
  let gameId: string

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage()
    await loginAsCoach(page)
    await page.goto('/scout/preparar')
    await page.waitForLoadState('networkidle', { timeout: 15_000 })
    await page.getByRole('button', { name: 'Jogo', exact: true }).click()
    await page.locator('input[type="date"]').fill(TODAY)
    await page.locator('input[placeholder="Nome da equipe adversária"]').fill('Rival-TRANS-0089')
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
  test('1 — TRANS_OF + Arremesso: exibe estrutura da transição como campo separado', async ({ page }) => {
    await goToTransOfArremesso(page)

    const options = await page.getByLabel('Estrutura da transição').evaluate(
      (el: HTMLSelectElement) => Array.from(el.options).map((option) => option.text),
    )

    expect(options).toContain('Transição direta')
    expect(options).toContain('Transição indireta (2x1)')
    expect(options).toContain('Transição indireta (3x2)')
    expect(options).toContain('Transição indireta (4x3)')
    expect(options).toContain('Transição indireta (3x3)')
  })

  // ── Teste 2 ───────────────────────────────────────────────────────────────
  test('2 — TRANS_OF + Arremesso: classificações legadas não aparecem', async ({ page }) => {
    await goToTransOfArremesso(page)
    await expect(page.getByRole('button', { name: 'Transição direta', exact: true })).not.toBeVisible()
    await expect(page.getByRole('button', { name: 'Transição indireta', exact: true })).not.toBeVisible()
    await expect(page.getByRole('button', { name: 'Aérea na transição', exact: true })).not.toBeVisible()
  })

  // ── Teste 3 ───────────────────────────────────────────────────────────────
  test('3 — TRANS_OF + Arremesso + Transição direta + GOL: persiste TRANS_DIRETA no DB', async ({ page }) => {
    await goToTransOfArremesso(page)
    await page.getByLabel('Estrutura da transição').selectOption({ label: 'Transição direta' })
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Simples', exact: true }).click()
    await page.getByRole('button', { name: 'Gol', exact: true }).click()
    await page.getByRole('button', { name: 'Simples', exact: true }).last().click()
    await page.waitForTimeout(200)
    await fillTempo(page, '03:21')
    await page.getByRole('button', { name: 'Registrar entrada' }).click()
    await page.waitForTimeout(1000)

    const estruturaCode = queryScalar(
      `SELECT estrutura_transicao_code FROM public.scout_live_entries ORDER BY created_at DESC LIMIT 1`
    )
    const tipoFin = queryScalar(
      `SELECT tipo_finalizacao_code FROM public.scout_live_entries ORDER BY created_at DESC LIMIT 1`
    )
    expect(estruturaCode).toBe('TRANS_DIRETA')
    expect(tipoFin).toBe('SIMPLES')
  })

  // ── Teste 4 ───────────────────────────────────────────────────────────────
  test('4 — TRANS_OF + Arremesso + Transição indireta + GOL: persiste TRANS_INDIRETA_2X1 no DB', async ({ page }) => {
    await goToTransOfArremesso(page)
    await page.getByLabel('Estrutura da transição').selectOption({ label: 'Transição indireta (2x1)' })
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Simples', exact: true }).click()
    await page.getByRole('button', { name: 'Gol', exact: true }).click()
    await page.getByRole('button', { name: 'Simples', exact: true }).last().click()
    await page.waitForTimeout(200)
    await fillTempo(page, '04:21')
    await page.getByRole('button', { name: 'Registrar entrada' }).click()
    await page.waitForTimeout(1000)

    const estruturaCode = queryScalar(
      `SELECT estrutura_transicao_code FROM public.scout_live_entries ORDER BY created_at DESC LIMIT 1`
    )
    const tipoFin = queryScalar(
      `SELECT tipo_finalizacao_code FROM public.scout_live_entries ORDER BY created_at DESC LIMIT 1`
    )
    expect(estruturaCode).toBe('TRANS_INDIRETA_2X1')
    expect(tipoFin).toBe('SIMPLES')
  })

  // ── Teste 5 ───────────────────────────────────────────────────────────────
  test('5 — TRANS_OF + Arremesso + transição indireta aérea + GOL: persiste estrutura + tipo_fin AEREA', async ({ page }) => {
    await goToTransOfArremesso(page)
    await page.getByLabel('Estrutura da transição').selectOption({ label: 'Transição indireta (2x1)' })
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Aérea', exact: true }).click()
    await page.getByRole('button', { name: 'Gol', exact: true }).click()
    await page.getByRole('button', { name: '1', exact: true }).click()
    await fillTempo(page, '05:21')
    await page.getByRole('button', { name: 'Registrar entrada' }).click()
    await page.waitForTimeout(1000)

    const estruturaCode = queryScalar(
      `SELECT estrutura_transicao_code FROM public.scout_live_entries ORDER BY created_at DESC LIMIT 1`
    )
    const tipoFin = queryScalar(
      `SELECT tipo_finalizacao_code FROM public.scout_live_entries ORDER BY created_at DESC LIMIT 1`
    )
    expect(estruturaCode).toBe('TRANS_INDIRETA_2X1')
    expect(tipoFin).toBe('AEREA')
  })

  // ── Teste 6 ───────────────────────────────────────────────────────────────
  test('6 — PILOTO-01 #14: TRANS_OF 3x3 + passivo + giro de longe bloqueado preserva contexto', async ({ page }) => {
    await goToTransOfArremesso(page)
    await page.getByLabel('Estrutura da transição').selectOption({ label: 'Transição indireta (3x3)' })
    await page.getByRole('button', { name: 'Giro', exact: true }).click()
    await page.getByRole('button', { name: /Detalhes avançados da transição/i }).click()
    await page.getByRole('button', { name: 'Passivo sinalizado', exact: true }).click()
    await page.getByRole('button', { name: 'Giro de longe', exact: true }).click()
    await page.getByRole('button', { name: 'Bloqueado', exact: true }).click()
    await expect(page.getByText('Motivo da pontuação', { exact: true })).not.toBeVisible()
    await fillTempo(page, '06:21')
    await page.getByRole('button', { name: 'Registrar entrada' }).click()
    await expect(page.getByText(/Entrada criada como/i)).toBeVisible({ timeout: 15_000 })

    await expect
      .poll(
        () =>
          queryScalar(
            `SELECT estrutura_transicao_code || '|' ||
                    contexto_decisao_code || '|' ||
                    contexto_arremesso_code || '|' ||
                    tipo_finalizacao_code || '|' ||
                    resultado_factual_code || '|' ||
                    COALESCE(motivo_pontuacao_code, 'NULL') || '|' ||
                    pontos_jogada::text
             FROM public.scout_live_entries
             WHERE scout_game_id = '${gameId}'
               AND estrutura_transicao_code = 'TRANS_INDIRETA_3X3'
             ORDER BY created_at DESC, id DESC LIMIT 1`
          ),
        { timeout: 15_000 }
      )
      .toBe('TRANS_INDIRETA_3X3|PASSIVO_SINALIZADO|GIRO_DE_LONGE|GIRO|BLOQUEADO|NULL|0')
  })

  // ── Teste 7 ───────────────────────────────────────────────────────────────
  test('7 — CEPR-0097: TRANS_OF + Arremesso mantém detalhes avançados recolhidos por padrão', async ({ page }) => {
    await goToTransOfArremesso(page)
    await page.getByLabel('Estrutura da transição').selectOption({ label: 'Transição indireta (3x3)' })

    await expect(page.getByText('Finalização', { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Simples', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Giro', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Aérea', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Arremesso forçado por passivo' })).toBeVisible()
    await expect(page.getByRole('button', { name: /Detalhes avançados da transição/i })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Passivo sinalizado', exact: true })).not.toBeVisible()
    await expect(page.getByRole('button', { name: 'Giro de longe', exact: true })).not.toBeVisible()
  })

  // ── Teste 8 ───────────────────────────────────────────────────────────────
  test('8 — CEPR-0097: preset de passivo salva contexto resumido em TRANS_OF + Arremesso', async ({ page }) => {
    await goToTransOfArremesso(page)
    await page.getByLabel('Estrutura da transição').selectOption({ label: 'Transição indireta (3x3)' })
    await page.getByRole('button', { name: 'Giro', exact: true }).click()
    await page.getByRole('button', { name: 'Arremesso forçado por passivo' }).click()
    await page.getByRole('button', { name: 'Bloqueado', exact: true }).click()
    await fillTempo(page, '07:21')
    await page.getByRole('button', { name: 'Registrar entrada' }).click()
    await expect(page.getByText(/Entrada criada como/i)).toBeVisible({ timeout: 15_000 })

    await expect
      .poll(
        () =>
          queryScalar(
            `SELECT estrutura_transicao_code || '|' ||
                    contexto_decisao_code || '|' ||
                    contexto_arremesso_code || '|' ||
                    tipo_finalizacao_code || '|' ||
                    resultado_factual_code
             FROM public.scout_live_entries
             WHERE scout_game_id = '${gameId}'
               AND estrutura_transicao_code = 'TRANS_INDIRETA_3X3'
               AND contexto_arremesso_code = 'SOB_PASSIVO'
             ORDER BY created_at DESC, id DESC LIMIT 1`
          ),
        { timeout: 15_000 }
      )
      .toBe('TRANS_INDIRETA_3X3|PASSIVO_SINALIZADO|SOB_PASSIVO|GIRO|BLOQUEADO')
  })

  // ── Teste 9 ───────────────────────────────────────────────────────────────
  test('9 — CEPR-0100: TRANS_OF + Arremesso permite PASSIVO como interrupção da posse', async ({ page }) => {
    await goToTransOfArremesso(page)
    await page.getByLabel('Estrutura da transição').selectOption({ label: 'Transição indireta (3x3)' })
    await page.getByRole('button', { name: 'Simples', exact: true }).click()
    await page.getByRole('button', { name: 'Passivo', exact: true }).click()
    await expect(page.getByText('Motivo da pontuação', { exact: true })).not.toBeVisible()
    await fillTempo(page, '08:21')
    await page.getByRole('button', { name: 'Registrar entrada' }).click()
    await expect(page.getByText(/Entrada criada como/i)).toBeVisible({ timeout: 15_000 })

    await expect
      .poll(
        () =>
          queryScalar(
            `SELECT resultado_factual_code || '|' ||
                    COALESCE(tipo_finalizacao_code, 'NULL') || '|' ||
                    COALESCE(contexto_decisao_code, 'NULL') || '|' ||
                    COALESCE(contexto_arremesso_code, 'NULL')
             FROM public.scout_live_entries
             WHERE scout_game_id = '${gameId}'
               AND resultado_factual_code = 'PASSIVO'
             ORDER BY created_at DESC, id DESC LIMIT 1`
          ),
        { timeout: 15_000 }
      )
      .toBe('PASSIVO|NULL|NULL|NULL')
  })
})

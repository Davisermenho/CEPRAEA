import { test, expect } from '@playwright/test'
import { loginAsCoach } from '../helpers/auth'
import { execFileSync } from 'node:child_process'

/**
 * CEPR-0089 — Refinamento semântico de TRANS_OF + ARREMESSO
 *
 * Regras testadas:
 *   1. TRANS_OF + ARREMESSO: classificações exibem labels semânticos corretos
 *      ('Transição direta', 'Transição indireta', 'Aérea na transição').
 *   2. Labels antigos ('Finalização em contra-ataque', 'Finalização em transição')
 *      NÃO aparecem mais.
 *   3. 'Transição direta' + GOL → persiste classificacao_acao_code = 'FINALIZ_CONTRA' no DB.
 *   4. 'Transição indireta' + GOL → persiste classificacao_acao_code = 'FINALIZ_TRANS' no DB.
 *   5. 'Aérea na transição' + GOL → persiste classificacao_acao_code = 'AEREA_TRANS' e
 *      tipo_finalizacao_code = 'AEREA' no DB.
 */

const TODAY = new Date().toISOString().split('T')[0]
const DB_URL = process.env['E2E_SUPABASE_DB_URL'] ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'

function queryScalar(sql: string): string {
  return execFileSync('psql', [DB_URL, '-t', '-c', sql], { encoding: 'utf-8' }).trim()
}

async function goToTransOfArremesso(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: 'Transição ofensiva', exact: true }).click()
  await page.waitForTimeout(200)
  // Arremesso é categoria; depois seleciona Arremesso como ação básica
  await page.getByRole('button', { name: 'Arremesso', exact: true }).first().click()
  await page.waitForTimeout(200)
  // useEffect auto-seleciona ação básica 'Arremesso' (única opção) — NÃO clicar manualmente
  // Aguarda botões de classificação aparecerem
  await page.getByRole('button', { name: 'Transição direta', exact: true }).waitFor({ state: 'visible', timeout: 5000 })
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
  test('1 — TRANS_OF + Arremesso: exibe labels semânticos corretos', async ({ page }) => {
    await goToTransOfArremesso(page)
    await expect(page.getByRole('button', { name: 'Transição direta', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Transição indireta', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Aérea na transição', exact: true })).toBeVisible()
  })

  // ── Teste 2 ───────────────────────────────────────────────────────────────
  test('2 — TRANS_OF + Arremesso: labels antigos não aparecem', async ({ page }) => {
    await goToTransOfArremesso(page)
    await expect(page.getByRole('button', { name: 'Finalização em contra-ataque', exact: true })).not.toBeVisible()
    await expect(page.getByRole('button', { name: 'Finalização em transição', exact: true })).not.toBeVisible()
    await expect(page.getByRole('button', { name: 'Aérea em transição', exact: true })).not.toBeVisible()
  })

  // ── Teste 3 ───────────────────────────────────────────────────────────────
  test('3 — TRANS_OF + Arremesso + Transição direta + GOL: persiste FINALIZ_CONTRA no DB', async ({ page }) => {
    await goToTransOfArremesso(page)
    await page.getByRole('button', { name: 'Transição direta', exact: true }).click()
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Gol', exact: true }).click()
    // Motivo pontuação é chip button (não select). FINALIZ_CONTRA não auto-deriva motivo.
    await page.getByRole('button', { name: 'Simples', exact: true }).waitFor({ state: 'visible', timeout: 5000 })
    await page.getByRole('button', { name: 'Simples', exact: true }).click()
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Registrar entrada' }).click()
    await page.waitForTimeout(1000)

    const classifCode = queryScalar(
      `SELECT classificacao_acao_code FROM public.scout_live_entries ORDER BY created_at DESC LIMIT 1`
    )
    expect(classifCode).toBe('FINALIZ_CONTRA')
  })

  // ── Teste 4 ───────────────────────────────────────────────────────────────
  test('4 — TRANS_OF + Arremesso + Transição indireta + GOL: persiste FINALIZ_TRANS no DB', async ({ page }) => {
    await goToTransOfArremesso(page)
    await page.getByRole('button', { name: 'Transição indireta', exact: true }).click()
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Gol', exact: true }).click()
    // Motivo pontuação é chip button (não select). FINALIZ_TRANS não auto-deriva motivo.
    await page.getByRole('button', { name: 'Simples', exact: true }).waitFor({ state: 'visible', timeout: 5000 })
    await page.getByRole('button', { name: 'Simples', exact: true }).click()
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Registrar entrada' }).click()
    await page.waitForTimeout(1000)

    const classifCode = queryScalar(
      `SELECT classificacao_acao_code FROM public.scout_live_entries ORDER BY created_at DESC LIMIT 1`
    )
    expect(classifCode).toBe('FINALIZ_TRANS')
  })

  // ── Teste 5 ───────────────────────────────────────────────────────────────
  test('5 — TRANS_OF + Arremesso + Aérea na transição + GOL: persiste AEREA_TRANS + tipo_fin AEREA', async ({ page }) => {
    await goToTransOfArremesso(page)
    await page.getByRole('button', { name: 'Aérea na transição', exact: true }).click()
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Gol', exact: true }).click()
    // AEREA_TRANS auto-deriva motivo AEREA — aguardar 'Registrar entrada' ficar disponível
    await page.getByRole('button', { name: 'Registrar entrada' }).waitFor({ state: 'visible', timeout: 5000 })
    await page.getByRole('button', { name: 'Registrar entrada' }).click()
    await page.waitForTimeout(1000)

    const classifCode = queryScalar(
      `SELECT classificacao_acao_code FROM public.scout_live_entries ORDER BY created_at DESC LIMIT 1`
    )
    const tipoFin = queryScalar(
      `SELECT tipo_finalizacao_code FROM public.scout_live_entries ORDER BY created_at DESC LIMIT 1`
    )
    expect(classifCode).toBe('AEREA_TRANS')
    expect(tipoFin).toBe('AEREA')
  })
})

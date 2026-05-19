import { test, expect } from '@playwright/test'
import { loginAsCoach } from '../helpers/auth'
import { execFileSync } from 'node:child_process'

/**
 * CEPR-0085 — Matriz de compatibilidade (itens 1-9)
 *
 * Item 1: AT_POS + Sistema ofensivo nao mostra "Nao se aplica"
 * Item 2: AT_POS + Arremesso nao mostra 'Transição direta' nem desativados
 * Item 3: TRANS_OF + Arremesso mostra estrutura da transição em campo separado (CEPR-0089)
 * Item 4: AT_POS + Passe nao mostra Passe longo
 * Item 5: tipo_fin nao aparece para ARREMESSO+ARREMESSO (nao duplica tecnica)
 * Item 6: Gol simples com motivo Especialista/Goleira gera 2 pontos e não oferece 6m
 * Item 7: Defendido/Bloqueado/Fora/Trave nao exige motivo_pontuacao
 * Item 8: COLETA_AO_VIVO cria somente scout_live_entries (zero scout_plays)
 * Item 9: scout_play_participations = 0 para entradas COLETA_AO_VIVO
 */

const TODAY = new Date().toISOString().split('T')[0]
const DB_URL = process.env['E2E_SUPABASE_DB_URL'] ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'

function queryScalar(sql: string): string {
  return execFileSync('psql', [DB_URL, '-t', '-c', sql], { encoding: 'utf-8' }).trim()
}

async function fillTempo(page: import('@playwright/test').Page, tempo = '03:21') {
  await page.getByLabel(/Tempo do vídeo \/ relógio/i).fill(tempo)
}

async function selectNaoObservadoSlice(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: 'Não observado', exact: true }).click()
  await page.waitForTimeout(200)
  await page.getByRole('button', { name: 'Nao observado', exact: true }).click()
}

test.describe('Scout — matriz de compatibilidade CEPR-0085', () => {
  let gameId: string

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage()
    await loginAsCoach(page)
    await page.goto('/scout/preparar')
    await page.waitForLoadState('networkidle', { timeout: 15_000 })
    await page.getByRole('button', { name: 'Jogo', exact: true }).click()
    await page.locator('input[type="date"]').fill(TODAY)
    await page.locator('input[placeholder="Nome da equipe adversária"]').fill('Rival-COMPAT')
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

  // ── Item 1 ───────────────────────────────────────────────────────────────
  test('Item 1 — AT_POS: sistema ofensivo nao exibe "Nao se aplica"', async ({ page }) => {
    await page.getByRole('button', { name: 'Ataque posicionado', exact: true }).click()
    await page.waitForTimeout(200)
    const opts = await page.getByLabel('Sistema ofensivo').evaluate(
      (el: HTMLSelectElement) => Array.from(el.options).map((o) => o.text)
    )
    expect(opts).not.toContain('Não se aplica')
    expect(opts.some((o) => o.includes('Ataque'))).toBe(true)
  })

  // ── Item 2 ───────────────────────────────────────────────────────────────
  test('Item 2 — AT_POS + Arremesso: sem Transicao direta nem desativados', async ({ page }) => {
    await page.getByRole('button', { name: 'Ataque posicionado', exact: true }).click()
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Arremesso', exact: true }).first().click()
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Arremesso', exact: true }).last().click()
    await page.waitForTimeout(200)
    // Filtradas por fase (classificacaoOptionsFinal para AT_POS)
    await expect(page.getByRole('button', { name: 'Transição direta', exact: true })).not.toBeVisible()
    // Desativadas pela migração 0027
    await expect(page.getByRole('button', { name: 'Especialista', exact: true })).not.toBeVisible()
    await expect(page.getByRole('button', { name: 'Goleira', exact: true })).not.toBeVisible()
    await expect(page.getByRole('button', { name: 'Gol contra', exact: true })).not.toBeVisible()
    // Classificacoes validas para AT_POS devem aparecer
    await expect(page.getByRole('button', { name: 'Simples', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Giro', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Aérea', exact: true })).toBeVisible()
  })

  // ── Item 3 ───────────────────────────────────────────────────────────────
  test('Item 3 — TRANS_OF + Arremesso: exibe estrutura da transição e oculta classificações legadas (CEPR-0089)', async ({ page }) => {
    await page.getByRole('button', { name: 'Transição ofensiva', exact: true }).click()
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Arremesso', exact: true }).first().click()
    await page.waitForTimeout(200)
    const options = await page.getByLabel('Estrutura da transição').evaluate(
      (el: HTMLSelectElement) => Array.from(el.options).map((option) => option.text),
    )
    expect(options).toContain('Transição direta')
    expect(options).toContain('Transição indireta (2x1)')
    await expect(page.getByRole('button', { name: 'Transição direta', exact: true })).not.toBeVisible()
    await expect(page.getByRole('button', { name: 'Transição indireta', exact: true })).not.toBeVisible()
  })

  // ── Item 4 ───────────────────────────────────────────────────────────────
  test('Item 4 — AT_POS + Passe: nao exibe Passe longo', async ({ page }) => {
    await page.getByRole('button', { name: 'Ataque posicionado', exact: true }).click()
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Passe', exact: true }).first().click()
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Passe', exact: true }).last().click()
    await page.waitForTimeout(200)
    // Desativado pela migracao 0027
    await expect(page.getByRole('button', { name: 'Passe longo', exact: true })).not.toBeVisible()
    // Opcoes validas devem estar presentes
    await expect(page.getByRole('button', { name: 'Passe apoiado', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Passe em suspensão', exact: true })).toBeVisible()
  })

  // ── Item 5 ───────────────────────────────────────────────────────────────
  test('Item 5 — ARREMESSO+ARREMESSO: tipo_fin nao aparece (nao duplica tecnica)', async ({ page }) => {
    await page.getByRole('button', { name: 'Ataque posicionado', exact: true }).click()
    await page.getByLabel('Sistema ofensivo').selectOption({ label: 'Ataque 4:0' })
    await page.getByRole('button', { name: 'Arremesso', exact: true }).first().click()
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Arremesso', exact: true }).last().click()
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Simples', exact: true }).click()
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Gol', exact: true }).click()
    await page.waitForTimeout(300)
    // tipo_fin NAO deve aparecer — classificacao ja define a tecnica
    await expect(page.getByLabel('Tipo de finalização')).not.toBeVisible()
  })

  // ── Item 6 ───────────────────────────────────────────────────────────────
  test('Item 6 — arremesso simples oferece Especialista/Goleira e não oferece 6m', async ({ page }) => {
    await page.getByRole('button', { name: 'Ataque posicionado', exact: true }).click()
    await page.getByLabel('Sistema ofensivo').selectOption({ label: 'Ataque 4:0' })
    await page.getByRole('button', { name: 'Arremesso', exact: true }).first().click()
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Arremesso', exact: true }).last().click()
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Simples', exact: true }).click()
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Gol', exact: true }).click()
    await page.waitForTimeout(300)

    // Especialista -> pontos = 2
    await page.getByRole('button', { name: 'Especialista', exact: true }).click()
    await page.waitForTimeout(200)
    await expect(page.getByRole('button', { name: '2', exact: true })).toHaveClass(/bg-cep-lime-400/, { timeout: 5000 })

    // Goleira -> pontos = 2
    await page.getByRole('button', { name: 'Goleira', exact: true }).click()
    await page.waitForTimeout(200)
    await expect(page.getByRole('button', { name: '2', exact: true })).toHaveClass(/bg-cep-lime-400/, { timeout: 5000 })

    await expect(page.getByRole('button', { name: '6 metros', exact: true })).not.toBeVisible()
  })

  // ── Item 7 ───────────────────────────────────────────────────────────────
  test('Item 7 — Defendido: secao motivo da pontuacao nao aparece', async ({ page }) => {
    await page.getByRole('button', { name: 'Ataque posicionado', exact: true }).click()
    await page.getByLabel('Sistema ofensivo').selectOption({ label: 'Ataque 4:0' })
    await page.getByRole('button', { name: 'Arremesso', exact: true }).first().click()
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Arremesso', exact: true }).last().click()
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Simples', exact: true }).click()
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Defendido', exact: true }).click()
    await page.waitForTimeout(300)
    // Secao de motivo da pontuacao nao deve aparecer para resultado nao-GOL
    await expect(page.getByText('Motivo da pontuação')).not.toBeVisible()
    await expect(page.getByText('Pontos da jogada')).not.toBeVisible()
  })

  // ── Item 8 ───────────────────────────────────────────────────────────────
  test('Item 8 — COLETA_AO_VIVO cria somente scout_live_entries (zero scout_plays)', async ({ page }) => {
    await page.getByRole('button', { name: 'Transição defensiva', exact: true }).click()
    await selectNaoObservadoSlice(page)
    await fillTempo(page, '03:21')
    await page.getByRole('button', { name: 'Registrar entrada' }).click()
    await expect(page.getByText(/Entrada criada como/i)).toBeVisible({ timeout: 15_000 })
    await expect(
      page.locator('article').filter({ hasText: 'Transição defensiva' }).filter({ hasText: 'PENDENTE' }).last()
    ).toBeVisible({ timeout: 5000 })
    // DB invariant: scout_plays para este game deve ser zero
    const playsCount = queryScalar(
      `SELECT COUNT(*) FROM public.scout_plays WHERE scout_game_id = '${gameId}'`
    )
    expect(Number(playsCount)).toBe(0)
  })

  // ── Item 9 ───────────────────────────────────────────────────────────────
  test('Item 9 — scout_play_participations = 0 para entradas COLETA_AO_VIVO', async ({ page }) => {
    // Nao e necessario navegar; so verifica o DB
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

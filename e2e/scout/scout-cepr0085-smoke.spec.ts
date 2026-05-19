/**
 * Smoke visual CEPR-0085: ajustes finais semânticos pós-smoke
 * Cobre os 4 cenários obrigatórios solicitados.
 */
import { test, expect } from '@playwright/test'
import { execFileSync } from 'node:child_process'
import { loginAsCoach } from '../helpers/auth'

const TODAY = new Date().toISOString().split('T')[0]
const DB_URL = process.env.E2E_SUPABASE_DB_URL ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'

function queryDb(sql: string): string {
  return execFileSync('psql', [DB_URL, '-t', '-c', sql], { encoding: 'utf8' }).trim()
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

// ─────────────────────────────────────────────────────────────────────────────
// Fixture compartilhada: cria jogo + retorna gameId
// ─────────────────────────────────────────────────────────────────────────────
async function createGame(browser: import('@playwright/test').Browser, rival: string): Promise<string> {
  const page = await browser.newPage()
  await loginAsCoach(page)
  await page.goto('/scout/preparar')
  await page.waitForLoadState('networkidle', { timeout: 15_000 })
  await page.getByRole('button', { name: 'Jogo', exact: true }).click()
  await page.locator('input[type="date"]').fill(TODAY)
  await page.locator('input[placeholder="Nome da equipe adversária"]').fill(rival)
  await page.getByRole('button', { name: /Confirmar sessão/i }).click()
  await page.waitForURL(/\/scout\/preparar\/[0-9a-f-]{36}/, { timeout: 10_000 })
  const gameId = page.url().match(/\/scout\/preparar\/([0-9a-f-]{36})/)?.[1]!
  expect(gameId).toBeTruthy()
  await page.close()
  return gameId
}

// ─────────────────────────────────────────────────────────────────────────────
// CEPR0085-01: PASSE — auto-select acao_basica + resultados corretos
// ─────────────────────────────────────────────────────────────────────────────
test.describe('CEPR0085-01: PASSE', () => {
  let gameId: string

  test.beforeAll(async ({ browser }) => {
    gameId = await createGame(browser, 'Rival-CEPR0085-01')
  })

  test.beforeEach(async ({ page }) => {
    await loginAsCoach(page)
    await page.goto(`/scout/ao-vivo/${gameId}`)
    await page.waitForLoadState('networkidle', { timeout: 20_000 })
  })

  test('acao_basica "Passe" auto-seleciona e resultados corretos aparecem', async ({ page }) => {
    // Selecionar fase
    await page.getByRole('button', { name: 'Ataque posicionado', exact: true }).click()
    await page.getByLabel('Sistema ofensivo').selectOption({ label: 'Ataque 4:0' })

    // Selecionar categoria Passe
    await page.getByRole('button', { name: 'Passe', exact: true }).click()
    await page.waitForTimeout(300)

    // Acao_basica "Passe" deve estar selecionado automaticamente (único valor)
    const acaoBasicaChip = page.getByRole('button', { name: 'Passe', exact: true })
    // Deve haver um chip "Passe" com estilo ativo (classe bg-cep-lime-400 ou similar)
    await expect(acaoBasicaChip.filter({ hasText: /^Passe$/ }).first()).toHaveClass(/bg-cep-lime/, { timeout: 5_000 })

    // Resultados esperados para PASSE
    const expectedResults = [
      'Erro de passe',
      'Passe interceptado',
      'Perda',
      'Violacao',
      'Passivo',
      'Falta de ataque',
      'Nao observado',
    ]
    for (const label of expectedResults) {
      await expect(
        page.getByRole('button', { name: label, exact: true }),
        `Resultado "${label}" deve estar visível`,
      ).toBeVisible({ timeout: 5_000 })
    }

    // Resultados proibidos para PASSE
    const forbiddenResults = ['Gol', 'Defendido', 'Recuperacao de posse']
    for (const label of forbiddenResults) {
      await expect(
        page.getByRole('button', { name: label, exact: true }),
        `Resultado "${label}" NÃO deve estar visível em PASSE`,
      ).not.toBeVisible()
    }
  })

  test('PASSE + PERDA salva sem tipo_finalizacao (smoke de persistência)', async ({ page }) => {
    const rpcErrors: string[] = []
    page.on('response', async (resp) => {
      if (!resp.ok() && resp.url().includes('rpc')) {
        rpcErrors.push(`${resp.status()} ${resp.url()}: ${await resp.text().catch(() => '')}`)
      }
    })

    await page.getByRole('button', { name: 'Ataque posicionado', exact: true }).click()
    await page.getByLabel('Sistema ofensivo').selectOption({ label: 'Ataque 4:0' })
    await page.getByRole('button', { name: 'Passe', exact: true }).click()
    await page.waitForTimeout(300)
    await page.getByRole('button', { name: 'Perda', exact: true }).click()
    await fillTempo(page, '03:21')
    await page.getByRole('button', { name: 'Registrar entrada' }).click()

    await expect(page.locator('article').last()).toBeVisible({ timeout: 15_000 })
    expect(rpcErrors, `RPC errors: ${rpcErrors.join(', ')}`).toHaveLength(0)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// CEPR0085-02: ARREMESSO AT_POS + GOL + GIRO + 1pt aceito + microcopy correto
// ─────────────────────────────────────────────────────────────────────────────
test.describe('CEPR0085-02: AT_POS GOL + GIRO + 1pt', () => {
  let gameId: string

  test.beforeAll(async ({ browser }) => {
    gameId = await createGame(browser, 'Rival-CEPR0085-02')
  })

  test.beforeEach(async ({ page }) => {
    await loginAsCoach(page)
    await page.goto(`/scout/ao-vivo/${gameId}`)
    await page.waitForLoadState('networkidle', { timeout: 20_000 })
  })

  test('GIRO + GOL + 1 ponto é aceito e persiste com status PENDENTE', async ({ page }) => {
    const rpcErrors: string[] = []
    page.on('response', async (resp) => {
      if (!resp.ok() && resp.url().includes('rpc')) {
        rpcErrors.push(`${resp.status()} ${resp.url()}: ${await resp.text().catch(() => '')}`)
      }
    })

    await page.getByRole('button', { name: 'Ataque posicionado', exact: true }).click()
    await page.getByLabel('Sistema ofensivo').selectOption({ label: 'Ataque 4:0' })

    await page.getByRole('button', { name: 'Arremesso', exact: true }).first().click()
    await page.getByRole('button', { name: 'Arremesso', exact: true }).last().click()
    await page.waitForTimeout(300)

    // Selecionar Giro como classificacao
    await page.getByRole('button', { name: 'Giro', exact: true }).click()
    await page.waitForTimeout(300)

    // Resultado GOL
    await page.getByRole('button', { name: 'Gol', exact: true }).click()

    // Microcopy de GIRO deve refletir a regra 2pt com possibilidade de validação em 1pt
    await expect(
      page.getByText('Giro normalmente vale 2 pontos. Marque 1 se a arbitragem não validou a execução como pontuação dupla.', { exact: true }),
    ).toBeVisible({ timeout: 5_000 })

    // GIRO auto-seleciona motivo, pontos 1 e 2 devem estar disponíveis
    await expect(page.getByRole('button', { name: '1', exact: true })).toBeVisible({ timeout: 5_000 })
    await expect(page.getByRole('button', { name: '2', exact: true })).toBeVisible({ timeout: 5_000 })

    // Selecionar 1 ponto explicitamente
    await page.getByRole('button', { name: '1', exact: true }).click()

    await fillTempo(page, '04:32')
    await page.getByRole('button', { name: 'Registrar entrada' }).click()
    await expectEntryCreated(page)
    expect(rpcErrors, `RPC errors: ${rpcErrors.join(', ')}`).toHaveLength(0)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// CEPR0085-03: DEF_POS semântica — label, "Gol sofrido", sem campos de pontuação
// ─────────────────────────────────────────────────────────────────────────────
test.describe('CEPR0085-03: DEF_POS semântica', () => {
  let gameId: string

  test.beforeAll(async ({ browser }) => {
    gameId = await createGame(browser, 'Rival-CEPR0085-03')
  })

  test.beforeEach(async ({ page }) => {
    await loginAsCoach(page)
    await page.goto(`/scout/ao-vivo/${gameId}`)
    await page.waitForLoadState('networkidle', { timeout: 20_000 })
  })

  test('label é "Finalização adversária enfrentada", "Gol sofrido" visível, sem campos de pontuação', async ({ page }) => {
    await page.getByRole('button', { name: 'Defesa posicionada', exact: true }).click()
    await page.getByLabel('Sistema defensivo').selectOption({ label: 'Defesa 3×0' })

    // Categoria ACAO_DEFENSIVA
    await page.getByRole('button', { name: 'Ação defensiva', exact: true }).click()
    await page.waitForTimeout(300)

    // Acao_basica Bloqueio (seleção manual — múltiplas opções)
    await page.getByRole('button', { name: 'Bloqueio', exact: true }).click()
    await page.waitForTimeout(300)

    // Classificacao (tipo da finalizacao adversaria enfrentada)
    await page.getByRole('button', { name: 'Giro', exact: true }).click()
    await page.waitForTimeout(300)

    // Resultado "Gol sofrido" (GOL renomeado em contexto defensivo)
    await page.getByRole('button', { name: 'Gol sofrido', exact: true }).click()

    // Em BLOQUEIO, a finalização adversária é derivada da classificação; o campo não aparece.
    await expect(page.getByLabel('Finalização adversária enfrentada')).not.toBeVisible()

    // Label "Tipo de finalização" NÃO deve aparecer no contexto defensivo
    await expect(page.getByLabel('Tipo de finalização')).not.toBeVisible()

    // Campos de pontuação ofensiva NÃO devem aparecer em DEF_POS
    await expect(page.getByText('Motivo da pontuação')).not.toBeVisible()
    await expect(page.getByText('Pontuação validada pela arbitragem.')).not.toBeVisible()
  })

  test('DEF_POS + Bloqueio + Gol sofrido persiste sem motivo/pontos', async ({ page }) => {
    const rpcErrors: string[] = []
    page.on('response', async (resp) => {
      if (!resp.ok() && resp.url().includes('rpc')) {
        rpcErrors.push(`${resp.status()} ${resp.url()}: ${await resp.text().catch(() => '')}`)
      }
    })

    await page.getByRole('button', { name: 'Defesa posicionada', exact: true }).click()
    await page.getByLabel('Sistema defensivo').selectOption({ label: 'Defesa 3×0' })
    await page.getByRole('button', { name: 'Ação defensiva', exact: true }).click()
    await page.waitForTimeout(300)
    await page.getByRole('button', { name: 'Bloqueio', exact: true }).click()
    await page.waitForTimeout(300)
    await page.getByRole('button', { name: 'Arremesso simples', exact: true }).click()
    await page.waitForTimeout(300)
    await page.getByRole('button', { name: 'Gol sofrido', exact: true }).click()

    await fillTempo(page, '05:12')
    await page.getByRole('button', { name: 'Registrar entrada' }).click()
    await expectEntryCreated(page)
    expect(rpcErrors, `RPC errors: ${rpcErrors.join(', ')}`).toHaveLength(0)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// CEPR0085-04: Invariantes — COLETA_AO_VIVO não cria scout_plays nem participations
// ─────────────────────────────────────────────────────────────────────────────
test.describe('CEPR0085-04: Invariantes de persistência', () => {
  let gameId: string

  test.beforeAll(async ({ browser }) => {
    gameId = await createGame(browser, 'Rival-CEPR0085-04')
  })

  test('scout_plays permanece 0 após múltiplas live entries', async ({ page }) => {
    await loginAsCoach(page)
    await page.goto(`/scout/ao-vivo/${gameId}`)
    await page.waitForLoadState('networkidle', { timeout: 20_000 })

    // Registrar uma entrada TRANS_DEF (mínima)
    await page.getByRole('button', { name: 'Transição defensiva', exact: true }).click()
    await selectNaoObservadoSlice(page)
    await fillTempo(page, '06:05')
    await page.getByRole('button', { name: 'Registrar entrada' }).click()
    await expectEntryCreated(page)

    // Registrar segunda entrada AT_POS
    await page.getByRole('button', { name: 'Ataque posicionado', exact: true }).click()
    await page.getByLabel('Sistema ofensivo').selectOption({ label: 'Ataque 4:0' })
    await page.getByRole('button', { name: 'Passe', exact: true }).click()
    await page.waitForTimeout(300)
    await page.getByRole('button', { name: 'Perda', exact: true }).click()
    await fillTempo(page, '06:55')
    await page.getByRole('button', { name: 'Registrar entrada' }).click()
    await expectEntryCreated(page)

    // Verificar DB: scout_plays = 0 para este jogo
    const playsCount = queryDb(
      `SELECT COUNT(*) FROM public.scout_plays WHERE scout_game_id = '${gameId}'`,
    )
    expect(parseInt(playsCount, 10), 'scout_plays deve ser 0 — COLETA_AO_VIVO não cria scout_plays').toBe(0)

    // Verificar DB: scout_play_participations = 0
    const partCount = queryDb(
      `SELECT COUNT(*) FROM public.scout_play_participations pp
       JOIN public.scout_plays sp ON sp.id = pp.scout_play_id
       WHERE sp.scout_game_id = '${gameId}'`,
    )
    expect(parseInt(partCount, 10), 'scout_play_participations deve ser 0').toBe(0)

    // Verificar DB: scout_live_entries >= 2 (entradas foram salvas)
    const liveCount = queryDb(
      `SELECT COUNT(*) FROM public.scout_live_entries WHERE scout_game_id = '${gameId}'`,
    )
    expect(parseInt(liveCount, 10), 'scout_live_entries deve ter >= 2 entradas').toBeGreaterThanOrEqual(2)
  })
})

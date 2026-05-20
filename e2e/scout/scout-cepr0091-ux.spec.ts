import { execFileSync } from 'node:child_process'
import { expect, test } from '@playwright/test'
import { loginAsCoach } from '../helpers/auth'

const TODAY = new Date().toISOString().split('T')[0]
const DB_URL = process.env.E2E_SUPABASE_DB_URL ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'

function queryScalar(sql: string): string {
  return execFileSync('psql', [DB_URL, '-t', '-c', sql], { encoding: 'utf8' }).trim()
}

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

async function fillTempo(page: import('@playwright/test').Page, tempo: string) {
  await page.getByLabel(/Tempo do vídeo \/ relógio/i).fill(tempo)
}

async function configureBasicPendingEntry(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: 'Ataque posicionado', exact: true }).click()
  await page.getByLabel('Sistema ofensivo').selectOption({ label: 'Ataque 4:0' })
  await page.getByRole('button', { name: 'Passe', exact: true }).click()
  await page.waitForTimeout(300)
  await page.getByRole('button', { name: 'Perda', exact: true }).click()
}

async function createPendingEntry(page: import('@playwright/test').Page, tempo = '03:21') {
  await configureBasicPendingEntry(page)
  await fillTempo(page, tempo)
  await page.getByRole('button', { name: 'Registrar entrada' }).click()
  await expect(page.getByText(/Entrada criada como/i)).toBeVisible({ timeout: 15_000 })
}

function latestLiveEntryId(gameId: string): string {
  return queryScalar(
    `SELECT id
     FROM public.scout_live_entries
     WHERE scout_game_id = '${gameId}'
     ORDER BY created_at DESC
     LIMIT 1`,
  )
}

test.describe('CEPR-0091 — COLETA_AO_VIVO prevenção e recuperação de erro', () => {
  let gameId: string

  test.beforeEach(async ({ browser, page }) => {
    gameId = await createGame(browser, `Rival-CEPR0091-${Date.now()}-${Math.round(Math.random() * 1000)}`)
    await loginAsCoach(page)
    await page.goto(`/scout/ao-vivo/${gameId}`)
    await page.waitForLoadState('networkidle', { timeout: 20_000 })
  })

  test('bloqueia registro sem tempo preenchido', async ({ page }) => {
    await configureBasicPendingEntry(page)

    await expect(page.getByText('Informe o tempo do lance no vídeo.', { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Registrar entrada' })).toBeDisabled()
  })

  test('00:00 exige confirmação explícita antes do registro', async ({ page }) => {
    await configureBasicPendingEntry(page)
    await fillTempo(page, '00:00')

    await expect(
      page.getByText('Informe o tempo do lance no vídeo. O valor 00:00 parece não preenchido.', { exact: true }),
    ).toBeVisible()
    await expect(page.getByRole('button', { name: 'Registrar entrada' })).toBeDisabled()

    await page.getByLabel('Confirmo que o lance ocorreu exatamente em 00:00.').check()
    await expect(page.getByRole('button', { name: 'Registrar entrada' })).toBeEnabled()
  })

  test('tempo válido salva scout_live_entries sem criar scout_plays nem participations', async ({ page }) => {
    await createPendingEntry(page, '03:21')

    await expect(page.getByText('LIVE-0001')).toBeVisible()

    const liveCount = queryScalar(
      `SELECT COUNT(*)
       FROM public.scout_live_entries
       WHERE scout_game_id = '${gameId}'
         AND deleted_at IS NULL`,
    )
    const playsCount = queryScalar(
      `SELECT COUNT(*)
       FROM public.scout_plays
       WHERE scout_game_id = '${gameId}'`,
    )
    const participationsCount = queryScalar(
      `SELECT COUNT(*)
       FROM public.scout_play_participations pp
       JOIN public.scout_plays sp ON sp.id = pp.scout_play_id
       WHERE sp.scout_game_id = '${gameId}'`,
    )

    expect(Number(liveCount)).toBe(1)
    expect(Number(playsCount)).toBe(0)
    expect(Number(participationsCount)).toBe(0)
  })

  test('edita entrada PENDENTE e persiste a atualização na mesma scout_live_entries', async ({ page }) => {
    await createPendingEntry(page, '03:21')
    const liveEntryId = latestLiveEntryId(gameId)

    await page.getByRole('button', { name: 'Editar LIVE-0001' }).click()
    await fillTempo(page, '04:44')
    await page.getByRole('button', { name: 'Salvar edição' }).click()

    await expect(page.getByText('Entrada LIVE-0001 atualizada.')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText('04:44 · Ataque posicionado')).toBeVisible()

    const persistedTempo = queryScalar(
      `SELECT tempo_jogo
       FROM public.scout_live_entries
       WHERE id = '${liveEntryId}'`,
    )

    expect(persistedTempo).toBe('04:44')
  })

  test('exclui entrada PENDENTE sem scout_play e remove da lista', async ({ page }) => {
    await createPendingEntry(page, '03:21')

    page.once('dialog', async (dialog) => {
      await dialog.accept()
    })

    await page.getByRole('button', { name: 'Excluir LIVE-0001' }).click()

    await expect(page.getByText('Entrada LIVE-0001 excluída da coleta ao vivo.')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByRole('button', { name: 'Excluir LIVE-0001' })).toHaveCount(0)
    await expect(page.getByText('Nenhuma sequência registrada')).toBeVisible()

    const deletedAt = queryScalar(
      `SELECT deleted_at::text
       FROM public.scout_live_entries
       WHERE scout_game_id = '${gameId}'
       ORDER BY created_at DESC
       LIMIT 1`,
    )
    const visibleCount = queryScalar(
      `SELECT COUNT(*)
       FROM public.scout_live_entries
       WHERE scout_game_id = '${gameId}'
         AND deleted_at IS NULL`,
    )

    expect(deletedAt).not.toBe('')
    expect(Number(visibleCount)).toBe(0)
  })

  test('bloqueia exclusão de entrada VALIDADA', async ({ page }) => {
    await createPendingEntry(page, '03:21')

    const liveEntryId = latestLiveEntryId(gameId)
    queryScalar(
      `UPDATE public.scout_live_entries
       SET status_validacao_code = 'VALIDADO'
       WHERE id = '${liveEntryId}';
       SELECT 'ok';`,
    )

    await page.reload({ waitUntil: 'domcontentloaded' })

    await expect(page.getByRole('button', { name: 'Excluir LIVE-0001' })).toBeDisabled({ timeout: 20_000 })
    await expect(page.getByText('Somente entradas PENDENTE podem ser excluídas.')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Editar LIVE-0001' })).toHaveCount(0)
  })
})

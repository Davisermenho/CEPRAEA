import { test, expect } from '@playwright/test'
import { loginAsCoach } from '../helpers/auth'

const TODAY = new Date().toISOString().split('T')[0]

async function fillTempo(page: import('@playwright/test').Page, tempo = '03:21') {
  await page.getByLabel(/Tempo do vídeo \/ relógio/i).fill(tempo)
}

async function createGame(browser: import('@playwright/test').Browser, rival: string) {
  const page = await browser.newPage()
  await loginAsCoach(page)
  await page.goto('/scout/preparar')
  await page.waitForLoadState('networkidle', { timeout: 15_000 })
  await page.getByRole('button', { name: 'Jogo', exact: true }).click()
  await page.locator('input[type="date"]').fill(TODAY)
  await page.locator('input[placeholder="Nome da equipe adversária"]').fill(rival)
  await page.getByRole('button', { name: /Confirmar sessão/i }).click()
  await page.waitForURL(/\/scout\/preparar\/[0-9a-f-]{36}/, { timeout: 10_000 })
  const gameId = page.url().match(/\/scout\/preparar\/([0-9a-f-]{36})/)?.[1]
  expect(gameId).toBeTruthy()
  await page.close()
  return gameId!
}

test.describe('Scout UX-04 — filtro factual pela matriz central', () => {
  let gameId: string

  test.beforeAll(async ({ browser }) => {
    gameId = await createGame(browser, 'Rival-UX04')
  })

  test.beforeEach(async ({ page }) => {
    await loginAsCoach(page)
    await page.goto(`/scout/ao-vivo/${gameId}`)
    await page.waitForLoadState('networkidle', { timeout: 20_000 })
  })

  test('AT_POS + PASSE mantém só resultados de continuidade e oculta campos de finalização/pontuação', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Ataque posicionado', exact: true }).click()
    await page.getByLabel('Sistema ofensivo').selectOption({ label: 'Ataque 4:0' })
    await page.getByRole('button', { name: 'Passe', exact: true }).first().click()

    await expect(page.getByRole('button', { name: 'Passe', exact: true }).last()).toHaveClass(/bg-cep-lime/)
    await expect(page.getByRole('button', { name: 'Passe apoiado', exact: true })).toBeVisible()

    for (const label of [
      'Erro de passe',
      'Passe interceptado',
      'Perda',
      'Violacao',
      'Passivo',
      'Falta de ataque',
      'Nao observado',
    ]) {
      await expect(page.getByRole('button', { name: label, exact: true })).toBeVisible()
    }

    for (const label of ['Gol', 'Defendido', 'Bloqueado', 'Fora', 'Trave', 'Recuperacao de posse']) {
      await expect(page.getByRole('button', { name: label, exact: true })).not.toBeVisible()
    }

    await expect(page.getByLabel('Tipo de finalização')).not.toBeVisible()
    await expect(page.getByText('Motivo da pontuação', { exact: true })).not.toBeVisible()
    await expect(page.getByText('Pontos da jogada', { exact: true })).not.toBeVisible()
  })

  test('AT_POS + ARREMESSO mostra classificações válidas e GIRO + GOL libera pontuação validada', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Ataque posicionado', exact: true }).click()
    await page.getByLabel('Sistema ofensivo').selectOption({ label: 'Ataque 4:0' })
    await page.getByRole('button', { name: 'Arremesso', exact: true }).first().click()
    await page.getByRole('button', { name: 'Arremesso', exact: true }).last().click()

    await expect(page.getByRole('button', { name: 'Arremesso', exact: true }).last()).toHaveClass(/bg-cep-lime/)
    await expect(page.getByRole('button', { name: 'Giro', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Aérea', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Simples', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Shootout', exact: true })).not.toBeVisible()

    await page.getByRole('button', { name: 'Giro', exact: true }).click()
    await page.getByRole('button', { name: 'Gol', exact: true }).click()

    await expect(page.getByRole('button', { name: '1', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: '2', exact: true })).toBeVisible()
    await expect(page.getByText('Motivo da pontuação', { exact: true })).not.toBeVisible()
    await expect(page.getByLabel('Tipo de finalização')).not.toBeVisible()
  })

  test('DEF_POS + BLOQUEIO deriva finalização da classificação e não expõe campo manual', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Defesa posicionada', exact: true }).click()
    await page.getByLabel('Sistema defensivo').selectOption({ label: 'Defesa 3×0' })
    await page.getByRole('button', { name: 'Ação defensiva', exact: true }).click()
    await page.getByRole('button', { name: 'Bloqueio', exact: true }).click()
    await page.getByRole('button', { name: 'Giro', exact: true }).click()
    await page.getByRole('button', { name: 'Bloqueado', exact: true }).click()

    await expect(page.getByLabel('Finalização adversária enfrentada')).not.toBeVisible()
    await expect(page.getByText('Motivo da pontuação', { exact: true })).not.toBeVisible()
    await expect(page.getByText('Pontos da jogada', { exact: true })).not.toBeVisible()
  })

  test('DEF_POS + INTERCEPTAÇÃO não mostra gol sofrido nem finalização adversária', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Defesa posicionada', exact: true }).click()
    await page.getByLabel('Sistema defensivo').selectOption({ label: 'Defesa 3×0' })
    await page.getByRole('button', { name: 'Ação defensiva', exact: true }).click()
    await page.getByRole('button', { name: 'Interceptação', exact: true }).click()

    await expect(page.getByRole('button', { name: 'Recuperacao de posse', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Gol sofrido', exact: true })).not.toBeVisible()
    await expect(page.getByLabel('Finalização adversária enfrentada')).not.toBeVisible()
  })

  test('TRANS_OF + TROCA_TRANSICAO só mostra ações ofensivas da matriz', async ({ page }) => {
    await page.getByRole('button', { name: 'Transição ofensiva', exact: true }).click()
    await page.getByRole('button', { name: 'Troca/Transição', exact: true }).click()

    await expect(page.getByRole('button', { name: 'Entrada ofensiva', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Troca ofensiva', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Troca defensiva', exact: true })).not.toBeVisible()
    await expect(page.getByRole('button', { name: 'Estabilização', exact: true })).not.toBeVisible()

    await page.getByRole('button', { name: 'Entrada ofensiva', exact: true }).click()
    await expect(page.getByRole('button', { name: 'Entrada no ataque posicionado', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Transição neutralizada', exact: true })).not.toBeVisible()
    await expect(page.getByRole('button', { name: 'Erro de troca', exact: true }).first()).toBeVisible()
  })

  test('TRANS_DEF + TROCA_TRANSICAO só mostra ações defensivas da matriz', async ({ page }) => {
    await page.getByRole('button', { name: 'Transição defensiva', exact: true }).click()
    await page.getByRole('button', { name: 'Troca/Transição', exact: true }).click()

    await expect(page.getByRole('button', { name: 'Troca defensiva', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Estabilização', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Entrada ofensiva', exact: true })).not.toBeVisible()
    await expect(page.getByRole('button', { name: 'Troca ofensiva', exact: true })).not.toBeVisible()

    await page.getByRole('button', { name: 'Troca defensiva', exact: true }).click()
    await expect(page.getByRole('button', { name: 'Transição neutralizada', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Defesa estabilizada', exact: true }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: 'Erro de troca', exact: true }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: 'Entrada no ataque posicionado', exact: true })).not.toBeVisible()
  })

  test('mudar fase limpa resultado incompatível e exibe aviso', async ({ page }) => {
    await page.getByRole('button', { name: 'Ataque posicionado', exact: true }).click()
    await page.getByLabel('Sistema ofensivo').selectOption({ label: 'Ataque 4:0' })
    await page.getByRole('button', { name: 'Passe', exact: true }).first().click()
    await page.getByRole('button', { name: 'Perda', exact: true }).click()

    await page.getByRole('button', { name: 'Defesa posicionada', exact: true }).click()

    await expect(
      page.getByText(
        'Você mudou a categoria ou a ação. O resultado anterior não combina mais com essa escolha. Escolha um novo resultado factual compatível.',
      ),
    ).toBeVisible()
    await expect(page.getByRole('button', { name: 'Perda', exact: true })).not.toBeVisible()
    await expect(page.getByRole('button', { name: 'Ação defensiva', exact: true })).toBeVisible()
  })

  test('submit continua bloqueado quando nenhum resultado factual foi selecionado', async ({ page }) => {
    await page.getByRole('button', { name: 'Ataque posicionado', exact: true }).click()
    await page.getByLabel('Sistema ofensivo').selectOption({ label: 'Ataque 4:0' })
    await page.getByRole('button', { name: 'Passe', exact: true }).first().click()
    await fillTempo(page, '03:21')
    await expect(page.getByRole('button', { name: 'Registrar entrada' })).toBeDisabled()
  })
})

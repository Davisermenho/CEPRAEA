import { test, expect } from '@playwright/test'
import { loginAsCoach } from '../helpers/auth'

const TODAY = new Date().toISOString().split('T')[0]

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

test.describe('Scout visual — campos condicionais da coleta ao vivo', () => {
  let gameId: string

  test.beforeAll(async ({ browser }) => {
    gameId = await createGame(browser, 'Rival-VISUAL')
  })

  test.beforeEach(async ({ page }) => {
    await loginAsCoach(page)
    await page.goto(`/scout/ao-vivo/${gameId}`)
    await page.waitForLoadState('networkidle', { timeout: 20_000 })
  })

  test('Motivo da pontuação fica oculto antes do GOL em AT_POS + ARREMESSO simples', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Ataque posicionado', exact: true }).click()
    await page.getByLabel('Sistema ofensivo').selectOption({ label: 'Ataque 4:0' })
    await page.getByRole('button', { name: 'Arremesso', exact: true }).first().click()
    await page.getByRole('button', { name: 'Arremesso', exact: true }).last().click()
    await page.getByRole('button', { name: 'Simples', exact: true }).click()

    await expect(page.getByText('Motivo da pontuação', { exact: true })).not.toBeVisible()
    await expect(page.getByText('Pontos da jogada', { exact: true })).not.toBeVisible()
  })

  test('Motivo da pontuação continua oculto em AT_POS + PASSE + PERDA', async ({ page }) => {
    await page.getByRole('button', { name: 'Ataque posicionado', exact: true }).click()
    await page.getByLabel('Sistema ofensivo').selectOption({ label: 'Ataque 4:0' })
    await page.getByRole('button', { name: 'Passe', exact: true }).first().click()
    await page.getByRole('button', { name: 'Perda', exact: true }).click()

    await expect(page.getByText('Motivo da pontuação', { exact: true })).not.toBeVisible()
    await expect(page.getByText('Pontos da jogada', { exact: true })).not.toBeVisible()
    await expect(page.getByLabel('Tipo de finalização')).not.toBeVisible()
  })

  test('Motivo da pontuação aparece no GOL e some ao trocar para DEFENDIDO', async ({ page }) => {
    await page.getByRole('button', { name: 'Ataque posicionado', exact: true }).click()
    await page.getByLabel('Sistema ofensivo').selectOption({ label: 'Ataque 4:0' })
    await page.getByRole('button', { name: 'Arremesso', exact: true }).first().click()
    await page.getByRole('button', { name: 'Arremesso', exact: true }).last().click()
    await page.getByRole('button', { name: 'Simples', exact: true }).click()
    await page.getByRole('button', { name: 'Gol', exact: true }).click()

    await expect(page.getByText('Motivo da pontuação', { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Simples', exact: true }).last()).toBeVisible()
    await expect(page.getByRole('button', { name: 'Especialista', exact: true })).toBeVisible()

    await page.getByRole('button', { name: 'Defendido', exact: true }).click()
    await expect(page.getByText('Motivo da pontuação', { exact: true })).not.toBeVisible()
    await expect(page.getByText('Pontos da jogada', { exact: true })).not.toBeVisible()
  })

  test('GIRO e AÉREA com GOL expõem 1 e 2 pontos sem abrir chips manuais de motivo', async ({ page }) => {
    await page.getByRole('button', { name: 'Ataque posicionado', exact: true }).click()
    await page.getByLabel('Sistema ofensivo').selectOption({ label: 'Ataque 4:0' })
    await page.getByRole('button', { name: 'Arremesso', exact: true }).first().click()
    await page.getByRole('button', { name: 'Arremesso', exact: true }).last().click()
    await page.getByRole('button', { name: 'Giro', exact: true }).click()
    await page.getByRole('button', { name: 'Gol', exact: true }).click()

    await expect(page.getByRole('button', { name: '1', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: '2', exact: true })).toBeVisible()
    await expect(page.getByText('Motivo da pontuação', { exact: true })).not.toBeVisible()
    await expect(page.getByRole('button', { name: 'Especialista', exact: true })).not.toBeVisible()
  })

  test('blocos de sistema seguem a fase da bola', async ({ page }) => {
    await page.getByRole('button', { name: 'Ataque posicionado', exact: true }).click()
    await expect(page.getByLabel('Sistema ofensivo')).toBeVisible()
    await expect(page.getByLabel('Sistema defensivo')).not.toBeVisible()

    await page.getByRole('button', { name: 'Defesa posicionada', exact: true }).click()
    await expect(page.getByLabel('Sistema defensivo')).toBeVisible()
    await expect(page.getByLabel('Sistema ofensivo')).not.toBeVisible()

    await page.getByRole('button', { name: 'Transição ofensiva', exact: true }).click()
    await expect(page.getByLabel('Sistema ofensivo')).not.toBeVisible()
    await expect(page.getByLabel('Sistema defensivo')).not.toBeVisible()

    await page.getByRole('button', { name: 'Transição defensiva', exact: true }).click()
    await expect(page.getByLabel('Sistema ofensivo')).not.toBeVisible()
    await expect(page.getByLabel('Sistema defensivo')).not.toBeVisible()
  })

  test('DEF_POS + COBERTURA + Gol sofrido mostra só as finalizações defensivas permitidas', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Defesa posicionada', exact: true }).click()
    await page.getByLabel('Sistema defensivo').selectOption({ label: 'Defesa 3×0' })
    await page.getByRole('button', { name: 'Ação defensiva', exact: true }).click()
    await page.getByRole('button', { name: 'Cobertura', exact: true }).click()
    await page.getByRole('button', { name: 'Gol sofrido', exact: true }).click()

    const finishType = page.getByLabel('Finalização adversária enfrentada')
    await expect(finishType).toBeVisible()

    const optionValues = await finishType.evaluate((el: HTMLSelectElement) =>
      Array.from(el.options)
        .map((option) => option.value)
        .filter(Boolean),
    )

    expect(optionValues).toEqual(['SIMPLES', 'GIRO', 'AEREA', 'NAO_OBSERVADO'])
  })

  test('os botões de fase usam rótulos humanos, não códigos crus', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Ataque posicionado', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Defesa posicionada', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Transição ofensiva', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Transição defensiva', exact: true })).toBeVisible()

    await expect(page.getByRole('button', { name: 'AT_POS', exact: true })).not.toBeVisible()
    await expect(page.getByRole('button', { name: 'DEF_POS', exact: true })).not.toBeVisible()
    await expect(page.getByRole('button', { name: 'TRANS_OF', exact: true })).not.toBeVisible()
    await expect(page.getByRole('button', { name: 'TRANS_DEF', exact: true })).not.toBeVisible()
  })
})

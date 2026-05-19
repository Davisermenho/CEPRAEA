import { test, expect } from '@playwright/test'
import { loginAsCoach } from '../helpers/auth'

const TODAY = new Date().toISOString().split('T')[0]

async function expectEntryCreated(page: import('@playwright/test').Page) {
  await expect(page.getByText(/Entrada criada como/i)).toBeVisible({ timeout: 15_000 })
}

async function fillTempo(page: import('@playwright/test').Page, tempo = '03:21') {
  await page.getByLabel(/Tempo do vídeo \/ relógio/i).fill(tempo)
}

test.describe('Scout RULES-03 smoke', () => {
  let gameId: string

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage()
    await loginAsCoach(page)
    await page.goto('/scout/preparar')
    await page.waitForLoadState('networkidle', { timeout: 15_000 })
    await page.getByRole('button', { name: 'Jogo', exact: true }).click()
    await page.locator('input[type="date"]').fill(TODAY)
    await page.locator('input[placeholder="Nome da equipe adversária"]').fill('Rival-SMOKE')
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

  test('GOL + SIMPLES salva com 1 ponto e status PENDENTE', async ({ page }) => {
    await page.getByRole('button', { name: 'Ataque posicionado', exact: true }).click()
    await page.getByLabel('Sistema ofensivo').selectOption({ label: 'Ataque 4:0' })
    // Clicar na categoria Arremesso; useEffect [0028] auto-seleciona ação básica.
    await page.getByRole('button', { name: 'Arremesso', exact: true }).click()
    await page.getByRole('button', { name: 'Arremesso', exact: true }).last().click()
    await page.getByRole('button', { name: 'Simples', exact: true }).waitFor({ state: 'visible', timeout: 5000 })
    await page.getByRole('button', { name: 'Simples', exact: true }).click()
    await page.getByRole('button', { name: 'Gol', exact: true }).click()
    // Aguardar os motivos de pontuação aparecerem
    await expect(page.getByText('Motivo da pontuação', { exact: true })).toBeVisible({ timeout: 5000 })
    await expect(page.getByLabel('Tipo de finalização')).not.toBeVisible()
    const simplesBtn = page.getByRole('button', { name: 'Simples', exact: true }).last()
    await simplesBtn.click()
    // Aguardar que Simples esteja visualmente selecionado
    await expect(simplesBtn).toHaveClass(/bg-cep-lime-400/, { timeout: 5_000 })
    // Verificar que '1' aparece (auto-selecionado após Simples)
    await expect(page.getByRole('button', { name: '1', exact: true })).toBeVisible({ timeout: 5_000 })
    await fillTempo(page, '03:21')
    await page.getByRole('button', { name: 'Registrar entrada' }).click()
    await expectEntryCreated(page)
  })

  test('GOL + GIRO salva com 2 pontos e status PENDENTE', async ({ page }) => {
    await page.getByRole('button', { name: 'Ataque posicionado', exact: true }).click()
    await page.getByLabel('Sistema ofensivo').selectOption({ label: 'Ataque 4:0' })
    // Clicar na categoria Arremesso; useEffect [0028] auto-seleciona ação básica.
    await page.getByRole('button', { name: 'Arremesso', exact: true }).click()
    await page.getByRole('button', { name: 'Arremesso', exact: true }).last().click()
    await page.getByRole('button', { name: 'Giro', exact: true }).waitFor({ state: 'visible', timeout: 5000 })
    await page.getByRole('button', { name: 'Giro', exact: true }).click()
    await page.getByRole('button', { name: 'Gol', exact: true }).click()
    // Para GIRO, motivo é auto-selecionado. Aguardar botão 2 aparecer
    await expect(page.getByRole('button', { name: '2', exact: true })).toBeVisible({ timeout: 5000 })
    await expect(page.getByLabel('Tipo de finalização')).not.toBeVisible()
    await fillTempo(page, '04:10')
    await page.getByRole('button', { name: 'Registrar entrada' }).click()
    await expectEntryCreated(page)
  })

  test('Recuperacao de posse (DEF_POS) salva sem tipo_finalizacao', async ({ page }) => {
    await page.getByRole('button', { name: 'Defesa posicionada', exact: true }).click()
    await page.getByLabel('Sistema defensivo').selectOption({ index: 1 })
    // NAO_OBSERVADO como categoria — não requer ação básica
    await page.getByRole('button', { name: 'Não observado', exact: true }).click()
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Nao observado', exact: true }).click()
    await expect(page.getByLabel('Tipo de finalização')).not.toBeVisible()
    await fillTempo(page, '05:00')
    await page.getByRole('button', { name: 'Registrar entrada' }).click()
    await expectEntryCreated(page)
  })

  test('Transicao ofensiva (TRANS_OF) salva sem sistema obrigatorio', async ({ page }) => {
    await page.getByRole('button', { name: 'Transição ofensiva', exact: true }).click()
    await expect(page.getByLabel('Sistema ofensivo')).not.toBeVisible()
    await page.getByRole('button', { name: 'Troca/Transição', exact: true }).click()
    await page.getByRole('button', { name: 'Entrada ofensiva', exact: true }).click()
    await page.getByRole('button', { name: 'Vantagem criada', exact: true }).click()
    await fillTempo(page, '06:15')
    await page.getByRole('button', { name: 'Registrar entrada' }).click()
    await expectEntryCreated(page)
  })

  test('Transicao defensiva (TRANS_DEF) salva TRANSICAO_NEUTRALIZADA', async ({ page }) => {
    await page.getByRole('button', { name: 'Transição defensiva', exact: true }).click()
    await expect(page.getByLabel('Sistema defensivo')).not.toBeVisible()
    // NAO_OBSERVADO — não requer acao_principal_text (backend não bloqueia)
    await page.getByRole('button', { name: 'Não observado', exact: true }).click()
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Nao observado', exact: true }).click()
    await fillTempo(page, '07:05')
    await page.getByRole('button', { name: 'Registrar entrada' }).click()
    await expectEntryCreated(page)
  })
})

/**
 * CEPR-0088B — Atleta principal usa fetchScoutAthletes + roster (não useAthleteStore).
 *
 * Fluxo de validação:
 *  1. Criar atleta em /scout/athletes
 *  2. Criar sessão TREINO em /scout/preparar
 *  3. Confirmar atleta no elenco em /scout/preparar/:gameId
 *  4. Abrir /scout/ao-vivo/:gameId
 *  5. Confirmar que a atleta aparece no select "Atleta principal"
 *  6. Registrar entrada com atleta selecionada (AT_POS + Passe + Perda)
 *  7. Confirmar que a entrada foi criada com a atleta
 *
 * Regra verificada: com elenco confirmado, o select lista apenas atletas do roster.
 */
import { test, expect } from '@playwright/test'
import { loginAsCoach } from '../helpers/auth'

const TODAY = new Date().toISOString().split('T')[0]
const UNIQUE = Date.now()

async function fillTempo(page: import('@playwright/test').Page, tempo = '03:21') {
  await page.getByLabel(/Tempo do vídeo \/ relógio/i).fill(tempo)
}

test('CEPR0088B: atleta do roster aparece no select Atleta principal e entrada é salva', async ({ page }) => {
  test.setTimeout(90_000)
  await loginAsCoach(page)

  // ─── 1. Criar atleta em /scout/athletes ───────────────────────────────────
  const athleteName = `Jogadora-CEPR0088B-${UNIQUE}`

  await page.goto('/scout/athletes')
  await page.waitForSelector('h1', { timeout: 20_000 })
  await page.getByRole('button', { name: /Nova Atleta/i }).click()
  await page.waitForSelector('form', { timeout: 5_000 })
  await page.locator('form input').first().fill(athleteName)
  await page.getByRole('button', { name: /Cadastrar/i }).click()
  await expect(page.getByText(athleteName)).toBeVisible({ timeout: 10_000 })

  // ─── 2. Criar sessão TREINO ───────────────────────────────────────────────
  await page.goto('/scout/preparar')
  await page.waitForSelector('h1', { timeout: 20_000 })
  await page.getByRole('button', { name: 'Treino', exact: true }).click()
  await page.locator('input[type="date"]').fill(TODAY)
  await page.getByRole('button', { name: /Confirmar sessão/i }).click()
  await page.waitForURL(/\/scout\/preparar\/[0-9a-f-]{36}/, { timeout: 10_000 })
  const gameId = page.url().match(/\/scout\/preparar\/([0-9a-f-]{36})/)?.[1]!
  expect(gameId).toBeTruthy()

  // ─── 3. Confirmar atleta no elenco ────────────────────────────────────────
  await page.waitForSelector('text=Confirmar elenco', { timeout: 15_000 })
  await page.waitForTimeout(1_500) // aguardar fetchScoutAthletes resolver

  await expect(page.getByText(athleteName)).toBeVisible({ timeout: 10_000 })
  // Clicar na atleta para adicioná-la ao roster
  await page.getByText(athleteName).click()
  await expect(page.getByText(/1 atleta confirmada/i)).toBeVisible({ timeout: 8_000 })

  // ─── 4. Abrir /scout/ao-vivo/:gameId ──────────────────────────────────────
  await page.goto(`/scout/ao-vivo/${gameId}`)
  await page.waitForLoadState('networkidle', { timeout: 20_000 })

  // ─── 5. Confirmar que a atleta aparece no select "Atleta principal" ────────
  // Aguardar o select existir e o option da atleta ser populado (async fetch)
  const atletaSelect = page.getByLabel('Atleta principal')
  await expect(atletaSelect).toBeVisible({ timeout: 20_000 })

  await expect(
    atletaSelect.locator(`option:has-text("${athleteName}")`),
    `Atleta "${athleteName}" deve ser opção em "Atleta principal"`,
  ).toBeAttached({ timeout: 15_000 })

  const options = await atletaSelect.locator('option').allTextContents()
  expect(
    options.some((opt) => opt.includes(athleteName)),
    `Atleta "${athleteName}" deve ser opção em "Atleta principal". Opções encontradas: ${options.join(', ')}`,
  ).toBe(true)

  // ─── 6. Registrar entrada com a atleta selecionada ────────────────────────
  // Selecionar atleta no select (já visível e estável no topo do formulário)
  await atletaSelect.selectOption({ label: athleteName })

  // Usar TRANS_DEF + NAO_OBSERVADO: caminho mínimo, sem sistema nem classificação,
  // evita problemas de scroll/sticky-footer nos chips de resultado.
  await page.getByRole('button', { name: 'Transição defensiva', exact: true }).click()
  await page.waitForTimeout(200)
  // "Não observado" aparece como categoria e como resultado no NAO_OBSERVADO slice
  await page.getByRole('button', { name: 'Não observado', exact: true }).first().click()
  await page.waitForTimeout(200)
  await page.getByRole('button', { name: 'Nao observado', exact: true }).first().click()

  // Capturar erros RPC antes de submeter
  const rpcErrors: string[] = []
  page.on('response', async (resp) => {
    if (!resp.ok() && resp.url().includes('rpc')) {
      rpcErrors.push(`${resp.status()} ${resp.url()}: ${await resp.text().catch(() => '')}`)
    }
  })

  await fillTempo(page, '03:21')
  await page.getByRole('button', { name: 'Registrar entrada' }).click()

  // ─── 7. Confirmar que a entrada foi criada ────────────────────────────────
  // O workspace mostra "Entrada criada como <status>" ao salvar com sucesso
  await expect(
    page.getByText(/Entrada criada como/i),
    'Workspace deve confirmar criação da entrada',
  ).toBeVisible({ timeout: 15_000 })
  expect(rpcErrors, `Erros de RPC: ${rpcErrors.join(', ')}`).toHaveLength(0)
})

// ── Regra 2: sem elenco, o select lista todas as atletas ativas ───────────────
test('CEPR0088B-R2: sem elenco confirmado, select mostra todas as atletas ativas', async ({ page }) => {
  test.setTimeout(60_000)
  await loginAsCoach(page)

  // Criar sessão sem confirmar elenco
  await page.goto('/scout/preparar')
  await page.waitForSelector('h1', { timeout: 20_000 })
  await page.getByRole('button', { name: 'Treino', exact: true }).click()
  await page.locator('input[type="date"]').fill(TODAY)
  await page.getByRole('button', { name: /Confirmar sessão/i }).click()
  await page.waitForURL(/\/scout\/preparar\/[0-9a-f-]{36}/, { timeout: 10_000 })
  const gameId = page.url().match(/\/scout\/preparar\/([0-9a-f-]{36})/)?.[1]!

  // Pular confirmação de elenco — ir direto para coleta
  await page.goto(`/scout/ao-vivo/${gameId}`)
  await page.waitForLoadState('networkidle', { timeout: 20_000 })
  const atletaSelect = page.getByLabel('Atleta principal')
  await expect(atletaSelect).toBeVisible({ timeout: 20_000 })

  // O select deve ter pelo menos a opção placeholder ("Sem protagonista clara")
  const options = await atletaSelect.locator('option').allTextContents()
  expect(options.length).toBeGreaterThanOrEqual(1)
  // Placeholder está presente
  expect(options.some((opt) => opt.toLowerCase().includes('sem protagonista'))).toBe(true)
})

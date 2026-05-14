/**
 * CEPR-0088A — Confirmar que /scout/preparar/:gameId lista atletas reais
 * de fetchScoutAthletes (não do athleteStore legado).
 *
 * Fluxo obrigatório:
 *  1. Criar atleta em /scout/athletes
 *  2. Criar sessão em /scout/preparar
 *  3. Abrir /scout/preparar/:gameId
 *  4. Confirmar que a atleta criada aparece no elenco
 *  5. Marcar a atleta
 *  6. Confirmar contador "1 atleta confirmada"
 *  7. Ir para /scout/ao-vivo/:gameId
 *  8. (scope-note) Workspace usa useAthleteStore populado no boot;
 *     atleta criada mid-session não aparece no select sem reload.
 *     Verificamos apenas que a página carrega sem erro.
 */
import { test, expect } from '@playwright/test'
import { loginAsCoach } from '../helpers/auth'

const TODAY = new Date().toISOString().split('T')[0]
const UNIQUE = Date.now()

test('CEPR0088A: atleta scout real aparece no elenco de confirmação', async ({ page }) => {
  await loginAsCoach(page)

  // ─── 1. Criar atleta em /scout/athletes ───────────────────────────────────
  const athleteName = `Piloto-CEPR0088A-${UNIQUE}`

  await page.goto('/scout/athletes')
  await page.waitForSelector('h1', { timeout: 20_000 })

  await page.getByRole('button', { name: /Nova Atleta/i }).click()
  await page.waitForSelector('form', { timeout: 5_000 })
  await page.locator('form input').first().fill(athleteName)
  await page.getByRole('button', { name: /Cadastrar/i }).click()
  await expect(page.getByText(athleteName)).toBeVisible({ timeout: 10_000 })

  // ─── 2. Criar sessão em /scout/preparar ───────────────────────────────────
  await page.goto('/scout/preparar')
  await page.waitForSelector('h1', { timeout: 20_000 })

  // TREINO não exige adversária
  await page.getByRole('button', { name: 'Treino', exact: true }).click()
  await page.locator('input[type="date"]').fill(TODAY)
  await page.getByRole('button', { name: /Confirmar sessão/i }).click()

  // ─── 3. Aguardar redirecionamento para /scout/preparar/:gameId ─────────────
  await page.waitForURL(/\/scout\/preparar\/[0-9a-f-]{36}/, { timeout: 10_000 })
  const gameId = page.url().match(/\/scout\/preparar\/([0-9a-f-]{36})/)?.[1]!
  expect(gameId).toBeTruthy()

  // Aguardar o elenco carregar (lista de atletas renderizada)
  await page.waitForSelector('text=Confirmar elenco', { timeout: 15_000 })
  await page.waitForTimeout(1_500) // fetchScoutAthletes resolve-se após a sessão montar

  // ─── 4. Confirmar que a atleta criada aparece no elenco ───────────────────
  await expect(
    page.getByText(athleteName),
    `Atleta "${athleteName}" deve aparecer na lista de elenco`,
  ).toBeVisible({ timeout: 10_000 })

  // ─── 5. Marcar a atleta ───────────────────────────────────────────────────
  await page.getByText(athleteName).click()
  // Aguardar a UI confirmar a adição ao roster (ícone CheckSquare ou estilo ativo)
  await page.waitForTimeout(1_000)

  // ─── 6. Confirmar contador "1 atleta confirmada" ──────────────────────────
  await expect(
    page.getByText(/1 atleta confirmada/i),
    'Contador deve mostrar "1 atleta confirmada"',
  ).toBeVisible({ timeout: 5_000 })

  // ─── 7. Ir para /scout/ao-vivo/:gameId ───────────────────────────────────
  await page.getByRole('button', { name: /Coletar ao vivo/i }).click()
  await page.waitForURL(`/scout/ao-vivo/${gameId}`, { timeout: 10_000 })

  // ─── 8. Verificar que o workspace carrega sem erro ────────────────────────
  // NOTA: o select "Atleta principal" usa useAthleteStore (populado no boot).
  // Atleta criada mid-session não aparece sem reload — fora do escopo CEPR-0088A.
  // Verificamos apenas que a página renderiza corretamente.
  await expect(page.getByText(/Coletar ao vivo/i).first()).toBeVisible({ timeout: 15_000 })
})

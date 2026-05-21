import { expect, test } from '@playwright/test'

const COACH_EMAIL = process.env.SMOKE_COACH_EMAIL ?? process.env.E2E_COACH_EMAIL
const COACH_PASSWORD = process.env.SMOKE_COACH_PASSWORD ?? process.env.E2E_COACH_PASSWORD

function assertSmokeCredentials() {
  if (!COACH_EMAIL || !COACH_PASSWORD) {
    throw new Error(
      'Defina SMOKE_COACH_EMAIL e SMOKE_COACH_PASSWORD (ou E2E_COACH_EMAIL/E2E_COACH_PASSWORD) para rodar o smoke de preview.',
    )
  }
}

function timestampTag() {
  const now = new Date()
  const yyyy = now.getUTCFullYear()
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(now.getUTCDate()).padStart(2, '0')
  const hh = String(now.getUTCHours()).padStart(2, '0')
  const mi = String(now.getUTCMinutes()).padStart(2, '0')
  const ss = String(now.getUTCSeconds()).padStart(2, '0')
  return `${yyyy}${mm}${dd}_${hh}${mi}${ss}`
}

function isCriticalResponse(url: string, status: number, body: string) {
  if (status < 400) return false
  const isSupabaseRoute =
    url.includes('/rest/v1/') ||
    url.includes('/auth/v1/') ||
    url.includes('/functions/v1/') ||
    url.includes('/rpc/') ||
    url.includes('.supabase.co')
  if (!isSupabaseRoute) return false

  const criticalPatterns = [
    /row-level security/i,
    /violates row-level security/i,
    /\b42501\b/,
    /permission denied/i,
    /not authorized/i,
    /jwt/i,
    /invalid login credentials/i,
    /auth/i,
  ]

  return criticalPatterns.some((pattern) => pattern.test(body))
}

async function loginAsCoachPreview(page: import('@playwright/test').Page) {
  assertSmokeCredentials()
  await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 30_000 })
  await page.locator('#coach-email').fill(COACH_EMAIL!)
  await page.locator('#coach-password').fill(COACH_PASSWORD!)
  await page.getByRole('button', { name: /entrar/i }).click()
  await expect(page.getByRole('link', { name: 'Início', exact: true })).toBeVisible({
    timeout: 45_000,
  })
  await expect(page).not.toHaveURL(/\/login/)
}

test.describe('Scout Preview Smoke (escrita real)', () => {
  test('cria equipe, cria atleta, prepara sessão, confirma elenco e valida fluxo crítico sem erro RLS/Auth', async ({
    page,
  }) => {
    test.setTimeout(180_000)
    const tag = timestampTag()
    const prefix = `E2E_SMOKE_${tag}`
    const teamName = `${prefix}_TEAM`
    const athleteName = `${prefix}_ATLETA`
    const opponentName = `${prefix}_OPP`
    const rpcErrors: string[] = []
    const pageErrors: string[] = []
    const consoleErrors: string[] = []

    page.on('pageerror', (err) => {
      pageErrors.push(err.message)
    })
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })
    page.on('response', async (resp) => {
      if (resp.ok()) return
      const body = await resp.text().catch(() => '')
      if (isCriticalResponse(resp.url(), resp.status(), body)) {
        rpcErrors.push(`${resp.status()} ${resp.url()} ${body}`.slice(0, 500))
      }
    })

    await loginAsCoachPreview(page)

    await page.goto('/scout/teams')
    await page.getByRole('button', { name: /Nova Equipe/i }).click()
    await page.locator('input[placeholder*="Nome da equipe"]').fill(teamName)
    await page.getByRole('button', { name: /Cadastrar/i }).click()
    await expect(page.getByText(teamName)).toBeVisible({ timeout: 15_000 })

    await page.goto('/scout/athletes')
    await page.getByRole('button', { name: /Nova Atleta/i }).click()
    await page.locator('form input').first().fill(athleteName)
    await page.getByRole('button', { name: /Cadastrar/i }).click()
    await expect(page.getByText(athleteName)).toBeVisible({ timeout: 15_000 })

    await page.goto('/scout/preparar')
    await page.getByRole('button', { name: 'Jogo', exact: true }).click()
    await page.locator('input[type="date"]').fill(new Date().toISOString().split('T')[0]!)
    await page.locator('input[placeholder="Nome da equipe adversária"]').fill(opponentName)
    await page.getByRole('button', { name: /Confirmar sessão/i }).click()
    await page.waitForURL(/\/scout\/preparar\/[0-9a-f-]{36}/, { timeout: 20_000 })
    await expect(page.getByRole('heading', { name: /Confirmar elenco da sessão/i })).toBeVisible()

    await page.getByText(athleteName).click()
    await expect(page.getByText(/1 atleta confirmada/i)).toBeVisible({ timeout: 10_000 })
    await page.getByRole('button', { name: /Coletar ao vivo/i }).click()
    await page.waitForURL(/\/scout\/ao-vivo\/[0-9a-f-]{36}/, { timeout: 20_000 })

    await page.getByRole('button', { name: 'Ataque posicionado', exact: true }).click()
    await page.getByLabel('Sistema ofensivo').selectOption({ label: 'Ataque 4:0' })
    await page.getByRole('button', { name: 'Arremesso', exact: true }).click()
    await page.getByRole('button', { name: 'Arremesso', exact: true }).last().click()
    await page.getByRole('button', { name: 'Passivo', exact: true }).click()
    await page.getByLabel(/Tempo do vídeo \/ relógio/i).fill('03:21')
    await expect(page.getByRole('button', { name: 'Registrar entrada' })).toBeEnabled({ timeout: 5_000 })
    await page.getByRole('button', { name: 'Registrar entrada' }).click()
    await expect(page.getByText(/Entrada criada como/i)).toBeVisible({ timeout: 20_000 })

    await page.getByRole('button', { name: 'Ataque posicionado', exact: true }).click()
    await page.getByLabel('Sistema ofensivo').selectOption({ label: 'Ataque 4:0' })
    await page.getByRole('button', { name: 'Arremesso', exact: true }).click()
    await page.getByRole('button', { name: 'Arremesso', exact: true }).last().click()
    await page.getByRole('button', { name: 'Gol', exact: true }).click()
    await page.getByLabel(/Tempo do vídeo \/ relógio/i).fill('03:40')
    await expect(page.getByText(/Preencha os campos obrigatórios do fluxo/i)).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText('LIVE-0002')).toHaveCount(0)

    const registerButton = page.getByRole('button', { name: 'Registrar entrada' })
    if (await registerButton.isEnabled()) {
      await registerButton.click()
    }
    await expect(page.getByText(/Preencha os campos obrigatórios do fluxo/i)).toBeVisible()
    await expect(page.getByText('LIVE-0002')).toHaveCount(0)
    await page.getByRole('button', { name: 'Simples', exact: true }).first().click()
    await page.getByRole('button', { name: 'Simples', exact: true }).last().click()
    await expect(registerButton).toBeEnabled({ timeout: 5_000 })
    await registerButton.click()
    await expect(page.getByText(/Entrada criada como/i)).toBeVisible({ timeout: 20_000 })
    await expect(page.getByText('LIVE-0002')).toBeVisible({ timeout: 20_000 })

    expect(
      rpcErrors,
      `Erros críticos de integração Supabase detectados:\n${rpcErrors.join('\n')}`,
    ).toHaveLength(0)
    expect(pageErrors, `Page errors detectados:\n${pageErrors.join('\n')}`).toHaveLength(0)
    expect(consoleErrors, `Console errors detectados:\n${consoleErrors.join('\n')}`).toHaveLength(
      0,
    )
  })
})

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

function isIgnorableConsoleError(message: string) {
  const ignorablePatterns = [
    /Failed to load resource: the server responded with a status of (400|401|403|404)/i,
    // Vercel Preview Comments injeta iframe vercel.live; viola CSP report-only mas nao bloqueia.
    /vercel\.live/i,
    /report-only Content Security Policy/i,
  ]
  return ignorablePatterns.some((pattern) => pattern.test(message))
}

type SupabaseRestContext = {
  restBase: string
  apiKey: string
  accessToken: string
}

type SmokeCleanupTarget = {
  teamName: string
  athleteName: string
  gameId: string
}

async function readSupabaseAccessToken(page: import('@playwright/test').Page) {
  return page.evaluate(() => {
    const keys = Object.keys(window.localStorage)
    for (const key of keys) {
      if (!key.includes('auth-token')) continue
      const raw = window.localStorage.getItem(key)
      if (!raw) continue
      try {
        const parsed = JSON.parse(raw) as unknown
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            if (
              item &&
              typeof item === 'object' &&
              'access_token' in item &&
              typeof (item as { access_token?: unknown }).access_token === 'string'
            ) {
              return (item as { access_token: string }).access_token
            }
            if (
              item &&
              typeof item === 'object' &&
              'currentSession' in item &&
              (item as { currentSession?: { access_token?: unknown } }).currentSession?.access_token &&
              typeof (item as { currentSession: { access_token: string } }).currentSession.access_token === 'string'
            ) {
              return (item as { currentSession: { access_token: string } }).currentSession.access_token
            }
          }
        }
        if (
          parsed &&
          typeof parsed === 'object' &&
          'access_token' in parsed &&
          typeof (parsed as { access_token?: unknown }).access_token === 'string'
        ) {
          return (parsed as { access_token: string }).access_token
        }
        if (
          parsed &&
          typeof parsed === 'object' &&
          'currentSession' in parsed &&
          (parsed as { currentSession?: { access_token?: unknown } }).currentSession?.access_token &&
          typeof (parsed as { currentSession: { access_token: string } }).currentSession.access_token === 'string'
        ) {
          return (parsed as { currentSession: { access_token: string } }).currentSession.access_token
        }
      } catch {
        // ignore malformed localStorage entries
      }
    }
    return null
  })
}

async function runBestEffortCleanup(
  page: import('@playwright/test').Page,
  target: SmokeCleanupTarget,
  restOrigin: string | null,
  restApiKey: string | null,
) {
  const warnings: string[] = []

  for (const entryCode of ['LIVE-0002', 'LIVE-0001']) {
    try {
      const deleteButton = page.getByRole('button', { name: `Excluir ${entryCode}` })
      if ((await deleteButton.count()) === 0) continue
      if (!(await deleteButton.first().isVisible().catch(() => false))) continue
      const dialogWait = page
        .waitForEvent('dialog', { timeout: 1_500 })
        .then(async (dialog) => dialog.accept())
        .catch(() => null)
      await deleteButton.first().click()
      await dialogWait
      await page.waitForTimeout(300)
    } catch (error) {
      warnings.push(
        `Falha ao remover ${entryCode} na UI: ${error instanceof Error ? error.message : 'erro desconhecido'}`,
      )
    }
  }

  if (!restOrigin || !restApiKey) {
    warnings.push('Cleanup REST ignorado: origem Supabase ou apikey não identificada durante o smoke.')
    return warnings
  }

  const accessToken = await readSupabaseAccessToken(page)
  if (!accessToken) {
    warnings.push('Cleanup REST ignorado: token de sessão não encontrado em localStorage.')
    return warnings
  }

  const restBase = `${restOrigin}/rest/v1`
  const headers = {
    apikey: restApiKey,
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    Prefer: 'return=minimal',
  }

  try {
    await page.request.fetch(`${restBase}/scout_games?id=eq.${target.gameId}`, {
      method: 'PATCH',
      headers,
      data: {
        status: 'finalizado',
        notes: `[E2E_SMOKE cleanup] ${new Date().toISOString()}`,
      },
    })
  } catch (error) {
    warnings.push(
      `Falha ao finalizar scout_game ${target.gameId}: ${error instanceof Error ? error.message : 'erro desconhecido'}`,
    )
  }

  try {
    const athleteLookup = await page.request.fetch(
      `${restBase}/athletes?select=id&name=eq.${encodeURIComponent(target.athleteName)}&order=created_at.desc&limit=1`,
      { headers: { apikey: restApiKey, Authorization: `Bearer ${accessToken}` } },
    )
    if (athleteLookup.ok()) {
      const payload = (await athleteLookup.json()) as Array<{ id?: string }>
      const athleteId = payload[0]?.id
      if (athleteId) {
        await page.request.fetch(`${restBase}/athletes?id=eq.${athleteId}`, {
          method: 'PATCH',
          headers,
          data: {
            status: 'inativo',
            notes: `[E2E_SMOKE cleanup] ${new Date().toISOString()}`,
          },
        })
      }
    }
  } catch (error) {
    warnings.push(
      `Falha ao inativar atleta ${target.athleteName}: ${error instanceof Error ? error.message : 'erro desconhecido'}`,
    )
  }

  try {
    await page.request.fetch(
      `${restBase}/scout_catalog_teams?name=eq.${encodeURIComponent(target.teamName)}`,
      {
        method: 'PATCH',
        headers,
        data: {
          team_type: 'OUTRA',
          category: 'E2E_SMOKE_ARQUIVADA',
        },
      },
    )
  } catch (error) {
    warnings.push(
      `Falha ao arquivar equipe ${target.teamName}: ${error instanceof Error ? error.message : 'erro desconhecido'}`,
    )
  }

  return warnings
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
    let restOrigin: string | null = null
    let restApiKey: string | null = null

    page.on('pageerror', (err) => {
      pageErrors.push(err.message)
    })
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text()
        if (isIgnorableConsoleError(text)) return
        consoleErrors.push(text)
      }
    })
    page.on('response', async (resp) => {
      const requestHeaders = resp.request().headers()
      if (!restApiKey && requestHeaders['apikey']) {
        restApiKey = requestHeaders['apikey']
      }
      if (!restOrigin && resp.url().includes('/rest/v1/')) {
        try {
          restOrigin = new URL(resp.url()).origin
        } catch {
          // ignore malformed URL
        }
      }
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
    const registerButton = page.getByRole('button', { name: 'Registrar entrada' })
    const enabledBeforeRequired = await registerButton.isEnabled()
    let secondEntryCreated = false

    if (enabledBeforeRequired) {
      await registerButton.click()
      await page.waitForTimeout(1_000)
      secondEntryCreated = (await page.getByText('LIVE-0002').count()) > 0
    }

    if (!secondEntryCreated) {
      const simpleOptions = page.getByRole('button', { name: 'Simples', exact: true })
      const simpleOptionsCount = await simpleOptions.count()
      if (simpleOptionsCount > 1) {
        await simpleOptions.first().click()
        await simpleOptions.last().click()
      } else if (simpleOptionsCount === 1) {
        await simpleOptions.first().click()
      }

      await expect(registerButton).toBeEnabled({ timeout: 5_000 })
      await registerButton.click()
      await expect(page.getByText(/Entrada criada como/i)).toBeVisible({ timeout: 20_000 })
    }
    await expect(page.getByText('LIVE-0002')).toBeVisible({ timeout: 20_000 })

    const cleanupWarnings = await runBestEffortCleanup(
      page,
      {
        teamName,
        athleteName,
        gameId: page.url().match(/\/scout\/ao-vivo\/([0-9a-f-]{36})/)?.[1] ?? '',
      },
      restOrigin,
      restApiKey,
    )
    if (cleanupWarnings.length > 0) {
      console.warn(`[Scout Preview Smoke] Cleanup best-effort com pendências:\n${cleanupWarnings.join('\n')}`)
    }

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

import { test, expect } from '@playwright/test'
import { execFileSync } from 'node:child_process'
import { loginAsAthlete } from '../helpers/auth'

const STAMP = Date.now()
const ATHLETE_NAME = `E2E-AF-${STAMP}`
const ATHLETE_EMAIL = `e2e-af-${STAMP}@cepraea.test`
const ATHLETE_PASSWORD = 'password'
const GENKEY_FUTURE = `E2E-AF-F-${STAMP}`
const GENKEY_PAST = `E2E-AF-P-${STAMP}`

const DB_URL = process.env.E2E_SUPABASE_DB_URL!
const SUPABASE_URL = process.env.VITE_SUPABASE_URL!
const PUBLISHABLE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!
const TEAM_ID = process.env.VITE_SUPABASE_TEAM_ID!
const BASE_URL = 'http://localhost:5173'

function runSql(sql: string) {
  execFileSync('psql', [DB_URL, '-v', 'ON_ERROR_STOP=1'], {
    input: sql,
    stdio: ['pipe', 'inherit', 'inherit'],
  })
}

function querySql(sql: string): string {
  return execFileSync('psql', [DB_URL, '-t', '-A', '-c', sql], {
    stdio: ['pipe', 'pipe', 'inherit'],
  }).toString().trim()
}

let athleteId = ''
let futureTrainingId = ''
let pastTrainingId = ''

test.beforeAll(async () => {
  const esc = (s: string) => s.replaceAll("'", "''")

  runSql(`
    delete from public.trainings
      where team_id = '${TEAM_ID}'
        and generation_key in ('${GENKEY_FUTURE}', '${GENKEY_PAST}');
    delete from auth.users where email = '${esc(ATHLETE_EMAIL)}';
  `)

  const signupRes = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: 'POST',
    headers: { apikey: PUBLISHABLE_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ATHLETE_EMAIL, password: ATHLETE_PASSWORD }),
  })
  const signupData = await signupRes.json() as { user?: { id?: string } }
  const userId = signupData.user?.id
  if (!userId) throw new Error(`Signup falhou: ${JSON.stringify(signupData)}`)

  runSql(`
    insert into public.profiles (id, name, email)
    values ('${userId}', '${esc(ATHLETE_NAME)}', '${esc(ATHLETE_EMAIL)}')
    on conflict (id) do update set name = excluded.name, email = excluded.email;

    insert into public.athletes (team_id, user_id, name, email, status)
    values ('${TEAM_ID}', '${userId}', '${esc(ATHLETE_NAME)}', '${esc(ATHLETE_EMAIL)}', 'ativo');
  `)

  athleteId = querySql(
    `select id from public.athletes
     where email = '${esc(ATHLETE_EMAIL)}' and team_id = '${TEAM_ID}'
     order by created_at desc limit 1`
  )

  // Treino futuro: agendado para amanhã — atleta pode responder com Vou/Não vou
  runSql(`
    insert into public.trainings
      (team_id, type, status, training_date, start_time, end_time, timezone, starts_at, generation_key)
    values
      ('${TEAM_ID}', 'extra', 'agendado',
       (current_date + 1)::date, '19:00', '20:30', 'America/Sao_Paulo',
       ((current_date + 1)::date + interval '19 hours')::timestamptz,
       '${GENKEY_FUTURE}');
  `)
  futureTrainingId = querySql(
    `select id from public.trainings
     where generation_key = '${GENKEY_FUTURE}' and team_id = '${TEAM_ID}'`
  )

  // Treino passado: realizado ontem — atleta estava presente
  runSql(`
    insert into public.trainings
      (team_id, type, status, training_date, start_time, end_time, timezone, starts_at, generation_key)
    values
      ('${TEAM_ID}', 'extra', 'realizado',
       (current_date - 1)::date, '19:00', '20:30', 'America/Sao_Paulo',
       ((current_date - 1)::date + interval '19 hours')::timestamptz,
       '${GENKEY_PAST}');
  `)
  pastTrainingId = querySql(
    `select id from public.trainings
     where generation_key = '${GENKEY_PAST}' and team_id = '${TEAM_ID}'`
  )

  runSql(`
    insert into public.attendance_records (training_id, athlete_id, status)
    values ('${pastTrainingId}', '${athleteId}', 'presente');
  `)
})

test.afterAll(() => {
  const esc = (s: string) => s.replaceAll("'", "''")
  runSql(`
    delete from public.attendance_records where athlete_id = '${athleteId}';
    delete from public.trainings
      where generation_key in ('${GENKEY_FUTURE}', '${GENKEY_PAST}')
        and team_id = '${TEAM_ID}';
    delete from public.athletes where id = '${athleteId}';
    delete from public.profiles
      where id = (
        select id from auth.users
        where email = '${esc(ATHLETE_EMAIL)}'
        order by created_at desc limit 1
      );
    delete from auth.users where email = '${esc(ATHLETE_EMAIL)}';
  `)
})

test.describe('Fluxo autenticado da atleta', () => {
  test('login redireciona para lista de treinos com abas Próximos e Histórico', async ({ page }) => {
    test.setTimeout(60_000)
    await loginAsAthlete(page, ATHLETE_EMAIL, ATHLETE_PASSWORD)
    await expect(page).toHaveURL(/\/atleta\/treinos$/)
    await expect(page.getByText(/Olá,/i)).toBeVisible({ timeout: 10_000 })
    await expect(page.getByRole('button', { name: /próximos/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /histórico/i })).toBeVisible()
  })

  test('aba Próximos: treino futuro aparece com badge Pendente', async ({ browser }) => {
    test.setTimeout(60_000)
    const ctx = await browser.newContext({ baseURL: BASE_URL })
    const page = await ctx.newPage()
    await loginAsAthlete(page, ATHLETE_EMAIL, ATHLETE_PASSWORD)
    // Aba "Próximos" é o padrão — a store carrega via Supabase após login
    await expect(page.getByRole('button', { name: /próximos/i })).toBeVisible({ timeout: 10_000 })
    // O treino futuro (19:00–20:30) deve aparecer na lista
    await expect(page.getByText('19:00–20:30').first()).toBeVisible({ timeout: 15_000 })
    // Sem registro de presença → badge "Pendente"
    await expect(page.getByText('Pendente').first()).toBeVisible({ timeout: 10_000 })
    await ctx.close()
  })

  test('aba Histórico: treino realizado aparece com badge Vou', async ({ browser }) => {
    test.setTimeout(60_000)
    const ctx = await browser.newContext({ baseURL: BASE_URL })
    const page = await ctx.newPage()
    await loginAsAthlete(page, ATHLETE_EMAIL, ATHLETE_PASSWORD)
    await page.getByRole('button', { name: /histórico/i }).click()
    await expect(page.getByText('19:00')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText('Vou')).toBeVisible({ timeout: 10_000 })
    await ctx.close()
  })

  test('detalhe treino futuro: botões Vou/Não vou visíveis; Vou registra presença', async ({ browser }) => {
    test.setTimeout(60_000)
    const ctx = await browser.newContext({ baseURL: BASE_URL })
    const page = await ctx.newPage()
    await loginAsAthlete(page, ATHLETE_EMAIL, ATHLETE_PASSWORD)
    await page.goto(`/atleta/treinos/${futureTrainingId}`)
    await expect(page.getByText(/sua resposta/i)).toBeVisible({ timeout: 15_000 })
    await expect(page.getByRole('button', { name: 'Vou', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Não vou', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Justificar', exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Vou', exact: true }).click()
    await expect(page.getByText(/sua resposta foi registrada/i)).toBeVisible({ timeout: 10_000 })
    // Confirma convergência no banco
    const status = querySql(`
      select status from public.attendance_records
      where training_id = '${futureTrainingId}' and athlete_id = '${athleteId}'
      order by updated_at desc limit 1
    `)
    if (status !== 'presente') throw new Error(`Esperado 'presente', recebido '${status}'`)
    await ctx.close()
  })

  test('detalhe treino realizado: mostra "Você compareceu" sem botões de resposta', async ({ browser }) => {
    test.setTimeout(60_000)
    const ctx = await browser.newContext({ baseURL: BASE_URL })
    const page = await ctx.newPage()
    await loginAsAthlete(page, ATHLETE_EMAIL, ATHLETE_PASSWORD)
    await page.goto(`/atleta/treinos/${pastTrainingId}`)
    await expect(page.getByText(/você compareceu/i)).toBeVisible({ timeout: 15_000 })
    await expect(page.getByRole('button', { name: 'Vou', exact: true })).not.toBeVisible()
    await ctx.close()
  })

  test('perfil: exibe nome e email da atleta; logout redireciona para /atleta/login', async ({ browser }) => {
    test.setTimeout(60_000)
    const ctx = await browser.newContext({ baseURL: BASE_URL })
    const page = await ctx.newPage()
    await loginAsAthlete(page, ATHLETE_EMAIL, ATHLETE_PASSWORD)
    await page.getByRole('link', { name: 'Perfil' }).click()
    await page.waitForURL(/\/atleta\/perfil$/, { timeout: 10_000 })
    await expect(page.getByText(ATHLETE_NAME)).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText(ATHLETE_EMAIL)).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText('Ativa')).toBeVisible({ timeout: 10_000 })
    await page.getByRole('button', { name: /sair/i }).click()
    await page.waitForURL(/\/welcome$/, { timeout: 10_000 })
    await expect(page.getByRole('link', { name: /sou atleta/i })).toBeVisible()
    await ctx.close()
  })

  test('detalhe treino futuro: Não vou registra ausência', async ({ browser }) => {
    test.setTimeout(60_000)
    const ctx = await browser.newContext({ baseURL: BASE_URL })
    const page = await ctx.newPage()
    await loginAsAthlete(page, ATHLETE_EMAIL, ATHLETE_PASSWORD)
    await page.goto(`/atleta/treinos/${futureTrainingId}`)
    await expect(page.getByText(/sua resposta/i)).toBeVisible({ timeout: 15_000 })
    await page.getByRole('button', { name: 'Não vou', exact: true }).click()
    await expect(page.getByText(/sua resposta foi registrada/i)).toBeVisible({ timeout: 10_000 })
    // Botão "Não vou" deve estar ativo (classe border-red-400)
    await expect(page.getByRole('button', { name: 'Não vou', exact: true })).toHaveClass(/border-red-400/, { timeout: 5_000 })
    // Confirma convergência no banco
    const status = querySql(`
      select status from public.attendance_records
      where training_id = '${futureTrainingId}' and athlete_id = '${athleteId}'
      order by updated_at desc limit 1
    `)
    if (status !== 'ausente') throw new Error(`Esperado 'ausente', recebido '${status}'`)
    await ctx.close()
  })

  test('navegação bottom bar: treinos ↔ perfil', async ({ browser }) => {
    test.setTimeout(60_000)
    const ctx = await browser.newContext({ baseURL: BASE_URL })
    const page = await ctx.newPage()
    await loginAsAthlete(page, ATHLETE_EMAIL, ATHLETE_PASSWORD)
    await expect(page).toHaveURL(/\/atleta\/treinos$/)
    await page.getByRole('link', { name: 'Perfil' }).click()
    await expect(page).toHaveURL(/\/atleta\/perfil$/, { timeout: 10_000 })
    await page.getByRole('link', { name: 'Treinos' }).click()
    await expect(page).toHaveURL(/\/atleta\/treinos$/, { timeout: 10_000 })
    await ctx.close()
  })
})

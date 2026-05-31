import { test, expect } from '@playwright/test'
import { execFileSync } from 'node:child_process'
import { loginAsCoach, loginAsAthlete } from '../helpers/auth'
import { signUpE2EUser } from '../helpers/supabaseSignup'

const STAMP = Date.now()
const ATHLETE_NAME = `E2E-T06D-${STAMP}`
const ATHLETE_EMAIL = `e2e-t06d-${STAMP}@cepraea.test`
const ATHLETE_PASSWORD = 'Passw0rdXy!'
const TRAINING_GENKEY = `E2E-T06D-${STAMP}`

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

async function signIn(email: string, password: string): Promise<string> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: PUBLISHABLE_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json() as { access_token?: string }
  if (!res.ok || !data.access_token) {
    throw new Error(`signIn(${email}) failed: ${JSON.stringify(data)}`)
  }
  return data.access_token
}

async function callRpc<T>(accessToken: string, fnName: string, params: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fnName}`, {
    method: 'POST',
    headers: {
      apikey: PUBLISHABLE_KEY,
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`RPC ${fnName} failed (${res.status}): ${body}`)
  }
  return res.json() as Promise<T>
}

let trainingId = ''
let athleteId = ''
let tokenLinkPath = ''

test.beforeAll(async () => {
  const esc = (s: string) => s.replaceAll("'", "''")

  runSql(`
    delete from public.trainings
      where team_id = '${TEAM_ID}' and generation_key = '${esc(TRAINING_GENKEY)}';
    delete from auth.users where email = '${esc(ATHLETE_EMAIL)}';
  `)

  const { userId } = await signUpE2EUser({
    supabaseUrl: SUPABASE_URL,
    publishableKey: PUBLISHABLE_KEY,
    email: ATHLETE_EMAIL,
    password: ATHLETE_PASSWORD,
  })

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

  // Treino para amanhã — atleta pode ainda confirmar/recusar
  runSql(`
    insert into public.trainings
      (team_id, type, status, training_date, start_time, end_time, timezone, starts_at, generation_key)
    values
      ('${TEAM_ID}', 'extra', 'agendado',
       (current_date + 1)::date, '20:00', '21:30', 'America/Sao_Paulo',
       ((current_date + 1)::date + interval '20 hours')::timestamptz,
       '${esc(TRAINING_GENKEY)}');
  `)
  trainingId = querySql(
    `select id from public.trainings
     where generation_key = '${esc(TRAINING_GENKEY)}' and team_id = '${TEAM_ID}'`
  )

  const coachToken = await signIn(process.env.E2E_COACH_EMAIL!, process.env.E2E_COACH_PASSWORD!)

  type BatchLink = { batch_id: string; athlete_id: string; token: string; link_path: string }
  const batch = await callRpc<BatchLink[]>(coachToken, 'create_presence_token_batch', {
    input_team_id: TEAM_ID,
    input_training_id: trainingId,
    input_expires_at: new Date(Date.now() + 3_600_000).toISOString(),
  })

  const link = batch.find((b) => b.athlete_id === athleteId)
  if (!link) {
    throw new Error(
      `Nenhum token gerado para athlete ${athleteId}. IDs no batch: ${batch.map((b) => b.athlete_id).join(', ')}`
    )
  }
  tokenLinkPath = link.link_path
})

test.afterAll(() => {
  const esc = (s: string) => s.replaceAll("'", "''")
  runSql(`
    delete from public.trainings where id = '${trainingId}';
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

test('token público recusa presença; convergência validada; atleta e treinador veem ausência', async ({ browser }) => {
  test.setTimeout(90_000)

  // — Passo 1: usuário anônimo recusa via link público —
  const ctxPublic = await browser.newContext({ baseURL: BASE_URL })
  const pagePublic = await ctxPublic.newPage()
  await pagePublic.goto(tokenLinkPath)
  await expect(pagePublic).toHaveURL(/confirmar-presenca\?token=/)
  await expect(pagePublic.getByText(/você vai comparecer a este treino\?/i)).toBeVisible({ timeout: 15_000 })
  const declineButton = pagePublic.getByRole('button', { name: 'Não vou', exact: true })
  await expect(declineButton).toBeVisible({ timeout: 15_000 })
  await declineButton.click()
  await expect(pagePublic.getByText(/ausência registrada/i)).toBeVisible({ timeout: 10_000 })
  await expect(pagePublic.getByText(/sua ausência foi comunicada/i)).toBeVisible({ timeout: 5_000 })
  await ctxPublic.close()

  // — Passo 2: convergência SQL — status deve ser 'ausente' —
  const status = querySql(`
    select status from public.attendance_records
    where training_id = '${trainingId}' and athlete_id = '${athleteId}'
    order by updated_at desc limit 1
  `)
  if (status !== 'ausente') {
    throw new Error(`attendance_records.status esperado 'ausente', recebido '${status}'`)
  }

  // — Passo 3: treinador vê a ausência no detalhe do treino —
  const ctxCoach = await browser.newContext({ baseURL: BASE_URL })
  const pageCoach = await ctxCoach.newPage()
  await loginAsCoach(pageCoach)
  await pageCoach.goto(`/treinos/${trainingId}`)
  await expect(pageCoach.getByText(ATHLETE_NAME)).toBeVisible({ timeout: 10_000 })
  // confirmed_by_athlete = true → badge "Atleta confirmou" aparece (independente de sim/não)
  await expect(pageCoach.getByText('Atleta confirmou')).toBeVisible({ timeout: 10_000 })
  // Status toggle mostra "Ausente" pois o atleta recusou pelo token
  await expect(pageCoach.getByRole('button', { name: 'Ausente' })).toBeVisible({ timeout: 10_000 })
  await ctxCoach.close()

  // — Passo 4: atleta autenticada vê "Não vou" ativo no app —
  const ctxAthlete = await browser.newContext({ baseURL: BASE_URL })
  const pageAthlete = await ctxAthlete.newPage()
  await loginAsAthlete(pageAthlete, ATHLETE_EMAIL, ATHLETE_PASSWORD)
  await pageAthlete.goto(`/atleta/treinos/${trainingId}`)
  // Botão "Não vou" deve estar ativo (cor red-400)
  await expect(pageAthlete.getByRole('button', { name: 'Não vou', exact: true })).toHaveClass(/border-red-400/, { timeout: 15_000 })
  await ctxAthlete.close()
})

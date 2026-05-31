import { test, expect } from '@playwright/test'
import { execFileSync } from 'node:child_process'
import { loginAsCoach, loginAsAthlete } from '../helpers/auth'
import { signUpE2EUser } from '../helpers/supabaseSignup'

const STAMP = Date.now()
const ATHLETE_NAME = `E2E-T07-${STAMP}`
const ATHLETE_EMAIL = `e2e-t07-${STAMP}@cepraea.test`
const ATHLETE_PASSWORD = 'password'
const TEAM_ID = process.env.VITE_SUPABASE_TEAM_ID!
const DB_URL = process.env.E2E_SUPABASE_DB_URL!
const SUPABASE_URL = process.env.VITE_SUPABASE_URL!
const PUBLISHABLE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!
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

test.beforeAll(async () => {
  const esc = (s: string) => s.replaceAll("'", "''")
  runSql(`delete from auth.users where email = '${esc(ATHLETE_EMAIL)}';`)
  runSql(`delete from public.athletes where team_id = '${TEAM_ID}' and email = '${esc(ATHLETE_EMAIL)}';`)
  runSql(`
    insert into public.athletes (team_id, name, email, status)
    values ('${TEAM_ID}', '${esc(ATHLETE_NAME)}', '${esc(ATHLETE_EMAIL)}', 'ativo');
  `)
  athleteId = querySql(
    `select id from public.athletes where email = '${esc(ATHLETE_EMAIL)}' and team_id = '${TEAM_ID}' order by created_at desc limit 1`
  )
})

test.afterAll(() => {
  const esc = (s: string) => s.replaceAll("'", "''")
  runSql(`
    delete from public.athletes where id = '${athleteId}';
    delete from public.profiles where id = (
      select id from auth.users where email = '${esc(ATHLETE_EMAIL)}'
      order by created_at desc limit 1
    );
    delete from auth.users where email = '${esc(ATHLETE_EMAIL)}';
  `)
})

test('vínculo de conta: não vinculada → atleta cria conta → painel mostra vinculada', async ({ browser }) => {
  test.setTimeout(90_000)

  // — Passo 1: treinador vê "não vinculada" antes do primeiro acesso —
  const ctxCoach1 = await browser.newContext({ baseURL: BASE_URL })
  const pageCoach1 = await ctxCoach1.newPage()
  await loginAsCoach(pageCoach1)
  await pageCoach1.goto(`/atletas/${athleteId}`)
  await expect(pageCoach1.getByText(/não vinculada/i)).toBeVisible({ timeout: 10_000 })
  await ctxCoach1.close()

  // — Passo 2: atleta cria conta via Supabase Auth signup —
  const { userId } = await signUpE2EUser({
    supabaseUrl: SUPABASE_URL,
    publishableKey: PUBLISHABLE_KEY,
    email: ATHLETE_EMAIL,
    password: ATHLETE_PASSWORD,
  })

  const esc = (s: string) => s.replaceAll("'", "''")
  runSql(`
    insert into public.profiles (id, name, email)
    values ('${userId}', '${esc(ATHLETE_NAME)}', '${esc(ATHLETE_EMAIL)}')
    on conflict (id) do update set name = excluded.name, email = excluded.email;
  `)

  // — Passo 3: atleta faz primeiro login — AtletaGuard chama link_athlete_user_id RPC —
  const ctxAthlete = await browser.newContext({ baseURL: BASE_URL })
  const pageAthlete = await ctxAthlete.newPage()
  await loginAsAthlete(pageAthlete, ATHLETE_EMAIL, ATHLETE_PASSWORD)
  await expect(pageAthlete.getByText(/Olá,/i)).toBeVisible({ timeout: 20_000 })
  await ctxAthlete.close()

  // — Passo 4: SQL convergence — AtletaGuard chama link_athlete_user_id de forma assíncrona;
  // waitForURL resolve quando navigate() é chamado em AtletaLoginPage, antes do RPC terminar.
  // Polling de até 10 s garante que o resultado seja lido após a escrita.
  let linkedUserId = ''
  for (let attempt = 0; attempt < 20; attempt++) {
    linkedUserId = querySql(`select user_id from public.athletes where id = '${athleteId}'`)
    if (linkedUserId) break
    await new Promise((r) => setTimeout(r, 500))
  }
  if (!linkedUserId) {
    throw new Error(`user_id não foi vinculado após o primeiro login (10 s timeout)`)
  }
  if (linkedUserId !== userId) {
    throw new Error(`user_id vinculado (${linkedUserId}) ≠ auth user_id (${userId})`)
  }

  // — Passo 5: treinador vê "vinculada" no painel —
  const ctxCoach2 = await browser.newContext({ baseURL: BASE_URL })
  const pageCoach2 = await ctxCoach2.newPage()
  await loginAsCoach(pageCoach2)
  await pageCoach2.goto(`/atletas/${athleteId}`)
  await expect(pageCoach2.getByText(/vinculada/i)).toBeVisible({ timeout: 10_000 })
  await expect(pageCoach2.getByText(/não vinculada/i)).not.toBeVisible()
  await ctxCoach2.close()
})

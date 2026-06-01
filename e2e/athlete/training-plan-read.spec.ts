import { test, expect } from '@playwright/test'
import { execFileSync } from 'node:child_process'
import { loginAsAthlete } from '../helpers/auth'
import { signUpE2EUser } from '../helpers/supabaseSignup'

const STAMP = Date.now()
const ATHLETE_NAME = `E2E-PLAN-READ-${STAMP}`
const ATHLETE_EMAIL = `e2e-plan-read-${STAMP}@cepraea.test`
const ATHLETE_PASSWORD = 'Passw0rdXy!'
const GENKEY = `E2E-PLAN-READ-${STAMP}`

const DB_URL = process.env.E2E_SUPABASE_DB_URL!
const SUPABASE_URL = process.env.VITE_SUPABASE_URL!
const PUBLISHABLE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!
const TEAM_ID = process.env.VITE_SUPABASE_TEAM_ID!

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
let trainingId = ''
let planId = ''

test.describe('CEPR-MVP-PR-A — Plano de treino (atleta lê)', () => {
  test.beforeAll(async () => {
    const esc = (s: string) => s.replaceAll("'", "''")

    runSql(`
      delete from public.trainings where generation_key = '${GENKEY}' and team_id = '${TEAM_ID}';
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
      `select id from public.athletes where email = '${esc(ATHLETE_EMAIL)}' and team_id = '${TEAM_ID}' order by created_at desc limit 1`
    )

    runSql(`
      insert into public.trainings
        (team_id, type, status, training_date, start_time, end_time, timezone, starts_at, generation_key)
      values
        ('${TEAM_ID}', 'extra', 'agendado',
         (current_date + 2)::date, '19:00', '20:30', 'America/Sao_Paulo',
         ((current_date + 2)::date + interval '19 hours')::timestamptz,
         '${GENKEY}');
    `)
    trainingId = querySql(`select id from public.trainings where generation_key = '${GENKEY}' and team_id = '${TEAM_ID}'`)

    // Plano publicado com bloco + exercício.
    runSql(`
      insert into public.training_plans (team_id, training_id, objetivo_principal, published_at)
      values ('${TEAM_ID}', '${trainingId}', 'Trabalhar transição rápida', now());
    `)
    planId = querySql(`select id from public.training_plans where training_id = '${trainingId}'`)
    runSql(`
      with b as (
        insert into public.training_plan_blocks (training_plan_id, ordem, objetivo_especifico)
        values ('${planId}', 0, 'Aquecimento')
        returning id
      )
      insert into public.training_plan_exercises (training_plan_block_id, ordem, descricao)
      select id, 0, 'Corrida 5min em linha lateral' from b;
    `)
  })

  test.afterAll(() => {
    const esc = (s: string) => s.replaceAll("'", "''")
    runSql(`
      delete from public.training_plans where training_id = '${trainingId}';
      delete from public.attendance_records where athlete_id = '${athleteId}';
      delete from public.trainings where id = '${trainingId}';
      delete from public.athletes where id = '${athleteId}';
      delete from public.profiles where id = (select id from auth.users where email = '${esc(ATHLETE_EMAIL)}' order by created_at desc limit 1);
      delete from auth.users where email = '${esc(ATHLETE_EMAIL)}';
    `)
  })

  test('atleta vê o plano publicado em /atleta/treinos/:id', async ({ page }) => {
    test.setTimeout(60_000)
    await loginAsAthlete(page, ATHLETE_EMAIL, ATHLETE_PASSWORD)
    await page.goto(`/atleta/treinos/${trainingId}`)

    const view = page.getByTestId('plan-read-view')
    await expect(view).toBeVisible({ timeout: 15_000 })
    await expect(view).toContainText('Trabalhar transição rápida')
    await expect(view).toContainText('Aquecimento')
    await expect(view).toContainText('Corrida 5min em linha lateral')

    // Não deve mostrar empty state quando publicado
    await expect(page.getByTestId('plan-read-empty')).toHaveCount(0)
  })
})

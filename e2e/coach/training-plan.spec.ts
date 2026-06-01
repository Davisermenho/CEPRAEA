import { test, expect } from '@playwright/test'
import { execFileSync } from 'node:child_process'
import { loginAsCoach } from '../helpers/auth'

const STAMP = Date.now()
const GEN_KEY = `E2E-PLAN-${STAMP}`
const TEAM_ID = process.env.VITE_SUPABASE_TEAM_ID ?? '10000000-0000-0000-0000-000000000001'
const DB_URL = process.env.E2E_SUPABASE_DB_URL ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'

function psql(sql: string): string {
  return execFileSync('psql', [DB_URL, '-t', '-A', '-c', sql], {
    stdio: ['pipe', 'pipe', 'inherit'],
  }).toString().trim()
}

let trainingId = ''

test.describe('CEPR-MVP-PR-A — Plano de treino (coach)', () => {
  test.beforeAll(() => {
    psql(`
      delete from public.trainings
        where team_id = '${TEAM_ID}' and generation_key = '${GEN_KEY}';
    `)
    trainingId = psql(`
      insert into public.trainings (
        team_id, type, status, training_date, start_time, end_time, timezone,
        starts_at, presence_lock_at, generation_key
      ) values (
        '${TEAM_ID}', 'extra', 'agendado',
        (current_date + 7), '20:00', '21:30', 'America/Sao_Paulo',
        ((current_date + 7)::timestamp + interval '20 hours') at time zone 'America/Sao_Paulo',
        ((current_date + 7)::timestamp + interval '14 hours') at time zone 'America/Sao_Paulo',
        '${GEN_KEY}'
      )
      returning id;
    `)
    expect(trainingId).toMatch(/^[0-9a-f-]{36}$/)
  })

  test.afterAll(() => {
    psql(`delete from public.trainings where id = '${trainingId}';`)
  })

  test('coach cria, edita e publica plano do dia', async ({ page }) => {
    test.setTimeout(60_000)

    await loginAsCoach(page)
    await page.goto(`/treinos/${trainingId}`)

    // Cria o plano
    const createBtn = page.getByTestId('plan-create')
    await expect(createBtn).toBeVisible({ timeout: 15_000 })
    await createBtn.click()

    const editor = page.getByTestId('training-plan-editor')
    await expect(editor).toBeVisible({ timeout: 10_000 })

    // Define objetivo principal
    const objetivo = editor.getByTestId('plan-objetivo-principal')
    await objetivo.fill('Trabalhar transição rápida em superioridade')
    await objetivo.blur()

    // Adiciona um bloco
    await editor.getByTestId('plan-add-block').click()
    const block = editor.getByTestId('plan-block').first()
    await expect(block).toBeVisible()
    await block.getByTestId('plan-block-objetivo').fill('Aquecimento')
    await block.getByTestId('plan-block-objetivo').blur()

    // Adiciona exercício
    await block.getByTestId('plan-add-exercise').click()
    const exercise = block.getByTestId('plan-exercise').first()
    await expect(exercise).toBeVisible()
    const exDescricao = exercise.getByTestId('plan-exercise-descricao')
    await exDescricao.fill('Corrida 5min em linha lateral')
    await exDescricao.blur()

    // Publica
    await editor.getByTestId('plan-publish-toggle').click()
    await expect(editor.getByText(/Publicado em/)).toBeVisible({ timeout: 10_000 })

    // Verifica persistência via banco
    const cnt = psql(`
      select
        (select count(*) from public.training_plans where training_id = '${trainingId}' and published_at is not null)::text || ',' ||
        (select count(*) from public.training_plan_blocks b
           join public.training_plans tp on tp.id = b.training_plan_id
          where tp.training_id = '${trainingId}')::text || ',' ||
        (select count(*) from public.training_plan_exercises e
           join public.training_plan_blocks b on b.id = e.training_plan_block_id
           join public.training_plans tp on tp.id = b.training_plan_id
          where tp.training_id = '${trainingId}')::text;
    `)
    expect(cnt).toBe('1,1,1')
  })
})

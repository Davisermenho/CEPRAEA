import { test, expect } from '@playwright/test'
import { execFileSync } from 'node:child_process'
import { loginAsCoach } from '../helpers/auth'

const STAMP = Date.now()
const ATHLETE_NAME = `E2E-T05-${STAMP}`
const ATHLETE_EMAIL = `e2e-t05-${STAMP}@cepraea.test`
const TRAINING_OBS = `E2E-T05-Treino-${STAMP}`
const TEAM_ID = process.env.VITE_SUPABASE_TEAM_ID ?? '10000000-0000-0000-0000-000000000001'
const DB_URL = process.env.E2E_SUPABASE_DB_URL ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'
const BASE_URL = 'http://localhost:5173'

function psql(sql: string) {
  execFileSync('psql', [DB_URL, '-v', 'ON_ERROR_STOP=1'], {
    input: sql,
    stdio: ['pipe', 'inherit', 'inherit'],
  })
}

test.describe('T05 — attendanceStore Supabase-first: prova multi-contexto', () => {
  test.beforeAll(() => {
    // Garante idempotência: remove eventuais restos de execuções anteriores
    psql(`DELETE FROM public.athletes WHERE team_id = '${TEAM_ID}' AND lower(email) = lower('${ATHLETE_EMAIL}');`)
    psql(`
      INSERT INTO public.athletes (team_id, name, email, status, created_at, updated_at)
      VALUES ('${TEAM_ID}', '${ATHLETE_NAME}', '${ATHLETE_EMAIL}', 'ativo', now(), now());
    `)
  })

  test.afterAll(() => {
    psql(`
      DELETE FROM public.attendance_records ar
      USING public.trainings t
      WHERE ar.training_id = t.id
        AND t.notes = '${TRAINING_OBS}'
        AND t.team_id = '${TEAM_ID}';
      DELETE FROM public.trainings WHERE team_id = '${TEAM_ID}' AND notes = '${TRAINING_OBS}';
      DELETE FROM public.athletes WHERE team_id = '${TEAM_ID}' AND lower(email) = lower('${ATHLETE_EMAIL}');
    `)
  })

  test('presença marcada no contexto A é visível no contexto B sem IndexedDB compartilhado', async ({ browser }) => {
    // ── Contexto A: cria treino e marca presença ─────────────────────────────
    const ctxA = await browser.newContext({ baseURL: BASE_URL })
    const pageA = await ctxA.newPage()

    await loginAsCoach(pageA)
    await pageA.goto('/treinos')
    await pageA.getByRole('button', { name: 'Extra', exact: true }).click()
    await pageA.getByPlaceholder('Ex: Treino especial de condicionamento').fill(TRAINING_OBS)
    await pageA.getByRole('button', { name: 'Criar Treino' }).click()
    await expect(pageA.getByText(TRAINING_OBS)).toBeVisible({ timeout: 15_000 })

    // Navega para o detalhe do treino (SPA navigation — captura a URL gerada)
    await pageA.getByRole('button', { name: TRAINING_OBS, exact: false }).click()
    await pageA.waitForURL(/\/treinos\/[^/]+$/, { timeout: 10_000 })
    const trainingUrl = pageA.url()

    // Confirma que a atleta criada via psql aparece na chamada
    await expect(pageA.getByText(ATHLETE_NAME)).toBeVisible({ timeout: 10_000 })

    // Marca todos como presentes
    await pageA.getByRole('button', { name: /todos presentes/i }).click()

    // Aguarda o resumo estabilizar com todos presentes (prova que os RPCs escreveram no Supabase)
    const presentesLabelA = pageA.getByText('Presentes', { exact: true })
    const presentesValueA = presentesLabelA.locator('..').locator('p').first()
    // Frequência = 100% quando todos estão presentes — indica que o upsert completou
    await expect(pageA.getByText('100%')).toBeVisible({ timeout: 15_000 })
    const expectedCount = await presentesValueA.textContent()

    await ctxA.close()

    // Marca o treino como realizado para que apareça nos relatórios
    psql(`UPDATE public.trainings SET status = 'realizado' WHERE team_id = '${TEAM_ID}' AND notes = '${TRAINING_OBS}';`)

    // ── Contexto B: navegador limpo, sem IndexedDB do contexto A ─────────────
    const ctxB = await browser.newContext({ baseURL: BASE_URL })
    const pageB = await ctxB.newPage()

    await loginAsCoach(pageB)
    // page.goto() com URL completa força recarga → bootstrap lê sessão + busca dados do Supabase
    await pageB.goto(trainingUrl)

    const presentesLabelB = pageB.getByText('Presentes', { exact: true })
    const presentesValueB = presentesLabelB.locator('..').locator('p').first()
    // Contexto B deve mostrar o mesmo número de presenças que o contexto A gravou
    await expect(presentesValueB).toHaveText(expectedCount ?? '', { timeout: 15_000 })

    // ── Relatórios: a atleta do T05 deve aparecer com presença contabilizada ─
    await pageB.goto('/relatorios')
    await expect(pageB.getByText(ATHLETE_NAME)).toBeVisible({ timeout: 10_000 })
    const athleteRow = pageB.locator('div.grid').filter({ hasText: ATHLETE_NAME })
    // A coluna "Pres." (verde, nth(2)) deve ser ≥ 1 para o treino realizado
    const presentesCell = athleteRow.locator('span').nth(2)
    await expect(presentesCell).not.toHaveText('0', { timeout: 10_000 })

    await ctxB.close()
  })
})

import { test, expect } from '@playwright/test'
import { execFileSync } from 'node:child_process'
import { loginAsCoach } from '../helpers/auth'

const STAMP = Date.now()
const UNIQUE_OBS = `E2E-T04-${STAMP}`
const TEAM_ID = process.env.VITE_SUPABASE_TEAM_ID ?? '10000000-0000-0000-0000-000000000001'
const DB_URL = process.env.E2E_SUPABASE_DB_URL ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'
const BASE_URL = 'http://localhost:5173'

function psql(sql: string) {
  execFileSync('psql', [DB_URL, '-v', 'ON_ERROR_STOP=1'], {
    input: sql,
    stdio: ['pipe', 'inherit', 'inherit'],
  })
}

test.describe('T04 — trainingStore Supabase-first: prova multi-contexto', () => {
  test.afterAll(() => {
    psql(`DELETE FROM public.trainings WHERE team_id = '${TEAM_ID}' AND notes = '${UNIQUE_OBS}';`)
  })

  test('treino criado no contexto A é visível no contexto B sem IndexedDB compartilhado', async ({ browser }) => {
    test.setTimeout(60_000)

    // ── Contexto A: cria o treino via UI ────────────────────────────────────
    const ctxA = await browser.newContext({ baseURL: BASE_URL })
    const pageA = await ctxA.newPage()

    await loginAsCoach(pageA)
    await pageA.goto('/treinos')
    await pageA.getByRole('button', { name: 'Extra', exact: true }).click()
    // Usa o campo "Observações" como identificador único
    await pageA.getByPlaceholder('Ex: Treino especial de condicionamento').fill(UNIQUE_OBS)
    await pageA.getByRole('button', { name: 'Criar Treino' }).click()
    // Treino agendado para hoje aparece no filtro "Próximos" (padrão)
    await expect(pageA.getByText(UNIQUE_OBS)).toBeVisible({ timeout: 15_000 })

    await ctxA.close()

    // ── Contexto B: navegador limpo, sem IndexedDB do contexto A ────────────
    const ctxB = await browser.newContext({ baseURL: BASE_URL })
    const pageB = await ctxB.newPage()

    await loginAsCoach(pageB)
    await pageB.goto('/treinos')
    await expect(pageB.getByText(UNIQUE_OBS)).toBeVisible({ timeout: 15_000 })

    await ctxB.close()
  })
})

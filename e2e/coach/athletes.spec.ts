import { test, expect } from '@playwright/test'
import { execFileSync } from 'node:child_process'
import { loginAsCoach } from '../helpers/auth'

// Unique per run — prevents collision between parallel CI jobs or local re-runs
const STAMP = Date.now()
const UNIQUE_NAME = `E2E-T03-${STAMP}`
const UNIQUE_EMAIL = `e2e-t03-${STAMP}@cepraea.test`
const TEAM_ID = process.env.VITE_SUPABASE_TEAM_ID ?? '10000000-0000-0000-0000-000000000001'
const DB_URL = process.env.E2E_SUPABASE_DB_URL ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'
const BASE_URL = 'http://localhost:5173'

function psql(sql: string) {
  execFileSync('psql', [DB_URL, '-v', 'ON_ERROR_STOP=1'], {
    input: sql,
    stdio: ['pipe', 'inherit', 'inherit'],
  })
}

test.describe('T03 — athleteStore Supabase-first: prova multi-contexto', () => {
  test.beforeAll(() => {
    // Clean up any leftover from a previous failed run
    psql(`DELETE FROM public.athletes WHERE team_id = '${TEAM_ID}' AND lower(email) = lower('${UNIQUE_EMAIL}');`)
  })

  test.afterAll(() => {
    psql(`DELETE FROM public.athletes WHERE team_id = '${TEAM_ID}' AND lower(email) = lower('${UNIQUE_EMAIL}');`)
  })

  test('atleta criada no contexto A é visível no contexto B sem IndexedDB compartilhado', async ({ browser }) => {
    // ── Contexto A: cria a atleta via UI ────────────────────────────────────
    const ctxA = await browser.newContext({ baseURL: BASE_URL })
    const pageA = await ctxA.newPage()

    await loginAsCoach(pageA)
    // page.goto() força recarga completa; o bootstrap re-executa com a sessão já em localStorage
    await pageA.goto('/atletas')
    await pageA.getByRole('button', { name: 'Nova' }).click()
    await pageA.getByPlaceholder('Nome completo').fill(UNIQUE_NAME)
    await pageA.getByPlaceholder('atleta@email.com').fill(UNIQUE_EMAIL)
    await pageA.getByRole('button', { name: 'Salvar' }).click()
    // Aguarda confirmação visual de que o registro foi persistido
    await expect(pageA.getByText(UNIQUE_NAME)).toBeVisible({ timeout: 15_000 })

    await ctxA.close()

    // ── Contexto B: navegador limpo, sem IndexedDB do contexto A ────────────
    const ctxB = await browser.newContext({ baseURL: BASE_URL })
    const pageB = await ctxB.newPage()

    await loginAsCoach(pageB)
    // page.goto() força recarga completa → bootstrap lê a sessão do localStorage
    // e busca atletas do Supabase — não do IndexedDB do contexto A
    await pageB.goto('/atletas')
    await expect(pageB.getByText(UNIQUE_NAME)).toBeVisible({ timeout: 15_000 })

    await ctxB.close()
  })
})

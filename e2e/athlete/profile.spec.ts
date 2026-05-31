import { test, expect } from '@playwright/test'
import { execFileSync } from 'node:child_process'
import { loginAsAthlete } from '../helpers/auth'
import { signUpE2EUser } from '../helpers/supabaseSignup'

const STAMP = Date.now()
const ATHLETE_NAME = `E2E-PF-${STAMP}`
const ATHLETE_EMAIL = `e2e-pf-${STAMP}@cepraea.test`
const ATHLETE_PASSWORD = 'Passw0rdXy!'

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

test.beforeAll(async () => {
  const esc = (s: string) => s.replaceAll("'", "''")

  runSql(`delete from auth.users where email = '${esc(ATHLETE_EMAIL)}';`)

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

    insert into public.athletes
      (team_id, user_id, name, email, phone, status)
    values
      ('${TEAM_ID}', '${userId}', '${esc(ATHLETE_NAME)}', '${esc(ATHLETE_EMAIL)}',
       '21987654321', 'ativo');
  `)

  athleteId = querySql(
    `select id from public.athletes
     where email = '${esc(ATHLETE_EMAIL)}' and team_id = '${TEAM_ID}'
     order by created_at desc limit 1`
  )
})

test.afterAll(() => {
  const esc = (s: string) => s.replaceAll("'", "''")
  runSql(`
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

test.describe('Perfil da atleta', () => {
  test('exibe nome, email e status Ativa', async ({ browser }) => {
    const ctx = await browser.newContext({ baseURL: BASE_URL })
    const page = await ctx.newPage()
    await loginAsAthlete(page, ATHLETE_EMAIL, ATHLETE_PASSWORD)
    await page.getByRole('link', { name: 'Perfil' }).click()
    await page.waitForURL(/\/atleta\/perfil$/, { timeout: 10_000 })
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(ATHLETE_NAME, { timeout: 10_000 })
    await expect(page.getByText(ATHLETE_EMAIL)).toBeVisible()
    await expect(page.getByText('Ativa')).toBeVisible()
    await ctx.close()
  })

  test('exibe telefone formatado', async ({ browser }) => {
    const ctx = await browser.newContext({ baseURL: BASE_URL })
    const page = await ctx.newPage()
    await loginAsAthlete(page, ATHLETE_EMAIL, ATHLETE_PASSWORD)
    await page.goto('/atleta/perfil')
    // DB: '21987654321' → formatPhone(11 dígitos) → '(21) 98765-4321'
    await expect(page.getByText('(21) 98765-4321')).toBeVisible({ timeout: 10_000 })
    await ctx.close()
  })

  test('não depende de Categoria e Nível para exibir o perfil da atleta', async ({ browser }) => {
    const ctx = await browser.newContext({ baseURL: BASE_URL })
    const page = await ctx.newPage()
    await loginAsAthlete(page, ATHLETE_EMAIL, ATHLETE_PASSWORD)
    await page.goto('/atleta/perfil')
    await expect(page.getByText('Categoria')).not.toBeVisible()
    await expect(page.getByText('Nível')).not.toBeVisible()
    await expect(page.getByText('Ativa')).toBeVisible()
    await ctx.close()
  })

  test('botão Receber link para nova senha exibe feedback de sucesso', async ({ browser }) => {
    const ctx = await browser.newContext({ baseURL: BASE_URL })
    const page = await ctx.newPage()
    await loginAsAthlete(page, ATHLETE_EMAIL, ATHLETE_PASSWORD)
    await page.goto('/atleta/perfil')
    await expect(page.getByRole('button', { name: /receber link para nova senha/i })).toBeVisible({ timeout: 10_000 })
    await page.getByRole('button', { name: /receber link para nova senha/i }).click()
    // Supabase local aceita a chamada — feedback de sucesso deve aparecer
    await expect(page.getByText(/email de redefinição enviado/i)).toBeVisible({ timeout: 10_000 })
    await ctx.close()
  })

  test('logout redireciona para /welcome com opções de atleta e treinador', async ({ browser }) => {
    const ctx = await browser.newContext({ baseURL: BASE_URL })
    const page = await ctx.newPage()
    await loginAsAthlete(page, ATHLETE_EMAIL, ATHLETE_PASSWORD)
    await page.goto('/atleta/perfil')
    await page.getByRole('button', { name: /sair/i }).click()
    await page.waitForURL(/\/welcome$/, { timeout: 10_000 })
    await expect(page.getByRole('link', { name: /sou atleta/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /sou treinador/i })).toBeVisible()
    await ctx.close()
  })
})

test.describe('Página nova senha — validações de formulário', () => {
  // A página /atleta/nova-senha mostra o formulário se há sessão ativa.
  // Testamos apenas as validações client-side (sem alterar senha real).

  test('senha curta exibe erro de validação', async ({ browser }) => {
    const ctx = await browser.newContext({ baseURL: BASE_URL })
    const page = await ctx.newPage()
    await loginAsAthlete(page, ATHLETE_EMAIL, ATHLETE_PASSWORD)
    await page.goto('/atleta/nova-senha')
    // Com sessão ativa, getSession() seta ready=true → formulário aparece
    await expect(page.locator('#nova-senha')).toBeVisible({ timeout: 10_000 })
    await page.locator('#nova-senha').fill('abc')
    await page.locator('#confirmar-senha').fill('abc')
    await page.getByRole('button', { name: /salvar nova senha/i }).click()
    await expect(page.getByText(/senha deve ter pelo menos 6 caracteres/i)).toBeVisible({ timeout: 5_000 })
    await ctx.close()
  })

  test('senhas diferentes exibem erro de confirmação', async ({ browser }) => {
    const ctx = await browser.newContext({ baseURL: BASE_URL })
    const page = await ctx.newPage()
    await loginAsAthlete(page, ATHLETE_EMAIL, ATHLETE_PASSWORD)
    await page.goto('/atleta/nova-senha')
    await expect(page.locator('#nova-senha')).toBeVisible({ timeout: 10_000 })
    await page.locator('#nova-senha').fill('senha123')
    await page.locator('#confirmar-senha').fill('outrasenha')
    await page.getByRole('button', { name: /salvar nova senha/i }).click()
    await expect(page.getByText(/as senhas não coincidem/i)).toBeVisible({ timeout: 5_000 })
    await ctx.close()
  })

  test('botão olho alterna visibilidade da senha', async ({ browser }) => {
    const ctx = await browser.newContext({ baseURL: BASE_URL })
    const page = await ctx.newPage()
    await loginAsAthlete(page, ATHLETE_EMAIL, ATHLETE_PASSWORD)
    await page.goto('/atleta/nova-senha')
    await expect(page.locator('#nova-senha')).toBeVisible({ timeout: 10_000 })
    // Campo começa como password
    await expect(page.locator('#nova-senha')).toHaveAttribute('type', 'password')
    // Clica no botão de olho (aria-label dinâmico)
    await page.getByRole('button', { name: /mostrar senha/i }).click()
    await expect(page.locator('#nova-senha')).toHaveAttribute('type', 'text')
    // Clica novamente para ocultar
    await page.getByRole('button', { name: /ocultar senha/i }).click()
    await expect(page.locator('#nova-senha')).toHaveAttribute('type', 'password')
    await ctx.close()
  })
})

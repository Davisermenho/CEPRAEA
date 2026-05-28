// CEPR-AUTH-01: Owner provisioning helper for E2E tests.
// Creates a fresh auth user with no team membership (to test onboarding flow)
// or with owner role (to test coach invite flow).

import { execFileSync } from 'node:child_process'

function sqlLiteral(value: string): string {
  return value.replaceAll("'", "''")
}

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required E2E env: ${name}`)
  return value
}

function runSql(databaseUrl: string, sql: string) {
  execFileSync('psql', [databaseUrl, '-v', 'ON_ERROR_STOP=1'], {
    input: sql,
    stdio: ['pipe', 'inherit', 'inherit'],
  })
}

export interface OwnerContext {
  databaseUrl: string
  ownerEmail: string
  ownerPassword: string
  supabaseUrl: string
  publishableKey: string
  teamId: string
}

export function readOwnerContext(): OwnerContext {
  return {
    databaseUrl:    requireEnv('DATABASE_URL'),
    ownerEmail:     requireEnv('OWNER_EMAIL'),
    ownerPassword:  requireEnv('OWNER_PASSWORD'),
    supabaseUrl:    requireEnv('VITE_SUPABASE_URL'),
    publishableKey: requireEnv('VITE_SUPABASE_PUBLISHABLE_KEY'),
    teamId:         requireEnv('VITE_SUPABASE_TEAM_ID'),
  }
}

async function signUp(ctx: OwnerContext): Promise<string> {
  const response = await fetch(`${ctx.supabaseUrl}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: ctx.publishableKey,
    },
    body: JSON.stringify({ email: ctx.ownerEmail, password: ctx.ownerPassword }),
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Owner signup failed: ${text}`)
  }
  const json = await response.json() as { user?: { id: string } }
  if (!json.user?.id) throw new Error('Owner signup: no user.id in response')
  return json.user.id
}

export async function provisionOwner(ctx: OwnerContext): Promise<void> {
  await cleanupOwner(ctx)
  const userId = await signUp(ctx)

  const email = sqlLiteral(ctx.ownerEmail)
  const teamId = sqlLiteral(ctx.teamId)
  const uid = sqlLiteral(userId)

  // Insert profile and owner team_members row.
  runSql(
    ctx.databaseUrl,
    `
    insert into public.profiles (id, email) values ('${uid}', '${email}')
    on conflict (id) do nothing;

    insert into public.team_members (team_id, user_id, role)
    values ('${teamId}', '${uid}', 'owner')
    on conflict (team_id, user_id) do nothing;
    `
  )
}

export async function cleanupOwner(ctx: OwnerContext): Promise<void> {
  const email = sqlLiteral(ctx.ownerEmail)
  runSql(
    ctx.databaseUrl,
    `
    delete from public.team_members
    where user_id = (select id from auth.users where email = '${email}');
    delete from public.profiles
    where id = (select id from auth.users where email = '${email}');
    delete from auth.users where email = '${email}';
    `
  )
}

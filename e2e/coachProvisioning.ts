import { execFileSync } from 'node:child_process'
import { mkdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const PROVISION_LOCK_DIR = join(tmpdir(), 'cepraea-e2e-provision.lock')
const PROVISION_LOCK_ATTEMPTS = 120
const PROVISION_LOCK_WAIT_MS = 250

function sqlLiteral(value: string): string {
  return value.replaceAll("'", "''")
}

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required E2E env: ${name}`)
  }
  return value
}

function runSql(databaseUrl: string, sql: string) {
  execFileSync('psql', [databaseUrl, '-v', 'ON_ERROR_STOP=1'], {
    input: sql,
    stdio: ['pipe', 'inherit', 'inherit'],
  })
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function withProvisionLock<T>(fn: () => Promise<T>): Promise<T> {
  for (let attempt = 0; attempt < PROVISION_LOCK_ATTEMPTS; attempt += 1) {
    try {
      await mkdir(PROVISION_LOCK_DIR)
      break
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'EEXIST'
      ) {
        await sleep(PROVISION_LOCK_WAIT_MS)
        continue
      }
      throw error
    }
  }

  try {
    return await fn()
  } finally {
    await rm(PROVISION_LOCK_DIR, { recursive: true, force: true })
  }
}

export interface CoachContext {
  databaseUrl: string
  coachEmail: string
  coachPassword: string
  supabaseUrl: string
  publishableKey: string
  teamId: string
}

export function readCoachContext(): CoachContext {
  return {
    databaseUrl: requireEnv('E2E_SUPABASE_DB_URL'),
    coachEmail: requireEnv('E2E_COACH_EMAIL'),
    coachPassword: requireEnv('E2E_COACH_PASSWORD'),
    supabaseUrl: requireEnv('VITE_SUPABASE_URL'),
    publishableKey: requireEnv('VITE_SUPABASE_PUBLISHABLE_KEY'),
    teamId: requireEnv('VITE_SUPABASE_TEAM_ID'),
  }
}

export async function cleanupCoach(context: CoachContext) {
  await withProvisionLock(async () => {
    const coachEmail = sqlLiteral(context.coachEmail)
    runSql(context.databaseUrl, `
do $$
declare
  v_user_id uuid;
begin
  select id into v_user_id
  from auth.users
  where email = '${coachEmail}'
  order by created_at desc
  limit 1;

  if v_user_id is not null then
    delete from public.presence_token_batches where created_by = v_user_id;
    delete from public.team_members where user_id = v_user_id;
    delete from public.audit_logs where actor_user_id = v_user_id;
    delete from public.profiles where id = v_user_id;
    delete from auth.users where id = v_user_id;
  end if;
end $$;
`)
  })
}

export async function provisionCoach(context: CoachContext) {
  await withProvisionLock(async () => {
    const coachEmail = sqlLiteral(context.coachEmail)
    runSql(context.databaseUrl, `
do $$
declare
  v_user_id uuid;
begin
  select id into v_user_id
  from auth.users
  where email = '${coachEmail}'
  order by created_at desc
  limit 1;

  if v_user_id is not null then
    delete from public.presence_token_batches where created_by = v_user_id;
    delete from public.team_members where user_id = v_user_id;
    delete from public.audit_logs where actor_user_id = v_user_id;
    delete from public.profiles where id = v_user_id;
    delete from auth.users where id = v_user_id;
  end if;
end $$;
`)

    const response = await fetch(`${context.supabaseUrl}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        apikey: context.publishableKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: context.coachEmail,
        password: context.coachPassword,
      }),
    })

    const payload = await response.json() as { msg?: string; user?: { id?: string } }
    const userId = payload.user?.id

    if (!response.ok || !userId) {
      const detail = payload.msg ?? 'signup failed without user id'
      throw new Error(`Failed to provision E2E coach: ${response.status} ${detail}`)
    }

    const userIdSql = sqlLiteral(userId)
    const teamId = sqlLiteral(context.teamId)

    runSql(context.databaseUrl, `
insert into public.profiles (id, name, email)
values ('${userIdSql}', 'Coach E2E', '${coachEmail}')
on conflict (id) do update
set name = excluded.name,
    email = excluded.email;

insert into public.team_members (team_id, user_id, role)
values ('${teamId}', '${userIdSql}', 'coach')
on conflict (team_id, user_id) do update
set role = excluded.role;
`)
  })
}

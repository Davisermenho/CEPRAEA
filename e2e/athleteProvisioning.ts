// CEPR-AUTH-01: Athlete provisioning helper for E2E tests.
// Creates an athlete record in the DB and an auth.users account for them.

import { execFileSync } from 'node:child_process'
import { signUpE2EUser } from './helpers/supabaseSignup'

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

export interface AthleteContext {
  databaseUrl: string
  athleteEmail: string
  athletePassword: string
  supabaseUrl: string
  publishableKey: string
  teamId: string
}

export function readAthleteContext(): AthleteContext {
  return {
    databaseUrl:    requireEnv('DATABASE_URL'),
    athleteEmail:   requireEnv('ATHLETE_EMAIL'),
    athletePassword: requireEnv('ATHLETE_PASSWORD'),
    supabaseUrl:    requireEnv('VITE_SUPABASE_URL'),
    publishableKey: requireEnv('VITE_SUPABASE_PUBLISHABLE_KEY'),
    teamId:         requireEnv('VITE_SUPABASE_TEAM_ID'),
  }
}

async function signUp(ctx: AthleteContext): Promise<string> {
  const { userId } = await signUpE2EUser({
    supabaseUrl: ctx.supabaseUrl,
    publishableKey: ctx.publishableKey,
    email: ctx.athleteEmail,
    password: ctx.athletePassword,
  })
  return userId
}

export async function provisionAthlete(ctx: AthleteContext): Promise<string> {
  await cleanupAthlete(ctx)

  const email = sqlLiteral(ctx.athleteEmail)
  const teamId = sqlLiteral(ctx.teamId)

  // Insert athlete record without user_id (simulates pre-existing DB record).
  let athleteId = ''
  const result = execFileSync('psql', [ctx.databaseUrl, '-v', 'ON_ERROR_STOP=1', '-t', '-A'], {
    input: `
      insert into public.athletes (team_id, name, email, status)
      values ('${teamId}', 'Atleta Teste E2E', '${email}', 'ativo')
      returning id;
    `,
    stdio: ['pipe', 'pipe', 'inherit'],
  })
  athleteId = result.toString().trim()

  // Create auth.users entry so the athlete can log in.
  await signUp(ctx)

  return athleteId
}

export async function cleanupAthlete(ctx: AthleteContext): Promise<void> {
  const email = sqlLiteral(ctx.athleteEmail)
  runSql(
    ctx.databaseUrl,
    `
    update public.athletes set user_id = null
    where lower(email) = lower('${email}');
    delete from public.athletes
    where lower(email) = lower('${email}')
      and name = 'Atleta Teste E2E';
    delete from public.profiles
    where id = (select id from auth.users where lower(email) = lower('${email}'));
    delete from auth.users where lower(email) = lower('${email}');
    `
  )
}

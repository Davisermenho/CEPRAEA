#!/usr/bin/env node
/**
 * Import legacy JSON backup into Supabase.
 *
 * Usage:
 *   node scripts/import-legacy-json-to-supabase.mjs <file.json> --dry-run
 *   node scripts/import-legacy-json-to-supabase.mjs <file.json> --apply
 *
 * Environment (loaded from .env.test if present, overridden by shell):
 *   SUPABASE_DB_URL      — direct postgresql:// connection string (production)
 *   E2E_SUPABASE_DB_URL  — fallback for local dev
 *   VITE_SUPABASE_TEAM_ID — target team UUID
 */

import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.test') })

// ── Env ──────────────────────────────────────────────────────────────────────

const DB_URL = process.env.SUPABASE_DB_URL ?? process.env.E2E_SUPABASE_DB_URL
const TEAM_ID = process.env.VITE_SUPABASE_TEAM_ID

if (!DB_URL) {
  console.error('ERROR: SUPABASE_DB_URL or E2E_SUPABASE_DB_URL must be set')
  process.exit(1)
}
if (!TEAM_ID) {
  console.error('ERROR: VITE_SUPABASE_TEAM_ID must be set')
  process.exit(1)
}

// ── Args ─────────────────────────────────────────────────────────────────────

const [,, filePath, mode] = process.argv

if (!filePath || (mode !== '--dry-run' && mode !== '--apply')) {
  console.error('Usage: node scripts/import-legacy-json-to-supabase.mjs <file.json> [--dry-run | --apply]')
  process.exit(1)
}

// ── Parse backup ─────────────────────────────────────────────────────────────

let backup
try {
  backup = JSON.parse(readFileSync(filePath, 'utf8'))
} catch (e) {
  console.error(`ERROR: Failed to read ${filePath}: ${e.message}`)
  process.exit(1)
}

if (backup.version !== 1) {
  console.error(`ERROR: Unsupported backup version: ${backup.version}. Expected: 1`)
  process.exit(1)
}

const athletes = backup.athletes ?? []
const trainings = backup.trainings ?? []
const attendance = backup.attendance ?? []
const settings = backup.settings ?? []

console.log(`\nLegacy backup  : ${filePath}`)
console.log(`exportedAt     : ${backup.exportedAt ?? 'unknown'}`)
console.log(`athletes       : ${athletes.length}`)
console.log(`trainings      : ${trainings.length}`)
console.log(`attendance     : ${attendance.length}`)
console.log(`settings       : ${settings.length}`)
console.log(`target team    : ${TEAM_ID}`)
console.log(`mode           : ${mode}\n`)

// ── SQL helpers ───────────────────────────────────────────────────────────────

function esc(v) {
  return String(v ?? '').replaceAll("'", "''")
}

function s(v) {
  if (v === null || v === undefined) return 'NULL'
  return `'${esc(v)}'`
}

function b(v) {
  return v ? 'true' : 'false'
}

function computeStartsAt(date, time) {
  if (!date || !time) return null
  // São Paulo is UTC-3 (winter); mirrors trainingApi.ts logic
  return new Date(`${date}T${time}:00-03:00`).toISOString()
}

// ── Build SQL ─────────────────────────────────────────────────────────────────

const lines = ['BEGIN;', '']

// Athletes
lines.push(`-- Athletes (${athletes.length})`)
for (const a of athletes) {
  const now = a.createdAt ?? new Date().toISOString()
  lines.push(
    `INSERT INTO public.athletes` +
    ` (id, team_id, name, email, phone, category, level, status, notes, created_at, updated_at)` +
    ` VALUES` +
    ` (${s(a.id)}, ${s(TEAM_ID)}, ${s(a.nome)}, ${s(a.email || null)}, ${s(a.telefone || null)},` +
    `  ${s(a.categoria ?? null)}, ${s(a.nivel ?? null)}, ${s(a.status ?? 'ativo')}, ${s(a.observacoes ?? null)},` +
    `  ${s(a.createdAt ?? now)}, ${s(a.updatedAt ?? now)})` +
    ` ON CONFLICT (id) DO NOTHING;`
  )
}

lines.push('')

// Trainings
lines.push(`-- Trainings (${trainings.length})`)
for (const t of trainings) {
  const startsAt = computeStartsAt(t.data, t.horaInicio)
  const generationKey = `legacy:${t.id}`
  const now = t.createdAt ?? new Date().toISOString()
  lines.push(
    `INSERT INTO public.trainings` +
    ` (id, team_id, type, status, training_date, start_time, end_time, timezone,` +
    `  starts_at, location, notes, holiday_origin, created_manually, generation_key, created_at, updated_at)` +
    ` VALUES` +
    ` (${s(t.id)}, ${s(TEAM_ID)}, ${s(t.tipo ?? 'extra')}, ${s(t.status ?? 'agendado')},` +
    `  ${s(t.data)}, ${s(t.horaInicio)}, ${s(t.horaFim)}, 'America/Sao_Paulo',` +
    `  ${s(startsAt)}, ${s(t.local ?? null)}, ${s(t.observacoes ?? null)}, ${s(t.feriadoOrigem ?? null)},` +
    `  ${b(t.criadoManualmente ?? false)}, ${s(generationKey)},` +
    `  ${s(t.createdAt ?? now)}, ${s(t.updatedAt ?? now)})` +
    ` ON CONFLICT (id) DO NOTHING;`
  )
}

lines.push('')

// Attendance records
// Legacy attendance IDs are "${treinoId}::${atletaId}" (not UUIDs).
// Supabase uses its own UUID primary key; unique constraint is on (training_id, athlete_id).
lines.push(`-- Attendance Records (${attendance.length})`)
for (const r of attendance) {
  const registeredAt = r.registradoEm ?? new Date().toISOString()
  lines.push(
    `INSERT INTO public.attendance_records` +
    ` (team_id, training_id, athlete_id, status, justification, confirmed_by_athlete, registered_at, updated_at)` +
    ` VALUES` +
    ` (${s(TEAM_ID)}, ${s(r.treinoId)}, ${s(r.atletaId)},` +
    `  ${s(r.status ?? 'pendente')}, ${s(r.justificativa ?? null)}, ${b(r.confirmadoPelaAtleta ?? false)},` +
    `  ${s(registeredAt)}, ${s(registeredAt)})` +
    ` ON CONFLICT (training_id, athlete_id) DO UPDATE SET` +
    `  status = excluded.status,` +
    `  justification = excluded.justification,` +
    `  confirmed_by_athlete = excluded.confirmed_by_athlete,` +
    `  updated_at = excluded.updated_at;`
  )
}

// Settings — only nomeEquipe maps to teams.name; other fields have no DB target
if (settings.length > 0) {
  const cfg = settings[0]
  lines.push(`-- Settings (nomeEquipe → teams.name)`)
  if (cfg.nomeEquipe) {
    lines.push(
      `UPDATE public.teams SET name = ${s(cfg.nomeEquipe)}, updated_at = now()` +
      ` WHERE id = ${s(TEAM_ID)};`
    )
  }
  const ignored = Object.keys(cfg).filter((k) => k !== 'nomeEquipe')
  if (ignored.length > 0) {
    lines.push(`-- Fields without a DB target (acknowledged, not imported): ${ignored.join(', ')}`)
  }
  lines.push('')
}

lines.push('COMMIT;')

const sql = lines.join('\n')

// ── Execute ───────────────────────────────────────────────────────────────────

if (mode === '--dry-run') {
  console.log('=== DRY RUN — SQL that would be executed ===\n')
  console.log(sql)
  console.log('\n=== DRY RUN COMPLETE — no changes made ===')
  process.exit(0)
}

// --apply
console.log(`Importing ${athletes.length} athletes, ${trainings.length} trainings, ${attendance.length} attendance records, ${settings.length} settings...`)

try {
  execFileSync('psql', [DB_URL, '-v', 'ON_ERROR_STOP=1'], {
    input: sql,
    stdio: ['pipe', 'inherit', 'inherit'],
  })
  console.log(`\nImport complete.`)
  console.log(`  athletes   : ${athletes.length} upserted`)
  console.log(`  trainings  : ${trainings.length} upserted`)
  console.log(`  attendance : ${attendance.length} upserted`)
} catch {
  console.error('\nERROR: Import failed (see psql output above).')
  process.exit(1)
}

#!/usr/bin/env node
/**
 * Reconcile legacy JSON backup against Supabase.
 * Run after import-legacy-json-to-supabase.mjs --apply.
 *
 * Usage:
 *   node scripts/reconcile-legacy-json-to-supabase.mjs <file.json>
 *
 * Exits 0 if every record in the backup exists in Supabase with correct values.
 * Exits 1 if any record is missing or has divergent data.
 *
 * Environment (loaded from .env.test if present):
 *   SUPABASE_DB_URL / E2E_SUPABASE_DB_URL
 *   VITE_SUPABASE_TEAM_ID
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

const [,, filePath] = process.argv

if (!filePath) {
  console.error('Usage: node scripts/reconcile-legacy-json-to-supabase.mjs <file.json>')
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

// ── Query helper ──────────────────────────────────────────────────────────────

function query(sql) {
  return execFileSync('psql', [DB_URL, '-t', '-A', '-c', sql], {
    stdio: ['pipe', 'pipe', 'inherit'],
  }).toString().trim()
}

function esc(v) {
  return String(v ?? '').replaceAll("'", "''")
}

// ── Reconcile ─────────────────────────────────────────────────────────────────

let failures = 0

function fail(msg) {
  console.error(`  FAIL: ${msg}`)
  failures++
}

function ok(msg) {
  console.log(`  OK  : ${msg}`)
}

console.log(`\nReconciling ${filePath} against Supabase (team: ${TEAM_ID})...\n`)

// ── Athletes ──────────────────────────────────────────────────────────────────

console.log(`=== Athletes (${athletes.length} in backup) ===`)

if (athletes.length > 0) {
  for (const a of athletes) {
    const row = query(
      `SELECT name FROM public.athletes WHERE id = '${esc(a.id)}' AND team_id = '${esc(TEAM_ID)}'`
    )
    if (!row) {
      fail(`athlete id=${a.id} not found in DB`)
    } else if (row !== a.nome) {
      fail(`athlete id=${a.id} name mismatch: expected "${a.nome}", got "${row}"`)
    } else {
      ok(`athlete id=${a.id} name="${row}"`)
    }
  }
} else {
  ok('no athletes in backup (skipped)')
}

// ── Trainings ─────────────────────────────────────────────────────────────────

console.log(`\n=== Trainings (${trainings.length} in backup) ===`)

if (trainings.length > 0) {
  for (const t of trainings) {
    const row = query(
      `SELECT training_date::text FROM public.trainings WHERE id = '${esc(t.id)}' AND team_id = '${esc(TEAM_ID)}'`
    )
    if (!row) {
      fail(`training id=${t.id} not found in DB`)
    } else if (row !== t.data) {
      fail(`training id=${t.id} training_date mismatch: expected "${t.data}", got "${row}"`)
    } else {
      ok(`training id=${t.id} training_date="${row}"`)
    }
  }
} else {
  ok('no trainings in backup (skipped)')
}

// ── Attendance Records ────────────────────────────────────────────────────────

console.log(`\n=== Attendance Records (${attendance.length} in backup) ===`)

if (attendance.length > 0) {
  for (const r of attendance) {
    const dbStatus = query(
      `SELECT status FROM public.attendance_records` +
      ` WHERE training_id = '${esc(r.treinoId)}' AND athlete_id = '${esc(r.atletaId)}'` +
      ` AND team_id = '${esc(TEAM_ID)}'`
    )
    if (!dbStatus) {
      fail(`attendance (training=${r.treinoId}, athlete=${r.atletaId}) not found in DB`)
    } else if (dbStatus !== r.status) {
      fail(`attendance (training=${r.treinoId}, athlete=${r.atletaId}) status mismatch: expected "${r.status}", got "${dbStatus}"`)
    } else {
      ok(`attendance (training=${r.treinoId}, athlete=${r.atletaId}) status="${dbStatus}"`)
    }
  }
} else {
  ok('no attendance records in backup (skipped)')
}

// ── Settings ──────────────────────────────────────────────────────────────────

console.log(`\n=== Settings (${settings.length} in backup) ===`)

if (settings.length > 0) {
  const cfg = settings[0]
  if (cfg.nomeEquipe) {
    const dbName = query(
      `SELECT name FROM public.teams WHERE id = '${esc(TEAM_ID)}'`
    )
    if (dbName === cfg.nomeEquipe) {
      ok(`teams.name matches ("${dbName}")`)
    } else {
      fail(`teams.name mismatch: expected "${cfg.nomeEquipe}", got "${dbName}"`)
    }
  } else {
    ok('nomeEquipe not set in settings (skipped)')
  }
} else {
  ok('no settings in backup (skipped)')
}

// ── Result ────────────────────────────────────────────────────────────────────

console.log('')
if (failures === 0) {
  console.log(`✓ Reconciliation PASSED — ${athletes.length} athletes, ${trainings.length} trainings, ${attendance.length} attendance records verified.`)
  process.exit(0)
} else {
  console.error(`✗ Reconciliation FAILED — ${failures} check(s) failed.`)
  process.exit(1)
}

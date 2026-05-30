#!/usr/bin/env tsx
/**
 * CEPR-AUTH-02E §20.2 — Verifica supabase/config.toml.
 * Falha (exit 1) se algum requisito do §20.1 estiver ausente ou divergente.
 *
 * Sem dependência de TOML parser: regex linha-a-linha (config é estático e simples).
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const CONFIG_PATH = resolve(process.cwd(), 'supabase/config.toml')

interface Rule {
  /** Section header, e.g. "[auth]" */
  section: string
  /** Key inside the section */
  key: string
  /** Expected value (verbatim TOML form, including quotes for strings) */
  expected: string
}

const RULES: Rule[] = [
  { section: '[auth]', key: 'minimum_password_length', expected: '10' },
  { section: '[auth]', key: 'password_requirements', expected: '"lower_upper_letters_digits"' },
  { section: '[auth]', key: 'jwt_expiry', expected: '3600' },
  { section: '[auth]', key: 'enable_refresh_token_rotation', expected: 'true' },
  { section: '[auth]', key: 'refresh_token_reuse_interval', expected: '10' },
  { section: '[auth.email]', key: 'enable_confirmations', expected: 'true' },
  { section: '[auth.email]', key: 'secure_password_change', expected: 'true' },
  { section: '[auth.email]', key: 'otp_expiry', expected: '3600' },
  { section: '[auth.rate_limit]', key: 'email_sent', expected: '10' },
  { section: '[auth.rate_limit]', key: 'sign_in_sign_ups', expected: '30' },
  { section: '[auth.rate_limit]', key: 'token_refresh', expected: '150' },
  { section: '[auth.rate_limit]', key: 'token_verifications', expected: '30' },
  // Bloco CAPTCHA é validado apenas se Turnstile estiver habilitado
  // (Phase 2 do CEPR-AUTH-02E). Verificação condicional abaixo.
]

function parseSections(toml: string): Map<string, Map<string, string>> {
  const sections = new Map<string, Map<string, string>>()
  let current: Map<string, string> | null = null
  let currentName = ''
  for (const rawLine of toml.split('\n')) {
    const line = rawLine.replace(/#.*$/, '').trim()
    if (!line) continue
    const sectionMatch = line.match(/^\[([^\]]+)\]$/)
    if (sectionMatch) {
      currentName = `[${sectionMatch[1]}]`
      current = new Map()
      sections.set(currentName, current)
      continue
    }
    if (!current) continue
    const kv = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)$/)
    if (kv) current.set(kv[1], kv[2].trim())
  }
  return sections
}

function main(): number {
  const toml = readFileSync(CONFIG_PATH, 'utf8')
  const sections = parseSections(toml)
  const errors: string[] = []

  for (const rule of RULES) {
    const sec = sections.get(rule.section)
    if (!sec) {
      errors.push(`SECAO_AUSENTE ${rule.section}`)
      continue
    }
    const actual = sec.get(rule.key)
    if (actual === undefined) {
      errors.push(`CHAVE_AUSENTE ${rule.section} ${rule.key}`)
      continue
    }
    if (actual !== rule.expected) {
      errors.push(`VALOR_DIVERGENTE ${rule.section} ${rule.key}: esperado=${rule.expected} obtido=${actual}`)
    }
  }

  // CAPTCHA: opcional até Phase 2; quando presente, deve estar correto.
  const captcha = sections.get('[auth.captcha]')
  if (captcha) {
    const enabled = captcha.get('enabled')
    if (enabled !== 'true') errors.push('CAPTCHA_DESATIVADO esperado=true')
    const provider = captcha.get('provider')
    if (provider !== '"turnstile"') errors.push(`CAPTCHA_PROVIDER esperado="turnstile" obtido=${provider}`)
    const secret = captcha.get('secret')
    if (secret !== '"env(TURNSTILE_SECRET_KEY)"') {
      errors.push(`CAPTCHA_SECRET esperado="env(TURNSTILE_SECRET_KEY)" obtido=${secret}`)
    }
  }

  if (errors.length > 0) {
    console.error('verify-supabase-config: divergencias encontradas em', CONFIG_PATH)
    for (const e of errors) console.error('  -', e)
    return 1
  }
  console.log('verify-supabase-config: OK (' + RULES.length + ' regras validadas)')
  return 0
}

process.exit(main())

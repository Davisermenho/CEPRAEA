import type { AttendanceStatus } from '@/types'

export interface RemoteRecord {
  id: string
  treinoId: string
  atletaId: string
  nomeAtleta: string
  status: AttendanceStatus
  timestamp: string
  origem: 'link' | 'manual'
}

export interface SyncConfig {
  endpointUrl: string
  secret: string
}

export interface SyncResult {
  ok: boolean
  records?: RemoteRecord[]
  syncedAt?: string
  error?: string
}

/** Gera um secret aleatório de 32 hex chars */
export function generateSecret(): string {
  const arr = new Uint8Array(16)
  crypto.getRandomValues(arr)
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('')
}

function buildUrl(config: SyncConfig, params: Record<string, string>): string {
  const url = new URL(config.endpointUrl)
  url.searchParams.set('secret', config.secret)
  for (const [k, v] of Object.entries(params)) {
    if (v) url.searchParams.set(k, v)
  }
  return url.toString()
}

const TIMEOUT_MS = 10_000

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    return await fetch(url, { signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

/** Verifica se o endpoint está acessível e o secret é válido */
export async function pingEndpoint(config: SyncConfig): Promise<{ ok: boolean; error?: string }> {
  try {
    const url = buildUrl(config, { action: 'ping' })
    const res = await fetchWithTimeout(url)
    const data = await res.json()
    if (data.error === 'unauthorized') return { ok: false, error: 'Secret incorreto.' }
    return { ok: data.ok === true }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro de conexão'
    return { ok: false, error: msg.includes('abort') ? 'Timeout — verifique a URL.' : msg }
  }
}

/**
 * Envia uma confirmação de presença ao endpoint remoto.
 * Retorna true se bem-sucedido.
 */
export async function pushConfirmation(
  config: SyncConfig,
  record: {
    treinoId: string
    atletaId: string
    nomeAtleta: string
    status: AttendanceStatus
    origem: 'link' | 'manual'
  }
): Promise<boolean> {
  try {
    const url = buildUrl(config, {
      action: 'confirm',
      treinoId: record.treinoId,
      atletaId: record.atletaId,
      nomeAtleta: record.nomeAtleta,
      status: record.status,
      timestamp: new Date().toISOString(),
      origem: record.origem,
    })
    const res = await fetchWithTimeout(url)
    const data = await res.json()
    return data.ok === true
  } catch {
    return false
  }
}

/**
 * Puxa confirmações remotas.
 * Filtros opcionais: treinoId (só de um treino) e since (ISO timestamp).
 */
export async function pullConfirmations(
  config: SyncConfig,
  opts?: { treinoId?: string; since?: string }
): Promise<SyncResult> {
  try {
    const params: Record<string, string> = { action: 'list' }
    if (opts?.treinoId) params.treinoId = opts.treinoId
    if (opts?.since) params.since = opts.since

    const url = buildUrl(config, params)
    const res = await fetchWithTimeout(url)
    const data = await res.json()

    if (data.error) return { ok: false, error: data.error }
    return { ok: true, records: data.records ?? [], syncedAt: data.syncedAt }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro de conexão'
    return { ok: false, error: msg.includes('abort') ? 'Timeout.' : msg }
  }
}

/** Lê a SyncConfig do IDB settings */
export async function loadSyncConfig(): Promise<SyncConfig | null> {
  const { getSetting } = await import('@/db')
  const url = await getSetting<string>('syncEndpointUrl')
  const secret = await getSetting<string>('syncSecret')
  if (!url || !secret) return null
  return { endpointUrl: url, secret }
}

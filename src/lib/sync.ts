import type { Athlete, AttendanceStatus, Training, TrainingStatus, TrainingType } from '@/types'

export interface RemoteRecord {
  id: string
  treinoId: string
  atletaId: string
  nomeAtleta: string
  status: AttendanceStatus
  timestamp: string
  origem: 'link' | 'manual'
}

/** Versão "pública" do atleta — não inclui telefone/pinHash. */
export interface RemoteAthlete {
  id: string
  nome: string
  categoria?: string
  nivel?: string
  status: 'ativo' | 'inativo'
  observacoes?: string
  createdAt: string
  updatedAt: string
}

export interface RemoteTraining {
  id: string
  tipo: TrainingType
  status: TrainingStatus
  data: string
  horaInicio: string
  horaFim: string
  local?: string
  observacoes?: string
  feriadoOrigem?: string
  criadoManualmente: boolean
  createdAt: string
  updatedAt: string
}

export interface SyncConfig {
  endpointUrl: string
  secret?: string       // usado pelo treinador
  atletaToken?: string  // usado pela atleta após login
}

export interface SyncResult<T = RemoteRecord> {
  ok: boolean
  records?: T[]
  syncedAt?: string
  error?: string
}

/** Gera um secret aleatório de 32 hex chars. */
export function generateSecret(): string {
  const arr = new Uint8Array(16)
  crypto.getRandomValues(arr)
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('')
}

function buildUrl(config: SyncConfig, params: Record<string, string>): string {
  const url = new URL(config.endpointUrl)
  if (config.secret) url.searchParams.set('secret', config.secret)
  if (config.atletaToken) url.searchParams.set('atletaToken', config.atletaToken)
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v)
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

async function getJson<T>(url: string): Promise<T> {
  const res = await fetchWithTimeout(url)
  return (await res.json()) as T
}

function errorMessage(e: unknown): string {
  const msg = e instanceof Error ? e.message : 'Erro de conexão'
  return msg.includes('abort') ? 'Timeout — verifique a URL.' : msg
}

// ─── Conexão ─────────────────────────────────────────────────────────────────

export async function pingEndpoint(config: SyncConfig): Promise<{ ok: boolean; error?: string }> {
  try {
    const data = await getJson<{ ok?: boolean; error?: string }>(buildUrl(config, { action: 'ping' }))
    if (data.error === 'unauthorized') return { ok: false, error: 'Secret incorreto.' }
    return { ok: data.ok === true }
  } catch (e) {
    return { ok: false, error: errorMessage(e) }
  }
}

// ─── Login da atleta ─────────────────────────────────────────────────────────

export interface LoginResult {
  ok: boolean
  atletaId?: string
  nome?: string
  token?: string
  error?: string
}

export async function loginAtleta(
  endpointUrl: string,
  telefone: string,
  pin: string
): Promise<LoginResult> {
  try {
    const url = new URL(endpointUrl)
    url.searchParams.set('action', 'login')
    url.searchParams.set('telefone', telefone)
    url.searchParams.set('pin', pin)
    const data = await getJson<{ ok?: boolean; atletaId?: string; nome?: string; token?: string; error?: string }>(url.toString())
    if (data.ok && data.token) {
      return { ok: true, atletaId: data.atletaId, nome: data.nome, token: data.token }
    }
    const errMap: Record<string, string> = {
      invalid_credentials: 'Telefone ou PIN incorretos.',
      pin_not_set: 'PIN ainda não foi definido. Peça ao treinador.',
      missing_params: 'Preencha telefone e PIN.',
    }
    return { ok: false, error: errMap[data.error ?? ''] ?? data.error ?? 'Erro de login' }
  } catch (e) {
    return { ok: false, error: errorMessage(e) }
  }
}

// ─── Confirmação de presença ─────────────────────────────────────────────────

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
    const data = await getJson<{ ok?: boolean }>(buildUrl(config, {
      action: 'confirm',
      treinoId: record.treinoId,
      atletaId: record.atletaId,
      nomeAtleta: record.nomeAtleta,
      status: record.status,
      timestamp: new Date().toISOString(),
      origem: record.origem,
    }))
    return data.ok === true
  } catch {
    return false
  }
}

export async function pullConfirmations(
  config: SyncConfig,
  opts?: { treinoId?: string; since?: string }
): Promise<SyncResult<RemoteRecord>> {
  try {
    const params: Record<string, string> = { action: 'list' }
    if (opts?.treinoId) params.treinoId = opts.treinoId
    if (opts?.since) params.since = opts.since
    const data = await getJson<{ records?: RemoteRecord[]; syncedAt?: string; error?: string }>(buildUrl(config, params))
    if (data.error) return { ok: false, error: data.error }
    return { ok: true, records: data.records ?? [], syncedAt: data.syncedAt }
  } catch (e) {
    return { ok: false, error: errorMessage(e) }
  }
}

// ─── Atletas ─────────────────────────────────────────────────────────────────

export async function pullAthletes(config: SyncConfig): Promise<SyncResult<RemoteAthlete>> {
  try {
    const data = await getJson<{ records?: RemoteAthlete[]; syncedAt?: string; error?: string }>(
      buildUrl(config, { action: 'listAthletes' })
    )
    if (data.error) return { ok: false, error: data.error }
    return { ok: true, records: data.records ?? [], syncedAt: data.syncedAt }
  } catch (e) {
    return { ok: false, error: errorMessage(e) }
  }
}

/** Treinador: faz upsert de uma atleta (envia pin opcional para definir/resetar PIN). */
export async function pushAthlete(
  config: SyncConfig,
  athlete: Athlete,
  opts?: { pin?: string }
): Promise<boolean> {
  try {
    const params: Record<string, string> = {
      action: 'upsertAthlete',
      id: athlete.id,
      nome: athlete.nome,
      telefone: athlete.telefone,
      categoria: athlete.categoria ?? '',
      nivel: athlete.nivel ?? '',
      status: athlete.status,
      observacoes: athlete.observacoes ?? '',
      createdAt: athlete.createdAt,
      updatedAt: athlete.updatedAt,
    }
    if (opts?.pin) params.pin = opts.pin
    const data = await getJson<{ ok?: boolean }>(buildUrl(config, params))
    return data.ok === true
  } catch {
    return false
  }
}

export async function deleteAthleteRemote(config: SyncConfig, id: string): Promise<boolean> {
  try {
    const data = await getJson<{ ok?: boolean }>(buildUrl(config, { action: 'deleteAthlete', id }))
    return data.ok === true
  } catch {
    return false
  }
}

export async function setPinRemote(
  config: SyncConfig,
  atletaId: string,
  pin: string
): Promise<boolean> {
  try {
    const data = await getJson<{ ok?: boolean }>(buildUrl(config, { action: 'setPin', atletaId, pin }))
    return data.ok === true
  } catch {
    return false
  }
}

// ─── Treinos ─────────────────────────────────────────────────────────────────

export async function pullTrainings(
  config: SyncConfig,
  opts?: { since?: string; until?: string }
): Promise<SyncResult<RemoteTraining>> {
  try {
    const params: Record<string, string> = { action: 'listTrainings' }
    if (opts?.since) params.since = opts.since
    if (opts?.until) params.until = opts.until
    const data = await getJson<{ records?: RemoteTraining[]; syncedAt?: string; error?: string }>(
      buildUrl(config, params)
    )
    if (data.error) return { ok: false, error: data.error }
    return { ok: true, records: data.records ?? [], syncedAt: data.syncedAt }
  } catch (e) {
    return { ok: false, error: errorMessage(e) }
  }
}

export async function pushTraining(config: SyncConfig, training: Training): Promise<boolean> {
  try {
    const data = await getJson<{ ok?: boolean }>(buildUrl(config, {
      action: 'upsertTraining',
      id: training.id,
      tipo: training.tipo,
      status: training.status,
      data: training.data,
      horaInicio: training.horaInicio,
      horaFim: training.horaFim,
      local: training.local ?? '',
      observacoes: training.observacoes ?? '',
      feriadoOrigem: training.feriadoOrigem ?? '',
      criadoManualmente: String(training.criadoManualmente),
      createdAt: training.createdAt,
      updatedAt: training.updatedAt,
    }))
    return data.ok === true
  } catch {
    return false
  }
}

export async function deleteTrainingRemote(config: SyncConfig, id: string): Promise<boolean> {
  try {
    const data = await getJson<{ ok?: boolean }>(buildUrl(config, { action: 'deleteTraining', id }))
    return data.ok === true
  } catch {
    return false
  }
}

// ─── Configuração de recorrência ─────────────────────────────────────────────

export interface RemoteRecurrenceConfig {
  diasSemana?: number[]
  horarios?: { dow: number; horaInicio: string; horaFim: string }[]
  semanasFuturas?: number
  localPadrao?: string
}

export async function pullRecurrenceConfig(
  config: SyncConfig
): Promise<{ ok: boolean; config?: RemoteRecurrenceConfig | null; error?: string }> {
  try {
    const data = await getJson<{ config?: RemoteRecurrenceConfig | null; error?: string }>(
      buildUrl(config, { action: 'getRecurrenceConfig' })
    )
    if (data.error) return { ok: false, error: data.error }
    return { ok: true, config: data.config ?? null }
  } catch (e) {
    return { ok: false, error: errorMessage(e) }
  }
}

export async function pushRecurrenceConfig(
  config: SyncConfig,
  recurrenceConfig: RemoteRecurrenceConfig
): Promise<boolean> {
  try {
    const data = await getJson<{ ok?: boolean }>(buildUrl(config, {
      action: 'setRecurrenceConfig',
      config: JSON.stringify(recurrenceConfig),
    }))
    return data.ok === true
  } catch {
    return false
  }
}

// ─── Helpers para carregar config ────────────────────────────────────────────

/**
 * Resolve a URL do endpoint:
 * 1. Setting salva no IDB (pode ter sido configurada pelo treinador)
 * 2. Variável de ambiente VITE_SYNC_ENDPOINT_URL (bake no build)
 */
export async function resolveEndpointUrl(): Promise<string | null> {
  const { getSetting } = await import('@/db')
  const fromIdb = await getSetting<string>('syncEndpointUrl')
  if (fromIdb) return fromIdb
  const fromEnv = import.meta.env.VITE_SYNC_ENDPOINT_URL as string | undefined
  return fromEnv || null
}

/** Carrega a config do treinador (precisa de endpoint + syncSecret). */
export async function loadSyncConfig(): Promise<SyncConfig | null> {
  const { getSetting } = await import('@/db')
  const url = await resolveEndpointUrl()
  const secret = await getSetting<string>('syncSecret')
  if (!url || !secret) return null
  return { endpointUrl: url, secret }
}

/** Carrega a config da atleta (precisa de endpoint + atletaToken). */
export async function loadAtletaSyncConfig(token: string): Promise<SyncConfig | null> {
  const url = await resolveEndpointUrl()
  if (!url) return null
  return { endpointUrl: url, atletaToken: token }
}

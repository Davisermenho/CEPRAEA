import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type {
  ConfirmPresenceByTokenInput,
  ConfirmPresenceByTokenResult,
  CreatePresenceTokenBatchInput,
  PresenceTokenBatchLink,
} from './presenceTokenTypes'

type RawPresenceTokenBatchLink = {
  batch_id: string
  athlete_id: string
  token: string
  link_path: string
}

type RawConfirmPresenceResult = {
  ok: boolean
  message: string
}

function assertSupabaseConfigured() {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase não configurado para tokens de presença.')
  }
}

export async function createPresenceTokenBatch(
  input: CreatePresenceTokenBatchInput,
): Promise<PresenceTokenBatchLink[]> {
  assertSupabaseConfigured()

  const { data, error } = await supabase.rpc('create_presence_token_batch', {
    input_team_id: input.teamId,
    input_training_id: input.trainingId,
    input_expires_at: input.expiresAt,
  })

  if (error) throw new Error(error.message || 'Falha ao gerar tokens de presença.')

  return ((data ?? []) as RawPresenceTokenBatchLink[]).map((row) => ({
    batchId: row.batch_id,
    athleteId: row.athlete_id,
    token: row.token,
    linkPath: row.link_path,
  }))
}

export async function markPresenceTokenBatchExported(batchId: string): Promise<void> {
  assertSupabaseConfigured()

  const { error } = await supabase.rpc('mark_presence_token_batch_exported', {
    input_batch_id: batchId,
  })

  if (error) throw new Error(error.message || 'Falha ao marcar lote como exportado.')
}

export async function revokePresenceTokenBatch(batchId: string): Promise<void> {
  assertSupabaseConfigured()

  const { error } = await supabase.rpc('revoke_presence_token_batch', {
    input_batch_id: batchId,
  })

  if (error) throw new Error(error.message || 'Falha ao revogar lote de tokens.')
}

export async function confirmPresenceByToken(
  input: ConfirmPresenceByTokenInput,
): Promise<ConfirmPresenceByTokenResult> {
  assertSupabaseConfigured()

  const { data, error } = await supabase.rpc('confirm_presence_by_token', {
    input_token: input.token,
    input_status: input.status,
    input_justification: input.justification ?? null,
  })

  if (error) {
    return { ok: false, message: 'Link inválido, expirado ou indisponível.' }
  }

  const first = Array.isArray(data) ? data[0] as RawConfirmPresenceResult | undefined : data as RawConfirmPresenceResult | null

  return {
    ok: Boolean(first?.ok),
    message: first?.message || (first?.ok ? 'Presença registrada.' : 'Link inválido, expirado ou indisponível.'),
  }
}

export function buildPresenceTokenUrl(appUrl: string, token: string): string {
  const normalizedAppUrl = appUrl.replace(/\/$/, '')
  return `${normalizedAppUrl}/confirmar-presenca?token=${encodeURIComponent(token)}`
}

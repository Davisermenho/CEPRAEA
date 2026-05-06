// athleteApi.ts — Supabase-first CRUD de atletas.
// Nenhuma dependência de IndexedDB ou sync.ts.

import { supabase } from '@/lib/supabase'
import { assertSupabaseTeamId } from '@/features/presence-tokens/presenceTokenConfig'
import type { Athlete, AthleteStatus } from '@/types'

type AthleteRow = {
  id: string
  team_id: string
  user_id: string | null
  name: string
  email: string | null
  phone: string | null
  category: string | null
  level: string | null
  status: 'ativo' | 'inativo'
  notes: string | null
  deleted_at: string | null
  created_at: string
  updated_at: string
}

function mapRow(row: AthleteRow): Athlete {
  return {
    id: row.id,
    teamId: row.team_id,
    userId: row.user_id ?? undefined,
    nome: row.name,
    email: row.email ?? '',
    telefone: row.phone ?? '',
    categoria: row.category ?? undefined,
    nivel: row.level ?? undefined,
    status: row.status,
    observacoes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function fetchAthletes(): Promise<Athlete[]> {
  const teamId = assertSupabaseTeamId()
  const { data, error } = await supabase
    .from('athletes')
    .select('id, team_id, user_id, name, email, phone, category, level, status, notes, deleted_at, created_at, updated_at')
    .eq('team_id', teamId)
    .is('deleted_at', null)
    .order('name')

  if (error) throw new Error(error.message)
  return (data as AthleteRow[]).map(mapRow)
}

export async function createAthlete(
  data: Omit<Athlete, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Athlete> {
  const teamId = assertSupabaseTeamId()
  const { data: row, error } = await supabase
    .from('athletes')
    .insert({
      team_id: teamId,
      name: data.nome,
      email: data.email || null,
      phone: data.telefone || null,
      category: data.categoria ?? null,
      level: data.nivel ?? null,
      status: data.status,
      notes: data.observacoes ?? null,
    })
    .select('id, team_id, user_id, name, email, phone, category, level, status, notes, deleted_at, created_at, updated_at')
    .single<AthleteRow>()

  if (error) throw new Error(error.message)
  return mapRow(row)
}

export async function updateAthlete(
  id: string,
  data: Partial<Omit<Athlete, 'id' | 'createdAt'>>
): Promise<Athlete> {
  const patch: Record<string, unknown> = {}
  if (data.nome !== undefined)       patch.name     = data.nome
  if (data.email !== undefined)      patch.email    = data.email || null
  if (data.telefone !== undefined)   patch.phone    = data.telefone || null
  if (data.categoria !== undefined)  patch.category = data.categoria ?? null
  if (data.nivel !== undefined)      patch.level    = data.nivel ?? null
  if (data.status !== undefined)     patch.status   = data.status
  if (data.observacoes !== undefined) patch.notes   = data.observacoes ?? null

  const { data: row, error } = await supabase
    .from('athletes')
    .update(patch)
    .eq('id', id)
    .select('id, team_id, user_id, name, email, phone, category, level, status, notes, deleted_at, created_at, updated_at')
    .single<AthleteRow>()

  if (error) throw new Error(error.message)
  return mapRow(row)
}

export async function deleteAthlete(id: string): Promise<void> {
  // soft-delete via deleted_at para preservar referências de attendance_records
  const { error } = await supabase
    .from('athletes')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)
}

export async function toggleAthleteStatus(
  id: string,
  currentStatus: AthleteStatus
): Promise<Athlete> {
  const newStatus: AthleteStatus = currentStatus === 'ativo' ? 'inativo' : 'ativo'
  return updateAthlete(id, { status: newStatus })
}

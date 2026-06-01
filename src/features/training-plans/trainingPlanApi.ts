// CEPR-MVP-PR-A — Plano de treino do dia (Fluxo I do PRD).
// API Supabase-first para training_plans / blocks / exercises.
// RLS protege isolamento por team; reads filtram apenas por training_id.

import { supabase } from '@/lib/supabase'
import { assertSupabaseTeamId } from '@/features/presence-tokens/presenceTokenConfig'
import type { TrainingPlan, TrainingPlanBlock, TrainingPlanExercise } from './types'

type PlanRow = {
  id: string
  team_id: string
  training_id: string
  objetivo_principal: string | null
  observacoes: string | null
  published_at: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

type BlockRow = {
  id: string
  training_plan_id: string
  ordem: number
  objetivo_especifico: string | null
  observacoes: string | null
  created_at: string
  updated_at: string
}

type ExerciseRow = {
  id: string
  training_plan_block_id: string
  ordem: number
  descricao: string
  observacoes: string | null
  goal_id: string | null
  created_at: string
  updated_at: string
}

function mapPlan(row: PlanRow, blocos: TrainingPlanBlock[]): TrainingPlan {
  return {
    id: row.id,
    teamId: row.team_id,
    trainingId: row.training_id,
    objetivoPrincipal: row.objetivo_principal ?? undefined,
    observacoes: row.observacoes ?? undefined,
    publishedAt: row.published_at,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    blocos,
  }
}

function mapBlock(row: BlockRow, exercicios: TrainingPlanExercise[]): TrainingPlanBlock {
  return {
    id: row.id,
    trainingPlanId: row.training_plan_id,
    ordem: row.ordem,
    objetivoEspecifico: row.objetivo_especifico ?? undefined,
    observacoes: row.observacoes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    exercicios,
  }
}

function mapExercise(row: ExerciseRow): TrainingPlanExercise {
  return {
    id: row.id,
    blockId: row.training_plan_block_id,
    ordem: row.ordem,
    descricao: row.descricao,
    observacoes: row.observacoes ?? undefined,
    goalId: row.goal_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

const PLAN_COLS = 'id, team_id, training_id, objetivo_principal, observacoes, published_at, created_by, created_at, updated_at'
const BLOCK_COLS = 'id, training_plan_id, ordem, objetivo_especifico, observacoes, created_at, updated_at'
const EXERCISE_COLS = 'id, training_plan_block_id, ordem, descricao, observacoes, goal_id, created_at, updated_at'

/**
 * Busca o plano de um treino, hidratando blocos e exercícios.
 * Retorna null se não existir plano (ainda não criado).
 */
export async function fetchTrainingPlan(trainingId: string): Promise<TrainingPlan | null> {
  const { data: planRow, error: planErr } = await supabase
    .from('training_plans')
    .select(PLAN_COLS)
    .eq('training_id', trainingId)
    .is('deleted_at', null)
    .maybeSingle<PlanRow>()
  if (planErr) throw new Error(planErr.message)
  if (!planRow) return null

  const { data: blockRows, error: blockErr } = await supabase
    .from('training_plan_blocks')
    .select(BLOCK_COLS)
    .eq('training_plan_id', planRow.id)
    .order('ordem', { ascending: true })
  if (blockErr) throw new Error(blockErr.message)

  const blockIds = (blockRows ?? []).map((b) => b.id)
  let exercises: ExerciseRow[] = []
  if (blockIds.length > 0) {
    const { data: exRows, error: exErr } = await supabase
      .from('training_plan_exercises')
      .select(EXERCISE_COLS)
      .in('training_plan_block_id', blockIds)
      .order('ordem', { ascending: true })
    if (exErr) throw new Error(exErr.message)
    exercises = (exRows ?? []) as ExerciseRow[]
  }

  const blocos = (blockRows ?? []).map((b) =>
    mapBlock(b as BlockRow, exercises.filter((e) => e.training_plan_block_id === b.id).map(mapExercise))
  )
  return mapPlan(planRow, blocos)
}

/**
 * Cria um plano vazio para um treino.
 */
export async function createTrainingPlan(input: {
  trainingId: string
  objetivoPrincipal?: string
  observacoes?: string
}): Promise<TrainingPlan> {
  const teamId = assertSupabaseTeamId()
  const { data, error } = await supabase
    .from('training_plans')
    .insert({
      team_id: teamId,
      training_id: input.trainingId,
      objetivo_principal: input.objetivoPrincipal ?? null,
      observacoes: input.observacoes ?? null,
    })
    .select(PLAN_COLS)
    .single<PlanRow>()
  if (error) throw new Error(error.message)
  return mapPlan(data, [])
}

export async function updateTrainingPlan(
  planId: string,
  patch: { objetivoPrincipal?: string | null; observacoes?: string | null; publishedAt?: string | null }
): Promise<void> {
  const set: Record<string, unknown> = {}
  if (patch.objetivoPrincipal !== undefined) set.objetivo_principal = patch.objetivoPrincipal
  if (patch.observacoes !== undefined) set.observacoes = patch.observacoes
  if (patch.publishedAt !== undefined) set.published_at = patch.publishedAt
  if (Object.keys(set).length === 0) return
  const { error } = await supabase.from('training_plans').update(set).eq('id', planId)
  if (error) throw new Error(error.message)
}

export async function publishTrainingPlan(planId: string): Promise<string> {
  const publishedAt = new Date().toISOString()
  const { error } = await supabase
    .from('training_plans')
    .update({ published_at: publishedAt })
    .eq('id', planId)
  if (error) throw new Error(error.message)
  return publishedAt
}

export async function unpublishTrainingPlan(planId: string): Promise<void> {
  const { error } = await supabase
    .from('training_plans')
    .update({ published_at: null })
    .eq('id', planId)
  if (error) throw new Error(error.message)
}

// ── Blocos ──────────────────────────────────────────────────────────────────

export async function createTrainingPlanBlock(input: {
  trainingPlanId: string
  ordem: number
  objetivoEspecifico?: string
  observacoes?: string
}): Promise<TrainingPlanBlock> {
  const { data, error } = await supabase
    .from('training_plan_blocks')
    .insert({
      training_plan_id: input.trainingPlanId,
      ordem: input.ordem,
      objetivo_especifico: input.objetivoEspecifico ?? null,
      observacoes: input.observacoes ?? null,
    })
    .select(BLOCK_COLS)
    .single<BlockRow>()
  if (error) throw new Error(error.message)
  return mapBlock(data, [])
}

export async function updateTrainingPlanBlock(
  blockId: string,
  patch: { ordem?: number; objetivoEspecifico?: string | null; observacoes?: string | null }
): Promise<void> {
  const set: Record<string, unknown> = {}
  if (patch.ordem !== undefined) set.ordem = patch.ordem
  if (patch.objetivoEspecifico !== undefined) set.objetivo_especifico = patch.objetivoEspecifico
  if (patch.observacoes !== undefined) set.observacoes = patch.observacoes
  if (Object.keys(set).length === 0) return
  const { error } = await supabase.from('training_plan_blocks').update(set).eq('id', blockId)
  if (error) throw new Error(error.message)
}

export async function deleteTrainingPlanBlock(blockId: string): Promise<void> {
  const { error } = await supabase.from('training_plan_blocks').delete().eq('id', blockId)
  if (error) throw new Error(error.message)
}

// ── Exercícios ──────────────────────────────────────────────────────────────

export async function createTrainingPlanExercise(input: {
  blockId: string
  ordem: number
  descricao: string
  observacoes?: string
  goalId?: string | null
}): Promise<TrainingPlanExercise> {
  const { data, error } = await supabase
    .from('training_plan_exercises')
    .insert({
      training_plan_block_id: input.blockId,
      ordem: input.ordem,
      descricao: input.descricao,
      observacoes: input.observacoes ?? null,
      goal_id: input.goalId ?? null,
    })
    .select(EXERCISE_COLS)
    .single<ExerciseRow>()
  if (error) throw new Error(error.message)
  return mapExercise(data)
}

export async function updateTrainingPlanExercise(
  exerciseId: string,
  patch: { ordem?: number; descricao?: string; observacoes?: string | null; goalId?: string | null }
): Promise<void> {
  const set: Record<string, unknown> = {}
  if (patch.ordem !== undefined) set.ordem = patch.ordem
  if (patch.descricao !== undefined) set.descricao = patch.descricao
  if (patch.observacoes !== undefined) set.observacoes = patch.observacoes
  if (patch.goalId !== undefined) set.goal_id = patch.goalId
  if (Object.keys(set).length === 0) return
  const { error } = await supabase.from('training_plan_exercises').update(set).eq('id', exerciseId)
  if (error) throw new Error(error.message)
}

export async function deleteTrainingPlanExercise(exerciseId: string): Promise<void> {
  const { error } = await supabase.from('training_plan_exercises').delete().eq('id', exerciseId)
  if (error) throw new Error(error.message)
}

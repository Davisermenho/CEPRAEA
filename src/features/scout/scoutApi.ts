import { assertSupabaseTeamId } from '@/features/presence-tokens/presenceTokenConfig'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import type {
  ScoutCodeList,
  ScoutCodeListKey,
  ScoutCodeValue,
  ScoutFieldCodebookMap,
  ScoutPlay,
  ScoutPlayBundle,
  ScoutPlayBundleUpsertInput,
  ScoutPlayParticipation,
  ScoutPlayParticipationWriteInput,
  ScoutPlayWriteInput,
} from '@/types'

type RawScoutCodeListRow = {
  id: string
  list_key: string
  label: string
  contract_scope: string | null
  active: boolean
  source_version: string
}

type RawScoutCodeValueRow = {
  id: string
  list_id: string
  code: string
  label: string
  sort_order: number
  is_nao_aplica: boolean
  is_nao_observado: boolean
  notes: string | null
  active: boolean
}

type RawScoutFieldCodebookMapRow = {
  id: string
  contract_name: string
  field_name: string
  selector_key: string
  selector_value: string
  list_key: string
  allow_nao_aplica: boolean
  allow_nao_observado: boolean
  active: boolean
}

type RawScoutPlayRow = {
  id: string
  team_id: string
  scout_game_id: string
  play_code: string
  session_date: string
  session_type: string
  opponent_name: string | null
  period: string
  game_clock: string
  source: string
  phase_of_ball: string
  attacking_team_side: string
  defending_team_side: string
  analyzed_team_phase: string | null
  offensive_system: string | null
  offensive_configuration: string | null
  special_offensive_role: string | null
  temporary_pivot_occupation: string | null
  temporary_pivot_athlete_id: string | null
  temporary_pivot_result: string | null
  defensive_system: string | null
  expected_defensive_action: string | null
  defensive_connection: string | null
  defensive_adjustment: string | null
  main_offensive_threat: string | null
  defensive_adjustment_result: string | null
  finish_type: string | null
  shot_destination: string | null
  shot_region: string | null
  factual_result: string
  play_points: string | null
  play_score_reason: string | null
  main_cause: string | null
  video_ref: string | null
  free_notes: string | null
  validation_status: string
  created_at: string
  updated_at: string
}

type RawScoutPlayParticipationRow = {
  id: string
  team_id: string
  scout_game_id: string
  scout_play_id: string
  participant_scope: string
  participant_side: string
  slot_order: number
  athlete_id: string | null
  external_athlete_label: string | null
  phase_of_athlete: string | null
  participation_role: string
  position_code: string | null
  special_function_code: string | null
  action_code: string | null
  individual_result: string | null
  main_cause: string | null
  training_priority: string | null
  created_at: string
}

type RawScoutPlayBundle = {
  play: RawScoutPlayRow
  participations: RawScoutPlayParticipationRow[]
}

function assertSupabaseReady() {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase não configurado para o scout.')
  }
}

function resolveTeamId(explicitTeamId?: string): string {
  return explicitTeamId ?? assertSupabaseTeamId()
}

function toOptional(value: string | null | undefined): string | undefined {
  return value ?? undefined
}

function mapScoutPlay(row: RawScoutPlayRow): ScoutPlay {
  return {
    id: row.id,
    teamId: row.team_id,
    scoutGameId: row.scout_game_id,
    playCode: row.play_code,
    sessionDate: row.session_date,
    sessionType: row.session_type as ScoutPlay['sessionType'],
    opponentName: toOptional(row.opponent_name),
    period: row.period,
    gameClock: row.game_clock,
    source: row.source as ScoutPlay['source'],
    phaseOfBall: row.phase_of_ball as ScoutPlay['phaseOfBall'],
    attackingTeamSide: row.attacking_team_side as ScoutPlay['attackingTeamSide'],
    defendingTeamSide: row.defending_team_side as ScoutPlay['defendingTeamSide'],
    analyzedTeamPhase: toOptional(row.analyzed_team_phase),
    offensiveSystem: toOptional(row.offensive_system),
    offensiveConfiguration: toOptional(row.offensive_configuration),
    specialOffensiveRole: toOptional(row.special_offensive_role),
    temporaryPivotOccupation: toOptional(row.temporary_pivot_occupation),
    temporaryPivotAthleteId: toOptional(row.temporary_pivot_athlete_id),
    temporaryPivotResult: toOptional(row.temporary_pivot_result),
    defensiveSystem: toOptional(row.defensive_system),
    expectedDefensiveAction: toOptional(row.expected_defensive_action),
    defensiveConnection: toOptional(row.defensive_connection),
    defensiveAdjustment: toOptional(row.defensive_adjustment),
    mainOffensiveThreat: toOptional(row.main_offensive_threat),
    defensiveAdjustmentResult: toOptional(row.defensive_adjustment_result),
    finishType: toOptional(row.finish_type),
    shotDestination: toOptional(row.shot_destination),
    shotRegion: toOptional(row.shot_region),
    factualResult: row.factual_result,
    playPoints: toOptional(row.play_points),
    playScoreReason: toOptional(row.play_score_reason),
    mainCause: toOptional(row.main_cause),
    videoRef: toOptional(row.video_ref),
    freeNotes: toOptional(row.free_notes),
    validationStatus: row.validation_status as ScoutPlay['validationStatus'],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapScoutPlayParticipation(row: RawScoutPlayParticipationRow): ScoutPlayParticipation {
  return {
    id: row.id,
    teamId: row.team_id,
    scoutGameId: row.scout_game_id,
    scoutPlayId: row.scout_play_id,
    participantScope: row.participant_scope as ScoutPlayParticipation['participantScope'],
    participantSide: row.participant_side as ScoutPlayParticipation['participantSide'],
    slotOrder: row.slot_order,
    athleteId: toOptional(row.athlete_id),
    externalAthleteLabel: toOptional(row.external_athlete_label),
    phaseOfAthlete: row.phase_of_athlete as ScoutPlayParticipation['phaseOfAthlete'],
    participationRole: row.participation_role,
    positionCode: toOptional(row.position_code),
    specialFunctionCode: toOptional(row.special_function_code),
    actionCode: toOptional(row.action_code),
    individualResult: toOptional(row.individual_result),
    mainCause: toOptional(row.main_cause),
    trainingPriority: toOptional(row.training_priority),
    createdAt: row.created_at,
  }
}

function mapScoutBundle(bundle: RawScoutPlayBundle): ScoutPlayBundle {
  return {
    play: mapScoutPlay(bundle.play),
    participations: (bundle.participations ?? []).map(mapScoutPlayParticipation),
  }
}

function serializeScoutPlay(input: ScoutPlayWriteInput): Record<string, unknown> {
  return {
    id: input.id ?? null,
    play_code: input.playCode,
    session_date: input.sessionDate,
    session_type: input.sessionType,
    opponent_name: input.opponentName ?? null,
    period: input.period,
    game_clock: input.gameClock,
    source: input.source,
    phase_of_ball: input.phaseOfBall,
    attacking_team_side: input.attackingTeamSide,
    defending_team_side: input.defendingTeamSide,
    analyzed_team_phase: input.analyzedTeamPhase ?? null,
    offensive_system: input.offensiveSystem ?? null,
    offensive_configuration: input.offensiveConfiguration ?? null,
    special_offensive_role: input.specialOffensiveRole ?? null,
    temporary_pivot_occupation: input.temporaryPivotOccupation ?? null,
    temporary_pivot_athlete_id: input.temporaryPivotAthleteId ?? null,
    temporary_pivot_result: input.temporaryPivotResult ?? null,
    defensive_system: input.defensiveSystem ?? null,
    expected_defensive_action: input.expectedDefensiveAction ?? null,
    defensive_connection: input.defensiveConnection ?? null,
    defensive_adjustment: input.defensiveAdjustment ?? null,
    main_offensive_threat: input.mainOffensiveThreat ?? null,
    defensive_adjustment_result: input.defensiveAdjustmentResult ?? null,
    finish_type: input.finishType ?? null,
    shot_destination: input.shotDestination ?? null,
    shot_region: input.shotRegion ?? null,
    factual_result: input.factualResult,
    play_points: input.playPoints ?? null,
    play_score_reason: input.playScoreReason ?? null,
    main_cause: input.mainCause ?? null,
    video_ref: input.videoRef ?? null,
    free_notes: input.freeNotes ?? null,
  }
}

function serializeScoutParticipation(input: ScoutPlayParticipationWriteInput): Record<string, unknown> {
  return {
    participant_scope: input.participantScope,
    participant_side: input.participantSide,
    slot_order: input.slotOrder,
    athlete_id: input.athleteId ?? null,
    external_athlete_label: input.externalAthleteLabel ?? null,
    phase_of_athlete: input.phaseOfAthlete ?? null,
    participation_role: input.participationRole,
    position_code: input.positionCode ?? null,
    special_function_code: input.specialFunctionCode ?? null,
    action_code: input.actionCode ?? null,
    individual_result: input.individualResult ?? null,
    main_cause: input.mainCause ?? null,
    training_priority: input.trainingPriority ?? null,
  }
}

export async function fetchScoutCodebook(listKeys?: ScoutCodeListKey[]): Promise<ScoutCodeList[]> {
  assertSupabaseReady()

  let listQuery = supabase
    .from('scout_code_lists')
    .select('id, list_key, label, contract_scope, active, source_version')
    .eq('active', true)
    .order('list_key')

  if (listKeys?.length) {
    listQuery = listQuery.in('list_key', listKeys)
  }

  const { data: listRows, error: listError } = await listQuery
  if (listError) throw new Error(listError.message || 'Falha ao carregar listas do scout.')

  const lists = (listRows ?? []) as RawScoutCodeListRow[]
  if (lists.length === 0) return []

  const listIds = lists.map((row) => row.id)
  const { data: valueRows, error: valueError } = await supabase
    .from('scout_code_values')
    .select('id, list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, notes, active')
    .in('list_id', listIds)
    .eq('active', true)
    .order('sort_order')

  if (valueError) throw new Error(valueError.message || 'Falha ao carregar valores do scout.')

  const valuesByList = new Map<string, ScoutCodeValue[]>()
  for (const row of (valueRows ?? []) as RawScoutCodeValueRow[]) {
    const value: ScoutCodeValue = {
      id: row.id,
      listId: row.list_id,
      code: row.code,
      label: row.label,
      sortOrder: row.sort_order,
      isNaoAplica: row.is_nao_aplica,
      isNaoObservado: row.is_nao_observado,
      notes: toOptional(row.notes),
      active: row.active,
    }
    const current = valuesByList.get(row.list_id) ?? []
    current.push(value)
    valuesByList.set(row.list_id, current)
  }

  return lists.map((row) => ({
    id: row.id,
    listKey: row.list_key,
    label: row.label,
    contractScope: toOptional(row.contract_scope),
    active: row.active,
    sourceVersion: row.source_version,
    values: valuesByList.get(row.id) ?? [],
  }))
}

export async function fetchScoutFieldCodebookMap(contractName?: string): Promise<ScoutFieldCodebookMap[]> {
  assertSupabaseReady()

  let query = supabase
    .from('scout_field_codebook_map')
    .select('id, contract_name, field_name, selector_key, selector_value, list_key, allow_nao_aplica, allow_nao_observado, active')
    .eq('active', true)
    .order('contract_name')
    .order('field_name')
    .order('selector_key')
    .order('selector_value')

  if (contractName) {
    query = query.eq('contract_name', contractName)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message || 'Falha ao carregar mapeamentos do scout.')

  return ((data ?? []) as RawScoutFieldCodebookMapRow[]).map((row) => ({
    id: row.id,
    contractName: row.contract_name,
    fieldName: row.field_name,
    selectorKey: row.selector_key,
    selectorValue: row.selector_value,
    listKey: row.list_key,
    allowNaoAplica: row.allow_nao_aplica,
    allowNaoObservado: row.allow_nao_observado,
    active: row.active,
  }))
}

export async function getScoutPlayBundle(scoutPlayId: string, teamId?: string): Promise<ScoutPlayBundle> {
  assertSupabaseReady()

  const resolvedTeamId = resolveTeamId(teamId)
  const { data, error } = await supabase.rpc('get_scout_play_bundle', {
    input_team_id: resolvedTeamId,
    input_scout_play_id: scoutPlayId,
  })

  if (error) {
    throw new Error(error.message || 'Falha ao carregar jogada do scout.')
  }

  return mapScoutBundle(data as RawScoutPlayBundle)
}

export async function upsertScoutPlayBundle(input: ScoutPlayBundleUpsertInput): Promise<ScoutPlayBundle> {
  assertSupabaseReady()

  const resolvedTeamId = resolveTeamId(input.teamId)
  const { data, error } = await supabase.rpc('upsert_scout_play_bundle', {
    input_team_id: resolvedTeamId,
    input_scout_game_id: input.scoutGameId,
    input_play: serializeScoutPlay(input.play),
    input_participations: (input.participations ?? []).map(serializeScoutParticipation),
  })

  if (error) {
    throw new Error(error.message || 'Falha ao salvar jogada do scout.')
  }

  return getScoutPlayBundle(data as string, resolvedTeamId)
}

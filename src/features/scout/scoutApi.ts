import { assertSupabaseTeamId } from '@/features/presence-tokens/presenceTokenConfig'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import type {
  ScoutCodeList,
  ScoutCodeListKey,
  ScoutCodeValue,
  ScoutFieldCodebookMap,
  ScoutGameAthlete,
  ScoutGameRecord,
  ScoutGameWriteInput,
  ScoutLiveEntry,
  ScoutLiveEntryWriteInput,
  ScoutPlay,
  ScoutPlayBundle,
  ScoutPlayBundleUpsertInput,
  ScoutPlayListItem,
  ScoutPlayParticipation,
  ScoutPlayParticipationWriteInput,
  ScoutMentalEvent,
  ScoutMentalEventWriteInput,
  ScoutPlayValidation,
  ScoutPlayValidationWriteInput,
  ScoutPlayWriteInput,
  AthleteWithScoutProfile,
  AthleteWithScoutProfileWriteInput,
  ScoutAthleteFilters,
  ScoutCatalogTeam,
  ScoutCatalogTeamWriteInput,
  ScoutCatalogTeamFilters,
  ScoutReport,
  ScoutReportFilters,
  ScoutReportTrainingPriority,
  ScoutFeedback,
  ScoutFeedbackFilters,
  ScoutFeedbackRecipient,
  ScoutFeedbackType,
  ScoutFeedbackStatus,
  ScoutValidationStatus,
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
  description: string | null
  when_to_use: string | null
  when_not_to_use: string | null
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
  out_situation: string | null
  numerical_structure_real: string | null
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

type RawScoutGameRow = {
  id: string
  team_id: string
  session_type: string | null
  game_date: string | null
  analyzed_team: string | null
  opponent: string | null
  location: string | null
  notes: string | null
  status: string
  created_at: string
  updated_at: string
}

type RawScoutLiveEntryRow = {
  id: string
  team_id: string
  scout_game_id: string
  id_jogada: string
  tempo_jogo: string
  fase_da_bola_code: string
  equipe_analisada_id: string
  fase_equipe_analisada_code: string
  sistema_ofensivo_code: string | null
  sistema_defensivo_code: string | null
  atleta_principal_id: string | null
  acao_principal_text: string | null
  acao_principal_suggestion_code: string | null
  acao_principal_is_custom: boolean | null
  tipo_finalizacao_code: string | null
  resultado_factual_code: string
  motivo_pontuacao_code: string | null
  pontos_jogada: number | null
  causa_provavel_code: string | null
  prioridade_treino_code: string | null
  video_ref: string | null
  status_validacao_code: string
  obs_geral: string | null
  categoria_acao_code: string | null
  acao_basica_code: string | null
  classificacao_acao_code: string | null
  execucao_bloqueio_code: string | null
  estrutura_transicao_code: string | null
  contexto_decisao_code: string | null
  contexto_arremesso_code: string | null
  acao_preparatoria_code: string | null
  derived_scout_play_id: string | null
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

const SCOUT_LIVE_ENTRY_SELECT =
  'id, team_id, scout_game_id, id_jogada, tempo_jogo, fase_da_bola_code, equipe_analisada_id, fase_equipe_analisada_code, sistema_ofensivo_code, sistema_defensivo_code, atleta_principal_id, acao_principal_text, acao_principal_suggestion_code, acao_principal_is_custom, tipo_finalizacao_code, resultado_factual_code, motivo_pontuacao_code, pontos_jogada, causa_provavel_code, prioridade_treino_code, video_ref, status_validacao_code, obs_geral, categoria_acao_code, acao_basica_code, classificacao_acao_code, execucao_bloqueio_code, estrutura_transicao_code, contexto_decisao_code, contexto_arremesso_code, acao_preparatoria_code, derived_scout_play_id, created_by, updated_by, created_at, updated_at'

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
    outSituation: toOptional(row.out_situation),
    numericalStructureReal: toOptional(row.numerical_structure_real),
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

function mapScoutGame(row: RawScoutGameRow): ScoutGameRecord {
  return {
    id: row.id,
    teamId: row.team_id,
    sessionType: row.session_type ? (row.session_type as ScoutGameRecord['sessionType']) : undefined,
    gameDate: toOptional(row.game_date),
    analyzedTeam: toOptional(row.analyzed_team),
    opponent: toOptional(row.opponent),
    location: toOptional(row.location),
    notes: toOptional(row.notes),
    status: row.status as ScoutGameRecord['status'],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapScoutLiveEntry(row: RawScoutLiveEntryRow): ScoutLiveEntry {
  return {
    id: row.id,
    teamId: row.team_id,
    scoutGameId: row.scout_game_id,
    idJogada: row.id_jogada,
    tempoJogo: row.tempo_jogo,
    faseDaBolaCode: row.fase_da_bola_code as ScoutLiveEntry['faseDaBolaCode'],
    equipeAnalisadaId: row.equipe_analisada_id,
    faseEquipeAnalisadaCode: row.fase_equipe_analisada_code as ScoutLiveEntry['faseEquipeAnalisadaCode'],
    sistemaOfensivoCode: toOptional(row.sistema_ofensivo_code),
    sistemaDefensivoCode: toOptional(row.sistema_defensivo_code),
    atletaPrincipalId: toOptional(row.atleta_principal_id),
    acaoPrincipalText: toOptional(row.acao_principal_text),
    acaoPrincipalSuggestionCode: toOptional(row.acao_principal_suggestion_code),
    acaoPrincipalIsCustom: row.acao_principal_is_custom ?? undefined,
    tipoFinalizacaoCode: toOptional(row.tipo_finalizacao_code) as ScoutLiveEntry['tipoFinalizacaoCode'],
    resultadoFactualCode: row.resultado_factual_code as ScoutLiveEntry['resultadoFactualCode'],
    motivoPontuacaoCode: toOptional(row.motivo_pontuacao_code) as ScoutLiveEntry['motivoPontuacaoCode'],
    pontosJogada: row.pontos_jogada == null ? undefined : (row.pontos_jogada as 0 | 1 | 2),
    causaProvavelCode: toOptional(row.causa_provavel_code),
    prioridadeTreinoCode: toOptional(row.prioridade_treino_code),
    videoRef: toOptional(row.video_ref),
    statusValidacaoCode: row.status_validacao_code as ScoutLiveEntry['statusValidacaoCode'],
    obsGeral: toOptional(row.obs_geral),
    categoriaAcaoCode: toOptional(row.categoria_acao_code),
    acaoBasicaCode: toOptional(row.acao_basica_code),
    classificacaoAcaoCode: toOptional(row.classificacao_acao_code),
    execucaoBloqueioCode: toOptional(row.execucao_bloqueio_code),
    estruturaTransicaoCode: toOptional(row.estrutura_transicao_code),
    contextoDecisaoCode: toOptional(row.contexto_decisao_code),
    contextoArremessoCode: toOptional(row.contexto_arremesso_code),
    acaoPreparatoriaCode: toOptional(row.acao_preparatoria_code),
    derivedScoutPlayId: toOptional(row.derived_scout_play_id),
    createdBy: toOptional(row.created_by),
    updatedBy: toOptional(row.updated_by),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function serializeScoutLiveEntry(input: ScoutLiveEntryWriteInput, teamId: string): Record<string, unknown> {
  return {
    team_id: teamId,
    scout_game_id: input.scoutGameId,
    id_jogada: input.idJogada,
    tempo_jogo: input.tempoJogo,
    fase_da_bola_code: input.faseDaBolaCode,
    equipe_analisada_id: input.equipeAnalisadaId,
    fase_equipe_analisada_code: input.faseEquipeAnalisadaCode,
    sistema_ofensivo_code: input.sistemaOfensivoCode ?? null,
    sistema_defensivo_code: input.sistemaDefensivoCode ?? null,
    atleta_principal_id: input.atletaPrincipalId ?? null,
    acao_principal_text: input.acaoPrincipalText ?? null,
    acao_principal_suggestion_code: input.acaoPrincipalSuggestionCode ?? null,
    acao_principal_is_custom: input.acaoPrincipalIsCustom ?? null,
    tipo_finalizacao_code: input.tipoFinalizacaoCode ?? null,
    resultado_factual_code: input.resultadoFactualCode,
    motivo_pontuacao_code: input.motivoPontuacaoCode ?? null,
    pontos_jogada: input.pontosJogada ?? null,
    causa_provavel_code: input.causaProvavelCode ?? null,
    prioridade_treino_code: input.prioridadeTreinoCode ?? null,
    video_ref: input.videoRef ?? null,
    status_validacao_code: input.statusValidacaoCode ?? 'PENDENTE',
    obs_geral: input.obsGeral ?? null,
    derived_scout_play_id: input.derivedScoutPlayId ?? null,
    estrutura_transicao_code: input.estruturaTransicaoCode ?? null,
    acao_preparatoria_code: input.acaoPreparatoriaCode ?? null,
  }
}

function serializeScoutLiveEntryCreateInput(input: ScoutLiveEntryWriteInput): Record<string, unknown> {
  return {
    id_jogada: input.idJogada,
    scout_game_id: input.scoutGameId,
    tempo_jogo: input.tempoJogo,
    fase_da_bola_code: input.faseDaBolaCode,
    equipe_analisada_id: input.equipeAnalisadaId,
    fase_equipe_analisada_code: input.faseEquipeAnalisadaCode,
    sistema_ofensivo_code: input.sistemaOfensivoCode ?? null,
    sistema_defensivo_code: input.sistemaDefensivoCode ?? null,
    atleta_principal_id: input.atletaPrincipalId ?? null,
    acao_principal_text: input.acaoPrincipalText ?? null,
    acao_principal_suggestion_code: input.acaoPrincipalSuggestionCode ?? null,
    acao_principal_is_custom: input.acaoPrincipalIsCustom ?? null,
    tipo_finalizacao_code: input.tipoFinalizacaoCode ?? null,
    resultado_factual_code: input.resultadoFactualCode,
    motivo_pontuacao_code: input.motivoPontuacaoCode ?? null,
    pontos_jogada: input.pontosJogada ?? null,
    causa_provavel_code: input.causaProvavelCode ?? null,
    prioridade_treino_code: input.prioridadeTreinoCode ?? null,
    video_ref: input.videoRef ?? null,
    status_validacao_code: input.statusValidacaoCode ?? 'PENDENTE',
    obs_geral: input.obsGeral ?? null,
    categoria_acao_code: input.categoriaAcaoCode ?? null,
    acao_basica_code: input.acaoBasicaCode ?? null,
    classificacao_acao_code: input.classificacaoAcaoCode ?? null,
    execucao_bloqueio_code: input.execucaoBloqueioCode ?? null,
    estrutura_transicao_code: input.estruturaTransicaoCode ?? null,
    contexto_decisao_code: input.contextoDecisaoCode ?? null,
    contexto_arremesso_code: input.contextoArremessoCode ?? null,
    acao_preparatoria_code: input.acaoPreparatoriaCode ?? null,
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
    out_situation: input.outSituation ?? null,
    numerical_structure_real: input.numericalStructureReal ?? null,
    out_cause: input.outCause ?? null,
    special_context: input.specialContext ?? null,
    shootout_type: input.shootoutType ?? null,
    shootout_result: input.shootoutResult ?? null,
    shootout_decision: input.shootoutDecision ?? null,
    shootout_execution: input.shootoutExecution ?? null,
    tiro_6m_result: input.tiro6mResult ?? null,
    tiro_livre_result: input.tiroLivreResult ?? null,
    reposicao_lateral_result: input.reposicaoLateralResult ?? null,
    reposicao_goleira_result: input.reposicaoGoleiraResult ?? null,
    reposicao_apos_gol_result: input.reposicaoAposGolResult ?? null,
    golden_goal_situation: input.goldenGoalSituation ?? null,
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
    .select('id, list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, notes, description, when_to_use, when_not_to_use, active')
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
      description: toOptional(row.description),
      whenToUse: toOptional(row.when_to_use),
      whenNotToUse: toOptional(row.when_not_to_use),
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

export async function fetchScoutGames(teamId?: string): Promise<ScoutGameRecord[]> {
  assertSupabaseReady()

  const resolvedTeamId = resolveTeamId(teamId)
  const { data, error } = await supabase
    .from('scout_games')
    .select('id, team_id, session_type, game_date, analyzed_team, opponent, location, notes, status, created_at, updated_at')
    .eq('team_id', resolvedTeamId)
    .order('game_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message || 'Falha ao carregar jogos do scout.')
  }

  return ((data ?? []) as RawScoutGameRow[]).map(mapScoutGame)
}

export async function createScoutGame(input: ScoutGameWriteInput, teamId?: string): Promise<ScoutGameRecord> {
  assertSupabaseReady()

  const resolvedTeamId = resolveTeamId(teamId)
  const { data, error } = await supabase
    .from('scout_games')
    .insert({
      team_id: resolvedTeamId,
      session_type: input.sessionType ?? null,
      game_date: input.gameDate ?? null,
      analyzed_team: input.analyzedTeam ?? null,
      opponent: input.opponent ?? null,
      location: input.location ?? null,
      notes: input.notes ?? null,
      status: input.status ?? 'em_andamento',
    })
    .select('id, team_id, session_type, game_date, analyzed_team, opponent, location, notes, status, created_at, updated_at')
    .single<RawScoutGameRow>()

  if (error) {
    throw new Error(error.message || 'Falha ao criar sessão do scout.')
  }

  return mapScoutGame(data)
}

export async function fetchScoutGameAthletes(scoutGameId: string, teamId?: string): Promise<ScoutGameAthlete[]> {
  assertSupabaseReady()

  const resolvedTeamId = resolveTeamId(teamId)
  const { data, error } = await supabase
    .from('scout_game_athletes')
    .select('id, team_id, scout_game_id, athlete_id, created_at')
    .eq('scout_game_id', scoutGameId)
    .eq('team_id', resolvedTeamId)
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(error.message || 'Falha ao carregar elenco da sessão.')
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    teamId: row.team_id as string,
    scoutGameId: row.scout_game_id as string,
    athleteId: row.athlete_id as string,
    createdAt: row.created_at as string,
  }))
}

export async function addAthleteToGame(
  scoutGameId: string,
  athleteId: string,
  teamId?: string,
): Promise<ScoutGameAthlete> {
  assertSupabaseReady()

  const resolvedTeamId = resolveTeamId(teamId)
  const { data, error } = await supabase
    .from('scout_game_athletes')
    .insert({ team_id: resolvedTeamId, scout_game_id: scoutGameId, athlete_id: athleteId })
    .select('id, team_id, scout_game_id, athlete_id, created_at')
    .single()

  if (error) {
    throw new Error(error.message || 'Falha ao adicionar atleta ao elenco.')
  }

  return {
    id: data.id as string,
    teamId: data.team_id as string,
    scoutGameId: data.scout_game_id as string,
    athleteId: data.athlete_id as string,
    createdAt: data.created_at as string,
  }
}

export async function removeAthleteFromGame(
  scoutGameId: string,
  athleteId: string,
  teamId?: string,
): Promise<void> {
  assertSupabaseReady()

  const resolvedTeamId = resolveTeamId(teamId)
  const { error } = await supabase
    .from('scout_game_athletes')
    .delete()
    .eq('scout_game_id', scoutGameId)
    .eq('athlete_id', athleteId)
    .eq('team_id', resolvedTeamId)

  if (error) {
    throw new Error(error.message || 'Falha ao remover atleta do elenco.')
  }
}

export async function fetchScoutLiveEntriesForGame(scoutGameId: string, teamId?: string): Promise<ScoutLiveEntry[]> {
  assertSupabaseReady()

  const resolvedTeamId = resolveTeamId(teamId)
  const { data, error } = await supabase
    .from('scout_live_entries')
    .select(SCOUT_LIVE_ENTRY_SELECT)
    .eq('team_id', resolvedTeamId)
    .eq('scout_game_id', scoutGameId)
    .is('deleted_at', null)
    .order('created_at')

  if (error) {
    throw new Error(error.message || 'Falha ao carregar entradas da coleta ao vivo.')
  }

  return ((data ?? []) as RawScoutLiveEntryRow[]).map(mapScoutLiveEntry)
}

export async function getScoutLiveEntry(liveEntryId: string, teamId?: string): Promise<ScoutLiveEntry> {
  assertSupabaseReady()

  const resolvedTeamId = resolveTeamId(teamId)
  const { data, error } = await supabase
    .from('scout_live_entries')
    .select(SCOUT_LIVE_ENTRY_SELECT)
    .eq('team_id', resolvedTeamId)
    .eq('id', liveEntryId)
    .is('deleted_at', null)
    .single<RawScoutLiveEntryRow>()

  if (error) {
    throw new Error(error.message || 'Falha ao carregar entrada da coleta ao vivo.')
  }

  return mapScoutLiveEntry(data)
}

export async function createScoutLiveEntry(input: ScoutLiveEntryWriteInput, teamId?: string): Promise<ScoutLiveEntry> {
  assertSupabaseReady()

  resolveTeamId(teamId)
  const { data, error } = await supabase
    .rpc('create_scout_live_entry', {
      input_entry: serializeScoutLiveEntryCreateInput(input),
    })
    .single<RawScoutLiveEntryRow>()

  if (error) {
    throw new Error(error.message || 'Falha ao criar entrada da coleta ao vivo.')
  }

  return mapScoutLiveEntry(data)
}

export async function updateScoutLiveEntry(
  liveEntryId: string,
  input: Partial<ScoutLiveEntryWriteInput>,
  teamId?: string,
): Promise<ScoutLiveEntry> {
  assertSupabaseReady()

  const resolvedTeamId = resolveTeamId(teamId)
  const payload: Record<string, unknown> = {}

  if (input.scoutGameId !== undefined) payload.scout_game_id = input.scoutGameId
  if (input.idJogada !== undefined) payload.id_jogada = input.idJogada
  if (input.tempoJogo !== undefined) payload.tempo_jogo = input.tempoJogo
  if (input.faseDaBolaCode !== undefined) payload.fase_da_bola_code = input.faseDaBolaCode
  if (input.equipeAnalisadaId !== undefined) payload.equipe_analisada_id = input.equipeAnalisadaId
  if (input.faseEquipeAnalisadaCode !== undefined) payload.fase_equipe_analisada_code = input.faseEquipeAnalisadaCode
  if (input.sistemaOfensivoCode !== undefined) payload.sistema_ofensivo_code = input.sistemaOfensivoCode ?? null
  if (input.sistemaDefensivoCode !== undefined) payload.sistema_defensivo_code = input.sistemaDefensivoCode ?? null
  if (input.atletaPrincipalId !== undefined) payload.atleta_principal_id = input.atletaPrincipalId ?? null
  if (input.acaoPrincipalText !== undefined) payload.acao_principal_text = input.acaoPrincipalText ?? null
  if (input.acaoPrincipalSuggestionCode !== undefined) payload.acao_principal_suggestion_code = input.acaoPrincipalSuggestionCode ?? null
  if (input.acaoPrincipalIsCustom !== undefined) payload.acao_principal_is_custom = input.acaoPrincipalIsCustom
  if (input.tipoFinalizacaoCode !== undefined) payload.tipo_finalizacao_code = input.tipoFinalizacaoCode ?? null
  if (input.resultadoFactualCode !== undefined) payload.resultado_factual_code = input.resultadoFactualCode
  if (input.motivoPontuacaoCode !== undefined) payload.motivo_pontuacao_code = input.motivoPontuacaoCode ?? null
  if (input.pontosJogada !== undefined) payload.pontos_jogada = input.pontosJogada ?? null
  if (input.causaProvavelCode !== undefined) payload.causa_provavel_code = input.causaProvavelCode ?? null
  if (input.prioridadeTreinoCode !== undefined) payload.prioridade_treino_code = input.prioridadeTreinoCode ?? null
  if (input.videoRef !== undefined) payload.video_ref = input.videoRef ?? null
  if (input.statusValidacaoCode !== undefined) payload.status_validacao_code = input.statusValidacaoCode
  if (input.obsGeral !== undefined) payload.obs_geral = input.obsGeral ?? null
  if (input.categoriaAcaoCode !== undefined) payload.categoria_acao_code = input.categoriaAcaoCode ?? null
  if (input.acaoBasicaCode !== undefined) payload.acao_basica_code = input.acaoBasicaCode ?? null
  if (input.classificacaoAcaoCode !== undefined) payload.classificacao_acao_code = input.classificacaoAcaoCode ?? null
  if (input.execucaoBloqueioCode !== undefined) payload.execucao_bloqueio_code = input.execucaoBloqueioCode ?? null
  if (input.estruturaTransicaoCode !== undefined) payload.estrutura_transicao_code = input.estruturaTransicaoCode ?? null
  if (input.contextoDecisaoCode !== undefined) payload.contexto_decisao_code = input.contextoDecisaoCode ?? null
  if (input.contextoArremessoCode !== undefined) payload.contexto_arremesso_code = input.contextoArremessoCode ?? null
  if (input.acaoPreparatoriaCode !== undefined) payload.acao_preparatoria_code = input.acaoPreparatoriaCode ?? null
  if (input.derivedScoutPlayId !== undefined) payload.derived_scout_play_id = input.derivedScoutPlayId ?? null

  const { data, error } = await supabase
    .from('scout_live_entries')
    .update(payload)
    .eq('team_id', resolvedTeamId)
    .eq('id', liveEntryId)
    .select(SCOUT_LIVE_ENTRY_SELECT)
    .single<RawScoutLiveEntryRow>()

  if (error) {
    throw new Error(error.message || 'Falha ao atualizar entrada da coleta ao vivo.')
  }

  return mapScoutLiveEntry(data)
}

export async function updatePendingScoutLiveEntry(
  liveEntryId: string,
  input: Partial<ScoutLiveEntryWriteInput>,
  teamId?: string,
): Promise<ScoutLiveEntry> {
  assertSupabaseReady()

  const current = await getScoutLiveEntry(liveEntryId, teamId)
  if (current.statusValidacaoCode !== 'PENDENTE') {
    throw new Error('Somente entradas PENDENTE podem ser editadas na coleta ao vivo.')
  }

  const resolvedTeamId = resolveTeamId(teamId)
  const payload: Record<string, unknown> = {}

  if (input.scoutGameId !== undefined) payload.scout_game_id = input.scoutGameId
  if (input.idJogada !== undefined) payload.id_jogada = input.idJogada
  if (input.tempoJogo !== undefined) payload.tempo_jogo = input.tempoJogo
  if (input.faseDaBolaCode !== undefined) payload.fase_da_bola_code = input.faseDaBolaCode
  if (input.equipeAnalisadaId !== undefined) payload.equipe_analisada_id = input.equipeAnalisadaId
  if (input.faseEquipeAnalisadaCode !== undefined) payload.fase_equipe_analisada_code = input.faseEquipeAnalisadaCode
  if (input.sistemaOfensivoCode !== undefined) payload.sistema_ofensivo_code = input.sistemaOfensivoCode ?? null
  if (input.sistemaDefensivoCode !== undefined) payload.sistema_defensivo_code = input.sistemaDefensivoCode ?? null
  if (input.atletaPrincipalId !== undefined) payload.atleta_principal_id = input.atletaPrincipalId ?? null
  if (input.acaoPrincipalText !== undefined) payload.acao_principal_text = input.acaoPrincipalText ?? null
  if (input.acaoPrincipalSuggestionCode !== undefined) payload.acao_principal_suggestion_code = input.acaoPrincipalSuggestionCode ?? null
  if (input.acaoPrincipalIsCustom !== undefined) payload.acao_principal_is_custom = input.acaoPrincipalIsCustom
  if (input.tipoFinalizacaoCode !== undefined) payload.tipo_finalizacao_code = input.tipoFinalizacaoCode ?? null
  if (input.resultadoFactualCode !== undefined) payload.resultado_factual_code = input.resultadoFactualCode
  if (input.motivoPontuacaoCode !== undefined) payload.motivo_pontuacao_code = input.motivoPontuacaoCode ?? null
  if (input.pontosJogada !== undefined) payload.pontos_jogada = input.pontosJogada ?? null
  if (input.causaProvavelCode !== undefined) payload.causa_provavel_code = input.causaProvavelCode ?? null
  if (input.prioridadeTreinoCode !== undefined) payload.prioridade_treino_code = input.prioridadeTreinoCode ?? null
  if (input.videoRef !== undefined) payload.video_ref = input.videoRef ?? null
  if (input.statusValidacaoCode !== undefined) payload.status_validacao_code = input.statusValidacaoCode
  if (input.obsGeral !== undefined) payload.obs_geral = input.obsGeral ?? null
  if (input.categoriaAcaoCode !== undefined) payload.categoria_acao_code = input.categoriaAcaoCode ?? null
  if (input.acaoBasicaCode !== undefined) payload.acao_basica_code = input.acaoBasicaCode ?? null
  if (input.classificacaoAcaoCode !== undefined) payload.classificacao_acao_code = input.classificacaoAcaoCode ?? null
  if (input.execucaoBloqueioCode !== undefined) payload.execucao_bloqueio_code = input.execucaoBloqueioCode ?? null
  if (input.estruturaTransicaoCode !== undefined) payload.estrutura_transicao_code = input.estruturaTransicaoCode ?? null
  if (input.contextoDecisaoCode !== undefined) payload.contexto_decisao_code = input.contextoDecisaoCode ?? null
  if (input.contextoArremessoCode !== undefined) payload.contexto_arremesso_code = input.contextoArremessoCode ?? null
  if (input.acaoPreparatoriaCode !== undefined) payload.acao_preparatoria_code = input.acaoPreparatoriaCode ?? null
  if (input.derivedScoutPlayId !== undefined) payload.derived_scout_play_id = input.derivedScoutPlayId ?? null

  const { data, error } = await supabase
    .from('scout_live_entries')
    .update(payload)
    .eq('team_id', resolvedTeamId)
    .eq('id', liveEntryId)
    .eq('status_validacao_code', 'PENDENTE')
    .is('deleted_at', null)
    .select(SCOUT_LIVE_ENTRY_SELECT)
    .single<RawScoutLiveEntryRow>()

  if (error) {
    throw new Error(error.message || 'Falha ao editar entrada pendente da coleta ao vivo.')
  }

  return mapScoutLiveEntry(data)
}

export async function discardPendingScoutLiveEntry(liveEntryId: string, teamId?: string): Promise<void> {
  assertSupabaseReady()

  const current = await getScoutLiveEntry(liveEntryId, teamId)
  if (current.statusValidacaoCode !== 'PENDENTE') {
    throw new Error('Somente entradas PENDENTE podem ser excluídas na coleta ao vivo.')
  }
  if (current.derivedScoutPlayId) {
    throw new Error('Entradas já vinculadas a scout_play precisam seguir o fluxo de revisão.')
  }

  const resolvedTeamId = resolveTeamId(teamId)
  const { data, error } = await supabase
    .from('scout_live_entries')
    .update({ deleted_at: new Date().toISOString() })
    .eq('team_id', resolvedTeamId)
    .eq('id', liveEntryId)
    .eq('status_validacao_code', 'PENDENTE')
    .is('derived_scout_play_id', null)
    .is('deleted_at', null)
    .select('id')
    .maybeSingle()

  if (error) {
    throw new Error(error.message || 'Falha ao excluir entrada pendente da coleta ao vivo.')
  }

  if (!data) {
    throw new Error('A entrada não pôde ser excluída porque deixou de estar pendente.')
  }
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

export async function fetchScoutPlaysForGame(scoutGameId: string, teamId?: string): Promise<ScoutPlayListItem[]> {
  assertSupabaseReady()

  const resolvedTeamId = resolveTeamId(teamId)
  const { data, error } = await supabase
    .from('scout_plays')
    .select('id, team_id, scout_game_id, play_code, session_date, period, game_clock, phase_of_ball, factual_result, status_validacao_code, updated_at')
    .eq('team_id', resolvedTeamId)
    .eq('scout_game_id', scoutGameId)
    .is('deleted_at', null)
    .order('session_date', { ascending: false })
    .order('period')
    .order('game_clock')

  if (error) {
    throw new Error(error.message || 'Falha ao carregar jogadas do scout.')
  }

  return ((data ?? []) as Array<{
    id: string
    team_id: string
    scout_game_id: string
    play_code: string
    session_date: string
    period: string
    game_clock: string
    phase_of_ball: string
    factual_result: string
    status_validacao_code: string | null
    updated_at: string
  }>).map((row) => ({
    id: row.id,
    teamId: row.team_id,
    scoutGameId: row.scout_game_id,
    playCode: row.play_code,
    sessionDate: row.session_date,
    period: row.period,
    gameClock: row.game_clock,
    phaseOfBall: row.phase_of_ball as ScoutPlayListItem['phaseOfBall'],
    factualResult: row.factual_result,
    validationStatus: (row.status_validacao_code ?? 'PENDENTE') as ScoutValidationStatus,
    updatedAt: row.updated_at,
  }))
}

export async function patchScoutPlayStatus(
  playId: string,
  validationStatus: ScoutValidationStatus,
  teamId?: string,
): Promise<void> {
  assertSupabaseReady()
  const resolvedTeamId = resolveTeamId(teamId)
  const { error } = await supabase
    .from('scout_plays')
    .update({ status_validacao_code: validationStatus })
    .eq('team_id', resolvedTeamId)
    .eq('id', playId)
  if (error) throw new Error(error.message || 'Falha ao atualizar status de validação.')
}

export async function upsertScoutPlayBundle(input: ScoutPlayBundleUpsertInput): Promise<ScoutPlayBundle> {
  assertSupabaseReady()

  const resolvedTeamId = resolveTeamId(input.teamId)

  // ── API-19: Regra de OUT ────────────────────────────────────────────────────
  if (input.play.outSituation === 'OUT_ATAQUE' && input.play.numericalStructureReal !== 'OF_3_DEF_3') {
    throw new Error('Regra OUT: OUT_ATAQUE exige ESTRUTURA_NUMERICA_REAL = OF_3_DEF_3.')
  }
  if (input.play.outSituation === 'OUT_DEFESA' && input.play.numericalStructureReal !== 'OF_4_DEF_2') {
    throw new Error('Regra OUT: OUT_DEFESA exige ESTRUTURA_NUMERICA_REAL = OF_4_DEF_2.')
  }
  // ───────────────────────────────────────────────────────────────────────────

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

// ── API-06: Scout Mental Events ──────────────────────────────────────────────

type RawScoutMentalEventRow = {
  id: string
  team_id: string
  scout_game_id: string
  scout_play_id: string
  athlete_id: string | null
  external_athlete_label: string | null
  mental_code: string
  mental_mark: string
  pressure_context: string | null
  mental_trigger: string | null
  response_after_error: string | null
  impact_previous_error: string | null
  pressure_behavior: string | null
  reset_quality: string | null
  critical_communication: string | null
  body_language: string | null
  pressure_profile_game: string | null
  error_sequence: string | null
  post_error_action: string | null
  mental_observation: string | null
  validation_status: string
  created_at: string
}

function mapScoutMentalEvent(row: RawScoutMentalEventRow): ScoutMentalEvent {
  return {
    id: row.id,
    teamId: row.team_id,
    scoutGameId: row.scout_game_id,
    scoutPlayId: row.scout_play_id,
    athleteId: row.athlete_id ?? undefined,
    externalAthleteLabel: row.external_athlete_label ?? undefined,
    mentalCode: row.mental_code,
    mentalMark: row.mental_mark,
    pressureContext: row.pressure_context ?? undefined,
    mentalTrigger: row.mental_trigger ?? undefined,
    responseAfterError: row.response_after_error ?? undefined,
    impactPreviousError: row.impact_previous_error ?? undefined,
    pressureBehavior: row.pressure_behavior ?? undefined,
    resetQuality: row.reset_quality ?? undefined,
    criticalCommunication: row.critical_communication ?? undefined,
    bodyLanguage: row.body_language ?? undefined,
    pressureProfileGame: row.pressure_profile_game ?? undefined,
    errorSequence: row.error_sequence ?? undefined,
    postErrorAction: row.post_error_action ?? undefined,
    mentalObservation: row.mental_observation ?? undefined,
    validationStatus: row.validation_status as ScoutMentalEvent['validationStatus'],
    createdAt: row.created_at,
  }
}

function serializeScoutMentalEvent(input: ScoutMentalEventWriteInput): Record<string, unknown> {
  return {
    scout_game_id: input.scoutGameId,
    scout_play_id: input.scoutPlayId,
    athlete_id: input.athleteId ?? null,
    external_athlete_label: input.externalAthleteLabel ?? null,
    mental_code: input.mentalCode,
    mental_mark: input.mentalMark,
    pressure_context: input.pressureContext ?? null,
    mental_trigger: input.mentalTrigger ?? null,
    response_after_error: input.responseAfterError ?? null,
    impact_previous_error: input.impactPreviousError ?? null,
    pressure_behavior: input.pressureBehavior ?? null,
    reset_quality: input.resetQuality ?? null,
    critical_communication: input.criticalCommunication ?? null,
    body_language: input.bodyLanguage ?? null,
    pressure_profile_game: input.pressureProfileGame ?? null,
    error_sequence: input.errorSequence ?? null,
    post_error_action: input.postErrorAction ?? null,
    mental_observation: input.mentalObservation ?? null,
    validation_status: input.validationStatus ?? 'PENDENTE',
  }
}

const MENTAL_EVENT_SELECT =
  'id, team_id, scout_game_id, scout_play_id, athlete_id, external_athlete_label, mental_code, mental_mark, pressure_context, mental_trigger, response_after_error, impact_previous_error, pressure_behavior, reset_quality, critical_communication, body_language, pressure_profile_game, error_sequence, post_error_action, mental_observation, validation_status, created_at'

export async function createScoutMentalEvent(
  input: ScoutMentalEventWriteInput,
  teamId?: string,
): Promise<ScoutMentalEvent> {
  assertSupabaseReady()
  const resolvedTeamId = resolveTeamId(teamId)
  const { data, error } = await supabase
    .from('scout_mental_events')
    .insert({ team_id: resolvedTeamId, ...serializeScoutMentalEvent(input) })
    .select(MENTAL_EVENT_SELECT)
    .single<RawScoutMentalEventRow>()
  if (error) throw new Error(error.message || 'Falha ao criar evento mental.')
  return mapScoutMentalEvent(data)
}

export async function fetchScoutMentalEventsForPlay(
  scoutPlayId: string,
  teamId?: string,
): Promise<ScoutMentalEvent[]> {
  assertSupabaseReady()
  const resolvedTeamId = resolveTeamId(teamId)
  const { data, error } = await supabase
    .from('scout_mental_events')
    .select(MENTAL_EVENT_SELECT)
    .eq('team_id', resolvedTeamId)
    .eq('scout_play_id', scoutPlayId)
    .order('created_at', { ascending: true })
    .returns<RawScoutMentalEventRow[]>()
  if (error) throw new Error(error.message || 'Falha ao buscar eventos mentais.')
  return (data ?? []).map(mapScoutMentalEvent)
}

// ── API-07: Scout Play Validations ───────────────────────────────────────────

type RawScoutPlayValidationRow = {
  id: string
  team_id: string
  scout_game_id: string
  scout_play_id: string
  field_name: string
  original_value: string | null
  corrected_value: string | null
  validation_status: string
  validator_user_id: string | null
  validation_at: string | null
  correction_reason: string
  validation_notes: string | null
  created_at: string
}

function mapScoutPlayValidation(row: RawScoutPlayValidationRow): ScoutPlayValidation {
  return {
    id: row.id,
    teamId: row.team_id,
    scoutGameId: row.scout_game_id,
    scoutPlayId: row.scout_play_id,
    fieldName: row.field_name,
    originalValue: row.original_value ?? undefined,
    correctedValue: row.corrected_value ?? undefined,
    validationStatus: row.validation_status as ScoutPlayValidation['validationStatus'],
    validatorUserId: row.validator_user_id ?? undefined,
    validationAt: row.validation_at ?? undefined,
    correctionReason: row.correction_reason,
    validationNotes: row.validation_notes ?? undefined,
    createdAt: row.created_at,
  }
}

function serializeScoutPlayValidation(input: ScoutPlayValidationWriteInput): Record<string, unknown> {
  return {
    scout_game_id: input.scoutGameId,
    scout_play_id: input.scoutPlayId,
    field_name: input.fieldName,
    original_value: input.originalValue ?? null,
    corrected_value: input.correctedValue ?? null,
    validation_status: input.validationStatus,
    validator_user_id: input.validatorUserId ?? null,
    validation_at: input.validationAt ?? null,
    correction_reason: input.correctionReason,
    validation_notes: input.validationNotes ?? null,
  }
}

const VALIDATION_SELECT =
  'id, team_id, scout_game_id, scout_play_id, field_name, original_value, corrected_value, validation_status, validator_user_id, validation_at, correction_reason, validation_notes, created_at'

export async function createScoutPlayValidation(
  input: ScoutPlayValidationWriteInput,
  teamId?: string,
): Promise<ScoutPlayValidation> {
  assertSupabaseReady()
  const resolvedTeamId = resolveTeamId(teamId)
  const { data, error } = await supabase
    .from('scout_play_validations')
    .insert({ team_id: resolvedTeamId, ...serializeScoutPlayValidation(input) })
    .select(VALIDATION_SELECT)
    .single<RawScoutPlayValidationRow>()
  if (error) throw new Error(error.message || 'Falha ao registrar validação.')
  return mapScoutPlayValidation(data)
}

export async function fetchScoutPlayValidationsForPlay(
  scoutPlayId: string,
  teamId?: string,
): Promise<ScoutPlayValidation[]> {
  assertSupabaseReady()
  const resolvedTeamId = resolveTeamId(teamId)
  const { data, error } = await supabase
    .from('scout_play_validations')
    .select(VALIDATION_SELECT)
    .eq('team_id', resolvedTeamId)
    .eq('scout_play_id', scoutPlayId)
    .order('created_at', { ascending: true })
    .returns<RawScoutPlayValidationRow[]>()
  if (error) throw new Error(error.message || 'Falha ao buscar validações.')
  return (data ?? []).map(mapScoutPlayValidation)
}

// ── API-08/09: Scout Athletes (CAD_ATLETAS) ──────────────────────────────────
type RawAthleteWithScoutProfileRow = {
  athlete_id: string
  team_id: string
  dominant_hand: string | null
  main_function: string | null
  pos_of_3x1: string | null
  pos_of_4x0: string | null
  pos_def_3x0: string | null
  is_goalkeeper: boolean
  is_specialist: boolean
  is_playmaker: boolean
  created_at: string
  updated_at: string
  athletes: {
    id: string
    team_id: string
    user_id: string | null
    name: string
    email: string | null
    phone: string | null
    category: string | null
    level: string | null
    status: string
    notes: string | null
    created_at: string
    updated_at: string
  }
}

function mapAthleteWithScoutProfile(
  row: RawAthleteWithScoutProfileRow,
): AthleteWithScoutProfile {
  return {
    id: row.athletes.id,
    teamId: row.team_id,
    userId: row.athletes.user_id ?? undefined,
    name: row.athletes.name,
    email: row.athletes.email ?? undefined,
    phone: row.athletes.phone ?? undefined,
    category: row.athletes.category ?? undefined,
    level: row.athletes.level ?? undefined,
    status: row.athletes.status as AthleteWithScoutProfile['status'],
    notes: row.athletes.notes ?? undefined,
    athleteCreatedAt: row.athletes.created_at,
    athleteUpdatedAt: row.athletes.updated_at,
    dominantHand: row.dominant_hand ?? undefined,
    mainFunction: row.main_function ?? undefined,
    posOf3x1: row.pos_of_3x1 ?? undefined,
    posOf4x0: row.pos_of_4x0 ?? undefined,
    posDefOf3x0: row.pos_def_3x0 ?? undefined,
    isGoalkeeper: row.is_goalkeeper,
    isSpecialist: row.is_specialist,
    isPlaymaker: row.is_playmaker,
    scoutProfileCreatedAt: row.created_at,
    scoutProfileUpdatedAt: row.updated_at,
  }
}

const ATHLETE_PROFILE_SELECT =
  'athlete_id, team_id, dominant_hand, main_function, pos_of_3x1, pos_of_4x0, pos_def_3x0, is_goalkeeper, is_specialist, is_playmaker, created_at, updated_at, athletes!athlete_scout_profiles_athlete_team_fk(id, team_id, user_id, name, email, phone, category, level, status, notes, created_at, updated_at)'

export async function fetchScoutAthletes(
  filters?: ScoutAthleteFilters,
  teamId?: string,
): Promise<AthleteWithScoutProfile[]> {
  assertSupabaseReady()
  const resolvedTeamId = resolveTeamId(teamId)
  let query = supabase
    .from('athlete_scout_profiles')
    .select(ATHLETE_PROFILE_SELECT)
    .eq('team_id', resolvedTeamId)

  if (filters?.isGoalkeeper !== undefined) {
    query = query.eq('is_goalkeeper', filters.isGoalkeeper)
  }
  if (filters?.mainFunction) {
    query = query.eq('main_function', filters.mainFunction)
  }

  const { data, error } = await query.returns<RawAthleteWithScoutProfileRow[]>()
  if (error) throw new Error(error.message || 'Falha ao listar atletas scout.')

  let results = (data ?? []).map(mapAthleteWithScoutProfile)

  if (filters?.name) {
    const term = filters.name.toLowerCase()
    results = results.filter((a) => a.name.toLowerCase().includes(term))
  }
  if (filters?.status) {
    results = results.filter((a) => a.status === filters.status)
  }

  return results.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
}

export async function createScoutAthlete(
  input: AthleteWithScoutProfileWriteInput,
  teamId?: string,
): Promise<AthleteWithScoutProfile> {
  assertSupabaseReady()
  const resolvedTeamId = resolveTeamId(teamId)

  // 1. Criar registro base em athletes
  const { data: athleteRow, error: athleteError } = await supabase
    .from('athletes')
    .insert({
      team_id: resolvedTeamId,
      name: input.name,
      email: input.email ?? null,
      phone: input.phone ?? null,
      category: input.category ?? null,
      level: input.level ?? null,
      status: input.status ?? 'ativo',
      notes: input.notes ?? null,
    })
    .select('id')
    .single<{ id: string }>()
  if (athleteError) throw new Error(athleteError.message || 'Falha ao criar atleta.')

  // 2. Criar perfil scout em athlete_scout_profiles
  const { data: profileRow, error: profileError } = await supabase
    .from('athlete_scout_profiles')
    .insert({
      athlete_id: athleteRow.id,
      team_id: resolvedTeamId,
      dominant_hand: input.dominantHand ?? null,
      main_function: input.mainFunction ?? null,
      pos_of_3x1: input.posOf3x1 ?? null,
      pos_of_4x0: input.posOf4x0 ?? null,
      pos_def_3x0: input.posDefOf3x0 ?? null,
      is_goalkeeper: input.isGoalkeeper ?? false,
      is_specialist: input.isSpecialist ?? false,
      is_playmaker: input.isPlaymaker ?? false,
    })
    .select(ATHLETE_PROFILE_SELECT)
    .single<RawAthleteWithScoutProfileRow>()
  if (profileError) throw new Error(profileError.message || 'Falha ao criar perfil scout da atleta.')

  return mapAthleteWithScoutProfile(profileRow)
}

// ── API-10: Scout Catalog Teams (CAD_EQUIPES) ────────────────────────────────
type RawScoutCatalogTeamRow = {
  id: string
  team_id: string
  name: string
  team_type: string | null
  category: string | null
  is_internal: boolean
  linked_team_id: string | null
  created_at: string
  updated_at: string
}

function mapScoutCatalogTeam(row: RawScoutCatalogTeamRow): ScoutCatalogTeam {
  return {
    id: row.id,
    teamId: row.team_id,
    name: row.name,
    teamType: row.team_type ?? undefined,
    category: row.category ?? undefined,
    isInternal: row.is_internal,
    linkedTeamId: row.linked_team_id ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

const CATALOG_TEAM_SELECT =
  'id, team_id, name, team_type, category, is_internal, linked_team_id, created_at, updated_at'

export async function fetchScoutCatalogTeams(
  filters?: ScoutCatalogTeamFilters,
  teamId?: string,
): Promise<ScoutCatalogTeam[]> {
  assertSupabaseReady()
  const resolvedTeamId = resolveTeamId(teamId)
  let query = supabase
    .from('scout_catalog_teams')
    .select(CATALOG_TEAM_SELECT)
    .eq('team_id', resolvedTeamId)

  if (filters?.teamType) {
    query = query.eq('team_type', filters.teamType)
  }
  if (filters?.category) {
    query = query.eq('category', filters.category)
  }
  if (filters?.isInternal !== undefined) {
    query = query.eq('is_internal', filters.isInternal)
  }

  const { data, error } = await query
    .order('name')
    .returns<RawScoutCatalogTeamRow[]>()
  if (error) throw new Error(error.message || 'Falha ao listar equipes catálogo.')

  let results = (data ?? []).map(mapScoutCatalogTeam)

  if (filters?.name) {
    const term = filters.name.toLowerCase()
    results = results.filter((t) => t.name.toLowerCase().includes(term))
  }

  return results
}

export async function createScoutCatalogTeam(
  input: ScoutCatalogTeamWriteInput,
  teamId?: string,
): Promise<ScoutCatalogTeam> {
  assertSupabaseReady()
  const resolvedTeamId = resolveTeamId(teamId)
  const { data, error } = await supabase
    .from('scout_catalog_teams')
    .insert({
      team_id: resolvedTeamId,
      name: input.name,
      team_type: input.teamType ?? null,
      category: input.category ?? null,
      is_internal: input.isInternal ?? false,
      linked_team_id: input.linkedTeamId ?? null,
    })
    .select(CATALOG_TEAM_SELECT)
    .single<RawScoutCatalogTeamRow>()
  if (error) throw new Error(error.message || 'Falha ao criar equipe catálogo.')
  return mapScoutCatalogTeam(data)
}

// ─── API-12: scout_report ────────────────────────────────────────────────────

type RawScoutReportRow = {
  id: string
  team_id: string
  scout_game_id: string
  report_block: string
  indicator: string
  value_text: string | null
  sample_size: number | null
  technical_reading: string | null
  training_priority: string | null
  evidence_ids: string[] | null
  report_notes: string | null
  created_at: string
  updated_at: string
}

function mapScoutReport(r: RawScoutReportRow): ScoutReport {
  return {
    id: r.id,
    teamId: r.team_id,
    scoutGameId: r.scout_game_id,
    reportBlock: r.report_block,
    indicator: r.indicator,
    valueText: r.value_text,
    sampleSize: r.sample_size,
    technicalReading: r.technical_reading,
    trainingPriority: r.training_priority as ScoutReportTrainingPriority | null,
    evidenceIds: r.evidence_ids,
    reportNotes: r.report_notes,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

const SCOUT_REPORT_SELECT =
  'id, team_id, scout_game_id, report_block, indicator, value_text, sample_size, technical_reading, training_priority, evidence_ids, report_notes, created_at, updated_at'

export async function fetchScoutReport(
  scoutGameId: string,
  filters?: ScoutReportFilters,
  teamId?: string,
): Promise<ScoutReport[]> {
  assertSupabaseReady()
  const resolvedTeamId = resolveTeamId(teamId)
  let query = supabase
    .from('scout_report')
    .select(SCOUT_REPORT_SELECT)
    .eq('team_id', resolvedTeamId)
    .eq('scout_game_id', scoutGameId)

  if (filters?.reportBlock) {
    query = query.eq('report_block', filters.reportBlock)
  }
  if (filters?.trainingPriority) {
    query = query.eq('training_priority', filters.trainingPriority)
  }

  const { data, error } = await query
    .order('report_block')
    .order('indicator')
    .returns<RawScoutReportRow[]>()
  if (error) throw new Error(error.message || 'Falha ao buscar relatório.')

  return (data ?? []).map(mapScoutReport)
}

// ─── API-13: scout_feedback ──────────────────────────────────────────────────

type RawScoutFeedbackRow = {
  id: string
  team_id: string
  scout_game_id: string
  scout_live_entry_id: string | null
  recipient: string
  athlete_id: string | null
  feedback_type: string
  feedback_topic: string
  evidence_ref: string
  message: string
  recommended_action: string | null
  priority: string
  feedback_status: string
  created_at: string
  updated_at: string
}

function mapScoutFeedback(r: RawScoutFeedbackRow): ScoutFeedback {
  return {
    id: r.id,
    teamId: r.team_id,
    scoutGameId: r.scout_game_id,
    scoutLiveEntryId: r.scout_live_entry_id,
    recipient: r.recipient as ScoutFeedbackRecipient,
    athleteId: r.athlete_id,
    feedbackType: r.feedback_type as ScoutFeedbackType,
    feedbackTopic: r.feedback_topic,
    evidenceRef: r.evidence_ref,
    message: r.message,
    recommendedAction: r.recommended_action,
    priority: r.priority as ScoutReportTrainingPriority,
    feedbackStatus: r.feedback_status as ScoutFeedbackStatus,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

const SCOUT_FEEDBACK_SELECT =
  'id, team_id, scout_game_id, scout_live_entry_id, recipient, athlete_id, feedback_type, feedback_topic, evidence_ref, message, recommended_action, priority, feedback_status, created_at, updated_at'

export async function fetchScoutFeedback(
  filters?: ScoutFeedbackFilters,
  teamId?: string,
): Promise<ScoutFeedback[]> {
  assertSupabaseReady()
  const resolvedTeamId = resolveTeamId(teamId)
  let query = supabase
    .from('scout_feedback')
    .select(SCOUT_FEEDBACK_SELECT)
    .eq('team_id', resolvedTeamId)

  if (filters?.scoutGameId) {
    query = query.eq('scout_game_id', filters.scoutGameId)
  }
  if (filters?.athleteId) {
    query = query.eq('athlete_id', filters.athleteId)
  }
  if (filters?.recipient) {
    query = query.eq('recipient', filters.recipient)
  }
  if (filters?.feedbackStatus) {
    query = query.eq('feedback_status', filters.feedbackStatus)
  }

  const { data, error } = await query
    .order('created_at')
    .returns<RawScoutFeedbackRow[]>()
  if (error) throw new Error(error.message || 'Falha ao buscar feedbacks.')

  return (data ?? []).map(mapScoutFeedback)
}

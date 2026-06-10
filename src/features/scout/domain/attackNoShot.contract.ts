export const ATTACK_NO_SHOT_RESULT = 'lost_possession_no_shot' as const

export const ATTACK_NO_SHOT_EVENT_CODES = [
  'technical_error_unforced',
  'technical_error_forced',
  'offensive_foul',
  'goal_area_invasion_attack',
  'passive_play_turnover',
  'bad_substitution_attack',
  'turnover_unclassified',
] as const

export type AttackNoShotEventCode = typeof ATTACK_NO_SHOT_EVENT_CODES[number]

export const ATTACK_NO_SHOT_TECHNICAL_ERROR_SUBTYPES = [
  'three_seconds',
  'steps_violation',
  'double_dribble',
  'pass_error',
  'reception_error',
  'pass_error_foot',
  'pass_error_sideline',
  'pass_error_endline',
  'ground_ball_lost',
  'ball_handling_error',
] as const

export const ATTACK_NO_SHOT_PASSIVE_PLAY_SUBTYPES = [
  'passive_fifth_pass_no_shot',
  'passive_no_shot_after_clear_chance_return',
] as const

export const ATTACK_NO_SHOT_SUBSTITUTION_ERROR_SUBTYPES = [
  'illegal_entry_before_exit',
  'illegal_entry_zone',
  'too_many_players',
  'illegal_goalkeeper_exchange',
  'substitution_violation_other',
] as const

export type TechnicalErrorSubtype = typeof ATTACK_NO_SHOT_TECHNICAL_ERROR_SUBTYPES[number]
export type PassivePlaySubtype = typeof ATTACK_NO_SHOT_PASSIVE_PLAY_SUBTYPES[number]
export type SubstitutionErrorSubtype = typeof ATTACK_NO_SHOT_SUBSTITUTION_ERROR_SUBTYPES[number]

export type AttackNoShotReviewReason =
  | 'turnover_unclassified'
  | 'loss_cause_not_visible'
  | 'offensive_foul_vs_forced_error'
  | 'area_invasion_vs_other_loss'
  | 'steal_interception_vs_forced_error'
  | 'referee_decision_not_visible_or_audible'
  | 'substitution_violation_other'
  | 'observer_reanalysis_divergence'

export interface AttackNoShotEventContract {
  readonly codigo: AttackNoShotEventCode
  readonly nomeUi: string
  readonly uiTipo: 'botao_principal' | 'botao_secundario' | 'fallback_revisao'
  readonly reqAtleta: boolean
  readonly reqZonaQuadra: boolean
  readonly reqPosicao: boolean
  readonly reqSistema: boolean
  readonly status: 'novo' | 'revisar'
  readonly fonteValidacao: string
  readonly resultadoPosseAuto: typeof ATTACK_NO_SHOT_RESULT
}

export const ATTACK_NO_SHOT_EVENTS: Readonly<Record<AttackNoShotEventCode, AttackNoShotEventContract>> = {
  technical_error_unforced: {
    codigo: 'technical_error_unforced',
    nomeUi: 'Erro Técnico Não Forçado',
    uiTipo: 'botao_principal',
    reqAtleta: true,
    reqZonaQuadra: true,
    reqPosicao: true,
    reqSistema: false,
    status: 'novo',
    fonteValidacao: 'IHF_USO_DA_BOLA + DECISAO_OPERACIONAL',
    resultadoPosseAuto: ATTACK_NO_SHOT_RESULT,
  },
  technical_error_forced: {
    codigo: 'technical_error_forced',
    nomeUi: 'Erro Técnico Forçado',
    uiTipo: 'botao_principal',
    reqAtleta: true,
    reqZonaQuadra: true,
    reqPosicao: true,
    reqSistema: false,
    status: 'novo',
    fonteValidacao: 'RAG_DEFESA_PRESSAO + DECISAO_OPERACIONAL',
    resultadoPosseAuto: ATTACK_NO_SHOT_RESULT,
  },
  offensive_foul: {
    codigo: 'offensive_foul',
    nomeUi: 'Falta de Ataque',
    uiTipo: 'botao_principal',
    reqAtleta: true,
    reqZonaQuadra: true,
    reqPosicao: true,
    reqSistema: false,
    status: 'novo',
    fonteValidacao: 'IHF_CONTATO_FALTA_ATAQUE + DECISAO_ARBITRAL',
    resultadoPosseAuto: ATTACK_NO_SHOT_RESULT,
  },
  goal_area_invasion_attack: {
    codigo: 'goal_area_invasion_attack',
    nomeUi: 'Invasão da Área no Ataque',
    uiTipo: 'botao_principal',
    reqAtleta: true,
    reqZonaQuadra: true,
    reqPosicao: true,
    reqSistema: false,
    status: 'novo',
    fonteValidacao: 'IHF_AREA_GOLEIRA',
    resultadoPosseAuto: ATTACK_NO_SHOT_RESULT,
  },
  passive_play_turnover: {
    codigo: 'passive_play_turnover',
    nomeUi: 'Perda por Jogo Passivo',
    uiTipo: 'botao_secundario',
    reqAtleta: false,
    reqZonaQuadra: false,
    reqPosicao: false,
    reqSistema: true,
    status: 'novo',
    fonteValidacao: 'IHF_PASSIVO + FHERJ_PASSIVO',
    resultadoPosseAuto: ATTACK_NO_SHOT_RESULT,
  },
  bad_substitution_attack: {
    codigo: 'bad_substitution_attack',
    nomeUi: 'Erro de Troca no Ataque',
    uiTipo: 'botao_secundario',
    reqAtleta: false,
    reqZonaQuadra: false,
    reqPosicao: false,
    reqSistema: true,
    status: 'novo',
    fonteValidacao: 'IHF_SUBSTITUICAO',
    resultadoPosseAuto: ATTACK_NO_SHOT_RESULT,
  },
  turnover_unclassified: {
    codigo: 'turnover_unclassified',
    nomeUi: 'Perda de Posse Não Classificada',
    uiTipo: 'fallback_revisao',
    reqAtleta: false,
    reqZonaQuadra: false,
    reqPosicao: false,
    reqSistema: false,
    status: 'revisar',
    fonteValidacao: 'QUALIDADE_DADO_VIDEO_INSUFICIENTE',
    resultadoPosseAuto: ATTACK_NO_SHOT_RESULT,
  },
} as const

export interface AttackNoShotEntryInput {
  readonly eventCode: string
  readonly athleteId?: string
  readonly courtZone?: string
  readonly positionCode?: string
  readonly systemCode?: string
  readonly technicalErrorSubtype?: string
  readonly passivePlaySubtype?: string
  readonly substitutionErrorSubtype?: string
  readonly reviewMarker?: boolean
  readonly reviewReasons?: readonly AttackNoShotReviewReason[]
  readonly finishTypeCode?: string
  readonly goalZone?: string
  readonly points?: number
}

export interface AttackNoShotValidationResult {
  readonly ok: boolean
  readonly errors: readonly string[]
  readonly derived: {
    readonly resultadoPosseAuto: typeof ATTACK_NO_SHOT_RESULT
    readonly points: 0
    readonly defenseForcedError?: true
    readonly reviewMarker: boolean
  }
}

function hasValue(value: unknown): boolean {
  return typeof value === 'string' ? value.trim().length > 0 : value !== undefined && value !== null
}

function isAttackNoShotEventCode(code: string): code is AttackNoShotEventCode {
  return ATTACK_NO_SHOT_EVENT_CODES.includes(code as AttackNoShotEventCode)
}

function includesValue<T extends string>(values: readonly T[], value: unknown): value is T {
  return typeof value === 'string' && values.includes(value as T)
}

export function validateAttackNoShotEntry(input: AttackNoShotEntryInput): AttackNoShotValidationResult {
  const errors: string[] = []
  const reviewReasons = input.reviewReasons ?? []

  if (!isAttackNoShotEventCode(input.eventCode)) {
    return {
      ok: false,
      errors: [`Evento fora do módulo Ataque sem Finalização v1.0: ${input.eventCode}`],
      derived: { resultadoPosseAuto: ATTACK_NO_SHOT_RESULT, points: 0, reviewMarker: input.reviewMarker === true || reviewReasons.length > 0 },
    }
  }

  const contract = ATTACK_NO_SHOT_EVENTS[input.eventCode]

  if (hasValue(input.finishTypeCode)) errors.push('tipo_finalizacao_code não é permitido.')
  if (hasValue(input.goalZone)) errors.push('zona_gol não é permitida.')
  if (input.points !== undefined && input.points !== 0) errors.push('pontos_jogada deve ser 0.')

  if (contract.reqAtleta && !hasValue(input.athleteId)) errors.push(`${input.eventCode} exige atleta principal.`)
  if (contract.reqZonaQuadra && !hasValue(input.courtZone)) errors.push(`${input.eventCode} exige zona da quadra.`)
  if (contract.reqPosicao && !hasValue(input.positionCode)) errors.push(`${input.eventCode} exige posição/função.`)
  if (contract.reqSistema && !hasValue(input.systemCode)) errors.push(`${input.eventCode} exige sistema.`)

  if ((input.eventCode === 'technical_error_unforced' || input.eventCode === 'technical_error_forced') && !includesValue(ATTACK_NO_SHOT_TECHNICAL_ERROR_SUBTYPES, input.technicalErrorSubtype)) {
    errors.push(`${input.eventCode} exige subtipo_erro_tecnico válido.`)
  }

  if (input.eventCode === 'passive_play_turnover' && !includesValue(ATTACK_NO_SHOT_PASSIVE_PLAY_SUBTYPES, input.passivePlaySubtype)) {
    errors.push('passive_play_turnover exige subtipo_jogo_passivo válido.')
  }

  if (input.eventCode === 'bad_substitution_attack' && !includesValue(ATTACK_NO_SHOT_SUBSTITUTION_ERROR_SUBTYPES, input.substitutionErrorSubtype)) {
    errors.push('bad_substitution_attack exige subtipo_erro_substituicao válido.')
  }

  const requiresReview = input.eventCode === 'turnover_unclassified'
    || input.substitutionErrorSubtype === 'substitution_violation_other'
    || reviewReasons.length > 0

  if (requiresReview && input.reviewMarker !== true) errors.push(`${input.eventCode} exige review_marker = Sim nesta condição.`)

  return {
    ok: errors.length === 0,
    errors,
    derived: {
      resultadoPosseAuto: ATTACK_NO_SHOT_RESULT,
      points: 0,
      defenseForcedError: input.eventCode === 'technical_error_forced' ? true : undefined,
      reviewMarker: input.reviewMarker === true || requiresReview,
    },
  }
}

export interface IntraObserverMarking {
  readonly lanceId: string
  readonly firstEventCode: AttackNoShotEventCode
  readonly secondEventCode: AttackNoShotEventCode
}

export function evaluateIntraObserverConsistency(markings: readonly IntraObserverMarking[], minimumConsistencyPercent = 85) {
  const total = markings.length
  const divergentLanceIds = markings.filter((item) => item.firstEventCode !== item.secondEventCode).map((item) => item.lanceId)
  const divergences = divergentLanceIds.length
  const matches = total - divergences
  const consistencyPercent = total === 0 ? 0 : Number(((matches / total) * 100).toFixed(2))

  return {
    total,
    matches,
    divergences,
    consistencyPercent,
    approved: total > 0 && consistencyPercent >= minimumConsistencyPercent,
    requiresDictionaryReview: total === 0 || consistencyPercent < minimumConsistencyPercent,
    divergentLanceIds,
  }
}

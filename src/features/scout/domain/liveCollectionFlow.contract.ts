import type {
  ScoutFactualResultCode,
  ScoutFinishTypeCode,
  ScoutPhaseCode,
  ScoutScoringReasonCode,
} from '@/types'

import type {
  LiveCollectionBasicActionCode,
  LiveCollectionCategoryCode,
} from './liveCollectionCompatibility.matrix'

export type LiveCollectionFlowId =
  | 'AT_POS.ARREMESSO.ARREMESSO'
  | 'AT_POS.ARREMESSO.FINALIZACAO_6M_FAV'
  | 'TRANS_OF.ARREMESSO.ARREMESSO'

export type LiveCollectionFlowField =
  | 'tempoJogo'
  | 'faseDaBolaCode'
  | 'sistemaOfensivoCode'
  | 'sistemaDefensivoCode'
  | 'categoriaAcaoCode'
  | 'acaoBasicaCode'
  | 'estruturaTransicaoCode'
  | 'tipoFinalizacaoCode'
  | 'resultadoFactualCode'
  | 'motivoPontuacaoCode'
  | 'pontosJogada'
  | 'atletaPrincipalId'
  | 'acaoPreparatoriaCode'
  | 'contextoDecisaoCode'
  | 'contextoArremessoCode'
  | 'causaProvavelCode'
  | 'prioridadeTreinoCode'
  | 'videoRef'
  | 'obsGeral'
  | 'classificacaoAcaoCode'

export interface LiveCollectionFlowDerivedRule {
  readonly if: Readonly<Partial<{
    tipoFinalizacaoCode: ScoutFinishTypeCode
    resultadoFactualCode: ScoutFactualResultCode
  }>>
  readonly then: Readonly<Partial<{
    motivoPontuacaoCode: ScoutScoringReasonCode
    defaultPontosJogada: '1' | '2'
    allowedPontosJogada: readonly ('1' | '2')[]
  }>>
}

export interface LiveCollectionFlowManualScoringRule {
  readonly if: Readonly<Partial<{
    tipoFinalizacaoCode: ScoutFinishTypeCode
    resultadoFactualCode: ScoutFactualResultCode
  }>>
  readonly allowedMotivoPontuacaoCode: readonly ScoutScoringReasonCode[]
  readonly forbiddenMotivoPontuacaoCode: readonly ScoutScoringReasonCode[]
}

export interface LiveCollectionFlowQuickPreset {
  readonly label: string
  readonly sets: Readonly<Partial<Record<LiveCollectionFlowField, string>>>
}

export type LiveCollectionFlowCondition = Readonly<Partial<{
  resultadoFactualCode: ScoutFactualResultCode | readonly ScoutFactualResultCode[]
  tipoFinalizacaoCode: ScoutFinishTypeCode | readonly ScoutFinishTypeCode[]
}>>

export interface LiveCollectionFlowConditionalRequiredField {
  readonly field: LiveCollectionFlowField
  readonly when: LiveCollectionFlowCondition
}

export interface LiveCollectionFlowContract {
  readonly flowId: LiveCollectionFlowId
  readonly label: string
  readonly phase: ScoutPhaseCode
  readonly category: LiveCollectionCategoryCode
  readonly action: LiveCollectionBasicActionCode
  readonly mainFields: readonly LiveCollectionFlowField[]
  readonly optionalFields: readonly LiveCollectionFlowField[]
  readonly advancedFields: readonly LiveCollectionFlowField[]
  readonly requiredFields: readonly LiveCollectionFlowField[]
  readonly conditionalRequiredFields: readonly LiveCollectionFlowConditionalRequiredField[]
  readonly derivedFields: readonly LiveCollectionFlowField[]
  readonly forbiddenFields: readonly LiveCollectionFlowField[]
  readonly uiOrder: readonly LiveCollectionFlowField[]
  readonly allowedFinishTypes: readonly ScoutFinishTypeCode[]
  readonly allowedResults: readonly ScoutFactualResultCode[]
  readonly allowedEstruturaTransicaoCode?: readonly string[]
  readonly derived?: Readonly<{
    when: readonly LiveCollectionFlowDerivedRule[]
  }>
  readonly manualScoringWhen?: readonly LiveCollectionFlowManualScoringRule[]
  readonly quickPresets?: readonly LiveCollectionFlowQuickPreset[]
  readonly passiveRule?: Readonly<{
    PASSIVO_AS_RESULT: string
    PASSIVO_AS_CONTEXT: string
  }>
  readonly persistenceRules: Readonly<{
    createTablesOnly: readonly 'scout_live_entries'[]
    mustNotCreate: readonly ('scout_plays' | 'scout_play_participations')[]
    initialValidationStatus: 'PENDENTE'
  }>
  readonly regressionGuards: readonly string[]
  readonly forbiddenUi: readonly string[]
}

const LIVE_ENTRY_ONLY = {
  createTablesOnly: ['scout_live_entries'],
  mustNotCreate: ['scout_plays', 'scout_play_participations'],
  initialValidationStatus: 'PENDENTE',
} as const

const OBSERVED_SHOT_RESULTS = ['GOL', 'DEFENDIDO', 'BLOQUEADO', 'FORA', 'TRAVE'] as const
const GOAL_RESULT = ['GOL'] as const

export const liveCollectionFlowContracts = {
  'AT_POS.ARREMESSO.ARREMESSO': {
    flowId: 'AT_POS.ARREMESSO.ARREMESSO',
    label: 'Ataque posicionado - Arremesso',
    phase: 'AT_POS',
    category: 'ARREMESSO',
    action: 'ARREMESSO',
    mainFields: [
      'tempoJogo',
      'faseDaBolaCode',
      'sistemaOfensivoCode',
      'categoriaAcaoCode',
      'acaoBasicaCode',
      'tipoFinalizacaoCode',
      'resultadoFactualCode',
    ],
    optionalFields: [
      'atletaPrincipalId',
      'acaoPreparatoriaCode',
      'contextoDecisaoCode',
      'contextoArremessoCode',
    ],
    advancedFields: [
      'causaProvavelCode',
      'prioridadeTreinoCode',
      'videoRef',
      'obsGeral',
    ],
    requiredFields: [
      'tempoJogo',
      'faseDaBolaCode',
      'sistemaOfensivoCode',
      'categoriaAcaoCode',
      'acaoBasicaCode',
      'resultadoFactualCode',
    ],
    conditionalRequiredFields: [
      { field: 'tipoFinalizacaoCode', when: { resultadoFactualCode: OBSERVED_SHOT_RESULTS } },
      { field: 'motivoPontuacaoCode', when: { resultadoFactualCode: GOAL_RESULT } },
      { field: 'pontosJogada', when: { resultadoFactualCode: GOAL_RESULT } },
    ],
    derivedFields: ['motivoPontuacaoCode', 'pontosJogada'],
    forbiddenFields: ['estruturaTransicaoCode', 'classificacaoAcaoCode'],
    uiOrder: [
      'tempoJogo',
      'faseDaBolaCode',
      'sistemaOfensivoCode',
      'categoriaAcaoCode',
      'acaoBasicaCode',
      'tipoFinalizacaoCode',
      'resultadoFactualCode',
      'atletaPrincipalId',
      'acaoPreparatoriaCode',
      'contextoDecisaoCode',
      'contextoArremessoCode',
      'motivoPontuacaoCode',
      'pontosJogada',
      'causaProvavelCode',
      'prioridadeTreinoCode',
      'videoRef',
      'obsGeral',
    ],
    allowedFinishTypes: ['SIMPLES', 'GIRO', 'AEREA'],
    allowedResults: [
      'GOL',
      'DEFENDIDO',
      'BLOQUEADO',
      'FORA',
      'TRAVE',
      'VIOLACAO',
      'PASSIVO',
      'NAO_OBSERVADO',
    ],
    derived: {
      when: [
        {
          if: { tipoFinalizacaoCode: 'GIRO', resultadoFactualCode: 'GOL' },
          then: { motivoPontuacaoCode: 'GIRO', defaultPontosJogada: '2', allowedPontosJogada: ['1', '2'] },
        },
        {
          if: { tipoFinalizacaoCode: 'AEREA', resultadoFactualCode: 'GOL' },
          then: { motivoPontuacaoCode: 'AEREA', defaultPontosJogada: '2', allowedPontosJogada: ['1', '2'] },
        },
      ],
    },
    manualScoringWhen: [
      {
        if: { tipoFinalizacaoCode: 'SIMPLES', resultadoFactualCode: 'GOL' },
        allowedMotivoPontuacaoCode: ['SIMPLES', 'ESPECIALISTA', 'GOLEIRA', 'GOL_CONTRA', 'NAO_OBSERVADO'],
        forbiddenMotivoPontuacaoCode: ['GIRO', 'AEREA', '6M'],
      },
    ],
    quickPresets: [
      {
        label: 'Arremesso forcado por passivo',
        sets: {
          contextoDecisaoCode: 'PASSIVO_SINALIZADO',
          contextoArremessoCode: 'SOB_PASSIVO',
        },
      },
    ],
    passiveRule: {
      PASSIVO_AS_RESULT: 'Usar quando a posse acabou pela regra sem arremesso valido.',
      PASSIVO_AS_CONTEXT: 'Usar quando houve arremesso condicionado por passivo.',
    },
    persistenceRules: LIVE_ENTRY_ONLY,
    regressionGuards: [
      'Nao oferecer classificacao_acao_code no fluxo principal de AT_POS + ARREMESSO.',
      'Nao duplicar GIRO/AEREA como tipo de finalizacao e motivo manual.',
      'Nao usar 6M como motivo manual de arremesso simples.',
    ],
    forbiddenUi: [
      'Nao mostrar GIRO como tipo de finalizacao e motivo manual ao mesmo tempo.',
      'Nao mostrar AEREA como tipo de finalizacao e motivo manual ao mesmo tempo.',
      'Nao mostrar 6M como motivo manual de arremesso simples.',
      'Nao exibir classificacao de arremesso ofensivo no fluxo principal.',
    ],
  },
  'AT_POS.ARREMESSO.FINALIZACAO_6M_FAV': {
    flowId: 'AT_POS.ARREMESSO.FINALIZACAO_6M_FAV',
    label: 'Ataque posicionado - Finalizacao 6m favoravel',
    phase: 'AT_POS',
    category: 'ARREMESSO',
    action: 'FINALIZACAO_6M_FAV',
    mainFields: [
      'tempoJogo',
      'faseDaBolaCode',
      'sistemaOfensivoCode',
      'categoriaAcaoCode',
      'acaoBasicaCode',
      'resultadoFactualCode',
    ],
    optionalFields: ['atletaPrincipalId'],
    advancedFields: [
      'causaProvavelCode',
      'prioridadeTreinoCode',
      'videoRef',
      'obsGeral',
    ],
    requiredFields: [
      'tempoJogo',
      'faseDaBolaCode',
      'sistemaOfensivoCode',
      'categoriaAcaoCode',
      'acaoBasicaCode',
      'resultadoFactualCode',
    ],
    conditionalRequiredFields: [
      { field: 'tipoFinalizacaoCode', when: { resultadoFactualCode: OBSERVED_SHOT_RESULTS } },
      { field: 'motivoPontuacaoCode', when: { resultadoFactualCode: GOAL_RESULT } },
      { field: 'pontosJogada', when: { resultadoFactualCode: GOAL_RESULT } },
    ],
    derivedFields: ['tipoFinalizacaoCode', 'motivoPontuacaoCode', 'pontosJogada'],
    forbiddenFields: [
      'estruturaTransicaoCode',
      'classificacaoAcaoCode',
      'acaoPreparatoriaCode',
      'contextoDecisaoCode',
      'contextoArremessoCode',
    ],
    uiOrder: [
      'tempoJogo',
      'faseDaBolaCode',
      'sistemaOfensivoCode',
      'categoriaAcaoCode',
      'acaoBasicaCode',
      'resultadoFactualCode',
      'atletaPrincipalId',
      'tipoFinalizacaoCode',
      'motivoPontuacaoCode',
      'pontosJogada',
      'causaProvavelCode',
      'prioridadeTreinoCode',
      'videoRef',
      'obsGeral',
    ],
    allowedFinishTypes: ['6M'],
    allowedResults: [
      'GOL',
      'DEFENDIDO',
      'FORA',
      'TRAVE',
      'VIOLACAO',
      'NAO_OBSERVADO',
    ],
    derived: {
      when: [
        {
          if: { tipoFinalizacaoCode: '6M', resultadoFactualCode: 'GOL' },
          then: { motivoPontuacaoCode: '6M', defaultPontosJogada: '2', allowedPontosJogada: ['2'] },
        },
      ],
    },
    persistenceRules: LIVE_ENTRY_ONLY,
    regressionGuards: [
      'FINALIZACAO_6M_FAV nao aceita BLOQUEADO.',
      'Tipo de finalizacao 6M e motivo 6M sao derivados pela acao.',
      'Sem GOL, nao informar motivo de pontuacao nem pontos positivos.',
    ],
    forbiddenUi: [
      'Nao pedir classificacao de arremesso para cobranca de 6m favoravel.',
      'Nao oferecer BLOQUEADO como resultado factual da cobranca de 6m favoravel.',
    ],
  },
  'TRANS_OF.ARREMESSO.ARREMESSO': {
    flowId: 'TRANS_OF.ARREMESSO.ARREMESSO',
    label: 'Transicao ofensiva - Arremesso',
    phase: 'TRANS_OF',
    category: 'ARREMESSO',
    action: 'ARREMESSO',
    mainFields: [
      'tempoJogo',
      'faseDaBolaCode',
      'categoriaAcaoCode',
      'acaoBasicaCode',
      'estruturaTransicaoCode',
      'tipoFinalizacaoCode',
      'resultadoFactualCode',
    ],
    optionalFields: [
      'atletaPrincipalId',
      'contextoDecisaoCode',
      'contextoArremessoCode',
    ],
    advancedFields: [
      'causaProvavelCode',
      'prioridadeTreinoCode',
      'videoRef',
      'obsGeral',
    ],
    requiredFields: [
      'tempoJogo',
      'faseDaBolaCode',
      'categoriaAcaoCode',
      'acaoBasicaCode',
      'estruturaTransicaoCode',
      'resultadoFactualCode',
    ],
    conditionalRequiredFields: [
      { field: 'tipoFinalizacaoCode', when: { resultadoFactualCode: OBSERVED_SHOT_RESULTS } },
      { field: 'motivoPontuacaoCode', when: { resultadoFactualCode: GOAL_RESULT } },
      { field: 'pontosJogada', when: { resultadoFactualCode: GOAL_RESULT } },
    ],
    derivedFields: ['motivoPontuacaoCode', 'pontosJogada'],
    forbiddenFields: ['sistemaOfensivoCode', 'classificacaoAcaoCode', 'acaoPreparatoriaCode'],
    uiOrder: [
      'tempoJogo',
      'faseDaBolaCode',
      'categoriaAcaoCode',
      'acaoBasicaCode',
      'estruturaTransicaoCode',
      'tipoFinalizacaoCode',
      'resultadoFactualCode',
      'atletaPrincipalId',
      'contextoDecisaoCode',
      'contextoArremessoCode',
      'motivoPontuacaoCode',
      'pontosJogada',
      'causaProvavelCode',
      'prioridadeTreinoCode',
      'videoRef',
      'obsGeral',
    ],
    allowedFinishTypes: ['SIMPLES', 'GIRO', 'AEREA', 'NAO_OBSERVADO'],
    allowedResults: [
      'GOL',
      'DEFENDIDO',
      'BLOQUEADO',
      'FORA',
      'TRAVE',
      'VIOLACAO',
      'PASSIVO',
      'NAO_OBSERVADO',
    ],
    allowedEstruturaTransicaoCode: [
      'TRANS_DIRETA',
      'TRANS_INDIRETA_2X1',
      'TRANS_INDIRETA_3X2',
      'TRANS_INDIRETA_3X3',
      'TRANS_INDIRETA_4X3',
      'NAO_OBSERVADO',
    ],
    derived: {
      when: [
        {
          if: { tipoFinalizacaoCode: 'GIRO', resultadoFactualCode: 'GOL' },
          then: { motivoPontuacaoCode: 'GIRO', defaultPontosJogada: '2', allowedPontosJogada: ['1', '2'] },
        },
        {
          if: { tipoFinalizacaoCode: 'AEREA', resultadoFactualCode: 'GOL' },
          then: { motivoPontuacaoCode: 'AEREA', defaultPontosJogada: '2', allowedPontosJogada: ['1', '2'] },
        },
      ],
    },
    manualScoringWhen: [
      {
        if: { tipoFinalizacaoCode: 'SIMPLES', resultadoFactualCode: 'GOL' },
        allowedMotivoPontuacaoCode: ['SIMPLES', 'ESPECIALISTA', 'GOLEIRA', 'GOL_CONTRA', 'NAO_OBSERVADO'],
        forbiddenMotivoPontuacaoCode: ['GIRO', 'AEREA', '6M'],
      },
    ],
    quickPresets: [
      {
        label: 'Arremesso forcado por passivo',
        sets: {
          contextoDecisaoCode: 'PASSIVO_SINALIZADO',
          contextoArremessoCode: 'SOB_PASSIVO',
        },
      },
    ],
    passiveRule: {
      PASSIVO_AS_RESULT: 'Usar apenas quando a posse acabou pela regra sem arremesso valido.',
      PASSIVO_AS_CONTEXT: 'Usar quando houve arremesso condicionado por passivo.',
    },
    persistenceRules: LIVE_ENTRY_ONLY,
    regressionGuards: [
      'Nao oferecer FINALIZ_TRANS, FINALIZ_CONTRA ou AEREA_TRANS em novos registros.',
      'Estrutura da transicao deve ser campo separado de tipoFinalizacaoCode.',
      'Passivo como resultado e passivo como contexto nao devem ser tratados como a mesma escolha.',
    ],
    forbiddenUi: [
      'Nao mostrar classificacoes legadas de transicao como opcoes novas.',
      'Nao substituir estruturaTransicaoCode por tipoFinalizacaoCode.',
      'Nao exigir sistema ofensivo estabilizado em TRANS_OF.',
    ],
  },
} as const satisfies Readonly<Record<LiveCollectionFlowId, LiveCollectionFlowContract>>

export const liveCollectionFlowIds = Object.keys(liveCollectionFlowContracts) as LiveCollectionFlowId[]

export function getLiveCollectionFlowContract(flowId: LiveCollectionFlowId): LiveCollectionFlowContract {
  return liveCollectionFlowContracts[flowId]
}

function conditionValueMatches<T extends string>(expected: T | readonly T[] | undefined, actual: string | undefined) {
  if (expected === undefined) return true
  if (!actual) return false
  return Array.isArray(expected) ? expected.includes(actual as T) : expected === actual
}

function matchesCondition(
  condition: LiveCollectionFlowCondition,
  values: Readonly<Partial<Record<LiveCollectionFlowField, string | undefined>>>,
) {
  return (
    conditionValueMatches(condition.resultadoFactualCode, values.resultadoFactualCode) &&
    conditionValueMatches(condition.tipoFinalizacaoCode, values.tipoFinalizacaoCode)
  )
}

export function getLiveCollectionRequiredFields(
  contract: LiveCollectionFlowContract,
  values: Readonly<Partial<Record<LiveCollectionFlowField, string | undefined>>>,
): readonly LiveCollectionFlowField[] {
  const required = new Set<LiveCollectionFlowField>(contract.requiredFields)

  for (const rule of contract.conditionalRequiredFields) {
    if (matchesCondition(rule.when, values)) {
      required.add(rule.field)
    }
  }

  return contract.uiOrder.filter((field) => required.has(field))
}

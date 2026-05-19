import type {
  ScoutCodeListKey,
  ScoutFactualResultCode,
  ScoutFinishTypeCode,
  ScoutPhaseCode,
  ScoutScoringReasonCode,
} from '@/types'

export type LiveCollectionCategoryCode =
  | 'PASSE'
  | 'ARREMESSO'
  | 'ACAO_DEFENSIVA'
  | 'TROCA_TRANSICAO'
  | 'NAO_OBSERVADO'

export type LiveCollectionBasicActionCode =
  | 'PASSE'
  | 'ARREMESSO'
  | 'FINALIZACAO_6M_FAV'
  | 'BLOQUEIO'
  | 'INTERCEPTACAO'
  | 'ROUBO'
  | 'COBERTURA'
  | 'MARCACAO_PRESSAO'
  | 'RECOMPOSICAO'
  | 'ENTRADA_OFENSIVA'
  | 'TROCA_OFENSIVA'
  | 'TROCA_DEFENSIVA'
  | 'ESTABILIZACAO'
  | 'NAO_OBSERVADO'
  | 'FINALIZACAO_6M_ADV'

export type LiveCollectionClassificationCode =
  | 'PASSE_APOIADO'
  | 'PASSE_SUSPENSO'
  | 'PASSE_PARA_GIRO'
  | 'PASSE_PARA_AEREA'
  | 'PASSE_PARA_ARREMESSO_SIMPLES'
  | 'PASSE_SEGURANCA'
  | 'PASSE_APOIO'
  | 'PASSE_LONGO'
  | 'GIRO'
  | 'AEREA'
  | 'ARREM_SIMPLES'
  | 'FINALIZ_TRANS'
  | 'FINALIZ_CONTRA'
  | 'AEREA_TRANS'
  | '6M_ADV'
  | 'NAO_OBSERVADO'
  | 'INTERCEPTACAO'
  | 'ROUBO_BOLA'
  | 'CORTE_LINHA_PASSE'
  | 'ENTRADA_AT_POS'
  | 'TRANS_NEUTRALIZADA'
  | 'DEF_ESTABILIZADA_TR'
  | 'ERRO_TROCA_TRANS'
  | 'COBERTURA_PIVO'
  | 'FECHAMENTO_CENTRAL'
  | 'TROCA_REFERENCIA'
  | 'INTERCEPTACAO_MALSUCEDIDA'

export type LiveCollectionConditionalField =
  | 'sistemaOfensivoCode'
  | 'sistemaDefensivoCode'
  | 'classificacaoAcaoCode'
  | 'tipoFinalizacaoCode'
  | 'defensiveFinishTypeCode'
  | 'motivoPontuacaoCode'
  | 'pontosJogada'

export type LiveCollectionFieldVisibility =
  | 'never'
  | 'always'
  | 'when-shot-result'
  | 'when-shot-result-and-not-derived'
  | 'when-offensive-goal'

export interface LiveCollectionActionRule {
  readonly classificationListKey?: ScoutCodeListKey
  readonly allowedClassifications: readonly LiveCollectionClassificationCode[]
  readonly forbiddenClassifications?: readonly string[]
  readonly allowedResults: readonly ScoutFactualResultCode[]
  readonly forbiddenResults?: readonly ScoutFactualResultCode[]
  readonly showFinishTypeField: LiveCollectionFieldVisibility
  readonly allowedFinishTypes?: readonly ScoutFinishTypeCode[]
  readonly derivedFinishTypeByClassification?: Readonly<
    Partial<Record<LiveCollectionClassificationCode, ScoutFinishTypeCode>>
  >
  readonly showScoringFields: LiveCollectionFieldVisibility
  readonly allowedScoringReasons?: readonly ScoutScoringReasonCode[]
  readonly derivedScoringReasonByClassification?: Readonly<
    Partial<Record<LiveCollectionClassificationCode, ScoutScoringReasonCode>>
  >
  readonly allowedResultsByClassification?: Readonly<
    Partial<Record<string, readonly ScoutFactualResultCode[]>>
  >
  readonly forbiddenFields?: readonly LiveCollectionConditionalField[]
  readonly execucaoBloqueioListKey?: ScoutCodeListKey
  readonly derivedScoringReasonByFinishType?: Readonly<
    Partial<Record<ScoutFinishTypeCode, ScoutScoringReasonCode>>
  >
  readonly contextoDecisaoListKey?: ScoutCodeListKey
  readonly contextoArremessoListKey?: ScoutCodeListKey
  readonly notes?: string
}

export interface LiveCollectionCategoryRule {
  readonly basicActionListKey?: ScoutCodeListKey
  readonly allowedBasicActions: readonly LiveCollectionBasicActionCode[]
  readonly actions: Readonly<Partial<Record<LiveCollectionBasicActionCode, LiveCollectionActionRule>>>
}

export interface LiveCollectionPhaseRule {
  readonly requiredSystemField?: 'sistemaOfensivoCode' | 'sistemaDefensivoCode'
  readonly allowStabilizedSystem: boolean
  readonly allowedCategories: readonly LiveCollectionCategoryCode[]
  readonly forbiddenCategories: readonly LiveCollectionCategoryCode[]
  readonly categories: Readonly<Partial<Record<LiveCollectionCategoryCode, LiveCollectionCategoryRule>>>
}

export interface LiveCollectionPersistenceInvariant {
  readonly createTablesOnly: readonly string[]
  readonly mustNotCreate: readonly string[]
  readonly initialValidationStatus: 'PENDENTE'
}

const SHOT_RESULTS: readonly ScoutFactualResultCode[] = [
  'GOL',
  'DEFENDIDO',
  'BLOQUEADO',
  'FORA',
  'TRAVE',
] as const

export const LIVE_COLLECTION_PERSISTENCE_INVARIANTS: LiveCollectionPersistenceInvariant = {
  createTablesOnly: ['scout_live_entries'],
  mustNotCreate: ['scout_plays', 'scout_play_participations'],
  initialValidationStatus: 'PENDENTE',
} as const

export const LIVE_COLLECTION_POINTS_BY_SCORING_REASON: Readonly<
  Partial<Record<ScoutScoringReasonCode, readonly (1 | 2)[]>>
> = {
  SIMPLES: [1],
  GOL_CONTRA: [1],
  '6M': [2],
  GOLEIRA: [2],
  ESPECIALISTA: [2],
  GIRO: [1, 2],
  AEREA: [1, 2],
} as const

export const liveCollectionCompatibilityMatrix: Readonly<Record<ScoutPhaseCode, LiveCollectionPhaseRule>> = {
  AT_POS: {
    requiredSystemField: 'sistemaOfensivoCode',
    allowStabilizedSystem: true,
    allowedCategories: ['PASSE', 'ARREMESSO', 'NAO_OBSERVADO'],
    forbiddenCategories: ['ACAO_DEFENSIVA', 'TROCA_TRANSICAO'],
    categories: {
      PASSE: {
        basicActionListKey: 'LISTA_ACAO_BASICA_PASSE',
        allowedBasicActions: ['PASSE'],
        actions: {
          PASSE: {
            classificationListKey: 'LISTA_CLASSIF_PASSE',
            allowedClassifications: [
              'PASSE_APOIADO',
              'PASSE_SUSPENSO',
              'PASSE_PARA_GIRO',
              'PASSE_PARA_AEREA',
              'PASSE_PARA_ARREMESSO_SIMPLES',
              'PASSE_SEGURANCA',
              'PASSE_APOIO',
            ],
            forbiddenClassifications: ['PASSE_LONGO'],
            allowedResults: [
              'ERRO_PASSE',
              'PASSE_INTERCEPTADO',
              'PERDA',
              'VIOLACAO',
              'PASSIVO',
              'FALTA_ATAQUE',
              'NAO_OBSERVADO',
            ],
            forbiddenResults: [
              'GOL',
              'DEFENDIDO',
              'BLOQUEADO',
              'FORA',
              'TRAVE',
              'RECUPERACAO_POSSE',
            ],
            showFinishTypeField: 'never',
            showScoringFields: 'never',
            forbiddenFields: ['tipoFinalizacaoCode', 'motivoPontuacaoCode', 'pontosJogada'],
            notes: 'Passe longo continua fora deste slice.',
          },
        },
      },
      ARREMESSO: {
        basicActionListKey: 'LISTA_ACAO_BASICA_ARREMESSO',
        allowedBasicActions: ['ARREMESSO', 'FINALIZACAO_6M_FAV'],
        actions: {
          ARREMESSO: {
            classificationListKey: 'LISTA_CLASSIF_ARREMESSO',
            allowedClassifications: ['GIRO', 'AEREA', 'ARREM_SIMPLES'],
            forbiddenClassifications: [
              'FINALIZ_CONTRA',
              'FINALIZ_TRANS',
              'AEREA_TRANS',
              'ESPECIALISTA',
              'GOLEIRA',
              '6M',
              'SHOOTOUT',
              'GOL_CONTRA',
            ],
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
            forbiddenResults: ['ERRO_PASSE', 'PASSE_INTERCEPTADO', 'RECUPERACAO_POSSE'],
            showFinishTypeField: 'when-shot-result',
            allowedFinishTypes: ['SIMPLES', 'GIRO', 'AEREA'],
            derivedFinishTypeByClassification: {
              GIRO: 'GIRO',
              AEREA: 'AEREA',
              ARREM_SIMPLES: 'SIMPLES',
            },
            showScoringFields: 'when-offensive-goal',
            allowedScoringReasons: [
              'SIMPLES',
              'GIRO',
              'AEREA',
              '6M',
              'GOLEIRA',
              'ESPECIALISTA',
              'GOL_CONTRA',
              'NAO_OBSERVADO',
            ],
            derivedScoringReasonByClassification: {
              GIRO: 'GIRO',
              AEREA: 'AEREA',
            },
            derivedScoringReasonByFinishType: {
              GIRO: 'GIRO',
              AEREA: 'AEREA',
            },
          },
          FINALIZACAO_6M_FAV: {
            allowedClassifications: [],
            allowedResults: [
              'GOL',
              'DEFENDIDO',
              'FORA',
              'TRAVE',
              'VIOLACAO',
              'NAO_OBSERVADO',
            ],
            forbiddenResults: ['BLOQUEADO', 'ERRO_PASSE', 'PASSE_INTERCEPTADO', 'RECUPERACAO_POSSE'],
            showFinishTypeField: 'always',
            allowedFinishTypes: ['6M'],
            showScoringFields: 'when-offensive-goal',
            allowedScoringReasons: ['6M'],
            derivedScoringReasonByFinishType: {
              '6M': '6M',
            },
            notes: 'Evento ofensivo observado: CEPRAEA cobra 6m. tipo_finalizacao_code auto-derivado para 6M.',
          },
        },
      },
    },
  },
  DEF_POS: {
    requiredSystemField: 'sistemaDefensivoCode',
    allowStabilizedSystem: true,
    allowedCategories: ['ACAO_DEFENSIVA', 'NAO_OBSERVADO'],
    forbiddenCategories: ['PASSE', 'ARREMESSO', 'TROCA_TRANSICAO'],
    categories: {
      ACAO_DEFENSIVA: {
        basicActionListKey: 'LISTA_ACAO_BASICA_ACAO_DEFENSIVA',
        allowedBasicActions: [
          'BLOQUEIO',
          'INTERCEPTACAO',
          'ROUBO',
          'COBERTURA',
          'MARCACAO_PRESSAO',
          'RECOMPOSICAO',
          'FINALIZACAO_6M_ADV',
        ],
        actions: {
          BLOQUEIO: {
            // CEPR-0092: classificacaoAcaoCode = tipo da finalização adversária enfrentada.
            // execucaoBloqueioCode (nova coluna) = qualidade de execução do bloqueio.
            // LISTA_CLASSIF_BLOQUEIO mudou de significado operacional — nunca reintroduzir BLOQ_GIRO/BLOQ_AEREA/BLOQ_ARREM_SIMPLES/BLOQ_NAO_EXECUTADO.
            classificationListKey: 'LISTA_CLASSIF_BLOQUEIO',
            allowedClassifications: ['GIRO', 'AEREA', 'ARREM_SIMPLES', '6M_ADV', 'NAO_OBSERVADO'],
            allowedResults: [
              'BLOQUEADO',
              'RECUPERACAO_POSSE',
              'FALTA_ATAQUE',
              'GOL',
              'VIOLACAO',
              'TIRO_6M_CONCEDIDO',
              'NAO_OBSERVADO',
            ],
            showFinishTypeField: 'never',
            derivedFinishTypeByClassification: {
              GIRO: 'GIRO',
              ARREM_SIMPLES: 'SIMPLES',
              AEREA: 'AEREA',
              '6M_ADV': '6M',
            },
            showScoringFields: 'never',
            execucaoBloqueioListKey: 'LISTA_EXECUCAO_BLOQUEIO',
          },
          INTERCEPTACAO: {
            classificationListKey: 'LISTA_CLASSIF_INTERC_ROUBO',
            allowedClassifications: ['INTERCEPTACAO', 'CORTE_LINHA_PASSE', 'INTERCEPTACAO_MALSUCEDIDA'],
            allowedResults: [
              'RECUPERACAO_POSSE',
              'FALTA_ATAQUE',
              'DEFESA_ESTABILIZADA',
              'VIOLACAO',
              'NAO_OBSERVADO',
            ],
            allowedResultsByClassification: {
              INTERCEPTACAO_MALSUCEDIDA: ['GOL', 'DEFENDIDO', 'NAO_OBSERVADO'],
            },
            forbiddenResults: ['GOL', 'DEFENDIDO', 'BLOQUEADO', 'FORA', 'TRAVE'],
            showFinishTypeField: 'never',
            showScoringFields: 'never',
          },
          ROUBO: {
            classificationListKey: 'LISTA_CLASSIF_INTERC_ROUBO',
            allowedClassifications: ['ROUBO_BOLA', 'CORTE_LINHA_PASSE'],
            allowedResults: [
              'RECUPERACAO_POSSE',
              'FALTA_ATAQUE',
              'DEFESA_ESTABILIZADA',
              'VIOLACAO',
              'NAO_OBSERVADO',
            ],
            forbiddenResults: ['GOL', 'DEFENDIDO', 'BLOQUEADO', 'FORA', 'TRAVE'],
            showFinishTypeField: 'never',
            showScoringFields: 'never',
          },
          COBERTURA: {
            classificationListKey: 'LISTA_CLASSIF_COBERTURA',
            allowedClassifications: ['COBERTURA_PIVO', 'FECHAMENTO_CENTRAL'],
            allowedResults: [
              'RECUPERACAO_POSSE',
              'FALTA_ATAQUE',
              'DEFESA_ESTABILIZADA',
              'GOL',
              'VIOLACAO',
              'TIRO_6M_CONCEDIDO',
              'NAO_OBSERVADO',
            ],
            showFinishTypeField: 'when-shot-result-and-not-derived',
            allowedFinishTypes: ['SIMPLES', 'GIRO', 'AEREA', 'NAO_OBSERVADO'],
            showScoringFields: 'never',
          },
          MARCACAO_PRESSAO: {
            classificationListKey: 'LISTA_CLASSIF_MARCACAO_PRESSAO',
            allowedClassifications: ['TROCA_REFERENCIA'],
            allowedResults: [
              'RECUPERACAO_POSSE',
              'FALTA_ATAQUE',
              'DEFESA_ESTABILIZADA',
              'GOL',
              'VIOLACAO',
              'TIRO_6M_CONCEDIDO',
              'NAO_OBSERVADO',
            ],
            showFinishTypeField: 'when-shot-result-and-not-derived',
            allowedFinishTypes: ['SIMPLES', 'GIRO', 'AEREA', 'NAO_OBSERVADO'],
            showScoringFields: 'never',
          },
          RECOMPOSICAO: {
            allowedClassifications: [],
            allowedResults: [
              'RECUPERACAO_POSSE',
              'FALTA_ATAQUE',
              'DEFESA_ESTABILIZADA',
              'GOL',
              'VIOLACAO',
              'TIRO_6M_CONCEDIDO',
              'NAO_OBSERVADO',
            ],
            showFinishTypeField: 'when-shot-result-and-not-derived',
            allowedFinishTypes: ['SIMPLES', 'GIRO', 'AEREA', 'NAO_OBSERVADO'],
            showScoringFields: 'never',
          },
          FINALIZACAO_6M_ADV: {
            allowedClassifications: [],
            allowedResults: ['GOL', 'DEFENDIDO', 'FORA', 'TRAVE', 'VIOLACAO', 'NAO_OBSERVADO'],
            showFinishTypeField: 'always',
            allowedFinishTypes: ['6M'],
            showScoringFields: 'never',
            notes: 'Evento defensivo observado: adversaria cobra 6m. tipo_finalizacao_code auto-derivado para 6M.',
          },
        },
      },
    },
  },
  TRANS_OF: {
    allowStabilizedSystem: false,
    allowedCategories: ['PASSE', 'ARREMESSO', 'TROCA_TRANSICAO', 'NAO_OBSERVADO'],
    forbiddenCategories: ['ACAO_DEFENSIVA'],
    categories: {
      PASSE: {
        basicActionListKey: 'LISTA_ACAO_BASICA_PASSE',
        allowedBasicActions: ['PASSE'],
        actions: {
          PASSE: {
            classificationListKey: 'LISTA_CLASSIF_PASSE',
            allowedClassifications: [
              'PASSE_APOIADO',
              'PASSE_SUSPENSO',
              'PASSE_PARA_GIRO',
              'PASSE_PARA_AEREA',
              'PASSE_PARA_ARREMESSO_SIMPLES',
              'PASSE_SEGURANCA',
              'PASSE_APOIO',
            ],
            allowedResults: [
              'ERRO_PASSE',
              'PASSE_INTERCEPTADO',
              'PERDA',
              'VIOLACAO',
              'PASSIVO',
              'FALTA_ATAQUE',
              'NAO_OBSERVADO',
            ],
            showFinishTypeField: 'never',
            showScoringFields: 'never',
          },
        },
      },
      ARREMESSO: {
        basicActionListKey: 'LISTA_ACAO_BASICA_ARREMESSO',
        allowedBasicActions: ['ARREMESSO'],
        actions: {
          ARREMESSO: {
            // Estrutura da transição: campo separado estruturaTransicaoCode.
            // Classificações legadas (FINALIZ_TRANS, FINALIZ_CONTRA, AEREA_TRANS) podem
            // existir em dados antigos mas não são oferecidas em novos registros.
            // CEPR-0095: contextoDecisaoCode + contextoArremessoCode (opcionais, só TRANS_OF+ARREMESSO).
            allowedClassifications: [],
            forbiddenClassifications: ['AEREA_TRANS', 'FINALIZ_TRANS', 'FINALIZ_CONTRA'],
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
            showFinishTypeField: 'when-shot-result',
            allowedFinishTypes: ['SIMPLES', 'GIRO', 'AEREA', 'NAO_OBSERVADO'],
            showScoringFields: 'when-offensive-goal',
            allowedScoringReasons: [
              'SIMPLES',
              'GIRO',
              'AEREA',
              '6M',
              'GOLEIRA',
              'ESPECIALISTA',
              'GOL_CONTRA',
              'NAO_OBSERVADO',
            ],
            derivedScoringReasonByFinishType: {
              GIRO: 'GIRO',
              AEREA: 'AEREA',
              NAO_OBSERVADO: 'NAO_OBSERVADO',
            },
            contextoDecisaoListKey: 'LISTA_CONTEXTO_DECISAO',
            contextoArremessoListKey: 'LISTA_CONTEXTO_ARREMESSO',
          },
        },
      },
      TROCA_TRANSICAO: {
        basicActionListKey: 'LISTA_ACAO_BASICA_TROCA_TRANSICAO',
        allowedBasicActions: ['ENTRADA_OFENSIVA', 'TROCA_OFENSIVA'],
        actions: {
          ENTRADA_OFENSIVA: {
            classificationListKey: 'LISTA_CLASSIF_TROCA_TRANSICAO',
            allowedClassifications: ['ENTRADA_AT_POS', 'ERRO_TROCA_TRANS'],
            allowedResults: [
              'TRANSICAO_NEUTRALIZADA',
              'DEFESA_ESTABILIZADA',
              'VANTAGEM_CRIADA',
              'VANTAGEM_PERDIDA',
              'ERRO_TROCA',
              'PERDA',
              'NAO_OBSERVADO',
            ],
            showFinishTypeField: 'never',
            showScoringFields: 'never',
          },
          TROCA_OFENSIVA: {
            classificationListKey: 'LISTA_CLASSIF_TROCA_TRANSICAO',
            allowedClassifications: ['ENTRADA_AT_POS', 'ERRO_TROCA_TRANS'],
            allowedResults: [
              'TRANSICAO_NEUTRALIZADA',
              'DEFESA_ESTABILIZADA',
              'VANTAGEM_CRIADA',
              'VANTAGEM_PERDIDA',
              'ERRO_TROCA',
              'PERDA',
              'NAO_OBSERVADO',
            ],
            showFinishTypeField: 'never',
            showScoringFields: 'never',
          },
        },
      },
    },
  },
  TRANS_DEF: {
    allowStabilizedSystem: false,
    allowedCategories: ['ACAO_DEFENSIVA', 'TROCA_TRANSICAO', 'NAO_OBSERVADO'],
    forbiddenCategories: ['PASSE', 'ARREMESSO'],
    categories: {
      ACAO_DEFENSIVA: {
        basicActionListKey: 'LISTA_ACAO_BASICA_ACAO_DEFENSIVA',
        allowedBasicActions: [
          'BLOQUEIO',
          'INTERCEPTACAO',
          'ROUBO',
          'COBERTURA',
          'MARCACAO_PRESSAO',
          'RECOMPOSICAO',
        ],
        actions: {
          BLOQUEIO: {
            // CEPR-0092 partial: codes alinhados com DEF_POS. execucaoBloqueioListKey será adicionado no CEPR-0093.
            classificationListKey: 'LISTA_CLASSIF_BLOQUEIO',
            allowedClassifications: ['GIRO', 'AEREA', 'ARREM_SIMPLES', '6M_ADV', 'NAO_OBSERVADO'],
            allowedResults: [
              'TRANSICAO_NEUTRALIZADA',
              'DEFESA_ESTABILIZADA',
              'RECUPERACAO_POSSE',
              'GOL',
              'DEFENDIDO',
              'BLOQUEADO',
              'PERDA',
              'ERRO_TROCA',
              'VIOLACAO',
              'NAO_OBSERVADO',
            ],
            showFinishTypeField: 'never',
            derivedFinishTypeByClassification: {
              GIRO: 'GIRO',
              ARREM_SIMPLES: 'SIMPLES',
              AEREA: 'AEREA',
              '6M_ADV': '6M',
            },
            showScoringFields: 'never',
          },
          INTERCEPTACAO: {
            classificationListKey: 'LISTA_CLASSIF_INTERC_ROUBO',
            allowedClassifications: ['INTERCEPTACAO', 'CORTE_LINHA_PASSE'],
            allowedResults: [
              'TRANSICAO_NEUTRALIZADA',
              'DEFESA_ESTABILIZADA',
              'RECUPERACAO_POSSE',
              'GOL',
              'DEFENDIDO',
              'BLOQUEADO',
              'PERDA',
              'ERRO_TROCA',
              'VIOLACAO',
              'NAO_OBSERVADO',
            ],
            showFinishTypeField: 'never',
            showScoringFields: 'never',
          },
          ROUBO: {
            classificationListKey: 'LISTA_CLASSIF_INTERC_ROUBO',
            allowedClassifications: ['ROUBO_BOLA', 'CORTE_LINHA_PASSE'],
            allowedResults: [
              'TRANSICAO_NEUTRALIZADA',
              'DEFESA_ESTABILIZADA',
              'RECUPERACAO_POSSE',
              'GOL',
              'DEFENDIDO',
              'BLOQUEADO',
              'PERDA',
              'ERRO_TROCA',
              'VIOLACAO',
              'NAO_OBSERVADO',
            ],
            showFinishTypeField: 'never',
            showScoringFields: 'never',
          },
          COBERTURA: {
            allowedClassifications: [],
            allowedResults: [
              'TRANSICAO_NEUTRALIZADA',
              'DEFESA_ESTABILIZADA',
              'RECUPERACAO_POSSE',
              'GOL',
              'DEFENDIDO',
              'BLOQUEADO',
              'PERDA',
              'ERRO_TROCA',
              'VIOLACAO',
              'NAO_OBSERVADO',
            ],
            showFinishTypeField: 'when-shot-result-and-not-derived',
            allowedFinishTypes: ['SIMPLES', 'GIRO', 'AEREA', 'NAO_OBSERVADO'],
            showScoringFields: 'never',
          },
          MARCACAO_PRESSAO: {
            allowedClassifications: [],
            allowedResults: [
              'TRANSICAO_NEUTRALIZADA',
              'DEFESA_ESTABILIZADA',
              'RECUPERACAO_POSSE',
              'GOL',
              'DEFENDIDO',
              'BLOQUEADO',
              'PERDA',
              'ERRO_TROCA',
              'VIOLACAO',
              'NAO_OBSERVADO',
            ],
            showFinishTypeField: 'when-shot-result-and-not-derived',
            allowedFinishTypes: ['SIMPLES', 'GIRO', 'AEREA', 'NAO_OBSERVADO'],
            showScoringFields: 'never',
          },
          RECOMPOSICAO: {
            allowedClassifications: [],
            allowedResults: [
              'TRANSICAO_NEUTRALIZADA',
              'DEFESA_ESTABILIZADA',
              'RECUPERACAO_POSSE',
              'GOL',
              'DEFENDIDO',
              'BLOQUEADO',
              'PERDA',
              'ERRO_TROCA',
              'VIOLACAO',
              'NAO_OBSERVADO',
            ],
            showFinishTypeField: 'when-shot-result-and-not-derived',
            allowedFinishTypes: ['SIMPLES', 'GIRO', 'AEREA', 'NAO_OBSERVADO'],
            showScoringFields: 'never',
          },
        },
      },
      TROCA_TRANSICAO: {
        basicActionListKey: 'LISTA_ACAO_BASICA_TROCA_TRANSICAO',
        allowedBasicActions: ['TROCA_DEFENSIVA', 'ESTABILIZACAO'],
        actions: {
          TROCA_DEFENSIVA: {
            classificationListKey: 'LISTA_CLASSIF_TROCA_TRANSICAO',
            allowedClassifications: ['TRANS_NEUTRALIZADA', 'DEF_ESTABILIZADA_TR', 'ERRO_TROCA_TRANS'],
            allowedResults: [
              'TRANSICAO_NEUTRALIZADA',
              'DEFESA_ESTABILIZADA',
              'VANTAGEM_CRIADA',
              'VANTAGEM_PERDIDA',
              'ERRO_TROCA',
              'PERDA',
              'NAO_OBSERVADO',
            ],
            showFinishTypeField: 'never',
            showScoringFields: 'never',
          },
          ESTABILIZACAO: {
            classificationListKey: 'LISTA_CLASSIF_TROCA_TRANSICAO',
            allowedClassifications: ['TRANS_NEUTRALIZADA', 'DEF_ESTABILIZADA_TR', 'ERRO_TROCA_TRANS'],
            allowedResults: [
              'TRANSICAO_NEUTRALIZADA',
              'DEFESA_ESTABILIZADA',
              'VANTAGEM_CRIADA',
              'VANTAGEM_PERDIDA',
              'ERRO_TROCA',
              'PERDA',
              'NAO_OBSERVADO',
            ],
            showFinishTypeField: 'never',
            showScoringFields: 'never',
          },
        },
      },
    },
  },
} as const

export function getPhaseCompatibility(phase: ScoutPhaseCode) {
  return liveCollectionCompatibilityMatrix[phase]
}

export function getAllowedCategoriesForPhase(phase: ScoutPhaseCode) {
  return liveCollectionCompatibilityMatrix[phase].allowedCategories
}

export function isCategoryAllowedInPhase(
  phase: ScoutPhaseCode,
  category: LiveCollectionCategoryCode,
) {
  return liveCollectionCompatibilityMatrix[phase].allowedCategories.includes(category)
}

export function getActionCompatibility(
  phase: ScoutPhaseCode,
  category: LiveCollectionCategoryCode,
  action: LiveCollectionBasicActionCode,
) {
  return liveCollectionCompatibilityMatrix[phase].categories[category]?.actions[action]
}

export function getCategoryCompatibility(
  phase: ScoutPhaseCode,
  category: LiveCollectionCategoryCode,
) {
  return liveCollectionCompatibilityMatrix[phase].categories[category]
}

export function getBasicActionListKey(
  phase: ScoutPhaseCode,
  category: LiveCollectionCategoryCode,
) {
  return getCategoryCompatibility(phase, category)?.basicActionListKey
}

export function getAllowedBasicActions(
  phase: ScoutPhaseCode,
  category: LiveCollectionCategoryCode,
) {
  return liveCollectionCompatibilityMatrix[phase].categories[category]?.allowedBasicActions ?? []
}

export function getAllowedClassifications(
  phase: ScoutPhaseCode,
  category: LiveCollectionCategoryCode,
  action: LiveCollectionBasicActionCode,
) {
  return getActionCompatibility(phase, category, action)?.allowedClassifications ?? []
}

export function getAllowedResults(
  phase: ScoutPhaseCode,
  category: LiveCollectionCategoryCode,
  action: LiveCollectionBasicActionCode,
) {
  return getActionCompatibility(phase, category, action)?.allowedResults ?? []
}

export function getAllowedResultsForSelection(
  phase: ScoutPhaseCode,
  category?: LiveCollectionCategoryCode | '',
  action?: LiveCollectionBasicActionCode | '',
  classification?: string | '',
) {
  if (!category) return []
  if (category === 'NAO_OBSERVADO') return ['NAO_OBSERVADO'] as const
  if (!action) return []
  const rule = getActionCompatibility(phase, category, action)
  if (!rule) return []
  if (classification && rule.allowedResultsByClassification?.[classification]) {
    return rule.allowedResultsByClassification[classification]
  }
  return rule.allowedResults
}

export function deriveFinishTypeFromClassification(
  phase: ScoutPhaseCode,
  category: LiveCollectionCategoryCode,
  action: LiveCollectionBasicActionCode,
  classification: LiveCollectionClassificationCode,
) {
  return getActionCompatibility(phase, category, action)?.derivedFinishTypeByClassification?.[classification]
}

export function deriveScoringReasonFromClassification(
  phase: ScoutPhaseCode,
  category: LiveCollectionCategoryCode,
  action: LiveCollectionBasicActionCode,
  classification: LiveCollectionClassificationCode,
) {
  return getActionCompatibility(phase, category, action)?.derivedScoringReasonByClassification?.[classification]
}

export function getAllowedFinishTypes(
  phase: ScoutPhaseCode,
  category: LiveCollectionCategoryCode,
  action: LiveCollectionBasicActionCode,
) {
  return getActionCompatibility(phase, category, action)?.allowedFinishTypes ?? []
}

export function getAllowedScoringReasons(
  phase: ScoutPhaseCode,
  category: LiveCollectionCategoryCode,
  action: LiveCollectionBasicActionCode,
) {
  return getActionCompatibility(phase, category, action)?.allowedScoringReasons ?? []
}

export function getClassificationListKey(
  phase: ScoutPhaseCode,
  category: LiveCollectionCategoryCode,
  action: LiveCollectionBasicActionCode,
) {
  return getActionCompatibility(phase, category, action)?.classificationListKey
}

export function getAllowedPointsForScoringReason(reason: ScoutScoringReasonCode) {
  return LIVE_COLLECTION_POINTS_BY_SCORING_REASON[reason] ?? []
}

export function shouldShowFinishTypeField(
  phase: ScoutPhaseCode,
  category: LiveCollectionCategoryCode,
  action: LiveCollectionBasicActionCode,
  result?: ScoutFactualResultCode,
) {
  const rule = getActionCompatibility(phase, category, action)
  if (!rule) return false

  switch (rule.showFinishTypeField) {
    case 'always':
      return true
    case 'never':
      return false
    case 'when-shot-result':
    case 'when-shot-result-and-not-derived':
      return result ? SHOT_RESULTS.includes(result) : false
    default:
      return false
  }
}

export function shouldSubmitDerivedFinishType(
  phase: ScoutPhaseCode,
  category: LiveCollectionCategoryCode,
  action: LiveCollectionBasicActionCode,
  result?: ScoutFactualResultCode,
) {
  const rule = getActionCompatibility(phase, category, action)
  if (!rule?.derivedFinishTypeByClassification) return false
  return result ? SHOT_RESULTS.includes(result) : false
}

export function shouldShowScoringFields(
  phase: ScoutPhaseCode,
  category: LiveCollectionCategoryCode,
  action: LiveCollectionBasicActionCode,
  result?: ScoutFactualResultCode,
) {
  const rule = getActionCompatibility(phase, category, action)
  if (!rule) return false

  if (rule.showScoringFields !== 'when-offensive-goal') return false
  return phase !== 'DEF_POS' && phase !== 'TRANS_DEF' && result === 'GOL'
}

export function shouldShowTransicaoStructure(
  phase: ScoutPhaseCode,
  category?: LiveCollectionCategoryCode | '',
  action?: LiveCollectionBasicActionCode | '',
) {
  return phase === 'TRANS_OF' && category === 'ARREMESSO' && action === 'ARREMESSO'
}

export function shouldShowAcaoPreparatoria(
  phase: ScoutPhaseCode,
  category?: LiveCollectionCategoryCode | '',
  action?: LiveCollectionBasicActionCode | '',
) {
  return phase === 'AT_POS' && category === 'ARREMESSO' && action === 'ARREMESSO'
}

export function getExecucaoBloqueioListKey(
  phase: ScoutPhaseCode,
  category: LiveCollectionCategoryCode,
  action: LiveCollectionBasicActionCode,
): ScoutCodeListKey | undefined {
  return getActionCompatibility(phase, category, action)?.execucaoBloqueioListKey
}

export function shouldShowExecucaoBloqueio(
  phase: ScoutPhaseCode,
  category?: LiveCollectionCategoryCode | '',
  action?: LiveCollectionBasicActionCode | '',
): boolean {
  if (!category || !action) return false
  return !!getActionCompatibility(phase, category as LiveCollectionCategoryCode, action as LiveCollectionBasicActionCode)?.execucaoBloqueioListKey
}

export function deriveScoringReasonFromFinishType(
  phase: ScoutPhaseCode,
  category: LiveCollectionCategoryCode,
  action: LiveCollectionBasicActionCode,
  finishType: ScoutFinishTypeCode,
): ScoutScoringReasonCode | undefined {
  return getActionCompatibility(phase, category, action)?.derivedScoringReasonByFinishType?.[finishType]
}

export function getContextoDecisaoListKey(
  phase: ScoutPhaseCode,
  category: LiveCollectionCategoryCode,
  action: LiveCollectionBasicActionCode,
): ScoutCodeListKey | undefined {
  return getActionCompatibility(phase, category, action)?.contextoDecisaoListKey
}

export function getContextoArremessoListKey(
  phase: ScoutPhaseCode,
  category: LiveCollectionCategoryCode,
  action: LiveCollectionBasicActionCode,
): ScoutCodeListKey | undefined {
  return getActionCompatibility(phase, category, action)?.contextoArremessoListKey
}

export function shouldShowContextoDecisao(
  phase: ScoutPhaseCode,
  category?: LiveCollectionCategoryCode | '',
  action?: LiveCollectionBasicActionCode | '',
): boolean {
  if (!category || !action) return false
  return !!getActionCompatibility(phase, category as LiveCollectionCategoryCode, action as LiveCollectionBasicActionCode)?.contextoDecisaoListKey
}

export function shouldShowContextoArremesso(
  phase: ScoutPhaseCode,
  category?: LiveCollectionCategoryCode | '',
  action?: LiveCollectionBasicActionCode | '',
): boolean {
  if (!category || !action) return false
  return !!getActionCompatibility(phase, category as LiveCollectionCategoryCode, action as LiveCollectionBasicActionCode)?.contextoArremessoListKey
}

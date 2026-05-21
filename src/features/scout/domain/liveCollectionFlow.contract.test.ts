import {
  getAllowedBasicActions,
  getAllowedFinishTypes,
  getAllowedResultsForSelection,
  getAllowedScoringReasons,
  getCategoryCompatibility,
  shouldShowAcaoPreparatoria,
  shouldShowTransicaoStructure,
} from './liveCollectionCompatibility.matrix'
import {
  getLiveCollectionFlowContract,
  getLiveCollectionRequiredFields,
  liveCollectionFlowContracts,
  liveCollectionFlowIds,
  type LiveCollectionFlowContract,
  type LiveCollectionFlowField,
} from './liveCollectionFlow.contract'

function expectNoDuplicateFields(fields: readonly LiveCollectionFlowField[]) {
  expect(new Set(fields).size).toBe(fields.length)
}

function expectContractMatchesMatrix(contract: LiveCollectionFlowContract) {
  expect(getCategoryCompatibility(contract.phase, contract.category)).toBeDefined()
  expect(getAllowedBasicActions(contract.phase, contract.category)).toContain(contract.action)
  expect(getAllowedFinishTypes(contract.phase, contract.category, contract.action)).toEqual(contract.allowedFinishTypes)
  expect(getAllowedResultsForSelection(contract.phase, contract.category, contract.action)).toEqual(contract.allowedResults)
}

describe('liveCollectionFlowContracts', () => {
  test('declara somente os tres fluxos de arremesso auditados', () => {
    expect(liveCollectionFlowIds).toEqual([
      'AT_POS.ARREMESSO.ARREMESSO',
      'AT_POS.ARREMESSO.FINALIZACAO_6M_FAV',
      'TRANS_OF.ARREMESSO.ARREMESSO',
    ])
  })

  test('todos os fluxos seguem a matriz semantica executavel', () => {
    for (const contract of Object.values(liveCollectionFlowContracts)) {
      expectContractMatchesMatrix(contract)
    }
  })

  test('todos os fluxos tem ordem operacional deterministica e sem duplicidade', () => {
    for (const contract of Object.values(liveCollectionFlowContracts)) {
      expectNoDuplicateFields(contract.mainFields)
      expectNoDuplicateFields(contract.optionalFields)
      expectNoDuplicateFields(contract.advancedFields)
      expectNoDuplicateFields(contract.requiredFields)
      expectNoDuplicateFields(contract.conditionalRequiredFields.map((rule) => rule.field))
      expectNoDuplicateFields(contract.derivedFields)
      expectNoDuplicateFields(contract.forbiddenFields)
      expectNoDuplicateFields(contract.uiOrder)

      for (const field of contract.requiredFields) {
        expect(contract.uiOrder).toContain(field)
      }

      for (const field of contract.mainFields) {
        expect(contract.uiOrder).toContain(field)
      }

      for (const field of contract.forbiddenFields) {
        expect(contract.mainFields).not.toContain(field)
        expect(contract.optionalFields).not.toContain(field)
        expect(contract.advancedFields).not.toContain(field)
        expect(contract.requiredFields).not.toContain(field)
      }
    }
  })

  test('AT_POS + ARREMESSO fixa fluxo rapido com acao preparatoria opcional e sem estrutura de transicao', () => {
    const contract = getLiveCollectionFlowContract('AT_POS.ARREMESSO.ARREMESSO')

    expect(contract.mainFields).toEqual([
      'tempoJogo',
      'faseDaBolaCode',
      'sistemaOfensivoCode',
      'categoriaAcaoCode',
      'acaoBasicaCode',
      'tipoFinalizacaoCode',
      'resultadoFactualCode',
    ])
    expect(contract.optionalFields).toContain('acaoPreparatoriaCode')
    expect(contract.forbiddenFields).toContain('estruturaTransicaoCode')
    expect(contract.forbiddenFields).toContain('classificacaoAcaoCode')
    expect(shouldShowAcaoPreparatoria(contract.phase, contract.category, contract.action)).toBe(true)
    expect(shouldShowTransicaoStructure(contract.phase, contract.category, contract.action)).toBe(false)
    expect(contract.allowedFinishTypes).toEqual(['SIMPLES', 'GIRO', 'AEREA'])
    expect(contract.allowedResults).toContain('PASSIVO')
    expect(contract.requiredFields).not.toContain('tipoFinalizacaoCode')
  })

  test('AT_POS + FINALIZACAO_6M_FAV deriva 6M e bloqueia campos que confundem o fluxo', () => {
    const contract = getLiveCollectionFlowContract('AT_POS.ARREMESSO.FINALIZACAO_6M_FAV')

    expect(contract.allowedFinishTypes).toEqual(['6M'])
    expect(contract.allowedResults).toEqual([
      'GOL',
      'DEFENDIDO',
      'FORA',
      'TRAVE',
      'VIOLACAO',
      'NAO_OBSERVADO',
    ])
    expect(contract.allowedResults).not.toContain('BLOQUEADO')
    expect(contract.derivedFields).toEqual(['tipoFinalizacaoCode', 'motivoPontuacaoCode', 'pontosJogada'])
    expect(contract.requiredFields).not.toContain('tipoFinalizacaoCode')
    expect(contract.forbiddenFields).toEqual([
      'estruturaTransicaoCode',
      'classificacaoAcaoCode',
      'acaoPreparatoriaCode',
      'contextoDecisaoCode',
      'contextoArremessoCode',
    ])
    expect(contract.derived?.when).toContainEqual({
      if: { tipoFinalizacaoCode: '6M', resultadoFactualCode: 'GOL' },
      then: { motivoPontuacaoCode: '6M', defaultPontosJogada: '2', allowedPontosJogada: ['2'] },
    })
  })

  test('TRANS_OF + ARREMESSO exige estrutura de transicao e mantem contexto de passivo separado', () => {
    const contract = getLiveCollectionFlowContract('TRANS_OF.ARREMESSO.ARREMESSO')

    expect(contract.requiredFields).toContain('estruturaTransicaoCode')
    expect(contract.requiredFields).not.toContain('tipoFinalizacaoCode')
    expect(contract.mainFields).toEqual([
      'tempoJogo',
      'faseDaBolaCode',
      'categoriaAcaoCode',
      'acaoBasicaCode',
      'estruturaTransicaoCode',
      'tipoFinalizacaoCode',
      'resultadoFactualCode',
    ])
    expect(contract.allowedEstruturaTransicaoCode).toEqual([
      'TRANS_DIRETA',
      'TRANS_INDIRETA_2X1',
      'TRANS_INDIRETA_3X2',
      'TRANS_INDIRETA_3X3',
      'TRANS_INDIRETA_4X3',
      'NAO_OBSERVADO',
    ])
    expect(contract.quickPresets).toContainEqual({
      label: 'Arremesso forcado por passivo',
      sets: {
        contextoDecisaoCode: 'PASSIVO_SINALIZADO',
        contextoArremessoCode: 'SOB_PASSIVO',
      },
    })
    expect(contract.passiveRule?.PASSIVO_AS_RESULT).toContain('posse acabou')
    expect(contract.passiveRule?.PASSIVO_AS_CONTEXT).toContain('condicionado por passivo')
    expect(shouldShowTransicaoStructure(contract.phase, contract.category, contract.action)).toBe(true)
    expect(shouldShowAcaoPreparatoria(contract.phase, contract.category, contract.action)).toBe(false)
  })

  test('requiredFields condicionais nao tratam PASSIVO como arremesso finalizado', () => {
    for (const flowId of ['AT_POS.ARREMESSO.ARREMESSO', 'TRANS_OF.ARREMESSO.ARREMESSO'] as const) {
      const contract = getLiveCollectionFlowContract(flowId)
      const required = getLiveCollectionRequiredFields(contract, {
        resultadoFactualCode: 'PASSIVO',
      })

      expect(required).toContain('resultadoFactualCode')
      expect(required).not.toContain('tipoFinalizacaoCode')
      expect(required).not.toContain('motivoPontuacaoCode')
      expect(required).not.toContain('pontosJogada')
    }
  })

  test('requiredFields condicionais exigem finalizacao e pontuacao em GOL observado', () => {
    for (const flowId of ['AT_POS.ARREMESSO.ARREMESSO', 'TRANS_OF.ARREMESSO.ARREMESSO'] as const) {
      const contract = getLiveCollectionFlowContract(flowId)
      const required = getLiveCollectionRequiredFields(contract, {
        resultadoFactualCode: 'GOL',
      })

      expect(required).toContain('tipoFinalizacaoCode')
      expect(required).toContain('motivoPontuacaoCode')
      expect(required).toContain('pontosJogada')
    }
  })

  test('requiredFields condicionais preservam 6m favoravel como derivado e obrigatorio no submit', () => {
    const contract = getLiveCollectionFlowContract('AT_POS.ARREMESSO.FINALIZACAO_6M_FAV')
    const goalRequired = getLiveCollectionRequiredFields(contract, {
      resultadoFactualCode: 'GOL',
    })
    const defendedRequired = getLiveCollectionRequiredFields(contract, {
      resultadoFactualCode: 'DEFENDIDO',
    })

    expect(goalRequired).toContain('tipoFinalizacaoCode')
    expect(goalRequired).toContain('motivoPontuacaoCode')
    expect(goalRequired).toContain('pontosJogada')
    expect(defendedRequired).toContain('tipoFinalizacaoCode')
    expect(defendedRequired).not.toContain('motivoPontuacaoCode')
    expect(defendedRequired).not.toContain('pontosJogada')
  })

  test('motivos manuais de pontuacao em arremesso simples nao reabrem GIRO, AEREA ou 6M', () => {
    for (const flowId of ['AT_POS.ARREMESSO.ARREMESSO', 'TRANS_OF.ARREMESSO.ARREMESSO'] as const) {
      const contract = getLiveCollectionFlowContract(flowId)
      const simpleGoalRule = contract.manualScoringWhen?.find(
        (rule) => rule.if.tipoFinalizacaoCode === 'SIMPLES' && rule.if.resultadoFactualCode === 'GOL',
      )

      expect(simpleGoalRule).toBeDefined()
      expect(simpleGoalRule?.allowedMotivoPontuacaoCode).toEqual([
        'SIMPLES',
        'ESPECIALISTA',
        'GOLEIRA',
        'GOL_CONTRA',
        'NAO_OBSERVADO',
      ])
      expect(simpleGoalRule?.forbiddenMotivoPontuacaoCode).toEqual(['GIRO', 'AEREA', '6M'])
      expect(getAllowedScoringReasons(contract.phase, contract.category, contract.action)).toEqual([
        'SIMPLES',
        'GIRO',
        'AEREA',
        '6M',
        'GOLEIRA',
        'ESPECIALISTA',
        'GOL_CONTRA',
        'NAO_OBSERVADO',
      ])
    }
  })

  test('invariantes de persistencia mantem COLETA_AO_VIVO restrita a scout_live_entries', () => {
    for (const contract of Object.values(liveCollectionFlowContracts)) {
      expect(contract.persistenceRules).toEqual({
        createTablesOnly: ['scout_live_entries'],
        mustNotCreate: ['scout_plays', 'scout_play_participations'],
        initialValidationStatus: 'PENDENTE',
      })
    }
  })
})

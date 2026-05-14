import {
  LIVE_COLLECTION_PERSISTENCE_INVARIANTS,
  LIVE_COLLECTION_POINTS_BY_SCORING_REASON,
  deriveFinishTypeFromClassification,
  deriveScoringReasonFromClassification,
  getActionCompatibility,
  getAllowedFinishTypes,
  getAllowedBasicActions,
  getAllowedCategoriesForPhase,
  getAllowedClassifications,
  getAllowedPointsForScoringReason,
  getAllowedResults,
  getAllowedResultsForSelection,
  getAllowedScoringReasons,
  getBasicActionListKey,
  getClassificationListKey,
  liveCollectionCompatibilityMatrix,
  shouldShowFinishTypeField,
  shouldShowScoringFields,
} from './liveCollectionCompatibility.matrix'

describe('liveCollectionCompatibilityMatrix', () => {
  test('filtra categorias por fase conforme o contrato canonico', () => {
    expect(getAllowedCategoriesForPhase('AT_POS')).toEqual(['PASSE', 'ARREMESSO', 'NAO_OBSERVADO'])
    expect(getAllowedCategoriesForPhase('DEF_POS')).toEqual(['ACAO_DEFENSIVA', 'NAO_OBSERVADO'])
    expect(getAllowedCategoriesForPhase('TRANS_OF')).toEqual(['PASSE', 'ARREMESSO', 'TROCA_TRANSICAO', 'NAO_OBSERVADO'])
    expect(getAllowedCategoriesForPhase('TRANS_DEF')).toEqual(['ACAO_DEFENSIVA', 'TROCA_TRANSICAO', 'NAO_OBSERVADO'])
  })

  test('AT_POS + PASSE bloqueia resultados de finalizacao e campos de pontuacao', () => {
    const rule = getActionCompatibility('AT_POS', 'PASSE', 'PASSE')
    expect(rule).toBeDefined()
    expect(getAllowedClassifications('AT_POS', 'PASSE', 'PASSE')).toContain('PASSE_APOIADO')
    expect(getAllowedResults('AT_POS', 'PASSE', 'PASSE')).toEqual([
      'ERRO_PASSE',
      'PASSE_INTERCEPTADO',
      'PERDA',
      'VIOLACAO',
      'PASSIVO',
      'FALTA_ATAQUE',
      'NAO_OBSERVADO',
    ])
    expect(rule?.forbiddenResults).toContain('GOL')
    expect(rule?.forbiddenFields).toEqual(['tipoFinalizacaoCode', 'motivoPontuacaoCode', 'pontosJogada'])
    expect(shouldShowFinishTypeField('AT_POS', 'PASSE', 'PASSE', 'PERDA')).toBe(false)
    expect(shouldShowScoringFields('AT_POS', 'PASSE', 'PASSE', 'PERDA')).toBe(false)
  })

  test('AT_POS + ARREMESSO deriva tipo de finalizacao e mostra pontuacao apenas no gol', () => {
    expect(getBasicActionListKey('AT_POS', 'ARREMESSO')).toBe('LISTA_ACAO_BASICA_ARREMESSO')
    expect(getAllowedBasicActions('AT_POS', 'ARREMESSO')).toEqual(['ARREMESSO'])
    expect(getClassificationListKey('AT_POS', 'ARREMESSO', 'ARREMESSO')).toBe('LISTA_CLASSIF_ARREMESSO')
    expect(getAllowedClassifications('AT_POS', 'ARREMESSO', 'ARREMESSO')).toEqual([
      'GIRO',
      'AEREA',
      'ARREM_SIMPLES',
    ])
    expect(deriveFinishTypeFromClassification('AT_POS', 'ARREMESSO', 'ARREMESSO', 'GIRO')).toBe('GIRO')
    expect(deriveFinishTypeFromClassification('AT_POS', 'ARREMESSO', 'ARREMESSO', 'ARREM_SIMPLES')).toBe('SIMPLES')
    expect(deriveScoringReasonFromClassification('AT_POS', 'ARREMESSO', 'ARREMESSO', 'GIRO')).toBe('GIRO')
    expect(deriveScoringReasonFromClassification('AT_POS', 'ARREMESSO', 'ARREMESSO', 'AEREA')).toBe('AEREA')
    expect(shouldShowFinishTypeField('AT_POS', 'ARREMESSO', 'ARREMESSO', 'GOL')).toBe(false)
    expect(shouldShowScoringFields('AT_POS', 'ARREMESSO', 'ARREMESSO', 'GOL')).toBe(true)
    expect(shouldShowScoringFields('AT_POS', 'ARREMESSO', 'ARREMESSO', 'DEFENDIDO')).toBe(false)
  })

  test('DEF_POS + BLOQUEIO deriva finalizacao adversaria e oculta campo manual', () => {
    expect(deriveFinishTypeFromClassification('DEF_POS', 'ACAO_DEFENSIVA', 'BLOQUEIO', 'BLOQ_GIRO')).toBe('GIRO')
    expect(deriveFinishTypeFromClassification('DEF_POS', 'ACAO_DEFENSIVA', 'BLOQUEIO', 'BLOQ_ARREM_SIMPLES')).toBe('SIMPLES')
    expect(deriveFinishTypeFromClassification('DEF_POS', 'ACAO_DEFENSIVA', 'BLOQUEIO', 'BLOQ_AEREA')).toBe('AEREA')
    expect(shouldShowFinishTypeField('DEF_POS', 'ACAO_DEFENSIVA', 'BLOQUEIO', 'BLOQUEADO')).toBe(false)
    expect(getAllowedResults('DEF_POS', 'ACAO_DEFENSIVA', 'BLOQUEIO')).toContain('GOL')
  })

  test('DEF_POS + INTERCEPTACAO e ROUBO nao aceitam gol sofrido', () => {
    const interceptacao = getActionCompatibility('DEF_POS', 'ACAO_DEFENSIVA', 'INTERCEPTACAO')
    const roubo = getActionCompatibility('DEF_POS', 'ACAO_DEFENSIVA', 'ROUBO')

    expect(interceptacao?.allowedResults).not.toContain('GOL')
    expect(roubo?.allowedResults).not.toContain('GOL')
    expect(interceptacao?.forbiddenResults).toContain('GOL')
    expect(roubo?.forbiddenResults).toContain('GOL')
    expect(shouldShowFinishTypeField('DEF_POS', 'ACAO_DEFENSIVA', 'INTERCEPTACAO', 'RECUPERACAO_POSSE')).toBe(false)
    expect(shouldShowFinishTypeField('DEF_POS', 'ACAO_DEFENSIVA', 'ROUBO', 'RECUPERACAO_POSSE')).toBe(false)
  })

  test('DEF_POS + COBERTURA mostra finalizacao adversaria apenas quando ha arremesso', () => {
    expect(shouldShowFinishTypeField('DEF_POS', 'ACAO_DEFENSIVA', 'COBERTURA', 'GOL')).toBe(true)
    expect(shouldShowFinishTypeField('DEF_POS', 'ACAO_DEFENSIVA', 'COBERTURA', 'DEFENDIDO')).toBe(true)
    expect(shouldShowFinishTypeField('DEF_POS', 'ACAO_DEFENSIVA', 'COBERTURA', 'RECUPERACAO_POSSE')).toBe(false)
    expect(getAllowedFinishTypes('DEF_POS', 'ACAO_DEFENSIVA', 'COBERTURA')).toEqual([
      'SIMPLES',
      'GIRO',
      'AEREA',
      'NAO_OBSERVADO',
    ])
  })

  test('TRANS_OF + ARREMESSO permite classificacoes exclusivas de transicao', () => {
    expect(getAllowedClassifications('TRANS_OF', 'ARREMESSO', 'ARREMESSO')).toEqual([
      'FINALIZ_TRANS',
      'FINALIZ_CONTRA',
      'AEREA_TRANS',
    ])
    expect(deriveFinishTypeFromClassification('TRANS_OF', 'ARREMESSO', 'ARREMESSO', 'FINALIZ_CONTRA')).toBe('SIMPLES')
    expect(deriveFinishTypeFromClassification('TRANS_OF', 'ARREMESSO', 'ARREMESSO', 'AEREA_TRANS')).toBe('AEREA')
    expect(deriveScoringReasonFromClassification('TRANS_OF', 'ARREMESSO', 'ARREMESSO', 'AEREA_TRANS')).toBe('AEREA')
    expect(getAllowedScoringReasons('TRANS_OF', 'ARREMESSO', 'ARREMESSO')).toContain('ESPECIALISTA')
  })

  test('TROCA_TRANSICAO separa ações ofensivas e defensivas por fase', () => {
    expect(getAllowedBasicActions('TRANS_OF', 'TROCA_TRANSICAO')).toEqual([
      'ENTRADA_OFENSIVA',
      'TROCA_OFENSIVA',
    ])
    expect(getAllowedBasicActions('TRANS_DEF', 'TROCA_TRANSICAO')).toEqual([
      'TROCA_DEFENSIVA',
      'ESTABILIZACAO',
    ])
    expect(getAllowedClassifications('TRANS_OF', 'TROCA_TRANSICAO', 'ENTRADA_OFENSIVA')).toEqual([
      'ENTRADA_AT_POS',
      'ERRO_TROCA_TRANS',
    ])
    expect(getAllowedClassifications('TRANS_DEF', 'TROCA_TRANSICAO', 'TROCA_DEFENSIVA')).toEqual([
      'TRANS_NEUTRALIZADA',
      'DEF_ESTABILIZADA_TR',
      'ERRO_TROCA_TRANS',
    ])
  })

  test('NAO_OBSERVADO fecha o slice sem acao basica e restringe resultado', () => {
    expect(getAllowedBasicActions('AT_POS', 'NAO_OBSERVADO')).toEqual([])
    expect(getAllowedResultsForSelection('AT_POS', 'NAO_OBSERVADO', '')).toEqual(['NAO_OBSERVADO'])
  })

  test('regras de pontuacao por motivo batem com o comportamento validado', () => {
    expect(LIVE_COLLECTION_POINTS_BY_SCORING_REASON.SIMPLES).toEqual([1])
    expect(LIVE_COLLECTION_POINTS_BY_SCORING_REASON.GOLEIRA).toEqual([2])
    expect(LIVE_COLLECTION_POINTS_BY_SCORING_REASON.ESPECIALISTA).toEqual([2])
    expect(LIVE_COLLECTION_POINTS_BY_SCORING_REASON['6M']).toEqual([2])
    expect(getAllowedPointsForScoringReason('GIRO')).toEqual([1, 2])
    expect(getAllowedPointsForScoringReason('AEREA')).toEqual([1, 2])
    expect(getAllowedPointsForScoringReason('GOL_CONTRA')).toEqual([1])
  })

  test('invariantes de persistencia travam criacao fora de scout_live_entries', () => {
    expect(LIVE_COLLECTION_PERSISTENCE_INVARIANTS.createTablesOnly).toEqual(['scout_live_entries'])
    expect(LIVE_COLLECTION_PERSISTENCE_INVARIANTS.mustNotCreate).toEqual([
      'scout_plays',
      'scout_play_participations',
    ])
    expect(LIVE_COLLECTION_PERSISTENCE_INVARIANTS.initialValidationStatus).toBe('PENDENTE')
  })

  test('nao ha intersecao entre allowedResults e forbiddenResults nas regras explicitadas', () => {
    for (const phase of Object.values(liveCollectionCompatibilityMatrix)) {
      for (const category of Object.values(phase.categories)) {
        if (!category) continue
        for (const action of Object.values(category.actions)) {
          if (!action) continue
          const allowed = new Set(action.allowedResults)
          for (const forbidden of action.forbiddenResults ?? []) {
            expect(allowed.has(forbidden)).toBe(false)
          }
        }
      }
    }
  })
})

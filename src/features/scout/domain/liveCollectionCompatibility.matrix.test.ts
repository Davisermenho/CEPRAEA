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
  shouldShowAcaoPreparatoria,
  shouldShowExecucaoBloqueio,
  shouldShowFinishTypeField,
  shouldShowScoringFields,
  shouldShowTransicaoStructure,
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

  test('AT_POS + ARREMESSO usa tipo_finalizacao_code como campo semantico e mostra pontuacao apenas no gol', () => {
    expect(getBasicActionListKey('AT_POS', 'ARREMESSO')).toBe('LISTA_ACAO_BASICA_ARREMESSO')
    expect(getAllowedBasicActions('AT_POS', 'ARREMESSO')).toEqual(['ARREMESSO', 'FINALIZACAO_6M_FAV'])
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
    expect(getAllowedFinishTypes('AT_POS', 'ARREMESSO', 'ARREMESSO')).toEqual(['SIMPLES', 'GIRO', 'AEREA'])
    expect(getAllowedResults('AT_POS', 'ARREMESSO', 'ARREMESSO')).toContain('PASSIVO')
    expect(shouldShowFinishTypeField('AT_POS', 'ARREMESSO', 'ARREMESSO', 'GOL')).toBe(true)
    expect(shouldShowFinishTypeField('AT_POS', 'ARREMESSO', 'ARREMESSO', 'PASSIVO')).toBe(false)
    expect(shouldShowScoringFields('AT_POS', 'ARREMESSO', 'ARREMESSO', 'GOL')).toBe(true)
    expect(shouldShowScoringFields('AT_POS', 'ARREMESSO', 'ARREMESSO', 'DEFENDIDO')).toBe(false)
  })

  test('CEPR-0096: AT_POS + FINALIZACAO_6M_FAV + GOL é válido e pontua 2', () => {
    expect(getAllowedBasicActions('AT_POS', 'ARREMESSO')).toContain('FINALIZACAO_6M_FAV')
    expect(getAllowedClassifications('AT_POS', 'ARREMESSO', 'FINALIZACAO_6M_FAV')).toEqual([])
    expect(getAllowedResultsForSelection('AT_POS', 'ARREMESSO', 'FINALIZACAO_6M_FAV')).toEqual([
      'GOL',
      'DEFENDIDO',
      'FORA',
      'TRAVE',
      'VIOLACAO',
      'NAO_OBSERVADO',
    ])
    expect(getAllowedResultsForSelection('AT_POS', 'ARREMESSO', 'FINALIZACAO_6M_FAV')).not.toContain('BLOQUEADO')
    expect(getAllowedFinishTypes('AT_POS', 'ARREMESSO', 'FINALIZACAO_6M_FAV')).toEqual(['6M'])
    expect(getAllowedScoringReasons('AT_POS', 'ARREMESSO', 'FINALIZACAO_6M_FAV')).toEqual(['6M'])
    expect(shouldShowFinishTypeField('AT_POS', 'ARREMESSO', 'FINALIZACAO_6M_FAV', 'GOL')).toBe(true)
    expect(shouldShowScoringFields('AT_POS', 'ARREMESSO', 'FINALIZACAO_6M_FAV', 'GOL')).toBe(true)
    expect(getAllowedPointsForScoringReason('6M')).toEqual([2])
  })

  // ── CEPR-0092: BLOQUEIO — finalização adversária separada da execução ───────

  test('CEPR-0092: DEF_POS + BLOQUEIO deriva tipo de finalização adversária a partir da classificação (novos codes)', () => {
    expect(deriveFinishTypeFromClassification('DEF_POS', 'ACAO_DEFENSIVA', 'BLOQUEIO', 'GIRO')).toBe('GIRO')
    expect(deriveFinishTypeFromClassification('DEF_POS', 'ACAO_DEFENSIVA', 'BLOQUEIO', 'AEREA')).toBe('AEREA')
    expect(deriveFinishTypeFromClassification('DEF_POS', 'ACAO_DEFENSIVA', 'BLOQUEIO', 'ARREM_SIMPLES')).toBe('SIMPLES')
    expect(deriveFinishTypeFromClassification('DEF_POS', 'ACAO_DEFENSIVA', 'BLOQUEIO', '6M_ADV')).toBe('6M')
    // NAO_OBSERVADO não deriva tipo de finalização
    expect(deriveFinishTypeFromClassification('DEF_POS', 'ACAO_DEFENSIVA', 'BLOQUEIO', 'NAO_OBSERVADO')).toBeUndefined()
    expect(shouldShowFinishTypeField('DEF_POS', 'ACAO_DEFENSIVA', 'BLOQUEIO', 'BLOQUEADO')).toBe(false)
  })

  test('CEPR-0092: DEF_POS + BLOQUEIO allowedClassifications usa novos codes de finalização adversária', () => {
    const classifications = getAllowedClassifications('DEF_POS', 'ACAO_DEFENSIVA', 'BLOQUEIO')
    expect(classifications).toContain('GIRO')
    expect(classifications).toContain('AEREA')
    expect(classifications).toContain('ARREM_SIMPLES')
    expect(classifications).toContain('6M_ADV')
    expect(classifications).toContain('NAO_OBSERVADO')
    // Codes antigos (CEPR-0090 e anteriores) não devem mais aparecer
    expect(classifications).not.toContain('BLOQ_GIRO')
    expect(classifications).not.toContain('BLOQ_ARREM_SIMPLES')
    expect(classifications).not.toContain('BLOQ_AEREA')
    expect(classifications).not.toContain('BLOQ_NAO_EXECUTADO')
  })

  test('CEPR-0092: DEF_POS + BLOQUEIO aceita TIRO_6M_CONCEDIDO como resultado factual', () => {
    const results = getAllowedResults('DEF_POS', 'ACAO_DEFENSIVA', 'BLOQUEIO')
    expect(results).toContain('TIRO_6M_CONCEDIDO')
    expect(results).toContain('GOL')
    expect(results).toContain('BLOQUEADO')
    expect(results).toContain('RECUPERACAO_POSSE')
  })

  test('CEPR-0092: shouldShowExecucaoBloqueio ativo apenas para BLOQUEIO', () => {
    expect(shouldShowExecucaoBloqueio('DEF_POS', 'ACAO_DEFENSIVA', 'BLOQUEIO')).toBe(true)
    expect(shouldShowExecucaoBloqueio('DEF_POS', 'ACAO_DEFENSIVA', 'INTERCEPTACAO')).toBe(false)
    expect(shouldShowExecucaoBloqueio('DEF_POS', 'ACAO_DEFENSIVA', 'COBERTURA')).toBe(false)
    expect(shouldShowExecucaoBloqueio('DEF_POS', 'ACAO_DEFENSIVA', 'MARCACAO_PRESSAO')).toBe(false)
    expect(shouldShowExecucaoBloqueio('TRANS_DEF', 'ACAO_DEFENSIVA', 'BLOQUEIO')).toBe(false)
    expect(shouldShowExecucaoBloqueio('DEF_POS', '', '')).toBe(false)
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

  test('TRANS_OF + ARREMESSO nao oferece classificacoes legadas (CEPR-0090B: estrutura separada)', () => {
    // Classificações FINALIZ_TRANS/FINALIZ_CONTRA/AEREA_TRANS são legado — não aparecem em novos registros.
    // A estrutura da transição agora é campo separado: estruturaTransicaoCode.
    expect(getAllowedClassifications('TRANS_OF', 'ARREMESSO', 'ARREMESSO')).toEqual([])
    const rule = getActionCompatibility('TRANS_OF', 'ARREMESSO', 'ARREMESSO')
    expect(rule?.forbiddenClassifications).toContain('AEREA_TRANS')
    expect(rule?.forbiddenClassifications).toContain('FINALIZ_TRANS')
    expect(rule?.forbiddenClassifications).toContain('FINALIZ_CONTRA')
    expect(getAllowedResults('TRANS_OF', 'ARREMESSO', 'ARREMESSO')).toContain('PASSIVO')
    // tipo_finalizacao_code é exibido manualmente (when-shot-result)
    expect(shouldShowFinishTypeField('TRANS_OF', 'ARREMESSO', 'ARREMESSO', 'GOL')).toBe(true)
    expect(shouldShowFinishTypeField('TRANS_OF', 'ARREMESSO', 'ARREMESSO', 'RECUPERACAO_POSSE')).toBe(false)
    expect(getAllowedScoringReasons('TRANS_OF', 'ARREMESSO', 'ARREMESSO')).toContain('ESPECIALISTA')
    // Campo de estrutura de transição visível apenas em TRANS_OF + ARREMESSO
    expect(shouldShowTransicaoStructure('TRANS_OF', 'ARREMESSO', 'ARREMESSO')).toBe(true)
    expect(shouldShowTransicaoStructure('AT_POS', 'ARREMESSO', 'ARREMESSO')).toBe(false)
    expect(shouldShowTransicaoStructure('TRANS_DEF', 'ARREMESSO', 'ARREMESSO')).toBe(false)
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

  // ── CEPR-0090: Regressões dos 11 lances do PILOTO-01 ──────────────────────

  test('PILOTO-01 #10 (BLOCKER): DEF_POS + COBERTURA aceita TIRO_6M_CONCEDIDO', () => {
    const results = getAllowedResultsForSelection('DEF_POS', 'ACAO_DEFENSIVA', 'COBERTURA')
    expect(results).toContain('TIRO_6M_CONCEDIDO')
  })

  test('PILOTO-01 #11 (BLOCKER): DEF_POS + FINALIZACAO_6M_ADV + GOL é valido', () => {
    expect(getAllowedBasicActions('DEF_POS', 'ACAO_DEFENSIVA')).toContain('FINALIZACAO_6M_ADV')
    const results = getAllowedResultsForSelection('DEF_POS', 'ACAO_DEFENSIVA', 'FINALIZACAO_6M_ADV')
    expect(results).toContain('GOL')
    expect(results).toContain('DEFENDIDO')
    expect(results).toContain('FORA')
    expect(results).toContain('TRAVE')
    expect(results).not.toContain('TIRO_6M_CONCEDIDO')
    const rule = getActionCompatibility('DEF_POS', 'ACAO_DEFENSIVA', 'FINALIZACAO_6M_ADV')
    expect(getAllowedFinishTypes('DEF_POS', 'ACAO_DEFENSIVA', 'FINALIZACAO_6M_ADV')).toEqual(['6M'])
    expect(rule?.showScoringFields).toBe('never')
  })

  test('CEPR-0092 #01: DEF_POS + BLOQUEIO + NAO_OBSERVADO + GOL aceito (sem tipo_finalizacao derivado)', () => {
    // NAO_OBSERVADO como tipo da finalização adversária: GOL é permitido sem tipo_finalizacao
    const resultsBase = getAllowedResultsForSelection('DEF_POS', 'ACAO_DEFENSIVA', 'BLOQUEIO')
    expect(resultsBase).toContain('GOL')
    // NAO_OBSERVADO não deriva tipo de finalização — registro fica pendente de revisão
    expect(deriveFinishTypeFromClassification('DEF_POS', 'ACAO_DEFENSIVA', 'BLOQUEIO', 'NAO_OBSERVADO')).toBeUndefined()
  })

  test('PILOTO-01 #02 (HIGH): DEF_POS + COBERTURA + FECHAMENTO_CENTRAL + GOL é valido', () => {
    expect(getAllowedClassifications('DEF_POS', 'ACAO_DEFENSIVA', 'COBERTURA')).toContain('FECHAMENTO_CENTRAL')
    const results = getAllowedResultsForSelection('DEF_POS', 'ACAO_DEFENSIVA', 'COBERTURA')
    expect(results).toContain('GOL')
  })

  test('PILOTO-01 #03 (HIGH): DEF_POS + COBERTURA + COBERTURA_PIVO + GOL é valido', () => {
    expect(getAllowedClassifications('DEF_POS', 'ACAO_DEFENSIVA', 'COBERTURA')).toContain('COBERTURA_PIVO')
    const results = getAllowedResultsForSelection('DEF_POS', 'ACAO_DEFENSIVA', 'COBERTURA')
    expect(results).toContain('GOL')
    expect(shouldShowFinishTypeField('DEF_POS', 'ACAO_DEFENSIVA', 'COBERTURA', 'GOL')).toBe(true)
    expect(getAllowedFinishTypes('DEF_POS', 'ACAO_DEFENSIVA', 'COBERTURA')).toContain('AEREA')
  })

  test('PILOTO-01 #06 (HIGH): DEF_POS + INTERCEPTACAO + INTERCEPTACAO_MALSUCEDIDA permite GOL', () => {
    expect(getAllowedClassifications('DEF_POS', 'ACAO_DEFENSIVA', 'INTERCEPTACAO')).toContain('INTERCEPTACAO_MALSUCEDIDA')
    const withMalsucedida = getAllowedResultsForSelection('DEF_POS', 'ACAO_DEFENSIVA', 'INTERCEPTACAO', 'INTERCEPTACAO_MALSUCEDIDA')
    expect(withMalsucedida).toContain('GOL')
    expect(withMalsucedida).toContain('DEFENDIDO')
  })

  test('PILOTO-01 #06 (NEGATIVO): DEF_POS + INTERCEPTACAO sem MALSUCEDIDA rejeita GOL', () => {
    const rule = getActionCompatibility('DEF_POS', 'ACAO_DEFENSIVA', 'INTERCEPTACAO')
    expect(rule?.forbiddenResults).toContain('GOL')
    // Sem classificação malsucedida, GOL não está no allowedResults base
    const baseResults = getAllowedResultsForSelection('DEF_POS', 'ACAO_DEFENSIVA', 'INTERCEPTACAO')
    expect(baseResults).not.toContain('GOL')
  })

  test('PILOTO-01 #04 (HIGH): TRANS_OF + ARREMESSO + TRANS_INDIRETA_2X1 (campo separado) + resultado DEFENDIDO é valido', () => {
    // Estrutura da transição é campo separado — a matriz permite os resultados de finalização
    const results = getAllowedResultsForSelection('TRANS_OF', 'ARREMESSO', 'ARREMESSO')
    expect(results).toContain('DEFENDIDO')
    expect(results).toContain('GOL')
    expect(results).toContain('BLOQUEADO')
  })

  test('PILOTO-01 #07 (HIGH): TRANS_OF + ARREMESSO permite tipo GIRO via seleção manual', () => {
    // GIRO não é mais derivado de classificação — usuário seleciona manualmente
    expect(getAllowedFinishTypes('TRANS_OF', 'ARREMESSO', 'ARREMESSO')).toContain('GIRO')
    expect(shouldShowFinishTypeField('TRANS_OF', 'ARREMESSO', 'ARREMESSO', 'GOL')).toBe(true)
  })

  test('PILOTO-01 #09 (HIGH): TRANS_OF + ARREMESSO permite GIRO + BLOQUEADO', () => {
    const results = getAllowedResultsForSelection('TRANS_OF', 'ARREMESSO', 'ARREMESSO')
    expect(results).toContain('BLOQUEADO')
    expect(getAllowedFinishTypes('TRANS_OF', 'ARREMESSO', 'ARREMESSO')).toContain('GIRO')
  })

  test('PILOTO-01 #05 (HIGH): AT_POS + ARREMESSO exibe campo de acao preparatoria opcional', () => {
    expect(shouldShowAcaoPreparatoria('AT_POS', 'ARREMESSO', 'ARREMESSO')).toBe(true)
    expect(shouldShowAcaoPreparatoria('DEF_POS', 'ACAO_DEFENSIVA', 'BLOQUEIO')).toBe(false)
    expect(shouldShowAcaoPreparatoria('TRANS_OF', 'ARREMESSO', 'ARREMESSO')).toBe(false)
    // Acao preparatória não bloqueia o submit — resultado GOL ainda é permitido
    const results = getAllowedResultsForSelection('AT_POS', 'ARREMESSO', 'ARREMESSO')
    expect(results).toContain('GOL')
  })

  test('PILOTO-01 #08 (HIGH): TRANS_DEF + MARCACAO_PRESSAO ja tinha RECUPERACAO_POSSE', () => {
    const results = getAllowedResultsForSelection('TRANS_DEF', 'ACAO_DEFENSIVA', 'MARCACAO_PRESSAO')
    expect(results).toContain('RECUPERACAO_POSSE')
  })

  test('PILOTO-01 LEGADO: AEREA_TRANS nao aparece em allowedClassifications de TRANS_OF', () => {
    // Dados antigos podem ter AEREA_TRANS armazenado — legível mas não oferecido em novos registros.
    expect(getAllowedClassifications('TRANS_OF', 'ARREMESSO', 'ARREMESSO')).not.toContain('AEREA_TRANS')
    const rule = getActionCompatibility('TRANS_OF', 'ARREMESSO', 'ARREMESSO')
    expect(rule?.forbiddenClassifications).toContain('AEREA_TRANS')
  })

  test('PILOTO-01 MARCACAO_PRESSAO DEF_POS aceita TIRO_6M_CONCEDIDO', () => {
    const results = getAllowedResultsForSelection('DEF_POS', 'ACAO_DEFENSIVA', 'MARCACAO_PRESSAO')
    expect(results).toContain('TIRO_6M_CONCEDIDO')
    expect(getAllowedClassifications('DEF_POS', 'ACAO_DEFENSIVA', 'MARCACAO_PRESSAO')).toContain('TROCA_REFERENCIA')
  })
})

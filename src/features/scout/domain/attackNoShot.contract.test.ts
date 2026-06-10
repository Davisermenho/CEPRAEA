import { describe, expect, it } from 'vitest'

import {
  ATTACK_NO_SHOT_EVENT_CODES,
  ATTACK_NO_SHOT_EVENTS,
  ATTACK_NO_SHOT_RESULT,
  evaluateIntraObserverConsistency,
  validateAttackNoShotEntry,
} from './attackNoShot.contract'

describe('Ataque sem Finalização v1.0', () => {
  it('PASS: os 7 eventos estão definidos com resultado_posse_auto correto', () => {
    expect(ATTACK_NO_SHOT_EVENT_CODES).toHaveLength(7)

    for (const code of ATTACK_NO_SHOT_EVENT_CODES) {
      expect(ATTACK_NO_SHOT_EVENTS[code].resultadoPosseAuto).toBe(ATTACK_NO_SHOT_RESULT)
      expect(ATTACK_NO_SHOT_EVENTS[code].fonteValidacao).toBeTruthy()
      expect(ATTACK_NO_SHOT_EVENTS[code].uiTipo).toBeTruthy()
    }
  })

  it('PASS: technical_error_unforced exige subtipo técnico e campos obrigatórios', () => {
    const result = validateAttackNoShotEntry({
      eventCode: 'technical_error_unforced',
      athleteId: 'athlete-1',
      courtZone: 'central',
      positionCode: 'central',
      technicalErrorSubtype: 'pass_error',
    })

    expect(result.ok).toBe(true)
    expect(result.derived.resultadoPosseAuto).toBe('lost_possession_no_shot')
    expect(result.derived.points).toBe(0)
  })

  it('FAIL: technical_error_unforced sem subtipo técnico é bloqueado', () => {
    const result = validateAttackNoShotEntry({
      eventCode: 'technical_error_unforced',
      athleteId: 'athlete-1',
      courtZone: 'central',
      positionCode: 'central',
    })

    expect(result.ok).toBe(false)
    expect(result.errors).toContain('technical_error_unforced exige subtipo_erro_tecnico válido.')
  })

  it('PASS: technical_error_forced deriva defesa_forcou_erro', () => {
    const result = validateAttackNoShotEntry({
      eventCode: 'technical_error_forced',
      athleteId: 'athlete-1',
      courtZone: 'lateral-direita',
      positionCode: 'lateral',
      technicalErrorSubtype: 'reception_error',
    })

    expect(result.ok).toBe(true)
    expect(result.derived.defenseForcedError).toBe(true)
  })

  it('FAIL: passive_play_turnover sem subtipo_jogo_passivo é bloqueado', () => {
    const result = validateAttackNoShotEntry({
      eventCode: 'passive_play_turnover',
      systemCode: 'AT_4_0',
    })

    expect(result.ok).toBe(false)
    expect(result.errors).toContain('passive_play_turnover exige subtipo_jogo_passivo válido.')
  })

  it('PASS: passive_play_turnover exige sistema e aceita subtipo válido', () => {
    const result = validateAttackNoShotEntry({
      eventCode: 'passive_play_turnover',
      systemCode: 'AT_4_0',
      passivePlaySubtype: 'passive_fifth_pass_no_shot',
    })

    expect(result.ok).toBe(true)
  })

  it('FAIL: bad_substitution_attack sem subtipo_erro_substituicao é bloqueado', () => {
    const result = validateAttackNoShotEntry({
      eventCode: 'bad_substitution_attack',
      systemCode: 'AT_3_1',
    })

    expect(result.ok).toBe(false)
    expect(result.errors).toContain('bad_substitution_attack exige subtipo_erro_substituicao válido.')
  })

  it('FAIL: substitution_violation_other exige review_marker', () => {
    const result = validateAttackNoShotEntry({
      eventCode: 'bad_substitution_attack',
      systemCode: 'AT_3_1',
      substitutionErrorSubtype: 'substitution_violation_other',
    })

    expect(result.ok).toBe(false)
    expect(result.errors).toContain('bad_substitution_attack exige review_marker = Sim nesta condição.')
  })

  it('PASS: turnover_unclassified com review_marker é aceito', () => {
    const result = validateAttackNoShotEntry({
      eventCode: 'turnover_unclassified',
      reviewMarker: true,
    })

    expect(result.ok).toBe(true)
    expect(result.derived.reviewMarker).toBe(true)
  })

  it('FAIL: turnover_unclassified sem review_marker é bloqueado', () => {
    const result = validateAttackNoShotEntry({ eventCode: 'turnover_unclassified' })

    expect(result.ok).toBe(false)
    expect(result.errors).toContain('turnover_unclassified exige review_marker = Sim nesta condição.')
  })

  it('FAIL: evento fora do módulo é bloqueado', () => {
    const result = validateAttackNoShotEntry({ eventCode: 'one_point_shot' })

    expect(result.ok).toBe(false)
    expect(result.errors[0]).toContain('Evento fora do módulo Ataque sem Finalização v1.0')
  })

  it('FAIL: tipo de finalização, zona do gol e ponto diferente de zero são bloqueados', () => {
    const result = validateAttackNoShotEntry({
      eventCode: 'offensive_foul',
      athleteId: 'athlete-1',
      courtZone: 'central',
      positionCode: 'central',
      finishTypeCode: 'GIRO',
      goalZone: 'alto-direito',
      points: 2,
    })

    expect(result.ok).toBe(false)
    expect(result.errors).toContain('tipo_finalizacao_code não é permitido.')
    expect(result.errors).toContain('zona_gol não é permitida.')
    expect(result.errors).toContain('pontos_jogada deve ser 0.')
  })

  it('PASS: TESTE-OBS-01 aprova consistência intraobservador >= 85%', () => {
    const result = evaluateIntraObserverConsistency([
      { lanceId: 'L1', firstEventCode: 'technical_error_unforced', secondEventCode: 'technical_error_unforced' },
      { lanceId: 'L2', firstEventCode: 'technical_error_forced', secondEventCode: 'technical_error_forced' },
      { lanceId: 'L3', firstEventCode: 'offensive_foul', secondEventCode: 'offensive_foul' },
      { lanceId: 'L4', firstEventCode: 'passive_play_turnover', secondEventCode: 'passive_play_turnover' },
      { lanceId: 'L5', firstEventCode: 'bad_substitution_attack', secondEventCode: 'bad_substitution_attack' },
      { lanceId: 'L6', firstEventCode: 'turnover_unclassified', secondEventCode: 'turnover_unclassified' },
      { lanceId: 'L7', firstEventCode: 'goal_area_invasion_attack', secondEventCode: 'goal_area_invasion_attack' },
    ])

    expect(result.approved).toBe(true)
    expect(result.requiresDictionaryReview).toBe(false)
    expect(result.consistencyPercent).toBe(100)
  })

  it('FAIL: TESTE-OBS-01 reprova consistência intraobservador abaixo de 85%', () => {
    const result = evaluateIntraObserverConsistency([
      { lanceId: 'L1', firstEventCode: 'technical_error_unforced', secondEventCode: 'technical_error_forced' },
      { lanceId: 'L2', firstEventCode: 'technical_error_forced', secondEventCode: 'technical_error_forced' },
      { lanceId: 'L3', firstEventCode: 'offensive_foul', secondEventCode: 'offensive_foul' },
      { lanceId: 'L4', firstEventCode: 'passive_play_turnover', secondEventCode: 'turnover_unclassified' },
    ])

    expect(result.approved).toBe(false)
    expect(result.requiresDictionaryReview).toBe(true)
    expect(result.divergentLanceIds).toEqual(['L1', 'L4'])
  })
})

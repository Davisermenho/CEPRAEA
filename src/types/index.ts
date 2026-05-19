// ─── Atleta ────────────────────────────────────────────────────────────────────

export type AthleteStatus = 'ativo' | 'inativo'

export interface Athlete {
  id: string
  teamId?: string
  userId?: string
  nome: string
  email: string
  telefone: string
  categoria?: string
  nivel?: string
  status: AthleteStatus
  observacoes?: string
  createdAt: string
  updatedAt: string
}

// ─── Treino ────────────────────────────────────────────────────────────────────

export type TrainingType = 'recorrente' | 'extra'
export type TrainingStatus = 'agendado' | 'realizado' | 'cancelado'

export interface Training {
  id: string
  tipo: TrainingType
  status: TrainingStatus
  data: string         // "YYYY-MM-DD"
  horaInicio: string   // "HH:MM"
  horaFim: string
  local?: string
  observacoes?: string
  feriadoOrigem?: string
  criadoManualmente: boolean
  createdAt: string
  updatedAt: string
}

// ─── Presença ──────────────────────────────────────────────────────────────────

export type AttendanceStatus = 'presente' | 'ausente' | 'justificado' | 'pendente'

export interface AttendanceRecord {
  id: string            // determinístico: `${treinoId}::${atletaId}`
  treinoId: string
  atletaId: string
  status: AttendanceStatus
  justificativa?: string
  confirmadoPelaAtleta: boolean
  registradoEm: string
}

// ─── Feriado ───────────────────────────────────────────────────────────────────

export type HolidayType = 'nacional' | 'estadual' | 'municipal'

export interface Holiday {
  data: string
  nome: string
  tipo: HolidayType
}

export interface HolidayConflict {
  training: Training
  holiday: Holiday
  alternatives: string[]
}

// ─── Configurações ─────────────────────────────────────────────────────────────

export interface RecurrenceSchedule {
  dow: number       // 0 = domingo … 6 = sábado
  horaInicio: string
  horaFim: string
}

export interface AppSettings {
  nomeEquipe: string
  nomeTecnico: string
  telefoneTecnico: string
  localPadrao: string
  semanasFuturas: number
  recurrenceSchedules?: RecurrenceSchedule[]
  appUrl: string
}

export const DEFAULT_SETTINGS: AppSettings = {
  nomeEquipe: 'CEPRAEA',
  nomeTecnico: '',
  telefoneTecnico: '',
  localPadrao: '',
  semanasFuturas: 12,
  recurrenceSchedules: [
    { dow: 4, horaInicio: '20:00', horaFim: '21:30' },
    { dow: 0, horaInicio: '07:30', horaFim: '09:00' },
  ],
  appUrl: typeof window !== 'undefined' ? window.location.origin : '',
}

// ─── Relatórios ────────────────────────────────────────────────────────────────

export interface FrequencyReport {
  atletaId: string
  nomeAtleta: string
  totalTreinos: number
  presentes: number
  ausentes: number
  justificados: number
  percentualPresenca: number
}

export interface TrainingSummary {
  treinoId: string
  totalAtivos: number
  presentes: number
  ausentes: number
  justificados: number
  pendentes: number
}

// ─── Scout ─────────────────────────────────────────────────────────────────────

// Scout v2 / slice 1 — contratos normalizados Supabase-first.

export type ScoutSessionType = 'JOGO' | 'TREINO' | 'AMISTOSO' | 'SIMULADO'
export type ScoutSource = 'AO_VIVO' | 'VIDEO' | 'MISTA'
export type ScoutPhaseCode = 'AT_POS' | 'DEF_POS' | 'TRANS_OF' | 'TRANS_DEF'
export type ScoutTeamSide = 'ANALYZED' | 'OPPONENT'
export type ScoutParticipantScope = 'ATQ' | 'DEF'
export type ScoutValidationStatus = 'PENDENTE' | 'REVISADO' | 'CORRIGIDO' | 'VALIDADO' | 'DUVIDA'
export type ScoutGameStatusCode = 'em_andamento' | 'finalizado'
export type ScoutAnalyzedTeamPhaseCode = 'ATAQUE' | 'DEFESA' | 'TRANS_OF' | 'TRANS_DEF' | 'TROCA' | 'NAO_OBSERVADO'
export type ScoutFinishTypeCode = 'SIMPLES' | 'GIRO' | 'AEREA' | 'ESPECIALISTA' | 'GOLEIRA' | '6M' | 'SHOOTOUT' | 'NAO_OBSERVADO'
export type ScoutFactualResultCode =
  | 'GOL'
  | 'DEFENDIDO'
  | 'BLOQUEADO'
  | 'FORA'
  | 'TRAVE'
  | 'VIOLACAO'
  | 'PERDA'
  | 'RECUPERACAO_POSSE'
  | 'FALTA_ATAQUE'
  | 'PASSIVO'
  | 'ERRO_TROCA'
  | 'TRANSICAO_NEUTRALIZADA'
  | 'DEFESA_ESTABILIZADA'
  | 'VANTAGEM_CRIADA'
  | 'VANTAGEM_PERDIDA'
  | 'ERRO_PASSE'
  | 'PASSE_INTERCEPTADO'
  | 'TIRO_6M_CONCEDIDO'
  | 'NAO_OBSERVADO'
export type ScoutScoringReasonCode =
  | 'SIMPLES'
  | 'GIRO'
  | 'AEREA'
  | '6M'
  | 'GOLEIRA'
  | 'ESPECIALISTA'
  | 'GOL_CONTRA'
  | 'SHOOTOUT'
  | 'VALIDACAO_ARBITRAL'
  | 'NAO_OBSERVADO'

export type ScoutCodeListKey =
  | 'LISTA_FASES'
  | 'LISTA_FASE_EQUIPE'
  | 'LISTA_SISTEMA_OFENSIVO'
  | 'LISTA_CONFIGURACAO_OFENSIVA'
  | 'LISTA_SISTEMA_DEFENSIVO'
  | 'LISTA_ACAO_OFENSIVA'
  | 'LISTA_ACAO_DEFENSIVA'
  | 'LISTA_ACAO_PRINCIPAL_AT_POS'
  | 'LISTA_ACAO_PRINCIPAL_DEF_POS'
  | 'LISTA_ACAO_PRINCIPAL_TRANS_OF'
  | 'LISTA_ACAO_PRINCIPAL_TRANS_DEF'
  | 'LISTA_FORM_TRANS_OF'
  | 'LISTA_OBJETIVO_FORM_TRANS_OF'
  | 'LISTA_STATUS_ESTABILIZACAO_AT_POS'
  | 'LISTA_MOTIVO_FIM_TRANS_OF'
  | 'LISTA_FORM_TRANS_DEF'
  | 'LISTA_OBJETIVO_FORM_TRANS_DEF'
  | 'LISTA_REORGANIZACAO_DEF'
  | 'LISTA_STATUS_ESTABILIZACAO_DEF_POS'
  | 'LISTA_MOTIVO_FIM_TRANS_DEF'
  | 'LISTA_TIPO_FINALIZACAO'
  | 'LISTA_RESULTADO_FACTUAL'
  | 'LISTA_MOTIVO_PONTUACAO'
  | 'LISTA_CAUSA_PRINCIPAL'
  | 'LISTA_PRIORIDADE_TREINO'
  | 'LISTA_STATUS_VALIDACAO'
  | 'LISTA_CONTEXTO_ESPECIAL'
  | 'LISTA_SHOOTOUT'
  | 'LISTA_SHOOTOUT_RESULTADO'
  | 'LISTA_SHOOTOUT_DECISAO'
  | 'LISTA_SHOOTOUT_EXECUCAO'
  | 'LISTA_OUT_SITUACAO'
  | 'LISTA_CAUSA_OUT'
  | 'LISTA_6M'
  | 'LISTA_TIRO_LIVRE'
  | 'LISTA_REPOSICAO_LATERAL'
  | 'LISTA_REPOSICAO_GOLEIRA'
  | 'LISTA_REPOSICAO_APOS_GOL'
  | 'LISTA_GOLDEN_GOAL'
  | 'LISTA_CODIGO_MENTAL'
  | 'LISTA_MARCA_MENTAL'
  | 'LISTA_COMUNICACAO_MOMENTO_CRITICO'
  | 'LISTA_LINGUAGEM_CORPORAL'
  | 'LISTA_EVENTO_MENTAL_GATILHO'
  | 'LISTA_QUALIDADE_RESET_MENTAL'
  | 'LISTA_MAO_DOMINANTE'
  | 'LISTA_FUNCAO_PRINCIPAL'
  | 'LISTA_STATUS_ATLETA'
  | 'LISTA_POS_OF_3X1'
  | 'LISTA_POS_OF_4X0'
  | 'LISTA_POS_DEF_3X0'
  | 'LISTA_TIPO_EQUIPE'
  | 'LISTA_CATEGORIA'
  | 'LISTA_CATEGORIA_ACAO'
  | 'LISTA_ACAO_BASICA_PASSE'
  | 'LISTA_ACAO_BASICA_ARREMESSO'
  | 'LISTA_ACAO_BASICA_ACAO_DEFENSIVA'
  | 'LISTA_ACAO_BASICA_TROCA_TRANSICAO'
  | 'LISTA_CLASSIF_PASSE'
  | 'LISTA_CLASSIF_ARREMESSO'
  | 'LISTA_CLASSIF_BLOQUEIO'
  | 'LISTA_CLASSIF_INTERC_ROUBO'
  | 'LISTA_CLASSIF_TROCA_TRANSICAO'
  | 'LISTA_CLASSIF_COBERTURA'
  | 'LISTA_CLASSIF_MARCACAO_PRESSAO'
  | 'LISTA_ESTRUTURA_TRANSICAO'
  | 'LISTA_ACAO_PREPARATORIA'
  | 'LISTA_EXECUCAO_BLOQUEIO'
  | 'LISTA_CONTEXTO_DECISAO'
  | 'LISTA_CONTEXTO_ARREMESSO'

export interface ScoutCodeValue {
  id: string
  listId: string
  code: string
  label: string
  sortOrder: number
  isNaoAplica: boolean
  isNaoObservado: boolean
  notes?: string
  description?: string
  whenToUse?: string
  whenNotToUse?: string
  active: boolean
}

export interface ScoutCodeList {
  id: string
  listKey: ScoutCodeListKey | string
  label: string
  contractScope?: string
  active: boolean
  sourceVersion: string
  values: ScoutCodeValue[]
}

export interface ScoutFieldCodebookMap {
  id: string
  contractName: string
  fieldName: string
  selectorKey: string
  selectorValue: string
  listKey: ScoutCodeListKey | string
  allowNaoAplica: boolean
  allowNaoObservado: boolean
  active: boolean
}

export interface ScoutGameRecord {
  id: string
  teamId: string
  sessionType?: ScoutSessionType
  gameDate?: string
  analyzedTeam?: string
  opponent?: string
  location?: string
  notes?: string
  status: ScoutGameStatusCode
  createdAt: string
  updatedAt: string
}

export interface ScoutGameWriteInput {
  sessionType?: ScoutSessionType
  gameDate?: string
  analyzedTeam?: string
  opponent?: string
  location?: string
  notes?: string
  status?: ScoutGameStatusCode
}

export interface ScoutGameAthlete {
  id: string
  teamId: string
  scoutGameId: string
  athleteId: string
  createdAt: string
}

export interface ScoutPlay {
  id: string
  teamId: string
  scoutGameId: string
  playCode: string
  sessionDate: string
  sessionType: ScoutSessionType
  opponentName?: string
  period: string
  gameClock: string
  source: ScoutSource
  phaseOfBall: ScoutPhaseCode
  attackingTeamSide: ScoutTeamSide
  defendingTeamSide: ScoutTeamSide
  analyzedTeamPhase?: string
  offensiveSystem?: string
  offensiveConfiguration?: string
  specialOffensiveRole?: string
  temporaryPivotOccupation?: string
  temporaryPivotAthleteId?: string
  temporaryPivotResult?: string
  defensiveSystem?: string
  expectedDefensiveAction?: string
  defensiveConnection?: string
  defensiveAdjustment?: string
  mainOffensiveThreat?: string
  defensiveAdjustmentResult?: string
  finishType?: string
  shotDestination?: string
  shotRegion?: string
  factualResult: string
  playPoints?: string
  playScoreReason?: string
  mainCause?: string
  videoRef?: string
  freeNotes?: string
  outSituation?: string
  numericalStructureReal?: string
  outCause?: string
  specialContext?: string
  shootoutType?: string
  shootoutResult?: string
  shootoutDecision?: string
  shootoutExecution?: string
  tiro6mResult?: string
  tiroLivreResult?: string
  reposicaoLateralResult?: string
  reposicaoGoleiraResult?: string
  reposicaoAposGolResult?: string
  goldenGoalSituation?: string
  validationStatus: ScoutValidationStatus
  createdAt: string
  updatedAt: string
}

export interface ScoutPlayParticipation {
  id: string
  teamId: string
  scoutGameId: string
  scoutPlayId: string
  participantScope: ScoutParticipantScope
  participantSide: ScoutTeamSide
  slotOrder: number
  athleteId?: string
  externalAthleteLabel?: string
  phaseOfAthlete?: ScoutPhaseCode
  participationRole: string
  positionCode?: string
  specialFunctionCode?: string
  actionCode?: string
  individualResult?: string
  mainCause?: string
  trainingPriority?: string
  createdAt: string
}

export interface ScoutLiveEntry {
  id: string
  teamId: string
  scoutGameId: string
  idJogada: string
  tempoJogo: string
  faseDaBolaCode: ScoutPhaseCode
  equipeAnalisadaId: string
  faseEquipeAnalisadaCode: ScoutAnalyzedTeamPhaseCode
  sistemaOfensivoCode?: string
  sistemaDefensivoCode?: string
  atletaPrincipalId?: string
  acaoPrincipalText?: string
  acaoPrincipalSuggestionCode?: string
  acaoPrincipalIsCustom?: boolean
  tipoFinalizacaoCode?: ScoutFinishTypeCode
  resultadoFactualCode: ScoutFactualResultCode
  motivoPontuacaoCode?: ScoutScoringReasonCode
  pontosJogada?: 0 | 1 | 2
  causaProvavelCode?: string
  prioridadeTreinoCode?: string
  videoRef?: string
  statusValidacaoCode: ScoutValidationStatus
  obsGeral?: string
  categoriaAcaoCode?: string
  acaoBasicaCode?: string
  classificacaoAcaoCode?: string
  execucaoBloqueioCode?: string
  estruturaTransicaoCode?: string
  contextoDecisaoCode?: string
  contextoArremessoCode?: string
  acaoPreparatoriaCode?: string
  derivedScoutPlayId?: string
  createdBy?: string
  updatedBy?: string
  createdAt: string
  updatedAt: string
}

export interface ScoutLiveEntryWriteInput {
  idJogada: string
  scoutGameId: string
  tempoJogo: string
  faseDaBolaCode: ScoutPhaseCode
  equipeAnalisadaId: string
  faseEquipeAnalisadaCode: ScoutAnalyzedTeamPhaseCode
  sistemaOfensivoCode?: string
  sistemaDefensivoCode?: string
  atletaPrincipalId?: string
  acaoPrincipalText?: string
  acaoPrincipalSuggestionCode?: string
  acaoPrincipalIsCustom?: boolean | null
  tipoFinalizacaoCode?: ScoutFinishTypeCode
  resultadoFactualCode: ScoutFactualResultCode
  motivoPontuacaoCode?: ScoutScoringReasonCode
  pontosJogada?: 0 | 1 | 2
  causaProvavelCode?: string
  prioridadeTreinoCode?: string
  videoRef?: string
  statusValidacaoCode?: ScoutValidationStatus
  obsGeral?: string
  categoriaAcaoCode?: string
  acaoBasicaCode?: string
  classificacaoAcaoCode?: string
  execucaoBloqueioCode?: string
  estruturaTransicaoCode?: string
  contextoDecisaoCode?: string
  contextoArremessoCode?: string
  acaoPreparatoriaCode?: string
  derivedScoutPlayId?: string
}

export interface ScoutPlayBundle {
  play: ScoutPlay
  participations: ScoutPlayParticipation[]
}

export interface ScoutPlayListItem {
  id: string
  teamId: string
  scoutGameId: string
  playCode: string
  sessionDate: string
  period: string
  gameClock: string
  phaseOfBall: ScoutPhaseCode
  factualResult: string
  validationStatus: ScoutValidationStatus
  updatedAt: string
}

export interface ScoutPlayWriteInput {
  id?: string
  playCode: string
  sessionDate: string
  sessionType: ScoutSessionType
  opponentName?: string
  period: string
  gameClock: string
  source: ScoutSource
  phaseOfBall: ScoutPhaseCode
  attackingTeamSide: ScoutTeamSide
  defendingTeamSide: ScoutTeamSide
  analyzedTeamPhase?: string
  offensiveSystem?: string
  offensiveConfiguration?: string
  specialOffensiveRole?: string
  temporaryPivotOccupation?: string
  temporaryPivotAthleteId?: string
  temporaryPivotResult?: string
  defensiveSystem?: string
  expectedDefensiveAction?: string
  defensiveConnection?: string
  defensiveAdjustment?: string
  mainOffensiveThreat?: string
  defensiveAdjustmentResult?: string
  finishType?: string
  shotDestination?: string
  shotRegion?: string
  factualResult: string
  playPoints?: string
  playScoreReason?: string
  mainCause?: string
  videoRef?: string
  freeNotes?: string
  outSituation?: string
  numericalStructureReal?: string
  outCause?: string
  specialContext?: string
  shootoutType?: string
  shootoutResult?: string
  shootoutDecision?: string
  shootoutExecution?: string
  tiro6mResult?: string
  tiroLivreResult?: string
  reposicaoLateralResult?: string
  reposicaoGoleiraResult?: string
  reposicaoAposGolResult?: string
  goldenGoalSituation?: string
}

export interface ScoutPlayParticipationWriteInput {
  participantScope: ScoutParticipantScope
  participantSide: ScoutTeamSide
  slotOrder: number
  athleteId?: string
  externalAthleteLabel?: string
  phaseOfAthlete?: ScoutPhaseCode
  participationRole: string
  positionCode?: string
  specialFunctionCode?: string
  actionCode?: string
  individualResult?: string
  mainCause?: string
  trainingPriority?: string
}

export interface ScoutPlayBundleUpsertInput {
  scoutGameId: string
  teamId?: string
  play: ScoutPlayWriteInput
  participations?: ScoutPlayParticipationWriteInput[]
}

export interface ScoutMentalEvent {
  id: string
  teamId: string
  scoutGameId: string
  scoutPlayId: string
  athleteId?: string
  externalAthleteLabel?: string
  mentalCode: string
  mentalMark: string
  pressureContext?: string
  mentalTrigger?: string
  responseAfterError?: string
  impactPreviousError?: string
  pressureBehavior?: string
  resetQuality?: string
  criticalCommunication?: string
  bodyLanguage?: string
  pressureProfileGame?: string
  errorSequence?: string
  postErrorAction?: string
  mentalObservation?: string
  validationStatus: ScoutValidationStatus
  createdAt: string
}

export interface ScoutMentalEventWriteInput {
  scoutGameId: string
  scoutPlayId: string
  athleteId?: string
  externalAthleteLabel?: string
  mentalCode: string
  mentalMark: string
  pressureContext?: string
  mentalTrigger?: string
  responseAfterError?: string
  impactPreviousError?: string
  pressureBehavior?: string
  resetQuality?: string
  criticalCommunication?: string
  bodyLanguage?: string
  pressureProfileGame?: string
  errorSequence?: string
  postErrorAction?: string
  mentalObservation?: string
  validationStatus?: ScoutValidationStatus
}

export interface ScoutPlayValidation {
  id: string
  teamId: string
  scoutGameId: string
  scoutPlayId: string
  fieldName: string
  originalValue?: string
  correctedValue?: string
  validationStatus: ScoutValidationStatus
  validatorUserId?: string
  validationAt?: string
  correctionReason: string
  validationNotes?: string
  createdAt: string
}

export interface ScoutPlayValidationWriteInput {
  scoutGameId: string
  scoutPlayId: string
  fieldName: string
  originalValue?: string
  correctedValue?: string
  validationStatus: ScoutValidationStatus
  validatorUserId?: string
  validationAt?: string
  correctionReason: string
  validationNotes?: string
}

// ── Scout: Perfil Atleta (CAD_ATLETAS) ──────────────────────────────────────
export interface AthleteWithScoutProfile {
  // Campos de athletes (cadastro civil)
  id: string
  teamId: string
  userId?: string
  name: string
  email?: string
  phone?: string
  category?: string
  level?: string
  status: AthleteStatus
  notes?: string
  athleteCreatedAt: string
  athleteUpdatedAt: string
  // Campos de athlete_scout_profiles (perfil tático scout)
  dominantHand?: string
  mainFunction?: string
  posOf3x1?: string
  posOf4x0?: string
  posDefOf3x0?: string
  isGoalkeeper: boolean
  isSpecialist: boolean
  isPlaymaker: boolean
  scoutProfileCreatedAt: string
  scoutProfileUpdatedAt: string
}

export interface AthleteWithScoutProfileWriteInput {
  // Campos de athletes
  name: string
  email?: string
  phone?: string
  category?: string
  level?: string
  status?: AthleteStatus
  notes?: string
  // Campos de athlete_scout_profiles
  dominantHand?: string
  mainFunction?: string
  posOf3x1?: string
  posOf4x0?: string
  posDefOf3x0?: string
  isGoalkeeper?: boolean
  isSpecialist?: boolean
  isPlaymaker?: boolean
}

export interface ScoutAthleteFilters {
  name?: string
  isGoalkeeper?: boolean
  mainFunction?: string
  status?: AthleteStatus
}

// ── Scout: Catálogo de Equipes (CAD_EQUIPES) ────────────────────────────────
export interface ScoutCatalogTeam {
  id: string
  teamId: string
  name: string
  teamType?: string
  category?: string
  isInternal: boolean
  linkedTeamId?: string
  createdAt: string
  updatedAt: string
}

export interface ScoutCatalogTeamWriteInput {
  name: string
  teamType?: string
  category?: string
  isInternal?: boolean
  linkedTeamId?: string
}

export interface ScoutCatalogTeamFilters {
  name?: string
  teamType?: string
  category?: string
  isInternal?: boolean
}

// ─── API-12: scout_report ──────────────────────────────────────────────────────

export type ScoutReportTrainingPriority = 'ALTA' | 'MEDIA' | 'BAIXA' | 'MANTER'

export interface ScoutReport {
  id: string
  teamId: string
  scoutGameId: string
  reportBlock: string
  indicator: string
  valueText: string | null
  sampleSize: number | null
  technicalReading: string | null
  trainingPriority: ScoutReportTrainingPriority | null
  evidenceIds: string[] | null
  reportNotes: string | null
  createdAt: string
  updatedAt: string
}

export interface ScoutReportFilters {
  reportBlock?: string
  trainingPriority?: ScoutReportTrainingPriority
}

// ─── API-13: scout_feedback ─────────────────────────────────────────────────

export type ScoutFeedbackRecipient =
  | 'ATLETA'
  | 'SETOR_OFENSIVO'
  | 'SETOR_DEFENSIVO'
  | 'GOLEIRA'
  | 'BLOCO_TRANSICAO'
  | 'EQUIPE'
  | 'COMISSAO'

export type ScoutFeedbackType =
  | 'CORRECAO'
  | 'REFORCO'
  | 'ALERTA'
  | 'ELOGIO_TECNICO'
  | 'AJUSTE_TATICO'
  | 'ORIENTACAO_TREINO'
  | 'REVISAO_VIDEO'

export type ScoutFeedbackStatus = 'PENDENTE' | 'ENTREGUE' | 'APLICADO'

export interface ScoutFeedback {
  id: string
  teamId: string
  scoutGameId: string
  scoutLiveEntryId: string | null
  recipient: ScoutFeedbackRecipient
  athleteId: string | null
  feedbackType: ScoutFeedbackType
  feedbackTopic: string
  evidenceRef: string
  message: string
  recommendedAction: string | null
  priority: ScoutReportTrainingPriority
  feedbackStatus: ScoutFeedbackStatus
  createdAt: string
  updatedAt: string
}

export interface ScoutFeedbackFilters {
  scoutGameId?: string
  athleteId?: string
  recipient?: ScoutFeedbackRecipient
  feedbackStatus?: ScoutFeedbackStatus
}

// Scout legado — manter até a troca completa do runtime/UI.

export interface ScoutAthleteBlock {
  atleta?: string
  numero?: string
  funcao?: string
  categoria?: string
  acao?: string
  resultadoInd?: string
}

export interface SpecialistCentralAnalysis {
  equipe?: 'CEPRAEA' | 'Adversária'
  origemBola?: string
  mexidaInicial?: string
  soltaFixada?: string
  baseDeslocada?: string
  apiDeslocada?: string
  comportamentoDefesa?: string
  momentoAtaque?: string
  ritmo?: string
  previsibilidade?: string
  decisaoFinal?: string
  resultadoEspecialista?: string
}

export interface FinishAnalysis {
  houveFinalizacao?: boolean
  equipeFinalizadora?: 'CEPRAEA' | 'Adversária'
  equipeGoleira?: 'CEPRAEA' | 'Adversária'
  finalizadora?: string
  zonaArremesso?: string
  direcaoGol?: string
  resultadoFinalizacao?: string
  goleira?: string
  acaoGoleira?: string
  tipoFinalizacao?: string
  pontuacaoEsperada?: string
  pontuacaoObtida?: string
  validadeTecnica?: string
}

export interface ReposicaoAnalysis {
  houveReposicao?: boolean
  tipoReposicao?: string
  ladoTroca?: string
  atletaEntrou?: string
  atletaSaiu?: string
  resultadoReposicao?: string
}

export interface ShootoutAnalysis {
  tipoShootout?: string
  passadora?: string
  cobradora?: string
  goleiraDefensora?: string
  tipoLancamento?: string
  tipoFinta?: string
  tipoFinalizacao?: string
  acaoGoleira?: string
  resultadoShootout?: string
}

export type ScoutGameStatus = 'em_andamento' | 'finalizado'

export interface ScoutGame {
  id: string
  data: string              // "YYYY-MM-DD"
  equipeAnalisada: string
  adversario: string
  local?: string
  observacoes?: string
  status: ScoutGameStatus
  createdAt: string
  updatedAt: string
}

export interface ScoutEvent {
  id: string
  jogoId: string
  tempoJogo?: string
  set?: string
  controleJogo?: string

  pontosCEPRAEA?: number
  pontosAdversario?: number
  placarCEPRAEA: number
  placarAdversario: number
  posse?: string

  // Campos legados mantidos para compatibilidade com eventos já salvos.
  faseJogo?: string
  sistema?: string

  // Leitura tática separada por equipe: essencial para cruzar ataque adversário x defesa CEPRAEA.
  faseJogoCEPRAEA?: string
  sistemaTaticoCEPRAEA?: string
  faseJogoAdversaria?: string
  sistemaTaticoAdversaria?: string

  ladoAcao?: string
  goleira?: string
  reposicao?: string

  ataques: ScoutAthleteBlock[]   // até 4; compatibilidade com cards/resumo existentes
  defesas: ScoutAthleteBlock[]   // até 3; compatibilidade com cards/resumo existentes
  ataqueCEPRAEA?: ScoutAthleteBlock[]
  defesaCEPRAEA?: ScoutAthleteBlock[]
  ataqueAdversario?: ScoutAthleteBlock[]
  defesaAdversaria?: ScoutAthleteBlock[]

  especialistaCentral?: SpecialistCentralAnalysis
  finalizacao?: FinishAnalysis
  reposicaoDetalhe?: ReposicaoAnalysis
  shootout?: ShootoutAnalysis

  analise?: string
  resultadoColetivo?: string
  observacao?: string
  revisarVideo: boolean
  createdAt: string
}

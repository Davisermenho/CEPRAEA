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

export type ScoutCodeListKey =
  | 'LISTA_FASES'
  | 'LISTA_SISTEMA_OFENSIVO'
  | 'LISTA_CONFIGURACAO_OFENSIVA'
  | 'LISTA_SISTEMA_DEFENSIVO'
  | 'LISTA_ACAO_OFENSIVA'
  | 'LISTA_ACAO_DEFENSIVA'
  | 'LISTA_RESULTADO_FACTUAL'
  | 'LISTA_CAUSA_PRINCIPAL'
  | 'LISTA_PRIORIDADE_TREINO'

export interface ScoutCodeValue {
  id: string
  listId: string
  code: string
  label: string
  sortOrder: number
  isNaoAplica: boolean
  isNaoObservado: boolean
  notes?: string
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
  gameDate?: string
  analyzedTeam?: string
  opponent?: string
  location?: string
  notes?: string
  status?: ScoutGameStatusCode
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

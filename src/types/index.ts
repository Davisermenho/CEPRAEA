// ─── Atleta ────────────────────────────────────────────────────────────────────

export type AthleteStatus = 'ativo' | 'inativo'

export interface Athlete {
  id: string
  nome: string
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

export interface AppSettings {
  nomeEquipe: string
  nomeTecnico: string
  telefoneTecnico: string
  localPadrao: string
  semanasFuturas: number
  pinHash: string
  appUrl: string
  // Sincronização remota via Apps Script
  syncEndpointUrl?: string
  syncSecret?: string
  lastSyncAt?: string
}

export const DEFAULT_SETTINGS: Omit<AppSettings, 'pinHash'> = {
  nomeEquipe: 'CEPRAEA',
  nomeTecnico: '',
  telefoneTecnico: '',
  localPadrao: '',
  semanasFuturas: 12,
  appUrl: typeof window !== 'undefined' ? window.location.origin : '',
  syncEndpointUrl: '',
  syncSecret: '',
  lastSyncAt: '',
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

export interface ScoutAthleteBlock {
  atleta?: string
  funcao?: string
  categoria?: string
  acao?: string
  resultadoInd?: string
}

export interface SpecialistCentralAnalysis {
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
  tipoFinalizacao?: string
  pontuacaoEsperada?: string
  pontuacaoObtida?: string
  validadeTecnica?: string
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
  ataques: ScoutAthleteBlock[]   // até 4
  defesas: ScoutAthleteBlock[]   // até 3

  especialistaCentral?: SpecialistCentralAnalysis
  finalizacao?: FinishAnalysis
  shootout?: ShootoutAnalysis

  analise?: string
  resultadoColetivo?: string
  observacao?: string
  revisarVideo: boolean
  createdAt: string
}

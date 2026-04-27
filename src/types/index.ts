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

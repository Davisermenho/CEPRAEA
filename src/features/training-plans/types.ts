// CEPR-MVP-PR-A — Plano de treino do dia (Fluxo I do PRD).
// Tipos do domínio "Plano de treino".

export interface TrainingPlanExercise {
  id: string
  blockId: string
  ordem: number
  descricao: string
  observacoes?: string
  goalId?: string | null // FK introduzida em PR-B
  createdAt: string
  updatedAt: string
}

export interface TrainingPlanBlock {
  id: string
  trainingPlanId: string
  ordem: number
  objetivoEspecifico?: string
  observacoes?: string
  createdAt: string
  updatedAt: string
  exercicios: TrainingPlanExercise[]
}

export interface TrainingPlan {
  id: string
  teamId: string
  trainingId: string
  objetivoPrincipal?: string
  observacoes?: string
  publishedAt: string | null
  createdBy?: string | null
  createdAt: string
  updatedAt: string
  blocos: TrainingPlanBlock[]
}

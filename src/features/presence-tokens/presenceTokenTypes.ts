export type PresenceTokenBackend = 'legacy' | 'supabase'

export type PresenceTokenStatus = 'presente' | 'ausente' | 'justificado'

export type PresenceTokenBatchLink = {
  batchId: string
  athleteId: string
  token: string
  linkPath: string
}

export type CreatePresenceTokenBatchInput = {
  teamId: string
  trainingId: string
  expiresAt: string
}

export type ConfirmPresenceByTokenInput = {
  token: string
  status: PresenceTokenStatus
  justification?: string | null
}

export type ConfirmPresenceByTokenResult = {
  ok: boolean
  message: string
}

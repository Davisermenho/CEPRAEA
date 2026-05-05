import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { getSupabaseTeamId } from './presenceTokenConfig'

export type PresenceTokenAccessStatus =
  | 'not-configured'
  | 'not-authenticated'
  | 'team-not-configured'
  | 'authorized'
  | 'forbidden'
  | 'error'

export type PresenceTokenAccessResult = {
  status: PresenceTokenAccessStatus
  authorized: boolean
  message: string
}

export async function validatePresenceTokenCoachAccess(): Promise<PresenceTokenAccessResult> {
  if (!isSupabaseConfigured()) {
    return {
      status: 'not-configured',
      authorized: false,
      message: 'Supabase não configurado.',
    }
  }

  const teamId = getSupabaseTeamId()
  if (!teamId) {
    return {
      status: 'team-not-configured',
      authorized: false,
      message: 'Team ID Supabase ausente ou inválido.',
    }
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) {
    return {
      status: 'error',
      authorized: false,
      message: sessionError.message || 'Falha ao verificar sessão Supabase.',
    }
  }

  if (!sessionData.session?.user) {
    return {
      status: 'not-authenticated',
      authorized: false,
      message: 'Sessão Supabase não autenticada.',
    }
  }

  const { data, error } = await supabase.rpc('has_team_role', {
    input_team_id: teamId,
    allowed_roles: ['owner', 'coach'],
  })

  if (error) {
    return {
      status: 'error',
      authorized: false,
      message: error.message || 'Falha ao validar papel no time Supabase.',
    }
  }

  const authorized = data === true

  return {
    status: authorized ? 'authorized' : 'forbidden',
    authorized,
    message: authorized
      ? 'Usuário autorizado como owner/coach no time Supabase.'
      : 'Usuário sem papel owner/coach no time Supabase configurado.',
  }
}

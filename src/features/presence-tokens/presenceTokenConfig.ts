const supabaseTeamId = import.meta.env.VITE_SUPABASE_TEAM_ID as string | undefined

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function getSupabaseTeamId(): string | null {
  if (!supabaseTeamId) return null
  return UUID_RE.test(supabaseTeamId) ? supabaseTeamId : null
}

export function assertSupabaseTeamId(): string {
  const teamId = getSupabaseTeamId()
  if (!teamId) {
    throw new Error('VITE_SUPABASE_TEAM_ID não configurado ou inválido.')
  }
  return teamId
}

export function isSupabaseTeamConfigured(): boolean {
  return getSupabaseTeamId() !== null
}

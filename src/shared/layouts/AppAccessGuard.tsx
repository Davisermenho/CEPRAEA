// CEPR-AUTH-01: AppAccessGuard — replaces AuthGuard.
// Verifies the caller has owner|coach|viewer role in the configured team.
// States: loading → unauthenticated → no-role → ok

import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSupabaseAuth } from '@/features/auth/SupabaseAuthProvider'
import { useAccessContext } from '@/features/auth/AccessContext'
import { trackAccessEvent } from '@/features/auth/accessTelemetry'
import { getSupabaseTeamId } from '@/features/presence-tokens/presenceTokenConfig'
import { LoadingSpinner } from '@/shared/components/LoadingSpinner'

export function AppAccessGuard() {
  const { authenticated, configured, loading: authLoading } = useSupabaseAuth()
  const { loading: accessLoading, error, memberships, athleteLink, hasRole } = useAccessContext()
  const location = useLocation()
  const teamId = getSupabaseTeamId()

  const loading = authLoading || accessLoading

  if (loading) {
    return <LoadingSpinner />
  }

  if (!configured || !authenticated) {
    trackAccessEvent('auth.guard.block', {
      reason: 'unauthenticated',
      route: location.pathname,
      teamId,
    })
    return <Navigate to="/login" replace />
  }

  if (error) {
    // Access resolution error — treat as temporary; show retry.
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-cep-purple-950 px-6 text-center">
        <p className="text-cep-white font-semibold mb-2">Erro temporário</p>
        <p className="text-cep-muted text-sm max-w-xs">
          Não foi possível verificar seu acesso. Tente novamente.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 text-cep-lime-400 text-sm underline"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  // team_id required to check role; if not configured fall through to error screen.
  const allowed =
    teamId !== null && hasRole(teamId, ['owner', 'coach', 'viewer'])

  if (!allowed) {
    trackAccessEvent('auth.guard.block', {
      reason: teamId ? 'no-role' : 'no-team-configured',
      route: location.pathname,
      teamId,
      hasRole: false,
    })

    // No memberships and no athlete link → redirect to onboarding so the user
    // can create their own team or accept an invite.
    if (memberships.length === 0 && athleteLink === null) {
      return <Navigate to="/onboarding/equipe" replace />
    }

    // Has athlete link but no coach/owner/viewer role → coach area is off-limits.
    if (athleteLink !== null) {
      return (
        <div className="min-h-dvh flex flex-col items-center justify-center bg-cep-purple-950 px-6 text-center">
          <p className="text-cep-white font-semibold mb-2">Área restrita</p>
          <p className="text-cep-muted text-sm max-w-xs">
            Sua conta está registrada como atleta. Para acessar a área do treinador
            você precisa de um convite.
          </p>
          <div className="flex gap-4 mt-6 flex-wrap justify-center">
            <a href="/atleta/treinos" className="text-cep-lime-400 text-sm underline">
              Ir para área do atleta
            </a>
            <button
              type="button"
              onClick={async () => {
                const { supabase: sb } = await import('@/lib/supabase')
                await sb.auth.signOut()
                window.location.replace('/login')
              }}
              className="text-cep-muted text-sm underline"
            >
              Sair
            </button>
          </div>
        </div>
      )
    }

    // Has memberships elsewhere but not the configured team (or no team configured).
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-cep-purple-950 px-6 text-center">
        <p className="text-cep-white font-semibold mb-2">Sem acesso à equipe</p>
        <p className="text-cep-muted text-sm max-w-xs">
          Sua conta não está vinculada a esta equipe. Fale com o responsável pelo
          cadastro.
        </p>
        <div className="flex gap-4 mt-6 flex-wrap justify-center">
          <button
            type="button"
            onClick={async () => {
              const { supabase: sb } = await import('@/lib/supabase')
              await sb.auth.signOut()
              window.location.replace('/login')
            }}
            className="text-cep-muted text-sm underline"
          >
            Sair
          </button>
        </div>
      </div>
    )
  }

  trackAccessEvent('auth.guard.pass', {
    route: location.pathname,
    teamId,
    hasRole: true,
  })

  return <Outlet />
}

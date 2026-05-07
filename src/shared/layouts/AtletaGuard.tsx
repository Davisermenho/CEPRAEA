import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useSupabaseAuth } from '@/features/auth/SupabaseAuthProvider'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner } from '@/shared/components/LoadingSpinner'

type AthleteCheck = 'loading' | 'found' | 'not-found' | 'unauthenticated'

export function AtletaGuard() {
  const { authenticated, loading: authLoading, user } = useSupabaseAuth()
  const [check, setCheck] = useState<AthleteCheck>('loading')

  useEffect(() => {
    if (authLoading) return
    if (!authenticated || !user) {
      setCheck('unauthenticated')
      return
    }

    setCheck('loading')

    async function resolveAthlete() {
      if (!user) return

      // Fast path: user_id already linked (all logins after the first)
      const { data: byUserId } = await supabase
        .from('athletes')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'ativo')
        .maybeSingle()

      if (byUserId) {
        setCheck('found')
        return
      }

      // First-login path: claim the athlete record via SECURITY DEFINER RPC.
      // The RPC exclusively sets user_id = auth.uid(), preventing a client from
      // modifying team_id or other columns in the same request.
      const { data: linkedId } = await supabase.rpc('link_athlete_user_id')
      if (linkedId) {
        setCheck('found')
        return
      }

      setCheck('not-found')
    }

    resolveAthlete()
  }, [authenticated, authLoading, user])

  if (authLoading || check === 'loading') {
    return <LoadingSpinner />
  }

  if (check === 'unauthenticated') {
    return <Navigate to="/atleta/login" replace />
  }

  if (check === 'not-found') {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-cep-purple-950 px-6 text-center">
        <p className="text-cep-white font-semibold mb-2">Acesso não encontrado</p>
        <p className="text-cep-muted text-sm max-w-xs">
          Seu email não está cadastrado como atleta. Confirme com o treinador se o email correto foi usado.
        </p>
        <button
          type="button"
          onClick={async () => { await supabase.auth.signOut(); window.location.replace('/atleta/login') }}
          className="mt-6 text-cep-lime-400 text-sm underline"
        >
          Sair e tentar outro email
        </button>
      </div>
    )
  }

  return <Outlet />
}

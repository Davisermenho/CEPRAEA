import { Navigate, Outlet } from 'react-router-dom'
import { useSupabaseAuth } from '@/features/auth/SupabaseAuthProvider'

export function AuthGuard() {
  const { authenticated, configured, loading } = useSupabaseAuth()

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-cep-purple-950 text-cep-white">
        Carregando...
      </div>
    )
  }

  if (!configured || !authenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

import { Navigate, Outlet } from 'react-router-dom'
import { isAtletaAuthenticated } from '@/lib/athleteAuth'
import { isAuthenticated } from '@/lib/auth'

export function AtletaGuard() {
  if (!isAtletaAuthenticated()) {
    // Se o treinador estiver logado, manda para a home dele.
    return <Navigate to={isAuthenticated() ? '/' : '/atleta/login'} replace />
  }
  return <Outlet />
}

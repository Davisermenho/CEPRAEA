import { Navigate, Outlet } from 'react-router-dom'
import { isAuthenticated } from '@/lib/auth'
import { isAtletaAuthenticated } from '@/lib/athleteAuth'

export function AuthGuard() {
  if (!isAuthenticated()) {
    // Se já há sessão de atleta, manda para a área dela; senão, welcome.
    return <Navigate to={isAtletaAuthenticated() ? '/atleta/treinos' : '/welcome'} replace />
  }
  return <Outlet />
}

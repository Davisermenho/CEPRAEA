import { Navigate, Outlet } from 'react-router-dom'
import { isAtletaAuthenticated } from '@/lib/athleteAuth'

export function AtletaGuard() {
  if (!isAtletaAuthenticated()) {
    return <Navigate to="/atleta/login" replace />
  }

  return <Outlet />
}

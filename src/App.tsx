import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '@/shared/layouts/AppLayout'
import { AuthGuard } from '@/shared/layouts/AuthGuard'
import { AtletaGuard } from '@/shared/layouts/AtletaGuard'
import { AtletaLayout } from '@/shared/layouts/AtletaLayout'
import { LoadingSpinner } from '@/shared/components/LoadingSpinner'
import { SupabaseAuthProvider, useSupabaseAuth } from '@/features/auth/SupabaseAuthProvider'

const LoginPage              = lazy(() => import('@/features/auth/pages/LoginPage'))
const PublicConfirmPage      = lazy(() => import('@/features/confirm/pages/PublicConfirmPage'))
const DashboardPage          = lazy(() => import('@/features/dashboard/pages/DashboardPage'))
const AthletesPage           = lazy(() => import('@/features/athletes/pages/AthletesPage'))
const AthleteDetailPage      = lazy(() => import('@/features/athletes/pages/AthleteDetailPage'))
const TrainingsPage          = lazy(() => import('@/features/trainings/pages/TrainingsPage'))
const TrainingDetailPage     = lazy(() => import('@/features/trainings/pages/TrainingDetailPage'))
const ReportsPage            = lazy(() => import('@/features/reports/pages/ReportsPage'))
const SettingsPage           = lazy(() => import('@/features/settings/pages/SettingsPage'))
const SupabaseSettingsPage   = lazy(() => import('@/features/settings/pages/SupabaseSettingsPage'))

const WelcomePage            = lazy(() => import('@/features/welcome/WelcomePage'))
const AtletaLoginPage        = lazy(() => import('@/features/atleta/pages/AtletaLoginPage'))
const AtletaNovaSenhaPage    = lazy(() => import('@/features/atleta/pages/AtletaNovaSenhaPage'))
const AtletaTreinosPage      = lazy(() => import('@/features/atleta/pages/AtletaTreinosPage'))
const AtletaTreinoDetailPage = lazy(() => import('@/features/atleta/pages/AtletaTreinoDetailPage'))
const AtletaPerfilPage       = lazy(() => import('@/features/atleta/pages/AtletaPerfilPage'))

function Loading() {
  return <LoadingSpinner />
}

function WelcomeOrRedirect() {
  const { authenticated } = useSupabaseAuth()
  if (authenticated) return <Navigate to="/" replace />
  return <WelcomePage />
}

export default function App() {
  return (
    <SupabaseAuthProvider>
      <BrowserRouter>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/welcome" element={<WelcomeOrRedirect />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/atleta/login" element={<AtletaLoginPage />} />
            <Route path="/atleta/nova-senha" element={<AtletaNovaSenhaPage />} />
            <Route path="/confirmar-presenca" element={<PublicConfirmPage />} />

            <Route element={<AtletaGuard />}>
              <Route element={<AtletaLayout />}>
                <Route path="/atleta/treinos" element={<AtletaTreinosPage />} />
                <Route path="/atleta/treinos/:id" element={<AtletaTreinoDetailPage />} />
                <Route path="/atleta/perfil" element={<AtletaPerfilPage />} />
              </Route>
            </Route>

            <Route element={<AuthGuard />}>
              <Route element={<AppLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="atletas" element={<AthletesPage />} />
                <Route path="atletas/:id" element={<AthleteDetailPage />} />
                <Route path="treinos" element={<TrainingsPage />} />
                <Route path="treinos/:id" element={<TrainingDetailPage />} />
                <Route path="relatorios" element={<ReportsPage />} />
                <Route path="configuracoes" element={<SettingsPage />} />
                <Route path="configuracoes/supabase" element={<SupabaseSettingsPage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/welcome" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </SupabaseAuthProvider>
  )
}

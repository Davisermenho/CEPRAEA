import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '@/shared/layouts/AppLayout'
import { AuthGuard } from '@/shared/layouts/AuthGuard'
import { AtletaGuard } from '@/shared/layouts/AtletaGuard'
import { AtletaLayout } from '@/shared/layouts/AtletaLayout'
import { LoadingSpinner } from '@/shared/components/LoadingSpinner'
import { isAuthenticated } from '@/lib/auth'
import { isAtletaAuthenticated } from '@/lib/athleteAuth'

const LoginPage              = lazy(() => import('@/features/auth/pages/LoginPage'))
const PublicConfirmPage      = lazy(() => import('@/features/confirm/pages/PublicConfirmPage'))
const ScoutGamesPage         = lazy(() => import('@/features/scout/pages/ScoutGamesPage'))
const ScoutLivePage          = lazy(() => import('@/features/scout/pages/ScoutLivePage'))
const ScoutSummaryPage       = lazy(() => import('@/features/scout/pages/ScoutSummaryPage'))
const DashboardPage          = lazy(() => import('@/features/dashboard/pages/DashboardPage'))
const AthletesPage           = lazy(() => import('@/features/athletes/pages/AthletesPage'))
const AthleteDetailPage      = lazy(() => import('@/features/athletes/pages/AthleteDetailPage'))
const TrainingsPage          = lazy(() => import('@/features/trainings/pages/TrainingsPage'))
const TrainingDetailPage     = lazy(() => import('@/features/trainings/pages/TrainingDetailPage'))
const ReportsPage            = lazy(() => import('@/features/reports/pages/ReportsPage'))
const ExportPage             = lazy(() => import('@/features/export/pages/ExportPage'))
const SettingsPage           = lazy(() => import('@/features/settings/pages/SettingsPage'))

const WelcomePage            = lazy(() => import('@/features/welcome/WelcomePage'))
const AtletaLoginPage        = lazy(() => import('@/features/atleta/pages/AtletaLoginPage'))
const AtletaTreinosPage      = lazy(() => import('@/features/atleta/pages/AtletaTreinosPage'))
const AtletaTreinoDetailPage = lazy(() => import('@/features/atleta/pages/AtletaTreinoDetailPage'))
const AtletaPerfilPage       = lazy(() => import('@/features/atleta/pages/AtletaPerfilPage'))

function Loading() {
  return <LoadingSpinner />
}

/** Tela inicial: redireciona logados, mostra welcome para anônimos. */
function WelcomeOrRedirect() {
  if (isAuthenticated()) return <Navigate to="/" replace />
  if (isAtletaAuthenticated()) return <Navigate to="/atleta/treinos" replace />
  return <WelcomePage />
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Públicas */}
          <Route path="/welcome" element={<WelcomeOrRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/atleta/login" element={<AtletaLoginPage />} />
          <Route path="/confirmar/:treinoId/:atletaId" element={<PublicConfirmPage />} />

          {/* Atleta (protegidas) */}
          <Route element={<AtletaGuard />}>
            <Route element={<AtletaLayout />}>
              <Route path="/atleta/treinos" element={<AtletaTreinosPage />} />
              <Route path="/atleta/treinos/:id" element={<AtletaTreinoDetailPage />} />
              <Route path="/atleta/perfil" element={<AtletaPerfilPage />} />
            </Route>
          </Route>

          {/* Treinador (protegidas) */}
          <Route element={<AuthGuard />}>
            <Route element={<AppLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="atletas" element={<AthletesPage />} />
              <Route path="atletas/:id" element={<AthleteDetailPage />} />
              <Route path="treinos" element={<TrainingsPage />} />
              <Route path="treinos/:id" element={<TrainingDetailPage />} />
              <Route path="relatorios" element={<ReportsPage />} />
              <Route path="exportar" element={<ExportPage />} />
              <Route path="configuracoes" element={<SettingsPage />} />
              <Route path="scout" element={<ScoutGamesPage />} />
              <Route path="scout/:id/ao-vivo" element={<ScoutLivePage />} />
              <Route path="scout/:id/resumo" element={<ScoutSummaryPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/welcome" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

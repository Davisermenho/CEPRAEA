import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '@/shared/layouts/AppLayout'
import { AuthGuard } from '@/shared/layouts/AuthGuard'
import { LoadingSpinner } from '@/shared/components/LoadingSpinner'

const LoginPage          = lazy(() => import('@/features/auth/pages/LoginPage'))
const PublicConfirmPage  = lazy(() => import('@/features/confirm/pages/PublicConfirmPage'))
const DashboardPage      = lazy(() => import('@/features/dashboard/pages/DashboardPage'))
const AthletesPage       = lazy(() => import('@/features/athletes/pages/AthletesPage'))
const AthleteDetailPage  = lazy(() => import('@/features/athletes/pages/AthleteDetailPage'))
const TrainingsPage      = lazy(() => import('@/features/trainings/pages/TrainingsPage'))
const TrainingDetailPage = lazy(() => import('@/features/trainings/pages/TrainingDetailPage'))
const ReportsPage        = lazy(() => import('@/features/reports/pages/ReportsPage'))
const ExportPage         = lazy(() => import('@/features/export/pages/ExportPage'))
const SettingsPage       = lazy(() => import('@/features/settings/pages/SettingsPage'))

function Loading() {
  return <LoadingSpinner />
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/confirmar/:treinoId/:atletaId" element={<PublicConfirmPage />} />

          {/* Rotas privadas */}
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
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

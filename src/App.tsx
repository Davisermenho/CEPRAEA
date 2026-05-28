import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '@/shared/layouts/AppLayout'
import { AppAccessGuard } from '@/shared/layouts/AppAccessGuard'
import { AtletaGuard } from '@/shared/layouts/AtletaGuard'
import { AtletaLayout } from '@/shared/layouts/AtletaLayout'
import { LoadingSpinner } from '@/shared/components/LoadingSpinner'
import { SupabaseAuthProvider, useSupabaseAuth } from '@/features/auth/SupabaseAuthProvider'
import { AccessContextProvider } from '@/features/auth/AccessContext'

const LoginPage              = lazy(() => import('@/features/auth/pages/LoginPage'))
const PublicConfirmPage      = lazy(() => import('@/features/confirm/pages/PublicConfirmPage'))
const DashboardPage          = lazy(() => import('@/features/dashboard/pages/DashboardPage'))
const AthletesPage           = lazy(() => import('@/features/athletes/pages/AthletesPage'))
const AthleteDetailPage      = lazy(() => import('@/features/athletes/pages/AthleteDetailPage'))
const TrainingsPage          = lazy(() => import('@/features/trainings/pages/TrainingsPage'))
const TrainingDetailPage     = lazy(() => import('@/features/trainings/pages/TrainingDetailPage'))
const ReportsPage            = lazy(() => import('@/features/reports/pages/ReportsPage'))
const ScoutCentralPage        = lazy(() => import('@/features/scout/pages/ScoutCentralPage'))
const ScoutPrepareSessionPage = lazy(() => import('@/features/scout/pages/ScoutPrepareSessionPage'))
const ScoutWorkspacePage      = lazy(() => import('@/features/scout/pages/ScoutWorkspacePage'))
const ScoutVideoReviewPage   = lazy(() => import('@/features/scout/pages/ScoutVideoReviewPage'))
const ScoutValidationPage    = lazy(() => import('@/features/scout/pages/ScoutValidationPage'))
const ScoutAthletesPage      = lazy(() => import('@/features/scout/pages/ScoutAthletesPage'))
const ScoutTeamsPage         = lazy(() => import('@/features/scout/pages/ScoutTeamsPage'))
const ScoutReportPage        = lazy(() => import('@/features/scout/pages/ScoutReportPage'))
const ScoutFeedbackPage      = lazy(() => import('@/features/scout/pages/ScoutFeedbackPage'))
const ScoutDashboardPage     = lazy(() => import('@/features/scout/pages/ScoutDashboardPage'))
const SettingsPage           = lazy(() => import('@/features/settings/pages/SettingsPage'))
const SupabaseSettingsPage   = lazy(() => import('@/features/settings/pages/SupabaseSettingsPage'))
const CoachInvitesPage       = lazy(() => import('@/features/settings/pages/CoachInvitesPage'))

const WelcomePage            = lazy(() => import('@/features/welcome/WelcomePage'))
const AtletaLoginPage        = lazy(() => import('@/features/atleta/pages/AtletaLoginPage'))
const AtletaNovaSenhaPage    = lazy(() => import('@/features/atleta/pages/AtletaNovaSenhaPage'))
const AtletaTreinosPage      = lazy(() => import('@/features/atleta/pages/AtletaTreinosPage'))
const AtletaTreinoDetailPage = lazy(() => import('@/features/atleta/pages/AtletaTreinoDetailPage'))
const AtletaPerfilPage       = lazy(() => import('@/features/atleta/pages/AtletaPerfilPage'))

const OwnerOnboardingPage    = lazy(() => import('@/features/onboarding/pages/OwnerOnboardingPage'))
const AcceptInvitePage       = lazy(() => import('@/features/onboarding/pages/AcceptInvitePage'))

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
      <AccessContextProvider>
        <BrowserRouter>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/welcome" element={<WelcomeOrRedirect />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/atleta/login" element={<AtletaLoginPage />} />
              <Route path="/atleta/nova-senha" element={<AtletaNovaSenhaPage />} />
              <Route path="/confirmar-presenca" element={<PublicConfirmPage />} />
              <Route path="/aceitar-convite/:inviteId" element={<AcceptInvitePage />} />
              <Route path="/onboarding/equipe" element={<OwnerOnboardingPage />} />

              <Route element={<AtletaGuard />}>
                <Route element={<AtletaLayout />}>
                  <Route path="/atleta/treinos" element={<AtletaTreinosPage />} />
                  <Route path="/atleta/treinos/:id" element={<AtletaTreinoDetailPage />} />
                  <Route path="/atleta/perfil" element={<AtletaPerfilPage />} />
                </Route>
              </Route>

              <Route element={<AppAccessGuard />}>
                <Route element={<AppLayout />}>
                  <Route index element={<DashboardPage />} />
                  <Route path="atletas" element={<AthletesPage />} />
                  <Route path="atletas/:id" element={<AthleteDetailPage />} />
                  <Route path="treinos" element={<TrainingsPage />} />
                  <Route path="treinos/:id" element={<TrainingDetailPage />} />
                  <Route path="scout" element={<ScoutCentralPage />} />
                  <Route path="scout/preparar" element={<ScoutPrepareSessionPage />} />
                  <Route path="scout/preparar/:gameId" element={<ScoutPrepareSessionPage />} />
                  <Route path="scout/ao-vivo/:gameId" element={<ScoutWorkspacePage />} />
                  <Route path="scout/review/:gameId" element={<ScoutVideoReviewPage />} />
                  <Route path="scout/validate/:gameId" element={<ScoutValidationPage />} />
                  <Route path="scout/athletes" element={<ScoutAthletesPage />} />
                  <Route path="scout/teams" element={<ScoutTeamsPage />} />
                  <Route path="scout/report" element={<ScoutReportPage />} />
                  <Route path="scout/feedback" element={<ScoutFeedbackPage />} />
                  <Route path="scout/dashboard" element={<ScoutDashboardPage />} />
                  <Route path="relatorios" element={<ReportsPage />} />
                  <Route path="configuracoes" element={<SettingsPage />} />
                  <Route path="configuracoes/supabase" element={<SupabaseSettingsPage />} />
                  <Route path="configuracoes/convites" element={<CoachInvitesPage />} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/welcome" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AccessContextProvider>
    </SupabaseAuthProvider>
  )
}

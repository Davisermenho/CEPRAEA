import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { useAthleteStore } from './stores/athleteStore'
import { useTrainingStore } from './stores/trainingStore'
import { useAttendanceStore } from './stores/attendanceStore'
import { loadSyncConfig } from './lib/sync'

async function bootstrap() {
  await Promise.all([
    useAthleteStore.getState().loadAll(),
    useTrainingStore.getState().loadAll(),
    useAttendanceStore.getState().loadAll(),
  ])

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )

  // Pull em background após render: mantém IDB alinhado ao servidor sem bloquear a UI.
  // Este fluxo será removido em PR própria quando App Script/Google Sheets sync for eliminado.
  void loadSyncConfig().then((config) => {
    if (!config) return
    void useAthleteStore.getState().syncFromRemote(config)
    void useTrainingStore.getState().syncFromRemote(config)
  })
}

bootstrap()

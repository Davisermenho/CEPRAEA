import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { useAthleteStore } from './stores/athleteStore'
import { useTrainingStore } from './stores/trainingStore'
import { useAttendanceStore } from './stores/attendanceStore'
import { seedDefaults } from './lib/seed'

async function bootstrap() {
  await seedDefaults()
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
}

bootstrap()

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { useAthleteStore } from './stores/athleteStore'
import { useTrainingStore } from './stores/trainingStore'
import { useAttendanceStore } from './stores/attendanceStore'

async function loadInitialData() {
  try {
    await Promise.all([
      useAthleteStore.getState().loadAll(),
      useTrainingStore.getState().loadAll(),
      useAttendanceStore.getState().loadAll(),
    ])
  } catch (error) {
    console.error('Falha ao carregar dados iniciais.', error)
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

void loadInitialData()

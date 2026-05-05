import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { useAthleteStore } from './stores/athleteStore'
import { useTrainingStore } from './stores/trainingStore'
import { useAttendanceStore } from './stores/attendanceStore'

async function bootstrap() {
  await Promise.all([
    useAthleteStore.getState().loadAll(),
    useTrainingStore.getState().loadAll(),
    useAttendanceStore.getState().loadAll(),
  ])

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}

bootstrap()

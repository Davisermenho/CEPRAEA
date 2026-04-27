import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dumbbell, Users, TrendingUp, AlertTriangle, ChevronRight } from 'lucide-react'
import { useTrainingStore } from '@/stores/trainingStore'
import { useAthleteStore } from '@/stores/athleteStore'
import { useAttendanceStore } from '@/stores/attendanceStore'
import { Button } from '@/shared/components/Button'
import { Badge } from '@/shared/components/Badge'
import { formatDateLong, formatDateCompact, todayISO, formatPercent } from '@/lib/utils'
import { formatHolidayLabel } from '@/lib/holidays'

export default function DashboardPage() {
  const navigate = useNavigate()
  const trainings = useTrainingStore((s) => s.trainings)
  const getConflicts = useTrainingStore((s) => s.getConflicts)
  const conflicts = useMemo(() => getConflicts(), [trainings]) // eslint-disable-line react-hooks/exhaustive-deps
  const athletes = useAthleteStore((s) => s.athletes)
  const { getTrainingSummary, getFrequencyReports } = useAttendanceStore()

  const today = todayISO()
  const activeAthletes = athletes.filter((a) => a.status === 'ativo')
  const upcoming = trainings.filter((t) => t.data >= today && t.status === 'agendado')
  const nextTraining = upcoming[0]
  const lastCompleted = [...trainings].reverse().find((t) => t.status === 'realizado')

  const nextSummary = nextTraining
    ? getTrainingSummary(nextTraining.id, activeAthletes.length)
    : null

  const lastSummary = lastCompleted
    ? getTrainingSummary(lastCompleted.id, activeAthletes.length)
    : null

  // Frequência geral dos últimos 30 dias
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const fromISO = thirtyDaysAgo.toISOString().slice(0, 10)
  const freqReports = getFrequencyReports(fromISO, today)
  const avgFreq = freqReports.length > 0
    ? Math.round(freqReports.reduce((s, r) => s + r.percentualPresenca, 0) / freqReports.length)
    : 0

  // Treinos da semana atual
  const weekEnd = new Date()
  weekEnd.setDate(weekEnd.getDate() + 7)
  const weekEndISO = weekEnd.toISOString().slice(0, 10)
  const weekTrainings = upcoming.filter((t) => t.data <= weekEndISO)

  return (
    <div className="flex flex-col min-h-full pb-4">
      {/* Header */}
      <div className="bg-blue-700 px-4 pt-8 pb-6">
        <p className="text-blue-200 text-sm mb-1">CEPRAEA</p>
        <h1 className="text-2xl font-bold text-white">Olá, treinador! 👋</h1>
        <p className="text-blue-200 text-sm mt-1 capitalize">{formatDateLong(today)}</p>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* Holiday alerts */}
        {conflicts.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-amber-700" />
              <p className="text-sm font-semibold text-amber-800">Conflitos com feriados</p>
            </div>
            {conflicts.map((c) => (
              <p key={c.training.id} className="text-xs text-amber-700 ml-6">
                • {formatDateCompact(c.training.data)} — {formatHolidayLabel(c.holiday)}
              </p>
            ))}
            <Button
              variant="warning"
              size="sm"
              className="mt-3 w-full"
              onClick={() => navigate('/treinos')}
            >
              Resolver conflitos
            </Button>
          </div>
        )}

        {/* Next training */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Próximo Treino</p>
            {nextTraining && (
              <button
                onClick={() => navigate(`/treinos/${nextTraining.id}`)}
                className="text-xs text-blue-700 font-medium flex items-center gap-0.5"
              >
                Ver chamada <ChevronRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          {nextTraining ? (
            <>
              <p className="text-base font-semibold text-gray-900 capitalize">
                {formatDateLong(nextTraining.data)}
              </p>
              <p className="text-sm text-gray-600 mt-0.5">
                {nextTraining.horaInicio} – {nextTraining.horaFim}
                {nextTraining.local && ` · ${nextTraining.local}`}
              </p>
              {nextSummary && (
                <div className="flex gap-2 mt-3">
                  <Badge variant="green">{nextSummary.presentes} confirmados</Badge>
                  <Badge variant="gray">{nextSummary.pendentes} pendentes</Badge>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-400">Nenhum treino agendado.</p>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <div className="rounded-full bg-blue-100 p-2 w-fit mx-auto mb-2">
              <Users className="h-4 w-4 text-blue-700" />
            </div>
            <p className="text-xl font-bold text-gray-900">{activeAthletes.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Atletas ativas</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <div className="rounded-full bg-green-100 p-2 w-fit mx-auto mb-2">
              <Dumbbell className="h-4 w-4 text-green-700" />
            </div>
            <p className="text-xl font-bold text-gray-900">{upcoming.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Treinos futuros</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <div className="rounded-full bg-purple-100 p-2 w-fit mx-auto mb-2">
              <TrendingUp className="h-4 w-4 text-purple-700" />
            </div>
            <p className="text-xl font-bold text-gray-900">{formatPercent(avgFreq)}</p>
            <p className="text-xs text-gray-500 mt-0.5">Frequência 30d</p>
          </div>
        </div>

        {/* Last training */}
        {lastCompleted && lastSummary && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Último Treino</p>
            <p className="text-sm font-medium text-gray-900 capitalize">
              {formatDateCompact(lastCompleted.data)} · {lastCompleted.horaInicio}
            </p>
            <div className="flex gap-2 mt-2">
              <Badge variant="green">{lastSummary.presentes} presentes</Badge>
              <Badge variant="red">{lastSummary.ausentes} ausentes</Badge>
              <Badge variant="blue">
                {lastSummary.totalAtivos > 0
                  ? `${Math.round((lastSummary.presentes / lastSummary.totalAtivos) * 100)}%`
                  : '—'}
              </Badge>
            </div>
          </div>
        )}

        {/* Week schedule */}
        {weekTrainings.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Esta Semana</p>
            <div className="space-y-2">
              {weekTrainings.map((t) => (
                <button
                  key={t.id}
                  onClick={() => navigate(`/treinos/${t.id}`)}
                  className="w-full flex items-center gap-3 text-left hover:bg-gray-50 rounded-xl p-2 -mx-2 transition-colors"
                >
                  <div className="w-1 h-8 rounded-full bg-blue-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {formatDateCompact(t.data)}
                    </p>
                    <p className="text-xs text-gray-500">{t.horaInicio} – {t.horaFim}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

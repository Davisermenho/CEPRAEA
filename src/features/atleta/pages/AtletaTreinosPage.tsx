import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, CheckCircle, XCircle, AlertCircle, Clock, RefreshCw } from 'lucide-react'
import { useTrainingStore } from '@/stores/trainingStore'
import { useAttendanceStore } from '@/stores/attendanceStore'
import { useAthleteStore } from '@/stores/athleteStore'
import { getAtletaSession } from '@/lib/athleteAuth'
import { loadAtletaSyncConfig } from '@/lib/sync'
import { formatDateCompact, parseLocalDate, todayISO } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { AttendanceStatus, Training } from '@/types'

type Tab = 'proximos' | 'historico'

const STATUS_CONFIG: Record<AttendanceStatus, { label: string; color: string; icon: typeof CheckCircle }> = {
  presente:    { label: 'Vou',         color: 'text-cep-lime-400 bg-cep-lime-400/10',    icon: CheckCircle },
  ausente:     { label: 'Não vou',     color: 'text-red-400 bg-red-400/10',              icon: XCircle },
  justificado: { label: 'Justificada', color: 'text-cep-gold-400 bg-cep-gold-400/10',    icon: AlertCircle },
  pendente:    { label: 'Pendente',    color: 'text-cep-muted bg-cep-purple-850',        icon: Clock },
}

export default function AtletaTreinosPage() {
  const session = getAtletaSession()
  const trainings = useTrainingStore((s) => s.trainings)
  const records = useAttendanceStore((s) => s.records)
  const syncTrainings = useTrainingStore((s) => s.syncFromRemote)
  const syncAttendances = useAttendanceStore((s) => s.syncFromRemote)
  const syncAthletes = useAthleteStore((s) => s.syncFromRemote)

  const [tab, setTab] = useState<Tab>('proximos')
  const [syncing, setSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<string | null>(null)

  const today = todayISO()

  const handleSync = async () => {
    if (!session) return
    setSyncing(true)
    const config = await loadAtletaSyncConfig(session.token)
    if (!config) {
      setSyncing(false)
      return
    }
    await Promise.all([syncTrainings(config), syncAthletes(config), syncAttendances(config)])
    setLastSync(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }))
    setSyncing(false)
  }

  // Sincroniza ao montar
  useEffect(() => {
    void handleSync()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const proximos = useMemo(
    () => trainings.filter((t) => t.data >= today && t.status !== 'cancelado'),
    [trainings, today]
  )
  const historico = useMemo(
    () => trainings.filter((t) => t.data < today).reverse(),
    [trainings, today]
  )

  const list = tab === 'proximos' ? proximos : historico

  if (!session) return null

  return (
    <div className="px-4 py-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-cep-muted uppercase tracking-wider">Olá,</p>
          <h1 className="text-xl font-black text-cep-white">{session.nome.split(' ')[0]}</h1>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-1.5 rounded-full bg-cep-purple-850 border border-cep-purple-700 px-3 py-1.5 text-xs text-cep-muted hover:text-cep-white"
        >
          <RefreshCw className={cn('h-3.5 w-3.5', syncing && 'animate-spin')} />
          {syncing ? 'Sincronizando' : lastSync ? `Sync ${lastSync}` : 'Sincronizar'}
        </button>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 gap-1 rounded-xl bg-cep-purple-900 p-1 mb-4">
        <button
          onClick={() => setTab('proximos')}
          className={cn(
            'rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
            tab === 'proximos' ? 'bg-cep-purple-800 text-cep-lime-400' : 'text-cep-muted'
          )}
        >
          Próximos {proximos.length > 0 && <span className="ml-1 text-xs opacity-70">({proximos.length})</span>}
        </button>
        <button
          onClick={() => setTab('historico')}
          className={cn(
            'rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
            tab === 'historico' ? 'bg-cep-purple-800 text-cep-lime-400' : 'text-cep-muted'
          )}
        >
          Histórico {historico.length > 0 && <span className="ml-1 text-xs opacity-70">({historico.length})</span>}
        </button>
      </div>

      {list.length === 0 && (
        <div className="rounded-2xl bg-cep-purple-900 border border-cep-purple-800 p-8 text-center">
          <Calendar className="mx-auto h-10 w-10 text-cep-muted/40 mb-2" />
          <p className="text-sm text-cep-muted">
            {tab === 'proximos' ? 'Nenhum treino agendado.' : 'Nenhum treino no histórico.'}
          </p>
        </div>
      )}

      <div className="space-y-2.5">
        {list.map((t) => (
          <TrainingCard key={t.id} training={t} atletaId={session.atletaId} records={records} />
        ))}
      </div>
    </div>
  )
}

interface CardProps {
  training: Training
  atletaId: string
  records: ReturnType<typeof useAttendanceStore.getState>['records']
}

function TrainingCard({ training, atletaId, records }: CardProps) {
  const trainingRecords = records.filter((r) => r.treinoId === training.id)
  const myRecord = trainingRecords.find((r) => r.atletaId === atletaId)
  const myStatus: AttendanceStatus = myRecord?.status ?? 'pendente'
  const cfg = STATUS_CONFIG[myStatus]
  const StatusIcon = cfg.icon

  const presentes = trainingRecords.filter((r) => r.status === 'presente').length
  const isFuture = training.data >= todayISO()

  const dow = parseLocalDate(training.data).getDay()
  const dayLabel = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'][dow]
  const dayNum = parseLocalDate(training.data).getDate()

  return (
    <Link
      to={`/atleta/treinos/${training.id}`}
      className="flex items-center gap-3 rounded-2xl bg-cep-purple-900 border border-cep-purple-800 p-3 hover:border-cep-purple-700 transition-colors"
    >
      {/* Bloco de data */}
      <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-cep-purple-850 border border-cep-purple-700 shrink-0">
        <span className="text-[10px] font-semibold text-cep-muted tracking-wider">{dayLabel}</span>
        <span className="text-xl font-black text-cep-white leading-none">{dayNum}</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-cep-white">
            {training.horaInicio}–{training.horaFim}
          </p>
          {training.tipo === 'extra' && (
            <span className="text-[10px] font-bold uppercase text-cep-gold-400 bg-cep-gold-400/10 px-1.5 py-0.5 rounded">
              Extra
            </span>
          )}
          {training.status === 'cancelado' && (
            <span className="text-[10px] font-bold uppercase text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded">
              Cancelado
            </span>
          )}
        </div>
        <p className="text-xs text-cep-muted truncate">
          {formatDateCompact(training.data)}
          {training.local && ` · ${training.local}`}
        </p>
        <p className="text-[11px] text-cep-muted/70 mt-0.5">
          {presentes} confirmada{presentes !== 1 && 's'}
        </p>
      </div>

      <div className={cn('flex items-center gap-1 rounded-full px-2.5 py-1', cfg.color)}>
        <StatusIcon className="h-3.5 w-3.5" />
        <span className="text-[11px] font-semibold whitespace-nowrap">
          {isFuture ? cfg.label : myStatus === 'pendente' ? '—' : cfg.label}
        </span>
      </div>
    </Link>
  )
}

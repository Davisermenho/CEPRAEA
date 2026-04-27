import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ChevronLeft, CheckCircle2, MessageCircle, Copy, Send,
  UserCheck, RefreshCw, Wifi, WifiOff,
} from 'lucide-react'
import { useTrainingStore } from '@/stores/trainingStore'
import { useAthleteStore } from '@/stores/athleteStore'
import { useAttendanceStore } from '@/stores/attendanceStore'
import { Badge } from '@/shared/components/Badge'
import { Button } from '@/shared/components/Button'
import { Modal } from '@/shared/components/Modal'
import { formatDateLong, formatPhone, formatTime } from '@/lib/utils'
import { getSetting } from '@/db'
import {
  gerarAnuncioTreino,
  gerarPedidoConfirmacaoGrupo,
  gerarResumoPresenca,
  gerarMensagemConfirmacao,
  abrirWhatsApp,
  copiarTexto,
} from '@/lib/whatsapp'
import { pullConfirmations, pushConfirmation, loadSyncConfig } from '@/lib/sync'
import type { AppSettings, AttendanceStatus } from '@/types'
import { cn } from '@/lib/utils'

const STATUS_CONFIG: Record<AttendanceStatus, { label: string; color: string; bg: string }> = {
  presente:    { label: 'Presente',    color: 'text-green-700',  bg: 'bg-green-100 border-green-300' },
  ausente:     { label: 'Ausente',     color: 'text-red-700',    bg: 'bg-red-100 border-red-300' },
  justificado: { label: 'Justificado', color: 'text-amber-700',  bg: 'bg-amber-100 border-amber-300' },
  pendente:    { label: 'Pendente',    color: 'text-gray-500',   bg: 'bg-gray-100 border-gray-200' },
}

export default function TrainingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const training = useTrainingStore((s) => s.getById(id ?? ''))
  const updateStatus = useTrainingStore((s) => s.updateStatus)
  const athletes = useAthleteStore((s) => s.athletes)
  const { records, loadForTraining, upsert, getTrainingSummary } = useAttendanceStore()
  const [settings, setSettings] = useState<Partial<AppSettings>>({})
  const [waModal, setWaModal] = useState<{ title: string; text: string } | null>(null)
  const [justifAtleta, setJustifAtleta] = useState<string | null>(null)
  const [justifText, setJustifText] = useState('')
  const [copied, setCopied] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'ok' | 'error'>('idle')
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null)

  useEffect(() => {
    if (id) loadForTraining(id)
    getSetting<AppSettings>('appSettings').then((s) => {
      if (s) {
        setSettings(s)
        if (s.lastSyncAt) setLastSyncAt(s.lastSyncAt)
      }
    })
  }, [id, loadForTraining])

  if (!training) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Treino não encontrado.</p>
      </div>
    )
  }

  const activeAthletes = athletes.filter((a) => a.status === 'ativo')
  const trainingRecords = records.filter((r) => r.treinoId === training.id)
  const summary = getTrainingSummary(training.id, activeAthletes.length)
  const trainingLocal = training.local || settings.localPadrao
  const syncConfigured = !!(settings.syncEndpointUrl && settings.syncSecret)

  const getStatus = (atletaId: string): AttendanceStatus => {
    const r = trainingRecords.find((r) => r.atletaId === atletaId)
    return r?.status ?? 'pendente'
  }

  const handleStatusToggle = async (atletaId: string, current: AttendanceStatus) => {
    const cycle: AttendanceStatus[] = ['pendente', 'presente', 'ausente', 'justificado']
    const next = cycle[(cycle.indexOf(current) + 1) % cycle.length]

    if (next === 'justificado') {
      setJustifAtleta(atletaId)
      setJustifText('')
      return
    }

    await upsert(training.id, atletaId, next)

    // Push manual ao endpoint remoto se configurado
    if (syncConfigured && next !== 'pendente') {
      const syncConfig = await loadSyncConfig()
      const athlete = athletes.find((a) => a.id === atletaId)
      if (syncConfig && athlete) {
        pushConfirmation(syncConfig, {
          treinoId: training.id,
          atletaId,
          nomeAtleta: athlete.nome,
          status: next,
          origem: 'manual',
        }).catch(() => {/* push silencioso — local já está salvo */})
      }
    }
  }

  const handleJustifSave = async () => {
    if (!justifAtleta) return
    await upsert(training.id, justifAtleta, 'justificado', { justificativa: justifText })

    if (syncConfigured) {
      const syncConfig = await loadSyncConfig()
      const athlete = athletes.find((a) => a.id === justifAtleta)
      if (syncConfig && athlete) {
        pushConfirmation(syncConfig, {
          treinoId: training.id,
          atletaId: justifAtleta,
          nomeAtleta: athlete.nome,
          status: 'justificado',
          origem: 'manual',
        }).catch(() => {})
      }
    }

    setJustifAtleta(null)
  }

  const handleMarkAll = async (status: AttendanceStatus) => {
    await Promise.all(activeAthletes.map((a) => upsert(training.id, a.id, status)))

    if (syncConfigured && status !== 'pendente') {
      const syncConfig = await loadSyncConfig()
      if (syncConfig) {
        Promise.all(
          activeAthletes.map((a) =>
            pushConfirmation(syncConfig, {
              treinoId: training.id,
              atletaId: a.id,
              nomeAtleta: a.nome,
              status,
              origem: 'manual',
            })
          )
        ).catch(() => {})
      }
    }
  }

  const handleSync = async () => {
    if (!syncConfigured) return
    setSyncing(true)
    setSyncStatus('idle')

    const syncConfig = await loadSyncConfig()
    if (!syncConfig) { setSyncing(false); return }

    const result = await pullConfirmations(syncConfig, { treinoId: training.id })

    if (!result.ok || !result.records) {
      setSyncStatus('error')
      setSyncing(false)
      return
    }

    // Merge: cada registro remoto atualiza o IDB local
    // Regra: confirmação da atleta via link prevalece sobre "pendente" local
    for (const remote of result.records) {
      const local = trainingRecords.find((r) => r.atletaId === remote.atletaId)
      const shouldOverride = !local || local.status === 'pendente' || remote.origem === 'link'
      if (shouldOverride && (remote.status === 'presente' || remote.status === 'ausente')) {
        await upsert(training.id, remote.atletaId, remote.status, {
          confirmadoPelaAtleta: remote.origem === 'link',
        })
      }
    }

    const now = new Date().toISOString()
    setLastSyncAt(now)

    // Persiste o timestamp da última sync
    const s = await getSetting<AppSettings>('appSettings')
    if (s) {
      const { setSetting } = await import('@/db')
      await setSetting('appSettings', { ...s, lastSyncAt: now })
    }

    setSyncStatus('ok')
    setSyncing(false)
    setTimeout(() => setSyncStatus('idle'), 3000)
  }

  const handleCopy = async () => {
    if (!waModal) return
    await copiarTexto(waModal.text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const openWA = (title: string, text: string) => setWaModal({ title, text })

  const pct = summary.totalAtivos > 0
    ? Math.round((summary.presentes / summary.totalAtivos) * 100)
    : 0

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex items-center gap-2 px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 rounded-lg hover:bg-gray-100 text-gray-600">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-gray-900 capitalize truncate">
              {formatDateLong(training.data)}
            </p>
            <p className="text-xs text-gray-500">
              {training.horaInicio} – {training.horaFim}
              {trainingLocal && ` · ${trainingLocal}`}
            </p>
          </div>
          <Badge variant={
            training.status === 'realizado' ? 'green' :
            training.status === 'cancelado' ? 'gray' : 'blue'
          }>
            {training.status === 'agendado' ? 'Agendado' :
             training.status === 'realizado' ? 'Realizado' : 'Cancelado'}
          </Badge>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Summary */}
        <div className="grid grid-cols-4 gap-2 p-4">
          {[
            { label: 'Total',      value: summary.totalAtivos, color: 'text-gray-900' },
            { label: 'Presentes',  value: summary.presentes,   color: 'text-green-700' },
            { label: 'Ausentes',   value: summary.ausentes,    color: 'text-red-600' },
            { label: 'Frequência', value: `${pct}%`,           color: 'text-blue-700' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 text-center">
              <p className={`text-lg font-bold ${color}`}>{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>

        {/* Sync bar */}
        {syncConfigured && (
          <div className="mx-4 mb-3 flex items-center gap-2 bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-2.5">
            <div className="flex-1 min-w-0">
              {lastSyncAt ? (
                <p className="text-xs text-gray-500">
                  Última sync: {formatTime(lastSyncAt)}
                </p>
              ) : (
                <p className="text-xs text-gray-400">Nunca sincronizado</p>
              )}
              {syncStatus === 'ok' && (
                <p className="text-xs text-green-600 flex items-center gap-1 mt-0.5">
                  <Wifi className="h-3 w-3" /> Sincronizado
                </p>
              )}
              {syncStatus === 'error' && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-0.5">
                  <WifiOff className="h-3 w-3" /> Falha na sync
                </p>
              )}
            </div>
            <Button variant="secondary" size="sm" onClick={handleSync} loading={syncing}>
              <RefreshCw className="h-4 w-4" />
              Sincronizar
            </Button>
          </div>
        )}

        {/* Quick actions */}
        <div className="px-4 mb-3 flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => handleMarkAll('presente')}>
            <UserCheck className="h-4 w-4" />
            Todos presentes
          </Button>
          {training.status !== 'realizado' && (
            <Button variant="success" size="sm" onClick={() => updateStatus(training.id, 'realizado')}>
              <CheckCircle2 className="h-4 w-4" />
              Concluir treino
            </Button>
          )}
        </div>

        {/* WhatsApp buttons */}
        <div className="px-4 mb-4 flex flex-wrap gap-2">
          {[
            {
              label: 'Anúncio',
              text: () => gerarAnuncioTreino(training, settings.nomeEquipe ?? 'CEPRAEA', trainingLocal),
            },
            {
              label: 'Confirmação',
              text: () => gerarPedidoConfirmacaoGrupo(training, activeAthletes),
            },
            {
              label: 'Resumo',
              text: () => gerarResumoPresenca(training, trainingRecords, activeAthletes),
            },
          ].map(({ label, text }) => (
            <Button
              key={label}
              variant="ghost"
              size="sm"
              className="text-green-700 border border-green-200 bg-green-50 hover:bg-green-100"
              onClick={() => openWA(label, text())}
            >
              <MessageCircle className="h-4 w-4" />
              {label}
            </Button>
          ))}
        </div>

        {/* Athlete attendance list */}
        <div className="px-4 pb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Chamada ({activeAthletes.length} atletas)
          </h2>

          {activeAthletes.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Nenhuma atleta ativa cadastrada.</p>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
              {activeAthletes.map((athlete) => {
                const status = getStatus(athlete.id)
                const config = STATUS_CONFIG[status]
                const appUrl = settings.appUrl ?? window.location.origin
                const confirmLink = gerarMensagemConfirmacao(training, athlete, appUrl)
                const confirmed = trainingRecords.find((r) => r.atletaId === athlete.id)?.confirmadoPelaAtleta

                return (
                  <div key={athlete.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{athlete.nome}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-gray-400">{formatPhone(athlete.telefone)}</p>
                        {confirmed && (
                          <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-600 rounded-full px-2 py-0.5">
                            <Wifi className="h-3 w-3" /> Atleta confirmou
                          </span>
                        )}
                        {!confirmed && status !== 'pendente' && (
                          <span className="text-xs text-gray-400">Manual</span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => abrirWhatsApp(confirmLink, athlete.telefone)}
                      className="p-2 rounded-lg text-green-600 hover:bg-green-50 active:bg-green-100 transition-colors"
                      title="Enviar link de confirmação"
                    >
                      <Send className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => handleStatusToggle(athlete.id, status)}
                      className={cn(
                        'h-9 px-3 rounded-xl border text-xs font-semibold transition-colors min-w-[90px] text-center',
                        config.bg, config.color
                      )}
                    >
                      {config.label}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* WhatsApp modal */}
      {waModal && (
        <Modal open={true} onClose={() => setWaModal(null)} title={waModal.title}>
          <div className="p-4 space-y-4">
            <textarea
              readOnly
              value={waModal.text}
              rows={10}
              className="w-full rounded-xl bg-gray-50 border border-gray-200 px-3 py-2 text-sm font-mono resize-none focus:outline-none"
            />
            <div className="flex gap-2">
              <Button variant="secondary" fullWidth onClick={handleCopy}>
                <Copy className="h-4 w-4" />
                {copied ? 'Copiado!' : 'Copiar'}
              </Button>
              <Button
                fullWidth
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => abrirWhatsApp(waModal.text, settings.telefoneTecnico)}
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Justificativa modal */}
      <Modal
        open={justifAtleta !== null}
        onClose={() => setJustifAtleta(null)}
        title="Justificativa"
        size="sm"
      >
        <div className="p-4 space-y-3">
          <p className="text-sm text-gray-600">Informe o motivo da ausência justificada:</p>
          <textarea
            value={justifText}
            onChange={(e) => setJustifText(e.target.value)}
            placeholder="Ex: Atestado médico, viagem..."
            rows={3}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <div className="flex gap-2">
            <Button variant="secondary" fullWidth onClick={() => setJustifAtleta(null)}>Cancelar</Button>
            <Button variant="warning" fullWidth onClick={handleJustifSave}>Salvar</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ChevronLeft, CheckCircle2, MessageCircle, Copy, Send,
  UserCheck, Wifi, Shield, Link2, Ban,
} from 'lucide-react'
import { useTrainingStore } from '@/stores/trainingStore'
import { useAthleteStore } from '@/stores/athleteStore'
import { useAttendanceStore } from '@/stores/attendanceStore'
import { Badge } from '@/shared/components/Badge'
import { Button } from '@/shared/components/Button'
import { Modal } from '@/shared/components/Modal'
import { formatDateLong, formatPhone } from '@/lib/utils'
import {
  gerarAnuncioTreino,
  gerarPedidoConfirmacaoGrupo,
  gerarResumoPresenca,
  gerarMensagemConfirmacao,
  abrirWhatsApp,
  copiarTexto,
} from '@/lib/whatsapp'
import { isSupabasePresenceTokensEnabled } from '@/features/presence-tokens/presenceTokenFeatureFlag'
import { assertSupabaseTeamId } from '@/features/presence-tokens/presenceTokenConfig'
import { validatePresenceTokenCoachAccess } from '@/features/presence-tokens/presenceTokenAccess'
import {
  buildPresenceTokenUrl,
  createPresenceTokenBatch,
  markPresenceTokenBatchExported,
  revokePresenceTokenBatch,
} from '@/features/presence-tokens/presenceTokenApi'
import type { PresenceTokenBatchLink } from '@/features/presence-tokens/presenceTokenTypes'
import type { AttendanceStatus } from '@/types'
import { cn } from '@/lib/utils'

const STATUS_CONFIG: Record<AttendanceStatus, { label: string; color: string; bg: string }> = {
  presente:    { label: 'Presente',    color: 'text-green-400',    bg: 'bg-green-500/20 border-green-500/40' },
  ausente:     { label: 'Ausente',     color: 'text-red-400',      bg: 'bg-red-500/20 border-red-500/40' },
  justificado: { label: 'Justificado', color: 'text-cep-gold-400', bg: 'bg-cep-gold-400/20 border-cep-gold-400/40' },
  pendente:    { label: 'Pendente',    color: 'text-cep-muted',    bg: 'bg-cep-purple-800 border-cep-purple-700' },
}

export default function TrainingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const training = useTrainingStore((s) => s.getById(id ?? ''))
  const updateStatus = useTrainingStore((s) => s.updateStatus)
  const athletes = useAthleteStore((s) => s.athletes)
  const { records, loadForTraining, upsert, getTrainingSummary } = useAttendanceStore()
  const [waModal, setWaModal] = useState<{ title: string; text: string } | null>(null)
  const [justifAtleta, setJustifAtleta] = useState<string | null>(null)
  const [justifText, setJustifText] = useState('')
  const [copied, setCopied] = useState(false)
  const [presenceBatchLoading, setPresenceBatchLoading] = useState(false)
  const [presenceBatchLinks, setPresenceBatchLinks] = useState<PresenceTokenBatchLink[]>([])
  const [presenceBatchId, setPresenceBatchId] = useState<string | null>(null)
  const [presenceBatchModal, setPresenceBatchModal] = useState(false)
  const [presenceBatchStatus, setPresenceBatchStatus] = useState<{ ok: boolean; msg: string } | null>(null)

  useEffect(() => {
    if (id) loadForTraining(id)
  }, [id, loadForTraining])

  if (!training) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-cep-muted">Treino não encontrado.</p>
      </div>
    )
  }

  const activeAthletes = athletes.filter((a) => a.status === 'ativo')
  const athleteById = new Map(activeAthletes.map((a) => [a.id, a]))
  const trainingRecords = records.filter((r) => r.treinoId === training.id)
  const summary = getTrainingSummary(training.id, activeAthletes.length)
  const trainingLocal = training.local
  const supabasePresenceTokensEnabled = isSupabasePresenceTokensEnabled()

  const getStatus = (atletaId: string): AttendanceStatus => {
    const r = trainingRecords.find((r) => r.atletaId === atletaId)
    return r?.status ?? 'pendente'
  }

  const buildBatchText = (links: PresenceTokenBatchLink[]) => {
    const appUrl = window.location.origin
    const data = formatDateLong(training.data)
    const header = `✅ Confirmação de presença — ${'CEPRAEA'}\nTreino: ${data} — ${training.horaInicio} às ${training.horaFim}\n`
    const rows = links.map((link) => {
      const athlete = athleteById.get(link.athleteId)
      const name = athlete?.nome ?? link.athleteId
      return `• ${name}: ${buildPresenceTokenUrl(appUrl, link.token)}`
    })
    return `${header}\n${rows.join('\n')}`
  }

  const handleGeneratePresenceTokenBatch = async () => {
    if (!supabasePresenceTokensEnabled) return

    setPresenceBatchLoading(true)
    setPresenceBatchStatus(null)

    try {
      const access = await validatePresenceTokenCoachAccess()
      if (!access.authorized) {
        setPresenceBatchStatus({ ok: false, msg: access.message })
        return
      }

      const teamId = assertSupabaseTeamId()
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      const links = await createPresenceTokenBatch({
        teamId,
        trainingId: training.id,
        expiresAt,
      })

      setPresenceBatchLinks(links)
      setPresenceBatchId(links[0]?.batchId ?? null)
      setPresenceBatchModal(true)
      setPresenceBatchStatus({ ok: true, msg: `${links.length} link(s) gerado(s).` })
    } catch (error) {
      setPresenceBatchStatus({
        ok: false,
        msg: error instanceof Error ? error.message : 'Falha ao gerar lote de presença.',
      })
    } finally {
      setPresenceBatchLoading(false)
    }
  }

  const handleCopyPresenceTokenBatch = async () => {
    if (presenceBatchLinks.length === 0) return

    const ok = await copiarTexto(buildBatchText(presenceBatchLinks))
    if (ok && presenceBatchId) {
      try {
        await markPresenceTokenBatchExported(presenceBatchId)
        setPresenceBatchStatus({ ok: true, msg: 'Links copiados e lote marcado como exportado.' })
      } catch (error) {
        setPresenceBatchStatus({
          ok: false,
          msg: error instanceof Error ? error.message : 'Links copiados, mas falha ao marcar lote como exportado.',
        })
      }
    } else {
      setPresenceBatchStatus({ ok, msg: ok ? 'Links copiados.' : 'Não foi possível copiar os links.' })
    }
  }

  const handleRevokePresenceTokenBatch = async () => {
    if (!presenceBatchId) return

    setPresenceBatchLoading(true)
    setPresenceBatchStatus(null)

    try {
      const access = await validatePresenceTokenCoachAccess()
      if (!access.authorized) {
        setPresenceBatchStatus({ ok: false, msg: access.message })
        return
      }

      await revokePresenceTokenBatch(presenceBatchId)
      setPresenceBatchLinks([])
      setPresenceBatchId(null)
      setPresenceBatchModal(false)
      setPresenceBatchStatus({ ok: true, msg: 'Lote revogado.' })
    } catch (error) {
      setPresenceBatchStatus({
        ok: false,
        msg: error instanceof Error ? error.message : 'Falha ao revogar lote.',
      })
    } finally {
      setPresenceBatchLoading(false)
    }
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
  }

  const handleJustifSave = async () => {
    if (!justifAtleta) return
    await upsert(training.id, justifAtleta, 'justificado', { justificativa: justifText })
    setJustifAtleta(null)
  }

  const handleMarkAll = async (status: AttendanceStatus) => {
    await Promise.all(activeAthletes.map((a) => upsert(training.id, a.id, status)))
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
      <div className="bg-cep-purple-900 border-b border-cep-purple-800">
        <div className="flex items-center gap-2 px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 rounded-lg hover:bg-cep-purple-800 text-cep-muted hover:text-cep-white transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-cep-white capitalize truncate">
              {formatDateLong(training.data)}
            </p>
            <p className="text-xs text-cep-muted">
              {training.horaInicio} – {training.horaFim}
              {trainingLocal && ` · ${trainingLocal}`}
            </p>
          </div>
          <Badge variant={
            training.status === 'realizado' ? 'green' :
            training.status === 'cancelado' ? 'gray' : 'lime'
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
            { label: 'Total',      value: summary.totalAtivos, color: 'text-cep-white' },
            { label: 'Presentes',  value: summary.presentes,   color: 'text-green-400' },
            { label: 'Ausentes',   value: summary.ausentes,    color: 'text-red-400' },
            { label: 'Frequência', value: `${pct}%`,           color: 'text-cep-lime-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-cep-purple-850 rounded-xl border border-cep-purple-700 p-3 text-center">
              <p className={`text-lg font-black ${color}`}>{value}</p>
              <p className="text-xs text-cep-muted">{label}</p>
            </div>
          ))}
        </div>

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
              text: () => gerarAnuncioTreino(training, 'CEPRAEA', trainingLocal),
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
              className="text-green-400 border border-green-500/30 bg-green-500/10 hover:bg-green-500/20"
              onClick={() => openWA(label, text())}
            >
              <MessageCircle className="h-4 w-4" />
              {label}
            </Button>
          ))}
        </div>

        {supabasePresenceTokensEnabled && (
          <div className="mx-4 mb-4 rounded-2xl border border-cep-purple-700 bg-cep-purple-850 p-4 space-y-3">
            <div>
              <h2 className="text-xs font-bold text-cep-muted uppercase tracking-wide">Tokens Supabase</h2>
              <p className="text-xs text-cep-muted/70 mt-1">
                Geração de lote protegida por feature flag e validação owner/coach.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" onClick={handleGeneratePresenceTokenBatch} loading={presenceBatchLoading}>
                <Link2 className="h-4 w-4" />
                Gerar lote de links
              </Button>
              {presenceBatchLinks.length > 0 && (
                <Button size="sm" variant="ghost" onClick={() => setPresenceBatchModal(true)}>
                  <Copy className="h-4 w-4" />
                  Ver lote atual
                </Button>
              )}
              {presenceBatchId && (
                <Button size="sm" variant="danger" onClick={handleRevokePresenceTokenBatch} loading={presenceBatchLoading}>
                  <Ban className="h-4 w-4" />
                  Revogar lote
                </Button>
              )}
            </div>
            {presenceBatchStatus && (
              <p className={`text-xs ${presenceBatchStatus.ok ? 'text-cep-lime-400' : 'text-red-400'}`}>
                {presenceBatchStatus.msg}
              </p>
            )}
          </div>
        )}

        {/* Athlete attendance list */}
        <div className="px-4 pb-6">
          <h2 className="text-xs font-bold text-cep-muted uppercase tracking-wide mb-2">
            Chamada ({activeAthletes.length} atletas)
          </h2>

          {activeAthletes.length === 0 ? (
            <p className="text-sm text-cep-muted text-center py-8">Nenhuma atleta ativa cadastrada.</p>
          ) : (
            <div className="bg-cep-purple-850 rounded-2xl border border-cep-purple-700 divide-y divide-cep-purple-800">
              {activeAthletes.map((athlete) => {
                const status = getStatus(athlete.id)
                const config = STATUS_CONFIG[status]
                const appUrl = window.location.origin
                const confirmLink = gerarMensagemConfirmacao(training, athlete, appUrl)
                const confirmed = trainingRecords.find((r) => r.atletaId === athlete.id)?.confirmadoPelaAtleta

                return (
                  <div key={athlete.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-cep-white">{athlete.nome}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-cep-muted">{formatPhone(athlete.telefone)}</p>
                        {confirmed && (
                          <span className="inline-flex items-center gap-1 text-xs bg-cep-lime-400/15 text-cep-lime-400 rounded-full px-2 py-0.5">
                            <Wifi className="h-3 w-3" /> Atleta confirmou
                          </span>
                        )}
                        {!confirmed && status !== 'pendente' && (
                          <span className="text-xs text-cep-muted/60">Manual</span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => abrirWhatsApp(confirmLink, athlete.telefone)}
                      className="p-2 rounded-lg text-green-400 hover:bg-green-500/15 active:bg-green-500/25 transition-colors"
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
              className="w-full rounded-xl bg-cep-purple-950 border border-cep-purple-700 px-3 py-2 text-sm font-mono text-cep-white resize-none focus:outline-none"
            />
            <div className="flex gap-2">
              <Button variant="secondary" fullWidth onClick={handleCopy}>
                <Copy className="h-4 w-4" />
                {copied ? 'Copiado!' : 'Copiar'}
              </Button>
              <Button
                fullWidth
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => abrirWhatsApp(waModal.text, undefined)}
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Supabase presence token batch modal */}
      {presenceBatchModal && (
        <Modal open={true} onClose={() => setPresenceBatchModal(false)} title="Lote de links Supabase">
          <div className="p-4 space-y-4">
            <textarea
              readOnly
              value={buildBatchText(presenceBatchLinks)}
              rows={10}
              className="w-full rounded-xl bg-cep-purple-950 border border-cep-purple-700 px-3 py-2 text-sm font-mono text-cep-white resize-none focus:outline-none"
            />
            {presenceBatchStatus && (
              <p className={`text-xs ${presenceBatchStatus.ok ? 'text-cep-lime-400' : 'text-red-400'}`}>{presenceBatchStatus.msg}</p>
            )}
            <div className="flex gap-2">
              <Button variant="secondary" fullWidth onClick={handleCopyPresenceTokenBatch}>
                <Copy className="h-4 w-4" />
                Copiar e marcar exportado
              </Button>
              <Button variant="danger" fullWidth onClick={handleRevokePresenceTokenBatch} loading={presenceBatchLoading} disabled={!presenceBatchId}>
                <Ban className="h-4 w-4" />
                Revogar
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
          <p className="text-sm text-cep-muted">Informe o motivo da ausência justificada:</p>
          <textarea
            value={justifText}
            onChange={(e) => setJustifText(e.target.value)}
            placeholder="Ex: Atestado médico, viagem..."
            rows={3}
            className="w-full rounded-xl border border-cep-purple-700 bg-cep-purple-950 text-cep-white placeholder-cep-muted/40 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cep-lime-400"
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

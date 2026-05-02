import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronLeft, CheckCircle, XCircle, AlertCircle, Calendar, Clock, MapPin } from 'lucide-react'
import { Button } from '@/shared/components/Button'
import { Modal } from '@/shared/components/Modal'
import { useTrainingStore } from '@/stores/trainingStore'
import { useAthleteStore } from '@/stores/athleteStore'
import { useAttendanceStore } from '@/stores/attendanceStore'
import { getAtletaSession } from '@/lib/athleteAuth'
import { loadAtletaSyncConfig, pushConfirmation } from '@/lib/sync'
import { formatDateLong, todayISO, cn } from '@/lib/utils'
import type { AttendanceStatus } from '@/types'

export default function AtletaTreinoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const session = getAtletaSession()
  const training = useTrainingStore((s) => s.getById(id ?? ''))
  const athletes = useAthleteStore((s) => s.athletes)
  const records = useAttendanceStore((s) => s.records)
  const upsert = useAttendanceStore((s) => s.upsert)
  const syncAttendances = useAttendanceStore((s) => s.syncFromRemote)

  const [saving, setSaving] = useState(false)
  const [showJustify, setShowJustify] = useState(false)
  const [justifyText, setJustifyText] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    if (!session || !id) return
    void (async () => {
      const config = await loadAtletaSyncConfig(session.token)
      if (!config) return
      await syncAttendances(config, { treinoId: id })
    })()
  }, [id, session, syncAttendances])

  const trainingRecords = useMemo(
    () => records.filter((r) => r.treinoId === id),
    [records, id]
  )
  const myRecord = trainingRecords.find((r) => r.atletaId === session?.atletaId)
  const myStatus: AttendanceStatus = myRecord?.status ?? 'pendente'

  // Agrupa por status, com nome
  const grouped = useMemo(() => {
    const byId = new Map(athletes.map((a) => [a.id, a.nome]))
    const presentes: string[] = []
    const ausentes: string[] = []
    const justificados: string[] = []
    for (const r of trainingRecords) {
      const nome = byId.get(r.atletaId) ?? 'Atleta'
      if (r.status === 'presente') presentes.push(nome)
      else if (r.status === 'ausente') ausentes.push(nome)
      else if (r.status === 'justificado') justificados.push(nome)
    }
    presentes.sort()
    ausentes.sort()
    justificados.sort()
    const respondidos = new Set(trainingRecords.map((r) => r.atletaId))
    const semResposta = athletes.filter((a) => a.status === 'ativo' && !respondidos.has(a.id)).length
    return { presentes, ausentes, justificados, semResposta }
  }, [athletes, trainingRecords])

  if (!session) return null
  if (!training) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-sm text-cep-muted">Treino não encontrado.</p>
        <Link to="/atleta/treinos" className="mt-3 inline-block text-cep-lime-400 text-sm">
          Voltar
        </Link>
      </div>
    )
  }

  const isFuture = training.data >= todayISO() && training.status !== 'cancelado'
  const canEdit = isFuture

  const respond = async (status: AttendanceStatus, justificativa?: string) => {
    if (!session || !training) return
    setSaving(true)
    setFeedback(null)
    await upsert(training.id, session.atletaId, status, {
      confirmadoPelaAtleta: true,
      justificativa,
    })
    const config = await loadAtletaSyncConfig(session.token)
    if (config) {
      const ok = await pushConfirmation(config, {
        treinoId: training.id,
        atletaId: session.atletaId,
        nomeAtleta: session.nome,
        status,
        origem: 'link',
      })
      setFeedback(ok ? 'Sua resposta foi sincronizada!' : 'Resposta salva. Sincronizará quando online.')
    } else {
      setFeedback('Resposta salva localmente.')
    }
    setSaving(false)
    setShowJustify(false)
    setJustifyText('')
  }

  return (
    <div className="px-4 py-4">
      <Link to="/atleta/treinos" className="inline-flex items-center gap-1 text-sm text-cep-muted mb-3 hover:text-cep-white">
        <ChevronLeft className="h-4 w-4" /> Voltar
      </Link>

      {/* Header do treino */}
      <div className="rounded-2xl bg-cep-purple-900 border border-cep-purple-800 p-4 mb-4 space-y-2">
        <div className="flex items-center gap-2 text-cep-white">
          <Calendar className="h-4 w-4 text-cep-lime-400" />
          <span className="text-sm font-semibold capitalize">{formatDateLong(training.data)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-cep-muted">
          <Clock className="h-4 w-4" />
          <span>{training.horaInicio} às {training.horaFim}</span>
        </div>
        {training.local && (
          <div className="flex items-center gap-2 text-sm text-cep-muted">
            <MapPin className="h-4 w-4" />
            <span>{training.local}</span>
          </div>
        )}
        {training.status === 'cancelado' && (
          <p className="text-xs text-red-400 font-semibold uppercase">Treino cancelado</p>
        )}
      </div>

      {/* Sua resposta */}
      <div className="rounded-2xl bg-cep-purple-900 border border-cep-purple-800 p-4 mb-4">
        <p className="text-xs font-semibold text-cep-muted uppercase tracking-wider mb-3">
          Sua resposta
        </p>
        {canEdit ? (
          <div className="grid grid-cols-3 gap-2">
            <ResponseButton
              active={myStatus === 'presente'}
              icon={CheckCircle}
              label="Vou"
              colorActive="border-cep-lime-400 bg-cep-lime-400/10 text-cep-lime-400"
              onClick={() => respond('presente')}
              disabled={saving}
            />
            <ResponseButton
              active={myStatus === 'ausente'}
              icon={XCircle}
              label="Não vou"
              colorActive="border-red-400 bg-red-400/10 text-red-400"
              onClick={() => respond('ausente')}
              disabled={saving}
            />
            <ResponseButton
              active={myStatus === 'justificado'}
              icon={AlertCircle}
              label="Justificar"
              colorActive="border-cep-gold-400 bg-cep-gold-400/10 text-cep-gold-400"
              onClick={() => {
                setJustifyText(myRecord?.justificativa ?? '')
                setShowJustify(true)
              }}
              disabled={saving}
            />
          </div>
        ) : (
          <p className="text-sm text-cep-white">
            {myStatus === 'presente' && '✅ Você compareceu'}
            {myStatus === 'ausente' && '❌ Você não compareceu'}
            {myStatus === 'justificado' && (
              <>
                ⚠️ Justificada{myRecord?.justificativa ? `: "${myRecord.justificativa}"` : ''}
              </>
            )}
            {myStatus === 'pendente' && 'Sem registro'}
          </p>
        )}
        {feedback && (
          <p className="text-xs text-cep-lime-400/80 mt-3">{feedback}</p>
        )}
      </div>

      {/* Quem vai */}
      <div className="rounded-2xl bg-cep-purple-900 border border-cep-purple-800 p-4 space-y-4">
        <p className="text-xs font-semibold text-cep-muted uppercase tracking-wider">
          Quem vai
        </p>

        <NameList
          icon={CheckCircle}
          color="text-cep-lime-400"
          label="Confirmadas"
          names={grouped.presentes}
        />
        <NameList
          icon={XCircle}
          color="text-red-400"
          label="Não vão"
          names={grouped.ausentes}
        />
        <NameList
          icon={AlertCircle}
          color="text-cep-gold-400"
          label="Justificadas"
          names={grouped.justificados}
        />

        {grouped.semResposta > 0 && (
          <div className="flex items-center gap-2 text-xs text-cep-muted/70 pt-2 border-t border-cep-purple-800">
            <Clock className="h-3.5 w-3.5" />
            <span>{grouped.semResposta} ainda não respond{grouped.semResposta > 1 ? 'eram' : 'eu'}</span>
          </div>
        )}
      </div>

      <Modal
        open={showJustify}
        onClose={() => setShowJustify(false)}
        title="Justificar ausência"
      >
        <div className="space-y-3">
          <textarea
            value={justifyText}
            onChange={(e) => setJustifyText(e.target.value)}
            placeholder="Ex: atestado médico, viagem..."
            rows={3}
            className="w-full rounded-xl bg-cep-purple-850 border border-cep-purple-700 text-cep-white placeholder-cep-muted/40 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-cep-lime-400"
            autoFocus
          />
          <div className="flex gap-2">
            <Button variant="secondary" fullWidth onClick={() => setShowJustify(false)}>
              Cancelar
            </Button>
            <Button
              fullWidth
              loading={saving}
              onClick={() => respond('justificado', justifyText.trim() || undefined)}
            >
              Salvar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

interface RespBtn {
  active: boolean
  icon: typeof CheckCircle
  label: string
  colorActive: string
  onClick: () => void
  disabled: boolean
}

function ResponseButton({ active, icon: Icon, label, colorActive, onClick, disabled }: RespBtn) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex flex-col items-center gap-1 rounded-xl border-2 p-3 transition-colors disabled:opacity-50',
        active
          ? colorActive
          : 'border-cep-purple-700 bg-cep-purple-850 text-cep-muted hover:text-cep-white'
      )}
    >
      <Icon className="h-6 w-6" />
      <span className="text-xs font-bold">{label}</span>
    </button>
  )
}

interface NameListProps {
  icon: typeof CheckCircle
  color: string
  label: string
  names: string[]
}

function NameList({ icon: Icon, color, label, names }: NameListProps) {
  return (
    <div>
      <div className={cn('flex items-center gap-1.5 mb-1.5', color)}>
        <Icon className="h-4 w-4" />
        <span className="text-xs font-bold uppercase tracking-wider">
          {label} ({names.length})
        </span>
      </div>
      {names.length === 0 ? (
        <p className="text-xs text-cep-muted/50 ml-5">—</p>
      ) : (
        <ul className="ml-5 space-y-0.5">
          {names.map((nome, i) => (
            <li key={i} className="text-sm text-cep-white">{nome}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

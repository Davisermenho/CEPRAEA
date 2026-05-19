import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, MessageSquare } from 'lucide-react'
import { Button } from '@/shared/components/Button'
import { fetchScoutGames, fetchScoutFeedback } from '../scoutApi'
import type {
  ScoutGameRecord,
  ScoutFeedback,
  ScoutFeedbackFilters,
  ScoutFeedbackRecipient,
  ScoutFeedbackStatus,
  ScoutReportTrainingPriority,
} from '@/types'

// ── Constants ─────────────────────────────────────────────────────────────────

const LABEL_CLS = 'block text-xs font-medium text-neutral-600 mb-1'
const SELECT_CLS = 'text-sm border rounded px-2 py-1.5 bg-white'

const STATUS_COLORS: Record<ScoutFeedbackStatus, string> = {
  PENDENTE:  'bg-gray-100 text-gray-700',
  ENTREGUE:  'bg-blue-100 text-blue-700',
  APLICADO:  'bg-green-100 text-green-700',
}

const PRIORITY_COLORS: Record<string, string> = {
  ALTA:   'bg-red-100 text-red-700',
  MEDIA:  'bg-orange-100 text-orange-700',
  BAIXA:  'bg-yellow-100 text-yellow-700',
  MANTER: 'bg-green-100 text-green-700',
}

const FEEDBACK_TYPE_LABELS: Record<string, string> = {
  CORRECAO:          'Correção',
  REFORCO:           'Reforço',
  ALERTA:            'Alerta',
  ELOGIO_TECNICO:    'Elogio técnico',
  AJUSTE_TATICO:     'Ajuste tático',
  ORIENTACAO_TREINO: 'Orientação de treino',
  REVISAO_VIDEO:     'Revisão em vídeo',
}

const RECIPIENT_LABELS: Record<string, string> = {
  ATLETA:             'Atleta',
  SETOR_OFENSIVO:     'Setor ofensivo',
  SETOR_DEFENSIVO:    'Setor defensivo',
  GOLEIRA:            'Goleira',
  BLOCO_TRANSICAO:    'Bloco transição',
  EQUIPE:             'Equipe',
  COMISSAO:           'Comissão',
}

function gameLabel(g: ScoutGameRecord): string {
  return [g.gameDate ?? '—', g.analyzedTeam ?? '', 'vs', g.opponent ?? '—'].filter(Boolean).join(' ')
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ScoutFeedbackPage() {
  const navigate = useNavigate()

  const [games, setGames] = useState<ScoutGameRecord[]>([])
  const [feedbacks, setFeedbacks] = useState<ScoutFeedback[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  // filters
  const [filterGameId, setFilterGameId] = useState('')
  const [filterRecipient, setFilterRecipient] = useState<ScoutFeedbackRecipient | ''>('')
  const [filterStatus, setFilterStatus] = useState<ScoutFeedbackStatus | ''>('')

  useEffect(() => {
    fetchScoutGames().then(setGames).catch(() => undefined)
    loadFeedback({})
  }, [])

  async function loadFeedback(filters: ScoutFeedbackFilters) {
    setLoading(true); setError(null)
    try {
      const data = await fetchScoutFeedback(filters)
      setFeedbacks(data)
      setLoaded(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar feedbacks.')
    } finally { setLoading(false) }
  }

  function applyFilters(
    gid: string,
    rec: ScoutFeedbackRecipient | '',
    st: ScoutFeedbackStatus | '',
  ) {
    const f: ScoutFeedbackFilters = {}
    if (gid) f.scoutGameId = gid
    if (rec) f.recipient = rec
    if (st) f.feedbackStatus = st
    loadFeedback(f)
  }

  function handleGameChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const v = e.target.value
    setFilterGameId(v)
    applyFilters(v, filterRecipient, filterStatus)
  }

  function handleRecipientChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const v = e.target.value as ScoutFeedbackRecipient | ''
    setFilterRecipient(v)
    applyFilters(filterGameId, v, filterStatus)
  }

  function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const v = e.target.value as ScoutFeedbackStatus | ''
    setFilterStatus(v)
    applyFilters(filterGameId, filterRecipient, v)
  }

  function clearFilters() {
    setFilterGameId(''); setFilterRecipient(''); setFilterStatus('')
    loadFeedback({})
  }

  const hasFilter = filterGameId || filterRecipient || filterStatus

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <Button variant="ghost" size="sm" onClick={() => navigate('/scout')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <MessageSquare className="h-5 w-5 text-emerald-600" />
        <h1 className="font-semibold text-gray-900">Feedbacks</h1>
        {loaded && <span className="ml-auto text-xs text-gray-500">{feedbacks.length} registro{feedbacks.length !== 1 ? 's' : ''}</span>}
      </div>

      <div className="flex-1 p-4 max-w-4xl mx-auto w-full space-y-4">

        {/* Filtros */}
        <div className="bg-white border rounded-lg p-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className={LABEL_CLS}>Jogo</label>
              <select className={SELECT_CLS} value={filterGameId} onChange={handleGameChange}>
                <option value="">Todos</option>
                {games.map((g) => (
                  <option key={g.id} value={g.id}>{gameLabel(g)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL_CLS}>Destinatário</label>
              <select className={SELECT_CLS} value={filterRecipient} onChange={handleRecipientChange}>
                <option value="">Todos</option>
                {Object.entries(RECIPIENT_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL_CLS}>Status</label>
              <select className={SELECT_CLS} value={filterStatus} onChange={handleStatusChange}>
                <option value="">Todos</option>
                {(['PENDENTE', 'ENTREGUE', 'APLICADO'] as const).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            {hasFilter && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Limpar filtros
              </Button>
            )}
          </div>
        </div>

        {/* Lista */}
        {loading ? (
          <p className="text-sm text-gray-500 text-center py-10">Carregando...</p>
        ) : error ? (
          <p className="text-sm text-red-600 text-center py-10">{error}</p>
        ) : feedbacks.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-10">Nenhum feedback encontrado.</p>
        ) : (
          <div className="space-y-3">
            {feedbacks.map((fb) => (
              <div key={fb.id} className="bg-white border rounded-lg p-4 space-y-2">
                <div className="flex flex-wrap gap-2 items-start justify-between">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs rounded px-2 py-0.5 bg-purple-100 text-purple-700 font-medium">
                      {RECIPIENT_LABELS[fb.recipient] ?? fb.recipient}
                    </span>
                    <span className="text-xs rounded px-2 py-0.5 bg-blue-50 text-blue-700 font-medium">
                      {FEEDBACK_TYPE_LABELS[fb.feedbackType] ?? fb.feedbackType}
                    </span>
                    <span className={`text-xs rounded px-2 py-0.5 font-medium ${PRIORITY_COLORS[fb.priority] ?? 'bg-gray-100 text-gray-600'}`}>
                      {fb.priority}
                    </span>
                  </div>
                  <span className={`text-xs rounded-full px-2.5 py-0.5 font-medium ${STATUS_COLORS[fb.feedbackStatus]}`}>
                    {fb.feedbackStatus}
                  </span>
                </div>

                <p className="text-sm font-semibold text-gray-900">{fb.feedbackTopic}</p>
                <p className="text-sm text-gray-700">{fb.message}</p>

                {fb.evidenceRef && (
                  <p className="text-xs text-gray-500"><strong>Evidência:</strong> {fb.evidenceRef}</p>
                )}
                {fb.recommendedAction && (
                  <p className="text-xs text-gray-600 bg-gray-50 rounded px-3 py-1.5">
                    <strong>Ação recomendada:</strong> {fb.recommendedAction}
                  </p>
                )}
                <p className="text-xs text-gray-400">
                  {new Date(fb.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, ChevronRight, ClipboardCheck } from 'lucide-react'
import { Button } from '@/shared/components/Button'
import {
  createScoutPlayValidation,
  fetchScoutGames,
  fetchScoutPlayValidationsForPlay,
  fetchScoutPlaysForGame,
  patchScoutPlayStatus,
} from '@/features/scout/scoutApi'
import type {
  ScoutGameRecord,
  ScoutPlayListItem,
  ScoutPlayValidation,
  ScoutPlayValidationWriteInput,
  ScoutValidationStatus,
} from '@/types'

// ── Status helpers ──────────────────────────────────────────────────────────

const STATUS_LABELS: Record<ScoutValidationStatus, string> = {
  PENDENTE: 'Pendente',
  REVISADO: 'Revisado',
  CORRIGIDO: 'Corrigido',
  VALIDADO: 'Validado',
  DUVIDA: 'Dúvida',
}

const STATUS_COLORS: Record<ScoutValidationStatus, string> = {
  PENDENTE: 'bg-neutral-100 text-neutral-600',
  REVISADO: 'bg-yellow-100 text-yellow-700',
  CORRIGIDO: 'bg-orange-100 text-orange-700',
  VALIDADO: 'bg-green-100 text-green-700',
  DUVIDA: 'bg-red-100 text-red-700',
}

const NEXT_STATUS: Partial<Record<ScoutValidationStatus, ScoutValidationStatus>> = {
  PENDENTE: 'REVISADO',
  REVISADO: 'CORRIGIDO',
  CORRIGIDO: 'VALIDADO',
}

// ── Component ───────────────────────────────────────────────────────────────

export default function ScoutValidationPage() {
  const { gameId } = useParams<{ gameId: string }>()
  const navigate = useNavigate()

  const [game, setGame] = useState<ScoutGameRecord | null>(null)
  const [plays, setPlays] = useState<ScoutPlayListItem[]>([])
  const [selectedPlay, setSelectedPlay] = useState<ScoutPlayListItem | null>(null)
  const [validations, setValidations] = useState<ScoutPlayValidation[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state for new validation
  const [formStatus, setFormStatus] = useState<ScoutValidationStatus>('REVISADO')
  const [formFieldName, setFormFieldName] = useState('')
  const [formOriginalValue, setFormOriginalValue] = useState('')
  const [formCorrectedValue, setFormCorrectedValue] = useState('')
  const [formCorrectionReason, setFormCorrectionReason] = useState('')
  const [formNotes, setFormNotes] = useState('')

  // ── Load game + plays ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!gameId) return
    setLoading(true)
    Promise.all([fetchScoutGames(), fetchScoutPlaysForGame(gameId)])
      .then(([games, fetchedPlays]) => {
        const found = games.find((g) => g.id === gameId) ?? null
        setGame(found)
        setPlays(fetchedPlays)
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : 'Erro ao carregar jogadas.')
      })
      .finally(() => setLoading(false))
  }, [gameId])

  // ── Load validations for selected play ───────────────────────────────────
  useEffect(() => {
    if (!selectedPlay) {
      setValidations([])
      return
    }
    fetchScoutPlayValidationsForPlay(selectedPlay.id)
      .then(setValidations)
      .catch(() => setValidations([]))
  }, [selectedPlay])

  // ── Advance status shortcut ───────────────────────────────────────────────
  async function handleAdvanceStatus(play: ScoutPlayListItem) {
    const next = NEXT_STATUS[play.validationStatus]
    if (!next) return
    setSaving(true)
    try {
      await patchScoutPlayStatus(play.id, next)
      setPlays((prev) =>
        prev.map((p) => (p.id === play.id ? { ...p, validationStatus: next } : p)),
      )
      if (selectedPlay?.id === play.id) {
        setSelectedPlay((prev) => (prev ? { ...prev, validationStatus: next } : prev))
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao avançar status.')
    } finally {
      setSaving(false)
    }
  }

  // ── Create validation record ──────────────────────────────────────────────
  async function handleCreateValidation(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedPlay || !gameId) return
    if (!formFieldName.trim()) {
      setError('Campo obrigatório: Campo validado.')
      return
    }
    if (!formCorrectionReason.trim()) {
      setError('Campo obrigatório: Motivo / Observação.')
      return
    }

    setSaving(true)
    setError(null)
    try {
      const input: ScoutPlayValidationWriteInput = {
        scoutGameId: gameId,
        scoutPlayId: selectedPlay.id,
        fieldName: formFieldName.trim(),
        originalValue: formOriginalValue.trim() || undefined,
        correctedValue: formCorrectedValue.trim() || undefined,
        validationStatus: formStatus,
        correctionReason: formCorrectionReason.trim(),
        validationNotes: formNotes.trim() || undefined,
      }
      const created = await createScoutPlayValidation(input)
      setValidations((prev) => [created, ...prev])

      // Also patch the play's overall status
      await patchScoutPlayStatus(selectedPlay.id, formStatus)
      setPlays((prev) =>
        prev.map((p) =>
          p.id === selectedPlay.id ? { ...p, validationStatus: formStatus } : p,
        ),
      )
      setSelectedPlay((prev) =>
        prev ? { ...prev, validationStatus: formStatus } : prev,
      )

      // Reset form
      setFormFieldName('')
      setFormOriginalValue('')
      setFormCorrectedValue('')
      setFormCorrectionReason('')
      setFormNotes('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar validação.')
    } finally {
      setSaving(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-neutral-400 text-sm">
        Carregando…
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-white shrink-0">
        <Button variant="ghost" size="sm" onClick={() => navigate('/scout')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <ClipboardCheck className="h-5 w-5 text-indigo-600 shrink-0" />
        <div className="min-w-0">
          <h1 className="text-base font-semibold truncate">Validação Pós-Jogo</h1>
          <p className="text-xs text-neutral-500">
            {game
              ? `${game.gameDate ?? 'Sem data'} · ${game.opponent ?? 'Sem adversária'} · ${plays.length} jogada${plays.length !== 1 ? 's' : ''}`
              : 'Jogo não encontrado'}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2 text-xs text-neutral-400">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
            {plays.filter((p) => p.validationStatus === 'VALIDADO').length} validada
            {plays.filter((p) => p.validationStatus === 'VALIDADO').length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="px-4 py-2 bg-red-50 text-red-700 text-xs border-b border-red-200">
          {error}
          <button className="ml-2 underline" onClick={() => setError(null)}>
            Fechar
          </button>
        </div>
      )}

      {/* ── Body: two-panel ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left: play list */}
        <aside className="w-60 shrink-0 overflow-y-auto border-r bg-neutral-50">
          {plays.length === 0 ? (
            <p className="text-xs text-neutral-400 p-4">Nenhuma jogada encontrada.</p>
          ) : (
            <ul>
              {plays.map((play) => (
                <li key={play.id}>
                  <button
                    className={`w-full text-left px-3 py-2.5 border-b text-xs hover:bg-white transition-colors flex items-center gap-2 ${
                      selectedPlay?.id === play.id
                        ? 'bg-white font-medium border-l-2 border-l-indigo-500'
                        : ''
                    }`}
                    onClick={() => {
                      setSelectedPlay(play)
                      setError(null)
                    }}
                  >
                    <span className="flex-1 min-w-0">
                      <span className="block font-medium truncate">{play.playCode}</span>
                      <span className="block text-neutral-400 truncate">
                        {play.phaseOfBall} · {play.factualResult}
                      </span>
                    </span>
                    <span
                      className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${STATUS_COLORS[play.validationStatus]}`}
                    >
                      {STATUS_LABELS[play.validationStatus]}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        {/* Right: detail + form */}
        <main className="flex-1 overflow-y-auto p-4 space-y-4">
          {!selectedPlay ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-neutral-400">
              <ClipboardCheck className="h-8 w-8" />
              <p className="text-sm">Selecione uma jogada para validar.</p>
            </div>
          ) : (
            <>
              {/* Play header */}
              <div className="bg-white border rounded-lg p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold">{selectedPlay.playCode}</h2>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {selectedPlay.period} · {selectedPlay.gameClock} ·{' '}
                      {selectedPlay.phaseOfBall} · {selectedPlay.factualResult}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[selectedPlay.validationStatus]}`}
                    >
                      {STATUS_LABELS[selectedPlay.validationStatus]}
                    </span>
                    {NEXT_STATUS[selectedPlay.validationStatus] && (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={saving}
                        onClick={() => handleAdvanceStatus(selectedPlay)}
                        title={`Avançar para ${STATUS_LABELS[NEXT_STATUS[selectedPlay.validationStatus]!]}`}
                      >
                        <ChevronRight className="h-4 w-4" />
                        {STATUS_LABELS[NEXT_STATUS[selectedPlay.validationStatus]!]}
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Validation form */}
              <div className="bg-white border rounded-lg p-4">
                <h3 className="text-xs font-semibold uppercase text-neutral-500 mb-3">
                  Registrar Validação
                </h3>
                <form onSubmit={handleCreateValidation} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-neutral-600 mb-1">
                        Status *
                      </label>
                      <select
                        className="w-full border rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
                        value={formStatus}
                        onChange={(e) =>
                          setFormStatus(e.target.value as ScoutValidationStatus)
                        }
                      >
                        {(
                          ['PENDENTE', 'REVISADO', 'CORRIGIDO', 'VALIDADO', 'DUVIDA'] as ScoutValidationStatus[]
                        ).map((s) => (
                          <option key={s} value={s}>
                            {STATUS_LABELS[s]}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-neutral-600 mb-1">
                        Campo validado *
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
                        placeholder="ex: factual_result"
                        value={formFieldName}
                        onChange={(e) => setFormFieldName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-neutral-600 mb-1">
                        Valor original
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
                        value={formOriginalValue}
                        onChange={(e) => setFormOriginalValue(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-neutral-600 mb-1">
                        Valor corrigido
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
                        value={formCorrectedValue}
                        onChange={(e) => setFormCorrectedValue(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-neutral-600 mb-1">
                      Motivo / Observação *
                    </label>
                    <input
                      type="text"
                      className="w-full border rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
                      placeholder="Descreva o motivo da validação ou correção"
                      value={formCorrectionReason}
                      onChange={(e) => setFormCorrectionReason(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-neutral-600 mb-1">
                      Notas adicionais
                    </label>
                    <textarea
                      className="w-full border rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400 resize-none"
                      rows={2}
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={saving}>
                      {saving ? 'Salvando…' : 'Registrar'}
                    </Button>
                  </div>
                </form>
              </div>

              {/* Validation history */}
              {validations.length > 0 && (
                <div className="bg-white border rounded-lg p-4">
                  <h3 className="text-xs font-semibold uppercase text-neutral-500 mb-3">
                    Histórico de Validações ({validations.length})
                  </h3>
                  <ul className="space-y-2">
                    {validations.map((v) => (
                      <li key={v.id} className="text-xs border rounded p-2 bg-neutral-50">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${STATUS_COLORS[v.validationStatus]}`}
                          >
                            {STATUS_LABELS[v.validationStatus]}
                          </span>
                          <span className="font-medium text-neutral-700">{v.fieldName}</span>
                          <span className="ml-auto text-neutral-400">
                            {new Date(v.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        {(v.originalValue || v.correctedValue) && (
                          <p className="text-neutral-500">
                            {v.originalValue && <span>De: {v.originalValue} </span>}
                            {v.correctedValue && <span>→ Para: {v.correctedValue}</span>}
                          </p>
                        )}
                        <p className="text-neutral-600 mt-0.5">{v.correctionReason}</p>
                        {v.validationNotes && (
                          <p className="text-neutral-400 italic mt-0.5">{v.validationNotes}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CheckSquare, AlertTriangle, Square, Video } from 'lucide-react'
import { Button } from '@/shared/components/Button'
import {
  addAthleteToGame,
  createScoutGame,
  fetchScoutAthletes,
  fetchScoutGameAthletes,
  fetchScoutGames,
  removeAthleteFromGame,
} from '@/features/scout/scoutApi'
import type { AthleteWithScoutProfile, ScoutGameAthlete, ScoutGameRecord, ScoutSessionType } from '@/types'

const SESSION_TYPES: { value: ScoutSessionType; label: string }[] = [
  { value: 'JOGO', label: 'Jogo' },
  { value: 'AMISTOSO', label: 'Amistoso' },
  { value: 'TREINO', label: 'Treino' },
  { value: 'SIMULADO', label: 'Simulado' },
]

// Adversária obrigatória para JOGO e AMISTOSO
function requiresOpponent(sessionType: ScoutSessionType | ''): boolean {
  return sessionType === 'JOGO' || sessionType === 'AMISTOSO'
}

export default function ScoutPrepareSessionPage() {
  const { gameId } = useParams<{ gameId: string }>()
  const navigate = useNavigate()

  // ── Dados da sessão
  const [sessionType, setSessionType] = useState<ScoutSessionType | ''>('')
  const [gameDate, setGameDate] = useState(new Date().toISOString().slice(0, 10))
  const [opponent, setOpponent] = useState('')
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')
  const [savingGame, setSavingGame] = useState(false)
  const [gameError, setGameError] = useState('')

  // ── Elenco (só após gameId existir)
  const [game, setGame] = useState<ScoutGameRecord | null>(null)
  const [athletes, setAthletes] = useState<AthleteWithScoutProfile[]>([])
  const [roster, setRoster] = useState<ScoutGameAthlete[]>([])
  const [loadingRoster, setLoadingRoster] = useState(false)
  const [rosterError, setRosterError] = useState('')
  const [pendingAthleteId, setPendingAthleteId] = useState<string | null>(null)

  // ── Carregar sessão, elenco e atletas ativas quando há gameId
  useEffect(() => {
    if (!gameId) return
    setLoadingRoster(true)
    Promise.all([
      fetchScoutGames(),
      fetchScoutGameAthletes(gameId),
      fetchScoutAthletes({ status: 'ativo' }),
    ])
      .then(([games, existingRoster, activeAthletes]) => {
        const found = games.find((g) => g.id === gameId)
        if (found) {
          setGame(found)
          setSessionType(found.sessionType ?? '')
          setGameDate(found.gameDate ?? new Date().toISOString().slice(0, 10))
          setOpponent(found.opponent ?? '')
          setLocation(found.location ?? '')
          setNotes(found.notes ?? '')
        }
        setRoster(existingRoster)
        setAthletes(activeAthletes)
      })
      .catch((err: unknown) => setRosterError((err as Error).message))
      .finally(() => setLoadingRoster(false))
  }, [gameId])

  // ── Criar sessão
  async function handleCreateGame(e: React.FormEvent) {
    e.preventDefault()
    if (!sessionType) { setGameError('Selecione o tipo de sessão.'); return }
    if (requiresOpponent(sessionType) && !opponent.trim()) {
      setGameError('Adversária é obrigatória para Jogo e Amistoso.')
      return
    }
    setGameError('')
    setSavingGame(true)
    try {
      const created = await createScoutGame({
        sessionType,
        gameDate: gameDate || undefined,
        opponent: opponent.trim() || undefined,
        location: location.trim() || undefined,
        notes: notes.trim() || undefined,
      })
      navigate(`/scout/preparar/${created.id}`)
    } catch (err: unknown) {
      setGameError((err as Error).message)
    } finally {
      setSavingGame(false)
    }
  }

  // ── Toggle atleta no elenco
  async function toggleAthlete(athleteId: string) {
    if (!gameId || pendingAthleteId) return
    const isInRoster = roster.some((r) => r.athleteId === athleteId)
    setPendingAthleteId(athleteId)
    setRosterError('')
    try {
      if (isInRoster) {
        await removeAthleteFromGame(gameId, athleteId)
        setRoster((prev) => prev.filter((r) => r.athleteId !== athleteId))
      } else {
        const added = await addAthleteToGame(gameId, athleteId)
        setRoster((prev) => [...prev, added])
      }
    } catch (err: unknown) {
      setRosterError((err as Error).message)
    } finally {
      setPendingAthleteId(null)
    }
  }

  const rosterIds = new Set(roster.map((r) => r.athleteId))

  return (
    <div className="min-h-full bg-[radial-gradient(circle_at_top_left,_rgba(184,255,84,0.08),_transparent_28%),linear-gradient(180deg,_rgba(34,16,61,0.98),_rgba(14,7,28,1))] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl space-y-6">

        {/* Voltar */}
        <button
          onClick={() => navigate('/scout')}
          className="inline-flex items-center gap-1.5 text-xs text-cep-muted hover:text-cep-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Central do Scout
        </button>

        <header className="rounded-[2rem] border border-cep-purple-800 bg-cep-purple-900/80 p-6">
          <h1 className="text-2xl font-semibold text-cep-white">
            {gameId ? 'Confirmar elenco da sessão' : 'Preparar nova sessão'}
          </h1>
          <p className="mt-1 text-sm text-cep-muted">
            {gameId
              ? 'Selecione as atletas disponíveis para esta sessão.'
              : 'Preencha os dados básicos antes de iniciar a coleta.'}
          </p>
        </header>

        {/* ── SEÇÃO 1: Dados da sessão (sempre visível no modo criação; readOnly após criar) */}
        {!gameId && (
          <section className="rounded-2xl border border-cep-purple-800 bg-cep-purple-950/40 p-5 space-y-4">
            <h2 className="text-xs font-medium uppercase tracking-widest text-cep-muted">
              Dados da sessão
            </h2>
            <form onSubmit={handleCreateGame} className="space-y-4">
              {/* Tipo de sessão */}
              <div>
                <label className="block text-xs font-medium uppercase tracking-[0.18em] text-cep-muted mb-1.5">
                  Tipo de sessão *
                </label>
                <div className="flex flex-wrap gap-2">
                  {SESSION_TYPES.map((st) => (
                    <button
                      key={st.value}
                      type="button"
                      onClick={() => setSessionType(st.value)}
                      className={[
                        'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                        sessionType === st.value
                          ? 'border-cep-lime-400 bg-cep-lime-400/15 text-cep-lime-300'
                          : 'border-cep-purple-700 bg-cep-purple-950/60 text-cep-muted hover:text-cep-white hover:border-cep-purple-500',
                      ].join(' ')}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Data */}
              <div>
                <label className="block text-xs font-medium uppercase tracking-[0.18em] text-cep-muted mb-1.5">
                  Data *
                </label>
                <input
                  type="date"
                  value={gameDate}
                  onChange={(e) => setGameDate(e.target.value)}
                  required
                  className="w-full rounded-lg border border-cep-purple-700 bg-cep-purple-950/60 px-3 py-2 text-sm text-cep-white placeholder-cep-muted focus:outline-none focus:border-cep-purple-400"
                />
              </div>

              {/* Adversária */}
              <div>
                <label className="block text-xs font-medium uppercase tracking-[0.18em] text-cep-muted mb-1.5">
                  Adversária {requiresOpponent(sessionType) ? '*' : '(opcional)'}
                </label>
                <input
                  type="text"
                  value={opponent}
                  onChange={(e) => setOpponent(e.target.value)}
                  placeholder="Nome da equipe adversária"
                  className="w-full rounded-lg border border-cep-purple-700 bg-cep-purple-950/60 px-3 py-2 text-sm text-cep-white placeholder-cep-muted focus:outline-none focus:border-cep-purple-400"
                />
              </div>

              {/* Local */}
              <div>
                <label className="block text-xs font-medium uppercase tracking-[0.18em] text-cep-muted mb-1.5">
                  Local (opcional)
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Quadra, ginásio, cidade…"
                  className="w-full rounded-lg border border-cep-purple-700 bg-cep-purple-950/60 px-3 py-2 text-sm text-cep-white placeholder-cep-muted focus:outline-none focus:border-cep-purple-400"
                />
              </div>

              {/* Observações */}
              <div>
                <label className="block text-xs font-medium uppercase tracking-[0.18em] text-cep-muted mb-1.5">
                  Observações (opcional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Notas livres sobre a sessão…"
                  className="w-full rounded-lg border border-cep-purple-700 bg-cep-purple-950/60 px-3 py-2 text-sm text-cep-white placeholder-cep-muted focus:outline-none focus:border-cep-purple-400 resize-none"
                />
              </div>

              {gameError && (
                <p className="text-xs text-red-400">{gameError}</p>
              )}

              <Button type="submit" disabled={savingGame}>
                {savingGame ? 'Criando sessão…' : 'Confirmar sessão →'}
              </Button>
            </form>
          </section>
        )}

        {/* Resumo da sessão quando gameId existe */}
        {gameId && game && (
          <section className="rounded-2xl border border-cep-lime-400/30 bg-cep-lime-400/5 p-4">
            <p className="text-xs font-medium uppercase tracking-widest text-cep-lime-400 mb-1">
              Sessão confirmada
              {game.sessionType && ` · ${SESSION_TYPES.find((s) => s.value === game.sessionType)?.label ?? game.sessionType}`}
            </p>
            <p className="text-sm text-cep-white">
              {game.opponent ?? 'Sem adversária'}
              {game.gameDate && <span className="text-cep-muted"> · {game.gameDate}</span>}
            </p>
          </section>
        )}

        {/* ── SEÇÃO 2: Elenco (apenas quando gameId existe) */}
        {gameId && (
          <section className="rounded-2xl border border-cep-purple-800 bg-cep-purple-950/40 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-medium uppercase tracking-widest text-cep-muted">
                Confirmar elenco
              </h2>
              <span className="text-xs text-cep-lime-300 font-medium">
                {roster.length} atleta{roster.length !== 1 ? 's' : ''} confirmada{roster.length !== 1 ? 's' : ''}
              </span>
            </div>

            {rosterError && (
              <p className="text-xs text-red-400">{rosterError}</p>
            )}

            {loadingRoster ? (
              <p className="text-sm text-cep-muted">Carregando elenco…</p>
            ) : athletes.length === 0 ? (
              <div className="rounded-xl border border-yellow-700/30 bg-yellow-950/20 p-4">
                <p className="text-sm text-yellow-400">
                  Nenhuma atleta cadastrada. Cadastre atletas em Scout → Atletas antes de confirmar o elenco.
                </p>
                <button
                  onClick={() => navigate('/scout/athletes')}
                  className="mt-2 text-xs text-yellow-300 underline underline-offset-2"
                >
                  Ir para Atletas →
                </button>
              </div>
            ) : (
              <ul className="space-y-2">
                {athletes.map((athlete) => {
                  const inRoster = rosterIds.has(athlete.id)
                  const pending = pendingAthleteId === athlete.id
                  return (
                    <li key={athlete.id}>
                      <button
                        onClick={() => toggleAthlete(athlete.id)}
                        disabled={!!pendingAthleteId}
                        className={[
                          'w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors',
                          inRoster
                            ? 'border-cep-lime-400/40 bg-cep-lime-400/5 hover:bg-cep-lime-400/10'
                            : 'border-cep-purple-800 bg-cep-purple-950/40 hover:border-cep-purple-600',
                          !!pendingAthleteId && !pending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                        ].join(' ')}
                      >
                        {inRoster ? (
                          <CheckSquare className="h-4 w-4 text-cep-lime-400 shrink-0" />
                        ) : (
                          <Square className="h-4 w-4 text-cep-muted shrink-0" />
                        )}
                        <span className={`text-sm font-medium ${inRoster ? 'text-cep-white' : 'text-cep-muted'}`}>
                          {athlete.name}
                        </span>
                        {pending && (
                          <span className="ml-auto text-xs text-cep-muted">…</span>
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}

            {/* Continuar sem elenco */}
            {roster.length === 0 && !loadingRoster && (
              <div className="flex items-start gap-2 rounded-xl border border-yellow-700/30 bg-yellow-950/10 p-3">
                <AlertTriangle className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-300">
                  Sem elenco confirmado, entradas sem protagonista clara serão revisadas depois.
                </p>
              </div>
            )}
          </section>
        )}

        {/* CTAs finais */}
        {gameId && (
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              onClick={() => navigate(`/scout/ao-vivo/${gameId}`)}
              className="flex-1"
            >
              Coletar ao vivo →
            </Button>
            <button
              onClick={() => navigate(`/scout/review/${gameId}`)}
              className="flex-1 rounded-xl border border-cep-purple-700 bg-cep-purple-950/60 px-4 py-2.5 text-sm font-medium text-cep-muted hover:text-cep-white hover:border-cep-purple-500 transition-colors flex items-center justify-center gap-2"
            >
              <Video className="h-4 w-4" />
              Analisar por vídeo
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

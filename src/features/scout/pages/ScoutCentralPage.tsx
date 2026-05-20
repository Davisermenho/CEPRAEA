import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart2, Film, LayoutDashboard, MessageSquare, Plus, Radar, RotateCcw, Shield, UserCheck, Video } from 'lucide-react'
import { fetchScoutGames, fetchScoutLiveEntriesForGame } from '@/features/scout/scoutApi'
import type { ScoutGameRecord, ScoutLiveEntry } from '@/types'

const SESSION_TYPE_LABEL: Record<string, string> = {
  JOGO: 'Jogo',
  TREINO: 'Treino',
  AMISTOSO: 'Amistoso',
  SIMULADO: 'Simulado',
}

export default function ScoutCentralPage() {
  const navigate = useNavigate()

  const [games, setGames] = useState<ScoutGameRecord[]>([])
  const [entries, setEntries] = useState<ScoutLiveEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Sessão ativa: em_andamento mais recente por gameDate DESC, createdAt DESC
  const activeGame = useMemo(() => {
    return games.find((g) => g.status === 'em_andamento') ?? null
  }, [games])

  const pendingCount = useMemo(
    () => entries.filter((e) => e.statusValidacaoCode === 'PENDENTE').length,
    [entries],
  )
  const validatedCount = useMemo(
    () => entries.filter((e) => e.statusValidacaoCode === 'VALIDADO').length,
    [entries],
  )

  useEffect(() => {
    setLoading(true)
    fetchScoutGames()
      .then((gs) => {
        // Ordenado por gameDate DESC, createdAt DESC — já vem assim da API
        setGames(gs)
        const active = gs.find((g) => g.status === 'em_andamento')
        if (active) {
          return fetchScoutLiveEntriesForGame(active.id)
        }
        return Promise.resolve([] as ScoutLiveEntry[])
      })
      .then(setEntries)
      .catch((err: unknown) => setError((err as Error).message))
      .finally(() => setLoading(false))
  }, [])

  function goLive() {
    if (activeGame) navigate(`/scout/ao-vivo/${activeGame.id}`)
  }
  function goVideo() {
    if (activeGame) navigate(`/scout/review/${activeGame.id}`)
  }
  function goReview() {
    if (activeGame && pendingCount > 0) navigate(`/scout/validate/${activeGame.id}`)
  }

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center px-6 py-20">
        <p className="text-sm text-cep-muted">Carregando Central do Scout…</p>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-[radial-gradient(circle_at_top_left,_rgba(184,255,84,0.08),_transparent_28%),linear-gradient(180deg,_rgba(34,16,61,0.98),_rgba(14,7,28,1))] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">

        {/* Sub-nav */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate('/scout/athletes')}
            className="inline-flex items-center gap-1.5 rounded-full border border-cep-purple-700 bg-cep-purple-950/60 px-3 py-1 text-xs font-medium text-cep-muted hover:text-cep-white hover:border-cep-purple-500 transition-colors"
          >
            <UserCheck className="h-3.5 w-3.5" />
            Atletas
          </button>
          <button
            onClick={() => navigate('/scout/teams')}
            className="inline-flex items-center gap-1.5 rounded-full border border-cep-purple-700 bg-cep-purple-950/60 px-3 py-1 text-xs font-medium text-cep-muted hover:text-cep-white hover:border-cep-purple-500 transition-colors"
          >
            <Shield className="h-3.5 w-3.5" />
            Equipes
          </button>
          <button
            onClick={() => navigate('/scout/dashboard')}
            className="inline-flex items-center gap-1.5 rounded-full border border-cep-purple-700 bg-cep-purple-950/60 px-3 py-1 text-xs font-medium text-cep-muted hover:text-cep-white hover:border-cep-purple-500 transition-colors"
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            Dashboard
          </button>
        </div>

        {/* Header */}
        <header className="rounded-[2rem] border border-cep-purple-800 bg-cep-purple-900/80 p-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-cep-purple-700 bg-cep-purple-950/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-cep-lime-300">
              <Radar className="h-3.5 w-3.5" />
              Central do Scout
            </span>
            <h1 className="text-3xl font-semibold text-cep-white">O que você quer fazer?</h1>
            <p className="text-sm leading-6 text-cep-muted">
              Prepare, colete, revise e transforme o jogo em feedback.
            </p>
          </div>
        </header>

        {/* Sessão ativa */}
        {activeGame ? (
          <div className="rounded-2xl border border-cep-lime-400/30 bg-cep-lime-400/5 p-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-cep-lime-400 mb-1">
                  Sessão ativa
                  {activeGame.sessionType && ` · ${SESSION_TYPE_LABEL[activeGame.sessionType] ?? activeGame.sessionType}`}
                </p>
                <p className="text-sm font-semibold text-cep-white">
                  {activeGame.opponent ?? 'Sem adversária'}
                  {activeGame.gameDate && <span className="text-cep-muted font-normal"> · {activeGame.gameDate}</span>}
                </p>
              </div>
              <div className="flex gap-4 text-sm">
                <span className="text-cep-muted">{entries.length} entradas</span>
                <span className="text-yellow-400">{pendingCount} pendentes</span>
                <span className="text-green-400">{validatedCount} validadas</span>
              </div>
            </div>
            <button
              onClick={() => navigate(`/scout/preparar/${activeGame.id}`)}
              className="mt-3 text-xs text-cep-muted hover:text-cep-white underline underline-offset-2 transition-colors"
            >
              Editar sessão / gerenciar elenco
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-cep-purple-800 bg-cep-purple-950/40 p-4 text-center">
            <p className="text-sm text-cep-muted">Nenhum scout preparado. Crie uma sessão antes de coletar ou analisar.</p>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-800 bg-red-950/30 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Cards de ação */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

          {/* Preparar nova sessão */}
          <ActionCard
            icon={<Plus className="h-5 w-5" />}
            title="Preparar nova sessão"
            description="Criar sessão, selecionar equipes e confirmar elenco."
            enabled
            onClick={() => navigate('/scout/preparar')}
            accent="lime"
          />

          {/* Coletar ao vivo */}
          <ActionCard
            icon={<Radar className="h-5 w-5" />}
            title="Coletar ao vivo"
            description="Registrar sequências rápidas durante o jogo."
            enabled={activeGame !== null}
            disabledReason="Prepare uma sessão primeiro."
            onClick={goLive}
            accent="purple"
          />

          {/* Analisar por vídeo */}
          <ActionCard
            icon={<Video className="h-5 w-5" />}
            title="Analisar por vídeo"
            description="Criar sequências completas diretamente pelo vídeo."
            enabled={activeGame !== null}
            disabledReason="Prepare uma sessão primeiro."
            onClick={goVideo}
            accent="purple"
          />

          {/* Continuar revisão */}
          <ActionCard
            icon={<RotateCcw className="h-5 w-5" />}
            title="Continuar revisão"
            description="Completar entradas pendentes e validar dados."
            enabled={activeGame !== null && pendingCount > 0}
            disabledReason={activeGame === null ? 'Prepare uma sessão primeiro.' : 'Sem entradas pendentes.'}
            onClick={goReview}
            accent="yellow"
          />

          {/* Relatórios e feedbacks */}
          <ActionCard
            icon={<BarChart2 className="h-5 w-5" />}
            title="Relatórios"
            description="Ver padrões e prioridades de treino."
            enabled
            onClick={() => navigate('/scout/report')}
            accent="blue"
          />

          <ActionCard
            icon={<MessageSquare className="h-5 w-5" />}
            title="Feedbacks"
            description="Ver e registrar devolutivas para atletas e setores."
            enabled
            onClick={() => navigate('/scout/feedback')}
            accent="blue"
          />
        </div>

        {/* Sessões anteriores (finalizadas) */}
        {games.filter((g) => g.status === 'finalizado').length > 0 && (
          <section>
            <h2 className="text-xs font-medium uppercase tracking-widest text-cep-muted mb-3">
              Sessões anteriores
            </h2>
            <div className="space-y-2">
              {games
                .filter((g) => g.status === 'finalizado')
                .slice(0, 5)
                .map((g) => (
                  <button
                    key={g.id}
                    onClick={() => navigate(`/scout/validate/${g.id}`)}
                    className="w-full flex items-center justify-between rounded-xl border border-cep-purple-800 bg-cep-purple-950/40 px-4 py-3 text-left hover:border-cep-purple-600 transition-colors"
                  >
                    <div>
                      <span className="text-sm font-medium text-cep-white">
                        {g.opponent ?? 'Sem adversária'}
                      </span>
                      {g.gameDate && (
                        <span className="ml-2 text-xs text-cep-muted">{g.gameDate}</span>
                      )}
                    </div>
                    <Film className="h-4 w-4 text-cep-muted" />
                  </button>
                ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

type AccentColor = 'lime' | 'purple' | 'yellow' | 'blue'

const ACCENT_ENABLED: Record<AccentColor, string> = {
  lime: 'border-cep-lime-400/40 bg-cep-lime-400/5 hover:bg-cep-lime-400/10 hover:border-cep-lime-400/60',
  purple: 'border-cep-purple-600 bg-cep-purple-900/60 hover:bg-cep-purple-800/60 hover:border-cep-purple-400',
  yellow: 'border-yellow-600/40 bg-yellow-950/20 hover:bg-yellow-950/40 hover:border-yellow-500/60',
  blue: 'border-blue-700/40 bg-blue-950/20 hover:bg-blue-950/40 hover:border-blue-500/60',
}
const ACCENT_ICON: Record<AccentColor, string> = {
  lime: 'text-cep-lime-400',
  purple: 'text-cep-purple-300',
  yellow: 'text-yellow-400',
  blue: 'text-blue-400',
}

function ActionCard({
  icon,
  title,
  description,
  enabled,
  disabledReason,
  onClick,
  accent,
}: {
  icon: React.ReactNode
  title: string
  description: string
  enabled: boolean
  disabledReason?: string
  onClick: () => void
  accent: AccentColor
}) {
  return (
    <button
      onClick={enabled ? onClick : undefined}
      disabled={!enabled}
      title={!enabled && disabledReason ? disabledReason : undefined}
      className={[
        'w-full rounded-2xl border p-5 text-left transition-all',
        enabled
          ? `cursor-pointer ${ACCENT_ENABLED[accent]}`
          : 'cursor-not-allowed border-cep-purple-800/40 bg-cep-purple-950/20 opacity-50',
      ].join(' ')}
    >
      <div className={`mb-2 ${enabled ? ACCENT_ICON[accent] : 'text-cep-muted'}`}>{icon}</div>
      <p className="text-sm font-semibold text-cep-white">{title}</p>
      <p className="mt-1 text-xs text-cep-muted">
        {!enabled && disabledReason ? disabledReason : description}
      </p>
    </button>
  )
}

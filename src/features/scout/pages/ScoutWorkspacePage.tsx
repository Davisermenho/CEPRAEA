import { useEffect, useMemo, useState } from 'react'
import { Plus, Radar, Save, Swords, Target } from 'lucide-react'
import { Button } from '@/shared/components/Button'
import { EmptyState } from '@/shared/components/EmptyState'
import { useAthleteStore } from '@/stores/athleteStore'
import {
  createScoutGame,
  fetchScoutCodebook,
  fetchScoutGames,
  fetchScoutPlaysForGame,
  getScoutPlayBundle,
  upsertScoutPlayBundle,
} from '@/features/scout/scoutApi'
import type {
  ScoutCodeList,
  ScoutCodeValue,
  ScoutGameRecord,
  ScoutPlayBundle,
  ScoutPlayBundleUpsertInput,
  ScoutPlayListItem,
  ScoutPlayParticipationWriteInput,
  ScoutPlayWriteInput,
} from '@/types'

const CODEBOOK_KEYS = [
  'LISTA_FASES',
  'LISTA_SISTEMA_OFENSIVO',
  'LISTA_CONFIGURACAO_OFENSIVA',
  'LISTA_SISTEMA_DEFENSIVO',
  'LISTA_ACAO_OFENSIVA',
  'LISTA_ACAO_DEFENSIVA',
  'LISTA_RESULTADO_FACTUAL',
  'LISTA_CAUSA_PRINCIPAL',
  'LISTA_PRIORIDADE_TREINO',
] as const

type ParticipationDraft = ScoutPlayParticipationWriteInput & {
  draftId: string
}

function buildParticipation(slotOrder: number): ParticipationDraft {
  return {
    draftId: `p-${slotOrder}-${crypto.randomUUID()}`,
    participantScope: 'ATQ',
    participantSide: 'ANALYZED',
    slotOrder,
    phaseOfAthlete: 'AT_POS',
    participationRole: '',
    athleteId: undefined,
    externalAthleteLabel: undefined,
    positionCode: undefined,
    specialFunctionCode: undefined,
    actionCode: undefined,
    individualResult: undefined,
    mainCause: undefined,
    trainingPriority: undefined,
  }
}

function buildPlay(game?: ScoutGameRecord): ScoutPlayWriteInput {
  return {
    playCode: '',
    sessionDate: game?.gameDate ?? new Date().toISOString().slice(0, 10),
    sessionType: 'JOGO',
    opponentName: game?.opponent,
    period: 'SET_1',
    gameClock: '00:00',
    source: 'VIDEO',
    phaseOfBall: 'AT_POS',
    attackingTeamSide: 'ANALYZED',
    defendingTeamSide: 'OPPONENT',
    offensiveSystem: undefined,
    offensiveConfiguration: undefined,
    defensiveSystem: undefined,
    factualResult: 'GOL',
    mainCause: undefined,
    freeNotes: undefined,
  }
}

function mapBundleToDraft(bundle: ScoutPlayBundle): { play: ScoutPlayWriteInput; participations: ParticipationDraft[] } {
  return {
    play: {
      id: bundle.play.id,
      playCode: bundle.play.playCode,
      sessionDate: bundle.play.sessionDate,
      sessionType: bundle.play.sessionType,
      opponentName: bundle.play.opponentName,
      period: bundle.play.period,
      gameClock: bundle.play.gameClock,
      source: bundle.play.source,
      phaseOfBall: bundle.play.phaseOfBall,
      attackingTeamSide: bundle.play.attackingTeamSide,
      defendingTeamSide: bundle.play.defendingTeamSide,
      analyzedTeamPhase: bundle.play.analyzedTeamPhase,
      offensiveSystem: bundle.play.offensiveSystem,
      offensiveConfiguration: bundle.play.offensiveConfiguration,
      specialOffensiveRole: bundle.play.specialOffensiveRole,
      temporaryPivotOccupation: bundle.play.temporaryPivotOccupation,
      temporaryPivotAthleteId: bundle.play.temporaryPivotAthleteId,
      temporaryPivotResult: bundle.play.temporaryPivotResult,
      defensiveSystem: bundle.play.defensiveSystem,
      expectedDefensiveAction: bundle.play.expectedDefensiveAction,
      defensiveConnection: bundle.play.defensiveConnection,
      defensiveAdjustment: bundle.play.defensiveAdjustment,
      mainOffensiveThreat: bundle.play.mainOffensiveThreat,
      defensiveAdjustmentResult: bundle.play.defensiveAdjustmentResult,
      finishType: bundle.play.finishType,
      shotDestination: bundle.play.shotDestination,
      shotRegion: bundle.play.shotRegion,
      factualResult: bundle.play.factualResult,
      playPoints: bundle.play.playPoints,
      playScoreReason: bundle.play.playScoreReason,
      mainCause: bundle.play.mainCause,
      videoRef: bundle.play.videoRef,
      freeNotes: bundle.play.freeNotes,
    },
    participations: bundle.participations.map((item) => ({
      draftId: `p-${item.id}`,
      participantScope: item.participantScope,
      participantSide: item.participantSide,
      slotOrder: item.slotOrder,
      athleteId: item.athleteId,
      externalAthleteLabel: item.externalAthleteLabel,
      phaseOfAthlete: item.phaseOfAthlete,
      participationRole: item.participationRole,
      positionCode: item.positionCode,
      specialFunctionCode: item.specialFunctionCode,
      actionCode: item.actionCode,
      individualResult: item.individualResult,
      mainCause: item.mainCause,
      trainingPriority: item.trainingPriority,
    })),
  }
}

function toOptional(value: string): string | undefined {
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder = 'Selecione',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: ScoutCodeValue[] | Array<{ code: string; label: string }>
  placeholder?: string
}) {
  return (
    <label className="space-y-1">
      <span className="block text-xs font-medium text-cep-muted">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-xl border border-cep-purple-700 bg-cep-purple-900 px-3 text-sm text-cep-white focus:outline-none focus:ring-2 focus:ring-cep-lime-400"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.code} value={option.code}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <label className="space-y-1">
      <span className="block text-xs font-medium text-cep-muted">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-cep-purple-700 bg-cep-purple-900 px-3 text-sm text-cep-white placeholder:text-cep-muted focus:outline-none focus:ring-2 focus:ring-cep-lime-400"
      />
    </label>
  )
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <label className="space-y-1">
      <span className="block text-xs font-medium text-cep-muted">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full rounded-xl border border-cep-purple-700 bg-cep-purple-900 px-3 py-2 text-sm text-cep-white placeholder:text-cep-muted focus:outline-none focus:ring-2 focus:ring-cep-lime-400"
      />
    </label>
  )
}

export default function ScoutWorkspacePage() {
  const athletes = useAthleteStore((state) => state.athletes)
  const activeAthletes = useMemo(() => athletes.filter((athlete) => athlete.status === 'ativo'), [athletes])

  const [games, setGames] = useState<ScoutGameRecord[]>([])
  const [plays, setPlays] = useState<ScoutPlayListItem[]>([])
  const [codebook, setCodebook] = useState<ScoutCodeList[]>([])
  const [selectedGameId, setSelectedGameId] = useState('')
  const [selectedPlayId, setSelectedPlayId] = useState('')
  const [gameDate, setGameDate] = useState(new Date().toISOString().slice(0, 10))
  const [gameOpponent, setGameOpponent] = useState('')
  const [gameAnalyzedTeam, setGameAnalyzedTeam] = useState('CEPRAEA')
  const [gameLocation, setGameLocation] = useState('')
  const [gameNotes, setGameNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [savingGame, setSavingGame] = useState(false)
  const [savingPlay, setSavingPlay] = useState(false)
  const [loadingPlay, setLoadingPlay] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState('')
  const [playDraft, setPlayDraft] = useState<ScoutPlayWriteInput>(buildPlay())
  const [participations, setParticipations] = useState<ParticipationDraft[]>([buildParticipation(1)])

  const codebookMap = useMemo(
    () => new Map(codebook.map((list) => [list.listKey, list.values])),
    [codebook],
  )

  const phaseOptions = codebookMap.get('LISTA_FASES') ?? []
  const offensiveSystemOptions = codebookMap.get('LISTA_SISTEMA_OFENSIVO') ?? []
  const offensiveConfigurationOptions = codebookMap.get('LISTA_CONFIGURACAO_OFENSIVA') ?? []
  const defensiveSystemOptions = codebookMap.get('LISTA_SISTEMA_DEFENSIVO') ?? []
  const factualResultOptions = codebookMap.get('LISTA_RESULTADO_FACTUAL') ?? []
  const mainCauseOptions = codebookMap.get('LISTA_CAUSA_PRINCIPAL') ?? []
  const trainingPriorityOptions = codebookMap.get('LISTA_PRIORIDADE_TREINO') ?? []
  const offenseActionOptions = codebookMap.get('LISTA_ACAO_OFENSIVA') ?? []
  const defenseActionOptions = codebookMap.get('LISTA_ACAO_DEFENSIVA') ?? []

  useEffect(() => {
    let active = true

    async function loadInitialState() {
      setLoading(true)
      setError('')
      try {
        const [loadedGames, loadedCodebook] = await Promise.all([
          fetchScoutGames(),
          fetchScoutCodebook([...CODEBOOK_KEYS]),
        ])

        if (!active) return

        setGames(loadedGames)
        setCodebook(loadedCodebook)

        if (loadedGames[0]) {
          setSelectedGameId(loadedGames[0].id)
          setPlayDraft(buildPlay(loadedGames[0]))
        }
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Erro ao carregar scout.')
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadInitialState()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!selectedGameId) {
      setPlays([])
      return
    }

    const selectedGame = games.find((game) => game.id === selectedGameId)
    if (selectedGame && !selectedPlayId) {
      setPlayDraft((current) => ({
        ...buildPlay(selectedGame),
        playCode: current.playCode,
        gameClock: current.gameClock,
      }))
    }

    let active = true
    async function loadPlays() {
      try {
        const loadedPlays = await fetchScoutPlaysForGame(selectedGameId)
        if (!active) return
        setPlays(loadedPlays)
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Erro ao carregar jogadas do scout.')
      }
    }

    void loadPlays()
    return () => {
      active = false
    }
  }, [games, selectedGameId, selectedPlayId])

  function resetPlayDraft(game?: ScoutGameRecord) {
    setSelectedPlayId('')
    setPlayDraft(buildPlay(game))
    setParticipations([buildParticipation(1)])
    setError('')
    setFeedback('')
  }

  async function handleCreateGame() {
    setSavingGame(true)
    setError('')
    setFeedback('')
    try {
      const created = await createScoutGame({
        gameDate: toOptional(gameDate),
        analyzedTeam: toOptional(gameAnalyzedTeam),
        opponent: toOptional(gameOpponent),
        location: toOptional(gameLocation),
        notes: toOptional(gameNotes),
        status: 'em_andamento',
      })

      setGames((current) => [created, ...current])
      setSelectedGameId(created.id)
      setGameOpponent('')
      setGameLocation('')
      setGameNotes('')
      resetPlayDraft(created)
      setFeedback('Jogo de scout criado e pronto para receber jogadas.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar jogo do scout.')
    } finally {
      setSavingGame(false)
    }
  }

  async function handleLoadPlay(playId: string) {
    setLoadingPlay(true)
    setError('')
    setFeedback('')
    try {
      const bundle = await getScoutPlayBundle(playId)
      const next = mapBundleToDraft(bundle)
      setSelectedPlayId(playId)
      setPlayDraft(next.play)
      setParticipations(next.participations.length > 0 ? next.participations : [buildParticipation(1)])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar jogada.')
    } finally {
      setLoadingPlay(false)
    }
  }

  function updateParticipation(draftId: string, patch: Partial<ParticipationDraft>) {
    setParticipations((current) =>
      current.map((item) => {
        if (item.draftId !== draftId) return item

        const next = { ...item, ...patch }
        if (patch.participantScope && patch.participantScope !== item.participantScope) {
          next.actionCode = undefined
        }
        if (patch.athleteId) {
          next.externalAthleteLabel = undefined
        }
        return next
      }),
    )
  }

  function addParticipation() {
    setParticipations((current) => [...current, buildParticipation(current.length + 1)])
  }

  function removeParticipation(draftId: string) {
    setParticipations((current) => {
      const next = current.filter((item) => item.draftId !== draftId)
      return next.length > 0
        ? next.map((item, index) => ({ ...item, slotOrder: index + 1 }))
        : [buildParticipation(1)]
    })
  }

  async function handleSavePlay() {
    if (!selectedGameId) {
      setError('Crie ou selecione um jogo antes de salvar a jogada.')
      return
    }

    setSavingPlay(true)
    setError('')
    setFeedback('')
    try {
      const payload: ScoutPlayBundleUpsertInput = {
        scoutGameId: selectedGameId,
        play: playDraft,
        participations: participations.map(({ draftId: _draftId, ...item }) => ({
          ...item,
          participationRole: item.participationRole.trim(),
          positionCode: toOptional(item.positionCode ?? ''),
          specialFunctionCode: toOptional(item.specialFunctionCode ?? ''),
          externalAthleteLabel: item.athleteId ? undefined : toOptional(item.externalAthleteLabel ?? ''),
          mainCause: toOptional(item.mainCause ?? ''),
          trainingPriority: toOptional(item.trainingPriority ?? ''),
          actionCode: toOptional(item.actionCode ?? ''),
          phaseOfAthlete: toOptional(item.phaseOfAthlete ?? '') as ScoutPlayParticipationWriteInput['phaseOfAthlete'],
        })),
      }

      const savedBundle = await upsertScoutPlayBundle(payload)
      setSelectedPlayId(savedBundle.play.id)
      setPlayDraft(mapBundleToDraft(savedBundle).play)
      setParticipations(mapBundleToDraft(savedBundle).participations)
      setPlays(await fetchScoutPlaysForGame(selectedGameId))
      setFeedback('Jogada salva no scout novo com sucesso.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar jogada.')
    } finally {
      setSavingPlay(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-cep-purple-950 px-4 py-10">
        <div className="rounded-2xl border border-cep-purple-800 bg-cep-purple-900 px-6 py-4 text-sm text-cep-muted">
          Carregando scout v2…
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-cep-purple-950 pb-8">
      <div className="border-b border-cep-purple-800 bg-cep-purple-900 px-4 py-5">
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-cep-lime-400">Scout v2</p>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-cep-lime-400/15 p-3">
            <Radar className="h-6 w-6 text-cep-lime-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-cep-white">Workspace do Slice 1</h1>
            <p className="text-sm text-cep-muted">
              Jogo, jogada e participações salvas no contrato novo do scout.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-4 pt-4">
        {error && (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {feedback && (
          <div className="rounded-2xl border border-cep-lime-400/40 bg-cep-lime-400/10 px-4 py-3 text-sm text-cep-lime-400">
            {feedback}
          </div>
        )}

        <section className="rounded-3xl border border-cep-purple-800 bg-cep-purple-900/70 p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-cep-muted">1. Base do scout</p>
              <h2 className="text-lg font-bold text-cep-white">Criar jogo</h2>
            </div>
            <Button size="sm" onClick={handleCreateGame} loading={savingGame}>
              <Plus className="h-4 w-4" />
              Novo jogo
            </Button>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <TextField label="Data" type="date" value={gameDate} onChange={setGameDate} />
            <TextField label="Equipe analisada" value={gameAnalyzedTeam} onChange={setGameAnalyzedTeam} placeholder="CEPRAEA" />
            <TextField label="Adversária" value={gameOpponent} onChange={setGameOpponent} placeholder="Nome da equipe" />
            <TextField label="Local" value={gameLocation} onChange={setGameLocation} placeholder="Ginásio ou quadra" />
          </div>

          <div className="mt-3">
            <TextAreaField label="Notas do jogo" value={gameNotes} onChange={setGameNotes} placeholder="Contexto do jogo, série, observações." />
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
          <div className="rounded-3xl border border-cep-purple-800 bg-cep-purple-900/70 p-4">
            <div className="mb-4 flex items-center gap-2">
              <Swords className="h-4 w-4 text-cep-lime-400" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-cep-muted">2. Contexto</p>
                <h2 className="text-lg font-bold text-cep-white">Jogos e jogadas</h2>
              </div>
            </div>

            {games.length === 0 ? (
              <EmptyState
                icon={Radar}
                title="Nenhum jogo de scout"
                description="Crie o primeiro jogo acima para começar a registrar jogadas."
              />
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  {games.map((game) => (
                    <button
                      key={game.id}
                      type="button"
                      onClick={() => {
                        setSelectedGameId(game.id)
                        resetPlayDraft(game)
                      }}
                      className={`w-full rounded-2xl border px-3 py-3 text-left transition-colors ${
                        selectedGameId === game.id
                          ? 'border-cep-lime-400 bg-cep-purple-800'
                          : 'border-cep-purple-700 bg-cep-purple-950/40 hover:border-cep-purple-600'
                      }`}
                    >
                      <p className="text-sm font-bold text-cep-white">{game.opponent || 'Sem adversária'}</p>
                      <p className="text-xs text-cep-muted">
                        {game.gameDate || 'Sem data'} · {game.status}
                      </p>
                    </button>
                  ))}
                </div>

                {selectedGameId && (
                  <div className="rounded-2xl border border-cep-purple-700 bg-cep-purple-950/30 p-3">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-wide text-cep-muted">Jogadas do jogo</p>
                      <Button size="sm" variant="secondary" onClick={() => resetPlayDraft(games.find((game) => game.id === selectedGameId))}>
                        <Plus className="h-4 w-4" />
                        Nova
                      </Button>
                    </div>

                    {plays.length === 0 ? (
                      <p className="text-sm text-cep-muted">Nenhuma jogada registrada ainda.</p>
                    ) : (
                      <div className="space-y-2">
                        {plays.map((play) => (
                          <button
                            key={play.id}
                            type="button"
                            onClick={() => void handleLoadPlay(play.id)}
                            className={`w-full rounded-xl border px-3 py-2 text-left transition-colors ${
                              selectedPlayId === play.id
                                ? 'border-cep-lime-400 bg-cep-purple-800'
                                : 'border-cep-purple-700 bg-cep-purple-900 hover:border-cep-purple-600'
                            }`}
                          >
                            <p className="text-sm font-semibold text-cep-white">{play.playCode}</p>
                            <p className="text-xs text-cep-muted">
                              {play.period} · {play.gameClock} · {play.factualResult}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-cep-purple-800 bg-cep-purple-900/70 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-cep-muted">3. Bundle</p>
                <h2 className="text-lg font-bold text-cep-white">Jogada + participações</h2>
              </div>
              <Button onClick={() => void handleSavePlay()} loading={savingPlay || loadingPlay} disabled={!selectedGameId}>
                <Save className="h-4 w-4" />
                Salvar jogada
              </Button>
            </div>

            {!selectedGameId ? (
              <EmptyState
                icon={Target}
                title="Selecione um jogo"
                description="O editor do scout novo depende de um scout_game para salvar bundles."
              />
            ) : (
              <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <TextField label="Código da jogada" value={playDraft.playCode} onChange={(value) => setPlayDraft((current) => ({ ...current, playCode: value }))} placeholder="EX.: Q1-0001" />
                  <TextField label="Data da sessão" type="date" value={playDraft.sessionDate} onChange={(value) => setPlayDraft((current) => ({ ...current, sessionDate: value }))} />
                  <TextField label="Período" value={playDraft.period} onChange={(value) => setPlayDraft((current) => ({ ...current, period: value }))} placeholder="SET_1" />
                  <TextField label="Relógio" value={playDraft.gameClock} onChange={(value) => setPlayDraft((current) => ({ ...current, gameClock: value }))} placeholder="03:21" />
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <SelectField
                    label="Fase da bola"
                    value={playDraft.phaseOfBall}
                    onChange={(value) => setPlayDraft((current) => ({ ...current, phaseOfBall: value as ScoutPlayWriteInput['phaseOfBall'] }))}
                    options={phaseOptions}
                  />
                  <SelectField
                    label="Sistema ofensivo"
                    value={playDraft.offensiveSystem ?? ''}
                    onChange={(value) => setPlayDraft((current) => ({ ...current, offensiveSystem: toOptional(value) }))}
                    options={offensiveSystemOptions}
                  />
                  <SelectField
                    label="Configuração ofensiva"
                    value={playDraft.offensiveConfiguration ?? ''}
                    onChange={(value) => setPlayDraft((current) => ({ ...current, offensiveConfiguration: toOptional(value) }))}
                    options={offensiveConfigurationOptions}
                  />
                  <SelectField
                    label="Sistema defensivo"
                    value={playDraft.defensiveSystem ?? ''}
                    onChange={(value) => setPlayDraft((current) => ({ ...current, defensiveSystem: toOptional(value) }))}
                    options={defensiveSystemOptions}
                  />
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <SelectField
                    label="Resultado factual"
                    value={playDraft.factualResult}
                    onChange={(value) => setPlayDraft((current) => ({ ...current, factualResult: value }))}
                    options={factualResultOptions}
                  />
                  <SelectField
                    label="Causa principal"
                    value={playDraft.mainCause ?? ''}
                    onChange={(value) => setPlayDraft((current) => ({ ...current, mainCause: toOptional(value) }))}
                    options={mainCauseOptions}
                  />
                  <SelectField
                    label="Lado atacando"
                    value={playDraft.attackingTeamSide}
                    onChange={(value) => setPlayDraft((current) => ({ ...current, attackingTeamSide: value as ScoutPlayWriteInput['attackingTeamSide'] }))}
                    options={[
                      { code: 'ANALYZED', label: 'ANALYZED' },
                      { code: 'OPPONENT', label: 'OPPONENT' },
                    ]}
                  />
                  <SelectField
                    label="Lado defendendo"
                    value={playDraft.defendingTeamSide}
                    onChange={(value) => setPlayDraft((current) => ({ ...current, defendingTeamSide: value as ScoutPlayWriteInput['defendingTeamSide'] }))}
                    options={[
                      { code: 'ANALYZED', label: 'ANALYZED' },
                      { code: 'OPPONENT', label: 'OPPONENT' },
                    ]}
                  />
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  <SelectField
                    label="Tipo da sessão"
                    value={playDraft.sessionType}
                    onChange={(value) => setPlayDraft((current) => ({ ...current, sessionType: value as ScoutPlayWriteInput['sessionType'] }))}
                    options={[
                      { code: 'JOGO', label: 'JOGO' },
                      { code: 'TREINO', label: 'TREINO' },
                      { code: 'AMISTOSO', label: 'AMISTOSO' },
                      { code: 'SIMULADO', label: 'SIMULADO' },
                    ]}
                  />
                  <SelectField
                    label="Fonte"
                    value={playDraft.source}
                    onChange={(value) => setPlayDraft((current) => ({ ...current, source: value as ScoutPlayWriteInput['source'] }))}
                    options={[
                      { code: 'VIDEO', label: 'VIDEO' },
                      { code: 'AO_VIVO', label: 'AO_VIVO' },
                      { code: 'MISTA', label: 'MISTA' },
                    ]}
                  />
                  <TextField
                    label="Adversária da jogada"
                    value={playDraft.opponentName ?? ''}
                    onChange={(value) => setPlayDraft((current) => ({ ...current, opponentName: toOptional(value) }))}
                    placeholder="Nome da equipe"
                  />
                </div>

                <TextAreaField
                  label="Notas da jogada"
                  value={playDraft.freeNotes ?? ''}
                  onChange={(value) => setPlayDraft((current) => ({ ...current, freeNotes: toOptional(value) }))}
                  placeholder="Contexto rápido da jogada, decisão-chave, marcador tático."
                />

                <div className="rounded-2xl border border-cep-purple-700 bg-cep-purple-950/30 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-cep-muted">Participações</p>
                      <h3 className="text-base font-bold text-cep-white">Ações por atleta ou slot externo</h3>
                    </div>
                    <Button size="sm" variant="secondary" onClick={addParticipation}>
                      <Plus className="h-4 w-4" />
                      Participação
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {participations.map((item, index) => {
                      const actionOptions = item.participantScope === 'DEF' ? defenseActionOptions : offenseActionOptions
                      return (
                        <div key={item.draftId} className="rounded-2xl border border-cep-purple-700 bg-cep-purple-900 p-3">
                          <div className="mb-3 flex items-center justify-between">
                            <p className="text-sm font-semibold text-cep-white">Participação #{index + 1}</p>
                            {participations.length > 1 && (
                              <Button size="sm" variant="ghost" onClick={() => removeParticipation(item.draftId)}>
                                Remover
                              </Button>
                            )}
                          </div>

                          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                            <SelectField
                              label="Escopo"
                              value={item.participantScope}
                              onChange={(value) => updateParticipation(item.draftId, { participantScope: value as ParticipationDraft['participantScope'] })}
                              options={[
                                { code: 'ATQ', label: 'ATQ' },
                                { code: 'DEF', label: 'DEF' },
                              ]}
                            />
                            <SelectField
                              label="Lado"
                              value={item.participantSide}
                              onChange={(value) => updateParticipation(item.draftId, { participantSide: value as ParticipationDraft['participantSide'] })}
                              options={[
                                { code: 'ANALYZED', label: 'ANALYZED' },
                                { code: 'OPPONENT', label: 'OPPONENT' },
                              ]}
                            />
                            <TextField
                              label="Slot"
                              type="number"
                              value={String(item.slotOrder)}
                              onChange={(value) => updateParticipation(item.draftId, { slotOrder: Number(value) || index + 1 })}
                            />
                            <TextField
                              label="Papel"
                              value={item.participationRole}
                              onChange={(value) => updateParticipation(item.draftId, { participationRole: value })}
                              placeholder="FINALIZADORA, APOIO…"
                            />
                          </div>

                          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                            <label className="space-y-1">
                              <span className="block text-xs font-medium text-cep-muted">Atleta vinculada</span>
                              <select
                                value={item.athleteId ?? ''}
                                onChange={(event) => updateParticipation(item.draftId, { athleteId: toOptional(event.target.value) })}
                                className="h-10 w-full rounded-xl border border-cep-purple-700 bg-cep-purple-900 px-3 text-sm text-cep-white focus:outline-none focus:ring-2 focus:ring-cep-lime-400"
                              >
                                <option value="">Sem vínculo</option>
                                {activeAthletes.map((athlete) => (
                                  <option key={athlete.id} value={athlete.id}>
                                    {athlete.nome}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <TextField
                              label="Label externa"
                              value={item.externalAthleteLabel ?? ''}
                              onChange={(value) => updateParticipation(item.draftId, { externalAthleteLabel: value })}
                              placeholder="Adversária 7"
                            />
                            <SelectField
                              label="Fase da atleta"
                              value={item.phaseOfAthlete ?? ''}
                              onChange={(value) => updateParticipation(item.draftId, { phaseOfAthlete: toOptional(value) as ParticipationDraft['phaseOfAthlete'] })}
                              options={phaseOptions}
                            />
                            <TextField
                              label="Posição"
                              value={item.positionCode ?? ''}
                              onChange={(value) => updateParticipation(item.draftId, { positionCode: value })}
                              placeholder="LE, CE, DEF_BASE"
                            />
                          </div>

                          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                            <SelectField
                              label="Ação"
                              value={item.actionCode ?? ''}
                              onChange={(value) => updateParticipation(item.draftId, { actionCode: toOptional(value) })}
                              options={actionOptions}
                            />
                            <SelectField
                              label="Causa"
                              value={item.mainCause ?? ''}
                              onChange={(value) => updateParticipation(item.draftId, { mainCause: toOptional(value) })}
                              options={mainCauseOptions}
                            />
                            <SelectField
                              label="Prioridade de treino"
                              value={item.trainingPriority ?? ''}
                              onChange={(value) => updateParticipation(item.draftId, { trainingPriority: toOptional(value) })}
                              options={trainingPriorityOptions}
                            />
                            <TextField
                              label="Função especial"
                              value={item.specialFunctionCode ?? ''}
                              onChange={(value) => updateParticipation(item.draftId, { specialFunctionCode: value })}
                              placeholder="Opcional"
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

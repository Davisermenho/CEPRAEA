import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, CircleDot, ClipboardCheck, Film } from 'lucide-react'
import { Button } from '@/shared/components/Button'
import {
  createScoutMentalEvent,
  fetchScoutAthletes,
  fetchScoutCodebook,
  fetchScoutGames,
  fetchScoutLiveEntriesForGame,
  updateScoutLiveEntry,
  upsertScoutPlayBundle,
} from '@/features/scout/scoutApi'
import type {
  AthleteWithScoutProfile,
  ScoutCodeList,
  ScoutGameRecord,
  ScoutLiveEntry,
  ScoutMentalEventWriteInput,
  ScoutParticipantScope,
  ScoutPhaseCode,
  ScoutPlayParticipationWriteInput,
  ScoutTeamSide,
} from '@/types'

// ── Codebook keys ───────────────────────────────────────────────────────────
const CODEBOOK_KEYS = [
  'LISTA_SISTEMA_OFENSIVO',
  'LISTA_CONFIGURACAO_OFENSIVA',
  'LISTA_SISTEMA_DEFENSIVO',
  'LISTA_ACAO_DEFENSIVA',
  'LISTA_TIPO_FINALIZACAO',
  'LISTA_RESULTADO_FACTUAL',
  'LISTA_MOTIVO_PONTUACAO',
  'LISTA_CAUSA_PRINCIPAL',
  // TRANS_OF
  'LISTA_FORM_TRANS_OF',
  'LISTA_OBJETIVO_FORM_TRANS_OF',
  'LISTA_ACAO_PRINCIPAL_TRANS_OF',
  'LISTA_STATUS_ESTABILIZACAO_AT_POS',
  'LISTA_MOTIVO_FIM_TRANS_OF',
  // TRANS_DEF
  'LISTA_FORM_TRANS_DEF',
  'LISTA_OBJETIVO_FORM_TRANS_DEF',
  'LISTA_ACAO_PRINCIPAL_TRANS_DEF',
  'LISTA_REORGANIZACAO_DEF',
  'LISTA_STATUS_ESTABILIZACAO_DEF_POS',
  'LISTA_MOTIVO_FIM_TRANS_DEF',
  // SHOOTOUT
  'LISTA_CONTEXTO_ESPECIAL',
  'LISTA_SHOOTOUT',
  'LISTA_SHOOTOUT_RESULTADO',
  'LISTA_SHOOTOUT_DECISAO',
  'LISTA_SHOOTOUT_EXECUCAO',
  // OUT (fix UI-15)
  'LISTA_OUT_SITUACAO',
  'LISTA_CAUSA_OUT',
  // BOLA PARADA (UI-16)
  'LISTA_6M',
  'LISTA_TIRO_LIVRE',
  'LISTA_REPOSICAO_LATERAL',
  'LISTA_REPOSICAO_GOLEIRA',
  'LISTA_REPOSICAO_APOS_GOL',
  'LISTA_GOLDEN_GOAL',
  // EVENTOS MENTAIS (UI-18)
  'LISTA_CODIGO_MENTAL',
  'LISTA_MARCA_MENTAL',
  // BLOCO MENTAL DETALHADO (UI-25)
  'LISTA_COMUNICACAO_MOMENTO_CRITICO',
  'LISTA_LINGUAGEM_CORPORAL',
  'LISTA_EVENTO_MENTAL_GATILHO',
  'LISTA_QUALIDADE_RESET_MENTAL',
] as const

// ── Draft type ───────────────────────────────────────────────────────────────
type ReviewDraft = {
  playCode: string
  period: string
  gameClock: string
  sessionType: string
  source: string
  phaseOfBall: ScoutPhaseCode
  analyzedTeamPhase: string
  offensiveSystem: string
  offensiveConfiguration: string
  defensiveSystem: string
  defensiveConnection: string
  defensiveAdjustment: string
  defensiveAdjustmentResult: string
  mainOffensiveThreat: string
  formTransOf: string
  objetivoFormTransOf: string
  acaoPrincipalTransOf: string
  statusEstabilizacaoAtPos: string
  motivoFimTransOf: string
  expectedDefensiveAction: string
  formTransDef: string
  objetivoFormTransDef: string
  acaoPrincipalTransDef: string
  reorganizacaoDef: string
  statusEstabilizacaoDefPos: string
  motivoFimTransDef: string
  specialContext: string
  shootoutTipo: string
  shootoutResultado: string
  shootoutDecisao: string
  shootoutExecucao: string
  tiro6mResult: string
  tiroLivreResult: string
  reposicaoLateralResult: string
  reposicaoGoleiraResult: string
  reposicaoAposGolResult: string
  goldenGoalSituation: string
  finishType: string
  shotDestination: string
  shotRegion: string
  factualResult: string
  playPoints: string
  playScoreReason: string
  mainCause: string
  videoRef: string
  freeNotes: string
  outSituation: string
  numericalStructureReal: string
  outCause: string
}

// ── Participation slot type ─────────────────────────────────────────────────
type AthleteSlot = { athleteId: string; externalLabel: string; phaseOfAthlete: string }
const EMPTY_SLOT: AthleteSlot = { athleteId: '', externalLabel: '', phaseOfAthlete: '' }

// ── Mental event draft (UI-18) ────────────────────────────────────────────────
type MentalEventDraft = {
  mentalCode: string
  mentalMark: string
  athleteId: string
  externalAthleteLabel: string
  mentalObservation: string
  criticalCommunication: string
  bodyLanguage: string
}
const EMPTY_MENTAL: MentalEventDraft = {
  mentalCode: '',
  mentalMark: '',
  athleteId: '',
  externalAthleteLabel: '',
  mentalObservation: '',
  criticalCommunication: '',
  bodyLanguage: '',
}

// ── Derive attacking/defending sides from phase ──────────────────────────────
function deriveTeamSides(phase: ScoutPhaseCode): {
  attackingTeamSide: ScoutTeamSide
  defendingTeamSide: ScoutTeamSide
} {
  if (phase === 'AT_POS' || phase === 'TRANS_OF') {
    return { attackingTeamSide: 'ANALYZED', defendingTeamSide: 'OPPONENT' }
  }
  return { attackingTeamSide: 'OPPONENT', defendingTeamSide: 'ANALYZED' }
}

// ── Build draft from a live entry ────────────────────────────────────────────
function buildDraftFromEntry(entry: ScoutLiveEntry): ReviewDraft {
  return {
    playCode: entry.idJogada.replace(/^LIVE-/, 'PLAY-'),
    period: '1',
    gameClock: entry.tempoJogo,
    sessionType: 'JOGO',
    source: 'MISTA',
    phaseOfBall: entry.faseDaBolaCode,
    analyzedTeamPhase: entry.faseEquipeAnalisadaCode,
    offensiveSystem: entry.sistemaOfensivoCode ?? '',
    offensiveConfiguration: '',
    defensiveSystem: entry.sistemaDefensivoCode ?? '',
    defensiveConnection: '',
    defensiveAdjustment: '',
    defensiveAdjustmentResult: '',
    mainOffensiveThreat: '',
    formTransOf: '',
    objetivoFormTransOf: '',
    acaoPrincipalTransOf: '',
    statusEstabilizacaoAtPos: '',
    motivoFimTransOf: '',
    expectedDefensiveAction: '',
    formTransDef: '',
    objetivoFormTransDef: '',
    acaoPrincipalTransDef: '',
    reorganizacaoDef: '',
    statusEstabilizacaoDefPos: '',
    motivoFimTransDef: '',
    specialContext: '',
    shootoutTipo: '',
    shootoutResultado: '',
    shootoutDecisao: '',
    shootoutExecucao: '',
    tiro6mResult: '',
    tiroLivreResult: '',
    reposicaoLateralResult: '',
    reposicaoGoleiraResult: '',
    reposicaoAposGolResult: '',
    goldenGoalSituation: '',
    finishType: entry.tipoFinalizacaoCode ?? '',
    shotDestination: '',
    shotRegion: '',
    factualResult: entry.resultadoFactualCode,
    playPoints: entry.pontosJogada !== undefined ? String(entry.pontosJogada) : '',
    playScoreReason: entry.motivoPontuacaoCode ?? '',
    mainCause: entry.causaProvavelCode ?? '',
    videoRef: entry.videoRef ?? '',
    freeNotes: entry.obsGeral ?? '',
    outSituation: '',
    numericalStructureReal: '',
    outCause: '',
  }
}

// ── Build empty draft for direct video analysis (no live entry) ──────────────
function buildEmptyDraft(playNumber: number): ReviewDraft {
  return {
    playCode: `VIDEO-${String(playNumber).padStart(4, '0')}`,
    period: '1',
    gameClock: '00:00',
    sessionType: 'JOGO',
    source: 'VIDEO',
    phaseOfBall: 'AT_POS',
    analyzedTeamPhase: 'ATAQUE',
    offensiveSystem: '',
    offensiveConfiguration: '',
    defensiveSystem: '',
    defensiveConnection: '',
    defensiveAdjustment: '',
    defensiveAdjustmentResult: '',
    mainOffensiveThreat: '',
    formTransOf: '',
    objetivoFormTransOf: '',
    acaoPrincipalTransOf: '',
    statusEstabilizacaoAtPos: '',
    motivoFimTransOf: '',
    expectedDefensiveAction: '',
    formTransDef: '',
    objetivoFormTransDef: '',
    acaoPrincipalTransDef: '',
    reorganizacaoDef: '',
    statusEstabilizacaoDefPos: '',
    motivoFimTransDef: '',
    specialContext: '',
    shootoutTipo: '',
    shootoutResultado: '',
    shootoutDecisao: '',
    shootoutExecucao: '',
    tiro6mResult: '',
    tiroLivreResult: '',
    reposicaoLateralResult: '',
    reposicaoGoleiraResult: '',
    reposicaoAposGolResult: '',
    goldenGoalSituation: '',
    finishType: '',
    shotDestination: '',
    shotRegion: '',
    factualResult: '',
    playPoints: '',
    playScoreReason: '',
    mainCause: '',
    videoRef: '',
    freeNotes: '',
    outSituation: '',
    numericalStructureReal: '',
    outCause: '',
  }
}

// ── Phase labels ─────────────────────────────────────────────────────────────
const PHASE_LABELS: Record<ScoutPhaseCode, string> = {
  AT_POS: 'Ataque Posicionado',
  DEF_POS: 'Defesa Posicionada',
  TRANS_OF: 'Transição Ofensiva',
  TRANS_DEF: 'Transição Defensiva',
}

// ── Component ────────────────────────────────────────────────────────────────
export default function ScoutVideoReviewPage() {
  const { gameId } = useParams<{ gameId: string }>()
  const navigate = useNavigate()

  const [game, setGame] = useState<ScoutGameRecord | null>(null)
  const [liveEntries, setLiveEntries] = useState<ScoutLiveEntry[]>([])
  const [codebook, setCodebook] = useState<ScoutCodeList[]>([])
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null)
  const [draft, setDraft] = useState<ReviewDraft | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [fetchError, setFetchError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [athletes, setAthletes] = useState<AthleteWithScoutProfile[]>([])
  const [attackerSlots, setAttackerSlots] = useState<AthleteSlot[]>([
    EMPTY_SLOT, EMPTY_SLOT, EMPTY_SLOT, EMPTY_SLOT,
  ])
  const [defenderSlots, setDefenderSlots] = useState<AthleteSlot[]>([
    EMPTY_SLOT, EMPTY_SLOT, EMPTY_SLOT,
  ])
  const [goalkeeperSlot, setGoalkeeperSlot] = useState<AthleteSlot>(EMPTY_SLOT)
  const [mentalEvents, setMentalEvents] = useState<MentalEventDraft[]>([])

  // ── Load ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!gameId) return
    setLoading(true)
    Promise.all([
      fetchScoutGames(),
      fetchScoutLiveEntriesForGame(gameId),
      fetchScoutCodebook([...CODEBOOK_KEYS]),
      fetchScoutAthletes(),
    ])
      .then(([games, entries, cb, athletesList]) => {
        setGame(games.find((g) => g.id === gameId) ?? null)
        setLiveEntries(entries)
        setCodebook(cb)
        setAthletes(athletesList)
      })
      .catch((err: unknown) => setFetchError((err as Error).message))
      .finally(() => setLoading(false))
  }, [gameId])

  const codebookMap = useMemo(
    () => new Map(codebook.map((list) => [list.listKey, list.values])),
    [codebook],
  )

  // ── Entries already linked to a scout play ──────────────────────────────
  const reviewedEntryIds = useMemo(
    () => new Set(liveEntries.filter((e) => e.derivedScoutPlayId).map((e) => e.id)),
    [liveEntries],
  )

  const reviewedCount = reviewedEntryIds.size

  // ── Select entry → populate draft ──────────────────────────────────────
  function selectEntry(entry: ScoutLiveEntry) {
    setSelectedEntryId(entry.id)
    setDraft(buildDraftFromEntry(entry))
    setAttackerSlots([EMPTY_SLOT, EMPTY_SLOT, EMPTY_SLOT, EMPTY_SLOT])
    setDefenderSlots([EMPTY_SLOT, EMPTY_SLOT, EMPTY_SLOT])
    setGoalkeeperSlot(EMPTY_SLOT)
    setMentalEvents([])
    setFeedback('')
    setSubmitError('')
  }

  // ── Partial state update helper ─────────────────────────────────────────
  function setField<K extends keyof ReviewDraft>(key: K, value: ReviewDraft[K]) {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev))
  }

  // ── Submit ──────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!draft || !gameId || !game) return

    const { attackingTeamSide, defendingTeamSide } = deriveTeamSides(draft.phaseOfBall)
    setSaving(true)
    setSubmitError('')
    setFeedback('')

    try {
      const participations: ScoutPlayParticipationWriteInput[] = [
        ...attackerSlots
          .map((slot, idx) =>
            slot.athleteId || slot.externalLabel
              ? ({
                  participantScope: 'ATQ' as ScoutParticipantScope,
                  participantSide: attackingTeamSide,
                  slotOrder: idx + 1,
                  athleteId:
                    slot.athleteId && slot.athleteId !== 'EXTERNO'
                      ? slot.athleteId
                      : undefined,
                  externalAthleteLabel:
                    slot.athleteId === 'EXTERNO' && slot.externalLabel
                      ? slot.externalLabel
                      : undefined,
                  participationRole: 'ATACANTE',
                  phaseOfAthlete: slot.phaseOfAthlete ? (slot.phaseOfAthlete as ScoutPhaseCode) : undefined,
                } as ScoutPlayParticipationWriteInput)
              : null,
          )
          .filter((p): p is ScoutPlayParticipationWriteInput => p !== null),
        ...defenderSlots
          .map((slot, idx) =>
            slot.athleteId || slot.externalLabel
              ? ({
                  participantScope: 'DEF' as ScoutParticipantScope,
                  participantSide: defendingTeamSide,
                  slotOrder: idx + 1,
                  athleteId:
                    slot.athleteId && slot.athleteId !== 'EXTERNO'
                      ? slot.athleteId
                      : undefined,
                  externalAthleteLabel:
                    slot.athleteId === 'EXTERNO' && slot.externalLabel
                      ? slot.externalLabel
                      : undefined,
                  participationRole: 'DEFENSORA',
                  phaseOfAthlete: slot.phaseOfAthlete ? (slot.phaseOfAthlete as ScoutPhaseCode) : undefined,
                } as ScoutPlayParticipationWriteInput)
              : null,
          )
          .filter((p): p is ScoutPlayParticipationWriteInput => p !== null),
        ...((draft.phaseOfBall === 'DEF_POS' || draft.phaseOfBall === 'TRANS_OF') &&
        (goalkeeperSlot.athleteId || goalkeeperSlot.externalLabel)
          ? [
              {
                participantScope: 'DEF' as ScoutParticipantScope,
                participantSide: defendingTeamSide,
                slotOrder: 1,
                athleteId:
                  goalkeeperSlot.athleteId && goalkeeperSlot.athleteId !== 'EXTERNO'
                    ? goalkeeperSlot.athleteId
                    : undefined,
                externalAthleteLabel:
                  goalkeeperSlot.athleteId === 'EXTERNO' && goalkeeperSlot.externalLabel
                    ? goalkeeperSlot.externalLabel
                    : undefined,
                participationRole: 'GOLEIRA',
                phaseOfAthlete: goalkeeperSlot.phaseOfAthlete ? (goalkeeperSlot.phaseOfAthlete as ScoutPhaseCode) : undefined,
              } as ScoutPlayParticipationWriteInput,
            ]
          : []),
      ]

      const bundle = await upsertScoutPlayBundle({
        scoutGameId: gameId,
        participations: participations.length > 0 ? participations : undefined,
        play: {
          playCode: draft.playCode,
          sessionDate: game.gameDate ?? new Date().toISOString().slice(0, 10),
          sessionType: draft.sessionType as 'JOGO' | 'TREINO' | 'AMISTOSO' | 'SIMULADO',
          opponentName: game.opponent,
          period: draft.period,
          gameClock: draft.gameClock,
          source: draft.source as 'AO_VIVO' | 'VIDEO' | 'MISTA',
          phaseOfBall: draft.phaseOfBall,
          attackingTeamSide,
          defendingTeamSide,
          analyzedTeamPhase: draft.analyzedTeamPhase || undefined,
          offensiveSystem: draft.offensiveSystem || undefined,
          offensiveConfiguration: draft.offensiveConfiguration || undefined,
          defensiveSystem: draft.defensiveSystem || undefined,
          defensiveConnection: draft.defensiveConnection || undefined,
          defensiveAdjustment: draft.defensiveAdjustment || undefined,
          defensiveAdjustmentResult: draft.defensiveAdjustmentResult || undefined,
          mainOffensiveThreat: draft.mainOffensiveThreat || undefined,
          expectedDefensiveAction: draft.expectedDefensiveAction || undefined,
          finishType: draft.finishType || undefined,
          shotDestination: draft.shotDestination || undefined,
          shotRegion: draft.shotRegion || undefined,
          factualResult: draft.factualResult,
          playPoints: draft.playPoints || undefined,
          playScoreReason: draft.playScoreReason || undefined,
          mainCause: draft.mainCause || undefined,
          videoRef: draft.videoRef || undefined,
          freeNotes: draft.freeNotes || undefined,
          outSituation: draft.outSituation || undefined,
          numericalStructureReal: draft.numericalStructureReal || undefined,
          outCause: draft.outCause || undefined,
          specialContext: draft.specialContext || undefined,
          shootoutType: draft.shootoutTipo || undefined,
          shootoutResult: draft.shootoutResultado || undefined,
          shootoutDecision: draft.shootoutDecisao || undefined,
          shootoutExecution: draft.shootoutExecucao || undefined,
          tiro6mResult: draft.tiro6mResult || undefined,
          tiroLivreResult: draft.tiroLivreResult || undefined,
          reposicaoLateralResult: draft.reposicaoLateralResult || undefined,
          reposicaoGoleiraResult: draft.reposicaoGoleiraResult || undefined,
          reposicaoAposGolResult: draft.reposicaoAposGolResult || undefined,
          goldenGoalSituation: draft.goldenGoalSituation || undefined,
        },
      })

      // Save mental events (UI-18)
      const validMentalEvents = mentalEvents.filter(
        (me) => me.mentalCode && me.mentalMark,
      )
      for (const me of validMentalEvents) {
        const input: ScoutMentalEventWriteInput = {
          scoutGameId: gameId,
          scoutPlayId: bundle.play.id,
          mentalCode: me.mentalCode,
          mentalMark: me.mentalMark,
          athleteId: me.athleteId && me.athleteId !== 'EXTERNO' ? me.athleteId : undefined,
          externalAthleteLabel:
            me.athleteId === 'EXTERNO' && me.externalAthleteLabel
              ? me.externalAthleteLabel
              : undefined,
          mentalObservation: me.mentalObservation || undefined,
          criticalCommunication: me.criticalCommunication || undefined,
          bodyLanguage: me.bodyLanguage || undefined,
        }
        await createScoutMentalEvent(input)
      }

      // Link live entry → scout play (only when reviewing an existing entry)
      if (selectedEntryId) {
        await updateScoutLiveEntry(selectedEntryId, {
          derivedScoutPlayId: bundle.play.id,
        })
      }

      // Refresh entries list
      const updated = await fetchScoutLiveEntriesForGame(gameId)
      setLiveEntries(updated)

      setFeedback(`Jogada ${bundle.play.playCode} salva com sucesso.`)
      setSelectedEntryId(null)
      setDraft(null)
    } catch (err: unknown) {
      setSubmitError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  // ── Conditional form flags ──────────────────────────────────────────────
  const requiresFinishType =
    draft !== null &&
    ['GOL', 'DEFENDIDO', 'BLOQUEADO', 'FORA', 'TRAVE'].includes(draft.factualResult)
  const requiresScoringReason = draft?.factualResult === 'GOL'

  // ── Render ──────────────────────────────────────────────────────────────
  if (loading) {
    return <div className="p-6 text-sm text-neutral-500">Carregando...</div>
  }

  if (fetchError) {
    return (
      <div className="p-6 space-y-3">
        <p className="text-sm text-red-600">{fetchError}</p>
        <Button variant="ghost" size="sm" onClick={() => navigate('/scout')}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
        </Button>
      </div>
    )
  }

  if (!game) {
    return (
      <div className="p-6 space-y-3">
        <p className="text-sm text-neutral-600">Jogo não encontrado.</p>
        <Button variant="ghost" size="sm" onClick={() => navigate('/scout')}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-white shrink-0">
        <Button variant="ghost" size="sm" onClick={() => navigate('/scout')} title="Central do Scout">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Film className="h-5 w-5 text-blue-600 shrink-0" />
        <div className="min-w-0">
          <h1 className="text-base font-semibold truncate">Revisão por Vídeo</h1>
          <p className="text-xs text-neutral-500">
            {game.gameDate ?? 'Sem data'} · {game.opponent ?? 'Sem adversária'} ·{' '}
            {reviewedCount}/{liveEntries.length} revisada{liveEntries.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="ml-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/scout/validate/${gameId}`)}
            title="Abrir validação pós-jogo"
          >
            <ClipboardCheck className="h-4 w-4 mr-1" />
            Validar
          </Button>
        </div>
      </div>

      {/* ── Body: two-panel ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Left: entry list */}
        <aside className="w-56 shrink-0 overflow-y-auto border-r bg-neutral-50">
          {/* Nova sequência por vídeo — caminho oficial sem live entry */}
          <button
            onClick={() => {
              setSelectedEntryId(null)
              setDraft(buildEmptyDraft(liveEntries.length + 1))
              setAttackerSlots([EMPTY_SLOT, EMPTY_SLOT, EMPTY_SLOT, EMPTY_SLOT])
              setDefenderSlots([EMPTY_SLOT, EMPTY_SLOT, EMPTY_SLOT])
              setGoalkeeperSlot(EMPTY_SLOT)
              setMentalEvents([])
              setFeedback('')
              setSubmitError('')
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold text-blue-600 border-b hover:bg-blue-50 transition-colors text-left"
          >
            <Film className="h-3.5 w-3.5" />
            + Nova sequência por vídeo
          </button>
          <div className="px-3 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wide border-b">
            Entradas ao Vivo
          </div>
          {liveEntries.length === 0 ? (
            <p className="p-4 text-xs text-neutral-400">Nenhuma entrada registrada.</p>
          ) : (
            liveEntries.map((entry) => {
              const reviewed = reviewedEntryIds.has(entry.id)
              const selected = selectedEntryId === entry.id
              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => selectEntry(entry)}
                  className={[
                    'w-full text-left px-3 py-2.5 border-b text-xs transition-colors',
                    selected
                      ? 'bg-blue-50 border-l-2 border-l-blue-500'
                      : 'hover:bg-neutral-100 border-l-2 border-l-transparent',
                  ].join(' ')}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-medium text-neutral-800 truncate">{entry.idJogada}</span>
                    {reviewed ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                    ) : (
                      <CircleDot className="h-3.5 w-3.5 text-neutral-300 shrink-0" />
                    )}
                  </div>
                  <div className="mt-0.5 text-neutral-500 truncate">
                    {entry.tempoJogo} · {PHASE_LABELS[entry.faseDaBolaCode] ?? entry.faseDaBolaCode}
                  </div>
                  <div className="mt-0.5 text-neutral-400 truncate">{entry.resultadoFactualCode}</div>
                </button>
              )
            })
          )}
        </aside>

        {/* Right: review form */}
        <main className="flex-1 overflow-y-auto">
          {!draft ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-neutral-400">
              <Film className="h-12 w-12 opacity-20" />
              <p className="text-sm">Selecione uma entrada ao vivo para revisar, ou crie uma nova sequência por vídeo.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-5 space-y-6 max-w-2xl">

              {feedback && (
                <div className="rounded bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">
                  {feedback}
                </div>
              )}
              {submitError && (
                <div className="rounded bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                  {submitError}
                </div>
              )}

              {/* ── Seção 1: Identificação ── */}
              <section>
                <h2 className="text-sm font-semibold text-neutral-700 mb-3 pb-1 border-b">
                  Identificação
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1">
                      Código da Jogada
                    </label>
                    <input
                      type="text"
                      value={draft.playCode}
                      onChange={(e) => setField('playCode', e.target.value)}
                      className="w-full text-xs border rounded px-2 py-1.5 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1">
                      Tempo de Jogo
                    </label>
                    <input
                      type="text"
                      value={draft.gameClock}
                      onChange={(e) => setField('gameClock', e.target.value)}
                      className="w-full text-xs border rounded px-2 py-1.5"
                      placeholder="MM:SS"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1">
                      Período
                    </label>
                    <select
                      value={draft.period}
                      onChange={(e) => setField('period', e.target.value)}
                      className="w-full text-xs border rounded px-2 py-1.5"
                    >
                      <option value="1">1º Tempo</option>
                      <option value="2">2º Tempo</option>
                      <option value="OT">Prorrogação</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1">
                      Fonte
                    </label>
                    <select
                      value={draft.source}
                      onChange={(e) => setField('source', e.target.value)}
                      className="w-full text-xs border rounded px-2 py-1.5"
                    >
                      <option value="MISTA">Mista (Ao Vivo + Vídeo)</option>
                      <option value="AO_VIVO">Ao Vivo</option>
                      <option value="VIDEO">Vídeo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1">
                      Tipo de Sessão
                    </label>
                    <select
                      value={draft.sessionType}
                      onChange={(e) => setField('sessionType', e.target.value)}
                      className="w-full text-xs border rounded px-2 py-1.5"
                    >
                      <option value="JOGO">Jogo</option>
                      <option value="TREINO">Treino</option>
                      <option value="AMISTOSO">Amistoso</option>
                      <option value="SIMULADO">Simulado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1">
                      Referência de Vídeo
                    </label>
                    <input
                      type="text"
                      value={draft.videoRef}
                      onChange={(e) => setField('videoRef', e.target.value)}
                      className="w-full text-xs border rounded px-2 py-1.5"
                      placeholder="URL ou timecode"
                    />
                  </div>
                </div>
              </section>

              {/* ── Seção 2: Fase (readonly) ── */}
              <section>
                <h2 className="text-sm font-semibold text-neutral-700 mb-3 pb-1 border-b">
                  Fase de Bola
                </h2>
                <div className="flex items-center gap-3 text-xs">
                  <span className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded px-3 py-1.5 font-medium text-blue-700">
                    {PHASE_LABELS[draft.phaseOfBall] ?? draft.phaseOfBall}
                  </span>
                  <span className="text-neutral-500">
                    Equipe: <strong>{draft.analyzedTeamPhase}</strong>
                  </span>
                  <span className="text-neutral-400">·</span>
                  <span className="text-neutral-400">
                    Ataque={deriveTeamSides(draft.phaseOfBall).attackingTeamSide} /
                    Defesa={deriveTeamSides(draft.phaseOfBall).defendingTeamSide}
                  </span>
                </div>
              </section>

              {/* ── Seção 3: Blocos condicionais por fase (UI-09) ── */}
              {draft.phaseOfBall === 'AT_POS' && (
                <section>
                  <h2 className="text-sm font-semibold text-neutral-700 mb-3 pb-1 border-b">
                    Ataque Posicionado
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">
                        Sistema Ofensivo
                      </label>
                      <select
                        value={draft.offensiveSystem}
                        onChange={(e) => setField('offensiveSystem', e.target.value)}
                        className="w-full text-xs border rounded px-2 py-1.5"
                      >
                        <option value="">— Selecione —</option>
                        {(codebookMap.get('LISTA_SISTEMA_OFENSIVO') ?? []).map((opt) => (
                          <option key={opt.code} value={opt.code}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">
                        Configuração Ofensiva
                      </label>
                      <select
                        value={draft.offensiveConfiguration}
                        onChange={(e) => setField('offensiveConfiguration', e.target.value)}
                        className="w-full text-xs border rounded px-2 py-1.5"
                      >
                        <option value="">— Selecione —</option>
                        {(codebookMap.get('LISTA_CONFIGURACAO_OFENSIVA') ?? []).map((opt) => (
                          <option key={opt.code} value={opt.code}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </section>
              )}

              {draft.phaseOfBall === 'DEF_POS' && (
                <section>
                  <h2 className="text-sm font-semibold text-neutral-700 mb-3 pb-1 border-b">
                    Defesa Posicionada
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">
                        Sistema Defensivo
                      </label>
                      <select
                        value={draft.defensiveSystem}
                        onChange={(e) => setField('defensiveSystem', e.target.value)}
                        className="w-full text-xs border rounded px-2 py-1.5"
                      >
                        <option value="">— Selecione —</option>
                        {(codebookMap.get('LISTA_SISTEMA_DEFENSIVO') ?? []).map((opt) => (
                          <option key={opt.code} value={opt.code}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">
                        Conexão Defensiva
                      </label>
                      <select
                        value={draft.defensiveConnection}
                        onChange={(e) => setField('defensiveConnection', e.target.value)}
                        className="w-full text-xs border rounded px-2 py-1.5"
                      >
                        <option value="">— Selecione —</option>
                        {(codebookMap.get('LISTA_ACAO_DEFENSIVA') ?? []).map((opt) => (
                          <option key={opt.code} value={opt.code}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">
                        Ajuste Defensivo
                      </label>
                      <input
                        type="text"
                        value={draft.defensiveAdjustment}
                        onChange={(e) => setField('defensiveAdjustment', e.target.value)}
                        className="w-full text-xs border rounded px-2 py-1.5"
                        placeholder="Descreva o ajuste"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">
                        Resultado do Ajuste
                      </label>
                      <input
                        type="text"
                        value={draft.defensiveAdjustmentResult}
                        onChange={(e) => setField('defensiveAdjustmentResult', e.target.value)}
                        className="w-full text-xs border rounded px-2 py-1.5"
                        placeholder="Resultado obtido"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-neutral-600 mb-1">
                        Principal Ameaça Ofensiva
                      </label>
                      <input
                        type="text"
                        value={draft.mainOffensiveThreat}
                        onChange={(e) => setField('mainOffensiveThreat', e.target.value)}
                        className="w-full text-xs border rounded px-2 py-1.5"
                        placeholder="Ameaça observada"
                      />
                    </div>
                  </div>
                </section>
              )}

              {draft.phaseOfBall === 'TRANS_OF' && (
                <section>
                  <h2 className="text-sm font-semibold text-neutral-700 mb-3 pb-1 border-b">
                    Transição Ofensiva
                  </h2>
                  <div className="space-y-3">
                    {/* Formação de transição ofensiva */}
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">
                        Formação (origem)
                      </label>
                      <select
                        value={draft.formTransOf}
                        onChange={(e) => setField('formTransOf', e.target.value)}
                        className="w-full text-xs border rounded px-2 py-1.5"
                      >
                        <option value="">— Selecione —</option>
                        {(codebookMap.get('LISTA_FORM_TRANS_OF') ?? []).map((opt) => (
                          <option key={opt.code} value={opt.code}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    {/* Objetivo da formação */}
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">
                        Objetivo (vantagem buscada)
                      </label>
                      <select
                        value={draft.objetivoFormTransOf}
                        onChange={(e) => setField('objetivoFormTransOf', e.target.value)}
                        className="w-full text-xs border rounded px-2 py-1.5"
                      >
                        <option value="">— Selecione —</option>
                        {(codebookMap.get('LISTA_OBJETIVO_FORM_TRANS_OF') ?? []).map((opt) => (
                          <option key={opt.code} value={opt.code}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    {/* Ação principal na transição */}
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">
                        Primeira ação
                      </label>
                      <select
                        value={draft.acaoPrincipalTransOf}
                        onChange={(e) => setField('acaoPrincipalTransOf', e.target.value)}
                        className="w-full text-xs border rounded px-2 py-1.5"
                      >
                        <option value="">— Selecione —</option>
                        {(codebookMap.get('LISTA_ACAO_PRINCIPAL_TRANS_OF') ?? []).map((opt) => (
                          <option key={opt.code} value={opt.code}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    {/* Status de estabilização (velocidade) */}
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">
                        Velocidade / Estabilização
                      </label>
                      <select
                        value={draft.statusEstabilizacaoAtPos}
                        onChange={(e) => setField('statusEstabilizacaoAtPos', e.target.value)}
                        className="w-full text-xs border rounded px-2 py-1.5"
                      >
                        <option value="">— Selecione —</option>
                        {(codebookMap.get('LISTA_STATUS_ESTABILIZACAO_AT_POS') ?? []).map((opt) => (
                          <option key={opt.code} value={opt.code}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    {/* Motivo do fim da transição */}
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">
                        Motivo do fim da transição
                      </label>
                      <select
                        value={draft.motivoFimTransOf}
                        onChange={(e) => setField('motivoFimTransOf', e.target.value)}
                        className="w-full text-xs border rounded px-2 py-1.5"
                      >
                        <option value="">— Selecione —</option>
                        {(codebookMap.get('LISTA_MOTIVO_FIM_TRANS_OF') ?? []).map((opt) => (
                          <option key={opt.code} value={opt.code}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    {/* Principal ameaça ofensiva (texto livre) */}
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">
                        Principal ameaça ofensiva (obs.)
                      </label>
                      <input
                        type="text"
                        value={draft.mainOffensiveThreat}
                        onChange={(e) => setField('mainOffensiveThreat', e.target.value)}
                        className="w-full text-xs border rounded px-2 py-1.5"
                        placeholder="Ameaça criada na transição"
                      />
                    </div>
                  </div>
                </section>
              )}

              {draft.phaseOfBall === 'TRANS_DEF' && (
                <section>
                  <h2 className="text-sm font-semibold text-neutral-700 mb-3 pb-1 border-b">
                    Transição Defensiva
                  </h2>
                  <div className="space-y-3">
                    {/* Formação (entrada) defensiva */}
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">
                        Formação (entrada)
                      </label>
                      <select
                        value={draft.formTransDef}
                        onChange={(e) => setField('formTransDef', e.target.value)}
                        className="w-full text-xs border rounded px-2 py-1.5"
                      >
                        <option value="">— Selecione —</option>
                        {(codebookMap.get('LISTA_FORM_TRANS_DEF') ?? []).map((opt) => (
                          <option key={opt.code} value={opt.code}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    {/* Objetivo da formação */}
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">
                        Objetivo (vantagem buscada)
                      </label>
                      <select
                        value={draft.objetivoFormTransDef}
                        onChange={(e) => setField('objetivoFormTransDef', e.target.value)}
                        className="w-full text-xs border rounded px-2 py-1.5"
                      >
                        <option value="">— Selecione —</option>
                        {(codebookMap.get('LISTA_OBJETIVO_FORM_TRANS_DEF') ?? []).map((opt) => (
                          <option key={opt.code} value={opt.code}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    {/* Ação principal */}
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">
                        Ação principal (troca/entrada)
                      </label>
                      <select
                        value={draft.acaoPrincipalTransDef}
                        onChange={(e) => setField('acaoPrincipalTransDef', e.target.value)}
                        className="w-full text-xs border rounded px-2 py-1.5"
                      >
                        <option value="">— Selecione —</option>
                        {(codebookMap.get('LISTA_ACAO_PRINCIPAL_TRANS_DEF') ?? []).map((opt) => (
                          <option key={opt.code} value={opt.code}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    {/* Reorganização defensiva */}
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">
                        Reorganização
                      </label>
                      <select
                        value={draft.reorganizacaoDef}
                        onChange={(e) => setField('reorganizacaoDef', e.target.value)}
                        className="w-full text-xs border rounded px-2 py-1.5"
                      >
                        <option value="">— Selecione —</option>
                        {(codebookMap.get('LISTA_REORGANIZACAO_DEF') ?? []).map((opt) => (
                          <option key={opt.code} value={opt.code}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    {/* Estabilização defensiva */}
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">
                        Estabilização
                      </label>
                      <select
                        value={draft.statusEstabilizacaoDefPos}
                        onChange={(e) => setField('statusEstabilizacaoDefPos', e.target.value)}
                        className="w-full text-xs border rounded px-2 py-1.5"
                      >
                        <option value="">— Selecione —</option>
                        {(codebookMap.get('LISTA_STATUS_ESTABILIZACAO_DEF_POS') ?? []).map((opt) => (
                          <option key={opt.code} value={opt.code}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    {/* Motivo do fim da transição */}
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">
                        Motivo do fim da transição
                      </label>
                      <select
                        value={draft.motivoFimTransDef}
                        onChange={(e) => setField('motivoFimTransDef', e.target.value)}
                        className="w-full text-xs border rounded px-2 py-1.5"
                      >
                        <option value="">— Selecione —</option>
                        {(codebookMap.get('LISTA_MOTIVO_FIM_TRANS_DEF') ?? []).map((opt) => (
                          <option key={opt.code} value={opt.code}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </section>
              )}

              {/* ── Seção 4: Atletas Envolvidos (UI-10) ── */}
              <section>
                <h2 className="text-sm font-semibold text-neutral-700 mb-3 pb-1 border-b">
                  Atletas Envolvidos
                </h2>
                <div className="space-y-4">
                  {/* Atacantes */}
                  <div>
                    <p className="text-xs font-medium text-neutral-500 mb-2">Atacantes (até 4)</p>
                    <div className="grid grid-cols-2 gap-2">
                      {attackerSlots.map((slot, idx) => (
                        <div key={`atk-${idx}`}>
                          <label className="block text-xs text-neutral-500 mb-1">
                            Atacante {idx + 1}
                          </label>
                          <select
                            value={slot.athleteId}
                            onChange={(e) =>
                              setAttackerSlots((prev) =>
                                prev.map((p, i) =>
                                  i === idx
                                    ? { ...p, athleteId: e.target.value, externalLabel: '' }
                                    : p,
                                ),
                              )
                            }
                            className="w-full text-xs border rounded px-2 py-1.5"
                          >
                            <option value="">—</option>
                            {athletes.map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.name}
                              </option>
                            ))}
                            <option value="EXTERNO">Atleta externa…</option>
                          </select>
                          {slot.athleteId === 'EXTERNO' && (
                            <input
                              type="text"
                              value={slot.externalLabel}
                              onChange={(e) =>
                                setAttackerSlots((prev) =>
                                  prev.map((p, i) =>
                                    i === idx
                                      ? { ...p, externalLabel: e.target.value }
                                      : p,
                                  ),
                                )
                              }
                              className="mt-1 w-full text-xs border rounded px-2 py-1.5"
                              placeholder="Nome da atleta"
                            />
                          )}
                          {slot.athleteId && (
                            <select
                              value={slot.phaseOfAthlete}
                              onChange={(e) =>
                                setAttackerSlots((prev) =>
                                  prev.map((p, i) =>
                                    i === idx
                                      ? { ...p, phaseOfAthlete: e.target.value }
                                      : p,
                                  ),
                                )
                              }
                              className="mt-1 w-full text-xs border rounded px-2 py-1.5"
                            >
                              <option value="">Fase da atleta —</option>
                              <option value="AT_POS">Ataque Posicionado</option>
                              <option value="DEF_POS">Defesa Posicionada</option>
                              <option value="TRANS_OF">Transição Ofensiva</option>
                              <option value="TRANS_DEF">Transição Defensiva</option>
                            </select>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Defensoras */}
                  <div>
                    <p className="text-xs font-medium text-neutral-500 mb-2">Defensoras (até 3)</p>
                    <div className="grid grid-cols-3 gap-2">
                      {defenderSlots.map((slot, idx) => (
                        <div key={`def-${idx}`}>
                          <label className="block text-xs text-neutral-500 mb-1">
                            Defensora {idx + 1}
                          </label>
                          <select
                            value={slot.athleteId}
                            onChange={(e) =>
                              setDefenderSlots((prev) =>
                                prev.map((p, i) =>
                                  i === idx
                                    ? { ...p, athleteId: e.target.value, externalLabel: '' }
                                    : p,
                                ),
                              )
                            }
                            className="w-full text-xs border rounded px-2 py-1.5"
                          >
                            <option value="">—</option>
                            {athletes.map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.name}
                              </option>
                            ))}
                            <option value="EXTERNO">Atleta externa…</option>
                          </select>
                          {slot.athleteId === 'EXTERNO' && (
                            <input
                              type="text"
                              value={slot.externalLabel}
                              onChange={(e) =>
                                setDefenderSlots((prev) =>
                                  prev.map((p, i) =>
                                    i === idx
                                      ? { ...p, externalLabel: e.target.value }
                                      : p,
                                  ),
                                )
                              }
                              className="mt-1 w-full text-xs border rounded px-2 py-1.5"
                              placeholder="Nome da atleta"
                            />
                          )}
                          {slot.athleteId && (
                            <select
                              value={slot.phaseOfAthlete}
                              onChange={(e) =>
                                setDefenderSlots((prev) =>
                                  prev.map((p, i) =>
                                    i === idx
                                      ? { ...p, phaseOfAthlete: e.target.value }
                                      : p,
                                  ),
                                )
                              }
                              className="mt-1 w-full text-xs border rounded px-2 py-1.5"
                            >
                              <option value="">Fase da atleta —</option>
                              <option value="AT_POS">Ataque Posicionado</option>
                              <option value="DEF_POS">Defesa Posicionada</option>
                              <option value="TRANS_OF">Transição Ofensiva</option>
                              <option value="TRANS_DEF">Transição Defensiva</option>
                            </select>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Goleira (DEF_POS e TRANS_OF) */}
                  {(draft.phaseOfBall === 'DEF_POS' || draft.phaseOfBall === 'TRANS_OF') && (
                    <div>
                      <p className="text-xs font-medium text-neutral-500 mb-2">Goleira</p>
                      <div className="max-w-[180px]">
                        <label className="block text-xs text-neutral-500 mb-1">
                          Goleira
                        </label>
                        <select
                          value={goalkeeperSlot.athleteId}
                          onChange={(e) =>
                            setGoalkeeperSlot({ athleteId: e.target.value, externalLabel: '', phaseOfAthlete: '' })
                          }
                          className="w-full text-xs border rounded px-2 py-1.5"
                        >
                          <option value="">—</option>
                          {athletes.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.name}
                            </option>
                          ))}
                          <option value="EXTERNO">Atleta externa…</option>
                        </select>
                        {goalkeeperSlot.athleteId === 'EXTERNO' && (
                          <input
                            type="text"
                            value={goalkeeperSlot.externalLabel}
                            onChange={(e) =>
                              setGoalkeeperSlot((prev) => ({
                                ...prev,
                                externalLabel: e.target.value,
                              }))
                            }
                            className="mt-1 w-full text-xs border rounded px-2 py-1.5"
                            placeholder="Nome da goleira"
                          />
                        )}
                        {goalkeeperSlot.athleteId && (
                          <select
                            value={goalkeeperSlot.phaseOfAthlete}
                            onChange={(e) =>
                              setGoalkeeperSlot((prev) => ({
                                ...prev,
                                phaseOfAthlete: e.target.value,
                              }))
                            }
                            className="mt-1 w-full text-xs border rounded px-2 py-1.5"
                          >
                            <option value="">Fase da atleta —</option>
                            <option value="AT_POS">Ataque Posicionado</option>
                            <option value="DEF_POS">Defesa Posicionada</option>
                            <option value="TRANS_OF">Transição Ofensiva</option>
                            <option value="TRANS_DEF">Transição Defensiva</option>
                          </select>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* ── Seção 4: Finalização (condicional) ── */}
              {requiresFinishType && (
                <section>
                  <h2 className="text-sm font-semibold text-neutral-700 mb-3 pb-1 border-b">
                    Finalização
                  </h2>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">
                        Tipo de Finalização
                      </label>
                      <select
                        value={draft.finishType}
                        onChange={(e) => setField('finishType', e.target.value)}
                        className="w-full text-xs border rounded px-2 py-1.5"
                        required={requiresFinishType}
                      >
                        <option value="">— Selecione —</option>
                        {(codebookMap.get('LISTA_TIPO_FINALIZACAO') ?? []).map((opt) => (
                          <option key={opt.code} value={opt.code}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">
                        Destino do Arremesso
                      </label>
                      <input
                        type="text"
                        value={draft.shotDestination}
                        onChange={(e) => setField('shotDestination', e.target.value)}
                        className="w-full text-xs border rounded px-2 py-1.5"
                        placeholder="Ex: GOL_CANTO_DIR"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">
                        Região do Arremesso
                      </label>
                      <input
                        type="text"
                        value={draft.shotRegion}
                        onChange={(e) => setField('shotRegion', e.target.value)}
                        className="w-full text-xs border rounded px-2 py-1.5"
                        placeholder="Ex: ZONA_6M"
                      />
                    </div>
                  </div>
                </section>
              )}

              {/* ── Seção SHOOTOUT (CONTEXTO_ESPECIAL) ── */}
              <section>
                <h2 className="text-sm font-semibold text-neutral-700 mb-3 pb-1 border-b">
                  Contexto Especial
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1">
                      Contexto Especial
                    </label>
                    <select
                      value={draft.specialContext}
                      onChange={(e) => setField('specialContext', e.target.value)}
                      className="w-full text-xs border rounded px-2 py-1.5"
                    >
                      <option value="">— Nenhum —</option>
                      {(codebookMap.get('LISTA_CONTEXTO_ESPECIAL') ?? []).map((opt) => (
                        <option key={opt.code} value={opt.code}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {draft.specialContext === 'SHOOTOUT' && (
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {/* Tipo de shootout */}
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">
                        Tipo de Shootout
                      </label>
                      <select
                        value={draft.shootoutTipo}
                        onChange={(e) => setField('shootoutTipo', e.target.value)}
                        className="w-full text-xs border rounded px-2 py-1.5"
                      >
                        <option value="">— Selecione —</option>
                        {(codebookMap.get('LISTA_SHOOTOUT') ?? []).map((opt) => (
                          <option key={opt.code} value={opt.code}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    {/* Resultado do shootout */}
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">
                        Resultado
                      </label>
                      <select
                        value={draft.shootoutResultado}
                        onChange={(e) => setField('shootoutResultado', e.target.value)}
                        className="w-full text-xs border rounded px-2 py-1.5"
                      >
                        <option value="">— Selecione —</option>
                        {(codebookMap.get('LISTA_SHOOTOUT_RESULTADO') ?? []).map((opt) => (
                          <option key={opt.code} value={opt.code}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    {/* Decisão no shootout */}
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">
                        Decisão
                      </label>
                      <select
                        value={draft.shootoutDecisao}
                        onChange={(e) => setField('shootoutDecisao', e.target.value)}
                        className="w-full text-xs border rounded px-2 py-1.5"
                      >
                        <option value="">— Selecione —</option>
                        {(codebookMap.get('LISTA_SHOOTOUT_DECISAO') ?? []).map((opt) => (
                          <option key={opt.code} value={opt.code}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    {/* Execução no shootout */}
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">
                        Execução
                      </label>
                      <select
                        value={draft.shootoutExecucao}
                        onChange={(e) => setField('shootoutExecucao', e.target.value)}
                        className="w-full text-xs border rounded px-2 py-1.5"
                      >
                        <option value="">— Selecione —</option>
                        {(codebookMap.get('LISTA_SHOOTOUT_EXECUCAO') ?? []).map((opt) => (
                          <option key={opt.code} value={opt.code}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
                {draft.specialContext === 'TIRO_6M' && (
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">
                        Resultado do 6m
                      </label>
                      <select
                        value={draft.tiro6mResult}
                        onChange={(e) => setField('tiro6mResult', e.target.value)}
                        className="w-full text-xs border rounded px-2 py-1.5"
                      >
                        <option value="">— Selecione —</option>
                        {(codebookMap.get('LISTA_6M') ?? []).map((opt) => (
                          <option key={opt.code} value={opt.code}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
                {draft.specialContext === 'TIRO_LIVRE' && (
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">
                        Resultado do Tiro Livre
                      </label>
                      <select
                        value={draft.tiroLivreResult}
                        onChange={(e) => setField('tiroLivreResult', e.target.value)}
                        className="w-full text-xs border rounded px-2 py-1.5"
                      >
                        <option value="">— Selecione —</option>
                        {(codebookMap.get('LISTA_TIRO_LIVRE') ?? []).map((opt) => (
                          <option key={opt.code} value={opt.code}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
                {draft.specialContext === 'REPOSICAO_LATERAL' && (
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">
                        Resultado da Reposição Lateral
                      </label>
                      <select
                        value={draft.reposicaoLateralResult}
                        onChange={(e) => setField('reposicaoLateralResult', e.target.value)}
                        className="w-full text-xs border rounded px-2 py-1.5"
                      >
                        <option value="">— Selecione —</option>
                        {(codebookMap.get('LISTA_REPOSICAO_LATERAL') ?? []).map((opt) => (
                          <option key={opt.code} value={opt.code}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
                {draft.specialContext === 'REPOSICAO_GOLEIRA' && (
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">
                        Resultado da Reposição Goleira
                      </label>
                      <select
                        value={draft.reposicaoGoleiraResult}
                        onChange={(e) => setField('reposicaoGoleiraResult', e.target.value)}
                        className="w-full text-xs border rounded px-2 py-1.5"
                      >
                        <option value="">— Selecione —</option>
                        {(codebookMap.get('LISTA_REPOSICAO_GOLEIRA') ?? []).map((opt) => (
                          <option key={opt.code} value={opt.code}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
                {draft.specialContext === 'REPOSICAO_APOS_GOL' && (
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">
                        Resultado da Reposição Após Gol
                      </label>
                      <select
                        value={draft.reposicaoAposGolResult}
                        onChange={(e) => setField('reposicaoAposGolResult', e.target.value)}
                        className="w-full text-xs border rounded px-2 py-1.5"
                      >
                        <option value="">— Selecione —</option>
                        {(codebookMap.get('LISTA_REPOSICAO_APOS_GOL') ?? []).map((opt) => (
                          <option key={opt.code} value={opt.code}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
                {draft.specialContext === 'GOLDEN_GOAL' && (
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">
                        Situação Golden Goal
                      </label>
                      <select
                        value={draft.goldenGoalSituation}
                        onChange={(e) => setField('goldenGoalSituation', e.target.value)}
                        className="w-full text-xs border rounded px-2 py-1.5"
                      >
                        <option value="">— Selecione —</option>
                        {(codebookMap.get('LISTA_GOLDEN_GOAL') ?? []).map((opt) => (
                          <option key={opt.code} value={opt.code}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
                {draft.specialContext === 'FIM_SET' && (
                  <p className="mt-3 text-xs text-neutral-500 italic">
                    Lance de fim de set — nenhum campo adicional obrigatório.
                  </p>
                )}
              </section>

              {/* ── Seção 5: Resultado ── */}
              <section>
                <h2 className="text-sm font-semibold text-neutral-700 mb-3 pb-1 border-b">
                  Resultado
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-neutral-600 mb-1">
                      Resultado Factual
                    </label>
                    <select
                      value={draft.factualResult}
                      onChange={(e) => setField('factualResult', e.target.value)}
                      className="w-full text-xs border rounded px-2 py-1.5"
                      required
                    >
                      <option value="">— Selecione —</option>
                      {(codebookMap.get('LISTA_RESULTADO_FACTUAL') ?? []).map((opt) => (
                        <option key={opt.code} value={opt.code}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  {requiresScoringReason && (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-neutral-600 mb-1">
                          Motivo da Pontuação
                        </label>
                        <select
                          value={draft.playScoreReason}
                          onChange={(e) => setField('playScoreReason', e.target.value)}
                          className="w-full text-xs border rounded px-2 py-1.5"
                          required
                        >
                          <option value="">— Selecione —</option>
                          {(codebookMap.get('LISTA_MOTIVO_PONTUACAO') ?? []).map((opt) => (
                            <option key={opt.code} value={opt.code}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-neutral-600 mb-1">
                          Pontos da Jogada
                        </label>
                        <select
                          value={draft.playPoints}
                          onChange={(e) => setField('playPoints', e.target.value)}
                          className="w-full text-xs border rounded px-2 py-1.5"
                          required
                        >
                          <option value="">— Selecione —</option>
                          <option value="1">1 ponto</option>
                          <option value="2">2 pontos</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>
              </section>

              {/* ── Seção 6: Análise ── */}
              <section>
                <h2 className="text-sm font-semibold text-neutral-700 mb-3 pb-1 border-b">
                  Análise
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1">
                      Causa Provável
                    </label>
                    <select
                      value={draft.mainCause}
                      onChange={(e) => setField('mainCause', e.target.value)}
                      className="w-full text-xs border rounded px-2 py-1.5"
                    >
                      <option value="">— Selecione —</option>
                      {(codebookMap.get('LISTA_CAUSA_PRINCIPAL') ?? []).map((opt) => (
                        <option key={opt.code} value={opt.code}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1">
                      Situação de OUT
                    </label>
                    <select
                      value={draft.outSituation}
                      onChange={(e) => {
                        setField('outSituation', e.target.value)
                        setField('numericalStructureReal', '')
                        setField('outCause', '')
                      }}
                      className="w-full text-xs border rounded px-2 py-1.5"
                    >
                      <option value="">— N/A —</option>
                      {(codebookMap.get('LISTA_OUT_SITUACAO') ?? []).map((opt) => (
                        <option key={opt.code} value={opt.code}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  {(draft.outSituation === 'OUT_ATAQUE' || draft.outSituation === 'OUT_DEFESA') && (
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">
                        Estrutura Numérica Real
                      </label>
                      <select
                        value={draft.numericalStructureReal}
                        onChange={(e) => setField('numericalStructureReal', e.target.value)}
                        className="w-full text-xs border rounded px-2 py-1.5"
                        required={draft.outSituation === 'OUT_ATAQUE' || draft.outSituation === 'OUT_DEFESA'}
                      >
                        <option value="">— Selecione —</option>
                        <option value="OF_3_DEF_3">OF_3_DEF_3</option>
                        <option value="OF_4_DEF_2">OF_4_DEF_2</option>
                        <option value="OF_5_DEF_1">OF_5_DEF_1</option>
                      </select>
                    </div>
                  )}
                  {draft.outSituation && draft.outSituation !== 'SEM_OUT' && draft.outSituation !== 'NAO_OBSERVADO' && (
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">
                        Causa do OUT
                      </label>
                      <select
                        value={draft.outCause}
                        onChange={(e) => setField('outCause', e.target.value)}
                        className="w-full text-xs border rounded px-2 py-1.5"
                      >
                        <option value="">— Selecione —</option>
                        {(codebookMap.get('LISTA_CAUSA_OUT') ?? []).map((opt) => (
                          <option key={opt.code} value={opt.code}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className={draft.outSituation && draft.outSituation !== 'SEM_OUT' ? '' : 'col-span-2'}>
                    <label className="block text-xs font-medium text-neutral-600 mb-1">
                      Observações Gerais
                    </label>
                    <textarea
                      value={draft.freeNotes}
                      onChange={(e) => setField('freeNotes', e.target.value)}
                      className="w-full text-xs border rounded px-2 py-1.5 resize-none"
                      rows={3}
                      placeholder="Notas livres do analista"
                    />
                  </div>
                </div>
              </section>

              {/* ── Seção: Eventos Mentais (UI-18) ── */}
              <section>
                <h2 className="text-sm font-semibold text-neutral-700 mb-3 pb-1 border-b">
                  Eventos Mentais
                </h2>
                <div className="space-y-3">
                  {mentalEvents.map((me, idx) => (
                    <div key={idx} className="grid grid-cols-2 gap-3 p-3 border rounded bg-neutral-50 relative">
                      <button
                        type="button"
                        className="absolute top-1.5 right-1.5 text-xs text-red-500 hover:text-red-700"
                        onClick={() =>
                          setMentalEvents((prev) => prev.filter((_, i) => i !== idx))
                        }
                      >
                        ✕
                      </button>
                      {/* Código mental */}
                      <div>
                        <label className="block text-xs font-medium text-neutral-600 mb-1">
                          Código Mental
                        </label>
                        <select
                          value={me.mentalCode}
                          onChange={(e) =>
                            setMentalEvents((prev) =>
                              prev.map((item, i) =>
                                i === idx ? { ...item, mentalCode: e.target.value } : item,
                              ),
                            )
                          }
                          className="w-full text-xs border rounded px-2 py-1.5"
                          required
                        >
                          <option value="">— Selecione —</option>
                          {(codebookMap.get('LISTA_CODIGO_MENTAL') ?? []).map((opt) => (
                            <option key={opt.code} value={opt.code}>
                              {opt.code} — {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      {/* Marca mental */}
                      <div>
                        <label className="block text-xs font-medium text-neutral-600 mb-1">
                          Marca Mental
                        </label>
                        <select
                          value={me.mentalMark}
                          onChange={(e) =>
                            setMentalEvents((prev) =>
                              prev.map((item, i) =>
                                i === idx ? { ...item, mentalMark: e.target.value } : item,
                              ),
                            )
                          }
                          className="w-full text-xs border rounded px-2 py-1.5"
                          required
                        >
                          <option value="">— Selecione —</option>
                          {(codebookMap.get('LISTA_MARCA_MENTAL') ?? []).map((opt) => (
                            <option key={opt.code} value={opt.code}>
                              {opt.code} — {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      {/* Atleta observada */}
                      <div>
                        <label className="block text-xs font-medium text-neutral-600 mb-1">
                          Atleta Observada (opcional)
                        </label>
                        <select
                          value={me.athleteId}
                          onChange={(e) =>
                            setMentalEvents((prev) =>
                              prev.map((item, i) =>
                                i === idx
                                  ? { ...item, athleteId: e.target.value, externalAthleteLabel: '' }
                                  : item,
                              ),
                            )
                          }
                          className="w-full text-xs border rounded px-2 py-1.5"
                        >
                          <option value="">— Nenhuma —</option>
                          {athletes.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.name ?? a.id}
                            </option>
                          ))}
                          <option value="EXTERNO">Atleta externa (label)</option>
                        </select>
                      </div>
                      {/* External label */}
                      {me.athleteId === 'EXTERNO' && (
                        <div>
                          <label className="block text-xs font-medium text-neutral-600 mb-1">
                            Label Atleta Externa
                          </label>
                          <input
                            type="text"
                            value={me.externalAthleteLabel}
                            onChange={(e) =>
                              setMentalEvents((prev) =>
                                prev.map((item, i) =>
                                  i === idx
                                    ? { ...item, externalAthleteLabel: e.target.value }
                                    : item,
                                ),
                              )
                            }
                            className="w-full text-xs border rounded px-2 py-1.5"
                            placeholder="Nome / número"
                          />
                        </div>
                      )}
                      {/* Observação */}
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-neutral-600 mb-1">
                          Observação (comportamento observável)
                        </label>
                        <textarea
                          value={me.mentalObservation}
                          onChange={(e) =>
                            setMentalEvents((prev) =>
                              prev.map((item, i) =>
                                i === idx ? { ...item, mentalObservation: e.target.value } : item,
                              ),
                            )
                          }
                          className="w-full text-xs border rounded px-2 py-1.5 resize-none"
                          rows={2}
                          placeholder="Descreva somente comportamento observável"
                        />
                      </div>
                      {/* Comunicação no Momento Crítico (UI-25) */}
                      <div>
                        <label className="block text-xs font-medium text-neutral-600 mb-1">
                          Comunicação no Momento Crítico
                        </label>
                        <select
                          value={me.criticalCommunication}
                          onChange={(e) =>
                            setMentalEvents((prev) =>
                              prev.map((item, i) =>
                                i === idx ? { ...item, criticalCommunication: e.target.value } : item,
                              ),
                            )
                          }
                          className="w-full text-xs border rounded px-2 py-1.5"
                        >
                          <option value="">— Selecione —</option>
                          {(codebookMap.get('LISTA_COMUNICACAO_MOMENTO_CRITICO') ?? []).map((opt) => (
                            <option key={opt.code} value={opt.code}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      {/* Linguagem Corporal (UI-25) */}
                      <div>
                        <label className="block text-xs font-medium text-neutral-600 mb-1">
                          Linguagem Corporal
                        </label>
                        <select
                          value={me.bodyLanguage}
                          onChange={(e) =>
                            setMentalEvents((prev) =>
                              prev.map((item, i) =>
                                i === idx ? { ...item, bodyLanguage: e.target.value } : item,
                              ),
                            )
                          }
                          className="w-full text-xs border rounded px-2 py-1.5"
                        >
                          <option value="">— Selecione —</option>
                          {(codebookMap.get('LISTA_LINGUAGEM_CORPORAL') ?? []).map((opt) => (
                            <option key={opt.code} value={opt.code}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                  {mentalEvents.length < 10 && (
                    <button
                      type="button"
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                      onClick={() =>
                        setMentalEvents((prev) => [...prev, { ...EMPTY_MENTAL }])
                      }
                    >
                      + Adicionar evento mental
                    </button>
                  )}
                </div>
              </section>

              {/* ── Ações ── */}
              <div className="flex items-center gap-3 pt-2 border-t">
                <Button type="submit" disabled={saving}>
                  {saving ? 'Salvando...' : 'Salvar Jogada (COLETA_SCOUT)'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedEntryId(null)
                    setDraft(null)
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          )}
        </main>
      </div>
    </div>
  )
}

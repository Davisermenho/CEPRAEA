import { useEffect, useMemo, useRef, useState } from 'react'
import { BarChart2, CheckCircle2, ChevronDown, ChevronUp, ClipboardList, LayoutDashboard, MessageSquare, Radar, RotateCcw, Shield, TimerReset, UserCheck } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/shared/components/Button'
import { EmptyState } from '@/shared/components/EmptyState'
import {
  createScoutLiveEntry,
  fetchScoutAthletes,
  fetchScoutCodebook,
  fetchScoutGameAthletes,
  fetchScoutGames,
  fetchScoutLiveEntriesForGame,
} from '@/features/scout/scoutApi'
import {
  deriveFinishTypeFromClassification,
  deriveScoringReasonFromClassification,
  getAllowedBasicActions,
  getAllowedCategoriesForPhase,
  getAllowedClassifications,
  getAllowedFinishTypes,
  getAllowedPointsForScoringReason,
  getAllowedResultsForSelection,
  getAllowedScoringReasons,
  getBasicActionListKey,
  getClassificationListKey,
  shouldShowFinishTypeField,
  shouldShowScoringFields,
  type LiveCollectionBasicActionCode,
  type LiveCollectionCategoryCode,
  type LiveCollectionClassificationCode,
} from '@/features/scout/domain/liveCollectionCompatibility.matrix'
import type {
  AthleteWithScoutProfile,
  ScoutAnalyzedTeamPhaseCode,
  ScoutCodeList,
  ScoutCodeValue,
  ScoutFactualResultCode,
  ScoutFinishTypeCode,
  ScoutGameAthlete,
  ScoutGameRecord,
  ScoutLiveEntry,
  ScoutLiveEntryWriteInput,
  ScoutPhaseCode,
  ScoutScoringReasonCode,
} from '@/types'

const CODEBOOK_KEYS = [
  'LISTA_FASES',
  'LISTA_FASE_EQUIPE',
  'LISTA_SISTEMA_OFENSIVO',
  'LISTA_SISTEMA_DEFENSIVO',
  'LISTA_TIPO_FINALIZACAO',
  'LISTA_RESULTADO_FACTUAL',
  'LISTA_MOTIVO_PONTUACAO',
  'LISTA_CAUSA_PRINCIPAL',
  'LISTA_PRIORIDADE_TREINO',
  'LISTA_STATUS_VALIDACAO',
  'LISTA_ACAO_PRINCIPAL_AT_POS',
  'LISTA_ACAO_PRINCIPAL_DEF_POS',
  'LISTA_ACAO_PRINCIPAL_TRANS_OF',
  'LISTA_ACAO_PRINCIPAL_TRANS_DEF',
  'LISTA_CATEGORIA_ACAO',
  'LISTA_ACAO_BASICA_PASSE',
  'LISTA_ACAO_BASICA_ARREMESSO',
  'LISTA_ACAO_BASICA_ACAO_DEFENSIVA',
  'LISTA_ACAO_BASICA_TROCA_TRANSICAO',
  'LISTA_CLASSIF_PASSE',
  'LISTA_CLASSIF_ARREMESSO',
  'LISTA_CLASSIF_BLOQUEIO',
  'LISTA_CLASSIF_INTERC_ROUBO',
  'LISTA_CLASSIF_TROCA_TRANSICAO',
] as const

type LiveEntryDraft = {
  idJogada: string
  tempoJogo: string
  faseDaBolaCode: ScoutPhaseCode
  faseEquipeAnalisadaCode: ScoutAnalyzedTeamPhaseCode
  sistemaOfensivoCode: string
  sistemaDefensivoCode: string
  atletaPrincipalId: string
  tipoFinalizacaoCode: ScoutFinishTypeCode | ''
  resultadoFactualCode: ScoutFactualResultCode | ''
  motivoPontuacaoCode: ScoutScoringReasonCode | ''
  pontosJogada: '' | '0' | '1' | '2'
  causaProvavelCode: string
  prioridadeTreinoCode: string
  videoRef: string
  obsGeral: string
  categoriaAcaoCode: string
  acaoBasicaCode: string
  classificacaoAcaoCode: string
}

function buildDraft(entryNumber: number, seed: Partial<LiveEntryDraft> = {}): LiveEntryDraft {
  return {
    idJogada: `LIVE-${String(entryNumber).padStart(4, '0')}`,
    tempoJogo: '00:00',
    faseDaBolaCode: 'AT_POS',
    faseEquipeAnalisadaCode: 'ATAQUE',
    sistemaOfensivoCode: '',
    sistemaDefensivoCode: '',
    atletaPrincipalId: '',
    tipoFinalizacaoCode: '',
    resultadoFactualCode: '',
    motivoPontuacaoCode: '',
    pontosJogada: '0',
    causaProvavelCode: '',
    prioridadeTreinoCode: '',
    videoRef: '',
    obsGeral: '',
    categoriaAcaoCode: '',
    acaoBasicaCode: '',
    classificacaoAcaoCode: '',
    ...seed,
  }
}

function toOptional(value: string): string | undefined {
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

function toPointChipValues(points: readonly (1 | 2)[]): Array<'1' | '2'> {
  return points.map((point) => String(point) as '1' | '2')
}

function humanizeBackendError(message: string) {
  if (message.includes('missing required scout live entry fields')) return 'Preencha os campos obrigatórios da coleta ao vivo.'
  if (message.includes('status_validacao_code must be PENDENTE on create')) return 'A entrada ao vivo sempre nasce como Pendente.'
  if (message.includes('INVALID_CODEBOOK_VALUE: fase_da_bola_code')) return 'A fase da bola informada não é válida.'
  if (message.includes('INVALID_CODEBOOK_VALUE: fase_equipe_analisada_code')) return 'A fase da equipe analisada não é válida.'
  if (message.includes('INVALID_CODEBOOK_VALUE: sistema_ofensivo_code')) return 'O sistema ofensivo informado não é válido.'
  if (message.includes('INVALID_CODEBOOK_VALUE: sistema_defensivo_code')) return 'O sistema defensivo informado não é válido.'
  if (message.includes('INVALID_CODEBOOK_VALUE: tipo_finalizacao_code')) return 'O tipo de finalização informado não é válido.'
  if (message.includes('INVALID_CODEBOOK_VALUE: resultado_factual_code')) return 'O resultado factual informado não é válido.'
  if (message.includes('INVALID_CODEBOOK_VALUE: motivo_pontuacao_code')) return 'O motivo da pontuação informado não é válido.'
  if (message.includes('INVALID_CODEBOOK_VALUE: causa_provavel_code')) return 'A causa provável informada não é válida.'
  if (message.includes('INVALID_CODEBOOK_VALUE: prioridade_treino_code')) return 'A prioridade de treino informada não é válida.'
  if (message.includes('INVALID_CODEBOOK_VALUE: categoria_acao_code')) return 'A categoria da ação informada não é válida.'
  if (message.includes('INVALID_CODEBOOK_VALUE: acao_basica_code')) return 'A ação básica informada não é válida para essa categoria.'
  if (message.includes('INVALID_CODEBOOK_VALUE: classificacao_acao_code')) return 'A classificação da ação informada não é válida para essa ação básica.'
  if (message.includes('INVALID_CONTEXT: FINALIZ_CONTRA not allowed in AT_POS')) return 'Transição direta não é válida em ataque posicionado.'
  if (message.includes('INVALID_CONTEXT: classificacao_acao_code') && message.includes('AT_POS for ARREMESSO')) return 'Classificação de arremesso inválida para ataque posicionado.'
  if (message.includes('sistema_ofensivo_code required for AT_POS')) return 'Em ataque posicionado, o sistema ofensivo é obrigatório.'
  if (message.includes('sistema_defensivo_code required for DEF_POS')) return 'Em defesa posicionada, o sistema defensivo é obrigatório.'
  if (message.includes('tipo_finalizacao_code required for finalization result')) return 'Informe o tipo de finalização quando houve finalização.'
  if (message.includes('tipo_finalizacao_code not allowed without finalization result')) return 'Não informe tipo de finalização quando não houve finalização.'
  if (message.includes('motivo_pontuacao_code required for GOL')) return 'Quando houver gol, informe o motivo da pontuação.'
  if (message.includes('motivo_pontuacao_code only allowed for GOL')) return 'Motivo da pontuação só deve aparecer quando o resultado factual for gol.'
  if (message.includes('pontos_jogada required for GOL')) return 'Informe a pontuação da jogada quando o resultado factual for gol.'
  if (message.includes('pontos_jogada must be 1 or 2 when resultado_factual_code is GOL')) return 'Gol no handebol de praia precisa valer 1 ou 2 pontos.'
  if (message.includes('pontos_jogada must be 0 or null when resultado_factual_code is not GOL')) return 'Sem gol, a pontuação da jogada deve ser 0.'
  if (message.includes('pontos_jogada does not match motivo_pontuacao_code')) return 'A pontuação da jogada não bate com o motivo da pontuação.'
  if (message.includes('motivo_pontuacao_code incompatible with tipo_finalizacao_code')) return 'O motivo da pontuação não bate com o tipo de finalização.'
  if (message.includes('ATHLETE_OUT_OF_SCOPE: atleta_principal_id')) return 'A atleta principal não pertence ao escopo permitido deste jogo.'
  if (message.includes('acao_principal_text too long')) return 'A ação principal precisa ser curta.'
  if (message.includes('acao_principal_text has invalid format')) return 'A ação principal precisa ser curta e objetiva.'
  if (message.includes('acao_principal_text collides with non-action codebook')) return 'A ação principal não pode substituir causa, resultado ou prioridade.'
  if (message.includes('acao_principal_text mixes diagnosis or result')) return 'A ação principal não pode virar causa, resultado, feedback ou comentário.'
  if (message.includes('acao_principal_text required for observed sequence')) return 'Informe a ação principal quando a sequência tiver ação observável.'
  if (message.includes('duplicate id_jogada for scout game')) return 'Já existe uma entrada com esse ID de jogada neste jogo.'
  if (message.includes('equipe_analisada_id incompatible with scout game')) return 'A equipe analisada não é compatível com o jogo selecionado.'
  if (message.includes('scout game not found')) return 'O jogo selecionado não foi encontrado.'
  if (message.includes('permission denied')) return 'Você não tem permissão para registrar essa entrada.'
  return message
}


function getStatusTone(status: ScoutLiveEntry['statusValidacaoCode']) {
  switch (status) {
    case 'VALIDADO':
      return 'bg-green-500/20 text-green-200 border-green-400/30'
    case 'CORRIGIDO':
      return 'bg-amber-500/20 text-amber-100 border-amber-400/30'
    case 'DUVIDA':
      return 'bg-red-500/20 text-red-100 border-red-400/30'
    case 'REVISADO':
      return 'bg-sky-500/20 text-sky-100 border-sky-400/30'
    default:
      return 'bg-cep-purple-800 text-cep-lime-300 border-cep-purple-700'
  }
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-3xl border border-cep-purple-800 bg-cep-purple-900/70 p-5 shadow-[0_24px_80px_rgba(11,6,25,0.28)]">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-cep-white">{title}</h2>
        {description ? <p className="mt-1 text-sm text-cep-muted">{description}</p> : null}
      </div>
      {children}
    </section>
  )
}

function ChoiceChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-full border px-3 py-2 text-sm font-medium transition-colors',
        active
          ? 'border-cep-lime-400/40 bg-cep-lime-400/15 text-cep-white'
          : 'border-cep-purple-700 bg-cep-purple-900/70 text-cep-muted hover:border-cep-lime-400/30 hover:text-cep-white',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder = 'Selecione',
  disabled = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: ScoutCodeValue[] | Array<{ code: string; label: string }>
  placeholder?: string
  disabled?: boolean
}) {
  return (
    <label className="space-y-1.5">
      <span className="block text-xs font-medium uppercase tracking-[0.18em] text-cep-muted">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="h-11 w-full rounded-2xl border border-cep-purple-700 bg-cep-purple-950 px-3 text-sm text-cep-white focus:outline-none focus:ring-2 focus:ring-cep-lime-400 disabled:cursor-not-allowed disabled:opacity-60"
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
  disabled = false,
  inputRef,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  disabled?: boolean
  inputRef?: React.RefObject<HTMLInputElement | null>
}) {
  return (
    <label className="space-y-1.5">
      <span className="block text-xs font-medium uppercase tracking-[0.18em] text-cep-muted">{label}</span>
      <input
        ref={inputRef}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="h-11 w-full rounded-2xl border border-cep-purple-700 bg-cep-purple-950 px-3 text-sm text-cep-white placeholder:text-cep-muted focus:outline-none focus:ring-2 focus:ring-cep-lime-400 disabled:cursor-not-allowed disabled:opacity-60"
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
    <label className="space-y-1.5">
      <span className="block text-xs font-medium uppercase tracking-[0.18em] text-cep-muted">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full rounded-2xl border border-cep-purple-700 bg-cep-purple-950 px-3 py-2.5 text-sm text-cep-white placeholder:text-cep-muted focus:outline-none focus:ring-2 focus:ring-cep-lime-400"
      />
    </label>
  )
}

export default function ScoutWorkspacePage() {
  const tempoInputRef = useRef<HTMLInputElement | null>(null)
  const [rosterGameAthletes, setRosterGameAthletes] = useState<ScoutGameAthlete[]>([])
  const [allActiveAthletes, setAllActiveAthletes] = useState<AthleteWithScoutProfile[]>([])

  const navigate = useNavigate()
  const { gameId } = useParams<{ gameId: string }>()

  const [games, setGames] = useState<ScoutGameRecord[]>([])
  const [liveEntries, setLiveEntries] = useState<ScoutLiveEntry[]>([])
  const [codebook, setCodebook] = useState<ScoutCodeList[]>([])
  const [selectedGameId, setSelectedGameId] = useState('')
  const [draft, setDraft] = useState<LiveEntryDraft>(buildDraft(1))
  const [loading, setLoading] = useState(true)
  const [loadingEntries, setLoadingEntries] = useState(false)
  const [savingEntry, setSavingEntry] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState('')
  const [detailsExpanded, setDetailsExpanded] = useState(false)
  const [teamPhaseExpanded, setTeamPhaseExpanded] = useState(false)
  const [incompatibleResultWarning, setIncompatibleResultWarning] = useState(false)

  const codebookMap = useMemo(
    () => new Map(codebook.map((list) => [list.listKey, list.values])),
    [codebook],
  )

  const selectedGame = useMemo(
    () => games.find((game) => game.id === selectedGameId),
    [games, selectedGameId],
  )

  const phaseOptions = codebookMap.get('LISTA_FASES') ?? []
  const teamPhaseOptions = codebookMap.get('LISTA_FASE_EQUIPE') ?? []
  const offensiveSystemOptions = draft.faseDaBolaCode === 'AT_POS'
    ? (codebookMap.get('LISTA_SISTEMA_OFENSIVO') ?? []).filter((o) => !o.isNaoAplica)
    : (codebookMap.get('LISTA_SISTEMA_OFENSIVO') ?? [])
  const defensiveSystemOptions = codebookMap.get('LISTA_SISTEMA_DEFENSIVO') ?? []
  const finishTypeOptions = codebookMap.get('LISTA_TIPO_FINALIZACAO') ?? []
  const factualResultOptions = codebookMap.get('LISTA_RESULTADO_FACTUAL') ?? []
  const scoringReasonOptions = codebookMap.get('LISTA_MOTIVO_PONTUACAO') ?? []
  const causeOptions = codebookMap.get('LISTA_CAUSA_PRINCIPAL') ?? []
  const priorityOptions = codebookMap.get('LISTA_PRIORIDADE_TREINO') ?? []
  const statusOptions = codebookMap.get('LISTA_STATUS_VALIDACAO') ?? []
  const categoriaAcaoOptions = codebookMap.get('LISTA_CATEGORIA_ACAO') ?? []
  const selectedCategoryCode = draft.categoriaAcaoCode as LiveCollectionCategoryCode | ''
  const selectedActionCode = draft.acaoBasicaCode as LiveCollectionBasicActionCode | ''
  const selectedClassificationCode = draft.classificacaoAcaoCode as LiveCollectionClassificationCode | ''
  const allowedCategories = getAllowedCategoriesForPhase(draft.faseDaBolaCode)
  const categoriaAcaoOptionsFinal = categoriaAcaoOptions.filter((option) =>
    allowedCategories.includes(option.code as LiveCollectionCategoryCode),
  )
  const allowedBasicActions = selectedCategoryCode
    ? getAllowedBasicActions(draft.faseDaBolaCode, selectedCategoryCode)
    : []
  const acaoBasicaListKey = selectedCategoryCode
    ? getBasicActionListKey(draft.faseDaBolaCode, selectedCategoryCode)
    : undefined
  const acaoBasicaOptions = acaoBasicaListKey
    ? (codebookMap.get(acaoBasicaListKey) ?? []).filter((option) =>
        allowedBasicActions.includes(option.code as LiveCollectionBasicActionCode),
      )
    : []
  const classificacaoListKey = selectedCategoryCode && selectedActionCode
    ? getClassificationListKey(draft.faseDaBolaCode, selectedCategoryCode, selectedActionCode)
    : undefined
  const allowedClassifications = selectedCategoryCode && selectedActionCode
    ? getAllowedClassifications(draft.faseDaBolaCode, selectedCategoryCode, selectedActionCode)
    : []
  const classificacaoOptions = classificacaoListKey
    ? (codebookMap.get(classificacaoListKey) ?? []).filter((option) =>
        allowedClassifications.includes(option.code as LiveCollectionClassificationCode),
      )
    : []

  const phaseLabelMap = useMemo(() => new Map(phaseOptions.map((item) => [item.code, item.label])), [phaseOptions])
  const factualResultLabelMap = useMemo(
    () => new Map(factualResultOptions.map((item) => [item.code, item.label])),
    [factualResultOptions],
  )
  const teamPhaseLabelMap = useMemo(
    () => new Map(teamPhaseOptions.map((item) => [item.code, item.label])),
    [teamPhaseOptions],
  )
  // If the game has a confirmed roster, restrict the select to those athletes.
  // If no roster is confirmed, fall back to all active scout athletes.
  const athleteOptions = useMemo(() => {
    const rosterIds = new Set(rosterGameAthletes.map((r) => r.athleteId))
    const athletes = rosterIds.size > 0
      ? allActiveAthletes.filter((a) => rosterIds.has(a.id))
      : allActiveAthletes
    return athletes.map((a) => ({ code: a.id, label: a.name }))
  }, [rosterGameAthletes, allActiveAthletes])

  const requiresOffensiveSystem = draft.faseDaBolaCode === 'AT_POS'
  const requiresDefensiveSystem = draft.faseDaBolaCode === 'DEF_POS'
  const isDefensiveContext = draft.faseDaBolaCode === 'DEF_POS' || draft.faseDaBolaCode === 'TRANS_DEF'
  const derivedFinishType = selectedCategoryCode && selectedActionCode && selectedClassificationCode
    ? deriveFinishTypeFromClassification(
        draft.faseDaBolaCode,
        selectedCategoryCode,
        selectedActionCode,
        selectedClassificationCode,
      )
    : undefined
  const derivedScoringReason = selectedCategoryCode && selectedActionCode && selectedClassificationCode
    ? deriveScoringReasonFromClassification(
        draft.faseDaBolaCode,
        selectedCategoryCode,
        selectedActionCode,
        selectedClassificationCode,
      )
    : undefined
  const requiresFinishType = selectedCategoryCode && selectedActionCode
    ? shouldShowFinishTypeField(
        draft.faseDaBolaCode,
        selectedCategoryCode,
        selectedActionCode,
        draft.resultadoFactualCode || undefined,
      )
    : false
  const requiresScoringReason = selectedCategoryCode && selectedActionCode
    ? shouldShowScoringFields(
        draft.faseDaBolaCode,
        selectedCategoryCode,
        selectedActionCode,
        draft.resultadoFactualCode || undefined,
      )
    : false
  const requiresPoints = requiresScoringReason
  const classifAutoDerivesMotivo = Boolean(requiresScoringReason && derivedScoringReason)
  const allowedFinishTypes = selectedCategoryCode && selectedActionCode
    ? getAllowedFinishTypes(draft.faseDaBolaCode, selectedCategoryCode, selectedActionCode)
    : []
  const finishTypeOptionsForUI = allowedFinishTypes.length > 0
    ? finishTypeOptions.filter((option) => allowedFinishTypes.includes(option.code as ScoutFinishTypeCode))
    : finishTypeOptions
  const allowedScoringReasons = selectedCategoryCode && selectedActionCode
    ? getAllowedScoringReasons(draft.faseDaBolaCode, selectedCategoryCode, selectedActionCode)
    : []
  const scoringReasonOptionsForUI = scoringReasonOptions.filter((option) =>
    allowedScoringReasons.includes(option.code as ScoutScoringReasonCode),
  )
  const allowedPoints = classifAutoDerivesMotivo && derivedScoringReason
    ? toPointChipValues(getAllowedPointsForScoringReason(derivedScoringReason))
    : draft.motivoPontuacaoCode
      ? toPointChipValues(getAllowedPointsForScoringReason(draft.motivoPontuacaoCode))
      : (['1', '2'] as Array<'1' | '2'>)
  const hasOptionalDetails = Boolean(
    draft.causaProvavelCode || draft.prioridadeTreinoCode || draft.videoRef.trim() || draft.obsGeral.trim(),
  )

  const selectedPhaseLabel = phaseLabelMap.get(draft.faseDaBolaCode) ?? draft.faseDaBolaCode
  const selectedTeamPhaseLabel = teamPhaseLabelMap.get(draft.faseEquipeAnalisadaCode) ?? draft.faseEquipeAnalisadaCode
  const selectedResultLabel = factualResultLabelMap.get(draft.resultadoFactualCode) ?? draft.resultadoFactualCode
  const categoriaAcaoLabel = categoriaAcaoOptions.find((option) => option.code === draft.categoriaAcaoCode)?.label ?? draft.categoriaAcaoCode
  const acaoBasicaLabel = acaoBasicaOptions.find((o) => o.code === draft.acaoBasicaCode)?.label ?? draft.acaoBasicaCode
  const classificacaoLabel = classificacaoOptions.find((option) => option.code === draft.classificacaoAcaoCode)?.label ?? draft.classificacaoAcaoCode
  const currentActionSummary = classificacaoLabel || acaoBasicaLabel || categoriaAcaoLabel || 'Ação pendente'
  const currentScoringSummary = scoringReasonOptions.find((item) => item.code === draft.motivoPontuacaoCode)?.label ?? draft.motivoPontuacaoCode

  // [0085-2] Microcopy contextual por classificação/motivo.
  const scoringMicrocopy = useMemo(() => {
    if (!requiresScoringReason) return ''
    if (derivedScoringReason === 'GIRO')
      return 'Giro normalmente vale 2 pontos. Marque 1 se a arbitragem não validou a execução como pontuação dupla.'
    if (derivedScoringReason === 'AEREA')
      return 'Aérea normalmente vale 2 pontos. Marque 1 se a arbitragem não validou a execução como pontuação dupla.'
    if (draft.motivoPontuacaoCode === 'SIMPLES')
      return 'Arremesso simples vale 1 ponto, exceto quando for especialista, goleira ou 6 metros.'
    if (draft.motivoPontuacaoCode === 'ESPECIALISTA' || draft.motivoPontuacaoCode === 'GOLEIRA' || draft.motivoPontuacaoCode === '6M')
      return 'Pontuação fixa de 2 pontos pela regra.'
    if (draft.motivoPontuacaoCode === 'GOL_CONTRA')
      return 'Gol contra registrado como 1 ponto.'
    return 'Pontuação validada pela arbitragem.'
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requiresScoringReason, derivedScoringReason, draft.motivoPontuacaoCode])

  const allowedFactualResults = useMemo(() => {
    const allowed = getAllowedResultsForSelection(
      draft.faseDaBolaCode,
      selectedCategoryCode,
      selectedActionCode,
    )
    const allowedSet = new Set(allowed)
    return factualResultOptions.filter((option) => allowedSet.has(option.code as ScoutFactualResultCode))
  }, [draft.faseDaBolaCode, factualResultOptions, selectedCategoryCode, selectedActionCode])

  // [0028] Em DEF_POS/TRANS_DEF o resultado GOL é exibido como "Gol sofrido" para clareza semântica
  const displayedFactualResults = useMemo(() => {
    if (!isDefensiveContext) return allowedFactualResults
    return allowedFactualResults.map((r) =>
      r.code === 'GOL' ? { ...r, label: 'Gol sofrido' } : r
    )
  }, [allowedFactualResults, isDefensiveContext])
  const optionalDetailsCount = [draft.causaProvavelCode, draft.prioridadeTreinoCode, draft.videoRef.trim(), draft.obsGeral.trim()].filter(Boolean).length

  // UX-04 — quando a ação muda, limpar resultado factual se incompatível
  useEffect(() => {
    if (!draft.resultadoFactualCode) return // já em estado vazio, nada a limpar
    const allowed = new Set(allowedFactualResults.map((r) => r.code))
    if (!allowed.has(draft.resultadoFactualCode)) {
      setDraft((current) => ({
        ...current,
        resultadoFactualCode: '',
        tipoFinalizacaoCode: '',
        motivoPontuacaoCode: '',
        pontosJogada: '0',
      }))
      setIncompatibleResultWarning(true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowedFactualResults, draft.resultadoFactualCode])

  useEffect(() => {
    if (hasOptionalDetails) {
      setDetailsExpanded(true)
    }
  }, [hasOptionalDetails])

  useEffect(() => {
    if (allowedFactualResults.length !== 1) return
    const onlyAllowedResult = allowedFactualResults[0]?.code as ScoutFactualResultCode | undefined
    if (!onlyAllowedResult || draft.resultadoFactualCode === onlyAllowedResult) return
    setDraft((current) => ({
      ...current,
      resultadoFactualCode: onlyAllowedResult,
    }))
  }, [allowedFactualResults, draft.resultadoFactualCode])

  useEffect(() => {
    setDraft((current) => {
      let changed = false
      const next = { ...current }

      if (!requiresFinishType && current.tipoFinalizacaoCode) {
        next.tipoFinalizacaoCode = ''
        changed = true
      }

      if (
        requiresFinishType &&
        allowedFinishTypes.length > 0 &&
        current.tipoFinalizacaoCode &&
        !allowedFinishTypes.includes(current.tipoFinalizacaoCode)
      ) {
        next.tipoFinalizacaoCode = ''
        changed = true
      }

      if (!requiresScoringReason) {
        if (current.motivoPontuacaoCode || current.pontosJogada !== '0') {
          next.motivoPontuacaoCode = ''
          next.pontosJogada = '0'
          changed = true
        }
        return changed ? next : current
      }

      if (derivedScoringReason) {
        const derivedPoints = toPointChipValues(getAllowedPointsForScoringReason(derivedScoringReason))
        const fallbackPoint = derivedPoints.includes('2') ? '2' : (derivedPoints[0] ?? '1')

        if (current.motivoPontuacaoCode !== derivedScoringReason) {
          next.motivoPontuacaoCode = derivedScoringReason
          changed = true
        }

        if (!derivedPoints.includes(current.pontosJogada as '1' | '2')) {
          next.pontosJogada = fallbackPoint
          changed = true
        }

        return changed ? next : current
      }

      if (current.motivoPontuacaoCode && !allowedScoringReasons.includes(current.motivoPontuacaoCode)) {
        next.motivoPontuacaoCode = ''
        next.pontosJogada = '0'
        changed = true
      }

      if (!next.motivoPontuacaoCode) {
        if (current.pontosJogada !== '0') {
          next.pontosJogada = '0'
          changed = true
        }
        return changed ? next : current
      }

      const nextAllowedPoints = toPointChipValues(getAllowedPointsForScoringReason(next.motivoPontuacaoCode))
      if (nextAllowedPoints.length === 1 && next.pontosJogada !== nextAllowedPoints[0]) {
        next.pontosJogada = nextAllowedPoints[0]
        changed = true
      } else if (!nextAllowedPoints.includes(next.pontosJogada as '1' | '2')) {
        next.pontosJogada = nextAllowedPoints[0] ?? '1'
        changed = true
      }

      return changed ? next : current
    })
  }, [allowedFinishTypes, allowedScoringReasons, derivedScoringReason, requiresFinishType, requiresScoringReason])

  useEffect(() => {
    let active = true

    async function bootstrap() {
      setLoading(true)
      setError('')
      try {
        const [gameRows, codebookRows] = await Promise.all([
          fetchScoutGames(),
          fetchScoutCodebook([...CODEBOOK_KEYS]),
        ])

        if (!active) return

        setGames(gameRows)
        setCodebook(codebookRows)

        if (gameId) {
          const found = gameRows.find((g) => g.id === gameId)
          if (found) {
            setSelectedGameId(found.id)
          } else {
            setError('Sessão não encontrada. Volte para a Central do Scout.')
          }
        }
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Falha ao carregar a coleta ao vivo.')
      } finally {
        if (active) setLoading(false)
      }
    }

    void bootstrap()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true

    async function loadGameData() {
      if (!selectedGameId) {
        setLiveEntries([])
        setRosterGameAthletes([])
        setAllActiveAthletes([])
        return
      }

      setLoadingEntries(true)
      setError('')

      try {
        const [rows, rosterRows, activeAthletes] = await Promise.all([
          fetchScoutLiveEntriesForGame(selectedGameId),
          fetchScoutGameAthletes(selectedGameId),
          fetchScoutAthletes({ status: 'ativo' }),
        ])
        if (!active) return
        setLiveEntries(rows)
        setRosterGameAthletes(rosterRows)
        setAllActiveAthletes(activeAthletes)
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Falha ao carregar as entradas ao vivo.')
      } finally {
        if (active) setLoadingEntries(false)
      }
    }

    void loadGameData()
    return () => {
      active = false
    }
  }, [selectedGameId])

  useEffect(() => {
    if (!selectedGame) {
      setDraft(buildDraft(1))
      setTeamPhaseExpanded(false)
      return
    }

    setDraft((current) => {
      const next = buildDraft(liveEntries.length + 1, {
        faseDaBolaCode: current.faseDaBolaCode,
        faseEquipeAnalisadaCode: current.faseEquipeAnalisadaCode,
        sistemaOfensivoCode: current.sistemaOfensivoCode,
        sistemaDefensivoCode: current.sistemaDefensivoCode,
      })
      return {
        ...next,
        tempoJogo: current.tempoJogo === '00:00' ? next.tempoJogo : current.tempoJogo,
      }
    })
  }, [selectedGame, liveEntries.length])

  // [0028] Auto-seleciona acao_basica quando a categoria tem apenas uma opção
  // (PASSE → PASSE, ARREMESSO → ARREMESSO). Evita clique extra desnecessário.
  useEffect(() => {
    if (!draft.categoriaAcaoCode || acaoBasicaOptions.length !== 1) return
    if (draft.acaoBasicaCode === acaoBasicaOptions[0].code) return
    setDraft((cur) => ({
      ...cur,
      acaoBasicaCode: acaoBasicaOptions[0].code,
      classificacaoAcaoCode: '',
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.categoriaAcaoCode, acaoBasicaOptions])

  function focusTempoField() {
    requestAnimationFrame(() => {
      tempoInputRef.current?.focus()
      tempoInputRef.current?.select()
    })
  }

  function buildFollowUpDraft(entryNumber: number, current: LiveEntryDraft) {
    return buildDraft(entryNumber, {
      faseDaBolaCode: current.faseDaBolaCode,
      faseEquipeAnalisadaCode: current.faseEquipeAnalisadaCode,
      sistemaOfensivoCode: current.sistemaOfensivoCode,
      sistemaDefensivoCode: current.sistemaDefensivoCode,
    })
  }


  function updateDraft<K extends keyof LiveEntryDraft>(field: K, value: LiveEntryDraft[K]) {
    if (field === 'faseDaBolaCode') {
      setTeamPhaseExpanded(false)
      setIncompatibleResultWarning(true) // UX-04 — aviso ao trocar fase
    }

    setDraft((current) => {
      const next = {
        ...current,
        [field]: value,
      }

      if (field === 'faseDaBolaCode') {
        const phase = value as ScoutPhaseCode
        if (phase === 'AT_POS') next.faseEquipeAnalisadaCode = 'ATAQUE'
        if (phase === 'DEF_POS') next.faseEquipeAnalisadaCode = 'DEFESA'
        if (phase === 'TRANS_OF') next.faseEquipeAnalisadaCode = 'TRANS_OF'
        if (phase === 'TRANS_DEF') next.faseEquipeAnalisadaCode = 'TRANS_DEF'
        next.resultadoFactualCode = ''
        next.tipoFinalizacaoCode = ''
        next.motivoPontuacaoCode = ''
        next.pontosJogada = '0'
        if (!next.categoriaAcaoCode || !getAllowedCategoriesForPhase(phase).includes(next.categoriaAcaoCode as LiveCollectionCategoryCode)) {
          next.categoriaAcaoCode = ''
          next.acaoBasicaCode = ''
          next.classificacaoAcaoCode = ''
        }
      }

      if (field === 'categoriaAcaoCode') {
        next.acaoBasicaCode = ''
        next.classificacaoAcaoCode = ''
        next.resultadoFactualCode = ''
        next.tipoFinalizacaoCode = ''
        next.motivoPontuacaoCode = ''
        next.pontosJogada = '0'
      }

      if (field === 'acaoBasicaCode') {
        next.classificacaoAcaoCode = ''
        next.resultadoFactualCode = ''
        next.tipoFinalizacaoCode = ''
        next.motivoPontuacaoCode = ''
        next.pontosJogada = '0'
      }

      if (field === 'classificacaoAcaoCode') {
        const classification = value as LiveCollectionClassificationCode | ''
        const derivedFinish = classification && next.categoriaAcaoCode && next.acaoBasicaCode
          ? deriveFinishTypeFromClassification(
              next.faseDaBolaCode,
              next.categoriaAcaoCode as LiveCollectionCategoryCode,
              next.acaoBasicaCode as LiveCollectionBasicActionCode,
              classification,
            )
          : undefined
        const derivedScoring = classification && next.categoriaAcaoCode && next.acaoBasicaCode
          ? deriveScoringReasonFromClassification(
              next.faseDaBolaCode,
              next.categoriaAcaoCode as LiveCollectionCategoryCode,
              next.acaoBasicaCode as LiveCollectionBasicActionCode,
              classification,
            )
          : undefined

        next.tipoFinalizacaoCode = derivedFinish ?? ''
        next.motivoPontuacaoCode = derivedScoring ?? ''
        next.pontosJogada = '0'

        if (derivedScoring) {
          const nextAllowedPoints = toPointChipValues(getAllowedPointsForScoringReason(derivedScoring))
          if (nextAllowedPoints.length === 1) {
            next.pontosJogada = nextAllowedPoints[0]
          }
        }
      }

      if (field === 'resultadoFactualCode') {
        const factual = value as ScoutFactualResultCode
        const nextRequiresScoring = selectedCategoryCode && selectedActionCode
          ? shouldShowScoringFields(
              current.faseDaBolaCode,
              selectedCategoryCode,
              selectedActionCode,
              factual,
            )
          : false
        const nextRequiresFinish = selectedCategoryCode && selectedActionCode
          ? shouldShowFinishTypeField(
              current.faseDaBolaCode,
              selectedCategoryCode,
              selectedActionCode,
              factual,
            )
          : false

        if (!nextRequiresScoring) {
          next.motivoPontuacaoCode = ''
          next.pontosJogada = '0'
        }

        if (!nextRequiresFinish) {
          next.tipoFinalizacaoCode = ''
        }
      }

      if (field === 'motivoPontuacaoCode') {
        const reason = value as ScoutScoringReasonCode | ''
        if (!reason) {
          next.pontosJogada = '0'
        } else {
          const nextAllowedPoints = toPointChipValues(getAllowedPointsForScoringReason(reason))
          if (nextAllowedPoints.length === 1) {
            next.pontosJogada = nextAllowedPoints[0]
          } else if (!nextAllowedPoints.includes(next.pontosJogada as '1' | '2')) {
            next.pontosJogada = '1'
          }
        }
      }

      return next
    })
  }

  function handleResetDraft() {
    setDraft(buildFollowUpDraft(liveEntries.length + 1, draft))
    setDetailsExpanded(false)
    setError('')
    setFeedback('Rascunho limpo para a próxima sequência.')
    focusTempoField()
  }

  async function handleSubmitEntry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!selectedGame) {
      setError('Selecione um jogo antes de registrar a coleta ao vivo.')
      return
    }

    if (!draft.resultadoFactualCode) {
      setError('Selecione o desfecho da sequência.')
      return
    }

    setSavingEntry(true)
    setFeedback('')
    setError('')

    try {
      const input: ScoutLiveEntryWriteInput = {
        scoutGameId: selectedGame.id,
        idJogada: draft.idJogada.trim(),
        tempoJogo: draft.tempoJogo.trim(),
        faseDaBolaCode: draft.faseDaBolaCode,
        equipeAnalisadaId: selectedGame.teamId,
        faseEquipeAnalisadaCode: draft.faseEquipeAnalisadaCode,
        sistemaOfensivoCode: requiresOffensiveSystem ? toOptional(draft.sistemaOfensivoCode) : undefined,
        sistemaDefensivoCode: requiresDefensiveSystem ? toOptional(draft.sistemaDefensivoCode) : undefined,
        atletaPrincipalId: toOptional(draft.atletaPrincipalId),
        acaoPrincipalText: undefined,
        acaoPrincipalSuggestionCode: undefined,
        acaoPrincipalIsCustom: null,
        tipoFinalizacaoCode: requiresFinishType
          ? (toOptional(draft.tipoFinalizacaoCode) as ScoutFinishTypeCode | undefined)
          : draft.tipoFinalizacaoCode
            ? (draft.tipoFinalizacaoCode as ScoutFinishTypeCode)
            : derivedFinishType
              ? (derivedFinishType as ScoutFinishTypeCode)
              : undefined,
        resultadoFactualCode: draft.resultadoFactualCode,
        motivoPontuacaoCode: requiresScoringReason
          ? (
              classifAutoDerivesMotivo
                ? (draft.motivoPontuacaoCode || derivedScoringReason)
                : toOptional(draft.motivoPontuacaoCode)
            ) as ScoutScoringReasonCode | undefined
          : undefined,
        pontosJogada: requiresPoints ? Number(draft.pontosJogada || '0') as 0 | 1 | 2 : 0,
        causaProvavelCode: toOptional(draft.causaProvavelCode),
        prioridadeTreinoCode: toOptional(draft.prioridadeTreinoCode),
        videoRef: toOptional(draft.videoRef),
        obsGeral: toOptional(draft.obsGeral),
        categoriaAcaoCode: toOptional(draft.categoriaAcaoCode),
        acaoBasicaCode: toOptional(draft.acaoBasicaCode),
        classificacaoAcaoCode: toOptional(draft.classificacaoAcaoCode),
      }

      const created = await createScoutLiveEntry(input)
      const nextEntries = [...liveEntries, created]
      setLiveEntries(nextEntries)
      setDraft(buildFollowUpDraft(nextEntries.length + 1, draft))
      setDetailsExpanded(false)
      setTeamPhaseExpanded(false)
      setFeedback(`Entrada criada como ${statusOptions.find((item) => item.code === created.statusValidacaoCode)?.label ?? created.statusValidacaoCode}.`)
      focusTempoField()
    } catch (err) {
      const rawMessage = err instanceof Error ? err.message : 'Falha ao criar entrada da coleta ao vivo.'
      setError(humanizeBackendError(rawMessage))
    } finally {
      setSavingEntry(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center px-6 py-20">
        <p className="text-sm text-cep-muted">Carregando a coleta ao vivo do scout…</p>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-[radial-gradient(circle_at_top_left,_rgba(184,255,84,0.08),_transparent_28%),linear-gradient(180deg,_rgba(34,16,61,0.98),_rgba(14,7,28,1))] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Quick nav: sub-telas scout */}
        <div className="flex flex-wrap gap-2 mb-1">
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
            onClick={() => navigate('/scout/report')}
            className="inline-flex items-center gap-1.5 rounded-full border border-cep-purple-700 bg-cep-purple-950/60 px-3 py-1 text-xs font-medium text-cep-muted hover:text-cep-white hover:border-cep-purple-500 transition-colors"
          >
            <BarChart2 className="h-3.5 w-3.5" />
            Relatório
          </button>
          <button
            onClick={() => navigate('/scout/feedback')}
            className="inline-flex items-center gap-1.5 rounded-full border border-cep-purple-700 bg-cep-purple-950/60 px-3 py-1 text-xs font-medium text-cep-muted hover:text-cep-white hover:border-cep-purple-500 transition-colors"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Feedback
          </button>
          <button
            onClick={() => navigate('/scout/dashboard')}
            className="inline-flex items-center gap-1.5 rounded-full border border-cep-purple-700 bg-cep-purple-950/60 px-3 py-1 text-xs font-medium text-cep-muted hover:text-cep-white hover:border-cep-purple-500 transition-colors"
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            Dashboard
          </button>
        </div>
        <header className="rounded-[2rem] border border-cep-purple-800 bg-cep-purple-900/80 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-cep-purple-700 bg-cep-purple-950/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-cep-lime-300">
                <Radar className="h-3.5 w-3.5" />
                Coleta ao vivo
              </span>
              <h1 className="text-3xl font-semibold text-cep-white">Registrar uma sequência rápida do jogo</h1>
              <p className="max-w-3xl text-sm leading-6 text-cep-muted">
                Esta tela registra a captura rápida da jogada. Ela não cria análise detalhada, não cria participações automaticamente
                e não substitui a revisão por vídeo.
              </p>
            </div>
            <div className="rounded-2xl border border-cep-purple-700 bg-cep-purple-950/60 px-4 py-3 text-sm text-cep-muted">
              <div className="font-medium text-cep-white">Status inicial da entrada</div>
              <div className="mt-1 inline-flex rounded-full border border-cep-purple-700 bg-cep-purple-900 px-3 py-1 text-xs font-medium text-cep-lime-300">
                PENDENTE
              </div>
            </div>
          </div>
        </header>

        {error ? (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</div>
        ) : null}
        {feedback ? (
          <div className="rounded-2xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-100">{feedback}</div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <div className="space-y-6">
            {/* Sessão vinculada (read-only — gameId vem da URL) */}
            <div className="rounded-2xl border border-cep-lime-400/30 bg-cep-lime-400/5 p-4">
              {selectedGame ? (
                <>
                  <p className="text-xs font-medium uppercase tracking-widest text-cep-lime-400 mb-1">
                    Sessão ativa
                  </p>
                  <p className="text-sm font-semibold text-cep-white">
                    {selectedGame.opponent ?? 'Sem adversária'}
                  </p>
                  {selectedGame.gameDate && (
                    <p className="text-xs text-cep-muted mt-0.5">{selectedGame.gameDate}</p>
                  )}
                </>
              ) : error ? (
                <p className="text-sm text-red-400">{error}</p>
              ) : (
                <p className="text-sm text-cep-muted">Nenhuma sessão vinculada.</p>
              )}
              <div className="mt-3 flex gap-3">
                <button
                  onClick={() => navigate('/scout')}
                  className="text-xs text-cep-muted hover:text-cep-white underline underline-offset-2 transition-colors"
                >
                  ← Central do Scout
                </button>
                <button
                  onClick={() => navigate('/scout/preparar')}
                  className="text-xs text-cep-muted hover:text-cep-white underline underline-offset-2 transition-colors"
                >
                  Nova sessão
                </button>
              </div>
            </div>

            <SectionCard
              title="Entradas do jogo"
              description="Sequências rápidas já registradas neste jogo."
            >
              {selectedGameId ? (
                loadingEntries ? (
                  <p className="text-sm text-cep-muted">Carregando entradas…</p>
                ) : liveEntries.length ? (
                  <div className="space-y-3">
                    {liveEntries.map((entry) => (
                      <article key={entry.id} className="rounded-2xl border border-cep-purple-700 bg-cep-purple-950/70 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold text-cep-white">{entry.idJogada}</div>
                            <div className="mt-1 text-xs uppercase tracking-[0.16em] text-cep-muted">
                              {entry.tempoJogo} · {phaseLabelMap.get(entry.faseDaBolaCode) ?? entry.faseDaBolaCode}
                            </div>
                          </div>
                          <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.18em] ${getStatusTone(entry.statusValidacaoCode)}`}>
                            {entry.statusValidacaoCode}
                          </span>
                        </div>
                        <div className="mt-3 grid gap-2 text-sm text-cep-muted sm:grid-cols-2">
                          <div>
                            <span className="text-cep-white">Resultado:</span>{' '}
                            {factualResultLabelMap.get(entry.resultadoFactualCode) ?? entry.resultadoFactualCode}
                          </div>
                          <div>
                            <span className="text-cep-white">Fase da equipe:</span>{' '}
                            {teamPhaseLabelMap.get(entry.faseEquipeAnalisadaCode) ?? entry.faseEquipeAnalisadaCode}
                          </div>
                          {entry.acaoPrincipalText ? (
                            <div className="sm:col-span-2">
                              <span className="text-cep-white">Ação principal:</span> {entry.acaoPrincipalText}
                            </div>
                          ) : null}
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={ClipboardList}
                    title="Nenhuma sequência registrada"
                    description="Selecione um jogo e envie a primeira entrada da coleta ao vivo."
                  />
                )
              ) : (
                <EmptyState
                  icon={ClipboardList}
                  title="Selecione um jogo"
                  description="A coleta ao vivo precisa nascer dentro de um jogo."
                />
              )}
            </SectionCard>
          </div>

          <SectionCard
            title="Nova entrada ao vivo"
            description="Registre só a informação rápida e central da sequência. A análise detalhada vem depois."
          >
            {selectedGame ? (
              <form className="space-y-6 pb-32" onSubmit={handleSubmitEntry}>
                <div className="rounded-2xl border border-cep-purple-700 bg-cep-purple-950/50 p-4">
                  <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.16em] text-cep-muted">
                    <span className="rounded-full border border-cep-purple-700 px-3 py-1 text-cep-white">
                      Jogo ativo
                    </span>
                    <span className="rounded-full border border-cep-purple-700 px-3 py-1">
                      Equipe: <span className="text-cep-white">{selectedGame.analyzedTeam ?? 'CEPRAEA'}</span>
                    </span>
                    <span className="rounded-full border border-cep-purple-700 px-3 py-1">
                      Status: <span className="text-cep-lime-300">PENDENTE</span>
                    </span>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_220px]">
                  <TextField label="ID da jogada" value={draft.idJogada} onChange={(value) => updateDraft('idJogada', value)} />
                  <TextField
                    label="Tempo do jogo"
                    value={draft.tempoJogo}
                    onChange={(value) => updateDraft('tempoJogo', value)}
                    placeholder="Ex.: 03:21"
                    inputRef={tempoInputRef}
                  />
                  <div className="space-y-1.5">
                    <SelectField
                      label="Atleta principal"
                      value={draft.atletaPrincipalId}
                      onChange={(value) => updateDraft('atletaPrincipalId', value)}
                      options={athleteOptions}
                      placeholder="Sem protagonista clara"
                    />
                    <p className="text-xs text-cep-muted">
                      Marque apenas a atleta protagonista da ação. Posição/função detalhada será registrada na revisão.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 rounded-2xl border border-cep-purple-700 bg-cep-purple-950/50 p-4">
                  <div className="text-xs font-medium uppercase tracking-[0.18em] text-cep-muted">Fase da bola</div>
                  <div className="flex flex-wrap gap-2">
                    {phaseOptions.map((option) => (
                      <ChoiceChip
                        key={option.code}
                        active={draft.faseDaBolaCode === option.code}
                        onClick={() => updateDraft('faseDaBolaCode', option.code as ScoutPhaseCode)}
                      >
                        {option.label}
                      </ChoiceChip>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                  <div className="rounded-2xl border border-cep-purple-700 bg-cep-purple-950/50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-medium uppercase tracking-[0.18em] text-cep-muted">Fase da equipe analisada</div>
                        <div className="mt-2 text-sm text-cep-muted">
                          Sugerida pela fase da bola: <span className="font-medium text-cep-white">{selectedTeamPhaseLabel}</span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setTeamPhaseExpanded((current) => !current)}
                      >
                        {teamPhaseExpanded ? 'Fechar ajuste' : 'Ajustar'}
                      </Button>
                    </div>
                    {teamPhaseExpanded ? (
                      <div className="mt-4">
                        <SelectField
                          label="Ajustar fase da equipe"
                          value={draft.faseEquipeAnalisadaCode}
                          onChange={(value) => updateDraft('faseEquipeAnalisadaCode', value as ScoutAnalyzedTeamPhaseCode)}
                          options={teamPhaseOptions}
                        />
                      </div>
                    ) : null}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {requiresOffensiveSystem ? (
                      <SelectField
                        label="Sistema ofensivo"
                        value={draft.sistemaOfensivoCode}
                        onChange={(value) => updateDraft('sistemaOfensivoCode', value)}
                        options={offensiveSystemOptions}
                      />
                    ) : null}

                    {requiresDefensiveSystem ? (
                      <SelectField
                        label="Sistema defensivo"
                        value={draft.sistemaDefensivoCode}
                        onChange={(value) => updateDraft('sistemaDefensivoCode', value)}
                        options={defensiveSystemOptions}
                      />
                    ) : null}
                  </div>
                </div>

                <div className="space-y-4 rounded-2xl border border-cep-purple-700 bg-cep-purple-950/50 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-cep-white">
                    <TimerReset className="h-4 w-4 text-cep-lime-300" />
                    Ação
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-medium uppercase tracking-[0.18em] text-cep-muted">Categoria da ação</div>
                    <div className="flex flex-wrap gap-2">
                      {categoriaAcaoOptionsFinal.map((option) => (
                        <ChoiceChip
                          key={option.code}
                          active={draft.categoriaAcaoCode === option.code}
                          onClick={() => {
                            updateDraft('categoriaAcaoCode', draft.categoriaAcaoCode === option.code ? '' : option.code)
                            setIncompatibleResultWarning(false)
                          }}
                        >
                          {option.label}
                        </ChoiceChip>
                      ))}
                    </div>
                  </div>

                  {acaoBasicaOptions.length > 0 ? (
                    <div className="space-y-2">
                      <div className="text-xs font-medium uppercase tracking-[0.18em] text-cep-muted">Ação básica</div>
                      <div className="flex flex-wrap gap-2">
                        {acaoBasicaOptions.map((option) => (
                          <ChoiceChip
                            key={option.code}
                            active={draft.acaoBasicaCode === option.code}
                            onClick={() => {
                              updateDraft('acaoBasicaCode', draft.acaoBasicaCode === option.code ? '' : option.code)
                              setIncompatibleResultWarning(false)
                            }}
                          >
                            {option.label}
                          </ChoiceChip>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {classificacaoOptions.length > 0 ? (
                    <div className="space-y-2">
                      <div className="text-xs font-medium uppercase tracking-[0.18em] text-cep-muted">Classificação</div>
                      <div className="flex flex-wrap gap-2">
                        {classificacaoOptions.map((option) => (
                          <ChoiceChip
                            key={option.code}
                            active={draft.classificacaoAcaoCode === option.code}
                            onClick={() => updateDraft('classificacaoAcaoCode', draft.classificacaoAcaoCode === option.code ? '' : option.code)}
                          >
                            {option.label}
                          </ChoiceChip>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="space-y-3 rounded-2xl border border-cep-purple-700 bg-cep-purple-950/50 p-4">
                  <div className="text-xs font-medium uppercase tracking-[0.18em] text-cep-muted">Resultado factual</div>
                  {incompatibleResultWarning ? (
                    <p className="text-xs text-amber-400">
                      Você mudou a categoria ou a ação. O resultado anterior não combina mais com essa escolha. Escolha um novo resultado factual compatível.
                    </p>
                  ) : null}
                  <div className="flex flex-wrap gap-2">
                    {displayedFactualResults.map((option) => (
                      <ChoiceChip
                        key={option.code}
                        active={draft.resultadoFactualCode === option.code}
                        onClick={() => {
                          updateDraft('resultadoFactualCode', option.code as ScoutFactualResultCode)
                          setIncompatibleResultWarning(false)
                        }}
                      >
                        {option.label}
                      </ChoiceChip>
                    ))}
                  </div>
                  <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] xl:grid-cols-[minmax(0,1fr)_auto_auto]">
                    {requiresFinishType ? (
                      <div className="space-y-1.5">
                        <SelectField
                          label={isDefensiveContext ? 'Finalização adversária enfrentada' : 'Tipo de finalização'}
                          value={draft.tipoFinalizacaoCode}
                          onChange={(value) => updateDraft('tipoFinalizacaoCode', value as ScoutFinishTypeCode | '')}
                          options={finishTypeOptionsForUI}
                        />
                        {isDefensiveContext && (
                          <p className="text-xs text-cep-muted">Finalização adversária enfrentada.</p>
                        )}
                      </div>
                    ) : null}
                    {requiresScoringReason && !classifAutoDerivesMotivo ? (
                      <div className="space-y-1.5 md:col-span-2 xl:col-span-1">
                        <span className="block text-xs font-medium uppercase tracking-[0.18em] text-cep-muted">Motivo da pontuação</span>
                        <div className="flex flex-wrap gap-2">
                          {scoringReasonOptionsForUI.map((option) => (
                            <ChoiceChip
                              key={option.code}
                              active={draft.motivoPontuacaoCode === option.code}
                              onClick={() => updateDraft('motivoPontuacaoCode', option.code as ScoutScoringReasonCode)}
                            >
                              {option.label}
                            </ChoiceChip>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    {requiresPoints ? (
                      <div className="space-y-1.5">
                        <span className="block text-xs font-medium uppercase tracking-[0.18em] text-cep-muted">Pontos da jogada</span>
                        <div className="flex gap-2">
                          {allowedPoints.map((value) => (
                            <ChoiceChip
                              key={value}
                              active={draft.pontosJogada === value}
                              onClick={() => updateDraft('pontosJogada', value)}
                            >
                              {value}
                            </ChoiceChip>
                          ))}
                        </div>
                        {scoringMicrocopy ? (
                          <p className="text-xs text-cep-muted">{scoringMicrocopy}</p>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="rounded-2xl border border-cep-purple-700 bg-cep-purple-950/50 p-4">
                  <button
                    type="button"
                    onClick={() => setDetailsExpanded((current) => !current)}
                    className="flex w-full items-center justify-between gap-3 text-left"
                  >
                    <div>
                      <div className="text-sm font-medium text-cep-white">Detalhes opcionais / revisar depois</div>
                      <div className="mt-1 text-sm text-cep-muted">
                        Causa provável, prioridade de treino, vídeo e observação entram só se ajudarem a captura rápida.
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-cep-muted">
                      {optionalDetailsCount ? <span>{optionalDetailsCount} preenchido(s)</span> : <span>Opcional</span>}
                      {detailsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </button>

                  {detailsExpanded ? (
                    <div className="mt-4 space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <SelectField
                          label="Causa provável"
                          value={draft.causaProvavelCode}
                          onChange={(value) => updateDraft('causaProvavelCode', value)}
                          options={causeOptions}
                          placeholder="Se observável"
                        />
                        <SelectField
                          label="Prioridade de treino"
                          value={draft.prioridadeTreinoCode}
                          onChange={(value) => updateDraft('prioridadeTreinoCode', value)}
                          options={priorityOptions}
                          placeholder="Se evidente"
                        />
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <TextField
                          label="Referência de vídeo"
                          value={draft.videoRef}
                          onChange={(value) => updateDraft('videoRef', value)}
                          placeholder="Ex.: set1_03m21s"
                        />
                      </div>

                      <TextAreaField
                        label="Observação geral"
                        value={draft.obsGeral}
                        onChange={(value) => updateDraft('obsGeral', value)}
                        placeholder="Observação curta que complemente a sequência"
                      />
                    </div>
                  ) : null}
                </div>

                <div className="sticky bottom-3 z-20 -mx-1 rounded-2xl border border-cep-purple-700 bg-[rgba(14,7,28,0.94)] p-4 shadow-[0_20px_60px_rgba(4,2,10,0.5)] backdrop-blur">
                  <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                    <div className="space-y-1">
                      <div className="text-xs uppercase tracking-[0.16em] text-cep-muted">Resumo da entrada atual</div>
                      <div className="text-sm text-cep-white">
                        {draft.idJogada} · {draft.tempoJogo || 'sem tempo'} · {selectedPhaseLabel} · {currentActionSummary} · {selectedResultLabel}
                        {requiresScoringReason && currentScoringSummary ? ` · ${currentScoringSummary}` : ''}
                        {' · '}PENDENTE
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button type="button" variant="ghost" onClick={handleResetDraft}>
                        <RotateCcw className="h-4 w-4" />
                        Limpar
                      </Button>
                      <Button type="submit" loading={savingEntry}>
                        <CheckCircle2 className="h-4 w-4" />
                        Registrar entrada
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <EmptyState
                icon={Radar}
                title="Escolha um jogo antes de registrar"
                description="A coleta ao vivo precisa ficar vinculada a um jogo existente."
              />
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  )
}

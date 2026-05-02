import { useMemo, useState } from 'react'
import type { ScoutEvent, ScoutAthleteBlock, SpecialistCentralAnalysis, FinishAnalysis, ShootoutAnalysis, ReposicaoAnalysis } from '@/types'
import { Button } from '@/shared/components/Button'
import {
  SCOUT_SETS,
  SCOUT_CONTROLE_JOGO,
  SCOUT_POSSE,
  SCOUT_FASE_JOGO,
  SCOUT_ZONA_ACAO,
  SCOUT_GOLEIRAS,
  SCOUT_REPOSICAO,
  SCOUT_ATLETAS,
  SCOUT_NUMEROS_ADVERSARIA,
  SCOUT_FUNCOES_ATAQUE,
  SCOUT_FUNCOES_DEFESA,
  SCOUT_RESULTADO_INDIVIDUAL,
  SCOUT_RESULTADO_COLETIVO,
  SCOUT_ANALISE,
  SCOUT_ORIGEM_BOLA_ESPECIALISTA,
  SCOUT_MEXIDA_INICIAL,
  SCOUT_COMPORTAMENTO_DEFESA,
  SCOUT_BOOLEANO_TATICO,
  SCOUT_MOMENTO_ATAQUE_ESPECIALISTA,
  SCOUT_RITMO_ESPECIALISTA,
  SCOUT_PREVISIBILIDADE_ESPECIALISTA,
  SCOUT_DECISAO_FINAL_ESPECIALISTA,
  SCOUT_TIPO_FINALIZACAO,
  SCOUT_DIRECAO_GOL,
  SCOUT_PONTOS_LANCE,
  SCOUT_PONTUACAO,
  SCOUT_VALIDADE_TECNICA,
  SCOUT_ACOES_GOLEIRA,
  SCOUT_SHOOTOUT_OFENSIVO,
  SCOUT_SHOOTOUT_DEFENSIVO,
  getSistemasPorFase,
  getAcoesPorFuncao,
} from '../constants'

type Step = 'montagem' | 'acoes' | 'detalhes' | 'fechamento'
type EventFormData = Omit<ScoutEvent, 'id' | 'jogoId' | 'createdAt'>

interface Props {
  jogoId: string
  equipeAnalisada: string
  adversario: string
  initialPlacarCEPRAEA?: number
  initialPlacarAdversario?: number
  initialSet?: string
  onSave: (data: Omit<ScoutEvent, 'id' | 'createdAt'>) => void
  onCancel: () => void
}

const emptyBlock = (): ScoutAthleteBlock => ({})
const makeBlocks = (count: number) => Array.from({ length: count }, emptyBlock)

function SelectField({ label, value, onChange, options, placeholder }: {
  label: string
  value: string
  onChange: (v: string) => void
  options: readonly string[]
  placeholder?: string
}) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-cep-muted">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg bg-cep-purple-800 border border-cep-purple-700 text-cep-white text-sm px-3 h-9 focus:outline-none focus:ring-2 focus:ring-cep-lime-400"
      >
        <option value="">{placeholder ?? '—'}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

function TextInput({ label, value, onChange, placeholder, type = 'text' }: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-cep-muted">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg bg-cep-purple-800 border border-cep-purple-700 text-cep-white text-sm px-3 h-9 focus:outline-none focus:ring-2 focus:ring-cep-lime-400"
      />
    </div>
  )
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-cep-purple-700 bg-cep-purple-900/60 p-3 space-y-3">
      <div>
        <p className="text-xs font-bold text-cep-lime-400 uppercase tracking-wide">{title}</p>
        {description && <p className="text-xs text-cep-muted mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  )
}

function ScoreHeader({ equipeAnalisada, adversario, cepraea, adv }: { equipeAnalisada: string; adversario: string; cepraea: number; adv: number }) {
  return (
    <div className="rounded-xl border border-cep-purple-700 bg-cep-purple-900/70 p-3 flex items-center justify-between">
      <div>
        <p className="text-xs text-cep-muted">{equipeAnalisada}</p>
        <p className="text-2xl font-black text-cep-lime-400">{cepraea}</p>
      </div>
      <p className="text-lg font-bold text-cep-muted">×</p>
      <div className="text-right">
        <p className="text-xs text-cep-muted">{adversario}</p>
        <p className="text-2xl font-black text-cep-white">{adv}</p>
      </div>
    </div>
  )
}

function ParticipantSlot({
  index,
  block,
  mode,
  funcoes,
  onChange,
}: {
  index: number
  block: ScoutAthleteBlock
  mode: 'cepraea' | 'adversario'
  funcoes: readonly string[]
  onChange: (b: ScoutAthleteBlock) => void
}) {
  const set = (key: keyof ScoutAthleteBlock, val: string) => onChange({ ...block, [key]: val || undefined })
  return (
    <div className="grid grid-cols-[44px_1fr] gap-2 items-end rounded-lg border border-cep-purple-800 bg-cep-purple-950/40 p-2">
      <div className="h-9 rounded-lg bg-cep-purple-800 flex items-center justify-center text-xs font-bold text-cep-lime-400">{index + 1}</div>
      <div className="grid grid-cols-1 gap-2">
        {mode === 'cepraea' ? (
          <SelectField label="Atleta CEPRAEA" value={block.atleta ?? ''} onChange={(v) => set('atleta', v)} options={SCOUT_ATLETAS} />
        ) : (
          <SelectField label="Nº adversária" value={block.numero ?? ''} onChange={(v) => set('numero', v)} options={SCOUT_NUMEROS_ADVERSARIA} />
        )}
        <SelectField label="Função / posição" value={block.funcao ?? ''} onChange={(v) => set('funcao', v)} options={funcoes} />
      </div>
    </div>
  )
}

function ActionSlot({
  index,
  block,
  mode,
  type,
  onChange,
}: {
  index: number
  block: ScoutAthleteBlock
  mode: 'cepraea' | 'adversario'
  type: 'ataque' | 'defesa'
  onChange: (b: ScoutAthleteBlock) => void
}) {
  const set = (key: keyof ScoutAthleteBlock, val: string) => onChange({ ...block, [key]: val || undefined })
  const label = mode === 'cepraea' ? block.atleta : block.numero ? `Adversária nº ${block.numero}` : ''
  if (!label && !block.funcao) return null
  return (
    <div className="rounded-xl border border-cep-purple-700 bg-cep-purple-900/60 p-3 space-y-2">
      <p className="text-xs font-bold text-cep-lime-400 uppercase tracking-wide">
        {index + 1}. {label || 'Participante'}{block.funcao ? ` · ${block.funcao}` : ''}
      </p>
      <SelectField label="Ação executada" value={block.acao ?? ''} onChange={(v) => set('acao', v)} options={getAcoesPorFuncao(block.funcao, type)} />
      <SelectField label="Resultado individual" value={block.resultadoInd ?? ''} onChange={(v) => set('resultadoInd', v)} options={SCOUT_RESULTADO_INDIVIDUAL} />
    </div>
  )
}

function isAttackPhase(phase?: string) {
  return !!phase && (phase.includes('Ataque') || phase.includes('Transição ofensiva'))
}

function isDefensePhase(phase?: string) {
  return !!phase && (phase.includes('Defesa') || phase.includes('Transição defensiva'))
}

export function EventForm({ jogoId, equipeAnalisada, adversario, initialPlacarCEPRAEA = 0, initialPlacarAdversario = 0, initialSet, onSave, onCancel }: Props) {
  const [step, setStep] = useState<Step>('montagem')
  const [form, setForm] = useState<EventFormData>({
    tempoJogo: '',
    set: initialSet ?? '',
    controleJogo: '',
    pontosCEPRAEA: 0,
    pontosAdversario: 0,
    placarCEPRAEA: initialPlacarCEPRAEA,
    placarAdversario: initialPlacarAdversario,
    posse: '',
    faseJogo: '',
    sistema: '',
    faseJogoCEPRAEA: '',
    sistemaTaticoCEPRAEA: '',
    faseJogoAdversaria: '',
    sistemaTaticoAdversaria: '',
    ladoAcao: '',
    goleira: '',
    reposicao: '',
    ataques: makeBlocks(4),
    defesas: makeBlocks(3),
    ataqueCEPRAEA: makeBlocks(4),
    defesaCEPRAEA: makeBlocks(3),
    ataqueAdversario: makeBlocks(4),
    defesaAdversaria: makeBlocks(3),
    especialistaCentral: {},
    finalizacao: {},
    reposicaoDetalhe: {},
    shootout: {},
    analise: '',
    resultadoColetivo: '',
    observacao: '',
    revisarVideo: false,
  })

  const setField = <K extends keyof EventFormData>(key: K, val: EventFormData[K]) => setForm((f) => ({ ...f, [key]: val }))
  const setEspecialista = (key: keyof SpecialistCentralAnalysis, val: string) => setForm((f) => ({ ...f, especialistaCentral: { ...(f.especialistaCentral ?? {}), [key]: val || undefined } }))
  const setFinalizacao = (key: keyof FinishAnalysis, val: string) => setForm((f) => ({ ...f, finalizacao: { ...(f.finalizacao ?? {}), [key]: val || undefined } }))
  const setShootout = (key: keyof ShootoutAnalysis, val: string) => setForm((f) => ({ ...f, shootout: { ...(f.shootout ?? {}), [key]: val || undefined } }))
  const setReposicao = (key: keyof ReposicaoAnalysis, val: string | boolean) => setForm((f) => ({ ...f, reposicaoDetalhe: { ...(f.reposicaoDetalhe ?? {}), [key]: val || undefined } }))

  const updateArray = (key: 'ataqueCEPRAEA' | 'defesaCEPRAEA' | 'ataqueAdversario' | 'defesaAdversaria', i: number, b: ScoutAthleteBlock) => {
    setForm((f) => {
      const arr = [...((f[key] ?? []) as ScoutAthleteBlock[])]
      arr[i] = b
      return { ...f, [key]: arr }
    })
  }

  const cepraeaAtaca = isAttackPhase(form.faseJogoCEPRAEA) || form.posse === 'CEPRAEA'
  const cepraeaDefende = isDefensePhase(form.faseJogoCEPRAEA) || form.posse === 'Adversário'
  const isShootout = form.faseJogoCEPRAEA === 'Shoot-out' || form.faseJogoAdversaria === 'Shoot-out'
  const hasCentralEspecialista =
    (form.ataqueCEPRAEA ?? []).some((a) => a.funcao === 'Central Especialista') ||
    (form.ataqueAdversario ?? []).some((a) => a.funcao === 'Central Especialista') ||
    form.sistemaTaticoCEPRAEA?.includes('ESP central') ||
    form.sistemaTaticoAdversaria?.includes('ESP central')

  const hasFinalizacao =
    !!form.finalizacao?.tipoFinalizacao ||
    [...(form.ataqueCEPRAEA ?? []), ...(form.ataqueAdversario ?? [])].some((a) =>
      ['Arremesso', 'Finalização', 'Giro', 'Aérea'].some((term) => a.acao?.includes(term))
    )
  const hasReposicao = form.reposicaoDetalhe?.houveReposicao || form.faseJogoCEPRAEA?.includes('Transição') || form.faseJogoAdversaria?.includes('Transição')
  const hasDetalhes = hasCentralEspecialista || hasFinalizacao || isShootout || hasReposicao
  const steps = useMemo<Step[]>(() => ['montagem', 'acoes', ...(hasDetalhes ? ['detalhes' as Step] : []), 'fechamento'], [hasDetalhes])

  const activeStep = steps.includes(step) ? step : 'fechamento'
  const nextStep = () => {
    const idx = steps.indexOf(activeStep)
    setStep(steps[Math.min(idx + 1, steps.length - 1)])
  }

  const handleSave = () => {
    const pontosCEPRAEA = Number(form.pontosCEPRAEA ?? 0)
    const pontosAdversario = Number(form.pontosAdversario ?? 0)
    const cepAttack = (form.ataqueCEPRAEA ?? []).filter((b) => b.atleta || b.funcao || b.acao)
    const cepDefense = (form.defesaCEPRAEA ?? []).filter((b) => b.atleta || b.funcao || b.acao)
    const advAttack = (form.ataqueAdversario ?? []).filter((b) => b.numero || b.funcao || b.acao)
    const advDefense = (form.defesaAdversaria ?? []).filter((b) => b.numero || b.funcao || b.acao)
    const ataques = cepraeaAtaca ? cepAttack : advAttack
    const defesas = cepraeaDefende ? cepDefense : advDefense

    onSave({
      jogoId,
      ...form,
      pontosCEPRAEA,
      pontosAdversario,
      placarCEPRAEA: initialPlacarCEPRAEA + pontosCEPRAEA,
      placarAdversario: initialPlacarAdversario + pontosAdversario,
      faseJogo: form.faseJogoCEPRAEA,
      sistema: form.sistemaTaticoCEPRAEA,
      ataques,
      defesas,
      ataqueCEPRAEA: cepAttack,
      defesaCEPRAEA: cepDefense,
      ataqueAdversario: advAttack,
      defesaAdversaria: advDefense,
    })
  }

  const renderParticipants = () => {
    if (cepraeaAtaca) {
      return (
        <>
          <Section title="Ataque CEPRAEA" description="Selecione até 4 atletas e suas funções. As ações serão marcadas na próxima tela.">
            {(form.ataqueCEPRAEA ?? []).map((b, i) => <ParticipantSlot key={i} index={i} block={b} mode="cepraea" funcoes={SCOUT_FUNCOES_ATAQUE} onChange={(nb) => updateArray('ataqueCEPRAEA', i, nb)} />)}
          </Section>
          <Section title="Defesa adversária" description="Marque por número e posição defensiva. Não precisa saber o nome da adversária.">
            {(form.defesaAdversaria ?? []).map((b, i) => <ParticipantSlot key={i} index={i} block={b} mode="adversario" funcoes={SCOUT_FUNCOES_DEFESA} onChange={(nb) => updateArray('defesaAdversaria', i, nb)} />)}
          </Section>
        </>
      )
    }
    return (
      <>
        <Section title="Ataque adversário" description="Marque por número e função ofensiva da adversária.">
          {(form.ataqueAdversario ?? []).map((b, i) => <ParticipantSlot key={i} index={i} block={b} mode="adversario" funcoes={SCOUT_FUNCOES_ATAQUE} onChange={(nb) => updateArray('ataqueAdversario', i, nb)} />)}
        </Section>
        <Section title="Defesa CEPRAEA" description="Selecione até 3 defensoras e suas posições defensivas.">
          {(form.defesaCEPRAEA ?? []).map((b, i) => <ParticipantSlot key={i} index={i} block={b} mode="cepraea" funcoes={SCOUT_FUNCOES_DEFESA} onChange={(nb) => updateArray('defesaCEPRAEA', i, nb)} />)}
        </Section>
      </>
    )
  }

  const renderActions = () => {
    if (cepraeaAtaca) {
      return (
        <>
          <Section title="Ações do ataque CEPRAEA">
            {(form.ataqueCEPRAEA ?? []).map((b, i) => <ActionSlot key={i} index={i} block={b} mode="cepraea" type="ataque" onChange={(nb) => updateArray('ataqueCEPRAEA', i, nb)} />)}
          </Section>
          <Section title="Ações da defesa adversária">
            {(form.defesaAdversaria ?? []).map((b, i) => <ActionSlot key={i} index={i} block={b} mode="adversario" type="defesa" onChange={(nb) => updateArray('defesaAdversaria', i, nb)} />)}
          </Section>
        </>
      )
    }
    return (
      <>
        <Section title="Ações do ataque adversário">
          {(form.ataqueAdversario ?? []).map((b, i) => <ActionSlot key={i} index={i} block={b} mode="adversario" type="ataque" onChange={(nb) => updateArray('ataqueAdversario', i, nb)} />)}
        </Section>
        <Section title="Ações da defesa CEPRAEA">
          {(form.defesaCEPRAEA ?? []).map((b, i) => <ActionSlot key={i} index={i} block={b} mode="cepraea" type="defesa" onChange={(nb) => updateArray('defesaCEPRAEA', i, nb)} />)}
        </Section>
      </>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-cep-purple-800 shrink-0 overflow-x-auto">
        {steps.map((s) => (
          <button key={s} onClick={() => setStep(s)} className={`min-w-28 flex-1 py-2.5 text-xs font-semibold capitalize transition-colors ${activeStep === s ? 'text-cep-lime-400 border-b-2 border-cep-lime-400' : 'text-cep-muted'}`}>
            {s === 'montagem' ? 'Montagem' : s === 'acoes' ? 'Ações' : s === 'detalhes' ? 'Detalhes' : 'Fechamento'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <ScoreHeader equipeAnalisada={equipeAnalisada} adversario={adversario} cepraea={initialPlacarCEPRAEA} adv={initialPlacarAdversario} />

        {activeStep === 'montagem' && (
          <>
            <Section title="Contexto do evento">
              <div className="grid grid-cols-2 gap-3">
                <TextInput label="Tempo de jogo" placeholder="00:00" value={form.tempoJogo ?? ''} onChange={(v) => setField('tempoJogo', v)} />
                <SelectField label="Set" value={form.set ?? ''} onChange={(v) => setField('set', v)} options={SCOUT_SETS} />
              </div>
              <SelectField label="Controle do jogo" value={form.controleJogo ?? ''} onChange={(v) => setField('controleJogo', v)} options={SCOUT_CONTROLE_JOGO} />
              <SelectField label="Posse" value={form.posse ?? ''} onChange={(v) => setField('posse', v)} options={SCOUT_POSSE} />
            </Section>

            <Section title="Situação tática">
              <SelectField label="Fase de jogo - CEPRAEA" value={form.faseJogoCEPRAEA ?? ''} onChange={(v) => { setField('faseJogoCEPRAEA', v); setField('faseJogo', v); setField('sistemaTaticoCEPRAEA', '') }} options={SCOUT_FASE_JOGO} />
              <SelectField label="Sistema tático - CEPRAEA" value={form.sistemaTaticoCEPRAEA ?? ''} onChange={(v) => { setField('sistemaTaticoCEPRAEA', v); setField('sistema', v) }} options={getSistemasPorFase(form.faseJogoCEPRAEA)} />
              <SelectField label="Fase de jogo - adversária" value={form.faseJogoAdversaria ?? ''} onChange={(v) => { setField('faseJogoAdversaria', v); setField('sistemaTaticoAdversaria', '') }} options={SCOUT_FASE_JOGO} />
              <SelectField label="Sistema tático - adversária" value={form.sistemaTaticoAdversaria ?? ''} onChange={(v) => setField('sistemaTaticoAdversaria', v)} options={getSistemasPorFase(form.faseJogoAdversaria)} />
            </Section>

            {renderParticipants()}
          </>
        )}

        {activeStep === 'acoes' && renderActions()}

        {activeStep === 'detalhes' && (
          <>
            {hasFinalizacao && (
              <Section title="Finalização / goleira" description="Use para registrar arremesso, zona, direção no gol e ação da goleira.">
                <SelectField label="Finalizadora" value={form.finalizacao?.finalizadora ?? ''} onChange={(v) => setFinalizacao('finalizadora', v)} options={SCOUT_ATLETAS} />
                <SelectField label="Zona da ação" value={form.ladoAcao ?? ''} onChange={(v) => { setField('ladoAcao', v); setFinalizacao('zonaArremesso', v) }} options={SCOUT_ZONA_ACAO} />
                <SelectField label="Tipo de finalização" value={form.finalizacao?.tipoFinalizacao ?? ''} onChange={(v) => setFinalizacao('tipoFinalizacao', v)} options={SCOUT_TIPO_FINALIZACAO} />
                <SelectField label="Direção no gol" value={form.finalizacao?.direcaoGol ?? ''} onChange={(v) => setFinalizacao('direcaoGol', v)} options={SCOUT_DIRECAO_GOL} />
                <SelectField label="Resultado da finalização" value={form.finalizacao?.resultadoFinalizacao ?? ''} onChange={(v) => setFinalizacao('resultadoFinalizacao', v)} options={SCOUT_RESULTADO_COLETIVO} />
                <SelectField label="Goleira" value={form.finalizacao?.goleira ?? form.goleira ?? ''} onChange={(v) => { setFinalizacao('goleira', v); setField('goleira', v) }} options={SCOUT_GOLEIRAS} />
                <SelectField label="Ação da goleira" value={form.finalizacao?.acaoGoleira ?? ''} onChange={(v) => setFinalizacao('acaoGoleira', v)} options={SCOUT_ACOES_GOLEIRA} />
                <SelectField label="Pontuação esperada" value={form.finalizacao?.pontuacaoEsperada ?? ''} onChange={(v) => setFinalizacao('pontuacaoEsperada', v)} options={SCOUT_PONTUACAO} />
                <SelectField label="Pontuação obtida" value={form.finalizacao?.pontuacaoObtida ?? ''} onChange={(v) => setFinalizacao('pontuacaoObtida', v)} options={SCOUT_PONTUACAO} />
                <SelectField label="Validade técnica" value={form.finalizacao?.validadeTecnica ?? ''} onChange={(v) => setFinalizacao('validadeTecnica', v)} options={SCOUT_VALIDADE_TECNICA} />
              </Section>
            )}

            {hasReposicao && (
              <Section title="Reposição / troca" description="Use quando a troca, entrada da especialista ou transição influenciar o lance.">
                <SelectField label="Tipo de reposição" value={form.reposicaoDetalhe?.tipoReposicao ?? form.reposicao ?? ''} onChange={(v) => { setReposicao('tipoReposicao', v); setField('reposicao', v) }} options={SCOUT_REPOSICAO} />
                <SelectField label="Lado da troca" value={form.reposicaoDetalhe?.ladoTroca ?? ''} onChange={(v) => setReposicao('ladoTroca', v)} options={SCOUT_ZONA_ACAO} />
                <SelectField label="Atleta entrou" value={form.reposicaoDetalhe?.atletaEntrou ?? ''} onChange={(v) => setReposicao('atletaEntrou', v)} options={SCOUT_ATLETAS} />
                <SelectField label="Atleta saiu" value={form.reposicaoDetalhe?.atletaSaiu ?? ''} onChange={(v) => setReposicao('atletaSaiu', v)} options={SCOUT_ATLETAS} />
                <SelectField label="Resultado da reposição" value={form.reposicaoDetalhe?.resultadoReposicao ?? ''} onChange={(v) => setReposicao('resultadoReposicao', v)} options={SCOUT_RESULTADO_INDIVIDUAL} />
              </Section>
            )}

            {hasCentralEspecialista && (
              <Section title="Especialista central" description="Aparece apenas quando há Central Especialista ou sistema com ESP central.">
                <SelectField label="Origem da bola" value={form.especialistaCentral?.origemBola ?? ''} onChange={(v) => setEspecialista('origemBola', v)} options={SCOUT_ORIGEM_BOLA_ESPECIALISTA} />
                <SelectField label="Mexida inicial da bola" value={form.especialistaCentral?.mexidaInicial ?? ''} onChange={(v) => setEspecialista('mexidaInicial', v)} options={SCOUT_MEXIDA_INICIAL} />
                <SelectField label="Solta foi fixada?" value={form.especialistaCentral?.soltaFixada ?? ''} onChange={(v) => setEspecialista('soltaFixada', v)} options={SCOUT_BOOLEANO_TATICO} />
                <SelectField label="Base foi deslocada?" value={form.especialistaCentral?.baseDeslocada ?? ''} onChange={(v) => setEspecialista('baseDeslocada', v)} options={SCOUT_BOOLEANO_TATICO} />
                <SelectField label="API foi deslocada?" value={form.especialistaCentral?.apiDeslocada ?? ''} onChange={(v) => setEspecialista('apiDeslocada', v)} options={SCOUT_BOOLEANO_TATICO} />
                <SelectField label="Comportamento defensivo" value={form.especialistaCentral?.comportamentoDefesa ?? ''} onChange={(v) => setEspecialista('comportamentoDefesa', v)} options={SCOUT_COMPORTAMENTO_DEFESA} />
                <SelectField label="Momento do ataque" value={form.especialistaCentral?.momentoAtaque ?? ''} onChange={(v) => setEspecialista('momentoAtaque', v)} options={SCOUT_MOMENTO_ATAQUE_ESPECIALISTA} />
                <SelectField label="Ritmo" value={form.especialistaCentral?.ritmo ?? ''} onChange={(v) => setEspecialista('ritmo', v)} options={SCOUT_RITMO_ESPECIALISTA} />
                <SelectField label="Previsibilidade" value={form.especialistaCentral?.previsibilidade ?? ''} onChange={(v) => setEspecialista('previsibilidade', v)} options={SCOUT_PREVISIBILIDADE_ESPECIALISTA} />
                <SelectField label="Decisão final" value={form.especialistaCentral?.decisaoFinal ?? ''} onChange={(v) => setEspecialista('decisaoFinal', v)} options={SCOUT_DECISAO_FINAL_ESPECIALISTA} />
                <SelectField label="Resultado da especialista" value={form.especialistaCentral?.resultadoEspecialista ?? ''} onChange={(v) => setEspecialista('resultadoEspecialista', v)} options={SCOUT_RESULTADO_INDIVIDUAL} />
              </Section>
            )}

            {isShootout && (
              <Section title="Shoot-out" description="Aparece apenas quando a fase é Shoot-out.">
                <SelectField label="Tipo" value={form.shootout?.tipoShootout ?? ''} onChange={(v) => setShootout('tipoShootout', v)} options={['Ofensivo', 'Defensivo']} />
                <SelectField label="Passadora" value={form.shootout?.passadora ?? ''} onChange={(v) => setShootout('passadora', v)} options={SCOUT_ATLETAS} />
                <SelectField label="Cobradora" value={form.shootout?.cobradora ?? ''} onChange={(v) => setShootout('cobradora', v)} options={SCOUT_ATLETAS} />
                <SelectField label="Goleira defensora" value={form.shootout?.goleiraDefensora ?? ''} onChange={(v) => setShootout('goleiraDefensora', v)} options={SCOUT_GOLEIRAS} />
                <SelectField label="Lançamento / ação ofensiva" value={form.shootout?.tipoLancamento ?? ''} onChange={(v) => setShootout('tipoLancamento', v)} options={SCOUT_SHOOTOUT_OFENSIVO} />
                <SelectField label="Finta" value={form.shootout?.tipoFinta ?? ''} onChange={(v) => setShootout('tipoFinta', v)} options={SCOUT_SHOOTOUT_OFENSIVO} />
                <SelectField label="Finalização" value={form.shootout?.tipoFinalizacao ?? ''} onChange={(v) => setShootout('tipoFinalizacao', v)} options={SCOUT_SHOOTOUT_OFENSIVO} />
                <SelectField label="Ação da goleira" value={form.shootout?.acaoGoleira ?? ''} onChange={(v) => setShootout('acaoGoleira', v)} options={SCOUT_SHOOTOUT_DEFENSIVO} />
                <SelectField label="Resultado do shoot-out" value={form.shootout?.resultadoShootout ?? ''} onChange={(v) => setShootout('resultadoShootout', v)} options={SCOUT_RESULTADO_COLETIVO} />
              </Section>
            )}
          </>
        )}

        {activeStep === 'fechamento' && (
          <>
            <Section title="Pontuação do lance" description="O placar total será calculado automaticamente ao salvar.">
              <div className="grid grid-cols-2 gap-3">
                <SelectField label={`Pontos ${equipeAnalisada}`} value={String(form.pontosCEPRAEA ?? 0)} onChange={(v) => setField('pontosCEPRAEA', Number(v))} options={SCOUT_PONTOS_LANCE} />
                <SelectField label={`Pontos ${adversario}`} value={String(form.pontosAdversario ?? 0)} onChange={(v) => setField('pontosAdversario', Number(v))} options={SCOUT_PONTOS_LANCE} />
              </div>
              <p className="text-xs text-cep-muted">Novo placar: <span className="text-cep-white font-bold">{initialPlacarCEPRAEA + Number(form.pontosCEPRAEA ?? 0)} × {initialPlacarAdversario + Number(form.pontosAdversario ?? 0)}</span></p>
            </Section>
            <SelectField label="Resultado coletivo" value={form.resultadoColetivo ?? ''} onChange={(v) => setField('resultadoColetivo', v)} options={SCOUT_RESULTADO_COLETIVO} />
            <SelectField label="Análise" value={form.analise ?? ''} onChange={(v) => setField('analise', v)} options={SCOUT_ANALISE} />
            <div className="space-y-1">
              <label className="block text-xs font-medium text-cep-muted">Observação</label>
              <textarea rows={3} value={form.observacao} onChange={(e) => setField('observacao', e.target.value)} className="w-full rounded-lg bg-cep-purple-800 border border-cep-purple-700 text-cep-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cep-lime-400 resize-none" />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.revisarVideo} onChange={(e) => setField('revisarVideo', e.target.checked)} className="h-4 w-4 rounded accent-cep-lime-400" />
              <span className="text-sm text-cep-white">Marcar para revisar vídeo</span>
            </label>
          </>
        )}
      </div>

      <div className="shrink-0 p-4 border-t border-cep-purple-800 flex gap-3">
        <Button variant="secondary" fullWidth onClick={onCancel}>Cancelar</Button>
        {activeStep !== 'fechamento' ? <Button fullWidth onClick={nextStep}>Próximo</Button> : <Button fullWidth onClick={handleSave}>Salvar Evento</Button>}
      </div>
    </div>
  )
}

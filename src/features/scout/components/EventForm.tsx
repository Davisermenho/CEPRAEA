import { useState } from 'react'
import type { ScoutEvent, ScoutAthleteBlock, SpecialistCentralAnalysis, FinishAnalysis, ShootoutAnalysis } from '@/types'
import { Button } from '@/shared/components/Button'
import {
  SCOUT_SETS,
  SCOUT_CONTROLE_JOGO,
  SCOUT_POSSE,
  SCOUT_FASE_JOGO,
  SCOUT_SISTEMAS,
  SCOUT_LADO_ACAO,
  SCOUT_GOLEIRAS,
  SCOUT_REPOSICAO,
  SCOUT_ATLETAS,
  SCOUT_FUNCOES_ATAQUE,
  SCOUT_FUNCOES_DEFESA,
  SCOUT_CATEGORIAS,
  SCOUT_ACOES_ATAQUE,
  SCOUT_ACOES_DEFESA,
  SCOUT_ACOES_ESPECIALISTA_CENTRAL,
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
  SCOUT_PONTUACAO,
  SCOUT_VALIDADE_TECNICA,
  SCOUT_SHOOTOUT_OFENSIVO,
  SCOUT_SHOOTOUT_DEFENSIVO,
} from '../constants'

type Step = 'contexto' | 'atletas' | 'especialista' | 'resultado'

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

const EMPTY_BLOCK: ScoutAthleteBlock = {}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
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
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
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

function AthleteBlockForm({
  index,
  label,
  block,
  funcoes,
  acoes,
  onChange,
}: {
  index: number
  label: string
  block: ScoutAthleteBlock
  funcoes: readonly string[]
  acoes: readonly string[]
  onChange: (b: ScoutAthleteBlock) => void
}) {
  const set = (key: keyof ScoutAthleteBlock, val: string) => onChange({ ...block, [key]: val || undefined })
  const actionOptions = block.funcao === 'Central Especialista' ? SCOUT_ACOES_ESPECIALISTA_CENTRAL : acoes

  return (
    <div className="rounded-xl border border-cep-purple-700 bg-cep-purple-900/60 p-3 space-y-2">
      <p className="text-xs font-bold text-cep-lime-400 uppercase tracking-wide">{label} {index + 1}</p>
      <SelectField label="Atleta" value={block.atleta ?? ''} onChange={(v) => set('atleta', v)} options={SCOUT_ATLETAS} />
      <SelectField label="Função" value={block.funcao ?? ''} onChange={(v) => set('funcao', v)} options={funcoes} />
      <SelectField label="Categoria" value={block.categoria ?? ''} onChange={(v) => set('categoria', v)} options={SCOUT_CATEGORIAS} />
      <SelectField label="Ação" value={block.acao ?? ''} onChange={(v) => set('acao', v)} options={actionOptions} />
      <SelectField label="Resultado" value={block.resultadoInd ?? ''} onChange={(v) => set('resultadoInd', v)} options={SCOUT_RESULTADO_INDIVIDUAL} />
    </div>
  )
}

export function EventForm({ jogoId, equipeAnalisada, adversario, initialPlacarCEPRAEA = 0, initialPlacarAdversario = 0, initialSet, onSave, onCancel }: Props) {
  const [step, setStep] = useState<Step>('contexto')
  const [form, setForm] = useState<EventFormData>({
    tempoJogo: '',
    set: initialSet ?? '',
    controleJogo: '',
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
    ataques: [{ ...EMPTY_BLOCK }],
    defesas: [{ ...EMPTY_BLOCK }],
    especialistaCentral: {},
    finalizacao: {},
    shootout: {},
    analise: '',
    resultadoColetivo: '',
    observacao: '',
    revisarVideo: false,
  })

  const setField = <K extends keyof EventFormData>(key: K, val: EventFormData[K]) =>
    setForm((f) => ({ ...f, [key]: val }))

  const setEspecialista = (key: keyof SpecialistCentralAnalysis, val: string) =>
    setForm((f) => ({ ...f, especialistaCentral: { ...(f.especialistaCentral ?? {}), [key]: val || undefined } }))

  const setFinalizacao = (key: keyof FinishAnalysis, val: string) =>
    setForm((f) => ({ ...f, finalizacao: { ...(f.finalizacao ?? {}), [key]: val || undefined } }))

  const setShootout = (key: keyof ShootoutAnalysis, val: string) =>
    setForm((f) => ({ ...f, shootout: { ...(f.shootout ?? {}), [key]: val || undefined } }))

  const updateAtaque = (i: number, b: ScoutAthleteBlock) =>
    setForm((f) => { const arr = [...f.ataques]; arr[i] = b; return { ...f, ataques: arr } })

  const updateDefesa = (i: number, b: ScoutAthleteBlock) =>
    setForm((f) => { const arr = [...f.defesas]; arr[i] = b; return { ...f, defesas: arr } })

  const addAtaque = () => {
    if (form.ataques.length < 4) setForm((f) => ({ ...f, ataques: [...f.ataques, { ...EMPTY_BLOCK }] }))
  }
  const removeAtaque = () => {
    if (form.ataques.length > 1) setForm((f) => ({ ...f, ataques: f.ataques.slice(0, -1) }))
  }
  const addDefesa = () => {
    if (form.defesas.length < 3) setForm((f) => ({ ...f, defesas: [...f.defesas, { ...EMPTY_BLOCK }] }))
  }
  const removeDefesa = () => {
    if (form.defesas.length > 1) setForm((f) => ({ ...f, defesas: f.defesas.slice(0, -1) }))
  }

  const nextStep = () => {
    if (step === 'contexto') setStep('atletas')
    else if (step === 'atletas') setStep('especialista')
    else setStep('resultado')
  }

  const handleSave = () => {
    onSave({ jogoId, ...form })
  }

  const isShootout = form.faseJogo === 'Shoot-out' || form.faseJogoCEPRAEA === 'Shoot-out' || form.faseJogoAdversaria === 'Shoot-out'

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-cep-purple-800 shrink-0 overflow-x-auto">
        {(['contexto', 'atletas', 'especialista', 'resultado'] as Step[]).map((s) => (
          <button
            key={s}
            onClick={() => setStep(s)}
            className={`min-w-24 flex-1 py-2.5 text-xs font-semibold capitalize transition-colors ${
              step === s ? 'text-cep-lime-400 border-b-2 border-cep-lime-400' : 'text-cep-muted'
            }`}
          >
            {s === 'contexto' ? 'Contexto' : s === 'atletas' ? 'Atletas' : s === 'especialista' ? 'Especialista' : 'Resultado'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {step === 'contexto' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-cep-muted">Tempo de jogo</label>
                <input
                  type="text"
                  placeholder="00:00"
                  value={form.tempoJogo}
                  onChange={(e) => setField('tempoJogo', e.target.value)}
                  className="w-full rounded-lg bg-cep-purple-800 border border-cep-purple-700 text-cep-white text-sm px-3 h-9 focus:outline-none focus:ring-2 focus:ring-cep-lime-400"
                />
              </div>
              <SelectField label="Set" value={form.set ?? ''} onChange={(v) => setField('set', v)} options={SCOUT_SETS} />
            </div>

            <SelectField label="Controle do jogo" value={form.controleJogo ?? ''} onChange={(v) => setField('controleJogo', v)} options={SCOUT_CONTROLE_JOGO} />

            <div className="space-y-1">
              <p className="text-xs font-medium text-cep-muted">Placar</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs text-cep-muted/70">{equipeAnalisada}</label>
                  <input type="number" min={0} value={form.placarCEPRAEA} onChange={(e) => setField('placarCEPRAEA', Number(e.target.value))} className="w-full rounded-lg bg-cep-purple-800 border border-cep-purple-700 text-cep-white text-sm px-3 h-9 focus:outline-none focus:ring-2 focus:ring-cep-lime-400" />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs text-cep-muted/70">{adversario}</label>
                  <input type="number" min={0} value={form.placarAdversario} onChange={(e) => setField('placarAdversario', Number(e.target.value))} className="w-full rounded-lg bg-cep-purple-800 border border-cep-purple-700 text-cep-white text-sm px-3 h-9 focus:outline-none focus:ring-2 focus:ring-cep-lime-400" />
                </div>
              </div>
            </div>

            <SelectField label="Posse" value={form.posse ?? ''} onChange={(v) => setField('posse', v)} options={SCOUT_POSSE} />
            <SelectField label="Fase de jogo - CEPRAEA" value={form.faseJogoCEPRAEA ?? ''} onChange={(v) => { setField('faseJogoCEPRAEA', v); setField('faseJogo', v) }} options={SCOUT_FASE_JOGO} />
            <SelectField label="Sistema tático - CEPRAEA" value={form.sistemaTaticoCEPRAEA ?? ''} onChange={(v) => { setField('sistemaTaticoCEPRAEA', v); setField('sistema', v) }} options={SCOUT_SISTEMAS} />
            <SelectField label="Fase de jogo - adversária" value={form.faseJogoAdversaria ?? ''} onChange={(v) => setField('faseJogoAdversaria', v)} options={SCOUT_FASE_JOGO} />
            <SelectField label="Sistema tático - adversária" value={form.sistemaTaticoAdversaria ?? ''} onChange={(v) => setField('sistemaTaticoAdversaria', v)} options={SCOUT_SISTEMAS} />
            <SelectField label="Lado / zona da ação" value={form.ladoAcao ?? ''} onChange={(v) => setField('ladoAcao', v)} options={SCOUT_LADO_ACAO} />
            <SelectField label="Goleira" value={form.goleira ?? ''} onChange={(v) => setField('goleira', v)} options={SCOUT_GOLEIRAS} />
            <SelectField label="Reposição" value={form.reposicao ?? ''} onChange={(v) => setField('reposicao', v)} options={SCOUT_REPOSICAO} />
          </>
        )}

        {step === 'atletas' && (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-cep-white">Ataque</p>
                <div className="flex gap-2">
                  {form.ataques.length > 1 && <button onClick={removeAtaque} className="text-xs text-red-400 hover:text-red-300">− Remover</button>}
                  {form.ataques.length < 4 && <button onClick={addAtaque} className="text-xs text-cep-lime-400 hover:text-cep-lime-300">+ Adicionar</button>}
                </div>
              </div>
              {form.ataques.map((b, i) => (
                <AthleteBlockForm key={i} index={i} label="Ataque" block={b} funcoes={SCOUT_FUNCOES_ATAQUE} acoes={SCOUT_ACOES_ATAQUE} onChange={(nb) => updateAtaque(i, nb)} />
              ))}
            </div>

            <div className="space-y-2 mt-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-cep-white">Defesa</p>
                <div className="flex gap-2">
                  {form.defesas.length > 1 && <button onClick={removeDefesa} className="text-xs text-red-400 hover:text-red-300">− Remover</button>}
                  {form.defesas.length < 3 && <button onClick={addDefesa} className="text-xs text-cep-lime-400 hover:text-cep-lime-300">+ Adicionar</button>}
                </div>
              </div>
              {form.defesas.map((b, i) => (
                <AthleteBlockForm key={i} index={i} label="Defesa" block={b} funcoes={SCOUT_FUNCOES_DEFESA} acoes={SCOUT_ACOES_DEFESA} onChange={(nb) => updateDefesa(i, nb)} />
              ))}
            </div>
          </>
        )}

        {step === 'especialista' && (
          <>
            <Section title="Especialista central" description="Use quando a central especialista participa da construção, passe, finta ou decisão final.">
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

            <Section title="Finalização" description="Registre giro/aérea e diferencie gol de 2 pontos de execução que valeu só 1 ponto.">
              <SelectField label="Tipo de finalização" value={form.finalizacao?.tipoFinalizacao ?? ''} onChange={(v) => setFinalizacao('tipoFinalizacao', v)} options={SCOUT_TIPO_FINALIZACAO} />
              <SelectField label="Pontuação esperada" value={form.finalizacao?.pontuacaoEsperada ?? ''} onChange={(v) => setFinalizacao('pontuacaoEsperada', v)} options={SCOUT_PONTUACAO} />
              <SelectField label="Pontuação obtida" value={form.finalizacao?.pontuacaoObtida ?? ''} onChange={(v) => setFinalizacao('pontuacaoObtida', v)} options={SCOUT_PONTUACAO} />
              <SelectField label="Validade técnica" value={form.finalizacao?.validadeTecnica ?? ''} onChange={(v) => setFinalizacao('validadeTecnica', v)} options={SCOUT_VALIDADE_TECNICA} />
            </Section>

            <Section title="Shoot-out" description={isShootout ? 'Fase atual marcada como shoot-out.' : 'Preencha apenas quando o evento for shoot-out.'}>
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
          </>
        )}

        {step === 'resultado' && (
          <>
            <SelectField label="Análise" value={form.analise ?? ''} onChange={(v) => setField('analise', v)} options={SCOUT_ANALISE} />
            <SelectField label="Resultado coletivo" value={form.resultadoColetivo ?? ''} onChange={(v) => setField('resultadoColetivo', v)} options={SCOUT_RESULTADO_COLETIVO} />
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
        {step !== 'resultado' ? <Button fullWidth onClick={nextStep}>Próximo</Button> : <Button fullWidth onClick={handleSave}>Salvar Evento</Button>}
      </div>
    </div>
  )
}

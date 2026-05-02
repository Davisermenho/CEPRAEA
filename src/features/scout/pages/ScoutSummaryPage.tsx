import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, BarChart2 } from 'lucide-react'
import { useScoutStore } from '@/stores/scoutStore'
import { Badge } from '@/shared/components/Badge'
import { EmptyState } from '@/shared/components/EmptyState'
import type { ScoutAthleteBlock, ScoutEvent } from '@/types'

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl bg-cep-purple-900 border border-cep-purple-800 p-3">
      <p className="text-xs text-cep-muted">{label}</p>
      <p className="text-2xl font-black text-cep-white mt-1">{value}</p>
    </div>
  )
}

function countWhere<T>(items: T[], predicate: (item: T) => boolean) {
  return items.filter(predicate).length
}

function CountList({ title, rows }: { title: string; rows: [string, number][] }) {
  return (
    <div className="rounded-xl bg-cep-purple-900 border border-cep-purple-800 overflow-hidden">
      <div className="px-3 py-2 border-b border-cep-purple-800">
        <p className="text-xs font-bold text-cep-lime-400 uppercase tracking-wide">{title}</p>
      </div>
      {rows.length === 0 ? (
        <p className="p-3 text-xs text-cep-muted">Sem dados.</p>
      ) : (
        <div className="divide-y divide-cep-purple-800">
          {rows.map(([label, value]) => (
            <div key={label} className="px-3 py-2 flex items-center justify-between gap-3">
              <span className="text-xs text-cep-white truncate">{label}</span>
              <Badge variant="lime">{value}</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function topCounts(values: Array<string | undefined>, limit = 8): [string, number][] {
  const map = new Map<string, number>()
  values.filter(Boolean).forEach((v) => map.set(v!, (map.get(v!) ?? 0) + 1))
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit)
}

function labelBlock(block: ScoutAthleteBlock) {
  if (block.atleta) return block.atleta
  if (block.numero) return `Adversária nº ${block.numero}`
  return undefined
}

type NormalizedScoutRow = {
  eventId: string
  equipe: 'CEPRAEA' | 'Adversária'
  tipo: 'Ataque' | 'Defesa' | 'Finalização' | 'Goleira' | 'Especialista' | 'Reposição' | 'Shoot-out'
  atletaOuNumero?: string
  funcao?: string
  acao?: string
  categoria?: string
  sistemaCEPRAEA?: string
  sistemaAdversaria?: string
  resultadoColetivo?: string
  resultadoIndividual?: string
  pontosCEPRAEA?: number
  pontosAdversario?: number
}

function normalizeScoutEvents(events: ScoutEvent[]): NormalizedScoutRow[] {
  const rows: NormalizedScoutRow[] = []

  events.forEach((event) => {
    const attackingTeam = event.posse === 'CEPRAEA' ? 'CEPRAEA' : 'Adversária'
    const defendingTeam = attackingTeam === 'CEPRAEA' ? 'Adversária' : 'CEPRAEA'
    const base = {
      eventId: event.id,
      sistemaCEPRAEA: event.sistemaTaticoCEPRAEA || event.sistema,
      sistemaAdversaria: event.sistemaTaticoAdversaria,
      resultadoColetivo: event.resultadoColetivo,
      pontosCEPRAEA: event.pontosCEPRAEA,
      pontosAdversario: event.pontosAdversario,
    }

    ;(event.ataques ?? []).forEach((block) => {
      rows.push({
        ...base,
        equipe: attackingTeam,
        tipo: 'Ataque',
        atletaOuNumero: labelBlock(block),
        funcao: block.funcao,
        acao: block.acao,
        categoria: block.categoria,
        resultadoIndividual: block.resultadoInd,
      })
    })

    ;(event.defesas ?? []).forEach((block) => {
      rows.push({
        ...base,
        equipe: defendingTeam,
        tipo: 'Defesa',
        atletaOuNumero: labelBlock(block),
        funcao: block.funcao,
        acao: block.acao,
        categoria: block.categoria,
        resultadoIndividual: block.resultadoInd,
      })
    })

    if (event.finalizacao?.houveFinalizacao || event.finalizacao?.tipoFinalizacao || event.finalizacao?.finalizadora) {
      rows.push({
        ...base,
        equipe: event.finalizacao?.equipeFinalizadora ?? attackingTeam,
        tipo: 'Finalização',
        atletaOuNumero: event.finalizacao?.finalizadora,
        acao: event.finalizacao?.tipoFinalizacao,
        resultadoIndividual: event.finalizacao?.resultadoFinalizacao,
      })
      if (event.finalizacao?.goleira || event.finalizacao?.acaoGoleira) {
        rows.push({
          ...base,
          equipe: event.finalizacao?.equipeGoleira ?? defendingTeam,
          tipo: 'Goleira',
          atletaOuNumero: event.finalizacao?.goleira,
          acao: event.finalizacao?.acaoGoleira,
          resultadoIndividual: event.finalizacao?.resultadoFinalizacao,
        })
      }
    }

    if (event.especialistaCentral?.origemBola || event.especialistaCentral?.decisaoFinal) {
      rows.push({
        ...base,
        equipe: event.especialistaCentral?.equipe ?? attackingTeam,
        tipo: 'Especialista',
        acao: event.especialistaCentral?.decisaoFinal,
        resultadoIndividual: event.especialistaCentral?.resultadoEspecialista,
      })
    }

    if (event.shootout?.resultadoShootout) {
      rows.push({
        ...base,
        equipe: attackingTeam,
        tipo: 'Shoot-out',
        atletaOuNumero: event.shootout.cobradora,
        acao: event.shootout.tipoFinalizacao || event.shootout.tipoLancamento,
        resultadoIndividual: event.shootout.resultadoShootout,
      })
    }
  })

  return rows.filter((row) => row.atletaOuNumero || row.acao || row.resultadoIndividual || row.tipo === 'Especialista')
}

export default function ScoutSummaryPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { games, events, loadGames, loadEvents, getGame } = useScoutStore()

  useEffect(() => { loadGames() }, [])
  useEffect(() => { if (id) loadEvents(id) }, [id])

  const game = getGame(id ?? '') ?? games.find((g) => g.id === id)
  if (!game) return null

  const rows = normalizeScoutEvents(events)
  const attackRows = rows.filter((row) => row.tipo === 'Ataque')
  const defenseRows = rows.filter((row) => row.tipo === 'Defesa')
  const finishRows = rows.filter((row) => row.tipo === 'Finalização')
  const goalkeeperRows = rows.filter((row) => row.tipo === 'Goleira')
  const specialistEvents = events.filter((event) => event.especialistaCentral?.origemBola || event.especialistaCentral?.momentoAtaque || event.especialistaCentral?.ritmo || event.especialistaCentral?.previsibilidade || event.especialistaCentral?.decisaoFinal)
  const specialistCepraea = specialistEvents.filter((event) => event.especialistaCentral?.equipe === 'CEPRAEA')
  const specialistOpponent = specialistEvents.filter((event) => event.especialistaCentral?.equipe === 'Adversária')
  const shootoutEvents = events.filter((event) => event.faseJogoCEPRAEA === 'Shoot-out' || event.faseJogoAdversaria === 'Shoot-out' || event.shootout?.resultadoShootout)

  const cepraeaPoints = events.reduce((sum, event) => sum + Number(event.pontosCEPRAEA ?? 0), 0)
  const opponentPoints = events.reduce((sum, event) => sum + Number(event.pontosAdversario ?? 0), 0)
  const goals2Cepraea = countWhere(events, (event) => Number(event.pontosCEPRAEA ?? 0) === 2)
  const goals2Against = countWhere(events, (event) => Number(event.pontosAdversario ?? 0) === 2)
  const giro2 = countWhere(events, (event) => event.resultadoColetivo === 'Gol de giro 2 pontos')
  const aerea2 = countWhere(events, (event) => event.resultadoColetivo === 'Gol de aérea 2 pontos')
  const giroErro = countWhere(events, (event) => (event.resultadoColetivo ?? '').includes('giro 1 ponto') || event.finalizacao?.validadeTecnica === 'Erro técnico')
  const revisar = countWhere(events, (event) => event.revisarVideo)

  return (
    <div className="flex flex-col h-full">
      <div className="bg-cep-purple-900 border-b border-cep-purple-800 px-4 py-3 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/scout/${game.id}/ao-vivo`)} className="text-cep-muted hover:text-cep-white"><ArrowLeft className="h-5 w-5" /></button>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-cep-lime-400 tracking-widest uppercase">Resumo do Scout</p>
            <p className="text-sm font-bold text-cep-white truncate">{game.equipeAnalisada} vs {game.adversario}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {events.length === 0 ? (
          <EmptyState icon={BarChart2} title="Sem eventos" description="Registre eventos para gerar o resumo tático." />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Eventos" value={events.length} />
              <StatCard label="Ações normalizadas" value={rows.length} />
              <StatCard label="Pontos CEPRAEA" value={cepraeaPoints} />
              <StatCard label="Pontos adversária" value={opponentPoints} />
              <StatCard label="Gols 2 pts CEPRAEA" value={goals2Cepraea} />
              <StatCard label="Gols 2 pts sofridos" value={goals2Against} />
              <StatCard label="Giro 2 pontos" value={giro2} />
              <StatCard label="Aérea 2 pontos" value={aerea2} />
              <StatCard label="Giro/Aérea erro técnico" value={giroErro} />
              <StatCard label="Revisar vídeo" value={revisar} />
              <StatCard label="Shoot-out" value={shootoutEvents.length} />
            </div>

            <CountList title="Participações por atleta/número" rows={topCounts(rows.map((row) => row.atletaOuNumero), 12)} />
            <CountList title="Resultados coletivos" rows={topCounts(events.map((event) => event.resultadoColetivo), 12)} />
            <CountList title="Ações ofensivas" rows={topCounts(attackRows.map((row) => row.acao), 12)} />
            <CountList title="Ações defensivas" rows={topCounts(defenseRows.map((row) => row.acao), 12)} />
            <CountList title="Categorias" rows={topCounts(rows.map((row) => row.categoria), 12)} />
            <CountList title="Finalizações" rows={topCounts(finishRows.map((row) => row.acao), 10)} />
            <CountList title="Goleiras" rows={topCounts(goalkeeperRows.map((row) => row.acao || row.atletaOuNumero), 10)} />
            <CountList title="Sistemas CEPRAEA" rows={topCounts(events.map((event) => event.sistemaTaticoCEPRAEA || event.sistema), 10)} />
            <CountList title="Sistemas adversária" rows={topCounts(events.map((event) => event.sistemaTaticoAdversaria), 10)} />
            <CountList title="Funções defensivas CEPRAEA" rows={topCounts((events.flatMap((event) => event.defesaCEPRAEA ?? [])).map((block) => block.funcao), 8)} />
            <CountList title="Finalizadoras" rows={topCounts(events.map((event) => event.finalizacao?.finalizadora), 10)} />

            <div className="rounded-xl bg-cep-purple-900 border border-cep-purple-800 overflow-hidden">
              <div className="px-3 py-2 border-b border-cep-purple-800"><p className="text-xs font-bold text-cep-lime-400 uppercase tracking-wide">Especialista central</p></div>
              {specialistEvents.length === 0 ? <p className="p-3 text-xs text-cep-muted">Nenhuma análise específica registrada.</p> : (
                <div className="space-y-3 p-3">
                  <CountList title="Especialista CEPRAEA - origem" rows={topCounts(specialistCepraea.map((event) => event.especialistaCentral?.origemBola), 8)} />
                  <CountList title="Especialista adversária - origem" rows={topCounts(specialistOpponent.map((event) => event.especialistaCentral?.origemBola), 8)} />
                  <CountList title="Momento do ataque" rows={topCounts(specialistEvents.map((event) => event.especialistaCentral?.momentoAtaque), 8)} />
                  <CountList title="Ritmo" rows={topCounts(specialistEvents.map((event) => event.especialistaCentral?.ritmo), 8)} />
                  <CountList title="Previsibilidade" rows={topCounts(specialistEvents.map((event) => event.especialistaCentral?.previsibilidade), 8)} />
                  <CountList title="Decisão final" rows={topCounts(specialistEvents.map((event) => event.especialistaCentral?.decisaoFinal), 8)} />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

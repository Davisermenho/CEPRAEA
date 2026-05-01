import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, BarChart2 } from 'lucide-react'
import { useScoutStore } from '@/stores/scoutStore'
import { Badge } from '@/shared/components/Badge'
import { EmptyState } from '@/shared/components/EmptyState'

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

export default function ScoutSummaryPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { games, events, loadGames, loadEvents, getGame } = useScoutStore()

  useEffect(() => { loadGames() }, [])
  useEffect(() => { if (id) loadEvents(id) }, [id])

  const game = getGame(id ?? '') ?? games.find((g) => g.id === id)
  const allActions = events.flatMap((event) => [
    ...event.ataques.map((a) => ({ ...a, phase: event.faseJogoCEPRAEA || event.faseJogo, system: event.sistemaTaticoCEPRAEA || event.sistema, result: event.resultadoColetivo, kind: 'Ataque' })),
    ...event.defesas.map((a) => ({ ...a, phase: event.faseJogoCEPRAEA || event.faseJogo, system: event.sistemaTaticoCEPRAEA || event.sistema, result: event.resultadoColetivo, kind: 'Defesa' })),
  ]).filter((a) => a.atleta || a.acao)

  if (!game) return null

  const specialistEvents = events.filter((e) => {
    const s = e.especialistaCentral
    return !!(s?.origemBola || s?.momentoAtaque || s?.ritmo || s?.previsibilidade || s?.decisaoFinal)
  })
  const shootoutEvents = events.filter((e) => e.faseJogo === 'Shoot-out' || e.faseJogoCEPRAEA === 'Shoot-out' || e.faseJogoAdversaria === 'Shoot-out' || e.shootout?.resultadoShootout)

  const goals2 = countWhere(events, (e) => (e.resultadoColetivo ?? '').includes('2 pontos'))
  const giro2 = countWhere(events, (e) => e.resultadoColetivo === 'Gol de giro 2 pontos')
  const aerea2 = countWhere(events, (e) => e.resultadoColetivo === 'Gol de aérea 2 pontos')
  const giroErro = countWhere(events, (e) => (e.resultadoColetivo ?? '').includes('giro 1 ponto') || e.finalizacao?.validadeTecnica === 'Erro técnico')
  const revisar = countWhere(events, (e) => e.revisarVideo)

  return (
    <div className="flex flex-col h-full">
      <div className="bg-cep-purple-900 border-b border-cep-purple-800 px-4 py-3 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/scout/${game.id}/ao-vivo`)} className="text-cep-muted hover:text-cep-white">
            <ArrowLeft className="h-5 w-5" />
          </button>
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
              <StatCard label="Ações" value={allActions.length} />
              <StatCard label="Gols 2 pontos" value={goals2} />
              <StatCard label="Revisar vídeo" value={revisar} />
              <StatCard label="Giro 2 pontos" value={giro2} />
              <StatCard label="Aérea 2 pontos" value={aerea2} />
              <StatCard label="Giro/Aérea erro técnico" value={giroErro} />
              <StatCard label="Shoot-out" value={shootoutEvents.length} />
            </div>

            <CountList title="Ações por atleta" rows={topCounts(allActions.map((a) => a.atleta), 10)} />
            <CountList title="Resultados coletivos" rows={topCounts(events.map((e) => e.resultadoColetivo), 10)} />
            <CountList title="Fases CEPRAEA" rows={topCounts(events.map((e) => e.faseJogoCEPRAEA || e.faseJogo), 8)} />
            <CountList title="Sistemas CEPRAEA" rows={topCounts(events.map((e) => e.sistemaTaticoCEPRAEA || e.sistema), 8)} />
            <CountList title="Funções defensivas" rows={topCounts(events.flatMap((e) => e.defesas.map((d) => d.funcao)), 8)} />

            <div className="rounded-xl bg-cep-purple-900 border border-cep-purple-800 overflow-hidden">
              <div className="px-3 py-2 border-b border-cep-purple-800">
                <p className="text-xs font-bold text-cep-lime-400 uppercase tracking-wide">Especialista central</p>
              </div>
              {specialistEvents.length === 0 ? (
                <p className="p-3 text-xs text-cep-muted">Nenhuma análise específica registrada.</p>
              ) : (
                <div className="divide-y divide-cep-purple-800">
                  <CountList title="Origem da bola" rows={topCounts(specialistEvents.map((e) => e.especialistaCentral?.origemBola), 8)} />
                  <CountList title="Momento do ataque" rows={topCounts(specialistEvents.map((e) => e.especialistaCentral?.momentoAtaque), 8)} />
                  <CountList title="Ritmo" rows={topCounts(specialistEvents.map((e) => e.especialistaCentral?.ritmo), 8)} />
                  <CountList title="Previsibilidade" rows={topCounts(specialistEvents.map((e) => e.especialistaCentral?.previsibilidade), 8)} />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

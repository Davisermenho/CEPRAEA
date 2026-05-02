import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, CheckCircle, Flag, Eye, BarChart2 } from 'lucide-react'
import { useScoutStore } from '@/stores/scoutStore'
import { Button } from '@/shared/components/Button'
import { Badge } from '@/shared/components/Badge'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { EmptyState } from '@/shared/components/EmptyState'
import { EventForm } from '../components/EventFormV2'
import type { ScoutEvent, ScoutAthleteBlock } from '@/types'
import { cn } from '@/lib/utils'

const ANALISE_VARIANT: Record<string, 'lime' | 'yellow' | 'red' | 'gray'> = {
  Positiva: 'lime',
  Neutra: 'yellow',
  Negativa: 'red',
  Revisar: 'gray',
}

const RESULTADO_GOL_CLASSES: Record<string, string> = {
  'Gol 2 pontos': 'text-cep-lime-400 font-bold',
  'Gol de giro 2 pontos': 'text-cep-lime-400 font-bold',
  'Gol de aérea 2 pontos': 'text-cep-lime-400 font-bold',
  'Gol 1 ponto': 'text-green-400 font-bold',
  'Gol de giro 1 ponto — erro técnico': 'text-cep-gold-400 font-bold',
  'Gol de aérea 1 ponto — erro técnico': 'text-cep-gold-400 font-bold',
  'Gol sofrido 1 ponto': 'text-red-400 font-bold',
  'Gol sofrido 2 pontos': 'text-red-400 font-bold',
}

function labelBlock(block: ScoutAthleteBlock) {
  if (block.atleta) return block.atleta
  if (block.numero) return `Adversária nº ${block.numero}`
  return ''
}

function EventCard({ event, onDelete }: { event: ScoutEvent; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const atletas = [...(event.ataques ?? []), ...(event.defesas ?? [])].filter((b) => b.atleta || b.numero)
  const attackingTeam = event.posse === 'CEPRAEA' ? 'CEPRAEA' : 'Adversária'
  const defendingTeam = attackingTeam === 'CEPRAEA' ? 'Adversária' : 'CEPRAEA'

  return (
    <div className="rounded-xl bg-cep-purple-900 border border-cep-purple-800 overflow-hidden">
      <button className="w-full text-left p-3" onClick={() => setExpanded((v) => !v)}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {event.tempoJogo && <span className="shrink-0 text-xs font-mono text-cep-lime-400 bg-cep-purple-800 rounded px-1.5 py-0.5">{event.tempoJogo}</span>}
            {event.set && <span className="shrink-0 text-xs text-cep-muted">{event.set}</span>}
            <span className={cn('text-sm truncate', RESULTADO_GOL_CLASSES[event.resultadoColetivo ?? ''] ?? 'text-cep-white')}>
              {event.resultadoColetivo || event.faseJogoCEPRAEA || event.faseJogo || 'Evento'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {event.revisarVideo && <Eye className="h-3.5 w-3.5 text-cep-gold-400" />}
            {event.analise && <Badge variant={ANALISE_VARIANT[event.analise] ?? 'gray'}>{event.analise}</Badge>}
            <span className="text-xs font-bold text-cep-white">{event.placarCEPRAEA} – {event.placarAdversario}</span>
          </div>
        </div>
        {atletas.length > 0 && <p className="text-xs text-cep-muted mt-1 truncate">{atletas.map(labelBlock).filter(Boolean).join(', ')}</p>}
      </button>

      {expanded && (
        <div className="border-t border-cep-purple-800 px-3 pb-3 pt-2 space-y-2">
          {event.posse && <p className="text-xs text-cep-muted">Posse: <span className="text-cep-white">{event.posse}</span></p>}
          <p className="text-xs text-cep-muted">Ataque: <span className="text-cep-white">{attackingTeam}</span></p>
          <p className="text-xs text-cep-muted">Defesa: <span className="text-cep-white">{defendingTeam}</span></p>
          {(event.faseJogoCEPRAEA || event.faseJogo) && <p className="text-xs text-cep-muted">Fase CEPRAEA: <span className="text-cep-white">{event.faseJogoCEPRAEA || event.faseJogo}</span></p>}
          {(event.sistemaTaticoCEPRAEA || event.sistema) && <p className="text-xs text-cep-muted">Sistema CEPRAEA: <span className="text-cep-white">{event.sistemaTaticoCEPRAEA || event.sistema}</span></p>}
          {event.faseJogoAdversaria && <p className="text-xs text-cep-muted">Fase adversária: <span className="text-cep-white">{event.faseJogoAdversaria}</span></p>}
          {event.sistemaTaticoAdversaria && <p className="text-xs text-cep-muted">Sistema adversário: <span className="text-cep-white">{event.sistemaTaticoAdversaria}</span></p>}
          {event.ladoAcao && <p className="text-xs text-cep-muted">Zona: <span className="text-cep-white">{event.ladoAcao}</span></p>}

          {event.ataques.filter((b) => b.atleta || b.numero).length > 0 && (
            <div>
              <p className="text-xs font-semibold text-cep-lime-400 mb-1">Ataque</p>
              {event.ataques.filter((b) => b.atleta || b.numero).map((b, i) => (
                <p key={i} className="text-xs text-cep-muted"><span className="text-cep-white">{labelBlock(b)}</span>{b.funcao && ` · ${b.funcao}`}{b.acao && ` · ${b.acao}`}{b.categoria && <span className="ml-1 text-cep-muted/70">[{b.categoria}]</span>}{b.resultadoInd && <span className="ml-1 text-cep-muted/70">({b.resultadoInd})</span>}</p>
              ))}
            </div>
          )}
          {event.defesas.filter((b) => b.atleta || b.numero).length > 0 && (
            <div>
              <p className="text-xs font-semibold text-cep-gold-400 mb-1">Defesa</p>
              {event.defesas.filter((b) => b.atleta || b.numero).map((b, i) => (
                <p key={i} className="text-xs text-cep-muted"><span className="text-cep-white">{labelBlock(b)}</span>{b.funcao && ` · ${b.funcao}`}{b.acao && ` · ${b.acao}`}{b.categoria && <span className="ml-1 text-cep-muted/70">[{b.categoria}]</span>}{b.resultadoInd && <span className="ml-1 text-cep-muted/70">({b.resultadoInd})</span>}</p>
              ))}
            </div>
          )}
          {event.finalizacao?.finalizadora && <p className="text-xs text-cep-muted">Finalização: <span className="text-cep-white">{event.finalizacao.finalizadora}</span>{event.finalizacao.tipoFinalizacao && ` · ${event.finalizacao.tipoFinalizacao}`}{event.finalizacao.resultadoFinalizacao && ` · ${event.finalizacao.resultadoFinalizacao}`}</p>}
          {event.especialistaCentral?.origemBola && <p className="text-xs text-cep-muted">Especialista {event.especialistaCentral.equipe ?? ''}: <span className="text-cep-white">{event.especialistaCentral.origemBola}</span>{event.especialistaCentral.momentoAtaque && ` · ${event.especialistaCentral.momentoAtaque}`}</p>}
          {event.shootout?.resultadoShootout && <p className="text-xs text-cep-muted">Shoot-out: <span className="text-cep-white">{event.shootout.resultadoShootout}</span></p>}
          {event.observacao && <p className="text-xs text-cep-muted italic">"{event.observacao}"</p>}
          <div className="flex justify-end pt-1">
            <button onClick={onDelete} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"><Trash2 className="h-3.5 w-3.5" />Remover evento</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ScoutLivePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { games, events, loadGames, loadEvents, addEvent, removeEvent, updateGame, getGame } = useScoutStore()
  const [formOpen, setFormOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  useEffect(() => { loadGames() }, [])
  useEffect(() => { if (id) loadEvents(id) }, [id])

  const game = getGame(id ?? '') ?? games.find((g) => g.id === id)
  if (!game) return null

  const currentScore = events.reduce((acc, event) => ({
    cepraea: acc.cepraea + Number(event.pontosCEPRAEA ?? 0),
    adversario: acc.adversario + Number(event.pontosAdversario ?? 0),
  }), { cepraea: 0, adversario: 0 })
  const currentSet = [...events].reverse().find((e) => e.set)?.set ?? '1º SET'

  const handleSaveEvent = async (data: Omit<ScoutEvent, 'id' | 'createdAt'>) => { await addEvent(data); setFormOpen(false) }
  const handleFinalize = async () => { await updateGame(game.id, { status: 'finalizado' }) }
  const handleReopen = async () => { await updateGame(game.id, { status: 'em_andamento' }) }
  const formatDate = (iso: string) => new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

  if (formOpen) {
    return (
      <div className="flex flex-col h-dvh bg-cep-purple-950">
        <div className="bg-cep-purple-900 border-b border-cep-purple-800 px-4 py-3 flex items-center gap-3 shrink-0">
          <button onClick={() => setFormOpen(false)} className="text-cep-muted hover:text-cep-white"><ArrowLeft className="h-5 w-5" /></button>
          <h2 className="text-base font-bold text-cep-white">Registrar Evento</h2>
        </div>
        <div className="flex-1 overflow-hidden">
          <EventForm jogoId={game.id} equipeAnalisada={game.equipeAnalisada} adversario={game.adversario} initialPlacarCEPRAEA={currentScore.cepraea} initialPlacarAdversario={currentScore.adversario} initialSet={currentSet} onSave={handleSaveEvent} onCancel={() => setFormOpen(false)} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-cep-purple-900 border-b border-cep-purple-800 px-4 py-3 shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate('/scout')} className="text-cep-muted hover:text-cep-white"><ArrowLeft className="h-5 w-5" /></button>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-cep-muted truncate">{formatDate(game.data)}{game.local ? ` · ${game.local}` : ''}</p>
            <p className="text-sm font-bold text-cep-white truncate">{game.equipeAnalisada} <span className="font-normal text-cep-muted">vs</span> {game.adversario}</p>
          </div>
          <Badge variant={game.status === 'em_andamento' ? 'lime' : 'gray'}>{game.status === 'em_andamento' ? 'Ao vivo' : 'Finalizado'}</Badge>
        </div>
        <div className="flex items-center justify-center gap-6 py-2">
          <div className="text-center"><p className="text-xs text-cep-muted mb-0.5">{game.equipeAnalisada}</p><p className="text-4xl font-black text-cep-lime-400">{currentScore.cepraea}</p></div>
          <div className="text-center"><p className="text-xs text-cep-muted mb-1">{currentSet}</p><p className="text-2xl font-bold text-cep-muted">×</p></div>
          <div className="text-center"><p className="text-xs text-cep-muted mb-0.5">{game.adversario}</p><p className="text-4xl font-black text-cep-white">{currentScore.adversario}</p></div>
        </div>
        <div className="flex gap-2 mt-2">
          <Button size="sm" variant="secondary" onClick={() => navigate(`/scout/${game.id}/resumo`)}><BarChart2 className="h-4 w-4" />Resumo</Button>
          {game.status === 'em_andamento' ? <><Button size="sm" fullWidth onClick={() => setFormOpen(true)}><Plus className="h-4 w-4" />Registrar Evento</Button><Button size="sm" variant="warning" onClick={handleFinalize}><Flag className="h-4 w-4" />Finalizar</Button></> : <Button size="sm" variant="secondary" fullWidth onClick={handleReopen}><CheckCircle className="h-4 w-4" />Reabrir Jogo</Button>}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {events.length === 0 ? <EmptyState icon={Flag} title="Nenhum evento registrado" description={game.status === 'em_andamento' ? 'Toque em "Registrar Evento" para começar.' : undefined} /> : <div className="space-y-2"><p className="text-xs text-cep-muted">{events.length} evento{events.length !== 1 ? 's' : ''}</p>{[...events].reverse().map((event) => <EventCard key={event.id} event={event} onDelete={() => setDeleteTarget(event.id)} />)}</div>}
      </div>
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={async () => { if (deleteTarget) await removeEvent(deleteTarget); setDeleteTarget(null) }} title="Remover evento" message="Este evento será removido permanentemente." confirmLabel="Remover" variant="danger" />
    </div>
  )
}

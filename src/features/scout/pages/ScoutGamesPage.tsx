import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Crosshair, CheckCircle, Clock, Trash2 } from 'lucide-react'
import { useScoutStore } from '@/stores/scoutStore'
import { Button } from '@/shared/components/Button'
import { Badge } from '@/shared/components/Badge'
import { EmptyState } from '@/shared/components/EmptyState'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { Modal } from '@/shared/components/Modal'
import { SCOUT_EQUIPES } from '../constants'
import type { ScoutGame } from '@/types'
import { todayISO } from '@/lib/utils'

function GameForm({ onSave, onCancel }: { onSave: (d: Omit<ScoutGame, 'id' | 'createdAt' | 'updatedAt'>) => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    data: todayISO(),
    equipeAnalisada: 'CEPRAEA',
    adversario: '',
    local: '',
    observacoes: '',
    status: 'em_andamento' as const,
  })

  return (
    <div className="p-4 space-y-3">
      <div className="space-y-1">
        <label className="block text-xs font-medium text-cep-muted">Data</label>
        <input
          type="date"
          value={form.data}
          onChange={(e) => setForm((f) => ({ ...f, data: e.target.value }))}
          className="w-full rounded-lg bg-cep-purple-800 border border-cep-purple-700 text-cep-white text-sm px-3 h-9 focus:outline-none focus:ring-2 focus:ring-cep-lime-400"
        />
      </div>
      <div className="space-y-1">
        <label className="block text-xs font-medium text-cep-muted">Equipe analisada</label>
        <select
          value={form.equipeAnalisada}
          onChange={(e) => setForm((f) => ({ ...f, equipeAnalisada: e.target.value }))}
          className="w-full rounded-lg bg-cep-purple-800 border border-cep-purple-700 text-cep-white text-sm px-3 h-9 focus:outline-none focus:ring-2 focus:ring-cep-lime-400"
        >
          {SCOUT_EQUIPES.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>
      <div className="space-y-1">
        <label className="block text-xs font-medium text-cep-muted">Adversário</label>
        <select
          value={form.adversario}
          onChange={(e) => setForm((f) => ({ ...f, adversario: e.target.value }))}
          className="w-full rounded-lg bg-cep-purple-800 border border-cep-purple-700 text-cep-white text-sm px-3 h-9 focus:outline-none focus:ring-2 focus:ring-cep-lime-400"
        >
          <option value="">Selecione...</option>
          {SCOUT_EQUIPES.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>
      <div className="space-y-1">
        <label className="block text-xs font-medium text-cep-muted">Local (opcional)</label>
        <input
          type="text"
          value={form.local}
          onChange={(e) => setForm((f) => ({ ...f, local: e.target.value }))}
          className="w-full rounded-lg bg-cep-purple-800 border border-cep-purple-700 text-cep-white text-sm px-3 h-9 focus:outline-none focus:ring-2 focus:ring-cep-lime-400"
        />
      </div>
      <div className="space-y-1">
        <label className="block text-xs font-medium text-cep-muted">Observações (opcional)</label>
        <textarea
          rows={2}
          value={form.observacoes}
          onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))}
          className="w-full rounded-lg bg-cep-purple-800 border border-cep-purple-700 text-cep-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cep-lime-400 resize-none"
        />
      </div>
      <div className="flex gap-3 pt-1">
        <Button variant="secondary" fullWidth onClick={onCancel}>Cancelar</Button>
        <Button
          fullWidth
          disabled={!form.adversario}
          onClick={() => onSave(form)}
        >
          Criar Jogo
        </Button>
      </div>
    </div>
  )
}

export default function ScoutGamesPage() {
  const navigate = useNavigate()
  const { games, isLoading, loadGames, addGame, removeGame } = useScoutStore()
  const [formOpen, setFormOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  useEffect(() => { loadGames() }, [])

  const handleCreate = async (data: Omit<ScoutGame, 'id' | 'createdAt' | 'updatedAt'>) => {
    const game = await addGame(data)
    setFormOpen(false)
    navigate(`/scout/${game.id}/ao-vivo`)
  }

  const handleDelete = async () => {
    if (deleteTarget) {
      await removeGame(deleteTarget)
      setDeleteTarget(null)
    }
  }

  const formatDate = (iso: string) =>
    new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

  return (
    <div className="flex flex-col h-full">
      <div className="bg-cep-purple-900 border-b border-cep-purple-800 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-cep-lime-400 tracking-widest uppercase mb-0.5">Análise Tática</p>
            <h1 className="text-xl font-black text-cep-white">Scout</h1>
          </div>
          <Button size="sm" onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" />
            Novo Jogo
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-cep-lime-400 border-t-transparent" />
          </div>
        ) : games.length === 0 ? (
          <EmptyState
            icon={Crosshair}
            title="Nenhum jogo registrado"
            description="Crie um novo jogo para começar a registrar eventos de scout."
          />
        ) : (
          <div className="space-y-3">
            {games.map((game) => (
              <div
                key={game.id}
                className="rounded-xl bg-cep-purple-900 border border-cep-purple-800 p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <button
                    className="flex-1 text-left"
                    onClick={() => navigate(`/scout/${game.id}/ao-vivo`)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={game.status === 'em_andamento' ? 'lime' : 'gray'}>
                        {game.status === 'em_andamento' ? (
                          <><Clock className="h-3 w-3 mr-1" />Em andamento</>
                        ) : (
                          <><CheckCircle className="h-3 w-3 mr-1" />Finalizado</>
                        )}
                      </Badge>
                      <span className="text-xs text-cep-muted">{formatDate(game.data)}</span>
                    </div>
                    <p className="font-bold text-cep-white">
                      {game.equipeAnalisada} <span className="text-cep-muted font-normal">vs</span> {game.adversario}
                    </p>
                    {game.local && <p className="text-xs text-cep-muted mt-0.5">{game.local}</p>}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteTarget(game.id) }}
                    className="p-2 text-cep-muted hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="Novo Jogo">
        <GameForm onSave={handleCreate} onCancel={() => setFormOpen(false)} />
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Excluir jogo"
        message="Todos os eventos registrados neste jogo serão removidos permanentemente."
        confirmLabel="Excluir"
        variant="danger"
        onConfirm={handleDelete}
      />
    </div>
  )
}

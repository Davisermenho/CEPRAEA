import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Users } from 'lucide-react'
import { useAthleteStore } from '@/stores/athleteStore'
import { AthleteForm } from '../components/AthleteForm'
import { Badge } from '@/shared/components/Badge'
import { EmptyState } from '@/shared/components/EmptyState'
import { Button } from '@/shared/components/Button'
import { formatPhone } from '@/lib/utils'
import type { Athlete } from '@/types'

export default function AthletesPage() {
  const navigate = useNavigate()
  const { athletes, add } = useAthleteStore()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'todos' | 'ativo' | 'inativo'>('ativo')
  const [formOpen, setFormOpen] = useState(false)

  const filtered = athletes.filter((a) => {
    const matchFilter = filter === 'todos' || a.status === filter
    const matchSearch = a.nome.toLowerCase().includes(search.toLowerCase()) ||
      a.telefone.includes(search.replace(/\D/g, ''))
    return matchFilter && matchSearch
  })

  const handleSave = async (data: Omit<Athlete, 'id' | 'createdAt' | 'updatedAt'>, opts?: { pin?: string }) => {
    await add(data, opts)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-cep-purple-900 border-b border-cep-purple-800 px-4 py-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-cep-lime-400 tracking-widest uppercase mb-0.5">Nosso Time</p>
            <h1 className="text-xl font-black text-cep-white">Atletas</h1>
          </div>
          <Button size="sm" onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" />
            Nova
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cep-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou telefone..."
            className="w-full h-10 rounded-xl bg-cep-purple-850 border border-cep-purple-700 pl-9 pr-4 text-sm text-cep-white placeholder-cep-muted/50 focus:outline-none focus:ring-2 focus:ring-cep-lime-400 focus:border-transparent"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 bg-cep-purple-850 border border-cep-purple-700 rounded-xl p-1">
          {(['ativo', 'inativo', 'todos'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 h-7 rounded-lg text-xs font-semibold transition-colors ${
                filter === f
                  ? 'bg-cep-purple-950 text-cep-lime-400'
                  : 'text-cep-muted hover:text-cep-white'
              }`}
            >
              {f === 'ativo' ? 'Ativas' : f === 'inativo' ? 'Inativas' : 'Todas'}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Nenhuma atleta encontrada"
            description={search ? 'Tente outro termo de busca.' : 'Cadastre a primeira atleta.'}
            action={
              !search ? (
                <Button onClick={() => setFormOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Cadastrar atleta
                </Button>
              ) : undefined
            }
          />
        ) : (
          <ul className="divide-y divide-cep-purple-800">
            {filtered.map((athlete) => (
              <li key={athlete.id}>
                <button
                  onClick={() => navigate(`/atletas/${athlete.id}`)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-cep-purple-850 active:bg-cep-purple-800 transition-colors text-left"
                >
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-cep-lime-400/15 border border-cep-lime-400/30 flex items-center justify-center">
                    <span className="text-cep-lime-400 font-black text-sm">
                      {athlete.nome.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-cep-white truncate">{athlete.nome}</p>
                    <p className="text-xs text-cep-muted">{formatPhone(athlete.telefone)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={athlete.status === 'ativo' ? 'lime' : 'gray'}>
                      {athlete.status === 'ativo' ? 'Ativa' : 'Inativa'}
                    </Badge>
                    {athlete.categoria && (
                      <Badge variant="purple">{athlete.categoria}</Badge>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* FAB mobile */}
      <button
        onClick={() => setFormOpen(true)}
        className="fixed bottom-20 right-4 z-30 lg:hidden h-14 w-14 rounded-full bg-cep-lime-400 text-cep-purple-950 shadow-lg hover:bg-cep-lime-500 active:bg-cep-lime-500 flex items-center justify-center transition-colors"
        aria-label="Nova atleta"
      >
        <Plus className="h-6 w-6" />
      </button>

      <AthleteForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
      />
    </div>
  )
}

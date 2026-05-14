import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Search, Shield } from 'lucide-react'
import { Button } from '@/shared/components/Button'
import {
  fetchScoutCatalogTeams,
  createScoutCatalogTeam,
  fetchScoutCodebook,
} from '../scoutApi'
import type {
  ScoutCatalogTeam,
  ScoutCatalogTeamWriteInput,
  ScoutCodeValue,
} from '@/types'

// ── Helpers ──────────────────────────────────────────────────────────────────

const INPUT_CLS = 'w-full text-sm border rounded px-2 py-1.5'
const LABEL_CLS = 'block text-xs font-medium text-neutral-600 mb-1'
const SELECT_CLS = 'w-full text-sm border rounded px-2 py-1.5 bg-white'

const TEAM_TYPE_COLORS: Record<string, string> = {
  PROPRIA: 'bg-blue-100 text-blue-700',
  ADVERSARIA: 'bg-red-100 text-red-700',
  TREINO: 'bg-yellow-100 text-yellow-700',
  OUTRA: 'bg-gray-100 text-gray-600',
}

const EMPTY_FORM: ScoutCatalogTeamWriteInput = {
  name: '',
  teamType: '',
  category: '',
  isInternal: false,
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ScoutTeamsPage() {
  const navigate = useNavigate()

  const [teams, setTeams] = useState<ScoutCatalogTeam[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const [idMap, setIdMap] = useState<Record<string, string>>({})
  const [valueMap, setValueMap] = useState<Record<string, ScoutCodeValue[]>>({})

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<ScoutCatalogTeamWriteInput>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const loadTeams = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const data = await fetchScoutCatalogTeams(search ? { name: search } : undefined)
      setTeams(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar equipes.')
    } finally { setLoading(false) }
  }, [search])

  useEffect(() => { loadTeams() }, [loadTeams])

  useEffect(() => {
    fetchScoutCodebook(['LISTA_TIPO_EQUIPE', 'LISTA_CATEGORIA']).then((lists) => {
      const im: Record<string, string> = {}
      const vm: Record<string, ScoutCodeValue[]> = {}
      for (const l of lists) { im[l.listKey] = l.id; vm[l.id] = l.values }
      setIdMap(im); setValueMap(vm)
    }).catch(() => undefined)
  }, [])

  function opts(listKey: string): ScoutCodeValue[] {
    return valueMap[idMap[listKey]] ?? []
  }

  function setField<K extends keyof ScoutCatalogTeamWriteInput>(
    key: K, val: ScoutCatalogTeamWriteInput[K],
  ) { setForm((p) => ({ ...p, [key]: val })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { setFormError('Nome é obrigatório.'); return }
    setSubmitting(true); setFormError(null)
    try {
      await createScoutCatalogTeam({
        name: form.name.trim(),
        teamType: form.teamType?.trim() || undefined,
        category: form.category?.trim() || undefined,
        isInternal: form.isInternal ?? false,
      })
      setForm(EMPTY_FORM); setShowForm(false); await loadTeams()
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Erro ao cadastrar equipe.')
    } finally { setSubmitting(false) }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <Button variant="ghost" size="sm" onClick={() => navigate('/scout')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Shield className="h-5 w-5 text-indigo-600" />
        <h1 className="font-semibold text-gray-900">Cadastro de Equipes</h1>
        <div className="ml-auto">
          <Button size="sm" onClick={() => { setShowForm(true); setFormError(null) }}>
            <Plus className="h-4 w-4 mr-1" />
            Nova Equipe
          </Button>
        </div>
      </div>

      <div className="flex-1 p-4 max-w-3xl mx-auto w-full space-y-4">

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input className={`${INPUT_CLS} pl-9`} placeholder="Buscar por nome..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)} />
        </div>

        {showForm && (
          <div className="bg-white border rounded-lg p-4 space-y-4">
            <h2 className="font-semibold text-gray-800">Nova Equipe</h2>
            {formError && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{formError}</p>}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className={LABEL_CLS}>Nome *</label>
                  <input className={INPUT_CLS} value={form.name} required
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('name', e.target.value)} />
                </div>
                <div>
                  <label className={LABEL_CLS}>Tipo de Equipe</label>
                  <select className={SELECT_CLS} value={form.teamType ?? ''}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setField('teamType', e.target.value)}>
                    <option value="">— selecionar —</option>
                    {opts('LISTA_TIPO_EQUIPE').map((o) => <option key={o.code} value={o.code}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLS}>Categoria</label>
                  <select className={SELECT_CLS} value={form.category ?? ''}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setField('category', e.target.value)}>
                    <option value="">— selecionar —</option>
                    {opts('LISTA_CATEGORIA').map((o) => <option key={o.code} value={o.code}>{o.label}</option>)}
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={!!form.isInternal} className="rounded"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('isInternal', e.target.checked)} />
                Equipe interna (própria)
              </label>
              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="secondary" size="sm"
                  onClick={() => { setShowForm(false); setForm(EMPTY_FORM) }}>Cancelar</Button>
                <Button type="submit" size="sm" disabled={submitting}>
                  {submitting ? 'Salvando...' : 'Cadastrar'}
                </Button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-gray-500 text-center py-8">Carregando...</p>
        ) : error ? (
          <p className="text-sm text-red-600 text-center py-8">{error}</p>
        ) : teams.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">Nenhuma equipe cadastrada.</p>
        ) : (
          <div className="space-y-2">
            {teams.map((t) => (
              <div key={t.id} className="bg-white border rounded-lg px-4 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{t.name}</p>
                  {t.category && <p className="text-xs text-gray-500">{t.category}</p>}
                </div>
                <div className="flex flex-wrap gap-1 items-center">
                  {t.teamType && (
                    <span className={`text-xs rounded px-2 py-0.5 ${TEAM_TYPE_COLORS[t.teamType] ?? 'bg-gray-100 text-gray-600'}`}>
                      {t.teamType}
                    </span>
                  )}
                  {t.isInternal && <span className="text-xs bg-green-100 text-green-700 rounded px-2 py-0.5">Interna</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

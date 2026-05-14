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

const INPUT_CLS =
  'w-full rounded-lg border border-cep-purple-700 bg-cep-purple-950/60 px-3 py-2 text-sm text-cep-white placeholder-cep-muted focus:outline-none focus:border-cep-purple-400'
const LABEL_CLS =
  'block text-xs font-medium uppercase tracking-[0.18em] text-cep-muted mb-1.5'
const SELECT_CLS =
  'w-full rounded-lg border border-cep-purple-700 bg-cep-purple-950/60 px-3 py-2 text-sm text-cep-white focus:outline-none focus:border-cep-purple-400'

const TEAM_TYPE_COLORS: Record<string, string> = {
  PROPRIA: 'bg-cep-lime-400/15 text-cep-lime-300',
  ADVERSARIA: 'bg-red-400/15 text-red-300',
  TREINO: 'bg-yellow-400/15 text-yellow-300',
  OUTRA: 'bg-cep-purple-800/60 text-cep-muted',
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
    <div className="min-h-full bg-[radial-gradient(circle_at_top_left,_rgba(184,255,84,0.08),_transparent_28%),linear-gradient(180deg,_rgba(34,16,61,0.98),_rgba(14,7,28,1))] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl space-y-6">

        {/* Voltar */}
        <button
          onClick={() => navigate('/scout')}
          className="inline-flex items-center gap-1.5 text-xs text-cep-muted hover:text-cep-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Central do Scout
        </button>

        {/* Header */}
        <header className="rounded-[2rem] border border-cep-purple-800 bg-cep-purple-900/80 p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-cep-purple-700 bg-cep-purple-950/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-cep-lime-300">
                <Shield className="h-3.5 w-3.5" />
                Equipes
              </span>
              <h1 className="text-2xl font-semibold text-cep-white">Cadastro de Equipes</h1>
              <p className="text-sm text-cep-muted">Gerencie equipes próprias e adversárias para o Scout.</p>
            </div>
            <Button
              onClick={() => { setShowForm(true); setFormError(null) }}
              className="shrink-0"
            >
              <Plus className="h-4 w-4 mr-1" />
              Nova Equipe
            </Button>
          </div>
        </header>

        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cep-muted pointer-events-none" />
          <input
            className="w-full rounded-lg border border-cep-purple-700 bg-cep-purple-950/60 pl-9 pr-3 py-2 text-sm text-cep-white placeholder-cep-muted focus:outline-none focus:border-cep-purple-400"
            placeholder="Buscar por nome…"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          />
        </div>

        {/* Formulário nova equipe */}
        {showForm && (
          <section className="rounded-2xl border border-cep-purple-800 bg-cep-purple-950/40 p-5 space-y-4">
            <h2 className="text-xs font-medium uppercase tracking-widest text-cep-muted">
              Nova Equipe
            </h2>
            {formError && (
              <p className="text-xs text-red-400 rounded-lg border border-red-800/40 bg-red-950/20 px-3 py-2">
                {formError}
              </p>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={LABEL_CLS}>Nome *</label>
                  <input
                    className={INPUT_CLS}
                    value={form.name}
                    required
                    placeholder="Nome da equipe"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('name', e.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLS}>Tipo de Equipe</label>
                  <select
                    className={SELECT_CLS}
                    value={form.teamType ?? ''}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setField('teamType', e.target.value)}
                  >
                    <option value="">— selecionar —</option>
                    {opts('LISTA_TIPO_EQUIPE').map((o) => (
                      <option key={o.code} value={o.code}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLS}>Categoria</label>
                  <select
                    className={SELECT_CLS}
                    value={form.category ?? ''}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setField('category', e.target.value)}
                  >
                    <option value="">— selecionar —</option>
                    {opts('LISTA_CATEGORIA').map((o) => (
                      <option key={o.code} value={o.code}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2.5 text-sm text-cep-muted cursor-pointer hover:text-cep-white transition-colors">
                <input
                  type="checkbox"
                  checked={!!form.isInternal}
                  className="rounded border-cep-purple-600 bg-cep-purple-950 accent-cep-lime-400"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('isInternal', e.target.checked)}
                />
                Equipe interna (própria)
              </label>
              <div className="flex gap-3 pt-1">
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Cadastrando…' : 'Cadastrar equipe →'}
                </Button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setForm(EMPTY_FORM) }}
                  className="rounded-xl border border-cep-purple-700 bg-cep-purple-950/60 px-4 py-2 text-sm font-medium text-cep-muted hover:text-cep-white hover:border-cep-purple-500 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Lista */}
        {loading ? (
          <p className="text-sm text-cep-muted text-center py-8">Carregando equipes…</p>
        ) : error ? (
          <p className="text-sm text-red-400 text-center py-8">{error}</p>
        ) : teams.length === 0 ? (
          <div className="rounded-2xl border border-cep-purple-800 bg-cep-purple-950/40 p-8 text-center space-y-2">
            <Shield className="mx-auto h-8 w-8 text-cep-muted opacity-40" />
            <p className="text-sm text-cep-muted">Nenhuma equipe cadastrada.</p>
            <p className="text-xs text-cep-muted opacity-60">
              Use "Nova Equipe" para adicionar equipes próprias ou adversárias.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {teams.map((t) => (
              <div
                key={t.id}
                className="rounded-xl border border-cep-purple-800 bg-cep-purple-950/40 px-4 py-3 flex items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-cep-white truncate">{t.name}</p>
                  {t.category && (
                    <p className="text-xs text-cep-muted mt-0.5">{t.category}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5 items-center shrink-0">
                  {t.teamType && (
                    <span className={`text-xs rounded-full px-2 py-0.5 font-medium ${TEAM_TYPE_COLORS[t.teamType] ?? 'bg-cep-purple-800/60 text-cep-muted'}`}>
                      {t.teamType}
                    </span>
                  )}
                  {t.isInternal && (
                    <span className="text-xs rounded-full px-2 py-0.5 font-medium bg-cep-lime-400/15 text-cep-lime-300">
                      Interna
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

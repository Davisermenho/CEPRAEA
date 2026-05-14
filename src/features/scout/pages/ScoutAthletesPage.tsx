import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Search, UserCheck } from 'lucide-react'
import { Button } from '@/shared/components/Button'
import {
  fetchScoutAthletes,
  createScoutAthlete,
  fetchScoutCodebook,
} from '../scoutApi'
import type {
  AthleteWithScoutProfile,
  AthleteWithScoutProfileWriteInput,
  ScoutCodeValue,
} from '@/types'

// ── Helpers ──────────────────────────────────────────────────────────────────

type CodeMap = Record<string, ScoutCodeValue[]>

function buildMap(lists: { id: string; listKey: string; values: ScoutCodeValue[] }[]): { idMap: Record<string, string>; valueMap: CodeMap } {
  const idMap: Record<string, string> = {}
  const valueMap: CodeMap = {}
  for (const l of lists) {
    idMap[l.listKey] = l.id
    valueMap[l.id] = l.values
  }
  return { idMap, valueMap }
}

const INPUT_CLS = 'w-full text-sm border rounded px-2 py-1.5'
const LABEL_CLS = 'block text-xs font-medium text-neutral-600 mb-1'
const SELECT_CLS = 'w-full text-sm border rounded px-2 py-1.5 bg-white'

const EMPTY_FORM: AthleteWithScoutProfileWriteInput = {
  name: '',
  email: '',
  phone: '',
  category: '',
  level: '',
  status: 'ativo',
  notes: '',
  dominantHand: '',
  mainFunction: '',
  posOf3x1: '',
  posOf4x0: '',
  posDefOf3x0: '',
  isGoalkeeper: false,
  isSpecialist: false,
  isPlaymaker: false,
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ScoutAthletesPage() {
  const navigate = useNavigate()

  const [athletes, setAthletes] = useState<AthleteWithScoutProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const [idMap, setIdMap] = useState<Record<string, string>>({})
  const [valueMap, setValueMap] = useState<CodeMap>({})

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<AthleteWithScoutProfileWriteInput>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const loadAthletes = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchScoutAthletes(search ? { name: search } : undefined)
      setAthletes(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar atletas.')
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => { loadAthletes() }, [loadAthletes])

  useEffect(() => {
    fetchScoutCodebook([
      'LISTA_MAO_DOMINANTE',
      'LISTA_FUNCAO_PRINCIPAL',
      'LISTA_STATUS_ATLETA',
      'LISTA_POS_OF_3X1',
      'LISTA_POS_OF_4X0',
      'LISTA_POS_DEF_3X0',
    ]).then((lists) => {
      const { idMap: im, valueMap: vm } = buildMap(lists)
      setIdMap(im)
      setValueMap(vm)
    }).catch(() => undefined)
  }, [])

  function opts(listKey: string): ScoutCodeValue[] {
    return valueMap[idMap[listKey]] ?? []
  }

  function setField<K extends keyof AthleteWithScoutProfileWriteInput>(
    key: K, val: AthleteWithScoutProfileWriteInput[K],
  ) { setForm((p) => ({ ...p, [key]: val })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { setFormError('Nome é obrigatório.'); return }
    setSubmitting(true); setFormError(null)
    try {
      await createScoutAthlete({
        ...form,
        name: form.name.trim(),
        email: form.email?.trim() || undefined,
        phone: form.phone?.trim() || undefined,
        category: form.category?.trim() || undefined,
        level: form.level?.trim() || undefined,
        notes: form.notes?.trim() || undefined,
        dominantHand: form.dominantHand?.trim() || undefined,
        mainFunction: form.mainFunction?.trim() || undefined,
        posOf3x1: form.posOf3x1?.trim() || undefined,
        posOf4x0: form.posOf4x0?.trim() || undefined,
        posDefOf3x0: form.posDefOf3x0?.trim() || undefined,
      })
      setForm(EMPTY_FORM); setShowForm(false); await loadAthletes()
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Erro ao cadastrar.')
    } finally { setSubmitting(false) }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <Button variant="ghost" size="sm" onClick={() => navigate('/scout')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <UserCheck className="h-5 w-5 text-blue-600" />
        <h1 className="font-semibold text-gray-900">Cadastro de Atletas</h1>
        <div className="ml-auto">
          <Button size="sm" onClick={() => { setShowForm(true); setFormError(null) }}>
            <Plus className="h-4 w-4 mr-1" />
            Nova Atleta
          </Button>
        </div>
      </div>

      <div className="flex-1 p-4 max-w-4xl mx-auto w-full space-y-4">

        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            className={`${INPUT_CLS} pl-9`}
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          />
        </div>

        {/* Formulário */}
        {showForm && (
          <div className="bg-white border rounded-lg p-4 space-y-4">
            <h2 className="font-semibold text-gray-800">Nova Atleta</h2>
            {formError && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{formError}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">

              <fieldset className="space-y-3">
                <legend className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Dados Básicos</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={LABEL_CLS}>Nome *</label>
                    <input className={INPUT_CLS} value={form.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('name', e.target.value)} required />
                  </div>
                  <div>
                    <label className={LABEL_CLS}>E-mail</label>
                    <input type="email" className={INPUT_CLS} value={form.email ?? ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('email', e.target.value)} />
                  </div>
                  <div>
                    <label className={LABEL_CLS}>Telefone</label>
                    <input className={INPUT_CLS} value={form.phone ?? ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('phone', e.target.value)} />
                  </div>
                  <div>
                    <label className={LABEL_CLS}>Status</label>
                    <select className={SELECT_CLS} value={form.status ?? 'ativo'}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setField('status', e.target.value as AthleteWithScoutProfileWriteInput['status'])}>
                      {opts('LISTA_STATUS_ATLETA').length > 0
                        ? opts('LISTA_STATUS_ATLETA').map((o) => <option key={o.code} value={o.code}>{o.label}</option>)
                        : <><option value="ativo">Ativa</option><option value="inativo">Inativa</option></>
                      }
                    </select>
                  </div>
                  <div>
                    <label className={LABEL_CLS}>Categoria</label>
                    <input className={INPUT_CLS} value={form.category ?? ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('category', e.target.value)} />
                  </div>
                  <div>
                    <label className={LABEL_CLS}>Nível</label>
                    <input className={INPUT_CLS} value={form.level ?? ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('level', e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className={LABEL_CLS}>Observações</label>
                  <textarea className="w-full text-sm border rounded px-2 py-1.5 min-h-[60px]"
                    value={form.notes ?? ''}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setField('notes', e.target.value)} />
                </div>
              </fieldset>

              <fieldset className="space-y-3">
                <legend className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Perfil Tático Scout</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={LABEL_CLS}>Mão Dominante</label>
                    <select className={SELECT_CLS} value={form.dominantHand ?? ''}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setField('dominantHand', e.target.value)}>
                      <option value="">— selecionar —</option>
                      {opts('LISTA_MAO_DOMINANTE').map((o) => <option key={o.code} value={o.code}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={LABEL_CLS}>Função Principal</label>
                    <select className={SELECT_CLS} value={form.mainFunction ?? ''}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setField('mainFunction', e.target.value)}>
                      <option value="">— selecionar —</option>
                      {opts('LISTA_FUNCAO_PRINCIPAL').map((o) => <option key={o.code} value={o.code}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={LABEL_CLS}>Posição Ofensiva (3×1)</label>
                    <select className={SELECT_CLS} value={form.posOf3x1 ?? ''}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setField('posOf3x1', e.target.value)}>
                      <option value="">— selecionar —</option>
                      {opts('LISTA_POS_OF_3X1').map((o) => <option key={o.code} value={o.code}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={LABEL_CLS}>Posição Ofensiva (4×0)</label>
                    <select className={SELECT_CLS} value={form.posOf4x0 ?? ''}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setField('posOf4x0', e.target.value)}>
                      <option value="">— selecionar —</option>
                      {opts('LISTA_POS_OF_4X0').map((o) => <option key={o.code} value={o.code}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={LABEL_CLS}>Posição Defensiva (3×0)</label>
                    <select className={SELECT_CLS} value={form.posDefOf3x0 ?? ''}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setField('posDefOf3x0', e.target.value)}>
                      <option value="">— selecionar —</option>
                      {opts('LISTA_POS_DEF_3X0').map((o) => <option key={o.code} value={o.code}>{o.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 pt-1">
                  {([['isGoalkeeper', 'Goleira'], ['isSpecialist', 'Especialista'], ['isPlaymaker', 'Armadora']] as const).map(([key, lbl]) => (
                    <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={!!form[key]}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField(key, e.target.checked)}
                        className="rounded" />
                      {lbl}
                    </label>
                  ))}
                </div>
              </fieldset>

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

        {/* Lista */}
        {loading ? (
          <p className="text-sm text-gray-500 text-center py-8">Carregando...</p>
        ) : error ? (
          <p className="text-sm text-red-600 text-center py-8">{error}</p>
        ) : athletes.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">Nenhuma atleta cadastrada.</p>
        ) : (
          <div className="space-y-2">
            {athletes.map((a) => (
              <div key={a.id} className="bg-white border rounded-lg px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{a.name}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {[a.mainFunction, a.dominantHand, a.category].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {a.isGoalkeeper && <span className="text-xs bg-blue-100 text-blue-700 rounded px-2 py-0.5">Goleira</span>}
                  {a.isPlaymaker && <span className="text-xs bg-purple-100 text-purple-700 rounded px-2 py-0.5">Armadora</span>}
                  {a.isSpecialist && <span className="text-xs bg-orange-100 text-orange-700 rounded px-2 py-0.5">Especialista</span>}
                  <span className={`text-xs rounded px-2 py-0.5 ${a.status === 'ativo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {a.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, BarChart2, Filter } from 'lucide-react'
import { Button } from '@/shared/components/Button'
import { fetchScoutGames, fetchScoutReport } from '../scoutApi'
import type { ScoutGameRecord, ScoutReport, ScoutReportTrainingPriority } from '@/types'

// ── Constants ─────────────────────────────────────────────────────────────────

const LABEL_CLS = 'block text-xs font-medium text-neutral-600 mb-1'
const SELECT_CLS = 'text-sm border rounded px-2 py-1.5 bg-white'

const PRIORITY_COLORS: Record<string, string> = {
  ALTA:   'bg-red-100 text-red-700',
  MEDIA:  'bg-orange-100 text-orange-700',
  BAIXA:  'bg-yellow-100 text-yellow-700',
  MANTER: 'bg-green-100 text-green-700',
}

const PRIORITY_ORDER: Record<string, number> = { ALTA: 0, MEDIA: 1, BAIXA: 2, MANTER: 3 }

function gameLabel(g: ScoutGameRecord): string {
  const parts = [g.gameDate ?? '—', g.analyzedTeam ?? '', 'vs', g.opponent ?? '—'].filter(Boolean)
  return parts.join(' ')
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ScoutReportPage() {
  const navigate = useNavigate()

  const [games, setGames] = useState<ScoutGameRecord[]>([])
  const [gameId, setGameId] = useState('')
  const [reports, setReports] = useState<ScoutReport[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // filters
  const [filterBlock, setFilterBlock] = useState('')
  const [filterPriority, setFilterPriority] = useState<ScoutReportTrainingPriority | ''>('')

  useEffect(() => {
    fetchScoutGames().then(setGames).catch(() => undefined)
  }, [])

  async function loadReport(gid: string) {
    if (!gid) { setReports([]); return }
    setLoading(true); setError(null)
    try {
      const data = await fetchScoutReport(gid)
      setReports(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar relatório.')
    } finally { setLoading(false) }
  }

  function handleGameChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setGameId(e.target.value)
    loadReport(e.target.value)
  }

  // derived
  const blocks = Array.from(new Set(reports.map((r) => r.reportBlock))).sort()

  const filtered = reports.filter((r) => {
    if (filterBlock && r.reportBlock !== filterBlock) return false
    if (filterPriority && r.trainingPriority !== filterPriority) return false
    return true
  })

  const grouped: Record<string, ScoutReport[]> = {}
  for (const r of filtered) {
    if (!grouped[r.reportBlock]) grouped[r.reportBlock] = []
    grouped[r.reportBlock].push(r)
  }
  const sortedBlocks = Object.keys(grouped).sort()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <Button variant="ghost" size="sm" onClick={() => navigate('/scout')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <BarChart2 className="h-5 w-5 text-emerald-600" />
        <h1 className="font-semibold text-gray-900">Relatório Pós-Jogo</h1>
      </div>

      <div className="flex-1 p-4 max-w-5xl mx-auto w-full space-y-4">

        {/* Seletor de jogo */}
        <div className="bg-white border rounded-lg p-4 space-y-3">
          <div>
            <label className={LABEL_CLS}>Jogo</label>
            <select className={`${SELECT_CLS} w-full`} value={gameId} onChange={handleGameChange}>
              <option value="">— selecionar jogo —</option>
              {games.map((g) => (
                <option key={g.id} value={g.id}>{gameLabel(g)}</option>
              ))}
            </select>
          </div>

          {gameId && (
            <div className="flex flex-wrap gap-3 items-end pt-1">
              <Filter className="h-4 w-4 text-gray-400 self-end mb-1.5" />
              <div>
                <label className={LABEL_CLS}>Bloco</label>
                <select className={SELECT_CLS} value={filterBlock}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterBlock(e.target.value)}>
                  <option value="">Todos</option>
                  {blocks.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className={LABEL_CLS}>Prioridade</label>
                <select className={SELECT_CLS} value={filterPriority}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterPriority(e.target.value as ScoutReportTrainingPriority | '')}>
                  <option value="">Todas</option>
                  {(['ALTA', 'MEDIA', 'BAIXA', 'MANTER'] as const).map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              {(filterBlock || filterPriority) && (
                <Button variant="ghost" size="sm"
                  onClick={() => { setFilterBlock(''); setFilterPriority('') }}>
                  Limpar filtros
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Conteúdo */}
        {!gameId ? (
          <p className="text-sm text-gray-500 text-center py-10">Selecione um jogo para ver o relatório.</p>
        ) : loading ? (
          <p className="text-sm text-gray-500 text-center py-10">Carregando...</p>
        ) : error ? (
          <p className="text-sm text-red-600 text-center py-10">{error}</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-10">Nenhum indicador encontrado.</p>
        ) : (
          <div className="space-y-4">
            {/* Resumo */}
            <div className="flex flex-wrap gap-2">
              {(['ALTA', 'MEDIA', 'BAIXA', 'MANTER'] as const).map((p) => {
                const count = filtered.filter((r) => r.trainingPriority === p).length
                if (!count) return null
                return (
                  <span key={p} className={`text-xs rounded-full px-3 py-1 font-medium ${PRIORITY_COLORS[p]}`}>
                    {p}: {count}
                  </span>
                )
              })}
              <span className="text-xs text-gray-500 self-center">
                {filtered.length} indicador{filtered.length !== 1 ? 'es' : ''}
              </span>
            </div>

            {/* Blocos */}
            {sortedBlocks.map((block) => (
              <div key={block} className="bg-white border rounded-lg overflow-hidden">
                <div className="bg-gray-50 border-b px-4 py-2">
                  <h2 className="font-semibold text-sm text-gray-800">{block}</h2>
                </div>
                <div className="divide-y">
                  {grouped[block]
                    .sort((a, b) => (PRIORITY_ORDER[a.trainingPriority ?? 'MANTER'] ?? 3) - (PRIORITY_ORDER[b.trainingPriority ?? 'MANTER'] ?? 3))
                    .map((r) => (
                      <div key={r.id} className="px-4 py-3 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-gray-900">{r.indicator}</p>
                          {r.trainingPriority && (
                            <span className={`text-xs rounded px-2 py-0.5 flex-shrink-0 ${PRIORITY_COLORS[r.trainingPriority]}`}>
                              {r.trainingPriority}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                          {r.valueText && <span><strong>Valor:</strong> {r.valueText}</span>}
                          {r.sampleSize != null && <span><strong>n=</strong>{r.sampleSize}</span>}
                        </div>
                        {r.technicalReading && (
                          <p className="text-xs text-gray-600 italic">{r.technicalReading}</p>
                        )}
                        {r.reportNotes && (
                          <p className="text-xs text-gray-500">{r.reportNotes}</p>
                        )}
                        {r.evidenceIds && r.evidenceIds.length > 0 && (
                          <p className="text-xs text-blue-600">
                            Evidências: {r.evidenceIds.join(', ')}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

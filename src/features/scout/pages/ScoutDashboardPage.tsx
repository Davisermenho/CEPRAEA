import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, LayoutDashboard } from 'lucide-react'
import { Button } from '@/shared/components/Button'
import { fetchScoutGames, fetchScoutReport } from '../scoutApi'
import type { ScoutGameRecord, ScoutReport, ScoutReportTrainingPriority } from '@/types'

// ── Types ─────────────────────────────────────────────────────────────────────

interface BlockSummary {
  block: string
  total: number
  alta: number
  media: number
  baixa: number
  manter: number
}

// ── Constants ─────────────────────────────────────────────────────────────────

const LABEL_CLS = 'block text-xs font-medium text-neutral-600 mb-1'
const SELECT_CLS = 'text-sm border rounded px-2 py-1.5 bg-white w-full'

const PRIORITY_COLORS: Record<string, string> = {
  ALTA:   'text-red-700',
  MEDIA:  'text-orange-600',
  BAIXA:  'text-yellow-600',
  MANTER: 'text-green-700',
}

const PRIORITY_BG: Record<string, string> = {
  ALTA:   'bg-red-50 border-red-200',
  MEDIA:  'bg-orange-50 border-orange-200',
  BAIXA:  'bg-yellow-50 border-yellow-200',
  MANTER: 'bg-green-50 border-green-200',
}

function gameLabel(g: ScoutGameRecord): string {
  return [g.gameDate ?? '—', g.analyzedTeam ?? '', 'vs', g.opponent ?? '—'].filter(Boolean).join(' ')
}

// ── Aggregate helpers ─────────────────────────────────────────────────────────

function buildBlockSummary(reports: ScoutReport[]): BlockSummary[] {
  const map: Record<string, BlockSummary> = {}
  for (const r of reports) {
    if (!map[r.reportBlock]) {
      map[r.reportBlock] = { block: r.reportBlock, total: 0, alta: 0, media: 0, baixa: 0, manter: 0 }
    }
    const s = map[r.reportBlock]
    s.total++
    if (r.trainingPriority === 'ALTA') s.alta++
    else if (r.trainingPriority === 'MEDIA') s.media++
    else if (r.trainingPriority === 'BAIXA') s.baixa++
    else if (r.trainingPriority === 'MANTER') s.manter++
  }
  return Object.values(map).sort((a, b) => b.alta - a.alta || a.block.localeCompare(b.block))
}

function topByPriority(reports: ScoutReport[], priority: ScoutReportTrainingPriority, limit = 5): ScoutReport[] {
  return reports.filter((r) => r.trainingPriority === priority).slice(0, limit)
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ScoutDashboardPage() {
  const navigate = useNavigate()

  const [games, setGames] = useState<ScoutGameRecord[]>([])
  const [gameId, setGameId] = useState('')
  const [reports, setReports] = useState<ScoutReport[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchScoutGames().then(setGames).catch(() => undefined)
  }, [])

  async function loadGame(gid: string) {
    if (!gid) { setReports([]); return }
    setLoading(true); setError(null)
    try {
      const data = await fetchScoutReport(gid)
      setReports(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar dados.')
    } finally { setLoading(false) }
  }

  function handleGameChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setGameId(e.target.value)
    loadGame(e.target.value)
  }

  // derived
  const totalIndicators = reports.length
  const byPriority = (['ALTA', 'MEDIA', 'BAIXA', 'MANTER'] as const).map((p) => ({
    priority: p,
    count: reports.filter((r) => r.trainingPriority === p).length,
  }))
  const blockSummary = buildBlockSummary(reports)
  const altaItems = topByPriority(reports, 'ALTA')
  const selectedGame = games.find((g) => g.id === gameId)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <Button variant="ghost" size="sm" onClick={() => navigate('/scout')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <LayoutDashboard className="h-5 w-5 text-emerald-600" />
        <h1 className="font-semibold text-gray-900">Dashboard Executivo</h1>
      </div>

      <div className="flex-1 p-4 max-w-4xl mx-auto w-full space-y-5">

        {/* Seletor de jogo */}
        <div className="bg-white border rounded-lg p-4">
          <label className={LABEL_CLS}>Jogo analisado</label>
          <select className={SELECT_CLS} value={gameId} onChange={handleGameChange}>
            <option value="">— selecionar jogo —</option>
            {games.map((g) => (
              <option key={g.id} value={g.id}>{gameLabel(g)}</option>
            ))}
          </select>
          {selectedGame?.notes && (
            <p className="mt-2 text-xs text-gray-500">{selectedGame.notes}</p>
          )}
        </div>

        {!gameId ? (
          <p className="text-sm text-gray-500 text-center py-10">Selecione um jogo para visualizar o dashboard.</p>
        ) : loading ? (
          <p className="text-sm text-gray-500 text-center py-10">Carregando...</p>
        ) : error ? (
          <p className="text-sm text-red-600 text-center py-10">{error}</p>
        ) : reports.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-10">Nenhum dado de relatório para este jogo.</p>
        ) : (
          <>
            {/* Métricas de topo */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white border rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-gray-900">{totalIndicators}</p>
                <p className="text-xs text-gray-500 mt-0.5">Total indicadores</p>
              </div>
              {byPriority.filter((bp) => bp.count > 0).map((bp) => (
                <div key={bp.priority} className={`border rounded-lg p-3 text-center ${PRIORITY_BG[bp.priority] ?? 'bg-white'}`}>
                  <p className={`text-2xl font-bold ${PRIORITY_COLORS[bp.priority] ?? 'text-gray-900'}`}>{bp.count}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{bp.priority}</p>
                </div>
              ))}
            </div>

            {/* Resumo por bloco */}
            <div className="bg-white border rounded-lg overflow-hidden">
              <div className="bg-gray-50 border-b px-4 py-2">
                <h2 className="font-semibold text-sm text-gray-800">Indicadores por bloco</h2>
              </div>
              <div className="divide-y">
                {blockSummary.map((bs) => (
                  <div key={bs.block} className="px-4 py-3 flex items-center gap-3">
                    <p className="text-sm font-medium text-gray-800 flex-1">{bs.block}</p>
                    <div className="flex gap-2 text-xs">
                      {bs.alta > 0 && <span className="text-red-700 font-semibold">A:{bs.alta}</span>}
                      {bs.media > 0 && <span className="text-orange-600 font-semibold">M:{bs.media}</span>}
                      {bs.baixa > 0 && <span className="text-yellow-600">B:{bs.baixa}</span>}
                      {bs.manter > 0 && <span className="text-green-700">✓:{bs.manter}</span>}
                      <span className="text-gray-400">({bs.total})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top ALTA prioridade */}
            {altaItems.length > 0 && (
              <div className="bg-white border rounded-lg overflow-hidden">
                <div className="bg-red-50 border-b border-red-200 px-4 py-2">
                  <h2 className="font-semibold text-sm text-red-800">Indicadores prioritários — ALTA</h2>
                </div>
                <div className="divide-y">
                  {altaItems.map((r) => (
                    <div key={r.id} className="px-4 py-3 space-y-1">
                      <p className="text-sm font-medium text-gray-900">{r.indicator}</p>
                      <p className="text-xs text-gray-500">{r.reportBlock}</p>
                      {r.valueText && <p className="text-xs text-gray-600">Valor: {r.valueText}</p>}
                      {r.technicalReading && (
                        <p className="text-xs text-gray-600 italic">{r.technicalReading}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

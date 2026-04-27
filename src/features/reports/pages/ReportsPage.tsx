import { useState } from 'react'
import { BarChart2, Download } from 'lucide-react'
import { useAttendanceStore } from '@/stores/attendanceStore'
import { Button } from '@/shared/components/Button'
import { EmptyState } from '@/shared/components/EmptyState'
import { formatPercent, todayISO } from '@/lib/utils'
import { frequencyToCsv, downloadCsv } from '@/lib/export'

export default function ReportsPage() {
  const { getFrequencyReports } = useAttendanceStore()
  const [fromISO, setFromISO] = useState(() => {
    const d = new Date()
    d.setMonth(d.getMonth() - 3)
    return d.toISOString().slice(0, 10)
  })
  const [toISO, setToISO] = useState(todayISO)
  const [sortBy, setSortBy] = useState<'nome' | 'pct'>('nome')

  const reports = getFrequencyReports(fromISO, toISO)

  const sorted = [...reports].sort((a, b) =>
    sortBy === 'pct'
      ? b.percentualPresenca - a.percentualPresenca
      : a.nomeAtleta.localeCompare(b.nomeAtleta, 'pt-BR')
  )

  const handleExport = () => {
    const csv = frequencyToCsv(sorted)
    downloadCsv(csv, `cepraea-frequencias-${toISO}.csv`)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-cep-purple-900 border-b border-cep-purple-800 px-4 py-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-cep-lime-400 tracking-widest uppercase mb-0.5">Análise</p>
            <h1 className="text-xl font-black text-cep-white">Relatórios</h1>
          </div>
          <Button variant="secondary" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4" />
            CSV
          </Button>
        </div>

        {/* Date filters */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-cep-muted mb-1 font-medium">De</label>
            <input
              type="date"
              value={fromISO}
              onChange={(e) => setFromISO(e.target.value)}
              className="w-full h-9 rounded-xl border border-cep-purple-700 bg-cep-purple-850 px-3 text-sm text-cep-white focus:outline-none focus:ring-2 focus:ring-cep-lime-400"
            />
          </div>
          <div>
            <label className="block text-xs text-cep-muted mb-1 font-medium">Até</label>
            <input
              type="date"
              value={toISO}
              onChange={(e) => setToISO(e.target.value)}
              className="w-full h-9 rounded-xl border border-cep-purple-700 bg-cep-purple-850 px-3 text-sm text-cep-white focus:outline-none focus:ring-2 focus:ring-cep-lime-400"
            />
          </div>
        </div>

        {/* Sort */}
        <div className="flex gap-1 bg-cep-purple-850 border border-cep-purple-700 rounded-xl p-1">
          {(['nome', 'pct'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`flex-1 h-7 rounded-lg text-xs font-semibold transition-colors ${
                sortBy === s
                  ? 'bg-cep-purple-950 text-cep-lime-400'
                  : 'text-cep-muted hover:text-cep-white'
              }`}
            >
              {s === 'nome' ? 'Por nome' : 'Por frequência'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        {sorted.length === 0 ? (
          <EmptyState
            icon={BarChart2}
            title="Nenhum dado disponível"
            description="Adicione atletas e marque presenças para ver os relatórios."
          />
        ) : (
          <>
            {/* Column headers */}
            <div className="sticky top-0 bg-cep-purple-900 border-b border-cep-purple-800 px-4 py-2 grid grid-cols-6 gap-1 text-xs font-bold text-cep-muted uppercase tracking-wide">
              <span className="col-span-2">Atleta</span>
              <span className="text-center">Treinos</span>
              <span className="text-center text-green-400">Pres.</span>
              <span className="text-center text-red-400">Aus.</span>
              <span className="text-center text-cep-lime-400">%</span>
            </div>

            <div className="divide-y divide-cep-purple-800">
              {sorted.map((r) => (
                <div
                  key={r.atletaId}
                  className="px-4 py-3 grid grid-cols-6 gap-1 items-center hover:bg-cep-purple-850 transition-colors"
                >
                  <span className="col-span-2 text-sm font-semibold text-cep-white truncate">{r.nomeAtleta}</span>
                  <span className="text-center text-sm text-cep-muted">{r.totalTreinos}</span>
                  <span className="text-center text-sm font-medium text-green-400">{r.presentes}</span>
                  <span className="text-center text-sm font-medium text-red-400">{r.ausentes}</span>
                  <span className={`text-center text-sm font-black ${
                    r.percentualPresenca >= 75 ? 'text-cep-lime-400' :
                    r.percentualPresenca >= 50 ? 'text-cep-gold-400' : 'text-red-400'
                  }`}>
                    {formatPercent(r.percentualPresenca)}
                  </span>
                </div>
              ))}
            </div>

            {/* Summary footer */}
            {sorted.length > 0 && (
              <div className="px-4 py-3 bg-cep-purple-900 border-t border-cep-purple-800 grid grid-cols-6 gap-1 text-xs font-bold text-cep-muted">
                <span className="col-span-2">Média geral</span>
                <span className="text-center">{sorted[0]?.totalTreinos ?? 0}</span>
                <span className="text-center text-green-400">
                  {sorted.length > 0 ? Math.round(sorted.reduce((s, r) => s + r.presentes, 0) / sorted.length) : 0}
                </span>
                <span className="text-center text-red-400">
                  {sorted.length > 0 ? Math.round(sorted.reduce((s, r) => s + r.ausentes, 0) / sorted.length) : 0}
                </span>
                <span className="text-center text-cep-lime-400">
                  {formatPercent(sorted.length > 0 ? sorted.reduce((s, r) => s + r.percentualPresenca, 0) / sorted.length : 0)}
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

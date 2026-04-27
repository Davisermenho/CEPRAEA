import { useState, useRef } from 'react'
import { Download, Upload, FileSpreadsheet, FileJson, AlertTriangle } from 'lucide-react'
import { useAthleteStore } from '@/stores/athleteStore'
import { useTrainingStore } from '@/stores/trainingStore'
import { useAttendanceStore } from '@/stores/attendanceStore'
import { Button } from '@/shared/components/Button'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import {
  athletesToCsv,
  trainingsToCsv,
  attendanceToCsv,
  downloadCsv,
  exportToXlsx,
  exportFullBackup,
  importFullBackup,
} from '@/lib/export'

export default function ExportPage() {
  const athletes = useAthleteStore((s) => s.athletes)
  const trainings = useTrainingStore((s) => s.trainings)
  const { records, getFrequencyReports } = useAttendanceStore()
  const { loadAll: loadAthletes } = useAthleteStore()
  const { loadAll: loadTrainings } = useTrainingStore()
  const { loadAll: loadAttendance } = useAttendanceStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importConfirm, setImportConfirm] = useState(false)
  const [pendingJson, setPendingJson] = useState<string | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const [toast, setToast] = useState('')

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const trainingMap = new Map(trainings.map((t) => [t.id, t]))
  const athleteMap = new Map(athletes.map((a) => [a.id, a]))

  const handleExportXlsx = async () => {
    setLoading('xlsx')
    const reports = getFrequencyReports()
    await exportToXlsx(athletes, trainings, records, reports)
    setLoading(null)
    showToast('Arquivo XLSX baixado!')
  }

  const handleExportCsv = (type: string) => {
    let csv = ''
    let filename = ''
    if (type === 'atletas') { csv = athletesToCsv(athletes); filename = 'cepraea-atletas.csv' }
    if (type === 'treinos') { csv = trainingsToCsv(trainings); filename = 'cepraea-treinos.csv' }
    if (type === 'presencas') { csv = attendanceToCsv(records, trainingMap, athleteMap); filename = 'cepraea-presencas.csv' }
    downloadCsv(csv, filename)
    showToast('CSV baixado!')
  }

  const handleBackup = async () => {
    setLoading('backup')
    await exportFullBackup()
    setLoading(null)
    showToast('Backup JSON baixado!')
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const json = ev.target?.result as string
      setPendingJson(json)
      setImportConfirm(true)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleImport = async () => {
    if (!pendingJson) return
    setLoading('import')
    try {
      await importFullBackup(pendingJson)
      await Promise.all([loadAthletes(), loadTrainings(), loadAttendance()])
      showToast('Backup restaurado com sucesso!')
    } catch (err) {
      showToast(`Erro ao importar: ${err instanceof Error ? err.message : 'arquivo inválido'}`)
    }
    setLoading(null)
    setImportConfirm(false)
    setPendingJson(null)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-cep-purple-900 border-b border-cep-purple-800 px-4 py-4">
        <p className="text-xs font-bold text-cep-lime-400 tracking-widest uppercase mb-0.5">Dados</p>
        <h1 className="text-xl font-black text-cep-white">Exportar / Backup</h1>
        <p className="text-sm text-cep-muted mt-0.5">Exporte dados ou faça backup completo</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {toast && (
          <div className="rounded-xl bg-cep-lime-400/15 border border-cep-lime-400/40 px-4 py-3 text-sm text-cep-lime-400 font-medium">
            {toast}
          </div>
        )}

        {/* XLSX */}
        <div className="bg-cep-purple-850 rounded-2xl border border-cep-purple-700 p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-green-500/20 p-2.5">
              <FileSpreadsheet className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-cep-white">Planilha XLSX</p>
              <p className="text-xs text-cep-muted">4 abas: Atletas, Treinos, Presenças, Frequências</p>
            </div>
          </div>
          <Button
            fullWidth
            variant="secondary"
            onClick={handleExportXlsx}
            loading={loading === 'xlsx'}
          >
            <Download className="h-4 w-4" />
            Baixar XLSX (Google Sheets compatível)
          </Button>
        </div>

        {/* CSV individual */}
        <div className="bg-cep-purple-850 rounded-2xl border border-cep-purple-700 p-4 space-y-3">
          <p className="text-sm font-bold text-cep-white">Exportar CSV individual</p>
          <div className="space-y-2">
            {[
              { key: 'atletas', label: 'Atletas', count: athletes.length },
              { key: 'treinos', label: 'Treinos', count: trainings.length },
              { key: 'presencas', label: 'Presenças', count: records.length },
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => handleExportCsv(key)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-cep-purple-800 border border-cep-purple-700 hover:bg-cep-purple-900 active:bg-cep-purple-950 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-cep-muted" />
                  <span className="text-sm font-semibold text-cep-white">{label}</span>
                </div>
                <span className="text-xs text-cep-muted">{count} registros</span>
              </button>
            ))}
          </div>
        </div>

        {/* Backup JSON */}
        <div className="bg-cep-purple-850 rounded-2xl border border-cep-purple-700 p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-cep-purple-700 p-2.5">
              <FileJson className="h-5 w-5 text-cep-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-cep-white">Backup completo (JSON)</p>
              <p className="text-xs text-cep-muted">Exporta e restaura todos os dados</p>
            </div>
          </div>
          <Button
            fullWidth
            variant="secondary"
            onClick={handleBackup}
            loading={loading === 'backup'}
          >
            <Download className="h-4 w-4" />
            Baixar backup JSON
          </Button>

          <div className="border-t border-cep-purple-700 pt-3">
            <div className="flex items-start gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-cep-gold-400 shrink-0 mt-0.5" />
              <p className="text-xs text-cep-sand-100">
                Restaurar um backup substitui <strong>todos</strong> os dados atuais. Esta ação não pode ser desfeita.
              </p>
            </div>
            <Button
              fullWidth
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              loading={loading === 'import'}
            >
              <Upload className="h-4 w-4" />
              Restaurar backup JSON
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
        </div>

        {/* Google Sheets V2 placeholder */}
        <div className="rounded-2xl border border-dashed border-cep-purple-700 p-4 text-center">
          <p className="text-sm font-medium text-cep-muted">Google Sheets — Sincronização automática</p>
          <p className="text-xs text-cep-muted/60 mt-1">Disponível em breve via integração OAuth (V2)</p>
        </div>
      </div>

      <ConfirmDialog
        open={importConfirm}
        onClose={() => { setImportConfirm(false); setPendingJson(null) }}
        onConfirm={handleImport}
        title="Restaurar backup"
        message="Isso substituirá TODOS os dados atuais (atletas, treinos, presenças). Tem certeza?"
        confirmLabel="Restaurar"
        loading={loading === 'import'}
      />
    </div>
  )
}

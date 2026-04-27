import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, RefreshCw, Dumbbell, CheckCircle, XCircle, Clock } from 'lucide-react'
import { useTrainingStore } from '@/stores/trainingStore'
import { HolidayAlert } from '../components/HolidayAlert'
import { TrainingForm } from '../components/TrainingForm'
import { Badge } from '@/shared/components/Badge'
import { EmptyState } from '@/shared/components/EmptyState'
import { Button } from '@/shared/components/Button'
import { formatDateCompact, todayISO } from '@/lib/utils'
import { isHoliday } from '@/lib/holidays'
import type { Training } from '@/types'

type Filter = 'proximos' | 'passados' | 'todos'

const STATUS_ICON = {
  agendado: Clock,
  realizado: CheckCircle,
  cancelado: XCircle,
}

const STATUS_VARIANT: Record<string, 'blue' | 'green' | 'gray'> = {
  agendado: 'blue',
  realizado: 'green',
  cancelado: 'gray',
}

const STATUS_LABEL: Record<string, string> = {
  agendado: 'Agendado',
  realizado: 'Realizado',
  cancelado: 'Cancelado',
}

export default function TrainingsPage() {
  const navigate = useNavigate()
  const { trainings, generateRecurring, addExtra, getConflicts } = useTrainingStore()
  const [filter, setFilter] = useState<Filter>('proximos')
  const [formOpen, setFormOpen] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [toast, setToast] = useState('')

  const today = todayISO()
  const conflicts = getConflicts()

  const filtered = trainings.filter((t) => {
    if (filter === 'proximos') return t.data >= today && t.status !== 'cancelado'
    if (filter === 'passados') return t.data < today || t.status === 'realizado'
    return true
  })

  const handleGenerate = async () => {
    setGenerating(true)
    const count = await generateRecurring()
    setToast(count > 0 ? `${count} treino(s) gerado(s)!` : 'Nenhum treino novo a gerar.')
    setTimeout(() => setToast(''), 3000)
    setGenerating(false)
  }

  const handleSaveExtra = async (data: Omit<Training, 'id' | 'tipo' | 'criadoManualmente' | 'createdAt' | 'updatedAt'>) => {
    await addExtra(data)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Treinos</h1>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={handleGenerate} loading={generating}>
              <RefreshCw className="h-4 w-4" />
              Gerar
            </Button>
            <Button size="sm" onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4" />
              Extra
            </Button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {(['proximos', 'passados', 'todos'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 h-7 rounded-lg text-xs font-medium transition-colors ${filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
            >
              {f === 'proximos' ? 'Próximos' : f === 'passados' ? 'Passados' : 'Todos'}
            </button>
          ))}
        </div>
      </div>

      {/* Holiday alerts */}
      <HolidayAlert conflicts={conflicts} />

      {/* Toast */}
      {toast && (
        <div className="mx-4 mt-3 rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-800 font-medium">
          {toast}
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto pt-4">
        {filtered.length === 0 ? (
          <EmptyState
            icon={Dumbbell}
            title="Nenhum treino encontrado"
            description='Clique em "Gerar" para criar os treinos recorrentes ou em "Extra" para um treino avulso.'
          />
        ) : (
          <ul className="space-y-2 px-4 pb-4">
            {filtered.map((t) => {
              const holiday = isHoliday(t.data)
              const Icon = STATUS_ICON[t.status]
              return (
                <li key={t.id}>
                  <button
                    onClick={() => navigate(`/treinos/${t.id}`)}
                    className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-left hover:border-blue-200 active:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 rounded-xl p-2 ${t.status === 'realizado' ? 'bg-green-100' : t.status === 'cancelado' ? 'bg-gray-100' : 'bg-blue-100'}`}>
                        <Icon className={`h-4 w-4 ${t.status === 'realizado' ? 'text-green-700' : t.status === 'cancelado' ? 'text-gray-500' : 'text-blue-700'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-gray-900 capitalize">
                            {formatDateCompact(t.data)}
                          </p>
                          <Badge variant={STATUS_VARIANT[t.status]}>{STATUS_LABEL[t.status]}</Badge>
                          {t.tipo === 'extra' && <Badge variant="yellow">Extra</Badge>}
                          {holiday && <Badge variant="yellow">⚠ Feriado</Badge>}
                        </div>
                        <p className="text-sm text-gray-600 mt-0.5">
                          {t.horaInicio} – {t.horaFim}
                          {t.local && ` · ${t.local}`}
                        </p>
                        {t.observacoes && (
                          <p className="text-xs text-gray-400 mt-0.5 truncate">{t.observacoes}</p>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <TrainingForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSaveExtra}
      />
    </div>
  )
}

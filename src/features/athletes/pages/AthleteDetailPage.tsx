import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Edit2, Trash2, Phone } from 'lucide-react'
import { useAthleteStore } from '@/stores/athleteStore'
import { useAttendanceStore } from '@/stores/attendanceStore'
import { useTrainingStore } from '@/stores/trainingStore'
import { AthleteForm } from '../components/AthleteForm'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { Badge } from '@/shared/components/Badge'
import { formatDateCompact, formatPhone, formatPercent } from '@/lib/utils'
import type { Athlete, AttendanceStatus } from '@/types'

const STATUS_LABELS: Record<AttendanceStatus, string> = {
  presente: 'Presente',
  ausente: 'Ausente',
  justificado: 'Justificado',
  pendente: 'Pendente',
}

const STATUS_VARIANT: Record<AttendanceStatus, 'green' | 'red' | 'yellow' | 'gray'> = {
  presente: 'green',
  ausente: 'red',
  justificado: 'yellow',
  pendente: 'gray',
}

export default function AthleteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { athletes, update, remove } = useAthleteStore()
  const { getAthleteFrequency, getForAthlete } = useAttendanceStore()
  const trainings = useTrainingStore((s) => s.trainings)

  const athlete = athletes.find((a) => a.id === id)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  if (!athlete) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-cep-muted">Atleta não encontrada.</p>
      </div>
    )
  }

  const freq = getAthleteFrequency(athlete.id)
  const records = getForAthlete(athlete.id)
  const trainingMap = new Map(trainings.map((t) => [t.id, t]))

  const history = records
    .map((r) => ({ record: r, training: trainingMap.get(r.treinoId) }))
    .filter((x) => x.training)
    .sort((a, b) => b.training!.data.localeCompare(a.training!.data))

  const handleSave = async (data: Omit<Athlete, 'id' | 'createdAt' | 'updatedAt'>) => {
    await update(athlete.id, data)
  }

  const handleDelete = async () => {
    setDeleting(true)
    await remove(athlete.id)
    navigate('/atletas', { replace: true })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-cep-purple-900 border-b border-cep-purple-800">
        <div className="flex items-center gap-2 px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 rounded-lg hover:bg-cep-purple-800 text-cep-muted hover:text-cep-white transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="flex-1 text-base font-bold text-cep-white truncate">{athlete.nome}</h1>
          <button onClick={() => setEditOpen(true)} className="p-2 rounded-lg hover:bg-cep-purple-800 text-cep-muted hover:text-cep-white transition-colors">
            <Edit2 className="h-4 w-4" />
          </button>
          <button onClick={() => setDeleteOpen(true)} className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Profile card */}
        <div className="bg-cep-purple-850 m-4 rounded-2xl border border-cep-purple-700 p-4 space-y-3">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-cep-lime-400/15 border border-cep-lime-400/30 flex items-center justify-center shrink-0">
              <span className="text-cep-lime-400 font-black text-lg">
                {athlete.nome.split(' ').map((n) => n[0]).slice(0, 2).join('')}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-cep-white">{athlete.nome}</p>
              <div className="flex items-center gap-1 text-sm text-cep-muted mt-0.5">
                <Phone className="h-3.5 w-3.5" />
                <span>{formatPhone(athlete.telefone)}</span>
              </div>
            </div>
            <Badge variant={athlete.status === 'ativo' ? 'lime' : 'gray'}>
              {athlete.status === 'ativo' ? 'Ativa' : 'Inativa'}
            </Badge>
          </div>

          {(athlete.categoria || athlete.nivel) && (
            <div className="flex gap-2 flex-wrap">
              {athlete.categoria && <Badge variant="purple">{athlete.categoria}</Badge>}
              {athlete.nivel && <Badge variant="gray">{athlete.nivel}</Badge>}
            </div>
          )}

          {athlete.observacoes && (
            <p className="text-sm text-cep-muted bg-cep-purple-800 rounded-xl p-3">{athlete.observacoes}</p>
          )}
        </div>

        {/* Frequency stats */}
        <div className="grid grid-cols-4 gap-2 mx-4 mb-4">
          {[
            { label: 'Treinos',    value: freq.totalTreinos,                      color: 'text-cep-white' },
            { label: 'Presentes',  value: freq.presentes,                         color: 'text-green-400' },
            { label: 'Ausentes',   value: freq.ausentes,                          color: 'text-red-400' },
            { label: 'Frequência', value: formatPercent(freq.percentualPresenca),  color: 'text-cep-lime-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-cep-purple-850 rounded-xl border border-cep-purple-700 p-3 text-center">
              <p className={`text-lg font-black ${color}`}>{value}</p>
              <p className="text-xs text-cep-muted mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* History */}
        <div className="mx-4 mb-4">
          <h2 className="text-xs font-bold text-cep-muted uppercase tracking-wide mb-2">
            Histórico de Presenças
          </h2>
          {history.length === 0 ? (
            <p className="text-sm text-cep-muted text-center py-8">Nenhuma presença registrada.</p>
          ) : (
            <div className="bg-cep-purple-850 rounded-2xl border border-cep-purple-700 divide-y divide-cep-purple-800">
              {history.map(({ record, training }) => (
                <div key={record.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-cep-white capitalize">
                      {formatDateCompact(training!.data)}
                    </p>
                    <p className="text-xs text-cep-muted">{training!.horaInicio} – {training!.horaFim}</p>
                    {record.justificativa && (
                      <p className="text-xs text-cep-gold-400 mt-0.5">{record.justificativa}</p>
                    )}
                  </div>
                  <Badge variant={STATUS_VARIANT[record.status]}>
                    {STATUS_LABELS[record.status]}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AthleteForm
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={handleSave}
        initial={athlete}
      />

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Excluir atleta"
        message={`Tem certeza que deseja excluir ${athlete.nome}? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        loading={deleting}
      />
    </div>
  )
}

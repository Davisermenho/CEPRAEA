import { useState, useEffect } from 'react'
import { Modal } from '@/shared/components/Modal'
import { Button } from '@/shared/components/Button'
import { getSetting } from '@/db'
import type { AppSettings, Training } from '@/types'
import { todayISO } from '@/lib/utils'

interface TrainingFormProps {
  open: boolean
  onClose: () => void
  onSave: (data: Omit<Training, 'id' | 'tipo' | 'criadoManualmente' | 'createdAt' | 'updatedAt'>) => Promise<void>
}

export function TrainingForm({ open, onClose, onSave }: TrainingFormProps) {
  const [data, setData] = useState(todayISO())
  const [horaInicio, setHoraInicio] = useState('08:00')
  const [horaFim, setHoraFim] = useState('09:30')
  const [local, setLocal] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setData(todayISO())
      setHoraInicio('08:00')
      setHoraFim('09:30')
      setError('')
      getSetting<AppSettings>('appSettings').then((s) => {
        if (s?.localPadrao) setLocal(s.localPadrao)
      })
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!data) { setError('Data é obrigatória.'); return }
    if (horaFim <= horaInicio) { setError('Hora de fim deve ser após hora de início.'); return }
    setLoading(true)
    setError('')
    try {
      await onSave({ status: 'agendado', data, horaInicio, horaFim, local: local || undefined, observacoes: observacoes || undefined })
      onClose()
    } catch {
      setError('Erro ao salvar.')
    }
    setLoading(false)
  }

  return (
    <Modal open={open} onClose={onClose} title="Treino Extra">
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="w-full h-11 rounded-xl border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Início *</label>
            <input
              type="time"
              value={horaInicio}
              onChange={(e) => setHoraInicio(e.target.value)}
              className="w-full h-11 rounded-xl border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fim *</label>
            <input
              type="time"
              value={horaFim}
              onChange={(e) => setHoraFim(e.target.value)}
              className="w-full h-11 rounded-xl border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Local</label>
          <input
            type="text"
            value={local}
            onChange={(e) => setLocal(e.target.value)}
            placeholder="Ex: Quadra Central"
            className="w-full h-11 rounded-xl border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Ex: Treino especial de condicionamento"
            rows={2}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2 pt-1">
          <Button type="button" variant="secondary" fullWidth onClick={onClose}>Cancelar</Button>
          <Button type="submit" fullWidth loading={loading}>Criar Treino</Button>
        </div>
      </form>
    </Modal>
  )
}

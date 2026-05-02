import { useState, useEffect } from 'react'
import type { Athlete } from '@/types'
import { Modal } from '@/shared/components/Modal'
import { Button } from '@/shared/components/Button'

interface AthleteFormProps {
  open: boolean
  onClose: () => void
  onSave: (data: Omit<Athlete, 'id' | 'createdAt' | 'updatedAt'>, opts?: { pin?: string }) => Promise<void>
  initial?: Athlete | null
}

const CATEGORIAS = ['Iniciante', 'Intermediário', 'Avançado', 'Competidor']

export function AthleteForm({ open, onClose, onSave, initial }: AthleteFormProps) {
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [categoria, setCategoria] = useState('')
  const [nivel, setNivel] = useState('')
  const [status, setStatus] = useState<'ativo' | 'inativo'>('ativo')
  const [observacoes, setObservacoes] = useState('')
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setNome(initial?.nome ?? '')
      setTelefone(initial?.telefone ?? '')
      setCategoria(initial?.categoria ?? '')
      setNivel(initial?.nivel ?? '')
      setStatus(initial?.status ?? 'ativo')
      setObservacoes(initial?.observacoes ?? '')
      setPin('')
      setError('')
    }
  }, [open, initial])

  const handleTelefone = (v: string) => {
    setTelefone(v.replace(/\D/g, '').slice(0, 11))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nome.trim()) { setError('Nome é obrigatório.'); return }
    if (telefone.length < 10) { setError('Telefone inválido (mínimo 10 dígitos).'); return }
    if (!initial && pin.length !== 4) { setError('PIN inicial deve ter 4 dígitos.'); return }
    setLoading(true)
    setError('')
    try {
      await onSave(
        { nome: nome.trim(), telefone, categoria: categoria || undefined, nivel: nivel || undefined, status, observacoes: observacoes || undefined },
        { pin: pin || undefined },
      )
      onClose()
    } catch {
      setError('Erro ao salvar.')
    }
    setLoading(false)
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Editar Atleta' : 'Nova Atleta'}>
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome completo"
            className="w-full h-11 rounded-xl border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp *</label>
          <input
            type="tel"
            inputMode="numeric"
            value={telefone}
            onChange={(e) => handleTelefone(e.target.value)}
            placeholder="11987654321"
            className="w-full h-11 rounded-xl border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-400 mt-0.5">Apenas dígitos, com DDD</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full h-11 rounded-xl border border-gray-300 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— Selecionar —</option>
              {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nível</label>
            <input
              type="text"
              value={nivel}
              onChange={(e) => setNivel(e.target.value)}
              placeholder="Ex: Faixa azul"
              className="w-full h-11 rounded-xl border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <div className="flex gap-2">
            {(['ativo', 'inativo'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={`flex-1 h-10 rounded-xl text-sm font-medium border transition-colors ${status === s
                  ? s === 'ativo'
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-gray-400 text-white border-gray-400'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
              >
                {s === 'ativo' ? 'Ativo' : 'Inativo'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Informações adicionais..."
            rows={3}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {!initial && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PIN inicial *</label>
            <input
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="4 dígitos"
              className="w-full h-11 rounded-xl border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-0.5">A atleta usará este PIN para entrar no app</p>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2 pt-1">
          <Button type="button" variant="secondary" fullWidth onClick={onClose}>Cancelar</Button>
          <Button type="submit" fullWidth loading={loading}>Salvar</Button>
        </div>
      </form>
    </Modal>
  )
}

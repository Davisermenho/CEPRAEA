import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import type { Athlete } from '@/types'
import { normalizeEmail, InvalidEmailError } from '@/features/auth/lib/emailNormalization'
import {
  ModalForm,
  SelectInput,
  StatusSegmentedControl,
  TextareaInput,
  TextInput,
} from '@/shared/components/forms'

interface AthleteFormProps {
  open: boolean
  onClose: () => void
  onSave: (data: Omit<Athlete, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  initial?: Athlete | null
}

const CATEGORIAS = ['Iniciante', 'Intermediário', 'Avançado', 'Competidor']

const categoriaOptions = CATEGORIAS.map((categoria) => ({
  value: categoria,
  label: categoria,
}))

const statusOptions = [
  {
    value: 'ativo' as const,
    label: 'Ativo',
    selectedClassName: 'bg-green-600 text-white border-green-600',
  },
  {
    value: 'inativo' as const,
    label: 'Inativo',
    selectedClassName: 'bg-gray-400 text-white border-gray-400',
  },
]

export function AthleteForm({ open, onClose, onSave, initial }: AthleteFormProps) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [categoria, setCategoria] = useState('')
  const [nivel, setNivel] = useState('')
  const [status, setStatus] = useState<'ativo' | 'inativo'>('ativo')
  const [observacoes, setObservacoes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setNome(initial?.nome ?? '')
      setEmail(initial?.email ?? '')
      setTelefone(initial?.telefone ?? '')
      setCategoria(initial?.categoria ?? '')
      setNivel(initial?.nivel ?? '')
      setStatus(initial?.status ?? 'ativo')
      setObservacoes(initial?.observacoes ?? '')
      setError('')
    }
  }, [open, initial])

  const dirty = open && (
    nome !== (initial?.nome ?? '') ||
    email !== (initial?.email ?? '') ||
    telefone !== (initial?.telefone ?? '') ||
    categoria !== (initial?.categoria ?? '') ||
    nivel !== (initial?.nivel ?? '') ||
    status !== (initial?.status ?? 'ativo') ||
    observacoes !== (initial?.observacoes ?? '')
  )

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!nome.trim()) { setError('Nome é obrigatório.'); return }
    let normalizedEmailAtleta: string
    try { normalizedEmailAtleta = normalizeEmail(email) } catch (err) { setError(err instanceof InvalidEmailError ? err.message : 'Email válido é obrigatório.'); return }
    if (telefone.length > 0 && telefone.length < 10) { setError('Telefone inválido (mínimo 10 dígitos).'); return }
    setLoading(true)
    setError('')
    try {
      await onSave({
        nome: nome.trim(),
        email: normalizedEmailAtleta,
        telefone,
        categoria: categoria || undefined,
        nivel: nivel || undefined,
        status,
        observacoes: observacoes || undefined,
      })
      onClose()
    } catch {
      setError('Erro ao salvar.')
    }
    setLoading(false)
  }

  return (
    <ModalForm
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      title={initial ? 'Editar Atleta' : 'Nova Atleta'}
      loading={loading}
      dirty={dirty}
      confirmDirtyClose
      dirtyCloseMessage="Existem alterações não salvas no cadastro da atleta. Deseja descartar?"
    >
      <TextInput
        id="athlete-name"
        label="Nome"
        required
        type="text"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Nome completo"
        autoFocus
      />

      <TextInput
        id="athlete-email"
        label="Email"
        required
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="atleta@email.com"
        autoComplete="off"
        disabled={Boolean(initial)}
        helperText={initial
          ? 'Email não pode ser alterado após o cadastro.'
          : 'A atleta usará este email para entrar no app.'}
      />

      <TextInput
        id="athlete-whatsapp"
        label="WhatsApp"
        type="tel"
        inputMode="numeric"
        value={telefone}
        onChange={(e) => setTelefone(e.target.value.replace(/\D/g, '').slice(0, 11))}
        placeholder="11987654321"
        helperText="Apenas dígitos, com DDD"
      />

      <div className="grid grid-cols-2 gap-3">
        <SelectInput
          id="athlete-category"
          label="Categoria"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          placeholder="— Selecionar —"
          options={categoriaOptions}
        />

        <TextInput
          id="athlete-level"
          label="Nível"
          type="text"
          value={nivel}
          onChange={(e) => setNivel(e.target.value)}
          placeholder="Ex: Faixa azul"
        />
      </div>

      <StatusSegmentedControl
        id="athlete-status"
        label="Status"
        value={status}
        onChange={setStatus}
        options={statusOptions}
      />

      <TextareaInput
        id="athlete-notes"
        label="Observações"
        value={observacoes}
        onChange={(e) => setObservacoes(e.target.value)}
        placeholder="Informações adicionais..."
        rows={3}
      />

      {error ? <p className="text-sm text-red-300" role="alert">{error}</p> : null}
    </ModalForm>
  )
}

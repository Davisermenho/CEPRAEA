// CEPR-AUTH-01: Coach invites management page (owner-only).

import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getSupabaseTeamId } from '@/features/presence-tokens/presenceTokenConfig'

interface Invite {
  id: string
  invited_email: string
  role: string
  accepted_at: string | null
  expires_at: string
  created_at: string
}

export default function CoachInvitesPage() {
  const teamId = getSupabaseTeamId()
  const [invites, setInvites] = useState<Invite[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'coach' | 'viewer'>('coach')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function fetchInvites() {
    if (!teamId) return
    setLoading(true)
    const { data } = await supabase
      .from('coach_invites')
      .select('id, invited_email, role, accepted_at, expires_at, created_at')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false })
    setInvites((data as Invite[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { void fetchInvites() }, [teamId])

  async function handleInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalized = email.trim().toLowerCase()
    if (!normalized || !teamId) return
    setSubmitting(true)
    setError('')
    setSuccess('')
    const { error: rpcErr } = await supabase.rpc('invite_coach', {
      p_team_id: teamId,
      p_email: normalized,
      p_role: role,
    })
    if (rpcErr) {
      setError('Não foi possível enviar o convite.')
    } else {
      setSuccess(`Convite enviado para ${normalized}.`)
      setEmail('')
      void fetchInvites()
    }
    setSubmitting(false)
  }

  async function handleDelete(id: string) {
    await supabase.from('coach_invites').delete().eq('id', id)
    setInvites((prev) => prev.filter((i) => i.id !== id))
  }

  if (!teamId) {
    return (
      <div className="p-6 text-cep-muted text-sm">
        VITE_SUPABASE_TEAM_ID não configurado.
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <h1 className="text-xl font-bold text-cep-white">Convites de Acesso</h1>

      <form onSubmit={handleInvite} className="flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1 flex-1 min-w-48">
          <label className="text-cep-muted text-xs">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-login-input"
            placeholder="coach@exemplo.com"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-cep-muted text-xs">Papel</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as 'coach' | 'viewer')}
            className="auth-login-input"
          >
            <option value="coach">Treinador</option>
            <option value="viewer">Visualizador</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="auth-login-primary flex items-center gap-1 whitespace-nowrap"
        >
          <Plus size={16} />
          {submitting ? 'Enviando...' : 'Convidar'}
        </button>
      </form>

      {error && <p className="text-red-400 text-sm">{error}</p>}
      {success && <p className="text-cep-lime-400 text-sm">{success}</p>}

      {loading ? (
        <p className="text-cep-muted text-sm">Carregando...</p>
      ) : invites.length === 0 ? (
        <p className="text-cep-muted text-sm">Nenhum convite enviado ainda.</p>
      ) : (
        <ul className="space-y-2">
          {invites.map((inv) => (
            <li
              key={inv.id}
              className="flex justify-between items-center bg-cep-purple-900 rounded-lg px-4 py-3 text-sm"
            >
              <div>
                <span className="text-cep-white font-medium">{inv.invited_email}</span>
                <span className="text-cep-muted ml-2">({inv.role})</span>
                {inv.accepted_at && (
                  <span className="text-cep-lime-400 ml-2 text-xs">✓ aceito</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleDelete(inv.id)}
                className="text-cep-muted hover:text-red-400 transition-colors"
                aria-label="Remover convite"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

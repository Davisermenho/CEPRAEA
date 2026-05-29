// CEPR-AUTH-01: Onboarding page for new owners who don't have a team yet.

import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAccessContext } from '@/features/auth/AccessContext'
import { AuthLoginScreen } from '@/features/auth/components/AuthLoginScreen'

export default function OwnerOnboardingPage() {
  const navigate = useNavigate()
  const { reload } = useAccessContext()
  const [teamName, setTeamName] = useState('')
  const [teamSlug, setTeamSlug] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function deriveSlug(name: string) {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 62)
  }

  function handleNameChange(value: string) {
    setTeamName(value)
    if (!teamSlug || teamSlug === deriveSlug(teamName)) {
      setTeamSlug(deriveSlug(value))
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const name = teamName.trim()
    const slug = teamSlug.trim()
    if (!name || !slug) {
      setError('Preencha o nome e o identificador da equipe.')
      return
    }
    setSubmitting(true)
    setError('')
    const { error: rpcError } = await supabase.rpc('bootstrap_owner', {
      p_team_name: name,
      p_team_slug: slug,
    })
    if (rpcError) {
      if (rpcError.message.includes('invalid_slug')) {
        setError('Identificador inválido. Use apenas letras minúsculas, números e hífens (mínimo 4 caracteres).')
      } else if (rpcError.message.includes('duplicate') || rpcError.code === '23505') {
        setError('Este identificador já está em uso. Escolha outro.')
      } else {
        setError('Não foi possível criar a equipe. Tente novamente.')
      }
      setSubmitting(false)
      return
    }
    reload()
    navigate('/', { replace: true })
  }

  return (
    <AuthLoginScreen
      kicker="CONFIGURAR EQUIPE"
      helper="Crie sua equipe para começar a usar o CEPRAEA."
    >
      <form onSubmit={handleSubmit} className="auth-login-form">
        <div className="auth-login-field">
          <label htmlFor="team-name" className="auth-login-label">
            Nome da equipe
          </label>
          <input
            id="team-name"
            type="text"
            autoComplete="off"
            value={teamName}
            onChange={(e) => handleNameChange(e.target.value)}
            className="auth-login-input"
            placeholder="Ex: CEPRAEA Handebol"
          />
        </div>

        <div className="auth-login-field">
          <label htmlFor="team-slug" className="auth-login-label">
            Identificador único (slug)
          </label>
          <input
            id="team-slug"
            type="text"
            autoComplete="off"
            value={teamSlug}
            onChange={(e) => setTeamSlug(e.target.value.toLowerCase())}
            className="auth-login-input"
            placeholder="cepraea-handebol"
          />
          <p className="text-cep-muted text-xs mt-1">
            Somente letras minúsculas, números e hífens.
          </p>
        </div>

        {error && (
          <div className="auth-login-status auth-login-status-error">{error}</div>
        )}

        <button
          type="submit"
          className="auth-login-primary"
          disabled={submitting}
        >
          {submitting ? 'Criando...' : 'Criar equipe →'}
        </button>
      </form>
    </AuthLoginScreen>
  )
}

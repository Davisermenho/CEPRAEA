import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { AuthLoginScreen } from '@/features/auth/components/AuthLoginScreen'
import { useSupabaseAuth } from '@/features/auth/SupabaseAuthProvider'

function normalizeLoginError(message?: string) {
  if (!message) return 'Não foi possível entrar. Verifique os dados informados.'
  if (/invalid login credentials/i.test(message)) return 'Não foi possível entrar. Verifique os dados informados.'
  return message
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { authenticated, configured, loading: authLoading, signInWithPassword } = useSupabaseAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (authenticated) navigate('/', { replace: true })
  }, [authenticated, navigate])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail || !password) {
      setError('Informe email e senha.')
      return
    }
    if (!configured) {
      setError('Supabase não está configurado neste ambiente.')
      return
    }

    setSubmitting(true)
    setError('')
    const result = await signInWithPassword(normalizedEmail, password)
    if (!result.ok) {
      setError(normalizeLoginError(result.error))
      setSubmitting(false)
      return
    }
    navigate('/', { replace: true })
  }

  const disabled = submitting || authLoading || !configured

  return (
    <AuthLoginScreen
      kicker="ACESSO DO TREINADOR"
      helper="Use seu e-mail e senha para acessar o painel de gestão da equipe."
    >
      <form onSubmit={handleSubmit} className="auth-login-form">
        <div className="auth-login-field">
          <label htmlFor="coach-email" className="auth-login-label">Email</label>
          <input
            id="coach-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="auth-login-input"
          />
        </div>

        <div className="auth-login-field">
          <label htmlFor="coach-password" className="auth-login-label">Senha</label>
          <div className="auth-login-input-wrap">
            <input
              id="coach-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="auth-login-input auth-login-input-with-action"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="auth-login-field-action"
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
            </button>
          </div>
        </div>

        {!configured && (
          <div className="auth-login-status auth-login-status-error">
            Supabase não está configurado neste ambiente.
          </div>
        )}

        {error && (
          <div className="auth-login-status auth-login-status-error">
            {error}
          </div>
        )}

        <button type="submit" className="auth-login-primary" disabled={disabled}>
          {submitting ? 'Entrando...' : 'Entrar →'}
        </button>
      </form>
    </AuthLoginScreen>
  )
}

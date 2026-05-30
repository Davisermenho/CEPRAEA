import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { AuthLoginScreen } from '@/features/auth/components/AuthLoginScreen'
import { useSupabaseAuth } from '@/features/auth/SupabaseAuthProvider'
import { AUTH_MESSAGES, mapSupabaseLoginError } from '@/features/auth/lib/authVocabulary'
import { normalizeEmail, InvalidEmailError } from '@/features/auth/lib/emailNormalization'
import { redirectGuard } from '@/features/auth/lib/redirectGuard'

export default function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { authenticated, configured, loading: authLoading, signInWithPassword } = useSupabaseAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (authenticated) {
      const target = redirectGuard(searchParams.get('returnUrl'))
      navigate(target, { replace: true })
    }
  }, [authenticated, navigate, searchParams])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    let normalizedEmail: string
    try {
      normalizedEmail = normalizeEmail(email)
    } catch (err) {
      setError(err instanceof InvalidEmailError ? err.message : AUTH_MESSAGES['AUTH-LOGIN-001'])
      return
    }

    if (!password) {
      setError('Informe a senha.')
      return
    }
    if (!configured) {
      setError(AUTH_MESSAGES['AUTH-BOOT-001'])
      return
    }

    setSubmitting(true)
    setError('')
    const result = await signInWithPassword(normalizedEmail, password)
    if (!result.ok) {
      setError(mapSupabaseLoginError(result.error))
      setSubmitting(false)
      return
    }
    const target = redirectGuard(searchParams.get('returnUrl'))
    navigate(target, { replace: true })
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
            {AUTH_MESSAGES['AUTH-BOOT-001']}
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

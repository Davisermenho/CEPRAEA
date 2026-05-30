import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { AuthLoginScreen } from '@/features/auth/components/AuthLoginScreen'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { useSupabaseAuth } from '@/features/auth/SupabaseAuthProvider'
import { AUTH_MESSAGES, mapSupabaseLoginError } from '@/features/auth/lib/authVocabulary'
import { normalizeEmail, InvalidEmailError } from '@/features/auth/lib/emailNormalization'
import { redirectGuard } from '@/features/auth/lib/redirectGuard'

type Mode = 'login' | 'register' | 'reset'

export default function AtletaLoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { authenticated } = useSupabaseAuth()
  const configured = isSupabaseConfigured()

  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (authenticated) {
      const target = redirectGuard(searchParams.get('returnUrl'), undefined)
      navigate(target === '/' ? '/atleta/treinos' : target, { replace: true })
    }
  }, [authenticated, navigate, searchParams])

  const reset = () => { setError(''); setInfo('') }

  const setModeAndReset = (nextMode: Mode) => {
    setMode(nextMode)
    reset()
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    reset()
    if (!configured) {
      setError(AUTH_MESSAGES['AUTH-BOOT-001'])
      return
    }

    let normalizedEmail: string
    try {
      normalizedEmail = normalizeEmail(email)
    } catch (err) {
      setError(err instanceof InvalidEmailError ? err.message : AUTH_MESSAGES['AUTH-LOGIN-001'])
      return
    }

    if (mode === 'reset') {
      setSubmitting(true)
      await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: `${window.location.origin}/atleta/nova-senha`,
      })
      setSubmitting(false)
      // Anti-enumeração §13: sempre AUTH-RESET-001, independente de sucesso/falha
      setInfo(AUTH_MESSAGES['AUTH-RESET-001'])
      return
    }

    if (!password) { setError('Informe a senha.'); return }

    setSubmitting(true)

    if (mode === 'register') {
      await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: { data: { role: 'athlete' } },
      })
      setSubmitting(false)
      // Anti-enumeração §13: sempre AUTH-SIGNUP-001, independente de sucesso/falha
      setInfo(AUTH_MESSAGES['AUTH-SIGNUP-001'])
      setMode('login')
      return
    }

    const { error: err } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    })
    setSubmitting(false)
    if (err) {
      setError(mapSupabaseLoginError(err.message))
    }
  }

  const disabled = submitting || !configured
  const titleByMode = {
    login: 'ACESSO DA ATLETA',
    register: 'PRIMEIRO ACESSO',
    reset: 'REDEFINIR SENHA',
  }
  const helperByMode = {
    login: 'Use seu e-mail e senha para acessar seus treinos e confirmações.',
    register: 'Crie sua conta para definir sua senha e acessar o app.',
    reset: 'Informe seu e-mail para receber o link de redefinição de senha.',
  }

  return (
    <AuthLoginScreen
      kicker={titleByMode[mode]}
      helper={helperByMode[mode]}
      firstAccess={mode === 'login' ? (
        <section className="auth-first-access-card">
          <h2 className="auth-first-access-title">Primeiro acesso?</h2>
          <p className="auth-first-access-text">
            Crie sua conta para definir sua senha e acessar o app.
          </p>
          <button
            type="button"
            className="auth-first-access-button"
            onClick={() => setModeAndReset('register')}
          >
            Criar conta
          </button>
        </section>
      ) : undefined}
    >
      <form onSubmit={handleSubmit} className="auth-login-form">
        <div className="auth-login-field">
          <label htmlFor="atleta-email" className="auth-login-label">Email</label>
          <input
            id="atleta-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-login-input"
          />
        </div>

        {mode !== 'reset' && (
          <div className="auth-login-field">
            <label htmlFor="atleta-password" className="auth-login-label">Senha</label>
            <div className="auth-login-input-wrap">
              <input
                id="atleta-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-login-input auth-login-input-with-action"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="auth-login-field-action"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>
            {mode === 'register' && (
              <p className="auth-login-hint">Mínimo 6 caracteres.</p>
            )}
            {mode === 'login' && (
              <button
                type="button"
                onClick={() => setModeAndReset('reset')}
                className="auth-forgot-link"
              >
                Esqueci minha senha
              </button>
            )}
          </div>
        )}

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
        {info && (
          <div className="auth-login-status auth-login-status-info">
            {info}
          </div>
        )}

        <button type="submit" className="auth-login-primary" disabled={disabled}>
          {submitting && 'Entrando...'}
          {!submitting && mode === 'login' && 'Entrar →'}
          {!submitting && mode === 'register' && 'Criar conta'}
          {!submitting && mode === 'reset' && 'Enviar email de redefinição'}
        </button>
      </form>

      {mode !== 'login' && (
        <div className="auth-login-small-action">
          <button type="button" onClick={() => setModeAndReset('login')}>
            Já tenho conta — Entrar
          </button>
        </div>
      )}
    </AuthLoginScreen>
  )
}

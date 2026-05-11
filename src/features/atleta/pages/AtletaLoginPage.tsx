import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { AuthLoginScreen } from '@/features/auth/components/AuthLoginScreen'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { useSupabaseAuth } from '@/features/auth/SupabaseAuthProvider'

type Mode = 'login' | 'register' | 'reset'

export default function AtletaLoginPage() {
  const navigate = useNavigate()
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
    if (authenticated) navigate('/atleta/treinos', { replace: true })
  }, [authenticated, navigate])

  const reset = () => { setError(''); setInfo('') }

  const setModeAndReset = (nextMode: Mode) => {
    setMode(nextMode)
    reset()
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    reset()
    if (!configured) {
      setError('Sistema não configurado. Avise o treinador.')
      return
    }

    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      setError('Informe um email válido.')
      return
    }

    if (mode === 'reset') {
      setSubmitting(true)
      const { error: err } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: `${window.location.origin}/atleta/nova-senha`,
      })
      setSubmitting(false)
      if (err) {
        setError('Não foi possível enviar o email. Tente novamente.')
      } else {
        setInfo('Email de redefinição enviado! Verifique sua caixa de entrada.')
      }
      return
    }

    if (!password) { setError('Informe a senha.'); return }

    setSubmitting(true)

    if (mode === 'register') {
      const { error: err } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: { data: { role: 'athlete' } },
      })
      setSubmitting(false)
      if (err) {
        setError(err.message === 'User already registered'
          ? 'Este email já está cadastrado. Faça login.'
          : 'Não foi possível criar a conta. Verifique os dados.')
      } else {
        setInfo('Conta criada! Verifique seu email para confirmar o cadastro e depois faça login.')
        setMode('login')
      }
      return
    }

    const { error: err } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    })
    setSubmitting(false)
    if (err) {
      setError('Email ou senha incorretos.')
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
            Sistema não configurado. Avise o treinador.
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

import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/shared/components/Button'
import { CepraeaLogomarca } from '@/shared/components/CepraeaLogomarca'
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
    // Athlete already has a session — but AtletaGuard will confirm they're a real athlete.
    // This redirect is handled there; here we just avoid showing the form to logged-in users.
    if (authenticated) navigate('/atleta/treinos', { replace: true })
  }, [authenticated, navigate])

  const reset = () => { setError(''); setInfo('') }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    reset()
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

    // login
    const { error: err } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    })
    setSubmitting(false)
    if (err) {
      setError('Email ou senha incorretos.')
    }
    // on success the onAuthStateChange listener in SupabaseAuthProvider updates session
    // and the useEffect above will redirect to /atleta/treinos
  }

  const disabled = submitting || !configured

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-cep-purple-950 px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-cep-purple-850 opacity-50" />
        <div className="absolute -bottom-40 -left-40 h-[28rem] w-[28rem] rounded-full bg-cep-purple-900 opacity-60" />
      </div>

      <div className="w-full max-w-sm relative z-10">
        <div className="flex flex-col items-center mb-8">
          <CepraeaLogomarca className="h-10 w-auto text-cep-lime-400 mb-3" />
          <p className="text-cep-muted text-sm mt-2">
            {mode === 'login' && 'Acesso da atleta'}
            {mode === 'register' && 'Primeiro acesso'}
            {mode === 'reset' && 'Redefinir senha'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="atleta-email" className="block text-xs font-semibold text-cep-muted mb-1.5 tracking-wide uppercase">
              Email
            </label>
            <input
              id="atleta-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 rounded-xl bg-cep-purple-850 border border-cep-purple-700 text-cep-white placeholder-cep-muted/40 px-4 text-base focus:outline-none focus:ring-2 focus:ring-cep-lime-400 focus:border-transparent"
            />
          </div>

          {mode !== 'reset' && (
            <div>
              <label htmlFor="atleta-password" className="block text-xs font-semibold text-cep-muted mb-1.5 tracking-wide uppercase">
                Senha
              </label>
              <div className="relative">
                <input
                  id="atleta-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 rounded-xl bg-cep-purple-850 border border-cep-purple-700 text-cep-white placeholder-cep-muted/40 px-4 pr-12 text-base focus:outline-none focus:ring-2 focus:ring-cep-lime-400 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cep-muted hover:text-cep-white"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                </button>
              </div>
              {mode === 'register' && (
                <p className="text-xs text-cep-muted/60 mt-1">Mínimo 6 caracteres.</p>
              )}
            </div>
          )}

          {!configured && (
            <div className="rounded-xl bg-red-500/20 border border-red-500/40 px-4 py-2.5">
              <p className="text-red-400 text-sm text-center">Sistema não configurado. Avise o treinador.</p>
            </div>
          )}
          {error && (
            <div className="rounded-xl bg-red-500/20 border border-red-500/40 px-4 py-2.5">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}
          {info && (
            <div className="rounded-xl bg-cep-lime-400/10 border border-cep-lime-400/30 px-4 py-2.5">
              <p className="text-cep-lime-400 text-sm text-center">{info}</p>
            </div>
          )}

          <Button type="submit" fullWidth size="lg" disabled={disabled} loading={submitting} className="mt-2">
            {mode === 'login' && 'Entrar'}
            {mode === 'register' && 'Criar conta'}
            {mode === 'reset' && 'Enviar email de redefinição'}
          </Button>
        </form>

        <div className="mt-6 flex flex-col items-center gap-3 text-sm">
          {mode === 'login' && (
            <>
              <button
                type="button"
                onClick={() => { setMode('register'); reset() }}
                className="text-cep-muted/70 hover:text-cep-white transition-colors"
              >
                Primeiro acesso? Criar conta
              </button>
              <button
                type="button"
                onClick={() => { setMode('reset'); reset() }}
                className="text-cep-muted/70 hover:text-cep-white transition-colors"
              >
                Esqueci minha senha
              </button>
            </>
          )}
          {mode !== 'login' && (
            <button
              type="button"
              onClick={() => { setMode('login'); reset() }}
              className="text-cep-muted/70 hover:text-cep-white transition-colors"
            >
              Já tenho conta — Entrar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

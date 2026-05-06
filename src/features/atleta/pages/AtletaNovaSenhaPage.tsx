import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/shared/components/Button'
import { CepraeaLogomarca } from '@/shared/components/CepraeaLogomarca'
import { supabase } from '@/lib/supabase'

export default function AtletaNovaSenhaPage() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Supabase embeds the recovery token in the URL fragment (#access_token=...).
    // onAuthStateChange fires with event PASSWORD_RECOVERY once the session is set.
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    // Also check if there's already an active session from the recovery link.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (password.length < 6) { setError('Senha deve ter pelo menos 6 caracteres.'); return }
    if (password !== confirm) { setError('As senhas não coincidem.'); return }
    setSubmitting(true)
    setError('')
    const { error: err } = await supabase.auth.updateUser({ password })
    setSubmitting(false)
    if (err) {
      setError('Não foi possível redefinir a senha. O link pode ter expirado.')
      return
    }
    navigate('/atleta/treinos', { replace: true })
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-cep-purple-950 px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-cep-purple-850 opacity-50" />
        <div className="absolute -bottom-40 -left-40 h-[28rem] w-[28rem] rounded-full bg-cep-purple-900 opacity-60" />
      </div>

      <div className="w-full max-w-sm relative z-10">
        <div className="flex flex-col items-center mb-8">
          <CepraeaLogomarca className="h-10 w-auto text-cep-lime-400 mb-3" />
          <p className="text-cep-muted text-sm mt-2">Criar nova senha</p>
        </div>

        {!ready ? (
          <p className="text-cep-muted text-sm text-center">Validando link de recuperação…</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="nova-senha" className="block text-xs font-semibold text-cep-muted mb-1.5 tracking-wide uppercase">
                Nova senha
              </label>
              <div className="relative">
                <input
                  id="nova-senha"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
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
              <p className="text-xs text-cep-muted/60 mt-1">Mínimo 6 caracteres.</p>
            </div>

            <div>
              <label htmlFor="confirmar-senha" className="block text-xs font-semibold text-cep-muted mb-1.5 tracking-wide uppercase">
                Confirmar senha
              </label>
              <input
                id="confirmar-senha"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full h-12 rounded-xl bg-cep-purple-850 border border-cep-purple-700 text-cep-white placeholder-cep-muted/40 px-4 text-base focus:outline-none focus:ring-2 focus:ring-cep-lime-400 focus:border-transparent"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-500/20 border border-red-500/40 px-4 py-2.5">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            <Button type="submit" fullWidth size="lg" loading={submitting} className="mt-2">
              Salvar nova senha
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}

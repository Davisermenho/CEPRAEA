import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/shared/components/Button'
import { CepraeaLogo } from '@/shared/components/CepraeaLogo'
import { useSupabaseAuth } from '@/features/auth/SupabaseAuthProvider'

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
    setSubmitting(true)
    setError('')
    const result = await signInWithPassword(normalizedEmail, password)
    if (!result.ok) {
      setError('Não foi possível entrar. Verifique os dados informados.')
      setSubmitting(false)
      return
    }
    navigate('/', { replace: true })
  }

  const disabled = submitting || authLoading || !configured

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-cep-purple-950 px-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute -top-32 -right-24 w-96 h-96 rounded-full bg-cep-purple-800" />
        <div className="absolute -bottom-32 -left-24 w-96 h-96 rounded-full bg-cep-purple-900" />
      </div>
      <div className="w-full max-w-sm relative z-10">
        <div className="flex flex-col items-center mb-12">
          <CepraeaLogo className="w-28 h-28 text-cep-lime-400 mb-6" />
          <h1 className="text-cep-white text-4xl font-bold tracking-[0.28em] mb-3">CEPRAEA</h1>
          <p className="text-cep-muted text-xs uppercase tracking-[0.3em] text-center">Preparação. Identidade. Competição.</p>
          <p className="text-cep-muted/70 text-sm mt-4">Acesso do treinador</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="coach-email" className="block text-xs font-semibold text-cep-muted mb-1.5 tracking-wide uppercase">Email</label>
            <input id="coach-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full h-12 rounded-xl bg-cep-purple-850 border border-cep-purple-700 text-cep-white placeholder-cep-muted/40 px-4 text-base focus:outline-none focus:ring-2 focus:ring-cep-lime-400 focus:border-transparent" />
          </div>
          <div>
            <label htmlFor="coach-password" className="block text-xs font-semibold text-cep-muted mb-1.5 tracking-wide uppercase">Senha</label>
            <div className="relative">
              <input id="coach-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full h-12 rounded-xl bg-cep-purple-850 border border-cep-purple-700 text-cep-white placeholder-cep-muted/40 px-4 pr-12 text-base focus:outline-none focus:ring-2 focus:ring-cep-lime-400 focus:border-transparent" />
              <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-cep-muted hover:text-cep-white" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}>
                {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>
          </div>
          {!configured && <div className="rounded-xl bg-red-500/20 border border-red-500/40 px-4 py-2.5"><p className="text-red-400 text-sm text-center">Supabase não está configurado neste ambiente.</p></div>}
          {error && <div className="rounded-xl bg-red-500/20 border border-red-500/40 px-4 py-2.5"><p className="text-red-400 text-sm text-center">{error}</p></div>}
          <Button type="submit" variant="primary" size="lg" fullWidth disabled={disabled} loading={submitting} className="mt-2">Entrar</Button>
        </form>
      </div>
    </div>
  )
}

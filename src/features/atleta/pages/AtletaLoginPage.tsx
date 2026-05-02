import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Phone, KeyRound } from 'lucide-react'
import { Button } from '@/shared/components/Button'
import { CepraeaLogomarca } from '@/shared/components/CepraeaLogomarca'
import { isAtletaAuthenticated, loginAtleta } from '@/lib/athleteAuth'

function formatPhoneInput(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

export default function AtletaLoginPage() {
  const navigate = useNavigate()
  const [telefone, setTelefone] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAtletaAuthenticated()) navigate('/atleta/treinos', { replace: true })
  }, [navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const digits = telefone.replace(/\D/g, '')
    if (digits.length < 10) {
      setError('Digite um telefone válido com DDD.')
      return
    }
    if (pin.length < 4) {
      setError('PIN deve ter pelo menos 4 dígitos.')
      return
    }
    setLoading(true)
    setError('')
    const result = await loginAtleta(digits, pin)
    setLoading(false)
    if (!result.ok) {
      setError(result.error ?? 'Erro de login')
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
          <p className="text-cep-muted text-sm mt-2">Acesso da atleta</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-cep-muted mb-1.5 tracking-wide uppercase">
              Telefone
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-cep-muted" />
              <input
                type="tel"
                inputMode="numeric"
                value={telefone}
                onChange={(e) => setTelefone(formatPhoneInput(e.target.value))}
                placeholder="(21) 99999-9999"
                className="w-full h-12 rounded-xl bg-cep-purple-850 border border-cep-purple-700 text-cep-white placeholder-cep-muted/40 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-cep-lime-400 focus:border-transparent"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-cep-muted mb-1.5 tracking-wide uppercase">
              PIN
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-cep-muted" />
              <input
                type="password"
                inputMode="numeric"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="••••"
                maxLength={6}
                className="w-full h-12 rounded-xl bg-cep-purple-850 border border-cep-purple-700 text-cep-white placeholder-cep-muted/40 pl-11 pr-4 text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-cep-lime-400 focus:border-transparent"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-red-500/20 border border-red-500/40 px-4 py-2.5">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          <Button type="submit" fullWidth size="lg" loading={loading} className="mt-2">
            Entrar
          </Button>

          <p className="text-center text-xs text-cep-muted/70 pt-2">
            Esqueceu o PIN? Peça ao treinador para resetar.
          </p>
        </form>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/shared/components/Button'
import { CepraeaLogo } from '@/shared/components/CepraeaLogo'
import { getSetting } from '@/db'
import { verifyPin, setSession } from '@/lib/auth'

export default function LoginPage() {
  const navigate = useNavigate()
  const [pin, setPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pin || pin.length < 4) {
      setError('PIN deve ter pelo menos 4 caracteres.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const storedHash = await getSetting<string>('pinHash')
      if (!storedHash) {
        setError('Configuração não encontrada. Recarregue a página.')
        setLoading(false)
        return
      }
      const ok = await verifyPin(pin, storedHash)
      if (!ok) {
        setError('PIN incorreto. Tente novamente.')
        setLoading(false)
        return
      }
      setSession()
      navigate('/', { replace: true })
    } catch {
      setError('Erro ao verificar PIN.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-cep-purple-950 px-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-cep-purple-850 opacity-50" />
        <div className="absolute -bottom-40 -left-40 h-[28rem] w-[28rem] rounded-full bg-cep-purple-900 opacity-60" />
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Brand */}
        <div className="flex flex-col items-center mb-10">
          <div className="mb-6">
            <CepraeaLogo className="h-20 w-20 text-cep-lime-400" />
          </div>
          <h1 className="text-3xl font-black tracking-widest text-cep-white uppercase">CEPRAEA</h1>
          <p className="text-cep-muted text-xs mt-2 tracking-widest uppercase">
            Preparação. Identidade. Competição.
          </p>
          <p className="text-cep-muted/70 text-sm mt-4">
            Acesso do treinador
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-cep-muted mb-1.5 tracking-wide uppercase">
              PIN
            </label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••••"
                maxLength={20}
                className="w-full h-12 rounded-xl bg-cep-purple-850 border border-cep-purple-700 text-cep-white placeholder-cep-muted/40 px-4 pr-12 text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-cep-lime-400 focus:border-transparent"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-cep-muted hover:text-cep-white transition-colors"
              >
                {showPin ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-red-500/20 border border-red-500/40 px-4 py-2.5">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            fullWidth
            size="lg"
            loading={loading}
            className="mt-2"
          >
            Entrar
          </Button>
        </form>
      </div>
    </div>
  )
}

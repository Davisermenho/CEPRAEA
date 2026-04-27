import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/shared/components/Button'
import { getSetting, setSetting } from '@/db'
import { hashPin, verifyPin, setSession } from '@/lib/auth'

export default function LoginPage() {
  const navigate = useNavigate()
  const [pin, setPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [confirm, setConfirm] = useState('')
  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Detecta se é o primeiro acesso
  useState(() => {
    getSetting<string>('pinHash').then((hash) => setIsFirstTime(!hash))
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pin || pin.length < 4) {
      setError('PIN deve ter pelo menos 4 caracteres.')
      return
    }
    setLoading(true)
    setError('')
    try {
      if (isFirstTime) {
        if (pin !== confirm) {
          setError('Os PINs não coincidem.')
          setLoading(false)
          return
        }
        const hash = await hashPin(pin)
        await setSetting('pinHash', hash)
        setSession()
        navigate('/', { replace: true })
      } else {
        const storedHash = await getSetting<string>('pinHash')
        if (!storedHash) return
        const ok = await verifyPin(pin, storedHash)
        if (!ok) {
          setError('PIN incorreto. Tente novamente.')
          setLoading(false)
          return
        }
        setSession()
        navigate('/', { replace: true })
      }
    } catch {
      setError('Erro ao verificar PIN.')
    }
    setLoading(false)
  }

  if (isFirstTime === null) return null

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-gradient-to-b from-blue-700 to-blue-900 px-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="rounded-2xl bg-white/10 p-4 mb-4">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">CEPRAEA</h1>
          <p className="text-blue-200 text-sm mt-1">
            {isFirstTime ? 'Crie seu PIN de acesso' : 'Digite seu PIN para entrar'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-blue-100 mb-1.5">
              {isFirstTime ? 'Criar PIN' : 'PIN'}
            </label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••••"
                maxLength={20}
                className="w-full h-12 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 px-4 pr-12 text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-white/50"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
              >
                {showPin ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {isFirstTime && (
            <div>
              <label className="block text-sm font-medium text-blue-100 mb-1.5">
                Confirmar PIN
              </label>
              <input
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••"
                maxLength={20}
                className="w-full h-12 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 px-4 text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
          )}

          {error && (
            <p className="text-red-300 text-sm text-center">{error}</p>
          )}

          <Button
            type="submit"
            fullWidth
            size="lg"
            loading={loading}
            className="bg-white text-blue-700 hover:bg-blue-50 font-semibold mt-2"
          >
            {isFirstTime ? 'Criar PIN e entrar' : 'Entrar'}
          </Button>
        </form>
      </div>
    </div>
  )
}

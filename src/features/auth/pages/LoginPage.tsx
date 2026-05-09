import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { AuthLoginScreen } from '@/features/auth/components/AuthLoginScreen'
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
    <AuthLoginScreen
      kicker="ACESSO DO TREINADOR"
      helper="Use seu PIN para acessar o painel de gestão da equipe."
    >
      <form onSubmit={handleSubmit} className="auth-login-form">
        <div className="auth-login-field">
          <label htmlFor="coach-pin" className="auth-login-label">PIN</label>
          <div className="auth-login-input-wrap">
            <input
              id="coach-pin"
              type={showPin ? 'text' : 'password'}
              inputMode="numeric"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••••"
              maxLength={20}
              className="auth-login-input auth-login-input-with-action"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPin((value) => !value)}
              className="auth-login-field-action"
              aria-label={showPin ? 'Ocultar PIN' : 'Mostrar PIN'}
            >
              {showPin ? <EyeOff size={22} /> : <Eye size={22} />}
            </button>
          </div>
        </div>

        {error && (
          <div className="auth-login-status auth-login-status-error">
            {error}
          </div>
        )}

        <button type="submit" className="auth-login-primary" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar →'}
        </button>
      </form>
    </AuthLoginScreen>
  )
}

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { KeyRound, Phone } from 'lucide-react'
import { AuthLoginScreen } from '@/features/auth/components/AuthLoginScreen'
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
    <AuthLoginScreen
      kicker="ACESSO DA ATLETA"
      helper="Use seu telefone e PIN para acessar seus treinos e confirmações."
      firstAccess={(
        <section className="auth-first-access-card">
          <h2 className="auth-first-access-title">Primeiro acesso?</h2>
          <p className="auth-first-access-text">
            Peça ao treinador para cadastrar seu telefone e gerar seu PIN de acesso.
          </p>
          <button type="button" className="auth-first-access-button">
            Falar com o treinador
          </button>
        </section>
      )}
    >
      <form onSubmit={handleSubmit} className="auth-login-form">
        <div className="auth-login-field">
          <label htmlFor="athlete-phone" className="auth-login-label">Telefone</label>
          <div className="auth-login-input-wrap">
            <Phone className="auth-login-field-icon" aria-hidden />
            <input
              id="athlete-phone"
              type="tel"
              inputMode="numeric"
              value={telefone}
              onChange={(e) => setTelefone(formatPhoneInput(e.target.value))}
              placeholder="(21) 99999-9999"
              className="auth-login-input auth-login-input-with-icon"
              autoFocus
            />
          </div>
        </div>

        <div className="auth-login-field">
          <label htmlFor="athlete-pin" className="auth-login-label">PIN</label>
          <div className="auth-login-input-wrap">
            <KeyRound className="auth-login-field-icon" aria-hidden />
            <input
              id="athlete-pin"
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="••••"
              maxLength={6}
              className="auth-login-input auth-login-input-with-icon"
            />
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

        <p className="auth-login-hint">
          Esqueceu o PIN? Peça ao treinador para resetar.
        </p>
      </form>
    </AuthLoginScreen>
  )
}

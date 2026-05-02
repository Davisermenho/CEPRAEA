import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, KeyRound, User } from 'lucide-react'
import { Button } from '@/shared/components/Button'
import { Modal } from '@/shared/components/Modal'
import { useAthleteStore } from '@/stores/athleteStore'
import { clearAtletaSession, getAtletaSession, loginAtleta } from '@/lib/athleteAuth'
import { loadAtletaSyncConfig, setPinRemote } from '@/lib/sync'
import { formatPhone } from '@/lib/utils'

export default function AtletaPerfilPage() {
  const navigate = useNavigate()
  const session = getAtletaSession()
  const athletes = useAthleteStore((s) => s.athletes)
  const me = athletes.find((a) => a.id === session?.atletaId)

  const [showPin, setShowPin] = useState(false)
  const [currentPin, setCurrentPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  if (!session) return null

  const handleLogout = () => {
    clearAtletaSession()
    navigate('/welcome', { replace: true })
  }

  const handleChangePin = async () => {
    setPinError('')
    if (newPin.length < 4) {
      setPinError('PIN deve ter pelo menos 4 dígitos.')
      return
    }
    if (newPin !== confirmPin) {
      setPinError('Os PINs não coincidem.')
      return
    }
    setSaving(true)
    // Verifica PIN atual via tentativa de login (telefone vem da sessão)
    const verify = await loginAtleta(session.telefone, currentPin)
    if (!verify.ok) {
      setPinError('PIN atual incorreto.')
      setSaving(false)
      return
    }
    const config = await loadAtletaSyncConfig(session.token)
    if (!config) {
      setPinError('Sem conexão com o servidor.')
      setSaving(false)
      return
    }
    const ok = await setPinRemote(config, session.atletaId, newPin)
    setSaving(false)
    if (!ok) {
      setPinError('Não foi possível alterar o PIN.')
      return
    }
    setSuccess(true)
    setCurrentPin('')
    setNewPin('')
    setConfirmPin('')
    setTimeout(() => {
      setShowPin(false)
      setSuccess(false)
    }, 1500)
  }

  return (
    <div className="px-4 py-5">
      <div className="flex flex-col items-center text-center mb-6">
        <div className="h-20 w-20 rounded-full bg-cep-lime-400/15 border-2 border-cep-lime-400/40 flex items-center justify-center mb-3">
          <User className="h-10 w-10 text-cep-lime-400" />
        </div>
        <h1 className="text-xl font-black text-cep-white">{session.nome}</h1>
        <p className="text-sm text-cep-muted mt-1">{formatPhone(session.telefone)}</p>
      </div>

      {me && (
        <div className="rounded-2xl bg-cep-purple-900 border border-cep-purple-800 p-4 mb-4 space-y-2">
          {me.categoria && (
            <Row label="Categoria" value={me.categoria} />
          )}
          {me.nivel && (
            <Row label="Nível" value={me.nivel} />
          )}
          <Row label="Status" value={me.status === 'ativo' ? 'Ativa' : 'Inativa'} />
        </div>
      )}

      <div className="space-y-2">
        <Button
          variant="secondary"
          fullWidth
          size="lg"
          onClick={() => setShowPin(true)}
          className="justify-start"
        >
          <KeyRound className="h-5 w-5" />
          Alterar PIN
        </Button>

        <Button
          variant="ghost"
          fullWidth
          size="lg"
          onClick={handleLogout}
          className="justify-start text-red-400"
        >
          <LogOut className="h-5 w-5" />
          Sair
        </Button>
      </div>

      <Modal open={showPin} onClose={() => setShowPin(false)} title="Alterar PIN">
        {success ? (
          <p className="text-center text-cep-lime-400 py-4">PIN alterado com sucesso!</p>
        ) : (
          <div className="space-y-3">
            <PinField label="PIN atual" value={currentPin} onChange={setCurrentPin} autoFocus />
            <PinField label="Novo PIN" value={newPin} onChange={setNewPin} />
            <PinField label="Confirmar novo PIN" value={confirmPin} onChange={setConfirmPin} />
            {pinError && (
              <div className="rounded-xl bg-red-500/20 border border-red-500/40 px-3 py-2">
                <p className="text-red-400 text-sm">{pinError}</p>
              </div>
            )}
            <div className="flex gap-2 pt-1">
              <Button variant="secondary" fullWidth onClick={() => setShowPin(false)}>
                Cancelar
              </Button>
              <Button fullWidth loading={saving} onClick={handleChangePin}>
                Alterar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-cep-muted">{label}</span>
      <span className="text-cep-white font-medium">{value}</span>
    </div>
  )
}

function PinField({
  label,
  value,
  onChange,
  autoFocus,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  autoFocus?: boolean
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-cep-muted mb-1 tracking-wide uppercase">
        {label}
      </label>
      <input
        type="password"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
        maxLength={6}
        autoFocus={autoFocus}
        placeholder="••••"
        className="w-full h-11 rounded-xl bg-cep-purple-850 border border-cep-purple-700 text-cep-white placeholder-cep-muted/40 px-4 text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-cep-lime-400"
      />
    </div>
  )
}

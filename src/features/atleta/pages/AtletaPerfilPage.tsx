import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Mail, User } from 'lucide-react'
import { Button } from '@/shared/components/Button'
import { useSupabaseAuth } from '@/features/auth/SupabaseAuthProvider'
import { supabase } from '@/lib/supabase'
import { formatPhone } from '@/lib/utils'
import { useCurrentAthlete } from '@/features/atleta/useCurrentAthlete'

export default function AtletaPerfilPage() {
  const navigate = useNavigate()
  const { signOut, user } = useSupabaseAuth()
  const { athlete: me, loading } = useCurrentAthlete()
  const [sendingReset, setSendingReset] = useState(false)
  const [resetInfo, setResetInfo] = useState('')

  if (loading || !user || !me) return null

  const handleLogout = async () => {
    await signOut()
    navigate('/welcome', { replace: true })
  }

  const handleSendReset = async () => {
    setSendingReset(true)
    setResetInfo('')
    const { error } = await supabase.auth.resetPasswordForEmail(user.email ?? me.email, {
      redirectTo: `${window.location.origin}/atleta/nova-senha`,
    })
    setSendingReset(false)
    setResetInfo(error ? 'Não foi possível enviar o email agora.' : 'Email de redefinição enviado.')
  }

  return (
    <div className="px-4 py-5">
      <div className="flex flex-col items-center text-center mb-6">
        <div className="h-20 w-20 rounded-full bg-cep-lime-400/15 border-2 border-cep-lime-400/40 flex items-center justify-center mb-3">
          <User className="h-10 w-10 text-cep-lime-400" />
        </div>
        <h1 className="text-xl font-black text-cep-white">{me.nome}</h1>
        <p className="text-sm text-cep-muted mt-1">{me.email}</p>
        {me.telefone && <p className="text-sm text-cep-muted">{formatPhone(me.telefone)}</p>}
      </div>

      <div className="rounded-2xl bg-cep-purple-900 border border-cep-purple-800 p-4 mb-4 space-y-2">
        {me.categoria && (
          <Row label="Categoria" value={me.categoria} />
        )}
        {me.nivel && (
          <Row label="Nível" value={me.nivel} />
        )}
        <Row label="Status" value={me.status === 'ativo' ? 'Ativa' : 'Inativa'} />
      </div>

      <div className="space-y-2">
        <Button
          variant="secondary"
          fullWidth
          size="lg"
          onClick={handleSendReset}
          loading={sendingReset}
          className="justify-start"
        >
          <Mail className="h-5 w-5" />
          Receber link para nova senha
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
      {resetInfo && <p className="text-sm text-center text-cep-lime-400 mt-4">{resetInfo}</p>}
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

// CEPR-AUTH-01: Accept coach invite page — /aceitar-convite/:inviteId

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAccessContext } from '@/features/auth/AccessContext'
import { AuthLoginScreen } from '@/features/auth/components/AuthLoginScreen'

export default function AcceptInvitePage() {
  const { inviteId } = useParams<{ inviteId: string }>()
  const navigate = useNavigate()
  const { reload } = useAccessContext()
  const [status, setStatus] = useState<'accepting' | 'success' | 'error' | 'invalid'>(
    'accepting'
  )
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!inviteId) {
      setStatus('invalid')
      return
    }

    async function accept() {
      const { data, error } = await supabase.rpc('accept_coach_invite', {
        p_invite_id: inviteId,
      })
      if (error) {
        setErrorMsg('Não foi possível aceitar o convite. Tente novamente.')
        setStatus('error')
        return
      }
      if (!data) {
        setErrorMsg('Convite inválido, expirado ou já aceito. Solicite um novo convite.')
        setStatus('invalid')
        return
      }
      reload()
      setStatus('success')
      setTimeout(() => navigate('/', { replace: true }), 1500)
    }

    void accept()
  }, [inviteId, navigate, reload])

  const messages: Record<typeof status, { kicker: string; body: string }> = {
    accepting: { kicker: 'ACEITANDO CONVITE', body: 'Aguarde...' },
    success:   { kicker: 'ACESSO LIBERADO',   body: 'Redirecionando para o painel...' },
    error:     { kicker: 'ERRO',              body: errorMsg },
    invalid:   { kicker: 'CONVITE INVÁLIDO',  body: errorMsg || 'O link é inválido ou já foi usado.' },
  }

  const { kicker, body } = messages[status]

  return (
    <AuthLoginScreen kicker={kicker} helper={body}>
      {(status === 'error' || status === 'invalid') && (
        <div className="auth-login-form">
          <a href="/login" className="auth-login-primary text-center block">
            Voltar ao login
          </a>
        </div>
      )}
    </AuthLoginScreen>
  )
}

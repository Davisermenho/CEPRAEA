import { useSearchParams } from 'react-router-dom'
import { CheckCircle, XCircle, Dumbbell, Wifi } from 'lucide-react'
import { getSetting } from '@/db'
import { confirmPresenceByToken } from '@/features/presence-tokens/presenceTokenApi'
import { isSupabasePresenceTokensEnabled } from '@/features/presence-tokens/presenceTokenFeatureFlag'
import { useState, useEffect } from 'react'
import type { AppSettings } from '@/types'
import type { PresenceTokenStatus } from '@/features/presence-tokens/presenceTokenTypes'

type PageState = 'loading' | 'pending' | 'sending' | 'synced' | 'not-found'

export default function PublicConfirmPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const usingSupabaseToken = isSupabasePresenceTokensEnabled() && token.length > 0

  const [pageState, setPageState] = useState<PageState>('loading')
  const [confirmed, setConfirmed] = useState<boolean | null>(null)
  const [settings, setSettings] = useState<Partial<AppSettings>>({})
  const [remoteMessage, setRemoteMessage] = useState('')

  useEffect(() => {
    getSetting<AppSettings>('appSettings').then((s) => {
      if (s) setSettings(s)
    })
    setPageState(usingSupabaseToken ? 'pending' : 'not-found')
  }, [usingSupabaseToken])

  const handleConfirm = async (presente: boolean) => {
    if (!usingSupabaseToken) return
    setPageState('sending')
    setConfirmed(presente)
    const status: PresenceTokenStatus = presente ? 'presente' : 'ausente'
    const result = await confirmPresenceByToken({ token, status })
    setRemoteMessage(result.message)
    setPageState(result.ok ? 'synced' : 'not-found')
  }

  if (pageState === 'loading') return null

  if (pageState === 'not-found') {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-cep-purple-950 px-6 text-center">
        <div className="rounded-2xl bg-cep-purple-850 border border-cep-purple-700 p-5 mb-4">
          <Dumbbell className="h-10 w-10 text-cep-muted" />
        </div>
        <h1 className="text-lg font-bold text-cep-white mb-2">Link não encontrado</h1>
        <p className="text-sm text-cep-muted">{remoteMessage || 'Este link de confirmação é inválido ou expirou.'}</p>
      </div>
    )
  }

  if (pageState === 'sending') {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-cep-purple-950 px-6 text-center">
        <div className="h-12 w-12 rounded-full border-4 border-cep-lime-400 border-t-transparent animate-spin mb-4" />
        <p className="text-sm text-cep-muted">Enviando confirmação...</p>
      </div>
    )
  }

  if (pageState === 'synced') {
    const presente = confirmed === true
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-cep-purple-950 px-6 text-center space-y-4">
        {presente ? (
          <CheckCircle className="h-16 w-16 text-cep-lime-400" />
        ) : (
          <XCircle className="h-16 w-16 text-red-400" />
        )}
        <div>
          <h1 className="text-xl font-black text-cep-white">
            {presente ? 'Presença confirmada!' : 'Ausência registrada'}
          </h1>
          <p className="text-sm text-cep-muted mt-2 max-w-xs">
            {remoteMessage || (presente ? 'Ótimo! Até o treino! 💪' : 'Sua ausência foi comunicada. Até a próxima!')}
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold bg-cep-lime-400/15 text-cep-lime-400">
          <Wifi className="h-3.5 w-3.5" /> Sincronizado automaticamente
        </div>
      </div>
    )
  }

  // pageState === 'pending'
  const equipe = settings.nomeEquipe ?? 'CEPRAEA'

  return (
    <div className="min-h-dvh bg-cep-purple-950 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm bg-cep-purple-900 rounded-2xl border border-cep-purple-700 shadow-xl overflow-hidden">
        <div className="bg-cep-purple-850 border-b border-cep-purple-700 px-6 py-5 text-center">
          <div className="h-12 w-12 rounded-xl bg-cep-purple-800 border border-cep-purple-700 flex items-center justify-center mx-auto mb-3">
            <span className="text-xl font-black text-cep-lime-400">C</span>
          </div>
          <h1 className="text-lg font-black text-cep-white tracking-wide">{equipe}</h1>
          <p className="text-cep-muted text-sm">Confirmação de Presença</p>
        </div>

        <div className="p-6 space-y-4">
          <div className="text-center">
            <p className="text-xl font-black text-cep-white">Atleta</p>
            <p className="text-sm text-cep-muted mt-0.5">Confirme sua presença pelo link seguro.</p>
          </div>

          <p className="text-sm text-center text-cep-muted">
            Você vai comparecer a este treino?
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleConfirm(false)}
              className="flex flex-col items-center gap-2 rounded-xl border-2 border-red-500/40 bg-red-500/10 p-4 text-red-400 hover:bg-red-500/20 active:bg-red-500/30 transition-colors"
            >
              <XCircle className="h-8 w-8" />
              <span className="text-sm font-bold">Não vou</span>
            </button>
            <button
              onClick={() => handleConfirm(true)}
              className="flex flex-col items-center gap-2 rounded-xl border-2 border-cep-lime-400/40 bg-cep-lime-400/10 p-4 text-cep-lime-400 hover:bg-cep-lime-400/20 active:bg-cep-lime-400/30 transition-colors"
            >
              <CheckCircle className="h-8 w-8" />
              <span className="text-sm font-bold">Vou comparecer</span>
            </button>
          </div>

          <p className="text-xs text-center text-cep-muted/60">
            Sua resposta será enviada diretamente ao treinador.
          </p>
        </div>
      </div>
    </div>
  )
}

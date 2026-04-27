import { useParams } from 'react-router-dom'
import { CheckCircle, XCircle, Dumbbell, Wifi, WifiOff } from 'lucide-react'
import { useAthleteStore } from '@/stores/athleteStore'
import { useTrainingStore } from '@/stores/trainingStore'
import { useAttendanceStore } from '@/stores/attendanceStore'
import { getSetting } from '@/db'
import { formatDateLong } from '@/lib/utils'
import { abrirWhatsApp } from '@/lib/whatsapp'
import { pushConfirmation, loadSyncConfig } from '@/lib/sync'
import { useState, useEffect } from 'react'
import type { AppSettings } from '@/types'

type PageState = 'loading' | 'pending' | 'sending' | 'synced' | 'fallback-wa' | 'error' | 'not-found'

export default function PublicConfirmPage() {
  const { treinoId, atletaId } = useParams<{ treinoId: string; atletaId: string }>()
  const training = useTrainingStore((s) => s.getById(treinoId ?? ''))
  const athlete = useAthleteStore((s) => s.getById(atletaId ?? ''))
  const upsert = useAttendanceStore((s) => s.upsert)
  const [pageState, setPageState] = useState<PageState>('loading')
  const [confirmed, setConfirmed] = useState<boolean | null>(null)
  const [settings, setSettings] = useState<Partial<AppSettings>>({})
  const [waMsg, setWaMsg] = useState('')
  const [waTel, setWaTel] = useState<string | undefined>(undefined)

  useEffect(() => {
    getSetting<AppSettings>('appSettings').then((s) => {
      if (s) setSettings(s)
    })
    if (training !== undefined && athlete !== undefined) {
      setPageState(training && athlete ? 'pending' : 'not-found')
    }
  }, [training, athlete])

  const handleConfirm = async (presente: boolean) => {
    if (!treinoId || !atletaId || !training || !athlete) return

    setPageState('sending')
    setConfirmed(presente)

    const status = presente ? 'presente' : 'ausente'

    // 1. Salvar no IDB local (funciona mesmo sem endpoint)
    await upsert(treinoId, atletaId, status, { confirmadoPelaAtleta: true })

    // 2. Tentar enviar ao endpoint remoto
    const syncConfig = await loadSyncConfig()
    let syncOk = false

    if (syncConfig) {
      syncOk = await pushConfirmation(syncConfig, {
        treinoId,
        atletaId,
        nomeAtleta: athlete.nome,
        status,
        origem: 'link',
      })
    }

    if (syncOk) {
      // Sincronizado com sucesso — não precisa de WhatsApp
      setPageState('synced')
    } else {
      // Fallback: prepara mensagem mas não abre WA automaticamente
      const equipe = settings.nomeEquipe ?? 'CEPRAEA'
      const emoji = presente ? '✅' : '❌'
      const acao = presente ? 'confirmou presença' : 'não poderá comparecer'
      const msg = `${emoji} *${athlete.nome}* ${acao} no treino de *${equipe}* — ${formatDateLong(training.data)} às ${training.horaInicio}.`
      setWaMsg(msg)
      setWaTel(settings.telefoneTecnico?.replace(/\D/g, ''))
      setPageState('fallback-wa')
    }
  }

  if (pageState === 'loading') return null

  if (pageState === 'not-found') {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-cep-purple-950 px-6 text-center">
        <div className="rounded-2xl bg-cep-purple-850 border border-cep-purple-700 p-5 mb-4">
          <Dumbbell className="h-10 w-10 text-cep-muted" />
        </div>
        <h1 className="text-lg font-bold text-cep-white mb-2">Link não encontrado</h1>
        <p className="text-sm text-cep-muted">Este link de confirmação é inválido ou expirou.</p>
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
            {presente ? 'Ótimo! Até o treino! 💪' : 'Sua ausência foi comunicada. Até a próxima!'}
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold bg-cep-lime-400/15 text-cep-lime-400">
          <Wifi className="h-3.5 w-3.5" /> Sincronizado automaticamente
        </div>
      </div>
    )
  }

  if (pageState === 'fallback-wa') {
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
            {presente ? 'Ótimo! Até o treino! 💪' : 'Sua ausência foi registrada. Até a próxima!'}
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold bg-cep-gold-400/20 text-cep-gold-400">
          <WifiOff className="h-3.5 w-3.5" /> Não foi possível sincronizar automaticamente
        </div>
        <p className="text-sm text-cep-muted max-w-xs">
          Sua resposta foi salva. Toque no botão abaixo para avisar o treinador pelo WhatsApp.
        </p>
        <button
          onClick={() => abrirWhatsApp(waMsg, waTel)}
          className="flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700 active:bg-green-800 transition-colors"
        >
          Enviar WhatsApp
        </button>
      </div>
    )
  }

  // pageState === 'pending'
  const equipe = settings.nomeEquipe ?? 'CEPRAEA'
  const syncConfigured = !!(settings.syncEndpointUrl && settings.syncSecret)

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
            <p className="text-xl font-black text-cep-white">{athlete?.nome.split(' ')[0]}</p>
            <p className="text-sm text-cep-muted mt-0.5">{athlete?.nome}</p>
          </div>

          <div className="bg-cep-purple-850 rounded-xl border border-cep-purple-700 p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-cep-white">
              <span>📅</span>
              <span className="capitalize">{formatDateLong(training!.data)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-cep-muted">
              <span>⏰</span>
              <span>{training!.horaInicio} às {training!.horaFim}</span>
            </div>
            {training!.local && (
              <div className="flex items-center gap-2 text-sm text-cep-muted">
                <span>📍</span>
                <span>{training!.local}</span>
              </div>
            )}
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
            {syncConfigured
              ? 'Sua resposta será enviada diretamente ao treinador.'
              : 'Sua resposta abrirá o WhatsApp para avisar o treinador.'}
          </p>
        </div>
      </div>
    </div>
  )
}

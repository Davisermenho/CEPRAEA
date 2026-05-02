import { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

const UPDATED_KEY = 'cepraea_just_updated'

export function UpdatePrompt() {
  const [showToast, setShowToast] = useState(false)

  useRegisterSW({
    onRegisteredSW() {
      // autoUpdate: ao registrar novo SW, marca flag para exibir toast após reload
      if (sessionStorage.getItem(UPDATED_KEY)) {
        sessionStorage.removeItem(UPDATED_KEY)
        setShowToast(true)
        setTimeout(() => setShowToast(false), 4000)
      }
    },
    onOfflineReady() {
      // noop
    },
  })

  // Marca flag antes do reload automático disparado pelo skipWaiting
  useEffect(() => {
    const handler = () => sessionStorage.setItem(UPDATED_KEY, '1')
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [])

  if (!showToast) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 rounded-xl bg-cep-purple-800 border border-cep-lime-400/30 p-4 text-white shadow-xl flex items-center gap-3">
      <span className="text-cep-lime-400 text-lg">✓</span>
      <p className="text-sm font-medium">App atualizado para a versão mais recente.</p>
    </div>
  )
}

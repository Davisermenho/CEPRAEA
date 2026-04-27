import { useRegisterSW } from 'virtual:pwa-register/react'

export function UpdatePrompt() {
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW()
  if (!needRefresh) return null
  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 rounded-xl bg-blue-700 p-4 text-white shadow-xl flex items-center justify-between gap-3">
      <p className="text-sm font-medium">Nova versão disponível!</p>
      <button
        onClick={() => updateServiceWorker(true)}
        className="shrink-0 rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-blue-700 hover:bg-blue-50 transition-colors"
      >
        Atualizar
      </button>
    </div>
  )
}

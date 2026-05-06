import { useEffect, useState } from 'react'
import { Save, LogOut, Plus, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/components/Button'
import { getSetting, setSetting } from '@/db'
import { useSupabaseAuth } from '@/features/auth/SupabaseAuthProvider'
import type { AppSettings } from '@/types'

const DEFAULT: AppSettings = {
  nomeEquipe: 'CEPRAEA',
  nomeTecnico: '',
  telefoneTecnico: '',
  localPadrao: '',
  semanasFuturas: 12,
  recurrenceSchedules: [
    { dow: 4, horaInicio: '20:00', horaFim: '21:30' },
    { dow: 0, horaInicio: '07:30', horaFim: '09:00' },
  ],
  pinHash: '',
  appUrl: window.location.origin,
  syncEndpointUrl: '',
  syncSecret: '',
  lastSyncAt: '',
}

const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export default function SettingsPage() {
  const navigate = useNavigate()
  const { signOut } = useSupabaseAuth()
  const [settings, setSettings] = useState<AppSettings>(DEFAULT)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    getSetting<AppSettings>('appSettings').then((savedSettings) => {
      if (savedSettings) setSettings({ ...DEFAULT, ...savedSettings })
    })
  }, [])

  const update = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((current) => ({ ...current, [key]: value }))
  }

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    await setSetting('appSettings', settings)
    await setSetting('semanasFuturas', settings.semanasFuturas)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setLoading(false)
  }

  const handleLogout = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  const inputClass = 'w-full h-10 rounded-xl border border-cep-purple-700 bg-cep-purple-850 px-3 text-sm text-cep-white placeholder-cep-muted/40 focus:outline-none focus:ring-2 focus:ring-cep-lime-400 focus:border-transparent'
  const sectionClass = 'bg-cep-purple-850 rounded-2xl border border-cep-purple-700 p-4 space-y-3'
  const labelClass = 'block text-xs text-cep-muted mb-1 font-medium'

  return (
    <div className="flex flex-col h-full">
      <div className="bg-cep-purple-900 border-b border-cep-purple-800 px-4 py-4">
        <p className="text-xs font-bold text-cep-lime-400 tracking-widest uppercase mb-0.5">Sistema</p>
        <h1 className="text-xl font-black text-cep-white">Configurações</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        <form onSubmit={handleSave} className="p-4 space-y-4">
          <section className={sectionClass}>
            <h2 className="text-xs font-bold text-cep-muted uppercase tracking-wide">Equipe</h2>
            <div>
              <label className={labelClass}>Nome da equipe</label>
              <input className={inputClass} value={settings.nomeEquipe} onChange={(event) => update('nomeEquipe', event.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Nome do treinador</label>
              <input className={inputClass} value={settings.nomeTecnico} onChange={(event) => update('nomeTecnico', event.target.value)} />
            </div>
            <div>
              <label className={labelClass}>WhatsApp do treinador</label>
              <input className={inputClass} inputMode="numeric" value={settings.telefoneTecnico} onChange={(event) => update('telefoneTecnico', event.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Local padrão</label>
              <input className={inputClass} value={settings.localPadrao} onChange={(event) => update('localPadrao', event.target.value)} />
            </div>
          </section>

          <section className={sectionClass}>
            <h2 className="text-xs font-bold text-cep-muted uppercase tracking-wide">Treinos Automáticos</h2>
            <div>
              <label className={labelClass}>Semanas a gerar: <strong className="text-cep-white">{settings.semanasFuturas}</strong></label>
              <input type="range" min={4} max={24} value={settings.semanasFuturas} onChange={(event) => update('semanasFuturas', Number(event.target.value))} className="w-full accent-cep-lime-400" />
            </div>
            <div className="pt-2 border-t border-cep-purple-700/50 space-y-2">
              <div className="flex items-center justify-between">
                <label className={labelClass}>Horários da semana</label>
                <button type="button" onClick={() => update('recurrenceSchedules', [...(settings.recurrenceSchedules ?? []), { dow: 4, horaInicio: '20:00', horaFim: '21:30' }])} className="flex items-center gap-1 text-xs font-semibold text-cep-lime-400">
                  <Plus className="h-3.5 w-3.5" /> Adicionar
                </button>
              </div>
              {(settings.recurrenceSchedules ?? []).map((schedule, index) => (
                <div key={index} className="flex items-center gap-2 bg-cep-purple-900 border border-cep-purple-700 rounded-xl p-2">
                  <select value={schedule.dow} onChange={(event) => {
                    const list = [...(settings.recurrenceSchedules ?? [])]
                    list[index] = { ...list[index], dow: Number(event.target.value) }
                    update('recurrenceSchedules', list)
                  }} className="h-9 rounded-lg border border-cep-purple-700 bg-cep-purple-850 px-2 text-xs text-cep-white">
                    {DAY_LABELS.map((day, dayIndex) => <option key={day} value={dayIndex}>{day}</option>)}
                  </select>
                  <input type="time" value={schedule.horaInicio} onChange={(event) => {
                    const list = [...(settings.recurrenceSchedules ?? [])]
                    list[index] = { ...list[index], horaInicio: event.target.value }
                    update('recurrenceSchedules', list)
                  }} className="h-9 rounded-lg border border-cep-purple-700 bg-cep-purple-850 px-2 text-xs text-cep-white" />
                  <input type="time" value={schedule.horaFim} onChange={(event) => {
                    const list = [...(settings.recurrenceSchedules ?? [])]
                    list[index] = { ...list[index], horaFim: event.target.value }
                    update('recurrenceSchedules', list)
                  }} className="h-9 rounded-lg border border-cep-purple-700 bg-cep-purple-850 px-2 text-xs text-cep-white" />
                  <button type="button" onClick={() => update('recurrenceSchedules', (settings.recurrenceSchedules ?? []).filter((_, i) => i !== index))} className="ml-auto text-cep-muted hover:text-red-400" aria-label="Remover">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className={sectionClass}>
            <h2 className="text-xs font-bold text-cep-muted uppercase tracking-wide">URL Pública do App</h2>
            <input type="url" value={settings.appUrl} onChange={(event) => update('appUrl', event.target.value)} className={inputClass} />
            <p className="text-xs text-cep-muted/70">Usada nos links de confirmação enviados às atletas.</p>
          </section>

          <Button type="submit" fullWidth loading={loading}><Save className="h-4 w-4" />{saved ? 'Salvo!' : 'Salvar configurações'}</Button>
        </form>

        <div className="px-4 pb-6">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 bg-cep-purple-850 rounded-2xl border border-red-500/30 px-4 py-3 hover:bg-red-500/10 transition-colors text-left">
            <LogOut className="h-5 w-5 text-red-400" />
            <span className="flex-1 text-sm font-semibold text-red-400">Sair</span>
          </button>
        </div>
      </div>
    </div>
  )
}

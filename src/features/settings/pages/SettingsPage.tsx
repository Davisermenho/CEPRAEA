import { useEffect, useState } from 'react'
import { Save, LogOut, ChevronRight, ChevronDown, Copy, Wifi, WifiOff, RefreshCw, Plus, Trash2, Download } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/components/Button'
import { getSetting, setSetting } from '@/db'
import { pingEndpoint, generateSecret, loadSyncConfig } from '@/lib/sync'
import { copiarTexto } from '@/lib/whatsapp'
import { useAthleteStore } from '@/stores/athleteStore'
import { useTrainingStore } from '@/stores/trainingStore'
import { useAttendanceStore } from '@/stores/attendanceStore'
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
  const [syncGuideOpen, setSyncGuideOpen] = useState(false)
  const [testingSync, setTestingSync] = useState(false)
  const [syncTestResult, setSyncTestResult] = useState<{ ok: boolean; error?: string } | null>(null)
  const [secretCopied, setSecretCopied] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncAllResult, setSyncAllResult] = useState<{ ok: boolean; msg: string } | null>(null)

  const pushAllAthletes = useAthleteStore((s) => s.pushAllToRemote)
  const pushAllTrainings = useTrainingStore((s) => s.pushAllToRemote)
  const syncAthletes = useAthleteStore((s) => s.syncFromRemote)
  const syncTrainings = useTrainingStore((s) => s.syncFromRemote)
  const syncAttendances = useAttendanceStore((s) => s.syncFromRemote)

  useEffect(() => {
    getSetting<AppSettings>('appSettings').then((s) => {
      if (s) setSettings({ ...DEFAULT, ...s })
    })
  }, [])

  const update = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((s) => ({ ...s, [key]: value }))
  }

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    await setSetting('appSettings', settings)
    await setSetting('semanasFuturas', settings.semanasFuturas)
    if (settings.syncSecret) await setSetting('syncSecret', settings.syncSecret)
    if (settings.syncEndpointUrl) await setSetting('syncEndpointUrl', settings.syncEndpointUrl)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setLoading(false)
  }

  const handleGenerateSecret = () => {
    update('syncSecret', generateSecret())
    setSyncTestResult(null)
  }

  const handleCopySecret = async () => {
    await copiarTexto(settings.syncSecret ?? '')
    setSecretCopied(true)
    setTimeout(() => setSecretCopied(false), 2000)
  }

  const handleSyncAll = async () => {
    setSyncing(true)
    setSyncAllResult(null)
    const config = await loadSyncConfig()
    if (!config) {
      setSyncAllResult({ ok: false, msg: 'Salve as configurações antes de sincronizar.' })
      setSyncing(false)
      return
    }

    try {
      const [pushA, pushT] = await Promise.all([
        pushAllAthletes(config),
        pushAllTrainings(config),
      ])
      const [r1, r2, r3] = await Promise.all([
        syncAthletes(config),
        syncTrainings(config),
        syncAttendances(config),
      ])
      const totalPushed = pushA.pushed + pushT.pushed
      const totalPulled = (r1.merged ?? 0) + (r2.merged ?? 0) + (r3.merged ?? 0)

      if (r1.ok && r2.ok && r3.ok) {
        const parts: string[] = []
        if (totalPushed > 0) parts.push(`${totalPushed} enviado(s)`)
        if (totalPulled > 0) parts.push(`${totalPulled} recebido(s)`)
        setSyncAllResult({ ok: true, msg: parts.length ? `Sincronizado! ${parts.join(', ')}.` : 'Tudo sincronizado, nenhuma novidade.' })
      } else {
        setSyncAllResult({ ok: false, msg: r1.error ?? r2.error ?? r3.error ?? 'Erro desconhecido' })
      }
    } catch {
      setSyncAllResult({ ok: false, msg: 'Falha na sincronização.' })
    }
    setSyncing(false)
  }

  const handleTestSync = async () => {
    if (!settings.syncEndpointUrl || !settings.syncSecret) return
    setTestingSync(true)
    setSyncTestResult(null)
    const result = await pingEndpoint({ endpointUrl: settings.syncEndpointUrl, secret: settings.syncSecret })
    setSyncTestResult(result)
    setTestingSync(false)
  }

  const handleLogout = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  const syncIsConfigured = Boolean(settings.syncEndpointUrl && settings.syncSecret)
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
            {[
              { key: 'nomeEquipe' as const, label: 'Nome da equipe', type: 'text', placeholder: 'CEPRAEA' },
              { key: 'nomeTecnico' as const, label: 'Nome do treinador', type: 'text', placeholder: 'Prof. Silva' },
              { key: 'telefoneTecnico' as const, label: 'WhatsApp do treinador', type: 'tel', placeholder: '21987654321' },
              { key: 'localPadrao' as const, label: 'Local padrão', type: 'text', placeholder: 'Quadra Central' },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className={labelClass}>{label}</label>
                <input
                  type={type}
                  inputMode={type === 'tel' ? 'numeric' : undefined}
                  value={String(settings[key] ?? '')}
                  onChange={(event) => update(key, (type === 'tel' ? event.target.value.replace(/\D/g, '').slice(0, 11) : event.target.value) as AppSettings[typeof key])}
                  placeholder={placeholder}
                  className={inputClass}
                />
              </div>
            ))}
          </section>

          <section className={sectionClass}>
            <h2 className="text-xs font-bold text-cep-muted uppercase tracking-wide">Treinos Automáticos</h2>
            <div>
              <label className={labelClass}>Semanas a gerar: <strong className="text-cep-white">{settings.semanasFuturas}</strong></label>
              <input type="range" min={4} max={24} value={settings.semanasFuturas} onChange={(event) => update('semanasFuturas', Number(event.target.value))} className="w-full accent-cep-lime-400" />
              <div className="flex justify-between text-xs text-cep-muted mt-0.5"><span>4</span><span>24 semanas</span></div>
            </div>

            <div className="pt-2 border-t border-cep-purple-700/50">
              <div className="flex items-center justify-between mb-2">
                <label className={labelClass + ' mb-0'}>Horários da semana</label>
                <button type="button" onClick={() => update('recurrenceSchedules', [...(settings.recurrenceSchedules ?? []), { dow: 4, horaInicio: '20:00', horaFim: '21:30' }])} className="flex items-center gap-1 text-xs font-semibold text-cep-lime-400 hover:text-cep-lime-500">
                  <Plus className="h-3.5 w-3.5" /> Adicionar
                </button>
              </div>

              <div className="space-y-2">
                {(settings.recurrenceSchedules ?? []).map((sch, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-cep-purple-900 border border-cep-purple-700 rounded-xl p-2">
                    <select value={sch.dow} onChange={(event) => {
                      const list = [...(settings.recurrenceSchedules ?? [])]
                      list[idx] = { ...list[idx], dow: Number(event.target.value) }
                      update('recurrenceSchedules', list)
                    }} className="h-9 rounded-lg border border-cep-purple-700 bg-cep-purple-850 px-2 text-xs text-cep-white focus:outline-none focus:ring-2 focus:ring-cep-lime-400">
                      {DAY_LABELS.map((day, i) => <option key={day} value={i}>{day}</option>)}
                    </select>
                    <input type="time" value={sch.horaInicio} onChange={(event) => {
                      const list = [...(settings.recurrenceSchedules ?? [])]
                      list[idx] = { ...list[idx], horaInicio: event.target.value }
                      update('recurrenceSchedules', list)
                    }} className="h-9 rounded-lg border border-cep-purple-700 bg-cep-purple-850 px-2 text-xs text-cep-white focus:outline-none focus:ring-2 focus:ring-cep-lime-400" />
                    <span className="text-cep-muted text-xs">até</span>
                    <input type="time" value={sch.horaFim} onChange={(event) => {
                      const list = [...(settings.recurrenceSchedules ?? [])]
                      list[idx] = { ...list[idx], horaFim: event.target.value }
                      update('recurrenceSchedules', list)
                    }} className="h-9 rounded-lg border border-cep-purple-700 bg-cep-purple-850 px-2 text-xs text-cep-white focus:outline-none focus:ring-2 focus:ring-cep-lime-400" />
                    <button type="button" onClick={() => update('recurrenceSchedules', (settings.recurrenceSchedules ?? []).filter((_, i) => i !== idx))} className="ml-auto text-cep-muted hover:text-red-400 transition-colors" aria-label="Remover">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className={sectionClass}>
            <h2 className="text-xs font-bold text-cep-muted uppercase tracking-wide">URL Pública do App</h2>
            <input type="url" value={settings.appUrl} onChange={(event) => update('appUrl', event.target.value)} placeholder="https://cepraea.vercel.app" className={inputClass} />
            <p className="text-xs text-cep-muted/70">Usada nos links de confirmação enviados às atletas.</p>
          </section>

          <section className="bg-cep-purple-850 rounded-2xl border border-cep-purple-700 overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-4 border-b border-cep-purple-700">
              <Wifi className="h-5 w-5 text-cep-lime-400 shrink-0" />
              <div className="flex-1">
                <h2 className="text-sm font-bold text-cep-white">Sincronização Remota</h2>
                <p className="text-xs text-cep-muted mt-0.5">{syncIsConfigured ? 'Endpoint configurado — confirmações remotas ativas' : 'Configure para receber confirmações das atletas automaticamente'}</p>
              </div>
              {syncIsConfigured && <span className="h-2 w-2 rounded-full bg-cep-lime-400 shrink-0" />}
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className={labelClass}>Secret de autenticação</label>
                <div className="flex gap-2">
                  <input type="text" value={settings.syncSecret ?? ''} onChange={(event) => { update('syncSecret', event.target.value); setSyncTestResult(null) }} placeholder="Cole ou gere um secret" className={inputClass + ' flex-1 font-mono text-xs'} spellCheck={false} autoComplete="off" />
                  <button type="button" onClick={handleCopySecret} disabled={!settings.syncSecret} className="h-10 px-3 rounded-xl border border-cep-purple-700 bg-cep-purple-900 text-cep-muted hover:text-cep-white hover:bg-cep-purple-800 disabled:opacity-40 transition-colors" title="Copiar secret"><Copy className="h-4 w-4" /></button>
                  <button type="button" onClick={handleGenerateSecret} className="h-10 px-3 rounded-xl border border-cep-purple-700 bg-cep-purple-900 text-cep-muted hover:text-cep-white hover:bg-cep-purple-800 transition-colors" title="Gerar novo secret"><RefreshCw className="h-4 w-4" /></button>
                </div>
                {secretCopied && <p className="text-xs text-cep-lime-400 mt-1">Copiado!</p>}
              </div>

              <div>
                <label className={labelClass}>URL do endpoint (Apps Script)</label>
                <input type="url" value={settings.syncEndpointUrl ?? ''} onChange={(event) => update('syncEndpointUrl', event.target.value)} placeholder="https://script.google.com/macros/s/.../exec" className={inputClass} />
              </div>

              {syncIsConfigured && (
                <div className="space-y-2">
                  <Button type="button" variant="secondary" size="sm" fullWidth onClick={handleTestSync} loading={testingSync}><Wifi className="h-4 w-4" />Testar conexão</Button>
                  {syncTestResult && <p className={`text-xs flex items-center gap-1.5 ${syncTestResult.ok ? 'text-cep-lime-400' : 'text-red-400'}`}>{syncTestResult.ok ? <><Wifi className="h-3.5 w-3.5" /> Conexão OK — endpoint acessível</> : <><WifiOff className="h-3.5 w-3.5" /> {syncTestResult.error}</>}</p>}
                  <Button type="button" size="sm" fullWidth onClick={handleSyncAll} loading={syncing}><Download className="h-4 w-4" />Sincronizar tudo agora</Button>
                  {syncAllResult && <p className={`text-xs flex items-center gap-1.5 ${syncAllResult.ok ? 'text-cep-lime-400' : 'text-red-400'}`}>{syncAllResult.ok ? <><Download className="h-3.5 w-3.5" /> {syncAllResult.msg}</> : <><WifiOff className="h-3.5 w-3.5" /> {syncAllResult.msg}</>}</p>}
                </div>
              )}

              <div>
                <button type="button" onClick={() => setSyncGuideOpen((value) => !value)} className="flex items-center gap-2 text-sm font-semibold text-cep-lime-400 hover:text-cep-lime-500 transition-colors">
                  {syncGuideOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  Como configurar o Apps Script (passo a passo)
                </button>
                {syncGuideOpen && (
                  <div className="mt-3 rounded-xl bg-cep-purple-900 border border-cep-purple-700 p-4 space-y-3 text-sm text-cep-muted">
                    <ol className="list-decimal list-inside space-y-3">
                      <li>Gere ou cole o secret de autenticação.</li>
                      <li>Crie um projeto em <a href="https://script.google.com" target="_blank" rel="noopener noreferrer" className="text-cep-lime-400 underline">script.google.com</a>.</li>
                      <li>Configure o endpoint Apps Script e cole a URL nesta página.</li>
                      <li>Clique em Testar conexão e salve.</li>
                    </ol>
                  </div>
                )}
              </div>
            </div>
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

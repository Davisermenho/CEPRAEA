import { useState, useEffect } from 'react'
import { Save, LogOut, Shield, ChevronRight, ChevronDown, Copy, Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/components/Button'
import { Modal } from '@/shared/components/Modal'
import { getSetting, setSetting } from '@/db'
import { clearSession, hashPin, verifyPin } from '@/lib/auth'
import { pingEndpoint, generateSecret } from '@/lib/sync'
import { copiarTexto } from '@/lib/whatsapp'
import type { AppSettings } from '@/types'

const DEFAULT: AppSettings = {
  nomeEquipe: 'CEPRAEA',
  nomeTecnico: '',
  telefoneTecnico: '',
  localPadrao: '',
  semanasFuturas: 12,
  pinHash: '',
  appUrl: window.location.origin,
  syncEndpointUrl: '',
  syncSecret: '',
  lastSyncAt: '',
}

export default function SettingsPage() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState<AppSettings>(DEFAULT)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [pinModal, setPinModal] = useState(false)
  const [currentPin, setCurrentPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [pinLoading, setPinLoading] = useState(false)
  const [syncGuideOpen, setSyncGuideOpen] = useState(false)
  const [testingSync, setTestingSync] = useState(false)
  const [syncTestResult, setSyncTestResult] = useState<{ ok: boolean; error?: string } | null>(null)
  const [secretCopied, setSecretCopied] = useState(false)

  useEffect(() => {
    getSetting<AppSettings>('appSettings').then((s) => {
      if (s) setSettings({ ...DEFAULT, ...s })
    })
  }, [])

  const update = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) =>
    setSettings((s) => ({ ...s, [key]: value }))

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
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

  const handleTestSync = async () => {
    if (!settings.syncEndpointUrl || !settings.syncSecret) return
    setTestingSync(true)
    setSyncTestResult(null)
    const result = await pingEndpoint({
      endpointUrl: settings.syncEndpointUrl,
      secret: settings.syncSecret,
    })
    setSyncTestResult(result)
    setTestingSync(false)
  }

  const handleChangePin = async () => {
    if (newPin.length < 4) { setPinError('PIN deve ter pelo menos 4 caracteres.'); return }
    if (newPin !== confirmPin) { setPinError('PINs não coincidem.'); return }
    setPinLoading(true)
    setPinError('')
    const storedHash = await getSetting<string>('pinHash')
    if (storedHash) {
      const ok = await verifyPin(currentPin, storedHash)
      if (!ok) { setPinError('PIN atual incorreto.'); setPinLoading(false); return }
    }
    const hash = await hashPin(newPin)
    await setSetting('pinHash', hash)
    const updated = { ...settings, pinHash: hash }
    setSettings(updated)
    await setSetting('appSettings', updated)
    setPinModal(false)
    setCurrentPin(''); setNewPin(''); setConfirmPin('')
    setPinLoading(false)
  }

  const handleLogout = () => {
    clearSession()
    navigate('/login', { replace: true })
  }

  const syncIsConfigured = !!(settings.syncEndpointUrl && settings.syncSecret)

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

          {/* Equipe */}
          <section className={sectionClass}>
            <h2 className="text-xs font-bold text-cep-muted uppercase tracking-wide">Equipe</h2>
            {[
              { key: 'nomeEquipe' as const,      label: 'Nome da equipe',         type: 'text', placeholder: 'CEPRAEA' },
              { key: 'nomeTecnico' as const,     label: 'Nome do treinador',       type: 'text', placeholder: 'Prof. Silva' },
              { key: 'telefoneTecnico' as const, label: 'WhatsApp do treinador',   type: 'tel',  placeholder: '21987654321' },
              { key: 'localPadrao' as const,     label: 'Local padrão',            type: 'text', placeholder: 'Quadra Central' },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className={labelClass}>{label}</label>
                <input
                  type={type}
                  inputMode={type === 'tel' ? 'numeric' : undefined}
                  value={String(settings[key] ?? '')}
                  onChange={(e) =>
                    update(key, (type === 'tel'
                      ? e.target.value.replace(/\D/g, '').slice(0, 11)
                      : e.target.value) as AppSettings[typeof key])
                  }
                  placeholder={placeholder}
                  className={inputClass}
                />
              </div>
            ))}
          </section>

          {/* Treinos */}
          <section className={sectionClass}>
            <h2 className="text-xs font-bold text-cep-muted uppercase tracking-wide">Treinos Automáticos</h2>
            <div>
              <label className={labelClass}>
                Semanas a gerar: <strong className="text-cep-white">{settings.semanasFuturas}</strong>
              </label>
              <input
                type="range" min={4} max={24} value={settings.semanasFuturas}
                onChange={(e) => update('semanasFuturas', Number(e.target.value))}
                className="w-full accent-cep-lime-400"
              />
              <div className="flex justify-between text-xs text-cep-muted mt-0.5">
                <span>4</span><span>24 semanas</span>
              </div>
            </div>
          </section>

          {/* URL pública */}
          <section className={sectionClass}>
            <h2 className="text-xs font-bold text-cep-muted uppercase tracking-wide">URL Pública do App</h2>
            <input
              type="url"
              value={settings.appUrl}
              onChange={(e) => update('appUrl', e.target.value)}
              placeholder="https://cepraea.vercel.app"
              className={inputClass}
            />
            <p className="text-xs text-cep-muted/70">Usada nos links de confirmação enviados às atletas.</p>
          </section>

          {/* Sincronização */}
          <section className="bg-cep-purple-850 rounded-2xl border border-cep-purple-700 overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-4 border-b border-cep-purple-700">
              <Wifi className="h-5 w-5 text-cep-lime-400 shrink-0" />
              <div className="flex-1">
                <h2 className="text-sm font-bold text-cep-white">Sincronização Remota</h2>
                <p className="text-xs text-cep-muted mt-0.5">
                  {syncIsConfigured
                    ? 'Endpoint configurado — confirmações remotas ativas'
                    : 'Configure para receber confirmações das atletas automaticamente'}
                </p>
              </div>
              {syncIsConfigured && (
                <span className="h-2 w-2 rounded-full bg-cep-lime-400 shrink-0" />
              )}
            </div>

            <div className="p-4 space-y-4">
              {/* Secret */}
              <div>
                <label className={labelClass}>Secret de autenticação</label>
                <div className="flex gap-2">
                  <div className="flex-1 h-10 rounded-xl border border-cep-purple-700 bg-cep-purple-900 px-3 flex items-center overflow-hidden">
                    <span className="text-xs font-mono text-cep-muted truncate">
                      {settings.syncSecret || '(não gerado)'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopySecret}
                    disabled={!settings.syncSecret}
                    className="h-10 px-3 rounded-xl border border-cep-purple-700 bg-cep-purple-900 text-cep-muted hover:text-cep-white hover:bg-cep-purple-800 disabled:opacity-40 transition-colors"
                    title="Copiar secret"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerateSecret}
                    className="h-10 px-3 rounded-xl border border-cep-purple-700 bg-cep-purple-900 text-cep-muted hover:text-cep-white hover:bg-cep-purple-800 transition-colors"
                    title="Gerar novo secret"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
                {secretCopied && <p className="text-xs text-cep-lime-400 mt-1">Copiado!</p>}
                {!settings.syncSecret && (
                  <p className="text-xs text-cep-gold-400 mt-1">
                    Clique em <RefreshCw className="inline h-3 w-3" /> para gerar um secret.
                  </p>
                )}
              </div>

              {/* Endpoint URL */}
              <div>
                <label className={labelClass}>URL do endpoint (Apps Script)</label>
                <input
                  type="url"
                  value={settings.syncEndpointUrl ?? ''}
                  onChange={(e) => update('syncEndpointUrl', e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className={inputClass}
                />
              </div>

              {/* Test connection */}
              {syncIsConfigured && (
                <div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    fullWidth
                    onClick={handleTestSync}
                    loading={testingSync}
                  >
                    <Wifi className="h-4 w-4" />
                    Testar conexão
                  </Button>
                  {syncTestResult && (
                    <p className={`text-xs mt-2 flex items-center gap-1.5 ${syncTestResult.ok ? 'text-cep-lime-400' : 'text-red-400'}`}>
                      {syncTestResult.ok
                        ? <><Wifi className="h-3.5 w-3.5" /> Conexão OK — endpoint acessível</>
                        : <><WifiOff className="h-3.5 w-3.5" /> {syncTestResult.error}</>}
                    </p>
                  )}
                </div>
              )}

              {/* Setup guide */}
              <div>
                <button
                  type="button"
                  onClick={() => setSyncGuideOpen((v) => !v)}
                  className="flex items-center gap-2 text-sm font-semibold text-cep-lime-400 hover:text-cep-lime-500 transition-colors"
                >
                  {syncGuideOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  Como configurar o Apps Script (passo a passo)
                </button>

                {syncGuideOpen && (
                  <div className="mt-3 rounded-xl bg-cep-purple-900 border border-cep-purple-700 p-4 space-y-3 text-sm text-cep-muted">
                    <ol className="list-decimal list-inside space-y-3">
                      <li>
                        <strong className="text-cep-white">Gere o secret</strong> acima (botão <RefreshCw className="inline h-3 w-3" />) e copie-o.
                      </li>
                      <li>
                        Acesse{' '}
                        <a
                          href="https://script.google.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cep-lime-400 underline"
                        >
                          script.google.com
                        </a>{' '}
                        e crie um <strong className="text-cep-white">Novo projeto</strong>.
                      </li>
                      <li>
                        Substitua o conteúdo pelo arquivo{' '}
                        <code className="bg-cep-purple-800 border border-cep-purple-700 rounded px-1 text-xs text-cep-white">apps-script/Code.gs</code>.
                      </li>
                      <li>
                        Na linha{' '}
                        <code className="bg-cep-purple-800 border border-cep-purple-700 rounded px-1 text-xs text-cep-white">SYNC_SECRET</code>,{' '}
                        cole o secret copiado.
                      </li>
                      <li>
                        <strong className="text-cep-white">Implantar &gt; Nova implantação</strong>:
                        <ul className="list-disc list-inside ml-4 mt-1 space-y-1 text-xs">
                          <li>Tipo: <em>Aplicativo da Web</em></li>
                          <li>Executar como: <em>Eu</em></li>
                          <li>Acesso: <em>Qualquer pessoa</em></li>
                        </ul>
                      </li>
                      <li>Copie a <strong className="text-cep-white">URL do app</strong> e cole no campo acima.</li>
                      <li>Clique em <strong className="text-cep-white">Testar conexão</strong>.</li>
                      <li><strong className="text-cep-white">Salve</strong> as configurações.</li>
                    </ol>
                    <p className="text-xs text-cep-muted/60 pt-1 border-t border-cep-purple-700">
                      A aba "confirmacoes" é criada automaticamente na primeira confirmação.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          <Button type="submit" fullWidth loading={loading}>
            <Save className="h-4 w-4" />
            {saved ? 'Salvo!' : 'Salvar configurações'}
          </Button>
        </form>

        {/* Security + logout */}
        <div className="px-4 pb-6 space-y-2">
          <button
            onClick={() => setPinModal(true)}
            className="w-full flex items-center gap-3 bg-cep-purple-850 rounded-2xl border border-cep-purple-700 px-4 py-3 hover:bg-cep-purple-800 transition-colors text-left"
          >
            <Shield className="h-5 w-5 text-cep-lime-400" />
            <span className="flex-1 text-sm font-semibold text-cep-white">Alterar PIN de acesso</span>
            <ChevronRight className="h-4 w-4 text-cep-muted" />
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 bg-cep-purple-850 rounded-2xl border border-red-500/30 px-4 py-3 hover:bg-red-500/10 transition-colors text-left"
          >
            <LogOut className="h-5 w-5 text-red-400" />
            <span className="flex-1 text-sm font-semibold text-red-400">Sair</span>
          </button>
        </div>
      </div>

      <Modal open={pinModal} onClose={() => { setPinModal(false); setPinError('') }} title="Alterar PIN" size="sm">
        <div className="p-4 space-y-3">
          {(['currentPin', 'newPin', 'confirmPin'] as const).map((field, i) => (
            <div key={field}>
              <label className={labelClass}>
                {i === 0 ? 'PIN atual' : i === 1 ? 'Novo PIN' : 'Confirmar novo PIN'}
              </label>
              <input
                type="password"
                inputMode="numeric"
                value={field === 'currentPin' ? currentPin : field === 'newPin' ? newPin : confirmPin}
                onChange={(e) => {
                  const v = e.target.value
                  if (field === 'currentPin') setCurrentPin(v)
                  else if (field === 'newPin') setNewPin(v)
                  else setConfirmPin(v)
                }}
                className={inputClass}
              />
            </div>
          ))}
          {pinError && (
            <div className="rounded-xl bg-red-500/20 border border-red-500/40 px-3 py-2">
              <p className="text-xs text-red-400">{pinError}</p>
            </div>
          )}
          <div className="flex gap-2">
            <Button variant="secondary" fullWidth onClick={() => setPinModal(false)}>Cancelar</Button>
            <Button fullWidth loading={pinLoading} onClick={handleChangePin}>Salvar</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

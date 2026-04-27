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

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <h1 className="text-xl font-bold text-gray-900">Configurações</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        <form onSubmit={handleSave} className="p-4 space-y-4">

          {/* Equipe */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
            <h2 className="text-sm font-semibold text-gray-700">Equipe</h2>
            {[
              { key: 'nomeEquipe' as const,     label: 'Nome da equipe',         type: 'text', placeholder: 'CEPRAEA' },
              { key: 'nomeTecnico' as const,    label: 'Nome do treinador',       type: 'text', placeholder: 'Prof. Silva' },
              { key: 'telefoneTecnico' as const, label: 'WhatsApp do treinador', type: 'tel',  placeholder: '21987654321' },
              { key: 'localPadrao' as const,    label: 'Local padrão',            type: 'text', placeholder: 'Quadra Central' },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="block text-xs text-gray-500 mb-1">{label}</label>
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
                  className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </section>

          {/* Treinos */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
            <h2 className="text-sm font-semibold text-gray-700">Treinos Automáticos</h2>
            <div>
              <label className="block text-xs text-gray-500 mb-2">
                Semanas a gerar: <strong>{settings.semanasFuturas}</strong>
              </label>
              <input
                type="range" min={4} max={24} value={settings.semanasFuturas}
                onChange={(e) => update('semanasFuturas', Number(e.target.value))}
                className="w-full accent-blue-700"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                <span>4</span><span>24 semanas</span>
              </div>
            </div>
          </section>

          {/* URL pública */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-2">
            <h2 className="text-sm font-semibold text-gray-700">URL Pública do App</h2>
            <input
              type="url"
              value={settings.appUrl}
              onChange={(e) => update('appUrl', e.target.value)}
              placeholder="https://cepraea.vercel.app"
              className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400">Usada nos links de confirmação enviados às atletas.</p>
          </section>

          {/* ─── Sincronização ─────────────────────────────────────────────────── */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
              <Wifi className="h-5 w-5 text-blue-600 shrink-0" />
              <div className="flex-1">
                <h2 className="text-sm font-semibold text-gray-700">Sincronização Remota</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {syncIsConfigured
                    ? 'Endpoint configurado — confirmações remotas ativas'
                    : 'Configure para receber confirmações das atletas automaticamente'}
                </p>
              </div>
              {syncIsConfigured && (
                <span className="h-2 w-2 rounded-full bg-green-500 shrink-0" />
              )}
            </div>

            <div className="p-4 space-y-4">
              {/* Secret */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Secret de autenticação
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 h-10 rounded-xl border border-gray-200 bg-gray-50 px-3 flex items-center overflow-hidden">
                    <span className="text-xs font-mono text-gray-600 truncate">
                      {settings.syncSecret || '(não gerado)'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopySecret}
                    disabled={!settings.syncSecret}
                    className="h-10 px-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 disabled:opacity-40 transition-colors"
                    title="Copiar secret"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerateSecret}
                    className="h-10 px-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
                    title="Gerar novo secret"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
                {secretCopied && <p className="text-xs text-green-600 mt-1">Copiado!</p>}
                {!settings.syncSecret && (
                  <p className="text-xs text-amber-600 mt-1">
                    Clique em <RefreshCw className="inline h-3 w-3" /> para gerar um secret. Guarde-o — você precisará colá-lo no Apps Script.
                  </p>
                )}
              </div>

              {/* Endpoint URL */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">URL do endpoint (Apps Script)</label>
                <input
                  type="url"
                  value={settings.syncEndpointUrl ?? ''}
                  onChange={(e) => update('syncEndpointUrl', e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    <p className={`text-xs mt-2 flex items-center gap-1.5 ${syncTestResult.ok ? 'text-green-600' : 'text-red-600'}`}>
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
                  className="flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-900 transition-colors"
                >
                  {syncGuideOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  Como configurar o Apps Script (passo a passo)
                </button>

                {syncGuideOpen && (
                  <div className="mt-3 rounded-xl bg-blue-50 border border-blue-100 p-4 space-y-3 text-sm text-gray-700">
                    <ol className="list-decimal list-inside space-y-3">
                      <li>
                        <strong>Gere o secret</strong> acima (botão <RefreshCw className="inline h-3 w-3" />) e copie-o.
                      </li>
                      <li>
                        Acesse{' '}
                        <a
                          href="https://script.google.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-700 underline"
                        >
                          script.google.com
                        </a>{' '}
                        e crie um <strong>Novo projeto</strong>.
                      </li>
                      <li>
                        Substitua todo o conteúdo do editor pelo arquivo{' '}
                        <code className="bg-white border border-gray-200 rounded px-1 text-xs">apps-script/Code.gs</code>{' '}
                        do projeto.
                      </li>
                      <li>
                        Na linha{' '}
                        <code className="bg-white border border-gray-200 rounded px-1 text-xs">var SYNC_SECRET = 'COLE_SEU_SECRET_AQUI';</code>,{' '}
                        substitua pelo secret copiado.
                      </li>
                      <li>
                        Clique em <strong>Implantar &gt; Nova implantação</strong>:
                        <ul className="list-disc list-inside ml-4 mt-1 space-y-1 text-xs text-gray-600">
                          <li>Tipo: <em>Aplicativo da Web</em></li>
                          <li>Executar como: <em>Eu (seu e-mail)</em></li>
                          <li>Quem tem acesso: <em>Qualquer pessoa</em></li>
                        </ul>
                      </li>
                      <li>
                        Copie a <strong>URL do app implantado</strong> e cole no campo "URL do endpoint" acima.
                      </li>
                      <li>
                        Clique em <strong>Testar conexão</strong> para confirmar que está tudo certo.
                      </li>
                      <li>
                        <strong>Salve</strong> as configurações e publique o app na Vercel/Netlify.
                      </li>
                    </ol>
                    <p className="text-xs text-gray-500 pt-1 border-t border-blue-100">
                      A aba "confirmacoes" é criada automaticamente na primeira confirmação recebida.
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
            className="w-full flex items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 hover:bg-gray-50 transition-colors text-left"
          >
            <Shield className="h-5 w-5 text-blue-700" />
            <span className="flex-1 text-sm font-medium text-gray-900">Alterar PIN de acesso</span>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 bg-white rounded-2xl border border-red-100 shadow-sm px-4 py-3 hover:bg-red-50 transition-colors text-left"
          >
            <LogOut className="h-5 w-5 text-red-600" />
            <span className="flex-1 text-sm font-medium text-red-600">Sair</span>
          </button>
        </div>
      </div>

      <Modal open={pinModal} onClose={() => { setPinModal(false); setPinError('') }} title="Alterar PIN" size="sm">
        <div className="p-4 space-y-3">
          {(['currentPin', 'newPin', 'confirmPin'] as const).map((field, i) => (
            <div key={field}>
              <label className="block text-xs text-gray-500 mb-1">
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
                className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
          {pinError && <p className="text-xs text-red-600">{pinError}</p>}
          <div className="flex gap-2">
            <Button variant="secondary" fullWidth onClick={() => setPinModal(false)}>Cancelar</Button>
            <Button fullWidth loading={pinLoading} onClick={handleChangePin}>Salvar</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

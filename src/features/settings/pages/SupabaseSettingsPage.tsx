import { ChevronLeft, Shield, Wifi, WifiOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSupabaseAuth } from '@/features/auth/SupabaseAuthProvider'
import { getSupabaseTeamId, isSupabaseTeamConfigured } from '@/features/presence-tokens/presenceTokenConfig'

export default function SupabaseSettingsPage() {
  const navigate = useNavigate()
  const { configured, authenticated, user, loading } = useSupabaseAuth()
  const teamId = getSupabaseTeamId()
  const teamConfigured = isSupabaseTeamConfigured()
  const readyForNextPhase = configured && authenticated && teamConfigured

  return (
    <div className="flex flex-col h-full">
      <div className="bg-cep-purple-900 border-b border-cep-purple-800 px-4 py-4">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 rounded-lg hover:bg-cep-purple-800 text-cep-muted hover:text-cep-white transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <p className="text-xs font-bold text-cep-lime-400 tracking-widest uppercase mb-0.5">Supabase</p>
            <h1 className="text-xl font-black text-cep-white">Sessão do treinador</h1>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <section className="bg-cep-purple-850 rounded-2xl border border-cep-purple-700 p-4 space-y-3">
          <h2 className="text-xs font-bold text-cep-muted uppercase tracking-wide">Estado técnico</h2>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-cep-muted">
              {configured ? <Wifi className="h-4 w-4 text-cep-lime-400" /> : <WifiOff className="h-4 w-4 text-red-400" />}
              <span>Configuração Supabase: <strong className="text-cep-white">{configured ? 'presente' : 'ausente'}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-cep-muted">
              {authenticated ? <Shield className="h-4 w-4 text-cep-lime-400" /> : <Shield className="h-4 w-4 text-cep-gold-400" />}
              <span>Sessão: <strong className="text-cep-white">{loading ? 'verificando...' : authenticated ? 'autenticada' : 'não autenticada'}</strong></span>
            </div>
            {authenticated && (
              <div className="text-xs text-cep-muted break-all">
                Usuário: <strong className="text-cep-white">{user?.email ?? user?.id}</strong>
              </div>
            )}
            <div className="text-xs text-cep-muted break-all">
              Team ID: <strong className={teamConfigured ? 'text-cep-white' : 'text-red-400'}>{teamId ?? 'VITE_SUPABASE_TEAM_ID ausente ou inválido'}</strong>
            </div>
          </div>

          <div className={`rounded-xl border px-3 py-2 text-xs ${readyForNextPhase ? 'border-cep-lime-400/40 bg-cep-lime-400/10 text-cep-lime-400' : 'border-cep-gold-400/40 bg-cep-gold-400/10 text-cep-gold-400'}`}>
            {readyForNextPhase
              ? 'Base pronta para validar geração de lotes em uma próxima fase.'
              : 'Ainda não liberar geração de lotes. É necessário Supabase configurado, sessão autenticada e Team ID válido.'}
          </div>
        </section>

        <section className="bg-cep-purple-850 rounded-2xl border border-cep-purple-700 p-4 space-y-3">
          <h2 className="text-xs font-bold text-cep-muted uppercase tracking-wide">Decisão operacional</h2>
          <p className="text-sm text-cep-muted">
            Esta tela valida apenas a base técnica da sessão Supabase. O login por PIN continua sendo o guard operacional do painel.
          </p>
          <p className="text-sm text-cep-muted">
            A autenticação Supabase ativa deve ser provida por sessão já existente no cliente ou por uma etapa posterior de login controlado. A geração, exportação e revogação de lotes continuam bloqueadas nesta fase.
          </p>
        </section>
      </div>
    </div>
  )
}

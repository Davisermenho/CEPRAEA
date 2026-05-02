import { Link } from 'react-router-dom'
import { Users, UserCog } from 'lucide-react'
import { CepraeaLogomarca } from '@/shared/components/CepraeaLogomarca'

export default function WelcomePage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-cep-purple-950 px-6 py-10">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <CepraeaLogomarca className="mx-auto h-12 w-auto text-cep-lime-400" />
          <p className="mt-3 text-sm text-cep-muted">Gestão de Treinos</p>
        </div>

        <div className="space-y-3">
          <Link
            to="/atleta/login"
            className="flex w-full items-center gap-4 rounded-2xl border-2 border-cep-lime-400/40 bg-cep-purple-900 p-5 transition hover:border-cep-lime-400 hover:bg-cep-purple-850"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cep-lime-400/20">
              <Users className="h-6 w-6 text-cep-lime-400" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-cep-white">Sou atleta</p>
              <p className="text-xs text-cep-muted">Ver treinos e confirmar presença</p>
            </div>
          </Link>

          <Link
            to="/login"
            className="flex w-full items-center gap-4 rounded-2xl border-2 border-cep-purple-800 bg-cep-purple-900 p-5 transition hover:border-cep-gold-400 hover:bg-cep-purple-850"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cep-gold-400/20">
              <UserCog className="h-6 w-6 text-cep-gold-400" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-cep-white">Sou treinador</p>
              <p className="text-xs text-cep-muted">Gerenciar atletas e treinos</p>
            </div>
          </Link>
        </div>

        <p className="text-center text-xs text-cep-muted/60">
          CEPRAEA · Rio de Janeiro
        </p>
      </div>
    </div>
  )
}

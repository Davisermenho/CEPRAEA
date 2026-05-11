import { Link } from 'react-router-dom'
import { ArrowRight, UserCog, Users } from 'lucide-react'
import { CepraeaLogomarca } from '@/shared/components/CepraeaLogomarca'

export default function WelcomePage() {
  return (
    <div className="min-h-svh w-full overflow-y-auto bg-[#14001F] text-white">
      <main className="mx-auto flex min-h-svh w-full max-w-[390px] flex-col px-7 pb-[max(40px,calc(env(safe-area-inset-bottom)+40px))] pt-[52px]">
        <CepraeaLogomarca className="mx-auto mb-14 h-auto w-[270px] max-w-[78%] text-[#7EFF00]" />

        <header>
          <h1 className="mb-2.5 text-[34px] font-extrabold leading-none tracking-[-0.03em] text-white">
            Acessar
          </h1>
          <p className="mb-4 text-[11px] font-extrabold uppercase leading-tight tracking-[0.12em] text-[#7EFF00]">
            ESCOLHA SEU PERFIL
          </p>
          <p className="mb-8 text-sm leading-[1.55] text-[#A18BA9]">
            Entre pelo acesso correto para visualizar treinos, confirmar presença ou gerenciar a equipe.
          </p>
        </header>

        <section className="flex flex-col gap-4" aria-label="Tipos de acesso">
          <Link
            to="/atleta/login"
            className="group rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-[#52D900]/70 hover:bg-white/[0.05] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#52D900]/35"
          >
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#52D900]/15 text-[#52D900]">
              <Users className="h-6 w-6" aria-hidden />
            </div>
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="mb-2 text-xl font-extrabold leading-tight text-white">Sou atleta</h2>
                <p className="text-[15px] leading-snug text-[#A18BA9]">
                  Ver treinos e confirmar presença.
                </p>
              </div>
              <ArrowRight className="mb-1 h-5 w-5 shrink-0 text-[#52D900] transition group-hover:translate-x-1" aria-hidden />
            </div>
          </Link>

          <Link
            to="/login"
            className="group rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-[#52D900]/70 hover:bg-white/[0.05] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#52D900]/35"
          >
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7EFF00]/12 text-[#7EFF00]">
              <UserCog className="h-6 w-6" aria-hidden />
            </div>
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="mb-2 text-xl font-extrabold leading-tight text-white">Sou treinador</h2>
                <p className="text-[15px] leading-snug text-[#A18BA9]">
                  Gerenciar atletas e treinos.
                </p>
              </div>
              <ArrowRight className="mb-1 h-5 w-5 shrink-0 text-[#52D900] transition group-hover:translate-x-1" aria-hidden />
            </div>
          </Link>
        </section>

        <footer className="mt-14 text-center text-[10px] font-bold uppercase tracking-[0.35em] text-[#A18BA9]/70">
          PREPARAÇÃO • IDENTIDADE • COMPETIÇÃO
        </footer>
      </main>
    </div>
  )
}

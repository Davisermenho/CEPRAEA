import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { CepraeaLogomarca } from '@/shared/components/CepraeaLogomarca'

export default function WelcomePage() {
  return (
    <div className="min-h-svh w-full overflow-y-auto bg-[#14001F] text-white">
      <main className="mx-auto flex min-h-svh w-full max-w-[390px] flex-col px-[26px] pb-[max(36px,calc(env(safe-area-inset-bottom)+36px))] pt-[52px]">
        <section className="pt-5 text-center">
          <CepraeaLogomarca className="mx-auto mb-7 h-auto w-[270px] max-w-[78%] text-[#7EFF00]" />

          <h1 className="mb-3 text-[29px] font-normal leading-tight tracking-[-0.04em] text-white">
            Bem-vindo ao CEPRAEA
          </h1>
          <p className="mx-auto mb-6 max-w-[280px] text-[15px] leading-snug text-[#A18BA9]">
            Sua plataforma completa para gestão e acompanhamento de treinos.
          </p>
        </section>

        <section className="flex flex-col gap-4" aria-label="Tipos de acesso">
          <Link
            to="/atleta/login"
            aria-label="Sou atleta: acessar treinos e informar presenças"
            className="group flex min-h-[56px] items-center justify-between rounded-xl border border-white/70 bg-white/[0.035] px-6 py-3.5 shadow-[0_0_28px_rgba(192,44,255,0.28)] transition hover:border-white/85 hover:bg-white/[0.05] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#C02CFF]/40"
          >
            <span className="text-left">
              <span className="block text-base font-extrabold leading-tight text-white">Sou atleta</span>
              <span className="mt-1 block text-[12px] leading-tight text-[#C02CFF]">
                Acessar treinos e informar presenças.
              </span>
            </span>
            <ChevronRight className="h-5 w-5 shrink-0 text-[#7EFF00] transition group-hover:translate-x-0.5" aria-hidden />
          </Link>

          <Link
            to="/login"
            aria-label="Sou treinador: gerenciar atletas e treinos"
            className="group flex min-h-[56px] items-center justify-between rounded-xl border border-white/70 bg-white/[0.035] px-6 py-3.5 shadow-[0_0_28px_rgba(192,44,255,0.28)] transition hover:border-white/85 hover:bg-white/[0.05] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#C02CFF]/40"
          >
            <span className="text-left">
              <span className="block text-base font-extrabold leading-tight text-white">Sou treinador</span>
              <span className="mt-1 block text-[12px] leading-tight text-[#C02CFF]">
                Gerenciar atletas e treinos
              </span>
            </span>
            <ChevronRight className="h-5 w-5 shrink-0 text-[#7EFF00] transition group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </section>

        <footer className="mt-9 text-center">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.35em] text-[#7EFF00]">
            CEPRAEA • RIO DE JANEIRO
          </p>
          <div className="mt-3 flex justify-center gap-1.5" aria-hidden>
            <span className="h-1.5 w-1.5 rounded-full bg-[#52D900]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#52D900]/30" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#52D900]/30" />
          </div>
        </footer>
      </main>
    </div>
  )
}

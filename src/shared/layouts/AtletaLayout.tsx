import { Outlet, NavLink } from 'react-router-dom'
import { Calendar, User } from 'lucide-react'
import { CepraeaLogomarca } from '@/shared/components/CepraeaLogomarca'
import { cn } from '@/lib/utils'
import { UpdatePrompt } from '@/shared/components/UpdatePrompt'

const NAV_ITEMS = [
  { to: '/atleta/treinos', label: 'Treinos', icon: Calendar },
  { to: '/atleta/perfil',  label: 'Perfil',  icon: User },
]

export function AtletaLayout() {
  return (
    <div className="flex h-dvh flex-col bg-cep-purple-950">
      {/* Header com logo */}
      <header className="flex items-center justify-center border-b border-cep-purple-800 bg-cep-purple-900 px-4 py-3">
        <CepraeaLogomarca className="h-6 w-auto text-cep-lime-400" />
      </header>

      {/* Conteúdo */}
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      {/* Bottom nav — sempre visível */}
      <nav
        className="fixed bottom-0 inset-x-0 z-40 bg-cep-purple-900 border-t border-cep-purple-800"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="grid h-16 grid-cols-2 px-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors',
                  isActive ? 'text-cep-lime-400' : 'text-cep-muted'
                )
              }
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <UpdatePrompt />
    </div>
  )
}

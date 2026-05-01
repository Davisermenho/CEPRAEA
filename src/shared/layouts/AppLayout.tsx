import { useMemo } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  BarChart2,
  Settings,
  Crosshair,
} from 'lucide-react'
import { CepraeaLogomarca } from '@/shared/components/CepraeaLogomarca'
import { cn } from '@/lib/utils'
import { UpdatePrompt } from '@/shared/components/UpdatePrompt'
import { useTrainingStore } from '@/stores/trainingStore'

interface NavItem {
  to: string
  label: string
  icon: typeof LayoutDashboard
}

const NAV_ITEMS: NavItem[] = [
  { to: '/',             label: 'Início',    icon: LayoutDashboard },
  { to: '/atletas',      label: 'Atletas',   icon: Users },
  { to: '/treinos',      label: 'Treinos',   icon: Dumbbell },
  { to: '/scout',        label: 'Scout',     icon: Crosshair },
  { to: '/relatorios',   label: 'Relatórios', icon: BarChart2 },
  { to: '/configuracoes', label: 'Config',   icon: Settings },
]

export function AppLayout() {
  const trainings = useTrainingStore((s) => s.trainings)
  const getConflicts = useTrainingStore((s) => s.getConflicts)
  const conflicts = useMemo(() => getConflicts(), [trainings]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex h-dvh flex-col bg-cep-purple-950 lg:flex-row">
      {/* Sidebar — desktop only */}
      <aside className="hidden lg:flex lg:w-56 lg:flex-col lg:bg-cep-purple-900 lg:border-r lg:border-cep-purple-800 lg:shrink-0">
        <div className="px-5 py-6">
          <CepraeaLogomarca className="w-36 text-cep-lime-400" />
          <p className="text-xs text-cep-muted mt-2 tracking-wide">Gestão de Treinos</p>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-cep-purple-800 text-cep-lime-400'
                    : 'text-cep-muted hover:bg-cep-purple-850 hover:text-cep-white',
                )
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
              {to === '/treinos' && conflicts.length > 0 && (
                <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-cep-gold-400 text-xs text-cep-purple-950 font-black">
                  {conflicts.length}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-cep-purple-800">
          <p className="text-xs text-cep-muted/60 tracking-wide">Preparação. Identidade. Competição.</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
        <Outlet />
      </main>

      {/* Bottom nav — mobile only */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-cep-purple-900 border-t border-cep-purple-800 lg:hidden"
           style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div
          className="grid h-16 px-1"
          style={{ gridTemplateColumns: `repeat(${NAV_ITEMS.length}, 1fr)` }}
        >
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors relative',
                  isActive ? 'text-cep-lime-400' : 'text-cep-muted',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Icon className={cn('h-5 w-5', isActive ? 'text-cep-lime-400' : 'text-cep-muted')} />
                    {to === '/treinos' && conflicts.length > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-cep-gold-400 text-[10px] text-cep-purple-950 font-black">
                        {conflicts.length}
                      </span>
                    )}
                  </div>
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      <UpdatePrompt />
    </div>
  )
}

import { useMemo } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  BarChart2,
  Settings,
} from 'lucide-react'
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
  { to: '/relatorios',   label: 'Relatórios', icon: BarChart2 },
  { to: '/configuracoes', label: 'Config',   icon: Settings },
]

export function AppLayout() {
  const trainings = useTrainingStore((s) => s.trainings)
  const getConflicts = useTrainingStore((s) => s.getConflicts)
  const conflicts = useMemo(() => getConflicts(), [trainings]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex h-dvh flex-col bg-gray-50 lg:flex-row">
      {/* Sidebar — desktop only */}
      <aside className="hidden lg:flex lg:w-56 lg:flex-col lg:bg-white lg:border-r lg:border-gray-200 lg:shrink-0">
        <div className="px-4 py-5">
          <span className="text-lg font-bold text-blue-700">CEPRAEA</span>
        </div>
        <nav className="flex-1 px-2 space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                )
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
              {to === '/treinos' && conflicts.length > 0 && (
                <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-xs text-white font-bold">
                  {conflicts.length}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
        <Outlet />
      </main>

      {/* Bottom nav — mobile only */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 lg:hidden">
        <div
          className="grid h-16 px-2"
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
                  isActive ? 'text-blue-700' : 'text-gray-500',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Icon className={cn('h-5 w-5', isActive ? 'text-blue-700' : 'text-gray-500')} />
                    {to === '/treinos' && conflicts.length > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] text-white font-bold">
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

// CEPR-AUTH-01: AccessContext — resolves role/team and athlete link for the
// current authenticated user via get_my_access() SECURITY DEFINER RPC.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { useSupabaseAuth } from '@/features/auth/SupabaseAuthProvider'

// ─────────────────────────────────────────────────────────────────────────────
// Types

export interface TeamMembership {
  team_id: string
  role: 'owner' | 'coach' | 'viewer'
}

export interface AthleteLink {
  team_id: string
  athlete_id: string
}

export interface AccessState {
  loading: boolean
  error: string | null
  userId: string | null
  profileComplete: boolean
  memberships: TeamMembership[]
  athleteLink: AthleteLink | null
}

interface AccessContextValue extends AccessState {
  reload: () => void
  roleForTeam: (teamId: string) => 'owner' | 'coach' | 'viewer' | null
  hasRole: (teamId: string, roles: Array<'owner' | 'coach' | 'viewer'>) => boolean
  hasAthleteLink: (teamId: string) => boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// Context

const AccessContext = createContext<AccessContextValue | null>(null)

// ─────────────────────────────────────────────────────────────────────────────
// Provider

export function AccessContextProvider({ children }: { children: ReactNode }) {
  const { authenticated, loading: authLoading } = useSupabaseAuth()
  const [state, setState] = useState<AccessState>({
    loading: true,
    error: null,
    userId: null,
    profileComplete: false,
    memberships: [],
    athleteLink: null,
  })
  const [tick, setTick] = useState(0)

  const reload = useCallback(() => setTick((n) => n + 1), [])

  useEffect(() => {
    if (authLoading) return

    if (!authenticated) {
      setState({
        loading: false,
        error: null,
        userId: null,
        profileComplete: false,
        memberships: [],
        athleteLink: null,
      })
      return
    }

    let cancelled = false

    async function resolve() {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      const { data, error } = await supabase.rpc('get_my_access')

      if (cancelled) return

      if (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error.message,
        }))
        return
      }

      const raw = data as {
        user_id: string | null
        profile_complete: boolean
        memberships: Array<{ team_id: string; role: string }> | null
        athlete_link: { team_id: string; athlete_id: string } | null
      }

      setState({
        loading: false,
        error: null,
        userId: raw.user_id,
        profileComplete: raw.profile_complete ?? false,
        memberships: (raw.memberships ?? []) as TeamMembership[],
        athleteLink: raw.athlete_link ?? null,
      })
    }

    resolve()
    return () => { cancelled = true }
  }, [authenticated, authLoading, tick])

  function roleForTeam(teamId: string): 'owner' | 'coach' | 'viewer' | null {
    const m = state.memberships.find((x) => x.team_id === teamId)
    return m ? m.role : null
  }

  function hasRole(
    teamId: string,
    roles: Array<'owner' | 'coach' | 'viewer'>
  ): boolean {
    const r = roleForTeam(teamId)
    return r !== null && roles.includes(r)
  }

  function hasAthleteLink(teamId: string): boolean {
    return state.athleteLink?.team_id === teamId
  }

  const value: AccessContextValue = {
    ...state,
    reload,
    roleForTeam,
    hasRole,
    hasAthleteLink,
  }

  return (
    <AccessContext.Provider value={value}>{children}</AccessContext.Provider>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook

export function useAccessContext(): AccessContextValue {
  const ctx = useContext(AccessContext)
  if (!ctx) {
    throw new Error('useAccessContext must be used within AccessContextProvider')
  }
  return ctx
}

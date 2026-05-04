import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

type SupabaseAuthContextValue = {
  session: Session | null
  user: User | null
  loading: boolean
  configured: boolean
  signOut: () => Promise<void>
}

const SupabaseAuthContext = createContext<SupabaseAuthContextValue | undefined>(undefined)

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const configured = isSupabaseConfigured()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(configured)

  useEffect(() => {
    if (!configured) {
      setLoading(false)
      return
    }

    let mounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setSession(data.session)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setLoading(false)
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [configured])

  const value = useMemo<SupabaseAuthContextValue>(() => ({
    session,
    user: session?.user ?? null,
    loading,
    configured,
    signOut: async () => {
      if (!configured) return
      await supabase.auth.signOut()
      setSession(null)
    },
  }), [configured, loading, session])

  return <SupabaseAuthContext.Provider value={value}>{children}</SupabaseAuthContext.Provider>
}

export function useSupabaseAuth() {
  const ctx = useContext(SupabaseAuthContext)
  if (!ctx) throw new Error('useSupabaseAuth deve ser usado dentro de SupabaseAuthProvider')
  return ctx
}

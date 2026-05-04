import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

type SupabaseAuthResult = {
  ok: boolean
  error?: string
}

type SupabaseAuthContextValue = {
  session: Session | null
  user: User | null
  loading: boolean
  configured: boolean
  authenticated: boolean
  signInWithPassword: (email: string, password: string) => Promise<SupabaseAuthResult>
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
    authenticated: Boolean(session?.user),
    signInWithPassword: async (email: string, password: string) => {
      if (!configured) return { ok: false, error: 'Supabase não configurado.' }
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return { ok: false, error: error.message }
      setSession(data.session)
      return { ok: true }
    },
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

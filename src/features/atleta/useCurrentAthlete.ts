import { useEffect, useMemo, useState } from 'react'
import { useSupabaseAuth } from '@/features/auth/SupabaseAuthProvider'
import { supabase } from '@/lib/supabase'
import { useAthleteStore } from '@/stores/athleteStore'
import type { Athlete } from '@/types'

type CurrentAthleteResult = {
  athlete: Athlete | null
  loading: boolean
}

type AthleteRow = {
  id: string
  team_id: string
  user_id: string | null
  name: string
  email: string | null
  phone: string | null
  category: string | null
  level: string | null
  status: 'ativo' | 'inativo'
  notes: string | null
  created_at: string
  updated_at: string
}

function mapAthleteRow(row: AthleteRow): Athlete {
  return {
    id: row.id,
    teamId: row.team_id,
    userId: row.user_id ?? undefined,
    nome: row.name,
    email: row.email ?? '',
    telefone: row.phone ?? '',
    categoria: row.category ?? undefined,
    nivel: row.level ?? undefined,
    status: row.status,
    observacoes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function useCurrentAthlete(): CurrentAthleteResult {
  const { authenticated, loading: authLoading, user } = useSupabaseAuth()
  const athletes = useAthleteStore((state) => state.athletes)
  const [athlete, setAthlete] = useState<Athlete | null>(null)
  const [loading, setLoading] = useState(true)

  const storeMatch = useMemo(() => {
    if (!user) return null
    return athletes.find((candidate) => candidate.userId === user.id) ?? null
  }, [athletes, user])

  useEffect(() => {
    if (authLoading) return
    if (!authenticated || !user) {
      setAthlete(null)
      setLoading(false)
      return
    }

    if (storeMatch) {
      setAthlete(storeMatch)
      setLoading(false)
      return
    }

    let cancelled = false
    const userId = user.id

    async function fetchCurrentAthlete() {
      setLoading(true)
      const { data } = await supabase
        .from('athletes')
        .select('id, team_id, user_id, name, email, phone, category, level, status, notes, created_at, updated_at')
        .eq('user_id', userId)
        .eq('status', 'ativo')
        .maybeSingle<AthleteRow>()

      if (cancelled) return

      setAthlete(data ? mapAthleteRow(data) : null)
      setLoading(false)
    }

    void fetchCurrentAthlete()

    return () => {
      cancelled = true
    }
  }, [authLoading, authenticated, storeMatch, user])

  return { athlete, loading: authLoading || loading }
}

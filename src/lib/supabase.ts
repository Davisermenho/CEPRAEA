import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined

export const SUPABASE_FAIL_FAST_CODE = '[CEPR-AUTH-02:E001]'

const FAIL_FAST_MESSAGE =
  `${SUPABASE_FAIL_FAST_CODE} Supabase não configurado: defina VITE_SUPABASE_URL e ` +
  `VITE_SUPABASE_PUBLISHABLE_KEY no ambiente (.env.local em dev; Vercel/CI em deploy).`

let _client: SupabaseClient | null = null

function getClient(): SupabaseClient {
  if (_client) return _client
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(FAIL_FAST_MESSAGE)
  }
  _client = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })
  return _client
}

// Proxy preserva a API `import { supabase } from '@/lib/supabase'` em todo o codebase.
// A inicialização real é adiada até o primeiro acesso a uma propriedade do client,
// permitindo que módulos importem `supabase` sem disparar fail-fast em contextos
// que nunca chegam a usá-lo (ex.: testes unitários isolados).
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const client = getClient()
    const value = Reflect.get(client as object, prop, receiver)
    return typeof value === 'function' ? value.bind(client) : value
  },
  set(_target, prop, value) {
    const client = getClient()
    return Reflect.set(client as object, prop, value)
  },
  has(_target, prop) {
    const client = getClient()
    return Reflect.has(client as object, prop)
  },
})

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseKey)
}

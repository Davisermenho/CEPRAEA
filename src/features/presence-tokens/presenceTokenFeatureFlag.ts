import type { PresenceTokenBackend } from './presenceTokenTypes'

const backend = import.meta.env.VITE_PRESENCE_TOKENS_BACKEND as PresenceTokenBackend | undefined

export function getPresenceTokenBackend(): PresenceTokenBackend {
  return backend === 'supabase' ? 'supabase' : 'legacy'
}

export function isSupabasePresenceTokensEnabled(): boolean {
  return getPresenceTokenBackend() === 'supabase'
}

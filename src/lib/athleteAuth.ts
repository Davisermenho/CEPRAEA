import { loginAtleta as remoteLogin, resolveEndpointUrl } from './sync'

const ATLETA_SESSION_KEY = 'cepraea_atleta_session'

export interface AtletaSession {
  atletaId: string
  nome: string
  telefone: string
  token: string
  loggedAt: string
}

export function getAtletaSession(): AtletaSession | null {
  try {
    const raw = localStorage.getItem(ATLETA_SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as AtletaSession
    if (!parsed.atletaId || !parsed.token) return null
    return parsed
  } catch {
    return null
  }
}

export function isAtletaAuthenticated(): boolean {
  return getAtletaSession() !== null
}

export function clearAtletaSession(): void {
  localStorage.removeItem(ATLETA_SESSION_KEY)
}

function setAtletaSession(session: AtletaSession): void {
  localStorage.setItem(ATLETA_SESSION_KEY, JSON.stringify(session))
}

export interface LoginAtletaResult {
  ok: boolean
  session?: AtletaSession
  error?: string
}

export async function loginAtleta(telefone: string, pin: string): Promise<LoginAtletaResult> {
  const endpoint = await resolveEndpointUrl()
  if (!endpoint) {
    return { ok: false, error: 'Sistema ainda não foi configurado. Avise o treinador.' }
  }
  const result = await remoteLogin(endpoint, telefone, pin)
  if (!result.ok || !result.token || !result.atletaId) {
    return { ok: false, error: result.error || 'Erro de login' }
  }
  const session: AtletaSession = {
    atletaId: result.atletaId,
    nome: result.nome ?? '',
    telefone: telefone.replace(/\D/g, ''),
    token: result.token,
    loggedAt: new Date().toISOString(),
  }
  setAtletaSession(session)
  return { ok: true, session }
}

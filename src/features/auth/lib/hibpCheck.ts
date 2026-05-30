// CEPR-AUTH-02E §10.2 — Verificação HIBP via k-anonymity (client-side, Free Plan).
// SHALL: SHA-1 local; enviar apenas prefixo (5 chars); comparar sufixos retornados.
// SHALL NOT: logar senha, hash completo, prefixo enviado ou identificador de usuário.

const HIBP_RANGE_URL = 'https://api.pwnedpasswords.com/range/'

async function sha1Hex(input: string): Promise<string> {
  const enc = new TextEncoder().encode(input)
  const buf = await crypto.subtle.digest('SHA-1', enc)
  const bytes = Array.from(new Uint8Array(buf))
  return bytes.map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase()
}

export interface HibpCheckResult {
  /** true if password appears in HIBP corpus */
  pwned: boolean
  /** approximate count from HIBP ranges (0 when not pwned) */
  count: number
  /** true when network/HIBP unavailable — caller decides policy (fail-open vs fail-closed) */
  unavailable: boolean
}

export interface HibpCheckOptions {
  fetchImpl?: typeof fetch
  signal?: AbortSignal
}

/**
 * Check whether a password is present in the Have I Been Pwned corpus.
 * Uses k-anonymity (only the first 5 SHA-1 hex chars are sent).
 */
export async function hibpCheck(
  password: string,
  options: HibpCheckOptions = {},
): Promise<HibpCheckResult> {
  const fetchImpl = options.fetchImpl ?? fetch
  const hash = await sha1Hex(password)
  const prefix = hash.slice(0, 5)
  const suffix = hash.slice(5)

  let response: Response
  try {
    response = await fetchImpl(`${HIBP_RANGE_URL}${prefix}`, {
      method: 'GET',
      headers: { 'Add-Padding': 'true' },
      signal: options.signal,
    })
  } catch {
    return { pwned: false, count: 0, unavailable: true }
  }

  if (!response.ok) {
    return { pwned: false, count: 0, unavailable: true }
  }

  const body = await response.text()
  for (const line of body.split('\n')) {
    const [returnedSuffix, countStr] = line.trim().split(':')
    if (returnedSuffix?.toUpperCase() === suffix) {
      const count = Number.parseInt(countStr ?? '0', 10)
      if (count > 0) {
        return { pwned: true, count, unavailable: false }
      }
    }
  }
  return { pwned: false, count: 0, unavailable: false }
}

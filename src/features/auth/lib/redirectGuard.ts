// CEPR-AUTH-02C §18 — Proteção contra open redirect
// Todo parâmetro returnUrl/next/redirect DEVE passar por redirectGuard() antes de navigate().

/** Rotas de autenticação — evitar loop de redirect */
const AUTH_PATHNAMES = [
  '/login',
  '/atleta/login',
  '/aceitar-convite',
  '/atleta/nova-senha',
]

/**
 * Valida se uma URL de redirecionamento é segura para usar.
 *
 * Regras (§18):
 * - Retorna '/' se: vazia/ausente, não-http(s), origem diferente, aponta para rota de auth.
 * - Retorna o pathname+search+hash se for mesma origem e válida.
 *
 * @param url   URL bruta recebida de query param (returnUrl, next, redirect).
 * @param origin Origem esperada. Padrão: window.location.origin em runtime.
 */
export function redirectGuard(
  url: string | null | undefined,
  origin?: string,
): string {
  if (!url) return '/'

  const effectiveOrigin =
    origin ?? (typeof window !== 'undefined' ? window.location.origin : 'http://localhost')

  let parsed: URL
  try {
    parsed = new URL(url, effectiveOrigin)
  } catch {
    return '/'
  }

  // Apenas http(s) permitido
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return '/'

  // Mesma origem obrigatório
  if (parsed.origin !== effectiveOrigin) return '/'

  // Evitar loop: não redirecionar para rotas de auth
  const pathname = parsed.pathname.toLowerCase()
  if (AUTH_PATHNAMES.some((r) => pathname === r || pathname.startsWith(r + '/'))) return '/'

  return parsed.pathname + parsed.search + parsed.hash
}

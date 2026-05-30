// CEPR-AUTH-02C §13 — Vocabulário canônico de erros de autenticação
// Todos os erros de auth exibidos ao usuário DEVEM usar esta tabela.
// Adicionar ou alterar mensagens exige PR com atualização do AUTH_ACCESS_CONTRACT.

export const AUTH_CODES = {
  LOGIN_001:   'AUTH-LOGIN-001',
  LOGIN_002:   'AUTH-LOGIN-002',
  LOGIN_003:   'AUTH-LOGIN-003',
  SIGNUP_001:  'AUTH-SIGNUP-001',
  RESET_001:   'AUTH-RESET-001',
  RESET_002:   'AUTH-RESET-002',
  RESET_003:   'AUTH-RESET-003',
  SESSION_001: 'AUTH-SESSION-001',
  CAPTCHA_001: 'AUTH-CAPTCHA-001',
  BOOT_001:    'AUTH-BOOT-001',
} as const

export type AuthCode = typeof AUTH_CODES[keyof typeof AUTH_CODES]

export const AUTH_MESSAGES: Record<AuthCode, string> = {
  'AUTH-LOGIN-001':   'Email ou senha incorretos.',
  'AUTH-LOGIN-002':   'Confirme seu email antes de entrar.',
  'AUTH-LOGIN-003':   'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
  'AUTH-SIGNUP-001':  'Verifique seu email para confirmar a conta.',
  'AUTH-RESET-001':   'Se o email existir em nossa base, enviaremos o link.',
  'AUTH-RESET-002':   'Senha não atende à política mínima (≥ 10 chars, com letra, número e maiúscula).',
  'AUTH-RESET-003':   'Esta senha apareceu em vazamentos públicos. Escolha outra.',
  'AUTH-SESSION-001': 'Sua sessão expirou. Entre novamente.',
  'AUTH-CAPTCHA-001': 'Falha na verificação de segurança. Tente novamente.',
  'AUTH-BOOT-001':    '[CEPR-AUTH-02:E001] Supabase não configurado. Consulte AUTH_ACCESS_CONTRACT §20.',
}

/**
 * Mapeia a mensagem de erro do Supabase para o código canônico.
 * Anti-enumeração: erros desconhecidos retornam LOGIN-001 sem vazar detalhes.
 */
export function mapSupabaseLoginError(supabaseMessage?: string): string {
  if (!supabaseMessage) return AUTH_MESSAGES['AUTH-LOGIN-001']
  if (/email not confirmed/i.test(supabaseMessage)) return AUTH_MESSAGES['AUTH-LOGIN-002']
  if (/rate limit|too many requests/i.test(supabaseMessage)) return AUTH_MESSAGES['AUTH-LOGIN-003']
  // Qualquer outro erro (incluindo "Invalid login credentials") retorna LOGIN-001
  // para não vazar se o email existe.
  return AUTH_MESSAGES['AUTH-LOGIN-001']
}


/**
 * CEPR-AUTH-02E §11.2/§10.3 — interpretação estruturada de erros do Supabase.
 * Retorna o código canônico para que a UI possa decidir comportamento (lock 30s, redirect).
 */
export type AuthErrorCode =
  | 'LOGIN-001'
  | 'LOGIN-002'
  | 'LOGIN-003'
  | 'WEAK-PASSWORD'

export function interpretSupabaseAuthError(supabaseMessage?: string, status?: number): {
  code: AuthErrorCode
  message: string
} {
  if (status === 429 || (supabaseMessage && /rate limit|too many requests/i.test(supabaseMessage))) {
    return { code: 'LOGIN-003', message: AUTH_MESSAGES['AUTH-LOGIN-003'] }
  }
  if (supabaseMessage && /weak[_ ]?password/i.test(supabaseMessage)) {
    return { code: 'WEAK-PASSWORD', message: AUTH_MESSAGES['AUTH-RESET-002'] }
  }
  if (supabaseMessage && /email not confirmed/i.test(supabaseMessage)) {
    return { code: 'LOGIN-002', message: AUTH_MESSAGES['AUTH-LOGIN-002'] }
  }
  return { code: 'LOGIN-001', message: AUTH_MESSAGES['AUTH-LOGIN-001'] }
}

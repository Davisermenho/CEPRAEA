// CEPR-AUTH-02C §17 — Normalização e validação de email
// Toda entrada de email de usuário DEVE passar por normalizeEmail() antes de usar.

/** Regex conservador conforme §17. Não usa bibliotecas externas. */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export class InvalidEmailError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidEmailError'
  }
}

/**
 * Normaliza e valida um email.
 * Fluxo: trim → toLowerCase → comprimento (1..254 RFC 5321) → formato regex.
 *
 * @throws {InvalidEmailError} se o email for inválido ou vazio.
 * @returns email normalizado em caso de sucesso.
 */
export function normalizeEmail(input: string): string {
  const normalized = input.trim().toLowerCase()

  if (normalized.length === 0) {
    throw new InvalidEmailError('Informe seu email.')
  }
  if (normalized.length > 254) {
    throw new InvalidEmailError('Email muito longo (máximo 254 caracteres).')
  }
  if (!EMAIL_REGEX.test(normalized)) {
    throw new InvalidEmailError('Informe um email válido.')
  }

  return normalized
}

// CEPR-AUTH-02E §10.1 — Política de senha (NIST SP 800-63B)
// SHALL: ≥ 10 chars, lower + upper + digit, máx ≥ 64, espaços/Unicode permitidos.
// SHALL NOT: reusar fonte de mensagens — usar AUTH_MESSAGES['AUTH-RESET-002'].

export const PASSWORD_MIN_LENGTH = 10
export const PASSWORD_MAX_LENGTH = 72 // bcrypt cap; Supabase aceita até 72

export type PasswordPolicyViolation =
  | 'too_short'
  | 'too_long'
  | 'missing_lowercase'
  | 'missing_uppercase'
  | 'missing_digit'

export interface PasswordPolicyResult {
  valid: boolean
  violations: PasswordPolicyViolation[]
}

export function validatePasswordPolicy(password: string): PasswordPolicyResult {
  const violations: PasswordPolicyViolation[] = []
  if (password.length < PASSWORD_MIN_LENGTH) violations.push('too_short')
  if (password.length > PASSWORD_MAX_LENGTH) violations.push('too_long')
  if (!/\p{Ll}/u.test(password)) violations.push('missing_lowercase')
  if (!/\p{Lu}/u.test(password)) violations.push('missing_uppercase')
  if (!/\d/.test(password)) violations.push('missing_digit')
  return { valid: violations.length === 0, violations }
}

interface SupabaseSignupArgs {
  supabaseUrl: string
  publishableKey: string
  email: string
  password: string
}

interface SignupResponse {
  user?: {
    id?: string
  }
  msg?: string
}

const SIGNUP_RETRY_ATTEMPTS = Number(process.env.E2E_SIGNUP_RETRY_ATTEMPTS ?? '4')
const SIGNUP_RETRY_BASE_MS = Number(process.env.E2E_SIGNUP_RETRY_BASE_MS ?? '500')

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function shouldRetry(status: number, detail: string): boolean {
  if (status >= 500) return true
  return /unexpected failure|temporar|timeout|captcha/i.test(detail)
}

export function resolveCaptchaToken(): string | null {
  const token =
    process.env.E2E_TURNSTILE_TEST_TOKEN ??
    process.env.VITE_TURNSTILE_TEST_TOKEN ??
    null

  if (!token) return null
  const trimmed = token.trim()
  return trimmed.length > 0 ? trimmed : null
}

export function withCaptchaToken(payload: Record<string, unknown>) {
  const captchaToken = resolveCaptchaToken()

  if (captchaToken) {
    // Backward/forward compatibility across GoTrue payload variants.
    payload.gotrue_meta_security = { captcha_token: captchaToken }
    payload.captcha_token = captchaToken
    payload.options = { captchaToken }
  }

  return payload
}

function buildSignupPayload(email: string, password: string) {
  return withCaptchaToken({ email, password })
}

export async function signUpE2EUser(args: SupabaseSignupArgs): Promise<{ userId: string; response: SignupResponse; status: number }> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= SIGNUP_RETRY_ATTEMPTS; attempt += 1) {
    const response = await fetch(`${args.supabaseUrl}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        apikey: args.publishableKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(buildSignupPayload(args.email, args.password)),
    })

    const payload = (await response.json()) as SignupResponse
    const userId = payload.user?.id
    const detail = payload.msg ?? JSON.stringify(payload)

    if (response.ok && userId) {
      return { userId, response: payload, status: response.status }
    }

    lastError = new Error(`Signup failed (${response.status}): ${detail}`)
    const canRetry = attempt < SIGNUP_RETRY_ATTEMPTS && shouldRetry(response.status, detail)
    if (!canRetry) {
      throw lastError
    }

    const backoffMs = Math.min(SIGNUP_RETRY_BASE_MS * 2 ** (attempt - 1), 4_000)
    await sleep(backoffMs)
  }

  throw lastError ?? new Error('Signup failed: unknown error')
}

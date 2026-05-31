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

function resolveCaptchaToken(): string | null {
  const token =
    process.env.E2E_TURNSTILE_TEST_TOKEN ??
    process.env.VITE_TURNSTILE_TEST_TOKEN ??
    null

  if (!token) return null
  const trimmed = token.trim()
  return trimmed.length > 0 ? trimmed : null
}

function buildSignupPayload(email: string, password: string) {
  const captchaToken = resolveCaptchaToken()
  const payload: Record<string, unknown> = { email, password }

  if (captchaToken) {
    // Backward/forward compatibility across GoTrue payload variants.
    payload.gotrue_meta_security = { captcha_token: captchaToken }
    payload.options = { captchaToken }
  }

  return payload
}

export async function signUpE2EUser(args: SupabaseSignupArgs): Promise<{ userId: string; response: SignupResponse; status: number }> {
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

  if (!response.ok || !userId) {
    const detail = payload.msg ?? JSON.stringify(payload)
    throw new Error(`Signup failed (${response.status}): ${detail}`)
  }

  return { userId, response: payload, status: response.status }
}

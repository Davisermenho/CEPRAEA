// CEPR-AUTH-01: Structured telemetry for auth access events.
// All sinks are console.info — no external dependency required.

type AccessEvent =
  | 'auth.login.success'
  | 'auth.login.error'
  | 'auth.guard.block'
  | 'auth.guard.pass'
  | 'auth.logout'

interface AccessEventPayload {
  reason?: string
  route?: string
  teamId?: string | null
  hasRole?: boolean
  hasAthleteLink?: boolean
  role?: string | null
  error?: string
}

export function trackAccessEvent(
  event: AccessEvent,
  payload: AccessEventPayload = {}
): void {
  // eslint-disable-next-line no-console
  console.info('[cepraea:access]', event, {
    ...payload,
    ts: new Date().toISOString(),
  })
}

import { execFileSync } from 'node:child_process'

const DEFAULT_DB_URL =
  process.env.E2E_SUPABASE_DB_URL ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'
const DEFAULT_ATTEMPTS = Number(process.env.E2E_DB_RETRY_ATTEMPTS ?? '8')
const BASE_BACKOFF_MS = Number(process.env.E2E_DB_RETRY_BASE_MS ?? '350')

const RETRYABLE_DB_ERROR_PATTERNS = [
  /the database system is in recovery mode/i,
  /the database system is not accepting connections/i,
  /connection to server .* failed/i,
  /could not connect to server/i,
  /server closed the connection unexpectedly/i,
  /terminating connection due to administrator command/i,
  /timeout expired/i,
]

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function stringifyUnknown(value: unknown): string {
  if (typeof value === 'string') return value
  if (!value) return ''
  if (Buffer.isBuffer(value)) return value.toString('utf8')
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function parseErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) return stringifyUnknown(error)

  const e = error as Error & {
    stdout?: string | Buffer
    stderr?: string | Buffer
    output?: Array<string | Buffer | null | undefined>
  }

  const chunks = [
    e.message,
    stringifyUnknown(e.stdout),
    stringifyUnknown(e.stderr),
    ...(e.output ?? []).map((item) => stringifyUnknown(item)),
  ].filter(Boolean)

  return chunks.join('\n')
}

function isRetryableDbError(error: unknown): boolean {
  const message = parseErrorMessage(error)
  return RETRYABLE_DB_ERROR_PATTERNS.some((pattern) => pattern.test(message))
}

async function withDbRetry<T>(action: () => T | Promise<T>, context: string): Promise<T> {
  let attempt = 0
  let lastError: unknown = null

  while (attempt < DEFAULT_ATTEMPTS) {
    try {
      return await action()
    } catch (error) {
      lastError = error
      attempt += 1

      if (!isRetryableDbError(error) || attempt >= DEFAULT_ATTEMPTS) {
        break
      }

      const backoffMs = Math.min(BASE_BACKOFF_MS * 2 ** (attempt - 1), 4_000)
      // Help diagnosis when local DB is briefly recycling after reset/checkpoint.
      console.warn(
        `[E2E-DB-RETRY] ${context}: tentativa ${attempt}/${DEFAULT_ATTEMPTS} falhou; aguardando ${backoffMs}ms...`,
      )
      await sleep(backoffMs)
    }
  }

  throw lastError
}

export async function runSqlWithRetry(sql: string, dbUrl = DEFAULT_DB_URL): Promise<void> {
  await withDbRetry(
    () => {
      execFileSync('psql', [dbUrl, '-v', 'ON_ERROR_STOP=1'], {
        input: sql,
        stdio: ['pipe', 'inherit', 'inherit'],
      })
    },
    'runSqlWithRetry',
  )
}

export async function queryScalarWithRetry(sql: string, dbUrl = DEFAULT_DB_URL): Promise<string> {
  return withDbRetry(
    () =>
      execFileSync('psql', [dbUrl, '-t', '-A', '-c', sql], {
        encoding: 'utf8',
      }).trim(),
    'queryScalarWithRetry',
  )
}

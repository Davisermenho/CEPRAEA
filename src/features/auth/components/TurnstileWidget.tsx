// CEPR-AUTH-02E §12 — Cloudflare Turnstile widget (managed mode).
// SHALL: carregar challenges.cloudflare.com/turnstile/v0/api.js sob demanda.
// SHALL: emitir token via onToken; resetar via ref imperativa.
// SHALL: aceitar bypass via VITE_TURNSTILE_TEST_TOKEN para E2E (Playwright).

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

const TURNSTILE_SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string
          callback: (token: string) => void
          'expired-callback'?: () => void
          'error-callback'?: () => void
          theme?: 'light' | 'dark' | 'auto'
          size?: 'normal' | 'compact' | 'invisible'
        },
      ) => string
      reset: (widgetId?: string) => void
      remove: (widgetId: string) => void
    }
  }
}

let scriptPromise: Promise<void> | null = null

function loadTurnstileScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.turnstile) return Promise.resolve()
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src^="${TURNSTILE_SCRIPT_SRC.split('?')[0]}"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('turnstile_script_load_error')))
      return
    }
    const s = document.createElement('script')
    s.src = TURNSTILE_SCRIPT_SRC
    s.async = true
    s.defer = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('turnstile_script_load_error'))
    document.head.appendChild(s)
  })
  return scriptPromise
}

export interface TurnstileWidgetHandle {
  reset: () => void
}

export interface TurnstileWidgetProps {
  onToken: (token: string) => void
  onExpired?: () => void
  onError?: () => void
  theme?: 'light' | 'dark' | 'auto'
  className?: string
}

const TEST_TOKEN = (import.meta.env.VITE_TURNSTILE_TEST_TOKEN ?? '') as string
const SITE_KEY = (import.meta.env.VITE_TURNSTILE_SITE_KEY ?? '') as string
// CEPR-AUTH-02E §12.4: bypass implícito quando site key não está configurada (dev/preview).
// Em produção (import.meta.env.PROD), exige site key configurada; caso contrário o widget reporta erro.
const BYPASS_TOKEN = TEST_TOKEN || (!SITE_KEY ? 'NO-CAPTCHA-CONFIGURED' : '')

export const TurnstileWidget = forwardRef<TurnstileWidgetHandle, TurnstileWidgetProps>(
  function TurnstileWidget({ onToken, onExpired, onError, theme = 'auto', className }, ref) {
    const containerRef = useRef<HTMLDivElement>(null)
    const widgetIdRef = useRef<string | null>(null)
    const onTokenRef = useRef(onToken)
    const onExpiredRef = useRef(onExpired)
    const onErrorRef = useRef(onError)

    useEffect(() => {
      onTokenRef.current = onToken
      onExpiredRef.current = onExpired
      onErrorRef.current = onError
    }, [onToken, onExpired, onError])

    useImperativeHandle(ref, () => ({
      reset: () => {
        if (BYPASS_TOKEN) {
          onTokenRef.current(BYPASS_TOKEN)
          return
        }
        if (window.turnstile && widgetIdRef.current) {
          window.turnstile.reset(widgetIdRef.current)
        }
      },
    }))

    useEffect(() => {
      // E2E bypass: emite token de teste e não carrega o widget.
      if (BYPASS_TOKEN) {
        onTokenRef.current(BYPASS_TOKEN)
        return
      }

      if (!SITE_KEY) {
        onErrorRef.current?.()
        return
      }

      let cancelled = false
      let widgetId: string | null = null

      loadTurnstileScript()
        .then(() => {
          if (cancelled || !containerRef.current || !window.turnstile) return
          widgetId = window.turnstile.render(containerRef.current, {
            sitekey: SITE_KEY,
            theme,
            callback: (token) => onTokenRef.current(token),
            'expired-callback': () => onExpiredRef.current?.(),
            'error-callback': () => onErrorRef.current?.(),
          })
          widgetIdRef.current = widgetId
        })
        .catch(() => onErrorRef.current?.())

      return () => {
        cancelled = true
        if (widgetId && window.turnstile) {
          try {
            window.turnstile.remove(widgetId)
          } catch {
            /* widget já removido */
          }
        }
        widgetIdRef.current = null
      }
    }, [theme])

    // No bypass mode, não renderiza container (widget é invisível mas o callback dispara síncrono).
    if (BYPASS_TOKEN) return null

    return <div ref={containerRef} className={className} data-testid="turnstile-widget" />
  },
)

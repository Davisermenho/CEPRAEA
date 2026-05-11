import type { ReactNode } from 'react'
import { CepraeaLogomarca } from '@/shared/components/CepraeaLogomarca'
import './AuthLoginScreen.css'

type AuthLoginScreenProps = {
  kicker: string
  helper: string
  children: ReactNode
  firstAccess?: ReactNode
  footer?: ReactNode
}

export function AuthLoginScreen({
  kicker,
  helper,
  children,
  firstAccess,
  footer,
}: AuthLoginScreenProps) {
  return (
    <div className="auth-login-page">
      <main className="auth-login-container">
        <CepraeaLogomarca className="auth-login-logo" />

        <header>
          <h1 className="auth-login-title">Entrar</h1>
          <p className="auth-login-kicker">{kicker}</p>
          <p className="auth-login-helper">{helper}</p>
        </header>

        {children}
        {firstAccess}

        <footer className="auth-login-footer">
          {footer ?? 'PREPARAÇÃO • IDENTIDADE • COMPETIÇÃO'}
        </footer>
      </main>
    </div>
  )
}

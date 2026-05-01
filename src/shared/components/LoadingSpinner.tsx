import { CepraeaLogo } from '@/shared/components/CepraeaLogo'

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 py-16 ${className ?? ''}`}>
      <CepraeaLogo className="h-10 w-10 text-cep-lime-400 opacity-80" />
      <svg className="h-8 w-8 animate-spin text-cep-lime-400/50" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  )
}

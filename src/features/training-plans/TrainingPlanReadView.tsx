// CEPR-MVP-PR-A — Visão atleta (somente leitura) do plano publicado.
// Mostra apenas se published_at NÃO for null. Caso contrário, empty state.

import { useEffect, useState } from 'react'
import { fetchTrainingPlan } from './trainingPlanApi'
import type { TrainingPlan } from './types'

interface Props {
  trainingId: string
}

export default function TrainingPlanReadView({ trainingId }: Props) {
  const [plan, setPlan] = useState<TrainingPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchTrainingPlan(trainingId)
      .then((p) => { if (!cancelled) setPlan(p) })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : 'Falha ao carregar plano') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [trainingId])

  if (loading) {
    return (
      <section className="rounded-2xl border border-cep-purple-700 bg-cep-purple-850 p-4">
        <p className="text-xs text-cep-muted">Carregando plano…</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="rounded-2xl border border-cep-purple-700 bg-cep-purple-850 p-4">
        <p className="text-xs text-red-400">{error}</p>
      </section>
    )
  }

  if (!plan || !plan.publishedAt) {
    return (
      <section
        className="rounded-2xl border border-cep-purple-700 bg-cep-purple-850 p-4"
        data-testid="plan-read-empty"
      >
        <h3 className="text-xs font-bold text-cep-muted uppercase tracking-wide">Plano do dia</h3>
        <p className="text-sm text-cep-muted/80 mt-2">Plano ainda não publicado.</p>
      </section>
    )
  }

  return (
    <section
      className="rounded-2xl border border-cep-purple-700 bg-cep-purple-850 p-4 space-y-3"
      data-testid="plan-read-view"
    >
      <header>
        <h3 className="text-xs font-bold text-cep-muted uppercase tracking-wide">Plano do dia</h3>
        {plan.objetivoPrincipal && (
          <p className="text-sm text-cep-white mt-1">{plan.objetivoPrincipal}</p>
        )}
      </header>

      {plan.blocos.length === 0 && (
        <p className="text-xs text-cep-muted/70">Sem blocos cadastrados.</p>
      )}

      <ol className="space-y-3">
        {plan.blocos.map((block, idx) => (
          <li key={block.id} className="rounded-xl border border-cep-purple-700 bg-cep-purple-900 p-3">
            <p className="text-xs font-bold text-cep-lime-400">
              Bloco {idx + 1}
              {block.objetivoEspecifico ? ` — ${block.objetivoEspecifico}` : ''}
            </p>
            {block.exercicios.length === 0 ? (
              <p className="text-xs text-cep-muted/70 mt-2">Sem exercícios.</p>
            ) : (
              <ul className="mt-2 space-y-1.5">
                {block.exercicios.map((ex) => (
                  <li key={ex.id} className="text-sm text-cep-white">• {ex.descricao}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>

      {plan.observacoes && (
        <div className="pt-2 border-t border-cep-purple-700">
          <p className="text-xs text-cep-muted">{plan.observacoes}</p>
        </div>
      )}
    </section>
  )
}

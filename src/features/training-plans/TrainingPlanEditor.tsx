// CEPR-MVP-PR-A — Editor do Plano de treino (visão treinador).
// Composto por: objetivo principal, lista de blocos com exercícios,
// e ação de publicar/despublicar. Usa Supabase direto + SyncStatusBadge.

import { useEffect, useState, useCallback } from 'react'
import { Plus, Trash2, ChevronUp, ChevronDown, Send, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/shared/components/Button'
import { SyncStatusBadge, type SyncStatus } from '@/shared/components/SyncStatusBadge'
import {
  fetchTrainingPlan,
  createTrainingPlan,
  updateTrainingPlan,
  publishTrainingPlan,
  unpublishTrainingPlan,
  createTrainingPlanBlock,
  updateTrainingPlanBlock,
  deleteTrainingPlanBlock,
  createTrainingPlanExercise,
  updateTrainingPlanExercise,
  deleteTrainingPlanExercise,
} from './trainingPlanApi'
import type { TrainingPlan, TrainingPlanBlock, TrainingPlanExercise } from './types'

interface Props {
  trainingId: string
}

export default function TrainingPlanEditor({ trainingId }: Props) {
  const [plan, setPlan] = useState<TrainingPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('sincronizado')

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const p = await fetchTrainingPlan(trainingId)
      setPlan(p)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao carregar plano')
    } finally {
      setLoading(false)
    }
  }, [trainingId])

  useEffect(() => { void reload() }, [reload])

  // ── helpers de sync ───────────────────────────────────────────────────────
  const runSync = async <T,>(op: () => Promise<T>): Promise<T | undefined> => {
    setSyncStatus('sincronizando')
    try {
      const r = await op()
      setSyncStatus('sincronizado')
      return r
    } catch (e) {
      setSyncStatus('falha')
      setError(e instanceof Error ? e.message : 'Falha de sincronização')
      return undefined
    }
  }

  // ── ações ─────────────────────────────────────────────────────────────────
  const handleCreatePlan = async () => {
    const created = await runSync(() => createTrainingPlan({ trainingId }))
    if (created) setPlan(created)
  }

  const handleUpdateObjetivo = async (value: string) => {
    if (!plan) return
    setPlan({ ...plan, objetivoPrincipal: value })
    await runSync(() => updateTrainingPlan(plan.id, { objetivoPrincipal: value || null }))
  }

  const handleUpdateObservacoes = async (value: string) => {
    if (!plan) return
    setPlan({ ...plan, observacoes: value })
    await runSync(() => updateTrainingPlan(plan.id, { observacoes: value || null }))
  }

  const handleAddBlock = async () => {
    if (!plan) return
    const ordem = plan.blocos.length
    const created = await runSync(() => createTrainingPlanBlock({ trainingPlanId: plan.id, ordem }))
    if (created) setPlan({ ...plan, blocos: [...plan.blocos, created] })
  }

  const handleUpdateBlock = async (block: TrainingPlanBlock, patch: Partial<Pick<TrainingPlanBlock, 'objetivoEspecifico' | 'observacoes' | 'ordem'>>) => {
    if (!plan) return
    const updated = plan.blocos.map((b) => (b.id === block.id ? { ...b, ...patch } : b))
    setPlan({ ...plan, blocos: updated })
    await runSync(() => updateTrainingPlanBlock(block.id, {
      objetivoEspecifico: patch.objetivoEspecifico ?? null,
      observacoes: patch.observacoes ?? null,
      ordem: patch.ordem,
    }))
  }

  const handleDeleteBlock = async (blockId: string) => {
    if (!plan) return
    setPlan({ ...plan, blocos: plan.blocos.filter((b) => b.id !== blockId) })
    await runSync(() => deleteTrainingPlanBlock(blockId))
  }

  const handleMoveBlock = async (block: TrainingPlanBlock, direction: -1 | 1) => {
    if (!plan) return
    const idx = plan.blocos.findIndex((b) => b.id === block.id)
    const swapIdx = idx + direction
    if (swapIdx < 0 || swapIdx >= plan.blocos.length) return
    const other = plan.blocos[swapIdx]
    const newBlocos = [...plan.blocos]
    newBlocos[idx] = { ...other, ordem: idx }
    newBlocos[swapIdx] = { ...block, ordem: swapIdx }
    setPlan({ ...plan, blocos: newBlocos })
    await runSync(async () => {
      await updateTrainingPlanBlock(block.id, { ordem: swapIdx })
      await updateTrainingPlanBlock(other.id, { ordem: idx })
    })
  }

  const handleAddExercise = async (block: TrainingPlanBlock) => {
    if (!plan) return
    const ordem = block.exercicios.length
    const created = await runSync(() =>
      createTrainingPlanExercise({ blockId: block.id, ordem, descricao: 'Novo exercício' })
    )
    if (created) {
      const newBlocos = plan.blocos.map((b) =>
        b.id === block.id ? { ...b, exercicios: [...b.exercicios, created] } : b
      )
      setPlan({ ...plan, blocos: newBlocos })
    }
  }

  const handleUpdateExercise = async (
    block: TrainingPlanBlock,
    exercise: TrainingPlanExercise,
    patch: Partial<Pick<TrainingPlanExercise, 'descricao' | 'observacoes'>>
  ) => {
    if (!plan) return
    const newBlocos = plan.blocos.map((b) =>
      b.id === block.id
        ? { ...b, exercicios: b.exercicios.map((e) => (e.id === exercise.id ? { ...e, ...patch } : e)) }
        : b
    )
    setPlan({ ...plan, blocos: newBlocos })
    await runSync(() => updateTrainingPlanExercise(exercise.id, patch))
  }

  const handleDeleteExercise = async (block: TrainingPlanBlock, exerciseId: string) => {
    if (!plan) return
    const newBlocos = plan.blocos.map((b) =>
      b.id === block.id ? { ...b, exercicios: b.exercicios.filter((e) => e.id !== exerciseId) } : b
    )
    setPlan({ ...plan, blocos: newBlocos })
    await runSync(() => deleteTrainingPlanExercise(exerciseId))
  }

  const handlePublishToggle = async () => {
    if (!plan) return
    if (plan.publishedAt) {
      setPlan({ ...plan, publishedAt: null })
      await runSync(() => unpublishTrainingPlan(plan.id))
    } else {
      const publishedAt = await runSync(() => publishTrainingPlan(plan.id))
      if (publishedAt) setPlan({ ...plan, publishedAt })
    }
  }

  // ── UI ────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="mx-4 mb-4 rounded-2xl border border-cep-purple-700 bg-cep-purple-850 p-4">
        <p className="text-xs text-cep-muted">Carregando plano…</p>
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="mx-4 mb-4 rounded-2xl border border-cep-purple-700 bg-cep-purple-850 p-4 space-y-3">
        <div>
          <h2 className="text-xs font-bold text-cep-muted uppercase tracking-wide">Plano do dia</h2>
          <p className="text-xs text-cep-muted/70 mt-1">Nenhum plano criado para este treino.</p>
        </div>
        <Button size="sm" variant="secondary" onClick={handleCreatePlan} data-testid="plan-create">
          <Plus className="h-4 w-4" />
          Criar plano do dia
        </Button>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    )
  }

  return (
    <section
      className="mx-4 mb-4 rounded-2xl border border-cep-purple-700 bg-cep-purple-850 p-4 space-y-4"
      data-testid="training-plan-editor"
    >
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xs font-bold text-cep-muted uppercase tracking-wide">Plano do dia</h2>
          <p className="text-xs text-cep-muted/70 mt-1">
            {plan.publishedAt ? 'Publicado — visível para as atletas.' : 'Rascunho — apenas você vê.'}
          </p>
        </div>
        <SyncStatusBadge status={syncStatus} />
      </header>

      <div className="space-y-2">
        <label className="block text-xs font-semibold text-cep-muted">Objetivo principal</label>
        <textarea
          value={plan.objetivoPrincipal ?? ''}
          onChange={(e) => setPlan({ ...plan, objetivoPrincipal: e.target.value })}
          onBlur={(e) => handleUpdateObjetivo(e.target.value)}
          rows={2}
          placeholder="Ex.: Trabalhar transição rápida em superioridade"
          className="w-full rounded-xl bg-cep-purple-950 border border-cep-purple-700 px-3 py-2 text-sm text-cep-white"
          data-testid="plan-objetivo-principal"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-cep-muted uppercase tracking-wide">Blocos</h3>
          <Button size="sm" variant="ghost" onClick={handleAddBlock} data-testid="plan-add-block">
            <Plus className="h-4 w-4" />
            Adicionar bloco
          </Button>
        </div>

        {plan.blocos.length === 0 && (
          <p className="text-xs text-cep-muted/70">Nenhum bloco ainda.</p>
        )}

        {plan.blocos.map((block, idx) => (
          <div
            key={block.id}
            className="rounded-xl border border-cep-purple-700 bg-cep-purple-900 p-3 space-y-2"
            data-testid="plan-block"
          >
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-cep-lime-400">#{idx + 1}</span>
              <input
                value={block.objetivoEspecifico ?? ''}
                onChange={(e) => setPlan({
                  ...plan,
                  blocos: plan.blocos.map((b) => b.id === block.id ? { ...b, objetivoEspecifico: e.target.value } : b),
                })}
                onBlur={(e) => handleUpdateBlock(block, { objetivoEspecifico: e.target.value })}
                placeholder="Objetivo específico do bloco"
                className="flex-1 rounded-lg bg-cep-purple-950 border border-cep-purple-700 px-2 py-1 text-sm text-cep-white"
                data-testid="plan-block-objetivo"
              />
              <button
                type="button"
                onClick={() => handleMoveBlock(block, -1)}
                disabled={idx === 0}
                className="p-1 text-cep-muted hover:text-cep-white disabled:opacity-30"
                aria-label="Mover bloco para cima"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => handleMoveBlock(block, 1)}
                disabled={idx === plan.blocos.length - 1}
                className="p-1 text-cep-muted hover:text-cep-white disabled:opacity-30"
                aria-label="Mover bloco para baixo"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => handleDeleteBlock(block.id)}
                className="p-1 text-red-400 hover:text-red-300"
                aria-label="Excluir bloco"
                data-testid="plan-block-delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1.5 pl-4">
              {block.exercicios.map((ex) => (
                <div key={ex.id} className="flex items-center gap-1" data-testid="plan-exercise">
                  <input
                    value={ex.descricao}
                    onChange={(e) => setPlan({
                      ...plan,
                      blocos: plan.blocos.map((b) => b.id === block.id
                        ? { ...b, exercicios: b.exercicios.map((x) => x.id === ex.id ? { ...x, descricao: e.target.value } : x) }
                        : b),
                    })}
                    onBlur={(e) => handleUpdateExercise(block, ex, { descricao: e.target.value })}
                    placeholder="Descrição do exercício"
                    className="flex-1 rounded-lg bg-cep-purple-950 border border-cep-purple-700 px-2 py-1 text-sm text-cep-white"
                    data-testid="plan-exercise-descricao"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteExercise(block, ex.id)}
                    className="p-1 text-red-400 hover:text-red-300"
                    aria-label="Excluir exercício"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <Button size="sm" variant="ghost" onClick={() => handleAddExercise(block)} data-testid="plan-add-exercise">
                <Plus className="h-4 w-4" />
                Adicionar exercício
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-semibold text-cep-muted">Observações gerais</label>
        <textarea
          value={plan.observacoes ?? ''}
          onChange={(e) => setPlan({ ...plan, observacoes: e.target.value })}
          onBlur={(e) => handleUpdateObservacoes(e.target.value)}
          rows={2}
          className="w-full rounded-xl bg-cep-purple-950 border border-cep-purple-700 px-3 py-2 text-sm text-cep-white"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={plan.publishedAt ? 'secondary' : 'primary'}
          onClick={handlePublishToggle}
          data-testid="plan-publish-toggle"
        >
          {plan.publishedAt ? <EyeOff className="h-4 w-4" /> : <Send className="h-4 w-4" />}
          {plan.publishedAt ? 'Despublicar' : 'Publicar plano'}
        </Button>
        {plan.publishedAt && (
          <span className="inline-flex items-center gap-1 text-xs text-cep-lime-400">
            <Eye className="h-3 w-3" /> Publicado em {new Date(plan.publishedAt).toLocaleString('pt-BR')}
          </span>
        )}
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}
    </section>
  )
}

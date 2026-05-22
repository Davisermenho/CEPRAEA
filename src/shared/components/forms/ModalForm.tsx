import type { FormEvent, ReactNode } from 'react'
import { Modal } from '@/shared/components/Modal'
import { Button } from '@/shared/components/Button'
import { cn } from '@/lib/utils'

interface ModalFormProps {
  open: boolean
  title: string
  children: ReactNode
  onClose: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>
  loading?: boolean
  dirty?: boolean
  confirmDirtyClose?: boolean
  dirtyCloseMessage?: string
  cancelLabel?: string
  submitLabel?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  bodyClassName?: string
  footerClassName?: string
}

export function ModalForm({
  open,
  title,
  children,
  onClose,
  onSubmit,
  loading = false,
  dirty = false,
  confirmDirtyClose = false,
  dirtyCloseMessage = 'Existem alterações não salvas. Deseja descartar?',
  cancelLabel = 'Cancelar',
  submitLabel = 'Salvar',
  size = 'md',
  className,
  bodyClassName,
  footerClassName,
}: ModalFormProps) {
  const requestClose = () => {
    if (confirmDirtyClose && dirty) {
      const shouldClose = window.confirm(dirtyCloseMessage)
      if (!shouldClose) return
    }
    onClose()
  }

  return (
    <Modal open={open} onClose={requestClose} title={title} size={size}>
      <form onSubmit={onSubmit} className={cn('flex max-h-[calc(100dvh-8rem)] flex-col', className)}>
        <div className={cn('flex-1 overflow-y-auto p-4 space-y-4', bodyClassName)}>
          {children}
        </div>
        <div
          className={cn(
            'sticky bottom-0 flex gap-2 border-t border-cep-purple-800 bg-cep-purple-950/95 p-4 backdrop-blur-sm',
            footerClassName,
          )}
        >
          <Button type="button" variant="secondary" fullWidth onClick={requestClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button type="submit" fullWidth loading={loading}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

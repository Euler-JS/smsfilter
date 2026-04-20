import { Modal } from './Modal'
import { Button } from './Button'
import { useUiStore } from '../../store/uiStore'
import { t } from '../../i18n'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  variant?: 'danger' | 'primary'
  loading?: boolean
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  variant = 'danger',
  loading,
}: ConfirmDialogProps) {
  const lang = useUiStore((s) => s.language)
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="mb-6 text-sm text-text-muted">{message}</p>
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          {t(lang, 'cancel')}
        </Button>
        <Button variant={variant} onClick={onConfirm} loading={loading}>
          {confirmLabel ?? t(lang, 'confirm')}
        </Button>
      </div>
    </Modal>
  )
}

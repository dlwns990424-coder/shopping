import Button from './Button'

interface ConfirmModalProps {
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

function ConfirmModal({ message, confirmLabel = '확인', cancelLabel = '취소', onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-black/50 px-24">
      <div className="flex w-full max-w-360 flex-col gap-16 rounded-md bg-surface p-24 text-center">
        <p className="text-body-lg">{message}</p>
        <div className="mt-8 flex flex-col gap-8">
          <Button variant="primary" size="medium" className="w-full" onClick={onConfirm}>
            {confirmLabel}
          </Button>
          <Button variant="secondary" size="medium" className="w-full" onClick={onCancel}>
            {cancelLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal

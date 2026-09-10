import Button from './Button'

interface ConfirmModalProps {
  message: string
  confirmLabel?: string
  cancelLabel?: string
  confirming?: boolean
  error?: string | null
  onConfirm: () => void
  onCancel: () => void
}

function ConfirmModal({
  message,
  confirmLabel = '확인',
  cancelLabel = '취소',
  confirming = false,
  error,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-black/50 px-24">
      <div className="flex w-full max-w-360 flex-col gap-16 rounded-md bg-surface p-24 text-center">
        <p className="text-body-lg">{message}</p>
        {error && <p className="text-body-sm text-point">{error}</p>}
        <div className="mt-8 flex flex-col gap-8">
          <Button variant="primary" size="medium" className="w-full !py-8" onClick={onConfirm} disabled={confirming}>
            {confirming ? '처리 중...' : confirmLabel}
          </Button>
          <Button variant="secondary" size="medium" className="w-full !py-8" onClick={onCancel} disabled={confirming}>
            {cancelLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal

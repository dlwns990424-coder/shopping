import { useRef } from 'react'
import Button from './Button'
import { useModalA11y } from '../hooks/useModalA11y'

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
  const dialogRef = useRef<HTMLDivElement | null>(null)
  // 대부분의 사용처가 삭제·정지·로그아웃 같은 되돌리기 어려운 동작이라, 열리자마자
  // Enter를 눌러도 안전하도록 확인 버튼이 아니라 취소 버튼에 기본 포커스를 준다.
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null)

  useModalA11y(dialogRef, onCancel, true, cancelButtonRef)

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-black/50 px-24">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-message"
        className="flex w-full max-w-360 flex-col gap-16 rounded-md bg-surface p-24 text-center"
      >
        <p id="confirm-modal-message" className="text-body-lg">
          {message}
        </p>
        {error && <p className="text-body-sm text-point">{error}</p>}
        <div className="mt-8 flex flex-col gap-8">
          <Button variant="primary" size="medium" className="w-full !py-8" onClick={onConfirm} disabled={confirming}>
            {confirming ? '처리 중...' : confirmLabel}
          </Button>
          <Button
            ref={cancelButtonRef}
            variant="secondary"
            size="medium"
            className="w-full !py-8"
            onClick={onCancel}
            disabled={confirming}
          >
            {cancelLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal

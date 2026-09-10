import { useState, type ChangeEvent } from 'react'
import { X } from 'lucide-react'
import Button from './Button'
import { uploadImage } from '../utils/uploadImage'

interface ReturnRequestModalProps {
  onCancel: () => void
  onSubmit: (reason: string, detail: string, photos: string[]) => Promise<boolean>
}

const RETURN_REASONS = ['단순변심', '사이즈가 안 맞음', '상품 불량', '오배송', '기타']
const MAX_PHOTOS = 4

function ReturnRequestModal({ onCancel, onSubmit }: ReturnRequestModalProps) {
  const [reason, setReason] = useState(RETURN_REASONS[0])
  const [detail, setDetail] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePhotoSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? [])
    const remainingSlots = MAX_PHOTOS - photos.length
    const files = selected.slice(0, remainingSlots)
    e.target.value = ''
    if (files.length === 0) return

    setUploading(true)
    setError(
      selected.length > remainingSlots
        ? `사진은 최대 ${MAX_PHOTOS}장까지 첨부할 수 있어 ${selected.length - remainingSlots}장은 제외되었습니다.`
        : null,
    )
    try {
      const urls = await Promise.all(files.map((file) => uploadImage(file, 'returns')))
      setPhotos((prev) => [...prev, ...urls])
    } catch (err) {
      setError(err instanceof Error ? err.message : '사진 업로드에 실패했습니다.')
    } finally {
      setUploading(false)
    }
  }

  const removePhoto = (url: string) => {
    setPhotos((prev) => prev.filter((p) => p !== url))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const success = await onSubmit(reason, detail, photos)
      if (!success) {
        setError('반품 신청에 실패했습니다. 잠시 후 다시 시도해주세요.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const canSubmit = photos.length > 0 && !uploading && !submitting

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-black/50 px-24">
      <div className="flex w-full max-w-480 flex-col gap-16 rounded-md bg-surface p-24">
        <p className="text-h3">반품 신청</p>

        <div className="flex flex-col gap-8">
          <label className="text-body-sm text-secondary">반품 사유</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="text-body-sm rounded-sm border border-line px-12 py-8"
          >
            {RETURN_REASONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-8">
          <label className="text-body-sm text-secondary">상세 사유 (선택)</label>
          <textarea
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            rows={3}
            placeholder="상품 상태나 반품 사유를 자세히 적어주세요."
            className="text-body-sm rounded-sm border border-line px-12 py-8"
          />
        </div>

        <div className="flex flex-col gap-8">
          <label className="text-body-sm text-secondary">사진 첨부 (필수, 최대 {MAX_PHOTOS}장)</label>
          <div className="flex flex-wrap gap-8">
            {photos.map((url) => (
              <div key={url} className="relative h-72 w-72 overflow-hidden rounded-sm border border-line">
                <img src={url} alt="반품 사진" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(url)}
                  aria-label="사진 삭제"
                  className="absolute right-2 top-2 flex h-20 w-20 items-center justify-center rounded-full bg-black/60 text-surface"
                >
                  <X size={12} strokeWidth={2} />
                </button>
              </div>
            ))}
            {photos.length < MAX_PHOTOS && (
              <Button
                as="label"
                variant="secondary"
                size="small"
                className="h-72 w-72 cursor-pointer !px-0 text-caption"
                aria-disabled={uploading}
              >
                {uploading ? '업로드 중' : '사진 추가'}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handlePhotoSelect}
                  disabled={uploading}
                />
              </Button>
            )}
          </div>
        </div>

        {error && <p className="text-body-sm text-point">{error}</p>}

        <div className="mt-8 flex flex-col gap-8">
          <Button variant="primary" size="large" className="w-full" onClick={handleSubmit} disabled={!canSubmit}>
            {submitting ? '신청 중...' : '반품 신청'}
          </Button>
          <Button variant="secondary" size="large" className="w-full" onClick={onCancel} disabled={submitting}>
            취소
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ReturnRequestModal

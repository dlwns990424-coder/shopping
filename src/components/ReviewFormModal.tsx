import { useState, type ChangeEvent } from 'react'
import { X } from 'lucide-react'
import Button from './Button'
import StarRating from './StarRating'
import { uploadImage } from '../utils/uploadImage'
import { useAuth } from '../context/AuthContext'
import {
  MAX_REVIEW_HEIGHT,
  MAX_REVIEW_LENGTH,
  MAX_REVIEW_WEIGHT,
  MIN_REVIEW_HEIGHT,
  MIN_REVIEW_WEIGHT,
} from '../constants/reviewConstraints'

interface ReviewFormModalProps {
  onCancel: () => void
  onSubmit: (
    rating: number,
    content: string,
    photos: string[],
    height: number | null,
    weight: number | null,
  ) => Promise<{ success: boolean; message?: string }>
  // 상품 상세페이지에서는 이미 어떤 상품인지 화면에 나와있어 생략, 마이페이지 주문내역처럼
  // 문맥 없이 여러 상품 중 하나를 고르는 곳에서 열 때만 넘겨서 표시한다.
  productName?: string
}

const MAX_PHOTOS = 1

function ReviewFormModal({ onCancel, onSubmit, productName }: ReviewFormModalProps) {
  const { user } = useAuth()
  const [rating, setRating] = useState(5)
  const [content, setContent] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePhotoSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? [])
    const remainingSlots = MAX_PHOTOS - photos.length
    const files = selected.slice(0, remainingSlots)
    e.target.value = ''
    if (files.length === 0) return
    if (!user) {
      setError('로그인 후 리뷰 사진을 첨부할 수 있습니다.')
      return
    }

    setUploading(true)
    setError(
      selected.length > remainingSlots
        ? `사진은 최대 ${MAX_PHOTOS}장까지 첨부할 수 있어 ${selected.length - remainingSlots}장은 제외되었습니다.`
        : null,
    )
    try {
      const urls = await Promise.all(files.map((file) => uploadImage(file, `reviews/${user.id}`)))
      setPhotos((prev) => [...prev, ...urls])
    } catch (err) {
      const message = err instanceof Error ? err.message : ''
      setError(
        message.toLowerCase().includes('row-level security')
          ? '리뷰 사진 업로드 권한을 확인해주세요. 잠시 후 다시 시도해주세요.'
          : message || '사진 업로드에 실패했습니다.',
      )
    } finally {
      setUploading(false)
    }
  }

  const removePhoto = (url: string) => {
    setPhotos((prev) => prev.filter((p) => p !== url))
  }

  const handleSubmit = async () => {
    const trimmedContent = content.trim()
    if (!trimmedContent) {
      setError('리뷰 내용을 입력해주세요.')
      return
    }
    if (trimmedContent.length > MAX_REVIEW_LENGTH) {
      setError(`리뷰는 최대 ${MAX_REVIEW_LENGTH}자까지 작성할 수 있습니다.`)
      return
    }
    const heightValue = height.trim() ? Number(height) : null
    const weightValue = weight.trim() ? Number(weight) : null
    if (
      heightValue != null &&
      (!Number.isFinite(heightValue) || heightValue < MIN_REVIEW_HEIGHT || heightValue > MAX_REVIEW_HEIGHT)
    ) {
      setError(`키는 ${MIN_REVIEW_HEIGHT}~${MAX_REVIEW_HEIGHT}cm 범위로 입력해주세요.`)
      return
    }
    if (
      weightValue != null &&
      (!Number.isFinite(weightValue) || weightValue < MIN_REVIEW_WEIGHT || weightValue > MAX_REVIEW_WEIGHT)
    ) {
      setError(`몸무게는 ${MIN_REVIEW_WEIGHT}~${MAX_REVIEW_WEIGHT}kg 범위로 입력해주세요.`)
      return
    }
    setSubmitting(true)
    setError(null)
    const result = await onSubmit(rating, trimmedContent, photos, heightValue, weightValue)
    setSubmitting(false)
    if (!result.success) {
      setError(result.message ?? '리뷰 등록에 실패했습니다. 잠시 후 다시 시도해주세요.')
    }
  }

  const canSubmit = !uploading && !submitting

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-black/50 px-24">
      <div className="flex max-h-[calc(100dvh-48px)] w-full max-w-480 flex-col gap-16 overflow-y-auto rounded-md bg-surface p-24">
        <div>
          <p className="text-h3">리뷰 작성</p>
          {productName && <p className="text-body-sm mt-4 text-secondary">{productName}</p>}
        </div>

        <div className="flex flex-col gap-8">
          <label className="text-body-sm text-secondary">별점</label>
          <StarRating value={rating} size={28} onChange={setRating} />
        </div>

        <div className="flex flex-col gap-8">
          <label className="text-body-sm text-secondary">리뷰 내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={MAX_REVIEW_LENGTH}
            rows={4}
            placeholder="상품에 대한 솔직한 후기를 남겨주세요."
            className="text-body-sm rounded-sm border border-line px-12 py-8"
          />
          <p className="text-caption self-end text-secondary">
            {content.length}/{MAX_REVIEW_LENGTH}
          </p>
        </div>

        <div className="flex gap-16">
          <div className="flex flex-1 flex-col gap-8">
            <label className="text-body-sm text-secondary">키 (cm, 선택)</label>
            <input
              type="number"
              min={MIN_REVIEW_HEIGHT}
              max={MAX_REVIEW_HEIGHT}
              step="0.1"
              inputMode="decimal"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder={`${MIN_REVIEW_HEIGHT}~${MAX_REVIEW_HEIGHT}`}
              className="text-body-sm rounded-sm border border-line px-12 py-8"
            />
          </div>
          <div className="flex flex-1 flex-col gap-8">
            <label className="text-body-sm text-secondary">몸무게 (kg, 선택)</label>
            <input
              type="number"
              min={MIN_REVIEW_WEIGHT}
              max={MAX_REVIEW_WEIGHT}
              step="0.1"
              inputMode="decimal"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder={`${MIN_REVIEW_WEIGHT}~${MAX_REVIEW_WEIGHT}`}
              className="text-body-sm rounded-sm border border-line px-12 py-8"
            />
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <label className="text-body-sm text-secondary">사진 첨부 (선택, 최대 {MAX_PHOTOS}장)</label>
          <div className="flex flex-wrap gap-8">
            {photos.map((url) => (
              <div key={url} className="relative h-72 w-72 overflow-hidden rounded-sm border border-line">
                <img src={url} alt="리뷰 사진" className="h-full w-full object-cover" />
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

        {error && <p className="text-body-sm text-danger">{error}</p>}

        <div className="mt-8 flex flex-col gap-8">
          <Button variant="primary" size="large" className="w-full" onClick={handleSubmit} disabled={!canSubmit}>
            {submitting ? '등록 중...' : '리뷰 등록'}
          </Button>
          <Button variant="secondary" size="large" className="w-full" onClick={onCancel} disabled={submitting}>
            취소
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ReviewFormModal

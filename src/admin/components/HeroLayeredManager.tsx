import { useCallback, useEffect, useState, type ChangeEvent } from 'react'
import { supabase } from '../../lib/supabaseClient'
import Button from '../../components/Button'
import ImageCropModal from '../../components/ImageCropModal'
import { uploadImage } from '../../utils/uploadImage'

// 홈 히어로(태블릿+데스크톱 전용, 모바일은 기존 히어로 유지)의 신규 레이어 구성:
// 배경 사진 한 장 위에 로고/시즌라벨/"둘러보기" 텍스트 + 좌우 누끼 인물(화면 가장자리).
// 인물 2장은 배경이 투명한 PNG라 JPEG로 크롭하면 투명도가 사라지므로 PNG로 저장한다.
const KEY_PREFIX = 'home.hero_layered'
const keyFor = (field: string) => `${KEY_PREFIX}.${field}`

const BG_ASPECT = 16 / 9
const MODEL_ASPECT = 3 / 4

type ImageField = 'bg_image' | 'left_model' | 'right_model'

const IMAGE_FIELDS: { field: ImageField; label: string; aspect: number; outputType: 'image/jpeg' | 'image/png' }[] = [
  { field: 'bg_image', label: '배경', aspect: BG_ASPECT, outputType: 'image/jpeg' },
  { field: 'left_model', label: '좌측 인물 (누끼 PNG)', aspect: MODEL_ASPECT, outputType: 'image/png' },
  { field: 'right_model', label: '우측 인물 (누끼 PNG)', aspect: MODEL_ASPECT, outputType: 'image/png' },
]

interface HeroLayeredData {
  bgImage: string
  leftModel: string
  rightModel: string
  seasonLabel: string
}

const EMPTY: HeroLayeredData = { bgImage: '', leftModel: '', rightModel: '', seasonLabel: '' }

function HeroLayeredManager() {
  const [data, setData] = useState<HeroLayeredData>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingLabel, setEditingLabel] = useState(false)
  const [draftLabel, setDraftLabel] = useState('')
  const [uploadingField, setUploadingField] = useState<ImageField | null>(null)
  const [cropTarget, setCropTarget] = useState<{
    field: ImageField
    file: File
    aspect: number
    outputType: 'image/jpeg' | 'image/png'
  } | null>(null)

  const load = useCallback(async () => {
    const { data: rows, error } = await supabase.from('site_content').select('key, value').like('key', `${KEY_PREFIX}.%`)

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    const next = { ...EMPTY }
    for (const row of rows ?? []) {
      const field = row.key.slice(KEY_PREFIX.length + 1)
      if (field === 'bg_image') next.bgImage = row.value
      else if (field === 'left_model') next.leftModel = row.value
      else if (field === 'right_model') next.rightModel = row.value
      else if (field === 'season_label') next.seasonLabel = row.value
    }
    setData(next)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const startEditLabel = () => {
    setEditingLabel(true)
    setDraftLabel(data.seasonLabel)
  }

  const saveLabel = async () => {
    const { error } = await supabase.from('site_content').update({ value: draftLabel }).eq('key', keyFor('season_label'))
    if (error) {
      setError(error.message)
      return
    }
    setData((prev) => ({ ...prev, seasonLabel: draftLabel }))
    setEditingLabel(false)
  }

  const handleImageSelect = (
    field: ImageField,
    aspect: number,
    outputType: 'image/jpeg' | 'image/png',
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setCropTarget({ field, file, aspect, outputType })
  }

  const handleCropConfirm = async (blob: Blob) => {
    if (!cropTarget) return
    const { field, outputType } = cropTarget
    setCropTarget(null)
    setUploadingField(field)
    setError(null)

    try {
      const ext = outputType === 'image/png' ? 'png' : 'jpg'
      const croppedFile = new File([blob], `home-hero-layered-${field}.${ext}`, { type: outputType })
      const url = await uploadImage(croppedFile, 'content')
      const { error } = await supabase.from('site_content').update({ value: url }).eq('key', keyFor(field))
      if (error) throw error
      setData((prev) => ({
        ...prev,
        bgImage: field === 'bg_image' ? url : prev.bgImage,
        leftModel: field === 'left_model' ? url : prev.leftModel,
        rightModel: field === 'right_model' ? url : prev.rightModel,
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : '이미지 업로드에 실패했습니다.')
    } finally {
      setUploadingField(null)
    }
  }

  if (loading) return <p className="text-body-sm text-secondary">불러오는 중...</p>

  const valueFor = (field: ImageField) =>
    field === 'bg_image' ? data.bgImage : field === 'left_model' ? data.leftModel : data.rightModel

  return (
    <div className="flex flex-col gap-16 rounded-md border border-line p-16">
      <h3 className="text-body-lg font-bold">홈 히어로 (태블릿·데스크톱)</h3>
      <p className="text-caption text-secondary">
        768px 이상(태블릿+데스크톱)에서 노출되는 배경+텍스트+좌우 인물 구성입니다. 모바일은 기존 히어로를 그대로 씁니다.
      </p>
      {error && <p className="text-body-sm text-point">{error}</p>}

      <div className="flex flex-wrap gap-16">
        {IMAGE_FIELDS.map(({ field, label, aspect, outputType }) => {
          const value = valueFor(field)
          return (
            <div key={field} className="flex flex-col gap-4">
              <span className="text-caption text-secondary">{label}</span>
              {value ? (
                <img src={value} alt={label} className="h-96 w-128 rounded-sm border border-line object-cover" />
              ) : (
                <div className="flex h-96 w-128 items-center justify-center rounded-sm border border-dashed border-line">
                  <span className="text-caption text-secondary">없음</span>
                </div>
              )}
              <Button
                as="label"
                variant="secondary"
                size="small"
                className="w-fit cursor-pointer"
                aria-disabled={uploadingField === field}
              >
                {uploadingField === field ? '업로드 중...' : '이미지 변경'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageSelect(field, aspect, outputType, e)}
                  disabled={uploadingField === field}
                />
              </Button>
            </div>
          )
        })}
      </div>

      <div className="flex items-center gap-8">
        {editingLabel ? (
          <>
            <input
              value={draftLabel}
              onChange={(e) => setDraftLabel(e.target.value)}
              placeholder="예: Fall/Holiday 2026"
              className="text-body-sm flex-1 rounded-sm border border-line px-8 py-4"
            />
            <Button size="small" onClick={saveLabel}>
              저장
            </Button>
            <Button size="small" variant="secondary" onClick={() => setEditingLabel(false)}>
              취소
            </Button>
          </>
        ) : (
          <>
            <div className="flex-1">
              <span className="text-caption text-secondary">시즌 라벨</span>
              <p className="text-body-sm font-medium">{data.seasonLabel || '(없음)'}</p>
            </div>
            <button type="button" onClick={startEditLabel} className="text-body-sm text-secondary hover:text-point">
              수정
            </button>
          </>
        )}
      </div>

      {cropTarget && (
        <ImageCropModal
          file={cropTarget.file}
          aspect={cropTarget.aspect}
          outputType={cropTarget.outputType}
          onCancel={() => setCropTarget(null)}
          onConfirm={handleCropConfirm}
        />
      )}
    </div>
  )
}

export default HeroLayeredManager

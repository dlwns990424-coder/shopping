import { useCallback, useEffect, useState, type ChangeEvent } from 'react'
import { supabase } from '../../lib/supabaseClient'
import Button from '../../components/Button'
import ImageCropModal from '../../components/ImageCropModal'
import { uploadImage } from '../../utils/uploadImage'

// CATEGORY 캐러셀과 NEW ARRIVALS 사이에 노출되는 에디토리얼 서브배너 3장(sub-1~3) —
// 카드 1장당 이미지 1장(4:5) + 타이틀 + 서브타이틀. page(men/women)별로 완전히 독립된
// site_content 행(men.editorial_sub_banner.sub-N.*, women.editorial_sub_banner.sub-N.*)을 쓴다.
const IMAGE_ASPECT = 4 / 5
const SLOT_IDS = ['sub-1', 'sub-2', 'sub-3'] as const
type SlotId = (typeof SLOT_IDS)[number]

interface SlotData {
  title: string
  subtitle: string
  image: string
}

const EMPTY_SLOT: SlotData = { title: '', subtitle: '', image: '' }

interface EditorialBannerManagerProps {
  page: 'men' | 'women'
}

function SlotEditor({
  label,
  data,
  onTextSaved,
  onImageSaved,
  keyFor,
}: {
  label: string
  data: SlotData
  onTextSaved: (title: string, subtitle: string) => void
  onImageSaved: (url: string) => void
  keyFor: (field: string) => string
}) {
  const [editingText, setEditingText] = useState(false)
  const [draftTitle, setDraftTitle] = useState('')
  const [draftSubtitle, setDraftSubtitle] = useState('')
  const [uploading, setUploading] = useState(false)
  const [cropFile, setCropFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const startEditText = () => {
    setEditingText(true)
    setDraftTitle(data.title)
    setDraftSubtitle(data.subtitle)
  }

  const saveText = async () => {
    const { error: titleError } = await supabase.from('site_content').update({ value: draftTitle }).eq('key', keyFor('title'))
    const { error: subtitleError } = await supabase
      .from('site_content')
      .update({ value: draftSubtitle })
      .eq('key', keyFor('subtitle'))
    if (titleError || subtitleError) {
      setError((titleError ?? subtitleError)!.message)
      return
    }
    onTextSaved(draftTitle, draftSubtitle)
    setEditingText(false)
  }

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setCropFile(file)
  }

  const handleCropConfirm = async (blob: Blob) => {
    setCropFile(null)
    setUploading(true)
    setError(null)

    try {
      const croppedFile = new File([blob], `editorial-${keyFor('image')}.jpg`, { type: blob.type })
      const url = await uploadImage(croppedFile, 'content')
      const { error } = await supabase.from('site_content').update({ value: url }).eq('key', keyFor('image'))
      if (error) throw error
      onImageSaved(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : '이미지 업로드에 실패했습니다.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-12 rounded-sm border border-line p-12">
      <p className="text-body-sm font-medium">{label}</p>
      {error && <p className="text-body-sm text-point">{error}</p>}

      <div className="flex flex-col gap-4">
        <span className="text-caption text-secondary">이미지 (4:5)</span>
        {data.image ? (
          <img src={data.image} alt={label} className="h-160 w-128 rounded-sm border border-line object-cover" />
        ) : (
          <div className="flex h-160 w-128 items-center justify-center rounded-sm border border-dashed border-line">
            <span className="text-caption text-secondary">없음</span>
          </div>
        )}
        <Button as="label" variant="secondary" size="small" className="w-fit cursor-pointer" aria-disabled={uploading}>
          {uploading ? '업로드 중...' : '이미지 변경'}
          <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} disabled={uploading} />
        </Button>
      </div>

      {editingText ? (
        <div className="flex flex-col gap-8">
          <input
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            placeholder="타이틀"
            className="text-body-sm rounded-sm border border-line px-8 py-4"
          />
          <input
            value={draftSubtitle}
            onChange={(e) => setDraftSubtitle(e.target.value)}
            placeholder="서브타이틀"
            className="text-body-sm rounded-sm border border-line px-8 py-4"
          />
          <div className="flex gap-8">
            <Button size="small" onClick={saveText}>
              저장
            </Button>
            <Button size="small" variant="secondary" onClick={() => setEditingText(false)}>
              취소
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-8">
          <div className="flex-1">
            <p className="text-body-sm font-medium">{data.title || '(타이틀 없음)'}</p>
            <p className="text-caption text-secondary">{data.subtitle || '(서브타이틀 없음)'}</p>
          </div>
          <button type="button" onClick={startEditText} className="text-body-sm text-secondary hover:text-point">
            수정
          </button>
        </div>
      )}

      {cropFile && (
        <ImageCropModal
          file={cropFile}
          aspect={IMAGE_ASPECT}
          onCancel={() => setCropFile(null)}
          onConfirm={handleCropConfirm}
        />
      )}
    </div>
  )
}

function EditorialBannerManager({ page }: EditorialBannerManagerProps) {
  const keyPrefix = `${page}.editorial_sub_banner`
  const keyFor = (slot: SlotId, field: string) => `${keyPrefix}.${slot}.${field}`

  const [slots, setSlots] = useState<Record<SlotId, SlotData>>({
    'sub-1': EMPTY_SLOT,
    'sub-2': EMPTY_SLOT,
    'sub-3': EMPTY_SLOT,
  })
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const { data } = await supabase.from('site_content').select('key, value').like('key', `${keyPrefix}.%`)

    const next: Record<SlotId, SlotData> = {
      'sub-1': { ...EMPTY_SLOT },
      'sub-2': { ...EMPTY_SLOT },
      'sub-3': { ...EMPTY_SLOT },
    }
    for (const row of data ?? []) {
      const match = row.key.match(/^.+\.(sub-[123])\.(.+)$/)
      if (!match) continue
      const [, slot, field] = match as [string, SlotId, string]
      if (field === 'title') next[slot].title = row.value
      else if (field === 'subtitle') next[slot].subtitle = row.value
      else if (field === 'image') next[slot].image = row.value
    }
    setSlots(next)
    setLoading(false)
  }, [keyPrefix])

  useEffect(() => {
    load()
  }, [load])

  if (loading) return <p className="text-body-sm text-secondary">불러오는 중...</p>

  return (
    <div className="flex flex-col gap-16">
      <p className="text-caption text-secondary">
        CATEGORY 캐러셀과 NEW ARRIVALS 사이에 노출되는 에디토리얼 배너 2장입니다. 클릭 시 전체 성별 상품
        리스팅으로 이동합니다(목적지는 코드에 고정).
      </p>
      {SLOT_IDS.map((slot, index) => (
        <SlotEditor
          key={slot}
          label={`배너 ${index + 1}`}
          data={slots[slot]}
          keyFor={(field) => keyFor(slot, field)}
          onTextSaved={(title, subtitle) => setSlots((prev) => ({ ...prev, [slot]: { ...prev[slot], title, subtitle } }))}
          onImageSaved={(url) => setSlots((prev) => ({ ...prev, [slot]: { ...prev[slot], image: url } }))}
        />
      ))}
    </div>
  )
}

export default EditorialBannerManager

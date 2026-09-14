import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react'
import { ChevronDown, GripVertical } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import Button from '../../components/Button'
import ImageCropModal from '../../components/ImageCropModal'
import { uploadImage } from '../../utils/uploadImage'
import { CATEGORY_TABS, SUB_CATEGORIES } from '../../constants/categoryFilters'

// EventBannerManager(홈 이벤트배너)와 거의 같은 구조지만, 여기는 이미 페이지(men/women)가
// 정해진 상태라 gender 필드가 필요 없고, 대신 카드에 제목+서브타이틀 두 줄이 들어가서
// subtitle 필드가 추가로 있다. 화면 크기와 무관하게 고정 비율 1장(세로로 좁은 카드).
const BANNER_ASPECT = 4 / 5

interface EditorialBannerManagerProps {
  page: 'men' | 'women'
  label: string
}

interface BannerData {
  id: string
  title: string
  subtitle: string
  image: string
  category: string
  sub: string
  order: number
}

interface RawBanner {
  id: string
  title?: string
  subtitle?: string
  image?: string
  category?: string
  sub?: string
  order?: number
}

function EditorialBannerManager({ page, label }: EditorialBannerManagerProps) {
  const keyPrefix = `${page}.editorial_sub_banner`
  const keyFor = (id: string, field: string) => `${keyPrefix}.${id}.${field}`

  const [banners, setBanners] = useState<BannerData[]>([])
  const [order, setOrder] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const dragSlotsRef = useRef<number[]>([])
  const [editingTextId, setEditingTextId] = useState<string | null>(null)
  const [draftTitle, setDraftTitle] = useState('')
  const [draftSubtitle, setDraftSubtitle] = useState('')
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [cropTarget, setCropTarget] = useState<{ id: string; file: File } | null>(null)

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('site_content').select('key, value').like('key', `${keyPrefix}.%`)

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    const byId = new Map<string, RawBanner>()

    for (const row of data ?? []) {
      const parts = row.key.split('.')
      const id = parts[2]
      const field = parts[3]
      if (!id || !field) continue

      const entry: RawBanner = byId.get(id) ?? { id }
      if (field === 'order') entry.order = Number(row.value) || 0
      else if (field === 'category') entry.category = row.value
      else if (field === 'sub') entry.sub = row.value
      else if (field === 'title') entry.title = row.value
      else if (field === 'subtitle') entry.subtitle = row.value
      else if (field === 'image') entry.image = row.value
      byId.set(id, entry)
    }

    const list: BannerData[] = Array.from(byId.values()).map((entry) => ({
      id: entry.id,
      title: entry.title ?? '',
      subtitle: entry.subtitle ?? '',
      image: entry.image ?? '',
      category: entry.category ?? 'all',
      sub: entry.sub ?? '',
      order: entry.order ?? 0,
    }))

    setBanners(list)
    setOrder([...list].sort((a, b) => a.order - b.order).map((banner) => banner.id))
    setLoading(false)
  }, [keyPrefix])

  useEffect(() => {
    load()
  }, [load])

  const byId = new Map(banners.map((banner) => [banner.id, banner]))
  const sorted = order.map((id) => byId.get(id)).filter((banner): banner is BannerData => !!banner)

  const updateField = async (id: string, field: 'category' | 'sub', value: string) => {
    const { error } = await supabase.from('site_content').update({ value }).eq('key', keyFor(id, field))
    if (error) {
      setError(error.message)
      return
    }
    setBanners((prev) => prev.map((banner) => (banner.id === id ? { ...banner, [field]: value } : banner)))
  }

  const handleCategoryChange = (id: string, value: string) => {
    updateField(id, 'category', value)
    updateField(id, 'sub', '')
  }

  const startEditText = (banner: BannerData) => {
    setEditingTextId(banner.id)
    setDraftTitle(banner.title)
    setDraftSubtitle(banner.subtitle)
  }

  const saveText = async (id: string) => {
    const { error: titleError } = await supabase
      .from('site_content')
      .update({ value: draftTitle })
      .eq('key', keyFor(id, 'title'))
    const { error: subtitleError } = await supabase
      .from('site_content')
      .update({ value: draftSubtitle })
      .eq('key', keyFor(id, 'subtitle'))
    if (titleError || subtitleError) {
      setError((titleError ?? subtitleError)!.message)
      return
    }
    setBanners((prev) =>
      prev.map((banner) => (banner.id === id ? { ...banner, title: draftTitle, subtitle: draftSubtitle } : banner)),
    )
    setEditingTextId(null)
  }

  const handleImageSelect = (id: string, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setCropTarget({ id, file })
  }

  const handleCropConfirm = async (blob: Blob) => {
    if (!cropTarget) return
    const { id } = cropTarget
    setCropTarget(null)
    setUploadingId(id)
    setError(null)

    try {
      const croppedFile = new File([blob], `${page}-editorial-sub-${id}.jpg`, { type: blob.type })
      const url = await uploadImage(croppedFile, 'content')
      const { error } = await supabase.from('site_content').update({ value: url }).eq('key', keyFor(id, 'image'))
      if (error) throw error
      setBanners((prev) => prev.map((banner) => (banner.id === id ? { ...banner, image: url } : banner)))
    } catch (err) {
      setError(err instanceof Error ? err.message : '이미지 업로드에 실패했습니다.')
    } finally {
      setUploadingId(null)
    }
  }

  const handleDragStart = (id: string) => {
    setDraggedId(id)
    dragSlotsRef.current = sorted.map((banner) => banner.order)
  }

  const handleDragEnter = (targetId: string) => {
    if (!draggedId || draggedId === targetId) return

    setOrder((prev) => {
      const fromIndex = prev.indexOf(draggedId)
      const toIndex = prev.indexOf(targetId)
      if (fromIndex === -1 || toIndex === -1) return prev

      const next = [...prev]
      const [movedId] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, movedId)
      return next
    })
  }

  const handleDragEnd = async () => {
    const sourceId = draggedId
    setDraggedId(null)
    const slots = dragSlotsRef.current
    dragSlotsRef.current = []
    if (!sourceId) return

    const updates = order
      .map((id, index) => ({ id, order: slots[index] }))
      .filter((update) => update.order !== byId.get(update.id)?.order)

    if (updates.length === 0) return

    const results = await Promise.all(
      updates.map((update) =>
        supabase.from('site_content').update({ value: String(update.order) }).eq('key', keyFor(update.id, 'order')),
      ),
    )
    const failed = results.find((result) => result.error)
    if (failed?.error) setError(failed.error.message)

    setBanners((prev) =>
      prev.map((banner) => {
        const updated = updates.find((update) => update.id === banner.id)
        return updated ? { ...banner, order: updated.order } : banner
      }),
    )
  }

  if (loading) return <p className="text-body-sm text-secondary">불러오는 중...</p>

  return (
    <div className="flex flex-col gap-16 rounded-md border border-line p-16">
      <h3 className="text-body-lg font-bold">{label} 에디토리얼 서브 배너</h3>
      <p className="text-caption text-secondary">행을 드래그하면 노출되는 순서를 바꿀 수 있습니다</p>
      {error && <p className="text-body-sm text-point">{error}</p>}

      <div className="flex flex-col gap-8">
        {sorted.map((banner) => {
          const subOptions = SUB_CATEGORIES[banner.category] ?? []

          return (
            <div
              key={banner.id}
              onDragOver={(e) => e.preventDefault()}
              onDragEnter={() => handleDragEnter(banner.id)}
              className={`flex flex-col gap-12 rounded-sm border border-line p-12 transition-opacity duration-150 md:flex-row md:items-start ${
                draggedId === banner.id ? 'opacity-40' : ''
              }`}
            >
              <div className="flex items-start gap-8">
                <span
                  draggable
                  onDragStart={() => handleDragStart(banner.id)}
                  onDragEnd={handleDragEnd}
                  className="mt-4 inline-flex cursor-grab text-secondary active:cursor-grabbing"
                >
                  <GripVertical size={16} strokeWidth={1.5} />
                </span>

                {banner.image ? (
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="h-80 w-64 rounded-sm border border-line object-cover"
                  />
                ) : (
                  <div className="flex h-80 w-64 items-center justify-center rounded-sm border border-dashed border-line">
                    <span className="text-caption text-secondary">없음</span>
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col gap-8">
                {editingTextId === banner.id ? (
                  <div className="flex flex-col gap-8">
                    <input
                      value={draftTitle}
                      onChange={(e) => setDraftTitle(e.target.value)}
                      placeholder="제목"
                      className="text-body-sm rounded-sm border border-line px-8 py-4"
                    />
                    <input
                      value={draftSubtitle}
                      onChange={(e) => setDraftSubtitle(e.target.value)}
                      placeholder="서브타이틀"
                      className="text-body-sm rounded-sm border border-line px-8 py-4"
                    />
                    <div className="flex gap-8">
                      <Button size="small" onClick={() => saveText(banner.id)}>
                        저장
                      </Button>
                      <Button size="small" variant="secondary" onClick={() => setEditingTextId(null)}>
                        취소
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-8">
                    <div className="flex-1">
                      <p className="text-body-sm font-medium">{banner.title || '(제목 없음)'}</p>
                      <p className="text-caption text-secondary">{banner.subtitle || '(서브타이틀 없음)'}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => startEditText(banner)}
                      className="text-body-sm text-secondary hover:text-point"
                    >
                      수정
                    </button>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-8">
                  <Button
                    as="label"
                    variant="secondary"
                    size="small"
                    className="cursor-pointer"
                    aria-disabled={uploadingId === banner.id}
                  >
                    {uploadingId === banner.id ? '업로드 중...' : '이미지 변경'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageSelect(banner.id, e)}
                      disabled={uploadingId === banner.id}
                    />
                  </Button>

                  <div className="relative">
                    <select
                      value={banner.category}
                      onChange={(e) => handleCategoryChange(banner.id, e.target.value)}
                      className="text-body-sm appearance-none rounded-sm border border-line py-6 pl-10 pr-28 text-primary"
                    >
                      {CATEGORY_TABS.map((tab) => (
                        <option key={tab.id} value={tab.id}>
                          {tab.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      strokeWidth={1.5}
                      className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 text-secondary"
                    />
                  </div>

                  {subOptions.length > 0 && (
                    <div className="relative">
                      <select
                        value={banner.sub}
                        onChange={(e) => updateField(banner.id, 'sub', e.target.value)}
                        className="text-body-sm appearance-none rounded-sm border border-line py-6 pl-10 pr-28 text-primary"
                      >
                        <option value="">전체</option>
                        {subOptions.map((sub) => (
                          <option key={sub} value={sub}>
                            {sub}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={14}
                        strokeWidth={1.5}
                        className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 text-secondary"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {cropTarget && (
        <ImageCropModal
          file={cropTarget.file}
          aspect={BANNER_ASPECT}
          onCancel={() => setCropTarget(null)}
          onConfirm={handleCropConfirm}
        />
      )}
    </div>
  )
}

export default EditorialBannerManager

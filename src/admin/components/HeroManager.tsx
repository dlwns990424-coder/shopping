import { useCallback, useEffect, useState, type ChangeEvent } from 'react'
import { supabase } from '../../lib/supabaseClient'
import Button from '../../components/Button'
import ConfirmModal from '../../components/ConfirmModal'
import ImageCropModal from '../../components/ImageCropModal'
import { PRODUCT_CATEGORIES, SUB_CATEGORIES } from '../../constants/categoryFilters'
import { buildEditorialLink, type EditorialDestination } from '../../utils/editorialLink'
import { uploadImage } from '../../utils/uploadImage'

type HeroImageField = 'image_mobile' | 'image_tablet' | 'image_desktop'
type PreviewMode = 'mobile' | 'tablet' | 'desktop'

interface HeroData {
  title: string
  subtitle: string
  destination: EditorialDestination
  category: string
  subcategory: string
  imageMobile: string
  imageTablet: string
  imageDesktop: string
}

interface HeroManagerProps {
  page: 'men' | 'women'
}

interface CropConfig {
  field: HeroImageField
  dataField: 'imageMobile' | 'imageTablet' | 'imageDesktop'
  label: string
  aspect: number
  recommendedWidth: number
  recommendedHeight: number
  previewClass: string
  safeZoneWidthRatio: number
  safeZoneHeightRatio: number
  topDangerZoneRatio?: number
  textZone: { left: number; top: number; width: number; height: number }
}

// 히어로는 화면 크기에 따라 실제로 잘리는 비율이 크게 달라서 모바일/태블릿/데스크톱 이미지를
// 따로 받는다(예전 ContentManage.tsx의 HERO_CROP_SETTINGS를 그대로 이전).
const DESKTOP_SCREEN_ASPECT = 16 / 9
const CROP_CONFIGS: Record<PreviewMode, CropConfig> = {
  mobile: {
    field: 'image_mobile',
    dataField: 'imageMobile',
    label: '모바일 · 3:4',
    aspect: 3 / 4,
    recommendedWidth: 1200,
    recommendedHeight: 1600,
    previewClass: 'aspect-[3/4] max-w-[360px]',
    safeZoneWidthRatio: 0.9,
    safeZoneHeightRatio: 0.86,
    textZone: { left: 0.05, top: 0.55, width: 0.9, height: 0.25 },
  },
  tablet: {
    field: 'image_tablet',
    dataField: 'imageTablet',
    label: '태블릿 · 1:1',
    aspect: 1,
    recommendedWidth: 1600,
    recommendedHeight: 1600,
    previewClass: 'aspect-square max-w-[480px]',
    safeZoneWidthRatio: 0.85,
    safeZoneHeightRatio: 0.82,
    topDangerZoneRatio: 0.2,
    textZone: { left: 0.04, top: 0.55, width: 0.68, height: 0.25 },
  },
  desktop: {
    field: 'image_desktop',
    dataField: 'imageDesktop',
    label: '데스크톱 기준 · 16:9',
    aspect: DESKTOP_SCREEN_ASPECT,
    recommendedWidth: 1920,
    recommendedHeight: 1080,
    previewClass: 'aspect-video max-w-full',
    // 실제 화면은 4:3~울트라와이드까지 달라진다. 중앙 70%는 object-cover의 추가 잘림을
    // 고려해 얼굴과 핵심 피사체를 두는 공통 안전 영역으로 사용한다.
    safeZoneWidthRatio: 0.7,
    safeZoneHeightRatio: 0.7,
    topDangerZoneRatio: 0.2,
    textZone: { left: 0.08, top: 0.55, width: 0.55, height: 0.25 },
  },
}

const DEFAULT_DATA: HeroData = {
  title: '',
  subtitle: '',
  destination: 'men',
  category: 'all',
  subcategory: '',
  imageMobile: '',
  imageTablet: '',
  imageDesktop: '',
}

const FIELD_META = {
  title: { label: '타이틀', order: 300 },
  subtitle: { label: '설명', order: 301 },
  link_destination: { label: '클릭 시 이동 페이지', order: 302 },
  link_category: { label: '클릭 시 이동 카테고리', order: 303 },
  link_subcategory: { label: '클릭 시 이동 세부 카테고리', order: 304 },
  image_mobile: { label: '모바일 이미지', order: 305 },
  image_tablet: { label: '태블릿 이미지', order: 306 },
  image_desktop: { label: '데스크톱 이미지', order: 307 },
} as const

function HeroManager({ page }: HeroManagerProps) {
  const keyPrefix = `${page}.hero`
  const pageLabel = page === 'men' ? 'MEN' : 'WOMEN'
  const pageDefaultData = { ...DEFAULT_DATA, destination: page }
  const [data, setData] = useState<HeroData>(pageDefaultData)
  const [draft, setDraft] = useState<HeroData>(pageDefaultData)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingField, setUploadingField] = useState<HeroImageField | null>(null)
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop')
  const [cropTarget, setCropTarget] = useState<{ file: File; config: CropConfig } | null>(null)
  const [removeTarget, setRemoveTarget] = useState<CropConfig | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const rowFor = useCallback(
    (field: keyof typeof FIELD_META, value: string) => ({
      key: `${keyPrefix}.${field}`,
      page,
      label: `${pageLabel} 히어로 ${FIELD_META[field].label}`,
      value,
      display_order: FIELD_META[field].order + (page === 'women' ? 20 : 0),
    }),
    [keyPrefix, page, pageLabel],
  )

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    const keys = Object.keys(FIELD_META).map((field) => `${keyPrefix}.${field}`)
    const { data: rows, error: loadError } = await supabase
      .from('site_content')
      .select('key, value')
      .in('key', keys)

    if (loadError) {
      setError(loadError.message)
      setLoading(false)
      return
    }

    const values = new Map((rows ?? []).map((row) => [row.key, row.value]))
    const next: HeroData = {
      title: values.get(`${keyPrefix}.title`) ?? '',
      subtitle: values.get(`${keyPrefix}.subtitle`) ?? '',
      destination: (values.get(`${keyPrefix}.link_destination`) as EditorialDestination | undefined) ?? page,
      category: values.get(`${keyPrefix}.link_category`) || 'all',
      subcategory: values.get(`${keyPrefix}.link_subcategory`) ?? '',
      imageMobile: values.get(`${keyPrefix}.image_mobile`) ?? '',
      imageTablet: values.get(`${keyPrefix}.image_tablet`) ?? '',
      imageDesktop: values.get(`${keyPrefix}.image_desktop`) ?? '',
    }
    setData(next)
    setDraft(next)
    setLoading(false)
  }, [keyPrefix, page])

  useEffect(() => {
    load()
  }, [load])

  const saveSettings = async () => {
    const title = draft.title.trim()
    const subtitle = draft.subtitle.trim()
    if (!title) {
      setError('타이틀을 입력해주세요.')
      return
    }
    if (title.length > 80) {
      setError('타이틀은 최대 80자까지 입력할 수 있습니다.')
      return
    }
    if (subtitle.length > 140) {
      setError('설명은 최대 140자까지 입력할 수 있습니다.')
      return
    }

    setSaving(true)
    setError(null)
    setSaved(false)
    const rows = [
      rowFor('title', title),
      rowFor('subtitle', subtitle),
      rowFor('link_destination', draft.destination),
      rowFor('link_category', draft.category),
      rowFor('link_subcategory', draft.category === 'all' ? '' : draft.subcategory),
    ]
    const { error: saveError } = await supabase.from('site_content').upsert(rows, { onConflict: 'key' })
    setSaving(false)
    if (saveError) {
      setError(saveError.message)
      return
    }

    const next = { ...draft, title, subtitle }
    setData(next)
    setDraft(next)
    setSaved(true)
  }

  const handleImageSelect = (config: CropConfig, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file) setCropTarget({ file, config })
  }

  const saveImageValue = async (config: CropConfig, value: string) => {
    const { error: saveError } = await supabase
      .from('site_content')
      .upsert(rowFor(config.field, value), { onConflict: 'key' })
    if (saveError) throw saveError
    setData((current) => ({ ...current, [config.dataField]: value }))
    setDraft((current) => ({ ...current, [config.dataField]: value }))
  }

  const handleCropConfirm = async (blob: Blob) => {
    if (!cropTarget) return
    const { config } = cropTarget
    setCropTarget(null)
    setUploadingField(config.field)
    setError(null)
    setSaved(false)

    try {
      const file = new File([blob], `${page}-hero-${config.field}.jpg`, { type: blob.type })
      const url = await uploadImage(file, 'content')
      await saveImageValue(config, url)
      setSaved(true)
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : '이미지 업로드에 실패했습니다.')
    } finally {
      setUploadingField(null)
    }
  }

  const confirmRemoveImage = async () => {
    if (!removeTarget) return
    const config = removeTarget
    setRemoveTarget(null)
    setUploadingField(config.field)
    setError(null)
    try {
      await saveImageValue(config, '')
      setSaved(true)
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : '이미지 제거에 실패했습니다.')
    } finally {
      setUploadingField(null)
    }
  }

  if (loading) return <p className="text-body-sm text-secondary">불러오는 중...</p>

  const previewConfig = CROP_CONFIGS[previewMode]
  const previewImage = draft[previewConfig.dataField] || draft.imageDesktop || draft.imageTablet || draft.imageMobile
  const subcategoryOptions = draft.category === 'all' ? [] : (SUB_CATEGORIES[draft.category] ?? [])
  const previewHref = buildEditorialLink({
    destination: draft.destination,
    category: draft.category,
    subcategory: draft.subcategory,
  })

  return (
    <div className="flex flex-col gap-20 rounded-sm border border-line p-16 lg:p-20">
      <div className="flex flex-col gap-4">
        <p className="text-body-sm font-medium">{pageLabel} 히어로</p>
        <p className="text-caption text-secondary">
          페이지 최상단 배너입니다. 버튼 없이 섹션 전체를 클릭하면 아래 설정한 경로로 이동합니다. 저장 후
          사용자 페이지를 새로고침하면 반영됩니다.
        </p>
      </div>

      {error && <p className="text-body-sm text-danger">{error}</p>}
      {saved && <p className="text-body-sm text-secondary">저장되었습니다.</p>}

      <div className="flex flex-wrap gap-8">
        {(Object.keys(CROP_CONFIGS) as PreviewMode[]).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setPreviewMode(mode)}
            className={`rounded-sm border px-12 py-6 text-body-sm ${
              previewMode === mode ? 'border-primary bg-primary text-surface' : 'border-line text-secondary'
            }`}
          >
            {CROP_CONFIGS[mode].label}
          </button>
        ))}
      </div>

      <div className={`relative w-full overflow-hidden rounded-sm bg-surface-muted ${previewConfig.previewClass}`}>
        {previewImage ? (
          <img src={previewImage} alt="" className="absolute inset-0 h-full w-full object-cover object-center" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-body-sm text-secondary">이미지 없음</div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 z-10 p-16 text-surface md:p-24">
          <p className="font-display whitespace-pre-line text-[22px] font-medium leading-[1.15] tracking-[0.025em] md:text-[28px]">
            {draft.title || '타이틀'}
          </p>
          {draft.subtitle && <p className="mt-8 whitespace-pre-line text-[16px] leading-[1.6] text-surface">{draft.subtitle}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-16 lg:grid-cols-3">
        {(Object.keys(CROP_CONFIGS) as PreviewMode[]).map((mode) => {
          const config = CROP_CONFIGS[mode]
          const image = draft[config.dataField]
          const uploading = uploadingField === config.field
          return (
            <div key={mode} className="flex flex-col gap-8 rounded-sm border border-line p-12">
              <div>
                <p className="text-body-sm font-medium">{config.label}</p>
                <p className="text-caption text-secondary">
                  권장 {config.recommendedWidth}×{config.recommendedHeight}px 이상
                </p>
              </div>
              {image ? (
                <img src={image} alt={`${config.label} 미리보기`} className="aspect-[4/3] w-full bg-surface-muted object-cover" />
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center border border-dashed border-line text-caption text-secondary">
                  등록된 이미지 없음
                </div>
              )}
              <div className="flex flex-wrap gap-8">
                <Button as="label" variant="secondary" size="small" className="cursor-pointer" aria-disabled={uploading}>
                  {uploading ? '처리 중...' : image ? '이미지 변경' : '이미지 등록'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={(event) => handleImageSelect(config, event)}
                  />
                </Button>
                {image && (
                  <Button variant="secondary" size="small" disabled={uploading} onClick={() => setRemoveTarget(config)}>
                    제거
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
        <label className="flex flex-col gap-6 md:col-span-2">
          <span className="text-body-sm text-secondary">타이틀 (최대 80자, 줄바꿈 가능)</span>
          <textarea
            value={draft.title}
            maxLength={80}
            rows={2}
            onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
            className="text-body-sm rounded-sm border border-line px-12 py-8"
          />
        </label>
        <label className="flex flex-col gap-6 md:col-span-2">
          <span className="text-body-sm text-secondary">설명 (최대 140자, 줄바꿈 가능)</span>
          <textarea
            value={draft.subtitle}
            maxLength={140}
            rows={2}
            onChange={(event) => setDraft((current) => ({ ...current, subtitle: event.target.value }))}
            className="text-body-sm rounded-sm border border-line px-12 py-8"
          />
        </label>
        <fieldset className="grid grid-cols-1 gap-12 rounded-sm border border-line p-12 md:col-span-2 md:grid-cols-3">
          <legend className="px-4 text-body-sm font-medium">클릭 시 이동 설정</legend>
          <label className="flex flex-col gap-6">
            <span className="text-body-sm text-secondary">이동 페이지</span>
            <select
              value={draft.destination}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  destination: event.target.value as EditorialDestination,
                }))
              }
              className="text-body-sm h-40 rounded-sm border border-line bg-surface px-12"
            >
              <option value="men">MEN</option>
              <option value="women">WOMEN</option>
              <option value="all">전체 상품</option>
            </select>
          </label>
          <label className="flex flex-col gap-6">
            <span className="text-body-sm text-secondary">대분류</span>
            <select
              value={draft.category}
              onChange={(event) =>
                setDraft((current) => ({ ...current, category: event.target.value, subcategory: '' }))
              }
              className="text-body-sm h-40 rounded-sm border border-line bg-surface px-12"
            >
              <option value="all">전체 상품</option>
              {PRODUCT_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-6">
            <span className="text-body-sm text-secondary">세부 카테고리</span>
            <select
              value={draft.subcategory}
              disabled={draft.category === 'all'}
              onChange={(event) => setDraft((current) => ({ ...current, subcategory: event.target.value }))}
              className="text-body-sm h-40 rounded-sm border border-line bg-surface px-12 disabled:bg-surface-muted disabled:text-disabled"
            >
              <option value="">전체</option>
              {subcategoryOptions.map((subcategory) => (
                <option key={subcategory} value={subcategory}>
                  {subcategory}
                </option>
              ))}
            </select>
          </label>
          <p className="text-caption break-all text-secondary md:col-span-3">
            이동 경로: {previewHref}
          </p>
        </fieldset>
      </div>

      <div className="flex flex-wrap gap-8">
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? '저장 중...' : '문구·이동 설정 저장'}
        </Button>
        <Button variant="secondary" onClick={() => setDraft(data)} disabled={saving}>
          변경 취소
        </Button>
      </div>

      {cropTarget && (
        <ImageCropModal
          file={cropTarget.file}
          aspect={cropTarget.config.aspect}
          targetLabel={cropTarget.config.label}
          recommendedWidth={cropTarget.config.recommendedWidth}
          recommendedHeight={cropTarget.config.recommendedHeight}
          safeZoneWidthRatio={cropTarget.config.safeZoneWidthRatio}
          safeZoneHeightRatio={cropTarget.config.safeZoneHeightRatio}
          topDangerZoneRatio={cropTarget.config.topDangerZoneRatio}
          textZone={cropTarget.config.textZone}
          onCancel={() => setCropTarget(null)}
          onConfirm={handleCropConfirm}
        />
      )}

      {removeTarget && (
        <ConfirmModal
          message={`${removeTarget.label} 이미지를 제거할까요?`}
          confirmLabel="제거"
          onConfirm={confirmRemoveImage}
          onCancel={() => setRemoveTarget(null)}
        />
      )}
    </div>
  )
}

export default HeroManager

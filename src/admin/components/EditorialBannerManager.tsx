import { useCallback, useEffect, useState, type ChangeEvent } from 'react'
import { supabase } from '../../lib/supabaseClient'
import Button from '../../components/Button'
import ConfirmModal from '../../components/ConfirmModal'
import ImageCropModal from '../../components/ImageCropModal'
import { PRODUCT_CATEGORIES, SUB_CATEGORIES } from '../../constants/categoryFilters'
import { buildEditorialLink, type EditorialDestination } from '../../utils/editorialLink'
import { uploadImage } from '../../utils/uploadImage'

type EditorialImageField = 'image_mobile' | 'image_tablet' | 'image_desktop'
type PreviewMode = 'mobile' | 'tablet' | 'desktop'

interface EditorialBannerData {
  title: string
  subtitle: string
  buttonLabel: string
  destination: EditorialDestination
  category: string
  subcategory: string
  enabled: boolean
  imageMobile: string
  imageTablet: string
  imageDesktop: string
}

interface EditorialBannerManagerProps {
  page: 'men' | 'women'
}

interface CropConfig {
  field: EditorialImageField
  dataField: 'imageMobile' | 'imageTablet' | 'imageDesktop'
  label: string
  aspect: number
  recommendedWidth: number
  recommendedHeight: number
  previewClass: string
  safeZoneWidthRatio: number
  safeZoneHeightRatio: number
  textZone: { left: number; top: number; width: number; height: number }
}

const CROP_CONFIGS: Record<PreviewMode, CropConfig> = {
  mobile: {
    field: 'image_mobile',
    dataField: 'imageMobile',
    label: '모바일 · 4:5',
    aspect: 4 / 5,
    recommendedWidth: 1200,
    recommendedHeight: 1500,
    previewClass: 'aspect-[4/5] max-w-[360px]',
    safeZoneWidthRatio: 0.86,
    safeZoneHeightRatio: 0.84,
    textZone: { left: 0.06, top: 0.58, width: 0.88, height: 0.28 },
  },
  tablet: {
    field: 'image_tablet',
    dataField: 'imageTablet',
    label: '태블릿 · 4:3',
    aspect: 4 / 3,
    recommendedWidth: 1600,
    recommendedHeight: 1200,
    previewClass: 'aspect-[4/3] max-w-[640px]',
    safeZoneWidthRatio: 0.84,
    safeZoneHeightRatio: 0.82,
    textZone: { left: 0.06, top: 0.58, width: 0.7, height: 0.28 },
  },
  desktop: {
    field: 'image_desktop',
    dataField: 'imageDesktop',
    label: '데스크톱 · 12:5',
    aspect: 12 / 5,
    recommendedWidth: 1920,
    recommendedHeight: 800,
    previewClass: 'aspect-[12/5] max-w-full',
    safeZoneWidthRatio: 0.76,
    safeZoneHeightRatio: 0.82,
    textZone: { left: 0.07, top: 0.56, width: 0.56, height: 0.3 },
  },
}

const DEFAULT_DATA: EditorialBannerData = {
  title: 'THE NEW TAILORING',
  subtitle: '',
  buttonLabel: '컬렉션 보기',
  destination: 'men',
  category: 'all',
  subcategory: '',
  enabled: false,
  imageMobile: '',
  imageTablet: '',
  imageDesktop: '',
}

const FIELD_META = {
  title: { label: '타이틀', order: 410 },
  subtitle: { label: '설명', order: 411 },
  button_label: { label: '버튼 문구', order: 412 },
  link_destination: { label: '버튼 이동 페이지', order: 413 },
  link_category: { label: '버튼 이동 카테고리', order: 414 },
  link_subcategory: { label: '버튼 이동 세부 카테고리', order: 415 },
  enabled: { label: '노출 여부', order: 416 },
  image_mobile: { label: '모바일 이미지', order: 417 },
  image_tablet: { label: '태블릿 이미지', order: 418 },
  image_desktop: { label: '데스크톱 이미지', order: 419 },
} as const

function EditorialBannerManager({ page }: EditorialBannerManagerProps) {
  const keyPrefix = `${page}.editorial_banner`
  const pageLabel = page === 'men' ? 'MEN' : 'WOMEN'
  const pageDefaultData = { ...DEFAULT_DATA, destination: page }
  const [data, setData] = useState<EditorialBannerData>(pageDefaultData)
  const [draft, setDraft] = useState<EditorialBannerData>(pageDefaultData)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingField, setUploadingField] = useState<EditorialImageField | null>(null)
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop')
  const [cropTarget, setCropTarget] = useState<{ file: File; config: CropConfig } | null>(null)
  const [removeTarget, setRemoveTarget] = useState<CropConfig | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const rowFor = useCallback(
    (field: keyof typeof FIELD_META, value: string) => ({
      key: `${keyPrefix}.${field}`,
      page,
      label: `${pageLabel} 에디토리얼 ${FIELD_META[field].label}`,
      value,
      display_order: FIELD_META[field].order + (page === 'women' ? 20 : 0),
    }),
    [keyPrefix, page, pageLabel],
  )

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    const newKeys = Object.keys(FIELD_META).map((field) => `${keyPrefix}.${field}`)
    const legacyPrefix = `${page}.editorial_sub_banner.sub-1`
    const legacyKeys = [`${legacyPrefix}.title`, `${legacyPrefix}.subtitle`, `${legacyPrefix}.image`]
    const { data: rows, error: loadError } = await supabase
      .from('site_content')
      .select('key, value')
      .in('key', [...newKeys, ...legacyKeys])

    if (loadError) {
      setError(loadError.message)
      setLoading(false)
      return
    }

    const values = new Map((rows ?? []).map((row) => [row.key, row.value]))
    const legacyImage = values.get(`${legacyPrefix}.image`) ?? ''
    const next: EditorialBannerData = {
      title: values.get(`${keyPrefix}.title`) || values.get(`${legacyPrefix}.title`) || DEFAULT_DATA.title,
      subtitle: values.get(`${keyPrefix}.subtitle`) ?? values.get(`${legacyPrefix}.subtitle`) ?? '',
      buttonLabel: values.get(`${keyPrefix}.button_label`) ?? DEFAULT_DATA.buttonLabel,
      destination: (values.get(`${keyPrefix}.link_destination`) as EditorialDestination | undefined) ?? page,
      category: values.get(`${keyPrefix}.link_category`) || 'all',
      subcategory: values.get(`${keyPrefix}.link_subcategory`) ?? '',
      enabled: (values.get(`${keyPrefix}.enabled`) ?? (legacyImage ? 'true' : 'false')) === 'true',
      imageMobile: values.get(`${keyPrefix}.image_mobile`) || legacyImage,
      imageTablet: values.get(`${keyPrefix}.image_tablet`) || legacyImage,
      imageDesktop: values.get(`${keyPrefix}.image_desktop`) || legacyImage,
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
    const buttonLabel = draft.buttonLabel.trim()
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
    if (!buttonLabel || buttonLabel.length > 20) {
      setError('버튼 문구는 1~20자로 입력해주세요.')
      return
    }
    if (draft.enabled && !draft.imageMobile && !draft.imageTablet && !draft.imageDesktop) {
      setError('배너를 노출하려면 이미지를 한 장 이상 등록해주세요.')
      return
    }

    setSaving(true)
    setError(null)
    setSaved(false)
    const rows = [
      rowFor('title', title),
      rowFor('subtitle', subtitle),
      rowFor('button_label', buttonLabel),
      rowFor('link_destination', draft.destination),
      rowFor('link_category', draft.category),
      rowFor('link_subcategory', draft.category === 'all' ? '' : draft.subcategory),
      rowFor('enabled', String(draft.enabled)),
    ]
    const { error: saveError } = await supabase.from('site_content').upsert(rows, { onConflict: 'key' })
    setSaving(false)
    if (saveError) {
      setError(saveError.message)
      return
    }

    const next = { ...draft, title, subtitle, buttonLabel }
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
      const file = new File([blob], `${page}-editorial-${config.field}.jpg`, { type: blob.type })
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
        <p className="text-body-sm font-medium">{pageLabel} 에디토리얼 배너</p>
        <p className="text-caption text-secondary">
          BEST SELLERS 위에 노출되는 배너입니다. 저장 후 사용자 페이지를 새로고침하면 반영됩니다.
        </p>
      </div>

      {error && <p className="text-body-sm text-point">{error}</p>}
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
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/65 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 z-10 p-16 text-surface md:p-24">
          <p className="font-display whitespace-pre-line text-[22px] font-medium leading-[1.15] md:text-[28px]">
            {draft.title || '타이틀'}
          </p>
          {draft.subtitle && <p className="mt-8 whitespace-pre-line text-[16px] leading-[1.6] text-surface/85">{draft.subtitle}</p>}
          {draft.buttonLabel && (
            <span className="mt-16 inline-flex h-36 items-center border border-surface px-16 text-body-sm">
              {draft.buttonLabel}
            </span>
          )}
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
            rows={3}
            onChange={(event) => setDraft((current) => ({ ...current, subtitle: event.target.value }))}
            className="text-body-sm rounded-sm border border-line px-12 py-8"
          />
        </label>
        <label className="flex flex-col gap-6">
          <span className="text-body-sm text-secondary">버튼 문구 (최대 20자)</span>
          <input
            value={draft.buttonLabel}
            maxLength={20}
            onChange={(event) => setDraft((current) => ({ ...current, buttonLabel: event.target.value }))}
            className="text-body-sm rounded-sm border border-line px-12 py-8"
          />
        </label>
        <fieldset className="grid grid-cols-1 gap-12 rounded-sm border border-line p-12 md:col-span-2 md:grid-cols-3">
          <legend className="px-4 text-body-sm font-medium">버튼 이동 설정</legend>
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
        <label className="flex items-center gap-8 self-end py-8 text-body-sm">
          <input
            type="checkbox"
            checked={draft.enabled}
            onChange={(event) => setDraft((current) => ({ ...current, enabled: event.target.checked }))}
          />
          사용자 페이지에 노출
        </label>
      </div>

      <div className="flex flex-wrap gap-8">
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? '저장 중...' : '문구·버튼·노출 설정 저장'}
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

export default EditorialBannerManager

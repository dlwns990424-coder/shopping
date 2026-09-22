import { useEffect, useState, type ChangeEvent } from 'react'
import { Helmet } from 'react-helmet-async'
import { supabase } from '../../lib/supabaseClient'
import Button from '../../components/Button'
import ConfirmModal from '../../components/ConfirmModal'
import ImageCropModal from '../../components/ImageCropModal'
import { uploadImage } from '../../utils/uploadImage'
import BestsellerManager from '../components/BestsellerManager'
import CategoryManager from '../components/CategoryManager'
import EditorialBannerManager from '../components/EditorialBannerManager'
import HeroManager from '../components/HeroManager'

interface ContentRow {
  key: string
  page: string
  label: string
  value: string
  display_order: number
}

const PAGE_LABELS: Record<string, string> = {
  men: 'MEN',
  women: 'WOMEN',
}

const SECTION_LABELS: Record<string, string> = {
  category_coat: '카테고리 - 코트',
  category_jacket: '카테고리 - 자켓·블레이저',
  category_padding: '카테고리 - 패딩',
  category_cardigan: '카테고리 - 가디건',
  category_shirt: '카테고리 - 셔츠',
  category_tshirt: '카테고리 - 티셔츠',
  category_knit: '카테고리 - 니트·스웨트',
  category_hoodie: '카테고리 - 후드',
  category_denim: '카테고리 - 데님',
  category_slacks: '카테고리 - 슬랙스',
  category_shorts: '카테고리 - 반바지',
}

interface CropSettings {
  aspect: number
  targetLabel?: string
  recommendedWidth?: number
  recommendedHeight?: number
  safeZoneWidthRatio?: number
  safeZoneHeightRatio?: number
  topDangerZoneRatio?: number
  textZone?: {
    left: number
    top: number
    width: number
    height: number
  }
}

// key는 "page.section.나머지" 형태(예: home.event_banner.men-outer.label) — 두 번째 조각을 섹션으로 취급
function sectionOf(key: string) {
  return key.split('.')[1] ?? ''
}

// 카테고리 카드는 화면 크기와 무관하게 이미지 1장만 받는다(CategoryCard가 전 구간에서 동일하게
// 3:4를 쓰도록 통일했으므로, 이 비율 그대로 크롭한 이미지가 어느 화면에서도 잘리는 부분 없이
// 그대로 표시된다). 히어로/에디토리얼 배너는 각자 전용 매니저(HeroManager/EditorialBannerManager)가
// 자기만의 크롭 설정을 갖고 전담하므로 여기서는 다루지 않는다.
const FIXED_ASPECT = 2 / 3

const CATEGORY_ASPECT = 3 / 4
const CATEGORY_SECTIONS = new Set([
  'category_coat',
  'category_jacket',
  'category_padding',
  'category_cardigan',
  'category_shirt',
  'category_tshirt',
  'category_knit',
  'category_hoodie',
  'category_denim',
  'category_slacks',
  'category_shorts',
])

function cropSettingsForKey(key: string): CropSettings {
  const section = sectionOf(key)
  if (CATEGORY_SECTIONS.has(section)) return { aspect: CATEGORY_ASPECT }
  return { aspect: FIXED_ASPECT }
}

function ContentManage() {
  const [rows, setRows] = useState<ContentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [draftValue, setDraftValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploadingKey, setUploadingKey] = useState<string | null>(null)
  const [resetTargetKey, setResetTargetKey] = useState<string | null>(null)
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
  const [cropTarget, setCropTarget] = useState<{
    key: string
    file: File
    settings: CropSettings
  } | null>(null)

  const loadRows = async () => {
    const { data, error } = await supabase
      .from('site_content')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) setError(error.message)
    else setRows(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    loadRows()
  }, [])

  const startEdit = (row: ContentRow) => {
    setEditingKey(row.key)
    setDraftValue(row.value)
  }

  const cancelEdit = () => {
    setEditingKey(null)
    setDraftValue('')
  }

  const saveEdit = async (key: string) => {
    setSaving(true)
    setError(null)

    const { error } = await supabase.from('site_content').update({ value: draftValue }).eq('key', key)

    setSaving(false)

    if (error) {
      setError(error.message)
      return
    }

    setEditingKey(null)
    loadRows()
  }

  const handleImageSelect = (key: string, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    const settings = cropSettingsForKey(key)
    setCropTarget({ key, file, settings })
  }

  const handleCropCancel = () => setCropTarget(null)

  const handleCropConfirm = async (blob: Blob) => {
    if (!cropTarget) return
    const { key } = cropTarget

    setCropTarget(null)
    setUploadingKey(key)
    setError(null)

    try {
      const croppedFile = new File([blob], `${key.replace(/\./g, '-')}.jpg`, { type: blob.type })
      const url = await uploadImage(croppedFile, 'content')
      const { error } = await supabase.from('site_content').update({ value: url }).eq('key', key)
      if (error) throw error
      loadRows()
    } catch (err) {
      setError(err instanceof Error ? err.message : '이미지 업로드에 실패했습니다.')
    } finally {
      setUploadingKey(null)
    }
  }

  const confirmResetImage = async () => {
    if (!resetTargetKey) return

    const { error } = await supabase.from('site_content').update({ value: '' }).eq('key', resetTargetKey)
    setResetTargetKey(null)

    if (error) {
      setError(error.message)
      return
    }
    loadRows()
  }

  // 에디토리얼의 신규/레거시 키는 전용 매니저(EditorialBannerManager)가 전담하므로 범용 렌더링에서 제외.
  const groupedByPage = rows.filter((row) => !['editorial_banner', 'editorial_sub_banner'].includes(sectionOf(row.key)))
    .reduce<Record<string, Record<string, ContentRow[]>>>((pages, row) => {
      const section = sectionOf(row.key)
      const page = (pages[row.page] ??= {})
      ;(page[section] ??= []).push(row)
      return pages
    }, {})

  // 페이지(홈/MEN/WOMEN) 블록 안에서 원하는 섹션만, 원하는 순서로 뽑아서 렌더링하기 위한 헬퍼.
  // groupedByPage에 없는 섹션(아직 로딩 전이거나 해당 페이지에 없는 경우)은 조용히 건너뜀.
  const renderSections = (page: string, sectionNames: string[]) =>
    sectionNames.map((section) => {
      const sectionRows = groupedByPage[page]?.[section]
      if (!sectionRows) return null

      return (
        <div key={section} className="flex flex-col gap-12">
          <h3 className="text-body-sm font-bold text-secondary">{SECTION_LABELS[section] ?? section}</h3>
          <div className="grid grid-cols-1 gap-16 md:grid-cols-2 lg:grid-cols-3">
            {sectionRows.map((row) => {
              const isImage = /\.image(_mobile|_tablet|_desktop)?$/.test(row.key)

              if (isImage) {
                const cropSettings = cropSettingsForKey(row.key)

                return (
                  <div key={row.key} className="flex flex-col gap-12 rounded-md border border-line p-16">
                    <p className="text-caption text-secondary">{row.label}</p>

                    {cropSettings.recommendedWidth && cropSettings.recommendedHeight && (
                      <p className="text-caption text-secondary">
                        {cropSettings.targetLabel} · 권장 원본 {cropSettings.recommendedWidth}×
                        {cropSettings.recommendedHeight}px 이상
                      </p>
                    )}

                    {row.value ? (
                      <button
                        type="button"
                        onClick={() => setLightboxUrl(row.value)}
                        className="block h-120 w-full cursor-zoom-in overflow-hidden rounded-sm border border-line bg-transparent p-0"
                      >
                        <img src={row.value} alt={row.label} className="h-full w-full object-cover" />
                      </button>
                    ) : (
                      <div className="flex h-120 w-full items-center justify-center rounded-sm border border-dashed border-line">
                        <span className="text-caption text-secondary">이미지 없음</span>
                      </div>
                    )}

                    <div className="flex items-center gap-12">
                      <Button
                        as="label"
                        variant="secondary"
                        size="small"
                        className="cursor-pointer"
                        aria-disabled={uploadingKey === row.key}
                      >
                        {uploadingKey === row.key ? '업로드 중...' : '이미지 변경'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageSelect(row.key, e)}
                          disabled={uploadingKey === row.key}
                        />
                      </Button>
                      {row.value && (
                        <button
                          type="button"
                          onClick={() => setResetTargetKey(row.key)}
                          className="text-body-sm text-secondary hover:text-point"
                        >
                          제거
                        </button>
                      )}
                    </div>
                  </div>
                )
              }

              return (
                <div key={row.key} className="flex flex-col gap-12 rounded-md border border-line p-16">
                  <p className="text-caption text-secondary">{row.label}</p>

                  {editingKey === row.key ? (
                    <textarea
                      value={draftValue}
                      onChange={(e) => setDraftValue(e.target.value)}
                      rows={3}
                      className="text-body-sm w-full flex-1 rounded-sm border border-line px-12 py-8"
                    />
                  ) : (
                    <p className="text-body-sm whitespace-pre-line flex-1">{row.value}</p>
                  )}

                  {editingKey === row.key ? (
                    <div className="flex gap-8">
                      <Button size="small" onClick={() => saveEdit(row.key)} disabled={saving}>
                        {saving ? '저장 중...' : '저장'}
                      </Button>
                      <Button size="small" variant="secondary" onClick={cancelEdit}>
                        취소
                      </Button>
                    </div>
                  ) : (
                    <Button size="small" variant="secondary" onClick={() => startEdit(row)} className="self-start">
                      수정
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )
    })

  return (
    <div className="flex flex-col gap-32">
      <Helmet>
        <title>NOVERA Admin | 콘텐츠 관리</title>
      </Helmet>

      <h1 className="text-h1">콘텐츠 관리</h1>

      {error && <p className="text-body-sm text-danger">{error}</p>}

      {loading ? (
        <p className="text-body-sm text-secondary">불러오는 중...</p>
      ) : (
        <>
          <div className="flex flex-col gap-24">
            <h2 className="text-h3 border-b border-line pb-8 font-bold">공통</h2>

            <div className="flex flex-col gap-16">
              <h3 className="text-body-sm font-bold text-secondary">베스트 상품 (MEN/WOMEN 공통)</h3>
              <BestsellerManager />
            </div>

            <div className="flex flex-col gap-16">
              <h3 className="text-body-sm font-bold text-secondary">카테고리 관리 (MEN/WOMEN 공통)</h3>
              <CategoryManager />
            </div>
          </div>

          <div className="flex flex-col gap-24">
            <h2 className="text-h3 border-b border-line pb-8 font-bold">{PAGE_LABELS.men}</h2>

            <HeroManager page="men" />

            {renderSections('men', [
              'category_coat',
              'category_jacket',
              'category_padding',
              'category_cardigan',
              'category_shirt',
              'category_tshirt',
              'category_knit',
              'category_hoodie',
              'category_denim',
              'category_slacks',
              'category_shorts',
            ])}

            <div className="flex flex-col gap-16">
              <h3 className="text-body-sm font-bold text-secondary">에디토리얼 배너</h3>
              <EditorialBannerManager page="men" />
            </div>
          </div>

          <div className="flex flex-col gap-24">
            <h2 className="text-h3 border-b border-line pb-8 font-bold">{PAGE_LABELS.women}</h2>

            <HeroManager page="women" />

            {renderSections('women', [
              'category_coat',
              'category_jacket',
              'category_padding',
              'category_cardigan',
              'category_shirt',
              'category_tshirt',
              'category_knit',
              'category_hoodie',
              'category_denim',
              'category_slacks',
              'category_shorts',
            ])}

            <div className="flex flex-col gap-16">
              <h3 className="text-body-sm font-bold text-secondary">에디토리얼 배너</h3>
              <EditorialBannerManager page="women" />
            </div>
          </div>
        </>
      )}

      {resetTargetKey && (
        <ConfirmModal
          message="이 이미지를 제거하고 기본 화면으로 되돌릴까요?"
          confirmLabel="제거"
          onConfirm={confirmResetImage}
          onCancel={() => setResetTargetKey(null)}
        />
      )}

      {cropTarget && (
        <ImageCropModal
          file={cropTarget.file}
          aspect={cropTarget.settings.aspect}
          targetLabel={cropTarget.settings.targetLabel}
          recommendedWidth={cropTarget.settings.recommendedWidth}
          recommendedHeight={cropTarget.settings.recommendedHeight}
          safeZoneWidthRatio={cropTarget.settings.safeZoneWidthRatio}
          safeZoneHeightRatio={cropTarget.settings.safeZoneHeightRatio}
          topDangerZoneRatio={cropTarget.settings.topDangerZoneRatio}
          textZone={cropTarget.settings.textZone}
          onCancel={handleCropCancel}
          onConfirm={handleCropConfirm}
        />
      )}

      {lightboxUrl && (
        <div
          className="fixed inset-0 z-modal flex cursor-zoom-out items-center justify-center bg-black/80 p-24"
          onClick={() => setLightboxUrl(null)}
        >
          <img
            src={lightboxUrl}
            alt="이미지 확대 보기"
            className="max-h-full max-w-full cursor-default object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}

export default ContentManage

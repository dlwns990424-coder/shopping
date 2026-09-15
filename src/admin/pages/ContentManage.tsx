import { useEffect, useState, type ChangeEvent } from 'react'
import { Helmet } from 'react-helmet-async'
import { supabase } from '../../lib/supabaseClient'
import Button from '../../components/Button'
import ConfirmModal from '../../components/ConfirmModal'
import ImageCropModal from '../../components/ImageCropModal'
import { uploadImage } from '../../utils/uploadImage'
import FeaturedCarouselManager from '../components/FeaturedCarouselManager'
import HeroLayeredManager from '../components/HeroLayeredManager'
import BestsellerManager from '../components/BestsellerManager'
import HomeBannerManager from '../components/HomeBannerManager'

interface ContentRow {
  key: string
  page: string
  label: string
  value: string
  display_order: number
}

const PAGE_LABELS: Record<string, string> = {
  home: '홈',
  men: 'MEN',
  women: 'WOMEN',
}

const SECTION_LABELS: Record<string, string> = {
  hero: '히어로',
  category_all: '카테고리 - 모두 보기',
  category_outer: '카테고리 - 아우터',
  category_top: '카테고리 - 상의',
  category_bottom: '카테고리 - 하의',
}

// key는 "page.section.나머지" 형태(예: home.event_banner.men-outer.label) — 두 번째 조각을 섹션으로 취급
function sectionOf(key: string) {
  return key.split('.')[1] ?? ''
}

// 히어로는 화면 크기에 따라 실제로 잘리는 비율이 크게 달라서 모바일용/데스크톱용 이미지를
// 따로 받는다(_mobile/_desktop 접미사). 카테고리 카드는 화면 크기와 무관하게 이미지 1장만
// 받는다(CategoryCard가 전 구간에서 동일하게 3:4를 쓰도록 통일했으므로, 이 비율 그대로 크롭한
// 이미지가 어느 화면에서도 잘리는 부분 없이 그대로 표시된다).
// 데스크톱(`lg:`)은 h-screen이라 실제 비율은 방문자 화면 크기에 따라 달라지는 근사값일 뿐이지만,
// 가장 흔한 모니터 비율(16:9)을 기준으로 잡는다.
const DESKTOP_SCREEN_ASPECT = 16 / 9
// 히어로는 태블릿 구간(md~lg)에서 정사각형(aspect-square)을 쓰므로 별도 크롭이 필요하다.
const RESPONSIVE_ASPECT: Record<string, { mobile: number; desktop: number; tablet?: number }> = {
  hero: { mobile: 3 / 4, desktop: DESKTOP_SCREEN_ASPECT, tablet: 1 },
}
const FIXED_ASPECT = 2 / 3
const RESPONSIVE_SECTIONS = new Set(Object.keys(RESPONSIVE_ASPECT))

const CATEGORY_ASPECT = 3 / 4
const CATEGORY_SECTIONS = new Set(['category_all', 'category_outer', 'category_top', 'category_bottom'])

// 히어로 섹션은 고정 헤더(모바일 h-48, 그 아래 그라디언트는 160px까지)가 이미지 위에 겹쳐진다.
// 크롭 높이 대비 대략적인 비율(여유를 좀 둔 값) — 이 안에는 얼굴 등 중요한 요소를 두면 안 됨.
// 모바일 크롭 높이가 h-screen 기준일 때보다 짧아져서(aspect-[3/4]) 같은 절대 픽셀(그라디언트
// 160px)이 차지하는 비중이 커졌으므로 비율을 올려잡음.
const HERO_HEADER_ZONE_RATIO = 0.2

// null이면 "모바일/데스크톱으로 나뉘어야 하는데 아직 안 나뉜 비정상 상태"라는 뜻.
// 이 경우 잘못된 비율(예: 2:3)로 조용히 넘기지 않고 화면에서 바로 경고를 띄운다.
function aspectForKey(key: string): number | null {
  const section = sectionOf(key)
  if (key.endsWith('_mobile')) return RESPONSIVE_ASPECT[section]?.mobile ?? null
  if (key.endsWith('_tablet')) return RESPONSIVE_ASPECT[section]?.tablet ?? null
  if (key.endsWith('_desktop')) return RESPONSIVE_ASPECT[section]?.desktop ?? null
  if (RESPONSIVE_SECTIONS.has(section)) return null
  if (CATEGORY_SECTIONS.has(section)) return CATEGORY_ASPECT
  return FIXED_ASPECT
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
    aspect: number
    topDangerZoneRatio?: number
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

    const aspect = aspectForKey(key)
    if (aspect === null) {
      setError('이 섹션은 모바일/데스크톱 이미지로 나뉘어야 합니다. SQL 마이그레이션이 실행됐는지 확인해주세요.')
      return
    }

    const topDangerZoneRatio = sectionOf(key) === 'hero' ? HERO_HEADER_ZONE_RATIO : undefined
    setCropTarget({ key, file, aspect, topDangerZoneRatio })
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

  // hero_layered/new_banner/sale_banner는 각각 전용 매니저(HeroLayeredManager/HomeBannerManager)가
  // 전담하므로 범용 렌더링에서 제외.
  const groupedByPage = rows
    .filter(
      (row) =>
        sectionOf(row.key) !== 'hero_layered' &&
        sectionOf(row.key) !== 'new_banner' &&
        sectionOf(row.key) !== 'sale_banner',
    )
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
                const aspect = aspectForKey(row.key)

                return (
                  <div key={row.key} className="flex flex-col gap-12 rounded-md border border-line p-16">
                    <p className="text-caption text-secondary">{row.label}</p>

                    {aspect === null && (
                      <p className="text-caption text-point">
                        이 섹션은 모바일/데스크톱 이미지로 나뉘어야 합니다. SQL 마이그레이션이 실행됐는지 확인해주세요.
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
                      {aspect !== null && (
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
                      )}
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
                    <p className="text-body-sm flex-1">{row.value}</p>
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

      {error && <p className="text-body-sm text-point">{error}</p>}

      {loading ? (
        <p className="text-body-sm text-secondary">불러오는 중...</p>
      ) : (
        <>
          <div className="flex flex-col gap-24">
            <h2 className="text-h3 border-b border-line pb-8 font-bold">{PAGE_LABELS.home}</h2>

            <div className="flex flex-col gap-16">
              <h3 className="text-body-sm font-bold text-secondary">홈 히어로 (태블릿·데스크톱)</h3>
              <HeroLayeredManager />
            </div>

            {renderSections('home', ['hero'])}

            <div className="flex flex-col gap-16">
              <h3 className="text-body-sm font-bold text-secondary">베스트 상품</h3>
              <BestsellerManager />
            </div>

            <div className="flex flex-col gap-16">
              <h3 className="text-body-sm font-bold text-secondary">홈 신상품·세일 배너</h3>
              <HomeBannerManager />
            </div>
          </div>

          <div className="flex flex-col gap-24">
            <h2 className="text-h3 border-b border-line pb-8 font-bold">{PAGE_LABELS.men}</h2>

            <div className="flex flex-col gap-16">
              <h3 className="text-body-sm font-bold text-secondary">메인 캐러셀 상품</h3>
              <FeaturedCarouselManager gender="men" label="MEN" />
            </div>

            {renderSections('men', ['hero', 'category_all', 'category_outer', 'category_top', 'category_bottom'])}
          </div>

          <div className="flex flex-col gap-24">
            <h2 className="text-h3 border-b border-line pb-8 font-bold">{PAGE_LABELS.women}</h2>

            <div className="flex flex-col gap-16">
              <h3 className="text-body-sm font-bold text-secondary">메인 캐러셀 상품</h3>
              <FeaturedCarouselManager gender="women" label="WOMEN" />
            </div>

            {renderSections('women', ['hero', 'category_all', 'category_outer', 'category_top', 'category_bottom'])}
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
          aspect={cropTarget.aspect}
          topDangerZoneRatio={cropTarget.topDangerZoneRatio}
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

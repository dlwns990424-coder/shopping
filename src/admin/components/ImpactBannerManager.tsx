import { useCallback, useEffect, useState, type ChangeEvent } from 'react'
import { ChevronDown } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import Button from '../../components/Button'
import ImageCropModal from '../../components/ImageCropModal'
import { uploadImage } from '../../utils/uploadImage'
import { CATEGORY_TABS, SUB_CATEGORIES } from '../../constants/categoryFilters'

// 홈 히어로/젠더배너 다음에 오는 신규 임팩트 배너(1개, 가로로 넓은 배너) 전용 관리자 카드.
// EventBannerManager(작은 세로형 4개)와 달리 배너가 하나뿐이라 목록/드래그 정렬이 필요 없고,
// 타이틀+설명 두 줄 텍스트가 들어가며, 모바일/데스크톱 화면비가 크게 달라(4:5 vs 21:9)
// hero/men_banner/women_banner와 같은 방식으로 이미지를 둘로 나눠 받는다.
const MOBILE_ASPECT = 4 / 5
const DESKTOP_ASPECT = 21 / 9

const KEY_PREFIX = 'home.impact_banner'
const keyFor = (field: string) => `${KEY_PREFIX}.${field}`

interface ImpactBannerData {
  title: string
  description: string
  imageMobile: string
  imageDesktop: string
  gender: string
  category: string
  sub: string
}

const EMPTY: ImpactBannerData = {
  title: '',
  description: '',
  imageMobile: '',
  imageDesktop: '',
  gender: 'men',
  category: 'all',
  sub: '',
}

function ImpactBannerManager() {
  const [banner, setBanner] = useState<ImpactBannerData>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingText, setEditingText] = useState(false)
  const [draftTitle, setDraftTitle] = useState('')
  const [draftDescription, setDraftDescription] = useState('')
  const [uploadingSlot, setUploadingSlot] = useState<'mobile' | 'desktop' | null>(null)
  const [cropTarget, setCropTarget] = useState<{ slot: 'mobile' | 'desktop'; file: File } | null>(null)

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('site_content').select('key, value').like('key', `${KEY_PREFIX}.%`)

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    const next = { ...EMPTY }
    for (const row of data ?? []) {
      const field = row.key.slice(KEY_PREFIX.length + 1)
      if (field === 'title') next.title = row.value
      else if (field === 'description') next.description = row.value
      else if (field === 'image_mobile') next.imageMobile = row.value
      else if (field === 'image_desktop') next.imageDesktop = row.value
      else if (field === 'gender') next.gender = row.value || 'men'
      else if (field === 'category') next.category = row.value || 'all'
      else if (field === 'sub') next.sub = row.value
    }
    setBanner(next)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const startEditText = () => {
    setEditingText(true)
    setDraftTitle(banner.title)
    setDraftDescription(banner.description)
  }

  const saveText = async () => {
    const { error: titleError } = await supabase
      .from('site_content')
      .update({ value: draftTitle })
      .eq('key', keyFor('title'))
    const { error: descriptionError } = await supabase
      .from('site_content')
      .update({ value: draftDescription })
      .eq('key', keyFor('description'))
    if (titleError || descriptionError) {
      setError((titleError ?? descriptionError)!.message)
      return
    }
    setBanner((prev) => ({ ...prev, title: draftTitle, description: draftDescription }))
    setEditingText(false)
  }

  const updateField = async (field: 'gender' | 'category' | 'sub', value: string) => {
    const { error } = await supabase.from('site_content').update({ value }).eq('key', keyFor(field))
    if (error) {
      setError(error.message)
      return
    }
    setBanner((prev) => ({ ...prev, [field]: value }))
  }

  const handleCategoryChange = (value: string) => {
    updateField('category', value)
    updateField('sub', '')
  }

  const handleImageSelect = (slot: 'mobile' | 'desktop', e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setCropTarget({ slot, file })
  }

  const handleCropConfirm = async (blob: Blob) => {
    if (!cropTarget) return
    const { slot } = cropTarget
    setCropTarget(null)
    setUploadingSlot(slot)
    setError(null)

    try {
      const croppedFile = new File([blob], `home-impact-banner-${slot}.jpg`, { type: blob.type })
      const url = await uploadImage(croppedFile, 'content')
      const field = slot === 'mobile' ? 'image_mobile' : 'image_desktop'
      const { error } = await supabase.from('site_content').update({ value: url }).eq('key', keyFor(field))
      if (error) throw error
      setBanner((prev) => (slot === 'mobile' ? { ...prev, imageMobile: url } : { ...prev, imageDesktop: url }))
    } catch (err) {
      setError(err instanceof Error ? err.message : '이미지 업로드에 실패했습니다.')
    } finally {
      setUploadingSlot(null)
    }
  }

  if (loading) return <p className="text-body-sm text-secondary">불러오는 중...</p>

  const subOptions = SUB_CATEGORIES[banner.category] ?? []

  return (
    <div className="flex flex-col gap-16 rounded-md border border-line p-16">
      <h3 className="text-body-lg font-bold">임팩트 이벤트 배너</h3>
      <p className="text-caption text-secondary">
        홈 젠더배너 바로 아래에 노출되는 가로로 넓은 배너 1개입니다. 클릭 시 아래 성별/카테고리로 필터링된 상품 목록으로
        이동합니다.
      </p>
      {error && <p className="text-body-sm text-point">{error}</p>}

      <div className="flex flex-col gap-12 rounded-sm border border-line p-12">
        <div className="flex flex-wrap gap-12">
          <div className="flex flex-col gap-4">
            <span className="text-caption text-secondary">모바일 이미지 (4:5)</span>
            {banner.imageMobile ? (
              <img
                src={banner.imageMobile}
                alt="임팩트 배너 모바일"
                className="h-96 w-80 rounded-sm border border-line object-cover"
              />
            ) : (
              <div className="flex h-96 w-80 items-center justify-center rounded-sm border border-dashed border-line">
                <span className="text-caption text-secondary">없음</span>
              </div>
            )}
            <Button
              as="label"
              variant="secondary"
              size="small"
              className="w-fit cursor-pointer"
              aria-disabled={uploadingSlot === 'mobile'}
            >
              {uploadingSlot === 'mobile' ? '업로드 중...' : '이미지 변경'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageSelect('mobile', e)}
                disabled={uploadingSlot === 'mobile'}
              />
            </Button>
          </div>

          <div className="flex flex-col gap-4">
            <span className="text-caption text-secondary">데스크톱 이미지 (21:9)</span>
            {banner.imageDesktop ? (
              <img
                src={banner.imageDesktop}
                alt="임팩트 배너 데스크톱"
                className="h-96 w-[224px] rounded-sm border border-line object-cover"
              />
            ) : (
              <div className="flex h-96 w-[224px] items-center justify-center rounded-sm border border-dashed border-line">
                <span className="text-caption text-secondary">없음</span>
              </div>
            )}
            <Button
              as="label"
              variant="secondary"
              size="small"
              className="w-fit cursor-pointer"
              aria-disabled={uploadingSlot === 'desktop'}
            >
              {uploadingSlot === 'desktop' ? '업로드 중...' : '이미지 변경'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageSelect('desktop', e)}
                disabled={uploadingSlot === 'desktop'}
              />
            </Button>
          </div>
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
              value={draftDescription}
              onChange={(e) => setDraftDescription(e.target.value)}
              placeholder="설명"
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
              <p className="text-body-sm font-medium">{banner.title || '(타이틀 없음)'}</p>
              <p className="text-caption text-secondary">{banner.description || '(설명 없음)'}</p>
            </div>
            <button type="button" onClick={startEditText} className="text-body-sm text-secondary hover:text-point">
              수정
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-8">
          <div className="relative">
            <select
              value={banner.gender}
              onChange={(e) => updateField('gender', e.target.value)}
              className="text-body-sm appearance-none rounded-sm border border-line py-6 pl-10 pr-28 text-primary"
            >
              <option value="men">MEN</option>
              <option value="women">WOMEN</option>
            </select>
            <ChevronDown
              size={14}
              strokeWidth={1.5}
              className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 text-secondary"
            />
          </div>

          <div className="relative">
            <select
              value={banner.category}
              onChange={(e) => handleCategoryChange(e.target.value)}
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
                onChange={(e) => updateField('sub', e.target.value)}
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

      {cropTarget && (
        <ImageCropModal
          file={cropTarget.file}
          aspect={cropTarget.slot === 'mobile' ? MOBILE_ASPECT : DESKTOP_ASPECT}
          onCancel={() => setCropTarget(null)}
          onConfirm={handleCropConfirm}
        />
      )}
    </div>
  )
}

export default ImpactBannerManager

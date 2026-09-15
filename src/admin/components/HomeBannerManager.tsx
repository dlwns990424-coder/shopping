import { useCallback, useEffect, useState, type ChangeEvent } from 'react'
import { supabase } from '../../lib/supabaseClient'
import Button from '../../components/Button'
import ImageCropModal from '../../components/ImageCropModal'
import { uploadImage } from '../../utils/uploadImage'

// Home의 세일 섹션(HomeBanner.tsx)에서 쓰는 풀블리드 배너 — 목적지 링크는
// 항상 /shop?sale=true로 코드에 고정돼 있어서(성별 통합) 임팩트배너와
// 달리 gender/category 선택 필드는 없다.
// 신상품은 더는 배너가 아니라 BEST SELLERS와 같은 ProductRow 스타일로 바뀌어서
// 별도 편집 항목이 필요 없어짐(home.new_banner.* 행은 고아 상태로 남아있음, 정리는 별도).
const MOBILE_ASPECT = 4 / 5
const DESKTOP_ASPECT = 21 / 9

type BannerKey = 'sale_banner'

interface BannerData {
  title: string
  subtitle: string
  imageMobile: string
  imageDesktop: string
}

const EMPTY: BannerData = { title: '', subtitle: '', imageMobile: '', imageDesktop: '' }

const BANNERS: { key: BannerKey; label: string }[] = [{ key: 'sale_banner', label: '세일 배너' }]

function BannerEditor({
  bannerKey,
  label,
  data,
  onTextSaved,
  onImageSaved,
}: {
  bannerKey: BannerKey
  label: string
  data: BannerData
  onTextSaved: (key: BannerKey, title: string, subtitle: string) => void
  onImageSaved: (key: BannerKey, slot: 'mobile' | 'desktop', url: string) => void
}) {
  const [editingText, setEditingText] = useState(false)
  const [draftTitle, setDraftTitle] = useState('')
  const [draftSubtitle, setDraftSubtitle] = useState('')
  const [uploadingSlot, setUploadingSlot] = useState<'mobile' | 'desktop' | null>(null)
  const [cropTarget, setCropTarget] = useState<{ slot: 'mobile' | 'desktop'; file: File } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const startEditText = () => {
    setEditingText(true)
    setDraftTitle(data.title)
    setDraftSubtitle(data.subtitle)
  }

  const saveText = async () => {
    const { error: titleError } = await supabase
      .from('site_content')
      .update({ value: draftTitle })
      .eq('key', `home.${bannerKey}.title`)
    const { error: subtitleError } = await supabase
      .from('site_content')
      .update({ value: draftSubtitle })
      .eq('key', `home.${bannerKey}.subtitle`)
    if (titleError || subtitleError) {
      setError((titleError ?? subtitleError)!.message)
      return
    }
    onTextSaved(bannerKey, draftTitle, draftSubtitle)
    setEditingText(false)
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
      const croppedFile = new File([blob], `home-${bannerKey}-${slot}.jpg`, { type: blob.type })
      const url = await uploadImage(croppedFile, 'content')
      const field = slot === 'mobile' ? 'image_mobile' : 'image_desktop'
      const { error } = await supabase.from('site_content').update({ value: url }).eq('key', `home.${bannerKey}.${field}`)
      if (error) throw error
      onImageSaved(bannerKey, slot, url)
    } catch (err) {
      setError(err instanceof Error ? err.message : '이미지 업로드에 실패했습니다.')
    } finally {
      setUploadingSlot(null)
    }
  }

  return (
    <div className="flex flex-col gap-12 rounded-sm border border-line p-12">
      <p className="text-body-sm font-medium">{label}</p>
      {error && <p className="text-body-sm text-point">{error}</p>}

      <div className="flex flex-wrap gap-12">
        <div className="flex flex-col gap-4">
          <span className="text-caption text-secondary">모바일 이미지 (4:5)</span>
          {data.imageMobile ? (
            <img
              src={data.imageMobile}
              alt={`${label} 모바일`}
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
          {data.imageDesktop ? (
            <img
              src={data.imageDesktop}
              alt={`${label} 데스크톱`}
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

function HomeBannerManager() {
  const [banners, setBanners] = useState<Record<BannerKey, BannerData>>({
    sale_banner: EMPTY,
  })
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const { data } = await supabase.from('site_content').select('key, value').like('key', 'home.sale_banner.%')

    const next: Record<BannerKey, BannerData> = { sale_banner: { ...EMPTY } }
    for (const row of data ?? []) {
      const match = row.key.match(/^home\.(sale_banner)\.(.+)$/)
      if (!match) continue
      const [, key, field] = match as [string, BannerKey, string]
      if (field === 'title') next[key].title = row.value
      else if (field === 'subtitle') next[key].subtitle = row.value
      else if (field === 'image_mobile') next[key].imageMobile = row.value
      else if (field === 'image_desktop') next[key].imageDesktop = row.value
    }
    setBanners(next)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  if (loading) return <p className="text-body-sm text-secondary">불러오는 중...</p>

  return (
    <div className="flex flex-col gap-16">
      <p className="text-caption text-secondary">
        신상품 행 아래에 노출되는 세일 풀블리드 배너입니다. MORE 버튼 클릭 시 전체 성별 할인상품 리스팅으로
        이동합니다(목적지는 코드에 고정).
      </p>
      {BANNERS.map(({ key, label }) => (
        <BannerEditor
          key={key}
          bannerKey={key}
          label={label}
          data={banners[key]}
          onTextSaved={(k, title, subtitle) =>
            setBanners((prev) => ({ ...prev, [k]: { ...prev[k], title, subtitle } }))
          }
          onImageSaved={(k, slot, url) =>
            setBanners((prev) => ({
              ...prev,
              [k]: slot === 'mobile' ? { ...prev[k], imageMobile: url } : { ...prev[k], imageDesktop: url },
            }))
          }
        />
      ))}
    </div>
  )
}

export default HomeBannerManager

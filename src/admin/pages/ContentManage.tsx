import { useEffect, useState, type ChangeEvent } from 'react'
import { Helmet } from 'react-helmet-async'
import { supabase } from '../../lib/supabaseClient'
import Button from '../../components/Button'
import ConfirmModal from '../../components/ConfirmModal'
import { uploadImage } from '../../utils/uploadImage'
import FeaturedCarouselManager from '../components/FeaturedCarouselManager'

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
  men_banner: 'MEN 배너',
  women_banner: 'WOMEN 배너',
  event_banner: '이벤트 배너',
}

// key는 "page.section.나머지" 형태(예: home.event_banner.men-outer.label) — 두 번째 조각을 섹션으로 취급
function sectionOf(key: string) {
  return key.split('.')[1] ?? ''
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

  const handleImageSelect = async (key: string, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingKey(key)
    setError(null)

    try {
      const url = await uploadImage(file, 'content')
      const { error } = await supabase.from('site_content').update({ value: url }).eq('key', key)
      if (error) throw error
      loadRows()
    } catch (err) {
      setError(err instanceof Error ? err.message : '이미지 업로드에 실패했습니다.')
    } finally {
      setUploadingKey(null)
      e.target.value = ''
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

  const groupedByPage = rows.reduce<Record<string, Record<string, ContentRow[]>>>((pages, row) => {
    const section = sectionOf(row.key)
    const page = (pages[row.page] ??= {})
    ;(page[section] ??= []).push(row)
    return pages
  }, {})

  return (
    <div className="flex flex-col gap-32">
      <Helmet>
        <title>NOVERA Admin | 콘텐츠 관리</title>
      </Helmet>

      <h1 className="text-h1">콘텐츠 관리</h1>

      <div className="flex flex-col gap-16">
        <h2 className="text-h3 border-b border-line pb-8 font-bold">메인 캐러셀 상품</h2>
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
          <FeaturedCarouselManager gender="men" label="MEN" />
          <FeaturedCarouselManager gender="women" label="WOMEN" />
        </div>
      </div>

      {error && <p className="text-body-sm text-point">{error}</p>}

      {loading ? (
        <p className="text-body-sm text-secondary">불러오는 중...</p>
      ) : (
        Object.entries(groupedByPage).map(([page, sections]) => (
          <div key={page} className="flex flex-col gap-24">
            <h2 className="text-h3 border-b border-line pb-8 font-bold">{PAGE_LABELS[page] ?? page}</h2>
            {Object.entries(sections).map(([section, sectionRows]) => (
              <div key={section} className="flex flex-col gap-12">
                <h3 className="text-body-sm font-bold text-secondary">{SECTION_LABELS[section] ?? section}</h3>
                <div className="grid grid-cols-1 gap-16 md:grid-cols-2 lg:grid-cols-3">
                  {sectionRows.map((row) => {
                const isImage = row.key.endsWith('.image')

                if (isImage) {
                  return (
                    <div key={row.key} className="flex flex-col gap-12 rounded-md border border-line p-16">
                      <p className="text-caption text-secondary">{row.label}</p>

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
            ))}
          </div>
        ))
      )}

      {resetTargetKey && (
        <ConfirmModal
          message="이 이미지를 제거하고 기본 화면으로 되돌릴까요?"
          confirmLabel="제거"
          onConfirm={confirmResetImage}
          onCancel={() => setResetTargetKey(null)}
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

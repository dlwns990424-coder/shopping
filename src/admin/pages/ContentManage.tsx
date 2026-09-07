import { useEffect, useState, type ChangeEvent } from 'react'
import { Helmet } from 'react-helmet-async'
import { supabase } from '../../lib/supabaseClient'
import Button from '../../components/Button'
import ConfirmModal from '../../components/ConfirmModal'
import { uploadImage } from '../../utils/uploadImage'

interface ContentRow {
  key: string
  page: string
  label: string
  value: string
}

const PAGE_LABELS: Record<string, string> = {
  home: '홈',
  men: 'MEN',
  women: 'WOMEN',
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

  const loadRows = async () => {
    const { data, error } = await supabase.from('site_content').select('*').order('key', { ascending: true })

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

  const groupedByPage = rows.reduce<Record<string, ContentRow[]>>((groups, row) => {
    ;(groups[row.page] ??= []).push(row)
    return groups
  }, {})

  return (
    <div className="flex flex-col gap-24">
      <Helmet>
        <title>T&amp;L Admin | 콘텐츠 관리</title>
      </Helmet>

      <h1 className="text-h1">콘텐츠 관리</h1>

      {error && <p className="text-body-sm text-point">{error}</p>}

      {loading ? (
        <p className="text-body-sm text-secondary">불러오는 중...</p>
      ) : (
        Object.entries(groupedByPage).map(([page, pageRows]) => (
          <div key={page} className="flex flex-col gap-12">
            <h2 className="text-h3 font-bold">{PAGE_LABELS[page] ?? page}</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-720 border-collapse text-left">
                <thead>
                  <tr className="text-body-sm border-b border-line text-secondary">
                    <th className="w-240 py-8 pr-16 font-medium">항목</th>
                    <th className="py-8 pr-16 font-medium">문구 / 이미지</th>
                    <th className="w-120 py-8 pl-16 font-medium">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((row) => {
                    const isImage = row.key.endsWith('.image')

                    if (isImage) {
                      return (
                        <tr key={row.key} className="text-body-sm border-b border-line align-top">
                          <td className="py-8 pr-16 text-secondary">{row.label}</td>
                          <td className="py-8 pr-16">
                            <div className="flex items-center gap-12">
                              {row.value ? (
                                <img
                                  src={row.value}
                                  alt={row.label}
                                  className="h-64 w-64 rounded-sm border border-line object-cover"
                                />
                              ) : (
                                <span className="text-caption text-secondary">이미지 없음</span>
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageSelect(row.key, e)}
                                disabled={uploadingKey === row.key}
                              />
                            </div>
                            {uploadingKey === row.key && (
                              <p className="text-caption text-secondary">업로드 중...</p>
                            )}
                          </td>
                          <td className="py-8 pl-16">
                            {row.value && (
                              <button
                                type="button"
                                onClick={() => setResetTargetKey(row.key)}
                                className="text-body-sm text-secondary hover:text-point"
                              >
                                제거
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    }

                    return (
                      <tr key={row.key} className="text-body-sm border-b border-line align-top">
                        <td className="py-8 pr-16 text-secondary">{row.label}</td>
                        <td className="py-8 pr-16">
                          {editingKey === row.key ? (
                            <textarea
                              value={draftValue}
                              onChange={(e) => setDraftValue(e.target.value)}
                              rows={2}
                              className="text-body-sm w-full rounded-sm border border-line px-12 py-8"
                            />
                          ) : (
                            row.value
                          )}
                        </td>
                        <td className="py-8 pl-16">
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
                            <button
                              type="button"
                              onClick={() => startEdit(row)}
                              className="text-body-sm text-secondary hover:text-primary"
                            >
                              수정
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
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
    </div>
  )
}

export default ContentManage

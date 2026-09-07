import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { supabase } from '../../lib/supabaseClient'
import Button from '../../components/Button'

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
                    <th className="py-8 pr-16 font-medium">문구</th>
                    <th className="w-120 py-8 pl-16 font-medium">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((row) => (
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default ContentManage

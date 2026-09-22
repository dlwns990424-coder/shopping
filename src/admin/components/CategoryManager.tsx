import { useCallback, useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import Button from '../../components/Button'
import Input from '../../components/Input'
import ConfirmModal from '../../components/ConfirmModal'

interface CategoryRow {
  label: string
  sort_order: number
}

interface SubcategoryRow {
  category_label: string
  label: string
  sort_order: number
}

type DeleteTarget = { kind: 'category'; label: string } | { kind: 'subcategory'; categoryLabel: string; label: string }

function CategoryManager() {
  const [categories, setCategories] = useState<CategoryRow[]>([])
  const [subcategories, setSubcategories] = useState<SubcategoryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newCategoryLabel, setNewCategoryLabel] = useState('')
  const [newSubcategoryLabels, setNewSubcategoryLabels] = useState<Record<string, string>>({})
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    const [categoriesResult, subcategoriesResult] = await Promise.all([
      supabase.from('categories').select('label, sort_order').order('sort_order', { ascending: true }),
      supabase
        .from('subcategories')
        .select('category_label, label, sort_order')
        .order('sort_order', { ascending: true }),
    ])

    if (categoriesResult.error) {
      setError(categoriesResult.error.message)
      setLoading(false)
      return
    }
    if (subcategoriesResult.error) {
      setError(subcategoriesResult.error.message)
      setLoading(false)
      return
    }

    setCategories(categoriesResult.data ?? [])
    setSubcategories(subcategoriesResult.data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const subcategoriesOf = (categoryLabel: string) =>
    subcategories.filter((row) => row.category_label === categoryLabel)

  const addCategory = async () => {
    const label = newCategoryLabel.trim()
    if (!label) return
    if (categories.some((row) => row.label === label)) {
      setError('이미 있는 대분류입니다.')
      return
    }

    setBusy(true)
    setError(null)
    const nextSortOrder = categories.reduce((max, row) => Math.max(max, row.sort_order), 0) + 10
    const { error: insertError } = await supabase.from('categories').insert({ label, sort_order: nextSortOrder })
    setBusy(false)
    if (insertError) {
      setError(insertError.message)
      return
    }
    setNewCategoryLabel('')
    load()
  }

  const addSubcategory = async (categoryLabel: string) => {
    const label = (newSubcategoryLabels[categoryLabel] ?? '').trim()
    if (!label) return
    if (subcategoriesOf(categoryLabel).some((row) => row.label === label)) {
      setError('이미 있는 서브 카테고리입니다.')
      return
    }

    setBusy(true)
    setError(null)
    const nextSortOrder = subcategoriesOf(categoryLabel).reduce((max, row) => Math.max(max, row.sort_order), 0) + 10
    const { error: insertError } = await supabase
      .from('subcategories')
      .insert({ category_label: categoryLabel, label, sort_order: nextSortOrder })
    setBusy(false)
    if (insertError) {
      setError(insertError.message)
      return
    }
    setNewSubcategoryLabels((prev) => ({ ...prev, [categoryLabel]: '' }))
    load()
  }

  const moveCategory = async (label: string, direction: -1 | 1) => {
    const index = categories.findIndex((row) => row.label === label)
    const targetIndex = index + direction
    if (index === -1 || targetIndex < 0 || targetIndex >= categories.length) return

    const current = categories[index]
    const target = categories[targetIndex]
    setBusy(true)
    setError(null)
    const [a, b] = await Promise.all([
      supabase.from('categories').update({ sort_order: target.sort_order }).eq('label', current.label),
      supabase.from('categories').update({ sort_order: current.sort_order }).eq('label', target.label),
    ])
    setBusy(false)
    if (a.error || b.error) {
      setError(a.error?.message ?? b.error?.message ?? '순서 변경에 실패했습니다.')
      return
    }
    load()
  }

  const moveSubcategory = async (categoryLabel: string, label: string, direction: -1 | 1) => {
    const list = subcategoriesOf(categoryLabel)
    const index = list.findIndex((row) => row.label === label)
    const targetIndex = index + direction
    if (index === -1 || targetIndex < 0 || targetIndex >= list.length) return

    const current = list[index]
    const target = list[targetIndex]
    setBusy(true)
    setError(null)
    const [a, b] = await Promise.all([
      supabase
        .from('subcategories')
        .update({ sort_order: target.sort_order })
        .eq('category_label', categoryLabel)
        .eq('label', current.label),
      supabase
        .from('subcategories')
        .update({ sort_order: current.sort_order })
        .eq('category_label', categoryLabel)
        .eq('label', target.label),
    ])
    setBusy(false)
    if (a.error || b.error) {
      setError(a.error?.message ?? b.error?.message ?? '순서 변경에 실패했습니다.')
      return
    }
    load()
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setBusy(true)
    setError(null)

    const { error: deleteError } =
      deleteTarget.kind === 'category'
        ? await supabase.from('categories').delete().eq('label', deleteTarget.label)
        : await supabase
            .from('subcategories')
            .delete()
            .eq('category_label', deleteTarget.categoryLabel)
            .eq('label', deleteTarget.label)

    setBusy(false)
    setDeleteTarget(null)
    if (deleteError) {
      setError(deleteError.message)
      return
    }
    load()
  }

  if (loading) return <p className="text-body-sm text-secondary">불러오는 중...</p>

  return (
    <div className="flex flex-col gap-16 rounded-sm border border-line p-16 lg:p-20">
      <p className="text-caption text-secondary">
        상품 카테고리(대분류/서브 카테고리) 종류를 관리합니다. 여기서 삭제한 카테고리를 이미 쓰고 있는 상품이
        있으면 그 상품의 카테고리 값은 그대로 남으니(문자열 저장이라 자동으로 안 바뀝니다), 삭제 전에 해당
        카테고리 상품이 없는지 상품관리에서 먼저 확인해주세요.
      </p>

      {error && <p className="text-body-sm text-danger">{error}</p>}

      <div className="flex flex-col gap-12">
        {categories.map((category, index) => (
          <div key={category.label} className="flex flex-col gap-8 rounded-sm border border-line p-12">
            <div className="flex items-center justify-between gap-8">
              <p className="text-body-sm font-medium">{category.label}</p>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  disabled={busy || index === 0}
                  onClick={() => moveCategory(category.label, -1)}
                  className="flex h-28 w-28 items-center justify-center rounded-sm border border-line bg-transparent disabled:cursor-default disabled:opacity-30"
                >
                  <ChevronUp size={14} strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  disabled={busy || index === categories.length - 1}
                  onClick={() => moveCategory(category.label, 1)}
                  className="flex h-28 w-28 items-center justify-center rounded-sm border border-line bg-transparent disabled:cursor-default disabled:opacity-30"
                >
                  <ChevronDown size={14} strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setDeleteTarget({ kind: 'category', label: category.label })}
                  aria-label={`${category.label} 삭제`}
                  className="flex h-28 w-28 items-center justify-center rounded-sm border border-line bg-transparent text-danger disabled:cursor-default disabled:opacity-30"
                >
                  <Trash2 size={14} strokeWidth={1.5} />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-6 pl-16">
              {subcategoriesOf(category.label).map((sub, subIndex, subList) => (
                <div key={sub.label} className="flex items-center justify-between gap-8">
                  <p className="text-body-sm text-secondary">{sub.label}</p>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      disabled={busy || subIndex === 0}
                      onClick={() => moveSubcategory(category.label, sub.label, -1)}
                      className="flex h-24 w-24 items-center justify-center rounded-sm border border-line bg-transparent disabled:cursor-default disabled:opacity-30"
                    >
                      <ChevronUp size={12} strokeWidth={1.5} />
                    </button>
                    <button
                      type="button"
                      disabled={busy || subIndex === subList.length - 1}
                      onClick={() => moveSubcategory(category.label, sub.label, 1)}
                      className="flex h-24 w-24 items-center justify-center rounded-sm border border-line bg-transparent disabled:cursor-default disabled:opacity-30"
                    >
                      <ChevronDown size={12} strokeWidth={1.5} />
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => setDeleteTarget({ kind: 'subcategory', categoryLabel: category.label, label: sub.label })}
                      aria-label={`${sub.label} 삭제`}
                      className="flex h-24 w-24 items-center justify-center rounded-sm border border-line bg-transparent text-danger disabled:cursor-default disabled:opacity-30"
                    >
                      <Trash2 size={12} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              ))}

              <div className="mt-4 flex gap-8">
                <Input
                  value={newSubcategoryLabels[category.label] ?? ''}
                  onChange={(e) =>
                    setNewSubcategoryLabels((prev) => ({ ...prev, [category.label]: e.target.value }))
                  }
                  placeholder="새 서브 카테고리"
                  className="text-body-sm"
                />
                <Button size="small" variant="secondary" disabled={busy} onClick={() => addSubcategory(category.label)}>
                  추가
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-8 border-t border-line pt-16">
        <Input
          value={newCategoryLabel}
          onChange={(e) => setNewCategoryLabel(e.target.value)}
          placeholder="새 대분류"
          className="text-body-sm"
        />
        <Button size="small" disabled={busy} onClick={addCategory}>
          대분류 추가
        </Button>
      </div>

      {deleteTarget && (
        <ConfirmModal
          message={
            deleteTarget.kind === 'category'
              ? `"${deleteTarget.label}" 대분류를 삭제할까요? 하위 서브 카테고리도 함께 삭제됩니다.`
              : `"${deleteTarget.label}" 서브 카테고리를 삭제할까요?`
          }
          confirmLabel="삭제"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}

export default CategoryManager

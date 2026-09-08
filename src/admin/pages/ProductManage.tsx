import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Helmet } from 'react-helmet-async'
import { ChevronDown, GripVertical } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import Button from '../../components/Button'
import Input from '../../components/Input'
import ConfirmModal from '../../components/ConfirmModal'
import { formatPrice } from '../../utils/formatPrice'
import { uploadImage } from '../../utils/uploadImage'
import { sizeOptions } from '../../mock/productDetail'

interface AdminProduct {
  id: string
  name: string
  price: number
  sale_price: number | null
  gender: 'men' | 'women'
  category: string
  sub_category: string
  image: string
  color_label: string
  color_hex: string
  sizes: string[]
  description: string
  sort_order: number
}

const CATEGORIES = ['아우터', '상의', '하의']

const SUB_CATEGORIES: Record<string, string[]> = {
  아우터: ['코트', '자켓·블레이저', '패딩', '가디건'],
  상의: ['셔츠', '티셔츠', '니트·스웨트', '후드'],
  하의: ['데님', '슬랙스', '반바지'],
}

const EMPTY_FORM = {
  name: '',
  price: '',
  sale_price: '',
  gender: 'men' as 'men' | 'women',
  category: CATEGORIES[0],
  sub_category: SUB_CATEGORIES[CATEGORIES[0]][0],
  image: '',
  color_label: '',
  color_hex: '#000000',
  sizes: [] as string[],
  description: '',
}

function ProductManage() {
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [genderFilter, setGenderFilter] = useState<'all' | 'men' | 'women'>('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [search, setSearch] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const dragSlotsRef = useRef<number[]>([])

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) setError(error.message)
    else setProducts(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const filteredProducts = products.filter((product) => {
    if (genderFilter !== 'all' && product.gender !== genderFilter) return false
    if (categoryFilter !== 'all' && product.category !== categoryFilter) return false
    if (search && !product.name.includes(search)) return false
    return true
  })

  const handleDragStart = (id: string) => {
    setDraggedId(id)
    dragSlotsRef.current = filteredProducts.map((product) => product.sort_order)
  }

  const handleDragEnter = (targetId: string) => {
    if (!draggedId || draggedId === targetId) return

    const ids = filteredProducts.map((product) => product.id)
    const fromIndex = ids.indexOf(draggedId)
    const toIndex = ids.indexOf(targetId)
    if (fromIndex === -1 || toIndex === -1) return

    const reorderedIds = [...ids]
    const [movedId] = reorderedIds.splice(fromIndex, 1)
    reorderedIds.splice(toIndex, 0, movedId)

    const filteredIdSet = new Set(ids)
    const byId = new Map(products.map((product) => [product.id, product]))
    let cursor = 0
    setProducts(
      products.map((product) =>
        filteredIdSet.has(product.id) ? byId.get(reorderedIds[cursor++])! : product,
      ),
    )
  }

  const handleDragEnd = async () => {
    const sourceId = draggedId
    setDraggedId(null)
    const slots = dragSlotsRef.current
    dragSlotsRef.current = []
    if (!sourceId) return

    const updates = filteredProducts
      .map((product, index) => ({ id: product.id, sort_order: slots[index] }))
      .filter((update) => update.sort_order !== products.find((product) => product.id === update.id)?.sort_order)

    if (updates.length === 0) return

    setProducts((prev) => {
      const sortOrderById = new Map(updates.map((update) => [update.id, update.sort_order]))
      return prev.map((product) =>
        sortOrderById.has(product.id) ? { ...product, sort_order: sortOrderById.get(product.id)! } : product,
      )
    })

    const results = await Promise.all(
      updates.map((update) => supabase.from('products').update({ sort_order: update.sort_order }).eq('id', update.id)),
    )
    const failed = results.find((result) => result.error)
    if (failed?.error) setError(failed.error.message)
  }

  const openCreateForm = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  const openEditForm = (product: AdminProduct) => {
    setEditingId(product.id)
    setForm({
      name: product.name,
      price: String(product.price),
      sale_price: product.sale_price != null ? String(product.sale_price) : '',
      gender: product.gender,
      category: product.category,
      sub_category: product.sub_category,
      image: product.image,
      color_label: product.color_label,
      color_hex: product.color_hex,
      sizes: product.sizes,
      description: product.description,
    })
    setShowForm(true)
  }

  const handleCategoryChange = (category: string) => {
    setForm((prev) => ({ ...prev, category, sub_category: SUB_CATEGORIES[category]?.[0] ?? '' }))
  }

  const handleSizeToggle = (size: string) => {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size) ? prev.sizes.filter((item) => item !== size) : [...prev.sizes, size],
    }))
  }

  const handleImageSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)

    try {
      const url = await uploadImage(file, 'products')
      setForm((prev) => ({ ...prev, image: url }))
    } catch (err) {
      setError(err instanceof Error ? err.message : '이미지 업로드에 실패했습니다.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload = {
      name: form.name,
      price: Number(form.price),
      sale_price: form.sale_price ? Number(form.sale_price) : null,
      gender: form.gender,
      category: form.category,
      sub_category: form.sub_category,
      image: form.image,
      color_label: form.color_label,
      color_hex: form.color_hex,
      sizes: form.sizes,
      description: form.description,
    }

    const nextSortOrder = products.reduce((max, product) => Math.max(max, product.sort_order), 0) + 10

    const { error } = editingId
      ? await supabase.from('products').update(payload).eq('id', editingId)
      : await supabase
          .from('products')
          .insert({ id: `${form.gender}-admin-${Date.now()}`, sort_order: nextSortOrder, ...payload })

    setSaving(false)

    if (error) {
      setError(error.message)
      return
    }

    setShowForm(false)
    loadProducts()
  }

  const confirmDelete = async () => {
    if (!deleteTargetId) return

    const { error } = await supabase.from('products').delete().eq('id', deleteTargetId)
    setDeleteTargetId(null)

    if (error) {
      setError(error.message)
      return
    }
    loadProducts()
  }

  return (
    <div className="flex flex-col gap-24">
      <Helmet>
        <title>NOVERA Admin | 상품관리</title>
      </Helmet>
      <div className="flex items-center justify-between">
        <h1 className="text-h1">상품관리</h1>
        <Button size="small" onClick={openCreateForm}>
          상품 추가
        </Button>
      </div>

      {error && <p className="text-body-sm text-point">{error}</p>}

      <div className="flex flex-wrap items-center gap-8">
        <div className="relative">
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value as 'all' | 'men' | 'women')}
            className="text-body-sm appearance-none rounded-sm border border-line py-8 pl-12 pr-36"
          >
            <option value="all">전체 성별</option>
            <option value="men">MEN</option>
            <option value="women">WOMEN</option>
          </select>
          <ChevronDown
            size={16}
            strokeWidth={1.5}
            className="pointer-events-none absolute right-12 top-1/2 -translate-y-1/2 text-secondary"
          />
        </div>
        <div className="relative">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-body-sm appearance-none rounded-sm border border-line py-8 pl-12 pr-36"
          >
            <option value="all">전체 카테고리</option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            strokeWidth={1.5}
            className="pointer-events-none absolute right-12 top-1/2 -translate-y-1/2 text-secondary"
          />
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="상품명 검색"
          className="text-body-sm rounded-sm border border-line px-12 py-8"
        />
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-16 rounded-sm border border-line p-20">
          <h2 className="text-h3 font-bold">{editingId ? '상품 수정' : '상품 추가'}</h2>

          <div className="grid grid-cols-2 gap-16">
            <Input
              label="상품명"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
            <Input
              label="가격"
              type="number"
              min={0}
              value={form.price}
              onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
              required
            />
            <Input
              label="할인가 (선택, 비워두면 할인 없음)"
              type="number"
              min={0}
              value={form.sale_price}
              onChange={(e) => setForm((prev) => ({ ...prev, sale_price: e.target.value }))}
            />

            <div className="flex flex-col gap-8">
              <label className="text-caption text-secondary">성별</label>
              <div className="relative">
                <select
                  value={form.gender}
                  onChange={(e) => setForm((prev) => ({ ...prev, gender: e.target.value as 'men' | 'women' }))}
                  className="text-sm w-full appearance-none rounded-sm border border-line py-12 pl-16 pr-40"
                >
                  <option value="men">MEN</option>
                  <option value="women">WOMEN</option>
                </select>
                <ChevronDown
                  size={16}
                  strokeWidth={1.5}
                  className="pointer-events-none absolute right-16 top-1/2 -translate-y-1/2 text-secondary"
                />
              </div>
            </div>

            <div className="flex flex-col gap-8">
              <label className="text-caption text-secondary">카테고리</label>
              <div className="relative">
                <select
                  value={form.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="text-sm w-full appearance-none rounded-sm border border-line py-12 pl-16 pr-40"
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  strokeWidth={1.5}
                  className="pointer-events-none absolute right-16 top-1/2 -translate-y-1/2 text-secondary"
                />
              </div>
            </div>

            <div className="flex flex-col gap-8">
              <label className="text-caption text-secondary">서브 카테고리</label>
              <div className="relative">
                <select
                  value={form.sub_category}
                  onChange={(e) => setForm((prev) => ({ ...prev, sub_category: e.target.value }))}
                  className="text-sm w-full appearance-none rounded-sm border border-line py-12 pl-16 pr-40"
                >
                  {(SUB_CATEGORIES[form.category] ?? []).map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  strokeWidth={1.5}
                  className="pointer-events-none absolute right-16 top-1/2 -translate-y-1/2 text-secondary"
                />
              </div>
            </div>

            <div className="flex flex-col gap-8">
              <label className="text-caption text-secondary">상품 이미지</label>
              <div className="flex items-center gap-16">
                {form.image ? (
                  <img
                    src={form.image}
                    alt="상품 이미지 미리보기"
                    className="h-96 w-96 rounded-sm border border-line object-cover"
                  />
                ) : (
                  <div className="flex h-96 w-96 items-center justify-center rounded-sm border border-dashed border-line">
                    <span className="text-caption text-secondary">이미지 없음</span>
                  </div>
                )}
                <Button
                  as="label"
                  variant="secondary"
                  size="small"
                  className="cursor-pointer"
                  aria-disabled={uploading}
                >
                  {uploading ? '업로드 중...' : '이미지 선택'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageSelect}
                    disabled={uploading}
                  />
                </Button>
              </div>
            </div>
            <Input
              label="색상명"
              value={form.color_label}
              onChange={(e) => setForm((prev) => ({ ...prev, color_label: e.target.value }))}
              required
            />
            <div className="flex flex-col gap-8">
              <label className="text-caption text-secondary">색상 코드</label>
              <div className="flex items-center gap-12">
                <input
                  type="color"
                  value={form.color_hex}
                  onChange={(e) => setForm((prev) => ({ ...prev, color_hex: e.target.value }))}
                  className="h-48 w-48 cursor-pointer rounded-sm border border-line p-0"
                />
                <span className="text-sm text-secondary">{form.color_hex}</span>
              </div>
            </div>

            <div className="flex flex-col gap-8">
              <label className="text-caption text-secondary">사이즈 (1개 이상 선택)</label>
              <div className="flex flex-wrap gap-8">
                {sizeOptions.map((size) => {
                  const selected = form.sizes.includes(size)
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleSizeToggle(size)}
                      className={`h-36 min-w-44 rounded-sm border px-12 text-sm transition-colors ${
                        selected
                          ? 'border-primary bg-primary text-surface'
                          : 'border-line bg-surface text-primary hover:border-primary'
                      }`}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <label className="text-caption text-secondary">상품 설명</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="text-sm rounded-sm border border-line px-16 py-12"
              required
            />
          </div>

          <div className="flex gap-8">
            <Button
              type="submit"
              size="small"
              disabled={saving || uploading || !form.image || form.sizes.length === 0}
            >
              {saving ? '저장 중...' : '저장'}
            </Button>
            <Button type="button" variant="secondary" size="small" onClick={() => setShowForm(false)}>
              취소
            </Button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-body-sm text-secondary">불러오는 중...</p>
      ) : filteredProducts.length === 0 ? (
        <p className="text-body-sm text-secondary">조건에 맞는 상품이 없습니다.</p>
      ) : (
        <div className="overflow-x-auto">
          <p className="text-caption mb-8 text-secondary">행을 드래그하면 진열 순서를 바꿀 수 있습니다.</p>
          <table className="w-full min-w-720 border-collapse text-left">
            <thead>
              <tr className="text-body-sm border-b border-line text-secondary">
                <th className="w-32 py-8 pr-8" />
                <th className="w-56 py-8 pr-16 font-medium">사진</th>
                <th className="py-8 pr-16 font-medium">상품명</th>
                <th className="py-8 pr-16 font-medium">성별</th>
                <th className="py-8 pr-16 font-medium">카테고리</th>
                <th className="py-8 pr-16 font-medium">색상</th>
                <th className="py-8 pr-16 text-right font-medium">가격</th>
                <th className="py-8 pl-16 font-medium">관리</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr
                  key={product.id}
                  onDragOver={(e) => e.preventDefault()}
                  onDragEnter={() => handleDragEnter(product.id)}
                  className={`text-body-sm border-b border-line transition-opacity duration-150 ${
                    draggedId === product.id ? 'opacity-40' : ''
                  }`}
                >
                  <td className="py-8 pr-8">
                    <span
                      draggable
                      onDragStart={() => handleDragStart(product.id)}
                      onDragEnd={handleDragEnd}
                      className="inline-flex cursor-grab text-secondary active:cursor-grabbing"
                    >
                      <GripVertical size={16} strokeWidth={1.5} />
                    </span>
                  </td>
                  <td className="py-8 pr-16">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-40 w-40 rounded-sm border border-line object-cover"
                    />
                  </td>
                  <td className="py-8 pr-16">{product.name}</td>
                  <td className="py-8 pr-16">{product.gender === 'men' ? 'MEN' : 'WOMEN'}</td>
                  <td className="py-8 pr-16">
                    {product.category} · {product.sub_category}
                  </td>
                  <td className="py-8 pr-16">
                    <span className="inline-flex items-center gap-8">
                      <span
                        className="inline-block h-16 w-16 rounded-full border border-line"
                        style={{ backgroundColor: product.color_hex }}
                      />
                      {product.color_label}
                    </span>
                  </td>
                  <td className="py-8 pr-16 text-right">
                    {product.sale_price != null ? (
                      <span className="inline-flex flex-col items-end">
                        <span className="text-caption text-secondary line-through">{formatPrice(product.price)}</span>
                        <span className="text-point">{formatPrice(product.sale_price)}</span>
                      </span>
                    ) : (
                      formatPrice(product.price)
                    )}
                  </td>
                  <td className="py-8 pl-16">
                    <div className="flex gap-8">
                      <button
                        type="button"
                        onClick={() => openEditForm(product)}
                        className="text-body-sm text-secondary hover:text-primary"
                      >
                        수정
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTargetId(product.id)}
                        className="text-body-sm text-secondary hover:text-point"
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleteTargetId && (
        <ConfirmModal
          message="이 상품을 삭제할까요?"
          confirmLabel="삭제"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTargetId(null)}
        />
      )}
    </div>
  )
}

export default ProductManage

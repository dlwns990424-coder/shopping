import { Fragment, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Helmet } from 'react-helmet-async'
import { ChevronDown, ChevronUp, GripVertical, Star } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import Button from '../../components/Button'
import Input from '../../components/Input'
import ConfirmModal from '../../components/ConfirmModal'
import { formatPrice } from '../../utils/formatPrice'
import { uploadImage } from '../../utils/uploadImage'
import { sizeOptions } from '../../mock/productDetail'
import { MAX_DETAIL_IMAGES } from '../../types'
import { useCategories } from '../../context/CategoriesContext'
import { useReviews } from '../../context/ReviewsContext'

interface AdminProduct {
  id: string
  name: string
  price: number
  sale_price: number | null
  gender: 'men' | 'women'
  category: string
  sub_category: string
  image: string
  detail_images: string[]
  hover_image: string | null
  color_label: string
  color_hex: string
  sizes: string[]
  description: string
  sort_order: number
}

const EMPTY_FORM = {
  name: '',
  price: '',
  sale_price: '',
  gender: 'men' as 'men' | 'women',
  category: '',
  sub_category: '',
  image: '',
  detail_images: [] as string[],
  hover_image: '',
  color_label: '',
  color_hex: '#000000',
  sizes: [] as string[],
  description: '',
}

function ProductManage() {
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { reviews, deleteReview } = useReviews()
  const { categoryLabels, subCategoriesByCategory } = useCategories()
  const [reviewManageId, setReviewManageId] = useState<string | null>(null)
  const [reviewDeleteTargetId, setReviewDeleteTargetId] = useState<string | null>(null)

  const [genderFilter, setGenderFilter] = useState<'all' | 'men' | 'women'>('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [search, setSearch] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [initialForm, setInitialForm] = useState(EMPTY_FORM)
  const [discardConfirmAction, setDiscardConfirmAction] = useState<(() => void) | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadingDetailImage, setUploadingDetailImage] = useState(false)
  const [uploadingHoverImage, setUploadingHoverImage] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const dragSlotsRef = useRef<number[]>([])
  // 이동 버튼을 빠르게 연타하면 handleMove가 재실행되는 사이 products state가 아직 커밋되지
  // 않아 이전 목록을 기준으로 계산할 수 있다. 커밋 직후 최신값으로 갱신되는 ref를 대신 읽는다.
  const productsRef = useRef<AdminProduct[]>([])
  useEffect(() => {
    productsRef.current = products
  }, [products])

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

  const filterProducts = (list: AdminProduct[]) =>
    list.filter((product) => {
      if (genderFilter !== 'all' && product.gender !== genderFilter) return false
      if (categoryFilter !== 'all' && product.category !== categoryFilter) return false
      if (search && !product.name.includes(search)) return false
      return true
    })

  const filteredProducts = filterProducts(products)

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

  const handleMove = async (id: string, direction: -1 | 1) => {
    const currentFiltered = filterProducts(productsRef.current)
    const fromIndex = currentFiltered.findIndex((product) => product.id === id)
    const toIndex = fromIndex + direction
    if (fromIndex < 0 || toIndex < 0 || toIndex >= currentFiltered.length) return

    const slots = currentFiltered.map((product) => product.sort_order)
    const reordered = [...currentFiltered]
    const [moved] = reordered.splice(fromIndex, 1)
    reordered.splice(toIndex, 0, moved)
    const nextFiltered = reordered.map((product, index) => ({ ...product, sort_order: slots[index] }))
    const filteredIds = new Set(currentFiltered.map((product) => product.id))
    let cursor = 0
    const nextProducts = productsRef.current.map((product) =>
      filteredIds.has(product.id) ? nextFiltered[cursor++] : product,
    )
    productsRef.current = nextProducts
    setProducts(nextProducts)

    const updates = nextFiltered
      .filter((product) => product.sort_order !== currentFiltered.find((item) => item.id === product.id)?.sort_order)
      .map((product) => ({ id: product.id, sort_order: product.sort_order }))
    const results = await Promise.all(
      updates.map((update) => supabase.from('products').update({ sort_order: update.sort_order }).eq('id', update.id)),
    )
    const failed = results.find((result) => result.error)
    if (failed?.error) {
      setError(failed.error.message)
      loadProducts()
    }
  }

  const openCreateForm = () => {
    const defaultCategory = categoryLabels[0] ?? ''
    const nextForm = {
      ...EMPTY_FORM,
      category: defaultCategory,
      sub_category: subCategoriesByCategory[defaultCategory]?.[0] ?? '',
    }
    setEditingId(null)
    setReviewManageId(null)
    setInitialForm(nextForm)
    setForm(nextForm)
    setShowForm(true)
  }

  const toggleReviewManage = (id: string) => {
    setShowForm(false)
    setEditingId(null)
    setReviewManageId((prev) => (prev === id ? null : id))
  }

  const openEditForm = (product: AdminProduct) => {
    setReviewManageId(null)
    setEditingId(product.id)
    const nextForm = {
      name: product.name,
      price: String(product.price),
      sale_price: product.sale_price != null ? String(product.sale_price) : '',
      gender: product.gender,
      category: product.category,
      sub_category: product.sub_category,
      image: product.image,
      detail_images: product.detail_images,
      hover_image: product.hover_image ?? '',
      color_label: product.color_label,
      color_hex: product.color_hex,
      sizes: product.sizes,
      description: product.description,
    }
    setInitialForm(nextForm)
    setForm(nextForm)
    setShowForm(true)
  }

  // 저장 안 한 이미지 업로드·입력값이 있는 채로 폼을 닫거나 다른 상품 수정으로 전환하면
  // 경고 없이 통째로 날아가던 문제(오늘 세션에 실제로 겪음) — 변경사항이 있으면 한 번 더 확인한다.
  const isFormDirty = showForm && JSON.stringify(form) !== JSON.stringify(initialForm)

  const requestFormClose = (action: () => void) => {
    if (isFormDirty) {
      setDiscardConfirmAction(() => action)
    } else {
      action()
    }
  }

  const handleCategoryChange = (category: string) => {
    setForm((prev) => ({ ...prev, category, sub_category: subCategoriesByCategory[category]?.[0] ?? '' }))
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

  const handleDetailImageAdd = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingDetailImage(true)
    setError(null)

    try {
      const url = await uploadImage(file, 'products')
      setForm((prev) => ({ ...prev, detail_images: [...prev.detail_images, url] }))
    } catch (err) {
      setError(err instanceof Error ? err.message : '이미지 업로드에 실패했습니다.')
    } finally {
      setUploadingDetailImage(false)
      e.target.value = ''
    }
  }

  const handleDetailImageRemove = (index: number) => {
    setForm((prev) => ({ ...prev, detail_images: prev.detail_images.filter((_, i) => i !== index) }))
  }

  const handleHoverImageSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingHoverImage(true)
    setError(null)

    try {
      const url = await uploadImage(file, 'products')
      setForm((prev) => ({ ...prev, hover_image: url }))
    } catch (err) {
      setError(err instanceof Error ? err.message : '이미지 업로드에 실패했습니다.')
    } finally {
      setUploadingHoverImage(false)
      e.target.value = ''
    }
  }

  const handleHoverImageRemove = () => {
    setForm((prev) => ({ ...prev, hover_image: '' }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    const price = Number(form.price)
    const salePrice = form.sale_price ? Number(form.sale_price) : null
    if (salePrice != null && salePrice >= price) {
      setError('할인가는 정가보다 낮아야 합니다.')
      return
    }

    setSaving(true)

    const payload = {
      name: form.name,
      price,
      sale_price: salePrice,
      gender: form.gender,
      category: form.category,
      sub_category: form.sub_category,
      image: form.image,
      detail_images: form.detail_images,
      hover_image: form.hover_image || null,
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

  const editFormElement = showForm && (
    <form onSubmit={handleSubmit} className="flex flex-col gap-16 rounded-sm border border-line bg-surface p-20">
      <h2 className="text-h3 font-bold">{editingId ? '상품 수정' : '상품 추가'}</h2>

      <div className="grid grid-cols-1 gap-16 md:grid-cols-2">
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
              {categoryLabels.map((category) => (
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
              {(subCategoriesByCategory[form.category] ?? []).map((sub) => (
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
          <div className="flex flex-col items-start gap-16 sm:flex-row sm:items-center">
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

        <div className="flex flex-col gap-8 md:col-span-2">
          <label className="text-caption text-secondary">
            상세 이미지 (PDP에 노출, 최대 {MAX_DETAIL_IMAGES}장)
          </label>
          <div className="flex flex-wrap items-center gap-16">
            {form.detail_images.map((src, index) => (
              <div key={src} className="relative">
                <img
                  src={src}
                  alt={`상세 이미지 ${index + 1}`}
                  className="h-96 w-96 rounded-sm border border-line object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleDetailImageRemove(index)}
                  className="absolute -right-8 -top-8 flex h-24 w-24 items-center justify-center rounded-full border border-line bg-surface text-secondary hover:text-point"
                  aria-label="상세 이미지 제거"
                >
                  ×
                </button>
              </div>
            ))}
            {form.detail_images.length < MAX_DETAIL_IMAGES && (
              <Button
                as="label"
                variant="secondary"
                size="small"
                className="cursor-pointer"
                aria-disabled={uploadingDetailImage}
              >
                {uploadingDetailImage ? '업로드 중...' : '이미지 추가'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleDetailImageAdd}
                  disabled={uploadingDetailImage}
                />
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-8 md:col-span-2">
          <label className="text-caption text-secondary">호버 이미지 (선택, 상품카드에 마우스 올리면 노출)</label>
          <div className="flex flex-col items-start gap-16 sm:flex-row sm:items-center">
            {form.hover_image ? (
              <img
                src={form.hover_image}
                alt="호버 이미지 미리보기"
                className="h-96 w-96 rounded-sm border border-line object-cover"
              />
            ) : (
              <div className="flex h-96 w-96 items-center justify-center rounded-sm border border-dashed border-line">
                <span className="text-caption text-secondary">이미지 없음</span>
              </div>
            )}
            <div className="flex flex-col gap-8">
              <Button
                as="label"
                variant="secondary"
                size="small"
                className="cursor-pointer"
                aria-disabled={uploadingHoverImage}
              >
                {uploadingHoverImage ? '업로드 중...' : '이미지 선택'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleHoverImageSelect}
                  disabled={uploadingHoverImage}
                />
              </Button>
              {form.hover_image && (
                <button
                  type="button"
                  onClick={handleHoverImageRemove}
                  className="text-body-sm text-secondary hover:text-point"
                >
                  제거
                </button>
              )}
            </div>
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
          disabled={
            saving ||
            uploading ||
            uploadingDetailImage ||
            uploadingHoverImage ||
            !form.image ||
            form.sizes.length === 0
          }
        >
          {saving ? '저장 중...' : '저장'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="small"
          onClick={() => requestFormClose(() => setShowForm(false))}
        >
          취소
        </Button>
      </div>
    </form>
  )

  return (
    <div className="flex flex-col gap-24">
      <Helmet>
        <title>NOVERA Admin | 상품관리</title>
      </Helmet>
      <div className="flex items-center justify-between">
        <h1 className="text-h1">상품관리</h1>
        <Button size="small" onClick={() => requestFormClose(openCreateForm)}>
          상품 추가
        </Button>
      </div>

      {error && <p className="text-body-sm text-danger">{error}</p>}

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
            {categoryLabels.map((category) => (
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

      {editingId === null && editFormElement}

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
              {filteredProducts.map((product, productIndex) => (
                <Fragment key={product.id}>
                <tr
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
                      className="hidden cursor-grab text-secondary active:cursor-grabbing md:inline-flex"
                    >
                      <GripVertical size={16} strokeWidth={1.5} />
                    </span>
                    <div className="flex flex-col md:hidden">
                      <button
                        type="button"
                        aria-label={`${product.name} 위로 이동`}
                        disabled={productIndex === 0}
                        className="flex h-24 w-24 items-center justify-center text-secondary disabled:text-disabled"
                        onClick={() => handleMove(product.id, -1)}
                      >
                        <ChevronUp size={14} strokeWidth={1.5} />
                      </button>
                      <button
                        type="button"
                        aria-label={`${product.name} 아래로 이동`}
                        disabled={productIndex === filteredProducts.length - 1}
                        className="flex h-24 w-24 items-center justify-center text-secondary disabled:text-disabled"
                        onClick={() => handleMove(product.id, 1)}
                      >
                        <ChevronDown size={14} strokeWidth={1.5} />
                      </button>
                    </div>
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
                        onClick={() => requestFormClose(() => openEditForm(product))}
                        className="text-body-sm text-secondary hover:text-primary"
                      >
                        수정
                      </button>
                      <button
                        type="button"
                        onClick={() => requestFormClose(() => toggleReviewManage(product.id))}
                        className="text-body-sm text-secondary hover:text-primary"
                      >
                        리뷰 관리 ({reviews.filter((review) => review.productId === product.id).length})
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
                {editingId === product.id && (
                  <tr className="border-b border-line bg-surface-muted">
                    <td colSpan={8} className="p-16">
                      {editFormElement}
                    </td>
                  </tr>
                )}
                {reviewManageId === product.id && (
                  <tr className="border-b border-line bg-surface-muted">
                    <td colSpan={8} className="p-16">
                      <div className="flex flex-col gap-12 rounded-sm border border-line bg-surface p-16">
                        <h3 className="text-body-lg font-bold">리뷰 관리 — {product.name}</h3>
                        {reviews.filter((review) => review.productId === product.id).length === 0 ? (
                          <p className="text-body-sm text-secondary">아직 작성된 리뷰가 없습니다.</p>
                        ) : (
                          reviews
                            .filter((review) => review.productId === product.id)
                            .map((review) => (
                              <div
                                key={review.id}
                                className="flex items-start justify-between gap-16 border-b border-line pb-12 last:border-b-0"
                              >
                                <div className="flex flex-col gap-4">
                                  <div className="flex items-center gap-8">
                                    <span className="flex items-center gap-2 text-point">
                                      {Array.from({ length: 5 }).map((_, i) => (
                                        <Star
                                          key={i}
                                          size={14}
                                          strokeWidth={1.5}
                                          fill={i < review.rating ? 'currentColor' : 'none'}
                                        />
                                      ))}
                                    </span>
                                    <span className="text-body-sm font-medium">{review.nickname}</span>
                                    <span className="text-caption text-secondary">
                                      {new Date(review.createdAt).toLocaleDateString('ko-KR')}
                                    </span>
                                  </div>
                                  <p className="text-body-sm text-secondary">{review.content}</p>
                                  {review.photos.length > 0 && (
                                    <div className="flex gap-8">
                                      {review.photos.map((url) => (
                                        <img
                                          key={url}
                                          src={url}
                                          alt="리뷰 사진"
                                          className="h-56 w-56 rounded-sm border border-line object-cover"
                                        />
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setReviewDeleteTargetId(review.id)}
                                  className="text-body-sm shrink-0 text-secondary hover:text-point"
                                >
                                  삭제
                                </button>
                              </div>
                            ))
                        )}
                      </div>
                    </td>
                  </tr>
                )}
                </Fragment>
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

      {discardConfirmAction && (
        <ConfirmModal
          message="저장하지 않은 변경사항이 있습니다. 나가시겠습니까?"
          confirmLabel="나가기"
          cancelLabel="계속 작성"
          onConfirm={() => {
            discardConfirmAction()
            setDiscardConfirmAction(null)
          }}
          onCancel={() => setDiscardConfirmAction(null)}
        />
      )}

      {reviewDeleteTargetId && (
        <ConfirmModal
          message="이 리뷰를 삭제할까요?"
          confirmLabel="삭제"
          onConfirm={async () => {
            await deleteReview(reviewDeleteTargetId)
            setReviewDeleteTargetId(null)
          }}
          onCancel={() => setReviewDeleteTargetId(null)}
        />
      )}
    </div>
  )
}

export default ProductManage

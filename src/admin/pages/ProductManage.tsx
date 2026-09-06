import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../../lib/supabaseClient'
import Button from '../../components/Button'
import Input from '../../components/Input'

interface AdminProduct {
  id: string
  name: string
  price: number
  gender: 'men' | 'women'
  category: string
  sub_category: string
  image: string
  color_label: string
  color_hex: string
  description: string
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
  gender: 'men' as 'men' | 'women',
  category: CATEGORIES[0],
  sub_category: SUB_CATEGORIES[CATEGORIES[0]][0],
  image: '',
  color_label: '',
  color_hex: '#000000',
  description: '',
}

function formatPrice(amount: number) {
  return `₩${amount.toLocaleString('ko-KR')}`
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

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

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
      gender: product.gender,
      category: product.category,
      sub_category: product.sub_category,
      image: product.image,
      color_label: product.color_label,
      color_hex: product.color_hex,
      description: product.description,
    })
    setShowForm(true)
  }

  const handleCategoryChange = (category: string) => {
    setForm((prev) => ({ ...prev, category, sub_category: SUB_CATEGORIES[category]?.[0] ?? '' }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload = {
      name: form.name,
      price: Number(form.price),
      gender: form.gender,
      category: form.category,
      sub_category: form.sub_category,
      image: form.image,
      color_label: form.color_label,
      color_hex: form.color_hex,
      description: form.description,
    }

    const { error } = editingId
      ? await supabase.from('products').update(payload).eq('id', editingId)
      : await supabase.from('products').insert({ id: `${form.gender}-admin-${Date.now()}`, ...payload })

    setSaving(false)

    if (error) {
      setError(error.message)
      return
    }

    setShowForm(false)
    loadProducts()
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('이 상품을 삭제할까요?')) return

    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) {
      setError(error.message)
      return
    }
    loadProducts()
  }

  return (
    <div className="flex flex-col gap-24">
      <div className="flex items-center justify-between">
        <h1 className="text-h1">상품관리</h1>
        <Button size="small" onClick={openCreateForm}>
          상품 추가
        </Button>
      </div>

      {error && <p className="text-body-sm text-point">{error}</p>}

      <div className="flex flex-wrap items-center gap-8">
        <select
          value={genderFilter}
          onChange={(e) => setGenderFilter(e.target.value as 'all' | 'men' | 'women')}
          className="text-body-sm rounded-sm border border-line px-12 py-8"
        >
          <option value="all">전체 성별</option>
          <option value="men">MEN</option>
          <option value="women">WOMEN</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="text-body-sm rounded-sm border border-line px-12 py-8"
        >
          <option value="all">전체 카테고리</option>
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
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

            <div className="flex flex-col gap-8">
              <label className="text-caption text-secondary">성별</label>
              <select
                value={form.gender}
                onChange={(e) => setForm((prev) => ({ ...prev, gender: e.target.value as 'men' | 'women' }))}
                className="text-sm rounded-sm border border-line px-16 py-12"
              >
                <option value="men">MEN</option>
                <option value="women">WOMEN</option>
              </select>
            </div>

            <div className="flex flex-col gap-8">
              <label className="text-caption text-secondary">카테고리</label>
              <select
                value={form.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="text-sm rounded-sm border border-line px-16 py-12"
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-8">
              <label className="text-caption text-secondary">서브 카테고리</label>
              <select
                value={form.sub_category}
                onChange={(e) => setForm((prev) => ({ ...prev, sub_category: e.target.value }))}
                className="text-sm rounded-sm border border-line px-16 py-12"
              >
                {(SUB_CATEGORIES[form.category] ?? []).map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="이미지 URL"
              value={form.image}
              onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.value }))}
              required
            />
            <Input
              label="색상명"
              value={form.color_label}
              onChange={(e) => setForm((prev) => ({ ...prev, color_label: e.target.value }))}
              required
            />
            <Input
              label="색상 코드"
              type="color"
              value={form.color_hex}
              onChange={(e) => setForm((prev) => ({ ...prev, color_hex: e.target.value }))}
              className="max-w-120"
            />
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
            <Button type="submit" size="small" disabled={saving}>
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
          <table className="w-full min-w-720 border-collapse text-left">
            <thead>
              <tr className="text-body-sm border-b border-line text-secondary">
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
                <tr key={product.id} className="text-body-sm border-b border-line">
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
                  <td className="py-8 pr-16 text-right">{formatPrice(product.price)}</td>
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
                        onClick={() => handleDelete(product.id)}
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
    </div>
  )
}

export default ProductManage

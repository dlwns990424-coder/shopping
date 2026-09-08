import { useCallback, useEffect, useRef, useState } from 'react'
import { GripVertical } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'

interface FeaturedProduct {
  id: string
  name: string
  image: string
  featured: boolean
  featured_order: number | null
}

interface FeaturedCarouselManagerProps {
  gender: 'men' | 'women'
  label: string
}

function FeaturedCarouselManager({ gender, label }: FeaturedCarouselManagerProps) {
  const [products, setProducts] = useState<FeaturedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const dragSlotsRef = useRef<number[]>([])

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, image, featured, featured_order')
      .eq('gender', gender)
      .order('name', { ascending: true })

    if (error) setError(error.message)
    else setProducts(data ?? [])
    setLoading(false)
  }, [gender])

  useEffect(() => {
    load()
  }, [load])

  const featured = products
    .filter((product) => product.featured)
    .sort((a, b) => (a.featured_order ?? 0) - (b.featured_order ?? 0))
  const available = products.filter((product) => !product.featured)

  const handleAdd = async (product: FeaturedProduct) => {
    const nextOrder = featured.reduce((max, item) => Math.max(max, item.featured_order ?? 0), 0) + 10
    const { error } = await supabase
      .from('products')
      .update({ featured: true, featured_order: nextOrder })
      .eq('id', product.id)
    if (error) setError(error.message)
    else load()
  }

  const handleRemove = async (product: FeaturedProduct) => {
    const { error } = await supabase
      .from('products')
      .update({ featured: false, featured_order: null })
      .eq('id', product.id)
    if (error) setError(error.message)
    else load()
  }

  const handleDragStart = (id: string) => {
    setDraggedId(id)
    dragSlotsRef.current = featured.map((product) => product.featured_order ?? 0)
  }

  const handleDragEnter = (targetId: string) => {
    if (!draggedId || draggedId === targetId) return

    const ids = featured.map((product) => product.id)
    const fromIndex = ids.indexOf(draggedId)
    const toIndex = ids.indexOf(targetId)
    if (fromIndex === -1 || toIndex === -1) return

    const reorderedIds = [...ids]
    const [movedId] = reorderedIds.splice(fromIndex, 1)
    reorderedIds.splice(toIndex, 0, movedId)

    const featuredIdSet = new Set(ids)
    const byId = new Map(products.map((product) => [product.id, product]))
    let cursor = 0
    setProducts(
      products.map((product) =>
        featuredIdSet.has(product.id) ? byId.get(reorderedIds[cursor++])! : product,
      ),
    )
  }

  const handleDragEnd = async () => {
    const sourceId = draggedId
    setDraggedId(null)
    const slots = dragSlotsRef.current
    dragSlotsRef.current = []
    if (!sourceId) return

    const updates = featured
      .map((product, index) => ({ id: product.id, featured_order: slots[index] }))
      .filter(
        (update) => update.featured_order !== products.find((product) => product.id === update.id)?.featured_order,
      )

    if (updates.length === 0) return

    const results = await Promise.all(
      updates.map((update) =>
        supabase.from('products').update({ featured_order: update.featured_order }).eq('id', update.id),
      ),
    )
    const failed = results.find((result) => result.error)
    if (failed?.error) setError(failed.error.message)
    load()
  }

  if (loading) return <p className="text-body-sm text-secondary">불러오는 중...</p>

  return (
    <div className="flex flex-col gap-16 rounded-md border border-line p-16">
      <h3 className="text-body-lg font-bold">{label}</h3>
      {error && <p className="text-body-sm text-point">{error}</p>}

      <div className="flex flex-col gap-8">
        <p className="text-caption text-secondary">노출 중 (행을 드래그하면 순서를 바꿀 수 있습니다)</p>
        {featured.length === 0 ? (
          <p className="text-body-sm text-secondary">캐러셀에 노출 중인 상품이 없습니다.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {featured.map((product) => (
              <div
                key={product.id}
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={() => handleDragEnter(product.id)}
                className={`flex items-center gap-12 rounded-sm border border-line p-8 transition-opacity duration-150 ${
                  draggedId === product.id ? 'opacity-40' : ''
                }`}
              >
                <span
                  draggable
                  onDragStart={() => handleDragStart(product.id)}
                  onDragEnd={handleDragEnd}
                  className="inline-flex cursor-grab text-secondary active:cursor-grabbing"
                >
                  <GripVertical size={16} strokeWidth={1.5} />
                </span>
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-40 w-40 rounded-sm border border-line object-cover"
                />
                <span className="text-body-sm flex-1">{product.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(product)}
                  className="text-body-sm text-secondary hover:text-point"
                >
                  제외
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-8">
        <p className="text-caption text-secondary">추가 가능한 상품</p>
        <div className="flex max-h-240 flex-wrap gap-8 overflow-y-auto">
          {available.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => handleAdd(product)}
              className="flex items-center gap-8 rounded-sm border border-line px-8 py-4 text-body-sm hover:border-primary"
            >
              <img src={product.image} alt={product.name} className="h-24 w-24 rounded-sm object-cover" />
              {product.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FeaturedCarouselManager

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Product } from '../types'

interface ProductsContextValue {
  products: Product[]
  loading: boolean
  error: string | null
}

const ProductsContext = createContext<ProductsContextValue | null>(null)

interface ProductRow {
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
  featured: boolean
  featured_order: number | null
  description: string
}

function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    salePrice: row.sale_price,
    gender: row.gender,
    category: row.category,
    subCategory: row.sub_category,
    image: row.image,
    color: { label: row.color_label, hex: row.color_hex },
    sizes: row.sizes ?? [],
    featured: row.featured,
    featuredOrder: row.featured_order,
    description: row.description,
  }
}

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .order('sort_order', { ascending: true })
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setProducts((data ?? []).map(toProduct))
        setLoading(false)
      })
  }, [])

  return (
    <ProductsContext.Provider value={{ products, loading, error }}>
      {children}
    </ProductsContext.Provider>
  )
}

export function useProducts() {
  const context = useContext(ProductsContext)
  if (!context) {
    throw new Error('useProducts must be used within a ProductsProvider')
  }
  return context
}

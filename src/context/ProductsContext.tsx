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
  gender: 'men' | 'women'
  category: string
  sub_category: string
  image: string
  color_label: string
  color_hex: string
  description: string
}

function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    gender: row.gender,
    category: row.category,
    subCategory: row.sub_category,
    image: row.image,
    color: { label: row.color_label, hex: row.color_hex },
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
      .order('created_at', { ascending: true })
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

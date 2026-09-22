import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabaseClient'

export interface CategoryTab {
  id: string
  label: string
}

interface CategoriesContextValue {
  categoryLabels: string[]
  categoryTabs: CategoryTab[]
  subCategoriesByCategory: Record<string, string[]>
  loading: boolean
  error: string | null
}

const CategoriesContext = createContext<CategoriesContextValue | null>(null)

interface CategoryRow {
  label: string
  sort_order: number
}

interface SubcategoryRow {
  category_label: string
  label: string
  sort_order: number
}

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const [categoryLabels, setCategoryLabels] = useState<string[]>([])
  const [subCategoriesByCategory, setSubCategoriesByCategory] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const [categoriesResult, subcategoriesResult] = await Promise.all([
        supabase.from('categories').select('label, sort_order').order('sort_order', { ascending: true }),
        supabase.from('subcategories').select('category_label, label, sort_order').order('sort_order', { ascending: true }),
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

      const categories = (categoriesResult.data ?? []) as CategoryRow[]
      const subcategories = (subcategoriesResult.data ?? []) as SubcategoryRow[]

      setCategoryLabels(categories.map((row) => row.label))
      setSubCategoriesByCategory(
        subcategories.reduce<Record<string, string[]>>((acc, row) => {
          ;(acc[row.category_label] ??= []).push(row.label)
          return acc
        }, {}),
      )
      setLoading(false)
    }

    load()
  }, [])

  const categoryTabs: CategoryTab[] = [
    { id: 'all', label: '모두 보기' },
    ...categoryLabels.map((label) => ({ id: label, label })),
  ]

  return (
    <CategoriesContext.Provider value={{ categoryLabels, categoryTabs, subCategoriesByCategory, loading, error }}>
      {children}
    </CategoriesContext.Provider>
  )
}

export function useCategories() {
  const context = useContext(CategoriesContext)
  if (!context) {
    throw new Error('useCategories must be used within a CategoriesProvider')
  }
  return context
}

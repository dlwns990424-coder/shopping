import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabaseClient'

interface ContentContextValue {
  content: Record<string, string>
  loading: boolean
}

const ContentContext = createContext<ContentContextValue | null>(null)

interface ContentRow {
  key: string
  value: string
}

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('site_content')
      .select('key, value')
      .then(({ data }) => {
        const map: Record<string, string> = {}
        for (const row of (data ?? []) as ContentRow[]) {
          map[row.key] = row.value
        }
        setContent(map)
        setLoading(false)
      })
  }, [])

  return <ContentContext.Provider value={{ content, loading }}>{children}</ContentContext.Provider>
}

export function useContent() {
  const context = useContext(ContentContext)
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider')
  }
  return context
}

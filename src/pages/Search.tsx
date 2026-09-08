import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import ProductCard from '../components/ProductCard'
import { useProducts } from '../context/ProductsContext'

function Search() {
  const { products } = useProducts()
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')

  useEffect(() => {
    setQuery(searchParams.get('q') ?? '')
  }, [searchParams])

  const handleChange = (value: string) => {
    setQuery(value)
    setSearchParams(value ? { q: value } : {}, { replace: true })
  }

  const trimmedQuery = query.trim()
  const results = trimmedQuery ? products.filter((product) => product.name.includes(trimmedQuery)) : []

  return (
    <div className="px-24 pb-32 pt-32 md:px-32 md:pt-48 lg:px-40 lg:pb-64">
      <Helmet>
        <title>NOVERA | 검색</title>
      </Helmet>

      <h1 className="text-h1 mb-24">검색</h1>

      <input
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="상품명을 검색해보세요"
        autoFocus
        className="text-sm w-full max-w-480 rounded-sm border border-line px-16 py-12 text-primary outline-none focus:border-primary"
      />

      {trimmedQuery && (
        <div className="py-16 text-secondary">
          <span className="text-body-sm">{results.length}개 상품</span>
        </div>
      )}

      {trimmedQuery && results.length === 0 && (
        <p className="text-body-sm mt-16">검색 결과가 없습니다.</p>
      )}

      {results.length > 0 && (
        <div className="product-grid mt-16 gap-y-32">
          {results.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Search

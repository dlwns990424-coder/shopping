import type { Product } from '../types'

function normalizeSearchText(value: string) {
  return value.normalize('NFKC').toLocaleLowerCase().trim().replace(/\s+/g, ' ')
}

function productSearchText(product: Product) {
  const genderKeywords = product.gender === 'men' ? 'men 남자 남성' : 'women 여자 여성'
  return normalizeSearchText(
    [product.name, product.category, product.subCategory, product.color.label, genderKeywords].join(' '),
  )
}

export function productMatchesQuery(product: Product, query: string) {
  const terms = normalizeSearchText(query).split(' ').filter(Boolean)
  if (terms.length === 0) return true

  const searchableText = productSearchText(product)
  return terms.every((term) => searchableText.includes(term))
}

export function filterProductsByQuery(products: Product[], query: string) {
  return products.filter((product) => productMatchesQuery(product, query))
}

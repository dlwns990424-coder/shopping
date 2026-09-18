export type EditorialDestination = 'men' | 'women' | 'all'

interface EditorialLinkOptions {
  destination: EditorialDestination
  category: string
  subcategory: string
}

export function buildEditorialLink({ destination, category, subcategory }: EditorialLinkOptions) {
  const basePath = destination === 'all' ? '/shop' : `/${destination}`
  const params = new URLSearchParams({ category: category || 'all' })

  if (category && category !== 'all' && subcategory) {
    params.set('sub', subcategory)
  }

  return `${basePath}?${params.toString()}`
}

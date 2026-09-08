import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'
import { products } from '../src/mock/products'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.resolve(__dirname, '../.env.local')
for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) process.env[match[1].trim()] ??= match[2].trim()
}

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('.env.local에 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY가 없습니다.')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const rows = products.map((p) => ({
  id: p.id,
  name: p.name,
  price: p.price,
  sale_price: p.salePrice,
  gender: p.gender,
  category: p.category,
  sub_category: p.subCategory,
  image: p.image,
  detail_images: p.detailImages,
  hover_image: p.hoverImage,
  color_label: p.color.label,
  color_hex: p.color.hex,
  sizes: p.sizes,
  featured: p.featured,
  featured_order: p.featuredOrder,
  description: p.description,
}))

const { data, error } = await supabase.from('products').upsert(rows, { onConflict: 'id' }).select('id')

if (error) {
  console.error('시딩 실패:', error)
  process.exit(1)
}

console.log(`${data?.length ?? 0}개 상품을 시딩했습니다.`)

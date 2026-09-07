import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

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

const rows = [
  { key: 'men.hero.eyebrow', page: 'men', label: '남성 히어로 eyebrow', value: 'T&L | MEN' },
  { key: 'men.hero.title', page: 'men', label: '남성 히어로 타이틀', value: '댄디하고 심플한 무드의 새 시즌 컬렉션' },
  { key: 'men.sale_banner.title', page: 'men', label: '남성 세일배너 타이틀', value: "Sale's up to 50% off" },

  { key: 'women.hero.eyebrow', page: 'women', label: '여성 히어로 eyebrow', value: 'T&L | WOMEN' },
  { key: 'women.hero.title', page: 'women', label: '여성 히어로 타이틀', value: '세련되고 감각적인 무드의 새 시즌 컬렉션' },
  { key: 'women.sale_banner.title', page: 'women', label: '여성 세일배너 타이틀', value: "Sale's up to 50% off" },

  { key: 'home.hero.eyebrow', page: 'home', label: '홈 히어로 eyebrow', value: 'T&L' },
  { key: 'home.hero.title', page: 'home', label: '홈 히어로 타이틀', value: '계절을 입다, 데일리를 완성하다' },
  { key: 'home.season_banner.title', page: 'home', label: '홈 시즌배너 타이틀', value: 'NEW SEASON LAYER' },
  { key: 'home.season_banner.subtitle', page: 'home', label: '홈 시즌배너 서브카피', value: '이번 시즌 놓치면 안될 아이템을 만나보세요' },
  { key: 'home.men_banner.copy', page: 'home', label: '홈 MEN 배너 카피', value: '댄디하고 심플한 무드의 새 시즌 컬렉션' },
  { key: 'home.women_banner.copy', page: 'home', label: '홈 WOMEN 배너 카피', value: '세련되고 감각적인 무드의 새 시즌 컬렉션' },
  { key: 'home.event_banner.men-outer.label', page: 'home', label: '홈 이벤트배너 1 라벨', value: '가을 아우터' },
  { key: 'home.event_banner.women-knit.label', page: 'home', label: '홈 이벤트배너 2 라벨', value: '니트 · 스웨트' },
  { key: 'home.event_banner.men-denim.label', page: 'home', label: '홈 이벤트배너 3 라벨', value: '데님 컬렉션' },
  { key: 'home.event_banner.women-shirt.label', page: 'home', label: '홈 이벤트배너 4 라벨', value: '셔츠 & 블라우스' },

  { key: 'men.hero.image', page: 'men', label: '남성 히어로 이미지', value: '' },
  {
    key: 'men.sale_banner.image',
    page: 'men',
    label: '남성 세일배너 이미지',
    value:
      'https://res.cloudinary.com/reformation/image/upload/c_scale,w_3840,w_1920/v1/home%20banner%202025/9.2%20Sale%20Third%20Banner.desktop?_i=AH',
  },

  {
    key: 'women.hero.image',
    page: 'women',
    label: '여성 히어로 이미지',
    value:
      'https://res.cloudinary.com/reformation/image/upload/c_scale,w_3840,w_2000/v1/home%20banner%202025/craftcore_des?_i=AH',
  },
  {
    key: 'women.sale_banner.image',
    page: 'women',
    label: '여성 세일배너 이미지',
    value:
      'https://res.cloudinary.com/reformation/image/upload/c_scale,w_3840,w_1920/v1/home%20banner%202025/9.2%20Sale%20Third%20Banner.desktop?_i=AH',
  },

  { key: 'home.hero.image', page: 'home', label: '홈 히어로 이미지', value: '' },
  { key: 'home.season_banner.image', page: 'home', label: '홈 시즌배너 이미지', value: '' },
  { key: 'home.men_banner.image', page: 'home', label: '홈 MEN 배너 이미지', value: '' },
  { key: 'home.women_banner.image', page: 'home', label: '홈 WOMEN 배너 이미지', value: '' },
  { key: 'home.event_banner.men-outer.image', page: 'home', label: '홈 이벤트배너 1 이미지', value: '' },
  { key: 'home.event_banner.women-knit.image', page: 'home', label: '홈 이벤트배너 2 이미지', value: '' },
  { key: 'home.event_banner.men-denim.image', page: 'home', label: '홈 이벤트배너 3 이미지', value: '' },
  { key: 'home.event_banner.women-shirt.image', page: 'home', label: '홈 이벤트배너 4 이미지', value: '' },
]

const { data, error } = await supabase.from('site_content').upsert(rows, { onConflict: 'key' }).select('key')

if (error) {
  console.error('시딩 실패:', error)
  process.exit(1)
}

console.log(`${data?.length ?? 0}개 콘텐츠를 시딩했습니다.`)

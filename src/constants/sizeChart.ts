// 실측사이즈 표 — 측정 항목 구성은 옷 종류(subCategory) 단위로 고정되고, 실제 상품마다 다른 건 수치뿐이다.
// 지금은 실제 도식 이미지가 없어서 표만 먼저 넣고, 수치는 관리자 입력 없이 임의 값을 자동 생성해서 채운다
// (서브카테고리+사이즈만 있으면 항상 같은 값이 나오도록 base+step 공식 사용 — 실측을 반영한 값은 아님).
export interface SizeChartField {
  label: string
  base: number
  step: number
}

const PANTS_FIELDS: SizeChartField[] = [
  { label: '허리둘레', base: 71, step: 2.5 },
  { label: '허벅지둘레', base: 63, step: 1.3 },
  { label: '엉덩이둘레', base: 96, step: 2.5 },
  { label: '앞밑위길이', base: 31, step: 0.6 },
  { label: '밑단둘레', base: 55, step: 0.6 },
  { label: '총기장(인심)', base: 71, step: 0 },
  { label: '총기장', base: 102, step: 0.6 },
]

const KNIT_FIELDS: SizeChartField[] = [
  { label: '가슴둘레', base: 110, step: 5 },
  { label: '밑단둘레', base: 110, step: 5 },
  { label: '소매길이', base: 53, step: 0.5 },
  { label: '소매밑단너비', base: 24, step: 1 },
  { label: '어깨너비', base: 50, step: 2.5 },
  { label: '총기장', base: 67, step: 1.5 },
]

const SHIRT_FIELDS: SizeChartField[] = [
  { label: '가슴둘레', base: 127, step: 5 },
  { label: '목너비', base: 44, step: 1.6 },
  { label: '밑단둘레', base: 123, step: 5 },
  { label: '소매길이', base: 52, step: 0.7 },
  { label: '소매밑단너비', base: 24, step: 1 },
  { label: '어깨너비', base: 55, step: 2 },
  { label: '총기장', base: 72, step: 1.5 },
]

const COAT_FIELDS: SizeChartField[] = [
  { label: '가슴둘레', base: 133, step: 7 },
  { label: '밑단둘레', base: 124, step: 7 },
  { label: '소매통', base: 58, step: 1.6 },
  { label: '소매밑단너비', base: 29, step: 1 },
  { label: '화장', base: 88, step: 2 },
  { label: '총기장', base: 70, step: 1.7 },
]

const JACKET_FIELDS: SizeChartField[] = [
  { label: '가슴둘레', base: 129, step: 6 },
  { label: '밑단둘레', base: 105, step: 6 },
  { label: '소매길이', base: 63, step: 1 },
  { label: '소매통', base: 49, step: 1.4 },
  { label: '소매밑단너비', base: 29, step: 1 },
  { label: '어깨너비', base: 50, step: 1.5 },
  { label: '총기장', base: 66, step: 2 },
]

const TSHIRT_FIELDS: SizeChartField[] = [
  { label: '가슴둘레', base: 100, step: 5 },
  { label: '밑단둘레', base: 100, step: 5 },
  { label: '소매길이', base: 21, step: 0.5 },
  { label: '소매밑단너비', base: 35, step: 1 },
  { label: '어깨너비', base: 44, step: 1.5 },
  { label: '총기장', base: 70, step: 2 },
]

export const SIZE_CHART_BY_SUBCATEGORY: Record<string, SizeChartField[]> = {
  데님: PANTS_FIELDS,
  슬랙스: PANTS_FIELDS,
  반바지: PANTS_FIELDS,
  '니트·스웨트': KNIT_FIELDS,
  가디건: KNIT_FIELDS,
  후드: KNIT_FIELDS,
  셔츠: SHIRT_FIELDS,
  코트: COAT_FIELDS,
  패딩: COAT_FIELDS,
  '자켓·블레이저': JACKET_FIELDS,
  티셔츠: TSHIRT_FIELDS,
}

export const SIZE_CHART_IMAGE_BY_SUBCATEGORY: Record<string, string> = {
  데님: '/images/size/바지.png',
  슬랙스: '/images/size/바지.png',
  반바지: '/images/size/바지.png',
  '니트·스웨트': '/images/size/니트.png',
  가디건: '/images/size/니트.png',
  후드: '/images/size/니트.png',
  셔츠: '/images/size/셔츠.png',
  코트: '/images/size/패딩.png',
  패딩: '/images/size/패딩.png',
  '자켓·블레이저': '/images/size/블래이저.png',
  티셔츠: '/images/size/티셔츠.png',
}

export function getSizeChartValue(field: SizeChartField, sizeIndex: number): string {
  const value = field.base + field.step * sizeIndex
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

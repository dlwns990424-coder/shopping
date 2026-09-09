export type Gender = 'men' | 'women'

export interface ProductColor {
  label: string
  hex: string
}

export interface Product {
  id: string
  name: string
  price: number
  salePrice: number | null
  gender: Gender
  category: string
  subCategory: string
  image: string
  detailImages: string[]
  hoverImage: string | null
  color: ProductColor
  sizes: string[]
  featured: boolean
  featuredOrder: number | null
  description: string
}

export const MAX_DETAIL_IMAGES = 6

export interface Category {
  id: string
  label: string
  to: string
  image: string
  imageFit?: 'contain' | 'cover'
}

export type UserRole = 'admin' | 'user'

export interface User {
  id: string
  nickname: string
  email: string
  phone: string
  role: UserRole
  joinedAt: string
  suspended?: boolean
  shippingName?: string
  shippingPhone?: string
  shippingAddress?: string
  shippingAddressDetail?: string
}

export type AuthResult = { success: true } | { success: false; message: string }

export interface SignupInput {
  nickname: string
  email: string
  password: string
  phone: string
}

export interface CartItem {
  id: string
  name: string
  option: string
  price: number
  quantity: number
  image: string | null
}

// 배송 진행(결제완료~배송완료/취소)과 반품 진행(반품요청~반품완료)은 서로 독립적인
// 축이라 별개 필드로 둔다 — 하나로 합쳐두면 반품이 시작되는 순간 "배송완료였다"는
// 사실 자체가 덮어써져 사라지는 문제가 있었다.
export type ShippingStatus = '결제완료' | '배송준비' | '배송중' | '배송완료' | '취소'
export type ReturnStatus = '반품요청' | '반품접수' | '반품완료'

export interface Order {
  id: string
  date: string
  shippingStatus: ShippingStatus
  returnStatus?: ReturnStatus
  userEmail: string
  items: CartItem[]
  shippingFee: number
  shippingName: string
  shippingPhone: string
  shippingAddress: string
  shippingAddressDetail?: string
  deliveryRequest?: string
  deliveredAt?: string
  returnReason?: string
  returnDetail?: string
  returnPhotos?: string[]
}

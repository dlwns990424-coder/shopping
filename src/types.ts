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

export type OrderStatus = '결제완료' | '배송준비' | '배송중' | '배송완료' | '취소'

export interface Order {
  id: string
  date: string
  status: OrderStatus
  userEmail: string
  items: CartItem[]
  shippingFee: number
  shippingName: string
  shippingPhone: string
  shippingAddress: string
  shippingAddressDetail?: string
  deliveryRequest?: string
}

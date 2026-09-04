export type Gender = 'men' | 'women'

export interface Product {
  id: string
  name: string
  price: string
  gender: Gender
  category: string
  subCategory: string
  image: string
}

export interface Category {
  id: string
  label: string
  to: string
  image: string
}

export interface ColorOption {
  id: string
  label: string
  color: string
}

export interface User {
  nickname: string
  email: string
  phone: string
  shippingName?: string
  shippingPhone?: string
  shippingAddress?: string
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

export interface Order {
  id: string
  date: string
  status: string
  items: CartItem[]
}

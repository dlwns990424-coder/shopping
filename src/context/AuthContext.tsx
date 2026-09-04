import { createContext, useContext, useState, type ReactNode } from 'react'
import type { AuthResult, SignupInput, User } from '../types'

interface StoredUser extends User {
  password: string
}

interface AuthContextValue {
  user: User | null
  signup: (input: SignupInput) => AuthResult
  login: (email: string, password: string) => AuthResult
  logout: () => void
  updateProfile: (updates: Partial<User>) => AuthResult
}

const AuthContext = createContext<AuthContextValue | null>(null)

const USERS_KEY = 'shop_users'
const SESSION_KEY = 'shop_current_user'

function readUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]') || []
  } catch {
    return []
  }
}

function readSession(): User | null {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) ?? 'null')
  } catch {
    return null
  }
}

// 로그인 상태 UX를 매번 회원가입부터 다시 하지 않고 테스트할 수 있도록,
// 없으면 한 번만 심어두는 고정 테스트 계정. Supabase Auth 연동 시 이 파일과 함께 제거될 목업 전용 로직.
const TEST_ACCOUNT: StoredUser = {
  nickname: '테스트유저',
  email: 'test@test.com',
  password: 'test1234',
  phone: '010-1234-5678',
}

function ensureTestAccount() {
  const users = readUsers()
  if (!users.some((u) => u.email === TEST_ACCOUNT.email)) {
    localStorage.setItem(USERS_KEY, JSON.stringify([...users, TEST_ACCOUNT]))
  }
}

ensureTestAccount()

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readSession)

  const signup = ({ nickname, email, password, phone }: SignupInput): AuthResult => {
    const users = readUsers()
    if (users.some((u) => u.email === email)) {
      return { success: false, message: '이미 가입된 이메일입니다.' }
    }
    localStorage.setItem(USERS_KEY, JSON.stringify([...users, { nickname, email, password, phone }]))
    return { success: true }
  }

  const login = (email: string, password: string): AuthResult => {
    const found = readUsers().find((u) => u.email === email && u.password === password)
    if (!found) {
      return { success: false, message: '이메일 또는 비밀번호가 올바르지 않습니다.' }
    }
    const { password: _password, ...safeUser } = found
    setUser(safeUser)
    localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser))
    return { success: true }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(SESSION_KEY)
  }

  const updateProfile = (updates: Partial<User>): AuthResult => {
    if (!user) {
      return { success: false, message: '로그인이 필요합니다.' }
    }
    const users = readUsers()
    const nextUsers = users.map((u) => (u.email === user.email ? { ...u, ...updates } : u))
    localStorage.setItem(USERS_KEY, JSON.stringify(nextUsers))

    const nextUser = { ...user, ...updates }
    setUser(nextUser)
    localStorage.setItem(SESSION_KEY, JSON.stringify(nextUser))
    return { success: true }
  }

  return (
    <AuthContext.Provider value={{ user, signup, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

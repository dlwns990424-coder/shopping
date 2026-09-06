import { createContext, useContext, useState, type ReactNode } from 'react'
import type { AuthResult, SignupInput, User } from '../types'
import { safeSetItem } from '../utils/storage'

interface StoredUser extends User {
  password: string
}

interface AuthContextValue {
  user: User | null
  signup: (input: SignupInput) => AuthResult
  login: (email: string, password: string) => AuthResult
  logout: () => void
  updateProfile: (updates: Partial<User>) => AuthResult
  listUsers: () => User[]
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
  role: 'user',
}

const TEST_ADMIN_ACCOUNT: StoredUser = {
  nickname: '관리자',
  email: 'admin@test.com',
  password: 'admin1234',
  phone: '010-0000-0000',
  role: 'admin',
}

function ensureTestAccounts() {
  const users = readUsers()
  const missing = [TEST_ACCOUNT, TEST_ADMIN_ACCOUNT].filter(
    (account) => !users.some((u) => u.email === account.email),
  )
  if (missing.length > 0) {
    safeSetItem(USERS_KEY, [...users, ...missing])
  }
}

ensureTestAccounts()

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readSession)

  const signup = ({ nickname, email, password, phone }: SignupInput): AuthResult => {
    const users = readUsers()
    if (users.some((u) => u.email === email)) {
      return { success: false, message: '이미 가입된 이메일입니다.' }
    }
    safeSetItem(USERS_KEY, [...users, { nickname, email, password, phone, role: 'user' }])
    return { success: true }
  }

  const login = (email: string, password: string): AuthResult => {
    const found = readUsers().find((u) => u.email === email && u.password === password)
    if (!found) {
      return { success: false, message: '이메일 또는 비밀번호가 올바르지 않습니다.' }
    }
    const { password: _password, ...safeUser } = found
    setUser(safeUser)
    safeSetItem(SESSION_KEY, safeUser)
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
    safeSetItem(USERS_KEY, nextUsers)

    const nextUser = { ...user, ...updates }
    setUser(nextUser)
    safeSetItem(SESSION_KEY, nextUser)
    return { success: true }
  }

  const listUsers = (): User[] =>
    readUsers().map(({ password: _password, ...safeUser }) => safeUser)

  return (
    <AuthContext.Provider value={{ user, signup, login, logout, updateProfile, listUsers }}>
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

import { createContext, useContext, useState, type ReactNode } from 'react'
import type { AuthResult, SignupInput, User, UserRole } from '../types'
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
  setUserRole: (email: string, role: UserRole) => AuthResult
  deleteUser: (email: string) => AuthResult
}

const AuthContext = createContext<AuthContextValue | null>(null)

const USERS_KEY = 'shop_users'
const SESSION_KEY = 'shop_current_user'

function readUsers(): StoredUser[] {
  try {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]') || []
    // joinedAt 필드 도입 이전에 생성된 계정(이 브라우저의 과거 테스트 데이터) 방어
    return users.map((u: StoredUser) => ({ ...u, joinedAt: u.joinedAt ?? '' }))
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
  joinedAt: '2026-01-01T00:00:00.000Z',
}

const TEST_ADMIN_ACCOUNT: StoredUser = {
  nickname: '관리자',
  email: 'admin@test.com',
  password: 'admin1234',
  phone: '010-0000-0000',
  role: 'admin',
  joinedAt: '2026-01-01T00:00:00.000Z',
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
  const [users, setUsers] = useState<StoredUser[]>(readUsers)

  const persistUsers = (nextUsers: StoredUser[]) => {
    setUsers(nextUsers)
    safeSetItem(USERS_KEY, nextUsers)
  }

  const signup = ({ nickname, email, password, phone }: SignupInput): AuthResult => {
    if (users.some((u) => u.email === email)) {
      return { success: false, message: '이미 가입된 이메일입니다.' }
    }
    persistUsers([
      ...users,
      { nickname, email, password, phone, role: 'user', joinedAt: new Date().toISOString() },
    ])
    return { success: true }
  }

  const login = (email: string, password: string): AuthResult => {
    const found = users.find((u) => u.email === email && u.password === password)
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
    persistUsers(users.map((u) => (u.email === user.email ? { ...u, ...updates } : u)))

    const nextUser = { ...user, ...updates }
    setUser(nextUser)
    safeSetItem(SESSION_KEY, nextUser)
    return { success: true }
  }

  const listUsers = (): User[] => users.map(({ password: _password, ...safeUser }) => safeUser)

  const setUserRole = (email: string, role: UserRole): AuthResult => {
    if (!users.some((u) => u.email === email)) {
      return { success: false, message: '존재하지 않는 회원입니다.' }
    }
    persistUsers(users.map((u) => (u.email === email ? { ...u, role } : u)))
    if (user?.email === email) {
      const nextUser = { ...user, role }
      setUser(nextUser)
      safeSetItem(SESSION_KEY, nextUser)
    }
    return { success: true }
  }

  const deleteUser = (email: string): AuthResult => {
    if (user?.email === email) {
      return { success: false, message: '본인 계정은 삭제할 수 없습니다.' }
    }
    persistUsers(users.filter((u) => u.email !== email))
    return { success: true }
  }

  return (
    <AuthContext.Provider
      value={{ user, signup, login, logout, updateProfile, listUsers, setUserRole, deleteUser }}
    >
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

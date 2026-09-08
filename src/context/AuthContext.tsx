import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { AuthError } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'
import type { AuthResult, SignupInput, User } from '../types'

// Supabase가 돌려주는 에러는 전부 영어라서, 화면에 그대로 노출하지 않고
// 알려진 코드만 한글로 번역한다. 모르는 코드는 원문 대신 안전한 일반 문구로 대체.
function translateAuthError(error: AuthError): string {
  switch (error.code) {
    case 'user_already_exists':
      return '이미 가입된 이메일입니다.'
    case 'email_address_invalid':
      return '올바른 이메일 형식을 입력해주세요.'
    case 'over_email_send_rate_limit':
    case 'over_request_rate_limit':
      return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.'
    case 'weak_password':
      return '비밀번호가 너무 약합니다. 다른 비밀번호를 입력해주세요.'
    case 'invalid_credentials':
      return '이메일 또는 비밀번호가 올바르지 않습니다.'
    default:
      return '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
  }
}

interface ProfileRow {
  id: string
  email: string
  nickname: string
  phone: string
  role: 'admin' | 'user'
  suspended: boolean
  joined_at: string
  shipping_name: string | null
  shipping_phone: string | null
  shipping_address: string | null
  shipping_address_detail: string | null
}

function toUser(row: ProfileRow): User {
  return {
    id: row.id,
    email: row.email,
    nickname: row.nickname,
    phone: row.phone,
    role: row.role,
    suspended: row.suspended,
    joinedAt: row.joined_at,
    shippingName: row.shipping_name ?? undefined,
    shippingPhone: row.shipping_phone ?? undefined,
    shippingAddress: row.shipping_address ?? undefined,
    shippingAddressDetail: row.shipping_address_detail ?? undefined,
  }
}

interface AuthContextValue {
  user: User | null
  loading: boolean
  signup: (input: SignupInput) => Promise<AuthResult>
  login: (email: string, password: string) => Promise<AuthResult>
  logout: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<AuthResult>
}

const AuthContext = createContext<AuthContextValue | null>(null)

// 정지되었거나(관리자가 정지) 삭제된(휴지통) 계정은 로그인 세션이 있어도
// 프로필을 못 찾은 것으로 취급해서 즉시 로그아웃시킨다.
async function loadProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .is('deleted_at', null)
    .maybeSingle()

  if (error || !data || data.suspended) return null
  return toUser(data as ProfileRow)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const syncSession = async (userId: string | undefined) => {
      if (!userId) {
        if (active) setUser(null)
        return
      }
      const profile = await loadProfile(userId)
      if (!active) return
      if (!profile) {
        await supabase.auth.signOut()
        setUser(null)
      } else {
        setUser(profile)
      }
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      await syncSession(session?.user.id)
      if (active) setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      syncSession(session?.user.id)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const signup = async ({ nickname, email, password, phone }: SignupInput): Promise<AuthResult> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nickname, phone } },
    })
    if (error) {
      return { success: false, message: translateAuthError(error) }
    }
    return { success: true }
  }

  const login = async (email: string, password: string): Promise<AuthResult> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error || !data.user) {
      return { success: false, message: error ? translateAuthError(error) : '로그인에 실패했습니다.' }
    }
    const profile = await loadProfile(data.user.id)
    if (!profile) {
      await supabase.auth.signOut()
      return { success: false, message: '정지되었거나 존재하지 않는 계정입니다. 고객센터에 문의해주세요.' }
    }
    setUser(profile)
    return { success: true }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const updateProfile = async (updates: Partial<User>): Promise<AuthResult> => {
    if (!user) {
      return { success: false, message: '로그인이 필요합니다.' }
    }
    const payload: Record<string, string> = {}
    if (updates.nickname !== undefined) payload.nickname = updates.nickname
    if (updates.phone !== undefined) payload.phone = updates.phone
    if (updates.shippingName !== undefined) payload.shipping_name = updates.shippingName
    if (updates.shippingPhone !== undefined) payload.shipping_phone = updates.shippingPhone
    if (updates.shippingAddress !== undefined) payload.shipping_address = updates.shippingAddress
    if (updates.shippingAddressDetail !== undefined) {
      payload.shipping_address_detail = updates.shippingAddressDetail
    }

    const { error } = await supabase.from('profiles').update(payload).eq('id', user.id)
    if (error) {
      return { success: false, message: error.message }
    }
    setUser({ ...user, ...updates })
    return { success: true }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout, updateProfile }}>
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

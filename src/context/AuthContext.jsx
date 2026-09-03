import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

const USERS_KEY = 'shop_users'
const SESSION_KEY = 'shop_current_user'

function readUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || []
  } catch {
    return []
  }
}

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY))
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readSession)

  const signup = ({ nickname, email, password, phone }) => {
    const users = readUsers()
    if (users.some((u) => u.email === email)) {
      return { success: false, message: '이미 가입된 이메일입니다.' }
    }
    localStorage.setItem(USERS_KEY, JSON.stringify([...users, { nickname, email, password, phone }]))
    return { success: true }
  }

  const login = (email, password) => {
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

  return (
    <AuthContext.Provider value={{ user, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api, ApiError, setCsrfToken } from '../services/api'
import type { User } from '../types'

type AuthValue = {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<User>('/api/auth/me.php')
      .then((next) => { setCsrfToken(next.csrf_token); setUser(next) })
      .catch((error) => { if (!(error instanceof ApiError && error.status === 401)) console.error(error) })
      .finally(() => setLoading(false))
  }, [])

  const login = async (email: string, password: string) => {
    const next = await api.post<User>('/api/auth/login.php', { email, password })
    setCsrfToken(next.csrf_token)
    setUser(next)
  }

  const logout = async () => {
    await api.post('/api/auth/logout.php')
    setUser(null)
    setCsrfToken('')
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth phải nằm trong AuthProvider')
  return value
}

import { createContext, useContext, useEffect, useState } from 'react'
import type { UserProfile } from '@/types'
import { authService } from '@/services/auth.service'

interface AuthContextValue {
  user: UserProfile | null
  token: string | null
  isLoading: boolean
  login: (token: string, user: UserProfile) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      setIsLoading(false)
      return
    }
    authService.me()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem('token')
        setToken(null)
      })
      .finally(() => setIsLoading(false))
  }, [token])

  function login(newToken: string, newUser: UserProfile) {
    localStorage.setItem('token', newToken)
    setToken(newToken)
    setUser(newUser)
  }

  function logout() {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

import { createContext, useContext, useState, type ReactNode } from 'react'
import type { AuthUser } from '../api/auth'

type AuthCtx = {
  user: AuthUser | null
  token: string | null
  saveAuth: (user: AuthUser, token: string) => void
  updateUser: (user: AuthUser) => void
  clearAuth: () => void
}

const AuthContext = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem('meri_diet_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const [token, setToken] = useState<string | null>(() => {
    try { return localStorage.getItem('meri_diet_token') } catch { return null }
  })

  function saveAuth(user: AuthUser, token: string) {
    setUser(user)
    setToken(token)
    localStorage.setItem('meri_diet_user', JSON.stringify(user))
    localStorage.setItem('meri_diet_token', token)
  }

  function updateUser(user: AuthUser) {
    setUser(user)
    localStorage.setItem('meri_diet_user', JSON.stringify(user))
  }

  function clearAuth() {
    setUser(null)
    setToken(null)
    localStorage.removeItem('meri_diet_user')
    localStorage.removeItem('meri_diet_token')
    // The "skip" on the profile-setup prompt is only for the active session —
    // a fresh login should prompt again until the profile is actually completed.
    sessionStorage.removeItem('meri_diet_dietitian_setup_skipped')
  }

  return (
    <AuthContext.Provider value={{ user, token, saveAuth, updateUser, clearAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}

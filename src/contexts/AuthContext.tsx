import { useCallback, useMemo, useState } from 'react'

import {
  clearStoredSession,
  getStoredSession,
  signInWithGoogle,
} from '../services/googleAuth'
import type { GoogleSession } from '../services/googleAuth'
import { AuthContext, type AuthContextValue } from './auth'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<GoogleSession | null>(() => getStoredSession())

  const login = useCallback(async () => {
    const nextSession = await signInWithGoogle()
    setSession(nextSession)
  }, [])

  const logout = useCallback(() => {
    clearStoredSession()
    setSession(null)
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    session,
    isAuthenticated: Boolean(session),
    login,
    logout,
  }), [login, logout, session])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

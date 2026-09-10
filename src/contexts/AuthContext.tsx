import { useCallback, useMemo, useState } from 'react'

import { clearStoredSession, getStoredSession, storeSession } from '../services/googleAuth'
import type { GoogleSession } from '../services/googleAuth'
import { signInWithMock } from '../mocks/auth'
import { AuthContext, type AuthContextValue } from './auth'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<GoogleSession | null>(() => getStoredSession())

  const login = useCallback(async (email: string, password: string) => {
    const nextSession = await signInWithMock(email, password)
    storeSession(nextSession)
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

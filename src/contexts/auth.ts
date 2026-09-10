import { createContext, useContext } from 'react'

import type { GoogleSession } from '../services/googleAuth'

export type AuthContextValue = {
  session: GoogleSession | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const value = useContext(AuthContext)

  if (!value) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider.')
  }

  return value
}

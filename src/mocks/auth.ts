import type { GoogleSession } from '../services/googleAuth'

export const MOCK_LOGIN = {
  email: 'aluno@hubacademico.com',
  password: '123456',
}

const MOCK_SESSION: GoogleSession = {
  accessToken: 'mock-access-token',
  expiresAt: Date.now() + 60 * 60 * 1000,
  user: {
    name: 'Ana Souza',
    email: MOCK_LOGIN.email,
  },
}

export function signInWithMock(email: string, password: string): Promise<GoogleSession> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email !== MOCK_LOGIN.email || password !== MOCK_LOGIN.password) {
        reject(new Error('E-mail ou senha incorretos.'))
        return
      }

      resolve({ ...MOCK_SESSION, expiresAt: Date.now() + 60 * 60 * 1000 })
    }, 700)
  })
}

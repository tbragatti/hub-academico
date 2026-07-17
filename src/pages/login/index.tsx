import { useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { Navigate, useNavigate } from 'react-router-dom'

import { useAuth } from '../../contexts/auth'
import styles from './styles.module.css'

export function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handleLogin = async () => {
    setError(null)
    setIsLoading(true)

    try {
      await login()
      navigate('/', { replace: true })
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Não foi possível entrar com Google.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.panel} aria-labelledby="login-title">
        <div className={styles.brand}>
          <span className={styles.brandMark}>
            <CalendarDays size={22} />
          </span>
          <span>Hub Acadêmico</span>
        </div>

        <div>
          <h1 className={styles.title} id="login-title">Entrar com Google</h1>
          <p className={styles.description}>
            Conecte sua conta para acessar o painel e carregar seus próximos compromissos do Google Agenda.
          </p>
        </div>

        {error && (
          <p className={styles.error} role="alert">{error}</p>
        )}

        <button
          className={styles.button}
          disabled={isLoading}
          onClick={handleLogin}
          type="button"
        >
          <CalendarDays size={20} />
          {isLoading ? 'Conectando...' : 'Continuar com Google'}
        </button>

        <p className={styles.note}>
          O app solicita permissão somente para leitura da sua agenda principal.
        </p>
      </section>
    </main>
  )
}

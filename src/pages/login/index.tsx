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

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await login()
      navigate('/', { replace: true })
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Não foi possível entrar agora.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.panel} aria-labelledby="login-title">
        <div className={styles.bookIllustration} aria-hidden="true">
          <span className={`${styles.sparkle} ${styles.sparkleLeft}`}>✦</span>
          <span className={`${styles.sparkle} ${styles.sparkleRight}`}>✦</span>
          <div className={`${styles.book} ${styles.bookBottom}`}>
            <span className={styles.bookPages} />
            <span className={styles.bookSpine} />
          </div>
          <div className={`${styles.book} ${styles.bookMiddle}`}>
            <span className={styles.bookPages} />
            <span className={styles.bookSpine} />
          </div>
          <div className={`${styles.book} ${styles.bookTop}`}>
            <span className={styles.bookPages} />
            <span className={styles.bookSpine} />
          </div>
          <span className={styles.bookmark} />
        </div>

        <div className={styles.brand}>
          <span className={styles.brandMark}>
            <CalendarDays size={22} />
          </span>
          <span>Hub Acadêmico</span>
        </div>

        <div>
          <h1 className={styles.title} id="login-title">Entre para continuar</h1>
          <p className={styles.description}>
            Entre com sua conta para acompanhar suas disciplinas e ver os próximos compromissos da sua agenda.
          </p>
        </div>

        {error && (
          <p className={styles.error} role="alert">{error}</p>
        )}

        <form className={styles.form} onSubmit={handleLogin}>
          <button className={styles.button} disabled={isLoading} type="submit">
            <CalendarDays size={20} />
            {isLoading ? 'Conectando...' : 'Entrar com Google'}
          </button>
        </form>

        <p className={styles.note}>
          Você será redirecionado para o Google para autorizar o acesso à sua conta e à sua agenda.
        </p>
      </section>
    </main>
  )
}

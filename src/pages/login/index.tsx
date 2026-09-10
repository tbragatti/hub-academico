import { useState } from 'react'
import { CalendarDays, LockKeyhole, Mail } from 'lucide-react'
import { Navigate, useNavigate } from 'react-router-dom'

import { useAuth } from '../../contexts/auth'
import { MOCK_LOGIN } from '../../mocks/auth'
import styles from './styles.module.css'

export function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState(MOCK_LOGIN.email)
  const [password, setPassword] = useState(MOCK_LOGIN.password)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await login(email, password)
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
          <label className={styles.field}>
            <span>E-mail</span>
            <div className={styles.inputWrapper}>
              <Mail size={18} aria-hidden="true" />
              <input
                autoComplete="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="voce@exemplo.com"
                type="email"
                value={email}
              />
            </div>
          </label>

          <label className={styles.field}>
            <span>Senha</span>
            <div className={styles.inputWrapper}>
              <LockKeyhole size={18} aria-hidden="true" />
              <input
                autoComplete="current-password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Digite sua senha"
                type="password"
                value={password}
              />
            </div>
          </label>

          <button className={styles.button} disabled={isLoading} type="submit">
            <CalendarDays size={20} />
            {isLoading ? 'Entrando...' : 'Entrar no Hub'}
          </button>
        </form>

        <p className={styles.note}>
          Acesso de demonstração: use os dados preenchidos ou confira as credenciais no arquivo de mock.
        </p>
      </section>
    </main>
  )
}

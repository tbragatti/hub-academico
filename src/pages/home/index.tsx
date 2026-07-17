import { useEffect, useMemo, useState } from "react";
import { CalendarDays, LogOut, UserCircle } from "lucide-react";

import { DashboardGrid } from "../../components/DashboardGrid";
import { WidgetToolbar } from "../../components/WidgetToolbar";
import { useAuth } from "../../contexts/auth";
import { fetchUpcomingCalendarEvents } from "../../services/googleAuth";
import type { CalendarEvent } from "../../services/googleAuth";
import styles from './styles.module.css'

export function HomePage() {
  const { logout, session } = useAuth()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [calendarStatus, setCalendarStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    if (!session?.accessToken) {
      return
    }

    let isMounted = true

    fetchUpcomingCalendarEvents(session.accessToken)
      .then((calendarEvents) => {
        if (isMounted) {
          setEvents(calendarEvents)
          setCalendarStatus('ready')
        }
      })
      .catch(() => {
        if (isMounted) {
          setCalendarStatus('error')
        }
      })

    return () => {
      isMounted = false
    }
  }, [session?.accessToken])

  const userInitial = useMemo(() => {
    return session?.user.name?.trim().charAt(0).toUpperCase() ?? session?.user.email.charAt(0).toUpperCase()
  }, [session?.user.email, session?.user.name])

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.account}>
          {session?.user.picture ? (
            <img className={styles.avatar} src={session.user.picture} alt="" />
          ) : (
            <span className={styles.avatarFallback}>{userInitial}</span>
          )}
          <div className={styles.accountText}>
            <span className={styles.accountLabel}>Conta conectada</span>
            <strong>{session?.user.name}</strong>
            <span>{session?.user.email}</span>
          </div>
        </div>

        <button className={styles.logoutButton} onClick={logout} title="Sair" type="button">
          <LogOut size={18} />
          Sair
        </button>
      </header>

      <section className={styles.calendarPanel} aria-label="Próximos eventos do Google Agenda">
        <div className={styles.calendarHeader}>
          <span className={styles.calendarIcon}>
            <CalendarDays size={20} />
          </span>
          <div>
            <h2>Google Agenda</h2>
            <p>Próximos compromissos da sua agenda principal.</p>
          </div>
        </div>

        {calendarStatus === 'loading' && (
          <p className={styles.calendarMessage}>Carregando eventos...</p>
        )}

        {calendarStatus === 'error' && (
          <p className={styles.calendarMessage}>
            Não consegui carregar a agenda. Entre novamente para renovar a permissão.
          </p>
        )}

        {calendarStatus === 'ready' && events.length === 0 && (
          <p className={styles.calendarMessage}>Nenhum compromisso próximo encontrado.</p>
        )}

        {calendarStatus === 'ready' && events.length > 0 && (
          <ol className={styles.eventList}>
            {events.map((event) => (
              <li className={styles.eventItem} key={event.id}>
                <UserCircle size={18} />
                <div>
                  <strong>{event.summary}</strong>
                  <time dateTime={event.start}>{formatEventDate(event.start)}</time>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      <WidgetToolbar/>
      <DashboardGrid/>
    </div>
  )
}

function formatEventDate(value: string) {
  if (!value) {
    return 'Data não informada'
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: value.includes('T') ? 'short' : undefined,
  }).format(new Date(value))
}

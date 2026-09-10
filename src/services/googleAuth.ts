export type GoogleUser = {
  email: string
  name: string
  picture?: string
}

export type GoogleSession = {
  accessToken: string
  expiresAt: number
  user: GoogleUser
}

export type CalendarEvent = {
  id: string
  summary: string
  start: string
  end?: string
  htmlLink?: string
}

export type NewCalendarCourse = {
  name: string
  weekdays: number[]
  startTime: string
  durationMinutes: number
  semesterEnd: string
}

type TokenResponse = {
  access_token?: string
  expires_in?: number
  error?: string
  error_description?: string
}

type GoogleTokenClient = {
  callback: (response: TokenResponse) => void
  requestAccessToken: (options?: { prompt?: string }) => void
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string
            scope: string
            callback: (response: TokenResponse) => void
          }) => GoogleTokenClient
        }
      }
    }
  }
}

const GOOGLE_SCRIPT_URL = 'https://accounts.google.com/gsi/client'
const GOOGLE_SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/calendar.events',
].join(' ')

// A nova chave força uma autorização renovada após a mudança para calendar.events.
const SESSION_STORAGE_KEY = 'hub-academico.google-session.v2'

let scriptPromise: Promise<void> | null = null

export function getGoogleClientId() {
  return import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
}

export function getStoredSession(): GoogleSession | null {
  const rawSession = localStorage.getItem(SESSION_STORAGE_KEY)

  if (!rawSession) {
    return null
  }

  try {
    const session = JSON.parse(rawSession) as GoogleSession

    if (!session.accessToken || session.expiresAt <= Date.now()) {
      clearStoredSession()
      return null
    }

    return session
  } catch {
    clearStoredSession()
    return null
  }
}

export function storeSession(session: GoogleSession) {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
}

export function clearStoredSession() {
  localStorage.removeItem(SESSION_STORAGE_KEY)
}

export async function signInWithGoogle(): Promise<GoogleSession> {
  const clientId = getGoogleClientId()

  if (!clientId) {
    throw new Error('Configure VITE_GOOGLE_CLIENT_ID para ativar o login com Google.')
  }

  await loadGoogleIdentityScript()

  const accessToken = await requestAccessToken(clientId)
  const user = await fetchGoogleUser(accessToken.token)

  const session = {
    accessToken: accessToken.token,
    expiresAt: Date.now() + accessToken.expiresIn * 1000,
    user,
  }

  storeSession(session)

  return session
}

export async function fetchUpcomingCalendarEvents(accessToken: string): Promise<CalendarEvent[]> {
  const params = new URLSearchParams({
    calendarId: 'primary',
    maxResults: '8',
    orderBy: 'startTime',
    singleEvents: 'true',
    timeMin: new Date().toISOString(),
  })

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  )

  if (!response.ok) {
    throw new Error('Não foi possível carregar os eventos do Google Agenda.')
  }

  const data = await response.json() as {
    items?: Array<{
      id: string
      summary?: string
      start?: { dateTime?: string; date?: string }
      end?: { dateTime?: string; date?: string }
      htmlLink?: string
    }>
  }

  return (data.items ?? []).map((event) => ({
    id: event.id,
    summary: event.summary ?? 'Sem título',
    start: event.start?.dateTime ?? event.start?.date ?? '',
    end: event.end?.dateTime ?? event.end?.date,
    htmlLink: event.htmlLink,
  }))
}

export async function createRecurringCourseEvent(
  accessToken: string,
  course: NewCalendarCourse,
): Promise<string> {
  const firstClass = getFirstClassDate(course.weekdays, course.startTime)
  const end = new Date(firstClass.getTime() + course.durationMinutes * 60_000)
  const until = new Date(`${course.semesterEnd}T23:59:59`).toISOString()
    .replaceAll('-', '')
    .replaceAll(':', '')
    .replace('.000', '')

  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        summary: course.name,
        description: 'Aula criada pelo Hub Acadêmico.',
        start: {
          dateTime: firstClass.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: end.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        recurrence: [
          `RRULE:FREQ=WEEKLY;BYDAY=${course.weekdays.map(toGoogleWeekday).join(',')};UNTIL=${until}`,
        ],
      }),
    },
  )

  if (!response.ok) {
    throw new Error('Não foi possível criar a aula no Google Agenda. Entre novamente e tente de novo.')
  }

  const data = await response.json() as { id?: string }

  if (!data.id) {
    throw new Error('O Google Agenda não retornou o identificador da aula.')
  }

  return data.id
}

function loadGoogleIdentityScript() {
  if (window.google?.accounts.oauth2) {
    return Promise.resolve()
  }

  if (scriptPromise) {
    return scriptPromise
  }

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = GOOGLE_SCRIPT_URL
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Não foi possível carregar o login do Google.'))
    document.head.appendChild(script)
  })

  return scriptPromise
}

function requestAccessToken(clientId: string) {
  return new Promise<{ token: string; expiresIn: number }>((resolve, reject) => {
    const tokenClient = window.google?.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: GOOGLE_SCOPES,
      callback: (response) => {
        if (response.error || !response.access_token) {
          reject(new Error(response.error_description ?? 'Login com Google cancelado.'))
          return
        }

        resolve({
          token: response.access_token,
          expiresIn: response.expires_in ?? 3600,
        })
      },
    })

    if (!tokenClient) {
      reject(new Error('Cliente de autenticação do Google indisponível.'))
      return
    }

    tokenClient.requestAccessToken({ prompt: 'consent' })
  })
}

async function fetchGoogleUser(accessToken: string): Promise<GoogleUser> {
  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error('Não foi possível carregar os dados da conta Google.')
  }

  const data = await response.json() as GoogleUser

  return {
    email: data.email,
    name: data.name,
    picture: data.picture,
  }
}

function getFirstClassDate(weekdays: number[], startTime: string) {
  const [hours, minutes] = startTime.split(':').map(Number)
  const now = new Date()
  const candidates = weekdays.map((weekday) => {
    const date = new Date(now)
    date.setHours(hours, minutes, 0, 0)
    date.setDate(now.getDate() + (weekday - now.getDay() + 7) % 7)
    if (date <= now) date.setDate(date.getDate() + 7)
    return date
  })

  return candidates.sort((first, second) => first.getTime() - second.getTime())[0]
}

function toGoogleWeekday(weekday: number) {
  return ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'][weekday]
}

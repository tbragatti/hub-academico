export type Course = {
  id: string
  name: string
  weekdays: number[]
  startTime: string
  durationMinutes: number
  absences: number
  calendarEventId: string
}

export type AcademicData = {
  semesterEnd: string | null
  courses: Course[]
}

const STORAGE_KEY = 'hub-academico.academic-data'

const emptyData: AcademicData = {
  semesterEnd: null,
  courses: [],
}

export function getAcademicData(): AcademicData {
  const rawData = localStorage.getItem(STORAGE_KEY)

  if (!rawData) return emptyData

  try {
    const data = JSON.parse(rawData) as Partial<AcademicData>

    return {
      semesterEnd: typeof data.semesterEnd === 'string' ? data.semesterEnd : null,
      courses: Array.isArray(data.courses) ? data.courses : [],
    }
  } catch {
    return emptyData
  }
}

export function storeAcademicData(data: AcademicData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

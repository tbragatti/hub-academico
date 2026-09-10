import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Clock3,
  FileText,
  LogOut,
  Plus,
  Settings2,
  UserCircle,
} from "lucide-react";

import { useAuth } from "../../contexts/auth";
import {
  getAcademicData,
  storeAcademicData,
  type AcademicData,
  type Course,
} from "../../services/academicData";
import {
  createRecurringCourseEvent,
  fetchUpcomingCalendarEvents,
  type CalendarEvent,
} from "../../services/googleAuth";
import styles from "./styles.module.css";

const WEEKDAYS = [
  { value: 1, label: "Seg" },
  { value: 2, label: "Ter" },
  { value: 3, label: "Qua" },
  { value: 4, label: "Qui" },
  { value: 5, label: "Sex" },
  { value: 6, label: "Sáb" },
  { value: 0, label: "Dom" },
];

type CalendarStatus = "loading" | "ready" | "error";

export function HomePage() {
  const { logout, session } = useAuth();
  const [academicData, setAcademicData] = useState<AcademicData>(() =>
    getAcademicData(),
  );
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [calendarStatus, setCalendarStatus] =
    useState<CalendarStatus>("loading");
  const [isCourseFormOpen, setIsCourseFormOpen] = useState(false);
  const [isSemesterEditorOpen, setIsSemesterEditorOpen] = useState(false);

  useEffect(() => {
    storeAcademicData(academicData);
  }, [academicData]);

  useEffect(() => {
    if (!session?.accessToken) return;

    let isMounted = true;
    fetchUpcomingCalendarEvents(session.accessToken)
      .then((calendarEvents) => {
        if (!isMounted) return;
        setEvents(calendarEvents);
        setCalendarStatus("ready");
      })
      .catch(() => {
        if (isMounted) setCalendarStatus("error");
      });

    return () => {
      isMounted = false;
    };
  }, [session?.accessToken]);

  const totalAbsences = academicData.courses.reduce(
    (total, course) => total + course.absences,
    0,
  );
  const userInitial = useMemo(
    () =>
      session?.user.name?.trim().charAt(0).toUpperCase() ??
      session?.user.email.charAt(0).toUpperCase(),
    [session?.user.email, session?.user.name],
  );

  const updateAbsences = (courseId: string, amount: number) => {
    setAcademicData((current) => ({
      ...current,
      courses: current.courses.map((course) =>
        course.id === courseId
          ? { ...course, absences: Math.max(0, course.absences + amount) }
          : course,
      ),
    }));
  };

  const saveSemesterEnd = (semesterEnd: string) => {
    setAcademicData((current) => ({ ...current, semesterEnd }));
    setIsSemesterEditorOpen(false);
  };

  const createCourse = async (input: CourseFormData) => {
    if (!academicData.semesterEnd || !session?.accessToken) {
      throw new Error(
        "Defina a data de fim do semestre antes de cadastrar uma cadeira.",
      );
    }

    const calendarEventId = await createRecurringCourseEvent(
      session.accessToken,
      {
        ...input,
        semesterEnd: academicData.semesterEnd,
      },
    );
    const course: Course = {
      ...input,
      id: crypto.randomUUID(),
      absences: 0,
      calendarEventId,
    };

    setAcademicData((current) => ({
      ...current,
      courses: [...current.courses, course],
    }));
    setIsCourseFormOpen(false);
    setCalendarStatus("loading");
    fetchUpcomingCalendarEvents(session.accessToken)
      .then((calendarEvents) => {
        setEvents(calendarEvents);
        setCalendarStatus("ready");
      })
      .catch(() => setCalendarStatus("error"));
  };

  return (
    <main className={styles.page}>
      <section
        className={styles.dashboard}
        aria-label="Painel do Hub Acadêmico"
      >
        <aside className={styles.summaryPanel}>
          <div className={styles.account}>
            {session?.user.picture ? (
              <img
                className={styles.avatar}
                src={session.user.picture}
                alt=""
              />
            ) : (
              <span className={styles.avatarFallback}>{userInitial}</span>
            )}
            <div>
              <strong>{session?.user.name}</strong>
              <span>{session?.user.email}</span>
            </div>
            <button
              className={styles.iconButton}
              onClick={logout}
              title="Sair"
              aria-label="Sair"
              type="button"
            >
              <LogOut size={18} />
            </button>
          </div>

          <div className={styles.panelHeading}>
            <div>
              <p>Visão geral</p>
              <h1>Resumo do semestre</h1>
            </div>
            <button
              className={styles.iconButton}
              onClick={() => setIsSemesterEditorOpen(true)}
              title="Configurar semestre"
              aria-label="Configurar semestre"
              type="button"
            >
              <Settings2 size={18} />
            </button>
          </div>

          <div className={styles.statGrid}>
            <Stat
              label="Disciplinas ativas"
              value={String(academicData.courses.length)}
              icon={<BookOpen size={18} />}
            />
            <Stat
              label="Faltas no total"
              value={String(totalAbsences)}
              icon={<UserCircle size={18} />}
            />
            <Stat
              label="Semestre termina em"
              value={getSemesterCountdown(academicData.semesterEnd)}
              icon={<Clock3 size={18} />}
            />
          </div>

          <div className={styles.courseListHeader}>
            <h2>Suas disciplinas</h2>
            <span>{academicData.courses.length}</span>
          </div>
          {academicData.courses.length === 0 ? (
            <p className={styles.emptyText}>
              Adicione sua primeira disciplina para começar.
            </p>
          ) : (
            <ul className={styles.courseList}>
              {academicData.courses.map((course) => (
                <li key={course.id} className={styles.courseItem}>
                  <div>
                    <strong>{course.name}</strong>
                    <span>{formatSchedule(course)}</span>
                  </div>
                  <div
                    className={styles.absenceControls}
                    aria-label={`Faltas em ${course.name}`}
                  >
                    <button
                      onClick={() => updateAbsences(course.id, -1)}
                      aria-label="Remover falta"
                      type="button"
                    >
                      <ChevronDown size={15} />
                    </button>
                    <span>{course.absences}</span>
                    <button
                      onClick={() => updateAbsences(course.id, 1)}
                      aria-label="Adicionar falta"
                      type="button"
                    >
                      <ChevronUp size={15} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <section className={styles.agendaPanel}>
          <header className={styles.agendaHeader}>
            <div>
              <p>Sua agenda</p>
              <h2>Próximas aulas</h2>
            </div>
            <button
              className={styles.primaryButton}
              onClick={() => setIsCourseFormOpen(true)}
              type="button"
            >
              <Plus size={18} /> Adicionar disciplina
            </button>
          </header>

          {!academicData.semesterEnd && (
            <div className={styles.setupNotice}>
              <CalendarDays size={20} />
              <div>
                <strong>Quando termina o seu semestre?</strong>
                <p>
                  Informe a data de término para podermos organizar suas aulas.
                </p>
              </div>
              <button
                onClick={() => setIsSemesterEditorOpen(true)}
                type="button"
              >
                Informar data
              </button>
            </div>
          )}
          <CalendarEvents status={calendarStatus} events={events} />
        </section>

        <aside className={styles.pdfPanel}>
          <div className={styles.pdfIcon}>
            <FileText size={24} />
          </div>
          <p>Materiais de estudo</p>
          <h2>Materiais das disciplinas</h2>
          <div className={styles.pdfEmpty}>
            <FileText size={34} />
            <strong>Nenhum material por aqui</strong>
            <span>
              Em breve, você poderá adicionar materiais das suas disciplinas e
              consultar seus resumos neste espaço.
            </span>
          </div>
        </aside>
      </section>

      {isSemesterEditorOpen && (
        <SemesterDialog
          currentValue={academicData.semesterEnd ?? ""}
          onClose={() => setIsSemesterEditorOpen(false)}
          onSave={saveSemesterEnd}
        />
      )}
      {isCourseFormOpen && (
        <CourseDialog
          disabled={!academicData.semesterEnd}
          onClose={() => setIsCourseFormOpen(false)}
          onSubmit={createCourse}
        />
      )}
    </main>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className={styles.stat}>
      <span>{icon}</span>
      <strong>{value}</strong>
      <small>{label}</small>
    </div>
  );
}

function CalendarEvents({
  status,
  events,
}: {
  status: CalendarStatus;
  events: CalendarEvent[];
}) {
  if (status === "loading")
    return (
      <p className={styles.calendarMessage}>
        Buscando seus próximos compromissos...
      </p>
    );
  if (status === "error")
    return (
      <p className={styles.calendarMessage}>
        Não conseguimos carregar seus compromissos. Saia e entre novamente para
        atualizar a permissão da agenda.
      </p>
    );
  if (events.length === 0)
    return (
      <p className={styles.calendarMessage}>
        Você não tem compromissos próximos.
      </p>
    );

  return (
    <ol className={styles.eventList}>
      {events.map((event) => (
        <li key={event.id}>
          <CalendarDays size={18} />
          <div>
            <strong>{event.summary}</strong>
            <time dateTime={event.start}>{formatEventDate(event.start)}</time>
          </div>
        </li>
      ))}
    </ol>
  );
}

type CourseFormData = Pick<
  Course,
  "name" | "weekdays" | "startTime" | "durationMinutes"
>;

function CourseDialog({
  disabled,
  onClose,
  onSubmit,
}: {
  disabled: boolean;
  onClose: () => void;
  onSubmit: (data: CourseFormData) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [weekdays, setWeekdays] = useState<number[]>([]);
  const [startTime, setStartTime] = useState("08:00");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || weekdays.length === 0) {
      setError("Informe o nome e ao menos um dia de aula.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        weekdays,
        startTime,
        durationMinutes,
      });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível cadastrar a cadeira.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog title="Adicionar disciplina" onClose={onClose}>
      <form className={styles.form} onSubmit={submit}>
        <label>
          Nome da disciplina
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ex.: Cálculo I"
            autoFocus
          />
        </label>
        <fieldset>
          <legend>Em quais dias você tem aula?</legend>
          <div className={styles.weekdays}>
            {WEEKDAYS.map((day) => (
              <label key={day.value}>
                <input
                  type="checkbox"
                  checked={weekdays.includes(day.value)}
                  onChange={() =>
                    setWeekdays((current) =>
                      current.includes(day.value)
                        ? current.filter((value) => value !== day.value)
                        : [...current, day.value],
                    )
                  }
                />
                <span>{day.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className={styles.formRow}>
          <label>
            Horário de início
            <input
              type="time"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
            />
          </label>
          <label>
            Duração da aula (minutos)
            <input
              type="number"
              min="15"
              step="15"
              value={durationMinutes}
              onChange={(event) =>
                setDurationMinutes(Number(event.target.value))
              }
            />
          </label>
        </div>
        {disabled && (
          <p className={styles.formError}>
            Informe primeiro quando o semestre termina.
          </p>
        )}
        {error && <p className={styles.formError}>{error}</p>}
        <div className={styles.formActions}>
          <button type="button" onClick={onClose}>
            Cancelar
          </button>
          <button
            className={styles.primaryButton}
            disabled={disabled || isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Adicionando..." : "Adicionar à agenda"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}

function SemesterDialog({
  currentValue,
  onClose,
  onSave,
}: {
  currentValue: string;
  onClose: () => void;
  onSave: (value: string) => void;
}) {
  const [value, setValue] = useState(currentValue);
  return (
    <Dialog title="Quando termina o semestre?" onClose={onClose}>
      <form
        className={styles.form}
        onSubmit={(event) => {
          event.preventDefault();
          if (value) onSave(value);
        }}
      >
        <label>
          Data de término
          <input
            type="date"
            min={new Date().toISOString().slice(0, 10)}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            required
            autoFocus
          />
        </label>
        <p className={styles.dialogHint}>
          Suas aulas serão adicionadas à agenda até essa data.
        </p>
        <div className={styles.formActions}>
          <button type="button" onClick={onClose}>
            Cancelar
          </button>
          <button className={styles.primaryButton} type="submit">
            Salvar data de término
          </button>
        </div>
      </form>
    </Dialog>
  );
}

function Dialog({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className={styles.overlay} role="presentation" onMouseDown={onClose}>
      <section
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header>
          <h2>{title}</h2>
          <button
            className={styles.iconButton}
            type="button"
            aria-label="Fechar"
            onClick={onClose}
          >
            ×
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}

function getSemesterCountdown(semesterEnd: string | null) {
  if (!semesterEnd) return "Definir";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(`${semesterEnd}T00:00:00`);
  const days = Math.ceil((end.getTime() - today.getTime()) / 86_400_000);
  if (days < 0) return "Encerrado";
  if (days === 0) return "Hoje";
  return `${days} dias`;
}

function formatSchedule(course: Course) {
  return `${course.weekdays.map((day) => WEEKDAYS.find((weekday) => weekday.value === day)?.label).join(", ")} · ${course.startTime}`;
}

function formatEventDate(value: string) {
  if (!value) return "Data não informada";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: value.includes("T") ? "short" : undefined,
  }).format(new Date(value));
}

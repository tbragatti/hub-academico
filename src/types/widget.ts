import { BookOpen, Calendar, FileText, type LucideIcon } from 'lucide-react'

export const WIDGET_DRAG_TYPE = 'application/x-hub-widget-id'

export const WIDGET_TYPES = {
  subject: { id: 'subject', label: 'Matéria', Icon: BookOpen },
  calendar: { id: 'calendar', label: 'Calendário', Icon: Calendar },
  note: { id: 'note', label: 'Nota', Icon: FileText },
} as const

export type WidgetId = keyof typeof WIDGET_TYPES

export function isWidgetId(value: string): value is WidgetId {
  return value in WIDGET_TYPES
}

export function getWidget(id: WidgetId) {
  return WIDGET_TYPES[id]
}

export type ToolbarIconConfig = {
  id: WidgetId
  label: string
  Icon: LucideIcon
}

export const TOOLBAR_ICONS: ToolbarIconConfig[] = Object.values(WIDGET_TYPES).map(
  (widget) => ({
    id: widget.id,
    label: widget.label,
    Icon: widget.Icon,
  }),
)

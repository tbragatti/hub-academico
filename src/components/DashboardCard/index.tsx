import { useState } from 'react'
import { CheckCircle2, Clock3, Plus } from 'lucide-react'

import { getWidget, isWidgetId, WIDGET_DRAG_TYPE, type WidgetId } from '../../types/widget'
import styles from './styles.module.css'

export const CARD_WIDTH = 100
export const CARD_HEIGHT = 70

type DashboardCardProps = {
  widgetId: WidgetId | null
  title?: string
  onWidgetDrop: (widgetId: WidgetId) => void
}

function WidgetContent({ widgetId, title }: { widgetId: WidgetId; title?: string }) {
  const widget = getWidget(widgetId)
  const Icon = widget.Icon
  const label = title || widget.label

  if (widgetId === 'calendar') {
    return (
      <div className={styles.calendarWidget}>
        <header className={styles.widgetHeader}>
          <Icon size={14} strokeWidth={2} />
          <span>{label}</span>
        </header>
        <div className={styles.calendarGrid} aria-hidden="true">
          {Array.from({ length: 14 }, (_, index) => (
            <span
              key={index}
              className={index === 9 ? styles.calendarActiveDay : undefined}
            />
          ))}
        </div>
      </div>
    )
  }

  if (widgetId === 'note') {
    return (
      <div className={styles.noteWidget}>
        <header className={styles.widgetHeader}>
          <Icon size={14} strokeWidth={2} />
          <span>{label}</span>
        </header>
        <div className={styles.noteLines} aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
    )
  }

  return (
    <div className={styles.subjectWidget}>
      <header className={styles.widgetHeader}>
        <Icon size={14} strokeWidth={2} />
        <span>{label}</span>
      </header>
      <div className={styles.subjectMeta}>
        <span>
          <CheckCircle2 size={11} strokeWidth={2} />
          4/6
        </span>
        <span>
          <Clock3 size={11} strokeWidth={2} />
          2h
        </span>
      </div>
    </div>
  )
}

export function DashboardCard({ widgetId, title, onWidgetDrop }: DashboardCardProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)

    const droppedId = event.dataTransfer.getData(WIDGET_DRAG_TYPE)
    if (!isWidgetId(droppedId)) return

    onWidgetDrop(droppedId)
  }

  if (widgetId) {
    return (
      <article
        className={styles.card}
        style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
      >
        <WidgetContent widgetId={widgetId} title={title} />
      </article>
    )
  }

  return (
    <article
      className={`${styles.card} ${styles.skeleton} ${isDragOver ? styles.dragOver : ''}`}
      style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className={styles.skeletonInner}>
        <span className={styles.skeletonIcon}>
          <Plus size={18} strokeWidth={1.75} />
        </span>
        <p className={styles.skeletonText}>Arraste o ícone aqui</p>
      </div>
    </article>
  )
}

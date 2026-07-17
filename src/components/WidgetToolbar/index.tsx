import { useState } from 'react'
import { Menu } from 'lucide-react'

import { TOOLBAR_ICONS, WIDGET_DRAG_TYPE } from '../../types/widget'
import styles from './styles.module.css'

export function WidgetToolbar() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [draggedItem, setDraggedItem] = useState<string | null>(null)

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItem(id)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData(WIDGET_DRAG_TYPE, id)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
  }

  return (
    <div className={styles.wrapper}>
      <button
        className={styles.mainButton}
        onClick={() => setIsExpanded(!isExpanded)}
        title="Ferramentas"
        type="button"
      >
        <Menu size={28} />
      </button>

      {isExpanded && (
        <div className={styles.expandedContainer}>
          {TOOLBAR_ICONS.map((item) => (
            <div
              key={item.id}
              className={`${styles.iconItem} ${draggedItem === item.id ? styles.dragging : ''}`}
              draggable
              onDragStart={(e) => handleDragStart(e, item.id)}
              onDragEnd={handleDragEnd}
            >
              <item.Icon size={24} />
              <span className={styles.label}>{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

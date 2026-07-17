import { useState } from 'react'
import { X } from 'lucide-react'

import { TOOLBAR_ICONS, type WidgetId } from '../../types/widget'
import styles from './styles.module.css'

export type NewCardConfig = {
  title: string
  widgetId: WidgetId | null
}

type AddCardModalProps = {
  isOpen: boolean
  onClose: () => void
  onConfirm: (config: NewCardConfig) => void
}

export function AddCardModal({ isOpen, onClose, onConfirm }: AddCardModalProps) {
  const [title, setTitle] = useState('')
  const [widgetId, setWidgetId] = useState<WidgetId | ''>('')

  if (!isOpen) return null

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    onConfirm({
      title: title.trim(),
      widgetId: widgetId || null,
    })
    onClose()
  }

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-card-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <h2 id="add-card-title" className={styles.title}>
            Novo card
          </h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span className={styles.label}>Título (opcional)</span>
            <input
              className={styles.input}
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ex.: Minhas matérias"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Tipo de widget (opcional)</span>
            <select
              className={styles.select}
              value={widgetId}
              onChange={(event) => setWidgetId(event.target.value as WidgetId | '')}
            >
              <option value="">Definir ao arrastar o ícone</option>
              {TOOLBAR_ICONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <p className={styles.hint}>
            Você também pode arrastar um ícone da barra de ferramentas direto no card.
          </p>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className={styles.confirmButton}>
              Criar card
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

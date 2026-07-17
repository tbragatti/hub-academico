import { useState } from 'react'
import { Plus } from 'lucide-react'

import { AddCardModal, type NewCardConfig } from '../AddCardModal'
import { DashboardCard } from '../DashboardCard'
import type { WidgetId } from '../../types/widget'
import styles from './styles.module.css'

export type DashboardCardState = {
  id: string
  title?: string
  widgetId: WidgetId | null
}

function createCard(partial?: Partial<DashboardCardState>): DashboardCardState {
  return {
    id: crypto.randomUUID(),
    title: partial?.title,
    widgetId: partial?.widgetId ?? null,
  }
}

export function DashboardGrid() {
  const [cards, setCards] = useState<DashboardCardState[]>([
    createCard(),
    createCard(),
    createCard(),
  ])
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleWidgetDrop = (cardId: string, widgetId: WidgetId) => {
    setCards((currentCards) =>
      currentCards.map((card) =>
        card.id === cardId ? { ...card, widgetId } : card,
      ),
    )
  }

  const handleConfigureNewCard = (config: NewCardConfig) => {
    setCards((currentCards) =>
      currentCards.concat(
        createCard({
          title: config.title || undefined,
          widgetId: config.widgetId,
        }),
      ),
    )
  }

  return (
    <section className={styles.wrapper}>
      <div className={styles.board}>
        {cards.map((card) => (
          <DashboardCard
            key={card.id}
            widgetId={card.widgetId}
            title={card.title}
            onWidgetDrop={(widgetId) => handleWidgetDrop(card.id, widgetId)}
          />
        ))}

        <button
          type="button"
          className={styles.addButton}
          onClick={() => setIsModalOpen(true)}
          aria-label="Configurar novo card"
          title="Novo card"
        >
          <Plus size={20} strokeWidth={2} />
        </button>
      </div>

      {isModalOpen && (
        <AddCardModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfigureNewCard}
        />
      )}
    </section>
  )
}

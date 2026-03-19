import type { ReactNode } from 'react'

interface SelectableFeature {
  readonly id: string
  readonly title: string
  readonly category: string
  readonly summary: string
}

interface FeatureGridProps<T extends SelectableFeature> {
  readonly items: readonly T[]
  readonly activeId: T['id']
  readonly onSelect: (id: T['id']) => void
  readonly renderMeta: (item: T) => ReactNode
}

// This generic component shows how one typed UI building block can render many feature shapes.
export function FeatureGrid<T extends SelectableFeature>({
  items,
  activeId,
  onSelect,
  renderMeta,
}: FeatureGridProps<T>) {
  return (
    <div className="feature-grid" role="list">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`feature-card ${item.id === activeId ? 'is-active' : ''}`}
          onClick={() => onSelect(item.id)}
        >
          <span className="feature-card__category">{item.category}</span>
          <strong>{item.title}</strong>
          <p>{item.summary}</p>
          <div className="feature-card__meta">{renderMeta(item)}</div>
        </button>
      ))}
    </div>
  )
}

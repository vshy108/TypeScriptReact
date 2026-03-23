// Type-only imports disappear from emitted JavaScript, which matters when verbatimModuleSyntax is enabled.
import type { ReactNode } from 'react'

// SelectableFeature is the constraint for any item that can appear in the grid.
// Keeping it minimal (id, title, category, summary) makes FeatureGrid reusable
// for different item shapes — the generic T only needs to extend this baseline.
interface SelectableFeature {
  readonly id: string
  readonly title: string
  readonly category: string
  readonly summary: string
}

// The generic parameter T lets callers pass their own item type (e.g. FeatureDefinition)
// while the grid only depends on the SelectableFeature contract.
interface FeatureGridProps<T extends SelectableFeature> {
  readonly items: readonly T[]
  readonly activeId: T['id']
  readonly onSelect: (id: T['id']) => void
  // Callers supply renderMeta so this generic grid stays reusable; the grid owns selection layout,
  // while each caller decides which extra fields matter for its specific item type.
  readonly renderMeta: (item: T) => ReactNode
}

// This generic component shows how generic props can reuse one UI primitive across many item shapes.
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

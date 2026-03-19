const typePatterns = [
  {
    label: 'Template literal ids',
    code: 'type TaskId = `task-${string}`',
    note: 'Ids keep a recognizable shape across form parsing, state, and UI rendering.',
  },
  {
    label: 'Assertion functions',
    code: 'asserts value is string',
    note: 'The form parser narrows raw FormData values into validated domain input.',
  },
  {
    label: 'Literal-safe config',
    code: 'as const satisfies',
    note: 'Static content stays precise without losing structural checks.',
  },
  {
    label: 'Exact optional properties',
    code: 'exactOptionalPropertyTypes: true',
    note: 'Optional data is modeled the same way it behaves at runtime.',
  },
  {
    label: 'Indexed access safety',
    code: 'noUncheckedIndexedAccess: true',
    note: 'Every array and map lookup must handle the missing case explicitly.',
  },
  {
    label: 'Generic UI building blocks',
    code: 'FeatureGrid<T>',
    note: 'The feature explorer is a reusable typed component, not a one-off list.',
  },
] as const

export default function TypeNotes() {
  // This file is lazy-loaded so the app demonstrates Suspense with a small real feature slice.
  return (
    <section className="surface surface--compact">
      <div className="section-heading">
        <p className="eyebrow">TypeScript coverage</p>
        <h2>Patterns worth keeping in real projects</h2>
      </div>
      <div className="type-grid">
        {typePatterns.map((pattern) => (
          <article key={pattern.label} className="type-card">
            <h3>{pattern.label}</h3>
            <code>{pattern.code}</code>
            <p>{pattern.note}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

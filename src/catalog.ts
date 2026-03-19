export type FeatureCategory = 'React' | 'TypeScript' | 'Tooling'
export type FeatureId = `feature-${number}`
export type FeatureRelease = 'React 19' | 'TS 5.9' | 'Vite 8'
export type TaskLane = 'UI' | 'Data' | 'Performance'
export type TaskId = `task-${string}`

export interface FeatureDefinition {
  readonly id: FeatureId
  readonly title: string
  readonly category: FeatureCategory
  readonly release: FeatureRelease
  readonly api: string
  readonly summary: string
  readonly whyItMatters: string
  readonly keywords: readonly string[]
}

export interface Task {
  readonly id: TaskId
  readonly title: string
  readonly lane: TaskLane
  readonly createdAt: string
  readonly optimistic?: true
}

// "satisfies" verifies the lane list against the domain type without widening the literals away.
export const taskLanes = ['UI', 'Data', 'Performance'] as const satisfies readonly TaskLane[]

export const starterTasks = [
  {
    id: 'task-seed-forms',
    title: 'Wire form actions into a dashboard flow',
    lane: 'UI',
    createdAt: '09:00:00',
  },
  {
    id: 'task-seed-transition',
    title: 'Move expensive filters behind a transition',
    lane: 'Performance',
    createdAt: '09:07:00',
  },
  {
    id: 'task-seed-types',
    title: 'Promote shared API shapes into reusable types',
    lane: 'Data',
    createdAt: '09:12:00',
  },
] as const satisfies readonly Task[]

// This static catalog doubles as both UI content and a strongly typed feature inventory.
export const featureCatalog = [
  {
    id: 'feature-1',
    title: 'Form actions with useActionState',
    category: 'React',
    release: 'React 19',
    api: 'useActionState()',
    summary: 'Treat a form submit like an async state transition instead of manual event plumbing.',
    whyItMatters: 'You get pending state and result state from one place, which keeps form flows more declarative.',
    keywords: ['forms', 'pending', 'async', 'submit'],
  },
  {
    id: 'feature-2',
    title: 'Optimistic UI with rollback-safe overlays',
    category: 'React',
    release: 'React 19',
    api: 'useOptimistic()',
    summary: 'Render the likely next state immediately, then reconcile once the async action completes.',
    whyItMatters: 'This removes the lag between intent and feedback without forcing you to manually clone state trees.',
    keywords: ['optimistic', 'latency', 'state'],
  },
  {
    id: 'feature-3',
    title: 'Responsive filtering with transitions',
    category: 'React',
    release: 'React 19',
    api: 'useDeferredValue(), useTransition()',
    summary: 'Keep typing and navigation responsive while the UI works through heavier derived views.',
    whyItMatters: 'You can mark non-urgent work so React prioritizes the parts that feel interactive to users.',
    keywords: ['deferred', 'transition', 'search', 'performance'],
  },
  {
    id: 'feature-4',
    title: 'Stable event logic in effects',
    category: 'React',
    release: 'React 19',
    api: 'useEffectEvent()',
    summary: 'Use the latest state inside long-lived effects without resubscribing on every render.',
    whyItMatters: 'This removes a common source of stale closures and noisy dependency arrays.',
    keywords: ['effects', 'events', 'subscriptions'],
  },
  {
    id: 'feature-5',
    title: 'Ref as a prop in function components',
    category: 'React',
    release: 'React 19',
    api: 'ref prop + useImperativeHandle()',
    summary: 'Expose focused imperative actions from a function component without wrapping it in forwardRef.',
    whyItMatters: 'React 19 reduces the ceremony around imperative escape hatches, especially for inputs and editors.',
    keywords: ['ref', 'imperative', 'input'],
  },
  {
    id: 'feature-6',
    title: 'Strict compiler settings for safer domain code',
    category: 'TypeScript',
    release: 'TS 5.9',
    api: 'exactOptionalPropertyTypes, noUncheckedIndexedAccess',
    summary: 'Turn on the checks that force your types to match runtime behavior more closely.',
    whyItMatters: 'These flags catch missing null checks and sloppy option handling before they escape into production.',
    keywords: ['strict', 'compiler', 'safety'],
  },
  {
    id: 'feature-7',
    title: 'Template literal ids and assertion functions',
    category: 'TypeScript',
    release: 'TS 5.9',
    api: 'type TaskId = `task-${string}`',
    summary: 'Make ids and parsed form values more explicit with lightweight type-level contracts.',
    whyItMatters: 'This sharpens the borders between raw input, validated input, and domain objects.',
    keywords: ['template literal types', 'asserts', 'validation'],
  },
  {
    id: 'feature-8',
    title: 'Data objects checked with satisfies',
    category: 'TypeScript',
    release: 'TS 5.9',
    api: 'as const satisfies',
    summary: 'Keep literal inference while still proving that static data conforms to the target shape.',
    whyItMatters: 'You get exhaustive typed configuration without widening every useful string into plain string.',
    keywords: ['satisfies', 'const', 'config'],
  },
  {
    id: 'feature-9',
    title: 'Fast modern build loop',
    category: 'Tooling',
    release: 'Vite 8',
    api: 'Vite + React plugin',
    summary: 'Use the current Vite stack to keep dev startup and rebuilds fast while React stays current.',
    whyItMatters: 'It pairs cleanly with the React 19 and TypeScript 5.9 toolchain without adding framework overhead.',
    keywords: ['vite', 'hmr', 'build'],
  },
  {
    id: 'feature-10',
    title: 'Code splitting with Suspense-ready boundaries',
    category: 'React',
    release: 'React 19',
    api: 'lazy(), Suspense',
    summary: 'Defer non-critical panels and show intent-aware fallbacks while chunks stream in.',
    whyItMatters: 'It keeps the first paint smaller and makes secondary content explicit in the component tree.',
    keywords: ['lazy', 'suspense', 'bundle'],
  },
] as const satisfies readonly FeatureDefinition[]

// Derive the exact id union from the catalog so selection state can never drift from the data.
export type KnownFeatureId = (typeof featureCatalog)[number]['id']

export const paletteSuggestions = [
  'open the form action demo',
  'focus the command palette',
  'highlight the TypeScript section',
  'show React 19 APIs',
] as const

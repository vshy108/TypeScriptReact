import {
  Suspense,
  lazy,
  useActionState,
  useDeferredValue,
  useEffect,
  useEffectEvent,
  useId,
  useOptimistic,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
} from 'react'
import './App.css'
import {
  featureCatalog,
  type KnownFeatureId,
  paletteSuggestions,
  starterTasks,
  taskLanes,
  type FeatureCategory,
  type Task,
  type TaskLane,
} from './catalog'
import { CommandPalette, type CommandPaletteHandle } from './components/CommandPalette'
import { FeatureGrid } from './components/FeatureGrid'
import MiniSampleBoard from './components/MiniSampleBoard'
import MiniSampleStage from './components/MiniSampleStage'
import { getServerSnapshot, getSnapshot, subscribe } from './releaseStore'

// Keep the TypeScript note cards out of the initial bundle to demonstrate lazy loading.
// lazy() + Suspense is the modern replacement for manual code-splitting patterns that used
// dynamic import() with class component setState or custom loading wrappers.
const TypeNotes = lazy(() => import('./components/TypeNotes'))

type FilterCategory = FeatureCategory | 'All'
// This discriminated union narrows on status, and the matching assertNever helper keeps the switch exhaustive.
type SubmissionState =
  | { readonly status: 'idle'; readonly message: string }
  | { readonly status: 'success'; readonly message: string }
  | { readonly status: 'error'; readonly message: string }

interface TaskDraft {
  readonly title: string
  readonly lane: TaskLane
}

const highlights = [
  'React 19.2.4',
  'TypeScript 5.9.3',
  'Vite 8',
  'useActionState',
  'useOptimistic',
  'useDeferredValue',
  'useTransition',
  'useEffectEvent',
  'useSyncExternalStore',
  'ref as prop',
] as const

const initialSubmissionState = {
  status: 'idle',
  message: 'Submit the form to see an optimistic task appear before the async action resolves.',
} as const satisfies SubmissionState

// A tiny fake latency helper so the optimistic UI has something visible to reconcile against.
function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date)
}

// Assert raw FormData values before converting them into domain-level objects.
function assertNonEmptyString(
  value: FormDataEntryValue | null,
  field: string,
): asserts value is string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${field} is required.`)
  }
}

function isTaskLane(value: string): value is TaskLane {
  // A type guard lets later code treat the validated string as the narrower TaskLane union.
  return taskLanes.some((lane) => lane === value)
}

// Create the task entity in one place so saved and optimistic tasks stay structurally aligned.
function createTask(draft: TaskDraft, optimistic = false): Task {
  return {
    id: `task-${crypto.randomUUID()}`,
    title: draft.title,
    lane: draft.lane,
    createdAt: formatTime(new Date()),
    ...(optimistic ? { optimistic: true as const } : {}),
  }
}

// Parse and narrow the browser FormData payload into a typed TaskDraft.
function parseTaskFormData(formData: FormData): TaskDraft {
  const titleValue = formData.get('title')
  const laneValue = formData.get('lane')

  assertNonEmptyString(titleValue, 'Title')
  assertNonEmptyString(laneValue, 'Lane')

  if (!isTaskLane(laneValue)) {
    throw new Error('Pick a valid lane.')
  }

  return {
    title: titleValue.trim(),
    lane: laneValue,
  }
}

function assertNever(value: never): never {
  // Exhaustive never checks make sure new union members cannot slip through unhandled branches.
  throw new Error(`Unhandled value: ${String(value)}`)
}

function statusClassName(status: SubmissionState['status']) {
  switch (status) {
    case 'idle':
      return 'status status--idle'
    case 'success':
      return 'status status--success'
    case 'error':
      return 'status status--error'
    default:
      return assertNever(status)
  }
}

export default function App() {
  // useId produces accessible form ids, and useRef keeps imperative handles for the palette and form DOM node.
  // useRef is the modern replacement for createRef(), which was designed for class components and created
  // a new ref object on every render. useRef persists the same object across renders automatically.
  const featureFormId = useId()
  const commandRef = useRef<CommandPaletteHandle>(null)
  const taskFormRef = useRef<HTMLFormElement>(null)

  // useState holds local UI state for the current filters, selected feature, and activity logs.
  const [tasks, setTasks] = useState<readonly Task[]>(starterTasks)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<FilterCategory>('All')
  const [activeFeatureId, setActiveFeatureId] = useState<KnownFeatureId>(featureCatalog[0].id)
  const [commandLog, setCommandLog] = useState<readonly string[]>([
    'Press Ctrl/Cmd + K to load the currently selected feature into the palette.',
  ])
  // useTransition marks category changes as non-urgent, while useDeferredValue lets search lag slightly behind fast typing.
  const [transitionPending, startTransition] = useTransition()
  const deferredQuery = useDeferredValue(query)
  // This value lives outside React state and is synchronized through useSyncExternalStore.
  const liveSnapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  // Render the likely next task list immediately while the async form action is still running.
  const [optimisticTasks, addOptimisticTask] = useOptimistic(
    tasks,
    (currentTasks, draft: TaskDraft) => [createTask(draft, true), ...currentTasks],
  )

  // useActionState owns the async submit lifecycle and returns state plus pending status.
  const [submissionState, submitTask, isSubmitting] = useActionState(
    async (_previousState: SubmissionState, formData: FormData): Promise<SubmissionState> => {
      try {
        const draft = parseTaskFormData(formData)
        await wait(900)
        const savedTask = createTask(draft)

        setTasks((currentTasks) => [savedTask, ...currentTasks])

        return {
          status: 'success',
          message: `"${savedTask.title}" was saved at ${savedTask.createdAt}.`,
        }
      } catch (error) {
        return {
          status: 'error',
          message: error instanceof Error ? error.message : 'Unable to save the task.',
        }
      }
    },
    initialSubmissionState,
  )

  // useEffectEvent lets a long-lived effect read the latest selected feature without re-subscribing.
  const activeFeatureEvent = useEffectEvent(() => {
    const activeFeature = featureCatalog.find((feature) => feature.id === activeFeatureId) ?? featureCatalog[0]

    commandRef.current?.load(activeFeature.title)
    setCommandLog((currentLog) => [
      `Loaded "${activeFeature.title}" into the palette via the global shortcut.`,
      ...currentLog,
    ].slice(0, 4))
  })

  // useEffect is the right place for browser subscriptions because setup happens after render and cleanup happens on unmount.
  useEffect(() => {
    // Register the global shortcut once; the effect event keeps its inner logic fresh.
    function handleGlobalShortcut(event: KeyboardEvent) {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'k') {
        return
      }

      event.preventDefault()
      activeFeatureEvent()
    }

    window.addEventListener('keydown', handleGlobalShortcut)

    return () => {
      window.removeEventListener('keydown', handleGlobalShortcut)
    }
  }, [])

  function handleTaskAction(formData: FormData) {
    try {
      const draft = parseTaskFormData(formData)
      addOptimisticTask(draft)
      taskFormRef.current?.reset()
    } catch {
      // Let useActionState surface the validation message.
    }

    submitTask(formData)
  }

  function handleCommandSubmit(value: string) {
    setCommandLog((currentLog) => [
      `Executed "${value}" at ${formatTime(new Date())}.`,
      ...currentLog,
    ].slice(0, 4))
  }

  function handleCategoryChange(nextCategory: FilterCategory) {
    startTransition(() => {
      setCategory(nextCategory)
    })
  }

  const normalizedQuery = deferredQuery.trim().toLowerCase()

  // The deferred query keeps typing responsive even when the derived feature list grows.
  const visibleFeatures = featureCatalog.filter((feature) => {
    const inCategory = category === 'All' || feature.category === category

    if (!inCategory) {
      return false
    }

    const haystack = `${feature.title} ${feature.summary} ${feature.api} ${feature.keywords.join(' ')}`.toLowerCase()

    return !normalizedQuery || haystack.includes(normalizedQuery)
  })

  const selectedFeature =
    visibleFeatures.find((feature) => feature.id === activeFeatureId) ?? visibleFeatures[0]

  return (
    <main className="page-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Latest stable stack, real usage</p>
          <h1>React 19 + TypeScript 5.9, wired into one project.</h1>
          <p className="hero-summary">
            This app is not a toy counter. It demonstrates modern React 19 APIs, strict
            TypeScript 5.9 settings, and current Vite tooling in one runnable codebase.
          </p>
          <div className="chip-row">
            {highlights.map((highlight) => (
              <span key={highlight} className="chip">
                {highlight}
              </span>
            ))}
          </div>
        </div>
        <aside className="surface hero-panel">
          <p className="eyebrow">What this covers</p>
          <ul className="summary-list">
            <li>Declarative form actions with optimistic updates.</li>
            <li>Deferred filtering and transitions for responsiveness.</li>
            <li>Typed external subscriptions with live snapshots.</li>
            <li>React 19 effect events and ref-as-prop patterns.</li>
            <li>Strict TypeScript config, template literal ids, and generic UI building blocks.</li>
          </ul>
        </aside>
      </section>

      <section className="content-grid">
        <article className="surface">
          <div className="section-heading">
            <p className="eyebrow">React 19 forms</p>
            <h2>useActionState + useOptimistic + useId</h2>
          </div>

          {/* React-managed form elements keep DOM input state, FormData submission, and button pending UI coordinated through React. */}
          <form ref={taskFormRef} action={handleTaskAction} className="task-form">
            <div className="field">
              <label htmlFor={`${featureFormId}-title`}>Task title</label>
              <input
                id={`${featureFormId}-title`}
                name="title"
                type="text"
                placeholder="Ship a typed feature slice"
              />
            </div>

            <div className="field">
              <label htmlFor={`${featureFormId}-lane`}>Lane</label>
              <select id={`${featureFormId}-lane`} name="lane" defaultValue="UI">
                {taskLanes.map((lane) => (
                  <option key={lane} value={lane}>
                    {lane}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="primary-button" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Create task'}
            </button>
          </form>

          <p className={statusClassName(submissionState.status)}>{submissionState.message}</p>

          <div className="task-list">
            {optimisticTasks.map((task) => (
              <article key={task.id} className="task-card">
                <div>
                  <strong>{task.title}</strong>
                  <span>{task.lane}</span>
                </div>
                <div className="task-meta">
                  <span>{task.createdAt}</span>
                  {task.optimistic ? <span className="pill">Optimistic</span> : null}
                </div>
              </article>
            ))}
          </div>
        </article>

        <article className="surface">
          <div className="section-heading">
            <p className="eyebrow">Responsive exploration</p>
            <h2>useDeferredValue + useTransition</h2>
          </div>

          <div className="explorer-controls">
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search React and TypeScript features"
            />

            <div className="filter-row">
              {(['All', 'React', 'TypeScript', 'Tooling'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`filter-button ${category === option ? 'is-selected' : ''}`}
                  onClick={() => handleCategoryChange(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <p className="explorer-note">
            {transitionPending || query !== deferredQuery
              ? 'React is handling a non-urgent update.'
              : `${visibleFeatures.length} feature cards visible.`}
          </p>

          {visibleFeatures.length ? (
            <div className="explorer-layout">
              <FeatureGrid
                items={visibleFeatures}
                activeId={selectedFeature?.id ?? activeFeatureId}
                onSelect={setActiveFeatureId}
                renderMeta={(feature) => (
                  <>
                    <span>{feature.release}</span>
                    <span>{feature.api}</span>
                  </>
                )}
              />

              {selectedFeature ? (
                <aside className="detail-panel">
                  <span className="detail-panel__label">{selectedFeature.release}</span>
                  <h3>{selectedFeature.title}</h3>
                  <p>{selectedFeature.summary}</p>
                  <code>{selectedFeature.api}</code>
                  <p>{selectedFeature.whyItMatters}</p>
                </aside>
              ) : null}
            </div>
          ) : (
            <div className="empty-state">
              <strong>No matching features.</strong>
              <p>Try removing the filter or search text.</p>
            </div>
          )}
        </article>

        <article className="surface">
          <div className="section-heading">
            <p className="eyebrow">External data</p>
            <h2>useSyncExternalStore</h2>
          </div>

          <div className="snapshot-grid">
            <div className="snapshot-card">
              <span>Status</span>
              <strong>{liveSnapshot.online ? 'Online' : 'Offline'}</strong>
            </div>
            <div className="snapshot-card">
              <span>Preferred scheme</span>
              <strong>{liveSnapshot.preferredScheme}</strong>
            </div>
            <div className="snapshot-card">
              <span>Live time</span>
              <strong>{liveSnapshot.currentTime}</strong>
            </div>
          </div>

          <p className="section-copy">
            This panel is driven by a small external store instead of local component state,
            which is the intended job for <code>useSyncExternalStore</code>.
          </p>
        </article>

        <article className="surface">
          <div className="section-heading">
            <p className="eyebrow">Events and refs</p>
            <h2>useEffectEvent + ref as prop</h2>
          </div>

          <CommandPalette
            ref={commandRef}
            suggestions={paletteSuggestions}
            onSubmit={handleCommandSubmit}
          />

          <div className="command-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => commandRef.current?.focus()}
            >
              Focus palette
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                commandRef.current?.load(selectedFeature?.title ?? featureCatalog[0].title)
              }
            >
              Load selected feature
            </button>
          </div>

          <p className="section-copy">
            A global <code>Ctrl/Cmd + K</code> listener is registered once.{' '}
            <code>useEffectEvent</code> keeps it in sync with the latest selected feature
            without re-subscribing the effect.
          </p>

          <div className="command-log">
            {commandLog.map((entry) => (
              <p key={entry}>{entry}</p>
            ))}
          </div>
        </article>
      </section>

      <MiniSampleBoard />
      <MiniSampleStage />

      {/* Suspense shows a fallback while the lazy TypeNotes chunk is still loading. */}
      <Suspense
        fallback={
          <section className="surface surface--compact">
            <div className="section-heading">
              <p className="eyebrow">Loading</p>
              <h2>TypeScript notes are being code-split.</h2>
            </div>
          </section>
        }
      >
        <TypeNotes />
      </Suspense>
    </main>
  )
}

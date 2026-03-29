# Interview Sample Answers

Use this after you attempt the questions in [./interview-questions.md](./interview-questions.md) yourself.

These are intentionally short. They are meant to model a solid interview answer shape, not to replace reading the linked repo files.

## React Answers

### How would you explain the difference between `useActionState` and `useOptimistic`?

`useActionState` owns the real async submission flow. It gives you the authoritative success or error result after the action finishes. `useOptimistic` is different: it lets the UI temporarily show the likely next state before the server or async work confirms it. In [../src/App.tsx](../src/App.tsx), they work together because the task appears optimistically first, then the real action reconciles the final saved state.

The submit handler calls `addOptimisticTask(draft)` for instant UI feedback, then `submitTask(formData)` to start the real save. The component renders from `optimisticTasks` (not `tasks`) so the draft is visible immediately. When the action finishes and calls `setTasks()`, React automatically replaces the optimistic list with the real one. The two paths are intentionally independent: the async action re-parses `FormData` from scratch rather than receiving the optimistic draft, so the authoritative save is correct even if the optimistic path is skipped or throws. If the action fails, the optimistic item disappears because `tasks` was never updated.

```tsx
// useOptimistic derives from tasks — addOptimisticTask shows a draft instantly
const [optimisticTasks, addOptimisticTask] = useOptimistic(
  tasks,
  (current, draft: TaskDraft) => [createTask(draft, true), ...current],
)
// useActionState owns the async lifecycle — re-parses FormData independently
const [submissionState, submitTask, isSubmitting] = useActionState(
  async (_prev: SubmissionState, formData: FormData) => {
    const draft = parseTaskFormData(formData)  // independent parse
    const saved = createTask(draft)
    setTasks(cur => [saved, ...cur])           // commit to real state
    return { status: 'success', message: `Saved "${saved.title}"` }
  },
  initialSubmissionState,
)
// Submit: optimistic first, then hand off to the action
function handleTaskAction(formData: FormData) {
  const draft = parseTaskFormData(formData)
  addOptimisticTask(draft)   // instant feedback
  submitTask(formData)       // real save
}
```

### When would you choose `useState` instead of `useReducer`?

I would use `useState` when updates are small and direct, like toggles, input text, or one-off local values. I switch to `useReducer` when state transitions are easier to describe as domain actions and several updates affect one shared model. You can see that contrast between the lighter local state in [../src/App.tsx](../src/App.tsx) and the action-driven structure in [../src/samples/ReducerBoardSample.tsx](../src/samples/ReducerBoardSample.tsx).

In the board sample, every user action maps to a discriminated union member like `{ type: 'add' }`, `{ type: 'move' }`, or `{ type: 'toggle-priority' }`. The reducer handles each case in an exhaustive switch with an `assertNever` default, so adding a new action without handling it is a compile error. The third argument to `useReducer` is a lazy initializer function that seeds the board without running during every render. This structure makes it easy to add new actions, replay state transitions, and test the reducer as a pure function outside React.

```tsx
// Discriminated union — each action is a tagged object
type BoardAction =
  | { readonly type: 'add'; readonly task: BoardTask }
  | { readonly type: 'move'; readonly taskId: BoardTaskId; readonly lane: BoardLane }
  | { readonly type: 'toggle-priority'; readonly taskId: BoardTaskId }
  | { readonly type: 'reset' }

// Exhaustive reducer — assertNever catches unhandled actions at compile time
function boardReducer(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    case 'add': return { ...state, tasks: [action.task, ...state.tasks] }
    case 'move': return { ...state, tasks: state.tasks.map(t => t.id === action.taskId ? { ...t, lane: action.lane } : t) }
    case 'toggle-priority': return { ...state, tasks: state.tasks.map(t => t.id === action.taskId ? { ...t, priority: t.priority === 'High' ? 'Normal' : 'High' } : t) }
    case 'reset': return { ...createBoardState(), lastAction: 'Reset.' }
    default: return assertNever(action)
  }
}

// Third arg is a lazy initializer — runs once, not on every render
const [state, dispatch] = useReducer(boardReducer, undefined, createBoardState)
dispatch({ type: 'add', task: createBoardTask(title) })
```

### Why is `key={index}` dangerous?

React uses keys to decide which child keeps which identity across renders. If the key is just the array index, state follows position rather than the actual item, so reorders can attach the wrong state to the wrong row. [../src/samples/KeyIdentitySample.tsx](../src/samples/KeyIdentitySample.tsx) is a good example because it shows why stable ids preserve the intended ownership.

The sample renders the same task list twice side by side: once with `key={index}` and once with `key={task.id}`. When you shuffle the list with a Fisher-Yates reorder, the index-keyed side visibly breaks because React matches position-0's state to whatever item lands in position 0 after the shuffle. The id-keyed side keeps each row's internal state attached to the correct task. The sample also shows the key-reset trick: changing a component's key forces React to destroy and remount it, which is useful for resetting form state without a manual handler.

```tsx
{/* BUG: key={index} — state follows DOM position, not the data item */}
{tasks.map((task, index) => (
  <TaskRow key={index} task={task} />
))}

{/* FIX: key={task.id} — state follows data identity across reorders */}
{tasks.map((task) => (
  <TaskRow key={task.id} task={task} />
))}

{/* Key-reset trick: change key to force remount and clear internal state */}
<ResettableForm key={formResetKey} />
```

### When do `memo`, `useMemo`, and `useCallback` actually help?

They help only when there is a real memoization boundary to benefit from stable values. `memo` skips a component render when props are unchanged, `useMemo` caches a computed value, and `useCallback` stabilizes a function identity for code that depends on referential equality. In [../src/samples/MemoLabSample.tsx](../src/samples/MemoLabSample.tsx) and [../src/samples/ContextIdentitySample.tsx](../src/samples/ContextIdentitySample.tsx), the useful question is not “can I memoize this?” but “what expensive or identity-sensitive work am I actually avoiding?”

In the MemoLab sample, the `useVisibleRoster` hook caches a multi-step filter-sort pipeline inside `useMemo` so it only re-runs when `focusFilter`, `query`, `onlyAvailable`, or `sortMode` change. The member card is wrapped with `memo()` so it skips re-render when its props are stable. For that to work, `handleSelectMember` is wrapped in `useCallback` with an empty dependency array so the function identity stays the same across renders. The `<Profiler>` component wraps the stage and reports `actualDuration` vs `baseDuration` on each commit, and `useDebugValue` labels the custom hook in DevTools so you can trace which hook contributes to slow renders.

```tsx
// memo() — shallow prop comparison skips re-renders for unchanged cards
const MemoMemberCard = memo(function MemoMemberCard({ member, isSelected, onSelectMember }) {
  return <div className={isSelected ? 'selected' : ''}>{member.name}</div>
})

// useMemo — expensive filter-sort only re-runs when inputs change
const roster = useMemo(() => {
  return labMembers
    .filter(m => focusFilter === 'All' || m.focus === focusFilter)
    .filter(m => !onlyAvailable || m.available)
    .filter(m => m.name.includes(query))
    .sort(/* ... */)
}, [focusFilter, query, onlyAvailable, sortMode])

// useCallback — handler identity is stable so memo() on children works
const handleSelectMember = useCallback((id: LabMemberId) => setSelectedId(id), [])

// Profiler — wraps subtree to measure render cost per commit
<Profiler id="memo-stage" onRender={handleProfilerRender}><MemoLabStage /></Profiler>
```
### What is the difference between `Suspense` and an Error Boundary?

`Suspense` handles waiting, not failure. If a component suspends on a pending resource or lazy import, `Suspense` shows a fallback until that wait resolves. If rendering throws an actual error, you need an Error Boundary to catch it, which is why [../src/samples/ErrorBoundarySample.tsx](../src/samples/ErrorBoundarySample.tsx) separates loading behavior from failure behavior.

The sample creates two `lazy()` components: one that resolves and one that rejects after a timeout. `SampleErrorBoundary` is a class component with `getDerivedStateFromError` that captures the error and renders a fallback with a reset button. When the failing lazy import throws, `Suspense` cannot catch it because the promise rejected rather than stayed pending, so the error bubbles up to the Error Boundary. The reset handler calls `setState({ error: null })` to clear the error and let the children attempt to render again. This is why lazy-loading failures need both boundaries: `Suspense` for the loading wait and `ErrorBoundary` for the network error.

```tsx
// Error Boundary class — catches render-time throws
class SampleErrorBoundary extends Component<Props, { error: Error | null }> {
  static getDerivedStateFromError(error: Error) { return { error } }
  handleReset = () => { this.setState({ error: null }); this.props.onReset?.() }
  render() {
    if (this.state.error) return <div role="alert"><p>{this.state.error.message}</p><button onClick={this.handleReset}>Retry</button></div>
    return this.props.children
  }
}

// Suspense catches pending, ErrorBoundary catches rejected
<Suspense fallback={<Spinner />}>
  <SampleErrorBoundary label="lazy-load" onReset={handleRetry}>
    <LazyComponent />
  </SampleErrorBoundary>
</Suspense>
```

### How would you explain `useDeferredValue` vs `useTransition`?

`useTransition` changes how I schedule an update: I mark some work as non-urgent so urgent UI like typing can stay responsive. `useDeferredValue` changes how I consume a value: I let derived work lag behind a more urgent source value. In [../src/App.tsx](../src/App.tsx), that means category changes can be transitioned while fast search input can feed a deferred query.

In the App, `useDeferredValue(query)` creates a lagging copy of the search text so the filter computation runs at lower priority while keystrokes commit immediately. `useTransition` wraps category changes: when the user picks a new category, `startTransition(() => setCategory(next))` marks that update as interruptible so any concurrent urgent work (like typing) takes priority. The `isPending` flag from `useTransition` can drive a visual loading indicator while the transition is in flight. In `ActivityTransitionSample`, `startTransition` also wraps non-urgent log updates so region card rendering stays responsive while secondary UI catches up.

```tsx
// useDeferredValue — derived query lags behind fast typing
const deferredQuery = useDeferredValue(query)
// filter uses deferredQuery, so expensive work yields to keystrokes
const filtered = features.filter(f => f.title.includes(deferredQuery))

// useTransition — marks category change as non-urgent
const [isPending, startTransition] = useTransition()
function handleCategoryChange(next: FilterCategory) {
  startTransition(() => setCategory(next))  // interruptible by urgent work
}
// isPending drives a visual hint while the transition settles
<div className={isPending ? 'pending' : ''}>{filtered.map(renderCard)}</div>
```

### What causes a stale closure in React, and how do you fix it?

The bug happens when a function created during one render runs later and still reads the state from that older render. Timers, intervals, and promise callbacks are where this usually shows up. In [../src/samples/StaleClosureSample.tsx](../src/samples/StaleClosureSample.tsx), the fix is either a functional updater when the next state depends on previous state, or a ref when delayed code needs the latest current value.

The sample demonstrates three approaches side by side. The buggy handler captures `count` in a `setTimeout` callback, but by the time it fires 800ms later the component has re-rendered and `count` is stale. The ref fix keeps `countRef.current` in sync with every render via `useEffect(() => { countRef.current = count })`, so the timeout reads the latest value through the ref. The functional updater fix avoids the problem entirely by passing `(c) => c + 1` instead of `count + 1`, since the updater always receives the most recent state. Three queued functional updaters correctly increment by 3 even though all three closures capture the same original `count`.

```tsx
// Keep a ref in sync with state on every render
const countRef = useRef(count)
useEffect(() => { countRef.current = count })

// BUG — setTimeout captures count at creation time (stale)
function incrementStale() {
  const captured = count    // captured NOW, stale in 800ms
  setCount(c => c + 1)
  setTimeout(() => { log(`read count=${captured} (stale)`) }, 800)
}

// FIX 1 — ref always holds the latest value
function incrementWithRef() {
  setCount(c => c + 1)
  setTimeout(() => { log(`read countRef=${countRef.current} (fresh)`) }, 800)
}

// FIX 2 — functional updater never reads stale state
function incrementThreeTimes() {
  setCount(c => c + 1)  // each updater receives the latest state
  setCount(c => c + 1)
  setCount(c => c + 1)
}
```

### When would you choose `useLayoutEffect` or `useInsertionEffect` over `useEffect`?

`useEffect` is the default because it runs after paint and is the right place for subscriptions and async side effects. I reach for `useLayoutEffect` only when DOM measurement or mutation must happen before paint to avoid visible flicker. `useInsertionEffect` is narrower still: it exists for style injection that must happen before layout work, which [../src/samples/LayoutEffectsSample.tsx](../src/samples/LayoutEffectsSample.tsx) demonstrates clearly.

The sample runs all three effect types on the same data to make the timing difference visible. `useInsertionEffect` injects CSS into a `<style>` element and appends it to `<head>` before any layout reads happen. `useLayoutEffect` then reads `getBoundingClientRect()` on the active chip and positions a marker element synchronously before paint, so the marker never flickers into the wrong position. `useEffect` does the same measurement but runs after paint, so on fast transitions you can see the marker briefly lag. The cleanup in `useInsertionEffect` removes the style element on unmount, and the cleanup in the other effects is a no-op since they only read and write DOM.

```tsx
// useInsertionEffect — inject styles BEFORE layout reads (earliest)
useInsertionEffect(() => {
  styleElement.textContent = createLayoutStyles(scopeClass, accent, density)
  document.head.appendChild(styleElement)
  return () => { styleElement.remove() }
}, [accent, density, scopeClass, styleElement])

// useLayoutEffect — measure + position marker BEFORE paint (no flicker)
useLayoutEffect(() => {
  const snapshot = readSnapshot(stripRef.current, getChipNode(chipRefs.current, activeId))
  applyMarker(layoutMarkerRef.current, snapshot)
}, [activeId, density])

// useEffect — same work but AFTER paint (visible lag on fast transitions)
useEffect(() => {
  const snapshot = readSnapshot(stripRef.current, getChipNode(chipRefs.current, activeId))
  applyMarker(passiveMarkerRef.current, snapshot)
}, [activeId, density])
```

### Why is `ref.current` unavailable during render, and when do callback refs help?

Refs are populated during commit, so reading `ref.current` during render is too early. A normal object ref is good when I need a persistent mutable handle after mount. A callback ref is useful when I need to react right when a node appears or disappears, such as measuring it immediately or integrating imperative code, which is what [../src/samples/RefTimingSample.tsx](../src/samples/RefTimingSample.tsx) shows.

The sample demonstrates callback refs stabilized with `useCallback`. When the node mounts, the callback receives the element, reads `getBoundingClientRect()`, and logs the measurement. When the node unmounts, it receives `null`, so you can run cleanup. The `useCallback` wrapper with an empty dependency array keeps the function identity stable so React does not unnecessarily detach and reattach the ref. The sample also shows `useImperativeHandle` on a `FocusableInput` component that exposes `focus()`, `clear()`, and `getValue()` instead of the raw DOM node. The dependency array on `useImperativeHandle` includes `value` because `getValue()` closes over it.

```tsx
// Callback ref — stabilized with useCallback, fires on mount and unmount
const handleCallbackRef = useCallback((node: HTMLDivElement | null) => {
  if (node) {
    const rect = node.getBoundingClientRect()
    log(`Mounted <${node.tagName}>, width=${Math.round(rect.width)}px`)
  } else {
    log('Unmounted — received null')
  }
}, [])  // empty deps = stable identity

// useImperativeHandle — narrow API instead of raw DOM node
useImperativeHandle(ref, () => ({
  focus() { inputRef.current?.focus() },
  clear() { setValue('') },
  getValue() { return value },   // closes over state
}), [value])  // must include value because getValue reads it
```

### How does `use()` with `Suspense` differ from manual loading state?

With `use()`, render reads a promise directly and React suspends that subtree until the promise resolves. That means the loading UI is owned by the nearest `Suspense` boundary instead of by local `isLoading` branches. [../src/samples/UseResourceSample.tsx](../src/samples/UseResourceSample.tsx) also shows the important cache rule: if each render creates a new pending promise, the boundary never settles cleanly.

The sample uses a `Map<string, Promise>` cache keyed by brief ID and revision. `readLaunchBrief` checks the cache first and returns the existing promise if found, or creates a new one and stores it. This is critical because `use()` compares promise identity: if render creates a fresh pending promise every time, Suspense restarts instead of settling. The `BriefPreview` component calls `const brief = use(resourcePromise)` directly in render. When the promise is pending, React suspends and the nearest `<Suspense fallback={...}>` shows the loading UI. When it resolves, React resumes rendering with the resolved value. There is no `isLoading` state, no `useEffect`, and no `then()` chain.

```tsx
// Cache stores Promises (not values) keyed by ID + revision
const resourceCache = new Map<string, Promise<LoadedLaunchBrief>>()

function readLaunchBrief(briefId: LaunchBriefId, revision: number) {
  const key = `${briefId}:${revision}`
  const cached = resourceCache.get(key)
  if (cached) return cached                      // reuse existing promise
  const promise = fetchLaunchBrief(briefId, revision)
  resourceCache.set(key, promise)                 // cache before returning
  return promise
}

// use() reads the promise in render — Suspense catches pending
function BriefPreview({ resourcePromise }: { resourcePromise: Promise<LoadedLaunchBrief> }) {
  const brief = use(resourcePromise)              // suspends until resolved
  return <article><h4>{brief.title}</h4><p>{brief.summary}</p></article>
}
```

### How does Context prevent or cause unnecessary re-renders?

Every context consumer re-renders whenever the provider value changes identity. If the provider creates a new object on each render, every consumer re-renders even when the meaningful data has not changed. Stabilizing the value with `useMemo` in [../src/samples/ContextIdentitySample.tsx](../src/samples/ContextIdentitySample.tsx) prevents those wasted renders, and splitting contexts by update frequency can isolate the damage further as shown in [../src/samples/ContextThemeSample.tsx](../src/samples/ContextThemeSample.tsx).

The ContextIdentity sample renders a "buggy" and "fixed" provider side by side. The buggy provider passes `{ palette, togglePalette }` as an inline object, which creates a new reference on every render and forces all consumers to re-render even when `palette` has not changed. The fixed provider wraps `togglePalette` in `useCallback` and the value object in `useMemo`, so the reference only changes when `palette` actually changes. The ContextTheme sample goes further by splitting theme state and feature flags into two separate contexts so toggling a feature flag does not re-render theme consumers.

```tsx
// BUG — new object every render forces all consumers to re-render
function BuggyProvider({ children }) {
  const [palette, setPalette] = useState<PaletteMode>('ocean')
  function togglePalette() { setPalette(p => nextPalette(p)) }
  return <ThemeContext value={{ palette, togglePalette }}>{children}</ThemeContext>
}

// FIX — useCallback + useMemo stabilize the reference
function FixedProvider({ children }) {
  const [palette, setPalette] = useState<PaletteMode>('ocean')
  const togglePalette = useCallback(() => setPalette(p => nextPalette(p)), [])
  const value = useMemo(() => ({ palette, togglePalette }), [palette, togglePalette])
  return <ThemeContext value={value}>{children}</ThemeContext>
}

// Split contexts — theme changes don't re-render feature flag consumers
const ThemeContext = createContext<ThemeContextValue | null>(null)
const FeatureFlagsContext = createContext<FeatureFlagsContextValue | null>(null)
```

### What is `createPortal` for, and when does `flushSync` matter?

`createPortal` renders children into a DOM node that lives outside the parent tree. This is important for modals and overlays because it avoids inheriting stacking contexts or overflow clipping from ancestors. `flushSync` forces React to commit a state update synchronously so an imperative DOM read immediately after sees the new value. [../src/samples/PortalModalSample.tsx](../src/samples/PortalModalSample.tsx) demonstrates both patterns together.

The sample uses a `usePortalHost` hook that creates a body-level `<div>` on mount and removes it on cleanup. The modal content is rendered into that host via `createPortal`, escaping any parent `overflow: hidden` or `z-index` stacking context. For toasts, the sample compares batched vs synchronous enqueue: after a normal `setState`, reading `toastCountRef.current.textContent` immediately shows the stale count because React has not committed yet. Wrapping the same update in `flushSync` forces React to commit before the next line, so the DOM read sees the updated count. This is useful when imperative code like focus management or scroll measurement must see the latest committed state.

```tsx
// usePortalHost — creates and mounts a body-level container
function usePortalHost(className: string, label: string) {
  const [host] = useState(() => {
    const el = document.createElement('div')
    el.className = className
    return el
  })
  useEffect(() => { document.body.appendChild(host); return () => { host.remove() } }, [host])
  return host
}

// createPortal — renders outside the React parent tree
return createPortal(
  <div className="portal-backdrop" role="presentation" onClick={onClose}>
    <section role="dialog" aria-modal="true">{/* modal content */}</section>
  </div>,
  host,
)

// flushSync — forces synchronous commit so DOM read sees the new value
flushSync(() => { setToasts(cur => [createToast('sync', msg), ...cur]) })
const count = toastCountRef.current?.textContent  // reads the UPDATED count
```

### How do you handle race conditions in debounced async effects?

The cleanup function returned from `useEffect` is the primary tool because it fires when the query changes. Combined with `AbortController`, it cancels in-flight requests so stale responses cannot overwrite the current result. Without cleanup, a slow response from an older query can silently land after a newer one has already resolved. [../src/samples/DebouncedSearchRaceSample.tsx](../src/samples/DebouncedSearchRaceSample.tsx) walks through the full pattern.

The sample renders a naive panel and a guarded panel side by side to make the race condition visible. Both panels debounce the raw input through a `setTimeout` effect. In the fetch effect, the naive panel fires `simulateReleaseSearch` without cancellation, so if query "abc" takes 2 seconds and query "ab" takes 500ms, the stale "abc" response overwrites the fresher "ab" result. The guarded panel creates an `AbortController` per effect invocation and passes `controller.signal` to the fetch. The cleanup function calls `controller.abort()`, which rejects the in-flight request with an `AbortError` that the catch block filters out. A `latestGuardedRequestRef` counter adds a second guard: even if a response arrives after abort, it will not update state if its request ID does not match the latest.

```tsx
// Debounce effect — delays query until user pauses typing
useEffect(() => {
  const timeoutId = setTimeout(() => {
    setDebouncedQuery(inputValue.trim())
  }, inputValue.trim() ? debounceWindowMs : 0)
  return () => clearTimeout(timeoutId)   // cancel pending debounce on re-type
}, [inputValue])

// Fetch effect — AbortController cancels previous request on query change
useEffect(() => {
  if (!debouncedQuery) return
  const requestId = ++requestSequenceRef.current
  latestGuardedRequestRef.current = requestId
  const controller = new AbortController()

  simulateReleaseSearch(debouncedQuery, requestId, controller.signal)
    .then(response => {
      if (latestGuardedRequestRef.current !== response.requestId) return  // stale
      setGuardedState({ status: 'success', result: response })
    })
    .catch(error => {
      if (error.name === 'AbortError') return        // expected cancellation
      setGuardedState({ status: 'error', note: error.message })
    })

  return () => controller.abort()  // cleanup cancels in-flight request
}, [debouncedQuery])
```

### How does `useFormStatus` avoid prop-drilling pending state?

`useFormStatus` reads the pending state of the nearest enclosing `<form>` from any descendant, so a submit button deep in the tree can know whether the action is still running without receiving any props. This removes the need to lift state up to the form shell and thread it down. [../src/samples/FormStatusSample.tsx](../src/samples/FormStatusSample.tsx) shows the pattern clearly.

The sample has two nested components: `PendingInspector` and `SubmitButton`, both calling `useFormStatus()` independently. `PendingInspector` reads `pending`, `data`, and `method` to display the active submission details in a panel with `aria-live="polite"`. `SubmitButton` reads `pending` and compares the active intent from `data` to its own intent prop, so only the clicked button shows a spinner while others are just disabled. The form's `action` is an async function that calls `await wait(1000)` to simulate a server save. While the action runs, React provides the pending snapshot to all `useFormStatus` consumers inside that `<form>` without any prop-drilling.

```tsx
// PendingInspector — reads form status from anywhere inside <form>
function PendingInspector() {
  const { pending, data, method } = useFormStatus()
  const subject = readPendingField(data, 'subject')?.trim()
  return (
    <aside aria-live="polite">
      <strong>{pending ? 'Submitting...' : 'Idle'}</strong>
      <dl><dt>Method</dt><dd>{method ?? 'none'}</dd></dl>
    </aside>
  )
}

// SubmitButton — per-button pending indicator without props
function SubmitButton({ intent }: { intent: DispatchIntent }) {
  const { pending, data } = useFormStatus()
  const activeIntent = readPendingField(data, 'intent')
  const isActive = pending && activeIntent === intent
  return (
    <button type="submit" name="intent" value={intent} disabled={pending}
      className={isActive ? 'is-active' : ''}>
      {isActive ? `Submitting ${intent}...` : intentLabels[intent]}
    </button>
  )
}
```

### What is the `Activity` component and when would you use it?

`Activity` controls visibility of a subtree. When mode is `"hidden"`, the subtree stops painting and laying out, but React keeps its state alive so revealing it again is instant. It is useful for tabs, priority dashboards, and off-screen content. [../src/samples/ActivityTransitionSample.tsx](../src/samples/ActivityTransitionSample.tsx) also shows how `startTransition` pairs with `Activity` to keep non-urgent state changes smooth.

The sample renders operator regions as `<Activity>` panels. A `resolvePanelVisibility` function decides whether each region is `'visible'` or `'hidden'` based on the current tier filter, with critical regions always visible. When the user changes the filter, `useDeferredValue(tierFilter)` lets the chip highlight commit immediately while the region list re-renders at lower priority. `startTransition` wraps the log update so secondary UI does not block the primary filter change. Hidden activities skip paint and layout cost but keep their React state alive, so switching back to a tier reveals the region cards instantly without remounting or refetching.

```tsx
// resolvePanelVisibility — critical regions always visible, others match filter
function resolvePanelVisibility(tier: PriorityTier, filter: PriorityTier | 'all'): 'visible' | 'hidden' {
  if (tier === 'critical') return 'visible'       // always visible
  if (filter === 'all') return 'visible'
  return tier === filter ? 'visible' : 'hidden'
}

// useDeferredValue lets chip highlight commit before region list re-renders
const deferredFilter = useDeferredValue(tierFilter)

// startTransition wraps non-urgent log updates
function handleFilterChange(nextFilter: PriorityTier | 'all') {
  setTierFilter(nextFilter)                        // urgent — chip highlight
  startTransition(() => logTransition(`Filter → ${nextFilter}`))  // deferred
}

// <Activity> preserves state while hidden, renders instantly when revealed
{operatorRegions.map(region => {
  const mode = resolvePanelVisibility(region.tier, deferredFilter)
  return (
    <Activity key={region.id} mode={mode}>
      <RegionCard region={region} onSelect={handleRegionSelect} />
    </Activity>
  )
})}
```

### When would you use `useSyncExternalStore` instead of `useState`?

I would use it when the state lives outside React, like browser online status, color scheme preferences, or a shared module-level store. It requires a `subscribe` function, a `getSnapshot` function, and optionally `getServerSnapshot` for SSR safety. [../src/releaseStore.ts](../src/releaseStore.ts) shows the full subscribe-notify-snapshot contract and how it avoids tearing during concurrent renders.

The store module maintains a `snapshot` object and a `Set<Listener>` of subscribers. `subscribe` adds the listener and starts syncing browser events (online/offline, color scheme). The returned cleanup function removes the listener and stops syncing when no listeners remain. `getSnapshot` returns the current snapshot object, so React can compare identity between renders. `getServerSnapshot` returns a safe static fallback for SSR where browser APIs are unavailable. When browser state changes, the store creates a new snapshot object and calls every listener, which triggers `useSyncExternalStore` to re-render consumers with the fresh snapshot. The key contract: React reads a consistent snapshot, never a partially-updated value.

```tsx
// Module-level state — lives outside React
let snapshot: ReleaseSnapshot = { online: true, preferredScheme: 'light', currentTime: '--:--:--' }
const listeners = new Set<Listener>()

// subscribe — starts browser event syncing, returns cleanup
export function subscribe(listener: Listener) {
  listeners.add(listener)
  ensureSync()                                  // starts interval + event listeners
  return () => {
    listeners.delete(listener)
    if (!listeners.size) stopSync?.()           // tear down when last consumer leaves
  }
}

// getSnapshot — returns the current immutable snapshot object
export function getSnapshot() { return snapshot }

// getServerSnapshot — safe static fallback for SSR
export function getServerSnapshot(): ReleaseSnapshot {
  return { online: true, preferredScheme: 'light', currentTime: '--:--:--' }
}

// Consumer reads the store via useSyncExternalStore
const liveSnapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
```

### What does `useEffectEvent` solve that `useEffect` alone cannot?

It lets a long-lived effect read the latest props or state without re-subscribing. In [../src/App.tsx](../src/App.tsx), the keyboard shortcut effect has an empty dependency list for stability, but the event function inside reads the latest selected feature because `useEffectEvent` always runs with fresh values. Without it, the effect would have to include the feature in its deps and restart on every change.

The App registers a global `keydown` listener in a `useEffect` with an empty dependency array so the listener is stable for the component's lifetime. Inside the listener, it calls `activeFeatureEvent()`, which is created with `useEffectEvent`. The event function resolves the current feature from `activeFeatureId` and loads it into the command palette. Because `useEffectEvent` always reads the latest closure values when called, the keyboard shortcut uses the most recent `activeFeatureId` even though the effect itself never re-runs. Without `useEffectEvent`, adding `activeFeatureId` to the dependency array would tear down and re-add the listener on every feature change, which is unnecessary and wasteful.

```tsx
// useEffectEvent — always reads the latest activeFeatureId when invoked
const activeFeatureEvent = useEffectEvent(() => {
  const feature = featureCatalog.find(f => f.id === activeFeatureId) ?? featureCatalog[0]
  commandRef.current?.load(feature.title)
})

// useEffect — stable listener for the component's lifetime
useEffect(() => {
  function handleGlobalShortcut(event: KeyboardEvent) {
    if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'k') return
    event.preventDefault()
    activeFeatureEvent()   // reads latest feature without re-subscribing
  }
  window.addEventListener('keydown', handleGlobalShortcut)
  return () => window.removeEventListener('keydown', handleGlobalShortcut)
}, [])  // empty deps — listener never re-creates
```

### What does the React Compiler do, and how do its directives work?

The compiler inserts memoization automatically at build time so you can drop manual `useMemo` and `useCallback` calls. `"use memo"` opts a component in and `"use no memo"` opts it out when the compiler gets a case wrong. [../src/samples/ReactCompilerDemo.ts](../src/samples/ReactCompilerDemo.ts) documents the before/after shape, and [../node-samples/react-compiler/src/reportCompilerDirectives.ts](../node-samples/react-compiler/src/reportCompilerDirectives.ts) verifies directive boundaries.

The compiler analyzes component render bodies and automatically wraps values in `useMemo` and functions in `useCallback` where it detects that memoization would be beneficial. This eliminates a whole category of bugs where developers forget to memoize a value or include the wrong dependencies. The `"use memo"` directive at the top of a function body tells the compiler to process that component. `"use no memo"` opts out when the compiler's output is incorrect or when you need manual control. The node-samples workspace parses fixture files and reports which components use which directives, verifying that boundaries are set correctly.

```tsx
// "use memo" — compiler auto-inserts useMemo/useCallback at build time
function OptimizedDashboard({ data }: Props) {
  "use memo"
  // compiler sees `derived` depends on `data` and wraps it automatically
  const derived = data.items.filter(item => item.active)
  const handleClick = (id: string) => selectItem(id)  // auto-wrapped in useCallback
  return <Chart data={derived} onClick={handleClick} />
}

// "use no memo" — opt out when compiler gets it wrong
function ManualComponent({ config }: Props) {
  "use no memo"
  // you control memoization manually here
  const value = useMemo(() => transform(config), [config])
  return <Display value={value} />
}
```

### What are the key React ESLint rules you should never disable?

`exhaustive-deps` prevents stale closure bugs by keeping dependency arrays honest. `rules-of-hooks` prevents hooks from being called conditionally or inside loops. Stable references like `setState` and `dispatch` from `useReducer` are guaranteed stable and do not need to be in deps. [../src/samples/ReactLintRulesDemo.ts](../src/samples/ReactLintRulesDemo.ts) and the [../node-samples/react-lint-rules/](../node-samples/react-lint-rules/) workspace verify these rules against fixture code.

The demo file catalogues common violations and correct patterns. `exhaustive-deps` catches the case where a developer omits `userId` from a `useEffect` dependency array that calls `fetchUser(userId)`, which would mean the effect never re-runs when `userId` changes. `rules-of-hooks` catches hooks called inside `if` blocks or loops, which breaks React's internal hook ordering. The lint rules workspace runs ESLint against fixture files that contain intentional violations, verifying that the rules correctly flag each one. The key insight for interviews: `setState` and `dispatch` are guaranteed stable by React, so including them in deps is harmless but unnecessary.

```tsx
// ✅ exhaustive-deps — all values used inside the effect are in the array
useEffect(() => {
  fetchUser(userId).then(setData)
}, [userId])  // userId is listed because the effect reads it

// ❌ exhaustive-deps violation — missing userId
useEffect(() => {
  fetchUser(userId).then(setData)
}, [])  // BUG: effect never re-runs when userId changes

// ✅ rules-of-hooks — hooks at top level, unconditional
function Component({ isAdmin }: Props) {
  const [data, setData] = useState(null)  // always called
  // ❌ WRONG: if (isAdmin) { useState(...) }  // conditional hook call
}

// setState and dispatch are guaranteed stable — safe to omit from deps
const [count, setCount] = useState(0)
useEffect(() => { setCount(c => c + 1) }, [])  // setCount is stable
```

### How do `'use client'` and `'use server'` directives define component boundaries?

In an RSC-aware framework, files without a directive are server components by default. `'use client'` at the top of a file marks everything in it as client-side, allowing hooks and browser events. `'use server'` marks exported functions as server actions that the client can call through the framework's transport. [../src/samples/ServerComponentsDemo.ts](../src/samples/ServerComponentsDemo.ts) and [../node-samples/react-server-components/](../node-samples/react-server-components/) cover both boundaries.

Server components run only on the server and can directly access databases, file systems, or secrets without exposing them to the client bundle. They cannot use hooks or browser APIs. When a file adds `'use client'` at the top, everything exported from that file becomes a client boundary: the framework serializes props across the boundary and the client bundle includes that module. `'use server'` at the top of a function body marks it as a server action: the framework generates an RPC endpoint so the client can call it through a form action or `startTransition`. The node-samples workspace parses fixture files to verify that each directive appears at the correct scope and that server-only imports do not leak into client bundles.

```tsx
// Server component (default) — runs on server, no hooks, no browser APIs
async function ReleaseList() {
  const releases = await db.query('SELECT * FROM releases')  // direct DB access
  return <ul>{releases.map(r => <li key={r.id}>{r.name}</li>)}</ul>
}

// 'use client' — marks file as client boundary, hooks and events allowed
'use client'
import { useState } from 'react'
export function InteractiveFilter() {
  const [query, setQuery] = useState('')
  return <input value={query} onChange={e => setQuery(e.target.value)} />
}

// 'use server' — marks function as server action, callable from client
async function saveRelease(formData: FormData) {
  'use server'
  const name = formData.get('name') as string
  await db.insert('releases', { name })
}
```

### How does `lazy()` with `Suspense` implement code splitting?

`lazy()` wraps `import()` so the chunk is fetched only when the component is first rendered. `Suspense` shows a fallback while the chunk is in flight. An Error Boundary is still needed because a failed import throws an error, not a pending promise. [../src/App.tsx](../src/App.tsx) uses `lazy()` for the `TypeNotes` panel.

The App defines `const TypeNotes = lazy(() => import('./components/TypeNotes'))` at module scope. When the user first navigates to the TypeNotes view, React triggers the dynamic import and suspends the subtree. The `<Suspense fallback={<Spinner />}>` boundary renders the loading indicator until the chunk resolves. If the network request fails, the import rejects and the error propagates to the nearest Error Boundary, not to Suspense, because Suspense only catches pending promises. This is why the common pattern wraps `Suspense` around an `ErrorBoundary` around the lazy component: Suspense for the happy path, ErrorBoundary for the failure path.

```tsx
// Module scope — lazy() wraps the dynamic import
const TypeNotes = lazy(() => import('./components/TypeNotes'))

// Render — Suspense for loading, ErrorBoundary for import failures
<Suspense fallback={<Spinner />}>
  <SampleErrorBoundary label="type-notes" onReset={handleRetry}>
    <TypeNotes />
  </SampleErrorBoundary>
</Suspense>

// If the chunk fetch fails, Suspense cannot catch it:
// lazy(() => import('./Missing'))  // rejects → Error Boundary, not Suspense
```

### How would you build an accessible modal dialog in React?

Label the dialog with `aria-labelledby` and `aria-describedby`. On open, move focus into the dialog and trap Tab so it cycles only through the dialog's controls. On Escape or close, return focus to the trigger button. [../src/samples/AccessibleDialogSample.tsx](../src/samples/AccessibleDialogSample.tsx) implements the full pattern with a query selector for focusable elements and keyboard event handling.

The sample uses a `useEffect` that runs when `isOpen` changes. On open, it locks body scroll with `overflow: hidden`, moves focus to the first action button via `firstActionRef.current?.focus()`, and registers a `keydown` handler. The handler catches Escape to close and Tab to trap focus: it queries all focusable elements inside `dialogRef.current`, and if Shift+Tab is on the first element it wraps to the last, or if Tab is on the last element it wraps to the first. On cleanup, it restores body scroll, removes the listener, and returns focus to `triggerRef.current` so keyboard users land back where they started. No library is needed because the focus trap is just a `querySelectorAll` of focusable selectors plus two `preventDefault` conditions.

```tsx
useEffect(() => {
  if (!isOpen) return
  const trigger = triggerRef.current
  document.body.style.overflow = 'hidden'         // lock scroll
  firstActionRef.current?.focus()                  // move focus into dialog

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') { closeDialog(); return }
    if (event.key !== 'Tab' || !dialogRef.current) return
    const focusable = Array.from(
      dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector)
    )
    const first = focusable[0], last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault(); last.focus()         // wrap backward
    }
    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus()        // wrap forward
    }
  }
  document.addEventListener('keydown', handleKeyDown)
  return () => {
    document.body.style.overflow = ''              // restore scroll
    document.removeEventListener('keydown', handleKeyDown)
    trigger?.focus()                               // return focus to trigger
  }
}, [closeDialog, isOpen])

<div role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descId}>
```

### What does an accessible custom listbox require?

Use `role="listbox"` and `role="option"` with `aria-activedescendant` to keep the screen reader aligned with the visually active option. Arrow keys, Home, and End navigate through options, and Enter or Space selects. All of this must work without a pointer. [../src/samples/AccessibleListboxSample.tsx](../src/samples/AccessibleListboxSample.tsx) implements these patterns with key handlers and state management.

The listbox container has `role="listbox"`, `aria-label`, and `aria-activedescendant` pointing to the ID of the currently highlighted option. Each option has `role="option"` with a `useId`-derived ID. The `onKeyDown` handler maps ArrowDown/ArrowUp to increment/decrement the `activeIndex` with wrapping, Home jumps to index 0, End jumps to the last index, and Enter/Space commits the selection. The `moveActiveIndex` function updates state and scrolls the active option into view. All navigation works without a pointer, and screen readers announce the active option through the `aria-activedescendant` binding without needing roving `tabIndex`.

```tsx
<div
  role="listbox"
  aria-label="Release handoff lanes"
  aria-activedescendant={optionIds[activeIndex]}  // points to active option's id
  tabIndex={0}
  onKeyDown={(event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      moveActiveIndex((activeIndex + 1) % laneOptions.length)    // wrap forward
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      moveActiveIndex((activeIndex - 1 + laneOptions.length) % laneOptions.length)  // wrap back
    }
    if (event.key === 'Home') { event.preventDefault(); moveActiveIndex(0) }
    if (event.key === 'End') { event.preventDefault(); moveActiveIndex(laneOptions.length - 1) }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      confirmSelection(activeIndex)                // commit on Enter/Space
    }
  }}
>
  {laneOptions.map((lane, i) => (
    <div key={lane.id} role="option" id={optionIds[i]}
      aria-selected={i === selectedIndex}>
      {lane.label}
    </div>
  ))}
</div>
```

### How should form validation errors be announced to screen readers?

Each invalid field should have `aria-invalid="true"` and `aria-describedby` pointing at its specific error message. A summary with `role="alert"` announces the failure immediately when the form is submitted. On submit failure, focus should move to the first invalid field. [../src/samples/AccessibleFormErrorsSample.tsx](../src/samples/AccessibleFormErrorsSample.tsx) shows all three pieces together.

The submit handler calls `validateForm(values)` and stores the result in `errors` state. If there are errors, it sets a `role="alert"` submission message that screen readers announce immediately. Then it checks which field errored first and calls `contactRef.current?.focus()` or `summaryRef.current?.focus()` to move the keyboard cursor to the problem. Each input binds `aria-invalid={errors.field ? 'true' : undefined}` and `aria-describedby={errors.field ? errorId : hintId}` so the screen reader announces either the error message or the hint depending on validation state. The three layers work together: the alert summary announces the overall failure, `aria-invalid` marks specific fields, and focus management puts the user at the first problem.

```tsx
// Submit handler — validate, announce, focus first invalid field
function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault()
  const nextErrors = validateForm(values)
  setErrors(nextErrors)
  if (hasErrors(nextErrors)) {
    setSubmissionMessage('Fix the highlighted fields.')  // role="alert" announces this
    if (nextErrors.contact) { contactRef.current?.focus(); return }  // focus first error
    if (nextErrors.summary) { summaryRef.current?.focus() }
    return
  }
  setSubmissionMessage(`Submitted for ${values.contact.trim()}.`)
}

// Per-field — aria-invalid marks the field, aria-describedby links error or hint
<input
  ref={contactRef}
  aria-invalid={errors.contact ? 'true' : undefined}
  aria-describedby={errors.contact ? contactErrorId : contactHintId}
/>
{errors.contact && <span id={contactErrorId} role="alert">{errors.contact}</span>}

// Summary — role="alert" so screen readers announce immediately
<div role="alert" aria-live="assertive">{submissionMessage}</div>
```

### How do you test async UI behavior deterministically?

Use fake timers and mocked responses so the test controls timing completely. Assert intermediate states like the loading indicator before advancing timers. Then exercise both the success and failure paths, including retry. [../src/samples/AsyncUiVerificationSample.tsx](../src/samples/AsyncUiVerificationSample.tsx) and [../src/test/async-ui-verification-sample.test.tsx](../src/test/async-ui-verification-sample.test.tsx) demonstrate this strategy.

The test file calls `vi.useFakeTimers()` in `beforeEach` so all `setTimeout` calls are controlled. After clicking the load button, the test asserts the loading text is visible before any timer advances. Then `act(async () => { vi.advanceTimersByTime(180); await Promise.resolve() })` advances the fake clock and flushes the microtask queue so the mocked fetch resolves. After that, the test asserts the success region is visible. The `await Promise.resolve()` inside `act` is critical: it flushes the microtask queue so promise `.then()` callbacks run before the assertion. The `afterEach` runs remaining timers and restores real timers to avoid polluting other tests.

```tsx
// Setup — fake timers control all async timing
beforeEach(() => { vi.useFakeTimers() })
afterEach(() => { vi.runOnlyPendingTimers(); vi.useRealTimers() })

it('shows loading then success', async () => {
  render(<AsyncUiVerificationSample />)
  fireEvent.click(screen.getByRole('button', { name: 'Load release summary' }))

  // Assert intermediate state BEFORE advancing time
  expect(screen.getByText('Loading release summary...')).toBeTruthy()

  // Advance fake clock + flush microtask queue so promise resolves
  await act(async () => {
    vi.advanceTimersByTime(180)
    await Promise.resolve()          // flush microtask queue
  })

  // Assert final state — success region is visible
  expect(screen.getByRole('region', { name: 'Verified release summary' })).toBeTruthy()
})
```

### How would you build a type-safe generic React component?

Define a constraint interface with the minimum required fields and use `T extends Constraint` as the generic parameter. The component accesses only the constraint fields, while callers pass their richer type through. A `renderMeta` callback lets the component stay reusable because each caller decides what extra detail to show. [../src/components/FeatureGrid.tsx](../src/components/FeatureGrid.tsx) uses this exact pattern.

The `FeatureGrid` component is generic over `T extends SelectableFeature`, where `SelectableFeature` requires only `id`, `title`, and the fields needed for rendering a card. The grid reads `item.id` and `item.title` for layout and key, and delegates any extra rendering to the `renderMeta` callback. Callers pass their full domain type (which may have many more fields) and provide a `renderMeta` that accesses those richer fields. The `onSelect` callback is typed as `(id: T['id']) => void`, so the callback argument preserves the exact ID type from the caller's domain model rather than widening to `string`.

```tsx
// Constraint interface — minimum fields the grid needs
interface SelectableFeature { readonly id: string; readonly title: string }

// Generic props — T extends the constraint, renderMeta accesses richer fields
interface FeatureGridProps<T extends SelectableFeature> {
  readonly items: readonly T[]
  readonly activeId: T['id']                       // preserves exact ID type
  readonly onSelect: (id: T['id']) => void
  readonly renderMeta: (item: T) => ReactNode      // caller decides what to show
}

// Generic component — accesses only constraint fields, delegates extras
export function FeatureGrid<T extends SelectableFeature>({
  items, activeId, onSelect, renderMeta,
}: FeatureGridProps<T>) {
  return (
    <div role="list">
      {items.map(item => (
        <div key={item.id} role="listitem" onClick={() => onSelect(item.id)}>
          <h3>{item.title}</h3>
          {renderMeta(item)}         {/* caller renders domain-specific detail */}
        </div>
      ))}
    </div>
  )
}
```

### When would you use `useImperativeHandle` with ref-as-prop?

When I want to expose a small imperative API like `focus()` or `load()` to the parent instead of handing over the raw DOM node. React 19 lets ref be a regular prop so `forwardRef` is no longer needed. The dependency array on `useImperativeHandle` must include any closed-over state that the exposed methods read, or callers get stale values. [../src/components/CommandPalette.tsx](../src/components/CommandPalette.tsx) and [../src/samples/RefTimingSample.tsx](../src/samples/RefTimingSample.tsx) both demonstrate this.

In `CommandPalette`, `ref` is a regular prop typed as `Ref<CommandPaletteHandle>`. `useImperativeHandle` creates a handle with `focus()` that delegates to the inner `inputRef`, and `load(value)` that sets the input's value, focuses it, and selects the text. The dependency array is empty because neither method closes over any state that changes. In `RefTimingSample`, the `FocusableInput` component exposes `focus()`, `clear()`, and `getValue()`. Because `getValue()` returns `value` from state, `value` must be in the dependency array, otherwise the parent would read a stale closure. This is the key gotcha: every piece of state that an exposed method reads must appear in the deps.

```tsx
// React 19 — ref is a regular prop, no forwardRef needed
interface CommandPaletteHandle { focus(): void; load(value: string): void }

function CommandPalette({ ref, onSubmit }: { ref: Ref<CommandPaletteHandle>; onSubmit: (v: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)

  useImperativeHandle(ref, () => ({
    focus() { inputRef.current?.focus() },
    load(value) {
      if (!inputRef.current) return
      inputRef.current.value = value
      inputRef.current.focus()
      inputRef.current.select()      // highlight for easy replacement
    },
  }), [])  // empty deps — methods don't close over changing state

  return <input ref={inputRef} />
}

// When a method reads state, that state must be in deps
useImperativeHandle(ref, () => ({
  focus() { inputRef.current?.focus() },
  getValue() { return value },        // reads state
}), [value])  // must include value or getValue returns stale data
```

### What pattern do the feature panels use for domain state management?

Each panel extracts domain logic into a custom hook that owns loading, draft, and submit state. The panel component receives the hook's return value and stays purely declarative. Discriminated unions or status strings keep the state machine explicit instead of using multiple booleans. [../src/features/release-approval-workflow/ReleaseApprovalWorkflowPanel.tsx](../src/features/release-approval-workflow/ReleaseApprovalWorkflowPanel.tsx) is a representative example.

In `useReleaseApprovalWorkflow`, `RequestStatus` and `SubmitStatus` are string union types (`'loading' | 'ready' | 'error'` and `'idle' | 'saving' | 'saved' | 'error'`). The hook's `useEffect` fetches with an `AbortController`, calls `isReleaseApprovalAbortError` in the catch block to ignore expected cancellations, and returns `controller.abort()` as cleanup. The panel component branches on `status` to show loading, error, or the draft form. Because the hook owns all the async lifecycle, the panel never manages `useEffect`, `AbortController`, or error recovery directly. This keeps the panel a pure function of the hook's return value.

```tsx
// Status unions — explicit state machine, no boolean juggling
type RequestStatus = 'loading' | 'ready' | 'error'
type SubmitStatus = 'idle' | 'saving' | 'saved' | 'error'

export function useReleaseApprovalWorkflow() {
  const [status, setStatus] = useState<RequestStatus>('loading')
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle')

  useEffect(() => {
    const controller = new AbortController()
    fetchReleaseApprovalWorkspace(controller.signal)
      .then(data => { setRecords(data); setStatus('ready') })
      .catch(error => {
        if (isReleaseApprovalAbortError(error)) return  // expected cancellation
        setStatus('error'); setErrorMessage(error.message)
      })
    return () => controller.abort()                     // cleanup cancels fetch
  }, [])

  return { status, submitStatus, draft, records, submit, resetDraft }
}

// Panel is purely declarative — branches on hook status
function ReleaseApprovalWorkflowPanel() {
  const { status, draft, submit, resetDraft } = useReleaseApprovalWorkflow()
  if (status === 'loading') return <Spinner />
  if (status === 'error') return <ErrorMessage />
  return <DraftForm draft={draft} onSubmit={submit} onReset={resetDraft} />
}
```

### What component composition patterns does React favor over inheritance?

React favors composition over inheritance. The `children` prop is the simplest form: a layout component renders whatever the parent passes without knowing the content. Render props and generic callback props like the `renderMeta` prop in [../src/components/FeatureGrid.tsx](../src/components/FeatureGrid.tsx) let customers inject behavior without modifying the component. [../src/samples/ContextThemeSample.tsx](../src/samples/ContextThemeSample.tsx) shows provider composition where theme and feature-flag providers wrap children without coupling to each other.

The FeatureGrid takes a `renderMeta` callback so each caller decides what detail to show for each item without the grid knowing the caller's domain type. The ContextTheme sample wraps `<ThemeProvider>` around `<FeatureFlagsProvider>` around `{children}`, composing two independent concerns through nesting rather than inheritance. React 19 makes context objects themselves the provider (`<ThemeContext value={...}>` instead of `<ThemeContext.Provider value={...}>`), which simplifies the composition. No class hierarchy is needed because hooks compose behavior through function calls and props compose rendering through the tree.

```tsx
// children composition — layout renders whatever the parent passes
function PageLayout({ children }: PropsWithChildren) {
  return <main className="layout">{children}</main>
}

// Render callback — caller injects domain-specific rendering
<FeatureGrid items={features} renderMeta={(f) => <span>{f.status}</span>} />

// Provider composition — independent concerns nest without coupling
function AppProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider>
      <FeatureFlagsProvider>
        {children}
      </FeatureFlagsProvider>
    </ThemeProvider>
  )
}

// React 19 — context object itself is the provider
<ThemeContext value={{ theme, tokens, setTheme, cycleTheme }}>
  {children}
</ThemeContext>
```

### How do custom hooks extract and reuse stateful logic across components?

A custom hook is a regular function starting with `use` that encapsulates hooks, effects, and derived state. The component that calls it stays declarative because it only receives the return value. In [../src/features/release-approval-workflow/useReleaseApprovalWorkflow.ts](../src/features/release-approval-workflow/useReleaseApprovalWorkflow.ts), the hook owns fetch lifecycle, abort cleanup, draft state, and submission flow. The panel component does not manage any of that logic itself. [../src/samples/DebouncedSearchRaceSample.tsx](../src/samples/DebouncedSearchRaceSample.tsx) shows the same pattern for debounced search with `AbortController`.

The approval workflow hook manages `useState` for request/submit status, `useEffect` with `AbortController` for the initial fetch, and submit functions that update status through the state machine. The panel component calls the hook and renders based on the returned `status`, `draft`, `submit`, and `resetDraft`. In the debounced search sample, the search logic (debounce timer, fetch with abort, request sequencing) is all inside the component but could easily extract into a `useDebouncedSearch` hook. The key principle: hooks own the lifecycle, components own the rendering. This makes both independently testable.

```tsx
// Custom hook — owns fetch, abort, draft, and submit lifecycle
export function useReleaseApprovalWorkflow() {
  const [status, setStatus] = useState<RequestStatus>('loading')
  const [draft, setDraft] = useState<DraftState>(initialDraft)

  useEffect(() => {
    const controller = new AbortController()
    fetchReleaseApprovalWorkspace(controller.signal)
      .then(data => { setRecords(data); setStatus('ready') })
      .catch(error => { if (!isAbortError(error)) setStatus('error') })
    return () => controller.abort()
  }, [])

  async function submit(decision: ApprovalDecision) {
    setSubmitStatus('saving')
    await submitApproval(draft, decision)
    setSubmitStatus('saved')
  }

  return { status, draft, submit, resetDraft: () => setDraft(initialDraft) }
}

// Panel — purely declarative, renders from hook's return value
function Panel() {
  const { status, draft, submit, resetDraft } = useReleaseApprovalWorkflow()
  if (status === 'loading') return <Spinner />
  return <DraftForm draft={draft} onSubmit={submit} onReset={resetDraft} />
}
```

### How do you decide where state should live — local, lifted, context, or external store?

I colocate state as close to its consumer as possible. If siblings need the same value, I lift it to their common parent. If deeply nested components need infrequently changing data like theme tokens or auth, I use context as in [../src/samples/ContextThemeSample.tsx](../src/samples/ContextThemeSample.tsx). If state must be read from outside React or shared across unrelated subtrees, I use an external store with `useSyncExternalStore` like [../src/releaseStore.ts](../src/releaseStore.ts). The feature panels in [../src/features/release-approval-workflow/useReleaseApprovalWorkflow.ts](../src/features/release-approval-workflow/useReleaseApprovalWorkflow.ts) show the middle ground: a custom hook colocates complex state within the feature boundary without globalizing it.

The decision hierarchy: local `useState` for values only one component reads (like an input field), lifted `useState` for siblings (like a filter that affects both a list and a count), context for deeply nested consumers of infrequently changing data (like theme or auth tokens), and `useSyncExternalStore` for state that lives outside React's tree entirely (like browser APIs or shared module-level stores). The release store module maintains its own `snapshot` object and notifies React through the subscribe/getSnapshot contract, while the approval workflow hook keeps its complex state inside a custom hook boundary so other features cannot accidentally depend on it.

```tsx
// Local — only this component reads it
const [inputValue, setInputValue] = useState('')

// Lifted — siblings share the same filter
function Parent() {
  const [filter, setFilter] = useState('all')
  return <><FilterBar value={filter} onChange={setFilter} /><ItemList filter={filter} /></>
}

// Context — deeply nested consumers, infrequently changing
<ThemeContext value={{ theme, tokens, setTheme }}>{children}</ThemeContext>
const { theme } = useContext(ThemeContext)  // anywhere in the subtree

// External store — state lives outside React
const liveSnapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

// Custom hook boundary — complex state without globalizing
const { status, draft, submit } = useReleaseApprovalWorkflow()  // encapsulated
```

### How does the React Profiler API help identify render bottlenecks?

The `<Profiler>` component wraps a subtree and fires a callback on each commit with `actualDuration` (time spent rendering) and `baseDuration` (estimated cost without memoization). Comparing the two reveals how much memoization is saving. In [../src/samples/MemoLabSample.tsx](../src/samples/MemoLabSample.tsx), the Profiler logs show that `memo` on the member card skips renders when props are stable, and `useMemo` avoids recomputing the expensive roster filter. `useDebugValue` labels the custom hook in DevTools so you can trace which hook is contributing to slow commits.

The sample wraps the entire `MemoLabStage` in `<Profiler id="memo-stage" onRender={handleProfilerRender}>`. The `onRender` callback receives `actualDuration` (how long the render took after memoization kicked in) and `baseDuration` (the estimated time if nothing were memoized). When most children are memoized and their props are unchanged, `actualDuration` drops close to zero while `baseDuration` stays high, proving that memoization is working. Inside the `useVisibleRoster` hook, `useDebugValue` attaches a label like `"5 visible | focus=Frontend | query=alice"` that appears in React DevTools next to the hook, making it easy to trace which computation is behind a slow render without adding console logs.

```tsx
// Profiler wraps a subtree and reports render timing on each commit
<Profiler id="memo-stage" onRender={(id, phase, actualDuration, baseDuration) => {
  console.log(`[${id}] ${phase}: actual=${actualDuration.toFixed(1)}ms base=${baseDuration.toFixed(1)}ms`)
}}>
  <MemoLabStage query={query} roster={roster} onSelectMember={handleSelectMember} />
</Profiler>

// useDebugValue labels the hook in DevTools for tracing
function useVisibleRoster(query: string, focusFilter: string) {
  const roster = useMemo(() => { /* expensive filter + sort */ }, [focusFilter, query])

  useDebugValue(
    { visibleCount: roster.length, focusFilter, query },
    v => `${v.visibleCount} visible | focus=${v.focusFilter} | query=${v.query}`,
  )
  return roster
}
```

### What composition techniques reduce re-renders without adding memoization?

Three techniques help before reaching for `memo` or `useMemo`. First, move state down so only the component that owns it re-renders. Second, pass expensive subtrees as `children` so the parent can re-render without recreating the child tree. Third, split context providers by update frequency so fast-changing data like input text does not re-render slow consumers like theme. [../src/samples/ContextThemeSample.tsx](../src/samples/ContextThemeSample.tsx) splits theme from feature flags, and [../src/samples/ContextIdentitySample.tsx](../src/samples/ContextIdentitySample.tsx) shows how stabilizing a provider value prevents consumer cascades.

In the ContextTheme sample, `ThemeContext` and `FeatureFlagsContext` are separate providers. Toggling a feature flag re-renders only feature flag consumers, not theme consumers. If they were combined in a single context, every toggle would re-render every consumer. In the ContextIdentity sample, the buggy provider creates `{ palette, togglePalette }` inline, so every render creates a new object even when palette has not changed. All consumers re-render. The fixed provider wraps the value in `useMemo` so the reference only changes when `palette` changes. But before reaching for `useMemo`, the simpler fix is often structural: move the state-updating input into its own component so siblings do not re-render at all.

```tsx
// 1. Move state down — only the component that owns the state re-renders
function SearchInput() {
  const [query, setQuery] = useState('')          // state is local
  return <input value={query} onChange={e => setQuery(e.target.value)} />
}
function Page() {
  return <><SearchInput /><ExpensiveList /></>     // ExpensiveList does NOT re-render on typing
}

// 2. Children as props — parent re-renders without recreating the child tree
function ScrollContainer({ children }: PropsWithChildren) {
  const [scrollY, setScrollY] = useState(0)       // updates frequently
  return <div onScroll={e => setScrollY(e.currentTarget.scrollTop)}>{children}</div>
}
// children was created by the grandparent and won't re-render

// 3. Split providers — fast-changing and slow-changing in separate contexts
<ThemeProvider>                   {/* slow — changes rarely */}
  <FeatureFlagsProvider>          {/* faster — toggles don't re-render theme consumers */}
    {children}
  </FeatureFlagsProvider>
</ThemeProvider>
```

### How would you contribute to a shared design system or component library in React?

Design system components should be generic, accessible, and composable. Accessibility comes first: keyboard navigation, focus management, and ARIA attributes should be baked in. [../src/samples/AccessibleDialogSample.tsx](../src/samples/AccessibleDialogSample.tsx) shows a modal with focus trapping and Escape handling, and [../src/samples/AccessibleListboxSample.tsx](../src/samples/AccessibleListboxSample.tsx) shows a keyboard-navigable listbox with `aria-activedescendant`. Consistent design tokens from a shared context like [../src/samples/ContextThemeSample.tsx](../src/samples/ContextThemeSample.tsx) keep colors, spacing, and typography unified. Components should expose props and children for customization rather than flags for every variation.

The dialog component bakes in focus trapping (Tab wraps between first and last focusable elements), Escape dismissal, and focus restoration to the trigger on close. The listbox bakes in Arrow/Home/End navigation, Enter/Space selection, and `aria-activedescendant` so screen readers track the active option. Neither requires a library. For theming, the ContextTheme sample uses a shared context with tokens (colors, spacing, font sizes) so every component reads from the same source of truth. React 19 context-as-provider simplifies the composition: `<ThemeContext value={...}>` instead of `<ThemeContext.Provider>`. Components expose `children` and render callbacks for customization instead of boolean flags for every visual variant.

```tsx
// Accessible dialog — focus trap, Escape, and ARIA built in
<div role="dialog" aria-modal="true" aria-labelledby={titleId}>
  <h2 id={titleId}>{title}</h2>
  {children}                        {/* content via composition, not config flags */}
</div>

// Accessible listbox — keyboard nav and screen reader support built in
<div role="listbox" aria-activedescendant={optionIds[activeIndex]} tabIndex={0}>
  {options.map((opt, i) => (
    <div role="option" id={optionIds[i]} aria-selected={i === selectedIndex}>{opt.label}</div>
  ))}
</div>

// Shared design tokens via context
const ThemeContext = createContext<ThemeContextValue | null>(null)
<ThemeContext value={{ theme: 'sunrise', tokens: themeTokens['sunrise'] }}>
  {children}
</ThemeContext>
```

### How would you handle controlled forms at scale without performance issues?

The key is isolating re-renders per field. Each input should live in its own component so a keystroke only re-renders that field, not the entire form. Validation and submission logic can live in a custom hook or the form parent, while field components stay lightweight. For form-level pending state, `useFormStatus` as in [../src/samples/FormStatusSample.tsx](../src/samples/FormStatusSample.tsx) avoids prop-drilling an `isSubmitting` flag to every button. [../src/samples/AccessibleFormErrorsSample.tsx](../src/samples/AccessibleFormErrorsSample.tsx) shows how to pair this with accessible error announcements so screen readers know which fields need attention.

The FormStatus sample demonstrates `useFormStatus` inside both a `PendingInspector` (which reads `pending`, `data`, `method` to display submission details) and per-button `SubmitButton` components (which compare the active intent to their own intent prop to show a per-button spinner). Neither component receives any submission-related props. The form's `action` is an async function, and while it runs React provides the pending snapshot to all `useFormStatus` consumers inside that `<form>`. For validation, the AccessibleFormErrors sample validates on submit, focuses the first invalid field, and marks each field with `aria-invalid` + `aria-describedby` so screen readers announce the specific error. Combining these patterns means forms stay performant (per-field re-renders), accessible (error announcements), and clean (no prop-drilling for pending state).

```tsx
// Isolate re-renders — each field is its own component
function NameField({ value, onChange }: FieldProps) {
  return <input value={value} onChange={e => onChange(e.target.value)} />
}

// useFormStatus — pending state without props
function SubmitButton({ intent }: { intent: string }) {
  const { pending, data } = useFormStatus()
  const isActive = pending && data?.get('intent') === intent
  return (
    <button type="submit" name="intent" value={intent} disabled={pending}>
      {isActive ? `Submitting ${intent}...` : intent}
    </button>
  )
}

// Accessible validation — aria-invalid + focus first error on submit
function handleSubmit(e: React.FormEvent) {
  e.preventDefault()
  const errors = validate(values)
  setErrors(errors)
  if (errors.name) { nameRef.current?.focus(); return }  // focus first error
}
<input ref={nameRef} aria-invalid={errors.name ? 'true' : undefined}
  aria-describedby={errors.name ? nameErrorId : nameHintId} />
```

## TypeScript Answers

### When would you use `satisfies` instead of `as`?

I use `satisfies` when I want TypeScript to verify that a value matches a required shape without widening away its useful literal inference. I reserve `as` for cases where runtime knowledge exists but the compiler cannot prove it. In config-heavy code like [../src/catalog.ts](../src/catalog.ts) and [../src/samples/UtilityMappedSample.tsx](../src/samples/UtilityMappedSample.tsx), `as const satisfies` is usually the safer and more expressive choice.

`satisfies` validates the shape at the assignment site but preserves the narrow inferred type. If you wrote `const lanes: readonly TaskLane[] = [...]`, the type would widen to `readonly TaskLane[]` and you would lose the exact literal members. With `as const satisfies`, the value stays `readonly ['UI', 'Data', 'Performance']` (literal tuple) while TypeScript still checks that every element is a valid `TaskLane`. `as` is different: it silences the checker entirely, so `as TaskLane[]` would not flag an invalid element. Use `as` only when runtime knowledge (like a DOM query result or a JSON parse) tells you the shape is correct but the compiler cannot prove it.

```ts
// satisfies — validates shape, keeps narrow inference
export const taskLanes = ['UI', 'Data', 'Performance'] as const satisfies readonly TaskLane[]
// taskLanes is readonly ['UI', 'Data', 'Performance'] (literal tuple)
// TypeScript still checks every element is a valid TaskLane

// Plain annotation widens — loses literal info
const taskLanes2: readonly TaskLane[] = ['UI', 'Data', 'Performance']
// taskLanes2 is readonly TaskLane[] (no literal members)

// as — silences checker, does NOT validate
const taskLanes3 = ['UI', 'Data', 'INVALID'] as readonly TaskLane[]  // no error! BUG

// as const satisfies for config objects
const config = {
  port: 3000,
  host: 'localhost',
} as const satisfies Record<string, string | number>
// config.port is 3000 (literal), not string | number
```

### How would you explain `type` vs `interface`?

I use `interface` for extendable object contracts and `type` for unions, mapped types, conditional types, template literal types, and aliases over non-object shapes. Both can model plain objects, so the real decision is whether I need the extra expressiveness of type aliases or the extension-oriented ergonomics of interfaces. This repo uses both that way in [../src/catalog.ts](../src/catalog.ts) and [./typescript-terms.md](./typescript-terms.md).

Interfaces support declaration merging (two `interface User` blocks combine into one) and native `extends` for building on existing contracts. Types support everything interfaces cannot: unions (`type Status = 'draft' | 'ready'`), mapped types (`{ [K in keyof T]: ... }`), conditional types (`T extends string ? ... : ...`), and template literal types. In this repo, domain object shapes like `Feature` and `MiniSample` are interfaces because they are extended across files. Narrower types like `FilterCategory`, `SampleStatus`, and `TaskLane` are type aliases because they are unions. Consistency within a codebase matters more than the choice itself.

```ts
// interface — extendable object contract, supports declaration merging
interface Feature {
  readonly id: string
  readonly title: string
}
interface Feature {                // declaration merging adds fields
  readonly summary: string
}

// type — unions, mapped types, conditional types, template literals
type Status = 'draft' | 'ready' | 'blocked'             // union
type Getters<T> = { [K in keyof T & string as `get${Capitalize<K>}`]: () => T[K] }  // mapped
type IsString<T> = T extends string ? true : false        // conditional
type EventName = `on${Capitalize<string>}`                // template literal

// Both can model objects — pick based on what extra features you need
interface UserI { name: string }     // can be extended
type UserT = { name: string }        // can be intersected: UserT & { role: string }
```

### What is the difference between `field?: T` and `field: T | undefined`?

`field?: T` means the property can be omitted entirely. `field: T | undefined` means the property must exist, but its value may be `undefined`. That difference matters more when strict config flags are enabled, which is why [./typescript-terms.md](./typescript-terms.md) and [../node-samples/ts-advanced-tsconfig/src/index.ts](../node-samples/ts-advanced-tsconfig/src/index.ts) are good places to anchor the explanation.

With `exactOptionalPropertyTypes` enabled, TypeScript enforces the distinction strictly: you cannot assign `undefined` to an optional property unless the type explicitly includes `| undefined`. Without the flag, `field?: string` is treated as `field?: string | undefined`, blurring the line. The practical difference: `field?: T` communicates "this field may be absent from the object entirely" (useful for config objects where omission means "use the default"), while `field: T | undefined` communicates "this field must always be present, but the value might be undefined" (useful for database rows where the column exists but is nullable).

```ts
// field?: T — property can be omitted entirely
interface Config {
  timeout?: number              // { } is valid, { timeout: 500 } is valid
}
const a: Config = {}            // ✅ property omitted
const b: Config = { timeout: 500 }  // ✅ property present

// field: T | undefined — property must exist, value may be undefined
interface DbRow {
  deletedAt: Date | undefined   // { deletedAt: undefined } required, { } is NOT valid
}
const c: DbRow = { deletedAt: undefined }  // ✅ property present
// const d: DbRow = {}           // ❌ Error: missing 'deletedAt'

// With exactOptionalPropertyTypes, you cannot assign undefined to optional props
// unless the type explicitly includes | undefined
```

### Why would you use `K extends string` in a generic helper?

That constraint keeps the generic in the string-literal world instead of widening the signature to an arbitrary string too early. It lets the helper preserve exact literals through the return type, which is often the whole point of the abstraction. [../node-samples/ts-generic-inference/src/index.ts](../node-samples/ts-generic-inference/src/index.ts) shows how these constraints protect inference quality.

Without the constraint, `function createPair(key: string, value: V)` would widen `key` to `string` in the return type, losing the literal. With `K extends string`, TypeScript infers `K` as the exact literal like `'name'` or `'age'`, and the return type preserves it as `{ key: 'name'; value: V }`. This matters when the return type feeds into another generic that depends on exact keys. The same pattern works with `K extends number` for numeric indices or `K extends string | number` for mixed keys.

```ts
// Without constraint — key widens to string
function createPairLoose(key: string, value: number) {
  return { key, value }
}
const loose = createPairLoose('name', 42)
// loose.key is string (literal lost)

// With K extends string — preserves exact literal
function createPair<K extends string, V>(key: K, value: V): { key: K; value: V } {
  return { key, value }
}
const pair = createPair('name', 42)
// pair.key is 'name' (literal preserved)
// pair is { key: 'name'; value: number }

// Useful when downstream generics depend on exact keys
// ExtractKey checks if T has a `key` property; if so, infer captures its type into K
// With the constraint above, pair.key is literal 'name', so ExtractKey returns 'name'
// Without the constraint, pair.key would be string, so ExtractKey would return string
// On unions, it distributes: ExtractKey<{key:'a'} | {key:'b'}> → 'a' | 'b'
type ExtractKey<T> = T extends { key: infer K } ? K : never
type Result = ExtractKey<typeof pair>  // 'name', not string
```

### How do distributive conditional types work, and how do you turn distribution off?

If a conditional type receives a union through a naked type parameter, TypeScript evaluates the condition for each union member separately. That is why utilities like `Extract` and `Exclude` behave member by member. If I want to stop that and test the union as one whole type, I wrap it, for example with `[T] extends [U]`, exactly like [../src/samples/ConditionalDistributivitySample.tsx](../src/samples/ConditionalDistributivitySample.tsx) demonstrates.

Distribution happens only when the type parameter is "naked" — directly used in the `extends` clause without wrapping. `IsString<string | number>` distributes to `IsString<string> | IsString<number>` → `'yes' | 'no'`. This is what makes `Extract<T, U>` work: it tests each member independently. To stop distribution and test the union as a whole, wrap both sides in a tuple: `[T] extends [string]` checks whether `string | number` extends `string` (it does not), so the result is a single `'no'`. The sample also uses `infer` inside a conditional to capture part of a type, like extracting the element type from an array or the return type from a function.

```ts
// Distributive — naked T distributes over union members
type IsString<T> = T extends string ? 'yes' : 'no'
type A = IsString<string | number>       // 'yes' | 'no' (distributed)

// Non-distributive — wrapping in tuple checks the union as a whole
type IsStringND<T> = [T] extends [string] ? 'yes' : 'no'
type B = IsStringND<string | number>     // 'no' (checked as one type)

// Extract works BECAUSE of distribution — tests each member independently
type StringOnly = Extract<string | number | boolean, string>  // string

// infer captures part of a type inside a conditional
type ElementOf<T> = T extends readonly (infer E)[] ? E : never
type C = ElementOf<readonly ['a', 'b']>  // 'a' | 'b'

type ReturnOf<T> = T extends (...args: never[]) => infer R ? R : never
type D = ReturnOf<() => string>          // string
```

### What does `infer` actually buy you in utility types?

`infer` lets a conditional type capture part of another type instead of forcing me to rebuild that structure manually. That is how helpers like `ReturnType`, promise unwrapping, or element extraction work. In [../src/samples/ConditionalDistributivitySample.tsx](../src/samples/ConditionalDistributivitySample.tsx) and [../src/samples/UtilityMappedSample.tsx](../src/samples/UtilityMappedSample.tsx), the benefit is that the derived type stays coupled to the source signature rather than drifting into a copy.

With `infer`, you declare a type variable inside the `extends` clause that TypeScript fills in when the pattern matches. `T extends (...args: never[]) => infer R` captures the return type as `R` without you having to know or restate the parameter types. This is more maintainable than manually writing `ReturnType<typeof myFunction>` because it generalizes to any function shape. Nested `infer` works too: `T extends Promise<infer U> ? U : T` unwraps one level of promise, and you can recurse to unwrap deeply nested promises (which is what `Awaited<T>` does). The key benefit: derived types stay coupled to their source rather than drifting into a manual copy.

```ts
// infer captures the return type from any function shape
type ReturnOf<T> = T extends (...args: never[]) => infer R ? R : never
type A = ReturnOf<(x: string) => number>     // number

// infer captures the first argument type
type FirstArg<T> = T extends (input: infer I, ...args: never[]) => unknown ? I : never
type B = FirstArg<(x: string, y: number) => void>  // string

// infer unwraps promises
type Unwrap<T> = T extends Promise<infer U> ? U : T
type C = Unwrap<Promise<string>>             // string
type D = Unwrap<number>                      // number (no match, falls to T)

// infer extracts array element type
type ElementOf<T> = T extends readonly (infer E)[] ? E : never
type E = ElementOf<readonly ['a', 'b', 'c']>  // 'a' | 'b' | 'c'

// Derived type stays coupled to source — change the function, type updates
function parseConfig(raw: string): { port: number; host: string } { /* ... */ }
type Config = ReturnOf<typeof parseConfig>   // { port: number; host: string }
```

### When are overloads better than a union parameter?

I prefer overloads when different call shapes should produce meaningfully different typing rules or return types. If the implementation and the return type are uniform, a union parameter is usually simpler. [../src/samples/FunctionsTuplesSample.tsx](../src/samples/FunctionsTuplesSample.tsx) and [../node-samples/ts-generic-inference/src/index.ts](../node-samples/ts-generic-inference/src/index.ts) also show the key caveat: overload order matters because TypeScript picks the first compatible signature.

Overloads let you express "if you pass a string, you get a number; if you pass a number, you get a string" in a way that a single union signature cannot. The implementation signature must be compatible with all overloads but is not visible to callers. The FunctionsTuples sample also shows call signatures on interfaces (for function objects with properties) and construct signatures (for classes that act as constructors). The key caveat: TypeScript evaluates overloads top to bottom and picks the first match, so more specific signatures must come before more general ones.

```ts
// Overloads — different inputs produce different return types
function parse(input: string): number        // overload 1: string → number
function parse(input: number): string        // overload 2: number → string
function parse(input: string | number): string | number {  // implementation (hidden)
  return typeof input === 'string' ? Number(input) : String(input)
}
const a = parse('42')    // number (overload 1 matched)
const b = parse(42)      // string (overload 2 matched)

// Union parameter — simpler when return type is uniform
function stringify(input: string | number): string {
  return String(input)
}

// Call signature on interface — function object with properties
interface PlanPreviewer {
  (plan: DispatchPlan, tone: 'brief' | 'full'): string
  readonly label: string                       // property on the function object
}

// Labeled tuples — document slot meaning for protocol data
type CommandTuple = readonly [method: CommandMethod, path: CommandPath, retries: number]
type ReleaseWindow = readonly [opensAtIso: string, closesAtIso: string]
```

### Why are labeled tuples useful instead of a plain array type?

Tuples preserve fixed length and positional meaning, while labeled tuples also document what each slot represents. That makes them useful for protocol-like data or argument spreading where position is part of the contract. [../src/samples/FunctionsTuplesSample.tsx](../src/samples/FunctionsTuplesSample.tsx) uses them well because method, path, and retries are not just “some array items.”
```ts
type CommandTuple = readonly [method: CommandMethod, path: CommandPath, retries: number]
```
### What is the difference between TypeScript `private` and JavaScript `#private`?

TypeScript `private` is enforced by the type checker but erased at runtime, so it is not true encapsulation. JavaScript `#private` is enforced by the runtime and cannot be accessed from outside through bracket notation or casts. [../src/samples/PrivateFieldsSample.tsx](../src/samples/PrivateFieldsSample.tsx) is a strong interview example because it makes the runtime difference visible instead of treating privacy as just syntax.

With TypeScript `private`, you can still access the field at runtime using bracket notation (`(instance as any)['_secret']`) because the modifier is completely erased in the emitted JavaScript. With JavaScript `#private`, the runtime enforces the privacy: bracket access returns `undefined` and direct access from outside the class throws a `TypeError`. The sample demonstrates both side by side, logging the runtime behavior to prove the difference. In the emitted output, `private _field` becomes a regular property, while `#field` stays as a hard-private field with WeakMap-like semantics.

```ts
class TsPrivate {
  private _secret = 'hidden'        // compile-time only
  getSecret() { return this._secret }
}
const ts = new TsPrivate()
// (ts as any)['_secret']            // 'hidden' — bypass at runtime!
// TypeScript blocks: ts._secret     // ❌ Error at compile time

class JsPrivate {
  #secret = 'hidden'                // runtime-enforced
  getSecret() { return this.#secret }
}
const js = new JsPrivate()
// (js as any)['#secret']            // undefined — cannot access
// js.#secret                        // ❌ SyntaxError at runtime
// Only js.getSecret() works         // 'hidden'

// The emitted JS for #private uses WeakMap-like semantics:
// var _secret = new WeakMap(); _secret.set(this, 'hidden')
```

### When are template literal types powerful, and when do they become a problem?

They are powerful when I want to derive string APIs, route params, handler names, or naming conventions from smaller literal building blocks. They become a problem when large cartesian products create huge unions that slow the checker or hit complexity limits. [../node-samples/ts-template-literals/src/index.ts](../node-samples/ts-template-literals/src/index.ts) shows both the expressive side and the performance cost.

Template literal types compose string literals the same way template literals compose runtime strings. `\`on${Capitalize<EventName>}\`` turns `'click' | 'focus'` into `'onClick' | 'onFocus'`. Combined with mapped types, this generates entire handler-name APIs from a list of events. The danger is cartesian explosion: `\`${A}-${B}-${C}\`` where each union has 10 members produces 1000 members. The compiler slows or errors. Keep each slot small, or use `string` in one slot and narrow with `extends` guards downstream.

```ts
// Derive handler names from event literals
type EventName = 'click' | 'focus' | 'blur'
type Handler = `on${Capitalize<EventName>}`    // 'onClick' | 'onFocus' | 'onBlur'

// Derive route params from a path pattern
type Route = '/users/:userId/posts/:postId'
type ExtractParams<T extends string> =
  T extends `${string}:${infer Param}/${infer Rest}`
    ? Param | ExtractParams<Rest>
    : T extends `${string}:${infer Param}`
    ? Param
    : never
type Params = ExtractParams<Route>            // 'userId' | 'postId'

// Cartesian explosion — 3×3 = 9 members, manageable
type Color = 'red' | 'green' | 'blue'
type Size = 'sm' | 'md' | 'lg'
type ColorSize = `${Color}-${Size}`           // 'red-sm' | 'red-md' | ... (9 members)

// Danger: 10×10×10 = 1000 members — checker slows or errors
// type TooMany = `${TenMembers}-${TenMembers}-${TenMembers}`
```

### How do mapped types filter or rename keys with the `as` clause?

The `as` clause in a mapped type lets you transform or filter keys. Mapping a key to `never` removes it, so `PickByType<T, string>` keeps only string-valued properties. Template literal types in the `as` clause rename keys to follow patterns like `getName`. [../src/samples/MappedFilteringSample.tsx](../src/samples/MappedFilteringSample.tsx) demonstrates both key removal and key renaming patterns.

The basic mapped type `{ [K in keyof T]: T[K] }` copies every key. The `as` clause intercepts each key before it enters the output: returning `never` drops it, returning a template literal renames it, and returning a conditional expression filters by value type. `PickByType<T, string>` keeps only keys whose value extends `string`. `OmitByType<T, Function>` drops function-valued keys. `Getters<T>` renames `name` to `getName` using `as \`get${Capitalize<K>}\``. These compose without runtime overhead because they are pure type-level transforms.

```ts
// Filter keys by value type — keep only string-valued properties
type PickByType<T, V> = { [K in keyof T as T[K] extends V ? K : never]: T[K] }
interface User { name: string; age: number; email: string }
type StringFields = PickByType<User, string>  // { name: string; email: string }

// Drop keys by value type — remove function-valued properties
type OmitByType<T, V> = { [K in keyof T as T[K] extends V ? never : K]: T[K] }
interface Service { fetch(): void; url: string; timeout: number }
type DataOnly = OmitByType<Service, Function>  // { url: string; timeout: number }

// Rename keys with template literal — generate getter names
// Step 1: K in keyof T & string — iterate string keys only (filters out number/symbol)
// Step 2: as `get${Capitalize<K>}` — remap each key ("name" → "getName", "age" → "getAge")
// Step 3: () => T[K] — value becomes a zero-arg function returning the original type
// Gotcha: numeric keys like 0 are silently dropped because number & string is never
type Getters<T> = {
  [K in keyof T & string as `get${Capitalize<K>}`]: () => T[K]
}
type UserGetters = Getters<User>  // { getName: () => string; getAge: () => number; getEmail: () => string }

// Combine filtering + renaming
type StringGetters = Getters<PickByType<User, string>>
// { getName: () => string; getEmail: () => string }
```

### How do you type API responses so loading, error, and success states are mutually exclusive?

I define a discriminated union keyed on a `status` field. The `loading` variant carries no data, `error` carries a message, and `success` carries the typed payload. This makes it impossible to access `data` when the request is still loading. In [../src/features/release-approval-workflow/useReleaseApprovalWorkflow.ts](../src/features/release-approval-workflow/useReleaseApprovalWorkflow.ts), the hook uses `RequestStatus` and `SubmitStatus` string unions so the panel can branch on status without guessing whether data exists. [../src/samples/AsyncUiVerificationSample.tsx](../src/samples/AsyncUiVerificationSample.tsx) shows a simpler `AsyncStatus` union that drives loading, success, and error rendering paths.

The discriminant property (`status`) lets TypeScript narrow the entire object when you check its value. Inside an `if (result.status === 'success')` block, TypeScript knows `result.data` exists and is typed as `T`. Inside the `'loading'` branch, accessing `data` is a compile error. This is safer than a flat object with optional fields (`{ loading?: boolean; error?: string; data?: T }`) because flat objects cannot prevent accessing `data` during loading. The release-approval hook uses string unions `RequestStatus = 'idle' | 'pending' | 'fulfilled' | 'rejected'` to get the same narrowing.

```ts
// Discriminated union — each variant carries only its valid fields
type Result<T> =
  | { status: 'loading' }                              // no data, no error
  | { status: 'error'; message: string }               // error only
  | { status: 'success'; data: T }                     // data only

function render(result: Result<User[]>) {
  switch (result.status) {
    case 'loading': return <Spinner />                  // data not accessible
    case 'error':   return <Alert>{result.message}</Alert>  // message narrowed
    case 'success': return <List items={result.data} /> // data narrowed to User[]
  }
}

// Compare: flat optional fields — unsafe, cannot prevent bad access
interface FlatResult<T> { loading?: boolean; error?: string; data?: T }
// flatResult.data is T | undefined even during loading — caller must guess

// Real-world: release-approval hook uses string union for the same pattern
type RequestStatus = 'idle' | 'pending' | 'fulfilled' | 'rejected'
```

### How do type guards safely narrow unknown data at runtime boundaries?

A type guard is a function with a return type like `value is SomeType`. After a truthy check, TypeScript narrows the variable inside the guarded branch. At API boundaries where data arrives as `unknown`, this is the safe way to assert shape before using it. In [../src/features/release-approval-workflow/client.ts](../src/features/release-approval-workflow/client.ts), `isReleaseApprovalAbortError` and `isReleaseApprovalMutationError` are type guards that narrow `unknown` catch values into specific error shapes. Simpler guards use `typeof`, `in`, or discriminant-field checks as shown in [../src/samples/ConditionalDistributivitySample.tsx](../src/samples/ConditionalDistributivitySample.tsx).

Type guards work at different levels. Built-in narrowing (`typeof x === 'string'`, `x instanceof Error`, `'field' in x`) narrows automatically. For custom shapes, you write a predicate function: the return type `value is SomeType` tells TypeScript that a `true` result means the input is that type. The body of the guard performs the runtime check (property existence, discriminant field, `instanceof`). In the release-approval client, `isReleaseApprovalAbortError` checks `e instanceof DOMException && e.name === 'AbortError'` and returns `e is DOMException`. This lets `catch` blocks narrow `unknown` into typed error branches without `as` casts.

```ts
// Custom type guard — runtime check + compile-time narrowing
function isReleaseApprovalAbortError(e: unknown): e is DOMException {
  return e instanceof DOMException && e.name === 'AbortError'
}
function isReleaseApprovalMutationError(e: unknown): e is MutationError {
  return e instanceof Error && 'code' in e && typeof (e as MutationError).code === 'string'
}

// Usage in catch block — narrows unknown without `as` casts
try {
  await submitApproval(id, signal)
} catch (e: unknown) {
  if (isReleaseApprovalAbortError(e)) return  // e is DOMException here
  if (isReleaseApprovalMutationError(e)) {
    showError(e.code)                         // e is MutationError here
  }
  throw e                                     // re-throw unrecognized errors
}

// Built-in narrowing — no predicate function needed
function process(value: string | number) {
  if (typeof value === 'string') {
    value.toUpperCase()                       // narrowed to string
  }
}
```

### How would you type a generic data-fetching hook that preserves the response shape?

The hook should be generic over the response type `T` so callers get a typed `data: T` in the return value. The return type should be a discriminated union or status-driven object so callers cannot access `data` before it exists. `AbortController` should be part of the hook contract so effect cleanup cancels in-flight requests. [../src/features/release-approval-workflow/useReleaseApprovalWorkflow.ts](../src/features/release-approval-workflow/useReleaseApprovalWorkflow.ts) shows a concrete non-generic version of this pattern, and [../src/samples/DebouncedSearchRaceSample.tsx](../src/samples/DebouncedSearchRaceSample.tsx) shows the abort cleanup side. Making it generic means replacing the concrete response type with `T` while keeping the status union intact.

The hook takes a URL (or a fetcher function generic over `T`), manages an `AbortController` in the effect cleanup, and returns a discriminated union so the caller cannot access `data` before it exists. The release-approval hook does this concretely: it tracks `RequestStatus = 'idle' | 'pending' | 'fulfilled' | 'rejected'` and only exposes `approvals` when status is `'fulfilled'`. The debounced-search sample shows the abort side: the effect cleanup calls `controller.abort()` so stale responses from a previous keystroke never update state. Making the hook generic means parameterizing the response type while keeping the same status-driven return.

```tsx
// Generic data-fetching hook — typed return, abort on cleanup
type FetchResult<T> =
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'success'; data: T }

function useFetch<T>(url: string): FetchResult<T> {
  const [result, setResult] = useState<FetchResult<T>>({ status: 'loading' })
  useEffect(() => {
    const controller = new AbortController()           // abort on cleanup
    fetch(url, { signal: controller.signal })
      .then(r => r.json() as Promise<T>)
      .then(data => setResult({ status: 'success', data }))
      .catch(e => {
        if (!controller.signal.aborted) {              // ignore abort errors
          setResult({ status: 'error', error: e.message })
        }
      })
    return () => controller.abort()                    // cancel stale request
  }, [url])
  return result
}

// Caller gets typed narrowing
const result = useFetch<User[]>('/api/users')
if (result.status === 'success') {
  result.data.map(u => u.name)  // data is User[], not User[] | undefined
}
```

### How do branded types prevent accidental mixing of structurally identical primitives?

Branded types add a phantom property that makes two structurally identical types incompatible. Template literal types like `release-${number}` in [../src/features/release-approval-workflow/types.ts](../src/features/release-approval-workflow/types.ts) achieve this naturally: a `ReleaseApprovalId` is `release-${number}` and a `BoardTaskId` in [../src/samples/ReducerBoardSample.tsx](../src/samples/ReducerBoardSample.tsx) is `board-task-${number}`, so passing one where the other is expected is a compile error even though both are strings. For cases where template literals do not fit, a `__brand` phantom field serves the same purpose.

Template literal branding is the lightest approach: `type ReleaseApprovalId = \`release-${number}\`` is incompatible with `type BoardTaskId = \`board-task-${number}\`` even though both are subsets of `string`. This works because the literal patterns are structurally different. For cases where the shape is identical (e.g., two `number` types representing different units), a phantom `__brand` field makes them nominal: `type USD = number & { __brand: 'USD' }` and `type EUR = number & { __brand: 'EUR' }` are incompatible despite both being numbers. The brand field never exists at runtime — it is only a type-level marker.

```ts
// Template literal branding — structurally different patterns
type ReleaseApprovalId = `release-${number}`    // 'release-42' ✅, 'board-task-1' ❌
type BoardTaskId = `board-task-${number}`        // 'board-task-1' ✅, 'release-42' ❌

function approve(id: ReleaseApprovalId) { /* ... */ }
// approve('release-42')       // ✅
// approve('board-task-1')     // ❌ compile error — different literal pattern

// Phantom brand — for structurally identical primitives
type USD = number & { readonly __brand: unique symbol }
type EUR = number & { readonly __brand: unique symbol }

function charge(amount: USD) { /* ... */ }
// charge(100 as USD)          // ✅ explicit cast required
// charge(100 as EUR)          // ❌ EUR is not assignable to USD
// charge(100)                 // ❌ plain number is not assignable to USD

// Constructor function hides the cast
function usd(amount: number): USD { return amount as USD }
const price = usd(9.99)       // price is USD
```

### When would you model domain objects with classes instead of plain interfaces?

I would use classes when I need runtime behavior, encapsulation, and `instanceof` narrowing. Abstract classes are useful for enforcing a subclass contract while sharing common logic. For pure data composition without runtime behavior, intersection types compose interfaces. [../src/samples/ClassesModelsSample.tsx](../src/samples/ClassesModelsSample.tsx) shows both the abstract class hierarchy and the intersection-based view model.

The abstract `ReleasePlugin` base class in the sample enforces that every subclass provides a `cadence` string and a `run()` method, while sharing a base `summary()` method. Subclasses like `NightlyPlugin` and `WeeklyPlugin` override `cadence` and `run()` but inherit `summary()`. This is useful when polymorphism matters at runtime (e.g., iterating `plugins.map(p => p.run())` where each invocation dispatches to the right subclass). For pure data shapes, the sample composes interfaces with intersection types: `type ReleaseViewModel = PluginSummary & BuildMetadata & { releaseDate: string }` merges three shapes without any class hierarchy. Choose classes for behavior + narrowing, interfaces + intersections for data composition.

```ts
// Abstract class — enforces subclass contract, shares common logic
abstract class ReleasePlugin {
  abstract readonly cadence: string         // subclass must define
  abstract run(): PluginRunResult           // subclass must implement
  summary(): string {                       // shared base method
    return `${this.cadence}: ${this.constructor.name}`
  }
}

class NightlyPlugin extends ReleasePlugin {
  readonly cadence = 'nightly'              // satisfies abstract property
  run(): PluginRunResult { /* ... */ }      // satisfies abstract method
}

// instanceof narrowing works at runtime
function describe(plugin: ReleasePlugin) {
  if (plugin instanceof NightlyPlugin) {
    plugin.cadence  // narrowed to 'nightly' (literal)
  }
}

// Interface composition — pure data, no runtime behavior
interface PluginSummary { name: string; cadence: string }
interface BuildMetadata { commit: string; branch: string }
type ReleaseViewModel = PluginSummary & BuildMetadata & { releaseDate: string }
```

### How do recursive types model tree-shaped data, and what are their limits?

A recursive interface references itself in a child property, allowing TypeScript to describe trees of arbitrary depth. Utility types like `DeepReadonly` and `DeepKeyPaths` recur over every level. The main limit is the compiler's recursion depth, and very deep `as const` trees can exceed inference bounds. [../src/samples/RecursiveTypesSample.tsx](../src/samples/RecursiveTypesSample.tsx) shows both the type definitions and the matching recursive runtime helpers.

`OrgNode` references itself in `children: readonly OrgNode[]`, so a tree can be 2 levels or 20 levels deep and the type still holds. `DeepReadonly<T>` recurses to make every nested property `readonly`, preventing accidental mutation deep in the tree. `DeepKeyPaths<T>` generates dot-separated path strings (`'id' | 'name' | 'children' | 'children.id' | ...`) by recursing into object properties. The runtime helpers (`findNode`, `flattenTree`, `countDepth`) mirror the recursive type structure. The limit: TypeScript caps recursion depth at ~50 levels, and `as const` inference on very deep literal objects can exceed that bound.

```ts
// Recursive interface — self-referencing child property
interface OrgNode {
  id: string
  name: string
  children: readonly OrgNode[]              // tree of arbitrary depth
}

// Recursive utility — deep-freeze every nested property
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K]
}

// Recursive utility — generate dot-separated key paths
type DeepKeyPaths<T> = T extends object
  ? { [K in keyof T & string]: K | `${K}.${DeepKeyPaths<T[K]>}` }[keyof T & string]
  : never
type Paths = DeepKeyPaths<OrgNode>           // 'id' | 'name' | 'children' | 'children.id' | ...

// Matching recursive runtime helper
function findNode(root: OrgNode, id: string): OrgNode | undefined {
  if (root.id === id) return root
  for (const child of root.children) {
    const found = findNode(child, id)        // recurse into children
    if (found) return found
  }
  return undefined
}

// Limit: compiler caps recursion at ~50 levels
```

### What is type variance, and when do `in`, `out`, and `in out` annotations matter?

Covariance means a more specific type can substitute in output position: `Producer<Cat>` is assignable to `Producer<Animal>`. Contravariance reverses this for input position: `Consumer<Animal>` is assignable to `Consumer<Cat>`. Explicit `in` and `out` annotations document and enforce these rules, catching unsound assignments faster. [../node-samples/ts-variance/src/index.ts](../node-samples/ts-variance/src/index.ts) walks through all three variance modes.

Without annotations, TypeScript infers variance from usage, which is usually correct but can be slow for complex generics and may miss unsound assignments. `out T` (covariant) says T only appears in return positions, so `Box<Cat>` is assignable to `Box<Animal>`. `in T` (contravariant) says T only appears in parameter positions, so `Handler<Animal>` is assignable to `Handler<Cat>`. `in out T` (invariant) says T appears in both and no substitution is safe. If you annotate `out T` but use T in a parameter position, the compiler errors immediately rather than allowing an unsound assignment.

```ts
// Covariant — T in output position only
interface Producer<out T> {
  produce(): T                              // T is returned, not consumed
}
const catProducer: Producer<Cat> = { produce: () => new Cat() }
const animalProducer: Producer<Animal> = catProducer  // ✅ Cat extends Animal

// Contravariant — T in input position only
interface Consumer<in T> {
  consume(item: T): void                    // T is consumed, not returned
}
const animalConsumer: Consumer<Animal> = { consume: (a) => { /* ... */ } }
const catConsumer: Consumer<Cat> = animalConsumer     // ✅ reversed direction

// Invariant — T in both positions, no substitution safe
interface Registry<in out T> {
  get(): T                                  // output → wants covariance
  set(item: T): void                        // input → wants contravariance
}
// const catRegistry: Registry<Cat> = animalRegistry  // ❌ invariant, not assignable

// Without annotation, compiler infers variance but may miss unsound cases
// With annotation, misuse is caught immediately:
// interface Bad<out T> { consume(item: T): void }  // ❌ Error: T in input position
```

### When are enums appropriate, and when should you use union types instead?

Enums produce a runtime object and support reverse mapping, which matters when the value set must exist at runtime. Union types are lighter because they are erased. `const enum` inlines values at compile time but has restrictions with `isolatedModules` and `verbatimModuleSyntax`. [../node-samples/ts-advanced-runtime/src/index.ts](../node-samples/ts-advanced-runtime/src/index.ts) covers numeric enums, string enums, and const enums side by side.

Numeric enums generate a reverse-mapping object: `DeployStage[0]` returns `'Build'`. This is useful for logging or serialization where you need to go from value back to name. String enums do not generate reverse mappings but produce more readable serialized values. `const enum` inlines the values at every call site and emits no runtime object, which is lighter but breaks under `isolatedModules` because the enum definition is not available across module boundaries. Union types (`type Stage = 'build' | 'test' | 'staging'`) are the lightest: they are erased entirely and provide autocompletion, exhaustive `switch` checking, and no runtime overhead. Prefer unions unless runtime reverse-mapping is needed.

```ts
// Numeric enum — reverse mapping at runtime
enum DeployStage { Build = 0, Test = 1, Staging = 2, Production = 3 }
DeployStage.Build      // 0
DeployStage[0]         // 'Build' (reverse mapping)
const stage: DeployStage = DeployStage.Test  // works at runtime

// String enum — readable values, no reverse mapping
enum LogLevel { Debug = 'DEBUG', Info = 'INFO', Warn = 'WARN', Error = 'ERROR' }
LogLevel.Debug         // 'DEBUG'
// LogLevel['DEBUG']   // ❌ no reverse mapping for string enums

// const enum — inlined at call site, no runtime object
const enum Direction { Up, Down, Left, Right }
const d = Direction.Up // compiled to: const d = 0 (inlined)
// Breaks with isolatedModules — enum definition not available across files

// Union type — lightest, erased at runtime, autocompletion + exhaustive checks
type Stage = 'build' | 'test' | 'staging' | 'production'
function label(s: Stage): string {
  switch (s) {
    case 'build': return 'Building'
    case 'test': return 'Testing'
    case 'staging': return 'Staging'
    case 'production': return 'Deploying'  // exhaustive, compiler warns if missing
  }
}
```

### How do you type an untyped JavaScript module with `.d.ts` files?

Create a `.d.ts` file alongside the JS module that declares the exported types. For global types, use declaration merging. For additional type files, use triple-slash references. This gives full type safety without touching the vendor source. [../node-samples/ts-declarations/src/index.ts](../node-samples/ts-declarations/src/index.ts) imports from a plain JS vendor module using this approach.

The `.d.ts` file uses `declare module` to describe the shapes exported by the JS module. The TypeScript consumer imports from the JS path and gets full type checking, autocompletion, and refactoring support. Declaration merging lets you extend existing types across files: two `interface Window` blocks in different `.d.ts` files combine into one. Triple-slash `/// <reference types="..." />` directives pull in additional type packages. The key rule: the `.d.ts` file must be included by the tsconfig, either through `rootDir`, `include`, or `typeRoots`.

```ts
// vendor/legacy-release-kit.d.ts — types for an untyped JS module
declare module '../vendor/legacy-release-kit.js' {
  export interface ReleaseConfig {
    readonly version: string
    readonly dryRun: boolean
  }
  export function createReleaseSession(config: ReleaseConfig): ReleaseSession
  export class ReleaseSession {
    start(): Promise<void>
    abort(): void
  }
}

// consumer.ts — imports from JS, gets full type safety
import { createReleaseSession, type ReleaseConfig } from '../vendor/legacy-release-kit.js'
const config: ReleaseConfig = { version: '1.0.0', dryRun: true }
const session = createReleaseSession(config)  // typed as ReleaseSession

// Declaration merging — extend existing global types across files
interface Window {
  __APP_VERSION__: string   // adds to the existing Window interface
}
```

### How does JSDoc typing work with `allowJs` and `checkJs`?

`allowJs` lets TypeScript compile `.js` files and `checkJs` turns on type checking for them. JSDoc annotations like `@param`, `@returns`, and `@typedef` provide the type information inside the JS file. A TypeScript file can import the JS module and get full type safety without a `.d.ts` file. [../node-samples/ts-jsdoc-interop/src/index.ts](../node-samples/ts-jsdoc-interop/src/index.ts) demonstrates this interop.

With `allowJs: true`, TypeScript includes `.js` files in compilation. With `checkJs: true` (or a `// @ts-check` comment at the top of each file), TypeScript checks the JS files for type errors using JSDoc annotations as the type source. `@param {string} name` types a parameter, `@returns {number}` types the return, and `@typedef` defines reusable type aliases. A TypeScript file importing the JS module sees the JSDoc types as if they were annotations. This is useful for gradual migration: you can add types to existing JS files without renaming them to `.ts`.

```ts
// release-notes.js — JSDoc provides types inside plain JavaScript
// @ts-check

/** @typedef {{ title: string; body: string }} ReleaseNote */

/**
 * @param {string} version
 * @param {ReleaseNote[]} notes
 * @returns {string}
 */
function formatNotes(version, notes) {
  return notes.map(n => `## ${version}: ${n.title}\n${n.body}`).join('\n')
}

module.exports = { formatNotes }

// consumer.ts — imports JS module with full type safety
import { formatNotes } from './release-notes.js'
const output = formatNotes('1.0.0', [{ title: 'Fix', body: 'Bug fix' }])
// output is string, args are type-checked against JSDoc annotations

// tsconfig.json — enable JS checking
// { "compilerOptions": { "allowJs": true, "checkJs": true } }
```

### What does `NoInfer<T>` do, and when is it useful?

`NoInfer<T>` prevents TypeScript from inferring a type parameter from a specific argument position. This forces inference to come from the other call site, so the second argument must match rather than widen. It solves inference-site conflicts without requiring explicit type parameters from the caller. [../node-samples/ts-generic-inference/src/index.ts](../node-samples/ts-generic-inference/src/index.ts) uses it to prevent the second array argument from widening T.

Without `NoInfer`, if both arguments contribute to inferring `T`, TypeScript unifies them: `mergeStrict(['a', 'b'], ['c', 1])` would infer `T` as `string | number` because both arrays influence inference. With `NoInfer<T>` on the second argument, inference is driven only by the first array. The second array must then match `T` exactly, so `['c', 1]` would error because `number` is not assignable to `string`. This is safer for "primary source + secondary must match" patterns. `NoInfer` is a built-in utility type added in TypeScript 5.4 and compiles to a no-op at runtime.

```ts
// Without NoInfer — both args influence inference, type widens
function mergeBad<T>(a: readonly T[], b: readonly T[]): T[] {
  return [...a, ...b]
}
mergeBad(['a', 'b'], ['c', 1])   // T inferred as string | number (⚠️ widened)

// With NoInfer — only first arg drives inference
function mergeStrict<T>(a: readonly T[], b: readonly NoInfer<T>[]): T[] {
  return [...a, ...b]
}
mergeStrict(['a', 'b'], ['c', 'd'])  // ✅ T is string, second array matches
// mergeStrict(['a', 'b'], ['c', 1]) // ❌ number not assignable to string

// Useful for "default must match options" patterns
function createStore<T>(options: T[], defaultValue: NoInfer<T>): T {
  return defaultValue
}
createStore(['red', 'green', 'blue'], 'red')     // ✅ T is 'red' | 'green' | 'blue'
// createStore(['red', 'green', 'blue'], 'pink')  // ❌ 'pink' not in union
```

## Architecture And Debugging Answers

### How is the sample system organized so UI, routing, and tests do not drift apart?

The core idea is that the catalog is the source of truth. Routing resolves sample ids from that same metadata, rendering uses the same ids to find component implementations, and tests verify that implemented entries really map to either a component or an artifact. You can trace that contract across [../src/sampleCatalog.ts](../src/sampleCatalog.ts), [../src/sampleRuntime.ts](../src/sampleRuntime.ts), [../src/sampleImplementations.ts](../src/sampleImplementations.ts), and [../src/implementedSampleArtifacts.ts](../src/implementedSampleArtifacts.ts).

`sampleCatalog.ts` defines the `MiniSampleId` literal union and the `miniSamples` array where each entry has an id, title, surface, and tags. `sampleRuntime.ts` reads the URL hash and maps it to one of those ids. `sampleImplementations.ts` maps ids to React components (`Partial<Record<MiniSampleId, ComponentType>>`). `implementedSampleArtifacts.ts` maps ids for samples that run outside the SPA (hydration entries, node workspaces) to artifact metadata with entry points and verification commands. The test file iterates every implemented entry and asserts it has either a component or an artifact, so adding a new id without an implementation is caught instantly.

```ts
// sampleCatalog.ts — the source of truth for all sample metadata
export type MiniSampleId = 'sample-react-activity-transition' | 'sample-react-reducer-board' | ...
export const miniSamples: readonly MiniSample[] = [
  { id: 'sample-react-activity-transition', title: 'Activity & Transitions', surface: 'current-app', tags: ['react'] },
  { id: 'sample-react-hydration-hints', surface: 'separate-entry', entryHtml: 'hydration.html' },
]

// sampleImplementations.ts — maps ids to React components
export const sampleImplementations: Partial<Record<MiniSampleId, ComponentType>> = {
  'sample-react-activity-transition': ActivityTransitionSample,
  'sample-react-reducer-board': ReducerBoardSample,
}

// implementedSampleArtifacts.ts — maps ids for out-of-SPA samples
export const implementedSampleArtifacts: Partial<Record<MiniSampleId, ImplementedSampleArtifact>> = {
  'sample-react-hydration-hints': { entryHtml: 'hydration.html', entryPoint: 'src/hydration/main.tsx' },
}

// samples.test.tsx — coverage contract
implementedIds.forEach(id => {
  expect(sampleImplementations[id] || implementedSampleArtifacts[id]).toBeTruthy()
})
```

### Why does this repo split samples across current-app, isolated-route, separate-entry, and node-only surfaces?

Those are execution contracts, not presentation labels. Some samples can live inside the main app, some need a dedicated routed component, some require their own HTML entry because they depend on true hydration behavior, and some only make sense as standalone TypeScript workspaces. [../src/sampleCatalog.ts](../src/sampleCatalog.ts) and [../src/implementedSampleArtifacts.ts](../src/implementedSampleArtifacts.ts) make that boundary explicit instead of pretending every example can be rendered the same way.

`current-app` samples render inline inside the main SPA shell (like ReducerBoard, MemoLab). `isolated-route` samples need their own route because they have layout or side-effect requirements that conflict with other samples. `separate-entry` samples need a distinct HTML file because they depend on server-rendered markup already in the DOM before client JS runs (hydration). `node-only` samples are standalone TypeScript workspaces under `node-samples/` that cannot run in a browser at all (e.g., streaming SSR, compiler analysis). This surface type drives how tests verify the sample and how the stage component resolves it.

```ts
// current-app — renders inside the main SPA shell
{ id: 'sample-react-reducer-board', surface: 'current-app', tags: ['react', 'state'] }

// isolated-route — needs its own route for layout/side-effect isolation
{ id: 'sample-react-portal', surface: 'isolated-route' }

// separate-entry — needs its own HTML file for real hydration
{ id: 'sample-react-hydration-hints', surface: 'separate-entry', entryHtml: 'hydration.html' }

// node-only — standalone TypeScript workspace, not browser-runnable
{ id: 'sample-ts-advanced-runtime', surface: 'node-only', workspace: 'node-samples/ts-advanced-runtime' }

// The surface drives how MiniSampleStage resolves the sample:
// current-app → render component inline
// separate-entry → show artifact metadata with launch link
// node-only → show artifact metadata with verification command
```

### What would you inspect first if the selected sample does not match the URL hash?

I would start at the routing boundary rather than the visible component tree. First I would verify slug creation, hash parsing, and fallback logic in [../src/sampleRuntime.ts](../src/sampleRuntime.ts). After that I would confirm the resolved id exists in [../src/sampleCatalog.ts](../src/sampleCatalog.ts) and actually maps to a component or artifact in [../src/sampleImplementations.ts](../src/sampleImplementations.ts).

`readSampleIdFromHash` takes `window.location.hash`, strips the `#` prefix, and looks up the slug in the catalog. If no match is found, it returns `null` and the stage shows a fallback. Common bugs: the hash includes a leading `#` that is or is not stripped depending on the browser; the slug was changed in the catalog but not in the URL source; or the component was added to `sampleImplementations` under a different id than the catalog entry. Checking each boundary in order (URL → hash parser → catalog lookup → implementation map) isolates the problem quickly.

```ts
// sampleRuntime.ts — URL hash → sample id
export function readSampleIdFromHash(hash: string): MiniSampleId | null {
  const slug = hash.replace(/^#/, '')                     // strip leading #
  const match = miniSamples.find(s => toSampleHash(s.id) === slug)
  return match?.id ?? null
}

export function toSampleHash(id: MiniSampleId): string {
  return id.replace(/^sample-/, '')                       // 'sample-react-memo-lab' → 'react-memo-lab'
}

// Debugging checklist:
// 1. console.log(window.location.hash)                   // what does the browser report?
// 2. console.log(readSampleIdFromHash(hash))             // does it resolve to an id?
// 3. console.log(miniSamples.map(s => s.id))             // is the id in the catalog?
// 4. console.log(sampleImplementations[id])              // is there a component for it?
// 5. console.log(implementedSampleArtifacts[id])         // is there an artifact entry?
```

### How do the tests prove an implemented sample is actually real?

They check the proof appropriate to each sample surface. Route-backed samples must render through the stage, while artifact-backed samples must have concrete entries that point to their files and verification commands. [../src/test/samples.test.tsx](../src/test/samples.test.tsx) is strong because it verifies the coverage contract instead of only testing a few happy-path components.

The test iterates every sample id that has been marked as implemented and asserts that it exists in either `sampleImplementations` (for render-backed samples) or `implementedSampleArtifacts` (for out-of-SPA samples). This is a coverage contract: if you add a new sample id to the catalog and mark it implemented, but forget to add the component or artifact entry, the test fails. For render-backed samples, the test can also mount the component through `MiniSampleStage` and assert it renders without errors. For artifact-backed samples, the test asserts the entry has a valid `entryPoint` and `launchPath`.

```ts
// samples.test.tsx — coverage contract ensures no implemented sample is orphaned
import { miniSamples } from '../sampleCatalog'
import { sampleImplementations } from '../sampleImplementations'
import { implementedSampleArtifacts } from '../implementedSampleArtifacts'

const implementedIds = miniSamples
  .filter(s => s.status === 'implemented')
  .map(s => s.id)

describe('sample coverage contract', () => {
  implementedIds.forEach(id => {
    it(`${id} has a component or artifact`, () => {
      // Every implemented id must map to a real component or artifact entry
      expect(
        sampleImplementations[id] || implementedSampleArtifacts[id]
      ).toBeTruthy()
    })
  })
})

// Render test for component-backed samples
it('renders without error', () => {
  const Component = sampleImplementations[id]!
  render(<Component />)                     // mount and assert no throw
})
```

### How would you explain verifying async UI behavior instead of only asserting the final state?

I would say the important thing is to prove the transitions the user experiences, not just the end result. That means controlling time and mock outcomes so loading, failure, and retry states can all be observed deterministically. [../src/test/async-ui-verification-sample.test.tsx](../src/test/async-ui-verification-sample.test.tsx) is a good example because it asserts the intermediate states explicitly.

The test uses `vi.useFakeTimers()` to take full control of time. After triggering an action, it advances time in steps with `vi.advanceTimersByTime(ms)`, asserting the UI at each transition: first "Loading...", then after the mock delay "Success" or "Error". Without fake timers, the test would be flaky because real time is non-deterministic. The `act()` wrapper ensures React processes all pending state updates and effects before assertions run. The pattern is: mount → trigger action → assert loading state → advance time → assert success/error state → optionally trigger retry → assert retry state.

```ts
// async-ui-verification-sample.test.tsx — deterministic async UI testing
import { render, screen, act } from '@testing-library/react'
import { vi } from 'vitest'

beforeEach(() => vi.useFakeTimers())       // take control of time
afterEach(() => vi.useRealTimers())        // restore real timers

it('shows loading, then success', async () => {
  render(<AsyncComponent />)

  // Trigger the async action
  await act(async () => {
    screen.getByRole('button').click()
  })

  // Assert loading state (immediate)
  expect(screen.getByText('Loading...')).toBeTruthy()

  // Advance past the simulated delay
  await act(async () => {
    vi.advanceTimersByTime(500)              // mock resolves after 500ms
  })

  // Assert success state (after delay)
  expect(screen.getByText('Success')).toBeTruthy()
  expect(screen.queryByText('Loading...')).toBeNull()
})

it('shows error state on failure', async () => {
  mockFetch.mockRejectedValueOnce(new Error('Network error'))
  render(<AsyncComponent />)
  await act(async () => screen.getByRole('button').click())
  await act(async () => vi.advanceTimersByTime(500))
  expect(screen.getByText('Error: Network error')).toBeTruthy()
})
```

### How would you explain a hydration mismatch in an interview?

It means the client tried to hydrate markup that does not match what the server originally rendered for the same tree. React warns because hydration expects to attach behavior onto matching HTML, not replace unexpectedly different output. In this repo, [../src/samples/HydrationMismatchDemo.ts](../src/samples/HydrationMismatchDemo.ts) and [../src/hydration/HydrationHintsApp.tsx](../src/hydration/HydrationHintsApp.tsx) help anchor common causes like time-based values, random output, and environment-only branching.

Hydration works by walking the existing DOM and attaching event handlers and state to matching elements. If the client renders `<span>3:00 PM</span>` but the server rendered `<span>2:59 PM</span>`, the tree does not match. React warns and patches the DOM, but this is expensive and defeats the purpose of hydration. Common causes: `Date.now()` or `Math.random()` during render, `typeof window` branching that produces different markup, and environment-sensitive CSS class names. The fix is to defer client-only values to `useEffect` (which runs after hydration) or use `suppressHydrationWarning` on individual elements where mismatch is intentional.

```tsx
// ❌ Causes hydration mismatch — different output on server vs client
function Clock() {
  return <span>{new Date().toLocaleTimeString()}</span>   // server time ≠ client time
}

// ✅ Fix — defer client-only value to useEffect
function Clock() {
  const [time, setTime] = useState<string | null>(null)   // null matches server
  useEffect(() => setTime(new Date().toLocaleTimeString()), [])  // runs after hydration
  return <span>{time ?? 'Loading...'}</span>               // server renders 'Loading...'
}

// ✅ Fix — suppressHydrationWarning for intentional mismatch
function ClientId() {
  return <span suppressHydrationWarning>{Math.random().toString(36)}</span>
}

// HydrationHintsApp.tsx — hydration entry with proper onRecoverableError
hydrateRoot(container, <HydrationHintsApp />, {
  onRecoverableError(error) {
    console.error('Hydration mismatch:', error)            // logs mismatch details
  },
})
```

### Why are the hydration examples separate entry points instead of ordinary routed components?

Real hydration starts with existing server-rendered HTML already in the document before the client code runs. A normal SPA route would only show a fresh client mount, which misses the actual hydration contract. That is why [../src/hydration/HydrationHintsApp.tsx](../src/hydration/HydrationHintsApp.tsx) is paired with artifact metadata in [../src/implementedSampleArtifacts.ts](../src/implementedSampleArtifacts.ts) instead of being treated like an ordinary route sample.

A separate HTML entry (`hydration.html`) contains server-rendered markup already embedded in the page. The client script (`src/hydration/main.tsx`) calls `hydrateRoot()` against that existing DOM rather than `createRoot()`. If this sample were a normal SPA route, the DOM would be empty before the component mounts, so there would be nothing to hydrate and the entire exercise would be meaningless. The artifact metadata in `implementedSampleArtifacts.ts` provides the entry HTML path, the client entry point, and a launch path so the test runner and the stage component know how to activate and verify it.

```ts
// implementedSampleArtifacts.ts — artifact entry for the hydration sample
'sample-react-hydration-hints': {
  entryHtml: 'hydration.html',              // HTML file with server-rendered markup
  entryPoint: 'src/hydration/main.tsx',     // client script that calls hydrateRoot
  launchPath: '/hydration.html',            // URL to open in the browser
}

// hydration.html — server-rendered markup is already in the page
<div id="root">
  <h1>Hydration Hints</h1>                   <!-- static markup from server -->
  <p>This content exists before JS loads</p>
</div>
<script type="module" src="/src/hydration/main.tsx"></script>

// src/hydration/main.tsx — attaches behavior to existing DOM
import { hydrateRoot } from 'react-dom/client'
import { HydrationHintsApp } from './HydrationHintsApp'

const container = document.getElementById('root')!
hydrateRoot(container, <HydrationHintsApp />)   // attach to existing HTML, do not replace
```

### How does the streaming SSR workspace compare different server rendering modes?

It runs `renderToString`, `renderToPipeableStream`, `prerender`, `resume`, and other APIs against the same component tree. Each mode produces a summary that shows whether Suspense fallbacks or resolved content appear in the output. This helps you choose the right rendering mode based on your latency and SEO needs. [../server-samples/react-streaming-ssr/src/runAllModes.tsx](../server-samples/react-streaming-ssr/src/runAllModes.tsx) is the entry point.

`renderToString` produces a complete HTML string synchronously, so all Suspense boundaries resolve before returning. `renderToPipeableStream` streams HTML chunks as data becomes ready, so the client sees fallback content immediately and replacement content arrives later via inline `<script>` tags. `prerender` (experimental) runs the entire tree ahead of time and returns a static result, useful for static site generation. `resume` (experimental) picks up where a prerender left off, hydrating the deferred parts on the client. The workspace runs all modes against the same `<App>` tree and logs a comparison table showing time-to-first-byte, Suspense handling, and output completeness.

```ts
// runAllModes.tsx — compare all React SSR rendering strategies
import { renderToString } from 'react-dom/server'
import { renderToPipeableStream } from 'react-dom/server.node'

// Mode 1: renderToString — synchronous, blocks until complete
const html = renderToString(<App />)           // full HTML string, Suspense resolved

// Mode 2: renderToPipeableStream — streaming, sends chunks as ready
const { pipe } = renderToPipeableStream(<App />, {
  onShellReady() {
    pipe(response)                             // shell sent immediately
  },
  onAllReady() {
    // all Suspense boundaries resolved        // replacement chunks sent
  },
})

// Mode 3: prerender (experimental) — static generation
const { prelude } = await prerender(<App />)   // full result, no streaming

// Comparison output:
// | Mode              | TTFB    | Suspense fallbacks? | Complete HTML? |
// | renderToString    | High    | No (blocks)         | Yes            |
// | renderToPipeableStream | Low | Yes (streams)      | Eventually     |
// | prerender         | N/A     | No (pre-resolved)   | Yes            |
```

### What does dynamic component resolution look like in the sample stage?

The stage reads the current URL hash, resolves a catalog id, and looks up either a component or an artifact entry. If a component exists it renders inline, if an artifact exists it shows the entry details, and otherwise it shows a placeholder. This centralizes routing, rendering, and fallback logic in one component. [../src/components/MiniSampleStage.tsx](../src/components/MiniSampleStage.tsx) shows the resolution chain.

The resolution is a three-way branch: (1) if `sampleImplementations[id]` exists, the stage renders that component directly with `<Impl />`; (2) if `implementedSampleArtifacts[id]` exists, the stage shows the artifact metadata (entry HTML, launch path, verification command) instead of rendering inline; (3) if neither exists, the stage shows a placeholder indicating the sample is not yet implemented. This design means adding a new sample only requires adding it to the catalog and either the implementations map or the artifacts map — the stage component does not need to change.

```tsx
// MiniSampleStage.tsx — three-way resolution from URL hash
import { sampleImplementations } from '../sampleImplementations'
import { implementedSampleArtifacts } from '../implementedSampleArtifacts'
import { readSampleIdFromHash } from '../sampleRuntime'

function MiniSampleStage() {
  const activeSample = readSampleIdFromHash(window.location.hash)
  if (!activeSample) return <Placeholder message="Select a sample" />

  // Branch 1: component-backed sample — render inline
  const Impl = sampleImplementations[activeSample]
  if (Impl) return <Impl />

  // Branch 2: artifact-backed sample — show metadata + launch link
  const artifact = implementedSampleArtifacts[activeSample]
  if (artifact) return <ArtifactCard artifact={artifact} />

  // Branch 3: not yet implemented — show placeholder
  return <Placeholder message={`${activeSample} not implemented yet`} />
}

// Adding a new sample: just add to catalog + one of the two maps
// The stage component never needs to change
```

### How would you debug a child component that re-renders more than expected?

I would check prop identity first. New objects or functions created every render break `memo` boundaries. Then I would check context provider values because unstable provider objects force every consumer to re-render. The React Profiler or `useDebugValue` can confirm which renders and effects actually run. [../src/samples/MemoLabSample.tsx](../src/samples/MemoLabSample.tsx) and [../src/samples/ContextIdentitySample.tsx](../src/samples/ContextIdentitySample.tsx) demonstrate these patterns.

The debugging flow: (1) open React DevTools Profiler, record the interaction, and check which components highlight. (2) For each re-rendering child, check if the parent passes a new object or function on every render. If so, stabilize it with `useMemo` or `useCallback`. (3) If the child consumes context, check if the provider value is a new object on every render. Wrapping the value in `useMemo` fixes this. (4) If the child uses `memo`, verify the comparison function handles all relevant props. (5) Consider lifting state up or splitting context to reduce the blast radius of state changes.

```tsx
// Problem: parent creates new object on every render → breaks memo
function Parent() {
  const style = { color: 'red' }             // ❌ new object every render
  return <MemoChild style={style} />
}

// Fix: stabilize with useMemo
function Parent() {
  const style = useMemo(() => ({ color: 'red' }), [])  // ✅ stable identity
  return <MemoChild style={style} />
}

// Problem: context provider creates new value on every render
function ThemeProvider({ children }: { children: ReactNode }) {
  const [palette, setPalette] = useState('light')
  const toggle = () => setPalette(p => p === 'light' ? 'dark' : 'light')
  // ❌ new object every render → all consumers re-render
  return <ThemeCtx.Provider value={{ palette, toggle }}>{children}</ThemeCtx.Provider>
}

// Fix: stabilize provider value
function ThemeProvider({ children }: { children: ReactNode }) {
  const [palette, setPalette] = useState('light')
  const toggle = useCallback(() => setPalette(p => p === 'light' ? 'dark' : 'light'), [])
  const value = useMemo(() => ({ palette, toggle }), [palette, toggle])  // ✅ stable
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>
}
```

### How would you debug slow typing or filtering in a search UI?

First I would decide whether the bottleneck is expensive derived computation, unnecessary re-renders, or lack of scheduling. `useDeferredValue` lets derived work lag behind urgent input so keystrokes stay responsive. Debouncing the network request prevents flooding, and `AbortController` cancels stale requests before they resolve. [../src/App.tsx](../src/App.tsx) and [../src/samples/DebouncedSearchRaceSample.tsx](../src/samples/DebouncedSearchRaceSample.tsx) cover both approaches.

The first layer is scheduling: `useDeferredValue(query)` gives React permission to keep the input responsive while deferring the expensive filtered list re-render. The second layer is debouncing: instead of firing a network request on every keystroke, wait until the user pauses typing, using `setTimeout` in an effect with cleanup. The third layer is abort: create a new `AbortController` in each effect invocation and call `controller.abort()` in the cleanup function. This ensures that if the user types another character before the previous request resolves, the stale response is discarded. Together these three layers (scheduling, debouncing, abort) cover the full performance spectrum from CPU-bound filtering to network-bound search.

```tsx
// Layer 1: useDeferredValue — urgent input + deferred derived work
function SearchUI() {
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)   // derived work lags behind typing
  const results = useMemo(
    () => expensiveFilter(items, deferredQuery),  // runs at lower priority
    [deferredQuery]
  )
  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <ResultList items={results} />
    </>
  )
}

// Layer 2+3: debounce + AbortController — network-bound search
function DebouncedSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Item[]>([])

  useEffect(() => {
    if (!query) { setResults([]); return }
    const controller = new AbortController()       // abort stale requests
    const timer = setTimeout(async () => {         // debounce 300ms
      try {
        const res = await fetch(`/api/search?q=${query}`, { signal: controller.signal })
        setResults(await res.json())
      } catch (e) {
        if (!controller.signal.aborted) throw e    // ignore abort errors
      }
    }, 300)
    return () => { clearTimeout(timer); controller.abort() }  // cleanup both
  }, [query])
}
```
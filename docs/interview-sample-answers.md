# Interview Sample Answers

Use this after you attempt the questions in [./interview-questions.md](./interview-questions.md) yourself.

These are intentionally short. They are meant to model a solid interview answer shape, not to replace reading the linked repo files.

## React Answers

### How would you explain the difference between `useActionState` and `useOptimistic`?

`useActionState` owns the real async submission flow. It gives you the authoritative success or error result after the action finishes. `useOptimistic` is different: it lets the UI temporarily show the likely next state before the server or async work confirms it. In [../src/App.tsx](../src/App.tsx), they work together because the task appears optimistically first, then the real action reconciles the final saved state.

```tsx
const [submissionState, submitTask, isSubmitting] = useActionState(handleSubmit, initialState)
const [optimisticTasks, addOptimisticTask] = useOptimistic(tasks, (current, draft) => [createTask(draft, true), ...current])
```

### When would you choose `useState` instead of `useReducer`?

I would use `useState` when updates are small and direct, like toggles, input text, or one-off local values. I switch to `useReducer` when state transitions are easier to describe as domain actions and several updates affect one shared model. You can see that contrast between the lighter local state in [../src/App.tsx](../src/App.tsx) and the action-driven structure in [../src/samples/ReducerBoardSample.tsx](../src/samples/ReducerBoardSample.tsx).

```tsx
const [state, dispatch] = useReducer(boardReducer, undefined, createBoardState)
```

### Why is `key={index}` dangerous?

React uses keys to decide which child keeps which identity across renders. If the key is just the array index, state follows position rather than the actual item, so reorders can attach the wrong state to the wrong row. [../src/samples/KeyIdentitySample.tsx](../src/samples/KeyIdentitySample.tsx) is a good example because it shows why stable ids preserve the intended ownership.

```tsx
<TaskRow key={task.id} task={task} />          // ✅ stable id
<TaskRow key={index} task={task} />            // ❌ index key breaks on reorder
```

### When do `memo`, `useMemo`, and `useCallback` actually help?

They help only when there is a real memoization boundary to benefit from stable values. `memo` skips a component render when props are unchanged, `useMemo` caches a computed value, and `useCallback` stabilizes a function identity for code that depends on referential equality. In [../src/samples/MemoLabSample.tsx](../src/samples/MemoLabSample.tsx) and [../src/samples/ContextIdentitySample.tsx](../src/samples/ContextIdentitySample.tsx), the useful question is not “can I memoize this?” but “what expensive or identity-sensitive work am I actually avoiding?”
```tsx
const MemoCard = memo(function MemoCard({ member }: Props) { ... })
const roster = useMemo(() => filterRoster(members, query), [members, query])
```
### What is the difference between `Suspense` and an Error Boundary?

`Suspense` handles waiting, not failure. If a component suspends on a pending resource or lazy import, `Suspense` shows a fallback until that wait resolves. If rendering throws an actual error, you need an Error Boundary to catch it, which is why [../src/samples/ErrorBoundarySample.tsx](../src/samples/ErrorBoundarySample.tsx) separates loading behavior from failure behavior.

```tsx
<Suspense fallback={<Spinner />}><SampleErrorBoundary><LazyComponent /></SampleErrorBoundary></Suspense>
```

### How would you explain `useDeferredValue` vs `useTransition`?

`useTransition` changes how I schedule an update: I mark some work as non-urgent so urgent UI like typing can stay responsive. `useDeferredValue` changes how I consume a value: I let derived work lag behind a more urgent source value. In [../src/App.tsx](../src/App.tsx), that means category changes can be transitioned while fast search input can feed a deferred query.

```tsx
const deferredQuery = useDeferredValue(query)
const [isPending, startTransition] = useTransition()
```

### What causes a stale closure in React, and how do you fix it?

The bug happens when a function created during one render runs later and still reads the state from that older render. Timers, intervals, and promise callbacks are where this usually shows up. In [../src/samples/StaleClosureSample.tsx](../src/samples/StaleClosureSample.tsx), the fix is either a functional updater when the next state depends on previous state, or a ref when delayed code needs the latest current value.

```tsx
setCount((c) => c + 1)  // functional updater reads latest state
```

### When would you choose `useLayoutEffect` or `useInsertionEffect` over `useEffect`?

`useEffect` is the default because it runs after paint and is the right place for subscriptions and async side effects. I reach for `useLayoutEffect` only when DOM measurement or mutation must happen before paint to avoid visible flicker. `useInsertionEffect` is narrower still: it exists for style injection that must happen before layout work, which [../src/samples/LayoutEffectsSample.tsx](../src/samples/LayoutEffectsSample.tsx) demonstrates clearly.

```tsx
useLayoutEffect(() => { applyMarker(ref.current, readSnapshot(stripRef.current)) }, [activeId])
```

### Why is `ref.current` unavailable during render, and when do callback refs help?

Refs are populated during commit, so reading `ref.current` during render is too early. A normal object ref is good when I need a persistent mutable handle after mount. A callback ref is useful when I need to react right when a node appears or disappears, such as measuring it immediately or integrating imperative code, which is what [../src/samples/RefTimingSample.tsx](../src/samples/RefTimingSample.tsx) shows.

```tsx
const handleRef = useCallback((node: HTMLDivElement | null) => { if (node) measureNode(node) }, [])
```

### How does `use()` with `Suspense` differ from manual loading state?

With `use()`, render reads a promise directly and React suspends that subtree until the promise resolves. That means the loading UI is owned by the nearest `Suspense` boundary instead of by local `isLoading` branches. [../src/samples/UseResourceSample.tsx](../src/samples/UseResourceSample.tsx) also shows the important cache rule: if each render creates a new pending promise, the boundary never settles cleanly.

```tsx
const brief = use(resourcePromise)  // suspends until promise resolves
```

### How does Context prevent or cause unnecessary re-renders?

Every context consumer re-renders whenever the provider value changes identity. If the provider creates a new object on each render, every consumer re-renders even when the meaningful data has not changed. Stabilizing the value with `useMemo` in [../src/samples/ContextIdentitySample.tsx](../src/samples/ContextIdentitySample.tsx) prevents those wasted renders, and splitting contexts by update frequency can isolate the damage further as shown in [../src/samples/ContextThemeSample.tsx](../src/samples/ContextThemeSample.tsx).

```tsx
const value = useMemo<ThemeValue>(() => ({ palette, togglePalette }), [palette, togglePalette])
```

### What is `createPortal` for, and when does `flushSync` matter?

`createPortal` renders children into a DOM node that lives outside the parent tree. This is important for modals and overlays because it avoids inheriting stacking contexts or overflow clipping from ancestors. `flushSync` forces React to commit a state update synchronously so an imperative DOM read immediately after sees the new value. [../src/samples/PortalModalSample.tsx](../src/samples/PortalModalSample.tsx) demonstrates both patterns together.

```tsx
return createPortal(<ModalContent />, document.getElementById('modal-root')!)
flushSync(() => { setToasts((current) => [...current, createToast('sync', msg)]) })
```

### How do you handle race conditions in debounced async effects?

The cleanup function returned from `useEffect` is the primary tool because it fires when the query changes. Combined with `AbortController`, it cancels in-flight requests so stale responses cannot overwrite the current result. Without cleanup, a slow response from an older query can silently land after a newer one has already resolved. [../src/samples/DebouncedSearchRaceSample.tsx](../src/samples/DebouncedSearchRaceSample.tsx) walks through the full pattern.

```tsx
useEffect(() => { const ctrl = new AbortController(); fetch(url, { signal: ctrl.signal }); return () => ctrl.abort() }, [url])
```

### How does `useFormStatus` avoid prop-drilling pending state?

`useFormStatus` reads the pending state of the nearest enclosing `<form>` from any descendant, so a submit button deep in the tree can know whether the action is still running without receiving any props. This removes the need to lift state up to the form shell and thread it down. [../src/samples/FormStatusSample.tsx](../src/samples/FormStatusSample.tsx) shows the pattern clearly.

```tsx
const { pending, data, method } = useFormStatus()
```

### What is the `Activity` component and when would you use it?

`Activity` controls visibility of a subtree. When mode is `"hidden"`, the subtree stops painting and laying out, but React keeps its state alive so revealing it again is instant. It is useful for tabs, priority dashboards, and off-screen content. [../src/samples/ActivityTransitionSample.tsx](../src/samples/ActivityTransitionSample.tsx) also shows how `startTransition` pairs with `Activity` to keep non-urgent state changes smooth.

```tsx
<Activity key={region.id} mode={isActive ? "visible" : "hidden"}><Panel /></Activity>
```

### When would you use `useSyncExternalStore` instead of `useState`?

I would use it when the state lives outside React, like browser online status, color scheme preferences, or a shared module-level store. It requires a `subscribe` function, a `getSnapshot` function, and optionally `getServerSnapshot` for SSR safety. [../src/releaseStore.ts](../src/releaseStore.ts) shows the full subscribe-notify-snapshot contract and how it avoids tearing during concurrent renders.

```tsx
const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
```

### What does `useEffectEvent` solve that `useEffect` alone cannot?

It lets a long-lived effect read the latest props or state without re-subscribing. In [../src/App.tsx](../src/App.tsx), the keyboard shortcut effect has an empty dependency list for stability, but the event function inside reads the latest selected feature because `useEffectEvent` always runs with fresh values. Without it, the effect would have to include the feature in its deps and restart on every change.

```tsx
const onKey = useEffectEvent(() => { handleShortcut(selectedFeature) })
```

### What does the React Compiler do, and how do its directives work?

The compiler inserts memoization automatically at build time so you can drop manual `useMemo` and `useCallback` calls. `"use memo"` opts a component in and `"use no memo"` opts it out when the compiler gets a case wrong. [../src/samples/ReactCompilerDemo.ts](../src/samples/ReactCompilerDemo.ts) documents the before/after shape, and [../node-samples/react-compiler/src/reportCompilerDirectives.ts](../node-samples/react-compiler/src/reportCompilerDirectives.ts) verifies directive boundaries.

```tsx
function OptimizedDashboard({ data }: Props) { "use memo"; return <Chart data={data} /> }
```

### What are the key React ESLint rules you should never disable?

`exhaustive-deps` prevents stale closure bugs by keeping dependency arrays honest. `rules-of-hooks` prevents hooks from being called conditionally or inside loops. Stable references like `setState` and `dispatch` from `useReducer` are guaranteed stable and do not need to be in deps. [../src/samples/ReactLintRulesDemo.ts](../src/samples/ReactLintRulesDemo.ts) and the [../node-samples/react-lint-rules/](../node-samples/react-lint-rules/) workspace verify these rules against fixture code.

```tsx
useEffect(() => { fetchUser(userId).then(setData) }, [userId])  // ✅ all deps listed
```

### How do `'use client'` and `'use server'` directives define component boundaries?

In an RSC-aware framework, files without a directive are server components by default. `'use client'` at the top of a file marks everything in it as client-side, allowing hooks and browser events. `'use server'` marks exported functions as server actions that the client can call through the framework's transport. [../src/samples/ServerComponentsDemo.ts](../src/samples/ServerComponentsDemo.ts) and [../node-samples/react-server-components/](../node-samples/react-server-components/) cover both boundaries.

```tsx
'use client'  // top of file — marks this module as a client boundary
'use server'  // top of function body — marks a server action
```

### How does `lazy()` with `Suspense` implement code splitting?

`lazy()` wraps `import()` so the chunk is fetched only when the component is first rendered. `Suspense` shows a fallback while the chunk is in flight. An Error Boundary is still needed because a failed import throws an error, not a pending promise. [../src/App.tsx](../src/App.tsx) uses `lazy()` for the `TypeNotes` panel.

```tsx
const TypeNotes = lazy(() => import('./components/TypeNotes'))
```

### How would you build an accessible modal dialog in React?

Label the dialog with `aria-labelledby` and `aria-describedby`. On open, move focus into the dialog and trap Tab so it cycles only through the dialog's controls. On Escape or close, return focus to the trigger button. [../src/samples/AccessibleDialogSample.tsx](../src/samples/AccessibleDialogSample.tsx) implements the full pattern with a query selector for focusable elements and keyboard event handling.

```tsx
<div role="dialog" aria-labelledby={titleId} aria-describedby={descId}>
```

### What does an accessible custom listbox require?

Use `role="listbox"` and `role="option"` with `aria-activedescendant` to keep the screen reader aligned with the visually active option. Arrow keys, Home, and End navigate through options, and Enter or Space selects. All of this must work without a pointer. [../src/samples/AccessibleListboxSample.tsx](../src/samples/AccessibleListboxSample.tsx) implements these patterns with key handlers and state management.

```tsx
<ul role="listbox" aria-activedescendant={optionIds[activeIndex]}>
  <li role="option" id={optionIds[0]}>Option A</li>
</ul>
```

### How should form validation errors be announced to screen readers?

Each invalid field should have `aria-invalid="true"` and `aria-describedby` pointing at its specific error message. A summary with `role="alert"` announces the failure immediately when the form is submitted. On submit failure, focus should move to the first invalid field. [../src/samples/AccessibleFormErrorsSample.tsx](../src/samples/AccessibleFormErrorsSample.tsx) shows all three pieces together.

```tsx
<input aria-invalid={errors.email ? "true" : undefined} aria-describedby={errors.email ? errorId : hintId} />
```

### How do you test async UI behavior deterministically?

Use fake timers and mocked responses so the test controls timing completely. Assert intermediate states like the loading indicator before advancing timers. Then exercise both the success and failure paths, including retry. [../src/samples/AsyncUiVerificationSample.tsx](../src/samples/AsyncUiVerificationSample.tsx) and [../src/test/async-ui-verification-sample.test.tsx](../src/test/async-ui-verification-sample.test.tsx) demonstrate this strategy.

```tsx
vi.useFakeTimers(); await act(() => { vi.advanceTimersByTime(180) }); expect(screen.getByRole('region')).toBeTruthy()
```

### How would you build a type-safe generic React component?

Define a constraint interface with the minimum required fields and use `T extends Constraint` as the generic parameter. The component accesses only the constraint fields, while callers pass their richer type through. A `renderMeta` callback lets the component stay reusable because each caller decides what extra detail to show. [../src/components/FeatureGrid.tsx](../src/components/FeatureGrid.tsx) uses this exact pattern.

```tsx
export function FeatureGrid<T extends SelectableFeature>({ items, onSelect, renderMeta }: FeatureGridProps<T>) { ... }
```

### When would you use `useImperativeHandle` with ref-as-prop?

When I want to expose a small imperative API like `focus()` or `load()` to the parent instead of handing over the raw DOM node. React 19 lets ref be a regular prop so `forwardRef` is no longer needed. The dependency array on `useImperativeHandle` must include any closed-over state that the exposed methods read, or callers get stale values. [../src/components/CommandPalette.tsx](../src/components/CommandPalette.tsx) and [../src/samples/RefTimingSample.tsx](../src/samples/RefTimingSample.tsx) both demonstrate this.

```tsx
useImperativeHandle(ref, () => ({ focus() { inputRef.current?.focus() }, load(v) { ... } }), [])
```

### What pattern do the feature panels use for domain state management?

Each panel extracts domain logic into a custom hook that owns loading, draft, and submit state. The panel component receives the hook's return value and stays purely declarative. Discriminated unions or status strings keep the state machine explicit instead of using multiple booleans. [../src/features/release-approval-workflow/ReleaseApprovalWorkflowPanel.tsx](../src/features/release-approval-workflow/ReleaseApprovalWorkflowPanel.tsx) is a representative example.

```tsx
const { draft, status, submit, resetDraft } = useReleaseApprovalWorkflow()
```

### What component composition patterns does React favor over inheritance?

React favors composition over inheritance. The `children` prop is the simplest form: a layout component renders whatever the parent passes without knowing the content. Render props and generic callback props like the `renderMeta` prop in [../src/components/FeatureGrid.tsx](../src/components/FeatureGrid.tsx) let customers inject behavior without modifying the component. [../src/samples/ContextThemeSample.tsx](../src/samples/ContextThemeSample.tsx) shows provider composition where theme and feature-flag providers wrap children without coupling to each other.

```tsx
<FeatureGrid items={features} renderMeta={(f) => <span>{f.status}</span>} />
```

### How do custom hooks extract and reuse stateful logic across components?

A custom hook is a regular function starting with `use` that encapsulates hooks, effects, and derived state. The component that calls it stays declarative because it only receives the return value. In [../src/features/release-approval-workflow/useReleaseApprovalWorkflow.ts](../src/features/release-approval-workflow/useReleaseApprovalWorkflow.ts), the hook owns fetch lifecycle, abort cleanup, draft state, and submission flow. The panel component does not manage any of that logic itself. [../src/samples/DebouncedSearchRaceSample.tsx](../src/samples/DebouncedSearchRaceSample.tsx) shows the same pattern for debounced search with `AbortController`.

```tsx
const { draft, status, submit } = useReleaseApprovalWorkflow()
```

### How do you decide where state should live — local, lifted, context, or external store?

I colocate state as close to its consumer as possible. If siblings need the same value, I lift it to their common parent. If deeply nested components need infrequently changing data like theme tokens or auth, I use context as in [../src/samples/ContextThemeSample.tsx](../src/samples/ContextThemeSample.tsx). If state must be read from outside React or shared across unrelated subtrees, I use an external store with `useSyncExternalStore` like [../src/releaseStore.ts](../src/releaseStore.ts). The feature panels in [../src/features/release-approval-workflow/useReleaseApprovalWorkflow.ts](../src/features/release-approval-workflow/useReleaseApprovalWorkflow.ts) show the middle ground: a custom hook colocates complex state within the feature boundary without globalizing it.

```tsx
const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)  // external store
```

### How does the React Profiler API help identify render bottlenecks?

The `<Profiler>` component wraps a subtree and fires a callback on each commit with `actualDuration` (time spent rendering) and `baseDuration` (estimated cost without memoization). Comparing the two reveals how much memoization is saving. In [../src/samples/MemoLabSample.tsx](../src/samples/MemoLabSample.tsx), the Profiler logs show that `memo` on the member card skips renders when props are stable, and `useMemo` avoids recomputing the expensive roster filter. `useDebugValue` labels the custom hook in DevTools so you can trace which hook is contributing to slow commits.

```tsx
<Profiler id="memo-stage" onRender={handleProfilerRender}><RosterPanel /></Profiler>
```

### What composition techniques reduce re-renders without adding memoization?

Three techniques help before reaching for `memo` or `useMemo`. First, move state down so only the component that owns it re-renders. Second, pass expensive subtrees as `children` so the parent can re-render without recreating the child tree. Third, split context providers by update frequency so fast-changing data like input text does not re-render slow consumers like theme. [../src/samples/ContextThemeSample.tsx](../src/samples/ContextThemeSample.tsx) splits theme from feature flags, and [../src/samples/ContextIdentitySample.tsx](../src/samples/ContextIdentitySample.tsx) shows how stabilizing a provider value prevents consumer cascades.

```tsx
<ThemeProvider><FeatureFlagsProvider>{children}</FeatureFlagsProvider></ThemeProvider>
```

### How would you contribute to a shared design system or component library in React?

Design system components should be generic, accessible, and composable. Accessibility comes first: keyboard navigation, focus management, and ARIA attributes should be baked in. [../src/samples/AccessibleDialogSample.tsx](../src/samples/AccessibleDialogSample.tsx) shows a modal with focus trapping and Escape handling, and [../src/samples/AccessibleListboxSample.tsx](../src/samples/AccessibleListboxSample.tsx) shows a keyboard-navigable listbox with `aria-activedescendant`. Consistent design tokens from a shared context like [../src/samples/ContextThemeSample.tsx](../src/samples/ContextThemeSample.tsx) keep colors, spacing, and typography unified. Components should expose props and children for customization rather than flags for every variation.

```tsx
const ThemeContext = createContext<ThemeContextValue | null>(null)
const FeatureFlagsContext = createContext<FeatureFlagsContextValue | null>(null)
```

### How would you handle controlled forms at scale without performance issues?

The key is isolating re-renders per field. Each input should live in its own component so a keystroke only re-renders that field, not the entire form. Validation and submission logic can live in a custom hook or the form parent, while field components stay lightweight. For form-level pending state, `useFormStatus` as in [../src/samples/FormStatusSample.tsx](../src/samples/FormStatusSample.tsx) avoids prop-drilling an `isSubmitting` flag to every button. [../src/samples/AccessibleFormErrorsSample.tsx](../src/samples/AccessibleFormErrorsSample.tsx) shows how to pair this with accessible error announcements so screen readers know which fields need attention.

```tsx
const { pending } = useFormStatus()  // reads form pending state without props
```

## TypeScript Answers

### When would you use `satisfies` instead of `as`?

I use `satisfies` when I want TypeScript to verify that a value matches a required shape without widening away its useful literal inference. I reserve `as` for cases where runtime knowledge exists but the compiler cannot prove it. In config-heavy code like [../src/catalog.ts](../src/catalog.ts) and [../src/samples/UtilityMappedSample.tsx](../src/samples/UtilityMappedSample.tsx), `as const satisfies` is usually the safer and more expressive choice.

```ts
export const taskLanes = ['UI', 'Data', 'Performance'] as const satisfies readonly TaskLane[]
```

### How would you explain `type` vs `interface`?

I use `interface` for extendable object contracts and `type` for unions, mapped types, conditional types, template literal types, and aliases over non-object shapes. Both can model plain objects, so the real decision is whether I need the extra expressiveness of type aliases or the extension-oriented ergonomics of interfaces. This repo uses both that way in [../src/catalog.ts](../src/catalog.ts) and [./typescript-terms.md](./typescript-terms.md).

```ts
interface Feature { id: string; title: string }      // extendable contract
type Status = 'draft' | 'ready' | 'blocked'          // union alias
```

### What is the difference between `field?: T` and `field: T | undefined`?

`field?: T` means the property can be omitted entirely. `field: T | undefined` means the property must exist, but its value may be `undefined`. That difference matters more when strict config flags are enabled, which is why [./typescript-terms.md](./typescript-terms.md) and [../node-samples/ts-advanced-tsconfig/src/index.ts](../node-samples/ts-advanced-tsconfig/src/index.ts) are good places to anchor the explanation.

```ts
interface A { field?: string }            // { } is valid
interface B { field: string | undefined } // { field: undefined } required
```

### Why would you use `K extends string` in a generic helper?

That constraint keeps the generic in the string-literal world instead of widening the signature to an arbitrary string too early. It lets the helper preserve exact literals through the return type, which is often the whole point of the abstraction. [../node-samples/ts-generic-inference/src/index.ts](../node-samples/ts-generic-inference/src/index.ts) shows how these constraints protect inference quality.

```ts
function createPair<K extends string, V>(key: K, value: V): { key: K; value: V }
```

### How do distributive conditional types work, and how do you turn distribution off?

If a conditional type receives a union through a naked type parameter, TypeScript evaluates the condition for each union member separately. That is why utilities like `Extract` and `Exclude` behave member by member. If I want to stop that and test the union as one whole type, I wrap it, for example with `[T] extends [U]`, exactly like [../src/samples/ConditionalDistributivitySample.tsx](../src/samples/ConditionalDistributivitySample.tsx) demonstrates.

```ts
type IsString<T> = T extends string ? 'yes' : 'no'  // distributes over unions
```

### What does `infer` actually buy you in utility types?

`infer` lets a conditional type capture part of another type instead of forcing me to rebuild that structure manually. That is how helpers like `ReturnType`, promise unwrapping, or element extraction work. In [../src/samples/ConditionalDistributivitySample.tsx](../src/samples/ConditionalDistributivitySample.tsx) and [../src/samples/UtilityMappedSample.tsx](../src/samples/UtilityMappedSample.tsx), the benefit is that the derived type stays coupled to the source signature rather than drifting into a copy.

```ts
type FirstArg<T> = T extends (input: infer I, ...args: never[]) => unknown ? I : never
```

### When are overloads better than a union parameter?

I prefer overloads when different call shapes should produce meaningfully different typing rules or return types. If the implementation and the return type are uniform, a union parameter is usually simpler. [../src/samples/FunctionsTuplesSample.tsx](../src/samples/FunctionsTuplesSample.tsx) and [../node-samples/ts-generic-inference/src/index.ts](../node-samples/ts-generic-inference/src/index.ts) also show the key caveat: overload order matters because TypeScript picks the first compatible signature.

```ts
function parse(input: string): JsonValue
function parse(input: Buffer): JsonValue
```

### Why are labeled tuples useful instead of a plain array type?

Tuples preserve fixed length and positional meaning, while labeled tuples also document what each slot represents. That makes them useful for protocol-like data or argument spreading where position is part of the contract. [../src/samples/FunctionsTuplesSample.tsx](../src/samples/FunctionsTuplesSample.tsx) uses them well because method, path, and retries are not just “some array items.”
```ts
type CommandTuple = readonly [method: CommandMethod, path: CommandPath, retries: number]
```
### What is the difference between TypeScript `private` and JavaScript `#private`?

TypeScript `private` is enforced by the type checker but erased at runtime, so it is not true encapsulation. JavaScript `#private` is enforced by the runtime and cannot be accessed from outside through bracket notation or casts. [../src/samples/PrivateFieldsSample.tsx](../src/samples/PrivateFieldsSample.tsx) is a strong interview example because it makes the runtime difference visible instead of treating privacy as just syntax.

```ts
class Vault { #secret = 'hidden'; getSecret() { return this.#secret } }
```

### When are template literal types powerful, and when do they become a problem?

They are powerful when I want to derive string APIs, route params, handler names, or naming conventions from smaller literal building blocks. They become a problem when large cartesian products create huge unions that slow the checker or hit complexity limits. [../node-samples/ts-template-literals/src/index.ts](../node-samples/ts-template-literals/src/index.ts) shows both the expressive side and the performance cost.

```ts
type ColorSize = `${Color}-${Size}`  // e.g. 'red-sm' | 'red-md' | ...
```

### How do mapped types filter or rename keys with the `as` clause?

The `as` clause in a mapped type lets you transform or filter keys. Mapping a key to `never` removes it, so `PickByType<T, string>` keeps only string-valued properties. Template literal types in the `as` clause rename keys to follow patterns like `getName`. [../src/samples/MappedFilteringSample.tsx](../src/samples/MappedFilteringSample.tsx) demonstrates both key removal and key renaming patterns.

```ts
type PickByType<T, V> = { [K in keyof T as T[K] extends V ? K : never]: T[K] }
```

### How do you type API responses so loading, error, and success states are mutually exclusive?

I define a discriminated union keyed on a `status` field. The `loading` variant carries no data, `error` carries a message, and `success` carries the typed payload. This makes it impossible to access `data` when the request is still loading. In [../src/features/release-approval-workflow/useReleaseApprovalWorkflow.ts](../src/features/release-approval-workflow/useReleaseApprovalWorkflow.ts), the hook uses `RequestStatus` and `SubmitStatus` string unions so the panel can branch on status without guessing whether data exists. [../src/samples/AsyncUiVerificationSample.tsx](../src/samples/AsyncUiVerificationSample.tsx) shows a simpler `AsyncStatus` union that drives loading, success, and error rendering paths.

```ts
type Result = { status: 'loading' } | { status: 'error'; message: string } | { status: 'success'; data: T }
```

### How do type guards safely narrow unknown data at runtime boundaries?

A type guard is a function with a return type like `value is SomeType`. After a truthy check, TypeScript narrows the variable inside the guarded branch. At API boundaries where data arrives as `unknown`, this is the safe way to assert shape before using it. In [../src/features/release-approval-workflow/client.ts](../src/features/release-approval-workflow/client.ts), `isReleaseApprovalAbortError` and `isReleaseApprovalMutationError` are type guards that narrow `unknown` catch values into specific error shapes. Simpler guards use `typeof`, `in`, or discriminant-field checks as shown in [../src/samples/ConditionalDistributivitySample.tsx](../src/samples/ConditionalDistributivitySample.tsx).

```ts
function isMutationError(e: unknown): e is MutationError { return e instanceof MutationError }
```

### How would you type a generic data-fetching hook that preserves the response shape?

The hook should be generic over the response type `T` so callers get a typed `data: T` in the return value. The return type should be a discriminated union or status-driven object so callers cannot access `data` before it exists. `AbortController` should be part of the hook contract so effect cleanup cancels in-flight requests. [../src/features/release-approval-workflow/useReleaseApprovalWorkflow.ts](../src/features/release-approval-workflow/useReleaseApprovalWorkflow.ts) shows a concrete non-generic version of this pattern, and [../src/samples/DebouncedSearchRaceSample.tsx](../src/samples/DebouncedSearchRaceSample.tsx) shows the abort cleanup side. Making it generic means replacing the concrete response type with `T` while keeping the status union intact.

```tsx
function useFetch<T>(url: string): { status: 'loading' } | { status: 'success'; data: T }
```

### How do branded types prevent accidental mixing of structurally identical primitives?

Branded types add a phantom property that makes two structurally identical types incompatible. Template literal types like `release-${number}` in [../src/features/release-approval-workflow/types.ts](../src/features/release-approval-workflow/types.ts) achieve this naturally: a `ReleaseApprovalId` is `release-${number}` and a `BoardTaskId` in [../src/samples/ReducerBoardSample.tsx](../src/samples/ReducerBoardSample.tsx) is `board-task-${number}`, so passing one where the other is expected is a compile error even though both are strings. For cases where template literals do not fit, a `__brand` phantom field serves the same purpose.

```ts
type ReleaseId = `release-${number}`  // 'release-42' ok, plain string rejected
```

### When would you model domain objects with classes instead of plain interfaces?

I would use classes when I need runtime behavior, encapsulation, and `instanceof` narrowing. Abstract classes are useful for enforcing a subclass contract while sharing common logic. For pure data composition without runtime behavior, intersection types compose interfaces. [../src/samples/ClassesModelsSample.tsx](../src/samples/ClassesModelsSample.tsx) shows both the abstract class hierarchy and the intersection-based view model.

```ts
abstract class ReleasePlugin { abstract readonly cadence: string; abstract run(): PluginRunResult }
```

### How do recursive types model tree-shaped data, and what are their limits?

A recursive interface references itself in a child property, allowing TypeScript to describe trees of arbitrary depth. Utility types like `DeepReadonly` and `DeepKeyPaths` recur over every level. The main limit is the compiler's recursion depth, and very deep `as const` trees can exceed inference bounds. [../src/samples/RecursiveTypesSample.tsx](../src/samples/RecursiveTypesSample.tsx) shows both the type definitions and the matching recursive runtime helpers.

```ts
interface OrgNode { id: string; name: string; children: readonly OrgNode[] }
```

### What is type variance, and when do `in`, `out`, and `in out` annotations matter?

Covariance means a more specific type can substitute in output position: `Producer<Cat>` is assignable to `Producer<Animal>`. Contravariance reverses this for input position: `Consumer<Animal>` is assignable to `Consumer<Cat>`. Explicit `in` and `out` annotations document and enforce these rules, catching unsound assignments faster. [../node-samples/ts-variance/src/index.ts](../node-samples/ts-variance/src/index.ts) walks through all three variance modes.

```ts
interface Producer<out T> { produce(): T }
interface Consumer<in T> { consume(item: T): void }
```

### When are enums appropriate, and when should you use union types instead?

Enums produce a runtime object and support reverse mapping, which matters when the value set must exist at runtime. Union types are lighter because they are erased. `const enum` inlines values at compile time but has restrictions with `isolatedModules` and `verbatimModuleSyntax`. [../node-samples/ts-advanced-runtime/src/index.ts](../node-samples/ts-advanced-runtime/src/index.ts) covers numeric enums, string enums, and const enums side by side.

```ts
enum DeployStage { Build = 0, Test = 1, Staging = 2, Production = 3 }
```

### How do you type an untyped JavaScript module with `.d.ts` files?

Create a `.d.ts` file alongside the JS module that declares the exported types. For global types, use declaration merging. For additional type files, use triple-slash references. This gives full type safety without touching the vendor source. [../node-samples/ts-declarations/src/index.ts](../node-samples/ts-declarations/src/index.ts) imports from a plain JS vendor module using this approach.

```ts
import { createReleaseSession, type ReleaseConfig } from '../vendor/legacy-release-kit.js'
```

### How does JSDoc typing work with `allowJs` and `checkJs`?

`allowJs` lets TypeScript compile `.js` files and `checkJs` turns on type checking for them. JSDoc annotations like `@param`, `@returns`, and `@typedef` provide the type information inside the JS file. A TypeScript file can import the JS module and get full type safety without a `.d.ts` file. [../node-samples/ts-jsdoc-interop/src/index.ts](../node-samples/ts-jsdoc-interop/src/index.ts) demonstrates this interop.

```ts
const { jsdocOutput, formatVersion } = require('./release-notes.js') as typeof import('./release-notes.js')
```

### What does `NoInfer<T>` do, and when is it useful?

`NoInfer<T>` prevents TypeScript from inferring a type parameter from a specific argument position. This forces inference to come from the other call site, so the second argument must match rather than widen. It solves inference-site conflicts without requiring explicit type parameters from the caller. [../node-samples/ts-generic-inference/src/index.ts](../node-samples/ts-generic-inference/src/index.ts) uses it to prevent the second array argument from widening T.

```ts
function mergeStrict<T>(a: readonly T[], b: readonly NoInfer<T>[]): T[]
```

## Architecture And Debugging Answers

### How is the sample system organized so UI, routing, and tests do not drift apart?

The core idea is that the catalog is the source of truth. Routing resolves sample ids from that same metadata, rendering uses the same ids to find component implementations, and tests verify that implemented entries really map to either a component or an artifact. You can trace that contract across [../src/sampleCatalog.ts](../src/sampleCatalog.ts), [../src/sampleRuntime.ts](../src/sampleRuntime.ts), [../src/sampleImplementations.ts](../src/sampleImplementations.ts), and [../src/implementedSampleArtifacts.ts](../src/implementedSampleArtifacts.ts).

```ts
export const sampleImplementations: Partial<Record<MiniSampleId, ComponentType>> = { 'sample-react-activity-transition': ActivityTransitionSample }
```

### Why does this repo split samples across current-app, isolated-route, separate-entry, and node-only surfaces?

Those are execution contracts, not presentation labels. Some samples can live inside the main app, some need a dedicated routed component, some require their own HTML entry because they depend on true hydration behavior, and some only make sense as standalone TypeScript workspaces. [../src/sampleCatalog.ts](../src/sampleCatalog.ts) and [../src/implementedSampleArtifacts.ts](../src/implementedSampleArtifacts.ts) make that boundary explicit instead of pretending every example can be rendered the same way.

```ts
{ id: 'sample-react-hydration-hints', surface: 'separate-entry', entryHtml: 'hydration.html' }
```

### What would you inspect first if the selected sample does not match the URL hash?

I would start at the routing boundary rather than the visible component tree. First I would verify slug creation, hash parsing, and fallback logic in [../src/sampleRuntime.ts](../src/sampleRuntime.ts). After that I would confirm the resolved id exists in [../src/sampleCatalog.ts](../src/sampleCatalog.ts) and actually maps to a component or artifact in [../src/sampleImplementations.ts](../src/sampleImplementations.ts).

```ts
const id = readSampleIdFromHash(window.location.hash)  // returns MiniSampleId | null
```

### How do the tests prove an implemented sample is actually real?

They check the proof appropriate to each sample surface. Route-backed samples must render through the stage, while artifact-backed samples must have concrete entries that point to their files and verification commands. [../src/test/samples.test.tsx](../src/test/samples.test.tsx) is strong because it verifies the coverage contract instead of only testing a few happy-path components.

```ts
expect(sampleImplementations[id] || implementedSampleArtifacts[id]).toBeTruthy()
```

### How would you explain verifying async UI behavior instead of only asserting the final state?

I would say the important thing is to prove the transitions the user experiences, not just the end result. That means controlling time and mock outcomes so loading, failure, and retry states can all be observed deterministically. [../src/test/async-ui-verification-sample.test.tsx](../src/test/async-ui-verification-sample.test.tsx) is a good example because it asserts the intermediate states explicitly.

```ts
vi.useFakeTimers(); vi.advanceTimersByTime(100); expect(screen.getByText('Loading...')).toBeTruthy()
```

### How would you explain a hydration mismatch in an interview?

It means the client tried to hydrate markup that does not match what the server originally rendered for the same tree. React warns because hydration expects to attach behavior onto matching HTML, not replace unexpectedly different output. In this repo, [../src/samples/HydrationMismatchDemo.ts](../src/samples/HydrationMismatchDemo.ts) and [../src/hydration/HydrationHintsApp.tsx](../src/hydration/HydrationHintsApp.tsx) help anchor common causes like time-based values, random output, and environment-only branching.

```tsx
hydrateRoot(container, <HydrationHintsApp />, hydrationOptions)
```

### Why are the hydration examples separate entry points instead of ordinary routed components?

Real hydration starts with existing server-rendered HTML already in the document before the client code runs. A normal SPA route would only show a fresh client mount, which misses the actual hydration contract. That is why [../src/hydration/HydrationHintsApp.tsx](../src/hydration/HydrationHintsApp.tsx) is paired with artifact metadata in [../src/implementedSampleArtifacts.ts](../src/implementedSampleArtifacts.ts) instead of being treated like an ordinary route sample.

```ts
{ entryHtml: 'hydration.html', entryPoint: 'src/hydration/main.tsx', launchPath: '/hydration.html' }
```

### How does the streaming SSR workspace compare different server rendering modes?

It runs `renderToString`, `renderToPipeableStream`, `prerender`, `resume`, and other APIs against the same component tree. Each mode produces a summary that shows whether Suspense fallbacks or resolved content appear in the output. This helps you choose the right rendering mode based on your latency and SEO needs. [../server-samples/react-streaming-ssr/src/runAllModes.tsx](../server-samples/react-streaming-ssr/src/runAllModes.tsx) is the entry point.

```ts
import { renderToString, renderToPipeableStream, resume } from 'react-dom/server.node'
```

### What does dynamic component resolution look like in the sample stage?

The stage reads the current URL hash, resolves a catalog id, and looks up either a component or an artifact entry. If a component exists it renders inline, if an artifact exists it shows the entry details, and otherwise it shows a placeholder. This centralizes routing, rendering, and fallback logic in one component. [../src/components/MiniSampleStage.tsx](../src/components/MiniSampleStage.tsx) shows the resolution chain.

```tsx
const Impl = sampleImplementations[activeSample.id]; return Impl ? <Impl /> : <Placeholder />
```

### How would you debug a child component that re-renders more than expected?

I would check prop identity first. New objects or functions created every render break `memo` boundaries. Then I would check context provider values because unstable provider objects force every consumer to re-render. The React Profiler or `useDebugValue` can confirm which renders and effects actually run. [../src/samples/MemoLabSample.tsx](../src/samples/MemoLabSample.tsx) and [../src/samples/ContextIdentitySample.tsx](../src/samples/ContextIdentitySample.tsx) demonstrate these patterns.

```tsx
const value = useMemo(() => ({ palette, toggle }), [palette, toggle])  // stabilize provider value
```

### How would you debug slow typing or filtering in a search UI?

First I would decide whether the bottleneck is expensive derived computation, unnecessary re-renders, or lack of scheduling. `useDeferredValue` lets derived work lag behind urgent input so keystrokes stay responsive. Debouncing the network request prevents flooding, and `AbortController` cancels stale requests before they resolve. [../src/App.tsx](../src/App.tsx) and [../src/samples/DebouncedSearchRaceSample.tsx](../src/samples/DebouncedSearchRaceSample.tsx) cover both approaches.

```tsx
const deferredQuery = useDeferredValue(query)  // derived work lags behind urgent typing
```
# React Cheatsheet

A quick-reference card for the React APIs and patterns demonstrated by this repository. For deeper explanations, see [react-terms.md](./react-terms.md).

---

## Hooks At A Glance

| Hook | One-Liner | When To Reach For It |
|---|---|---|
| `useState` | Local state for a single value | Simple toggles, inputs, counters |
| `useReducer` | State described by dispatched actions | Complex state with multiple related transitions |
| `useEffect` | Side effects after render | Subscriptions, data fetching, timers |
| `useLayoutEffect` | Synchronous effect before paint | Measure/mutate DOM before the user sees it |
| `useInsertionEffect` | Runs before layout effects | CSS-in-JS style injection |
| `useRef` | Mutable container that survives renders | DOM refs, latest-value escape hatch |
| `useImperativeHandle` | Customize what a ref exposes | Expose `focus()` / `open()` instead of raw DOM |
| `useMemo` | Cache a computed value | Expensive derivations that depend on specific inputs |
| `useCallback` | Cache a function reference | Stabilize callbacks passed to memoized children |
| `useContext` | Read the nearest provider | Theme, auth, feature flags |
| `useId` | Deterministic unique id for SSR | Accessible `id` / `htmlFor` pairs |
| `useDebugValue` | Label a custom hook in DevTools | Shared hooks where introspection helps |

## React 19 Hooks

| Hook | One-Liner | When To Reach For It |
|---|---|---|
| `useActionState` | Async action → state + pending flag | Form submissions, saves with loading/error states |
| `useOptimistic` | Show the expected next UI immediately | Instant feedback while an action is in-flight |
| `useDeferredValue` | Lagging copy of a value | Search/filter text driving expensive derived UI |
| `useTransition` | Mark a state update as non-urgent | Category changes, tab switches that can wait |
| `useEffectEvent` | Stable callback that reads latest values | Long-lived effects that must not re-subscribe on every render |
| `useSyncExternalStore` | Subscribe to a non-React store | Redux-like stores, browser APIs, shared modules |
| `use` | Read a promise or context during render | Resource fetching inside Suspense boundaries |
| `useFormStatus` | Read pending state of a parent `<form>` | Disable submit buttons while a form action runs |

## Component Utilities

| API | Purpose |
|---|---|
| `memo(Component)` | Skip re-render when props are shallow-equal |
| `lazy(() => import(...))` | Code-split a component; pair with `Suspense` |
| `createContext(default)` | Create a shared value channel |
| `forwardRef(Component)` | (Pre-19) Forward a ref to an inner element |
| `Fragment` / `<>...</>` | Group children without extra DOM nodes |
| `Profiler` | Measure render timing of a subtree |
| `Activity` | Hide/show a subtree while preserving its React state |

## Boundaries

| Component | Catches | Fallback Prop |
|---|---|---|
| `<Suspense fallback={...}>` | Suspended children (lazy, use, fetch) | `fallback` |
| `<ErrorBoundary fallback={...}>` | Render-time throws | `fallback` / `getDerivedStateFromError` |

Lazy-loading failures often need **both** boundaries: `Suspense` for loading, `ErrorBoundary` for network errors.

## JSX Rules

```tsx
// 1. Return a single root (Fragment is fine)
return (
  <>
    <Header />
    <Main />
  </>
);

// 2. Close every tag
<img src={url} />           // self-closing
<div>{children}</div>       // explicit close

// 3. camelCase HTML attributes
<label htmlFor="name">      // not "for"
<div className="box">       // not "class"
<div tabIndex={0}>          // not "tabindex"

// 4. Curly braces for JS expressions
<span>{user.name}</span>
<div style={{ color: 'red' }}>
```

## Conditional Rendering

```tsx
// Short-circuit
{isLoggedIn && <Dashboard />}

// Ternary
{isLoading ? <Spinner /> : <Content />}

// Early return
if (!data) return <Spinner />;
return <Content data={data} />;
```

## Lists

```tsx
// Always use a stable key — never index for reorderable lists
{items.map(item => (
  <Card key={item.id} data={item} />
))}
```

**Gotcha:** `key={index}` causes bugs when items are reordered, inserted, or deleted.

**Key fallbacks** (in order of preference):
1. A natural unique field from the data (`name`, `slug`, `email`)
2. Generate IDs at data creation time: `rawItems.map(item => ({ ...item, id: crypto.randomUUID() }))`
3. `index` as a last resort — only safe for static lists that are never reordered, filtered, or inserted into

**Gotcha:** `useId` cannot provide list keys. It generates one ID per component instance for accessibility attributes (`id`/`htmlFor`), not per list item. Hooks can't be called inside a `map` callback (violates Rules of Hooks), and React needs the `key` *before* mounting the component — `useId` runs *after* mount.

## Event Handling

```tsx
// Inline handler
<button onClick={() => handleClick(id)}>Go</button>

// Named handler
function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
  e.preventDefault();
  // ...
}
<button onClick={handleClick}>Go</button>
```

**`preventDefault` rule:** call it when the element has a native browser default for that event — it doesn't matter whether the handler is inline or extracted.

| Need `preventDefault` | No default to prevent |
|---|---|
| `<form onSubmit>` (page reload) | `<button type="button" onClick>` |
| `<a href onClick>` (navigation) | `<div onClick>`, `<span onClick>` |
| `<input type="checkbox" onChange>` (toggle) | Custom components with no native behavior |

## State Update Patterns

```tsx
// Direct update
setState(newValue);

// Functional updater (avoids stale closures)
setState(prev => prev + 1);

// Object spread
setState(prev => ({ ...prev, name: 'Alice' }));
```

**Gotcha:** Capturing state in `setTimeout` or `Promise.then` reads the value from the render when the closure was created. Use a functional updater or a ref to read the latest value.

### Immutable Updates for Objects & Arrays

React uses **reference equality** (`Object.is`) to decide whether to re-render. Mutating an object/array in place keeps the same reference, so React skips the re-render.

```tsx
// BUG — mutates in place, same reference, no re-render
items.push(4);
setItems(items);

// FIX — always create a new reference
setItems([...items, 4]);
```

**Array patterns:**

| Avoid (mutates) | Use instead (returns new) |
|---|---|
| `push`, `unshift` | `[...arr, item]`, `[item, ...arr]` |
| `splice` | `filter`, `toSpliced` (ES2023) |
| `sort`, `reverse` | `toSorted`, `toReversed` (ES2023) |
| `arr[i] = x` | `map` or `with` (ES2023) |

**Nested object patterns:**

```tsx
// Shallow update
setUser({ ...user, age: 26 });

// Nested update — must copy every level you touch
setState({
  ...state,
  user: { ...state.user, address: { ...state.user.address, city: 'LA' } },
});
```

**Deep nesting:** use Immer's `useImmer` to write mutation-style code that produces new references under the hood:

```tsx
import { useImmer } from 'use-immer';
const [state, updateState] = useImmer(initialState);
updateState(draft => { draft.user.address.city = 'LA'; });
```

## useImperativeHandle

Customizes what a parent gets through a `ref` — expose a controlled API instead of the raw DOM node.

```tsx
interface ModalHandle {
  open: () => void;
  close: () => void;
}

// React 19: ref is a regular prop, no forwardRef needed
function Modal({ children, ref }: { children: React.ReactNode; ref?: React.Ref<ModalHandle> }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useImperativeHandle(ref, () => ({
    open: () => dialogRef.current?.showModal(),
    close: () => dialogRef.current?.close(),
  }));

  return <dialog ref={dialogRef}>{children}</dialog>;
}

// Parent only sees open() and close(), not the raw <dialog> element
const modalRef = useRef<ModalHandle>(null);
<Modal ref={modalRef}><p>Hello</p></Modal>
modalRef.current?.open();
```

**Key points:**
- Takes an optional 3rd argument (dependency array) — recomputes the handle only when deps change
- If an exposed method reads state, that state **must** be in the dependency array or callers get stale values
- In React 19, `ref` is a regular prop — `forwardRef` is no longer needed
- Prefer declarative props (`isOpen`) over imperative handles when possible; use `useImperativeHandle` for actions like `focus()`, `scrollTo()`, `open()` that don't map cleanly to props

## Common Decision Cheat Table

| Situation | Use |
|---|---|
| Simple local value | `useState` |
| Complex state transitions | `useReducer` |
| Expensive derived value | `useMemo` |
| Stable callback for memoized child | `useCallback` |
| Skip child re-render on same props | `memo` |
| Effect that subscribes once | `useEffect` |
| Effect that reads latest props | `useEffectEvent` inside `useEffect` |
| Measure DOM before paint | `useLayoutEffect` |
| Defer expensive filter/search | `useDeferredValue` |
| Mark update as non-urgent | `useTransition` |
| Form async action lifecycle | `useActionState` |
| Instant optimistic UI | `useOptimistic` |
| External non-React store | `useSyncExternalStore` |
| Code-split a component | `lazy` + `Suspense` |
| Handle render errors | `ErrorBoundary` class |
| Expose imperative methods | `useImperativeHandle` + ref |

## DOM APIs

| API | Purpose |
|---|---|
| `createPortal(jsx, container)` | Render into a DOM node outside the React tree |
| `flushSync(fn)` | Force synchronous state flush (use sparingly) |
| `hydrateRoot(container, jsx)` | Attach React to server-rendered HTML |

## Resource Hints (React DOM)

| Function | Purpose |
|---|---|
| `preconnect(url)` | Open early connection to an origin |
| `prefetchDNS(url)` | Resolve DNS early |
| `preload(url, opts)` | Fetch a resource early |
| `preloadModule(url)` | Prefetch a JS module |
| `preinit(url, opts)` | Fetch and evaluate a script early |
| `preinitModule(url)` | Fetch and evaluate a module early |

## Server APIs (Quick Reference)

| API | Environment | Streaming |
|---|---|---|
| `renderToPipeableStream` | Node | Yes |
| `renderToReadableStream` | Web/Edge | Yes |
| `renderToString` | Node | No (legacy) |
| `renderToStaticMarkup` | Node | No (no React ids) |
| `prerender` | Web/Edge | Static pre-render |
| `prerenderToNodeStream` | Node | Static pre-render |

## Key Reset Trick

Force a component to remount by changing its `key`:

```tsx
<Profile key={userId} userId={userId} />
```

When `userId` changes, React destroys the old `Profile` and creates a fresh one, resetting all internal state.

## Effect Cleanup & AbortController

```tsx
useEffect(() => {
  const controller = new AbortController();
  fetch(url, { signal: controller.signal })
    .then(res => res.json())
    .then(data => setData(data))
    .catch(err => {
      if (err.name !== 'AbortError') throw err;
    });
  return () => controller.abort();
}, [url]);
```

**Key points:**
- The cleanup function is the primary cancellation mechanism in effects.
- `AbortController` cancels in-flight `fetch` requests when deps change.
- Always check for `AbortError` to avoid logging expected cancellations.
- Avoid synchronous `setState` in effect bodies — use `setTimeout(..., 0)` or `queueMicrotask` to defer when needed.

## React Compiler Directives

| Directive | Effect |
|---|---|
| `"use memo"` | Opt a component into automatic memoization by the React Compiler |
| `"use no memo"` | Opt a component out of the React Compiler |

The compiler auto-inserts `useMemo` / `useCallback` at build time so you write plain code. Requires a Babel or SWC plugin.

## Server Component Directives

| Directive | Meaning |
|---|---|
| `'use client'` | Marks a file as a client boundary — can use hooks and browser events |
| `'use server'` | Marks functions as server actions callable from the client |

In an RSC framework, components are **server components by default**. Only add `'use client'` when the component needs interactivity.

## Activity Component

```tsx
<Activity mode={isVisible ? 'visible' : 'hidden'}>
  <ExpensivePanel />
</Activity>
```

- Hidden activities **preserve React state** but skip paint and layout cost.
- Useful for tabs, off-screen panels, and content that should remain warm.
- Switching to `'visible'` reveals the subtree instantly without remounting.

## Accessibility Quick Reference

| Pattern | Key Attributes |
|---|---|
| Modal dialog | `role="dialog"`, `aria-labelledby`, `aria-modal="true"`, focus trap |
| Custom listbox | `role="listbox"`, `role="option"`, `aria-activedescendant` |
| Form errors | `aria-invalid`, `aria-describedby`, `role="alert"` for summary |
| Live region | `aria-live="polite"` or `aria-live="assertive"` |

**Focus management:** move focus into a dialog on open, return focus to the trigger on close. Escape should dismiss.

## Rules Of Hooks

1. Call hooks at the **top level** — never inside loops, conditions, or nested functions.
2. Call hooks only from **React function components** or **custom hooks**.
3. Hook call order must be **identical** on every render.

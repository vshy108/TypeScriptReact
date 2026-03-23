# React Terms

This guide explains the React terms covered by this repository. It is written for developers who already know older React patterns and want a practical translation into the model used by React 19.x and this codebase.

## How To Use This Guide

- Start with the core client terms if you are new to React 19.
- Use the DOM, server, and edge-case sections as reference material while reading the samples.
- Treat this as a repository glossary, not as a complete React manual.

## Core Client Terms

### Suspense

`Suspense` is a boundary component that shows fallback UI while part of its child subtree is temporarily not ready. In this repo it is paired with `lazy()` so React can show a loading panel while `TypeNotes` is still downloading.

### lazy

`lazy()` defers loading a component's code until the first time React tries to render it. In this repo it keeps `TypeNotes` out of the initial bundle and relies on `Suspense` to display the waiting UI.

### useActionState

`useActionState()` models an async action as state. Instead of juggling separate loading, success, and error flags, you return the next action state from one function and React gives you the current result plus a pending flag.

### useOptimistic

`useOptimistic()` renders the likely next UI state before the async work finishes. In this repo it inserts a temporary task card immediately after form submission so the interface responds before the simulated save completes.

### useDeferredValue

`useDeferredValue()` returns a lagging version of a value so urgent interactions stay responsive. Here it lets search input update immediately while the heavier feature filtering work can trail behind.

### useTransition

`useTransition()` marks state updates as non-urgent. The UI can keep responding to more important interactions while React works through the deferred update.

### useEffectEvent

`useEffectEvent()` lets long-lived effects read the latest props and state without forcing the effect itself to re-subscribe. In this repo it keeps a global keyboard shortcut in sync with the current feature selection without recreating the browser listener on every render.

### useSyncExternalStore

`useSyncExternalStore()` is the correct hook for reading data from a store that lives outside React state. This repo uses it for a small external release snapshot instead of storing that snapshot in component-owned state.

### ref as prop

React 19 reduces ref ceremony for function components. Instead of always thinking in terms of `forwardRef` wrappers, this repo treats refs as part of the modern component contract and uses them to expose imperative methods from `CommandPalette`.

### useImperativeHandle

`useImperativeHandle()` customizes what a parent receives through a ref. Instead of exposing a raw DOM node, a component can expose focused methods such as `focus()` or `load()`.

### createContext

`createContext()` defines a shared channel for values that many components need. The context sample uses it for theme tokens and feature flags so those values do not need to be threaded through props manually.

### useContext

`useContext()` reads the nearest matching provider for a context. It replaces older consumer-heavy or class-based context patterns with a direct function-call model.

### Fragment

`Fragment` groups siblings without adding an extra DOM node. It is useful when JSX needs a wrapper for structure but the rendered HTML should stay flat.

### useReducer

`useReducer()` is useful when state changes are easier to describe as actions than as ad hoc `setState` calls. This repo uses it for domain-oriented state transitions instead of trivial counters.

### memo

`memo()` skips re-rendering a component when its props have not changed. It is a performance tool, not a default requirement, and the memo lab shows both when it helps and when it adds noise.

### useMemo

`useMemo()` caches a computed value between renders until its dependencies change. This repo also uses it in context identity discussions, where stable object identity prevents unnecessary consumer re-renders.

### useCallback

`useCallback()` caches a function reference until dependencies change. It matters when child components or memoized values care about referential stability more than about the function body itself.

### Profiler

`Profiler` measures render timing for a subtree. The memo lab uses it to make render cost visible instead of treating optimization as guesswork.

### useDebugValue

`useDebugValue()` labels custom hooks in React DevTools. It is mostly useful in shared hooks or teaching samples where introspection value is higher than the added annotation cost.

### useLayoutEffect

`useLayoutEffect()` runs after DOM mutations but before paint. It is for code that must read layout or synchronously adjust the UI before the browser shows the result.

### useInsertionEffect

`useInsertionEffect()` runs even earlier than layout effects and is meant for style injection work. It exists for cases where CSS rules must be inserted before layout calculations happen.

### use

`use()` lets a component read a promise-like resource or context directly during render. In practice it is often paired with `Suspense`, because reading a not-yet-ready resource will suspend the subtree.

### useState stale closure

This term refers to a common bug where asynchronous callbacks capture an outdated state value. The stale-closure sample shows why the bug happens and how functional updaters or refs avoid it.

### functional updater

A functional updater is a `setState` call that receives the previous state value instead of closing over one from an earlier render. It is the standard fix when asynchronous code or batched updates make direct captured state unreliable.

### useRef latest value

This pattern stores the latest value in a ref so async callbacks can read it without re-subscribing effects or depending on stale closures. It is an escape hatch, not the first tool to reach for.

## React DOM Terms

### createPortal

`createPortal()` renders part of the UI outside the normal DOM position of its parent component while keeping it in the same React tree. It is the standard tool for modals, overlays, and toasts.

### flushSync

`flushSync()` forces React to apply updates synchronously. It is an escape hatch for coordination points where you need DOM updates to exist immediately before proceeding.

### useFormStatus

`useFormStatus()` reads pending form state from within a form subtree. It avoids prop-drilling loading flags into submit controls or nested status indicators.

### hydrateRoot

`hydrateRoot()` attaches React behavior to HTML that was already rendered on the server. It is the client entry point for SSR hydration rather than a normal fresh mount.

### preconnect

`preconnect()` hints that the browser should establish a network connection early to a remote origin likely to be needed soon.

### prefetchDNS

`prefetchDNS()` tells the browser to resolve DNS early for a likely future request so later network work can start faster.

### preinit

`preinit()` declares that a resource such as a stylesheet or script is important enough to initialize before the component using it fully renders.

### preinitModule

`preinitModule()` is the module-oriented version of `preinit()`, used for JavaScript module resources.

### preload

`preload()` hints that a specific asset will be needed soon and should start loading before normal discovery would begin.

### preloadModule

`preloadModule()` is the module-specific version of `preload()`, used for JavaScript modules.

### hydration mismatch

A hydration mismatch happens when server-rendered HTML does not match what the client renders during hydration. React then has to warn, recover, or replace markup depending on the case.

### suppressHydrationWarning

`suppressHydrationWarning` is an escape hatch for content that is expected to differ between server and client. It should be used sparingly, because it hides mismatches instead of fixing their root cause.

### useId deterministic

`useId()` generates deterministic IDs that stay stable across server and client rendering. That makes it safer than ad hoc random ID generation in SSR or hydration-sensitive code.

### getServerSnapshot

`getServerSnapshot` is the server-side companion to `useSyncExternalStore()`. It lets React read a stable snapshot during SSR so hydration starts from compatible data.

## React Server Terms

### Activity

`<Activity>` is a React boundary that controls whether a subtree is visible or hidden without reducing the problem to simple conditional rendering. This repo pairs it with transitions to explain visibility and scheduling together.

### startTransition

`startTransition()` is the non-hook version of transition scheduling. It lets code outside hooks mark updates as non-urgent.

### renderToPipeableStream

`renderToPipeableStream()` is the Node-stream SSR API for progressively streaming HTML to the client.

### renderToReadableStream

`renderToReadableStream()` is the Web Streams variant of streaming SSR, used in environments that expose browser-style readable streams.

### renderToString

`renderToString()` renders the whole React tree to an HTML string in one shot. It is simpler than streaming but gives up progressive delivery.

### renderToStaticMarkup

`renderToStaticMarkup()` renders HTML without React hydration markers. It is intended for static output that React will not hydrate later.

### resumeToPipeableStream

`resumeToPipeableStream()` resumes a previously prerendered or suspended Node stream output rather than starting from scratch.

### prerender

`prerender()` generates a prerendered result that can be resumed later. It separates some server work from the final delivery step.

### prerenderToNodeStream

`prerenderToNodeStream()` is the Node-stream variant of prerendering.

### resume

`resume()` continues rendering from a prerendered result in environments that use the non-pipeable APIs.

### resumeAndPrerender

`resumeAndPrerender()` combines resume and prerender workflows for environments using the newer server APIs.

### resumeAndPrerenderToNodeStream

`resumeAndPrerenderToNodeStream()` is the Node-stream version of that combined workflow.

### Server Components

Server Components are components designed to run on the server and send serialized output instead of shipping all their logic to the client. They need framework-aware infrastructure, so this repo covers them as comment-based demos rather than runnable examples.

### Server Functions

Server Functions are server-executed functions callable from the client through framework support. They are related to server/client boundary tooling, not ordinary client-only React code.

### 'use client'

`'use client'` is a file-level directive that marks a module as client-executed in frameworks supporting React Server Components.

### 'use server'

`'use server'` is a file-level directive that marks server-only execution points in compatible frameworks.

## Compiler And Lint Terms

### React Compiler

The React Compiler is build-time analysis that can automatically optimize component re-render behavior. It changes the optimization model from manual memoization everywhere to compiler-assisted memoization where supported.

### 'use memo'

`'use memo'` is a compiler directive that opts code into memoizing behavior under the React Compiler.

### 'use no memo'

`'use no memo'` is the companion directive that opts specific code paths out of compiler memoization.

### exhaustive-deps

`exhaustive-deps` is the lint rule that checks whether hook dependency arrays match the values actually used in the hook body.

### rules-of-hooks

`rules-of-hooks` enforces that hooks are called in valid locations and consistent order. It protects the runtime assumptions React makes when associating hook state with renders.

### react-compiler purity

This term refers to lint and compiler expectations that components and hooks remain pure in render. Impure render logic breaks compiler assumptions and makes behavior harder to reason about.

### react-refresh/only-export-components

This lint rule supports reliable fast refresh behavior by encouraging files to export React components cleanly instead of mixing unrelated runtime exports that confuse hot reload boundaries.

## Edge-Case Terms

### React 18 batching

Automatic batching means React can group multiple state updates into fewer renders, even across more async boundaries than older React versions supported.

### setTimeout batching

This refers to how React 18+ can batch state updates triggered inside `setTimeout`, which changed the behavior many older React developers expect.

### Promise batching

This is the promise-callback counterpart to timeout batching: updates from promise continuations can now batch together in modern React.

### useContext identity trap

This trap happens when a provider recreates its `value` object every render, forcing all consumers to re-render even if the logical contents did not really change.

### useMemo provider value

This pattern stabilizes a context provider's `value` identity so consumers do not re-render unnecessarily.

### useCallback stable reference

This pattern stabilizes callback identity when that callback is part of a provider value or a memo-sensitive prop contract.

### memo consumer skip

This refers to using `memo()` on consumers or child components so they can actually benefit from stable prop identity.

### ErrorBoundary class

An Error Boundary is still implemented as a class component in today's stable React APIs. It catches rendering errors below it and renders fallback UI instead of crashing the whole tree.

### getDerivedStateFromError

`getDerivedStateFromError()` is the static lifecycle used by error boundaries to derive fallback state from a thrown error.

### componentDidCatch

`componentDidCatch()` is the error-boundary lifecycle used for side effects such as logging after an error was caught.

### Suspense vs errors

`Suspense` handles waiting, not failures. If a lazy component or render path throws an error, React needs an error boundary instead of a Suspense boundary.

### lazy() failure

This term refers to the fact that a failed dynamic import does not become a loading state. It throws to the nearest error boundary.

### nested boundaries

Nested Suspense or error boundaries let one part of the UI fail or wait without taking over the entire page.

### key={index} reorder bug

Using array index as a key can cause local state to stick to the wrong item when the list order changes. React preserves state by key identity, not by visual position.

### key={id} stable identity

Using a real stable ID as the key keeps each item's state attached to the correct data record across reorders.

### key reset trick

Changing a component's key forces React to remount it from scratch, which is a deliberate way to reset local state.

### state follows DOM position

This phrase describes why bad keys are dangerous: React preserves state according to reconciliation identity, which can line up with position instead of data if the keys are wrong.

### ref null during render

Refs are not populated during the render phase, so reading `ref.current` there often gives `null` on initial render.

### callback refs

Callback refs are functions React calls with the mounted node and later with `null` on unmount. They are useful when you need precise mount and unmount timing.

### forwardRef

`forwardRef()` is the older way to let function components receive refs. It still exists, but this repo positions React 19 ref-as-prop usage as the modern default to learn first.

### ref mount/unmount lifecycle

This term refers to the timing details of when refs are attached, updated, and cleared during mounting and unmounting.
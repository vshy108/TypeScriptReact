# Coverage Roadmap

This file tracks what the current project already demonstrates and what is still missing.

The missing work is now split into isolated mini-samples instead of one monolithic backlog. See `docs/mini-samples.md` for the implementation queue.

`src/sampleCatalog.ts` is the canonical inventory for sample coverage. This roadmap is the high-level coverage summary and execution-surface guide.

It is aligned to the current stable React 19.2 reference and the main TypeScript handbook/reference sections:

- React reference overview: https://react.dev/reference/react
- React hooks reference: https://react.dev/reference/react/hooks
- React APIs reference: https://react.dev/reference/react/apis
- TypeScript docs index: https://www.typescriptlang.org/docs/

It is intentionally organized by major feature area instead of trying to enumerate every historical or niche syntax detail.

## How to read coverage in this repo

Different topics live on different execution surfaces. That is intentional.

| Surface | Meaning | Typical examples |
|---|---|---|
| `current-app` | Integrated into the main React lab UI | core hook and component demos in `src/App.tsx` |
| `isolated-route` | Routed or staged inside the app as focused samples | `src/samples/*`, `src/features/*` |
| `separate-entry` | Needs its own HTML shell or runtime entry | hydration and hydration-mismatch examples |
| `node-only` | Verified outside the SPA through TypeScript, lint, or source-boundary analysis | `node-samples/*` |
| `comment-demo` | Explained in-repo but not fully executable in this workspace | framework-aware or plugin-dependent demos |

## Current execution-surface summary

- React client and DOM fundamentals are primarily covered in the integrated app and isolated-route samples
- hydration-specific behavior is covered through separate-entry artifacts
- React server/static rendering is covered in the dedicated SSR workspace
- compiler, lint, server-boundary, and advanced TypeScript topics use node-only workspaces when the SPA is not the right execution surface
- some framework-aware behaviors still remain documented rather than fully runnable here, which is a tooling constraint rather than a missing conceptual explanation

## React coverage

### Included now

- [x] `useState`
- [x] `useRef`
- [x] `useEffect`
- [x] `useLayoutEffect`
- [x] `useInsertionEffect`
- [x] `useId`
- [x] `useImperativeHandle`
- [x] `useContext`
- [x] `useReducer`
- [x] `useActionState`
- [x] `useOptimistic`
- [x] `useMemo`
- [x] `useCallback`
- [x] `useDeferredValue`
- [x] `useTransition`
- [x] `useSyncExternalStore`
- [x] `useEffectEvent`
- [x] `useDebugValue`
- [x] `<StrictMode>`
- [x] `<Suspense>`
- [x] `<Fragment>`
- [x] `lazy`
- [x] `createRoot`
- [x] `createContext`
- [x] React-managed form elements such as `<form>`, `<input>`, `<select>`, and `<option>`

### Included now: stable React components and APIs

- [x] `<Profiler>`
- [x] `memo`
- [x] `use`

### Not included yet: stable React components and APIs

(All stable components and APIs are now covered.)

### Included now: `<Activity>` and `startTransition`

- [x] `<Activity>`
- [x] `startTransition` standalone API

### Included now: stable `react-dom` APIs

- [x] `useFormStatus`
- [x] `createPortal`
- [x] `flushSync`
- [x] `preconnect`
- [x] `prefetchDNS`
- [x] `preinit`
- [x] `preinitModule`
- [x] `preload`
- [x] `preloadModule`
- [x] `hydrateRoot`

### Not included yet: stable `react-dom` APIs

(All stable react-dom APIs are now covered.)

### Included now: edge-case and gotcha demos

- [x] Stale closures and batching traps
- [x] Context provider identity perf trap
- [x] Error boundaries and Suspense interaction
- [x] Key identity and state preservation
- [x] Ref timing and callback refs
- [x] Hydration mismatch detection (separate entry demo)

### Included now: server and prerender APIs

- [x] `renderToPipeableStream`
- [x] `renderToReadableStream`
- [x] `renderToStaticMarkup`
- [x] `renderToString`
- [x] `resume`
- [x] `resumeToPipeableStream`
- [x] `prerender`
- [x] `prerenderToNodeStream`
- [x] `resumeAndPrerender`
- [x] `resumeAndPrerenderToNodeStream`

### Included now: runnable compiler, lint, and server-boundary coverage

- [x] Runnable source-boundary verification for React Compiler setup, `"use memo"`, and `"use no memo"`
- [x] Runnable source-boundary verification for Server Components, Server Functions, `'use client'`, and `'use server'`
- [x] Runnable ESLint verification for `exhaustive-deps`, `rules-of-hooks`, and `only-export-components`
- [x] Comment-based transformed-output examples until the compiler plugin can run in this workspace

### Optional or deferred React topics

- [ ] Canary-only APIs such as `<ViewTransition>` and `addTransitionType`
- [ ] Experimental APIs such as `experimental_taintObjectReference`
- [ ] Legacy APIs such as `Children`, `cloneElement`, `createRef`, `forwardRef`, class components, and `PureComponent`

## TypeScript coverage

### Included now

- [x] Type aliases
- [x] Interfaces
- [x] Union types
- [x] Readonly properties and readonly arrays
- [x] Template literal types
- [x] Generic components and generic props
- [x] Type guards
- [x] Assertion functions
- [x] `typeof` in type positions
- [x] Indexed access types
- [x] `as const`
- [x] `satisfies`
- [x] Discriminated unions
- [x] Exhaustive `never` checking
- [x] ES modules with type-only imports
- [x] JSX with TypeScript
- [x] Strict compiler settings
- [x] `exactOptionalPropertyTypes`
- [x] `noUncheckedIndexedAccess`
- [x] `isolatedModules`
- [x] `verbatimModuleSyntax`
- [x] `moduleResolution: "bundler"`
- [x] `erasableSyntaxOnly`
- [x] `noUncheckedSideEffectImports`
- [x] Project references through `tsc -b`
- [x] Utility types such as `Partial`, `Pick`, `Record`, and `ReturnType`
- [x] `keyof`
- [x] Conditional types
- [x] Mapped types
- [x] `infer`
- [x] Tuples
- [x] Function overloads
- [x] Call signatures and construct signatures
- [x] `this` typing in functions
- [x] Intersection types
- [x] Classes
- [x] Access modifiers
- [x] Abstract classes
- [x] `implements`
- [x] Declaration merging
- [x] Triple-slash directives
- [x] Declaration files and `.d.ts` authoring
- [x] Module augmentation

### Included now: recursive types

- [x] Recursive types

### Included now: edge-case and gotcha demos

- [x] Conditional type distributivity
- [x] Mapped type filtering and remapping
- [x] Variance and assignability
- [x] `private` vs `#private` fields
- [x] Template literal type expansion
- [x] Generic inference failures

### Included now: reference and ecosystem topics

- [x] Enums
- [x] Decorators
- [x] Mixins
- [x] Symbols
- [x] Iterators and generators
- [x] Namespaces
- [x] JSDoc-powered typing
- [x] Advanced `tsconfig` options beyond the current strict baseline

## Backlog structure

- The current app remains the integrated client lab.
- React client gaps become standalone routes.
- React DOM hydration and resource hints move into a separate entry point.
- React server APIs move into a dedicated SSR or framework-aware workspace.
- Declaration authoring and JS interop move into node-only package-style samples.

See `docs/mini-samples.md` for the actual sample ids and suggested build order.

# Coverage Roadmap

This file tracks what the current project already demonstrates and what is still missing.

The missing work is now split into isolated mini-samples instead of one monolithic backlog. See `docs/mini-samples.md` for the implementation queue.

It is aligned to the current stable React 19.2 reference and the main TypeScript handbook/reference sections:

- React reference overview: https://react.dev/reference/react
- React hooks reference: https://react.dev/reference/react/hooks
- React APIs reference: https://react.dev/reference/react/apis
- TypeScript docs index: https://www.typescriptlang.org/docs/

It is intentionally organized by major feature area instead of trying to enumerate every historical or niche syntax detail.

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
- [x] Hydration mismatch detection (comment-based demo)

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

### Included now: compiler, lint, and server-component topics (comment-based demos)

- [x] React Compiler setup
- [x] `"use memo"` directive
- [x] `"use no memo"` directive
- [x] Server Components
- [x] Server Functions
- [x] `'use client'`
- [x] `'use server'`
- [x] Deeper React lint examples such as `exhaustive-deps`, `purity`, and `static-components`

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

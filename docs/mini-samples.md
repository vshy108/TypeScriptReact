# Mini-sample Backlog

This project now treats the remaining backlog as isolated mini-samples instead of one ever-growing demo page.

## Why this split exists

- Portals need their own host layer.
- Hydration and resource hints need a separate entry point.
- SSR APIs need a server runtime.
- Declaration files and JSDoc interop are cleaner in node-oriented samples.
- Type-heavy TypeScript topics are easier to learn when the runtime UI stays small.

## Current integrated sample

- `sample-core-lab`
  Covers `useActionState`, `useOptimistic`, `useDeferredValue`, `useTransition`, `useEffectEvent`, `useSyncExternalStore`, `lazy`, and `Suspense`.
  This remains integrated because those APIs reinforce each other in one realistic client flow.

## React client mini-samples

- `sample-react-context-theme`
  Covers `createContext`, `useContext`, and `Fragment`.
  Status: implemented.
  Recommended surface: standalone route.

- `sample-react-reducer-board`
  Covers `useReducer`.
  Status: implemented.
  Recommended surface: standalone route.

- `sample-react-memo-lab`
  Covers `memo`, `useMemo`, `useCallback`, `Profiler`, and `useDebugValue`.
  Status: implemented.
  Recommended surface: standalone route.

- `sample-react-layout-effects`
  Covers `useLayoutEffect` and `useInsertionEffect`.
  Status: implemented.
  Recommended surface: standalone route.

- `sample-react-use-resource`
  Covers `use`.
  Status: implemented.
  Recommended surface: standalone route.

## React DOM mini-samples

- `sample-react-portal-modal`
  Covers `createPortal` and `flushSync`.
  Status: implemented.
  Recommended surface: standalone route.

- `sample-react-form-status`
  Covers `useFormStatus`.
  Status: implemented.
  Recommended surface: standalone route.

- `sample-react-hydration-hints`
  Covers `hydrateRoot`, `preconnect`, `prefetchDNS`, `preinit`, `preinitModule`, `preload`, and `preloadModule`.
  Recommended surface: separate client entry point.

## React server mini-samples

- `sample-react-streaming-ssr`
  Covers `renderToPipeableStream`, `renderToReadableStream`, `renderToString`, `renderToStaticMarkup`, `prerender`, and `resume`.
  Recommended surface: separate SSR workspace.

- `sample-react-server-components`
  Covers Server Components, Server Functions, `'use client'`, and `'use server'`.
  Recommended surface: framework-aware workspace.

- `sample-react-compiler`
  Covers React Compiler, `"use memo"`, and `"use no memo"`.
  Recommended surface: separate compiler-enabled workspace.

## TypeScript language mini-samples

- `sample-ts-utility-mapped`
  Covers `Partial`, `Pick`, `Record`, `ReturnType`, `keyof`, conditional types, mapped types, and `infer`.
  Recommended surface: standalone route.

- `sample-ts-functions-tuples`
  Covers tuples, overloads, call signatures, construct signatures, and `this` typing.
  Recommended surface: standalone route.

- `sample-ts-classes-models`
  Covers classes, access modifiers, abstract classes, `implements`, and intersection types.
  Recommended surface: standalone route.

## TypeScript interop mini-samples

- `sample-ts-declarations`
  Covers `.d.ts` authoring, declaration merging, module augmentation, and triple-slash directives.
  Recommended surface: node-only package-style sample.

- `sample-ts-jsdoc-interop`
  Covers JSDoc-powered typing, `allowJs`, and `checkJs`.
  Recommended surface: node-only package-style sample.

- `sample-ts-advanced-runtime-types`
  Covers enums, symbols, iterators, mixins, decorators, and namespaces.
  Recommended surface: node-only package-style sample.

## Suggested build order

1. `sample-ts-utility-mapped`
2. `sample-ts-functions-tuples`
3. `sample-ts-classes-models`
4. `sample-ts-declarations`
5. `sample-react-hydration-hints`
6. `sample-react-streaming-ssr`
7. `sample-react-server-components`
8. `sample-react-compiler`

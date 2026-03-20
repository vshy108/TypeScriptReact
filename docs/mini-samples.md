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
  Status: implemented.
  Recommended surface: separate client entry point.

- `sample-react-activity-transition`
  Covers `Activity` and standalone `startTransition`.
  Status: implemented.
  Recommended surface: standalone route.

## React server mini-samples

- `sample-react-streaming-ssr`
  Covers `renderToPipeableStream`, `renderToReadableStream`, `renderToString`, `renderToStaticMarkup`, `resumeToPipeableStream`, `prerender`, `prerenderToNodeStream`, `resume`, `resumeAndPrerender`, and `resumeAndPrerenderToNodeStream`.
  Status: implemented.
  Recommended surface: separate SSR workspace.

- `sample-react-server-components`
  Covers Server Components, Server Functions, `'use client'`, and `'use server'`.
  Status: implemented (comment-based demo).
  Surface: comment-demo.

- `sample-react-compiler`
  Covers React Compiler, `"use memo"`, and `"use no memo"`.
  Status: implemented (comment-based demo).
  Surface: comment-demo.

## TypeScript language mini-samples

- `sample-ts-utility-mapped`
  Covers `Partial`, `Pick`, `Record`, `ReturnType`, `keyof`, conditional types, mapped types, and `infer`.
  Status: implemented.
  Recommended surface: standalone route.

- `sample-ts-functions-tuples`
  Covers tuples, overloads, call signatures, construct signatures, and `this` typing.
  Status: implemented.
  Recommended surface: standalone route.

- `sample-ts-classes-models`
  Covers classes, access modifiers, abstract classes, `implements`, and intersection types.
  Status: implemented.
  Recommended surface: standalone route.

- `sample-ts-recursive-types`
  Covers recursive interfaces, recursive type aliases, `DeepReadonly`, and `DeepKeyPaths`.
  Status: implemented.
  Recommended surface: standalone route.

## TypeScript interop mini-samples

- `sample-ts-declarations`
  Covers `.d.ts` authoring, declaration merging, module augmentation, and triple-slash directives.
  Status: implemented.
  Recommended surface: node-only package-style sample.

- `sample-ts-jsdoc-interop`
  Covers JSDoc-powered typing, `allowJs`, and `checkJs`.
  Status: implemented.
  Recommended surface: node-only package-style sample.

- `sample-ts-advanced-runtime-types`
  Covers enums, symbols, iterators, mixins, decorators, and namespaces.
  Status: implemented.
  Recommended surface: node-only package-style sample.

- `sample-ts-advanced-tsconfig`
  Covers `resolveJsonModule`, `paths`, `baseUrl`, `composite`, `declarationMap`, `importHelpers`, and `noPropertyAccessFromIndexSignature`.
  Status: implemented.
  Recommended surface: node-only package-style sample.

## React lint mini-samples

- `sample-react-lint-rules-demo`
  Covers `exhaustive-deps`, `rules-of-hooks`, `react-compiler` purity enforcement, and `react-refresh/only-export-components`.
  Status: implemented (comment-based demo).
  Surface: comment-demo.

## Suggested build order

All samples are implemented.

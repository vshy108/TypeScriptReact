# React and TypeScript Terms

This folder now splits the glossary by subject so the learning path matches the repository structure more closely.

## What This Folder Is For

Use these guides as a companion while reading the app and sample files. The goal is not to define every React or TypeScript term in the ecosystem. The goal is to explain the terms this repository actually demonstrates, then point you straight at the example file where each idea shows up.

## Guides

- [Reading index](./reading-index.md): the shortest recommended path through the repository now that the code has more rationale comments.
- [React terms](./react-terms.md): React client APIs, DOM APIs, server APIs, compiler and lint concepts, and the edge-case terms demonstrated by this repo.
- [TypeScript terms](./typescript-terms.md): TypeScript language features, interop topics, compiler options, and type-system edge cases demonstrated by this repo.

## Keyword Index

### React keywords

- Core client: `Suspense`, `lazy`, `useActionState`, `useOptimistic`, `useDeferredValue`, `useTransition`, `useEffectEvent`, `useSyncExternalStore`, `ref as prop`, `useImperativeHandle`, `createContext`, `useContext`, `Fragment`, `useReducer`, `memo`, `useMemo`, `useCallback`, `Profiler`, `useDebugValue`, `useLayoutEffect`, `useInsertionEffect`, `use`, `useState stale closure`, `functional updater`, `useRef latest value`
- Decision points: `useEffect vs useEffectEvent`, `useDeferredValue vs useTransition`, `useActionState vs useOptimistic`, `useState vs useReducer`, `useMemo vs memo vs useCallback`, `useEffect vs useLayoutEffect`, `Suspense vs ErrorBoundary`
- DOM and hydration: `createPortal`, `flushSync`, `useFormStatus`, `hydrateRoot`, `preconnect`, `prefetchDNS`, `preinit`, `preinitModule`, `preload`, `preloadModule`, `hydration mismatch`, `suppressHydrationWarning`, `useId deterministic`, `getServerSnapshot`
- Server and compiler: `Activity`, `startTransition`, `renderToPipeableStream`, `renderToReadableStream`, `renderToString`, `renderToStaticMarkup`, `resumeToPipeableStream`, `prerender`, `prerenderToNodeStream`, `resume`, `resumeAndPrerender`, `resumeAndPrerenderToNodeStream`, `Server Components`, `Server Functions`, `'use client'`, `'use server'`, `React Compiler`, `'use memo'`, `'use no memo'`, `exhaustive-deps`, `rules-of-hooks`, `react-compiler purity`, `react-refresh/only-export-components`
- Edge cases: `React 18 batching`, `setTimeout batching`, `Promise batching`, `useContext identity trap`, `useMemo provider value`, `useCallback stable reference`, `memo consumer skip`, `ErrorBoundary class`, `getDerivedStateFromError`, `componentDidCatch`, `Suspense vs errors`, `lazy() failure`, `nested boundaries`, `key={index} reorder bug`, `key={id} stable identity`, `key reset trick`, `state follows DOM position`, `ref null during render`, `callback refs`, `forwardRef`, `ref mount/unmount lifecycle`

### TypeScript keywords

- Core and config: `exactOptionalPropertyTypes`, `null vs undefined vs void vs field?: Type`, `noUncheckedIndexedAccess`, `template literal ids`, `assertion functions`, `as const`, `satisfies`, `satisfies vs as`, `generic components`
- Decision points: `type vs interface`, `unknown vs any`, `type guards vs assertion functions`, `readonly vs as const`, `field?: Type vs field: Type | undefined`, `union literals vs enum`, `type aliases vs generic components`, `K extends string vs key: string`
- Type transformation: `Partial`, `Pick`, `Record`, `ReturnType`, `keyof`, `conditional types`, `mapped types`, `infer`
- Function and object modeling: `tuples`, `function overloads`, `call signatures`, `construct signatures`, `this typing`, `classes`, `access modifiers`, `abstract classes`, `implements`, `intersection types`
- Recursive and declaration work: `recursive types`, `recursive interfaces`, `recursive type aliases`, `DeepReadonly`, `DeepKeyPaths`, `.d.ts authoring`, `declaration merging`, `module augmentation`, `triple-slash directives`, `JSDoc-powered typing`, `allowJs`, `checkJs`
- Runtime and project config: `enums`, `symbols`, `iterators`, `mixins`, `decorators`, `namespaces`, `resolveJsonModule`, `paths`, `baseUrl`, `composite`, `declarationMap`, `importHelpers`, `noPropertyAccessFromIndexSignature`
- Edge cases and advanced inference: `distributive conditional types`, `non-distributive [T] extends [U]`, `never empty union`, `Extract`, `Exclude`, `as clause key remapping`, `never key removal`, `PickByType value filtering`, `template literal key transform`, `keyof T & string`, `-readonly modifier`, `covariance out`, `contravariance in`, `invariance in out`, `Array unsoundness`, `strictFunctionTypes`, `variance annotations TS 4.7`, `private keyword (compile-time)`, `#private fields (runtime)`, `override keyword`, `constructor parameter properties`, `field initialization order`, `template literal types`, `union cartesian product`, `Uppercase Lowercase Capitalize`, `infer in template literals`, `route parameter extraction`, `performance limits`, `partial inference currying`, `NoInfer<T>`, `overload resolution order`, `bidirectional contextual typing`, `generic defaults`, `satisfies operator`

## Common Decision Points

These are the kinds of comparisons that are easy to confuse in real projects and worth reading side by side instead of as isolated glossary entries.

### React comparisons

- `useEffect` vs `useEffectEvent`: subscribe once with `useEffect`, but use `useEffectEvent` when a long-lived effect must read the latest props or state without re-subscribing.
- `useDeferredValue` vs `useTransition`: defer a derived value with `useDeferredValue`; mark a state update as non-urgent with `useTransition`.
- `useActionState` vs `useOptimistic`: `useActionState` owns the authoritative async action lifecycle; `useOptimistic` renders the likely next UI before that action finishes.
- `useState` vs `useReducer`: use `useState` for simple local state; use `useReducer` when changes are easier to describe as domain actions.
- `useMemo` vs `memo` vs `useCallback`: cache computed values with `useMemo`, skip child re-renders with `memo`, and stabilize function references with `useCallback` when identity matters.
- `useEffect` vs `useLayoutEffect`: prefer `useEffect` by default; use `useLayoutEffect` only when the UI must measure or mutate layout before paint.
- `Suspense` vs `ErrorBoundary`: `Suspense` handles waiting states; `ErrorBoundary` handles render-time failures. Lazy-loading failures often need both.
- `ref` as prop vs `useImperativeHandle`: pass a ref when a parent needs access; use `useImperativeHandle` when you want to expose a small API instead of a raw node.

### TypeScript comparisons

- `satisfies` vs `as`: prefer `satisfies` to verify shape without losing narrow inference; use plain `as` only when runtime knowledge exists but the type system cannot prove it.
- `null` vs `undefined` vs `void` vs `field?: Type`: distinguish intentional emptiness, missing values, no-useful-return, and optional object properties.
- `field?: Type` vs `field: Type | undefined`: the first allows omission; the second requires the property to exist.
- `type` vs `interface`: both can model object shapes, but `type` is often better for unions and transformations while `interface` is often clearer for extendable object contracts.
- `unknown` vs `any`: use `unknown` when a value must be narrowed before use; `any` opts out of type safety.
- `readonly` vs `as const`: `readonly` constrains a declared shape, while `as const` freezes inferred literals and readonly-ness for a specific value.
- type guards vs assertion functions: type guards return booleans that narrow in conditionals; assertion functions throw on invalid input and narrow after they return.
- union literals vs `enum`: union literals fit this repo's style better for lightweight domain sets, while `enum` is a runtime construct with different tradeoffs.

## Recommended Reading Paths

### If You Know Older React But Not React 19

1. Start with [React terms](./react-terms.md).
2. Read the examples linked from `Suspense`, `lazy`, `useActionState`, `useOptimistic`, `useEffectEvent`, and hydration-related terms.
3. Open [../src/App.tsx](../src/App.tsx) and [../src/sampleCatalog.ts](../src/sampleCatalog.ts) after that so the app shell and sample registry make sense.

### If You Are Stronger In React Than In TypeScript

1. Read [React terms](./react-terms.md) first to understand the runtime model.
2. Then read [TypeScript terms](./typescript-terms.md) with focus on `satisfies`, template literal IDs, mapped types, conditional types, and the sample-specific tsconfig flags.
3. Use the linked sample files as your second pass instead of reading the guides like a glossary from top to bottom.

### If You Want A Repo-First Study Order

1. Read [../README.md](../README.md) for the map of the project.
2. Read [Reading index](./reading-index.md) for the fastest path through the annotated files.
3. Read [React terms](./react-terms.md).
4. Read [TypeScript terms](./typescript-terms.md).
5. Browse [../src/sampleCatalog.ts](../src/sampleCatalog.ts) and then open the linked sample files that match the terms you want to practice.

## Scope

These guides are based on the repository's documented sample coverage in [README.md](../README.md), [mini-samples.md](./mini-samples.md), and [src/sampleCatalog.ts](../src/sampleCatalog.ts). They are intentionally focused on the terms this codebase teaches rather than trying to be a complete React or TypeScript reference manual.

## Suggested Order

1. Read [React terms](./react-terms.md) first if you are coming from older React and want to understand the runtime model used in this project.
2. Read [TypeScript terms](./typescript-terms.md) next to understand the type-level patterns that shape the sample code.
3. Keep each guide open while exploring the linked implementation files in the app and sample catalog.
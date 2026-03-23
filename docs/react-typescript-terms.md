# React and TypeScript Terms

This folder now splits the glossary by subject so the learning path matches the repository structure more closely.

## What This Folder Is For

Use these guides as a companion while reading the app and sample files. The goal is not to define every React or TypeScript term in the ecosystem. The goal is to explain the terms this repository actually demonstrates, then point you straight at the example file where each idea shows up.

## Guides

- [Reading index](./reading-index.md): the shortest recommended path through the repository now that the code has more rationale comments.
- [React terms](./react-terms.md): React client APIs, DOM APIs, server APIs, compiler and lint concepts, and the edge-case terms demonstrated by this repo.
- [TypeScript terms](./typescript-terms.md): TypeScript language features, interop topics, compiler options, and type-system edge cases demonstrated by this repo.

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
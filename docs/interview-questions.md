# Interview Questions

These questions are tied directly to files in this repository so you can practice answering from concrete code instead of memorizing abstract definitions.

## React Questions

### How would you explain the difference between `useActionState` and `useOptimistic`?

Good answer shape:

- `useActionState` owns the real async lifecycle and final success or error state
- `useOptimistic` renders a temporary likely-next UI before the async work finishes
- they solve related but different problems and are often used together

Repo example: [../src/App.tsx](../src/App.tsx)

### When would you choose `useState` instead of `useReducer`?

Good answer shape:

- use `useState` for small, direct state updates
- use `useReducer` when transitions are easier to express as domain actions
- reducers become more valuable when many updates affect one shared state model

Repo examples: [../src/App.tsx](../src/App.tsx), [../src/samples/ReducerBoardSample.tsx](../src/samples/ReducerBoardSample.tsx)

### Why is `key={index}` dangerous?

Good answer shape:

- React tracks identity by key, not by item contents
- `key={index}` breaks when order changes because state follows DOM position
- stable ids preserve intended state ownership across reorders

Repo example: [../src/samples/KeyIdentitySample.tsx](../src/samples/KeyIdentitySample.tsx)

### When do `memo`, `useMemo`, and `useCallback` actually help?

Good answer shape:

- `memo` helps only when props are stable and the skipped render matters
- `useMemo` caches computed values, not component renders
- `useCallback` stabilizes function identity when another memoization boundary depends on it
- unnecessary memoization can add complexity without benefit

Repo examples: [../src/samples/MemoLabSample.tsx](../src/samples/MemoLabSample.tsx), [../src/samples/ContextIdentitySample.tsx](../src/samples/ContextIdentitySample.tsx)

### What is the difference between `Suspense` and an Error Boundary?

Good answer shape:

- `Suspense` handles waiting states
- an Error Boundary handles thrown render errors
- a failed lazy import needs an Error Boundary, not just a Suspense fallback

Repo example: [../src/samples/ErrorBoundarySample.tsx](../src/samples/ErrorBoundarySample.tsx)

## TypeScript Questions

### When would you use `satisfies` instead of `as`?

Good answer shape:

- `satisfies` verifies shape without throwing away narrow inference
- `as` is a stronger assertion used when runtime knowledge exists but TypeScript cannot prove it
- use `as const satisfies` for config-like static data when possible

Repo examples: [../src/catalog.ts](../src/catalog.ts), [../src/hydration/hydrationData.ts](../src/hydration/hydrationData.ts), [../src/samples/UtilityMappedSample.tsx](../src/samples/UtilityMappedSample.tsx)

### How would you explain `type` vs `interface`?

Good answer shape:

- `interface` fits extendable object contracts
- `type` fits unions, template literals, mapped types, conditional types, and aliases over non-object shapes
- consistency matters more than ideology if both are valid

Repo examples: [../src/catalog.ts](../src/catalog.ts), [../docs/typescript-terms.md](./typescript-terms.md)

### What is the difference between `field?: T` and `field: T | undefined`?

Good answer shape:

- the first allows the property to be omitted
- the second requires the property to exist but permits an undefined value
- `exactOptionalPropertyTypes` makes that distinction more meaningful

Repo examples: [./typescript-terms.md](./typescript-terms.md), [../node-samples/ts-advanced-tsconfig/src/index.ts](../node-samples/ts-advanced-tsconfig/src/index.ts)

### Why would you use `K extends string` in a generic helper?

Good answer shape:

- it restricts the generic to string-like inputs
- it preserves exact string literal types through the signature
- plain `key: string` loses that precision

Repo example: [../node-samples/ts-generic-inference/src/index.ts](../node-samples/ts-generic-inference/src/index.ts)

## Architecture And Debugging Questions

### How is the sample system organized so UI, routing, and tests do not drift apart?

Good answer shape:

- one catalog is the source of truth
- runtime routing resolves from that same catalog
- component implementations and artifact-backed samples are verified through tests

Repo examples: [../src/sampleCatalog.ts](../src/sampleCatalog.ts), [../src/sampleRuntime.ts](../src/sampleRuntime.ts), [../src/sampleImplementations.ts](../src/sampleImplementations.ts), [../src/implementedSampleArtifacts.ts](../src/implementedSampleArtifacts.ts)

### How would you explain a hydration mismatch in an interview?

Good answer shape:

- the server renders one thing and the client renders something different for the same initial tree
- React warns because hydration expects to attach to matching markup
- time-based values, random values, or environment-only branches are common causes

Repo examples: [../src/samples/HydrationMismatchDemo.ts](../src/samples/HydrationMismatchDemo.ts), [../src/hydration/HydrationHintsApp.tsx](../src/hydration/HydrationHintsApp.tsx)

## How To Practice

1. Pick one question.
2. Answer it out loud in under two minutes.
3. Re-open the linked repo files and tighten the answer until it is specific and defensible.
4. Repeat until you can explain both the API and the tradeoff.
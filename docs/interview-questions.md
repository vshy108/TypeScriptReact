# Interview Questions

These questions are tied directly to files in this repository so you can practice answering from concrete code instead of memorizing abstract definitions.

Companion guide: [./interview-sample-answers.md](./interview-sample-answers.md)

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

### How would you explain `useDeferredValue` vs `useTransition`?

Good answer shape:

- `useTransition` marks a state update as non-urgent when you schedule it
- `useDeferredValue` lets a derived value lag behind a more urgent source value
- one is about how an update is enqueued, the other is about how a value is consumed

Repo example: [../src/App.tsx](../src/App.tsx)

### What causes a stale closure in React, and how do you fix it?

Good answer shape:

- functions created during render capture the state from that render
- delayed work like `setTimeout`, intervals, or promise callbacks often exposes the bug
- functional updaters or refs fix it depending on whether you need the next state or the latest mutable value

Repo example: [../src/samples/StaleClosureSample.tsx](../src/samples/StaleClosureSample.tsx)

### When would you choose `useLayoutEffect` or `useInsertionEffect` over `useEffect`?

Good answer shape:

- `useEffect` is the default for subscriptions and async side effects after paint
- `useLayoutEffect` is for DOM reads or writes that must happen before paint to avoid flicker
- `useInsertionEffect` is a niche hook for injecting styles before layout work runs

Repo example: [../src/samples/LayoutEffectsSample.tsx](../src/samples/LayoutEffectsSample.tsx)

### Why is `ref.current` unavailable during render, and when do callback refs help?

Good answer shape:

- refs are attached during commit, so reading `ref.current` in render is too early
- `useRef` is good for persistent mutable cells and imperative handles after commit
- callback refs help when you need to react exactly when a node mounts or unmounts

Repo example: [../src/samples/RefTimingSample.tsx](../src/samples/RefTimingSample.tsx)

### How does `use()` with `Suspense` differ from manual loading state?

Good answer shape:

- `use()` lets render read a promise directly and suspend instead of branching on `isLoading`
- the nearest `Suspense` boundary owns the waiting UI
- promise identity matters, so a cache is usually needed to avoid creating a fresh pending promise every render

Repo example: [../src/samples/UseResourceSample.tsx](../src/samples/UseResourceSample.tsx)

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

### How do distributive conditional types work, and how do you turn distribution off?

Good answer shape:

- a conditional type distributes when a naked type parameter receives a union
- this is why helpers like `Extract` and `Exclude` work member by member
- wrapping the type parameter, such as `[T] extends [U]`, checks the union as a whole and stops distribution

Repo example: [../src/samples/ConditionalDistributivitySample.tsx](../src/samples/ConditionalDistributivitySample.tsx)

### What does `infer` actually buy you in utility types?

Good answer shape:

- `infer` lets a conditional type capture part of another type instead of rebuilding it manually
- it is how utilities like `ReturnType`, `Awaited`, and element extraction patterns work
- it is especially useful when the output shape should stay derived from a function, promise, or container type

Repo examples: [../src/samples/ConditionalDistributivitySample.tsx](../src/samples/ConditionalDistributivitySample.tsx), [../src/samples/UtilityMappedSample.tsx](../src/samples/UtilityMappedSample.tsx)

### When are overloads better than a union parameter?

Good answer shape:

- overloads help when different call shapes should produce different return types or argument rules
- a plain union parameter is simpler when the implementation and return type are truly uniform
- overload order matters because TypeScript picks the first compatible overload

Repo examples: [../src/samples/FunctionsTuplesSample.tsx](../src/samples/FunctionsTuplesSample.tsx), [../node-samples/ts-generic-inference/src/index.ts](../node-samples/ts-generic-inference/src/index.ts)

### Why are labeled tuples useful instead of a plain array type?

Good answer shape:

- tuples preserve slot count and order while labeled tuples also document what each slot means
- they work well for fixed-shape protocol data and for spreading into typed function parameters
- a plain array loses positional meaning and usually widens too far for this kind of API

Repo example: [../src/samples/FunctionsTuplesSample.tsx](../src/samples/FunctionsTuplesSample.tsx)

### What is the difference between TypeScript `private` and JavaScript `#private`?

Good answer shape:

- TypeScript `private` is a compile-time restriction only
- JavaScript `#private` is enforced at runtime and cannot be bypassed with bracket access
- use `#private` when you need real runtime encapsulation, not just editor and compiler checks

Repo example: [../src/samples/PrivateFieldsSample.tsx](../src/samples/PrivateFieldsSample.tsx)

### When are template literal types powerful, and when do they become a problem?

Good answer shape:

- they are great for deriving string APIs like event names, route params, and naming conventions from smaller literals
- they compose well with mapped types and `infer`
- large cartesian products can explode into huge unions and slow the type checker down

Repo example: [../node-samples/ts-template-literals/src/index.ts](../node-samples/ts-template-literals/src/index.ts)

## Architecture And Debugging Questions

### How is the sample system organized so UI, routing, and tests do not drift apart?

Good answer shape:

- one catalog is the source of truth
- runtime routing resolves from that same catalog
- component implementations and artifact-backed samples are verified through tests

Repo examples: [../src/sampleCatalog.ts](../src/sampleCatalog.ts), [../src/sampleRuntime.ts](../src/sampleRuntime.ts), [../src/sampleImplementations.ts](../src/sampleImplementations.ts), [../src/implementedSampleArtifacts.ts](../src/implementedSampleArtifacts.ts)

### Why does this repo split samples across current-app, isolated-route, separate-entry, and node-only surfaces?

Good answer shape:

- each surface represents a different execution contract, not just a display preference
- isolated-route samples can render inside the app shell, while separate-entry and node-only samples need their own runtime boundary
- the split keeps examples honest about what must run in a browser route, a dedicated HTML entry, or a standalone TypeScript workspace

Repo examples: [../src/sampleCatalog.ts](../src/sampleCatalog.ts), [../src/implementedSampleArtifacts.ts](../src/implementedSampleArtifacts.ts)

### What would you inspect first if the selected sample does not match the URL hash?

Good answer shape:

- start with the routing helper, not the UI component tree
- verify slug generation, hash parsing, and default fallback behavior before assuming render state is wrong
- then confirm the catalog id actually maps to a concrete component or artifact entry

Repo examples: [../src/sampleRuntime.ts](../src/sampleRuntime.ts), [../src/sampleCatalog.ts](../src/sampleCatalog.ts), [../src/sampleImplementations.ts](../src/sampleImplementations.ts)

### How do the tests prove an implemented sample is actually real?

Good answer shape:

- implemented samples are split by surface because each surface has a different proof of existence
- isolated-route samples must map to a component and render through the stage
- artifact-backed samples must publish their entry files and verification commands so docs and tests can point at something concrete

Repo examples: [../src/test/samples.test.tsx](../src/test/samples.test.tsx), [../src/sampleImplementations.ts](../src/sampleImplementations.ts), [../src/implementedSampleArtifacts.ts](../src/implementedSampleArtifacts.ts)

### How would you explain verifying async UI behavior instead of only asserting the final state?

Good answer shape:

- prove the intermediate states, not just the end result
- control time and mocked outcomes so loading, failure, and retry paths are all observable
- the goal is to verify user-visible behavior transitions, not just internal function calls

Repo example: [../src/test/async-ui-verification-sample.test.tsx](../src/test/async-ui-verification-sample.test.tsx)

### How would you explain a hydration mismatch in an interview?

Good answer shape:

- the server renders one thing and the client renders something different for the same initial tree
- React warns because hydration expects to attach to matching markup
- time-based values, random values, or environment-only branches are common causes

Repo examples: [../src/samples/HydrationMismatchDemo.ts](../src/samples/HydrationMismatchDemo.ts), [../src/hydration/HydrationHintsApp.tsx](../src/hydration/HydrationHintsApp.tsx)

### Why are the hydration examples separate entry points instead of ordinary routed components?

Good answer shape:

- hydration requires pre-rendered HTML that already exists before the client attaches
- a normal SPA route would only demonstrate client mount, not real hydration behavior
- separating the entry keeps the sample focused on matching markup, `hydrateRoot()`, and post-hydration updates

Repo examples: [../src/hydration/HydrationHintsApp.tsx](../src/hydration/HydrationHintsApp.tsx), [../src/implementedSampleArtifacts.ts](../src/implementedSampleArtifacts.ts)

## How To Practice

1. Pick one question.
2. Answer it out loud in under two minutes.
3. Check [./interview-sample-answers.md](./interview-sample-answers.md) only after your first attempt.
4. Re-open the linked repo files and tighten the answer until it is specific and defensible.
5. Repeat until you can explain both the API and the tradeoff.
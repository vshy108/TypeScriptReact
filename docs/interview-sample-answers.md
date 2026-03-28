# Interview Sample Answers

Use this after you attempt the questions in [./interview-questions.md](./interview-questions.md) yourself.

These are intentionally short. They are meant to model a solid interview answer shape, not to replace reading the linked repo files.

## React Answers

### How would you explain the difference between `useActionState` and `useOptimistic`?

`useActionState` owns the real async submission flow. It gives you the authoritative success or error result after the action finishes. `useOptimistic` is different: it lets the UI temporarily show the likely next state before the server or async work confirms it. In [../src/App.tsx](../src/App.tsx), they work together because the task appears optimistically first, then the real action reconciles the final saved state.

### When would you choose `useState` instead of `useReducer`?

I would use `useState` when updates are small and direct, like toggles, input text, or one-off local values. I switch to `useReducer` when state transitions are easier to describe as domain actions and several updates affect one shared model. You can see that contrast between the lighter local state in [../src/App.tsx](../src/App.tsx) and the action-driven structure in [../src/samples/ReducerBoardSample.tsx](../src/samples/ReducerBoardSample.tsx).

### Why is `key={index}` dangerous?

React uses keys to decide which child keeps which identity across renders. If the key is just the array index, state follows position rather than the actual item, so reorders can attach the wrong state to the wrong row. [../src/samples/KeyIdentitySample.tsx](../src/samples/KeyIdentitySample.tsx) is a good example because it shows why stable ids preserve the intended ownership.

### When do `memo`, `useMemo`, and `useCallback` actually help?

They help only when there is a real memoization boundary to benefit from stable values. `memo` skips a component render when props are unchanged, `useMemo` caches a computed value, and `useCallback` stabilizes a function identity for code that depends on referential equality. In [../src/samples/MemoLabSample.tsx](../src/samples/MemoLabSample.tsx) and [../src/samples/ContextIdentitySample.tsx](../src/samples/ContextIdentitySample.tsx), the useful question is not “can I memoize this?” but “what expensive or identity-sensitive work am I actually avoiding?”

### What is the difference between `Suspense` and an Error Boundary?

`Suspense` handles waiting, not failure. If a component suspends on a pending resource or lazy import, `Suspense` shows a fallback until that wait resolves. If rendering throws an actual error, you need an Error Boundary to catch it, which is why [../src/samples/ErrorBoundarySample.tsx](../src/samples/ErrorBoundarySample.tsx) separates loading behavior from failure behavior.

### How would you explain `useDeferredValue` vs `useTransition`?

`useTransition` changes how I schedule an update: I mark some work as non-urgent so urgent UI like typing can stay responsive. `useDeferredValue` changes how I consume a value: I let derived work lag behind a more urgent source value. In [../src/App.tsx](../src/App.tsx), that means category changes can be transitioned while fast search input can feed a deferred query.

### What causes a stale closure in React, and how do you fix it?

The bug happens when a function created during one render runs later and still reads the state from that older render. Timers, intervals, and promise callbacks are where this usually shows up. In [../src/samples/StaleClosureSample.tsx](../src/samples/StaleClosureSample.tsx), the fix is either a functional updater when the next state depends on previous state, or a ref when delayed code needs the latest current value.

### When would you choose `useLayoutEffect` or `useInsertionEffect` over `useEffect`?

`useEffect` is the default because it runs after paint and is the right place for subscriptions and async side effects. I reach for `useLayoutEffect` only when DOM measurement or mutation must happen before paint to avoid visible flicker. `useInsertionEffect` is narrower still: it exists for style injection that must happen before layout work, which [../src/samples/LayoutEffectsSample.tsx](../src/samples/LayoutEffectsSample.tsx) demonstrates clearly.

### Why is `ref.current` unavailable during render, and when do callback refs help?

Refs are populated during commit, so reading `ref.current` during render is too early. A normal object ref is good when I need a persistent mutable handle after mount. A callback ref is useful when I need to react right when a node appears or disappears, such as measuring it immediately or integrating imperative code, which is what [../src/samples/RefTimingSample.tsx](../src/samples/RefTimingSample.tsx) shows.

### How does `use()` with `Suspense` differ from manual loading state?

With `use()`, render reads a promise directly and React suspends that subtree until the promise resolves. That means the loading UI is owned by the nearest `Suspense` boundary instead of by local `isLoading` branches. [../src/samples/UseResourceSample.tsx](../src/samples/UseResourceSample.tsx) also shows the important cache rule: if each render creates a new pending promise, the boundary never settles cleanly.

## TypeScript Answers

### When would you use `satisfies` instead of `as`?

I use `satisfies` when I want TypeScript to verify that a value matches a required shape without widening away its useful literal inference. I reserve `as` for cases where runtime knowledge exists but the compiler cannot prove it. In config-heavy code like [../src/catalog.ts](../src/catalog.ts) and [../src/samples/UtilityMappedSample.tsx](../src/samples/UtilityMappedSample.tsx), `as const satisfies` is usually the safer and more expressive choice.

### How would you explain `type` vs `interface`?

I use `interface` for extendable object contracts and `type` for unions, mapped types, conditional types, template literal types, and aliases over non-object shapes. Both can model plain objects, so the real decision is whether I need the extra expressiveness of type aliases or the extension-oriented ergonomics of interfaces. This repo uses both that way in [../src/catalog.ts](../src/catalog.ts) and [./typescript-terms.md](./typescript-terms.md).

### What is the difference between `field?: T` and `field: T | undefined`?

`field?: T` means the property can be omitted entirely. `field: T | undefined` means the property must exist, but its value may be `undefined`. That difference matters more when strict config flags are enabled, which is why [./typescript-terms.md](./typescript-terms.md) and [../node-samples/ts-advanced-tsconfig/src/index.ts](../node-samples/ts-advanced-tsconfig/src/index.ts) are good places to anchor the explanation.

### Why would you use `K extends string` in a generic helper?

That constraint keeps the generic in the string-literal world instead of widening the signature to an arbitrary string too early. It lets the helper preserve exact literals through the return type, which is often the whole point of the abstraction. [../node-samples/ts-generic-inference/src/index.ts](../node-samples/ts-generic-inference/src/index.ts) shows how these constraints protect inference quality.

### How do distributive conditional types work, and how do you turn distribution off?

If a conditional type receives a union through a naked type parameter, TypeScript evaluates the condition for each union member separately. That is why utilities like `Extract` and `Exclude` behave member by member. If I want to stop that and test the union as one whole type, I wrap it, for example with `[T] extends [U]`, exactly like [../src/samples/ConditionalDistributivitySample.tsx](../src/samples/ConditionalDistributivitySample.tsx) demonstrates.

### What does `infer` actually buy you in utility types?

`infer` lets a conditional type capture part of another type instead of forcing me to rebuild that structure manually. That is how helpers like `ReturnType`, promise unwrapping, or element extraction work. In [../src/samples/ConditionalDistributivitySample.tsx](../src/samples/ConditionalDistributivitySample.tsx) and [../src/samples/UtilityMappedSample.tsx](../src/samples/UtilityMappedSample.tsx), the benefit is that the derived type stays coupled to the source signature rather than drifting into a copy.

### When are overloads better than a union parameter?

I prefer overloads when different call shapes should produce meaningfully different typing rules or return types. If the implementation and the return type are uniform, a union parameter is usually simpler. [../src/samples/FunctionsTuplesSample.tsx](../src/samples/FunctionsTuplesSample.tsx) and [../node-samples/ts-generic-inference/src/index.ts](../node-samples/ts-generic-inference/src/index.ts) also show the key caveat: overload order matters because TypeScript picks the first compatible signature.

### Why are labeled tuples useful instead of a plain array type?

Tuples preserve fixed length and positional meaning, while labeled tuples also document what each slot represents. That makes them useful for protocol-like data or argument spreading where position is part of the contract. [../src/samples/FunctionsTuplesSample.tsx](../src/samples/FunctionsTuplesSample.tsx) uses them well because method, path, and retries are not just “some array items.”

### What is the difference between TypeScript `private` and JavaScript `#private`?

TypeScript `private` is enforced by the type checker but erased at runtime, so it is not true encapsulation. JavaScript `#private` is enforced by the runtime and cannot be accessed from outside through bracket notation or casts. [../src/samples/PrivateFieldsSample.tsx](../src/samples/PrivateFieldsSample.tsx) is a strong interview example because it makes the runtime difference visible instead of treating privacy as just syntax.

### When are template literal types powerful, and when do they become a problem?

They are powerful when I want to derive string APIs, route params, handler names, or naming conventions from smaller literal building blocks. They become a problem when large cartesian products create huge unions that slow the checker or hit complexity limits. [../node-samples/ts-template-literals/src/index.ts](../node-samples/ts-template-literals/src/index.ts) shows both the expressive side and the performance cost.

## Architecture And Debugging Answers

### How is the sample system organized so UI, routing, and tests do not drift apart?

The core idea is that the catalog is the source of truth. Routing resolves sample ids from that same metadata, rendering uses the same ids to find component implementations, and tests verify that implemented entries really map to either a component or an artifact. You can trace that contract across [../src/sampleCatalog.ts](../src/sampleCatalog.ts), [../src/sampleRuntime.ts](../src/sampleRuntime.ts), [../src/sampleImplementations.ts](../src/sampleImplementations.ts), and [../src/implementedSampleArtifacts.ts](../src/implementedSampleArtifacts.ts).

### Why does this repo split samples across current-app, isolated-route, separate-entry, and node-only surfaces?

Those are execution contracts, not presentation labels. Some samples can live inside the main app, some need a dedicated routed component, some require their own HTML entry because they depend on true hydration behavior, and some only make sense as standalone TypeScript workspaces. [../src/sampleCatalog.ts](../src/sampleCatalog.ts) and [../src/implementedSampleArtifacts.ts](../src/implementedSampleArtifacts.ts) make that boundary explicit instead of pretending every example can be rendered the same way.

### What would you inspect first if the selected sample does not match the URL hash?

I would start at the routing boundary rather than the visible component tree. First I would verify slug creation, hash parsing, and fallback logic in [../src/sampleRuntime.ts](../src/sampleRuntime.ts). After that I would confirm the resolved id exists in [../src/sampleCatalog.ts](../src/sampleCatalog.ts) and actually maps to a component or artifact in [../src/sampleImplementations.ts](../src/sampleImplementations.ts).

### How do the tests prove an implemented sample is actually real?

They check the proof appropriate to each sample surface. Route-backed samples must render through the stage, while artifact-backed samples must have concrete entries that point to their files and verification commands. [../src/test/samples.test.tsx](../src/test/samples.test.tsx) is strong because it verifies the coverage contract instead of only testing a few happy-path components.

### How would you explain verifying async UI behavior instead of only asserting the final state?

I would say the important thing is to prove the transitions the user experiences, not just the end result. That means controlling time and mock outcomes so loading, failure, and retry states can all be observed deterministically. [../src/test/async-ui-verification-sample.test.tsx](../src/test/async-ui-verification-sample.test.tsx) is a good example because it asserts the intermediate states explicitly.

### How would you explain a hydration mismatch in an interview?

It means the client tried to hydrate markup that does not match what the server originally rendered for the same tree. React warns because hydration expects to attach behavior onto matching HTML, not replace unexpectedly different output. In this repo, [../src/samples/HydrationMismatchDemo.ts](../src/samples/HydrationMismatchDemo.ts) and [../src/hydration/HydrationHintsApp.tsx](../src/hydration/HydrationHintsApp.tsx) help anchor common causes like time-based values, random output, and environment-only branching.

### Why are the hydration examples separate entry points instead of ordinary routed components?

Real hydration starts with existing server-rendered HTML already in the document before the client code runs. A normal SPA route would only show a fresh client mount, which misses the actual hydration contract. That is why [../src/hydration/HydrationHintsApp.tsx](../src/hydration/HydrationHintsApp.tsx) is paired with artifact metadata in [../src/implementedSampleArtifacts.ts](../src/implementedSampleArtifacts.ts) instead of being treated like an ordinary route sample.
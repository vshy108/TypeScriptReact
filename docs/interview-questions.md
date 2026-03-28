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

### How does Context prevent or cause unnecessary re-renders?

Good answer shape:

- every consumer re-renders when the provider value changes identity
- stabilizing the value with `useMemo` filters out incidental re-renders
- splitting contexts by update frequency can help when one part changes often

Repo examples: [../src/samples/ContextIdentitySample.tsx](../src/samples/ContextIdentitySample.tsx), [../src/samples/ContextThemeSample.tsx](../src/samples/ContextThemeSample.tsx)

### What is `createPortal` for, and when does `flushSync` matter?

Good answer shape:

- `createPortal` renders children into a DOM node outside the parent tree, useful for modals and overlays
- `flushSync` forces a state update to commit synchronously so a DOM read right after sees the new value
- portals escape CSS stacking-context surprises while `flushSync` gives imperative control when batching hides the update

Repo example: [../src/samples/PortalModalSample.tsx](../src/samples/PortalModalSample.tsx)

### How do you handle race conditions in debounced async effects?

Good answer shape:

- the cleanup function of `useEffect` is the primary cancellation mechanism
- `AbortController` lets you cancel fetch requests when the query changes before the response arrives
- without cleanup, responses from stale queries can overwrite the current result

Repo example: [../src/samples/DebouncedSearchRaceSample.tsx](../src/samples/DebouncedSearchRaceSample.tsx)

### How does `useFormStatus` avoid prop-drilling pending state?

Good answer shape:

- `useFormStatus` lets any descendant of a `<form>` read pending state without receiving it as a prop
- it scopes status to the nearest enclosing form action
- it is useful when submit buttons or indicators live far from the form shell

Repo example: [../src/samples/FormStatusSample.tsx](../src/samples/FormStatusSample.tsx)

### What is the `Activity` component and when would you use it?

Good answer shape:

- `Activity` controls whether a subtree is visible or hidden while preserving its React state
- hidden activities skip paint and layout cost but keep state alive for instant reveal
- it is useful for tabs, priority panels, and off-screen content that should remain warm

Repo example: [../src/samples/ActivityTransitionSample.tsx](../src/samples/ActivityTransitionSample.tsx)

### When would you use `useSyncExternalStore` instead of `useState`?

Good answer shape:

- `useSyncExternalStore` is for reading state that lives outside React, such as browser APIs, third-party stores, or shared modules
- it requires a `subscribe`, `getSnapshot`, and optionally a `getServerSnapshot` function
- it avoids tearing between concurrent renders because React reads a consistent snapshot

Repo example: [../src/releaseStore.ts](../src/releaseStore.ts)

### What does `useEffectEvent` solve that `useEffect` alone cannot?

Good answer shape:

- it lets a stable effect call a function that always reads the latest props or state without re-subscribing
- it avoids adding values to the dependency array that would cause the effect to restart
- the event function runs with fresh values even though the effect itself has an empty or minimal dependency list

Repo example: [../src/App.tsx](../src/App.tsx)

### What does the React Compiler do, and how do its directives work?

Good answer shape:

- the compiler automatically memoizes components and hooks at build time so you write plain code without manual `useMemo` or `useCallback`
- `"use memo"` opts a component into compilation and `"use no memo"` opts it out
- it eliminates a whole class of stale-reference bugs but requires a Babel or SWC plugin

Repo examples: [../src/samples/ReactCompilerDemo.ts](../src/samples/ReactCompilerDemo.ts), [../node-samples/react-compiler/src/reportCompilerDirectives.ts](../node-samples/react-compiler/src/reportCompilerDirectives.ts)

### What are the key React ESLint rules you should never disable?

Good answer shape:

- `exhaustive-deps` keeps dependency arrays honest and prevents stale closure bugs
- `rules-of-hooks` ensures hooks are called unconditionally at the top level
- stable references like `setState` and `dispatch` do not need to appear in deps

Repo examples: [../src/samples/ReactLintRulesDemo.ts](../src/samples/ReactLintRulesDemo.ts), [../node-samples/react-lint-rules/src/reportLintRules.ts](../node-samples/react-lint-rules/src/reportLintRules.ts)

### How do `'use client'` and `'use server'` directives define component boundaries?

Good answer shape:

- in an RSC framework, components are server components by default
- `'use client'` marks a file as a client boundary that can use hooks and browser events
- `'use server'` marks functions as server actions callable from the client through the framework transport

Repo examples: [../src/samples/ServerComponentsDemo.ts](../src/samples/ServerComponentsDemo.ts), [../node-samples/react-server-components/src/reportServerComponentBoundaries.ts](../node-samples/react-server-components/src/reportServerComponentBoundaries.ts)

### How does `lazy()` with `Suspense` implement code splitting?

Good answer shape:

- `lazy()` wraps a dynamic `import()` so React loads the module only when the component is first rendered
- `Suspense` shows a fallback while the chunk loads
- an Error Boundary is still needed in case the import fails

Repo example: [../src/App.tsx](../src/App.tsx)

### How would you build an accessible modal dialog in React?

Good answer shape:

- label the dialog with `aria-labelledby` and optionally `aria-describedby`
- trap focus inside the dialog, move focus in on open, and return focus to the trigger on close
- Escape should dismiss the dialog without requiring `npm install` of a library

Repo example: [../src/samples/AccessibleDialogSample.tsx](../src/samples/AccessibleDialogSample.tsx)

### What does an accessible custom listbox require?

Good answer shape:

- use `role="listbox"` and `role="option"` with `aria-activedescendant` to track the focused option
- Arrow keys, Home, and End must navigate through options without a pointer
- Enter or Space selects the current active option

Repo example: [../src/samples/AccessibleListboxSample.tsx](../src/samples/AccessibleListboxSample.tsx)

### How should form validation errors be announced to screen readers?

Good answer shape:

- each invalid field needs `aria-invalid` and `aria-describedby` pointing to its error message
- a `role="alert"` summary announces errors immediately when the form is submitted
- on submit failure, focus should move to the first invalid field so keyboard users can fix it

Repo example: [../src/samples/AccessibleFormErrorsSample.tsx](../src/samples/AccessibleFormErrorsSample.tsx)

### How do you test async UI behavior deterministically?

Good answer shape:

- use fake timers and mocked responses so loading, success, and error paths are all reproducible
- assert intermediate states like the loading indicator before advancing the timer
- exercise both the failure and retry paths, not just the happy path

Repo example: [../src/samples/AsyncUiVerificationSample.tsx](../src/samples/AsyncUiVerificationSample.tsx)

### How would you build a type-safe generic React component?

Good answer shape:

- define a baseline constraint interface and use a generic parameter `T extends Baseline`
- the component accesses only the fields guaranteed by the constraint while callers pass their richer type
- a render-prop or callback like `renderMeta` keeps the generic component reusable across different item shapes

Repo example: [../src/components/FeatureGrid.tsx](../src/components/FeatureGrid.tsx)

### When would you use `useImperativeHandle` with ref-as-prop?

Good answer shape:

- it exposes a narrower imperative API instead of handing the raw DOM node to the parent
- React 19 supports ref as a regular prop, so `forwardRef` is no longer required
- the dependency array on `useImperativeHandle` must include any closed-over state that the methods read

Repo examples: [../src/components/CommandPalette.tsx](../src/components/CommandPalette.tsx), [../src/samples/RefTimingSample.tsx](../src/samples/RefTimingSample.tsx)

### What pattern do the feature panels use for domain state management?

Good answer shape:

- each feature panel extracts domain logic into a custom hook that owns loading, draft, and submit state
- the panel component receives the hook's return value and stays declarative
- discriminated unions or status strings keep the state machine explicit instead of juggling booleans

Repo examples: [../src/features/release-approval-workflow/ReleaseApprovalWorkflowPanel.tsx](../src/features/release-approval-workflow/ReleaseApprovalWorkflowPanel.tsx), [../src/features/release-approval-workflow/useReleaseApprovalWorkflow.ts](../src/features/release-approval-workflow/useReleaseApprovalWorkflow.ts)

### What component composition patterns does React favor over inheritance?

Good answer shape:

- children composition, render props, and higher-order components are the primary reuse strategies
- composition keeps components open to different content without modifying the component itself
- inheritance hierarchies are rarely needed because hooks and composition cover shared behavior

Repo examples: [../src/samples/ContextThemeSample.tsx](../src/samples/ContextThemeSample.tsx), [../src/components/FeatureGrid.tsx](../src/components/FeatureGrid.tsx)

### How do custom hooks extract and reuse stateful logic across components?

Good answer shape:

- a custom hook is a function starting with `use` that can call other hooks
- it encapsulates fetch logic, subscriptions, timers, or domain state so the component stays declarative
- the hook owns the lifecycle and the component owns the rendering

Repo examples: [../src/features/release-approval-workflow/useReleaseApprovalWorkflow.ts](../src/features/release-approval-workflow/useReleaseApprovalWorkflow.ts), [../src/samples/DebouncedSearchRaceSample.tsx](../src/samples/DebouncedSearchRaceSample.tsx)

### How do you decide where state should live — local, lifted, context, or external store?

Good answer shape:

- colocate state as close to its consumers as possible to avoid unnecessary re-renders
- lift state when siblings need access to the same value
- use context when deeply nested consumers share infrequently changing data like theme or auth
- use an external store when state must be read from outside React or shared across unrelated subtrees

Repo examples: [../src/samples/ContextThemeSample.tsx](../src/samples/ContextThemeSample.tsx), [../src/releaseStore.ts](../src/releaseStore.ts), [../src/features/release-approval-workflow/useReleaseApprovalWorkflow.ts](../src/features/release-approval-workflow/useReleaseApprovalWorkflow.ts)

### How does the React Profiler API help identify render bottlenecks?

Good answer shape:

- the `<Profiler>` component wraps a subtree and reports actual vs base render duration on each commit
- actual duration shows how long the render took after memoization, base duration shows cost without memoization
- `useDebugValue` labels custom hooks in DevTools so you can trace which hook contributes to slow renders

Repo example: [../src/samples/MemoLabSample.tsx](../src/samples/MemoLabSample.tsx)

### What composition techniques reduce re-renders without adding memoization?

Good answer shape:

- move state down into the component that actually needs it so siblings are not forced to re-render
- pass expensive subtrees as `children` so the parent re-renders without recreating the child tree
- split context providers by update frequency so fast-changing data does not re-render slow consumers

Repo examples: [../src/samples/ContextThemeSample.tsx](../src/samples/ContextThemeSample.tsx), [../src/samples/ContextIdentitySample.tsx](../src/samples/ContextIdentitySample.tsx), [../src/samples/MemoLabSample.tsx](../src/samples/MemoLabSample.tsx)

### How would you contribute to a shared design system or component library in React?

Good answer shape:

- design system components should be generic, accessible, and composable through props and children
- keyboard navigation, focus management, and ARIA attributes should be built in, not bolted on
- consistent tokens for color, spacing, and typography keep the visual language unified

Repo examples: [../src/samples/AccessibleDialogSample.tsx](../src/samples/AccessibleDialogSample.tsx), [../src/samples/AccessibleListboxSample.tsx](../src/samples/AccessibleListboxSample.tsx), [../src/samples/ContextThemeSample.tsx](../src/samples/ContextThemeSample.tsx)

### How would you handle controlled forms at scale without performance issues?

Good answer shape:

- isolate each field into its own component so a keystroke only re-renders that field, not the entire form
- lift validation and submission logic into a custom hook or parent while keeping field rendering local
- prefer `useFormStatus` for submission state instead of prop-drilling an `isSubmitting` flag

Repo examples: [../src/samples/FormStatusSample.tsx](../src/samples/FormStatusSample.tsx), [../src/samples/AccessibleFormErrorsSample.tsx](../src/samples/AccessibleFormErrorsSample.tsx)

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

### How do mapped types filter or rename keys with the `as` clause?

Good answer shape:

- mapping a key to `never` in the `as` clause removes it from the output type
- you can filter keys by their value type so only string-valued or number-valued properties survive
- template literal types in the `as` clause rename keys to follow patterns like `getName` or `setName`

Repo example: [../src/samples/MappedFilteringSample.tsx](../src/samples/MappedFilteringSample.tsx)

### How do you type API responses so loading, error, and success states are mutually exclusive?

Good answer shape:

- define a discriminated union with a `status` field that narrows to different payload shapes
- `loading` carries no data, `error` carries a message, and `success` carries the typed payload
- this prevents accessing `data` when the request is still loading or has failed

Repo examples: [../src/features/release-approval-workflow/types.ts](../src/features/release-approval-workflow/types.ts), [../src/features/release-approval-workflow/useReleaseApprovalWorkflow.ts](../src/features/release-approval-workflow/useReleaseApprovalWorkflow.ts), [../src/samples/AsyncUiVerificationSample.tsx](../src/samples/AsyncUiVerificationSample.tsx)

### How do type guards safely narrow unknown data at runtime boundaries?

Good answer shape:

- a type guard is a function returning `value is SomeType` that narrows the type after a truthy check
- at API boundaries, incoming data should be validated as `unknown` before narrowing
- discriminated union checks with `typeof` or `in` operator are simple built-in guards

Repo examples: [../src/features/release-approval-workflow/client.ts](../src/features/release-approval-workflow/client.ts), [../src/samples/ConditionalDistributivitySample.tsx](../src/samples/ConditionalDistributivitySample.tsx)

### How would you type a generic data-fetching hook that preserves the response shape?

Good answer shape:

- the hook takes a generic `T` for the response type so callers get a typed `data: T` back
- the hook returns a discriminated union or status-driven object so callers cannot access data before it exists
- `AbortController` integration should be typed so cleanup is part of the contract

Repo examples: [../src/features/release-approval-workflow/useReleaseApprovalWorkflow.ts](../src/features/release-approval-workflow/useReleaseApprovalWorkflow.ts), [../src/samples/DebouncedSearchRaceSample.tsx](../src/samples/DebouncedSearchRaceSample.tsx)

### How do branded types prevent accidental mixing of structurally identical primitives?

Good answer shape:

- branded types add a phantom `__brand` field to a primitive so two `string` types with different brands are incompatible
- template literal types like `` `release-${number}` `` achieve a similar effect by narrowing the string pattern
- this catches bugs like passing a user id where a release id is expected even though both are strings

Repo examples: [../src/features/release-approval-workflow/types.ts](../src/features/release-approval-workflow/types.ts), [../src/samples/ReducerBoardSample.tsx](../src/samples/ReducerBoardSample.tsx)

### When would you model domain objects with classes instead of plain interfaces?

Good answer shape:

- classes add runtime behavior, encapsulation, and `instanceof` narrowing that plain objects lack
- abstract classes enforce a subclass contract while sharing common runtime logic
- intersection types compose interfaces for view models without inheriting runtime behavior

Repo example: [../src/samples/ClassesModelsSample.tsx](../src/samples/ClassesModelsSample.tsx)

### How do recursive types model tree-shaped data, and what are their limits?

Good answer shape:

- a recursive interface references itself in a child property, letting TypeScript describe arbitrarily nested trees
- utility types like `DeepReadonly` or `DeepKeyPaths` recur over every nesting level
- deeply recursive types can hit the compiler's depth limit, and `as const` trees must stay within inference bounds

Repo example: [../src/samples/RecursiveTypesSample.tsx](../src/samples/RecursiveTypesSample.tsx)

### What is type variance, and when do `in`, `out`, and `in out` annotations matter?

Good answer shape:

- covariance means a more specific type can substitute for a less specific one in output position
- contravariance reverses the direction for input position (function parameters)
- explicit `in` and `out` annotations document and enforce variance, catching unsound assignments faster

Repo example: [../node-samples/ts-variance/src/index.ts](../node-samples/ts-variance/src/index.ts)

### When are enums appropriate, and when should you use union types instead?

Good answer shape:

- enums produce a runtime object with reverse mapping, which is useful when the value set must exist at runtime
- union types are lighter because they are erased and exist only at compile time
- `const enum` inlines values but has restrictions with `isolatedModules` and `verbatimModuleSyntax`

Repo example: [../node-samples/ts-advanced-runtime/src/index.ts](../node-samples/ts-advanced-runtime/src/index.ts)

### How do you type an untyped JavaScript module with `.d.ts` files?

Good answer shape:

- a `.d.ts` file alongside the JS module provides the type surface without modifying the source
- module augmentation and global declarations fill gaps for untyped vendor code
- triple-slash references pull in additional declaration files before type checking

Repo example: [../node-samples/ts-declarations/src/index.ts](../node-samples/ts-declarations/src/index.ts)

### How does JSDoc typing work with `allowJs` and `checkJs`?

Good answer shape:

- JSDoc annotations provide type information inside `.js` files that TypeScript can check
- `allowJs` lets TypeScript compile JS files, and `checkJs` turns on type checking for them
- a TypeScript file can import a JSDoc-annotated JS module and get full type safety without a `.d.ts`

Repo example: [../node-samples/ts-jsdoc-interop/src/index.ts](../node-samples/ts-jsdoc-interop/src/index.ts)

### What does `NoInfer<T>` do, and when is it useful?

Good answer shape:

- `NoInfer<T>` prevents TypeScript from inferring a type parameter from a specific argument position
- it forces inference to come from the other call site so the second argument must match, not widen, the first
- it solves inference-site conflicts without requiring the caller to provide an explicit type parameter

Repo example: [../node-samples/ts-generic-inference/src/index.ts](../node-samples/ts-generic-inference/src/index.ts)

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

### How does the streaming SSR workspace compare different server rendering modes?

Good answer shape:

- it runs `renderToString`, `renderToPipeableStream`, `prerender`, `resume`, and other APIs against the same component tree
- each mode produces a summary that shows whether Suspense fallbacks or resolved content appear in the output
- the comparison helps you choose the right rendering mode for your latency and SEO constraints

Repo example: [../server-samples/react-streaming-ssr/src/runAllModes.tsx](../server-samples/react-streaming-ssr/src/runAllModes.tsx)

### What does dynamic component resolution look like in the sample stage?

Good answer shape:

- the stage reads the current hash, resolves a catalog id, and looks up the component or artifact
- if a component exists, it renders inline; if an artifact exists, it shows the entry details; otherwise it shows a placeholder
- this pattern keeps routing, rendering, and fallback behavior centralized in one component

Repo example: [../src/components/MiniSampleStage.tsx](../src/components/MiniSampleStage.tsx)

### How would you debug a child component that re-renders more than expected?

Good answer shape:

- check prop identity first, not just state changes, because new objects or functions on each render break `memo`
- look at context provider values, because unstable provider objects force every consumer to re-render
- use the React Profiler or `useDebugValue` to see which effects or renders run on each cycle

Repo examples: [../src/samples/MemoLabSample.tsx](../src/samples/MemoLabSample.tsx), [../src/samples/ContextIdentitySample.tsx](../src/samples/ContextIdentitySample.tsx)

### How would you debug slow typing or filtering in a search UI?

Good answer shape:

- decide whether the bottleneck is expensive derived computation, unnecessary re-renders, or lack of scheduling
- `useDeferredValue` lets derived work lag behind urgent input so keystrokes stay responsive
- debouncing the search request prevents flooding the network while `AbortController` cancels stale requests

Repo examples: [../src/App.tsx](../src/App.tsx), [../src/samples/DebouncedSearchRaceSample.tsx](../src/samples/DebouncedSearchRaceSample.tsx)

## How To Practice

1. Pick one question.
2. Answer it out loud in under two minutes.
3. Check [./interview-sample-answers.md](./interview-sample-answers.md) only after your first attempt.
4. Re-open the linked repo files and tighten the answer until it is specific and defensible.
5. Repeat until you can explain both the API and the tradeoff.
# Reading Index

This is the shortest path through the repository now that the code has more rationale comments.

Use this guide when you want to learn from the repo without jumping randomly between files.

## Start Here

1. [../README.md](../README.md)
2. [../src/App.tsx](../src/App.tsx)
3. [../src/catalog.ts](../src/catalog.ts)
4. [../src/releaseStore.ts](../src/releaseStore.ts)
5. [../src/components/CommandPalette.tsx](../src/components/CommandPalette.tsx)
6. [../src/components/FeatureGrid.tsx](../src/components/FeatureGrid.tsx)

Why this order:
- `README.md` gives you the map.
- `App.tsx` shows the integrated React 19 flow in one file.
- `catalog.ts` explains the typed data the app is rendering.
- `releaseStore.ts` shows the external-store pattern behind `useSyncExternalStore()`.
- `CommandPalette.tsx` and `FeatureGrid.tsx` show two important reusable component patterns.

## React First

Read these if your main goal is modern React behavior:

1. [../src/App.tsx](../src/App.tsx)
2. [../src/samples/ContextThemeSample.tsx](../src/samples/ContextThemeSample.tsx)
3. [../src/samples/ContextIdentitySample.tsx](../src/samples/ContextIdentitySample.tsx)
4. [../src/samples/ReducerBoardSample.tsx](../src/samples/ReducerBoardSample.tsx)
5. [../src/samples/MemoLabSample.tsx](../src/samples/MemoLabSample.tsx)
6. [../src/samples/LayoutEffectsSample.tsx](../src/samples/LayoutEffectsSample.tsx)
7. [../src/samples/UseResourceSample.tsx](../src/samples/UseResourceSample.tsx)
8. [../src/samples/ActivityTransitionSample.tsx](../src/samples/ActivityTransitionSample.tsx)
9. [../src/samples/RefTimingSample.tsx](../src/samples/RefTimingSample.tsx)

What you will learn:
- how form actions, optimistic UI, deferred work, and effect events fit together
- when context design affects rendering cost
- when reducer, memoization, layout effects, and Suspense-based resource reads are worth using

## TypeScript First

Read these if your main goal is the type-system side of the repo:

1. [../src/catalog.ts](../src/catalog.ts)
2. [../src/components/FeatureGrid.tsx](../src/components/FeatureGrid.tsx)
3. [../src/samples/UtilityMappedSample.tsx](../src/samples/UtilityMappedSample.tsx)
4. [../src/samples/FunctionsTuplesSample.tsx](../src/samples/FunctionsTuplesSample.tsx)
5. [../src/samples/ClassesModelsSample.tsx](../src/samples/ClassesModelsSample.tsx)
6. [../src/samples/RecursiveTypesSample.tsx](../src/samples/RecursiveTypesSample.tsx)
7. [../src/samples/ConditionalDistributivitySample.tsx](../src/samples/ConditionalDistributivitySample.tsx)
8. [../src/samples/MappedFilteringSample.tsx](../src/samples/MappedFilteringSample.tsx)
9. [../src/samples/PrivateFieldsSample.tsx](../src/samples/PrivateFieldsSample.tsx)

What you will learn:
- `as const satisfies`, template literal ids, and generic component constraints
- utility types, conditional types, mapped types, overloads, recursive types, and class modeling

## Sample System

Read these if you want to understand how the repo organizes and proves all samples:

1. [../src/sampleCatalog.ts](../src/sampleCatalog.ts)
2. [../src/sampleRuntime.ts](../src/sampleRuntime.ts)
3. [../src/sampleImplementations.ts](../src/sampleImplementations.ts)
4. [../src/implementedSampleArtifacts.ts](../src/implementedSampleArtifacts.ts)
5. [../src/components/MiniSampleBoard.tsx](../src/components/MiniSampleBoard.tsx)
6. [../src/components/MiniSampleStage.tsx](../src/components/MiniSampleStage.tsx)

Why these matter:
- they show how one catalog drives UI, routing, implementation lookup, and test coverage
- they explain why some samples are inline React components while others are separate-entry, node-only, or comment-demo artifacts

## Hydration And SSR

Read these if you want the entry-point and rendering-runtime side of React:

1. [../src/hydration/hydrationData.ts](../src/hydration/hydrationData.ts)
2. [../src/hydration/HydrationHintsApp.tsx](../src/hydration/HydrationHintsApp.tsx)
3. [../src/hydration/bootHydrationSample.tsx](../src/hydration/bootHydrationSample.tsx)
4. [../src/hydration/main.tsx](../src/hydration/main.tsx)
5. [../server-samples/react-streaming-ssr/src/runAllModes.tsx](../server-samples/react-streaming-ssr/src/runAllModes.tsx)

Why this order:
- start with the static teaching data
- then read the hydrated app
- then read the boot code that registers hints and calls `hydrateRoot()`
- then move to the dedicated SSR workspace

## Tests As Contracts

Read these if you want to know how the repo prevents drift:

1. [../src/test/setup.ts](../src/test/setup.ts)
2. [../src/test/samples.test.tsx](../src/test/samples.test.tsx)
3. [../src/test/separate-entry-samples.test.ts](../src/test/separate-entry-samples.test.ts)
4. [../src/test/node-samples.test.ts](../src/test/node-samples.test.ts)
5. [../src/test/react-streaming-ssr.test.ts](../src/test/react-streaming-ssr.test.ts)

What to watch for:
- the tests are not only smoke tests
- they also enforce catalog integrity, artifact wiring, entry-file existence, and workspace-level type-check contracts

## If You Only Have 30 Minutes

Read this exact sequence:

1. [../README.md](../README.md)
2. [../src/App.tsx](../src/App.tsx)
3. [../src/releaseStore.ts](../src/releaseStore.ts)
4. [../src/components/CommandPalette.tsx](../src/components/CommandPalette.tsx)
5. [../src/samples/MemoLabSample.tsx](../src/samples/MemoLabSample.tsx)
6. [../src/samples/UseResourceSample.tsx](../src/samples/UseResourceSample.tsx)
7. [../src/sampleCatalog.ts](../src/sampleCatalog.ts)

That path gives you:
- the integrated app
- one external-state example
- one ref-as-prop example
- one render-control example
- one Suspense/resource example
- the sample registry that ties the whole repo together
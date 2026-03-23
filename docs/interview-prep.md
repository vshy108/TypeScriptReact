# Interview Prep

This guide turns the repository from an API reference into a practical React frontend interview study path.

Use it when you want to prepare for interviews, not just learn isolated syntax.

## What This Adds Beyond The Glossaries

The existing guides explain React and TypeScript terms well. Interview preparation usually also requires:

- explaining tradeoffs instead of definitions
- debugging incorrect behavior from symptoms
- discussing accessibility and testing expectations
- talking through architecture and state ownership decisions
- mapping code examples back to common interview questions

## Recommended Order

1. Read [./reading-index.md](./reading-index.md) to understand the repository structure quickly.
2. Read [./react-typescript-terms.md](./react-typescript-terms.md) for the vocabulary used across the repo.
3. Read [./interview-questions.md](./interview-questions.md) to practice answering common React + TypeScript frontend questions using repo examples.
4. Read [./interview-walkthroughs.md](./interview-walkthroughs.md) to practice product-style prompts that require a structured answer, not just a definition.
5. Read [./frontend-system-design.md](./frontend-system-design.md) to practice architecture and tradeoff discussions.
6. Read [./debugging-playbook.md](./debugging-playbook.md) to prepare for debugging and troubleshooting questions.

## Practical Interview Focus Areas

### React fundamentals and rendering

- state ownership
- effects and subscriptions
- memoization tradeoffs
- reconciliation and key stability
- async UI and optimistic updates

Primary repo files: [../src/App.tsx](../src/App.tsx), [../src/samples/ReducerBoardSample.tsx](../src/samples/ReducerBoardSample.tsx), [../src/samples/MemoLabSample.tsx](../src/samples/MemoLabSample.tsx), [../src/samples/KeyIdentitySample.tsx](../src/samples/KeyIdentitySample.tsx)

### TypeScript design and safety

- domain modeling
- inference boundaries
- narrowing and assertion patterns
- config flags that align types with runtime behavior

Primary repo files: [../src/catalog.ts](../src/catalog.ts), [../src/components/FeatureGrid.tsx](../src/components/FeatureGrid.tsx), [../src/samples/UtilityMappedSample.tsx](../src/samples/UtilityMappedSample.tsx), [../node-samples/ts-generic-inference/src/index.ts](../node-samples/ts-generic-inference/src/index.ts)

### Testing and verification

- what to test
- how to keep registries and samples from drifting
- when tests should prove behavior vs wiring

Primary repo files: [../src/test/samples.test.tsx](../src/test/samples.test.tsx), [../src/test/separate-entry-samples.test.ts](../src/test/separate-entry-samples.test.ts), [../src/test/node-samples.test.ts](../src/test/node-samples.test.ts)

### SSR, hydration, and runtime boundaries

- client vs server boundaries
- hydration mismatch causes
- when special infrastructure changes the design

Primary repo files: [../src/hydration/HydrationHintsApp.tsx](../src/hydration/HydrationHintsApp.tsx), [../src/hydration/bootHydrationSample.tsx](../src/hydration/bootHydrationSample.tsx), [../server-samples/react-streaming-ssr/src/runAllModes.tsx](../server-samples/react-streaming-ssr/src/runAllModes.tsx)

## Highest-Value Gaps To Study Next

The highest-priority interview walkthrough gap is now covered. The remaining work is lower-priority expansion, not a missing core study path.

## Related Guides

- [./interview-questions.md](./interview-questions.md)
- [./interview-walkthroughs.md](./interview-walkthroughs.md)
- [./frontend-system-design.md](./frontend-system-design.md)
- [./debugging-playbook.md](./debugging-playbook.md)
- [./interview-sample-roadmap.md](./interview-sample-roadmap.md)
# Frontend System Design

This guide helps you use the repository to practice the architecture and tradeoff discussions that frontend interviews often include.

## What Interviewers Usually Want

They usually do not want a perfect enterprise architecture. They want to know whether you can make clear decisions about:

- component boundaries
- state ownership
- data flow
- API and runtime boundaries
- testing seams
- accessibility and performance tradeoffs

## Repo Design Examples

### One source of truth for sample metadata

[../src/sampleCatalog.ts](../src/sampleCatalog.ts) centralizes ids, topics, status, surface, and summaries so the UI, routing, docs, and tests all describe the same set of samples.

Interview point: explain why duplicated registries drift and how one catalog reduces that risk.

### Separate runtime helpers from UI rendering

[../src/sampleRuntime.ts](../src/sampleRuntime.ts) keeps hash parsing and default-sample selection outside components.

Interview point: pure routing helpers are easier to reason about and easier to test than burying URL logic inside render functions.

### Split inline implementations from artifact-backed samples

[../src/sampleImplementations.ts](../src/sampleImplementations.ts) only maps samples that render as React components.

[../src/implementedSampleArtifacts.ts](../src/implementedSampleArtifacts.ts) covers samples that live on separate surfaces such as hydration entries, SSR workspaces, or node-only packages.

Interview point: not every feature belongs behind the same abstraction. Runtime boundaries should shape your design.

### Keep external state outside React when React does not own it

[../src/releaseStore.ts](../src/releaseStore.ts) models browser-backed state separately and exposes it through `useSyncExternalStore` from [../src/App.tsx](../src/App.tsx).

Interview point: if React is not the source of truth, your design should reflect that instead of mirroring everything into local component state.

## Questions To Practice

- Where should state live in this feature?
- What should be configuration vs runtime state?
- What would you test at the component level vs integration level?
- What parts should be reusable primitives and what parts should stay feature-specific?
- What would you extract into a custom hook?
- What should be server state vs client state?

## Most Practical Missing Architecture Exercise

The next best addition to this repo would be one small real-world feature slice with:

- `types.ts` for API and domain types
- `client.ts` for fetch logic
- `useFeature.ts` for state and request handling
- `FeaturePanel.tsx` for rendering
- `FeaturePanel.test.tsx` for integration-style tests

That would better prepare you for interviews that ask how you would structure a real product feature rather than a single isolated API demo.
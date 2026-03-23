# System Design Walkthroughs

This guide is for frontend interview rounds where you need to design a feature boundary, state model, or runtime architecture under time pressure.

Use it after [./frontend-system-design.md](./frontend-system-design.md). That guide explains the design principles in this repo. This one turns them into practice prompts with concrete answer shapes.

## How To Practice

1. Read one prompt.
2. Give a two to four minute answer out loud.
3. Re-open the linked files and check whether your answer is grounded in the repo.
4. Tighten the answer until it names the boundary, state ownership, testing seam, and tradeoff.

## Walkthrough 1: Design A Registry-Driven Sample Surface

Prompt:

"How would you structure a mini-app where docs, routing, and tests all need to stay in sync as new samples are added?"

Good answer shape:

- Start with one source of truth for sample metadata.
- Keep route resolution separate from rendering so lookup logic is testable.
- Split sample metadata from implementation mapping so non-React artifacts can still participate.
- Add tests that prove the registry and the rendered surface do not drift.

Repo anchors:

- [../src/sampleCatalog.ts](../src/sampleCatalog.ts)
- [../src/sampleRuntime.ts](../src/sampleRuntime.ts)
- [../src/sampleImplementations.ts](../src/sampleImplementations.ts)
- [../src/implementedSampleArtifacts.ts](../src/implementedSampleArtifacts.ts)
- [../src/test/samples.test.tsx](../src/test/samples.test.tsx)
- [../src/test/separate-entry-samples.test.ts](../src/test/separate-entry-samples.test.ts)

What to say explicitly:

- duplicated registries create silent drift.
- routing helpers are easier to test when they are not buried inside components.
- not every sample belongs behind the same runtime abstraction.

Strong follow-up answer:

"I would keep the catalog authoritative, then layer route parsing, implementation lookup, and artifact verification around it. That design makes it easy to add new sample surfaces without pretending they all render the same way."

## Walkthrough 2: Design A Small Product Feature Slice

Prompt:

"How would you structure a release workflow feature that loads data, supports mutations, and blocks publish until specific checks pass?"

Good answer shape:

- Keep the domain model explicit in `types.ts`.
- Put request and mutation behavior in a client module.
- Use a feature hook to coordinate loading, mutation state, and refresh logic.
- Keep the panel focused on rendering and user interaction.

Repo anchors:

- [../src/features/release-readiness/types.ts](../src/features/release-readiness/types.ts)
- [../src/features/release-readiness/client.ts](../src/features/release-readiness/client.ts)
- [../src/features/release-readiness/useReleaseReadiness.ts](../src/features/release-readiness/useReleaseReadiness.ts)
- [../src/features/release-readiness/ReleaseReadinessPanel.tsx](../src/features/release-readiness/ReleaseReadinessPanel.tsx)
- [../src/features/release-readiness/ReleaseReadinessPanel.test.tsx](../src/features/release-readiness/ReleaseReadinessPanel.test.tsx)

What to say explicitly:

- server-owned workflow state should remain authoritative.
- local UI state should mostly represent interaction state, not duplicate server truth.
- integration-style tests are higher value than isolated helper tests for this kind of feature.

Strong follow-up answer:

"I would start with a vertical slice rather than a shared feature framework. Once I saw real duplication across multiple workflow panels, I would extract shared request and mutation primitives from those proven patterns."

## Walkthrough 3: Decide Between Local State, Context, And External Store

Prompt:

"How would you decide whether data belongs in local component state, React context, or an external store?"

Good answer shape:

- Start by asking who owns the source of truth.
- Keep state local when one subtree owns it.
- Use context when multiple descendants need the same React-owned state.
- Use an external store when the source of truth exists outside React or must be subscribed to independently.

Repo anchors:

- [../src/releaseStore.ts](../src/releaseStore.ts)
- [../src/App.tsx](../src/App.tsx)
- [../src/samples/ContextThemeSample.tsx](../src/samples/ContextThemeSample.tsx)
- [../src/samples/ContextIdentitySample.tsx](../src/samples/ContextIdentitySample.tsx)

What to say explicitly:

- broad context values can become render-cost problems if identity is unstable.
- external stores are appropriate when React is a subscriber, not the owner.
- local state is usually the cheapest correct choice when sharing is unnecessary.

Strong follow-up answer:

"I would not lift state by default. I would first identify the narrowest owner, then only move outward if multiple consumers truly need synchronized access or the source of truth already exists outside React."

## Walkthrough 4: Design For Async UI Correctness

Prompt:

"How would you design a search or summary panel so loading, errors, retries, and stale responses are handled safely?"

Good answer shape:

- define the user-visible states first
- separate request identity from rendered data
- guard against stale responses or overlapping requests
- test the recovery path, not just the happy path

Repo anchors:

- [../src/samples/DebouncedSearchRaceSample.tsx](../src/samples/DebouncedSearchRaceSample.tsx)
- [../src/samples/AsyncUiVerificationSample.tsx](../src/samples/AsyncUiVerificationSample.tsx)
- [../src/test/async-ui-verification-sample.test.tsx](../src/test/async-ui-verification-sample.test.tsx)

What to say explicitly:

- async correctness is part of the design, not a later bug fix.
- retries and cancellation shape the state model.
- tests should prove visible behavior across loading, failure, and recovery.

Strong follow-up answer:

"I would model loading, success, error, and retry as explicit UI states, then make request identity or cancellation part of the data flow so an older response cannot overwrite a newer user intent."

## Walkthrough 5: Explain Runtime Boundary Tradeoffs

Prompt:

"How would you explain when a feature belongs in the main SPA, a separate hydration entry, or a dedicated server-rendering workspace?"

Good answer shape:

- choose the surface based on runtime requirements, not convenience alone
- keep hydration-specific boot code separate from the normal client entry
- move server-rendering concerns into a dedicated workspace when they require different execution or build assumptions
- keep shared teaching data or configuration portable across those boundaries when possible

Repo anchors:

- [../src/hydration/main.tsx](../src/hydration/main.tsx)
- [../src/hydration/bootHydrationSample.tsx](../src/hydration/bootHydrationSample.tsx)
- [../src/hydration/HydrationHintsApp.tsx](../src/hydration/HydrationHintsApp.tsx)
- [../server-samples/react-streaming-ssr/src/runAllModes.tsx](../server-samples/react-streaming-ssr/src/runAllModes.tsx)
- [../src/implementedSampleArtifacts.ts](../src/implementedSampleArtifacts.ts)

What to say explicitly:

- runtime boundaries should follow actual platform constraints.
- forcing every feature through the same entry point can hide important architectural differences.
- dedicated surfaces are easier to reason about when they make those differences explicit.

Strong follow-up answer:

"I would keep the main SPA focused on normal client rendering, isolate hydration-specific boot logic in its own entry, and use a dedicated SSR workspace when the runtime contract is fundamentally different. That separation keeps each environment honest instead of masking the boundary with fake abstractions."

## What Strong System Design Answers Include

- the main boundary you would draw first
- where the source of truth lives
- what you would test to keep the design honest
- which abstraction you would avoid introducing too early

If an answer stays at the level of vague architecture buzzwords, it is still too weak.